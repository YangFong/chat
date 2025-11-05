"use client"

import { Bot, User, Wrench } from "lucide-react"

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
        <Card className="p-4">
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
        <div className="flex-1 space-y-2">
          <div className="text-muted-foreground text-sm font-medium">
            工具结果
          </div>
          {renderToolResult(message.content)}
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
        className={cn("flex-1 space-y-2", isUser && "flex flex-col items-end")}
      >
        {/* 内容 */}
        {message.content && (
          <div
            className={cn(
              "rounded-lg px-4 py-2 text-sm",
              isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <div className="wrap-break-word whitespace-pre-wrap">
              {message.content}
            </div>
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
