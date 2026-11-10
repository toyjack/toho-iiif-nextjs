# UI 重构计划

- 状态：阶段 0–8 已实施（2026-11-10）。未完成与未验证事项见 `docs/ui-audit.md` 的「处理状况」中标为「部分」的条目，以及 `docs/ui-design-system.md` §7 的「现状」列
- 依据：`docs/ui-audit.md`（问题编号 A1、C2 等）、`docs/ui-design-system.md`（章节号 §）
- 约束：不新增依赖；保留全部现有功能、URL 结构与数据；IIIF manifest 输出不变

## 1. 总览

| 阶段 | 内容 | 主要文件 | 规模 | 风险 |
| --- | --- | --- | --- | --- |
| 0 | 缺陷修复（不依赖新设计） | `page.tsx`、`books.tsx` | 小 | 低 |
| 1 | Design Tokens | `globals.css` | 小（改动少、影响全站） | 中 |
| 2 | 页面骨架与可访问性基线 | `layout.tsx`、`header.tsx`、`footer.tsx` | 小 | 低 |
| 3 | 共享组件 | `src/components/` 新增 | 中 | 低 |
| 4 | `/books` | `books.tsx`、`search-box.tsx` | 大 | 中 |
| 5 | `/viewer` | `viewer/page.tsx`、`tify.tsx`、`back-button.tsx` | 中 | 高 |
| 6 | 首页 | `page.tsx` | 中 | 低 |
| 7 | 文档页与状态页 | `about`、`sitepolicy`、`not-found`、新增 `error.tsx` | 小 | 低 |
| 8 | 收尾 | 全局 | 小 | 低 |

每个阶段一个独立的 PR（或提交），可以单独上线与回退。阶段 0–2 完成后站点已经解决审计中的全部 P0 问题。

## 2. 设计系统需要新增或调整的内容

### 2.1 调整（`globals.css` 现有主题）

| 项 | 现值 | 新值 | 解决 |
| --- | --- | --- | --- |
| `--size-selector` / `--size-field` | `0.125rem` | `0.25rem` | A1 |
| `--color-primary` | 金 `oklch(68% 0.15 85)` | 不变；用途限定为填充与线条 | A2 |
| `--color-primary-content` | `oklch(15% 0.02 85)` | `oklch(20% 0.03 85)` | — |
| 其余品牌色与语义色 | 亮度 55–72% | 亮度 42–50%（§2.1） | A2 |
| 除 primary 外的 `-content` | 深浅不一 | 统一 `oklch(98% 0.005 85)` | A2 |
| `base-100/200/300` | 偏粉的暖色（色相 40–50） | 更中性的纸色（色相 85） | 视觉质量 |
| `--radius-box` | `0.375rem` | `0.25rem` | 克制 |
| `--depth` | `1` | `0` | 去除立体效果 |

### 2.2 新增

| 项 | 位置 | 说明 |
| --- | --- | --- |
| `--font-sans` / `--font-serif` / `--font-mono` | `@theme` | 系统字体栈（§1.1） |
| `--color-primary-text` | `@theme` | 古銅色，金色的文字版本：链接、需要带品牌色的文字 |
| `--color-muted`、`--color-border-strong`、`--color-mark` | `@theme` | 辅助文字、控件边框、检索高亮 |
| `--container-page`、`--container-prose` | `@theme` | 内容宽度 |
| 全局 `:focus-visible` 焦点环 | `@layer base` | §5.1 |
| `prefers-reduced-motion` 规则 | `@layer base` | §5.3 |
| `body` 的字体、`text-autospace`、`line-break`；标题的 `text-wrap: balance` | `@layer base` | §1.3 |
| `.skip-link` | `@layer components` | §3.5 |
| 界面用语常量 | `src/lib/ui-text.ts`（新） | §6 用语表 |

### 2.3 废止

