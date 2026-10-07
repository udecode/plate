---
review_scopes: [suggestions, authored, selection]
review_basis: []
work_kind: implementation
---

# 删除线视图的折叠光标回到模型选区

Status: executed: phase 1 landed in a narrower form; phases 2 and 3 were superseded by docs/plans/2026-10-07-caret-inside-struck-text.md
Playbook: plan
Page: https://claude.ai/artifact/1fHcpr4DHjHpHAd3CKYspe

本计划处理 `docs/plans/2026-10-07-suggestion-final-behavior.md` 的 Open work 15，根因见 `docs/plans/2026-10-07-authored-typing-regression-benchmark.md`（C1-graph-rebuild-per-commit）。`95eeaf92b7` 起，markup 视图的折叠光标同时存为模型选区和绑定到 authored 位置的投影视图选区。每次按键都要为写回投影选区重建整份内容根边界图，图遍历又触发全部删除建议的片段重编译。目标是：折叠光标只由模型选区与 affinity 表示，删除线边缘规则在一个纯函数表里依据局部 dock 查询决定，投影视图选区只保留给含删除线或跨内容根的展开选区。附录 A 的行为契约不变。证据路径中的 `scratch-arch`、`scratch-panel`、`scratch-perf` 与 `scratch-build` 分别指本会话的架构比较、计划评审、剖析与构建临时目录，均不随仓库提交。

## Brief

### What did you find?

大文档打字 p50 由约 120ms 降到 19–21ms，普通文档由 20.7ms 降到 10.7–10.9ms，均与 `next` 持平或在 1.05 倍内。点击和 Backspace 后光标消失两个回归已修复。

### What will change?

活文本中的折叠光标只存模型选区与 affinity，按键不再建全图；模型导出携带 affinity；Backspace 回到删除线边缘后保持原侧。公开 API 不变。

### What do you need from me?

审阅并提交。阶段二的清理与边缘规则表已被 `2026-10-07-caret-inside-struck-text.md` 取代：光标重新可进入删除线，自绘光标与片段内投影选区仍在使用。

### What happens if I say go?

go 不再推进阶段二；改动留在工作区由所有者提交。

### What could go wrong?

WebKit 未验证；删除、方向键与单段多删除的代价未测；diff 已在 `2026-10-07-caret-inside-struck-text.md` 的两轮评审中审过。撤销只需还原本次十个文件的改动，记录见 Close。

## What other editors do

读了四个本地仓库的源码：prosemirror-suggest-changes `653fba7`、OnlyOffice sdkjs `72b0421`、LibreOffice `016b2c1`、Overleaf `e039ad2`；其余编辑器未读，依据通用知识，结论标为未读。引用与行号见 `scratch-arch/editors.md`。

| 编辑器 | 删除文字是否在光标所走的模型中 | 光标能否停在删除线内 | 输入落在哪一侧 | 每键代价 |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes | 在，`deletion` mark | 能，不移出 | 写入时固定移到删除之后 | 装饰每次遍历全文 |
| OnlyOffice | 在，`reviewtype_Remove` 的 run | 能，方向键逐字经过 | 由光标所在 run 决定，run 起点归到前一 run 末尾 | 局限于 run 与段落 |
| LibreOffice | 在，redline 覆盖节点文字 | 显示修订时能 | redline 终点在插入点不扩展；删除内输入拆开删除 | 查找 O(log R)，其后压缩一次 |
| Overleaf | 不在，单点空 widget | 不能 | 固定规则：映射到删除之前 | 与修订和评论数成正比 |
| ProseMirror、Lexical、Slate、Tiptap、CKEditor 5、Google Docs | 未读 | — | 由 mark 的 inclusive、所在节点或选区 gravity 决定 | 局部 |

四个已读编辑器都不在折叠光标上存 affinity。前三者把删除文字留在模型里，删除线前后是不同的偏移，侧别由位置本身表示。Plite 与 Overleaf 一样把删除文字放在模型之外，删除线两侧折叠为同一个模型点。Overleaf 用固定的“映射到之前”规则，但附录 A 的 S6、S7、S8L 区分右缘与左缘输入，固定规则做不到。因此本计划在 dock 处保留 affinity，让把光标放到 dock 的写入者给出侧别，其余情况用与 Overleaf 相同的固定规则（落左缘）。prosemirror-suggest-changes 与 Overleaf 的每键代价来自重建装饰和位置映射，与侧别规则无关；本计划在编辑处局部决定侧别。

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| 折叠光标只存模型选区与 affinity | Plite | `plitejs` core 选区、`react/editable/selection-controller.ts` | 单一选区来源（`docs/vision/plite.md` 选区模型）；删除线不是输入目标 |
| dock 查询 `readAuthoredViewDock` | Plite | `plitejs/authored` 实现，经 `core/authored-runtime.ts` 暴露 | react 只能经 authored-runtime 访问 authored（`tooling/entrypoints/entrypoint-dag.mjs`） |
| 边缘规则表 `markup-caret.ts` | Plite | `plitejs` react-core（`react/editable/`） | 输入引擎状态，纯函数，一处决定 |
| 无 affinity 的 dock 光标侧别 | Plite | `plitejs/authored`（插入关联钩子）与规则表共用一个默认 | 写入者之外的情况只有一个规则 |
| 模型选区导出携带 affinity | Plite | `plitejs` core（`getSelectionDOMRange`）与 dom（`resolveDOMRangeInRoot`） | 当前导出丢弃 affinity，投影份删除后右缘光标会画在左侧 |
| 投影视图选区只表示含删除线或跨内容根的展开选区 | Plite | `plitejs` react-core（`react/view-selection.ts`） | 只有这些选区需要片段坐标 |

