---
review_scopes: [suggestions, authored, comments]
review_basis: []
work_kind: implementation
---

# Suggestion 最终行为：修订按 Google，编辑按行业通用，卡片读当前内容

Status: closed for now: owner chose to deliver as is; changes stay uncommitted for the owner to commit
Playbook: plan
Page: https://claude.ai/artifact/Gcd9LP7QxTS1psbsqRGDV4

本计划承接 `95eeaf92b7` 与 `6efd9bf87c` 的审查结论和 2026-10-07 对九个编辑器的对照调研，确定编辑模式（Editing）与修订模式（Suggesting）的最终行为，并给出实现、测试与性能门槛。实现以 `6efd9bf87c` 为基础做减法：原型 P5 证明，编辑模式在待审新增内直接输入依赖该版本的 `isolate`、`independent` 与 rebase 机制。

证据路径中的 `scratch-build` 指构建会话的临时目录，`scratch-review` 指评审会话的临时目录，两者均不随仓库提交。

## Brief

### What did you find?

阶段零至三已实现。第二轮修复 Open work 1 与 16 的五项；Open work 4 两次尝试未成功，根因已更正。正式评审三轮，采纳 critical 4 项，各有在修复前代码上失败的用例。plitejs、yjs、platejs 与 www 套件通过；Chromium 未重跑。

### What will change?

删除线交互按 OnlyOffice：光标可进入并逐字移动，删除线内输入把它拆开，修订模式 Backspace 逐字跨过删除线；卡片读取当前内容；被其他建议依赖的建议拒绝时返回 blocked。翻页结果新增 `documentId`。删除线部分见 `2026-10-07-struck-text-onlyoffice-caret.md`。

### What do you need from me?

仍需在设备上核对移动端输入法与首页拖放。

### What happens if I say go?

按所有者已选的交付方式，改动保留在工作区，由所有者提交；不提交、不推送。

### What could go wrong?

大文档打字已与 `next` 持平（见 `2026-10-07-markup-caret-model-selection.md`）；跨格式边界删除后回车仍会拆分删除线；400 键后拒绝约 600ms；移动端输入法未验证。

## What other editors do

证据来自 2026-10-07 调研，原始矩阵含引用与行号，保存在本地临时目录。Word 多为推断；Google Docs 编辑模式无一手证据。

| 行为 | Google Docs | Word / LibreOffice | OnlyOffice / Overleaf | CKEditor / Tiptap | 采用 |
| --- | --- | --- | --- | --- | --- |
| 编辑模式在建议内输入 | 未知 | 普通正文，拆开原建议（LibreOffice 源码） | 同左（源码） | 同左（文档写明） | 普通正文 |
| 编辑模式删除建议内容 | 未知 | 真删 | 真删 | 真删 | 真删 |
| 修订模式删他人新增 | 嵌套删除 | LibreOffice 叠加删除 | OnlyOffice 嵌套；Overleaf 直接删 | Tiptap 嵌套 | 叠加删除建议 |
| 修订模式在删除线内输入 | 并入删除（`brXavo`） | 拆开删除线并另起新增 | OnlyOffice 拆开 | prosemirror-suggest-changes 移到删除线末尾 | 移到删除线边缘；现为拆开删除线并另起新增（现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`） |
| 删除线右侧 Backspace | 删除向左延伸 | 跨过 | OnlyOffice 跨过 | 跨过 | 跨过并并入相邻本人删除；现为逐字跨过（现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`） |
| 连续删除分组 | 按位置，无时间窗 | LibreOffice 1 分钟窗 | 按位置 | Tiptap 0.8.0 去掉超时 | 按位置，同作者同类 |
| 修订模式格式 | 格式建议 | 格式修订 | OnlyOffice 格式修订 | 属性建议，旧值→新值 | 格式建议 |
| 卡片内容 | 当前内容 | 当前内容 | 当前内容 | 当前内容 | 当前内容 |
| 替换卡片 | 一张 | LibreOffice 两条 | Overleaf 一张 | 一张 | 一张 |

## Public API

`details().original` 删除，卡片与导出读取 `details().parts`。

```ts before
// content/docs/(guides)/authored-changes.mdx
const detail = authored.read.details(changeId);
const original = detail.original;
```

```ts after
// content/docs/(guides)/authored-changes.mdx
const detail = authored.read.details(changeId);
const parts = detail.parts;
```

`automaticFormatting` 删除，修订模式下的格式一律成为格式建议。

```ts before
// packages/platejs/src/authored/PlateAuthoredPlugin.ts
automaticFormatting: 'edit',
```

```ts after
```

翻页结果携带 `documentId`；来自已替换文档的游标从第一页开始，来自其他查询条件的游标抛错。界面不再借空选区读取文档标识。

```ts before
// apps/www/src/registry/components/editor/comment-toolbar-button.tsx
const { documentId } = authored.read.select({ ids: [] });
```

```ts after
// apps/www/src/registry/components/editor/comment-toolbar-button.tsx
const page = authored.read.changes({ proposals: true, limit: PAGE_SIZE, cursor });
const cursors = paging.documentId === page.documentId ? paging.cursors : [];
```

## Layer and owner

