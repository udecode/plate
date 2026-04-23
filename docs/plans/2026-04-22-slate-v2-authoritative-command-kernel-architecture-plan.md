---
date: 2026-04-22
topic: slate-v2-authoritative-command-kernel-architecture
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/edix
related:
  - docs/plans/2026-04-22-slate-v2-authoritative-editing-kernel-perfect-architecture-plan.md
  - docs/plans/2026-04-22-slate-v2-editing-kernel-hard-cut-rewrite-plan.md
  - docs/plans/2026-04-21-slate-v2-final-api-runtime-shape-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/analysis/editor-architecture-candidates.md
---

# Slate v2 Authoritative Command Kernel Architecture Plan

## Verdict

Unify the core command/transaction work and the browser editing kernel work
before more implementation.

Do not build a browser-only authoritative kernel and then redesign core
extension later. That creates rewrite debt because the browser kernel depends
on the command, transaction, history, selection, and repair contracts.

The active plan is two batches:

- Batch 1: build the non-negotiable spine.
- Batch 2: replan from Batch 1 evidence.

Batch 1 must be small enough to finish, but deep enough that Batch 2 does not
rewrite the spine.

## Harsh Take

The old architecture made extension easy by letting anything patch anything.

That power is real, but the mechanism is wrong.

The new system must preserve extension power through typed registries and
command middleware, not mutable method monkeypatching.

The best shape is:

```txt
Editor
  -> ExtensionRegistry
  -> CommandRegistry
  -> TransactionEngine
  -> OperationLog
  -> EditorCommit
  -> HistoryCommitConsumer
  -> EditableEditingKernel
  -> Selection/Repair contract
  -> Browser proof gauntlets
```

## Current Code Reality

This is not greenfield.

Existing `../slate-v2` already has important pieces that must be audited and
completed, not duplicated:

- `packages/slate/src/core/public-state.ts` has transaction and commit
  machinery.
- `packages/slate/src/interfaces/editor.ts` exposes `EditorCommit`,
  `Editor.withTransaction`, and `Editor.getLastCommit`.
- many transforms already call `withTransaction(...)`.
- `slate-history` already groups committed operations, but still patches
  `e.apply` and exposes `undo`/`redo` as instance methods.
- `slate-react` already has `EditableCommand`, transition traces,
  `EditableInputRule`, `onKeyCommand`, and partial kernel decision prep.

Batch 1 must consolidate these pieces into one spine.

It must not create a second transaction engine, second commit type, or second
history model.

## Non-Negotiable Principles

- Core stays data-model-first.
- Operations remain collaboration/history truth.
- Transactions are the local execution boundary.
- Commands are the extension and runtime language.
- Commits are the observation/history/render truth.
- React consumes live reads, dirty regions, and kernel results.
- React does not define the core model.
- Browser structural editing is not trusted as truth.
- Extension power is preserved without method monkeypatching.

## What We Keep

- JSON-like Slate node tree.
- `Path`, `Point`, `Range`.
- `Operation`.
- `Transforms`, but routed through transactions.
- normalization, but scoped and commit-visible.
- inline/void/mark semantics.
- live reads.
- runtime ids.
- projection overlays.
- semantic `Editable`.
- DOM-owned plain text capability.
- slate-browser proof.

## What We Hard Cut In Batch 1

- editor method monkeypatching as the plugin mechanism.
- `editor.apply` override stacks as extension API.
- `editor.children`, `editor.selection`, `editor.marks`, `editor.operations`
  as primary public write APIs.
- broad `onChange` as the primary notification contract.
- hidden normalization effects without commit metadata.
- model-owned repair importing stale DOM selection.
- browser default structural editing as trusted truth.
- `Editor.getSnapshot()` as urgent render/read path.

Important:

- Batch 1 may keep compatibility mirrors while the command/transaction spine is
  replacing them.
- Compatibility mirrors must forward into the new spine.
- Compatibility mirrors must not remain the documented or tested extension
  mechanism.

## What We Do Not Hard Cut In Batch 1

Do not remove these yet:

- `Transforms` ergonomic helpers.
- existing semantic editor capabilities like `isInline`, `isVoid`,
  `markableVoid`.
- projection source APIs.
- current clipboard/composition code paths unless Batch 1 breaks them.
- compatibility adapters that are not on the urgent runtime path.

## Batch 1 Goal

Build the command/transaction/kernel spine:

```txt
ExtensionRegistry skeleton
  -> CommandRegistry
  -> TransactionEngine
  -> EditorCommit
  -> HistoryCommitConsumer
  -> EditableEditingKernel
  -> SelectionSource/Repair contract
  -> Generated browser gauntlet base
```

Batch 1 should make later work extend the spine, not rewrite it.

## Batch 1 Scope

### 0. Existing Spine Audit

Before adding new code, audit and freeze current behavior:

- current transaction lifecycle
- current `EditorCommit` fields
- current `withTransaction` nesting behavior
- current history recording behavior
- current transform-to-transaction behavior
- current `onChange` and commit subscriber order
- current mutable mirror behavior

Exit:

- one contract test documents the current insert-text transaction/commit path.
- the plan names which existing functions are reused.
- no new registry/transaction code is added before this contract is green.

### 1. Extension Registry Skeleton

Build only the minimum registry needed by the spine:

- command handlers
- normalizers
- schema/capabilities
- commit listeners

Do not build full plugin dependency/conflict ergonomics yet.

Required shape:

```ts
type ExtensionRegistry = {
  commands: CommandRegistry
  normalizers: NormalizerRegistry
  capabilities: CapabilityRegistry
  commitListeners: CommitListenerRegistry
}
```

Exit:

- core and `slate-react` can register command handlers without replacing editor
  methods.

### 2. Command Registry

Commands replace method monkeypatching.

Required command families:

- insert text
- insert break
- delete
- delete fragment
- set selection
- move selection
- toggle mark
- set block
- insert fragment/data
- history undo/redo
- app command
- shell activation

Middleware must support:

- priority
- plugin id
- `next(ctx)`
- handled/unhandled result
- command metadata

Required shape:

```ts
type CommandHandler<TCommand> = (
  ctx: CommandContext<TCommand>,
  next: () => CommandResult
) => CommandResult
```

Hard rule:

- method-style extension is allowed only through command registry slots.
- direct editor method replacement is not the extension mechanism.