## Native behavior and proof

| Behavior | 变化 | 证明面 |
| --- | --- | --- |
| 点击删除线内与拖放落点（S19） | 移到较近边缘，存为模型选区与 affinity | jsdom React 测试；Chromium `keeps the caret out of deleted text and types at its edges`、`drops external text at the edge of deleted text` |
| 删除线边缘输入（E6、S6、S7、S8L、S16） | 由模型 affinity 决定落点；光标在 dock 时输入走模型路径 | jsdom React 测试；Chromium 与 WebKit 套件 |
| 原生光标导出 | 模型导出携带 affinity；块末尾 dock 后无正文字符串时放在删除线元素之后 | 新增 jsdom 测试断言 `getSelection().anchorNode`；Chromium 与 WebKit 删到段尾后输入 |
| 删除线边缘 Backspace 与 Delete（E7、S8、S8L） | 由规则表决定，返回带 affinity 的光标 | jsdom React 测试；Chromium |
| 方向键跨删除线 | 规则表在同一点翻转 affinity；上下方向键的目标横坐标取自导出光标 | jsdom React 测试 |
| 输入法（S20） | 折叠光标的组合以模型光标为锚点；展开选区仍用投影绑定 | `composition-state-contract.test.ts`；Chromium 两侧边缘组合输入；移动端 unproven |
| 撤销与重做 | 恢复模型选区；投影选区历史只保留展开选区 | jsdom React 测试，含撤销后在 dock 输入 |
| 两个 Editable 共用一个编辑器 | markup 视图与 accepted 视图对同一模型点的 affinity 解读互不影响 | jsdom React 测试 |
| 整段选中与复制删除线（S21） | 不变，仍为投影选区；端点外推仍为 Open work 23 | Chromium；已知失败 |

## Main changes

本节列出计划时的目标；dock 查询与纯函数规则表未实现（步骤 1.2、1.3 已被取代）。