| Concern | Owner | 本计划的变化 |
| --- | --- | --- |
| 建议身份、依赖、留存内容 | Plite `authored/state.ts` 的 authored 图 | 删除 `record.original`、`refreshOriginal` 及其解码兼容；保留 `independent`、`insertedContent`、`boundaries`、`directFormatting` |
| 编辑模式直接文字 | `isolate.ts`、`independent` 与 `decisions.ts` rebase | 保留；只有直接编辑与删除线内编辑可独立重放，提案不再标为 `independent` |
| 依赖判定 | `decisions.ts` 的 `decide` | 按操作判定：只有依赖目标的非独立提案操作使其所在建议成为依赖 |
| 删除分组 | 空间分组（`adjacentDeletions: intent === 'propose'`） | 删除 `continuesDeletion` 与视图删除会话状态 |
| 删除线输入 | 删除线渲染为 `contenteditable=false`（由 fragment 外壳设置）；折叠光标落入删除线时在选区导入处移到边缘；现为光标留在删除线内并自绘（现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`） | 删除删除线内插入路径与删除线 composition 分支 |
| 编辑模式删除删除线文字 | `edit`/`accepted` 视图写入：把删除线范围映射到已接受投影后执行普通删除（原型 P1） | 不新增写入通道 |
| 拒绝有依赖的建议 | `decide` 返回 `blocked` 与 `dependants`；卡片提供“连同依赖一起拒绝”（原型 P3） | 不新增失效状态 |
| 卡片摘要 | `readAuthoredReviewParts` 与投影身份缓存 | 读取时按位置合并连续删除并与相邻新增配成替换；删除 `original.ts` |
| 空记录 | `hasAuthoredReviewContent` | 扩展到 `changes()`、计数、`proposals` 与全部接受 |
| 格式 | 视图 intent：Editing 直接，Suggesting 格式建议 | 删除 `automaticFormatting` 与 core 到 React 的 mark 钩子 |
| 协作准入 | Yjs schema identity 与 envelope format 3 | `shared-effect-log` 对无传输层的 effect 解码旧版本；传输层 effect 只接受当前版本 |

## Native behavior and proof

最终行为契约见附录 A，HEAD 修复对账见附录 B。每行只用一条公开边界测试证明，优先改写现有测试的期望。

## Main changes

- 删除第二存储：`record.original`、`original.ts`、逐键原文折叠及其解码兼容。
- 删除线不可编辑：输入、输入法与拖放不再进入删除线；编辑模式删除删除线文字经已接受投影执行。删除线仍为 `contenteditable=false`，但光标可进入，输入会拆开删除线（现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`）。
- 恢复按位置分组；删除自动格式策略。
- 依赖按操作判定；修订提案在所有写入路径上都不标为 `independent`。
- 光标插入关联以构建器保存的步骤对象为键，不再按通知传入的变更对象或其 JSON 匹配。

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| 实现起点 | 在 `6efd9bf87c` 上做减法（原型 P5） | 从 base 重建并移植 | rebuild from base |
| Google Docs 编辑模式缺一手证据 | 按 Word、LibreOffice、OnlyOffice、Overleaf、CKEditor、Tiptap 的一致做法实现 | 先用两个账号实测 Google Docs | probe google first |
| 建议列表 tab 与 `proposals` 查询 | 保留，按操作的 `proposal` 建索引，游标跨提交保持 | 删除，回到评论与建议相互独立 | cut suggestions tab |
| 修订模式普通格式 | 格式建议，撤回 Plate 默认的直接格式 | 保留 `automaticFormatting: 'edit'` | keep direct formatting |
| 删除线 | 不可编辑，整段选中；光标停在边缘；不能加格式（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：光标可进入并逐字移动，可局部选中，仍不能加格式） | 保留删除线内编辑与局部选中 | edit inside struck text |
| 拒绝有依赖的建议 | 阻止并提供“连同依赖一起拒绝” | 自动级联拒绝依赖 | cascade automatically |
| 已决定建议的卡片 | 操作体仍保留时显示其内容，否则显示“内容已不可用” | 保留 `record.original` | keep originals |
| state 版本 | 去掉 original 槽位后升到 v8。偏离：执行时保持 v7；第二轮删除对 original 槽位的解码兼容，含该槽位的未发布开发数据不再可读 | 保持 v7 并继续兼容 | keep original decode |
| 正式评审轮次 | 所有者要求补跑正式评审，正式评审按两轮上限单独计数；手工近似的两轮不计入 | 计入手工轮次，只问 Ship 或 Hold | count manual rounds |
| 翻页游标 | 页面返回 `documentId`；其他文档的游标从第一页开始，其他查询的游标抛错 | 任何不匹配的游标都抛错 | strict cursors |
| 传输层 effect 的旧版本 | 只接受当前版本。`next` 曾放行旧版本，但把旧数据交给当前版本的 `transport.decode`，不经旧版解码器 | 在 `transport.decode` 前先做旧版解码 | legacy transport decode |
| 非 `next` 分支生成 registry | 与构建会话一致，在本分支重新生成 registry 输出 | 恢复生成文件，交给 CI | restore registry output |

## Steps

### 阶段零：基线

- [x] 0.1 在本 worktree（分支 `codex/suggestion-final-behavior`，基于 `6efd9bf87c`）工作，不切换分支。证明：`git branch --show-current`。
- [x] 0.2（`bun --preload ./config/plite-source-aliases.ts benchmarks/editor/benchmarks/plite-authored-mounted-benchmark.ts` 在 base `da4898bb61` 与 HEAD `6efd9bf87c` 各自安装的 worktree 中运行，结果见 Proof 表挂载输入行）测基线：base 与 HEAD 各跑 `plite-authored-reload-benchmark.ts`（10k，fixture 用 `--mode=seed` 在各自源码上生成）、`plite-authored-typing-benchmark.ts` 与 `plite-authored-mounted-benchmark.ts`（contract 来自 `benchmarks/editor/benchmarks/data/native-authored-changes/`）、`plite-authored-scale-benchmark.ts` overlap cohort；新增 200 与 400 条建议的 `details()` 读取、编辑模式 400 键后拒绝两个场景。证明：Proof 表 base 与 HEAD 两列填入数字。

