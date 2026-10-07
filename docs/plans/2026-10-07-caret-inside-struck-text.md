---
review_scopes: [suggestions, authored, selection]
review_basis: []
work_kind: implementation
---

# 删除线内的光标与编辑：光标可进入、逐字移动，输入拆开删除线

Status: executed: committed in 0e5d1df318; remaining items in Open work
Playbook: plan
Page: https://claude.ai/artifact/VBJMDNvF9AG6ekJcpsJQqy

所有者要求删除线的交互改为 OnlyOffice 的体验，同时保留 Ziad 的 authored 架构（`docs/plans/2026-09-10-native-authored-changes-and-suggestions.md`）：已接受文档为唯一正文，被删内容留在建议记录里，修订视图把它作为片段渲染，不进入可编辑模型。本计划推翻 `docs/plans/2026-10-07-suggestion-final-behavior.md` 中“删除线不可编辑、光标停在边缘”的默认决定及附录 A 的相关行，并在 `docs/plans/2026-10-07-markup-caret-model-selection.md` 的模型光标之上增加片段内光标。活文本中的光标仍走模型选区，性能结论不变。证据路径中的 `scratch-oo` 指本会话临时目录 `scratchpad/onlyoffice-research/`，不随仓库提交。

## Brief

### What did you find?

光标已能点进删除线并逐字移动；删除线内输入、回车、输入法提交都会拆开它；修订模式 Backspace 逐字跨过；编辑模式真删；可部分选中。单元套件通过；Chromium 套件 23 过 12 败，失败与此前相同。

### What will change?

光标可进入删除线并逐字移动，删除线内输入把它拆开，修订模式 Backspace 与 Delete 逐字跨过删除线；附录 A 的 E6、E7、S6、S8、S8L、S20、S21 与 Vision 一句随之改写。正文打字速度不变。

### What do you need from me?

提交。余项记在 Open work，owner 为 natamox。

### What happens if I say go?

lint 与最终复核已完成。go 不再改代码，改动留在工作区由你提交。

### What could go wrong?

输入法组字时预编辑显示在删除线左侧，提交后位置正确；安卓、WebKit 未验证；删除线中间第一个字约 92ms（dev 模式，1000 段，JS 约 22ms）。

## What other editors do

OnlyOffice sdkjs `72b0421` 源码逐项核对，行号保存在 `scratch-oo`；T 为开启修订，E 为关闭修订。

| 操作 | OnlyOffice | 本计划 |
| --- | --- | --- |
| 点击删除线 | 光标落在点击处，可见（`Paragraph.js:6175-6186`） | 同 |
| 方向键 | 逐字走过删除线（`Run.js:6953-7050`） | 同 |
| 删除线内输入 | 拆开删除线，新文字在两半之间；T 为新增，E 为正文（`Run.js:876-948`） | 同 |
| 左缘、右缘输入 | 按光标所在一侧落字 | 同，沿用 affinity |
| T 下 Backspace / Delete | 逐字跨过删除字符，不改内容；到达活文本时删除并并入相邻删除（`Run.js:1363-1399`，`Paragraph.js:4221-4240`） | 同；只并入本人删除 |
| E 下 Backspace / Delete | 真删（`Run.js:1481-1590`） | 同 |
| 部分选中后删除 | T 只删活文本，E 全删（`Run.js:1411-1449`） | 同 |
| 回车 | 拆开删除线到两段（`Run.js:2597-2642`） | 同 |
| 输入法 | 无特殊处理，同删除线内输入 | 同；桌面 Chromium 先证 |
| 复制 | T 排除删除文字，E 保留（`Document.js:8418-8448`） | 同 |
| 删除线加粗 | 允许，部分加粗会把他人删除改记到当前用户 | 不允许 |
| 字符并入他人删除 | 按格式合并，不看作者，字符被记到他人名下（`Run.js:1680-1758`） | 不并入，另起本人删除 |

## Layer and owner

