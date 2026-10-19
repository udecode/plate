# Fix: table row drag handle covers paragraph drag handle

Status: executed

实测结论：行把手实际渲染宽度是 26px，不是 16px。outline 变体的 `has-[>svg]:px-3` 优先级高于 `p-0`，给按钮加了左右各 12px 内边距，所以按钮伸进第一个单元格 18px，盖住了段落把手所在的 12px 区域。修复见 Fix direction，额外加了 `has-[>svg]:px-0`。

第二轮（行把手拖不动）：表格块自己的 gutter（`editor-gutterLeft`，22px，`z-50`，透明但可命中）覆盖整个控制列。拖动开始后行带上 `data-editor-dragging:opacity-50`，opacity 让行形成层叠上下文，行把手的 `z-51` 被困在行内，gutter 盖住拖动起点，Chrome 于是在 dragstart 后立即 dragend。旧把手 26px 宽，图标在 gutter 之外，所以以前能拖。修复：

- 拖动时半透明改加在除控制列以外的单元格上
- 控制列 `<td>` 加 `z-51`，整列高于表格 gutter
- 去掉第一列左边缘的列宽 resize 手柄（`column-start`）及其 `'left'` 方向和 `marginLeft` 覆盖逻辑
- 控制列从 8px 加宽到 16px（`TABLE_CONTROL_COLUMN_WIDTH`、`-ml-4`），行把手 `w-4`；数据单元格起点不变

## Problem

表格行拖拽把手（`RowDragHandle`）hover 整行任意位置都会显示，并且盖住第一列单元格内段落的拖拽把手，导致第一列单元格里的段落无法拖动。

期望行为：

- hover 段落时显示段落把手，可拖动该段落
- 只有 hover 表格左边框（控制列）时才显示行把手，行把手更小
- 两个把手的可点击区域不重叠

## Source owner

| 文件 | 作用 |
| --- | --- |
| `apps/www/src/registry/components/editor/table.tsx:782-819` | `TableRowElement`，控制列 `<td>` 和行 hover 规则 |
| `apps/www/src/registry/components/editor/table.tsx:821-880` | `RowDragHandle` 和它的操作菜单 |
| `apps/www/src/registry/components/editor/dnd.tsx:157-289` | `Draggable` 和 `Gutter`（段落把手） |

`templates/plate-playground-template/**` 是 CI 生成的 v53 副本（`platejs ^53.2.1`），按 `AGENTS.md` 不能手改，`www` dev server 也不渲染它。下面的失败尝试全都改在这个模板副本上，这很可能就是每次"还是不行"的原因：改动根本没到运行中的页面。改完 registry 源码后运行 `pnpm --filter www build:registry`，模板交给 CI 重新生成。

复现路径：`www` dev server 上任意带表格的 editor 页面（具体路由待确认），在第一列单元格里放一个段落，hover 该段落。

## Current code (`next`)

```
div.relative.w-fit                      ← table.tsx:367，最近的 positioned 祖先之一
  table
    tr.group/row                        ← hover:[&>td>.editor-row-drag-handle]:opacity-100
      td (w-2, p-0, 无 relative)        ← 控制列，8px
        Button.editor-row-drag-handle   ← absolute left-0 top-1/2, w-4 (16px), z-51
      td.relative (数据单元格)           ← table.tsx:917
        div.relative.z-20.px-3.py-2     ← table.tsx:941
          div.editor-draggable.relative ← dnd.tsx:185
            div.editor-gutterLeft       ← -translate-x-full absolute, 单元格内 w-3 (12px), z-50
            div.editor-blockWrapper
```

### Root causes

1. **触发范围是整行**：`tr` 上的 `hover:[&>td>.editor-row-drag-handle]:opacity-100` 让 hover 行内任意位置都显示行把手。
2. **hit area 重叠**：行把手 16px 宽，控制列只有 8px，按钮溢出 8px 盖进第一个数据单元格。段落 gutter 位于段落左侧 12px（单元格的 `px-3` 区域），两者在第一个单元格左边缘重叠，行把手 `z-51` 高于 gutter 的 `z-50`，于是盖住它。
3. **containing block 未确认**：控制列 `<td>` 没有 `relative`，按钮的 `absolute` 定位基准可能是 `tr` 或 `div.relative.w-fit`。需要 DevTools 确认（见 Diagnosis）。

模板副本里的"表格内不渲染 gutter"（`!isInTable`）在 `next` 上不存在：`dnd.tsx` 在单元格里照常渲染 gutter，只在有表格单元格选区时隐藏（`dnd.tsx:203`）。

### Hover 语义

CSS `:hover` 和 `mouseenter` 都以 DOM 树为准，不以几何位置为准。指针进入一个溢出父级边界的 absolute 子元素时，父级同样进入 `:hover`，也会收到 `mouseenter`。所以只要按钮溢出到单元格上方，无论触发源换成控制列 `<td>` 的 CSS hover 还是 JS 事件，hover 溢出部分都会让控制列被视为 hovered，行把手保持可见，并继续盖住段落把手。修复必须消除溢出，换触发机制解决不了。

## Failed approaches (all in the template copy)

这些尝试全部改在 `templates/.../table-node.tsx`，没有一次在运行中的 `www` 页面上验证过，所以它们的失败不能当作对 `next` 代码的证据。仍记录如下，因为其中的机制分析对 registry 源码同样适用。

