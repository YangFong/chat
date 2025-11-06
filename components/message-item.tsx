"use client"

import "highlight.js/styles/github-dark.css"

import { Bot, User, Wrench } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { formatTime } from "@/lib/format"
import { Message, ToolCall } from "@/lib/types"
import { cn } from "@/lib/utils"

import { Card } from "./ui/card"
import { WeatherCard } from "./weather-card"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user"
  const isTool = message.role === "tool"

  // 解析工具结果
  const renderToolResult = (content: string) => {
    try {
      const data = JSON.parse(content)

      // 天气卡片
      if (data.location && data.temperature !== undefined) {
        return <WeatherCard data={data} />
      }

      // 其他工具结果以 JSON 形式显示
      return (
        <Card className="w-full max-w-md p-4">
          <pre className="overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>
      )
    } catch {
      return <div className="text-muted-foreground text-sm">{content}</div>
    }
  }

  // 工具调用消息
  if (isTool) {
    return (
      <div className="flex gap-3 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
          <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-muted-foreground text-sm font-medium">
            工具结果
          </div>
          <div className="max-w-full">{renderToolResult(message.content)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-3 py-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 space-y-2",
          isUser && "flex flex-col items-end"
        )}
      >
        {/* 时间戳 */}
        <div
          className={cn(
            "text-muted-foreground text-xs",
            isUser && "text-right"
          )}
        >
          {formatTime(message.createdAt)}
        </div>

        {/* 内容 */}
        {message.content && (
          <div
            className={cn(
              "overflow-hidden rounded-lg px-4 py-2 text-sm wrap-break-word",
              isUser
                ? "bg-primary text-primary-foreground max-w-[85%]"
                : "bg-muted max-w-full"
            )}
            style={{
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {isUser ? (
              <div
                className="whitespace-pre-wrap"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {message.content}
              </div>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-full wrap-break-word"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // 自定义代码块样式
                    code: ({
                      className,
                      children,
                      ...props
                    }: React.HTMLAttributes<HTMLElement>) => {
                      const inline = !className
                      if (inline) {
                        return (
                          <code
                            className="bg-muted rounded px-1 py-0.5 text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                    // 自定义链接样式
                    a: ({
                      children,
                      ...props
                    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
                      <a
                        className="text-primary inline-block max-w-full hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* 工具调用 */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2">
            {message.toolCalls.map((toolCall: ToolCall) => {
              let args: Record<string, unknown> = {}
              try {
                args = JSON.parse(toolCall.function.arguments)
              } catch {
                // 忽略解析错误
              }

              return (
                <Card key={toolCall.id} className="p-3 text-xs">
                  <div className="flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400">
                    <Wrench className="h-3 w-3" />
                    调用工具: {toolCall.function.name}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    参数: {JSON.stringify(args)}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