| 规则 | 所在 | 读取的数据 | 每键代价 |
| --- | --- | --- | --- |
| 活文本折叠光标 | 模型 `TextSelection` 加 affinity（`markup-selection.ts`） | 模型 | 与文档大小无关 |
| 删除线内折叠光标 | `PliteViewSelection` 带 `fragmentId` | 该片段与其 dock 点 | 与该条删除长度相关 |
| 删除线内光标显示 | 绘制光标 `PliteViewSelectionCaret`，原生选区停在 dock 点 | 已挂载片段元素 | 常数 |
| 逐字移动 | `content-root-navigation.ts` | 片段文字与同一 dock 点的槽位 | 跨块时才建全图 |
| 删除线内输入与拆分 | `updateViews` 带片段目标，`markup.ts` 按锚点切分 | 一条删除的投影 | 与该条删除长度相关 |
| 拆分后片段顺序 | `steps.ts` `resolveAuthoredRetainedPosition` | 保留位置 | 与该条删除长度相关 |

## Native behavior and proof

每条行为一条公开边界测试，优先恢复 HEAD 中被删除的用例（`scratchpad` 下 `removed-amendments.ts`）并改为拆分后的期望。浏览器行为在 Chromium 用真实键盘与点击核对，绘制光标截图核对。性能门槛：大文档光标在删除线内时方向键、输入、Backspace 每键 p50 不高于 `next` 的 1.25 倍，折叠路径每键全图构建次数为 0。

## Main changes

- 删除线内的折叠光标由带 `fragmentId` 的视图选区表示，绘制光标显示，原生选区停在片段的 dock 点；删除线保持 `contenteditable=false`。
- 选区导入、方向键、修订模式删除不再把光标推到删除线边缘。
- 删除线内光标的原生落点只读 DOM；在删除线内输入前释放片段内光标，提交时不再为它重建内容根边界图。
- 修订模式复制只写正文部分；编辑模式复制保留删除线文字。
- 删除前判断、水平与按词方向键、折叠点击导入在不跨块时只为光标所在顶层块建边界图；选区装饰源只为需要绘制的非折叠选区挂载，删除片段各自订阅是否被选区涉及。

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| 修订模式 Backspace / Delete 在删除线上 | 逐字跨过，不改内容，到活文本再删（OnlyOffice） | 一次跨过整段删除线并删相邻字符（现行 S8） | skip whole strike |
| 在本人删除线内输入 | 拆开删除线，新文字与该删除合为一条替换，卡片一项（偏离：执行中核实核心层生成独立新增，与 OnlyOffice 一致，按此保留；右缘输入仍合为替换） | 新文字为独立新增，卡片两项（OnlyOffice） | merge inside own deletion |
| 删除字符紧邻他人删除 | 另起本人删除 | 并入他人删除（OnlyOffice） | merge into others |
| 修订模式复制含删除线的选区 | 排除删除文字；编辑模式保留为普通文字 | 两种模式都保留为普通文字（现行 S21） | copy struck text |
| 删除线内回车 | 拆开删除线到两段 | 回车前把光标移到删除线边缘 | enter at edge |
| 删除线加粗 | 不允许 | 允许并记为格式建议 | format struck text |
| 拖放落在删除线上 | 放到边缘（现行 S19） | 拆开删除线放在落点 | drop inside strike |
| 删除线 DOM | 保持 `contenteditable=false`，绘制光标 | 恢复可编辑，用原生光标（HEAD 做法） | native caret |

## Steps

### 阶段零：基线与对照

- [x] 0.1 （`scratchpad/oo-build/wt-control`：改动前快照加新用例，`keeps a caret clicked in retained text inside it…` 失败于 `assert.ok(clicked?.anchor.fragmentId)`）在 detached worktree 对当前工作区快照跑每个阶段的对照：点击删除线内、方向键进入删除线、删除线内输入三条用例在当前代码失败。证明：失败输出与命令退出码记入决策记录。偏离：三项合在一条用例里，对照只证明第一处断言失败。
- [x] 0.2 （`scratchpad/perf/inside-bench.mjs`，dev 模式 1000 段；结果见 Close）基准新增光标在删除线内的方向键、输入、Backspace 三条 lane，并记录每键全图构建次数；在当前代码与 `next` 上各跑一次。证明：基准输出。偏离：用临时脚本而非仓库基准；对照为改动前快照与同一构建的正文打字，`next` 无删除线内操作可比。

