# AI streaming and Markdown demo architecture

Objective:
制定 Markdown 流式测试页修复与 AI 流式架构改造方案，保留现有 Markdown、MDX、流式富文本和原位审阅体验；本轮不修改实现。

Flow mode:
collaborative planning

Goal plan:
docs/plans/2026-09-10-ai-streaming-and-markdown-demo-architecture.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- performance-observability (docs/plans/templates/packs/performance-observability.md)

Mode:

- standard；本次交付为供讨论的设计稿，不是已通过性能验证的执行方案。

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- 当前源码、浏览器 Columns 2/33 失败、临时包级复现和撤回后的证据；执行验收见下文。

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope: 测试页恢复、流式原始文本、半截语法适配、预览生命周期、一次接受/撤销、调用层收敛。
- Source owners: platejs AI 与 Markdown、registry AI UI 和测试页。
- Non-goals: 更换 Markdown/MDX 解析器、纯文本降级、改用 HTML/JSON 内容协议、发布、提交、推送；不重写 Copilot。
- Direct Plite boundary owners: set-nodes 空删除、现有 history/anchor 与视图投影契约；AI 业务状态留在 Plate。

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- 未完成增量解析和原位草稿的可执行对比前，性能相关决策保持 provisional；本轮用户明确只要方案，不编写原型或实施代码。

Plate Plan state:

- status: draft-for-review
- phase: decide
- next: user review, then authorized proof and implementation
- handoff: prepared; runtime targets remain provisional


## 结论与交付状态

推荐保留现有 Markdown 包及其 codec 体系，让 AI 流式处理始终消费模型原始文本；插入、润色、弹窗生成共用一个操作生命周期。长期目标是独立草稿与一次正式提交，但实时原位预览、增量 Markdown/MDX 和局部差异更新都必须先取得可执行证据，不能仅凭架构图锁定。

本轮仅写方案。本轮曾尝试的代码修复与测试已按用户最新要求撤回。页面仍存在已复现的故障；不声称已修复。之前已完成的 codeDrawing 插件接入不属于本轮撤回范围。

### 必须保留的产品行为

- 当前完整 Markdown / MDX 解析、插件自定义节点、序列化与导入导出能力。
- 生成中实时富文本；默认不得改为整篇纯文本、等结束才格式化。
- 插入、替换选区、插入下方、实时原位建议及接受/拒绝；评论与表格操作仍可用。
- 现有单独 Copilot 用户流程不进入这次重构。
- 正常输入、选区、非 AI 撤销和协作不能被 AI 会话覆盖。
- 正确性优先于性能；不得移除循环修正检测、吞异常或降低 Markdown 断言来变绿。

## 1. 当前证据与问题归属

| 问题 | 当前证据 | 结论与范围 |
| --- | --- | --- |
| 测试页无法播放 | Browser 在 `/blocks/markdown-streaming-demo` 默认 Columns 点击播放，停在 2/33；报 `list:corrections.0` 重复修正 | 已复现，不能用它宣称现有整套流式正确 |
| 空属性删除产生空修改 | List 删除不存在的 listStart/listRestart；setNodes 将 null 与 undefined 判作差异，提交空 DocumentChange；修正器将其计为修改并遇到重复转移 | 已用临时日志观察到 `{version:3}` 空变更；最小包级用例同样失败 |
| 窄修复的验证边界 | 临时忽略“删除不存在属性”后，AI 流式及 List 测试共 46 项通过；随后改动撤回 | 仅候选验证，未完成最终 Browser 33/33；原命令中的 transforms-contract.ts 未被 Bun 纳入，不能算底层测试通过 |
| Undo 拆分 | 本会话此前单块 3 次流更新后 Accept 共 2 批次；多块共 4 批次，一次 Undo 返回临时建议状态 | 历史提交边界问题，不能用语法补全补丁修复；执行时必须刷新复现 |
| 插入路径反向序列化 | `_blockChunks` 混用原始输入和 serializeChunk 结果 | 原始流的信息会在节点往返中丢失；先消除这个反馈循环 |
| 润色及弹窗重复工作 | diffNodes 每次复制选区/解析累计输出/diff；AIChatEditor 每次全文解析和替换 | 源码确认重复工作，尚未量化其用户延迟占比 |
| `_mdxName` | 单个标签名加 includes 闭合判断；首次设置与后续调用路径不同 | 中间显示策略有价值，不能直接删除；嵌套、属性截断等需要独立测试 |
| 页面控制状态 | reset/navigate/场景切换未统一取消当前异步循环；部分路径未清 `_mdxName`；静态播放累计索引，重播未统一重置文档 | 源码风险，尚未逐项 Browser 复现；不能作为已经确认的 bug 合并修复 |

