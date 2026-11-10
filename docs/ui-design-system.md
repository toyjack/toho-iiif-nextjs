# UI Design System

- 状态：已实施（2026-11-10，见 `docs/ui-refactor-plan.md`）。§7 中仅第 3 项（原文字段的 `lang`）仍未决
- 依据：`docs/ui-audit.md`（下文以 A1、C2 等编号引用其中的问题）与 `main` 分支 `718744c` 的代码
- 实施步骤见 `docs/ui-refactor-plan.md`

## 0. 设计方向

### 0.1 这是什么产品

一个学术机构的汉籍目录与影像阅览站：335 部书目，2,488 卷册，用户是研究者、学生和图书馆员。他们来做三件事——**找到一部书、确认是不是要找的那个版本、打开影像**。它不是营销站，也不是后台仪表盘，而是**目录（catalogue）**。

### 0.2 方向：書目（しょもく）

版式上参照纸本汉籍目录与图书馆 OPAC，而不是产品落地页：

| 原则 | 含义 |
| --- | --- |
| 文字即界面 | 书名、著者、版本是页面的主角。用字体、字重和留白建立层级，不靠色块、图标和卡片阴影 |
| 墨与纸，加一点金和朱 | 纸色背景、墨色文字；金是品牌色，只作填充与线条（主按钮、当前项的下划线、检索高亮），不作文字；需要带颜色的文字（链接）用加深的古銅色；朱（印章的红）只作点缀 |
| 密而有序 | 列表用行而不是大卡片，一屏能比较更多书；用对齐和分隔线维持秩序 |
| 安静 | 无渐变、无装饰图标、无整卡悬浮效果；阴影只用于浮层 |
| 原文不动 | 书目原文、旧字形、全角空格保持原样；界面用语统一为日文 |

### 0.3 明确不做的事

- 不做 Hero 渐变标题、彩色统计卡、「プラットフォームの特色」式的三栏宣传区
- 不给分类配图标；图标只用于有功能含义的地方（检索、菜单、外链、排序、关闭）
- 不用颜色区分分类、朝代、版本这类并列的书目属性
- 不引入新的 UI 库、图标库或网络字体

## 1. Typography

### 1.1 字体

**不加载网络字体，使用系统字体栈。** 理由：

- 书目里有大量旧字形和扩展区汉字（构建警告中有 `𤊹`、`𧻰`）。常见的日文网络字体只覆盖 JIS 字集，缺的字会回退到另一种字体，同一个书名里字形风格混杂，比全用系统字体更难看。
- 日文网络字体体积大；Docker 构建时还需要联网取字体。
- 不增加依赖。

| Token | 字体栈 | 用途 |
| --- | --- | --- |
| `--font-sans` | `"Helvetica Neue", "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Meiryo", "Noto Sans CJK JP", "Noto Sans JP", system-ui, sans-serif` | 界面、正文、表单、著录项 |
| `--font-serif` | `"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif CJK JP", "Noto Serif JP", "Source Han Serif JP", "Songti TC", "PMingLiU", "HanaMinA", "HanaMinB", serif` | 书名、页面标题、站名 |
| `--font-mono` | `ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Noto Sans Mono CJK JP", monospace` | 书目 ID、URL、manifest 路径 |

说明：

- 日文字体排在 `system-ui` 之前，避免中文系统上界面被渲染成简体字形。
- **书名用明朝体**是整个系统最重要的一条字体规则：它让「书」和「界面」在视觉上分开，也是典籍气质的来源，不需要任何装饰。
- 明朝体只用 400 和 700 两个字重（Yu Mincho、Hiragino Mincho 没有可靠的 500/600）。
- 字体栈需要在 Windows、macOS、Android 上各看一次实际效果（见重构计划的验收标准）；这里的排序是依据各系统自带字体推定的，尚未实测。

### 1.2 字号层级

基准 16px。只使用下表中的字号。

| Token | 大小 / 行高 | 字体 · 字重 | 用途 |
| --- | --- | --- | --- |
| `display` | 30px / 1.3（≥640px 为 36px） | serif 700 | 首页站名，仅一处 |
| `h1` | 24px / 1.35（≥640px 为 28px） | serif 700 | 页面标题 |
| `h2` | 20px / 1.4 | serif 700 | 区块标题 |
| `h3` | 16px / 1.5 | sans 700 | 小节标题、筛选组标题 |
| `title` | 17px / 1.5 | serif 700 | 列表中的书名 |
| `body` | 16px / 1.8 | sans 400 | 长文（about、利用規約） |
| `ui` | 14px / 1.5 | sans 400 | 表单、按钮、导航、著录项、表格 |
| `meta` | 13px / 1.5 | sans 400 | 辅助信息、出版事项、说明文字 |
| `label` | 12px / 1.4 | sans 700 | 徽章、表头、字段名；**最小字号** |

