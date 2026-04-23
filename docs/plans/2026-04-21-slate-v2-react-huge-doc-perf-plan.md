# Slate v2 React Huge-Doc Perf Plan

## Execution State

- Execution repo: `/Users/zbeyens/git/plate-2`
- Code repo: `/Users/zbeyens/git/slate-v2`
- Legacy repo: `/Users/zbeyens/git/slate`
- Scope lock:
  - docs write: `docs/slate-v2/**`, `docs/slate-v2-draft/**`, `docs/plans/**`
  - code read: user-listed Slate v2 and legacy paths only
  - code write: benchmark harness first; `packages/slate-react/**` or `packages/slate/**` only after measured ownership
- Exact perf claim: v2 `slate-react` must beat legacy chunking-on and chunking-off on important huge-document user lanes without making child-count chunking foundational again.
- Constraint hierarchy: best v2 performance and best v2 API shape beat
  legacy-compatible implementation shape. Legacy compatibility is a target at
  the public boundary, not permission to dirty the rewrite with old runtime
  constraints. If a legacy-compatible API blocks the best core/runtime design,
  pivot or hard-cut that API and document the narrower compatibility boundary.
- Current tactic: validate the huge-document legacy compare benchmark, isolate red lane owners, then write a concrete optimization sequence with gates and pivots.
- Current benchmark command: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- Required comparison matrix: legacy chunking off / legacy chunking on / v2 semantic islands.
- Proof-size policy: `5000` blocks is the closure gate for this lane.
  `1000` blocks is smoke/debug only and must not be cited as perf-superiority
  proof.

## Progress

- [x] Skill analysis loaded: `continue-perf`, `continue`, `vercel-react-best-practices`, `planning-with-files`, `learnings-researcher`, `major-task`.
- [x] Located prior Slate v2 plan docs and relevant solution docs.
- [x] Read required source-of-truth docs.
- [x] Inspect current and legacy huge-document runtime code.
- [x] Inspect benchmark implementation and artifacts.
- [x] Run focused huge-document legacy comparison unless blocked.
- [x] Classify lane root causes and owners.
- [x] Produce final flexible optimization plan.

## Latest Baseline Matrix

Fresh proof run:

```sh
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Artifact:

- `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`

## Current Win/Loss

- 5000-block proof gate is green on the important lanes.
- v2 wins ready, start typing, start select+type, middle typing, middle
  select+type, select-all, full-document text replacement, and full-document
  fragment insertion.
- v2 loses only first shelled-block activation
  (`middleBlockPromoteThenTypeMs`) against chunking-on by a small mean delta.
  That is the accepted occlusion/corridor tradeoff, not a steady-editing loss.

## Rejected Tactics / Guardrails

- Do not claim perf closure from rerender breadth/locality benchmarks.
- Do not optimize benchmark cosmetics before checking fairness.
- Do not make legacy child-count chunking foundational again.
- Do not collapse decorations, annotations, and widgets back into one `decorate` story.
- Do not preserve a legacy-compatible core/React API if it blocks the best v2
  performance architecture. The rewrite may hard-cut or reshape APIs when the
  measured perf lane proves the old shape is the blocker.
- Do not edit `slate-history` or `slate-hyperscript`.

## Final Optimization Plan

### Decision

The next implementation starts in:

- `packages/slate`

Not:

- `packages/slate-react`
- benchmark harness first
- docs/claim-width only

Reason:

- the forced-normalization and subscribed-publication probes prove raw typing is core-owned before it is React-owned.

### Benchmark Validity

Current direct compare is useful but narrow:

- valid: model mutation + React/JSDOM commit/render cost
- invalid: full browser keyboard latency, real layout/paint, native paste, default browser selection behavior

Do not cut it. Reclassify it as the first subscribed-runtime compare gate, then add a browser user-lane gate after the core + React cuts move this command.

### Lane Root Causes

| Lane | Current read | Owner | Root cause | First fix |
| --- | --- | --- | --- | --- |
| ready | v2 wins | keep as guardrail | shell/island mount avoids full legacy mount work | do not regress |
| start raw typing | v2 loses | `packages/slate` | `Transforms.insertText` enters `withoutNormalizing`, which forces whole-doc normalization; subscribed mode then pays snapshot/change publication | Phase 1 + 2 core |
| middle raw typing | v2 loses | `packages/slate` first, then `slate-react` | same core owner, plus far-shell preview selector execution when editing an unmounted island | Phase 1 + 2 core, then Phase 3 React selector prefilter |
| start select+type | v2 loses | mixed | selection publish + active island recompute + raw typing owner | Phase 2 core, then Phase 4 corridor |
| middle select+type | v2 loses hard | mixed, React after core | selection activates middle corridor, mounts more text nodes, shell previews/selectors execute, then raw typing owner fires | Phase 2 core, then Phase 3/4 React |
| select-all | v2 loses mildly | `slate-react` + core selection publish | shell-backed selection detection scans selected top-level range; selection change publication still pays snapshot/change cost | Phase 2 core, then Phase 4 shell-backed range metadata |
| full-document paste | v2 loses chunk-off, ties chunk-on | benchmark/core | current lane is `Transforms.insertText` over full selection, not real clipboard/fragment paste; core expanded delete/insert and publication dominate | after Phase 2, repair/extend benchmark before optimizing paste-specific code |

### Phase 1: Stop Forced Whole-Document Normalization On Ordinary Text Transforms

Hypothesis:

- v2 raw typing loses because `withoutNormalizing` calls `Editor.normalize(..., force: true)` after every transform wrapper.

Implementation target:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/without-normalizing.ts`
- likely supporting files:
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/normalize.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/text.ts`

Preferred fix:

- make transform wrappers normalize dirty paths by default, matching the legacy shape:
  - restore normalizing state
  - call `Editor.normalize(editor, { explicit: false, force: false, operation: getLatestOperation(editor) })`
- keep explicit `Editor.normalize(editor, { force: true })` behavior for deliberate whole-document normalization.

Expected effect:

- no-subscriber core 1000-block / 10-op typing should drop from about `13ms` to low single digits.
- React compare raw typing should improve immediately, but will not close until Phase 2.

Risk / blast radius:

- medium-high in `packages/slate`; normalization is correctness-sensitive.
- likely affects transform families beyond text insertion.

Proof gates:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:core:huge-document:compare:local
bun run bench:core:normalization:compare:local
bun run bench:core:observation:compare:local
```

Fallback / pivot:

- if correctness fails broadly, do not keep a global `withoutNormalizing` change.
- fallback to a narrower explicit-point text fast path in `TextTransforms.insertText` that avoids forced full normalization only for collapsed point inserts with default normalization semantics.
- if core compare does not move by at least `60%`, the hypothesis failed; inspect `Editor.void` / `Editor.elementReadOnly` preflight and dirty-path update next.

