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

// 高德地图天气API（免费）
export async function getWeather(
  params: WeatherParams
): Promise<WeatherResult> {
  try {
    // 使用高德地图天气API
    const apiKey = process.env.AMAP_API_KEY || "demo_key"
    const city = params.location

    // 如果没有API key，使用模拟数据
    if (!process.env.AMAP_API_KEY || apiKey === "demo_key") {
      console.log("使用模拟天气数据（未配置 AMAP_API_KEY）")
      return getMockWeather(params)
    }

    // 首先获取城市的adcode
    const adcode = await getCityAdcode(city, apiKey)
    if (!adcode) {
      console.log(`无法找到城市 ${city} 的编码，使用模拟数据`)
      return getMockWeather(params)
    }

    // 获取天气信息（实况天气）
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${apiKey}&extensions=base`
    )

    if (!response.ok) {
      throw new Error(`高德天气API请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "1" || !data.lives || data.lives.length === 0) {
      throw new Error(`获取天气数据失败: ${data.info}`)
    }

    const weatherInfo = data.lives[0]
    const unit = params.unit || "celsius"

    // 如果需要华氏度，进行转换
    let temperature = parseInt(weatherInfo.temperature)
    let tempUnit = "°C"
    if (unit === "fahrenheit") {
      temperature = Math.round((temperature * 9) / 5 + 32)
      tempUnit = "°F"
    }

    return {
      location: weatherInfo.city,
      temperature: temperature,
      unit: tempUnit,
      condition: weatherInfo.weather,
      humidity: parseInt(weatherInfo.humidity),
      windSpeed: convertWindPower(weatherInfo.windpower),
    }
  } catch (error) {
    console.error("获取真实天气数据失败:", error)
    // 失败时返回模拟数据
    return getMockWeather(params)
  }
}

// 获取城市的adcode
async function getCityAdcode(
  cityName: string,
  apiKey: string
): Promise<string | null> {
  try {
    // 使用地理编码API获取城市信息
    const response = await fetch(
      `https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(cityName)}&key=${apiKey}&subdistrict=0`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.status !== "1" || !data.districts || data.districts.length === 0) {
      return null
    }

    return data.districts[0].adcode
  } catch (error) {
    console.error("获取城市编码失败:", error)
    return null
  }
}

// 将风力等级转换为风速（km/h）
function convertWindPower(windpower: string): number {
  // 风力等级对应的风速范围（取中间值）
  const windPowerMap: Record<string, number> = {
    "≤3": 10,
    "4": 20,
    "5": 30,
    "6": 45,
    "7": 60,
    "8": 75,
    "9": 90,
    "10": 105,
    "11": 120,
    "12": 135,
  }

  return windPowerMap[windpower] || 15
}

// 模拟天气数据（备用）
function getMockWeather(params: WeatherParams): WeatherResult {
  const unit = params.unit || "celsius"

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
