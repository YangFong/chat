# AI 聊天应用

基于 Next.js 和 SiliconFlow 的 AI 聊天应用，支持常规对话和工具调用（如天气查询）。

## 功能特性

- ✨ **常规 AI 对话**：支持自然语言问答
- 🛠️ **工具调用**：支持天气查询等工具，AI 可智能调用并展示结果
- � **Markdown 渲染**：AI 回复支持完整 Markdown 格式，包括代码高亮
- �💾 **本地存储**：聊天记录保存在浏览器本地，无需数据库
- 🎨 **现代 UI**：基于 shadcn/ui 的精美界面，支持主题切换
- 📱 **响应式设计**：支持桌面和移动端
- 🔄 **流式响应**：实时显示 AI 回复
- 🗂️ **对话管理**：支持多对话切换、删除确认、时间戳显示

## 技术栈

- **框架**: Next.js 16 (App Router)
- **AI 服务**: SiliconFlow API
- **状态管理**: Zustand (持久化到 localStorage)
- **UI 组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS + Typography
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **主题**: next-themes (浅色/深色/系统)
- **类型检查**: TypeScript
- **代码质量**: ESLint + Prettier

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 SiliconFlow API 密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
SILICONFLOW_API_KEY=your_api_key_here
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

> 💡 获取 API 密钥：访问 [SiliconFlow](https://cloud.siliconflow.cn/) 注册并获取 API Key

### 3. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
pnpm build
pnpm start
```

## 使用说明

### 常规对话

直接在输入框中输入问题，例如：

- "介绍一下人工智能"
- "写一个快速排序算法"
- "推荐几本好书"

### 工具调用

AI 会自动识别并调用工具，例如：

- "今天北京天气怎么样？" → 自动调用天气工具并显示天气卡片
- "上海现在的天气如何？" → 同上
- "深圳天气" → 同上

### 对话管理

- **新建对话**：点击左侧边栏的 ➕ 按钮
- **切换对话**：点击左侧边栏的对话记录
- **删除对话**：悬停在对话上，点击垃圾桶图标

## 项目结构

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI API 路由（服务端）
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── components/
│   ├── chat-input.tsx            # 聊天输入框
│   ├── chat-sidebar.tsx          # 对话历史侧边栏
│   ├── chat-view.tsx             # 主聊天界面
│   ├── message-item.tsx          # 消息项组件
│   ├── weather-card.tsx          # 天气卡片
│   └── ui/                       # shadcn/ui 组件
├── lib/
│   ├── store.ts                  # Zustand 状态管理
│   ├── tools.ts                  # 工具定义和执行
│   ├── types.ts                  # TypeScript 类型定义
│   └── utils.ts                  # 工具函数
└── .env.local                    # 环境变量（需自行创建）
```

## 扩展功能

### 添加新工具

1. 在 `lib/types.ts` 中定义工具参数和结果类型
2. 在 `lib/tools.ts` 中添加工具定义和执行逻辑
3. 在 `components/message-item.tsx` 中添加工具结果展示组件

示例（添加翻译工具）：

```typescript
// lib/tools.ts
export const tools: ToolDefinition[] = [
  // ...现有工具
  {
    type: "function",
    function: {
      name: "translate",
      description: "翻译文本到指定语言",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "要翻译的文本" },
          target: { type: "string", description: "目标语言" },
        },
        required: ["text", "target"],
      },
    },
  },
]

export async function executeTool(name: string, args: string): Promise<string> {
  const params = JSON.parse(args)

  switch (name) {
    case "translate":
      // 实现翻译逻辑
      return JSON.stringify({ translated: "..." })
    // ...
  }
}
```

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 代码格式化
pnpm format

# 检查格式（不写入）
pnpm format:check
```

## 注意事项

- 聊天记录保存在浏览器 localStorage，清除浏览器数据会丢失记录
- 工具调用使用的是模拟数据，可接入真实 API（如天气 API）
- SiliconFlow API 有调用限额，请合理使用

## License

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
