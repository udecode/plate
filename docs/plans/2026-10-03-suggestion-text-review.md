---
review_scopes: [suggestions, authored, comments]
review_basis: []
work_kind: implementation
---

# 实现 Editing 与 Suggesting 的文本编辑规则

Status: building

本方案覆盖 Editing 与 Suggesting 的文本编辑语义、提案原文留存、讨论 UI 及持久化接入。实现沿用 Plite authored、Plate suggestion 和现有 registry 组件，不新增独立建议存储。

核心实现和分项自动化验证已完成。最终生产路径性能、原生浏览器输入、包 manifest 与 attestation 尚待验收。

## Outcome

让用户在 Editing 中直接改正文，在 Suggesting 中提出或修改建议；正文局部变化、建议身份和讨论关联保持一致。右侧展示留存的提案内容，独立于正文中的剩余效果。

| 操作 | Editing（直接编辑） | Suggesting（建议模式） |
| --- | --- | --- |
| 输入普通文字 | 直接插入正文 | 创建新增建议 |
| 在已有建议中输入 | 新文字为普通正文，原建议在输入处断开 | 本人新增建议内的输入并入原建议；他人建议内的输入创建自己的独立建议 |
| 删除普通正文 | 直接删除 | 创建删除建议 |
| 删除待审新增文字 | 直接删除选中部分 | 本人的直接删除；他人的创建自己的删除建议 |
| 操作已有删除线文字 | 允许输入、删除；输入成为独立正文，删除直接移除选中部分 | 输入创建独立新增建议；重复删除不产生新建议 |
| 选中文字后输入 | 删除选中内容，再插入普通正文 | 按上述删除规则处理，再插入新增建议 |

共同规则：

- Editing 对本人、他人的建议采用相同操作规则，以拥有编辑权限为前提。
- 连续输入或删除按同一操作合并，不逐字创建建议。
- 建议被拆开后，剩余部分保留原作者和关联讨论，不重复创建讨论。
- 局部修改只影响选中部分，不自动接受或拒绝整条建议。
- 撤销、重做同时恢复文字、建议标记和关联状态。
- 切换模式只影响后续操作，不清除已有建议。

普通人工 mark 操作直接修改格式，不新增格式建议。显式 AI 格式提案仍需接受后生效；已有格式提案保留读取能力。

## Scope

修改责任沿现有调用链分配。Plite 的 authored owner 负责内容身份、原子事务、决定、历史、保存和协作；Plate 负责模式及作者策略；registry 负责卡片和讨论展示。宿主负责文档与评论的配套保存和权限验证。

不新增业务数据库、审计服务、第二套 suggestion store 或独立同步通道。不承诺 Notion 的其他未观察行为。不把所有历史 operation 永久保存，也不移除底层结构提案能力。

## What other editors do

Notion 的局部输入、删除和原文留存交互作为行为参考；其内部数据模型及并发规则不作为实现依据。

| Delta | 编辑器 | 本次依据 | 对方案的作用 |
| --- | --- | --- | --- |
| added | Notion | 截图中的局部编辑行为；协作边界未验证 | 定义可见交互，不照搬未知内部结构 |
| added | Plate / Plite | 当前 authored、Comments、AI、codec 和 Yjs 源码 | 定位必须承担语义的现有 owner |

ProseMirror、Lexical、Slate 和 Tiptap 未在本方案中作新外部行为结论。实现路线取决于本仓库的原生事务、保留文本和协作要求。

## Public API

保留现有 Editing 接入，策略修复在命令下面完成。

```tsx before
<EditorRoot editor={editor} authored={{ intent: 'edit', projection: 'markup' }}>
  <Editor />
</EditorRoot>
```

```tsx after
<EditorRoot editor={editor} authored={{ intent: 'edit', projection: 'markup' }}>
  <Editor />
</EditorRoot>
```

右侧通过 authored 查询读取信息。以下 before/after 展示查询入口的变化。

```ts before
const page = authored.read.changes({ limit: 50 });
const detail = authored.read.details(changeId);
```

```ts after
const page = authored.read.changes({ proposals: true, limit: 50 });
const detail = authored.read.details(changeId);
const original = detail.original;
```

`proposals: true` 在原生查询中筛选提案，覆盖待审和已结束的提案。普通直接编辑也可能产生 accepted change record，不能只按 status 判断是否曾为提案。分页必须在筛选后的有序集合上进行。原文只在打开详情时加载。

`original` 表达 available、unavailable 或 null。null 表示普通直接编辑，没有提案原文；unavailable 表示旧数据已经丢失原文。当前剩余效果继续由现有 parts 和状态查询表达，不再存一份独立可变范围列表。

