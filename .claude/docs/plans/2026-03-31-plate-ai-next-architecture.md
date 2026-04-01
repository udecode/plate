# Plate AI Next-Stage Architecture Decision

## Source Of Truth

- User request: determine the right architectural direction for Plate's next AI refactor stage
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

### Decision To Make

Determine the right primary architecture for Plate's next AI refactor stage instead of jumping straight into implementation.

This decision does not answer "how do we fix one bug." It answers:

1. What the real central seam is for the next AI refactor stage
2. Which existing directions should stay
3. Which boundaries should be reworked
4. Which directions should explicitly not be pursued now

### Major-Work Lane

- lane: architecture or public API
- secondary lane: benchmark or performance
- work type: analytical only

### Expected Outcome

Produce an architecture decision memo that can directly guide the next implementation stage, including:

- recommended direction
- why the alternatives are not selected
- supporting evidence
- affected boundaries
- phased rollout order

### Decision Criteria

This architecture direction must satisfy all of the following:

1. Make insert-mode AI streaming more stable
2. Make long-document streaming faster
3. Reduce hot-path hacks and cross-layer state coupling
4. Reuse Plate's existing good direction instead of resetting from scratch
5. Let the package path and demo/perf path converge over time
6. Avoid pushing complexity back into strict markdown round-trip concerns

### Browser Surface

- No real browser surface must be validated first for this decision
- Browser pages may serve as later perf validation tools, but they are not the primary artifact of this decision

### Likely Highest-Leverage Seam

The insert-mode streaming runtime boundary.

More concretely, the boundary between:

- transport events
- markdown shaping
- streaming session state
- preview lifecycle
- plugin UI and workflow state

## Repo Constraints

### Clear Existing Constraints

1. The current main contract is still:
   - raw chunks
   - joiner or shaping
   - `streamInsertChunk`
   - correct Plate editor state
2. The current main goal is not strict markdown round-trip
3. A parse-side local fork may exist, but it should stay minimal
4. Preview behavior should use localized rollback, not full-document snapshot restore
5. Recent perf results already show:
   - the main bottleneck is not the `joiner`
   - the bigger issue is `streamInsertChunk` call count and editor update count

### Constraint From The Editor Candidate Analysis

`major-task` explicitly requires editor-framework-facing work to start from `/.claude/docs/analysis/editor-architecture-candidates.md` instead of widening the comparison arbitrarily.

That means if we discuss changing the editor substrate, the first meaningful comparison is still:

- Plate and Slate inheritance pressure
- ProseMirror or Lexical as deeper runtime references

Current repo evidence does not show that we must replace the editor substrate now.

## Facts

### F1. The Right Streaming Core Direction Is Already Emerging

From `streamInsertChunk.ts`, the handoff doc, and the tests:

- the current core no longer depends on serialize or compare or retry loops
- the direction is replay unstable tail plus patch changed suffix
- this is already closer to the right model than reprocessing the full prefix

### F2. The Preview Lifecycle Boundary Is Reasonable

From `aiStreamSnapshot.ts` and related solution docs:

- preview begin or accept or cancel or discard already has local block-level semantics
- accept and cancel no longer depend on full-document `setValue`
- this area is already workflow-oriented API, not parser-oriented hackery

### F3. Runtime Internals Still Leak Through `AIChatPlugin` Option State

From `AIChatPlugin.ts`, option state still stores:

- `_blockChunks`
- `_blockPath`
- `_mdxName`

These are insert-stream runtime bookkeeping details, not user-facing workflow state.

### F4. The Package Path And Demo Or Perf Path Still Do Not Share One True Pipeline

Comparing the `apps/www` demo or perf files with the package path shows:

- demo or perf already has raw chunks, joiner, burst shaping, and measured batching
- the package insert path still mainly runs through `useChatChunk`
- `useChatChunk` does not consume provider-native stream events; it consumes diffs from accumulated assistant text

### F5. The Current Transport Contract Is Too Weak