规则：

- 不使用小于 12px 的文字（现有 `badge-xs` 的 10px 取消）。
- 长文行高 1.8，界面 1.5，标题 1.3–1.4。汉字文本比拉丁文本需要更大的行距。
- 数字用 `font-variant-numeric: tabular-nums`（统计、件数、页码、表格列）。
- 书目 ID（`A029`）用 `--font-mono`、`meta` 字号。
- 标题最多三级，一个页面只有一个 `<h1>`。

### 1.3 中日英混排

- `<html lang="ja">` 保持不变。书名等原文目前不单独标注语言；是否对原文字段加 `lang="zh-Hant"` 属于待决事项（见 §7），因为它会改变字形选择，需要对照若干书名实际比较后决定。
- 汉字与拉丁字母、数字之间不手工加空格，交给 `text-autospace: normal`（浏览器支持时生效，不支持时无害）。
- 标题加 `text-wrap: balance`，正文加 `line-break: strict`，避免审计中 H1 末行只剩一个「館」字的情况。
- 书名中的全角空格（「周易正義　十四卷」）是原文的一部分，保留。可以在渲染时把书名按第一个全角空格拆成「书名」与「卷数等附记」两段，附记用 400 字重——只改变显示样式，不改变文字。
- 界面用语统一为日文，见 §6 用语表。

## 2. Color Tokens

### 2.1 色板

全部写成 DaisyUI 主题变量，定义在 `globals.css` 的 `chinese-classics` 主题里（主题名保留）。十六进制值仅供对照。

**底色与文字**

| 角色 | DaisyUI 变量 | OKLCH | Hex | 用途 |
| --- | --- | --- | --- | --- |
| Background（紙） | `--color-base-100` | `oklch(98% 0.005 85)` | `#faf8f5` | 页面背景、输入框背景 |
| Surface | `--color-base-200` | `oklch(95.5% 0.008 85)` | `#f3f0ea` | 页脚、筛选栏、表头、代码块、悬停行 |
| Border / Divider | `--color-base-300` | `oklch(89% 0.012 85)` | `#dedad2` | 分隔线、卡片边框（装饰性边界） |
| Text（墨） | `--color-base-content` | `oklch(22% 0.015 260)` | `#171b22` | 正文、标题 |
| Muted Text | `--color-muted`（自定义） | `oklch(46% 0.015 260)` | `#535861` | 辅助文字、占位说明、字段名 |
| Control Border | `--color-border-strong`（自定义） | `oklch(58% 0.015 260)` | `#757b83` | 输入框、下拉框、复选框、次要按钮的边框 |

**品牌与语义色**

| 角色 | DaisyUI 变量 | OKLCH | Hex | 用途 |
| --- | --- | --- | --- | --- |
| Primary（金） | `--color-primary` | `oklch(68% 0.15 85)` | `#c28f00` | **只作填充与线条**：主按钮底色、当前导航与 Tabs 的下划线。沿用现有主题的金色，色值不变 |
| Primary Content | `--color-primary-content` | `oklch(20% 0.03 85)` | `#1c1505` | 金色底上的文字 |
| Primary Text（古銅） | `--color-primary-text`（自定义） | `oklch(42% 0.085 80)` | `#654704` | 金色的文字版本：链接、Outline 按钮的文字 |
| Secondary（青磁） | `--color-secondary` | `oklch(42% 0.07 165)` | `#205943` | 保留色，组件默认不使用 |
| Accent（朱） | `--color-accent` | `oklch(50% 0.17 35)` | `#af2f09` | 点缀：站名旁的印记。不用于状态，不用于大面积 |
| Neutral（墨） | `--color-neutral` | `oklch(30% 0.015 260)` | `#292e36` | 深色底（如 tooltip） |
| Info | `--color-info` | `oklch(45% 0.09 235)` | `#0f5c80` | 提示信息 |
| Success | `--color-success` | `oklch(44% 0.10 150)` | `#206133` | 「閲覧可能」 |
| Warning | `--color-warning` | `oklch(48% 0.11 58)` | `#8a4b0b` | 「殘」、注意事项。色相比古銅偏橙，以免与链接色混淆 |
| Error | `--color-error` | `oklch(47% 0.18 20)` | `#a8112d` | 错误 |
| Highlight | `--color-mark`（自定义） | `oklch(90% 0.09 95)` | `#f0de99` | 检索命中的 `<mark>` 底色（浅金） |

除 `primary-content` 外，所有 `-content` 变量（`success-content` 等）统一为 `oklch(98% 0.005 85)`（`#faf8f5`）。