直接来源：

- [流式测试页](../../apps/www/src/registry/examples/markdown-streaming-demo.tsx)
- [AIChatPlugin](../../packages/platejs/src/ai/react/AIChatPlugin.ts)
- [BaseAIPlugin](../../packages/platejs/src/ai/lib/BaseAIPlugin.ts)
- [片段消费 hook](../../packages/platejs/src/ai/react/useAIChat.ts)
- [registry AI 分发](../../apps/www/src/registry/components/editor/ai.tsx)
- [弹窗与接受按钮](../../apps/www/src/registry/components/editor/ai-menu.tsx)
- [传输与演示回退](../../apps/www/src/registry/components/editor/use-chat.ts)
- [List 修正规则](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts)
- [底层 setNodes](../../packages/plitejs/src/transforms-node/set-nodes.ts)
- [修正循环检测](../../packages/plitejs/src/editor/correct-document.ts)

历史参考仅用于说明原意：[局部预览回滚](2026-03-26-ai-preview-localized-rollback.md)、[历史增长问题](4900-ai-streaming-history.md)。旧路径、旧 API 和旧测试结论不作为当前证明。

## 2. 先恢复可信的测试页面

A. 先修中立的空删除行为。候选是在 setNodes 中发现删除属性但节点不持有属性时直接跳过该属性；不得仅在 List 上加条件掩盖底层问题。保留其他属性更新、合法已有属性删除、自定义 compare/merge、split、命名 root 的语义。核查空 DocumentChange 的通用发布行为是否也存在独立缺陷；如需扩大底层修复，单独复现和界定范围。

B. 增加两层回归：底层空删除不触发文档修改/修正循环；Plate 的 List+Markdown+AIChat 真实组合重放 `paragraph\n\n` 与 `<column_group>\n`。不要只写一个“不会 throw”的空编辑器测试。

C. 重放页面全部 6 个现有场景：Columns、Links、Lists、List With Image、Nested Structure Block、Table。覆盖 Plate 和 PlateStatic、逐段前进/后退、播放/暂停/重播、重置、场景切换和模式切换。每个控制问题先复现再修；失败保留场景、片段索引和错误，结束 loading，不能吞掉解析失败。

D. 每个新播放/导航动作使旧循环失效；reset、切换和卸载共用取消入口。播放索引表示当前实际应用的片段数，重播从一致的文档和解析状态开始。此状态机只服务演示控制，不引入通用播放框架。

E. 修正页面“PlateStatic 更完美”的无证据描述，增加可访问的播放/暂停/前后/重置按钮名称。性能与正确性用结果表达，不在说明文案中预先宣布赢家。

## 3. 架构目标：同一输入、同一生命周期、一次提交

```text
AI SDK transport
    │ chunk / completion / error，绑定 request identity
    ▼
AIChatPlugin 的一次操作
    ├─ 原始 source：只追加模型实际输出
    ├─ 目标：请求开始时的语义选区、节点身份及必要原始内容
    ├─ 解析适配：当前 Markdown 包 → 草稿节点
    ├─ 原位或弹窗展示：读取同一草稿
    └─ Accept：目标校验 → 一次 new-batch 正式文档事务
```

### 3.1 原始文本是唯一解析输入

- source 不从正文、草稿节点或序列化结果反推。
- 解析器允许为当前预览补闭合符或隐藏不完整语法，但修补文本绝不写回 source，也不作为下一段输入。
- `serializeChunk` 的公共/内部用途先查调用者；流式反馈用途删掉，真实导出用途仍交给 Markdown 包。
- 零新增片段不解析、不做 diff；重复或过期事件不能再写入草稿。累计消息模式与 delta 模式在传输边界归一化，处理断流、非前缀替换、多 text part 和最终尾段。