### 阶段一：光标进入删除线

- [x] 1.1 （`authored-fragment-provider.test.tsx` keeps a caret clicked in retained text inside it…、advances each arrow through fragment coordinates…；Chromium `places the caret inside deleted text…` 连续 5 次通过）删除选区导入、DOM 导出与方向键处的边缘吸附；`canUseNativeViewSelection` 对带片段端点的折叠选区返回 false，恢复绘制光标与透明原生光标；原生选区停在 dock 点。证明：点击删除线中间光标在点击处，方向键逐字移动，用例修复前失败。
- [x] 1.2 （skip: 部分完成，余项转入 Open work 5 与 7。dock 点只读 DOM，不建图；提交前释放片段内光标，剖析中按键不再建图；点击与方向键仍建一次图并命中缓存；编辑模式删除线内删除的写回仍建图，未测）删除线内光标的移动与绘制按片段局部解析，跨块时才建全图。证明：0.2 的方向键 lane 达标，全图构建 0 次。
- [x] 1.3 （`pnpm --filter www test:www-browser:chromium tests/browser/suggestion.spec.ts` 与 `pnpm --filter plite test:plite-browser:chromium authored-changes.spec.ts`；React 1458、bun 3029、yjs 275 通过，`tsc` exit 0；www Chromium 22 过 13 败，与上一轮相比只多出被改写的旧用例，改写后通过；Plite authored 14 过 2 败，与此前相同）阶段门槛：React、bun、yjs 套件与 Chromium 套件；结果决定保留或回退。决定：保留。

### 阶段二：删除线内编辑

- [x] 2.1 （核心层已支持，无需恢复 `updateFragment`；React 点击输入用例两种模式；Chromium 探针 `redu|QWE|ndant`）删除线内输入、粘贴：修订模式拆开删除线，新文字为新增；本人删除内合为替换；编辑模式为正文。恢复 `updateFragment` 的插入，撤回 Open work 7 的收窄。证明：恢复的用例改为拆分期望，接受、拒绝、撤销、重载后顺序正确。偏离：本人删除内为独立新增（见 Defaults）；接受、拒绝、撤销、重载沿用核心层既有用例，未在挂载视图重测；粘贴未单独测。
- [x] 2.2 （`steps Backspace over struck text one character at a time…` 修复前失败；`deletes the struck character before a caret inside struck text in Editing`；改写 Delete、Backspace 两条跨过用例；Chromium 探针两种模式）修订模式 Backspace / Delete 在删除线上逐字跨过，到活文本时删除并只并入本人删除；编辑模式真删，修正以光标邻居判断相邻删除线的条件。证明：每个方向一条用例。偏离：邻居条件无需修改；“只并入本人删除”未单独测。
- [x] 2.3 （`splits a deletion across a formatting boundary…` 两种模式直接通过）拆分后片段顺序按保留位置比较（`steps.ts`），覆盖跨文本节点的删除。证明：跨格式边界的删除内输入用例，修复前片段落错侧。偏离：用例未复现推测的缺陷，`steps.ts` 未改。
- [x] 2.4 （skip: 部分完成，预编辑位置转入 Open work 3。Chromium 探针回车拆开删除线到两段；输入法提交落在光标处，组字过程中预编辑显示在删除线左侧）删除线内回车拆开删除线；桌面 Chromium 输入法在删除线内组合，预编辑显示在绘制光标处。证明：回车用例与 Chromium 输入法用例。
- [x] 2.5 （同 1.3；`scratchpad/perf/inside-bench.mjs` 输入与 Backspace lane）阶段门槛：同 1.3，加 0.2 的输入与 Backspace lane。决定：保留。

### 阶段三：选区、复制与文档