普通编辑命令和 accept/reject 入口保留。组件不自行切分作者、清 dependency、修改 snapshot 或发送补偿操作。若现有原生扩展入口无法表达 Plate 自动捕获策略，只增加一个经 `best-api` 审查的声明入口，不公开 wire tuple、seal token 或 producer 会话管理 API。

## Document shape

文档仍通过 `editor.read.value()` 保存完整 envelope。下面只表达逻辑归属，省略实际内容和现有 wire tuple；不能把此示意 JSON 用作迁移输入。

```json before
{
  "children": "accepted 正文",
  "meta": { "authored": "现有位置、变更和操作的编码状态" }
}
```

```json after
{
  "children": "accepted 正文",
  "meta": {
    "authored": "包含提案身份、原文留存及当前有效操作的新版本编码状态"
  }
}
```

在 authored 的同一持久化 owner 内表达以下事实：

| Delta | 事实 | 存储或推导方式 | 使用者 |
| --- | --- | --- | --- |
| added | 提案身份及原作者 | 稳定 change ID、作者和提案来源 | 审阅查询、讨论关联 |
| added | 提案内容 | 原生内容片段及明确的内容贡献身份，不存历史 path | 右侧卡片、显式 native review 保存 |
| changed | 剩余可决定内容 | 按现有 origins、positions 和操作关系计算，索引由该 owner 更新 | accept/reject、定位、markup |
| changed | 独立编辑 | canonical operation 表达插入、直接删除和属性变化 | 正文、历史、协作和 checkpoint |
| changed | 建议间关系 | 保留同一内容上新增建议与另一作者删除建议的因果关系 | 决定顺序、离线回放 |
| changed | 评论关联 | 继续使用 Comments 的 change target | 回复、卡片，不存第二份提案原文 |

原文留存与正文剩余效果是不同事实。接受或拒绝必须使用当前有效内容，不能通过回填原文快照执行。

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editing 作者分支 | 自己与他人的提案走不同路径 | 所有可编辑者直接操作选中内容 | Plate 策略 + Plite authored 事务 | Editing/Suggesting 行为契约 | 普通输入、retained 输入、混合选区 | 两作者同操作得到同样正文语义 | 隐式依赖阻塞 | rearchitect |
| Suggesting 作者分支 | 原生已有提案归属机制 | 保留本人 amendment，外人产生自己的建议 | 同上 | Editing/Suggesting 行为契约 | 自动捕获、分组、替换 | 自己合并、他人独立、重复删线无新建议 | 误把 Editing 的无作者差别扩大到此模式 | keep |
| 原文留存 | details 从当前投影产生内容，关闭后可压缩正文 | 提案内容在 authored 内持久化 | Plite authored | 右侧保留原提案 | codec、checkpoint、查询、卡片 | 直接编辑、关组、重载后内容规则一致 | 未验证分组与多 producer 收敛 | gate |
| 内容身份 | origins、位置和 canonical effects | 继续作为唯一正文变更依据 | Plite | 拆分、retained、历史和并发仍需稳定身份 | 扩展现有原生操作 | 真实 link 与 retained 探针 | 富文本结构承载 | keep |
| marks | 可形成 format proposal | 人工自动捕获直接改格式，显式提案保持显式语义 | Plate 策略，Plite 执行 | 人工格式操作与显式提案语义分离 | UI 命令、混合事务、AI | mark 直接生效但 AI 尚未接受格式不外泄 | 事务分类错误 | gate |
| 讨论发现 | 依赖现存 ranges 和 threads | 从提案记录分页列出，再关联回复 | authored 查询 + registry | 无正文或无回复也可找回 | discussion、评论工具栏 | 零范围零回复重载仍有记录 | 全表扫描及分页遗漏 | gate |
| 独立 archive store | 不存在 | 不增加 | 无 | 会与 authored 决定、存储及协作重复 | 扩展原生查询 | 卡片来自同一记录 | 双写不一致 | cut |

比较过两种数据模型。选择扩展原生 authored 图，因为它已有内容身份、保留删除文本和因果决定。替换为“正文 + 普通 anchor + review snapshot”仍需补上这些事实，才能处理他人新增上的删除建议、reject 后独立文字存活和离线并发；保留两套则出现两份决定依据。这个选择不以迁移成本为理由。

Suggesting 保留作者分支；Editing 对所有有编辑权限的作者采用相同规则。结构承载与留存分组通过原生契约验证。

## Layer and owner

