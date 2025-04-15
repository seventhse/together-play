# Together.ai Image Playground

一个基于 Together.ai API 的图像生成应用，使用 Next.js 和 React 构建。

## 功能特点

- 使用 Together.ai 的 FLUX 模型生成高质量图像
- 支持多种模型选择，包括免费和付费模型
- 可自定义图像参数（尺寸、步数、引导系数等）
- 图像历史记录功能，保存和管理生成的图像
- 响应式设计，适配各种设备
- 完善的错误处理和用户反馈
- 类型安全的 API 请求验证

## 技术栈

- **前端框架**: Next.js 15.3.0 + React 19
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI
- **状态管理**: React Hooks
- **API 集成**: Together.ai API
- **类型检查**: TypeScript + ArkType
- **通知**: Sonner Toast
- **数据存储**: IndexedDB (浏览器本地存储)

## 开始使用

### 前提条件

- Node.js 18.0.0 或更高版本
- pnpm 或 npm 包管理器
- Together.ai API 密钥 (可选，也可以在应用中输入)

### 安装

1. 克隆仓库

```bash
git clone <repository-url>
cd together-play
```

2. 安装依赖

```bash
pnpm install
# 或
npm install
```

3. 配置环境变量

复制 `.env.example` 文件为 `.env`，并填入你的 Together.ai API 密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
TOGETHER_API_KEY=your_api_key_here
```

### 运行开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用指南

### 生成图像

1. 选择模型（默认使用免费的 FLUX.1 Schnell 模型）
2. 输入提示词描述你想要生成的图像
3. 可选：调整图像尺寸、步数、引导系数等参数
4. 点击「生成图像」按钮

### 高级选项

- **负面提示词**: 指定你不希望在图像中出现的元素
- **步数**: 控制生成过程的迭代次数（更高的步数通常产生更精细的结果）
- **引导系数**: 控制生成过程对提示词的遵循程度（最小值为 1）
- **种子**: 控制随机性，使用相同的种子可以生成相似的图像
- **图像数量**: 一次生成多张图像
- **自定义 API 密钥**: 使用你自己的 Together.ai API 密钥

### 图像历史

生成的图像会自动保存到历史记录中。你可以：

- 查看之前生成的所有图像
- 查看每张图像的详细参数
- 下载图像
- 删除单张图像或清空整个历史记录

## 项目结构

```
├── src/
│   ├── app/              # Next.js 应用路由
│   ├── components/       # React 组件
│   │   ├── image-generator/  # 图像生成相关组件
│   │   ├── ui/           # UI 组件
│   │   ├── ImageGenerator.tsx  # 主图像生成组件
│   │   └── ImageHistory.tsx    # 图像历史组件
│   └── lib/              # 工具函数和服务
│       ├── db.ts         # IndexedDB 数据库操作
│       ├── error-utils.ts  # 错误处理工具
│       ├── image-generator-constants.ts  # 常量定义
│       ├── image-service.ts  # 图像生成服务
│       └── together.ts   # Together.ai API 集成
├── public/              # 静态资源
├── .env.example        # 环境变量示例
└── package.json        # 项目依赖和脚本
```

## 注意事项

- 免费模型（FLUX.1 Schnell Free）有每分钟 10 张图像的限制
- 付费模型需要 Tier 2+ 的 Together.ai 账户
- 图像生成的价格基于图像大小（百万像素）和步数
- 使用超过默认步数会按比例增加成本
- 引导系数的最小值为 1，低于此值可能导致 API 错误

## 许可证

[MIT](LICENSE)