- 文字透明度类（`text-base-content/50…80`）→ `text-muted` 或正文色
- `btn-lg`、`btn-xs`、`badge-xs`、`shadow-sm/lg` 用于卡片、`hover:shadow-*`、`bg-gradient-*`、`bg-clip-text`
- `opacity-75` 表示不可用
- `badge-primary` / `badge-secondary` 用于分类与朝代
- `text-primary`、`link-primary`（金色文字，2.74:1）→ 墨色或 `--color-primary-text`。现有使用点：`header.tsx:23,34`、`page.tsx:33,41,68,180-183`、`footer.tsx:9,15`、`about/page.tsx`、`sitepolicy/page.tsx`、`not-found.tsx:8`、`books.tsx:345`

## 3. 共享组件优先级

均放在 `src/components/`，沿用现有的文件命名（kebab-case）。默认为 Server Component，标注「client」的才需要客户端边界。注意：客户端组件不能 import `@/lib/books`（`AGENTS.md` 的约定）。

| 优先级 | 组件 | 文件 | 说明 | 用于 |
| --- | --- | --- | --- | --- |
| P0 | `Icon` | `icon.tsx` | 8 个内联 SVG，`aria-hidden` | 全站 |
| P0 | `PageHeader` | `page-header.tsx` | `h1` + 说明 | 除阅读器外的所有页 |
| P0 | `Field` | `field.tsx` | label + 控件 + hint 的关联 | `/books` 筛选 |
| P0 | `Notice` | `notice.tsx` | 空、错误、提示的统一样式 | `/books`、阅读器、404、error |
| P0 | `BookRow` | `book-row.tsx` | 书目行；接收 `BookSummary`，不含数据读取 | `/books`、首页 |
| P1 | `Pagination` | `pagination.tsx` | 链接式分页，URL 参数 `p` | `/books` |
| P1 | `FilterPanel` | `filter-panel.tsx`（client） | 从 `books.tsx` 拆出的筛选表单；`≥ lg` 为侧栏，`< lg` 放进 Dialog | `/books` |
| P1 | `Dialog` | `dialog.tsx`（client） | 原生 `<dialog>` 封装，负责焦点返还 | 筛选、书誌情報 |
| P1 | `ExternalLink` | `external-link.tsx` | 外链图标 + `sr-only` 提示 + `rel` | 全站 |
| P1 | `StatList` | `stat-list.tsx` | 统计 `<dl>` | 首页、about |
| P1 | `CategoryIndex` | `category-index.tsx` | 目次式分类列表 | 首页、about |
| P2 | `ActiveFilters` | `active-filters.tsx`（client） | 生效条件标签 | `/books` |
| P2 | `ViewerToolbar` | `viewer-toolbar.tsx` | 阅读器工具栏 | 阅读器 |
| P2 | `BookInfoDialog` | `book-info-dialog.tsx`（client） | 書誌情報 | 阅读器 |
| P2 | `Skeleton` | `skeleton.tsx` | 列表骨架 | `/books` |
| — | `Tabs`、`Tooltip` | — | 设计系统已定规范，**暂不实现**，出现用例时再做 | — |

现有组件的去向：

| 现有 | 处理 |
| --- | --- |
| `header.tsx` | 保留，改为 `<header>` + `<nav>`，断点 `lg` → `md` |
| `footer.tsx` | 保留，重排为两栏，去掉图标 |
| `books.tsx` | 拆分为 `FilterPanel`、`BookRow`、`Pagination`、`ActiveFilters`；本体只保留状态与检索逻辑 |
| `search-box.tsx` | 保留全部键盘与 IME 逻辑，只调整候补行的版式 |
| `back-button.tsx` | 删除，由 `ViewerToolbar` 里的普通链接代替（B3） |

## 4. 各阶段详述

### 阶段 0：缺陷修复

可立即进行，与设计系统无关。

| 任务 | 位置 | 审计 |
| --- | --- | --- |
| 首页底部按钮 `href="/viewer"` → `/books` | `src/app/page.tsx:332` | B1 |
| 定位并修复 `/books` 的 hydration 错误 | `components/books.tsx` | B2 |
| 筛选与排序控件补 label 关联 | `components/books.tsx:167-277` | E1 |
| 「準備中」`<button>` → `<span>` | `components/books.tsx:432` | D2 |