| Delta | Change | Layer | Package | Why |
| --- | --- | --- | --- | --- |
| changed | 可见选区到 origins 的原子变更 | Plite | plitejs authored、DOM input | 包含 live 和 retained 内容的同一次编辑 |
| changed | original、决定、history、codec、Yjs | Plite | plitejs authored、history、yjs | 必须通过同一 canonical effect 提交和回放 |
| changed | 模式、作者与人工格式策略 | Plate | platejs suggestion、DefaultAuthoredPlugin | 产品规则不能硬编码到无偏好的原生模型 |
| changed | 卡片、无定位记录、讨论跳转 | Plate | www registry editor components | 展示同一 change ID 的多个片段和原文 |
| changed | 保存与权限 | Plate 接入约定 | persistence demo、Comments 文档 | 业务后端由宿主负责 |

## Main changes

### 将同一次操作落到一个事务

先根据操作开始时的可见选区，解析普通正文、待审新增和 retained 删除线的内容身份。再按模式和作者进行分类，最后一次提交正文、建议关联、属性及 selection 变化。替换选区不能分成两个可单独撤销的事务。

Editing 中，在新增建议 `ABCDEF` 中插入 `X` 后显示 `[ABC] X [DEF]`。方括号仍属于原 suggestion，`X` 是普通正文。拒绝原 suggestion 后保留 `X`。直接删去 `CD` 后，接受原 suggestion 只能保留 `ABEF`。

对于删除建议中的 `ABCDEF`，Editing 直接删去 `CD` 后，拒绝该删除建议只能恢复 `ABEF`。再次直接删除、撤销和重做都通过原生操作身份处理，不从原文快照恢复整个字符串。

### 保留 Suggesting 的 amendment 和重叠关系

本人新增建议内输入、删除均修改该 suggestion 的有效内容，不新建讨论。进入他人的建议内输入时，自己的新增建议使用新 change ID。删除他人的新增文字时，自己的删除建议指向那些 origins，并保留与原新增建议的关系。

对于 A 的新增建议和 B 对其中一部分的删除建议，推荐以下决定语义，作为阶段一的明确断言：

- 接受 A 后，B 仍是对这些正文的待审删除，B 的作者和讨论不变。
- 拒绝 B 后，恢复 A 当前仍有效的新增标记。
- 接受 B 后，目标文字不再出现，之后接受 A 不能使它复活。
- 拒绝 A 后，B 失去可操作目标，保留记录与讨论；之后拒绝 B 不能复活 A。

这些是方案推荐的决定规则，不是对 Notion 内部行为的断言。阶段一同时检查反向到达顺序和 checkpoint 后重放。相反的并发 review 决定继续使用原生 conflicted 机制。

已有删除线内重复删除在 Suggesting 中不创建新建议。若选区同时覆盖普通正文、新增和删除线，分别适用表中规则，然后作为一次动作提交。文字同时带有 pending insert 与 pending delete 时，以可见删除线规则处理重复删除，不叠加第三层删除建议。

连续动作的合并要求同一作者、模式、操作类型和可连续的位置。移动选区、切模式、粘贴、独立命令和 composition 边界关闭操作组。返回自己的新增建议后，内容仍可以归原 suggestion，但新动作有自己的 undo 边界。建议身份与撤销组不是同一概念。

### 让独立文字在富文本结构中存活

真实首页第一条包含提案插入的 link。Editing 在 link 中插入普通文字时，不能只清 proposal 标记，还留下对将被拒绝的 link 的结构依赖。

阶段一先证明最小可行结构：提案 link 在输入处拆开，新普通文字锚定到存活的 paragraph；拒绝 link 提案后文字仍存在。proposal-only URL 不能因此被隐式接受。普通已接受 link 的继承继续遵循普通编辑规则。

对于整个提案 block 内的独立输入，Plite 需要保存最小合法承载结构。paragraph、list、table/cell、void 和 named roots 必须通过已安装 schema 的合法性规则处理，不能按类型名硬猜。无法得到合法结果时，整个操作明确失败，不能部分提交、吞字或自动接受其他内容。支持范围由阶段一真实结构探针确定；缺失的常见结构支持是开放 gate。

### 保存提案内容并保留讨论

在创建提案的连续输入期间累积有效内容，IME 以提交结果为准，取消组合不留下中间字符。AI 继续通过已有显式 changeId 组接收 stream，完成、停止或失败时保存已经发表的有效内容，不在第一个 token 冻结。

Editing 的独立输入、直接删除和 marks 不立即改写提案原文。Suggesting 中本人修改自己的新增建议时，右侧提案内容同步更新。因此留存是当前提交的提案内容，不是首次输入后永久不可变的审计快照。原提案内容的更新只接受该提案合法的内容贡献；他人的独立建议不混入其中。