- 折叠光标不再有投影份：`writePliteViewSelection` 与绑定重解析都不再产生折叠投影选区。
- 删除线边缘的折叠命令与移动由 `react/editable/markup-caret.ts` 的纯函数表决定，输入为 `readAuthoredViewDock`。
- 把光标放到 dock 的写入者给出 affinity：选区导入、规则表、核心删除。其余情况统一落左缘。
- 模型选区导出携带 affinity。
- 展开投影选区上的命令结果写回模型选区并释放投影绑定。

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 折叠光标表示 | 模型选区与绑定投影选区两份 | 仅模型选区与 affinity | core 选区；`selection-controller.ts` | 两份会分叉；投影份每键需全图 | 阶段一 | 迁移测试与套件；基准 | 浏览器规范化光标；写入者漏给 affinity | gate |
| 边缘规则 | `applyMarkupInput` 前置段（845–929）、`retainedCaretEdge`、`moveMarkupSelection` 与 `resolveMarkupSelectionMovement` 的折叠分支（后者对折叠模型选区写死 `'backward'`，`content-root-navigation.ts:1287-1300`） | `markup-caret.ts` 纯函数表 | `react/editable/markup-caret.ts` | 一处决定；读局部 dock | 阶段一 | 按附录 C 行的测试；差分 | 多段 dock | gate |
| dock 查询 | 无；图遍历 | `readAuthoredViewDock(view, point)` | `authored/dock.ts` 经 `core/authored-runtime.ts` | `fragmentIndex().buckets` 已按 NodeKey 分桶 | 阶段一 | 差分加生成式用例 | 叶子边界放置在下一叶 offset 0（`markup.ts:269`）；单叶 D 条删除时为 O(D) | gate |
| 无 affinity 的 dock 光标 | 侧别无规则（探针 `return` 落左） | 统一落左缘；只适用于他人删除覆盖光标与程序设置无 affinity 的选区 | 插入关联钩子与规则表共用一个默认 | 写入者之外只有一个规则 | 阶段一 | 他人删除后、程序设置选区后的输入用例 | 与写入者给出的侧冲突 | gate |
| 撤销与重做后的光标 | 恢复原侧（探针 `undo-side`：forward 得 `LbravoZ R`，backward 得 `LZbravo R`） | 保持；历史是给出 affinity 的写入者 | `history/history-selection.ts` | 现状正确 | 阶段一 | 撤销后输入落原侧；E7 后撤销再 Backspace 仍删除删除字符 | 无 | keep |
| 删除后的光标 | `delete-text.ts:732-738` 生成不带 affinity 的新选区 | markup 视图中，提交后折叠光标落在 dock、无 affinity 且本次提交删除了光标一侧的内容时，affinity 取被删内容所在一侧 | authored 视图更新收尾（一个位置，覆盖字符、词、行删除与剪切）；核心不改 | 探针 `return` 落错侧 | 阶段一 | 先写失败用例；词删除用例 | 非 markup 编辑器不受影响 | gate |
| 模型导出 | `getSelectionDOMRange` 只取 anchor、focus；`resolveDOMRangeInRoot` 对折叠范围传 `undefined` | 携带 affinity；块末尾 dock 定位到删除线元素之后 | core 与 dom | 投影导出删除后无人传 affinity | 阶段一 | jsdom 与 Chromium、WebKit | 浏览器规范化 | gate |
| 原生输入门槛 | 存在投影选区即模型输入 | 光标在 dock 时模型输入，其余按 `next` 门槛 | `selection-reconciler.ts` | 原生输入在不可编辑元素旁由浏览器决定落入哪个字符串 | 阶段一 | Chromium 输入用例 | 无 | gate |
| 展开选区命令结果 | 写回段（1112–1141）写新投影选区与历史 | 写回模型选区、释放投影绑定、保留历史条目；只删除折叠分支 | `mutation-controller.ts` | 写回段也承载展开选区结果 | 阶段一 | 替换展开选区后再输入一字 | 绑定重解析复活折叠投影选区 | gate |
| 输入法锚点 | 任何投影选区都绑定 | 折叠光标用模型锚点；展开选区保留投影绑定 | `composition-state.ts` | 展开选区需要片段坐标 | 阶段一 | `composition-state-contract.test.ts` 的 retained 两组 | 无 | gate |
| 拖放落点 | `resolveRetainedDropPoint` 调 `retainedCaretEdge` 与全图 | 调规则表的点击落点 | `markup-caret.ts` | 同一规则 | 阶段一 | Chromium 拖放用例 | 拖放未在设备核对（Open work 13） | gate |
| 上下方向键目标横坐标 | 读投影 focus（`runtime-keyboard-events.ts:61-83`） | 读导出后的 DOM 光标 | `runtime-keyboard-events.ts` | 无折叠投影选区 | 阶段一 | jsdom 用例 | 无 | gate |
| 编程导出后的选区导入 | 有投影选区时跳过非用户来源（`selection-controller.ts:1137-1142`） | 对模型光标同样跳过，避免导出回读覆盖 affinity | `selection-controller.ts` | 投影选区不再存在 | 阶段一 | 输入后 affinity 保持的用例 | 无 | gate |
| 折叠投影残留 | `PliteViewSelectionCaret`、`isPliteViewSelectionCollapsed`、`bindViewSelection` 折叠分支、折叠历史条目、`applyRetainedViewSelectionMarkCommand` 折叠分支 | 删除 | — | 无生产者；删除线不能加格式（行为契约计划 Defaults） | 阶段二 | React 套件 | 无 | cut |
| 展开选区路径的代价 | 每步重建全图 | 不变，仍与文档大小相关 | `react/view-selection.ts` | 展开选区不是逐键输入；本计划只约束折叠路径 | — | — | Shift 加方向键在大文档上慢 | defer |
| 片段编译缓存 | `FRAGMENT_READS` 按 `authoredState` 键 | 不在本计划改；阶段三只测量 | `authored/markup.ts` | 片段含绝对路径，index 未受影响不等于位置未变；因果干预显示去掉图遍历后编译从 2647ms 降到 7ms | 阶段三（测量） | 打字与挂载剖析中的编译计数 | 无 | defer |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| 基础方案 | 候选二（模型光标，dock 查询，最大删除）并移植候选一的纯函数表与删除返回 affinity、候选三的差分证明 | 候选三：保留绑定投影光标，图改为惰性 | keep projected caret |
| 无 affinity 的 dock 光标（被他人删除覆盖、程序设置无 affinity 的选区） | 落左缘，新字在删除线之前；与 Overleaf 的固定规则一致。撤销与重做恢复原侧，不在此列 | 落右缘 | dock right by default |
| 测试 4118 | 期望由 `LbrXavoR` 改为 `LXbravoR` 并改名；`LbrXavoR` 是删除线内输入，违背删除线不可编辑 | 保留删除线内输入 | keep in-struck typing |
| 编辑模式删除线左缘 Delete | 删除第一个删除字符，与 E7 对称；构建时在附录 A 增加 E7L 行 | 跳过删除线，删右侧正文 | skip struck on delete |
| 同一点相邻多段删除线 | 视为一个单元：光标只在单元两侧；编辑模式删除最近一侧的一个字符；修订模式跳过整个单元；右侧输入并入单元中紧邻的本人删除，若紧邻的是他人删除则为独立新增 | 每段之间都可停光标 | stop between runs |
| 阶段三 | 只测量编译计数；若仍出现，另立计划设计不含绝对位置的片段 | 本计划内实现 index 持有编译结果 | cache in index |