### 3.2 半截语法留在窄适配层，当前 Markdown 包保持权威

第一步用原始 source 回放现有策略，证明相同可见行为和最终结果，再删冗余补丁。不能把换成 Remend 作为前置条件。

长期优先复用 Markdown 的语法信息，判定哪些源区间需要重解析。`_mdxName`、换行占位符、围栏截断等逐项建立反例和保留条件；不是换一个类名把原补丁搬进去。

不预设“一个标签栈即可解析 MDX”：属性引号、JSX 表达式、注释、代码围栏、同名嵌套及自闭合语法必须按当前解析栈的真实能力处理。未知/不完整状态继续显示可解释的局部预览，保留原始字符；不让整篇正文退回纯文本。

**完成契约**：同一 source 经任意 chunk 切分后的最终语义文档，必须与当前完整 Markdown 包解析结果一致。比较规则只能排除经证明非语义的运行期身份，不能笼统忽略所有 id、空白、属性或未知节点。

终止契约分开：自然结束按完整输入解析；用户 Stop 保留部分 source，并显示当前容错预览。若部分内容仍不能形成当前 schema 的合法片段，明确不可接受原因，不把临时闭合字符或不完整链接占位地址存入文档。

### 3.3 性能优化不等于换解析器

候选是复用不受影响的前缀，重解析受影响源区间，再仅替换实际变化的草稿节点。范围由语法依赖证明，不能用双换行或最后一个块近似全部 Markdown。

引用式链接、脚注、Setext 标题、列表延续、嵌套 MDX 都可能改变更早的解析结果。不支持安全局部失效的语法允许明确回到完整解析，记录该场景成本；不得宣传所有输入严格线性。

长单段、单表格、代码和公式即使只是尾部，也可能随输入持续变长。必须分别测量；如果无法增量处理，先保留正确行为，再由测量决定是否需要复用 AST 或解析器扩展。Worker、虚拟化及缓存不是默认前提。

显示可在一帧内合并已经到达的增量，但不得用固定数百毫秒 debounce 隐藏问题。后台标签页可能不执行 rAF，完成/停止必须能够 flush 最新结果。滚动仅在用户跟随流末尾时执行，不抢回用户向上浏览的位置。

### 3.4 三条现有流程共享草稿，保留展示差异

插入、润色、弹窗生成共享 source、请求身份、目标、状态转换和提交入口；它们有不同的显示与最终应用位置，不因此维护三套取消/撤销算法。

首选目标是正式文档保持不变，草稿通过现有展示能力原位或弹窗呈现。先验证现有视图能力是否足够；中立缺口交 Plite React，AI 业务规则留 Plate。不能先发明通用 draft/fork 引擎，也不能把第二个 root 当成天然不会保存/协作的草稿。

原位实时建议继续保留。先度量全量 diff；候选只更新受影响内容的差异，稳定建议身份保持不变。若局部 diff 与当前完整 diff 不等价，保留全量正确路径并标明成本，不能默默改成结束后才显示差异。

避免复制整篇主文档。独立草稿只保存当前生成结果和应用所需的目标原内容；复用当前 schema 与 codec，不手工维护第二套插件表。

### 3.5 一次操作的状态与终止规则

| 状态/动作 | 行为 |
| --- | --- |
| submit | 固定目标和源内容；创建当前请求身份，开始接收 |
| streaming | 只接受当前请求；更新草稿，正式 history 不增加 |
| stop | 中止传输并拒绝迟到事件，flush 草稿；转为部分结果审阅 |
| ready | 展示最终/部分结果、差异及合法性，允许适用的 Accept/Discard |
| accept | 校验仍是当前会话且目标有效；重复点击无效；执行一次文档事务 |
| discard | 清除草稿、取消请求、释放目标，不调用正式 Undo 或删除用户 redo |
| retry | 使旧请求失效，在原操作目标上建立新生成尝试 |
| error | 停止 loading，保留可重试的错误和草稿，不能伪装成完成或切到 mock |
| unmount | 释放请求、定位资源及展示订阅，不再落入已销毁编辑器 |