### 阶段一：删除第二存储与越界改动

- [x] 1.1（偏离：state 保持 v7；见 Defaults）删除 `record.original`、`original.ts`、`refreshOriginal`、`details().original`；state 升到 v8。证明：C1 探针（撤销后摘要）正确；authored 分区与 reload 测试通过。
- [x] 1.2（`comment-toolbar-button.spec.tsx` marks a decided suggestion whose content is no longer retained，修复前失败；`discussion.spec.tsx` 合并与替换用例）卡片：`readAuthoredReviewParts` 读取时按文档顺序合并相邻同类片段，删除与相邻新增合成一项替换；已决定建议按 K4 显示。证明：`discussion.spec.tsx` 恢复插入合并期望，新增逐键删除为一项、替换为一项、已决定卡片。
- [x] 1.3（`authored-changes-contract.test.ts`、`comment-toolbar-button.spec.tsx`）`proposals` 改为按操作的 `proposal` 建索引，游标跨提交保持；`hasAuthoredReviewContent` 扩展到 `changes()`、计数、`proposals` 与全部接受。证明：远端提交后不回第一页；删空的建议不显示。
- [x] 1.4（`authored-history-input-contract.test.ts` 25 项）删除 `continuesDeletion` 与视图删除会话状态，恢复空间分组和四条分组测试；修复跨格式边界分组（S11）。证明：`authored-history-input-contract.test.ts`。
- [x] 1.5（同时删除 `formatting.ts`；`AIChatPlugin.suggestions.spec.ts`）删除 `automaticFormatting`；修订模式加粗正文生成格式建议。证明：公开测试。
- [x] 1.6（`retainHistory: false` 清理断言与 `next` 一致；`shared-effect-compaction-contract` decodes a shared effect written at a legacy version，在恢复前的解码路径上失败）`shared-effect-log.ts:825` 恢复旧版本 effect 解码；`retainHistory: false` 的清理断言回到 base（`yjs/authored-contract.spec.ts:1610`、`:1666`）。证明：两条断言改前失败、改后通过；旧版本 effect 解码用例。
- [x] 1.7（skip: 套件全部通过并决定 keep；存档与 overlap 加载未达标，跟踪于 Open work 6）阶段一门槛：authored、react、yjs 分区；platejs 的 `AIChatPlugin.suggestions.spec.ts`、`authoredDocx.spec.ts`、`authoredHtml.spec.tsx`、`MarkdownPlugin.spec.ts`、`BaseCommentsPlugin.spec.ts`；www 的 `discussion.spec.tsx`、`comment-toolbar-button.spec.tsx`、`rich-text-editor-value.test.ts`；加载与存档不高于 base 1.10 倍。决定 keep 或 revert。

### 阶段二：删除线退出输入

- [x] 2.1（`resolves no parent node for a click inside a retained block`；Chromium `keeps the caret out of deleted text and types at its edges`、`drops external text at the edge of deleted text`）fragment 外壳给删除线设置 `contenteditable=false`；选区导入时折叠光标落在删除线内移到边缘；按 `hasEditableTarget`、`hasSelectableTarget` 和 `[contenteditable="false"]` 枚举并修正所有调用点。证明：挂载测试覆盖 S6、S7、S8、S8L；Chromium 用例覆盖输入、输入法、拖放、整段选中复制。
- [x] 2.2（`packages/plitejs/test/authored-retained-contract.test.ts`、`packages/plitejs/test/react/authored-fragment-provider.test.tsx` 边缘输入与粘贴用例）修订模式删除线边缘的输入、粘贴、回车：本人删除线右缘并入为替换（S6），他人或编辑模式为独立新增或正文（S7、E6、S16）；右缘 Backspace 跨过删除线删左侧正文并合并（S8）。证明：同一用例覆盖重载、接受、拒绝后顺序。
- [x] 2.3（`packages/plitejs/test/authored-retained-edit-contract.test.ts` 撤销后接受与拒绝两例，修复前失败）编辑模式删除删除线文字：把覆盖的删除线范围映射到已接受投影坐标后执行普通删除（E7、E7b、E8、E9）；修复撤销后字符以普通文字恢复的问题。证明：先写撤销用例并确认失败。
- [x] 2.4（skip: 偏离，删除线内插入已去掉；编辑模式删除删除线文字与删除线内编辑仍依赖 fragment 定向路径，故保留，余项跟踪于 Open work 7）删除 `updateViews` 的删除线写入、`updateFragment` 删除线修改、`retainedSelectionGroups`、`applyRetainedViewSelectionMarkCommand`、删除线 composition 分支、`runtime-target-bridge.ts`、`dispatchTargetRuntimeCommand`、`runImplicitMarkCommand`。证明：同一 toggle 经外部 dispatch、`tx.marks`、`tx.command` 结果一致（C2）；IME composition 契约测试通过。
- [x] 2.5（`packages/plitejs/test/authored-self-edit-contract.test.ts` splits an own insertion with Enter，基础版本失败、当前通过）修复本人新增内回车抛错（S15）。证明：测试先失败后通过。
- [x] 2.6（skip: 相关用例已改写并通过，余下 12 个失败在本计划之前即存在，跟踪于 Open work 12。Open work 23 已随 OnlyOffice 体验关闭，局部选中成为现行行为，相关 Chromium 用例已改写并连续 5 次通过；套件仍有 12 个失败，失败集合与此前相同，因此本步证明未达成）改写 Chromium 套件 `apps/www/tests/browser/suggestion.spec.ts` 中断言删除线内输入、删除线内光标、局部选中删除线的用例；加入 S6 重新输入已删字符的期望。证明：套件在本地 Chromium 通过。
- [x] 2.7（所有者 2026-10-07 报告已人工核对首页两种模式、安卓输入法与 WebKit，未见明显问题；核对的具体设备与步骤未记录。skip: Chromium 套件余下 12 个失败在本计划之前即存在，跟踪于 Open work 12；打字 p50 已达标，见 Open work 15 与 `2026-10-07-markup-caret-model-selection.md`；Chromium 套件 23 过 12 失败，11 个在 HEAD 以相同错误失败；首页以自动化方式在两种模式下核对删除线旁输入、跨删除线 Backspace 与撤销重做，截图结果符合附录 A，拖放未核对）阶段二门槛：同 1.7，加 Chromium 套件和首页人工核对（删除线旁输入、拖放、跨删除线 Backspace、撤销重做）；打字 p50 不高于 base 1.25 倍或绝对差小于 0.5ms。决定 keep 或 revert。