B2 的排查思路：先在生产构建下确认是否复现；用 React 开发工具查看不匹配的具体节点；重点检查依赖 `useSearchParams` 的首次渲染值，以及 `localeCompare` 之外任何服务端与浏览器结果可能不同的地方。审计时已排除卡片顺序差异。

**验收**：`/books` 控制台无 hydration 错误；首页按钮到达书目页；5 个控件的 `labels.length > 0`。

### 阶段 1：Design Tokens

- 按 `ui-design-system.md` §8 改写 `globals.css` 的主题与 `@theme`，加入 §2.2 的 base 规则。
- 全站外观会变：控件恢复正常高度，底色变得更中性，语义色加深。金色主色不变。
- 金色文字的替换（§2.3 最后一项）需要改页面文件里的类名。为了让阶段 1 结束时对比度就达标，这一项随阶段 1 一起做：只替换类名，不动结构。

**影响范围**：全部页面。

**风险**

| 风险 | 说明 | 对策 |
| --- | --- | --- |
| 控件尺寸翻倍后布局拥挤 | 现有页面是在半高控件下排的，例如书卡底部一行放了徽章、外链、按钮 | 阶段 1 上线前逐页截图比对；明显挤压的地方先用最小改动缓解，正式版式在阶段 4–6 处理 |
| 金色文字替换不彻底 | `text-primary` 分散在 8 个文件里，还有 `group-hover:text-primary`、`hover:text-primary` 等变体 | 用全局搜索 `primary` 逐一核对；渐变标题与 `bg-primary/10` 图标底是装饰，留到阶段 6 删除 |
| 金色主按钮的边界对背景不足 3:1 | 按钮靠深色文字标签识别，符合 WCAG 1.4.11 对有文字标签控件的要求，但视觉上边界偏弱 | 实施后目视检查；若觉得弱，给主按钮加 1px 古銅色边框 |
| 全局字体与焦点规则影响 Tify | Tify 自带样式，全局 `font-family`、`:focus-visible`、`box-sizing` 可能渗入阅读器内部 | 改后实际打开阅读器翻页、打开目次与信息面板检查；必要时把全局规则限定在 `#tify` 之外 |
| 自定义 `@theme` 变量的工具类名 | Tailwind 4 按命名空间生成类，名称需确认 | 实施时先验证 `text-muted`、`max-w-page` 等是否生成，再在组件中使用 |
| 字体栈在各系统上的实际效果 | 设计文档中的排序未实测 | 在 Windows、macOS、Android 各看一次首页与书目页 |

**验收**：见 §6 的「对比度」「目标尺寸」两组；阅读器功能无回归。

### 阶段 2：页面骨架与可访问性基线

- `layout.tsx`：加跳转链接；`children` 包进 `<main id="main">`；`body` 设为纵向 flex，页脚贴底。
- `header.tsx`：语义元素、`aria-label`、当前页样式、`md` 断点、菜单按钮 44px、站名不缩写。
- `footer.tsx`：两栏、去图标、年份不写死。
- 各页补 `metadata.title`（`/books`、`/sitepolicy`；阅读器用 `generateMetadata` 输出「書名 | 站名」）。
- 阅读器页现在自己有 `<main>` 与 `min-h-screen` 包裹，需与新的 layout 协调，避免嵌套 `<main>`。

**影响范围**：全部页面的外壳。

**风险**：阅读器页与 layout 的 `<main>` 嵌套——阶段 5 之前先让阅读器页去掉自己的 `<main>`。

**验收**：每页地标为 `banner`、`navigation`、`main`、`contentinfo` 各一；Tab 第一下到跳转链接；每页 `<title>` 不同。

### 阶段 3：共享组件

- 按 §3 的 P0 → P1 顺序实现组件。此阶段只新增文件，页面暂不接入，因此没有可见变化。
- 新建 `src/lib/ui-text.ts` 存放 §6 用语表的字符串。
- `BookRow` 的显示逻辑（如按全角空格拆分书名）若写成纯函数，放在 `src/lib/` 并补单元测试（项目约定：修改 `src/lib` 时补测试）。