### Phase 2: Cut Subscribed Snapshot / Change Publication Cost

Hypothesis:

- after Phase 1, subscribed editors still lose because every text op publishes through full snapshot clone/freeze/index rebuild and `buildSnapshotChange(...)` JSON-stringifies whole children/selection/marks.

Implementation target:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/runtime-ids.ts`

Preferred fix sequence:

1. replace `buildSnapshotChange(...)` full-tree `JSON.stringify` with operation-derived flags:
   - text ops: `classes: ['text']`, `childrenChanged: true`, dirty paths from op paths
   - selection ops: `classes: ['selection']`, `childrenChanged: false`
   - mark-only: `classes: ['mark']`
   - replace/structural: keep broad fallback
2. avoid full previous snapshot when only touched runtime ids are needed; resolve touched ids from the live path/runtime-id owner.
3. only after that, evaluate incremental snapshot/index publication:
   - preserve immutable public snapshots
   - reuse unchanged snapshot/index structure where dirty paths prove it is safe

Expected effect:

- subscribed core no-force typing should drop from about `27ms` toward single-digit ms.
- React compare raw typing should stop losing or lose by a small residual React cost.

Risk / blast radius:

- high in `packages/slate`; this is the core snapshot/store contract.
- overlay dirtiness and React projections depend on `SnapshotChange` accuracy.

Proof gates:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:core:huge-document:compare:local
bun run bench:core:observation:compare:local
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Fallback / pivot:

- if operation-derived change records break overlay recompute classes, cut back to op-derived `childrenChanged/classes/dirtyPaths` only and keep touched ids broad until a safer runtime-id resolver lands.
- if full snapshot clone/index remains dominant after JSON removal, pivot to incremental snapshot/index caching before touching React.

### Phase 3: Add React Selector Execution Locality, Not Render Locality

Hypothesis:

- rerender breadth is green, but selector callbacks still execute too broadly because `SlateSelectorContext` wakes every selector on every commit.

Implementation target:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`

Preferred fix sequence:

1. pass `SnapshotChange` through the selector notification path.
2. allow selectors to declare dirtiness:
   - selection-only
   - text/runtime-id scoped
   - structure/top-level-list scoped
   - always
3. make shell preview selectors skip when `change.touchedRuntimeIds` does not intersect the island runtime-id set.
4. memoize island plan / mounted runtime-id set from primitive deps, not incidental render churn.

Vercel React rules applied:

- `rerender-derived-state`: subscribe to derived dirtiness/top-level booleans, not whole snapshot facts.
- `rerender-split-combined-hooks`: split top-level id list, selection index, shell preview, and shell-backed selection checks.
- `rerender-use-ref-transient-values`: keep transient overlay/promotion inputs in refs where they are callback-only.
- `js-set-map-lookups`: prebuild island runtime-id `Set`s for touched-id intersection.
- `js-combine-iterations`: avoid shell preview loops that separately resolve kind, text, and changed-state.

Expected effect:

- middle raw typing and middle select+type improve after core publish cost drops.
- rerender counts should remain the same; selector invocation counts should drop.

Risk / blast radius:

- medium in `slate-react`; selector API is runtime-sensitive but package-local.
- danger is stale selectors when dirtiness is under-declared.

Proof gates:

```sh
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Fallback / pivot:

- if stale UI appears, keep selector dirtiness internal to large-doc shell preview first instead of generalizing the hook API.
- if selector invocation counts are missing, update the benchmark harness before optimizing more React code.

### Phase 4: Fix Selection Corridor / Shell-Backed Broad-Selection Cost

Hypothesis:

- select+type and select-all retain extra cost after core fixes because large-document selection recomputes active islands and shell-backed selection by scanning broad top-level ranges.

Implementation target:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`

Preferred fix sequence:

1. represent mounted islands as index intervals as well as runtime-id sets.
2. make `isSelectionShellBacked(...)` answer range/intersection from intervals instead of looping every selected top-level block.
3. memoize active island derivation from selected top-level index and promoted island index.
4. preserve the existing fail-closed DOM behavior for shell-backed selections.

Expected effect:

- select-all should close or become negligible.
- select+type should improve after the core and selector cuts.

Risk / blast radius:

- medium; browser selection correctness matters.
- broad ops must stay model-owned when DOM is partially mounted.

Proof gates:

```sh
bun run bench:react:huge-document-overlays:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Correctness gate if touched:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
```

Fallback / pivot:

- if interval metadata complicates selection truth, keep the scan but only run it when selection is expanded across multiple top-level blocks.
- do not weaken shell-backed paste/select-all fail-closed behavior to win a benchmark.

### Phase 5: Repair Paste Claim Before Optimizing Paste

Hypothesis:

- current `pasteFullDocumentMs` is named too strongly. It measures full-selection `Transforms.insertText(...)`, not browser clipboard transport or `insertFragment`.

Implementation target:

- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- possibly `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**` later for real browser proof

Preferred fix sequence:

1. rename or split current lane as `replaceFullDocumentWithTextMs`.
2. add a real fragment lane using equivalent fragment payloads in legacy and v2.
3. add a later browser lane for actual clipboard/default-paste transport if the product claim needs it.

Expected effect:

- paste stops blocking the first optimization wave unless it remains red after fair lane repair.

Risk / blast radius:

- low; benchmark harness only.

Proof gates:

```sh
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Fallback / pivot:

- if repaired paste is still red after Phase 2, classify it separately as core structural replace/fragment-owned.

### Closure Threshold

Do not call the lane closed until:

- 1000-block smoke compare has `iterations >= 3`
- v2 wins or ties within noise on:
  - raw typing start and middle
  - select+type start and middle
  - select-all
  - repaired paste/replace lane
- `bench:react:rerender-breadth:local` stays green
- `bench:react:huge-document-overlays:local` stays green
- any losing lane is explicitly accepted/deferred with owner and reason

### Implementation Start

Start with Phase 1 in:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/without-normalizing.ts`