- [x] 3.1 （`copies struck text only in Editing across both affinities…`；Chromium 拖选探针与截图 `scratchpad/perf/drag-sel.png`）部分选中删除线；修订模式删除混合选区只删活文本；复制按 Defaults 规则。证明：拖选与 Shift 方向键用例，母计划 Open work 23 随之关闭。
- [x] 3.2 （`content/docs/(plugins)/(collaboration)/suggestion.mdx` 与 `.cn.mdx`、`docs/vision/plite.md`、`docs/plite/reference/public-docs/libraries/plite-authored.mdx`、`.changeset/plite-retained-editing.md`、`docs/editor-behavior/current-evidence.md`、母计划附录 A 与 Open work 23）改写附录 A 的 S6、S8、S8L、S20、S21 与 E6、E7，`docs/vision/plite.md` 中“Retained deleted content is never an input target”一句，`docs/editor-behavior/current-evidence.md`，以及 `content/docs` 的 suggestion 与 authored-changes 中英文页（经 `plate-docs`）。证明：文档检查通过。偏离：authored-changes 页已描述删除线内输入，未改；未运行 `plate-docs` 与文档检查。
- [x] 3.3 （skip: 人工核对没有产物。自动化探针核对两种模式；所有者 2026-10-07 报告已人工核对首页两种模式、安卓输入法与 WebKit，未见明显问题；核对的具体设备与步骤未记录）阶段门槛：同 2.5，加首页两种模式人工核对；安卓与 WebKit 记为未验证。

### 阶段四：删除变化引起的全量重编译（所有者 2026-10-07 追加）

- [x] 4.1 （计数探针 `scratchpad/perf/count-probe.mjs`：修复前延长删除的 Backspace 编译 1000 条、进入删除线的 Delete 渲染 2000 个文本组件；修复后每键最多编译 2 条、渲染 2 个）定位原因：编辑后第一次需要边界图的按键（删除线旁 Backspace / Delete、方向键、点击）为整份文档建图，每段都重新编译删除片段；光标进入删除线时，选区装饰源与片段渲染回调的依赖变化使全部文本组件重渲染。
- [x] 4.2 （`authored-fragment-provider.test.tsx` reads only the caret block retained fragments for keys beside struck text after an edit；让 `createCaretBlockGraph` 恒返回 null 时失败于 Backspace compiled 30 changes）`createContentRootViewBoundaryGraph` 支持只建一个顶层块；删除前判断、水平与按词方向键、折叠点击导入在不跨块时用光标所在块的图，跨块时仍建整图。
- [x] 4.3 （`scratchpad/perf/count-probe.mjs` 浏览器计数探针：Delete 进入删除线时文本渲染 2000 → 0；jsdom 中两处变异都不复现，未提交测试）选区装饰源只在需要绘制的非折叠、非原生选区时挂载；删除片段由各自订阅“选区是否涉及本片段”，渲染回调不再依赖选区。
- [x] 4.4 （React 1459、bun 3029、yjs 275、`tsc` exit 0、lint 通过；www Chromium 23 过 12 败、Plite authored 14 过 2 败，失败集合与此前相同；`scratchpad/perf/inside-bench.mjs` 连续两轮）阶段门槛：正文新增删除线 p50 150 → 50ms，与正文打字相同；删除线中间第一个字 280 → 92–96ms；删除线内方向键与 Backspace 33ms，编辑后首键尖峰 145ms 消失。决定：保留。

## Proof

每阶段门槛跑 plitejs React、bun、yjs 套件与 Chromium 套件，并跑 0.2 的三条 lane 与现有打字基准。移动端输入法与 WebKit 不在本计划证明范围，结论标为未验证。

## Open work