首次实际 amendment 使用当时剩余的本人提案内容作为显示基准。原提案 `ABCDEF` 在 Editing 中删去 `CD` 后，正文为 `ABEF`，留存仍为 `ABCDEF`；仅切换模式不改变留存。随后在 Suggesting 追加 `X`，正文和留存均为 `ABEFX`。独立插入的文字不混入提案。基准由该次 amendment 观察到的原生操作确定，之后的 Editing 不改变它；undo 恢复上一基准，redo 恢复同一次基准。原始 carrier 保留用于撤销与协作，读取时按基准筛选可见内容。

amendment 基准采用首次修改时的剩余提案内容，替代此前累积原始内容的规则。相关回归覆盖位于 `packages/plitejs/test/authored-original-contract.test.ts` 与 `packages/plitejs/test/yjs/authored-contract.spec.ts`。

内容贡献及组边界必须随原生操作编码，以 producer 因果身份和序列判断。不能依赖本地 timer、侧栏 mount 或哪个客户端先观察到修改。多 replica 继续同一 changeId 时不能把整个提案当成单 writer 的布尔 sealed 状态；阶段一须证明重复及乱序输入的确定性。

同一建议被拆成多个片段时，仍只有一个 change ID 和一个讨论目标。卡片直接展示作者、建议摘要、处理按钮和回复；摘要使用留存的提案内容。剩余效果为空时保留卡片，取消定位；推荐允许用户仅结束待审状态而不改正文，不自动 resolve 回复。

### 将文字与关联一起撤销

撤销和重做恢复该次动作的文字、marks、建议归属及片段关联。撤销 Editing 的插入不拒绝原 suggestion；撤销直接删除恢复对应 origin 的归属。

独立发布的回复正文仍由 Comments 生命周期管理，不能被文档 undo 连带删除。暂时不存在可见目标的 thread 仍可通过记录找到；redo 后重新关联原 change ID，不复制回复。

协作 undo 只撤销本客户端该动作，不能覆盖远端操作。两人直接删除同一 origin 后，一方 undo 不能取消另一方的删除。direct delete 与 reject 并发采用 delete-wins 的推荐语义；独立 insert 与 reject 并发保留新字。验证稳定 selection token、stale review、防重复投递和相反决定冲突。

### 升级保存格式和协作协议

当前 `state.ts` 写 state v6 和 operation v5，并有旧 decoder。实施时重新读取版本再升级，不在计划里预占版本号。提案身份、原文和直接修改事实必须进入同一 checkpoint 和 shared effect。

对旧数据只重建有确凿原始操作依据的原文。历史已压缩则返回 unavailable，不能用当前剩余片段伪造初始内容。已有格式和结构提案继续按既有语义读取。

`retainHistory: false` 保留提案内容，但仍可压缩中间 operations。保留一份 canonical 提案内容及必要身份，不永久保留每个按键版本。应检查 retained payload、serialized bytes、加载开销，不能仅看 UI 是否流畅。

协作 admission 必须识别新语义能力，阻止旧 writer 把新语义写坏。只增加 JSON decoder 版本不足以拦截离线旧客户端。库负责验证接入与入站效果；宿主按文档 generation 隔离或拒绝不兼容 writer，并保留旧离线内容供显式处理。未证明混合版本拒写前不推广新格式。

保存时取得同一 revision 的完整 `editor.read.value()` 和 `comments.api.toJSON()`，宿主成对提交。恢复到 detached candidate editor，验证两份数据后整体替换当前 editor。只保存 children 会丢失提案信息。此仓库不代替业务数据库执行原子提交。

### 接入 AI、剪贴板、导入与导出

人工自动捕获只对既有文字上的属性操作直接发布。插入内容自身携带的 marks 跟随该内容。混合事务按 canonical 操作分类，不能因出现 Bold 就把整笔 AI 文本提案直接提交。

显式 `tx.authored.propose({ changeId })` 继续保持完整提案语义。AI 重新生成不能以旧 snapshot 覆盖已被人直接编辑的文字。检验 streaming、停止、失败、继续输入和 undo 边界。

普通剪贴板、HTML、Markdown 和 clean DOCX 只输出所选可见内容，不包含原文留存、隐藏删除文字或讨论。原生 JSON 和明确启用 native-review 的 DOCX 才可携带完整提案数据。当前 clean projection 返回值另有 review 信息，不能把整个 envelope 当作 clean payload 序列化。