## Steps

构建时阶段一按更窄的实现落地，见 Close 的偏离说明。原计划措辞保留在各步骤中。

### 阶段一：一个光标与一个规则表

- [x] 1.1（`authored-fragment-provider.test.tsx` exports a model caret beside retained text on its affinity side，含块末尾；撤去导出改动后两例以 forward caret is on the wrong side 失败）先行探针：新增 jsdom React 测试，在 dock 处 forward 与 backward 两种光标、含块末尾 dock，断言原生选区 `anchorNode` 位于删除线之后或之前；在 Chromium 与 WebKit 删到段尾后输入，并读回 `getSelection()`。块末尾若浏览器把光标规范回左侧字符串，改为在末尾删除线元素之后渲染一个空文本节点作为落点。证明：测试日志与截图。WebKit 未运行；块末尾在 jsdom 通过，无需空文本落点。
- [x] 1.2（skip: 已被 `2026-10-07-caret-inside-struck-text.md` 取代，边缘规则不再需要。偏离：未新增 `authored/dock.ts`；改为 `caretMayTouchRetained` 一次槽位查询判断是否可能贴近删除线，只有贴近时才建图并用 `caretTouchesRetained` 判定；差分与生成式用例未做）新增 `authored/dock.ts` 与 `readAuthoredViewDock`：返回光标所在文本节点上 dock 在该点的删除线单元，归一化相邻叶子 offset 0 的 text 放置与块边缘的 children 放置。证明：差分脚本比较 dock 与图邻居，fixture 必须包含格式边界 dock、块首与块尾 children 放置、同一点两段删除线、本人与他人删除相邻、内容根内光标；另以生成式用例随机组合种类、作者、相邻与块边缘。差异逐项按附录 A 判定，不以图为准（图的已知缺陷见行为契约计划 Open work 10、11、14）。
- [x] 1.3（skip: 已被 `2026-10-07-caret-inside-struck-text.md` 取代。偏离：未新增纯函数表；E7、S8、S8L 与方向键仍由原前置段与 `moveMarkupSelection` 决定，只在光标贴近删除线时运行，并以模型 affinity 作种子；转置在删除线边缘不执行）新增 `react/editable/markup-caret.ts` 纯函数表，覆盖附录 C 的折叠行：E7、E7L、S8、S8L、方向键、点击与拖放落点、多段单元；无 affinity 时按 Defaults 取左缘。`applyEditableCommand`、`applyContentRootViewSelectionAction`、`resolveRetainedDropPoint` 的折叠分支改用该表。证明：附录 C 每行一条 React 用例。
- [x] 1.4（`authored-fragment-provider.test.tsx` keeps text typed after Backspace on the side of retained text the caret came from；把删除后侧别改回删除方向时以 `LYbravoR` 失败；撤销、他人删除、程序设置与词删除的专门用例未加，现有撤销用例通过）写入者给出 affinity：选区导入（`importMarkupCaret`，删除线内移到较近边缘）、规则表返回的光标、历史（现状已恢复原侧）、authored 视图更新收尾（删除后光标落到 dock 时取被删内容所在一侧）；插入关联钩子在 dock 无 affinity 时取左缘。证明：先写用例“右缘输入一字、Backspace 后再输入，新字在删除线之后”，当前在模型路径失败（探针 `internal` 得到 `LYbravo R`）；词删除同一用例；撤销后输入落原侧；E7 后撤销再 Backspace 仍删除删除字符；他人删除后、程序设置选区后落左缘。
- [x] 1.5（React 套件 1456 项通过）删除 `possibleDock` 与 `resolveProjectedDOMSelection` 的三处 `projection !== 'markup'` 例外；`writePliteViewSelection` 与绑定重解析不再产生折叠投影选区；`applyMarkupInput` 对折叠光标不再处理（规则表已接管）；写回段只删折叠分支，展开选区命令结果写回模型选区并释放投影绑定。证明：替换展开选区后再输入一字的用例；React 套件。偏离：例外与 `possibleDock` 保留，供内容根与删除线内的光标使用；活文本中的折叠光标在 `importProjectedDOMSelection` 前置的快速路径中直接写入模型选区，不建图。
- [x] 1.6（同 1.1）模型导出携带 affinity：`getSelectionDOMRange` 与 `resolveDOMRangeInRoot` 的两个调用方传入 affinity；块末尾 dock 后无正文字符串时定位到删除线元素之后。证明：1.1 的测试通过，且在投影选区不存在、临时 DOM 偏好过期后仍通过。
- [x] 1.7（Chromium `authored-changes.spec.ts` 与 `suggestion-first-paint.spec.ts`：14 过 2 失败，两项在构建前以相同断言失败）原生输入门槛：光标在 dock 时模型输入，其余按 `next` 门槛；编程导出后的选区导入对模型光标同样跳过非用户来源；上下方向键目标横坐标取自导出光标。证明：Chromium 输入用例；jsdom 方向键用例。偏离：门槛与上下方向键未改；导出回声在快速路径中跳过。
- [x] 1.8（`composition-state-contract.test.ts` 44 项通过）输入法：折叠光标的组合以 `captureAuthoredTargetPoint` 记录模型光标，提交走模型路径；展开选区保留投影绑定。证明：`composition-state-contract.test.ts` 全部（含 retained 两组）；Chromium 两侧边缘组合输入。偏离：未改组合代码；无折叠投影选区时组合本就走模型路径；提交判定改为同时比较文档，因为写回后会多一次只改选区的提交。
- [x] 1.9（六条均通过）迁移六条测试：`merges own input at the edge of a retained deletion into one replacement through undo and redo`（不改断言）；`types and deletes at the right edge of retained text in Editing`（等待条件改为内部选区 affinity，不经公开读取，因为公开 `read.selection()` 不含 affinity）；`keeps a markup caret inside original text deleted by another view`（期望改为 `LXbravoR` 并改名）；`retained composition … 'propose' (retained: false)`（夹具改写模型选区）；`clears retained pending marks on keyboard movement in edit` 与 `in propose`（夹具改写模型选区，标记命令走 `editorCommands.toggleMark`；方向键在 dock 翻转时写完整选区，以清除待定格式）。证明：六条通过。偏离：4118 与组合用例无需改动即通过；读取投影光标的断言改用测试内 `readCaret`；待定格式用例只把最后一步输入改为 `applyModelOwnedTextInput`。
- [x] 1.10（skip: 未做，转入 Open work，见本计划 Open work 表 owner natamox）把图构建计数与 30 键剖析加入 `benchmarks/editor/benchmarks/plite-authored-typing-benchmark.ts` 的 lane，替代仓库外脚本。证明：脚本输出新字段。
- [x] 1.11（skip: large 达标，normal 1.4–1.5 倍与 paint p99 转入 Open work。部分：large 打字 p50 为 `next` 的 1.21–1.24 倍，达标；normal 为 1.4–1.5 倍；契约的 paint p99 预算 100ms 两次运行一过一败（93–119ms，`next` 33–80ms）；删除、方向键、回车 lane、删除数量扫描与 WebKit 未运行）阶段门槛：`pnpm --filter plitejs test:bun` 与 `test:react`、yjs 分区、platejs 与 www 相关用例通过；Chromium 与 WebKit 套件不新增失败（已知失败按行为契约计划 Open work 12、20、23 单列）；两个 Editable 用例通过；基准 large 下打字、正文 Backspace、删除线右缘 Backspace、方向键、回车各 30 次，p50 不高于同轮 `next` 的 1.25 倍，折叠路径每键图构建 0 次；另跑删除建议数 100、1000、5000 与单段内 50 条删除两组，p50 不随数量上升超过 10%。决定 keep 或整体撤回。