### 2.2 对比度（已计算）

按 WCAG 相对亮度公式由上表色值算出。

| 前景 | 在 base-100 上 | 在 base-200 上 | 浅色字在其上 | 在自身 8% 浅底上 |
| --- | --- | --- | --- | --- |
| Text | 16.34 | 15.19 | — | — |
| Muted Text | 6.73 | 6.25 | — | — |
| Primary Text（古銅） | 8.08 | 7.51 | 8.08 | 7.51 |
| Secondary | 7.70 | 7.15 | 7.70 | 7.16 |
| Accent | 6.15 | 5.72 | 6.15 | 5.74 |
| Info | 6.90 | 6.41 | 6.90 | 6.43 |
| Success | 7.00 | 6.50 | 7.00 | 6.52 |
| Warning | 6.40 | 5.94 | 6.40 | 5.97 |
| Error | 7.10 | 6.60 | 7.10 | 6.61 |
| Control Border | 4.04 | 3.76 | — | — |
| Text on Highlight | 12.89 | — | — | — |

金色（Primary）单独列出，因为它不满足文字对比度：

| 组合 | 对比度 | 结论 |
| --- | --- | --- |
| Primary Content 在 Primary 上（主按钮文字） | 6.23 | 可用 |
| Text（墨）在 Primary 上 | 5.95 | 可用 |
| Primary 在 base-100 上 | 2.74 | **不能作文字，也不能作为唯一的状态指示** |
| Primary 在 base-200 上 | 2.55 | 同上 |
| Primary Text（古銅）对 Primary | 2.94 | 不能用古銅在金色底上写字 |

- 所有文字用途的组合 ≥ 4.5:1；控件边框 ≥ 3:1（WCAG 1.4.11）。
- 金色对纸色背景不足 3:1，因此：主按钮靠深色文字标签识别；金色下划线表示「当前项」时必须同时加粗文字并设置 `aria-current`；焦点环不用金色（见 §5.1）。
- 「8% 浅底」一列是 DaisyUI `badge-soft` / `alert-soft` 的配色方式；该列数值是按线性混合估算的，实施时需在浏览器中复测。
- `base-300` 对背景只有 1.31:1，**只能用于装饰性分隔线**，不能作为输入框的唯一边界。

### 2.3 使用规则

- **语义色与古銅遵守同一条规则**：色值本身能作为文字放在纸色背景上，浅色字也能放在它上面。
- **金色是唯一的例外，职责明确分开**：`primary` 只作填充与线条，`primary-text`（古銅）只作文字。禁止 `text-primary`、`link-primary`、`border-primary` 作为输入框边界（审计 A2 的根源就是同一个金色身兼两职）。
- 金色的使用面积要小：一个视图里通常只有一个金色主按钮和一条当前项下划线。不用金色做大面积背景。
- 文字不使用透明度（`text-base-content/70` 等）。辅助文字一律用 `--color-muted`。两级文字色就够了。
- 颜色不单独传达信息：状态必须同时有文字（「閲覧可能」「準備中」「殘」）。
- 禁用状态不靠 `opacity` 整块变淡（审计 A2 中的 `opacity-75`），见 §5.2。
- 只有浅色主题。不做深色模式；`color-scheme: light` 保持。

## 3. Spacing & Layout

### 3.1 尺寸基准

恢复 DaisyUI 默认：`--size-selector: 0.25rem; --size-field: 0.25rem;`（审计 A1）。

| 控件 | 高度 | 说明 |
| --- | --- | --- |
| Button / Input / Select（默认） | 40px | 主要表单 |
| Button / Input / Select（`-sm`） | 32px | 工具栏、筛选栏、列表行内 |
| Checkbox | 20px | 必须包在 `<label>` 内，点击区域由整行标签提供（≥ 32px 高） |
| Badge | 20px（`badge-sm`） | 12px 文字 |
| 图标按钮 | 40×40px（移动端导航 44×44px） | |

所有可点击目标 ≥ 24×24px（WCAG 2.5.8）；主要操作 ≥ 32px。

### 3.2 间距

使用 Tailwind 的 4px 刻度，但只取下列档位：

| 档位 | 值 | 用途 |
| --- | --- | --- |
| `1` | 4px | 图标与文字、徽章之间 |
| `2` | 8px | 同组元素之间 |
| `3` | 12px | 列表行的上下内边距、表单项内部 |
| `4` | 16px | 卡片内边距、页面左右边距（移动端） |
| `6` | 24px | 组与组之间、页面左右边距（≥768px） |
| `8` | 32px | 页面标题下方、区块内部 |
| `12` | 48px | 区块之间 |
| `16` | 64px | 仅首页的大区块之间 |

