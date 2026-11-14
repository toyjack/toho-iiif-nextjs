# 项目协作指引

本文件是 Claude Code 与 Codex 共用的项目说明。Codex 直接读取本文件；Claude Code 通过根目录 `CLAUDE.md` 引入。共同规则统一维护在这里，工具专属说明才放入对应入口。

## 项目与目录

東方学IIIF図書館：展示汉籍书目、生成 IIIF Presentation API 3.0 manifest，并通过 Tify 阅读京都大学的数字化图像。

- 技术栈：Next.js 16.4.5 App Router、React 19、TypeScript strict、Tailwind CSS 4、DaisyUI 5。
- `src/app/`：页面与 Route Handlers。主要路径为 `/`、`/books`、`/viewer?book=<id>&page=<n>`、`/about`、`/sitepolicy`、`/changelog`。
- 试验公开：页头「試験公開」标记，首页、`/about`、`/sitepolicy`、`/changelog` 用 `beta-notice` 组件提示 manifest URL、内容与许可可能变化、引用请用旧站 URL；书誌情報对话框有简短提示。文案在 `ui-text.ts` 的 `BETA`。
- `/changelog`（更新履歴）的条目在 `src/lib/changelog.ts`，分「機能の変更」与「収録内容の変更」，新的在前。功能或书目数据有用户可见的变化时同步追加。
- `src/app/manifest/[manifestId]/manifest.json/route.ts`：`GET /manifest/<id>/manifest.json`，返回 `application/ld+json`（IIIF 3.0 profile）的紧凑 JSON；未知 ID 返回 404。成功与 404 响应都带 CORS 头，并支持 `OPTIONS` 预检。响应逻辑在 `src/lib/manifest-response.ts`：按书与基址在内存中缓存序列化结果。响应不压缩：Next 16 既不压缩此路由的响应，也会去掉路由自设的 `Content-Encoding` 头，所以不要在路由里自行 gzip；大书的 manifest 有数 MB，生产环境应由前置的反向代理或 CDN 压缩。设置了 `SITE_URL` 时 `Cache-Control` 为 public，否则为 private。
- 首页（`/`）按请求渲染，每次访问随机展示 6 部可阅读的书（`src/lib/random.ts`）。首页检索框是提交到 `/books?q=` 的普通 GET 表单，不加载检索数据。
- `src/lib/generate-manifest.ts`：`IIIFManifestGenerator`，负责 manifest、canvas 与图像 annotation 的生成。
- `data/books/<id>.md`：每部书一个文件。YAML frontmatter 存书目字段（含 `available` 是否可阅读、`nuNumber` 全国漢籍DB 编号、`imageSize` 扫描图像像素尺寸、`structure` 卷册），正文可写解题与修订依据。
- 卷子本（横向卷轴）在 frontmatter 写 `behavior: continuous`（需有依据，如旧站 `../volumen/` 卷轴页面）。manifest 中每卷的 Range 带 `behavior: ["continuous"]`；manifest 本身单卷为 `continuous`，多卷为 `individuals`，避免把不同卷拼在一起。Tify 读到这两个值只会关闭双页显示，不会拼接图像。
- 图像尺寸来自图像服务的 `info.json`，用作 manifest 中 canvas 与图像的宽高：
  - `imageSize`（frontmatter）是该书多数图像的尺寸。大多数书全书一致（相差一两个像素）。
  - 封面、旋转图像等相差超过 1% 的图像，列在 `data/image-sizes/<id>.tsv`（`image<TAB>width<TAB>height`，有表头；`image` 为图像编号，卷册另有前缀时写完整图像名如 `D101B0003`），由 `build-data` 校验。目前有 56 部书有这类例外。
  - 缺少 `imageSize` 时使用 `DEFAULT_IMAGE_SIZE`（横向），构建时给出警告。