### 阶段二：清理

- [x] 2.1（skip: 已被取代：OnlyOffice 体验需要保留自绘光标与片段内投影选区，见 `2026-10-07-caret-inside-struck-text.md`）删除 `PliteViewSelectionCaret`、`isPliteViewSelectionCollapsed`、`bindViewSelection` 折叠分支、折叠历史条目、`applyRetainedViewSelectionMarkCommand` 折叠分支、`retainedCaretEdge` 的图遍历。证明：`git grep` 无引用；React 套件。
- [x] 2.2（skip: 阶段二已被取代，见 2.1）阶段门槛：同 1.11。删除行数以 `git diff --stat` 记录。决定 keep 或只撤回本阶段。

### 阶段三：测量片段编译

- [x] 3.1（skip: 挂载基准未重跑，转入 Open work。部分：`scratch-perf/profile-fixed-30-1.txt` 与 `-2.txt`：30 键 1506 与 1509ms，base 1511ms，修复前 4850ms；剖析中无图构建与片段编译；挂载基准未重跑）在 1.10 的 lane 中挂载 fragment 观察者，记录打字、回车（在删除上方插段）、Backspace 时的编译次数与挂载基准 retained 视图 paint p95。证明：lane 输出。若每键编译次数与删除建议总数无关且挂载 p95 回到 base 的 1.25 倍内，关闭本步；否则把不含绝对位置的片段设计列为 Open work，交给新计划。
- [x] 3.2（附录 A 与 `current-evidence.md` 已在 `2026-10-07-caret-inside-struck-text.md` 中更新；diff 评审在该计划收尾时合并运行。部分：deslop 与 no-comments 已运行；lint 通过（仅余构建前已有的一处）；unslop 见 Close；附录 A 行、`current-evidence.md` 对账与 diff 的 panel 未做，所有者已要求停止评审）写作与收尾：deslop、no-comments、unslop；`pnpm lint:fix`（仅本任务文件）；附录 A 增加 E7L 行与多段单元行；`docs/editor-behavior/current-evidence.md` 对账；diff 的 panel（reviews: api-build）。