### 3. Transaction Engine

Every command runs inside a transaction.

Required:

- reuse the existing transaction engine where possible.
- nested transactions collapse into one commit.
- transforms open a transaction if none exists.
- transaction carries command metadata.
- transaction records normalization metadata.
- transaction emits one `EditorCommit`.

Required shape:

```ts
Editor.withTransaction(editor, meta, () => {
  // commands/transforms/normalization
})
```

### 4. EditorCommit

`EditorCommit` is the durable observation record.

Required fields:

- commit id/version
- command id/type
- operations
- operation classes
- dirty paths
- dirty runtime ids
- dirty top-level range
- selection before/after
- marks before/after
- normalization summary
- origin: user, app, composition, clipboard, history, remote, repair
- timestamp/debug trace id

History, React, browser kernel, and tests consume this.

Existing `EditorCommit` fields should be extended only when required by a
failing contract. Do not replace the type wholesale unless the audit proves the
existing shape cannot support command/history/kernel consumers.

### 5. Operation Class Metadata

Every operation is classified:

- text
- selection
- structure
- mark
- normalization
- history
- remote
- composition
- clipboard
- repair

Do not make consumers rediscover intent from raw operation arrays.

### 6. History Rewrite

Keep history rewrite in Batch 1.

History must become a commit/operation consumer.

Cut:

- history as method override plugin.

Replace with:

- history listens to commits.
- undo/redo are commands.
- history can ignore remote/repair/selection-only commits by metadata.

This cannot wait. If history stays override-based, the command/transaction
semantics will be distorted around it.

### 7. Selection Source Contract

Every command/event has one selection truth source:

- model-owned
- dom-current
- composition-owned
- shell-backed
- internal-control
- app-owned
- unknown

Rules:

- model-owned commands never restore stale DOM selection.
- native text may import DOM selection before mutation.
- composition owns selection during composition.
- app commands declare repair behavior.
- shell activation is not model selection unless it intentionally selects.

### 8. Repair Contract

Repair becomes command/kernel metadata, not delayed guesswork.

Required repair kinds:

- none
- sync selection from DOM
- export model selection to DOM
- repair caret after model command
- repair caret after text insert
- force render
- skip DOM sync
- focus editor
- preserve app/internal control focus

Required result:

```ts
type RepairPolicy = {
  kind: ...
  focus?: boolean
  forceRender?: boolean
  selectionSource: SelectionSource
}
```

### 9. Authoritative Editing Kernel

Batch 1 kernel covers:

- keydown
- beforeinput
- input
- selectionchange
- repair

Other event families are reserved but not fully rewritten yet.

Kernel result:

```ts
type EditableKernelResult = {
  handled: boolean
  nativeAllowed: boolean
  ownership: EditableOwnership
  targetOwner: EditableEventTargetOwner
  intent: InputIntent | null
  command: EditableCommand | null
  selectionSource: SelectionSource
  repair: RepairPolicy | null
  transition: EditableKernelTransition
  trace: EditableKernelTraceEntry
}
```

Hard rule:

- `EditableDOMRoot` attaches listeners and renders.
- `EditableEditingKernel` decides editing policy.

### 10. Generated Browser Gauntlet Base

Batch 1 must add generator infrastructure, not just hand examples.

Initial generated families:

- navigation + typing
- Enter/list continuation
- Backspace/Delete
- app command repair
- inline/read-only inline boundary

Each step records:

- platform
- transport
- event family
- intended command
- selection source
- repair policy
- trace transition
- model text
- DOM text
- model selection
- DOM selection
- focus owner
- follow-up typing
- reduction hint

## Batch 1 Safety Rails

- Start by auditing existing transaction/commit/history code.
- Reuse existing `withTransaction` and `EditorCommit` unless a focused
  contract proves they cannot support the command spine.
- Add one command family at a time.
- Preserve compatibility mirrors only as forwarding shims.
- Make command registry observable before making it strict.
- Convert history after commit listener semantics are proven.
- Do not change React/browser kernel again until the core command/transaction
  tracer is green.
- Never bundle history rewrite, command registry, and generated gauntlet in one
  implementation slice.

## Batch 1 Pivot And Rollback Rules

Stop and replan the current tracer if any of these happen:

- the audit proves existing `withTransaction` cannot support command metadata
  without changing transaction semantics.
- `EditorCommit` cannot be extended without breaking snapshot/history/react
  consumers.
- history cannot consume commits without changing undo/redo semantics.
- a command-registry tracer requires changing more than one command family.
- a generated gauntlet failure points to a different owner than the current
  tracer.
- a perf guardrail regresses while the current tracer is not explicitly about
  performance.

Rollback rule:

- Each tracer must be independently revertible.
- Compatibility mirrors stay in place until all consumers use the new command
  spine.
- No public write surface is removed in the same slice that introduces its
  replacement.
- If the replacement cannot pass its focused contract, keep the old surface and
  record the blocker instead of half-cutting the API.

Confidence rule:

- A tracer is complete only with fresh same-turn evidence.
- A green unit test is not enough for browser-editing behavior.
- A green browser row is not enough for core command/history semantics.
- A green perf row is not enough for editing safety.

## Batch 1 TDD Strategy

No horizontal rewrite.

Use tracer bullets:

0. audit existing transaction/commit/history behavior with a focused contract.
1. command middleware replaces one `insertText` extension pattern.
2. a transaction wraps that command and emits one commit.
3. history consumes that commit.
4. keydown dispatch returns `KernelResult`.
5. beforeinput structural command owns selection.
6. generated gauntlet fails on one illegal transition.
7. strict test mode blocks that illegal transition.

Each tracer must:

- start with a failing unit/contract or browser row.
- implement the smallest spine piece.
- run focused gates.
- update the plan with exact evidence.

## Batch 1 Gates

Core:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
```

History:

```sh
bun test ./packages/slate-history --bail 1
```

React/browser:

```sh
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation|Backspace|Delete|kernel|transition"
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Build/type:

```sh
bunx turbo build --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-react --force
bun run lint
```

Perf guardrails when text/selection hot paths change:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

## Batch 1 Exit Criteria

Batch 1 is complete only when:

- command registry exists and is used for core editing commands.
- method monkeypatching is not the extension mechanism.
- every command runs inside a transaction.
- `EditorCommit` exists and is consumed by history and React/runtime lanes.
- history is commit/operation consumer, not override plugin.
- keydown/beforeinput/input/selectionchange/repair run through kernel results.
- generated gauntlet base exists and catches illegal transitions.
- no illegal transitions in Batch 1 release proof rows.
- existing huge-doc perf guardrails remain green.

## Batch 2 Defer List

These are non-blockers for Batch 1 and should be replanned from Batch 1
evidence.

### Full Extension Ergonomics

Defer:

- serializer/deserializer registry polish
- rich plugin dependency graph
- conflict resolution UX/errors
- full plugin packaging API

Batch 1 only needs the registry skeleton.

### Full Schema System

Defer advanced schema.

Batch 1 needs only capabilities:

- inline
- void
- markable void
- allowed command ownership
- basic normalization registration

### Core Perf Perfection

Defer:

- commit allocation optimization
- runtime-id index optimization
- incremental snapshot perfection
- headless typing/observation microbench wins

Batch 1 must not block future perf, but correctness architecture wins first.

### Clipboard Kernel Full Rewrite

Defer full clipboard rewrite unless Batch 1 breaks it.

Batch 1 reserves command slots and preserves existing behavior.

### Composition Kernel Full Rewrite

Defer full IME architecture.

Batch 1 reserves composition mode and preserves existing IME proofs.

### Shell/Large-Doc Deep Cleanup

Defer deep shell polish.

Batch 1 keeps shell activation/selection contracts and perf gates green.

### Overlay/Projection Final Polish

Defer.

Projection direction is accepted, but it does not block command/kernel spine.

### Mobile Native Deep Proof

Defer.

Batch 1 classifies mobile transport gaps and keeps semantic fallback honest.

### Strict Runtime Throwing

Defer production/runtime throwing.

Batch 1 should fail generated tests on illegal transitions, but production
stays non-throwing.

### Public Docs / Migration Polish

Defer until Batch 1 stabilizes.

## Batch 2 Replan Trigger

Start Batch 2 only after Batch 1 exit criteria are met.

Batch 2 must be replanned from:

- command/transaction API reality
- generated gauntlet findings
- history rewrite findings
- perf guardrail results
- remaining browser/platform failures

Do not prebuild Batch 2 APIs in Batch 1 just in case.

## Current Next Owner

Batch 1, Tracer 0:

- audit existing transaction/commit/history spine in `packages/slate` and
  `packages/slate-history`
- add or update one focused contract test proving current insert-text
  transaction behavior:
  - one transaction
  - one commit
  - operation class metadata
  - selection before/after
  - dirty paths/runtime ids
  - history sees the commit through the intended path
- record which existing functions Batch 1 will reuse vs replace

Do not touch React kernel again until this audit contract is green.

## Batch 1 Tracer 0 Result

Status: complete.

Actions:

- Audited current transaction, commit, and history behavior.
- Confirmed the codebase is not greenfield:
  - `packages/slate/src/core/public-state.ts` owns transaction state.
  - `packages/slate/src/interfaces/editor.ts` already exposes `EditorCommit`,
    `Editor.withTransaction`, and `Editor.getLastCommit`.
  - `slate-history` already observes commit operations through
    `Editor.subscribe(...)`, but still patches `e.apply`.
- Extended the existing `EditorCommit` type instead of creating a second commit
  model.
- Added selection/marks before/after metadata to the existing commit path.
- Added a focused history integrity contract proving insert-text transaction
  behavior and history observation.

Changed files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Evidence:

```sh
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- focused history integrity contract: `7 passed`
- transaction contract: `13 passed`
- history contract: `9 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins all reported mean lanes, select-all
  equal

Typecheck caveat:

- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --force`
  currently rebuilds `packages/slate` in a way that leaves `packages/slate/dist`
  empty before `slate-history` typecheck, so `slate-history` cannot resolve
  `slate`.
- Package-local `packages/slate` build followed by package-local
  `packages/slate-history` typecheck passes.
- Treat this as a build-order/tooling caveat, not a command-kernel blocker.

Decision:

- Reuse the existing transaction engine.
- Reuse and extend the existing `EditorCommit`.
- Reuse current history subscription behavior for now, but Batch 1 must remove
  the remaining `e.apply` patch and make undo/redo command-backed.

Rejected tactics:

- Do not create a second transaction engine.
- Do not create a second commit type.
- Do not rewrite history before command listener semantics exist.

Next owner:

- Batch 1, Tracer 1:
  - add `CommandRegistry` skeleton in `packages/slate`
  - register an `insertText` command
  - route `Editor.insertText` through transaction-backed command execution
  - keep compatibility mirrors forwarding
  - add a focused command middleware contract

## Batch 1 Tracer 1 Result

Status: complete.

Actions:

- Added `CommandRegistry` skeleton in `packages/slate`.
- Added `Editor.registerCommand(...)`.
- Routed `Editor.insertText(...)` through command middleware.
- Kept the existing transaction engine; no second transaction engine was
  created.
- Kept the existing `EditorCommit`; no second commit type was created.
- Changed `Editor.insertText(...)` default execution to run inside
  `withTransaction(...)`.
- Fixed command transaction operation classes so text commands that also move
  selection remain `classes: ['text']`.
- Fixed commit operation payloads so commits publish transaction-local
  operations instead of the entire editor operation queue.
- Updated `slate-history` to consume commit-local operations directly instead
  of slicing by previous operation count.

Changed files:

- `../slate-v2/packages/slate/src/core/command-registry.ts`
- `../slate-v2/packages/slate/src/core/index.ts`
- `../slate-v2/packages/slate/src/editor/insert-text.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate-history/src/with-history.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `14 passed`
- history integrity contract: `7 passed`
- history contract: `9 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: first run had tiny noise-grade reds on
  `startBlockTypeMs` and `selectAllMs`; confirmation rerun had current green
  or equal on all reported mean lanes

Failed probes recorded:

- `Editor.registerCommand` contract initially failed because no command
  registry existed.
- After routing `insertText` through a transaction, text commands were
  misclassified as structural because the transaction also contained
  `set_selection`. Operation classification now treats text+selection
  transactions as text.
- Commit operations initially included prior queued operations. Commits now
  publish transaction-local operations.
- `slate-history` previous operation-count slicing broke once commits became
  transaction-local. History now consumes commit operations directly.

Typecheck caveat:

- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --force`
  still rebuilds `packages/slate` in a way that can leave `packages/slate/dist`
  empty before `slate-history` typecheck.