复制到新文档时重建文档和建议身份，不沿用原文档讨论目标。普通 HTML 粘贴不能通过内部属性获得已有建议的身份。readOnly 和宿主审核、回复权限分别校验，作者身份只决定 Suggesting 的归属，不替代权限。

## Hard cuts and app migration

改变的是 Editing 的作者分支、retained 局部修改保护和右侧动态原文展示。保留 canonical 文档模型、现有显式提案能力及 Comments 所有权。

旧语义的测试和文档须跟随行为表更新，不能直接删掉失败断言。重点调用者为 DefaultAuthoredPlugin、BaseSuggestionPlugin、retained input、discussion、评论工具栏、AIChatPlugin、persistence demo 和首页 fixture 生成器。模式切换保持现有提案不变，应用无需迁移到第二套编辑 API。

## Feature Manifest

范围包含现有包、React 适配层和 registry。实现与验收状态如下。

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api | authored queries、自动捕获策略 | Plate 插件与 discussion | 真实调用者及类型证明 | partial，调用者已迁移；完整 API inventory 检查受基线也出现的清单错误阻塞 |
| Package | yes | Plite authored | authored 文件组及相关契约 | 编辑命令、保存、review | 原生事务和 round-trip | partial，原生实现与契约已落地；最终 manifest 待闭合 |
| React adapter | yes | Plite DOM/React、Plate | retained input、EditorRoot | markup 编辑器 | selection、IME、focus、后续输入 | partial，自动化契约已有证明；最终真实浏览器及系统 IME 待验收 |
| Registry UI | yes | plate-ui | discussion、评论工具栏、suggestion | 首页和复制组件 | 真浏览器与 build:registry | partial，已接入并生成；最终复制安装路径待验收 |
| Composition | yes | Plate kits、AI | SuggestionKit、AIChatPlugin | 应用 | 人工策略与显式 AI 隔离 | partial，人工策略与 AI 隔离已有跨层测试；最终 manifest 待闭合 |
| Scale proof | yes | benchmark | performance-observability pack | 输入、读取、保存 | 当前 owner 与候选的固定 cohorts 收据 | open，历史候选有性能超标；最终源码未复测 |
| Registry metadata/examples | yes | plate-plugins | suggestion 各 demo、persistence、首页数据 | registry 安装者 | 生成 registry 和可运行示例 | partial，demo 与 registry 已生成；最终安装验收待完成 |
| Docs | yes | plate-docs | suggestion、comment、AI 和导出相关页面的中英文 twin | 接入者 | 按页审计、示例、docs checks、preview | partial，中英文说明已更新，MDX/parity 通过；完整 docs check 受基线也出现的 API inventory 错误阻塞 |
| Release artifacts | yes | changeset | package changeset、registry changelog | 升级者 | changeset 检查，发布前核验 | open，changeset/registry changelog 未完成最终核验 |
| Proof | yes | verify | package、DOM、Yjs、codec、真实首页 | 维护者 | 下列 Native behavior and proof | partial，模型/React/Yjs 已有分项结果；真实浏览器验收仍开放 |
| Plate Next attestation | yes | plate-next | 仅受改动影响的包证据 | 维护者 | 实施期文件 manifest 和指纹 | open，未完成最终包 manifest 与 attestation |
| Review/handoff | yes | pstack | 本方案及相邻 decisions.tsv | 维护者 | panel、trail review | partial，代码审查已完成；其余验收见 Completion Gates |

包级 manifest 与 attestation 尚未完成，分项测试结果不关闭该验收项。

Package boundary contract 继续遵守 VISION：应用只导入 platejs；Plite 负责中立操作；不新增外部依赖；headless 不反向依赖 React；受影响路径保持现有 Oxlint 覆盖。

## Native behavior and proof

| Delta | 行为及命名缺陷 | 最小证明 | 当前结果 |
| --- | --- | --- | --- |
| changed | Editing 作者差别导致无法输入 | 同一 fixture 的本人和他人插入及删除 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | reject link 把独立新字一起删掉 | 真实 link 结构中插入后 reject，核对 model/DOM/caret/后续输入 | partial，原生结构与自动化检查已有证明；最终真实浏览器待验收 |
| changed | retained 直接删除后 reject 复活字符 | 局部删线、reject、undo/redo、重载 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | Suggesting 删除他人新增丢失 A/B 关系 | 四条决定规则及重放顺序 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | 替换跨普通/新增/删除线导致半次提交 | 一次 replacement，一次 undo 恢复文字与关联 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | 中文组合中间字符成为独立建议 | composition commit/cancel、连续输入和切模式 | partial，合成 composition commit/cancel 已验证；系统输入法候选窗、事件顺序和光标未实测 |
| changed | 零范围零回复后记录消失 | 删光、保存、重载、列表检索与原文 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | 并发直接删除被另一方 undo/reject 抹掉 | 两 peer、交换投递顺序、重复、checkpoint+tail | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | 人工 marks 将 AI 提案提前发布 | 含插入与 marks 的显式提案，普通 marks 单独操作 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |
| changed | clean 输出泄露提案留存 | 植入仅原文存在的内容，普通导出不得出现，native 输出必须可恢复 | partial，已有分项自动检查，见 Verification evidence；最终 manifest 待核验 |

