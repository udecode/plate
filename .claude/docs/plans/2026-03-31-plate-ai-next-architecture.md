# Plate AI 下一阶段架构决策

## Source Of Truth

- 用户请求：为 Plate 下一阶段 AI 重构确定正确的架构方向
- `/.agents/skills/major-task/SKILL.md`
- `/.claude/docs/analysis/compound-engineering-tree.md`
- `/.claude/docs/analysis/editor-architecture-candidates.md`
- `docs/internal/plate-streaming-handoff-2026-03-27.md`
- `/.claude/docs/solutions/performance-issues/2026-03-26-ai-streaming-preview-should-use-localized-rollback.md`
- `/.claude/docs/solutions/performance-issues/2026-03-31-markdown-stream-burst-batching.md`
- `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts`
- `packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts`
- `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts`
- `packages/ai/src/react/ai-chat/AIChatPlugin.ts`
- `packages/ai/src/lib/transforms/aiStreamSnapshot.ts`
- `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`
- `apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx`

## Decision Frame

### 要做的决策

为 Plate 下一阶段 AI 重构确定正确的主线架构，而不是直接进入实现。

这次要回答的不是“怎么修一个具体 bug”，而是：

1. 下一阶段 AI 重构的真正中心 seam 是什么
2. 哪些现有方向应当保留
3. 哪些 boundary 应当重构
4. 哪些方向现在明确不该做

### Major-Work Lane

- lane: architecture or public API
- secondary lane: benchmark or performance
- work type: analytical only

### Expected Outcome

产出一份可以直接指导下一阶段实现的架构决策文档，明确：

- 推荐方向
- 备选方向为何不选
- 决策依据
- 受影响边界
- 分阶段 rollout 顺序

### Decision Criteria

本次架构方向必须同时满足：

1. 让 insert-mode AI streaming 更稳定
2. 让长文档 streaming 更快
3. 降低 hot path hacks 和跨层状态耦合
4. 尽量复用 Plate 现有正确方向，而不是推翻重来
5. 让 package path 和 demo/perf path 能逐步收敛
6. 不把复杂度重新转移到 markdown strict round-trip 上

### Browser Surface

- 这次没有必须先验证的真实 browser surface
- 浏览器页可以作为后续 perf 验证工具，但不是本次决策产物本身

### Likely Highest-Leverage Seam

insert-mode streaming runtime boundary。

更具体地说，是：

- transport event
- markdown shaping
- streaming session state
- preview lifecycle
- plugin UI/workflow state

这几层之间的边界。

## Repo Constraints

### 已有明确约束

1. 当前主 contract 仍然是：
   - raw chunks
   - joiner / shaping
   - `streamInsertChunk`
   - correct Plate editor state
2. 当前主目标不是 strict markdown round-trip
3. parse-side local fork 可以存在，但要最小化
4. preview 相关行为已经明确应走 localized rollback，而不是 full-document snapshot restore
5. 最近的 perf 结果已经证明：
   - 主要瓶颈不是 `joiner`
   - 更重要的是 `streamInsertChunk` 调用次数和 editor update count

### 编辑器候选图对当前决策的约束

`major-task` 明确要求 editor-framework-facing work 先从 `/.claude/docs/analysis/editor-architecture-candidates.md` 出发，而不是随机扩展比较范围。

这意味着当前如果要讨论“是否应该换 editor substrate”，优先比较也应是：

- Plate / Slate inheritance pressure
- ProseMirror / Lexical 作为更深层 runtime reference

但现有 repo 证据并没有显示“必须更换 editor substrate”。

## Facts

### F1. 当前 streaming core 的正确方向已经基本出现

从 `streamInsertChunk.ts`、handoff 文档和测试可以确认：

- 当前核心不再依赖重 serialize / compare / retry
- 当前方向是 replay unstable tail + patch changed suffix
- 这条线已经比 full-prefix 重算更接近正确方向

### F2. preview lifecycle 目前的边界是合理的

从 `aiStreamSnapshot.ts` 和相关 solution 可以确认：

- preview begin / accept / cancel / discard 已经是局部块级别语义
- accept / cancel 不再以 full-document `setValue` 为核心
- 这部分已经是 workflow-oriented API，而不是 parser hack

### F3. runtime internals 仍然泄漏在 `AIChatPlugin` option state 中

从 `AIChatPlugin.ts` 可以确认，当前 option state 还保存：

- `_blockChunks`
- `_blockPath`
- `_mdxName`

这些都是 insert streaming runtime bookkeeping，不是用户层 workflow state。