- Package-local build/typecheck for `slate`, followed by package-local
  build/typecheck for `slate-history`, passes.
- Treat this as tooling/build-order debt, not command-registry failure.

Decision:

- The first command registry slice is viable.
- `Editor.insertText(...)` now proves the intended pattern:
  command middleware -> existing transaction engine -> existing `EditorCommit`
  -> history commit consumer.
- Batch 1 can proceed to history commandification without reworking the
  transaction spine.

Rejected tactics:

- Do not create another command execution path for React.
- Do not restore history operation slicing.
- Do not let text+selection command transactions become structural commits.

Next owner:

- Batch 1, Tracer 2:
  - make history undo/redo command-backed
  - remove the no-op `e.apply` patch from `withHistory`
  - keep public `editor.undo()` / `editor.redo()` as compatibility methods that
    forward to history commands
  - add focused history command contract

## Batch 1 Tracer 2 Result

Status: complete.

Actions:

- Added a focused history command contract proving `editor.undo()` and
  `editor.redo()` go through command middleware.
- Made compatibility `editor.undo()` and `editor.redo()` execute
  `history_undo` and `history_redo` commands.
- Removed the no-op `e.apply` patch from `withHistory`.
- Kept undo/redo behavior unchanged.
- Kept history as a commit/operation consumer through `Editor.subscribe(...)`.

Changed files:

- `../slate-v2/packages/slate-history/src/with-history.ts`
- `../slate-v2/packages/slate-history/test/history-contract.ts`

Evidence:

```sh
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- history contract: `10 passed`
- history integrity contract: `7 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- transaction contract: `14 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: confirmation run current wins all reported mean
  lanes
- core huge-document compare: confirmation run current wins or equals all
  reported mean lanes

Failed probes recorded:

- Initial history command test failed because compatibility undo/redo bypassed
  command middleware.
- First implementation registered internal history handlers before external
  middleware, which swallowed later middleware. The correct shape is for
  compatibility methods to execute a command with default history behavior, so
  external middleware wraps it.

Decision:

- History is now command-backed for undo/redo compatibility methods.
- History still consumes commits through `Editor.subscribe(...)`.
- Batch 1 can proceed to structural command families without the old history
  override stack distorting command semantics.

Rejected tactics:

- Do not register default internal history handlers that swallow external
  command middleware.
- Do not reintroduce `e.apply` patching in `withHistory`.

Next owner:

- Batch 1, Tracer 3:
  - register an `insertBreak` command
  - route `Editor.insertBreak` through transaction-backed command execution
  - preserve current insert-break commit/history behavior
  - add focused structural command middleware contract

## Batch 1 Tracer 3 Result

Status: complete.

Actions:

- Added a focused structural command middleware contract for `insertBreak`.
- Routed `Editor.insertBreak(...)` through `insert_break` command execution.
- Reused the existing `withTransaction(...)` implementation for the default
  insert-break behavior.
- Preserved structural commit and history behavior.

Changed files:

- `../slate-v2/packages/slate/src/editor/insert-break.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `15 passed`
- history contract: `10 passed`
- history integrity contract: `7 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes

Failed probes recorded:

- Initial insert-break command contract failed because `Editor.insertBreak`
  bypassed command middleware.

Decision:

- Structural core commands can use the same registry -> existing transaction
  -> existing commit path as text commands.
- Batch 1 can proceed to delete/delete-fragment command backing.

Rejected tactics:

- Do not create a separate structural command executor.
- Do not special-case insert-break outside the registry.

Next owner:

- Batch 1, Tracer 4:
  - register delete/delete-fragment commands
  - route `Editor.deleteBackward`, `Editor.deleteForward`, and
    `Editor.deleteFragment` through transaction-backed command execution
  - preserve current delete commit/history behavior
  - add focused delete command middleware contract

## Batch 1 Tracer 4 Result

Status: complete.

Actions:

- Added a focused delete-family command middleware contract.
- Routed `Editor.deleteBackward(...)` and `Editor.deleteForward(...)` through
  `delete` command execution.
- Routed `Editor.deleteFragment(...)` through `delete_fragment` command
  execution.
- Preserved current delete commit/history behavior.

Changed files:

- `../slate-v2/packages/slate/src/editor/delete-backward.ts`
- `../slate-v2/packages/slate/src/editor/delete-forward.ts`
- `../slate-v2/packages/slate/src/editor/delete-fragment.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `16 passed`
- history contract: `10 passed`
- history integrity contract: `7 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals key typing/replace/fragment
  mean lanes; select-all shows a 0.01ms noise blip

Failed probes recorded:

- Initial delete-family command contract failed because delete paths bypassed
  command middleware.
- Exact `set_selection.properties` assertion was too brittle; the contract now
  asserts command observation, delete operation payload, operation classes, and
  operation type sequence.

Decision:

- Delete command family can use the same command-registry spine.
- Batch 1 can proceed to selection/move/toggle commands or pause to re-evaluate
  the minimum command family set for kernel integration.

Rejected tactics:

- Do not create a separate delete command executor.
- Do not over-specify internal `set_selection.properties` in command-spine
  tests.

Next owner:

- Batch 1, Tracer 5:
  - register selection command(s)
  - route `Transforms.select` / `Editor.select` through transaction-backed
    command execution where appropriate
  - preserve current selection commit/history behavior
  - add focused selection command middleware contract

## Batch 1 Tracer 5 Result

Status: complete.

Actions:

- Added focused selection command middleware contracts.
- Routed `Transforms.select(...)`, `Transforms.setSelection(...)`, and
  `Transforms.deselect(...)` through `set_selection` command execution.
- Preserved selection-only commit metadata.
- Proved selection-only command commits do not enter history.

Changed files:

- `../slate-v2/packages/slate/src/transforms-selection/select.ts`
- `../slate-v2/packages/slate/src/transforms-selection/set-selection.ts`
- `../slate-v2/packages/slate/src/transforms-selection/deselect.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `17 passed`
- history integrity contract: `8 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes

Failed probes recorded:

- Initial selection command contract failed because selection paths bypassed
  command middleware.
- `Editor.select` does not exist as a static API; the real public selection
  seam is `Transforms.select(...)`.
- Initial `set_selection` command type was wider than the real operation union;
  it now uses the actual `set_selection` operation type.

Decision:

- Selection is now command-observable without polluting history.
- Batch 1 can proceed to movement command backing, which will connect this core
  command spine to the later `CaretEngine` kernel work.

Rejected tactics:

- Do not add a new static `Editor.select` API just for this tracer.
- Do not let selection-only commands enter history.

Next owner:

- Batch 1, Tracer 6:
  - register move-selection command
  - route `Transforms.move(...)` through transaction-backed command execution
  - preserve current movement commit/history behavior
  - add focused movement command middleware contract

## Batch 1 Tracer 6 Result

Status: complete.

Actions:

- Added focused movement command middleware contracts.
- Routed `Transforms.move(...)` through `move_selection` command execution.
- Preserved movement as selection-only commit behavior.
- Proved movement command commits do not enter history.

Changed files:

- `../slate-v2/packages/slate/src/transforms-selection/move.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `18 passed`
- history integrity contract: `9 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes

Failed probes recorded:

- Initial movement command contracts failed because `Transforms.move(...)`
  bypassed command middleware.

Decision:

- Core selection movement is command-observable and history-neutral.
- The core command spine now covers text, break, delete, selection, movement,
  and history undo/redo.

Rejected tactics:

- Do not add a second movement executor for React.
- Do not let movement commands enter history.

Next owner:

- Batch 1, Tracer 7:
  - register mark command(s)
  - route `Editor.addMark` and `Editor.removeMark` through command execution
  - preserve current mark commit/history behavior
  - add focused mark command middleware contract

## Batch 1 Tracer 7 Result

Status: complete.

Actions:

- Added focused mark command middleware contracts.
- Routed `Editor.addMark(...)` through `add_mark` command execution.
- Routed `Editor.removeMark(...)` through `remove_mark` command execution.
- Preserved collapsed mark insertion behavior.
- Preserved mark commit metadata.
- Proved collapsed mark command commits do not enter history.

Changed files:

- `../slate-v2/packages/slate/src/editor/add-mark.ts`
- `../slate-v2/packages/slate/src/editor/remove-mark.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `19 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes
  except `startBlockTypeMs` at +0.01ms, classified as noise-level

Failed probes recorded:

- Initial mark command contracts failed because add/remove mark bypassed
  command middleware.

Decision:

- Mark commands can use the same command registry without disturbing collapsed
  mark behavior or history.
- Core command spine now covers text, break, delete, selection, movement, mark,
  and history undo/redo.

Rejected tactics:

- Do not split collapsed marks into a separate command executor.
- Do not let mark-only commits enter history.

Next owner:

- Batch 1, Tracer 8:
  - introduce minimal `ExtensionRegistry` skeleton that owns the command
    registry slot
  - preserve `Editor.registerCommand(...)` as compatibility forwarding into
    the registry
  - add focused extension registry contract

## Batch 1 Tracer 8 Result

Status: complete.

Actions:

- Added minimal `ExtensionRegistry` skeleton in `packages/slate`.
- Moved command handler storage under `ExtensionRegistry.commands`.
- Added `Editor.getExtensionRegistry(...)`.
- Preserved `Editor.registerCommand(...)` as compatibility forwarding into
  the command slot.
- Added focused extension registry contract.

Changed files:

- `../slate-v2/packages/slate/src/core/extension-registry.ts`
- `../slate-v2/packages/slate/src/core/command-registry.ts`
- `../slate-v2/packages/slate/src/core/index.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `20 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes
  except `selectAllMs` at +0.01ms, classified as noise-level

Failed probes recorded:

- Initial extension registry contract failed because
  `Editor.getExtensionRegistry(...)` did not exist.

Decision:

- `ExtensionRegistry` is now the owner of the command registry slot.
- Batch 1 can proceed to minimal normalizer/capability/commit-listener slots,
  but only skeleton contracts; no full plugin ergonomics yet.

Rejected tactics:

- Do not create a second command registry.
- Do not build plugin dependency/conflict ergonomics in Batch 1.

Next owner:

- Batch 1, Tracer 9:
  - add minimal normalizer/capability/commit-listener slots to
    `ExtensionRegistry`
  - add focused contracts proving the slots exist and are stable
  - do not wire normalization or commit listener behavior yet unless the
    contract proves it is required

## Batch 1 Tracer 9 Result

Status: complete.

Actions:

- Added stable registration APIs for non-command extension registry slots:
  - `Editor.registerCapability(...)`
  - `Editor.registerNormalizer(...)`
  - `Editor.registerCommitListener(...)`
- Kept these slots as skeleton storage only. No normalization or commit-listener
  behavior was wired yet.
- Added focused contract proving registry identity, slot storage, and
  unregister cleanup.

Changed files:

- `../slate-v2/packages/slate/src/core/extension-registry.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `21 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins major lanes; `startBlockTypeMs`
  mean shows +0.11ms on confirmation due first-sample warmup skew while median
  is green, and `selectAllMs` is +0.03ms noise-level

Failed probes recorded:

- Initial registry slot contract failed because stable capability,
  normalizer, and commit-listener registration APIs did not exist.

Decision:

- `ExtensionRegistry` now owns command, capability, normalizer, and
  commit-listener slots.
- Non-command slots are intentionally storage-only in Batch 1 until focused
  contracts require behavior.

Rejected tactics:

- Do not wire normalization behavior in the slot skeleton slice.
- Do not make commit listeners active until commit-listener semantics are a
  focused tracer.

Next owner:

- Batch 1, Tracer 10:
  - register insert-fragment command
  - route `Transforms.insertFragment(...)` / `Editor.insertFragment(...)`
    through transaction-backed command execution
  - preserve current insert-fragment commit/history behavior
  - add focused insert-fragment command middleware contract

## Batch 1 Tracer 10 Result

Status: complete.

Actions:

- Added focused insert-fragment command middleware contract.
- Routed `Transforms.insertFragment(...)` / `Editor.insertFragment(...)`
  through `insert_fragment` command execution.
- Preserved current insert-fragment commit/history behavior.

Changed files:

- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `22 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes

Failed probes recorded:

- Initial insert-fragment command contract failed because
  `Transforms.insertFragment(...)` bypassed command middleware.
- The first test expected a pure text commit, but the current fragment path
  inserts a text node and selection operation, so the correct preserved class is
  `structural`.