状态是一个判别状态值加真实负载，不保留可互相矛盾的 streaming/open/多个完成标志。UI 弹窗开关只有存在独立用户意图时才单独保存。

### 3.6 提交与 Undo

- 正式写入只通过当前 editor transaction/history API，独立 `new-batch`；不在异步网络期间保持事务打开。
- Accept 的内容、建议清理和最终选区属于同一逻辑提交；移除 UI 接受按钮事后强制跳到整篇末尾的责任。
- 保留用户生成前后的其他编辑。Undo 一次恢复操作前正文与选区；Redo 一次恢复接受结果，不出现临时标记。
- 长流有多少网络 chunk，不应让正式历史多出同等数量的变更记录。
- 优先复用 `editor.anchor` 和 NodeKey；它们提供位置映射，不自动解决内容冲突。目标被删除或被并发修改时必须拒绝错误覆盖。
- 命名 root、离散块选区与表格单元格使用各自语义目标，不用包围范围覆盖未选中的内容。
- 流式进行时的原生 Undo 保持正文 history 语义；不能擅自变成“取消 AI”。若 Undo 使目标失效，结束该草稿并解释。取消使用现有 Stop/Discard/Escape 规则。
- 评论的讨论数据、建议条目与表格修改必须单列集成证明；不能在正文 history 合并后就声称外部讨论 store 也支持原子撤销。

## 4. 删除与保留的决策

| 当前概念 | 推荐目标 | 采用与证明 | 状态 |
| --- | --- | --- | --- |
| 现有 Markdown/MDX 包与 codec | 保留，完整解析为语义 oracle | 当前语料、MDX 自定义节点、随机切片最终一致性 | 明确约束 |
| AIChatPlugin | 保留一个产品操作入口，内部职责收敛 | submit/stop/retry/accept/discard 完整行为 | 设计方向 |
| BaseAIPlugin 的 preview/batch/undo 职责 | 草稿提交成熟后删除重复历史所有权；AI 样式职责单独核实 | 无正文临时标记依赖、Undo/Redo、现有调用者迁移 | 待证明 |
| `_blockChunks` 序列化反馈 | 用原始 source 和私有解析进度替代 | 同 source 任意切片最终等价 | 优先候选 |
| `_mdxName` | 从 AI store 删除，由窄流式解析适配拥有必要待定语法 | 同名嵌套、标签内代码/表达式、逐字符前缀 | 待证明，不立即删 |
| aiChat 正文定位节点 | 复用现有定位与展示能力 | 原位菜单、滚动、选区、复制、撤销不受影响 | 待视图验证 |
| registry `useHooks` 执行节点写入 | 留传输与呈现配置，操作由包内入口负责 | 拷贝安装无需知道 `_blockPath` 等内部字段 | 设计方向 |
| 默认失败切 mock | mock 成为明确演示配置，生产错误真实呈现 | 401/404/500/中途 stream error 可区分 | 设计方向 |
| 新 parser 包、AI transaction 框架、通用草稿引擎 | 暂不创建，复用现有 owner | 仅真实能力缺口才重开设计 | 拒绝当前引入 |

对外尽量保留 `platejs/ai/react` 的 AIChatPlugin 和现有 submit/stop/accept 用户动作；不承诺保持目前泄漏的 `_` 字段与 insertChunk 调用方式。破坏性采用需一次迁移 package exports、类型推断、registry、文档及测试，无永久兼容别名。最终公开 API 在可执行验证后确定，这份方案不把伪代码当已存在能力。

## 5. 实施顺序与退出条件

