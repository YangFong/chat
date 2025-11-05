import { NextRequest } from "next/server"

import { executeTool, tools } from "@/lib/tools"

const API_KEY = process.env.SILICONFLOW_API_KEY
const BASE_URL =
  process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: "SILICONFLOW_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用 SiliconFlow API
          const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
              model: "Qwen/Qwen2.5-7B-Instruct",
              messages,
              tools,
              tool_choice: "auto",
              stream: true,
              max_tokens: 2000,
              temperature: 0.7,
            }),
          })

          if (!response.ok) {
            const error = await response.text()
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: `API Error: ${error}` })}\n\n`
              )
            )
            controller.close()
            return
          }

          const reader = response.body?.getReader()
          if (!reader) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "No response body" })}\n\n`
              )
            )
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          let buffer = ""
          const toolCalls: Array<{
            id: string
            type: string
            function: { name: string; arguments: string }
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
                  // 如果有工具调用，执行工具并继续对话
                  if (toolCalls.length > 0) {
                    // 发送工具调用信息
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "tool_calls", tool_calls: toolCalls })}\n\n`
                      )
                    )

                    // 执行所有工具调用
                    const toolResults = await Promise.all(
                      toolCalls.map(async (call) => {
                        const result = await executeTool(
                          call.function.name,
                          call.function.arguments
                        )
                        return {
                          role: "tool",
                          tool_call_id: call.id,
                          content: result,
                        }
                      })
                    )

                    // 发送工具结果
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "tool_results", results: toolResults })}\n\n`
                      )
                    )

                    // 使用工具结果继续对话
                    const followUpMessages = [
                      ...messages,
                      {
                        role: "assistant",
                        content: "",
                        tool_calls: toolCalls,
                      },
                      ...toolResults,
                    ]

                    const followUpResponse = await fetch(
                      `${BASE_URL}/chat/completions`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${API_KEY}`,
                        },
                        body: JSON.stringify({
                          model: "Qwen/Qwen2.5-7B-Instruct",
                          messages: followUpMessages,
                          stream: true,
                          max_tokens: 2000,
                          temperature: 0.7,
                        }),
                      }
                    )

                    if (followUpResponse.ok && followUpResponse.body) {
                      const followUpReader = followUpResponse.body.getReader()
                      let followUpBuffer = ""

                      while (true) {
                        const { done: followUpDone, value: followUpValue } =
                          await followUpReader.read()
                        if (followUpDone) break

                        followUpBuffer += decoder.decode(followUpValue, {
                          stream: true,
                        })
                        const followUpLines = followUpBuffer.split("\n")
                        followUpBuffer = followUpLines.pop() || ""

                        for (const followUpLine of followUpLines) {
                          if (followUpLine.startsWith("data: ")) {
                            const followUpData = followUpLine.slice(6).trim()
                            if (followUpData === "[DONE]") continue

                            try {
                              const parsed = JSON.parse(followUpData)
                              const delta = parsed.choices?.[0]?.delta
                              if (delta?.content) {
                                controller.enqueue(
                                  encoder.encode(
                                    `data: ${JSON.stringify({ type: "content", content: delta.content })}\n\n`
                                  )
                                )
                              }
                            } catch {
                              // 忽略解析错误
                            }
                          }
                        }
                      }
                    }
                  }

                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const delta = parsed.choices?.[0]?.delta

                  // 处理工具调用
                  if (delta?.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                      const index = toolCall.index
                      if (!toolCalls[index]) {
                        toolCalls[index] = {
                          id: toolCall.id,
                          type: "function",
                          function: {
                            name: "",
                            arguments: "",
                          },
                        }
                      }
                      if (toolCall.function?.name) {
                        toolCalls[index].function.name += toolCall.function.name
                      }
                      if (toolCall.function?.arguments) {
                        toolCalls[index].function.arguments +=
                          toolCall.function.arguments
                      }
                    }
                  }

                  // 处理内容流
                  if (delta?.content) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "content", content: delta.content })}\n\n`
                      )
                    )
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(error) })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
