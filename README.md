# SoxLab 项目文档


---

## 目录结构说明

```plaintext
sock-whisperer-design-lab-1/
├── backend/                  # 传统后端（如 Flask）相关代码
│   ├── app.py
│   ├── requirements.txt
│   └── wsgi.py
├── src/                      # 前端 React 源码
│   ├── components/           # 主要 UI 组件
│   ├── contexts/             # React 上下文（如 Auth）
│   ├── data/                 # 静态数据
│   ├── hooks/                # 自定义 hooks
│   ├── integrations/         # 第三方集成（如 Supabase）
│   ├── lib/                  # 工具函数
│   ├── pages/                # 路由页面
│   ├── services/             # 前端服务层（API 调用等）
│   └── types/                # TypeScript 类型定义
├── supabase/                 # Supabase Functions 及配置
│   ├── config.toml
│   └── functions/
│       ├── chat-with-gpt/
│       ├── edit-sock-design/
│       └── generate-sock-design/
├── public/                   # 静态资源
├── package.json              # 前端依赖管理
├── tailwind.config.ts        # TailwindCSS 配置
├── README.md                 # 项目说明文档
└── ...                       # 其他配置文件
```

---

## 快速开始

### 1. 安装依赖

前端依赖（在项目根目录）：

```bash
npm install
```

后端依赖（如使用 Flask）：

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置 Supabase

- 在 `supabase/config.toml` 配置 Supabase 项目参数。
- 在 `supabase/functions/generate-sock-design/openai-service.ts` 等文件中填写你的 OpenAI API Key。

### 3. 启动开发环境

前端启动：

```bash
npm run dev
```

后端启动（如有需要）：

```bash
cd backend
python app.py
```

Supabase 本地函数开发（可选）：

```bash
supabase functions serve
```

### 4. 访问项目

默认前端开发服务器地址为 [http://localhost:5173](http://localhost:5173)。

---

## 关键技术栈

- **前端**：React, TypeScript, TailwindCSS, Vite
- **后端**：Supabase Functions, Flask（可选）
- **AI 服务**：OpenAI GPT-4o, gpt-image-1
- **数据库**：Supabase Postgres
- **用户认证**：Supabase Auth

---

## 重要文件说明

- `src/services/`：前端所有与后端/AI 交互的服务层代码。
- `supabase/functions/generate-sock-design/openai-service.ts`：AI 图像生成与提示词扩展的核心逻辑。
- `src/components/`：页面主要功能组件。
- `src/pages/`：路由页面，负责页面级逻辑和布局。

---

## 常见问题

1. **OpenAI API Key 如何配置？**  
   在 Supabase 函数相关文件或环境变量中填写你的 OpenAI API Key。

2. **图片生成失败怎么办？**  
   检查 OpenAI Key 是否有效，网络是否畅通，或查看 Supabase 函数日志。

3. **如何部署到生产环境？**  
   可使用 Vercel、Render 等平台，参考 `vercel.json`、`render.yaml` 配置文件。

---
