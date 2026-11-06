# 项目协作指引

本文件是 Claude Code 与 Codex 共用的项目说明。Codex 直接读取本文件；Claude Code 通过根目录 `CLAUDE.md` 引入。共同规则统一维护在这里，工具专属说明才放入对应入口。

## 项目与目录

東方學デジタル圖書館 Ver.IIIF：展示汉籍书目、生成 IIIF Presentation API 3.0 manifest，并通过 Tify 阅读京都大学的数字化图像。

- 技术栈：Next.js 15.3.3 App Router、React 19、TypeScript strict、Tailwind CSS 4、DaisyUI 5。
- `src/app/`：页面与 Route Handlers。主要路径为 `/`、`/books`、`/viewer?book=<id>&page=<n>`、`/about`、`/sitepolicy`。
- `src/app/manifest/[manifestId]/manifest.json/route.ts`：`GET /manifest/<id>/manifest.json`，查找书目并返回 JSON；未知 ID 返回 404，成功响应带 CORS 头。
- `src/lib/generate-manifest.ts`：`IIIFManifestGenerator`，负责 manifest、canvas 与图像 annotation 的生成。
- `data/books/<id>.md`：每部书一个文件。YAML frontmatter 存书目字段（含 `available` 是否可阅读、`nuNumber` 全国漢籍DB 编号、`structure` 卷册），正文可写解题与修订依据。`data/site.yaml` 存站点标题和分类显示顺序；`data/legacy/orphan-ids.yaml` 保存迁移时找不到对应书目的旧 ID，应用不读取。
- `scripts/build-data.ts`：校验数据并生成 `src/generated/books.json`（不入库）；`dev`、`build`、`test`、`typecheck` 脚本会先自动运行它，单独运行用 `bun run data`。开发服务器运行中修改数据后需重新运行 `bun run data`。schema 错误会使构建失败；卷册页码缺口、非 1 页的重叠等仅输出警告。
- `src/lib/books.ts`：书目数据的唯一读取入口（`library`、`getBook`、`availableBooks`），页面和路由不要直接 import 生成的 JSON。
- `src/types/index.ts`：书目、卷册和 IIIF 类型；`@/*` 别名对应 `src/*`。
- `src/components/`：书目筛选、排序、导航等共用组件。
- `src/app/viewer/`：Tify 集成；日文翻译在 `public/i18n/tify/ja.json`。
- `src/app/globals.css`：Tailwind、DaisyUI 与 `chinese-classics` 主题。

## 开发与验证

使用 Bun（版本见 `package.json` 的 `packageManager`）和现有 `bun.lock`，不要混用其他包管理器或生成额外锁文件。开发、构建与生产运行都在 Bun 运行时上进行（脚本使用 `bun --bun next …`）。

| 命令 | 用途 |
| --- | --- |
| `bun install --frozen-lockfile` | 按锁文件安装依赖 |
| `bun run dev` | 启动 Turbopack 开发服务器 |
| `bun run build` | 生产构建 |
| `bun run start` | 启动已构建的应用 |
| `bun run typecheck` | 类型检查（`tsc --noEmit`），需要已安装依赖及 Next.js 生成的类型 |
| `bun run test` | 运行 `bun test` 单元测试（`src/**/*.test.ts`） |

- 需要执行安装脚本的依赖须列入 `package.json` 的 `trustedDependencies`；Bun 默认不运行依赖的生命周期脚本。
- 单元测试覆盖 manifest 页号映射与基址处理；修改 `src/lib` 时补充或更新相应测试。`bun run lint` 虽已定义为 `next lint`，但仓库未配置 ESLint 依赖或配置文件；不要把它当作已可用的检查。
- 修改应用代码后执行测试、类型检查和生产构建；说明遇到的既有错误、缺失依赖或环境限制。仅修改文档时检查差异与引用即可。
- 书目或 IIIF 相关修改需验证：书目列表、已知 ID 的 manifest、未知 ID 的 404，以及阅读器加载与翻页；多卷逻辑变更还需检查卷册边界。
- UI 修改检查桌面和窄屏效果，并保留日文界面与现有主题。
- `next.config.ts` 使用 `output: "standalone"`；Dockerfile 基于固定版本的 `oven/bun` Alpine 镜像，以 `bun server.js` 运行独立输出；升级 Bun 时同步修改 `packageManager`、`engines` 与 Dockerfile 的镜像标签。

## 实现约定与注意事项

- 沿用相邻代码的格式和命名；新逻辑使用 TypeScript 与现有类型，优先使用 `@/` 导入。
- 页面默认使用 Server Components；需要浏览器 API 或交互状态时才添加客户端边界。Route Handler 的 `params` 和页面的 `searchParams` 当前采用异步读取模式。
- Tify 来自自定义分支 `github:toyjack/tify#dev`，不要在无关任务中替换为其他发行版。保持 `ViewerComp.tsx` 的 `ssr: false` 动态加载、浏览器端 `window.Tify` 初始化与卸载清理。
- 保留书目原文、旧字形、ID、卷册结构和外部链接。数据修订应有来源依据，避免推测性改写或批量规范化。
- 修改 IIIF 时核对资源 ID、语言映射、`right-to-left`、归属与权利声明、图像服务 URL 编码、页数及卷册顺序；本地接口类型不能替代实际阅读器验证。
- 外部图像服务为 `https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif`，实际图像加载依赖该服务。
- manifest、canvas、range 的 ID 基址在请求时由 `src/lib/site-url.ts` 决定：优先使用运行时环境变量 `SITE_URL`（完整 origin 或裸 host），未设置时使用请求的 `X-Forwarded-Host`/`Host` 与 `X-Forwarded-Proto`。生产部署应设置 `SITE_URL`；加入共享缓存前必须设置，避免伪造请求头污染缓存。
- 图像按全书连续编号：卷的图像范围为 `[startPage, startPage + maxPage - 1]`，以 `startPage` 为准。按「卷」划分的书在卷界处可能共用一张对开页；manifest 中每张图像只生成一个 canvas，卷册以 `structures`（Range）表达且允许重叠。修改分页逻辑或卷册数据时需对照实际图像核对。

## Claude Code 与 Codex 协作

- 开始任务先查看 `git status` 和相关差异，识别用户或另一代理尚未提交的修改；不要覆盖、回退或清理这些改动。
- 两种工具并行开发时，独立任务优先使用不同分支和 worktree；共用工作区时明确文件分工，编辑前重新读取目标文件，避免同时修改同一文件或操作 Git 索引。
- 切换工具时，在任务说明或已有任务文档中交代目标、已完成内容、涉及文件、验证结果与下一步；不要依赖另一工具的聊天历史或私有记忆。
- 默认用中文与用户交流，保留代码标识符及项目内日文内容。完成时简要说明改动、检查结果和未解决的问题。
- 新增或修订持久的共同约定时更新本文件，保持 `CLAUDE.md` 为简短入口，避免两份规则逐渐不一致。