### 阶段三：决定、批次与文档

- [x] 3.1（`authored-causal-contract` overlapping suggestion decisions；`discussion.spec.tsx` keeps a blocked decision open）拒绝有内容依赖的建议返回 `blocked` 与 `dependants`；卡片提供“连同依赖一起拒绝”；仅相邻的建议不受影响（S18）。证明：`authored-causal-contract.test.ts` 覆盖决定表各格与撤销；`discussion.spec.tsx` 覆盖按钮。
- [x] 3.2（skip: 延后，需改记录模型或批量 rebase，跟踪于 Open work 5）编辑模式在建议内连续输入按位置合并为一条直接记录，拒绝时 rebase 次数与记录数相关而非按键数。证明：模型测试断言 400 键为一条记录；拒绝场景不高于 50ms，否则按实测记录。
- [x] 3.3（`rich-text-editor-value.test.ts` 9 项）首页与 playground fixture 按最终形状重新生成。证明：`rich-text-editor-value.test.ts`。
- [x] 3.4（`check-docs-source-parity.mts` 通过；`generate-ui-changelog-entries --check`；`api-reference:check` 需构建产物，未跑）Vision 与文档：`docs/vision/plite.md` authored 段改为编辑模式直接编辑、卡片读当前内容；更新 `authored-changes`、`suggestion`、`clipboard`、`plite-authored` 及中文版；改写 changeset 与 registry changelog 条目；best-api repair；registry 重新生成。证明：搜索 `details().original`、`automaticFormatting` 为零。
- [x] 3.5（skip: 存档 49.9MB 与 overlap 加载 489–570ms 未达标，跟踪于 Open work 6）性能复测：Proof 表全部达标。
- [x] 3.6（正式评审第一轮见决策记录 panel 行；写作三项见 writing 行；skip: `docs/plans/topics/suggestions.md` 不存在，空记录清理跟踪于 Open work 17）对整个 diff 跑 panel（reviews: api-build），再做 writing passes、`pnpm lint:fix`（仅本任务文件）和 `docs/editor-behavior/current-evidence.md` 对账。

### 第二轮：开放项修复

- [x] 4.1（`authored-fragment-provider` blocks rejecting an insertion that a later suggestion deletes from across struck text，恢复旧条件后为 applied）Open work 1：预备路径上的修订提案不再标为 `independent`，只有删除线内编辑（binding、carrier）与非提案直接编辑可独立重放；`decide` 按操作判定依赖。证明：新用例写于修复之后，恢复旧条件时失败；`retained-marks` 混合范围用例在按操作判定前失败。
- [x] 4.2（skip: 两次尝试均已撤回，跟踪于 Open work 4）Open work 4：跨格式边界删除后在右缘回车，删除线不再被拆到两段。证明：保存的失败用例通过。
- [x] 4.3（paste 用例 `pastes and splits at the edge of retained text`；`authored-retained-contract` keeps a caret on its own step when an empty change precedes the insertion，在按序号记录的版本失败）Open work 16a：光标插入关联以构建器保存的步骤对象为键，只在一次通知恰好新增一个步骤时记录；删除 `authoredInsertionFor` 的 JSON 回退。证明：两组用例通过。
- [x] 4.4（`authored-changes-contract` 32 项）Open work 16b：卡片删除合并改为按位置分组后逐项输出，不再先写入再 splice；文本节点边界判断共用 `isTextBoundaryToken`。证明：契约测试通过。
- [x] 4.5（skip: 16 种光标位置、affinity 与方向组合均未出现无限递归，见决策记录）Open work 16c：修订模式跳过删除线的重定向增加前进保证。证明：无法复现，不增加代码。
- [x] 4.6（`pnpm test:partition:yjs` 通过）Open work 16d：传输层 effect 只接受当前版本，旧版本只在无传输层的路径上解码（相对 `next` 收紧，见 Defaults）。证明：yjs 分区通过。
- [x] 4.7（`pnpm test:bun` 通过）Open work 16e：删除对未发布 original 槽位的解码兼容。证明：测试通过，首页 fixture 不含该槽位。
- [x] 4.8（`authored-changes-contract` restarts paging…、restarts paging for a cursor from a document whose id contains a colon、rejects a page cursor from another query）Open work 16f：页面返回 `documentId`；游标为 JSON 数组（文档、查询指纹、键），只解析一次，其他文档的游标从第一页开始，其他查询或格式错误的游标抛错，键早于 `from` 时抛错；界面不再借空选区读取文档标识。证明：三条用例写于修复之后，在修复前代码上失败（含 id 带冒号的文档）。

