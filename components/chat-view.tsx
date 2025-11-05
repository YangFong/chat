"use client"

import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/lib/store"
import { Message, ToolCall } from "@/lib/types"

import { ChatInput } from "./chat-input"
import { MessageItem } from "./message-item"

const generateId = () => Math.random().toString(36).substring(2, 15)

export function ChatView() {
  const {
    currentConversation,
    addMessage,
    updateMessage,
    createConversation,
    setCurrentConversation,
  } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentConversation?.messages])

  // 如果没有当前对话，创建一个
  useEffect(() => {
    if (!currentConversation) {
      const id = createConversation()
      setCurrentConversation(id)
    }
  }, [currentConversation, createConversation, setCurrentConversation])

  const handleSend = async (content: string) => {
    if (!currentConversation || isLoading) return

    setError(null)

    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      createdAt: Date.now(),
    }
    addMessage(currentConversation.id, userMessage)

    // 创建助手消息（初始为空）
    const assistantMessageId = generateId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    }
    addMessage(currentConversation.id, assistantMessage)

    setIsLoading(true)

    try {
      // 准备消息历史
      const messages = [
        ...currentConversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          tool_calls: msg.toolCalls,
          tool_call_id: msg.toolCallId,
        })),
        { role: "user", content },
      ]

      // 调用 API
      abortControllerRef.current = new AbortController()
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "API request failed")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""
      let currentContent = ""
      let currentToolCalls: ToolCall[] = []
      let toolResults: Array<{
        role: string
        tool_call_id: string
        content: string
      }> = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") {
              setIsLoading(false)
              continue
            }

            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                setError(parsed.error)
                continue
              }

              // 处理内容流
              if (parsed.type === "content" && parsed.content) {
                currentContent += parsed.content
                updateMessage(currentConversation.id, assistantMessageId, {
                  content: currentContent,
                })
              }

              // 处理工具调用
              if (parsed.type === "tool_calls" && parsed.tool_calls) {
                currentToolCalls = parsed.tool_calls
                updateMessage(currentConversation.id, assistantMessageId, {
                  toolCalls: currentToolCalls,
                })
              }

              // 处理工具结果
              if (parsed.type === "tool_results" && parsed.results) {
                toolResults = parsed.results
                // 添加工具结果消息
                for (const result of toolResults) {
                  const toolMessage: Message = {
                    id: generateId(),
                    role: "tool",
                    content: result.content,
                    createdAt: Date.now(),
                    toolCallId: result.tool_call_id,
                  }
                  addMessage(currentConversation.id, toolMessage)
                }
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "发送消息失败")
        console.error("Chat error:", err)
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  if (!currentConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div ref={scrollRef} className="mx-auto max-w-3xl py-4">
          {currentConversation.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium">开始对话</p>
                <p className="text-sm">
                  试试问我：&quot;今天北京天气怎么样？&quot;
                </p>
              </div>
            </div>
          ) : (
            currentConversation.messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}

          {isLoading && (
            <div className="text-muted-foreground flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI 正在思考...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <Button onClick={handleStop} variant="outline" className="w-full">
              停止生成
            </Button>
          ) : (
            <ChatInput onSend={handleSend} disabled={isLoading} />
          )}
        </div>
      </div>
    </div>
  )
}
