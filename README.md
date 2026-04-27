<div align="center">

# 🤖 Forge Agent

**你的专属 AI 团队，开箱即用。**

为开发者、研究员、写作者打造的 AI Agent 工作站 —— 多 App 切换、对话历史、知识库、长期记忆，一套壳容下所有专业 agent。

[**🚀 在线体验**](https://forge-ui.github.io/forge-agent/) · [Forge UI Kit](https://forge-ui.github.io/forge) · [forge-starter](https://github.com/forge-ui/forge-starter)

</div>

---

## 它是什么

**一个 AI Agent 平台壳站。** 后端是你自己的 agent（Claude Code / GPT / 自研），前端是这个壳。每个 agent 一个 App，互相隔离，对话历史、知识库、记忆全部按 App 维度管理。

**你不用再写：**

- ❌ 一遍又一遍的 chat 页面（消息气泡、思考折叠、工具调用、来源引用、流式响应、附件、follow-up）
- ❌ 一遍又一遍的 sidebar（新对话按钮、对话列表分组、App 切换器）
- ❌ 一遍又一遍的「输入框三件套」（多行 + 附件 + 模式开关）

**你只需要写：**

- ✅ 你的 agent 逻辑

---

## 内置场景（4 个 App，按需扩展）

| App | 定位 | 适合 |
|---|---|---|
| 🟣 **Code Studio** | 代码搭子，盯 PR、揪 bug、给重构建议 | 研发 |
| 🔵 **Research Lab** | 调研助手，搜索整合多源资料，每条带引用 | 调研 / 产品 |
| 🟢 **Writing Desk** | 写作教练，砍冗余、理逻辑、润语气 | 内容创作者 |
| 🟡 **Data Console** | 数据助手，自动清洗、建模、可视化 | 分析师 |

> App 列表是壳层 mock，自己加几行 `app/_mock/apps.tsx` 就能新增一个 App 入口。

---

## 你能直接用到的

### Chat 工作区

- **欢迎语 + 大输入框**（深度思考 / 联网搜索 / 上传文件 toggle，一键打开模式）
- **多模态消息**：文字、语音波形、PDF / 文档卡片、单图、多图网格（自动 +N 蒙层）
- **思考过程 / 工具调用 / 来源引用**：行内一句话简介 → 点击右侧抽屉看详情，主答永远干净
- **Follow-up 建议**：每条 AI 回复后挂 3 条引导问题，新手不再面对空白
- **Markdown 全家桶**：粗体、行内 code、围栏代码块、列表

### Sidebar

- **App 切换器**（Forge Agent 风格的 dropdown，副标题展示 App tagline）
- **+ 新对话** 按钮（紫色显眼）
- **对话历史**（今天 / 昨天 / 更早 自动分组）
- **底部菜单**：知识库 / 设置（Memory 设计上并入 Settings）
- **沉浸模式**：page header 可隐藏，chat 区上下贯通

### 整套体系

- 🎨 [Forge UI Kit](https://github.com/forge-ui/forge-core)（`@forge-ui/react`）—— ChatInputBar / FileTypeIcon / AppLayout / 完整 token 体系
- 🌗 浅色为主，紫色 #7C3AED 单一 accent，克制、像真产品
- ⌨️ 键盘友好：Cmd+Enter 发送、Esc 关抽屉
- 🌐 中文界面优先，英文混排自然

---

## 截图

> 在线体验更直观：https://forge-ui.github.io/forge-agent/

```
左：Sidebar         中：Chat 工作区          右（点击触发）：思考 / 工具 / 来源 抽屉
─────────────────  ─────────────────────  ─────────────────────────────────────
Forge logo         你好，Alex 👋             思考过程
Code Studio ▾      我是 Code Studio...       共思考 1.2s · 3 步
                                              1. 拆解任务 ...
+ 新对话             [大输入框]                 2. 确认数据源 ...
                   深度思考 / 联网搜索…        3. 决定输出结构 ...
今天
 · 改下登录页样式
 · PR #234 review
昨天
 · 重构 user-...

知识库 / 设置
Alex Morgan ▾
```

---

## 本地跑

```bash
# 1. clone
git clone https://github.com/forge-ui/forge-agent.git
cd forge-agent

# 2. 配 GitHub Packages token（@forge-ui/react 是私有包）
cp .env.example .env.local
# 在 .env.local 填 GITHUB_TOKEN=your_pat（需要 read:packages 权限）

# 3. 装包
GITHUB_TOKEN=$(cat .env.local | grep GITHUB_TOKEN | cut -d= -f2) pnpm install

# 4. 起服务
pnpm dev
# 打开 http://localhost:3000/code-studio/chat
```

> 装不下 `@forge-ui/react`？是 GitHub Packages 鉴权问题，确认 PAT 有 `read:packages` 权限。

---

## 部署到 GitHub Pages

```bash
GITHUB_PAGES=true pnpm build   # 产物在 out/
# 把 out 推到 gh-pages 分支即可
```

`next.config.ts` 里 `GITHUB_PAGES=true` 时会自动开启 `output: "export"` + `basePath: "/forge-agent"`。

---

## 自己定制

| 改什么 | 改哪里 |
|---|---|
| App 列表（名称 / icon / tagline） | `app/_mock/apps.tsx` |
| 每个 App 的 suggestion / 历史对话 mock | `app/_mock/apps.tsx` 的 `suggestions[]` / `conversations[]` |
| 用户名 / 头像 | `config/menu.tsx` 的 `profile` |
| Chat empty state 视觉 | `app/_components/chat-empty-state.tsx` |
| Chat thread 渲染（思考 / 工具 / 来源 / followUps） | `app/_components/chat-thread.tsx` |
| Sidebar | `app/_components/chat-sidebar.tsx` |
| 路由 | `app/[appId]/{chat,knowledge,settings}/page.tsx` |

接真实后端时只需要把 `MOCK_MESSAGES` 换成 SSE / WebSocket 流，组件全部已经按结构化数据驱动。

---

## 技术栈

- **Next.js 16**（App Router · Turbopack · static export）
- **React 19**
- **Tailwind CSS v4**（`@theme inline` token + `@source` 扫 forge dist）
- **[@forge-ui/react](https://github.com/forge-ui/forge-core)** ^0.1.9（ChatInputBar / AppLayout / FileTypeIcon / DataTable / 完整 token）
- **solar-icon-set** v2（图标）
- **TypeScript** strict

---

## 致谢

灵感来自调研过的开源项目：

- [lobe-chat](https://github.com/lobehub/lobe-chat) · [open-webui](https://github.com/open-webui/open-webui) · [LibreChat](https://github.com/danny-avila/LibreChat)
- [Dify](https://github.com/langgenius/dify) · [FastGPT](https://github.com/labring/FastGPT) · [JoyAgent-JDGenie](https://github.com/jd-opensource/joyagent-jdgenie)
- 视觉参考 Kimi · DeepSeek · 元宝 · 智谱清言 · ChatGPT · Claude · Grok

---

## License

UNLICENSED · 内部使用。Forge UI Kit 的 license 见 [forge-core](https://github.com/forge-ui/forge-core)。