## Open work

| # | 项 | 严重度 | patch | owner | 跟踪 |
| --- | --- | --- | --- | --- | --- |
| 3 | 编辑模式删除区块旁 Backspace 无效果（不再崩溃）；children 放置的整节点删除线可能同样被吞（推断）；修订模式删除区块后段首 Backspace 跨过区块合并段落，附录 A 未规定 | warning | 合并段落或删除区块内容，先确定行为 | natamox | 本表 |
| 4 | 跨格式边界的删除在右缘回车后，删除线被拆到两段。根因：Plite 跨文本节点删除按节点生成多个步骤；回车按最小差异在两个文本节点之间插入段落边界，后一节点连同其开头的删除线归入下一段。把后一片段锚定到删除串起点后，渲染正确，但拒绝时恢复的是不带文本节点上下文的文字并抛错 | critical | 恢复路径需为改锚的片段重建文本节点上下文，或让回车在删除线之后分割该文本节点 | natamox | 本表 |
| 5 | 编辑模式在建议内连续输入未批次化，400 键后拒绝约 600ms | warning | 记录模型合并直接编辑或批量 rebase | natamox | 本表 |
| 6 | 存档 49.9MB、overlap 加载 489–570ms 未达门槛 | warning | 精简操作上的 `insertedContent` 与 `boundaries` | natamox | 本表 |
| 7 | `updateFragment` 仍接受删除线内插入（界面不可达） | warning | 收窄为只允许删除 | natamox | 本表 |
| 8 | 向前删除后输入，插入落在第一个删除字符之后，卡片两项 | warning | 修正向前删除后的插入关联 | natamox | 本表 |
| 9 | 他人新增在删除线另一侧时，左缘输入未并入本人删除（S8L） | warning | 只扫描编辑位置到删除线渲染边缘之间 | natamox | 本表 |
| 10 | 跨文本节点的删除卡片仍为两项；编辑模式文档开头删除线右缘 Backspace 无效 | warning | 按投影位置比较放置点；文档边缘用 `retainedCaretEdge` 建范围 | natamox | 本表 |
| 11 | `retainedCaretEdge` 未限制根与 owner；`changes()` 对每条待审记录读取 review parts，侧栏打开时每次提交重算，`changesAt()` 与 `changes()` 的隐藏判断不一致 | warning | 统一隐藏判断并缓存结果，再测量 | natamox | 本表 |
| 12 | 12 个 Chromium 用例在当前版本失败，其中 11 个在 HEAD 以相同断言失败；“clears an inserted paragraph break when Backspace immediately rejoins it” 在两个版本的失败断言不同 | warning | 逐一按附录 A 改写或修复，并在固定版本 Chromium 验证 | natamox | 本表 |
| 13 | 已关闭：所有者 2026-10-07 报告已人工核对首页两种模式、安卓输入法与 WebKit，未见明显问题；核对的具体设备与步骤未记录 | gap | 需设备与人工 | natamox | 本表 |
| 14 | 重做后记录类型变 mixed、`heldChanges` 未按文档重置、`directFormatting` 读取残留、`authoredEditTarget` 返回的他人 `containedTarget` 被调用方丢弃且 `value` 可选、`retainedCaretEdge` 可能落在无文本节点、`read.ts` 的删除串仍以对象为键记录、文本边界辅助函数仍有两层 | nit | 见决策记录 | natamox | 本表 |
| 15 | 已解决打字回退，见 `docs/plans/2026-10-07-markup-caret-model-selection.md`：large 与普通文档打字 p50 与 `next` 持平；`changes()` 改为按建议缓存，Open work 11 的重算部分随之解决。原记录：大文档打字每键约 120ms，`next` 为 20ms；挂载基准删除线视图 paint p95 由 33ms 升至 50–58ms。根因已定位（`docs/plans/2026-10-07-authored-typing-regression-benchmark.md`）：95eeaf92b7 引入 `applyMarkupInput` 与投影视图选区绑定后，每次提交都会为新状态重建整份内容根边界图（`createContentRootViewBoundaryGraph`），并逐条重新编译全部删除建议的片段（`compileAuthoredMarkupFragments`），约 90ms/键 | critical（性能） | 片段编译按建议跨提交缓存；边界图按需构建并复用未变块；纯文本折叠光标不维持需全图解析的绑定 | natamox | 本表 |
| 17 | 空记录永不清理 | warning | 在决定或重载时清理无内容且无讨论的记录 | natamox | 本表 |
| 19 | 他人在两个待审新增之间输入时，被列为两者的依赖，拒绝其中一个返回 blocked；与附录 A“仅相邻不受影响”不符，第二轮之前已存在 | warning | 区分插入位置两侧的出生依赖与内容依赖 | natamox | 本表 |
| 20 | 多步骤命令（如带格式插入文字）经采纳一次加入多个步骤时，不记录光标关联，forward 光标下删除线落在新文字之后；基础版本相同 | warning | 构建器在采纳时为对应步骤保留光标信息 | natamox | 本表 |
| 21 | 光标关联按“一次通知恰好新增一个步骤”记录：静默步骤后紧跟空变更会误记，嵌套写入与带子根的切片不记录 | nit | 在通知上下文中直接提供对应步骤 | natamox | 本表 |
| 22 | 混合建议（一条正文操作与一条删除线上的独立操作）在父建议被拒绝后，其作者撤销父建议所在编辑是否抛冲突，未验证：两次复现都未先拒绝父建议 | warning | 先拒绝父建议再撤销的三方复现；若抛冲突，把撤销与 rebase 统一到按操作判定 | natamox | 本表 |
| 23 | 已解决，见 `2026-10-07-struck-text-onlyoffice-caret.md`：局部选中成为现行行为，可见选区包含被选中的删除线部分，修订模式复制不含删除线文字（Chromium 拖选核对）。原记录：拖选端点落在删除线内时仍局部选中：可见选区不含删除线，复制结果却含部分删除线文字（如 `this redundant phras`）；与 S21“整段选中”不符 | warning | 在选区导入时把非折叠选区落在删除线内的端点外推到删除线边缘 | natamox | 本表 |
| 18 | 预备路径不再标记独立后，仓库内挂载测试只覆盖 delete-fragment 路径；挂载打字与 Backspace 由自动路径和 `authored-causal-contract` 覆盖 | nit | 如挂载输入改走预备路径，补一条挂载打字用例 | natamox | 本表 |

