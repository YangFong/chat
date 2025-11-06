import { ToolDefinition, WeatherParams, WeatherResult } from "./types"

// 定义可用工具
export const tools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "获取指定城市的天气信息",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "城市名称，例如：北京、上海、深圳",
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "温度单位，默认为摄氏度",
          },
        },
        required: ["location"],
      },
    },
  },
]

// 模拟天气 API（实际项目可以接入真实天气 API）
export async function getWeather(
  params: WeatherParams
): Promise<WeatherResult> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  const unit = params.unit || "celsius"

  // 模拟天气数据
  const weatherData: Record<string, WeatherResult> = {
    北京: {
      location: "北京",
      temperature: unit === "celsius" ? 15 : 59,
      unit: unit === "celsius" ? "°C" : "°F",
      condition: "晴朗",
      humidity: 45,
      windSpeed: 12,
    },
    上海: {
      location: "上海",
      temperature: unit === "celsius" ? 20 : 68,
      unit: unit === "celsius" ? "°C" : "°F",
      condition: "多云",
      humidity: 60,
      windSpeed: 8,
    },
    深圳: {
      location: "深圳",
      temperature: unit === "celsius" ? 25 : 77,
      unit: unit === "celsius" ? "°C" : "°F",
      condition: "阴天",
      humidity: 70,
      windSpeed: 5,
    },
  }

  // 返回天气数据，如果城市不存在则返回默认数据
  return (
    weatherData[params.location] || {
      location: params.location,
      temperature: unit === "celsius" ? 18 : 64,
      unit: unit === "celsius" ? "°C" : "°F",
      condition: "未知",
      humidity: 50,
      windSpeed: 10,
    }
  )
}

// 执行工具调用
export async function executeTool(name: string, args: string): Promise<string> {
  try {
    // 处理空字符串或无效的 JSON
    let params: Record<string, unknown> = {}
    if (args && args.trim()) {
      try {
        params = JSON.parse(args)
      } catch (parseError) {
        console.error("Failed to parse tool arguments:", args, parseError)
        return JSON.stringify({
          error: `Invalid JSON arguments: ${parseError}`,
        })
      }
    }

    switch (name) {
      case "get_weather": {
        // 验证必需参数
        if (!params.location || typeof params.location !== "string") {
          return JSON.stringify({
            error: "缺少必需参数: location（城市名称）",
          })
        }
        const result = await getWeather(params as unknown as WeatherParams)
        return JSON.stringify(result)
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` })
    }
  } catch (error) {
    console.error("Tool execution error:", error)
    return JSON.stringify({ error: `Tool execution failed: ${error}` })
  }
}
