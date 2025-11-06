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

  const handleSend = async (content: string) => {
    if (isLoading) return

    setError(null)

    // 如果没有当前对话，创建一个新对话
    let conversationId = currentConversation?.id
    if (!conversationId) {
      conversationId = createConversation()
      setCurrentConversation(conversationId)
    }

    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      createdAt: Date.now(),
    }
    addMessage(conversationId, userMessage)

    // 创建助手消息（初始为空）
    const assistantMessageId = generateId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    }
    addMessage(conversationId, assistantMessage)

    setIsLoading(true)

    try {
      // 准备消息历史（包括刚发送的用户消息）
      const messages = [
        ...(currentConversation?.messages || []).map((msg) => ({
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
                updateMessage(conversationId, assistantMessageId, {
                  content: currentContent,
                })
              }

              // 处理工具调用
              if (parsed.type === "tool_calls" && parsed.tool_calls) {
                currentToolCalls = parsed.tool_calls
                updateMessage(conversationId, assistantMessageId, {
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
                  addMessage(conversationId, toolMessage)
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
    // 无对话时，输入框居中显示
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-muted-foreground text-center">
            <h1 className="mb-2 text-2xl font-bold">AI 聊天助手</h1>
            <p className="text-sm">
              试试问我：&quot;今天北京天气怎么样？&quot;
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <Button onClick={handleStop} variant="outline" className="w-full">
              停止生成
            </Button>
          ) : (
            <ChatInput onSend={handleSend} disabled={isLoading} />
          )}
        </div>
      </div>
    )
  }

  const hasMessages = currentConversation.messages.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      {hasMessages ? (
        <div className="relative flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-3xl px-4 py-4">
              {currentConversation.messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="text-muted-foreground flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI 正在思考...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p className="text-lg font-medium">开始对话</p>
            <p className="text-sm">
              试试问我：&quot;今天北京天气怎么样？&quot;
            </p>
          </div>
        </div>
      )}

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