### F4. package path 和 demo/perf path 尚未真正共享同一条主线

从 `apps/www` demo/perf 文件和 package path 对照可以确认：

- demo/perf 已经有 raw chunks、joiner、burst shaping、measured batching
- package 插入路径仍然主要经由 `useChatChunk`
- `useChatChunk` 不是在吃 provider-native stream events，而是在吃 accumulated assistant text 的 diff

### F5. 当前 transport contract 过弱

`useChatChunk.ts` 当前逻辑是：

1. 读取最后一个 assistant message
2. 找到 text part
3. 用之前已插入文本长度切 suffix
4. 把 suffix 当 chunk

这说明 package 核心当前仍然部分依赖 “message accumulation semantics”，而不是清晰的 transport event contract。

### F6. 最近 perf 结果说明 update count 才是关键

从 burst batching 结果可确认：

- 单次 `streamInsertChunk` 平均时长略增不是主要问题
- 真正的收益来自总调用数显著下降
- 这说明下一阶段该优化的是 pipeline boundary，而不是重新把精力放回 serializer purity

### F7. 现有测试锚点已经足够支持一轮边界重构

当前已有的高价值锚点：

- `streamInsertChunk.slow.tsx`
- `streamHistory.slow.tsx`

它们已经覆盖了：

- regrouping invariance
- preview history contract
- accept / undo / redo 行为

这意味着下一阶段可以围绕 boundary 重构，而不用先把整个测试体系推倒重建。

## Inference

### I1. 当前主要问题不是 editor substrate 错了

如果 editor substrate 已经错到必须换平台，那最近的两个关键收益本不该这么直接出现：

- localized rollback
- burst batching

它们都说明当前 substrate 仍有明显 headroom，真正的问题更像 boundary 设计而不是 engine 选型。

### I2. 当前最该收敛的是 insert streaming session，而不是 parser surface

parse-side fork 已经承担了它该承担的那一小块：

- pending tail
- incomplete suffix parse hints

再往下压更多 editor-specific behavior，收益会开始变差，fork fragility 会上升。

### I3. `AIChatPlugin` 现在承担了不该承担的 runtime ownership

plugin option state 当前混杂了：

- UI/workflow state
- transport-derived streaming internals

这会让 reset、finish、reuse、future API 设计都继续围绕 internals 组织，而不是围绕 workflow 组织。

### I4. package path 不能继续把“消息全文 diff”当作主 streaming contract

这条线可以作为兼容层，但不该继续作为 architecture center。

否则：

- provider cadence 无法正确建模
- raw event visibility 会继续只存在于 demo
- package path 和 demo path 会长期分叉

### I5. 下一阶段最对的单位不是“更大的 AI engine”，而是“更清晰的 insert-mode session”

现在 comment、table、edit、insert 这些 mode 还不值得立刻被硬并进一个 super-engine。

当前最值得先做成 clean core 的，是 insert-mode markdown streaming。

## Recommendation

### 主推荐

下一阶段应围绕一个 package-private 的 `MarkdownStreamSession` 来重组 insert-mode streaming。

这个 session 应负责：

- 累积 markdown source
- 接收经过规范化的 stream events
- 执行 joiner / batching / finish flush 这类 shaping 结果
- 管理 replay runtime state
- 调用 `streamInsertChunk`
- 统一 reset / finish bookkeeping

### 推荐后的分层

```text
Provider / AI SDK / demo fetch stream
  -> transport adapter
  -> normalized stream events
  -> markdown stream shaper
  -> MarkdownStreamSession
  -> tf.ai preview lifecycle
  -> Plate editor state
```

### 每层该负责什么

#### 1. Transport Adapter

职责：

- 规范 provider-specific events
- 输出 text delta / finish / abort / non-text part

不负责：

- editor mutation
- preview
- markdown joining

#### 2. Markdown Stream Shaper

职责：

- split markdown syntax joiner
- cadence / burst batching
- finish 前 flush

这一层适合承接将来可能下沉的纯 `MarkdownJoiner`。

#### 3. `MarkdownStreamSession`

职责：

- 维护 source accumulation
- 维护 replay runtime state
- 向 `streamInsertChunk` 提交 shaped markdown batch
- 承担 insert-mode runtime ownership

这一层应把 `_blockChunks`、`_blockPath`、`_mdxName` 从 `AIChatPlugin` 中拿走。

#### 4. `tf.ai.*` Preview Lifecycle

职责：