现有入口包括 `packages/plitejs/test/authored-changes-contract.test.ts`、`packages/plitejs/test/authored-retention-contract.test.ts`、`packages/plitejs/test/yjs/authored-contract.spec.ts` 和 `apps/plite/tests/plite-browser/authored-changes.spec.ts`。实施前复用实际命令和现有测试覆盖；每个新增测试只针对不同的已命名缺陷。

## Steps

已完成项附实现或验证入口；未完成项保留具体验收范围。

### 阶段一：证明原生语义和选择最终数据形状

- [x] 验证 link 独立文字、retained trim、A/B 叠加建议与原子 replacement。证据：`packages/plitejs/test/authored-structure-contract.test.ts`、`authored-retained-edit-contract.test.ts`、`authored-causal-contract.test.ts`；原生探针及 authored 分项验证见决策记录 `native-v29-correctness`。
- [x] 实现提案内容贡献、本人 amendment 和分组编码，覆盖合成 composition、AI stream 及多 replica 回放。证据：`packages/plitejs/test/authored-original-contract.test.ts`、`packages/plitejs/test/yjs/authored-contract.spec.ts`；决策记录 `Update original only on actual own amendment`。
- [x] 接入提案查询和 Plate 自动捕获调用者。证据：`packages/plitejs/src/authored/read.ts`、`apps/www/src/registry/components/editor/discussion.tsx`；Verification evidence 中的类型检查及 authored 契约。
- [ ] 完成查询和自动捕获入口的最终 best-api 核验及完整 API inventory 检查。owner: best-api。
- [x] 运行隔离候选性能探针，记录 overlap、checkpoint 和索引复用结果。证据：Performance 对照表；决策记录 `checkpoint-index-reuse`、`checkpoint-single-index`、`skip-unchanged-original-index-writes`。
- [ ] 按固定 cohorts 和阈值完成最终源码的 typing、mounted、checkpoint、retention、reload、collaboration 性能验收，补齐留存增长、A/B 重叠及资源开销结果。owner: benchmark。

原生行为、协作与性能分别验收。UI 接入已完成，性能门槛继续独立跟踪。

### 阶段二：完成编辑、存储和协作闭环

- [x] 实现 Editing 与 Suggesting 分类、直接删除、marks、结构承载和决定规则。证据：`packages/plitejs/test/authored-self-edit-contract.test.ts`、`authored-structure-contract.test.ts`、`authored-view-contract.test.ts`；Verification evidence 中的 authored 与 React 检查。
- [x] 更新 codec、原文留存、checkpoint、history 和 Yjs 操作回放。证据：`packages/plitejs/src/authored/state.ts`、`original.ts`、`checkpoint.ts`、`history.ts`；`packages/plitejs/test/yjs/authored-contract.spec.ts` 的 275 项分项验证。
- [ ] 完成最终版本的新旧 codec、未知版本拒绝、混合版本写入限制及 offline tail 验收。owner: authored/yjs。
- [x] 实现原文详情与提案分页查询，区分普通直接编辑记录与提案，保留零效果提案查询。证据：`packages/plitejs/src/authored/read.ts`、`packages/plitejs/test/authored-changes-contract.test.ts`、`authored-original-contract.test.ts`。
- [ ] 完成最终查询路径的规模验证。owner: authored read/benchmark。

未通过兼容性验收的新格式不写入用户真实文档；恢复旧代码前保留已产生新格式的原件，不能让旧 decoder 覆写它。

### 阶段三：交付真实 UI、接入示例和文档