**验收**：`bun run typecheck`、`bun run lint`、`bun run test` 通过。

### 阶段 4：`/books`（最高优先的页面）

问题最集中（A1、A4、C1、C2、D1、D2、D4、D5、E1），也是主要流程的中心。

| 任务 | 说明 |
| --- | --- |
| 卡片网格 → `BookRow` 列表 | `≥ md` 为表格，`< md` 为堆叠行（§4.4） |
| 分页 | 每页 50；URL 参数 `p`；筛选或检索变化时回到第 1 页 |
| 筛选栏 | `≥ lg` 左侧 264px 吸顶；`< lg` 收进 Dialog，按钮显示生效条件数 |
| 结果区顶部 | 件数（`aria-live`）、排序、`ActiveFilters` |
| 空结果 | `Notice` + 「条件をクリア」 |
| 用语 | 全部替换为 `ui-text.ts` |
| Suspense fallback | `Skeleton` |
| 检索候补版式 | §4.2 |

**必须保持不变的行为**

- URL 参数 `q`、`category`、`dynasty`、`type`、`available`、`sort`、`order` 的名称与含义（外部可能有链接）
- 检索逻辑（`src/lib/search/`）、异体字与拼音数据的按需加载
- 检索框的 IME 处理与键盘操作
- 候补选择的行为（可阅读的书直接进阅读器）
- 客户端组件不 import `@/lib/books`

**风险**

| 风险 | 对策 |
| --- | --- |
| 分页与浏览器端检索的配合：结果在客户端计算，分页只是切片 | 页码作为 URL 状态与其他参数同等处理；切片在 `results` 之后 |
| 分页后，浏览器的页内查找（Ctrl+F）找不到其他页的书 | 检索框已覆盖书名与著者；在说明文字中提示。如负责人认为必须一页看全，可提供「すべて表示」选项 |
| `replaceState` 更新 URL 的现有做法与分页链接（`<Link>`）并存 | 分页用 `<Link>`（产生历史记录，可后退），输入与筛选沿用 `replaceState` |
| 表格在 768–1023px 下列数过多 | 该区间隐藏「分类」列并入书名下的 meta 行；不截断内容 |
| 改动面大，容易引入 hydration 问题 | 阶段 0 先解决现有问题并理解原因 |

**验收**：见 §6 的「书目页」组。

### 阶段 5：`/viewer`（风险最高）

| 任务 | 说明 |
| --- | --- |
| 三层栏 → `ViewerToolbar`（48px） | 返回链接、书名 `<h1>`、著者、manifest 链接、書誌情報 |
| Tify 高度 | 由 flex 布局决定（`100dvh - 48px`），删除 `640px` / `90vh` / `calc(100vh-120px)` |
| 隐藏站点导航与页脚 | 用 route group 或 layout 条件实现，具体方式实施时定 |
| 加载与失败状态 | 替换「IIIF Viewer」裸文本；manifest 失败时的 `Notice` |
| `BookInfoDialog` | 书目字段、全国漢籍DB、manifest URL 与复制 |
| 缺 ID／准备中 | 改用 `Notice`，这两种情况下显示正常的站点页头与页脚 |

**必须保持不变**（`AGENTS.md`）

- `ViewerComp.tsx` 的 `ssr: false` 动态加载
- 浏览器端 `window.Tify` 初始化与卸载时的 `destroy()`
- Tify 版本（`toyjack/tify#dev`）与日文翻译文件
- `?book=` 与 `?page=` 参数、manifest URL

**风险**

| 风险 | 对策 |
| --- | --- |
| 改变容器高度的方式后 Tify 画布尺寸计算异常（OpenSeadragon 对容器尺寸敏感） | 在 1280、768、375 三个宽度下实际翻页、缩放、打开目次与缩略图面板、进入与退出全屏 |
| 隐藏全局导航需要调整 layout 结构 | 若用 route group，会移动文件路径但不改变 URL；改后验证 `/viewer`、`/manifest/…`、`/api/health` |
| Tify 内部也渲染书名为 `<h1>`，页面出现两个 | 先查 Tify 分支是否有隐藏标题的选项；没有的话工具栏的书名降为非标题元素，以 Tify 的为准。不为此改动 Tify |
| 移动端 `100dvh` 与浏览器地址栏伸缩 | 用 `dvh` 并在真机或模拟器上确认 |
| 用 `<Link href="/books">` 代替 `router.back()` 后，从筛选结果进入阅读器再返回会丢失筛选状态 | 进入阅读器时把来源的查询串带上（如 `?book=A029&from=…`）或用 `sessionStorage` 记住上一次的列表 URL；实施时择一 |