已关闭：1、2、16（16c 无法复现，未改代码），见第二轮步骤与决策记录。

## Panel gate

- 手工近似第一轮（frozen `a3165f68c9`）与第二轮（frozen `a608375b7b`）：构建会话未加载 pstack，席位自写 brief 运行，不计入正式评审；共修复 8 个 critical。
- 正式第一轮（frozen `b2228d8718`，全部 diff）：opus、fable、sonnet 经 `cross.mjs` 只读运行，均返回。fable 的 critical 经探针与变异驳回；warning 与 nit 转为 Open work 3、11、14、15、16。同家族评审：本机缺 `~/.claude/pstack-models.md`，未设 codex 席位。
- 正式第二轮（frozen `61ba5b483b`，第二轮改动的 delta）：opus、fable、sonnet 与 codex gpt-6.1-sol 四席均返回。采纳 critical 2 项：关联按通知次数计序号会错位（三席），游标指纹缺少 `from` 与 `to`（codex）；均有在冻结版本失败的用例。其余处置见决策记录。
- 正式第三轮（frozen `9573576941`，只审第二轮修复）：四席均返回。采纳 critical 2 项：游标解析假设 documentId 不含冒号（opus），伪造游标键可越过 `from`（codex）；codex 关于多步骤命令丢失光标关联的 critical 在基础版本相同，驳回并列为 Open work 20。两轮采纳 critical 后已到上限。
- 未评审：第三轮之后的游标改写（JSON 游标与下界检查），由第三轮 critical 直接导出，未再评审；所有者要求补完的步骤 1.2 卡片文案与步骤 1.6 用例。只交付已评审部分会恢复 id 带冒号时换文档抛错、伪造键越过 `from` 两个已知缺陷。

## Close

后续：删除线交互改为 OnlyOffice 体验，并修复删除变化引起的全量重编译，见 `docs/plans/2026-10-07-struck-text-onlyoffice-caret.md`；附录 A 中被取代的行已逐行标注。

- 流程偏离：构建会话未加载 pstack，两轮评审为手工近似，写作三项、reflect 与决策轨迹评审未运行。评审会话按正式流程补跑了这些步骤，并运行 lint 与最终字节验收。
- 第二轮：按所有者要求修复 Open work 1、4、16，并以正式措辞精简本计划与决策记录。决策记录因此整体改写，不再是逐行追加的原始记录，原件保存在 `scratch-review/r2/decisions.before-rewrite.tsv`。
- 反转与偏离：步骤 2.4 保留 fragment 定向删除路径；3.2 延后；state 保持 v7，第二轮删除 original 槽位的解码兼容；Open work 4 两次修复尝试均撤回。
- 落地：删除线不可编辑与边缘输入；依赖拒绝；文档、Vision、changeset 与 changelog；Open work 1 与 16 的五项。
- 证明：第二轮改动后 plitejs bun、React、yjs、platejs 与 www 全部通过，`tsc --noEmit` 通过；新增三条用例各自在对应变异下失败。Chromium 在构建会话为 23 过 12 失败，失败与基础版本相同。
- 限制：正式第一轮为同家族评审，第二、三轮含 codex 席位；第三轮之后的游标改写未再评审；Chromium 用系统 Chrome，评审会话未重跑；移动端输入法与首页拖放未核对；挂载基准当前版本首个 cohort 即未达标，未覆盖其余 cohort；Open work 4 与 15 未解决。
- 收尾记录：评审台账 `docs/research/review-records/2026-10-06-suggestion-final-behavior-execution.json`（第一轮之后）与 `docs/research/review-records/2026-10-07-suggestion-final-behavior-execution.json`（第二轮之后，previous 指向前者），outcome 与 proof 均为 partial；reflect 已应用的教训见 `AGENTS.md` 的 Lessons awaiting upstream，Backlog 与 Rejected 见决策记录 reflect 行。
- 计数（步骤共 30 项，按勾选框计）：完成 22；跳过 5（1.7、2.4、3.2、4.2 转入 Open work，4.5 无法复现）；未完成 3（2.6 需先修 Open work 23，2.7 与 3.5 性能未达标）；合计 30。

### Attention

reviewed by gpt-6.1-sol（第一轮之后，经 `cross.mjs` 只读运行）

- critical：Close 曾把决策轨迹评审与 reflect 写成已完成。已更正。
- critical：fable critical 的驳回行变异描述不准确。已用只删除 `!proposedPublication` 的变异重跑并更正。
- critical：空记录清理原定记入不存在的主题文件。已列为 Open work 17。
- warning：探针偏移与断言与席位不同；nit 行去向未列全；Defaults 轮次说明易被误读；构建会话一条驳回理由的规模结论过宽。均已更正。