规则：垂直节奏由父容器的 `gap` / `space-y` 决定，组件自身不带外边距（不写 `mb-*`）。

### 3.3 圆角、边框、阴影

| Token | 值 | |
| --- | --- | --- |
| `--radius-selector` | `0.125rem` | 徽章、复选框 |
| `--radius-field` | `0.25rem` | 按钮、输入框 |
| `--radius-box` | `0.25rem` | 卡片、面板、对话框 |
| `--border` | `1px` | |
| `--depth` | `0` | 关闭 DaisyUI 的立体效果 |
| `--noise` | `0` | |

阴影只有两级，且只用于浮层：

- `shadow-md`：下拉菜单、检索候补、tooltip
- `shadow-xl`：对话框

卡片、导航栏、统计块都不加阴影，用 1px 边框或背景色差区分。

### 3.4 内容宽度

| Token | 值 | 用于 |
| --- | --- | --- |
| `--width-page` | `72rem`（1152px） | 首页、书目列表 |
| `--width-prose` | `44rem`（704px，约 44 个全角字） | about、利用規約、404 |
| 全宽 | — | 阅读器 |

页面左右边距：`px-4`，≥768px 为 `px-6`。

### 3.5 页面骨架

```
<body>
  <a class="skip-link">本文へスキップ</a>
  <header>  站名 · <nav> 主导航 </nav> </header>
  <main id="main"> 页面内容 </main>
  <footer> … </footer>
</body>
```

- 页头高 56px，底部 1px `base-300` 边框，无阴影，背景 `base-100`。
- 每页以统一的 **PageHeader** 开头：`h1` + 可选的一行说明（`meta`，muted），上边距 32px，下边距 32px。
- 阅读器页是例外：见 §4.6。

### 3.6 响应式断点

沿用 Tailwind 默认值，不新增。

| 断点 | 宽度 | 变化 |
| --- | --- | --- |
| （默认） | < 640px | 单栏；书目行纵向堆叠；筛选收进对话框 |
| `sm` | ≥ 640px | 标题字号放大一级 |
| `md` | ≥ 768px | 主导航横排（现在是 `lg` 才横排）；书目行变为多列 |
| `lg` | ≥ 1024px | 书目页出现左侧筛选栏（264px） |
| `xl` | ≥ 1280px | 不再变化，内容在 `--width-page` 内居中 |

## 4. Component Standards

全部用现有的 Tailwind + DaisyUI 类实现，封装成 `src/components/` 下的 React 组件。下文的类名是实现建议。

### 4.1 Button

| 变体 | 类 | 用途 | 每个视图的数量 |
| --- | --- | --- | --- |
| Primary | `btn btn-primary`（金底、深色字 6.23:1） | 页面的主要动作（「閲覧」「漢籍一覧へ」） | 每个上下文最多一个 |
| Secondary | `btn btn-outline`（边框用 `--color-border-strong`，文字墨色） | 次要动作（「条件をクリア」、分页） | |
| Ghost | `btn btn-ghost` | 工具栏、图标按钮、「戻る」 | |
| Link | `link` + 古銅色（`--color-primary-text`），始终带下划线 | 行内链接、外链 | |

- 尺寸只有默认（40px）与 `btn-sm`（32px）。不使用 `btn-lg`、`btn-xs`。
- 文案是动词或目的地，不加装饰箭头。
- 图标按钮必须有 `aria-label`；SVG 加 `aria-hidden="true"`。
- 导航用 `<a>`（`next/link`），动作用 `<button type="button">`，不混用。
- 危险色按钮本项目没有用例；「クリア」是 Secondary，不是红色（审计 A4）。

### 4.2 Input / Select / Checkbox

统一用 **Field** 组件包装：

```
<div class="field">
  <label for="…">   label 字号，700，muted 色
  <input | select>  ui 字号，边框 --color-border-strong
  <p id="…-hint">   meta 字号，muted（可选，经 aria-describedby 关联）
</div>
```

- **每个控件都有可编程关联的 label**（`htmlFor`/`id`）；视觉上不需要标签的（如排序下拉框）用 `sr-only` 标签（审计 E1）。
- 边框 1px `--color-border-strong`，背景 `base-100`，圆角 `--radius-field`。
- 占位文字只作示例，不能代替标签；颜色用 muted。
- 检索框：左侧放检索图标，沿用现有的 combobox 行为与 IME 处理（`search-box.tsx` 的逻辑不变）。候补行的结构为「书名（可截断）＋ ID」，「閲覧可能」用一个小圆点加 `sr-only` 文字，匹配方式（異体字／拼音）移到第二行（审计 D5）。
- 复选框与文字包在同一个 `<label>` 里，整行可点。

### 4.3 Card