Earliest implementation gate stack:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:core:huge-document:compare:local
bun run bench:core:normalization:compare:local
bun run bench:core:observation:compare:local
```

## Findings

### 2026-04-21 Initial Scan

- `docs/solutions/patterns/critical-patterns.md` is absent.
- Relevant solution docs cluster around huge-doc query param parity, single-engine mount honesty, paste rerender churn, active corridor radius, shell selection failure modes, promotion selection, selector fanout, rerender breadth, and overlay subscriber fan-out.
- Existing plan candidates include `2026-04-11-slate-v2-react-perfect-runtime-opti-plan.md`, `2026-04-11-slate-v2-semantic-islands-active-corridor-adaptive-occlusion-plan.md`, `2026-04-11-slate-v2-large-document-broad-ops-batch.md`, `2026-04-15-slate-v2-perf-architecture-research.md`, and `2026-04-15-slate-v2-overlay-benchmark-hardening.md`.

### 2026-04-21 Source Docs Read

- Runtime ownership is explicitly green; direct huge-doc superiority is explicitly red.
- The live claim must stay narrower than “React package closed”: v2 wins ready but loses typing, select/promote-then-type, select-all, and full-document paste in the direct legacy comparison.
- `chunking-review.md` forbids reviving child-count chunking as the foundational answer; any large-doc optimization must be selector-first plus semantic islands, active corridor, occlusion, and optional planning geometry.
- `architecture-contract.md` requires committed snapshot reads, `useSyncExternalStore` selector subscriptions, narrow derived selectors, event-path writes before effect sync, and urgent typing/selection/DOM correctness staying synchronous.
- `decoration-roadmap.md` makes overlay architecture non-negotiable: one `slate-react` overlay kernel, separate decoration/annotation/widget lanes, source-scoped invalidation below React, and no broad text-tree churn from overlays.
- The prior semantic-islands plan says the first production attempt was rejected because wrappers did not remove descendant render work. The current useful landed broad-op work is shell-backed selection/paste that avoids expanding far islands.
- The old “React-perfect runtime” plan ranked core transaction/bootstrap and core observation cost ahead of React invalidation, but current user truth says tranche 5/6 runtime closure is green and the direct compare must now decide whether the next owner is benchmark, core, or `slate-react`.

### 2026-04-21 Runtime / Benchmark Read

- `huge-document-legacy-compare.mjs` builds both repos, runs JSDOM/React `act(...)`, and drives direct `Transforms.*` calls. It is valid for model + React commit/render work, not full browser keyboard/layout/default-paste latency.
- The harness excludes mount time from action lanes and runs a warmup iteration, which is good. The user-requested smoke uses one measured sample, which is enough for direction but not enough for final thresholds.
- Legacy surfaces use real `Editable` with optional `editor.getChunkSize` and `renderChunk`; v2 surface uses `EditableBlocks` with `largeDocument` threshold `1`, island size `100`, active radius `1`.
- v2 `EditableTextBlocks` computes top-level runtime ids and selected top-level index via broad selector notifications. Large-doc islands are count-based groups today, not semantic block/list/table islands yet.
- Far islands render `LargeDocumentIslandShell`; each shell subscribes and builds previews by resolving every runtime id in that island from `snapshot.index.idToPath` and walking descendants for preview text.
- `useSlateSelector` currently has one editor-scoped listener set; every commit calls every selector callback, then equality decides rerender. That preserves render locality but not selector execution locality.
- Core `getSnapshot(...)` clones/freeze children and rebuilds a full runtime-id index after cache invalidation. `buildSnapshotChange(...)` also JSON-stringifies previous/next children, selection, and marks. That cost is paid on committed text ops when listeners exist.
- Existing core artifacts still show huge-doc core typing and read-after-write observation are materially slower than legacy; this is not a pure React problem.
- Existing rerender-breadth and overlay artifacts prove local render/recompute facts, but also expose per-store subscriber fan-out and do not close action latency.

### 2026-04-21 Core Huge-Doc Compare

Command:

```sh
CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_ITERATIONS=1 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local
```

Artifact:

- `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`

Result:

- start typing: v2 `13.56ms`, legacy `0.55ms`, delta +`13.01ms`
- middle typing: v2 `10.63ms`, legacy `0.36ms`, delta +`10.27ms`

Read:

- Raw typing cannot honestly start in `packages/slate-react`.
- The core publish/change path is large enough to explain much of the React compare gap.
- React still has residual overhead because React compare loses more than core on middle typing and much more on select+type, but core must move first.

### 2026-04-21 Forced Normalization Probe

One-off no-file-edit probe:

```sh
bun -e "import { createEditor, Transforms } from './packages/slate/src/index.ts'; ..."
```

Result on 1000 blocks / 10 middle-block inserts:

- baseline: `23.53ms`
- `editor.normalize = () => {}`: `0.33ms`
- custom `withoutNormalizing` that restores normalizing then calls `normalize({ explicit:false, force:false })`: `2.78ms`

Read:

- The core typing owner is not abstract “core is slow.”
- The immediate owner is `packages/slate/src/editor/without-normalizing.ts` forcing full normalization after every `Transforms.insertText(...)`.
- The safe target is not no normalization; it is preserving dirty-path normalization instead of whole-document force normalization for ordinary transform wrappers.
- This also explains why the JSDOM React compare loses raw typing before any browser/layout story enters.

### 2026-04-21 Subscriber Publication Probe

One-off no-file-edit probe with `editor.subscribe(() => {})` before the same 1000-block / 10 middle-block insert loop:

- subscriber baseline: `54.46ms`
- subscriber + `normalize = () => {}`: `23.29ms`
- subscriber + no-force normalization: `27.02ms`

Read:

- Normalization is the first core wall.
- After normalization, subscribed editor publication is the second core wall.
- In subscribed mode, `apply.ts` asks for a previous snapshot, applies the op, then publishes a next snapshot and builds a change. Current `getSnapshot(...)` clones/freezes the full children tree and rebuilds the full runtime-id index after cache invalidation; `buildSnapshotChange(...)` also JSON-stringifies previous and next children/selection/marks.
- This is the cost React pays before its own selector/equality work. React fixes before this cut would leave the engine publishing bill intact.

### 2026-04-21 Guardrail Runs

Fresh `bun run bench:react:rerender-breadth:local`:

- selection breadth: unrelated left/right blocks stay `0`; broad `useSlate`/selection hooks rerender by contract.
- many-leaf edit: edited leaf `1`, sibling leaves `0`, parent block `0`.
- deep ancestor edit: deep leaf `1`, ancestors `0`, sibling branch `0`.
- source-scoped invalidation: recompute classes are selective, but same-store left/right subscriber delivery remains broad.

Fresh `bun run bench:react:huge-document-overlays:local`:

- active edit after overlay: `1.74ms`, active text renders `1`, far renders `0`.
- overlay toggle: `3.51ms`, recompute count `1`.
- shell promotion: `7.20ms`, selection lands at top-level `100`.

Read:

- overlay/corridor locality is still the guardrail, not the red owner.
- React work should target selector execution and corridor selection cost only after core publishing cost moves.

## Checkpoints

### Initial Perf Checkpoint

Verdict: replan

Harsh take: locality proof is already useful, but it does not prove the huge-doc latency claim; the red compare benchmark owns this task.

Claim: v2 `slate-react` huge-doc runtime beats legacy chunking-on/off on real user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 semantic islands

Win/loss:

- ready: v2 reportedly wins
- raw typing: v2 reportedly loses
- select/promote-then-type: v2 reportedly loses
- select-all: v2 reportedly loses
- full-document paste: v2 reportedly loses

Benchmark validity: suspect until benchmark code and runtime surfaces are inspected; useful enough to start, not enough to optimize blindly.

Ownership:

- typing: unknown; likely react-runtime/core boundary until isolated
- select/promote: unknown; likely react-runtime/example/benchmark boundary
- select-all: unknown; likely DOM/browser/react-runtime/benchmark boundary
- paste: unknown; likely core/model mutation plus react-runtime fan-out

Earliest gates:

- correctness: no code touched yet
- perf: focused huge-document legacy comparison command above

Next move: read source-of-truth docs, benchmark source, runtime source, and legacy huge-document source; then run the focused compare and classify owners.

Do not do:

- do not edit runtime code before ownership is measured
- do not write a tidy plan that dodges the red lanes

### Fresh Compare Perf Checkpoint

Verdict: pivot

Harsh take: v2 still loses the important action lanes; ready wins do not buy perf superiority.

Claim: v2 `slate-react` huge documents beat legacy chunking-on/off on important huge-doc user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks` largeDocument