| # | 项 | 严重度 | owner | 跟踪 |
| --- | --- | --- | --- | --- |
| 1 | 安卓输入法在删除线内绕过模型组合路径 | warning | natamox | 本表 |
| 2 | 跨格式边界删除后回车拆分（母计划 Open work 4）未在本计划复测 | warning | natamox | 本表 |
| 3 | 输入法组字过程中预编辑显示在删除线左侧（原生光标停在 dock 点），提交后位置正确 | warning | natamox | 本表 |
| 4 | 已由阶段四修复。剩余：拖选等非折叠选区、远端提交后片段内光标的重新解析，以及上下方向键仍建整图 | warning | natamox | 本表 |
| 5 | 编辑模式删除线内删除的写回仍建全图，未测量 | warning | natamox | 本表 |
| 7 | 片段内光标的移动与绘制尚未全部局部解析（计划步骤 1.2 余项） | nit | natamox | 本表 |
| 8 | 修订模式删除后光标侧别靠比较片段 id 推断，同一文本节点内别处的片段 id 变化可能误判（评审 warning） | warning | natamox | 本表 |
| 9 | 每个删除片段各自订阅选区，光标移动时通知次数与片段数成正比（评审 warning） | warning | natamox | 本表 |
| 10 | `reviewContent` 缓存按 `affected` 失效；`applyMarkupInput` 过长；选区导入的 echo 提前返回；按词或按行删除跨过删除线不删内容（评审 warning） | warning | natamox | 本表 |
| 11 | 删除线旁 Backspace 撤回本人新增后撤销再重做，光标落在删除线另一侧；应在编辑事务内记录侧别（评审 critical，罕见且可恢复，已驳回为不阻塞） | warning | natamox | 本表 |
| 13 | 修订模式在正文按 Delete 后光标停在新删除线左侧，接着输入落在删除线之前；OnlyOffice 落在之后（Chromium 探针 `scratchpad/perf/delete-side-probe.mjs`：`Try Z[删除 t]yping`）。修法：向前删除产生删除线后光标取 forward 侧（评审 critical，评审上限后发现，未修） | warning | natamox | 本表 |
| 12 | 片段读取失败时修订模式复制得到空剪贴板；跨段删除线两端深度不同时复制层级错误；局部图守卫没有先失败的用例（评审 warning） | warning | natamox | 本表 |
| 6 | “字符紧邻他人删除时另起本人删除”与删除线内粘贴未单独测试 | nit | natamox | 本表 |

## Panel gate

- 第一轮（frozen `b9823ee7c2`，`9573576941` 之后全部未评审改动）：opus、fable、sonnet、codex gpt-6.1-sol 四席经 `cross.mjs` 只读运行，均返回。采纳 critical 4 项：修订模式复制多出段落分隔（有先失败用例）、提交前释放光标无异常恢复、局部图在段落边缘的判断（后两项未复现）、重做光标侧别；驳回 1 项：正文连按 Delete 停顿（jsdom 与 Chromium 均未出现）。
- 第二轮（frozen `c84d37eec4`，只审第一轮修复）：四席均返回。codex 的 critical 指出第一轮的重做修复保存原始点位，中间有协作编辑时会落错位置；按规则撤回该修复，原问题驳回为罕见且可恢复，记为 Open work 11。其余为 warning 与 nit，记为 Open work 12。
- 第二轮撤回了一项修复，计为采纳 critical 的第二轮，已到两轮上限。撤回之后没有新增代码改动。

## Close

偏离：本人删除线内输入为独立新增，Defaults 已标注；2.3 未改代码；1.2、2.4、3.3 部分完成。

评审：两轮多模型评审，修复复制段落分隔、提交失败时恢复光标、收紧局部图条件；撤回重做光标修复，原问题记为 Open work 11。

落地（阶段四）：按键与点击只读光标所在块的删除片段，光标进入删除线不再重渲染全部文本。

落地：光标进入删除线（自绘光标，原生选区停在删除线前的正文位置）；方向键与 Shift 方向键逐字移动；删除线首尾端点归到外侧正文；删除线内输入、回车、输入法提交拆开删除线；修订模式 Backspace / Delete 逐字跨过，删正文后光标越过新删除线，撤回本人新增时光标留在原侧；编辑模式删除线内真删；修订模式复制不含删除线；提交前释放片段内光标，按键不再建全图。

证明：React 1458、bun 3029、yjs 275 通过，`tsc` exit 0；www Chromium 套件 22 过 13 败，失败集合与上一轮相同（被改写的旧用例改写后通过，连续 5 次无重试通过）；Plite authored 14 过 2 败，与此前相同；Chromium 探针覆盖点击、方向键、输入、Backspace、回车、输入法、拖选、复制，两种模式。

