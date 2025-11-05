#!/bin/bash

# AI 聊天应用快速启动脚本

echo "🚀 AI 聊天应用启动中..."
echo ""

# 检查 .env.local 文件
if [ ! -f .env.local ]; then
    echo "❌ 错误: 未找到 .env.local 文件"
    echo "📝 请先创建 .env.local 文件并配置 SiliconFlow API 密钥："
    echo ""
    echo "   cp .env.local.example .env.local"
    echo "   # 然后编辑 .env.local 填入你的 API 密钥"
    echo ""
    exit 1
fi

# 检查 API 密钥
if ! grep -q "SILICONFLOW_API_KEY=sk-" .env.local 2>/dev/null; then
    echo "⚠️  警告: .env.local 中可能未配置有效的 API 密钥"
    echo "📝 请确保 SILICONFLOW_API_KEY 已正确配置"
    echo ""
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    pnpm install
    echo ""
fi

# 清理旧的构建
echo "🧹 清理旧的构建文件..."
rm -rf .next
echo ""

# 启动开发服务器
echo "✅ 启动开发服务器..."
echo "📱 应用将在 http://localhost:3000 打开"
echo ""
pnpm dev