- [x] 接入 discussion、评论工具栏、模式切换、AI、首页三条 suggestion 和 persistence demo。证据：Implementation results；决策记录 `final-production` 审查与 `Simplify suggestion cards`。
- [ ] 完成最终源码的真实浏览器鼠标键盘、系统 IME、混合选择、undo/redo、重载及持续输入验收。owner: plate-ui/plate-plugins。
- [x] 更新 suggestion、comment 及受影响编辑、选择、AI 和导出文档的中英文说明。证据：`content/docs/(plugins)/(collaboration)/suggestion.mdx`、`suggestion.cn.mdx`、`comment.mdx`、`comment.cn.mdx`；决策记录 `Document editing input fixes and preserve open verification gates` 中的 MDX 与 source parity 结果。
- [ ] 完成逐页 preview、示例覆盖审计与完整 docs check。owner: plate-docs。
- [x] 生成 registry 并完成 source 检查。证据：Verification evidence 中的文档与 registry 结果；决策记录 `Document editing input fixes and preserve open verification gates`。
- [ ] 完成最终 clean 输出、native review 往返、registry 复制安装、包边界及 `check-plate-feature` 验收。owner: verify/plate-plugins。
- [ ] 完成包 manifest、attestation、changeset 和 registry changelog 核验。owner: plate-next/changeset。
- [x] 同步编辑行为和接入文档中的模式、作者及原文留存约定。证据：上述 suggestion/comment 中英文文档及 Implementation results。
- [ ] 核对相关维护规则与最终行为约定的一致性。owner: Plate 文档与规则 owner。
- [x] 完成当前实现的代码审查、writing passes 与 decision-trail review。证据：Review history 第 14 轮；决策记录 `Close proof and attribution flags from opus trail review`、`Finish writing and reflection passes`。
- [x] 完成最终回归修复后的 React、测试类型与修改路径 lint 检查。证据：Verification evidence；决策记录 `Verify repaired regression set`，95 个文件、1,446 项测试及两项静态检查均通过。
- [ ] 排除完整文档与全库格式检查阻塞后，完成全库检查。owner: repository checks。

阶段三完成条件为真实首页与复制 registry 路径均通过验收。

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| 编辑行为及存储范围 | yes | 本文 Outcome；范围已明确为仓库格式与接入约定 |
| Flow mode / owner | yes | Feature Manifest；现有包，不新建服务或 package |
| 最终内容留存规则 | yes | Suggesting 本人修改同步更新，Editing 保持留存 |
| 原生结构与协作可行性 | yes | partial，行为、历史、结构和协作已有分项验证；最终生产路径验收待完成，owner: Plite authored |
| 预接受性能收据 | yes | partial，typing、mounted 与规模控制已有隔离收据；checkpoint 的原文锚点和重复索引构造缺陷已局部修复，完整复测待完成。owner: benchmark |
| 执行环境 | yes | `pnpm exec bun --version` 为 1.3.12；self-edit 契约 45 pass，0 fail |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| 语义与原生行为 | yes | 关闭 Native behavior and proof 的适用行 | open，owner: verify |
| 持久化及协作 | yes | 新旧 codec、compaction、offline 和版本 admission | open，owner: authored/yjs |
| 性能 | yes | 同 cohorts 的生产路径收据 | open，owner: benchmark |
| Registry 与文档 | yes | build:registry、按页 docs proof、check-plate-feature | open，owner: plate-plugins/plate-docs |
| 包及发布记录 | yes | manifest、plate-next、changeset/registry changelog | open，owner: plate-next/changeset |
| 审查与修改路径检查 | yes | writing passes、panel、trail、scoped lint:fix | done，Review history 第 14 轮；决策记录 `Verify repaired regression set` 与 `Finish writing and reflection passes` |
| 全库检查 | yes | 排除文档 API 清单与格式阻塞后完成完整检查 | open，owner: repository checks |
| 方案完成 | yes | `node .agents/pstack/plan-open.mjs docs/plans/2026-10-03-suggestion-text-review.md` | open，仅实施验收后允许标 Done |

## Implementation results

- `authored` 按模式和作者分类插入、删除与替换，在同一事务中提交正文、提案关联和选区变化。retained 局部编辑保留独立文字与原提案的内容身份。
- 提案原文在 authored 状态内持久化。本人 amendment 更新提案内容；Editing 修改正文时保持原文留存。codec、checkpoint、history 与 Yjs 使用相同的操作身份。
- `NativeAuthoredTarget` 统一表示 live 与 retained 投影。命令、剪贴板、DOM 地址和位置绑定读取同一目标，普通文字与 retained 文字共用 markup 选区。
- 预先准备的删除命令复用 `getChangeValue`，保留 `ChangeDraft.adopt` 的身份校验和细分删除步骤，避免回退重建合并为替换后产生映射冲突。
- 保留行内节点的复制使用带结构上下文的内容切片。键盘跨节点移动读取实际边界，并保留调用方指定的 affinity。
- 新增文字沿插入来源解析段落归属。依附于显式移动内容的文字保留当前段落，普通跨段删除仍按原文段落与选区方向定位。
- discussion、评论工具栏、模式切换、AI、首页示例和 persistence demo 已接入。卡片展示作者、提案摘要、处理操作与回复；零效果建议保留记录和讨论。
- 中英文选择指南、编辑行为、Plite 参考文档及 registry 文档已同步。