## Close

后续：所有者 2026-10-07 改为 OnlyOffice 体验，点击、方向键与修订模式删除不再把光标推到删除线边缘；本计划的边缘规则表（1.2、1.3）与阶段二清理不再推进。光标在活文本中的模型选区与 affinity、`changes()` 缓存继续有效。见 `docs/plans/2026-10-07-caret-inside-struck-text.md`。

- 偏离（先列）：阶段一未按计划新增 `authored/dock.ts` 与纯函数规则表，改为更窄的实现，以缩小改动与风险。活文本中的折叠光标在选区导入前直接写入模型选区；删除与转置只在一次槽位查询判定可能贴近删除线时才建图，此时沿用原前置段，并以模型 affinity 作种子；`possibleDock` 与 `projection !== 'markup'` 例外保留给内容根与删除线内的光标。评审第二轮之后的计划修改与本次 diff 均未经评审，所有者要求停止评审。
- 落地：`core/selection-protocol.ts` 与 `dom/plugin/dom-editor.ts` 导出携带 affinity；`selection-controller.ts` 折叠光标快速导入与回声跳过；`mutation-controller.ts` 写回、删除侧别、转置；`content-root-navigation.ts` 移动种子与折叠移动写模型选区；`content-root-owners.ts` 的 `caretMayTouchRetained`；`selection-projected-dom.ts` 的 `writeMarkupSelection`、`writeModelCaret`、`isModelCaret`、`caretTouchesRetained`；`input-state.ts` 组合提交判定。
- 证明：plitejs bun 3028 项、React 1456 项、yjs 分区 275 项、platejs 与 www 相关 129 项通过；新增两条用例各自在变异下失败（导出与删除侧别）；Chromium `authored-changes.spec.ts` 等 16 项中 14 过，2 项在构建前以相同断言失败；浏览器打字基准 large p50 24.0–24.7ms（`next` 19.7–20.2ms，来自本日更早的运行，未交替）、normal 14.5–15.6ms（`next` 10.1–10.4ms）；第二次运行 large 第 2 轮 paint p99 106.6ms 超过契约 100ms，判为未通过。
- 限制：WebKit、移动端、删除与方向键 lane、删除数量扫描、挂载基准、两个 Editable 用例均未运行；`next` 基准未与本次交替运行。
- 计数（步骤 15 项）：完成 7（1.1、1.4–1.9）；部分 3（1.11、3.1、3.2）；未做 5（1.2、1.3 按偏离未做，1.10、2.1、2.2）；合计 15。
- 后续修复：点击删除线后原生光标仍停在不可编辑的删除线内，无法显示也无法输入。导入时光标已移到边缘，但只写了模型选区，未写回 DOM。修复后 `importProjectedDOMSelection` 把移到边缘的光标写回 DOM。Chromium `keeps the caret out of deleted text and types at its edges` 修复前失败、修复后通过；www suggestion 套件 23 过 12 败，失败清单与构建前相同；React 1456 项通过；Plite 浏览器 16 项 14 过，2 项为构建前已有失败。
- 后续修复二：编辑模式在删除线右缘按 Backspace 删除删除线文字后，光标留在删除线片段内，不显示且无法输入。删除命令的折叠结果落在删除线内时，按删除方向把光标移到边缘并存为模型光标。证明：`types and deletes at the right edge of retained text in Editing` 新增的断言在修复前失败；浏览器探针在 suggestion demo 编辑模式下连按三次 Backspace 后光标在删除线右侧，输入 `Q` 落在删除线之后。
- 后续修复三：普通文档变慢的根因是 `changes()` 每次提交对每条记录重算卡片内容。运行时按建议缓存“有可审内容”，键为记录与其操作的对象身份；提交时片段索引算出的受影响建议失效，没有增量索引时整体清空。证明：`authored-changes-contract.test.ts` hides a suggestion once its content is deleted after the list was read，去掉受影响失效时失败；打字基准两次运行 normal p50 10.7–10.9ms（`next` 10.1–10.4ms），large 19.0–20.7ms（`next` 19.7–20.2ms），契约全部通过；100 键剖析 4500–4509ms，修复前 5087–5189ms。
- 后续修复四：删除线边缘 Backspace 后撤销，光标消失（编辑模式跳到文档开头，修订模式回到删除线左侧）。撤销记录改为保存按键前的光标（含侧别），撤销恢复经 `writeMarkupSelection` 写回模型光标；三个光标写入函数移到 `react/editable/markup-selection.ts`。证明：`restores a retained character deleted in Editing as deleted text on undo` 改为键盘撤销并断言光标回到删除线右缘，撤销记录为空时失败；浏览器探针两种模式下撤销后光标在删除线右侧，输入落在删除线之后。全量：React 1456、bun 3029、yjs 通过；Chromium www 23 过 12 败、Plite 14 过 2 败，与构建前相同。
- 开放项见 Open work。