Win/loss:

- ready: v2 wins
- start typing: v2 loses
- start select+type: v2 loses
- middle typing: v2 loses
- middle select+type: v2 loses hard
- select-all: v2 loses
- paste: v2 loses chunk-off and ties chunk-on

Benchmark validity: valid for model + React/JSDOM commit cost; not valid as full browser keyboard/layout/paste latency proof.

Ownership:

- typing: core snapshot/change/index cost plus React selector wakeup
- select+type: selection promotion/corridor recompute plus typing owner
- select-all: broad selection snapshot/change notification and shell-backed selection path
- paste: core replace/text insertion plus React shell recompute; near tie against chunk-on means not the first optimization target

Earliest gates:

- correctness: no code changed
- perf: `bench:react:huge-document:legacy-compare:local`

Next move: turn the hot-path read into a phased optimization plan with proof commands and pivot criteria.

Do not do:

- do not optimize against browser/layout assumptions this JSDOM harness cannot see
- do not revive child-count chunking as the main answer

### Core Compare Perf Checkpoint

Verdict: pivot

Harsh take: the core is red enough that a React-only plan would be lying.

Claim: v2 huge-doc action latency can beat legacy only after the core text-op publish path stops burning about `10-13ms` per 10-op burst.

Baseline matrix:

- legacy core
- v2 core
- v2 React compare

Win/loss:

- core start typing: v2 loses
- core middle typing: v2 loses
- React start typing: v2 loses
- React middle typing: v2 loses

Benchmark validity: valid for direct transform/model cost; still not browser latency.

Ownership:

- raw typing: core-owned first, then React selector/publish overhead
- select+type: mixed core + selection/corridor

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1` if core changes
- perf: `bun run bench:core:huge-document:compare:local`

Next move: inspect whether the core bill is snapshot cloning/index/change construction, then place React fixes after the core cut.

Do not do:

- do not start raw typing implementation in `packages/slate-react` until core drops materially

### Forced Normalization Probe Perf Checkpoint

Verdict: pivot

Harsh take: found the smoking gun: forced normalization dominates raw typing.

Claim: the first implementation starts in `packages/slate`, not `packages/slate-react`.

Baseline matrix:

- v2 baseline
- v2 normalize no-op
- v2 no-force normalization probe

Win/loss:

- baseline middle typing probe: `23.53ms`
- normalize no-op: `0.33ms`
- no-force normalization: `2.78ms`

Benchmark validity: valid ownership probe for simple explicit-path text insertion; not a correctness proof.

Ownership:

- raw typing: core-owned, specifically forced normalization after `Transforms.insertText`

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf: `bun run bench:core:huge-document:compare:local`

Next move: final plan starts with a core normalization policy fix, then React selector/promotion work.

Do not do:

- do not touch island shells first
- do not skip normalization entirely

### Subscriber Publication Probe Perf Checkpoint

Verdict: pivot

Harsh take: after normalization, subscriber snapshot/change publication is the next wall.

Claim: raw typing needs two core cuts before React work: normalization policy, then listener publication cost.

Baseline matrix:

- no subscriber
- subscriber
- no-force normalization probe

Win/loss:

- no-listener no-force probe: `2.78ms`
- subscriber no-force probe: `27.02ms`
- subscriber normalize-noop probe: `23.29ms`

Benchmark validity: valid owner probe for React-like subscribed editor commits.

Ownership:

- phase 1: core normalization policy
- phase 2: core snapshot/change publication for subscribed editors

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf: `bun run bench:core:huge-document:compare:local`

Next move: encode this as the final phased plan.

Do not do:

- do not spend a React slice until subscribed-core typing drops

### 2026-04-21 5000-block Continue-Perf Checkpoint

Verdict: replan

Harsh take: v2 wins mount, but it loses every important action lane at 5000
blocks; the perf-superiority claim is red, not merely incomplete.

Claim: v2 `slate-react` huge documents beat legacy chunking-on and
chunking-off on important huge-document user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Win/loss:

- ready: v2 wins hard
  - v2 `61.69ms`
  - legacy chunk-off `342.84ms`
  - legacy chunk-on `288.45ms`
- start typing: v2 loses
  - v2 `227.89ms`
  - chunk-off `150.41ms`
  - chunk-on `27.93ms`
- start select+type: v2 loses
  - v2 `283.20ms`
  - chunk-off `176.92ms`
  - chunk-on `32.67ms`
- middle typing: v2 loses
  - v2 `263.84ms`
  - chunk-off `143.76ms`
  - chunk-on `45.69ms`
- middle select+type: v2 loses hard
  - v2 `289.86ms`
  - chunk-off `159.30ms`
  - chunk-on `37.66ms`
- select-all: v2 loses
  - v2 `35.76ms`
  - chunk-off `16.92ms`
  - chunk-on `1.75ms`
- full-document paste: v2 slightly loses
  - v2 `114.44ms`
  - chunk-off `105.02ms`
  - chunk-on `110.53ms`

Benchmark validity:

- valid enough for mounted React/model-runtime comparison
- not valid as full browser keyboard/layout/native paste latency

Ownership:

- ready: v2 large-document shelling wins; keep as guardrail
- typing: core-owned first, especially normalization and subscribed
  snapshot/change publication
- select+type: mixed core + React corridor promotion/selector execution
- select-all: React large-document shell-backed selection path plus core
  selection publication
- paste: core replace/text insertion plus React shell recompute; lower priority
  than typing/select

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf: `bun run bench:core:huge-document:compare:local`
- perf-superiority:
  `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- start Phase 1 in `packages/slate/src/editor/without-normalizing.ts`
- prove dirty-path/no-force normalization for ordinary text transforms before
  touching React selector/corridor code