卡片**不再是默认容器**。使用场景只有：

| 场景 | 样式 |
| --- | --- |
| 提示卡（404、阅读器缺 ID／准备中） | `base-100` 背景，1px `base-300` 边框，内边距 24px，无阴影 |
| 首页的推荐书目 | 同上；内容结构与 BookRow 相同 |

规则：

- 无阴影、无悬停位移、无整卡变色。
- 如果整张卡是一个目的地，就让整张卡是一个链接（标题链接用 `::after` 铺满卡片），悬停时只有标题出现下划线。卡片内有第二个链接（如「全国漢籍DB」）时，不做整卡链接。
- 分类入口不用卡片，用列表（见 §4.11）。
- 统计数字不用卡片，用一行定义列表（见 §4.11）。

### 4.4 Table 与 BookRow（书目列表）

书目列表从卡片网格改为**行列表**。这是数据密度最高、最符合「目录」性质的形式；现有卡片上的全部字段都保留。

**BookRow 的字段与层级**

| 层级 | 内容 | 样式 |
| --- | --- | --- |
| 1 | 书名（可阅读时是指向阅读器的链接） | `title`：serif 700 17px |
| 2 | 著者 · 朝代 · 版本类型 · 卷数 | `ui` 14px，项与项之间用「·」或固定列 |
| 3 | 出版事项（`publicationInfo`） | `meta` 13px，muted，最多两行 |
| 侧 | 分类 · ID | `meta`，muted；ID 用 mono |
| 侧 | 状态与属性：閲覧可能／準備中、印あり、注あり、殘 | 徽章，见 §4.9 |
| 侧 | 操作：「閲覧」、全国漢籍DB（外链） | Primary `btn-sm`、Link |

**布局**

- `< md`：纵向堆叠，行与行之间 1px 分隔线，行内边距 12px 0。
- `≥ md`：语义上使用 `<table>`（`<caption class="sr-only">`、`<th scope="col">`），列为：书名与出版事项 ｜ 著者 ｜ 朝代 ｜ 版本 ｜ 分类 ｜ 状态与操作。表头 `label` 字号、`base-200` 背景、吸顶。
- 行悬停：背景变为 `base-200`。不做其他效果。
- 不使用斑马纹（已有分隔线）。
- 未公开的书：不降低整行不透明度；书名不是链接，状态列显示「準備中」文字。
- 检索命中的匹配方式（「異体字で一致」「拼音で一致」）作为 muted 文字放在第 3 层末尾，不用徽章。

**通用 Table 规范**（供今后的卷册目录等使用）：DaisyUI `table table-sm`；数字列右对齐、`tabular-nums`；文字列左对齐；窄屏下要么横向滚动（容器加 `tabindex="0"` 与 `aria-label`），要么改为堆叠，不能截掉列。

**分页**：每页 50 部。分页条用 `join` + Secondary 按钮，包含「前へ／次へ」与页码，当前页 `aria-current="page"`；页码写入 URL（`?p=`）。结果区顶部显示「335 件中 1–50 件」。

### 4.5 Dialog

- 用原生 `<dialog>` + DaisyUI `modal`，由 `showModal()` 打开（自带焦点陷阱、Esc 关闭、背景 inert）。
- 结构：标题（`h2`）＋ 内容 ＋ 底部操作区；右上角关闭按钮带 `aria-label="閉じる"`；`aria-labelledby` 指向标题。
- 关闭后焦点回到触发按钮。
- 宽度 `max-w-md`；`< sm` 时从底部滑出并占满宽度（`modal-bottom sm:modal-middle`）。
- 当前唯一用例：`< lg` 时的**筛选面板**（按钮「絞り込み（n）」打开，n 为生效条件数）。对话框底部固定「n 件を表示」按钮。
- 不用对话框做确认或提示；本项目没有破坏性操作。

### 4.6 Navigation

**站点页头**

- 左：站名（serif 700 18px，墨色，链接到 `/`）。移动端不缩写成「東IIIF」，改为较小字号显示全称。
- 右：`<nav aria-label="メイン">`，四个链接，`ui` 字号。
- 当前页：`aria-current="page"`，文字墨色 700，下方 2px 金色下划线。非当前页：墨色 400，悬停出现下划线。
- `≥ md` 横排；`< md` 用现有的 `<details>` 菜单，按钮 44×44px，菜单项高 44px。

**阅读器页头**（替换现有的三层栏，审计 C4）

一条 48px 的工具栏：

```
[← 漢籍一覧]  書名（serif，截断）· 著者（muted）        [IIIF マニフェスト ↗]  [書誌情報]
```