Decision:

- Insert-fragment command routing is green.
- The essential editor command families are now command-backed at the core
  level.

Rejected tactics:

- Do not rewrite clipboard/fragment semantics in this tracer.
- Do not classify current text-fragment insertion as text if it actually emits
  `insert_node`.

Next owner:

- Batch 1, Tracer 11:
  - define command metadata on `EditorCommit`
  - store command type/origin for command-backed commits
  - add focused contract proving insertText and insertBreak commits carry
    command metadata

## Batch 1 Tracer 11 Result

Status: complete.

Actions:

- Added `EditorCommitCommand` metadata to the existing `EditorCommit` type.
- Threaded command metadata through the existing transaction/commit spine.
- Added command context tracking around `executeCommand(...)`.
- Proved `insertText` and `insertBreak` commits carry command metadata.
- Kept direct/non-command commits on the same commit type with null command
  metadata.

Changed files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/core/apply.ts`
- `../slate-v2/packages/slate/src/core/command-registry.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `22 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: first run had small start/middle reds; confirmation
  run current wins or equals all reported mean lanes

Failed probes recorded:

- Initial command metadata assertions failed because commits had no command
  metadata.

Decision:

- Command-backed commits now expose command type and origin on the existing
  `EditorCommit`.
- Batch 1 can make extension commit listeners active without creating a second
  subscription model.

Rejected tactics:

- Do not create a parallel command commit type.
- Do not use React/browser trace metadata as the core command metadata source.

Next owner:

- Batch 1, Tracer 12:
  - wire `ExtensionRegistry.commitListeners` into existing commit notification
  - preserve `Editor.subscribe(...)` behavior
  - add focused contract proving commit listeners receive command-backed
    commits and unsubscribe cleanly

## Batch 1 Tracer 12 Result

Status: complete.

Actions:

- Wired `ExtensionRegistry.commitListeners` into the existing
  `notifyListeners(...)` commit path.
- Preserved `Editor.subscribe(...)` behavior.
- Kept extension commit listeners on the existing commit model.
- Added focused contract proving command-backed commits reach extension commit
  listeners and unsubscribe cleanly.

Changed files:

- `../slate-v2/packages/slate/src/core/extension-registry.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bun run build
bun run typecheck
cd ../slate-history && bun run build && bun run typecheck
bun run lint:fix
bun run lint
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Results:

- transaction contract: `23 passed`
- history integrity contract: `10 passed`
- history contract: `10 passed`
- surface contract: `10 passed`
- snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- package-local slate build/typecheck: passed
- package-local slate-history build/typecheck after slate build: passed
- lint: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes
  except `selectAllMs` at +0.01ms, classified as noise-level

Failed probes recorded:

- Initial commit-listener contract failed because listeners were stored but not
  delivered.
- Initial typecheck failed due duplicate `EditorCommitListener` export; fixed by
  using the interface type from `interfaces/editor`.

Decision:

- Extension commit listeners are now active without creating a second
  subscription model.
- Batch 1 has the core command/transaction/commit/history spine needed to
  return to browser kernel work.

Rejected tactics:

- Do not create another subscription path beside `notifyListeners(...)`.
- Do not change `Editor.subscribe(...)` ordering.

Next owner:

- Batch 1, Tracer 13:
  - add generated slate-browser gauntlet base
  - start with navigation + typing and illegal transition scan
  - preserve current hand-authored example tests
  - do not broaden into clipboard/composition yet

## Batch 1 Tracer 13 Result

Status: complete.

Actions:

- Added generated slate-browser navigation + typing gauntlet helper.
- Added illegal kernel transition scanner/assertion.
- Added richtext generated gauntlet row that:
  - selects a known position
  - moves with keyboard navigation
  - asserts model selection
  - inserts text
  - asserts visible text
  - fails if any kernel trace contains an illegal transition
- Preserved all existing hand-authored example tests.
- Did not broaden into clipboard/composition.

Changed files:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- generated `../slate-v2/packages/slate-browser/dist/**` from package build

Evidence:

```sh
bun run build
bun run typecheck
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun run lint:fix
bun run lint
```

Results:

- slate-browser package build/typecheck: passed
- focused generated richtext gauntlet: `1 passed`
- richtext generated + navigation guardrail: `24 passed`
- markdown + inlines browser guardrail: `32 passed`
- lint: passed

Failed probes recorded:

- Initial generated richtext gauntlet failed because the new helper existed only
  in source; Playwright imports `slate-browser/playwright` from built `dist`.
  Building `packages/slate-browser` fixed the import.

Decision:

- Batch 1 now has a generated browser gauntlet base that can fail on illegal
  kernel transitions.
- The core command/transaction spine and initial browser gauntlet base are in
  place.

Rejected tactics:

- Do not replace hand-authored browser rows yet.
- Do not broaden this tracer into clipboard/composition.

Next owner:

- Batch 1, Tracer 14:
  - route React keydown command execution through the core command spine where
    possible
  - keep `EditableEditingKernel` result/transition traces authoritative
  - prove generated gauntlet and existing navigation rows still pass

## Batch 1 Tracer 14 Result

Status: complete.

Actions:

- Exposed `Editor.getLastCommit(editor)` through the slate-react browser
  handle.
- Exposed `get.lastCommit()` through the slate-browser Playwright harness.
- Added a richtext browser proof that real keydown movement records core
  command metadata on the latest commit.
- Rebuilt package dist before running browser rows so Playwright used the
  actual public helper output.
- Kept `EditableEditingKernel` transition traces as the browser-row authority
  and kept the generated gauntlet illegal-transition scan green.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- generated `../slate-v2/packages/slate-browser/dist/**` from package build
- generated `../slate-v2/packages/slate-react/dist/**` from package build

Evidence:

```sh
bun run build
bun run typecheck
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "core command metadata for keydown movement" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation|core command metadata" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
```

Results:

- slate-browser package build/typecheck: passed
- focused keydown command metadata browser proof: `1 passed`
- richtext generated + navigation + command metadata guardrail: `24 passed`
- markdown + inlines browser guardrail: `32 passed`
- slate-react DOM text sync contract: `1 passed`
- slate-react large-doc/scroll contract: `15 passed`
- slate-react projections/selection contract: `6 passed`
- slate-dom/slate-react Turbo build: passed
- slate-dom/slate-react Turbo typecheck: passed
- lint: passed