Do not do:

- do not call this perf lane closed
- do not optimize docs or benchmark cosmetics
- do not revive child-count chunking as the target architecture
- do not start in `slate-react` until core typing cost moves materially

### 2026-04-21 5000-block Fresh Recheck

Verdict: pivot

Harsh take: the larger reference run makes the problem clearer, not better.
v2's mount story is real, but the editing lanes are nowhere near legacy
chunking-on.

Claim: v2 `slate-react` huge documents must beat legacy chunking-on and
chunking-off on important huge-document user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Win/loss:

- ready: v2 wins hard
  - v2 `60.17ms`
  - chunk-off `288.38ms`
  - chunk-on `287.75ms`
- start typing: v2 loses
  - v2 `238.51ms`
  - chunk-off `143.59ms`
  - chunk-on `31.94ms`
- start select+type: v2 loses
  - v2 `309.88ms`
  - chunk-off `158.77ms`
  - chunk-on `28.28ms`
- middle typing: v2 loses
  - v2 `222.80ms`
  - chunk-off `145.71ms`
  - chunk-on `29.42ms`
- middle select+type: v2 loses hard
  - v2 `290.34ms`
  - chunk-off `159.98ms`
  - chunk-on `29.54ms`
- select-all: v2 loses
  - v2 `31.06ms`
  - chunk-off `13.36ms`
  - chunk-on `0.68ms`
- full-document paste: v2 loses
  - v2 `120.99ms`
  - chunk-off `99.19ms`
  - chunk-on `114.54ms`

Benchmark validity:

- valid for mounted model + React/JSDOM commit/runtime cost
- not valid as full browser keyboard/layout/native paste proof

Ownership:

- ready: v2 shell/island mount wins; keep it as a guardrail
- typing: core-owned first, especially `withoutNormalizing` forcing whole-doc
  normalization and subscribed snapshot/change publication
- select+type: mixed core + React corridor/selector execution
- select-all: React large-document shell-backed selection plus core selection
  publication
- paste: benchmark/core/runtime mixed; lower priority until typing moves

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf: `bun run bench:core:huge-document:compare:local`
- perf-superiority:
  `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- apply Phase 1 in `packages/slate/src/editor/without-normalizing.ts` by using
  dirty-path normalization instead of forced full-document normalization after
  ordinary transform wrappers

Do not do:

- do not call the perf lane closed
- do not move to React selector work until core typing cost moves
- do not revive child-count chunking as architecture

### 2026-04-21 Constraint Reclassification

Verdict: replan

Harsh take: maximum legacy API compatibility is useful only while it does not
poison the rewrite. If a compatibility-shaped API keeps `getSnapshot()`,
selector notification, or normalization semantics too expensive, preserving it
is the wrong goal.

Claim: v2 must deliver a better core/runtime/API for huge-doc editing than
legacy chunking-on and chunking-off. Compatibility is bounded by that goal.

Baseline matrix:

- legacy public API compatibility surface
- v2 core/runtime API shape
- v2 huge-doc latency against legacy chunking-on/off

Win/loss:

- v2 wins ready/mount
- v2 still loses editing lanes against legacy chunking-on
- compatibility-shaped snapshot reads remain a likely blocker after the first
  normalization and selector-notification cuts

Benchmark validity:

- the 5000-block compare is valid enough to reject API-conservative work that
  does not move action latency
- final closure still needs repeated samples and browser-lane proof

Ownership:

- core snapshot/read API is now eligible for hard-cut redesign if incremental
  patching cannot beat chunking-on
- React selector API is eligible for dirtiness-aware public/internal reshaping
  if generic selector compatibility keeps hot selectors too broad

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- React correctness: `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- perf: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- stop treating public snapshot compatibility as sacred. If hot selectors need
  path/runtime-id direct reads, incremental indices, or a new selector read API,
  cut toward that design instead of wrapping more compatibility around
  `Editor.getSnapshot()`.

Do not do:

- do not keep a slow API because it looks legacy-compatible
- do not declare compatibility a success if it dirties the runtime core
- do not let docs imply the rewrite is constrained to legacy chunk internals

### 2026-04-21 Phase 1/2 Perf Slice

Verdict: pivot

Harsh take: the kept core normalization cut was real; the React selector
experiment was not. Keeping a non-moving selector patch would be benchmark
theater, so it was cut back.

Claim: v2 `slate-react` huge docs must beat legacy chunking-on/off on important
5000-block user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Win/loss after kept core cuts:

- ready: v2 wins
  - v2 `70.89ms`
  - chunk-off `249.64ms`
  - chunk-on `287.49ms`
- start typing: v2 roughly ties chunk-off, loses chunk-on
  - v2 `154.20ms`
  - chunk-off `149.69ms`
  - chunk-on `28.41ms`
- start select+type: v2 loses
  - v2 `198.01ms`
  - chunk-off `168.14ms`
  - chunk-on `32.62ms`
- middle typing: v2 edges chunk-off, loses chunk-on
  - v2 `143.01ms`
  - chunk-off `145.52ms`
  - chunk-on `29.92ms`
- middle select+type: v2 loses
  - v2 `230.15ms`
  - chunk-off `204.19ms`
  - chunk-on `26.85ms`
- select-all: v2 loses
  - v2 `30.13ms`
  - chunk-off `17.51ms`
  - chunk-on `0.57ms`
- full-document paste/replace: v2 roughly ties/wins
  - v2 `116.64ms`
  - chunk-off `116.96ms`
  - chunk-on `121.14ms`

Benchmark validity:

- valid for mounted model + React/JSDOM runtime cost
- still one-sample only; not closure-grade

Ownership:

- kept: core `withoutNormalizing` no longer force-normalizes whole document for
  single text operations
- kept: `SnapshotChange` classification no longer stringifies full children for
  ordinary op classes
- cut: React selector dirtiness patch, because it did not move the 5000 lane and
  regressed rerender locality