- `beginPreview`
- `acceptPreview`
- `cancelPreview`
- `discardPreview`
- `undo`

这层继续保留当前 local、history-safe、workflow-oriented 语义。

#### 5. `AIChatPlugin`

保留真正的 workflow state：

- `open`
- `mode`
- `streaming`
- `toolName`
- `chat`
- `chatNodes`
- `chatSelection`

不再持有 insert-stream runtime internals。

## Alternatives Considered

### A. 在当前 Plate substrate 上做 sessionized streaming pipeline

结论：选这个

为什么现在最优：

- 直接命中当前真实问题
- 符合最近已验证的性能与稳定性方向
- 可以用最小 blast radius 推进
- 不要求重写整套 AI 或重选 editor

### B. 重新围绕 strict markdown round-trip 设计 streaming architecture

结论：不选

原因：

- 它优化的是文本保真，不是当前最重要的用户体验 contract
- 会再次把复杂度压回 serializer / markdown-preserving IR
- 会把当前已经收敛的方向重新拉回高成本路径

### C. 直接以 ProseMirror / Lexical 等为参照重做 editor substrate 决策

结论：现在不选

原因：

- `major-task` 要求 editor comparison 从 candidate map 出发，而不是泛化旅游
- 当前 repo 证据不足以支持“现在必须做平台迁移”
- 这阶段真正需要的是 boundary cleanup，不是 substrate replacement

## Why This Wins Now

当前存在两个都“看起来合理”的方向：

1. 小范围 seam 改造
2. 更大的 AI/runtime reset

现在应该选前者。

原因是：

- seam 改造已经被最近的 perf 和 preview work 证明有效
- 当前最大的 architectural debt 是 boundary ownership，不是 engine capability
- 如果现在直接做 broader reset，很容易把问题重新描述一遍，但不能更快落地

## Blast Radius

### 直接受影响边界

- `packages/ai/src/react/ai-chat/streaming/*`
- `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts`
- `packages/ai/src/react/ai-chat/AIChatPlugin.ts`
- `packages/ai/src/react/ai-chat/utils/resetAIChat.ts`
- `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
- template mirror 中对应 AI kit / use-chat 路径

### 不应在第一刀大动的边界

- `packages/markdown` 的整体 public API
- stringify-side fork strategy
- comment / table / suggestion flows 的完整统一抽象
- editor substrate 选型

## Phased Rollout

### Phase 1. 私有化 insert streaming session

目标：

- 引入 package-private `MarkdownStreamSession`
- 把 insert runtime state 从 `AIChatPlugin` options 中移走

成功标准：

- `_blockChunks`、`_blockPath`、`_mdxName` 不再留在 `AIChatPlugin`
- 现有 insert streaming tests 保持通过

### Phase 2. 规范 transport events

目标：

- 让 insert-mode path 能消费明确 stream events
- “assistant 全文 diff” 退化为兼容层，而不是主 contract

成功标准：

- package path 不再以 accumulated message diff 为唯一 streaming source
- finish/reset 语义保持不变

### Phase 3. 收敛 package 与 demo 的 shaping rules

目标：

- 让 joiner / batching contract 不再只存在于 app/demo 侧

成功标准：

- demo 与 package path 共享同一套 authoritative shaping 规则
- perf 收益可以从真实 package path 复现

### Phase 4. 再决定 public surface

目标：

- 在 internal session 稳定后，再决定是否公开 `tf.ai.stream.*`

成功标准：

- 公共 API 面向 workflow，而不是 internals

## Acceptance Criteria For This Decision

如果后续实现遵循这份决策，至少应达到：

1. insert-mode streaming 有唯一清晰的 package-level runtime path
2. plugin state 只描述 workflow state
3. preview lifecycle 保持 local 且 history-safe
4. demo/perf 与 package behavior 不再长期漂移
5. 下一轮性能优化能在 package path 上体现，而不只是 demo 中体现

## Open Questions

这些问题当前不阻塞决策，但会影响后续设计细节：

1. `MarkdownJoiner` 是否应在下一阶段就下沉到 package-private 层
2. transport event 统一时，comment / table non-text parts 是否要立刻纳入同一 event model
3. `streamInsertChunk` 是否保留现名对外暴露，还是内部收敛后再重新命名

## One-Sentence Call

下一阶段正确的架构方向不是“重写 Plate AI”，也不是“追求 markdown round-trip”，而是“在当前 Plate substrate 上收敛出一条 package-private 的 insert streaming session pipeline，把 transport、shaping、runtime ownership、preview lifecycle 的边界理顺”。 