| # | 改法 | 失败原因 |
| --- | --- | --- |
| 1 | 行把手 `z-51` 改 `z-49` | 用户否定方向：要的是行把手缩小、只在左边框 hover 时显示 |
| 2 | 触发源改为控制列 `<td>` 的 `group-hover/rowControl` | 按钮溢出，hover 溢出部分让 `<td>` 进入 `:hover`，见上文 Hover 语义 |
| 3 | 控制列 `<td>` 加 `relative` | 只改变定位基准，按钮宽度不变，仍然溢出；模板里还把 `RowDropLine` 限制在了 8px 内（`next` 上没有这个兄弟元素） |
| 4 | 包一层 `div.relative.h-full.overflow-hidden` | 表格单元格里子元素的 `h-full` 不可靠，wrapper 高度可能为 0 |
| 5 | 按钮默认 `pointer-events-none`，hover 时 `pointer-events-auto` | hover 控制列后按钮变为 `auto`，溢出部分再次维持 hover；而且改动不在运行页面上 |
| 6 | JS `onMouseEnter`/`onMouseLeave` 控制 state | 进入溢出子元素会触发父级 `mouseenter`，同样维持 hover；而且改动不在运行页面上 |

## Diagnosis (before editing)

在 `www` dev server 上用 DevTools 确认：

1. 控制列 `<td>` 的实际 computed width 是否为 8px。
2. 行把手按钮的 `offsetParent` 是谁。
3. 第一列单元格中，行把手按钮和段落 gutter 按钮的 `getBoundingClientRect()`，确认重叠区间。
4. `div.relative.w-fit` 左侧有没有可用的外边距，用来放置向表格外侧伸出的 hit area。

## Fix direction

一个方向，一处改动（`table.tsx`），段落把手不改：

1. 控制列 `<td>` 加 `relative`，让行把手以控制列为定位基准，`top-1/2` 相对行高计算。
2. 行把手缩小到不越过控制列右边缘：宽度 ≤ 8px（如 `w-2`），或右对齐到控制列（`right-0`）并向表格外侧（左侧）延伸，绝不向右伸进数据单元格。延伸量取决于 Diagnosis 第 4 步。
3. 触发源从 `tr` 的 hover 改为控制列 `<td>` 自身的 hover（例如 `[&:hover>.editor-row-drag-handle]:opacity-100`），保留 `data-[table-resizing=true]` 隐藏和触屏选中时显示的规则。
4. 操作菜单 `HandleActionsMenu` 的 `className` 同步改成新的位置和尺寸。

步骤 2 先于步骤 3 生效：没有溢出，控制列 hover 才等于"hover 左边框"。

## Completion criteria

在 `www` dev server 的真实浏览器里验证（`verify` skill），记录 model 和 DOM 证据：

证据来自 headless Chromium（Playwright）打开 `www` dev server `http://localhost:3000/` 首页的对比表格。Chrome 扩展未连接，所以没有在有界面的浏览器里手动验证。

- [x] hover 第一列单元格的段落内容：段落把手出现，行把手不出现。证据：行把手 opacity `0`，gutter opacity `1`；在 gutter 中心 `elementFromPoint` 命中 "Drag block"（修复前命中 "Drag row or open row actions"）
- [x] 拖动第一列单元格段落把手，把段落移到另一个单元格：段落移动，表格行顺序不变。证据："AI" 从第 2 行第一个单元格移到第 3 行第二个单元格，行顺序不变
- [x] hover 控制列：行把手出现（opacity `1`，命中行把手，宽 16px，`offsetParent` 为 `TD`）；真实鼠标拖动行把手重排行。证据：dragstart 后收到 `pointercancel`，不再立即 `dragend`；行顺序从 AI, Comments 变为 Comments, AI。对照：注入 `tr[data-editor-dragging]{opacity:1}` 前，dragstart 后起点命中表格 gutter，拖动被取消
- [x] 第一列左边缘不再有列宽 resize 手柄。证据：`[data-table-resize-handle=column-start]` 数量 0，`column-end` 24
- [x] 点击行把手打开行操作菜单，Move down 生效。证据：行顺序从 AI, Comments 变为 Comments, AI
- [x] 段落拖动后继续输入落在被移动的段落里，undo 恢复。证据：输入 "Z" 替换了被选中的已移动段落；两次 undo 恢复原表格
- [x] 列宽调整中行把手隐藏：skip: 这条规则没有改动
- [x] 触屏（`hover: none`）选中行时行把手仍然显示：skip: 这条规则没有改动
- [x] `pnpm --filter www build:registry` 已运行，`apps/www/public/r/table.json` 和 `dnd.json` 已更新
- [x] `pnpm exec ultracite check` 和 `pnpm exec oxlint` 对 `dnd.tsx`、`table.tsx` exit 0

## Follow-ups in `dnd.tsx`

- 表格块的把手在指针位于表格内任意位置时保持显示（CSS `:hover`），不再因单元格内段落把手出现而闪烁。跨单元格文字选区时仍隐藏全部把手，保留 `dnd.spec.tsx` 的约定。
- 段落把手的 tooltip 加 `hideWhenDetached`：嵌套 gutter `display:none` 后触发器落在 0,0，tooltip 不再在左上角显示。

## Final proof

`docs/plans/artifacts/2026-10-04-table-row-drag-handle-conflict/final.cjs`，headless Chromium 对 `www` dev server（`localhost:3000`，cwd `apps/www`）热启动连跑 5 次，每次 7 项全部 PASS：段落把手不被遮挡、tooltip 不在左上角可见、控制列显示行把手、表格把手在表格内常驻、段落拖动移动块且行序不变、undo 恢复、真实鼠标行拖动重排行。

`bun tooling/scripts/test-suite.mjs fast` 跑 `dnd.spec.tsx`、`table-node-selection.spec.tsx`、`table-toolbar-button.spec.tsx`：gap: 三个文件都在加载阶段失败（`@/lib/utils`、`@/registry/components/editor/editor`、`plitejs/internal` 无法解析），没有执行任何用例，是环境问题，不证明通过或失败。

复现路由：`www` 首页 `/` 的 "How Plate Compares" 表格。