- 站点主导航在阅读器页不显示，由「← 漢籍一覧」与站名链接代替；页脚也不显示。
- Tify 占满 `100dvh - 48px`，由布局（flex）决定高度，不写固定像素。
- `<h1>` 是书名（工具栏里）；Tify 内部的标题不再是页面上第二个 `<h1>`——是否可行取决于 Tify 分支的选项，见重构计划的风险项。
- 「書誌情報」打开一个 Dialog，显示著者、朝代、版本、出版事项、分类、ID、全国漢籍DB 链接、manifest URL（带复制按钮）。

**面包屑**：只有两层的站点不需要。

**页脚**：`base-200` 背景，两栏（`< md` 单栏）：左侧站名、提供机构、许可；右侧链接。`meta` 字号。无图标。

### 4.7 Tabs

- 当前没有必须用 Tabs 的地方。为保持一致，预先规定：DaisyUI `tabs tabs-border`，当前项墨色 700 + 2px 金色下划线（与导航一致）。
- 实现为 `role="tablist"` / `tab` / `tabpanel`，方向键切换，`aria-selected`。
- 只用于同一对象的并列视图（例如将来的「書誌／巻冊」）。**不用 Tabs 做筛选**（筛选用表单控件，状态进 URL）。

### 4.8 Tooltip

- 只作为**图标按钮的补充说明**，内容必须同时存在于 `aria-label`。不放任何只有 tooltip 里才有的信息。
- 实现用 DaisyUI `tooltip`（纯 CSS），并保证键盘聚焦时也显示。
- 被截断的书名用原生 `title` 属性给出全文，不另做 tooltip。
- 触屏上 tooltip 不可用，所以带文字的按钮优先于图标按钮。

### 4.9 Badge

| 类型 | 样式 | 例 |
| --- | --- | --- |
| 状态（可用） | `badge badge-sm badge-soft badge-success` | 閲覧可能 |
| 状态（注意） | `badge badge-sm badge-soft badge-warning` | 殘 |
| 属性 | `badge badge-sm badge-outline`（边框 `base-300`，文字 muted） | 印あり、注あり |

- 高 20px，12px 文字。
- **分类、朝代、版本不再是徽章**，是普通的著录文字（审计 A4：一张卡上 6 种徽章样式）。
- 「準備中」是 muted 文字，不是徽章也不是按钮（审计 D2）。
- 版本类型为 `unknown` 时不显示（与首页现有做法一致），不显示「未知」。

### 4.10 Empty / Loading / Error

统一用 **Notice** 组件：标题（`h2`）＋ 一句说明（muted）＋ 最多两个操作。无大图标、无彩色底。

| 状态 | 位置 | 内容 |
| --- | --- | --- |
| Empty | 书目列表无结果 | 「条件に一致する漢籍はありません」＋ 当前条件摘要 ＋「条件をクリア」（Secondary）。检索词为拼音或可能有异体字时，提示可尝试的写法 |
| Loading | `/books` 的 Suspense fallback | 骨架：6 行灰色占位（`base-200` 色块，无动画或仅在 `prefers-reduced-motion: no-preference` 时轻微脉动） |
| Loading | 阅读器 | Tify 容器内居中显示「画像を読み込んでいます…」，`role="status"`；替换现在的裸文本「IIIF Viewer」 |
| Error | 阅读器缺 ID／书未公开 | Notice：说明原因 ＋「漢籍一覧へ」 |
| Error | 404 | Notice：「ページが見つかりません」＋「漢籍一覧へ」「ホームへ」 |
| Error | 运行时错误（新增 `error.tsx`） | Notice：「表示中に問題が発生しました」＋「再読み込み」 |
| Error | manifest／图像服务失败 | 阅读器内 Notice：说明图像服务暂时不可用 ＋ 重试 |

错误标题用墨色，不用整块红色；`error` 色只用于一个小的状态标记或左侧 3px 边线。

### 4.11 目录页特有的版式

**PageHeader**：见 §3.5。

**统计行**（替换首页与 about 的 stat 卡）：一个 `<dl>`，横排，数字 serif 700 24px 墨色、`tabular-nums`，名称 `meta` muted。统一口径与用语：「収録 335 部」「うち閲覧可能 n 部」「巻冊 2,488」「画像 111,247 枚」。

**分类索引**（替换首页的十张图标卡）：两个并列的列表「四部分類」「文庫」，每行为「分类名（链接，serif）……部数（右对齐，tabular-nums，muted）」，像书的目次。`≥ md` 两栏并排。

**生效条件条**：结果区顶部，把当前的筛选条件显示为可移除的标签（「分類：經部 ×」），末尾「すべてクリア」。

**外链**：文字后加一个 12px 的外链图标（`aria-hidden`）并附 `sr-only`「（新しいタブで開く）」。