- 新增或修改可阅读书目后，运行 `bun scripts/fetch-image-sizes.ts [ID ...]`：
  - 默认抽查首、次、中、末 4 张图像，尺寸一致才写入；不一致的列出供核对。
  - 对列出的书加 `--full ID ...`：读取全部图像，写入多数尺寸和例外表。
  - 请求逐个发送并间隔等待；`--cache <tsv>` 可续跑。不要并行或高频请求图像服务。`data/site.yaml` 存站点标题和分类显示顺序；`data/legacy/orphan-ids.yaml` 保存迁移时找不到对应书目的旧 ID，应用不读取。
- `scripts/build-data.ts`：校验数据并生成 `src/generated/books.json`（不入库）；`dev`、`build`、`test`、`typecheck` 脚本会先自动运行它，单独运行用 `bun run data`。开发服务器运行中修改数据后需重新运行 `bun run data`。schema 错误会使构建失败；卷册页码缺口、非 1 页的重叠等仅输出警告。
- `src/lib/books.ts`：书目数据的唯一读取入口（`library`、`getBook`、`availableBooks`、`bookSummaries`），页面和路由不要直接 import 生成的 `books.json`。
- `data/variants/variants.tsv`：异体字对照表（`standard<TAB>variants<TAB>source<TAB>note`，每项一个字，一行一个等价组），由 `build-data` 校验并生成 `src/generated/variants.json`。当前为示例表，待替换为正式表。
- `src/lib/search/`：检索用规范化（异体字归并、去空白与异体字选择符、兼容汉字与全角归一）、拼音匹配、检索与候补。只用于匹配，不改变显示文字。`/books` 在浏览器端检索，筛选与检索词保存在 URL 参数中（`q`、`category`、`dynasty`、`type`、`available`、`sort`、`order`，页码 `p`，每页 50 部）；输入与筛选用 `replaceState`，翻页用 `pushState`。列表排序用 `src/lib/text-compare.ts`，不要用 `localeCompare`（Bun 与浏览器对扩展区汉字排序不同，会造成 hydration 不一致）。
- 拼音：`scripts/pinyin.ts` 在构建时用 `pinyin-pro`（仅开发依赖，不进入前端）为书名、著者、卷册标题、分类、朝代生成 `src/generated/pinyin.json`。先经异体字归并再取读音，多音字保留全部读音；`/books` 在首次输入拉丁字母时才加载该文件。缺读音的字在构建警告中列出。
- `src/types/index.ts`：书目、卷册和 IIIF 类型；`@/*` 别名对应 `src/*`。
- `src/components/`：共用 UI 组件，文件名 kebab-case，默认为 Server Component。主要有 `book-row`（书目表格行、窄屏行、卡片）、`filter-panel`、`pagination`、`dialog`（原生 `<dialog>`）、`notice`（空、错误、提示状态）、`page-header`、`field`、`icon`（全部功能图标，不引入图标库）、`external-link`、`stat-list`、`category-index`、`viewer-toolbar`、`book-info-dialog`。只在 `books.tsx` 等客户端组件内部使用的组件不写 `"use client"`。
- UI 设计：`docs/ui-design-system.md`（tokens、组件规范、用语表）、`docs/ui-refactor-plan.md`（重构阶段与验收标准）、`docs/ui-audit.md`（改造前的审计）。界面用语与站名常量在 `src/lib/ui-text.ts`；首页与 `/about` 的统计和分类分组在 `src/lib/collection.ts`。
- `src/app/viewer/`：三种 IIIF viewer，由 `?viewer=tify|uv|mirador` 选择（缺省或未知值为 Tify，`parseViewer` 在 `src/lib/viewer-params.ts`）；`ViewerComp.tsx` 按需以 `ssr: false` 动态加载对应组件，未选中的不下载。工具栏的 `viewer-switch` 切换时整页重载并带上 `?page=`。有书时页面根元素为 `#reader`：`globals.css` 用 `body:has(#reader)` 隐藏站点页头与页脚，由 48px 的 `ViewerToolbar` 代替，viewer 高度由 flex 布局决定。工具栏的「漢籍一覧」链接经 `src/lib/last-list.ts` 回到上次的列表 URL。三种 viewer 翻页时都用 `replacePageParam`（`replaceState`）把当前页写回 `?page=`（第 1 页时去掉该参数），各自依赖非 typed 的内部接口，升级时需确认仍在：
  - Tify（`tify.tsx`）：npm 包直接 import；日文翻译在 `public/i18n/tify/ja.json`；包装 Tify store 的 `updateOptions`；自带的标题列由 `globals.css` 隐藏（规则须放在 CSS 层之外，否则敌不过 Tify 的样式）。
  - Universal Viewer（`uv.tsx`）与 Mirador（`mirador.tsx`）不经 Next 打包：`scripts/copy-viewer-assets.ts`（`bun run assets`，`dev`/`build` 自动运行）把 `node_modules` 中的预构建文件复制到 `public/vendor/`（不入库），组件用 `vendor-assets.ts` 以 `<script>` 加载。UV 按自身脚本路径加载 chunk；Mirador 用自带 React/MUI 的 `mirador.min.js`（UMD 的导出是扁平的，如 `Mirador.setCanvas`，没有 `actions`）。
  - UV：`UV.init` 的 `canvasIndex` 定起始页，订阅 `canvasIndexChange` 回写；不用 `IIIFURLAdapter`（会另写 `#?cv=`）。UV 没有日文 locale，界面为英语。UV 会注入不分层的 `.hidden { display: none }`，阅读器页面上要响应式隐藏时用 `max-md:hidden` 之类，不要用 `hidden md:block`。
  - Mirador：`language: "ja"`。没有起始索引选项而 canvas ID 依赖服务端基址，所以 `store.subscribe` 等窗口落在第一张 canvas 后再 `setCanvas` 到 `?page=` 指定页；之后由 `windows[*].canvasId` 与 `manifests[*].json.items` 换算页码回写。