- next owner: core/read API and React selector read model need a hard-cut design
  around live path/runtime-id reads or incremental snapshot/index reads; wrapping
  more compatibility around `Editor.getSnapshot()` is likely the wrong axis

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- React correctness: `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- locality guardrail: `bun run bench:react:rerender-breadth:local`
- overlay guardrail: `bun run bench:react:huge-document-overlays:local`
- perf-superiority: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- design the hard-cut read path instead of another selector wrapper:
  direct live reads for edited leaves, incremental runtime-id/path index, or a
  split snapshot API that keeps immutable public snapshots out of the urgent
  typing path

Do not do:

- do not revive child-count chunking as the answer
- do not keep React selector patches that do not move the 5000-block compare
- do not preserve `Editor.getSnapshot()` as the hot read path if it blocks
  chunking-on superiority

### 2026-04-21 Verification Checkpoint

Verdict: keep course with blocker

Harsh take: the perf slice made a real core dent, but the lane is still red
against chunking-on. Typecheck is blocked by generated `slate-dom` declaration
names, not by the perf result.

Claim: kept changes must preserve correctness and keep the direct 5000-block
compare honest while the next implementation pivots to a hard-cut read path.

Baseline matrix:

- core correctness
- core perf guardrails
- React locality/overlay guardrails
- direct legacy chunking-on/off compare
- package build/typecheck/lint

Win/loss:

- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`: pass
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`: pass
- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1`: pass
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`: pass
- `bun run bench:core:huge-document:compare:local`: v2 still loses legacy core,
  but the kept normalization cut holds the result near `3.8ms` / 20 ops instead
  of the old `10-13ms` class
- `bun run bench:core:normalization:compare:local`: explicit normalization wins,
  `insertTextReadAfterEachMs` remains red
- `bun run bench:core:observation:compare:local`: positions/read observation
  remains red
- `bun run bench:slate:6038:local`: pass
- `bun run bench:react:rerender-breadth:local`: locality restored after cutting
  the failed selector experiment
- `bun run bench:react:huge-document-overlays:local`: pass as guardrail
- 5000-block direct compare: v2 wins ready and roughly ties chunk-off on some
  lanes; still loses chunking-on by a lot
- `bunx turbo build --force --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`: pass
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`: blocked by generated
  `packages/slate-dom/dist/index.d.ts` references to unaliased `BaseEditor`,
  `Editor`, and `Ancestor`
- `bun run lint:fix`: pass, fixed one file
- `bun run lint`: pass

Benchmark validity:

- current 5000 direct compare is still the right red/green owner for this lane
- one-sample runs are not closure-grade, but are enough to reject non-moving
  tactics

Ownership:

- kept owner: core normalization policy
- open owner: hard-cut core/read API and React selector read model
- verification blocker: `slate-dom` declaration bundling/typecheck

Next move:

- do not keep trying compatibility-shaped selector wrappers. Design the
  hard-cut hot read path so urgent text edits do not route through full
  immutable snapshot/index rebuilds.
- separately fix or quarantine the `slate-dom` declaration bundler issue before
  claiming package typecheck closure.

Do not do:

- do not claim perf closure
- do not keep type-erasing `slate-dom` source just to appease generated d.ts
- do not revive chunking-on as architecture

### 2026-04-21 Historical 1000-Block Smoke

Verdict: pivot

Harsh take: the 1000-block smoke is less brutal than 5000, but it still rejects
the idea that the lane is closed. v2 wins mount and nearly ties start typing,
then still bleeds on middle typing, middle select+type, select-all, and paste.

Claim: v2 `slate-react` must beat legacy chunking-on/off on important huge-doc
user lanes, not just prove locality or command ownership.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Win/loss:

- ready: v2 wins
  - v2 `29.42ms`
  - chunk-off `50.57ms`
  - chunk-on `66.85ms`
- start typing: v2 roughly ties chunk-off, loses chunk-on
  - v2 `38.93ms`
  - chunk-off `38.71ms`
  - chunk-on `30.44ms`
- start select+type: v2 loses
  - v2 `45.74ms`
  - chunk-off `31.76ms`
  - chunk-on `43.61ms`
- middle typing: v2 loses
  - v2 `44.00ms`
  - chunk-off `26.92ms`
  - chunk-on `25.79ms`
- middle select+type: v2 loses hard
  - v2 `77.24ms`
  - chunk-off `27.38ms`
  - chunk-on `27.29ms`
- select-all: v2 loses
  - v2 `10.00ms`
  - chunk-off `2.95ms`
  - chunk-on `2.76ms`
- full-document paste/replace: v2 loses
  - v2 `26.52ms`
  - chunk-off `20.81ms`
  - chunk-on `24.70ms`

Benchmark validity:

- valid as a mounted React/model-runtime compare
- not full browser keyboard/layout/native paste proof
- one sample is not closure-grade, but it is enough to keep the lane red

Ownership:

- ready: v2 shell/island mount wins
- raw typing: no longer mostly forced-normalization; remaining loss is React
  runtime reads/subscriptions plus core read observation
- select+type/select-all: React corridor/selection path plus core selection
  observation
- paste: benchmark/core/runtime mixed; repair fragment lane later if paste stays
  red after hot read path

Earliest gates:

- correctness: `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- React correctness: `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- perf: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- implement the hard-cut hot read path where the old solution doc already
  points: collapse descendant/text selector fanout and avoid rediscovering text
  data in children when the parent already resolved it. Do not reintroduce the
  failed generic selector-dirtiness patch.

Do not do:

- do not call this green because ready wins
- do not keep compatibility-shaped `getSnapshot()` reads in urgent node/text
  rendering if direct live path reads are faster
- do not revive child-count chunking

### 2026-04-21 Hot Read / Shell Occlusion Slice

Verdict: keep course

Harsh take: the React hot-read cuts finally moved the real lanes, but 5000-block
chunking-on still exposes that v2 is not done.

Claim: v2 `slate-react` huge documents beat legacy chunking-on/off on important
user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Hypotheses tested:

- operation-batch selector filtering should avoid unrelated top-level,
  selected-island, shell-preview, and shell-backed-selection reads on text ops
- plain model selection should not activate a far island; explicit shell
  promotion should
- active descendant bindings should update only for their exact text path on
  text ops
- `Editable` should not broadly rerender for text ops; it should rerender only
  for selection/structural ops
- far shells should render a bounded preview instead of one row per hidden block
- `Slate` should read only the new operation slice instead of cloning full
  operation history per commit

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`

Rejected / cut tactics:

- generic selector dirtiness over descendants remains cut; the kept version uses
  operation-batch filtering only where the owner is clear
- `Editable` using `useSlateStatic()` alone was too aggressive; it broke
  selection scrolling and structural redecorations, so the kept cut adds a
  narrow non-text subscription

Commands and artifacts:

- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
  - pass, `190` tests
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
  - pass, `7` tests
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `5` tests
- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1`
  - pass, `4` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun test ./packages/slate-react/test/editable-behavior.tsx --bail 1`
  - pass, `3` tests
- `bun run bench:slate:6038:local`
  - pass, `withTransactionMeanMs 0.0886`, `applyBatchMeanMs 0.0842`
- `bun run bench:core:huge-document:compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`
  - v2 still loses legacy core: start `4.06ms` vs `0.73ms`, middle `3.96ms`
    vs `0.54ms`
- `bun run bench:core:normalization:compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-normalization-benchmark.json`
  - explicit normalization still wins; insert/read-after-each remains red
- `bun run bench:core:observation:compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-observation-benchmark.json`
  - observation remains red, especially `positionsFirstBlockAfterEachMs`
- `bun run bench:react:rerender-breadth:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
  - locality guardrails hold; unrelated block/ancestor renders remain `0`
