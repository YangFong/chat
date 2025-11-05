# 快速参考

## 🚀 快速启动

```bash
# 1. 克隆/进入项目
cd chat

# 2. 配置 API 密钥
cp .env.local.example .env.local
# 编辑 .env.local，填入 SiliconFlow API 密钥

# 3. 启动（三选一）
./start.sh           # 使用启动脚本（推荐）
pnpm dev             # 直接启动
pnpm build && pnpm start  # 生产模式
```

访问: http://localhost:3000

## 📝 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 检查代码
pnpm lint:fix         # 自动修复
pnpm format           # 格式化代码
pnpm format:check     # 检查格式

# 类型检查
pnpm exec tsc --noEmit
```

## 🧪 测试问题

### 常规对话
```
你好
解释什么是人工智能
用 Python 写一个快速排序
```

### 工具调用（天气）
```
今天北京天气怎么样？
上海现在的天气如何？
深圳天气
```

## 📂 关键文件

```
app/api/chat/route.ts      # AI API（流式 + 工具）
components/chat-view.tsx   # 主聊天逻辑
lib/store.ts              # 状态管理
lib/tools.ts              # 工具定义
lib/types.ts              # 类型定义
```

## 🔧 环境变量

```env
# .env.local
SILICONFLOW_API_KEY=sk-xxxxx           # 必需
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

获取 API Key: https://cloud.siliconflow.cn/

## 🎨 核心功能

- ✅ AI 对话（流式响应）
- ✅ 工具调用（天气查询）
- ✅ 对话管理（新建/删除/切换）
- ✅ 本地存储（localStorage）
- ✅ 响应式设计
- ✅ 暗色模式

## 📚 文档

- `README.md` - 完整使用文档
- `TEST.md` - 测试指南
- `PROJECT.md` - 项目概览
- `DEPLOY.md` - 部署指南

## 🐛 故障排查

### 端口占用
```bash
lsof -ti:3000 | xargs kill -9
rm -rf .next
pnpm dev
```

### API 错误
- 检查 `.env.local` 中的 API 密钥
- 重启开发服务器

### 构建失败
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

## 🔌 扩展

### 添加新工具

1. 在 `lib/types.ts` 定义类型
2. 在 `lib/tools.ts` 添加工具定义
3. 在 `lib/tools.ts` 的 `executeTool` 添加执行逻辑
4. 在 `components/message-item.tsx` 添加结果展示

### 示例：计算器

```typescript
// lib/tools.ts
{
  type: "function",
  function: {
    name: "calculate",
    description: "计算数学表达式",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "数学表达式" }
      },
      required: ["expression"]
    }
  }
}
```

## 📊 项目统计

- 64 个 TypeScript/TSX 文件
- 5 个核心聊天组件
- ~6400 行代码
- 0 类型错误
- 0 lint 错误

## 🌐 部署

### Vercel（最简单）
1. 推送到 GitHub
2. 导入到 Vercel
3. 配置环境变量
4. 部署

### Docker
```bash
docker build -t ai-chat .
docker run -p 3000:3000 \
  -e SILICONFLOW_API_KEY=xxx \
  ai-chat
```

## 💡 技巧

- **换行**: Shift + Enter
- **停止**: 点击"停止生成"按钮
- **清除数据**: 浏览器 DevTools -> Application -> Local Storage -> 删除 "chat-storage"
- **新对话**: 点击左侧栏 ➕ 图标

## 🔗 链接

- SiliconFlow: https://cloud.siliconflow.cn/
- Next.js: https://nextjs.org/
- Zustand: https://zustand-demo.pmnd.rs/

## 📞 支持

- GitHub Issues
- 查看文档
- 邮件: your-email@example.com

---

**提示**: 首次使用前请确保已配置 `.env.local` 文件！