reviewed by gpt-6.1-sol（第二轮之后，经 `cross.mjs` 只读运行）

- critical：Brief 写“全部测试通过”，Chromium 未重跑。已收窄。
- warning：Open work 1 与 16f 的用例写于修复之后，以回退证明失败。已更正措辞。
- warning：decide 与撤销规则不一致的复现未先拒绝父建议。改为未解决，Open work 22。
- warning：游标改写在上限之后、未评审；只交付已评审部分会恢复已知缺陷。已写入 Panel gate。
- warning：删除串映射与边界辅助函数未列入 Open work 14。已补。

## Proof

| 门槛 | 方法 | base | HEAD | 通过条件 |
| --- | --- | --- | --- | --- |
| 行为契约 | 附录 A 每行一条公开边界测试 | — | — | 全部通过；修复类测试先失败后通过 |
| 回归 | 1.7、2.7 列出的用例与 Chromium 套件 | — | — | exit 0 |
| 10k 加载 | `plite-authored-reload-benchmark.ts`，三次中位数 constructMs | 25,443ms | 3,292ms | 不高于 HEAD 1.10 倍；当前 2,453ms，通过 |
| 存档体积 | 同上，fixture 字节数 | 27.8MB | 61.6MB | 不高于 base 1.10 倍；当前 49.9MB，未通过 |
| 打字（模型） | overlap cohort（1000 建议、2 视图），p50 | 1.36–1.54ms | 2.08–2.32ms | 不高于 base 1.25 倍或绝对差小于 0.5ms；当前 1.62–1.77ms，通过 |
| 打字（浏览器） | `plite-authored-typing-benchmark.ts`，系统 Chrome、Node 22；对照 `next`（da4898bb61），两轮交替运行 | next：normal p50 10.3–10.4ms、large 19.9–20.0ms | HEAD：normal 20.9ms、large 123ms（构建会话） | 当前 normal 20.7ms、large 117.5–120.6ms，未通过；见 Open work 15 |
| 挂载输入 | `plite-authored-mounted-benchmark.ts`，4 个 cohort、每个 3 轮 | 全部通过，retained 视图 paint p95 约 33ms | views-1 第 2 轮绝对延迟未达标，p95 约 50ms | 当前 views-1 第 1 轮未达标：p95 57.9ms，heap 比 1.51（HEAD 1.28）；首个未达标即停止，未覆盖其余 cohort |
| overlap 加载 | overlap cohort，load | 350–388ms | 720–878ms | 不高于 base 1.15 倍；当前 489–570ms，未通过 |
| 卡片读取 | `cards-reject.ts`：200 与 400 段，一次按键后读取全部 `details()` | 66ms / 130ms | 1,215ms / 5,880ms | 400 段不高于 base 1.25 倍；当前 111ms，通过 |
| 拒绝开销 | `cards-reject.ts`：编辑模式在他人新增内输入 50 与 400 键后拒绝 | blocked | 57ms / 701ms | 400 键不高于 50ms；当前 585ms，未通过 |
| 原生浏览器 | Chromium 套件与首页核对 | — | — | 套件 23 过 12 失败，11 个与 HEAD 相同；首页自动化核对符合附录 A；拖放与移动端未核对 |

## 附录 A：最终行为契约

图例：Z 为 Ziad 版本（base），H 为 `6efd9bf87c`。

### 编辑模式

| # | 操作 | 最终行为 | 相对 Z | 相对 H |
| --- | --- | --- | --- | --- |
| E1 | 普通正文输入 | 直接生效 | 同 | 同 |
| E2 | 本人行内新增内输入 | 普通正文，原建议在输入处断开为同一 id 的两段，一张卡片两项 | 改 | 同 |
| E3 | 他人行内新增内输入 | 同 E2 | 改 | 同 |
| E2b | 新增段落、列表项或表格单元内输入 | 普通正文，放在承载容器中；拒绝新增后文字和容器保留，接受后顺序不变 | 改 | 同 |
| E4/E5 | 删除新增的一部分 | 真删，建议缩短 | E5 改 | 同 |
| E6 | 删除线旁输入 | 光标在删除线边缘，普通正文放在该边缘（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：删除线内输入把它拆开，正文放在两段之间） | 改（修丢字和无反应） | 改位置 |
| E7 | 删除线右缘 Backspace | 删除删除线最后一个字符，删除建议缩短，删空即不显示；撤销后字符回到删除建议（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：删除线内同样真删光标前的字符） | 改（修无反应） | 修空记录 |
| E7b | 选区跨过整段删除线后删除（含跨段全选） | 全部删除，一次撤销恢复 | 改 | 同 |
| E8 | 部分覆盖混合选区删除 | 真删，被覆盖的建议缩短 | 改（base 阻止） | 同 |
| E9 | 完整覆盖混合选区删除 | 直接删除，被覆盖的建议不再显示，不记为接受 | 修空记录 | 修空记录 |
| E10 | 加粗含新增的选区 | 直接加粗，删除线部分不变 | 修崩溃 | 同 |
| E11 | 拒绝被他人直接编辑过的建议 | 拒绝成功，直接文字保留 | 改（去掉 blocked） | 同 |

### 修订模式