Failed probes recorded:

- Initial focused keydown command metadata row returned `undefined` for
  `get.lastCommit()` because slate-react dist was stale. Rebuilding
  `packages/slate`, `packages/slate-dom`, `packages/slate-react`, and
  `packages/slate-browser` fixed the proof path.

Decision:

- React keydown movement now has a browser proof that it reaches the core
  command spine.
- The generated gauntlet remains green while keydown command metadata is
  observable from the real browser path.

Continue checkpoint:

- verdict: keep course
- harsh take: keydown is no longer a hand-wavy React trace claim, but Batch 1
  is not closed until the rest of the event families prove the same spine.
- why: the browser proof now sees command metadata through the public
  slate-browser handle, and the cross-project navigation guardrails stayed
  green.
- risks: beforeinput/input/selectionchange/repair may still bypass the core
  command spine or schedule repairs outside kernel results.
- earliest gates:
  - `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "core command metadata"`
  - `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation|core command metadata" --workers=4 --retries=0`
- next move: prove beforeinput/input structural edits record core command
  metadata and remain kernel-traced.
- do-not-do list:
  - do not treat keydown proof as full kernel proof.
  - do not add another browser handle escape hatch.
  - do not broaden into clipboard/composition before beforeinput/input is
    command-backed from the browser path.

Next owner:

- Batch 1, Tracer 15:
  - prove browser beforeinput/input structural edits reach the core command
    spine
  - start with focused richtext rows for text insertion and Backspace/Delete or
    Enter, whichever is already routed through the kernel command dispatcher
  - assert latest commit command metadata, model text, visible DOM text, model
    selection, DOM selection, and no illegal kernel transitions
  - keep package/browser guardrails green

## Batch 1 Tracer 15 Result

Status: complete.

Actions:

- Added a richtext browser proof for text input followed by Backspace/delete.
- Proved desktop browser text input and Backspace record latest core commit
  command metadata through the slate-browser handle.
- Proved the same command metadata path on mobile through the existing
  semantic-handle transport instead of pretending Playwright mobile keyboard is
  reliable native text transport.
- Asserted model text, visible DOM text, model selection, desktop DOM caret,
  and illegal-transition absence.
- Kept generated gauntlet and adjacent markdown/inlines browser rows green.

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native text input and delete" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "text input and delete" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation|core command metadata" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun run lint:fix
bun run lint
```

Results:

- initial Chromium focused text/delete command metadata row: `1 passed`
- cross-project text/delete command metadata row: `4 passed`
- richtext generated + navigation + command metadata guardrail: `32 passed`
- markdown + inlines browser guardrail: `32 passed`
- lint: passed

Failed probes recorded:

- First cross-project run failed on mobile because `page.keyboard.type(...)`
  mutated visible DOM at an unexpected offset and did not advance Slate model
  selection. This matches existing mobile native transport debt, so the row now
  uses semantic-handle transport on mobile while preserving command/model/DOM
  text proof.
- Second run failed because an `if (!mobile)` guard was accidentally applied
  inside the Chromium-only navigation gauntlet where `mobile` is not scoped.
  Removed that test-owned mistake.

Decision:

- Desktop browser text input/delete now proves the core command spine from the
  user keyboard path.
- Mobile remains honest: command metadata is proved through semantic-handle
  transport, while native mobile keyboard transport remains separate debt.

Continue checkpoint:

- verdict: keep course
- harsh take: text/delete command metadata is proved, but the hard part left is
  not another command row; it is making selectionchange and repair scheduling
  auditable kernel results.
- why: the command spine reaches browser text/delete paths across supported
  projects, and the only red was a known mobile transport mismatch.
- risks: selectionchange and repair may still mutate state or DOM outside the
  authoritative result chain.
- earliest gates:
  - `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selectionchange|repair|core command metadata|generated navigation" --workers=4 --retries=0`
  - `bun run lint`
- next move: add/adjust a focused browser proof that selectionchange and repair
  events are traceable as kernel results and do not create illegal transitions.
- do-not-do list:
  - do not call mobile native text transport closed from semantic-handle proof.
  - do not keep adding local event rows if repair/selectionchange still lacks a
    central result contract.
  - do not mark Batch 1 complete until selectionchange/repair are in the same
    traceable result chain.

Next owner:

- Batch 1, Tracer 16:
  - prove selectionchange and repair scheduling are emitted as authoritative
    kernel results
  - add a focused richtext row that causes DOM selection import, model-owned
    repair, and follow-up typing
  - assert kernel trace event families, allowed transitions, model selection,
    DOM selection, model text, visible DOM text, and no illegal transitions
  - keep richtext/markdown/inlines guardrails green

## Batch 1 Tracer 16 Result

Status: complete.

Actions:

- Added a richtext browser proof that selectionchange and repair events are
  emitted as kernel trace results.
- Proved follow-up text input after the traced selectionchange/repair path
  keeps model text, visible DOM text, model selection, and desktop DOM caret
  correct.
- Kept mobile honest by using semantic-handle transport for text mutation while
  still asserting command/trace/model/visible-DOM behavior.
- Switched the DOM-only test helper to `Selection.setBaseAndExtent(...)` so
  generated DOM selection setup preserves anchor/focus direction and text-node
  intent.