| 阶段 | 范围 | 退出条件 |
| --- | --- | --- |
| P0 页面与底层空删除 | 修正 no-op，补 exact-case 回归；逐项修复被证实的控制器错误 | 两模式六场景可重放，失败可见，旧流不能污染 reset/切换后的状态 |
| P1 冻结正确性与基准 | 记录当前完整解析结果、关键中间前缀、3 条 AI 流程及 Undo 失败 | 可重复运行同一输入/同一 chunk 划分的当前与候选对比 |
| P2 原始 source 适配 | 去往返反馈，先保持当前展示策略和 codec | 完整语料不回归；逐项证明可删补丁；原始 source 字符无丢失 |
| P3 草稿与一次提交 | 三流程统一状态与原位/弹窗草稿，迁移接受/丢弃/重试 | 无预览正文提交，Accept 一批，Undo/Redo 正确，目标映射/冲突受控 |
| P4 性能增量化 | 只改已证明热点，增量解析/节点复用/差异更新逐项比较 | 达成冻结预算且正确性门槛始终通过；未达标不得降级 UI |
| P5 删除与交付 | 删废弃标记/字段/helper，生成 registry/barrel，文档与技能同步 | 调用方无旧教法，页面和真实 AI 集成复验，包级门槛通过 |

P2/P3/P4 的实现范围由各自先行原型结果锁定，顺序不代表已经证明新架构更快。P0 可独立交付，不要求先重写 AI 插件。

## 6. 验收与性能门槛

正确性矩阵至少包括：6 个现有 demo 场景；普通粗体/链接/代码/公式；MDX 标签名、属性、表达式和闭合符每个字符位置截断；同名嵌套与自闭合；引用定义/脚注后置；尾部空格/空行；一段、一表、一代码块特别长；取消/失败/重试/卸载；目标删除/插入/用户编辑；Accept 双击；Undo/Redo；命名 root、离散选区、表格和评论。

测试页需要分清“完整 Markdown 解析”和“AI 流式适配”输出。完整解析成功但流式失败，不能把责任记到 Markdown 包。

规模固定为总 source 1 KB / 10 KB / 100 KB，1 MB 作为 stress；chunk 1 / 16 / 128 字符及固定录制流。分别变化正文背景大小和生成目标大小，不混淆两者。中途 source 反向依赖单独列队，不仅测一串独立段落。

先记录同机同构建的当前路径，3 次预热、至少 10 次测量；记录冷启动、总处理时间、帧级可见更新延迟、Accept/Undo/Redo、解析字节数、diff 访问量、节点替换量、渲染次数和历史大小。最终输出固定而 chunk 数增加时，历史大小不得随 chunk 数等比例增长。

预算拟定值需在读取候选结果前冻结：100 KB 常规流预览刷新主线程 p95 ≤16 ms；流结束到可接受预览及 Accept/Undo/Redo 各 ≤100 ms；常规对照不回退超过 10% 且绝对增加不超过 2 ms，差异须超过测得噪声。MDX 巨块/stress 单列实测限值，任何例外必须显式记录，不能用常规结果替代。若当前硬件/构建使预算无意义，先重定基准契约再测候选，不允许看完结果放宽。

未来执行命令：

- Plate focused：`bun test packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts packages/platejs/src/ai/lib/BaseAIPlugin.spec.tsx packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`。
- Plite no-op：使用当前包测试 runner 将底层用例纳入实际清单，核实计数；不要假设 Bun 会运行非匹配文件名的 contract 文件。
- 迭代 `pnpm check:plite:dev`；底层最终交付 `pnpm check:plite`；Plate owning entrypoint proof 与 scoped lint，必要 app typecheck。
- 原型/性能通过 benchmark 技能的现有 runner 发现流程选入口；当前尚未选出精确命令，不虚构可运行 benchmark。此项保持未完成，不能称设计已验证。
- registry 改动在 next 按规则 build:registry；package 改动补 changeset；公开文件/导出变化再跑 brl。next 不运行 autoreview。

## 7. 风险、取舍和待验证项

1. 原位草稿能否保持 DOM selection、菜单定位、复制、滚动及布局？必须 Browser 原型验证，模型测试不足。
2. 全文 Markdown 中的跨块依赖是否允许稳定前缀？不能证明的语法不冻结前缀。
3. 长单块能否满足预算？“只解析尾块”不是答案；须量化解析字节和主线程占用。
4. 草稿期间用户/协作编辑如何影响目标？位置映射与内容冲突检查分开，不能用整个文档快照回滚覆盖并发修改。
5. 半截链接和 MDX 的临时补全如何避免持久化？最终解析、schema 校验与占位对象清理要分别证明。
6. 需要公开 Markdown streaming API 还是私有适配？当前只有 AI 需求，先私有；独立调用者和证明出现后再决定公开。