| # | 操作 | 最终行为 | 相对 Z | 相对 H |
| --- | --- | --- | --- | --- |
| S1 | 普通正文输入 | 新增建议 | 同 | 同 |
| S2 | 本人新增内输入 | 并入原建议 | 同 | 同 |
| S3 | 他人新增内输入 | 当前作者的依赖新增 | 同 | 同 |
| S4 | 删本人新增 | 直接撤回 | 同 | 同 |
| S5 | 删他人新增 | 叠加删除建议，拒绝删除即恢复新增 | 同 | 同 |
| S6 | 本人删除线右缘输入 | 并入该删除成为一条替换；重新输入刚删的字符时取消对应删除（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：右缘不变；删除线内输入拆开删除线，新文字为独立新增） | 改（修丢字） | 改 |
| S7 | 他人删除线右缘输入 | 当前作者的独立新增 | 改（修无反应） | 改位置 |
| S8 | 删除线右缘 Backspace | 跨过删除线，删左侧正文并并入相邻本人删除（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：逐字跨过删除字符、不改内容，到左缘后再删正文并并入） | 改 | 改 |
| S8L | 删除线左缘输入或 Delete | 输入落在删除线之前，与相邻本人删除合成替换；Delete 跨过删除线删右侧正文（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：Delete 逐字跨过删除字符） | 改 | 改 |
| S9 | 选区含已有删除线 | 已删部分不动，其余删除并合并 | 修无反应 | 同 |
| S10 | 替换 | 一条替换建议 | 同 | 改回 |
| S11 | 连续 Backspace | 一条，不受格式边界影响 | 修分组 | 修分组 |
| S12 | 移动光标后删相邻内容 | 按位置合并 | 同 | 改回 |
| S13 | 不相邻删除 | 分开 | 同 | 同 |
| S14 | 普通格式 | 格式建议，立即显示 | 同 | 改回 |
| S15 | 回车 | 段落分隔作为新增 | 同 | 修崩溃 |
| S16 | 粘贴 | 新增建议，去掉来源建议身份；删除线旁同 S6、S7 | 修丢字 | 改位置 |
| S17 | 撤销/重做 | 卡片跟随当前内容；空记录不显示，内容回来后原 id 恢复 | 修空记录 | 修摘要错误 |
| S18 | 重叠建议 | 见决定表 | 同 | 改 |
| S19 | 拖放 | 落点在删除线上时放到边缘；拖动源含删除线时只移动可见文字 | 新 | 新 |
| S20 | 输入法 | 删除线不可编辑，组合文字不进入删除线（桌面 Chromium 已验证，移动端未测）（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：组合文字提交后拆开删除线；组合过程中预编辑显示在删除线左侧） | 新 | 新 |
| S21 | 复制删除线 | 删除线整段选中，可复制为普通文本（所有者 2026-10-07 改为 OnlyOffice 体验，现行行为见 `2026-10-07-struck-text-onlyoffice-caret.md`：可局部选中；修订模式复制不含删除线文字，编辑模式包含） | 新 | 新 |

### 重叠建议决定表

| B 与 A 的关系 | 拒绝 A | 接受 A | 先接受 B | 先拒绝 B |
| --- | --- | --- | --- | --- |
| B 插在 A 的新增内 | `blocked`，卡片提供“连同依赖一起拒绝”，一次撤销恢复两者 | B 保持待审 | `blocked`，`dependencies` 列出 A | B 撤回 |
| B 删除 A 的文字 | 同上 | B 保持待审 | `blocked`，`dependencies` 列出 A | A 的新增标记恢复 |
| B 仅与 A 相邻 | B 不受影响 | B 不受影响 | 正常接受 | 正常拒绝 |
| 编辑模式直接文字在 A 内 | 文字保留 | 文字保留，顺序不变 | — | — |

### 卡片

| # | 项 | 最终行为 |
| --- | --- | --- |
| K1 | 替换 | 一项“把 X 替换为 Y”，删除在新增前后均可 |
| K2 | 建议被后续编辑 | 显示当前内容 |
| K3 | 粒度 | 一条建议一张卡；位置连续同类为一项，断开的片段为多项 |
| K4 | 已决定建议 | 操作体仍保留时显示其内容，否则显示“内容已不可用” |
| K5 | 空记录的讨论串 | 讨论串保留在全部评论中，目标显示为不可定位 |

## 附录 B：HEAD 修复对账

来源：`docs/plans/2026-10-03-suggestion-text-review.md`。

| HEAD 修复 | 处置 |
| --- | --- |
| 编辑模式作者差别导致无法输入 | 保留（E2、E3） |
| 拒绝 link 把独立新字一起删掉 | 保留（E2b，`isolate.ts`） |
| 删除线直接删除后拒绝复活字符 | 改由已接受投影删除实现（E7、E8） |
| 修订模式删除他人新增丢失 A/B 关系 | 保留（S5、决定表） |
| 替换跨普通、新增、删除线导致半次提交 | 保留；删除线部分改走已接受投影（E7b、E8） |
| 中文组合中间字符成为独立建议 | 保留 composition 分组；删除删除线内 composition 分支 |
| 零范围零回复后记录消失 | 改为记录保留、卡片不显示、讨论串保留（K5） |
| 并发直接删除被另一方撤销或拒绝抹掉 | 保留（`independent` 与 rebase） |
| 人工 marks 将 AI 提案提前发布 | 保留显式提案隔离；修订模式格式一律为建议（S14） |
| clean 输出泄露提案留存 | 随 `original` 删除而消失 |
| `getChangeValue` 保留 prepared change 身份 | 保留 |
| 删除线行内节点复制带结构上下文 | 保留 |
| 键盘跨节点移动读取实际边界 | 保留 |
| 新文字沿插入来源解析段落归属 | 保留 |
| 全选跨段删除（`6efd9bf87c`） | 改由已接受投影删除实现（E7b） |
