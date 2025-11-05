// 消息类型定义
export type MessageRole = "user" | "assistant" | "system" | "tool"

export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  tool_call_id: string
  content: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  toolCalls?: ToolCall[]
  toolCallId?: string // 用于 tool role 消息
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

// AI 工具定义
export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      properties: Record<string, unknown>
      required: string[]
    }
  }
}

// 天气工具参数
export interface WeatherParams {
  location: string
  unit?: "celsius" | "fahrenheit"
}

// 天气结果
export interface WeatherResult {
  location: string
  temperature: number
  unit: string
  condition: string
  humidity: number
  windSpeed: number
}