### 4.12 图标

- 保留的图标：检索、菜单、关闭、返回箭头、外链、排序方向、展开箭头、复制。共 8 个左右。
- 集中在一个 `Icon` 组件（内联 SVG，`aria-hidden="true"`，`1.5` 线宽，`currentColor`），不引入图标库。
- 尺寸 16px（行内）或 20px（按钮内）。

## 5. Interaction

### 5.1 状态

| 状态 | 规则 |
| --- | --- |
| Hover | 导航与书名链接：出现下划线。行内链接：下划线加粗。按钮：背景加深一档（DaisyUI 默认；金色主按钮加深后文字对比度约 5.1:1）。列表行：背景 `base-200`。**不使用位移、放大、阴影变化** |
| Focus | 统一的焦点环：`outline: 2px solid var(--color-base-content); outline-offset: 2px;`，通过 `:focus-visible` 全局应用于链接、按钮、表单控件、`summary`、`[tabindex]`。用墨色而不是金色：墨色对背景 16.34:1，金色只有 2.74:1。不允许 `outline: none` 而无替代 |
| Active | 按钮背景再深一档；不缩放（关闭 DaisyUI 的按压动画） |
| Selected / Current | 墨色 700 ＋ 金色下划线（导航、Tabs）；`aria-current` / `aria-selected` |
| Disabled | 使用真正的 `disabled` 属性；样式为 `base-200` 背景、muted 文字、无边框强调。不可用且无法变为可用的东西（「準備中」）不做成按钮 |
| Loading | 按钮内不放转圈图标；整块内容用骨架或 `role="status"` 文字 |

### 5.2 禁用与不可用

- 不用 `opacity` 让整块内容变淡。未公开的书与已公开的书用相同的文字对比度，区别在于：书名不是链接、状态显示「準備中」。
- 列表顶部的「閲覧可能のみ」复选框是区分二者的主要手段。

### 5.3 Transitions