Remend、streaming-markdown、Tiptap、BlockNote 只提供局部思路。现有源码证明不了它们能保留本项目全部 MDX 和 codec；本方案不新增依赖、不改内容协议。

## 8. 本轮交付

- 交付方案及源码/复现依据；不实施、不创建 PR、不更新技能/Vision。
- 本轮候选修复和新增回归测试已撤回，保留研究日志在 `/tmp`，不可当长期测试。
- 状态：**方案可讨论；尚未接受，性能/原位草稿原型未验证，不是执行就绪或已修复。**
- 用户接受后先执行 P0，再按证据逐步锁定 P2–P4；不得直接重写 Markdown 包。

---

## 规划门槛附录

以下由 plate-plan 模板生成，尚未打勾的运行时验证项是明确保留的执行前门槛；本次“只写方案”不以伪造通过结果关闭它们。

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Active goal and plan verified | yes | 仅使用本方案；用户未请求创建工具 goal。 |
| Current owners read | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Best API target resolved | yes | 正文第 4 节明确保留/删除方向；scale-sensitive 目标不锁定。 |
| Runtime scale applicability resolved | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Pre-acceptance Benchmark probe selected | yes | 正文第 6 节指定 Benchmark 选取现有 runner；精确命令和原型仍待授权验证。 |
| Mode and execution boundary resolved | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Performance pack selected | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| User-facing operation and runtime owner identified | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Scale variables and cohorts fixed | yes | 正文第 6 节列出规模、拟定门槛及候选测试前冻结规则；尚无实测结果。 |
| Budget frozen before target measurement | yes | 正文第 6 节列出规模、拟定门槛及候选测试前冻结规则；尚无实测结果。 |
| Baseline and target probe selected | yes | 正文第 6 节指定 Benchmark 选取现有 runner；精确命令和原型仍待授权验证。 |
| Correctness guard selected | yes | 正文第 1–7 节已记录；运行时验证不在本轮执行。 |
| Production detector decision recorded | yes | N/A：只写方案；后续性能计数不得采集用户文档或凭证。 |

Work Checklist:

- [x] Skill analysis: best-api 负责删除/复用判断；plate-plan 负责方案和采用顺序；plite-plan 用于中立底层边界；autogoal 模板记录待验证门槛。
- [x] 用户约束逐条收录：页面修复与架构优化一起规划；先方案、不动代码；保留当前 Markdown/MDX 与流式富文本；解决长文性能、Undo 与可读性。
- [x] 撤回本轮 set-nodes 修复、AI 回归测试和对应 changeset，之前任务及用户修改不在撤回范围。

- [ ] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports claims cite live source.
- [ ] Reusable public call shape has one `best-api` verdict before target lock.
- [ ] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
- [ ] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [ ] Canonical state versus exact-view presentation is classified when
      applicable: Plite React owns neutral view mechanics, Plate proxies, and
      copied UI owns activation and styling.