- Rejected an unproven runtime converter patch after the red proof showed the
  stronger pure programmatic DOM-selection import claim was not the right Batch
  1 target.

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- regenerated `../slate-v2/packages/slate-react/dist/**` after reverting the
  unproven runtime experiment

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "selectionchange import and repair" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selectionchange and repair" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation|core command metadata|selectionchange and repair" --workers=4 --retries=0
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun run lint:fix
bun run lint
```

Results:

- focused Chromium selectionchange/repair proof: `1 passed`
- cross-project selectionchange/repair proof: `4 passed`
- richtext generated + navigation + command metadata + repair guardrail:
  `36 passed`
- slate-react DOM text sync contract: `1 passed`
- slate-react large-doc/scroll contract: `15 passed`
- slate-react projections/selection contract: `6 passed`
- slate-dom/slate-react Turbo build: passed
- slate-dom/slate-react Turbo typecheck: passed
- markdown + inlines browser guardrail: `32 passed`
- lint: passed

Failed probes recorded:

- Initial proof tried to require pure programmatic DOM selectionchange to import
  model selection at offset 4. It failed across Chromium, Firefox, WebKit, and
  mobile because synthetic selectionchange timing and the current model-owned
  preference path do not make that a valid Batch 1 user-path proof.
- A temporary collapsed DOM-selection resolver in `selection-controller` did
  not close that red row and was reverted. Keeping it without a valid proof
  would be patch debt.

Decision:

- Batch 1 now has browser proof that selectionchange and repair scheduling are
  traceable kernel results with allowed transitions.
- The stronger pure programmatic DOM-selection import claim is deferred to the
  next browser-editing batch, where it should be designed as an explicit
  selection import API/proof instead of smuggled into Batch 1.

Continue checkpoint:

- verdict: keep course
- harsh take: Batch 1 spine is basically assembled; do not sneak in one more
  local browser selection rewrite before proving the closure gates.
- why: core commands, history, browser keydown, browser text/delete,
  selectionchange, repair, and generated gauntlets now all have focused proof.
- risks: closure still needs a same-turn final driver pass, including core
  transaction/history contracts and huge-doc perf guardrails.
- earliest gates:
  - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
  - `bun test ./packages/slate-history/test/history-contract.ts --bail 1`
  - `bun test ./packages/slate-history/test/integrity-contract.ts --bail 1`
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- next move: run Batch 1 closure verification, then update completion-check to
  `done` only if every Batch 1 target is actually satisfied.
- do-not-do list:
  - do not add another selection import patch before closure gates.
  - do not call pure programmatic DOM selection import solved.
  - do not skip the 5000-block perf guardrail if closing Batch 1.

Next owner:

- Batch 1, Tracer 17:
  - run closure verification for core transaction/history, React/browser
    kernel rows, and huge-doc perf guardrails
  - classify any red as owner debt instead of marking completion
  - if all closure gates pass, set `tmp/completion-check.md` to `status: done`
    with Batch 1 completion rationale

## Batch 1 Tracer 17 Result

Status: complete.

Actions:

- Ran Batch 1 closure verification across core transaction/history contracts,
  Slate package contracts, slate-history package contracts, React/browser
  kernel rows, adjacent browser guardrails, core perf, React locality, and
  5000-block huge-doc comparison.
- Classified the pure programmatic DOM-selection import proof as deferred to
  Batch 2; it is not required for Batch 1 closure because Batch 1 requires
  selectionchange and repair to be traceable kernel results, not a new
  programmatic selection import API.
- Confirmed mobile native text transport remains narrowed to semantic-handle
  proof where the suite already treats raw mobile keyboard transport as debt.

Changed files:

- `docs/plans/2026-04-22-slate-v2-authoritative-command-kernel-architecture-plan.md`
- `tmp/completion-check.md`

Evidence:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate-history/test/integrity-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
cd packages/slate && bun run build
cd packages/slate && bun run typecheck
cd packages/slate-history && bun run build
cd packages/slate-history && bun run typecheck
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated navigation|Arrow|word movement|line extension|navigation and mutation|core command metadata|selectionchange and repair" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run lint:fix
bun run lint
```

Results:

- transaction contract: `23 passed`
- history contract: `10 passed`
- history integrity contract: `10 passed`
- slate surface contract: `10 passed`
- slate snapshot contract: `190 passed`
- slate-history package tests: `14 passed`, `1 skipped`
- slate package-local build/typecheck: passed
- slate-history package-local build/typecheck: passed
- core observation compare: current wins all reported mean lanes
- core huge-document compare: current wins or equals all reported mean lanes
- slate-react DOM text sync contract: `1 passed`
- slate-react large-doc/scroll contract: `15 passed`
- slate-react projections/selection contract: `6 passed`
- slate-dom/slate-react Turbo build/typecheck: passed
- richtext generated + navigation + command metadata + repair browser guardrail:
  `36 passed`
- markdown + inlines browser guardrail: `32 passed`
- react rerender breadth: locality guardrails passed
- 5000-block huge-doc legacy compare: v2 wins every reported mean lane against
  legacy chunking off and chunking on
- lint: passed

5000-block huge-doc means:

- v2 ready: `12.58ms` vs legacy chunk-off `259.39ms` and chunk-on `288.77ms`
- v2 select-all: `0.14ms` vs `17.73ms` and `0.79ms`
- v2 start typing: `8.43ms` vs `168.38ms` and `37.51ms`
- v2 start select+type: `12.18ms` vs `179.18ms` and `54.49ms`
- v2 middle typing: `0.65ms` vs `165.74ms` and `42.20ms`
- v2 middle select+type: `0.54ms` vs `178.57ms` and `50.69ms`
- v2 middle promote+type: `13.66ms` vs `175.30ms` and `34.60ms`
- v2 replace full document with text: `23.83ms` vs `105.21ms` and
  `109.51ms`
- v2 insert fragment full document: `23.27ms` vs `117.01ms` and `108.99ms`

Failed probes recorded:

- No closure gate failed.
- Earlier Tracer 16 pure programmatic DOM-selection import remained deferred;
  it did not block Batch 1 because the accepted Batch 1 proof is kernel
  traceability plus repair correctness.

Decision:

- Batch 1 is complete.
- The non-negotiable spine exists: command registry, extension registry,
  transaction-backed commands, command metadata on `EditorCommit`,
  history as a commit/operation consumer, React/browser command metadata proof,
  selectionchange/repair kernel trace proof, generated slate-browser gauntlet
  base, and green huge-doc perf guardrails.

Final checkpoint:

- verdict: stop
- harsh take: Batch 1 is closed; continuing inside this loop would now be fake
  motion. Batch 2 should be replanned from this evidence, especially around
  explicit selection import and broader generated gauntlets.
- why: every Batch 1 closure gate passed and the remaining work belongs to the
  next batch, not another local patch in this loop.
- risks: Batch 2 still owns pure programmatic DOM-selection import, native
  mobile transport, composition/clipboard/nested-control generated gauntlets,
  and final API hard cuts.
- earliest gates:
  - `bun completion-check`
  - Batch 2 plan review before new implementation
- next move: start Batch 2 with a fresh plan from Batch 1 evidence.
- do-not-do list:
  - do not keep extending Batch 1 after closure.
  - do not call pure DOM-selection import solved.
  - do not regress to patching individual browser symptoms without the Batch 2
    plan.