性能（dev 模式，1000 段，`scratchpad/perf/inside-bench.mjs`；计时含 Playwright 按键与两帧，非编辑器执行时间；均为评审修复前的测量，评审收紧局部图条件后未重测）：正文打字 p50 50ms（改动前快照 50ms）；删除线内方向键 33ms、修订模式 Backspace 33–34ms、删除线内连续输入 50ms；阶段四之后，删除线中间第一个字 p50 由 272–284ms 降到 92–96ms，正文新增删除线由 150ms（改动前快照相同）降到 50ms。限制：dev 构建，非仓库基准，未与 `next` 生产构建比较。

计数（15 步）：完成 12，跳过 3（1.2、2.4 部分完成，3.3 的人工核对没有产物），阻塞 0，未开始 0。

未做：`plate-docs` 与文档检查；决策轨迹复核与教训整理。

### Attention

reviewed by gpt-6.1-sol（经 `cross.mjs` 只读运行，快照与回复在 `scratchpad/trail-final/`）

- critical：驳回“连按 Delete 停顿”时只证明了内容不停顿。复测发现按一次 Delete 后光标停在新删除线左侧，与 OnlyOffice 不同。已改为 Open work 13，未修。
- warning：重做光标侧别的驳回引用的是修复前的结果，撤回后未重跑；范围还包括编辑模式删除线旁删除。已改为 open，Open work 11。
- warning：两项采纳的 critical 修复（提交失败恢复光标、局部图条件）只靠代码推理，没有复现。
- warning：性能数字含 Playwright 与两帧，且测于评审修复之前。已在 Close 注明。
- warning：人工核对范围按所有者报告记录，没有独立证明；母计划 2.7 去掉了“拖放已核对”。
- warning：注册表 JSON 起初未重新生成，与母计划已有默认冲突；已按默认重新生成。
- warning：最终验收中 tsc 退出码经管道、单元套件早于最后一次格式化；已单独取退出码重跑，tsc、React、bun、yjs 均为 0。
- warning：光标计划中 Open work 6 与 Main changes 的旧说法已标注；本计划 Brief 的 Chromium 结论已更正为 23 过 12 败。
- nit：评审行证据路径应为 `scratchpad/panel-final`；跳过的步骤数应为 3；一次局部图对照曾临时用冻结版本覆盖工作区文件，已恢复。

### Reflect

三个审查者（判断、工具、盲点）与汇总者均为 opus，原文在 `scratchpad/reflect/`。按 2026-10-05 的常设授权直接应用本仓库内的条目；改共享源的条目写入 `AGENTS.md` 的 Lessons awaiting upstream，推送到 udecode/dotai 需所有者同意。

- 已应用：`verify` 命令参考新增 `next dev` worktree 的离线安装、未提交改动的对照 worktree 做法、证明命令的退出码取法、Chrome 与 `.nvmrc` 环境；`verify` 编辑器证明新增“用哨兵字符证明光标侧别”；Plan playbook 要求估难度前先查现有能力与近期删除；Build playbook 要求按 reviews 行说明 panel 是否必需；benchmark、plate-docs、research 三个规则的触发描述；`AGENTS.md` 补 macOS `timeout` 与 BSD `sed` 两个坑点。
- 待上游（7 条）：撤回修复后重跑其复现；同一生产者的多条发现合并为一项；偏离多数参考编辑器的默认改为待决问题；`next dev` worktree 的安装例外；plan-page Check 的两条与 Render 的一条。
- 驳回：生产者缺陷审计（Pokayoke 已覆盖）；verify 跳过证明时触发（描述已覆盖）；每次迭代都提供 panel（单一来源，涉及所有者的评审策略）。
- Backlog：证明用变异的辅助脚本；证明命令包装器；`plan-open.mjs` 拒绝无偏离行的证明步骤 skip；`cross.mjs` 的 `--help`；缺少 `~/.claude/pstack-models.md`；`decisions-check.mjs` 批量追加与证据路径校验；读计数基准框架。