- 只对 `background-color`、`color`、`border-color`、`opacity` 做过渡，时长 150ms，`ease-out`。
- 浮层（下拉、对话框）淡入 150ms；不做滑动、缩放。
- 全局加入：

  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
  ```

### 5.4 键盘

| 场景 | 行为 |
| --- | --- |
| 全站 | Tab 顺序与视觉顺序一致；第一个可聚焦元素是「本文へスキップ」 |
| 导航菜单（移动端） | Enter/Space 开合；Esc 关闭并把焦点还给按钮 |
| 检索 combobox | 现有行为保留：↑↓ 移动、Enter 选择、Esc 关闭、IME 变换中不响应 |
| 书目列表 | 每行的可聚焦元素：书名链接 →（全国漢籍DB）。「閲覧」按钮与书名指向同一目的地时，按钮加 `tabindex="-1"` 与 `aria-hidden`，避免每行停两次 |
| 分页 | 普通链接，Tab 到达 |
| Dialog | 打开时焦点进入对话框；Tab 在内部循环；Esc 关闭；关闭后焦点回到触发按钮 |
| Tabs | ←→ 切换，Home/End 到首尾，Tab 进入面板 |
| 阅读器 | 工具栏在 Tify 之前；Tify 内部的键盘操作由 Tify 负责 |

### 5.5 可访问性基线（WCAG 2.2 AA）

- 文字对比度 ≥ 4.5:1，大字与界面图形 ≥ 3:1（§2.2）
- 目标尺寸 ≥ 24×24px（§3.1）
- 地标：`header`、`nav`（带 `aria-label`）、`main`、`footer`；跳转链接
- 每页唯一的 `<h1>` 与独立的 `<title>`（「書名 | 站名」「漢籍一覧 | 站名」）
- 表单控件都有标签；说明文字用 `aria-describedby`
- 结果数变化通过 `aria-live="polite"` 区域通知（「12 件」）
- 装饰性 SVG `aria-hidden`
- 200% 缩放与 320px 宽度下无横向滚动（阅读器画布除外）

## 6. 界面用语表（日文）

审计 C2 的统一方案。实施时把这些字符串集中到一个常量文件，首页与书目页共用。

| 概念 | 统一写法 | 现有的其他写法（废止） |
| --- | --- | --- |
| 著者 | 著者 | 作者 |
| 阅读（按钮） | 閲覧 | 閱覽 |
| 可阅读 | 閲覧可能 | — |
| 未公开 | 準備中 | — |
| 卷数 | 巻数 | 卷數 |
| 有印记 | 印あり | 印有、有印 |
| 有批注 | 注あり | 注有、有註 |
| 残本 | 殘 | —（原文用字，保留） |
| 分类 | 分類 | — |
| 朝代 | 時代 | 朝代（待确认，见 §7） |
| 版本类型 | 版種 | 版本類型（待确认，见 §7） |
| 全部（筛选项） | すべて | 全部分類、全部朝代、全部類型 |
| 筛选 | 絞り込み | フィルタリング |
| 清除 | 条件をクリア | クリア |
| 结果数 | n 件 | 合計： n 項目 |
| 排序 | 並び順：関連度／書名／分類／時代 | 関連度順 等 |
| 检索 | 検索 | — |

书目数据本身（书名、著者名、出版事项、分类名、朝代名、`bookTypeLabel` 的值）是原文，不在统一范围内。`bookTypeLabel`（`src/lib/book-type.ts`）中 `unknown` 的显示名「未知」属于界面用语，改为不显示。

## 7. 待决事项

需要项目负责人确认，不影响开始实施第一阶段：

| # | 事项 | 建议 | 现状 |
| --- | --- | --- | --- |
| 1 | 站名：「東方学IIIF図書館」／「東方學デジタル圖書館」／「…Ver.IIIF」三者统一成哪个 | 以 `data/site.yaml` 的 `title` 为唯一来源，页面从数据读取 | **已决定（2026-11-10）：「東方学IIIF図書館」。** 界面用 `src/lib/ui-text.ts` 的 `SITE_NAME`；`data/site.yaml`、README、AGENTS.md 已同步。about 正文中的「東方學デジタル圖書館」指原站，保留 |
| 2 | 「朝代」「版本類型」的日文界面用语 | 「時代」「版種」；若本馆惯用其他说法以惯用为准 | **已决定（2026-11-10）：采用「時代」「版種」** |
| 3 | 书名等原文字段是否标 `lang="zh-Hant"` | 先不标；挑 10 个含旧字形的书名在三个系统上比较后再定 | 未标，未比较 |
| 4 | 书目列表每页件数 | 50 | **已决定（2026-11-10）：50** |
| 5 | 阅读器页是否隐藏站点主导航与页脚 | 隐藏，换成 48px 工具栏 | 已按建议实施 |
| 6 | 首页是否保留「随机 6 部」 | 保留，标题改为「所蔵より」，去掉「おすすめ」 | 已按建议实施；「プラットフォームの特色」已删除 |
| 7 | 主色 | **已决定（2026-11-10）：保留金色。** 金色只作填充与线条，文字用古銅色 `--color-primary-text`，焦点环用墨色（§2） | 已实施 |

## 8. Token 汇总（实施时写入 `globals.css`）

```css
@plugin "daisyui/theme" {
  name: "chinese-classics";
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-base-100: oklch(98% 0.005 85);
  --color-base-200: oklch(95.5% 0.008 85);
  --color-base-300: oklch(89% 0.012 85);
  --color-base-content: oklch(22% 0.015 260);

  --color-primary: oklch(68% 0.15 85);
  --color-primary-content: oklch(20% 0.03 85);
  --color-secondary: oklch(42% 0.07 165);
  --color-secondary-content: oklch(98% 0.005 85);
  --color-accent: oklch(50% 0.17 35);
  --color-accent-content: oklch(98% 0.005 85);
  --color-neutral: oklch(30% 0.015 260);
  --color-neutral-content: oklch(98% 0.005 85);

  --color-info: oklch(45% 0.09 235);
  --color-info-content: oklch(98% 0.005 85);
  --color-success: oklch(44% 0.10 150);
  --color-success-content: oklch(98% 0.005 85);
  --color-warning: oklch(48% 0.11 58);
  --color-warning-content: oklch(98% 0.005 85);
  --color-error: oklch(47% 0.18 20);
  --color-error-content: oklch(98% 0.005 85);

  --radius-selector: 0.125rem;
  --radius-field: 0.25rem;
  --radius-box: 0.25rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

@theme {
  --font-sans: "Helvetica Neue", "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    "Yu Gothic UI", "Meiryo", "Noto Sans CJK JP", "Noto Sans JP", system-ui, sans-serif;
  --font-serif: "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif CJK JP",
    "Noto Serif JP", "Source Han Serif JP", "Songti TC", "PMingLiU", "HanaMinA", "HanaMinB", serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Noto Sans Mono CJK JP", monospace;

  --color-primary-text: oklch(42% 0.085 80);
  --color-muted: oklch(46% 0.015 260);
  --color-border-strong: oklch(58% 0.015 260);
  --color-mark: oklch(90% 0.09 95);

  --container-page: 72rem;
  --container-prose: 44rem;
}
```

以上是提案的写法，`@theme` 中自定义变量生成的工具类名（`text-muted`、`border-border-strong`、`max-w-page` 等）需在实施时按 Tailwind 4 的实际行为确认。
