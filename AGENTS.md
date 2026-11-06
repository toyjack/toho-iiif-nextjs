# 项目协作指引

本文件是 Claude Code 与 Codex 共用的项目说明。Codex 直接读取本文件；Claude Code 通过根目录 `CLAUDE.md` 引入。共同规则统一维护在这里，工具专属说明才放入对应入口。

## 项目与目录

東方學デジタル圖書館 Ver.IIIF：展示汉籍书目、生成 IIIF Presentation API 3.0 manifest，并通过 Tify 阅读京都大学的数字化图像。

- 技术栈：Next.js 15.3.3 App Router、React 19、TypeScript strict、Tailwind CSS 4、DaisyUI 5。
- `src/app/`：页面与 Route Handlers。主要路径为 `/`、`/books`、`/viewer?book=<id>&page=<n>`、`/about`、`/sitepolicy`。
- `src/app/manifest/[manifestId]/manifest.json/route.ts`：`GET /manifest/<id>/manifest.json`，查找书目并返回 JSON；未知 ID 返回 404，成功响应带 CORS 头。
- `src/lib/generate-manifest.ts`：`IIIFManifestGenerator`，负责 manifest、canvas 与图像 annotation 的生成。
- `src/constants/TohoData.ts`：大型静态书目数据，按需读取相关记录，避免无关的整文件格式化。
- `src/constants/AvailableBook.ts`：有图像的书目 ID 列表；`src/constants/NuNumber.ts`：外部馆藏目录编号映射，由 `src/components/books.tsx` 使用。
- `src/types/index.ts`：书目、卷册和 IIIF 类型；`@/*` 别名对应 `src/*`。
- `src/components/`：书目筛选、排序、导航等共用组件。
- `src/app/viewer/`：Tify 集成；日文翻译在 `public/i18n/tify/ja.json`。
- `src/app/globals.css`：Tailwind、DaisyUI 与 `chinese-classics` 主题。

## 开发与验证

使用 pnpm 和现有 `pnpm-lock.yaml`，不要混用其他包管理器或生成额外锁文件。

| 命令 | 用途 |
| --- | --- |
| `pnpm install --frozen-lockfile` | 按锁文件安装依赖 |
| `pnpm dev` | 启动 Turbopack 开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动已构建的应用 |
| `pnpm exec tsc --noEmit` | 类型检查，需要已安装依赖及 Next.js 生成的类型 |

- 当前没有自动化测试脚本或测试框架。`pnpm lint` 虽已定义为 `next lint`，但仓库未配置 ESLint 依赖或配置文件；不要把它当作已可用的检查。
- 修改应用代码后执行相关类型检查和生产构建；说明遇到的既有错误、缺失依赖或环境限制。仅修改文档时检查差异与引用即可。
- 书目或 IIIF 相关修改需验证：书目列表、已知 ID 的 manifest、未知 ID 的 404，以及阅读器加载与翻页；多卷逻辑变更还需检查卷册边界。
- UI 修改检查桌面和窄屏效果，并保留日文界面与现有主题。
- `next.config.ts` 使用 `output: "standalone"`；Dockerfile 基于 Node 18 Alpine，运行独立输出的 `server.js`。仓库未通过 `engines` 或 `packageManager` 固定开发环境版本。

## 实现约定与注意事项

- 沿用相邻代码的格式和命名；新逻辑使用 TypeScript 与现有类型，优先使用 `@/` 导入。
- 页面默认使用 Server Components；需要浏览器 API 或交互状态时才添加客户端边界。Route Handler 的 `params` 和页面的 `searchParams` 当前采用异步读取模式。
- Tify 来自自定义分支 `github:toyjack/tify#dev`，不要在无关任务中替换为其他发行版。保持 `ViewerComp.tsx` 的 `ssr: false` 动态加载、浏览器端 `window.Tify` 初始化与卸载清理。
- 保留书目原文、旧字形、ID、卷册结构和外部链接。数据修订应有来源依据，避免推测性改写或批量规范化。
- 修改 IIIF 时核对资源 ID、语言映射、`right-to-left`、归属与权利声明、图像服务 URL 编码、页数及卷册顺序；本地接口类型不能替代实际阅读器验证。
- 外部图像服务为 `https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif`，实际图像加载依赖该服务。
- 当前基址构造为 `https://${NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}`，环境变量按 host 而非完整 URL 使用；本地回退也会生成 HTTPS 地址，调试时需留意。
- 当前生成器计算并传入 `globalPageNum`，但未使用它构造图像服务地址，页号按卷重新计数。涉及分页的任务应核对数据和实际图像，不要假定跨卷连续编号已正确实现。

## Claude Code 与 Codex 协作

- 开始任务先查看 `git status` 和相关差异，识别用户或另一代理尚未提交的修改；不要覆盖、回退或清理这些改动。
- 两种工具并行开发时，独立任务优先使用不同分支和 worktree；共用工作区时明确文件分工，编辑前重新读取目标文件，避免同时修改同一文件或操作 Git 索引。
- 切换工具时，在任务说明或已有任务文档中交代目标、已完成内容、涉及文件、验证结果与下一步；不要依赖另一工具的聊天历史或私有记忆。
- 默认用中文与用户交流，保留代码标识符及项目内日文内容。完成时简要说明改动、检查结果和未解决的问题。
- 新增或修订持久的共同约定时更新本文件，保持 `CLAUDE.md` 为简短入口，避免两份规则逐渐不一致。