## Open work

| # | 项 | owner | 跟踪 |
| --- | --- | --- | --- |
| 1 | large 的 paint p99 偶尔接近 100ms（四次运行中一次 106.6ms，修复 `changes()` 后两次为 96 与 84.3ms），未定位 | natamox | 本表 |
| 2 | 已关闭：阶段二清理与边缘规则表被 `2026-10-07-caret-inside-struck-text.md` 取代 | natamox | 本表 |
| 3 | 基准 lane：删除、方向键、回车、删除数量扫描，图构建计数入库（1.10），挂载基准重跑（3.1） | natamox | 本表 |
| 4 | WebKit、两个 Editable、撤销与他人删除后的侧别用例 | natamox | 本表 |
| 5 | 已关闭：附录 A 与 `current-evidence.md` 已更新；diff 评审在 `2026-10-07-caret-inside-struck-text.md` 收尾时合并运行 | natamox | 本表 |
| 6 | 普通文档打字早期测得 `next` 的 1.4–1.5 倍（1.11），后续复测约 1.05 倍（见 Brief），未在仓库基准中复核 | natamox | 本表 |

## Open questions

无。所有者可用 Defaults 中的对应词改变取舍。

## Panel gate

- 第二轮（frozen `8000fc6767`，只审第一轮改动）：opus 与 sonnet 返回；fable 与 codex 在所有者要求停止评审时未返回，记为 missing。采纳 critical 1 项（撤销恢复原侧，默认不应覆盖），warning 与 nit 已改入计划。之后的计划修改未再评审。
- 第一轮（frozen `e6dc55fa9e`）：opus、fable、sonnet 与 codex gpt-6.1-sol 四席经 `cross.mjs` 只读运行，均返回。采纳 critical 7 项，处置见决策记录 panel 行；本计划已按其修改。opus 席位在只读模式下仍写了一个文件到 `~/.claude/plans/`，未触及仓库。

## Proof

| 门槛 | 方法 | 当前 | 通过条件 |
| --- | --- | --- | --- |
| 打字（浏览器） | `plite-authored-typing-benchmark.ts` large，与 `next` 交替两轮 | p50 117.5–120.6ms，`next` 19.9–20.0ms | 不高于同轮 `next` 1.25 倍 |
| 删除与移动 | 同一 lane：正文 Backspace、删除线右缘 Backspace、方向键、回车各 30 次 | 未测 | 同上；折叠路径图构建 0 次 |
| 删除数量 | 同一 lane：删除建议 100、1000、5000；单段 50 条 | 未测 | p50 随数量上升不超过 10% |
| 挂载 | `plite-authored-mounted-benchmark.ts` | views-1 p95 57.9ms | 阶段三测量，目标 base 约 33ms 的 1.25 倍内 |
| 行为 | 附录 C 每行一条用例与六条迁移测试 | 六条当前通过；S21 端点外推与多步骤命令关联已知失败 | 本计划改动的行全部通过；已知失败单列，不计入通过 |

## Appendix A：架构比较

三个候选由 opus、fable、sonnet 独立给出，fable 交叉评审打分 C2 21、C1 18、C3 11，主导者评分一致，取 C2 为基础。材料：`scratch-arch/arena/candidate-1.md`、`candidate-2.md`、`candidate-3.md`、`judge.md`、`synthesis.md`。

