# 部署指南

## Vercel 部署（推荐）

### 1. 准备工作

确保你的代码已推送到 GitHub/GitLab/Bitbucket。

### 2. 部署步骤

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. 配置环境变量：
   - `SILICONFLOW_API_KEY`: 你的 SiliconFlow API 密钥
   - `SILICONFLOW_BASE_URL`: `https://api.siliconflow.cn/v1`
5. 点击 "Deploy"

### 3. 自动部署

- 每次推送到 `main` 分支会自动触发部署
- 预览部署：推送到其他分支会创建预览环境

## 其他平台部署

### Netlify

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
netlify deploy --prod
```

环境变量配置：

- 在 Netlify Dashboard -> Site settings -> Environment variables 添加

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t ai-chat .

# 运行容器
docker run -p 3000:3000 \
  -e SILICONFLOW_API_KEY=your_key \
  -e SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1 \
  ai-chat
```

### 自建服务器

```bash
# 1. 克隆仓库
git clone <your-repo>
cd chat

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local

# 4. 构建
pnpm build

# 5. 使用 PM2 运行
npm install -g pm2
pm2 start pnpm --name "ai-chat" -- start
pm2 save
pm2 startup
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 环境变量

### 必需变量

| 变量名                | 说明                 | 示例       |
| --------------------- | -------------------- | ---------- |
| `SILICONFLOW_API_KEY` | SiliconFlow API 密钥 | `sk-xxxxx` |

### 可选变量

| 变量名                 | 说明         | 默认值                          |
| ---------------------- | ------------ | ------------------------------- |
| `SILICONFLOW_BASE_URL` | API 基础 URL | `https://api.siliconflow.cn/v1` |
| `NODE_ENV`             | 运行环境     | `production`                    |

## 性能优化

### 1. 启用压缩

在 `next.config.ts` 中：

```typescript
const nextConfig = {
  compress: true,
  // ...
}
```

### 2. CDN 配置

将静态资源托管到 CDN：

```typescript
const nextConfig = {
  assetPrefix: "https://cdn.example.com",
  // ...
}
```

### 3. 图片优化

使用 Next.js Image 组件自动优化图片。

### 4. 代码分割

Next.js 自动进行代码分割，无需额外配置。

## 监控和日志

### Vercel Analytics

```bash
pnpm add @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry 错误监控

```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

## 安全建议

1. **API 密钥保护**
   - 永远不要将 API 密钥提交到代码仓库
   - 使用环境变量管理敏感信息

2. **CORS 配置**
   - 在生产环境限制允许的源

3. **速率限制**
   - 考虑添加请求速率限制

4. **HTTPS**
   - 始终使用 HTTPS

## 故障排查

### 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
pnpm install
pnpm build
```

### 环境变量未生效

- 确保在部署平台正确配置了环境变量
- 重新部署项目

### API 调用失败

- 检查 API 密钥是否正确
- 检查网络连接
- 查看服务器日志

## 成本估算

### Vercel（推荐）

- Hobby 计划：免费
  - 100GB 带宽/月
  - 无限请求
  - 自动 HTTPS
  - 全球 CDN

- Pro 计划：$20/月
  - 1TB 带宽/月
  - 高级分析
  - 团队协作

### 自建服务器

- VPS（2核4G）：$10-20/月
- CDN：按流量计费
- 域名：$10/年
- SSL 证书：免费（Let's Encrypt）

## 备份策略

1. **代码备份**：使用 Git 版本控制
2. **数据备份**：用户数据在浏览器本地，无需备份
3. **配置备份**：文档化所有环境变量和配置

## 更新和维护

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
pnpm install

# 3. 构建
pnpm build

# 4. 重启服务
pm2 restart ai-chat
```

## 技术支持

遇到部署问题？

1. 查看 [Next.js 部署文档](https://nextjs.org/docs/deployment)
2. 查看 [Vercel 文档](https://vercel.com/docs)
3. 提交 GitHub Issue