**验收**：见 §6 的「阅读器」组，以及 `AGENTS.md` 要求的 IIIF 验证项。

### 阶段 6：首页

| 现有区块 | 处理 |
| --- | --- |
| Hero（渐变标题、三张彩色统计卡、大按钮） | 改为：站名（`display`）＋ 一句说明 ＋ **检索框**（提交后到 `/books?q=`）＋ `StatList` |
| 「漢籍分類」「文庫分類」十张图标卡 | `CategoryIndex`，两栏目次 |
| 「おすすめの漢籍」 | 保留随机 6 部，标题改为「所蔵より」，用 `BookRow` 的卡片变体；仍按请求渲染 |
| 「プラットフォームの特色」 | 删除。其中有实际信息的一句（IIIF 对应）并入说明文字，链接到 `/about` |

- 首页的检索框是一个普通的 GET 表单（Server Component 即可），不带候补，不加载检索数据。
- 统计口径：与 `/about` 共用同一组数字和用语。

**风险**：首页是按请求渲染的（`connection()`），保持不变；删除宣传区块属于内容取舍，需负责人确认（设计文档 §7 第 6 项）。

**验收**：首屏（1280×800 与 375×812）内可见检索框；页面无渐变、无装饰图标；`page.tsx` 中无重复的区块代码。

### 阶段 7：文档页与状态页

- `/about`、`/sitepolicy`：`PageHeader`、`--container-prose`、正文色、`StatList`、`CategoryIndex`、`ExternalLink`；去掉 CC 假图标。
- `not-found.tsx`：`Notice`。
- 新增 `src/app/error.tsx`：`Notice` + 重试。
- 利用規約里的两个彩色底块改为普通的小节与列表。

**风险**：低。文字内容不改，只改版式。

### 阶段 8：收尾

- 删除注释掉的 UI 代码（`viewer/page.tsx`、`footer.tsx`）。
- 全局搜索确认已无 §2.3 废止的类。
- 更新 `AGENTS.md`：组件目录说明、用语常量文件、设计系统文档的位置。
- 更新 `docs/ui-audit.md` 的状态或在文首注明已处理的条目。

## 5. 页面改造顺序与理由

1. **`/books`**——问题最多，是所有流程的必经页；`BookRow` 做好后首页直接复用。
2. **`/viewer`**——用户停留时间最长的页面；风险最高，放在组件与 token 稳定之后。
3. **`/`**——依赖 `BookRow`、`StatList`、`CategoryIndex`；主要是删减。
4. **`/about`、`/sitepolicy`、404、error**——改动小，可与任一阶段并行。

如果时间有限，阶段 0–2 加阶段 4 已经覆盖审计中绝大部分 P0 与 P1 问题。

## 6. 验收标准

### 每个阶段都要通过

- `bun run test`、`bun run lint`、`bun run typecheck`、`bun run build` 全部通过
- 浏览器控制台无 hydration 错误与新的报错
- 在 375、768、1280 三个宽度下目视检查受影响的页面，无横向滚动
- `GET /manifest/A029/manifest.json` 的响应内容与改造前逐字节一致；未知 ID 仍返回 404

### 对比度（阶段 1 后）

- 在浏览器中实测 `ui-design-system.md` §2.2 的每个组合，文字 ≥ 4.5:1，控件边框 ≥ 3:1
- `badge-soft` 的实际底色与文字对比度 ≥ 4.5:1
- 页面中不存在带透明度的文字颜色类
- 页面中不存在金色文字（`text-primary`、`link-primary`）；金色只出现在主按钮底色、当前项下划线与检索高亮
- 焦点环为墨色，在纸色与金色按钮旁都清晰可见

