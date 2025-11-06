# 更新日志

## [2.1.3] - 2025-01-06

### 修复问题

- 🐛 **增强超长 URL 断行处理**
  - 为所有消息容器添加内联样式 `overflowWrap: "anywhere"` 和 `wordBreak: "break-word"`
  - 为链接组件添加 `inline-block` 和 `max-w-full` 类
  - 在 CSS 中为 prose 及其所有子元素添加强制断行规则
  - 完全解决超长 URL 溢出屏幕的问题

### 技术改进

- 🔧 多层次防护策略：
  1. CSS 全局样式：prose 及其所有子元素
  2. React 组件样式：消息容器和内容区域
  3. 自定义组件：链接组件添加断行样式
  
- 🔧 修改文件：
  - `app/globals.css`: 增强 prose 样式，添加通配符规则
  - `components/message-item.tsx`: 添加多层内联样式约束

## [2.1.2] - 2025-01-06

### 修复问题

- 🐛 **AI 内容换行优化**
  - 修复 AI 回复文本不换行的问题
  - 添加 `overflow-wrap: anywhere` 样式，确保长单词/链接正确换行
  - 优化 prose 样式，所有元素（p, code, a）都支持自动换行

- 🐛 **移动端内容宽度限制**
  - 为消息容器添加 `min-w-0` 和 `max-w-full`，防止溢出
  - AI 消息框自动适配屏幕宽度
  - 用户消息框限制为屏幕宽度的 85%
  - 所有文本内容添加 `wrap-break-word` 类

### 技术改进

- 🔧 修改文件：
  - `components/message-item.tsx`: 添加宽度限制和换行样式
  - `app/globals.css`: 添加 prose 组件的换行优化样式

## [2.1.1] - 2025-01-06

### 新增功能

- ⏰ **消息时间戳**
  - 每条消息现在显示发送时间
  - 使用相对时间格式（刚刚、X分钟前等）

### 修复问题

- 🐛 **侧边栏按钮布局优化**
  - 将"新建对话"按钮移到标题下方，完全解决移动端重叠问题
  - 改为全宽按钮，更易点击
- 🐛 **天气工具参数解析**
  - 修复工具调用时的 JSON 解析错误
  - 添加参数验证，确保必需参数存在
  - 改进错误提示信息
- 🐛 **工具结果卡片宽度限制**
  - 限制天气卡片和 JSON 结果的最大宽度
  - 防止内容溢出屏幕
  - 添加 `max-w-sm` 和 `max-w-md` 约束

### 技术改进

- 🔧 修改文件：
  - `components/chat-sidebar.tsx`: 重新设计按钮布局
  - `lib/tools.ts`: 增强参数验证和错误处理
  - `components/message-item.tsx`: 添加时间戳显示和宽度限制
  - `components/weather-card.tsx`: 添加最大宽度约束

## [2.1.0] - 2025-01-06

### 新增功能

- ✨ **Markdown 渲染支持**
  - AI 回复消息现在支持完整的 Markdown 格式
  - 支持 GitHub Flavored Markdown (GFM)
  - 代码块语法高亮（使用 highlight.js）
  - 自定义链接样式，在新标签页打开

### 修复问题

- 🐛 **移动端侧边栏按钮重叠**
  - 修复"对话历史"标题和"新建对话"按钮在小屏幕上的重叠问题
  - 标题过长时自动截断，按钮保持固定宽度
- 🐛 **对话区域滚动条**
  - 修复 ScrollArea 组件高度问题
  - 现在消息列表可以正常显示滚动条
  - 优化自动滚动到底部的行为

### 技术改进

- 📦 新增依赖：
  - `react-markdown`: Markdown 渲染
  - `remark-gfm`: GitHub Flavored Markdown 支持
  - `rehype-highlight`: 代码语法高亮
  - `@tailwindcss/typography`: Typography 插件
  - `highlight.js`: 代码高亮样式

- 🔧 修改文件：
  - `components/message-item.tsx`: 添加 Markdown 渲染逻辑
  - `components/chat-sidebar.tsx`: 优化移动端布局
  - `components/chat-view.tsx`: 修复滚动容器结构
  - `tailwind.config.ts`: 配置 Typography 插件

## [2.0.0] - 2025-01-06

### 新增功能

- 🎯 **网站标题优化**
  - 更新为"AI 聊天助手"
  - 优化页面标题和描述

- 🗑️ **删除确认对话框**
  - 删除对话时显示确认弹窗
  - 防止误删重要对话

- ⏰ **对话时间戳显示**
  - 显示相对时间（刚刚、X分钟前、X小时前等）
  - 使用智能格式化函数

- 💡 **优化对话创建逻辑**
  - 点击"新建对话"不再立即创建
  - 发送第一条消息时才创建对话
  - 减少空对话的产生

- 📐 **侧边栏折叠功能**
  - 桌面端支持展开/收起侧边栏
  - 提供更多聊天空间

- 🎯 **居中输入框**
  - 无对话时输入框居中显示
  - 更好的首次使用体验

- 🎨 **主题切换功能**
  - 支持浅色/深色/跟随系统三种模式
  - 使用 next-themes 实现
  - 无闪烁切换

- 📱 **移动端侧边栏**
  - 使用 Sheet 抽屉组件
  - 提供更好的移动端交互体验

### 技术改进

- 📦 新增依赖：`next-themes`
- 🎨 UI 组件优化：使用 lucide-react 图标
- 🔧 状态管理：支持 `null` 作为 `currentConversationId`

## [1.0.0] - 2025-01-05

### 初始版本

- ✨ 基础 AI 聊天功能
- 🛠️ 工具调用（天气查询）
- 💾 本地存储（localStorage）
- 🎨 shadcn/ui 界面
- 🔄 流式响应
- 📱 响应式设计
- ⚙️ ESLint + Prettier 配置
- 📝 代码规范和自动格式化