- [ ] Public breaks and any private bridge have complete adoption/deletion answers.
- [ ] Execution slices and focused proof matrix are concrete.
- [ ] Conditional work and final handoff are resolved without generic N/A matrices.
- [ ] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [ ] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [ ] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [ ] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [ ] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [ ] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [ ] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [ ] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [ ] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [ ] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [ ] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [ ] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pending | Resolve every readiness condition | pending |
| Fresh source evidence | pending | Recheck decision-changing current claims | pending |
| Best API review | pending | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | pending |
| Pre-acceptance scale proof | pending | For scale-sensitive decisions, record the matched baseline/target result across applicable cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed N/A | pending |
| Production scale rerun contract | pending | Put the exact final production-path cohort/budget rerun and correctness guard in every applicable execution slice; planning-only work records its future owner/command | pending |
| Conditional risk and adoption | pending | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| P1 autoreview | pending | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-ai-streaming-and-markdown-demo-architecture.md` | pending |
| Pre-acceptance scale proof | pending | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | pending |
| Warm latency budget | pending | Prove the changed operation stays within its warm percentile budget using the owning harness | pending |
| Large/stress scaling | pending | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | pending |
| Cold and failure paths | pending | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | pending |
| Payload and fan-out | pending | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | pending |
| Production-path rerun | pending | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | pending |
| Correctness guard | pending | Run the selected behavior/native/data-integrity guard on the measured final path | pending |
| Before/after receipt | pending | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | pending |
| Detector and privacy | pending | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | pending |
| Performance regression check | pending | Run the deterministic performance harness and relevant checks in the owning workspace | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | 当前源码和真实 Browser 失败 | Decide |
| Decide | draft delivered | 正文方案，性能目标尚未锁定 | 用户审阅 |
| Prove and hand off | deferred | 用户要求只写方案，不编写原型 | 后续授权 |

Decision brief:

- outcome: 页面恢复与架构方案，见正文第 1–8 节。
- chosen shape: 当前 Markdown + 原始 source + 统一草稿与一次提交；运行时目标待验证。
- strongest rejected alternative: 更换解析器、统一纯文本降级、继续扩大 AI 私有历史管理。
- consequence: 先恢复页面基线，后迁移 AI 内部调用；不触碰现有解析语义。

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 详见正文第 4 节 | 当前源码已核对 | 原始 source 与统一操作 | Plate/Plite 按正文分工 | 消除反馈循环和重复状态 | P0–P5 | 第 6 节 | 第 7 节 | provisional |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| P0–P5 | 详见正文第 5 节 | 不扩大 Markdown 语义 | 用户接受与前阶段证据 | 逐阶段验收 | 正文第 6 节 |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| 当前失败与候选目标 | 正文第 1 节 | 第 6 节矩阵 | baseline failure reproduced; target unverified |

Scale contract:

- applicability and source evidence: pending
- user operation, current owner, proposed owner: pending
- independent scale variables and normal/large/stress/pathological cohorts: pending
- frozen absolute/relative budget and noise rule: pending
- current baseline command/artifact and source identity: pending
- target command/artifact or disposable prototype and source identity: pending
- deterministic work indicators plus timing result: pending
- correctness/native guard: pending
- final production-path rerun owner and exact command: pending

Conditional evidence:

- High-risk scenarios: 见正文第 6–7 节；非请求范围不执行。
- External research: 见正文第 6–7 节；非请求范围不执行。
- Issue/PR provenance: 见正文第 6–7 节；非请求范围不执行。
- Docs/registry/browser/release/behavior-law owners: 见正文第 6–7 节；非请求范围不执行。
- Performance pack, pre-acceptance receipt, and final rerun: 适用；方案第 6 节定义门槛，本轮不跑原型。

Findings:

- 见正文对应章节；未验证事项明确保持开放。

Decisions and tradeoffs:

- 见正文对应章节；未验证事项明确保持开放。

Review fixes:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:

- 见正文第 1 节复现证据及第 7 节开放风险。

Final handoff prepared:

- Ownership and target API: 正文第 3–4 节，运行时设计为候选。
- Public breaks and adoption: 不泄漏解析字段，调用者按 P5 统一迁移。
- Applicable runtime/package/docs/browser decisions: 正文第 5–6 节。
- Scale applicability, design receipt, and production rerun contract: 适用；receipt 未取得，不能执行就绪。
- Proof and execution risks: 正文第 7 节。
- Execution order and user attention: P0→P5，用户审阅方案后再授权实施。

Timeline:

- 2026-09-10T07:22:09.395Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Decide, prove, prepare handoff |
| What is the goal? | 仅制定保留现有 Markdown/MDX 能力的修复方案 |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- 见正文第 1 节复现证据及第 7 节开放风险。

Planning verification:
- 本地引用路径检查通过，本轮代码/测试/changeset 回撤检查通过。
- check-complete 返回 incomplete，符合草案状态：运行时性能、原位草稿原型、最终 API 和执行验收尚未完成。未将工具结果标为通过。