## Verification evidence

以下结果对应 2026-10-06 的本地源码。测试入口可用于复验，历史候选结果不替代最终生产路径验收。

| 检查 | 结果 | 入口与覆盖 |
| --- | --- | --- |
| Plite React | 95 个文件、1,446 项通过 | `pnpm --filter plitejs test:react`；包含复制、键盘选区、组合输入、焦点、历史和连续输入 |
| React 测试类型 | 通过 | `node node_modules/typescript/bin/tsc --project packages/plitejs/test/react/tsconfig.json --pretty false` |
| 修改路径 lint | 通过 | `pnpm lint:fix`；覆盖本次修改的三个实现文件与五个测试文件 |
| 命令与事务 | 24 个文件、585 项通过 | `packages/plitejs/test/authored-view-contract.test.ts` 及关联命令、事务、DocumentChange 和 authored 契约 |
| Authored 与 Yjs | 分项通过 | authored 434 项、Yjs 275 项；后续 DOM/React 修复由完整 React 检查覆盖 |
| 文档与 registry | 分项通过 | MDX 编译、文档 source parity、registry 生成与 source 检查 |

复制节点丢失和输入段落归属错误均在基线测试通过、候选测试失败的对照中确认。修复覆盖无文字行内节点复制、键盘扩展选区、模式切换后的输入，以及不同作者连续输入时的段落归属。

完整文档检查仍受 `platejs./migrations` 的 `ClosedMigrationDocument` API 清单错误阻塞。相同本地构建产物条件下，基线检查也出现该错误；尚未通过全新构建确定源码原因。全库格式检查仍报告根 `package.json` 的格式问题。

## Performance

历史 overlap 场景包含 1,000 条待审建议和两个挂载视图，测量基于 jsdom/模型，不包含浏览器布局与绘制。

| 对照 | p99 中位数 | 载入耗时 | 结论 |
| --- | --- | --- | --- |
| native-baseline-v11 / overlap-candidate-v8 | 3.358 / 11.988ms | 约 362 / 768ms | 候选超过预算 |
| 候选 v12 / v13 | 11.130 / 11.096ms | 未用于该项结论 | 该组配对预算通过 |

两组测量使用不同基线。最终源码仍需按固定 cohorts 重测 typing、mounted、checkpoint、retention、reload 和 collaboration；历史候选数据不构成最终性能验收。

## Remaining work

- [ ] 在最终源码上完成原生浏览器连续输入、模式切换、系统 IME 和光标稳定性验收。合成 composition 测试已覆盖提交与取消，系统输入法交互尚未验证。owner: Plite DOM/React。
- [ ] 完成固定 cohorts 的性能复测，记录延迟、载入、绘制、内存及留存数据增长。owner: benchmark。
- [ ] 完成 registry 复制安装路径、feature manifest、包 attestation 与发布记录核验。owner: plate-plugins/plate-next/changeset。
- [ ] 修复文档 API 清单与全库格式检查阻塞后，运行完整仓库检查。owner: repository checks。

## Review history

已记录 14 轮审查，详细决策见 [决策记录](2026-10-03-suggestion-text-review.decisions.tsv)。

| 轮次 | 范围 | 结果 |
| --- | --- | --- |
| 1 | 方案 | 无发现；运行验收保持开放 |
| 2–3 | 原生候选 v4–v5 | 修复原文格式污染、结构边界、marks 来源与键盘移动生命周期；command effects 批处理约定延后，owner: authored command batching |
| 4–5 | 原生候选 v11 | 三项 critical 已修复；原文模块拆分延后，owner: Plite authored maintenance |
| 6–9 | 生产接入与原生输入 | 修复旧值 amendment、带格式独立输入和卡片摘要；同模型系列审查 |
| 10–11 | markup 输入 | 修复 retained 格式投影、原文删除后的光标定位和命名 root 插入；复查无遗留发现 |
| 12 | 普通选区与结构粘贴 | 单模型审查无发现；跨模型审查未完成 |
| 13 | 文档 | 修正原生选择适用条件与删除方向的证明范围；两席完成、一席缺席 |
| 14 | 复制与段落归属回归 | 跨模型审查无 critical；细化 origin 回溯与显式边界方向 |