- `src/app/globals.css`：Tailwind、DaisyUI 与 `chinese-classics` 主题（design tokens）。金色 `primary` 只作填充与线条，带颜色的文字用 `text-primary-text`（古銅）；辅助文字用 `text-muted`，不用 `text-base-content/70` 之类的透明度；控件边框用 `border-border-strong`；长文用 `.doc`。DaisyUI 的组件样式位于 `utilities` 层，覆盖它们的规则也写在该层。

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
| `bun run lint` | ESLint CLI（`eslint.config.mjs`，检查 `src` 与 `scripts`）；`next build` 不执行 lint，需单独运行 |

- 需要执行安装脚本的依赖须列入 `package.json` 的 `trustedDependencies`；Bun 默认不运行依赖的生命周期脚本。
- 单元测试覆盖 manifest 页号映射与基址处理；修改 `src/lib` 时补充或更新相应测试。
- 修改应用代码后执行测试、lint、类型检查和生产构建；说明遇到的既有错误、缺失依赖或环境限制。
- `bookType` 的显示名统一使用 `src/lib/book-type.ts`。客户端组件不要 import `@/lib/books`，否则整份书目会进入浏览器 bundle。
- `/api/health` 供 Dockerfile 的 `HEALTHCHECK` 使用。仅修改文档时检查差异与引用即可。
- 书目或 IIIF 相关修改需验证：书目列表、已知 ID 的 manifest、未知 ID 的 404，以及阅读器加载与翻页；多卷逻辑变更还需检查卷册边界。
- UI 修改检查桌面和窄屏效果（至少 375、768、1280），并保留日文界面与现有主题；遵循 `docs/ui-design-system.md`，界面文字从 `src/lib/ui-text.ts` 取用。
- `next.config.ts` 使用 `output: "standalone"`；Dockerfile 基于固定版本的 `oven/bun` Alpine 镜像，以 `bun server.js` 运行独立输出；升级 Bun 时同步修改 `packageManager`、`engines` 与 Dockerfile 的镜像标签。

## 实现约定与注意事项