### 目标尺寸（阶段 1 后）

- 所有 `button`、`a.btn`、`input`、`select`、`summary` 的高度 ≥ 24px；主要操作 ≥ 32px
- 徽章的高度 ≥ 其文字的行高（文字不溢出色块）
- 移动端菜单按钮 ≥ 44×44px

### 结构与语义（阶段 2 后）

- 每页恰有一个 `<h1>`、一个 `<main>`、一个带 `aria-label` 的主 `<nav>`
- 每页 `<title>` 互不相同；阅读器页包含书名
- 所有表单控件 `labels.length > 0` 或有 `aria-label`
- 所有装饰性 `<svg>` 有 `aria-hidden="true"`

### 键盘（阶段 4、5 后，用真实键盘）

- 仅用键盘完成：首页 → 检索 → 选中候补 → 阅读器 → 返回列表
- 每个可聚焦元素都有可见的焦点环
- 对话框：打开后焦点在内部，Esc 关闭，焦点回到触发按钮
- 书目列表中每行的 Tab 停靠点不超过 2 个

### 书目页（阶段 4 后）

- 默认首屏（1280×800）可见 ≥ 8 部书；375×812 下首屏可见 ≥ 2 部书（改造前分别约为 6 部与 0 部）
- 页面高度：桌面 < 6,000px（改造前 31,219px）
- 现有的全部 URL 参数继续有效；带参数的旧链接结果不变
- 检索「zhouyi」仍返回 2 部并标明拼音匹配；检索含异体字的词仍能命中
- 界面上不再出现「作者」「閱覽」「卷數」「全部分類」「未知」
- 空结果页有清除条件的按钮

### 阅读器（阶段 5 后）

- Tify 上方的外壳高度 ≤ 48px（改造前 175px）
- 页面不出现整页纵向滚动条；Tify 高度等于视口高度减去工具栏
- `?book=A029&page=n` 打开到正确的页；翻页、缩放、目次、缩略图、全屏正常
- 多卷书在卷册边界处的页码与目次正确（`AGENTS.md` 的验证要求）
- 缺 ID、未知 ID（404）、未公开三种情况各显示对应提示
- 离开阅读器页后 Tify 实例被销毁（来回进入 5 次，无重复实例与控制台报错）

### 首页（阶段 6 后）

- 首屏内有可用的检索框，提交后到达带 `q` 参数的书目页
- 每次刷新推荐书目变化（按请求渲染未被破坏）
- 无渐变文字、无装饰性图标、无宣传区块

### 最终（阶段 8 后）

- 重新执行 `docs/ui-audit.md` 中的实测项，P0 与 P1 条目全部关闭或有书面说明
- 在 Windows、macOS、Android 上各检查一次字体显示，书名中的旧字形与扩展区汉字无明显的风格混杂（若有，记录具体字符）
- 200% 浏览器缩放下首页、书目页可用

## 7. 开始前需要确认的事项

`ui-design-system.md` §7 列出的 7 项。其中会阻塞具体阶段的：

| 事项 | 阻塞 |
| --- | --- |
| 站名统一（第 1 项） | 阶段 2 |
| 「時代」「版種」用语（第 2 项）、每页件数（第 4 项） | 阶段 4 |
| 阅读器隐藏主导航（第 5 项） | 阶段 5 |
| 首页删减范围（第 6 项） | 阶段 6 |

主色已决定保留金色（第 7 项）。阶段 0、1、3 不依赖任何待决事项，可以先行。

## 8. 协作说明

本项目由 Claude Code 与 Codex 共同维护（`AGENTS.md`）。重构期间：

- 每个阶段使用独立分支；阶段 4、5、6 改动的文件互不重叠，可以并行，但都依赖阶段 1–3 已合并。
- `globals.css` 与 `src/components/` 下的共享组件在阶段 1、3 定稿后，后续阶段如需修改应单独提交并说明。
- 阶段完成时在 PR 说明中写明：已完成内容、涉及文件、验收结果、遗留问题。