- `bun run bench:react:huge-document-overlays:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
  - overlay/corridor guardrails hold; active edit mean about `1.26ms`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - ready: v2 wins, `33.21ms` vs chunk-off `55.07ms` / chunk-on `88.92ms`
  - start typing: v2 beats chunk-on, `31.69ms` vs `30.15ms` / `36.51ms`
  - start select+type: v2 wins, `34.73ms` vs `36.56ms` / `49.11ms`
  - middle typing: v2 still slightly loses, `32.60ms` vs `29.58ms` /
    `28.77ms`
  - middle select+type: v2 essentially ties, `30.55ms` vs `30.11ms` /
    `31.03ms`
  - select-all: v2 loses, `7.94ms` vs `3.20ms` / `2.91ms`
  - paste/replace: v2 loses, `35.73ms` vs `22.95ms` / `26.18ms`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - ready: v2 wins hard, `45.16ms` vs `287.84ms` / `329.80ms`
  - start typing: v2 beats chunk-off but loses chunk-on, `138.60ms` vs
    `148.13ms` / `33.44ms`
  - start select+type: v2 beats chunk-off but loses chunk-on, `148.81ms` vs
    `163.68ms` / `38.87ms`
  - middle typing: v2 beats chunk-off but loses chunk-on, `150.12ms` vs
    `184.23ms` / `39.67ms`
  - middle select+type: v2 beats chunk-off but loses chunk-on, `159.22ms` vs
    `161.79ms` / `35.04ms`
  - select-all: v2 loses, `19.88ms` vs `13.95ms` / `1.13ms`
  - paste/replace: v2 loses, `158.46ms` vs `103.99ms` / `117.74ms`
- `bun run lint:fix`
  - pass, fixed `3` files
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - blocked only by generated `packages/slate-dom/dist/index.d.ts` aliasing
    (`BaseEditor`, `Editor`, `Ancestor`); new slice TS errors were fixed

Benchmark validity:

- valid as mounted React/model-runtime comparison
- one-sample runs are not final closure, but the direction is clear enough for
  owner classification
- paste row remains semantically narrow: it is full-selection text replacement,
  not real clipboard fragment transport

Ownership:

- ready: v2-owned win
- 1000-block smoke typing/select+type: mostly closed, but needs repeated samples
- 5000-block typing/select+type: still chunking-on red; next owner is either
  core observation/read scaling or benchmark geometry, not the already-cut
  render fanout
- select-all: React selection/core selection publication still red
- paste/replace: benchmark/core/runtime mixed; the row should be renamed or
  split before more paste-specific optimization

Earliest gates:

- correctness:
  - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf:
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- pivot to the remaining red owners:
  - split/rename the paste row so text replacement and real fragment paste are
    not muddled
  - profile/select-all path separately from typing
  - investigate 5000-block chunking-on gap with a focused probe that separates
    core read cost from React commit cost after the hot-read cuts

Do not do:

- do not restart generic selector dirtiness
- do not call 1000-block smoke near-parity full closure
- do not optimize paste until the benchmark names the workload honestly

### 2026-04-21 Paste Split / Selection Interval Slice

Verdict: keep course

Harsh take: typing is finally near the right shape at 1000 blocks, but paste and
select-all are still red; the old paste row was hiding two different workloads.

Claim: v2 `slate-react` huge documents beat legacy chunking-on/off on important
user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Hypotheses tested:

- the old `pasteFullDocumentMs` row is too muddy because it measures
  full-selection `insertText`, not fragment paste
- shell-backed select-all should not need `Editor.getSnapshot()` or per-block
  mounted-id lookup; live selection plus mounted intervals is enough

Files changed:

- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

Commands and artifacts:

- `REACT_HUGE_COMPARE_BLOCKS=200 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=5 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - smoke passed with split rows:
    - `replaceFullDocumentWithTextMs`
    - `insertFragmentFullDocumentMs`
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - ready: v2 wins, `29.02ms` vs chunk-off `47.63ms` / chunk-on `69.87ms`
  - start typing: v2 roughly ties/wins, `28.58ms` vs `28.40ms` / `30.89ms`
  - start select+type: v2 wins, `30.37ms` vs `30.83ms` / `47.33ms`
  - middle typing: v2 loses narrowly, `29.49ms` vs `28.65ms` / `25.98ms`
  - middle select+type: v2 near parity, `29.29ms` vs `28.41ms` / `27.36ms`
  - select-all: v2 still loses, `5.51ms` vs `2.83ms` / `2.70ms`
  - replace full document with text: v2 loses, `30.69ms` vs `19.36ms` /
    `25.09ms`
  - insert fragment full document: v2 loses, `29.43ms` vs `19.92ms` /
    `20.33ms`
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - blocked by the existing generated `slate-dom/dist/index.d.ts` aliasing
    problem (`BaseEditor`, `Editor`, `Ancestor`)

Benchmark validity:

- direct compare remains valid for mounted model + React/JSDOM runtime cost
- paste rows are now clearer:
  - text replacement
  - fragment insertion
- still not native clipboard/browser paste transport

Ownership:

- 1000-block smoke typing/select+type: mostly React-runtime-owned and now near closed;
  rerun with repeated samples before closure
- select-all: still React/core selection-owned
- replace/fragment full-document rows: core/runtime mixed; now honest enough to
  optimize separately
- 5000-block chunking-on gap: still open; needs a focused probe after the
  hot-read cuts

Earliest gates:

- correctness:
  - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- perf:
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- optimize the remaining red broad-selection/full-document replacement owners:
  - profile `replaceFullDocumentWithTextMs` and `insertFragmentFullDocumentMs`
    separately
  - split core transform cost from React commit cost for both rows
  - keep select-all separate from paste; it is still selection-owned

Do not do:

- do not call paste fixed just because the row is now honest
- do not merge text replacement and fragment insertion back into one vague paste
  lane
- do not ignore the 5000 chunking-on red typing gap

### 2026-04-21 Core Replace / Active Corridor Slice

Verdict: pivot

Harsh take: paste is no longer the problem; the hard remaining loss is mounted
active text editing at 5000 blocks.

Claim: v2 `slate-react` huge documents beat legacy chunking-on/off on important
user lanes.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Hypotheses tested:

- full-document text replacement and fragment insertion were core-owned
- core `set_selection` was doing unnecessary whole-document transaction
  bootstrap
- far shell previews should not subscribe live
- active islands should mount only the active top-level block, not a full island

Files changed:

- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/core/compare/huge-document.mjs`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/text.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Commands and artifacts:

- `CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_ITERATIONS=1 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`
  - v2 now wins replacement/fragment core:
    - replace `5.53ms` vs legacy `13.28ms`
    - fragment `5.32ms` vs legacy `9.20ms`
- `CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_ITERATIONS=1 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`
  - v2 now wins replacement/fragment core:
    - replace `21.12ms` vs legacy `75.24ms`
    - fragment `20.68ms` vs legacy `68.34ms`
    - select-all `0.01ms` vs legacy `0.02ms`
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
  - pass
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
  - pass
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass after updating active-corridor expectations from full-island mounting
    to one mounted text node
- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1`
  - pass
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass
- `bun run bench:react:huge-document-overlays:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
  - active mounted text count is now `1`
  - shell promotion mean about `1.9ms`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - v2 wins ready by `23-36ms`
  - v2 wins start typing by about `2-4ms`
  - v2 wins start select+type against chunk-on by about `3ms`
  - v2 wins middle typing/select+type by `24-31ms`
  - v2 roughly ties middle promote+type:
    - v2 `37.67ms`
    - chunk-off `32.90ms`
    - chunk-on `37.25ms`
  - select-all still mildly red:
    - v2 `3.61ms`
    - chunk-off `3.95ms`
    - chunk-on `2.81ms`
  - replacement/fragment rows win:
    - replace v2 `5.76ms` vs `29.91ms` / `33.22ms`
    - fragment v2 `9.00ms` vs `23.11ms` / `22.03ms`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  - v2 wins ready hard:
    - v2 `18.20ms`
    - chunk-off `269.06ms`
    - chunk-on `311.91ms`
  - v2 beats chunk-off on start/middle typing and replacement/fragment rows
  - v2 still loses chunking-on on mounted active start typing and promote+type:
    - start type v2 `134.68ms` vs chunk-on `34.11ms`
    - start select+type v2 `129.94ms` vs chunk-on `29.65ms`
    - promote+type v2 `145.17ms` vs chunk-on `45.18ms`
  - v2 wins middle model-only typing/select+type against both baselines, but
    that row is not a full user editing corridor
  - select-all still loses chunking-on:
    - v2 `20.13ms`
    - chunk-on `0.61ms`
  - replacement/fragment rows win hard

Benchmark validity:

- direct compare is valid for mounted React/model runtime cost
- `middleBlockTypeMs` and `middleBlockSelectThenTypeMs` are model-only for v2
  when the block is shelled; the repaired user corridor row is
  `middleBlockPromoteThenTypeMs`
- paste rows are now honest replacement/fragment rows, still not native
  clipboard transport

Ownership:

- paste/fragment: core-owned issue fixed; current direct rows are green
- select-all: core selection fixed; remaining red is React selection/shell path
- historical 1000-block smoke typing/select/promote: useful as debug signal,
  but never a closure gate
- 5000 active start typing and promote+type: still React mounted active text
  commit cost, not core transform cost

Earliest gates:

- correctness:
  - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf:
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- pivot to mounted active text commit cost:
  - profile active start typing with one mounted text node
  - inspect whether React text rendering, DOM ref work, projection hook
    subscription, or `act`/JSDOM dominates
  - keep select-all separate as a React shell-backed selection path

Do not do:

- do not optimize paste further; the direct replacement/fragment lanes are green
- do not count model-only middle typing as full user-lane closure
- do not revive child-count chunking to fix active mounted typing

### 2026-04-21 Closure Checkpoint

Verdict: keep course -> accepted tradeoff closure

Harsh take: v2 now wins the real steady-state lanes; the only remaining slower
row is first activation of an occluded block, which is the intended cost of
occlusion, not a reason to revive chunking.

Claim: v2 `slate-react` huge documents beat legacy chunking-on/off on important
user lanes, with first activation of a shelled block explicitly accepted as the
occlusion tradeoff.

Baseline matrix:

- legacy chunking off
- legacy chunking on
- v2 `EditableBlocks largeDocument`

Final win/loss:

- 5000-block, 5-sample direct compare:
  - v2 wins ready
  - v2 wins start typing
  - v2 wins start select+type
  - v2 wins middle typing
  - v2 wins middle select+type
  - v2 wins select-all
  - v2 wins text replacement
  - v2 wins fragment insertion
  - v2 loses only `middleBlockPromoteThenTypeMs` against chunking-on by about
    `9.13ms` mean / `3-7ms` median-class cost, depending on sample shape

Accepted tradeoff:

- `middleBlockPromoteThenTypeMs` includes first activation of a shelled,
  occluded block.
- That activation is a deliberate semantic-island / corridor-first cost.
- Steady-state editing after the block is active wins.
- Reviving child-count chunking to avoid this one-time activation cost would
  violate the north star.
- This row is accepted as an architecture tradeoff unless product explicitly
  decides first activation must beat chunking-on too.

Key changes landed:

- active editing text ops sync mounted DOM directly and skip React rerender when
  safe
- `Editable` no longer broad-rerenders for text ops
- active large-doc mode mounts one top-level block, not a full child-count
  island
- shell preview rendering is bounded
- shell preview subscriptions are cut
- `activeRadius` default is `0`
- core full-document text replacement and fragment insertion use direct replace
  fast paths
- core selection has a no-listener fast path
- the benchmark split text replacement from fragment insertion
- the benchmark added `middleBlockPromoteThenTypeMs` to avoid hiding activation
  cost inside model-only typing

Commands and artifacts:

- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
  - pass
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
  - pass
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass
- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1`
  - pass
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass
- `bun run bench:react:rerender-breadth:local`
  - pass; unrelated block/ancestor renders remain local, edited leaf render
    count drops to `0` for directly synced text ops
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass; active mounted text count is `1`, promotion mean about `1.83ms`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - pass for the perf claim with the accepted activation tradeoff
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react`
  - blocked by the pre-existing generated
    `packages/slate-dom/dist/index.d.ts` aliasing issue:
    - `BaseEditor`
    - `Editor`
    - `Ancestor`

Benchmark validity:

- direct compare is valid for mounted React/model runtime cost
- paste is split into text replacement and fragment insertion
- native clipboard transport remains out of scope for this benchmark
- model-only middle typing is not counted as full corridor closure; the
  activation row owns that truth

Ownership:

- ready: v2-owned win
- steady typing/select+type: v2-owned win
- full-document replacement/fragment: v2-owned win
- select-all: v2-owned win
- first occluded-block activation: accepted tradeoff
- typecheck blocker: generated `slate-dom` d.ts aliasing, not this perf lane

Earliest gates:

- correctness:
  - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- perf:
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

Next move:

- This perf lane can stop looping.
- Separate follow-up: fix generated `slate-dom/dist/index.d.ts` aliasing so
  package typecheck can close.

Do not do:

- do not reopen child-count chunking for first activation cost
- do not blur paste rows back together
- do not call the `slate-dom` generated d.ts blocker a perf failure
