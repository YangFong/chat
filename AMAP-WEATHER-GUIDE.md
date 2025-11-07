# 高德地图天气API使用指南

## 概述

应用现在集成了**高德地图**的天气API，提供全国城市的实时天气数据。

## 为什么选择高德地图？

- ✅ **完全免费**：无调用次数限制
- ✅ **国内专注**：专注中国城市，数据更准确
- ✅ **实时更新**：每小时更新多次
- ✅ **中文原生**：天气描述为中文
- ✅ **简单易用**：API简洁，易于集成

## 配置步骤

### 1. 获取API Key

1. 访问 [高德开放平台控制台](https://console.amap.com/dev/key/app)
2. 登录或注册账号
3. 创建应用：
   - 应用名称：随意填写（如：我的天气应用）
   - 应用类型：Web服务
4. 添加Key：
   - 选择刚创建的应用
   - 点击"添加Key"
   - 服务平台选择：**Web服务**
5. 复制生成的Key

### 2. 配置环境变量

编辑 `.env.local` 文件：

```env
# 高德地图API Key
AMAP_API_KEY=你从控制台复制的Key
```

### 3. 重启应用

```bash
pnpm dev
```

## 使用示例

### 基本查询

**问题**：今天北京天气怎么样？

**AI响应**：

- 调用工具：get_weather
- 参数：{"location": "北京", "unit": "celsius"}
- 返回：北京市实时天气数据

### 支持的城市

**省级城市**：

- 北京、上海、天津、重庆
- 各省会城市（如：广州、成都、武汉等）

**地级市**：

- 苏州、东莞、佛山等

**县级市/区县**：

- 支持全国所有县级行政区

### 温度单位

**摄氏度（默认）**：

```
上海的天气
```

**华氏度**：

```
深圳的天气，用华氏度
```

## API详细说明

### 查询流程

1. **城市名 → Adcode**
   - 通过行政区划查询API获取城市编码
   - API: `/v3/config/district`

2. **Adcode → 天气数据**
   - 通过天气查询API获取实时数据
   - API: `/v3/weather/weatherInfo`

### 返回数据

```typescript
{
  location: "北京市",      // 城市名称
  temperature: 15,         // 温度（°C）
  unit: "°C",             // 温度单位
  condition: "晴",         // 天气状况
  humidity: 45,           // 相对湿度（%）
  windSpeed: 12           // 风速（km/h，由风力等级转换）
}
```

### 天气状况说明

高德API返回的天气描述包括：

- 晴
- 多云
- 阴
- 小雨、中雨、大雨、暴雨
- 雷阵雨
- 雪
- 雾
- 霾
- 等等...

### 风力等级转换

| 风力等级 | 风速(km/h) |
| -------- | ---------- |
| ≤3级     | 10         |
| 4级      | 20         |
| 5级      | 30         |
| 6级      | 45         |
| 7级      | 60         |
| 8级      | 75         |
| 9级      | 90         |
| 10级     | 105        |
| 11级     | 120        |
| 12级     | 135        |

## 降级策略

### 未配置API Key

- 自动使用模拟数据
- 控制台显示：`使用模拟天气数据（未配置 AMAP_API_KEY）`
- 支持主要城市：北京、上海、深圳

### 城市未找到

- 无法获取城市adcode时
- 控制台显示：`无法找到城市 XXX 的编码，使用模拟数据`
- 返回模拟数据

### API调用失败

- 网络错误或其他异常
- 控制台记录错误信息
- 自动降级到模拟数据

## 测试场景

### 1. 正常查询

```
问：今天杭州天气怎么样？
答：显示杭州实时天气（温度、天气状况、湿度、风速）
```

### 2. 不同城市

```
问：成都和重庆的天气对比
答：分别查询两个城市的天气并进行对比
```

### 3. 温度单位

```
问：广州现在多少度？用华氏度
答：显示华氏温度
```

### 4. 降级测试

```
情况：未配置API Key
结果：使用模拟数据，正常返回
```

## 常见问题

### Q: 为什么有时候查询失败？

**A:** 可能的原因：

1. 城市名称不准确（尝试使用完整名称，如"北京市"）
2. 网络问题
3. API Key配置错误
4. API Key额度用完（高德免费版无限制，不太可能）

### Q: 支持国外城市吗？

**A:** 高德地图API主要覆盖中国境内城市，不支持国外城市。如需国外城市数据，可以考虑：

- OpenWeatherMap API
- WeatherAPI.com
- AccuWeather API

### Q: 天气数据多久更新一次？

**A:** 实况天气每小时更新多次，具体时间以API返回的`reporttime`字段为准。

### Q: 如何查看API调用情况？

**A:**

1. 登录 [高德控制台](https://console.amap.com/)
2. 进入"应用管理"
3. 查看"流量统计"

## 技术细节

### API端点

**行政区划查询**：

```
GET https://restapi.amap.com/v3/config/district
参数:
  - keywords: 城市名称
  - key: API Key
  - subdistrict: 0（不返回下级行政区）
```

**天气查询**：

```
GET https://restapi.amap.com/v3/weather/weatherInfo
参数:
  - city: 城市adcode
  - key: API Key
  - extensions: base（实况天气）或 all（预报天气）
```

### 错误处理

```typescript
// 示例：获取城市adcode失败
if (!adcode) {
  console.log(`无法找到城市 ${city} 的编码，使用模拟数据`)
  return getMockWeather(params)
}

// 示例：API调用失败
catch (error) {
  console.error('获取真实天气数据失败:', error)
  return getMockWeather(params)
}
```

## 相关链接

- [高德开放平台](https://lbs.amap.com/)
- [天气查询API文档](https://lbs.amap.com/api/webservice/guide/api/weatherinfo)
- [控制台](https://console.amap.com/)
- [常见问题](https://lbs.amap.com/faq/webservice)

## 更新日志

### v2.1.5 (2025-01-07)

- 切换到高德地图天气API
- 完全免费，无调用限制
- 专注国内城市，数据更准确