| 候选 | 光标表示 | 边缘规则 | 每键代价 | 结论 |
| --- | --- | --- | --- | --- |
| C1 | 模型选区与 affinity | 纯函数表读 dock | 与文档无关 | 移植：纯函数表、删除返回 affinity；其 index 持有编译结果经评审否决（片段含绝对位置） |
| C2 | 模型选区与 affinity；投影选区永不折叠 | dock 查询 | 与文档无关 | 基础 |
| C3 | 绑定投影光标，分段惰性构建 | 邻域表 | 三处热路径读分段，仍为整文档 | 否决；移植差分证明 |
| 现状 | 两份 | 全图 | 整文档加全部删除重编译 | 被替换 |

挑战变化：improved。第一轮评审后：原阶段一与二合并，因为折叠光标的表示与读取它的边缘规则必须同时切换；片段缓存从实现改为测量，因为编译结果含绝对位置，index 不跟踪位置变化；新增无 affinity 时的统一侧别、模型导出携带 affinity、展开选区结果交接与展开选区的输入法锚点。

## Appendix B：前提核验

探针 `scratch-arch/census/probe.ts`（日志 `probe.log`），用仓库 bun 在 `packages/plitejs` 运行，只走无 React 的模型路径。

| 前提 | 级别 | 结果 |
| --- | --- | --- |
| 边缘光标的 affinity 决定新字落在删除线哪侧 | 已运行 | 成立：forward 得 `LbravoXY R`，backward 得 `LXYbravo R` |
| 光标经输入、删除回到 dock 后新字落在原侧 | 已运行 | 不成立：右缘输入后两次 Backspace 再输入得 `LZbravo R`；输入一字、删一字后再输入得 `LYbravo R`。生产者为 `delete-text.ts:732-738` 生成的无 affinity 选区。由步骤 1.4 修正 |
| 撤销后 dock 光标的侧可预期 | 已运行 | 成立：撤销恢复原侧，forward 得 `LbravoZ R`，backward 得 `LZbravo R`（探针 `undo-side`）。第一版据单侧结果判为无规则，已更正 |
| 模型光标的 affinity 在输入后保留 | 已撤回 | 第一版用公开 `read.selection()` 读取，该接口只投影 anchor 与 focus（`core/selection-protocol.ts:100-104`），结论无效；改读内部选区的尝试读到的是源编辑器而非视图的选区，也无结论。只保留上一行的渲染结果 |
| 模型导出携带 affinity | 读代码 | 不成立：`getSelectionDOMRange` 只取 anchor 与 focus（`core/selection-protocol.ts:645-652`），`resolveDOMRangeInRoot` 对折叠范围传 `undefined`（`dom-editor.ts:1155-1167`）。由步骤 1.6 修正 |
| 只改 affinity 会清除待定格式 | 读代码（`set-selection.ts:85-95`） | 不成立：只在点变化时清除。由 1.9 的标记用例约束 |
| 无关提交后未受影响变更的片段可安全复用 | 已运行与读代码 | 不成立：无观察者时 20 条全部重编译；片段含绝对路径，index 不因上方插段而失效。片段缓存不在本计划实现 |
| 原生光标在 `contenteditable=false` 旁保持模型指定的一侧 | 未运行 | 步骤 1.1 先行验证，含 Chromium 与 WebKit |

## Appendix C：行为契约到规则

| 行 | 光标状态 | 决定者 |
| --- | --- | --- |
| E6、S6、S7、S8L 输入、S16 | 模型点在 dock，affinity 指明侧（forward 为删除线右侧，backward 为左侧）；无 affinity 落左缘 | authored 插入关联钩子；多步骤命令的关联缺失仍为行为契约计划 Open work 20 |
| E7 | 右缘，编辑模式 Backspace | 规则表：删除单元最近一侧的最后一个删除字符，返回 forward 光标 |
| E7L | 左缘，编辑模式 Delete | 规则表：删除单元第一个删除字符，返回 backward 光标 |
| S8 | 右缘，修订模式 Backspace | 规则表：越过单元，普通删除左侧正文，空间分组并入本人删除；被删字符并入单元，光标位于单元左侧，返回 backward 光标 |
| S8L Delete | 左缘，修订模式 Delete | 规则表：越过单元，普通删除右侧正文 |
| E7b、S9、S21 | 展开选区含删除线 | 投影选区与现有分组路径；结果写回模型选区 |
| S19 | 落点在删除线上 | 规则表的落点：较近边缘 |
| S20 | 组合开始于 dock | 模型光标锚点，提交走模型路径 |
| 方向键 | dock 处 | 规则表：同点翻转 affinity 并写完整选区，算一次停顿 |
| 点击删除线内 | DOM 点在删除线元素内 | 导入：较近边缘 |