- 沿用相邻代码的格式和命名；新逻辑使用 TypeScript 与现有类型，优先使用 `@/` 导入。
- 页面默认使用 Server Components；需要浏览器 API 或交互状态时才添加客户端边界。Route Handler 的 `params` 和页面的 `searchParams` 当前采用异步读取模式。
- Tify 使用 npm 发行版（`tify`，见 `package.json`；过去的自定义分支 `toyjack/tify#dev` 所修的问题已在上游解决），升级时核对阅读器加载、翻页与日文翻译。保持 `ViewerComp.tsx` 的 `ssr: false` 动态加载、浏览器端 `window.Tify` 初始化与卸载清理。升级 `universalviewer`、`mirador` 时同样核对加载、起始页、翻页回写与卸载，版本固定在 `package.json`。
- 保留书目原文、旧字形、ID、卷册结构和外部链接。数据修订应有来源依据，避免推测性改写或批量规范化；修订记录写在书目文件正文的「数据修订」一节。
- 卷册结构的原始来源是旧站 `http://kanji.zinbun.kyoto-u.ac.jp/db-machine/toho/html/` 下的目录页（书目 `url` 字段，相对该目录；部分书有二级目录 `…menuNN.html`）。各卷页面脚本中的 `volStartPos`、`volMaxPage` 对应 `startPage`、`maxPage`，链接文字对应卷题；卷轴（`../volumen/*.html`）按页面中图像列表计算。旧站个别数据有误（如 B010 第十二册），以实际图像为准。核对时逐个请求并间隔等待。
- 修改 IIIF 时核对资源 ID、语言映射、`right-to-left`、归属与权利声明、图像服务 URL 编码、页数及卷册顺序；本地接口类型不能替代实际阅读器验证。
- 外部图像服务为 `https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif`，实际图像加载依赖该服务。图像 ID 为 `<基址>/<前缀>%2F<文件名>`；文件名前缀与书目 ID 不同时（W002 的 `S002NNNN`、D163 的 `d163NNNN`），在 frontmatter 写 `imageFilePrefix`，只作用于书目自身前缀的图像。
- manifest、canvas、range 的 ID 基址在请求时由 `src/lib/site-url.ts` 决定：优先使用运行时环境变量 `SITE_URL`（完整 origin 或裸 host），未设置时使用请求的 `X-Forwarded-Host`/`Host` 与 `X-Forwarded-Proto`。生产部署应设置 `SITE_URL`；加入共享缓存前必须设置，避免伪造请求头污染缓存。
- 图像按全书连续编号：卷的图像范围为 `[startPage, startPage + maxPage - 1]`，以 `startPage` 为准。图像前缀默认是书目 ID；卷的图像在其他前缀下时（如寶卷上下卷 D101A、D101B，旧站卷页面的 `bookNum`），在该卷写 `bookNumber`，编号在各前缀内计。canvas 按卷册阅读顺序排列，其他前缀的 canvas ID 为 `…/canvas/<书>/<前缀>/p<n>`。`startPage: 0` 只用于地图背面（B109 子目的 `…0000`）。按「卷」划分的书在卷界处可能共用一张对开页；manifest 中每张图像只生成一个 canvas，卷册以 `structures`（Range）表达且允许重叠。修改分页逻辑或卷册数据时需对照实际图像核对。

## Claude Code 与 Codex 协作

- 开始任务先查看 `git status` 和相关差异，识别用户或另一代理尚未提交的修改；不要覆盖、回退或清理这些改动。
- 两种工具并行开发时，独立任务优先使用不同分支和 worktree；共用工作区时明确文件分工，编辑前重新读取目标文件，避免同时修改同一文件或操作 Git 索引。
- 切换工具时，在任务说明或已有任务文档中交代目标、已完成内容、涉及文件、验证结果与下一步；不要依赖另一工具的聊天历史或私有记忆。
- 默认用中文与用户交流，保留代码标识符及项目内日文内容。完成时简要说明改动、检查结果和未解决的问题。
- 新增或修订持久的共同约定时更新本文件，保持 `CLAUDE.md` 为简短入口，避免两份规则逐渐不一致。