`useChatChunk.ts` currently does the following:

1. Reads the last assistant message
2. Finds the text part
3. Slices the suffix using previously inserted text length
4. Treats that suffix as the chunk

That means the package core still partly depends on message accumulation semantics instead of a clear transport event contract.

### F6. Recent Perf Results Show Update Count Is The Main Lever

The burst batching results show:

- a slightly slower single `streamInsertChunk` call is not the main issue
- the real win comes from a much lower total call count
- this means the next optimization target should be the pipeline boundary, not serializer purity

### F7. The Existing Test Anchors Already Support One Round Of Boundary Refactor

The current high-value anchors are:

- `streamInsertChunk.slow.tsx`
- `streamHistory.slow.tsx`

They already cover:

- regrouping invariance
- preview history contract
- accept or undo or redo behavior

That means the next step can refactor boundaries without first rebuilding the whole test system.

## Inference

### I1. The Main Problem Is Not The Editor Substrate

If the editor substrate were wrong enough to require replacement, the last two important wins would not have landed this directly:

- localized rollback
- burst batching

Both indicate the current substrate still has meaningful headroom. The main problem is boundary design, not engine choice.

### I2. The Highest-Leverage Cleanup Is The Insert Streaming Session, Not The Parser Surface

The parse-side fork already carries the small set of responsibilities it should carry:

- pending tail
- incomplete suffix parse hints

Pushing more editor-specific behavior down into that layer would increase fork fragility while yielding diminishing returns.

### I3. `AIChatPlugin` Currently Owns Runtime State It Should Not Own

The plugin option state currently mixes:

- UI or workflow state
- transport-derived streaming internals

That will keep reset, finish, reuse, and future public API design centered around internals instead of workflow semantics.

### I4. The Package Path Cannot Keep Using Full-Message Diff As The Primary Streaming Contract

That path can remain as a compatibility layer, but it should not stay the architectural center.

Otherwise:

- provider cadence cannot be modeled accurately
- raw event visibility stays trapped in the demo
- the package path and demo path keep diverging

### I5. The Right Unit For The Next Stage Is Not A Bigger AI Engine But A Clearer Insert-Mode Session

It is still too early to force insert, edit, comment, and table modes into one large unified engine.

The clean core worth building first is insert-mode markdown streaming.

## Recommendation

### Primary Recommendation

The next stage should reorganize insert-mode streaming around a package-private `MarkdownStreamSession`.

That session should own:

- accumulated markdown source
- normalized stream events
- joiner or batching or finish-flush shaping results
- replay runtime state
- calls into `streamInsertChunk`
- unified reset and finish bookkeeping

### Recommended Layering

```text
Provider / AI SDK / demo fetch stream
  -> transport adapter
  -> normalized stream events
  -> markdown stream shaper
  -> MarkdownStreamSession
  -> tf.ai preview lifecycle
  -> Plate editor state
```

### Responsibility By Layer

#### 1. Transport Adapter

Responsibilities:

- normalize provider-specific events
- emit text delta or finish or abort or non-text part

Does not own:

- editor mutation
- preview
- markdown joining

#### 2. Markdown Stream Shaper

Responsibilities:

- markdown syntax join decisions
- cadence or burst batching
- pre-finish flush behavior

This layer is the right future home for any package-private `MarkdownJoiner`.

#### 3. `MarkdownStreamSession`

Responsibilities:

- maintain source accumulation
- maintain replay runtime state
- submit shaped markdown batches into `streamInsertChunk`
- own insert-mode runtime state

This layer should remove `_blockChunks`, `_blockPath`, and `_mdxName` from `AIChatPlugin`.

#### 4. `tf.ai.*` Preview Lifecycle

Responsibilities:

- `beginPreview`
- `acceptPreview`
- `cancelPreview`
- `discardPreview`
- `undo`

This layer should keep the current local, history-safe, workflow-oriented semantics.

#### 5. `AIChatPlugin`

Keep only real workflow state:

- `open`
- `mode`
- `streaming`
- `toolName`
- `chat`
- `chatNodes`
- `chatSelection`

It should not keep insert-stream runtime internals.

## Alternatives Considered

### A. Build A Sessionized Streaming Pipeline On The Current Plate Substrate

Decision: choose this

Why it is best now:

- it directly targets the real current problem
- it matches the recently validated perf and stability direction
- it can move forward with the smallest blast radius
- it does not require rewriting the whole AI layer or reselecting the editor

### B. Redesign Streaming Around Strict Markdown Round-Trip

Decision: do not choose

Why:

- it optimizes text fidelity rather than the most important current UX contract
- it pushes complexity back into serializer or markdown-preserving IR work
- it pulls the codebase back toward a high-cost path that has already been de-emphasized

### C. Reopen The Editor Substrate Decision Around ProseMirror Or Lexical

Decision: do not choose now

Why:

- `major-task` requires editor comparison to start from the candidate map, not generic platform tourism
- current repo evidence is not strong enough to justify a platform migration now
- this stage needs boundary cleanup, not substrate replacement

## Why This Wins Now

There are currently two directions that both look plausible:

1. a targeted seam refactor
2. a broader AI or runtime reset

The first should win now.

Why:

- recent perf and preview work already proved the seam refactor direction has leverage
- the largest architectural debt is boundary ownership, not engine capability
- a broader reset would likely reframe the problem without landing value faster

## Blast Radius

### Directly Affected Boundaries

- `packages/ai/src/react/ai-chat/streaming/*`
- `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts`
- `packages/ai/src/react/ai-chat/AIChatPlugin.ts`
- `packages/ai/src/react/ai-chat/utils/resetAIChat.ts`
- `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
- the matching AI kit or use-chat paths in the template mirror

### Boundaries That Should Not Move Much In The First Cut

- the overall public API of `packages/markdown`
- stringify-side fork strategy
- a fully unified abstraction across comment, table, and suggestion flows
- editor substrate selection

## Phased Rollout

### Phase 1. Privatize The Insert Streaming Session

Goals:

- introduce a package-private `MarkdownStreamSession`
- move insert runtime state out of `AIChatPlugin` options

Success criteria:

- `_blockChunks`, `_blockPath`, and `_mdxName` no longer live in `AIChatPlugin`
- existing insert streaming tests still pass

### Phase 2. Normalize Transport Events

Goals:

- let the insert-mode path consume explicit stream events
- demote assistant full-message diffing into a compatibility layer instead of the primary contract

Success criteria:

- the package path no longer depends on accumulated message diff as its only streaming source
- finish and reset semantics remain unchanged

### Phase 3. Converge Package And Demo Shaping Rules

Goals:

- move joiner or batching rules out of app-only or demo-only territory

Success criteria:

- demo and package path share one authoritative shaping contract
- perf gains can be reproduced through the real package path

### Phase 4. Decide The Public Surface Later

Goals:

- once the internal session is stable, decide whether `tf.ai.stream.*` should become public

Success criteria:

- the public API is workflow-oriented instead of internals-oriented

## Acceptance Criteria For This Decision

If later implementation follows this decision, it should achieve at least:

1. insert-mode streaming has one clear package-level runtime path
2. plugin state only describes workflow state
3. preview lifecycle remains local and history-safe
4. demo or perf behavior no longer drifts away from package behavior over time
5. the next performance round shows up in the package path, not only in the demo

## Open Questions

These do not block the decision, but they do affect later design details:

1. Should `MarkdownJoiner` move into a package-private layer in the next stage
2. When transport events are unified, should comment or table non-text parts enter the same event model immediately
3. Should `streamInsertChunk` keep its current public name, or be renamed after internal convergence

## One-Sentence Call

The right next architecture move is not to rewrite Plate AI and not to chase strict markdown round-trip. It is to converge on a package-private insert streaming session pipeline on the current Plate substrate, with clearer boundaries for transport, shaping, runtime ownership, and preview lifecycle.
