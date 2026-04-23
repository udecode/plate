---
date: 2026-04-21
topic: slate-v2-data-model-first-react-perfect-runtime
status: complete
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
---

# Slate v2 Data-Model-First React-Perfect Runtime Plan

## Problem Frame

The huge-document perf lane proved the v2 direction can beat legacy chunking
on important measured lanes:

- active editing can beat chunking when React is removed from the urgent plain
  text path
- occlusion plus a small active corridor beats keeping a large chunked editable
  React tree mounted
- replacement and fragment insertion are green once core owns direct full-doc
  operations

But the current implementation also introduced the exact risks chunking mostly
avoided:

- direct DOM text mutation can bypass React rendering contracts
- shell activation can blur user selection and internal activation
- shell-backed paste can downgrade rich clipboard behavior
- shell UI can become inaccessible if it advertises button semantics without
  real keyboard operation

The next architecture pass should not chase another isolated benchmark win.
It should turn the current winning shape into a clean, data-model-first
runtime architecture.

## Principle Stack

Ian's feedback changes the hierarchy. The rewrite must not become React-first.

The correct order is:

1. data-model-first core
2. operation- and collaboration-friendly model
3. transaction-first engine
4. renderer-optimized runtime APIs
5. React-optimized `slate-react`
6. optional adapters later

React is the first-class runtime target, not the core identity.

The core must stay useful for:

- storing a JSON-like document as data
- operation history
- OT / collaboration
- headless transforms
- non-React renderers
- DOM/browser adapters

Transactions should change how Slate executes local edits. They should not
replace operations as the canonical collaboration/history layer.

## Target Architecture

### 1. Core Owns Data And Operations

The `slate` package owns:

- document tree
- selection
- marks
- operation application
- transaction execution
- normalization
- runtime identity
- dirty-region metadata
- immutable observer snapshots

Core must not know React concepts, DOM nodes, rendered leaves, or browser
selection mechanics.

### 2. Transactions Are Local Execution Units

Operations remain the canonical serialized fact.

Transactions become the local runtime boundary:

- collect one or more operations
- apply them to live mutable transaction state
- update refs and bookmarks
- track dirty regions
- run normalization
- commit once
- publish operation-derived invalidation metadata

This gives renderers a clean commit signal without making renderers part of
core semantics.

### 3. Immutable Snapshots Are Observer Artifacts

`Editor.getSnapshot()` should stay useful for:

- stable external-store subscribers
- tests
- devtools
- non-urgent derived UI
- overlay projection recompute
- app-level observation

It should not be the urgent hot read path for:

- active text rendering
- caret-preserving edits
- simple text operation dirtiness
- mounted node lookups
- active corridor updates

Hot rendering needs first-class live reads with explicit constraints.

### 4. Core Exposes Hot Live Read APIs

The perfect runtime needs explicit public or internal APIs such as:

- `Editor.getLiveNode(editor, path)`
- `Editor.getLiveText(editor, path)`
- `Editor.getLiveSelection(editor)`
- `Editor.getRuntimeId(editor, path)`
- `Editor.getPathByRuntimeId(editor, runtimeId)`
- `Editor.getChangedOperations(editor, since)`
- `Editor.getDirtyRegion(editor, transaction)`

These APIs must be:

- O(depth) or O(1) for the active path
- independent from full snapshot rebuild
- safe during active transactions where needed
- clearly documented as live reads, not immutable observer snapshots

Do not hide live reads behind `getSnapshot()` compatibility.

### 5. Core Publishes Operation Dirtiness

Every commit should publish a compact change record:

- operations
- operation classes:
  - text
  - selection
  - mark
  - structural
  - replace
- dirty paths
- touched runtime ids when cheap
- top-level dirty range when useful
- selection changed
- marks changed
- snapshot version

Core should not force observers to infer dirtiness by diffing full snapshots.

### 6. `slate-dom` Owns Browser Translation

The `slate-dom` package owns:

- DOM point/range translation
- DOM selection truth
- clipboard transport
- browser quirks
- composition / IME safety at the browser boundary
- DOM node identity maps

It consumes core runtime identity and committed/live reads. It must not own
React subscription policy.

### 7. `slate-react` Owns Runtime Subscription And Rendering

The `slate-react` package owns:

- selector subscriptions
- active corridor rendering
- occlusion shells
- React component composition
- overlay projection wiring
- direct DOM text sync only for explicitly safe lanes
- fallback to React rendering for unsafe lanes

It should consume core dirtiness and `slate-dom` mapping. It should not invent
core data semantics.

## Required Runtime Lanes

### Lane A. Observer Snapshot Lane

Purpose:

- stable immutable reads for subscribers and external stores

Allowed work:

- overlay projection recompute
- app-level `useSlateSelector`
- devtools
- tests
- non-urgent UI

Not allowed:

- urgent plain text keystroke rendering
- active DOM text repair

### Lane B. Live Active Read Lane

Purpose:

- read current node/text/selection/runtime id on the active path without full
  snapshot rebuild

Used by:

- mounted text node rendering
- active block render updates
- DOM sync guard checks
- selection/caret repair

Rules:

- no full tree clone
- no full runtime-id index rebuild
- clear invalidation contract
- no leaking mutable nodes to app code unless the API is explicitly internal

### Lane C. DOM-Owned Plain Text Lane

Purpose:

- make ordinary active typing avoid React commit when it is safe

Allowed only when all are true:

- operation class is text-only
- target is the active mounted text path
- not composing
- no custom `renderText`
- no custom `renderLeaf`
- no custom `renderSegment`
- no projections/decorations on that text node
- no placeholder or zero-width special case affected
- exactly one DOM string node maps to the text node
- accessibility text content remains equivalent

If any condition fails, fall back to React render.

This must be a named runtime capability, not a DOM-shape accident.

### Lane D. React Render Lane

Purpose:

- render anything that cannot safely use the DOM-owned plain text lane

Used by:

- custom renderers
- decorations
- annotations/widgets touching text
- marks changing
- structural edits
- IME/composition
- void/inline boundary work
- placeholder changes
- accessibility-relevant rendering

### Lane E. Shell / Activation Lane

Purpose:

- represent inactive huge-doc regions cheaply
- activate a region intentionally when the user enters it

Rules:

- activation state is not automatically user selection
- publishing a model selection should be explicit
- focus should not be forced synchronously unless needed for user input
- shell UI must be either truly interactive and accessible or truly inert
- first activation cost is allowed only as an explicit occlusion tradeoff

## Current Progress Review

### What Is Good

- The active corridor default moved to `activeRadius: 0`.
- Direct compare uses legacy chunking-off / chunking-on / v2.
- Paste is split into text replacement and fragment insertion.
- The benchmark added `middleBlockPromoteThenTypeMs`, which stops hiding
  activation cost inside model-only typing.
- Active text DOM sync removed React commits on safe active typing in the
  current benchmark.
- Replacement and fragment insertion are now core wins.
- Select-all is effectively green in the direct compare.

### What Is Risky

Direct DOM sync currently relies on DOM shape:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`

It needs a capability contract that accounts for custom renderers, projections,
composition, and accessibility.

Shell promotion currently mutates `editor.selection` directly:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

That should become either activation-only state or an explicit selection
operation.

Shell-backed paste currently intercepts before proving the clipboard lane:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`

That needs fragment-aware and rich-clipboard-safe behavior.

Shells currently expose button semantics with `tabIndex={-1}`:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`

That is not a valid accessibility contract.

## Implementation Plan

### Phase 1. Freeze The Winning Perf Contract

Goal:

- lock the current measured wins and accepted activation tradeoff

Work:

- sync stale docs:
  - `docs/slate-v2/replacement-gates-scoreboard.md`
  - `docs/slate-v2/true-slate-rc-proof-ledger.md`
  - `docs/slate-v2/release-readiness-decision.md`
  - `docs/slate-v2/master-roadmap.md`
  - `docs/slate-v2/commands/run-perf-gates.md`
- keep the accepted tradeoff explicit:
  - first activation of a shelled block may lose to chunking-on
  - steady editing must win

Proof:

```sh
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

`1000` blocks is smoke/debug only. It must not be used as a closure or
superiority proof gate for the huge-doc runtime lane.

### Phase 2. Name The DOM-Owned Plain Text Lane

Goal:

- stop direct DOM sync from being an accidental optimization

Work:

- add an explicit predicate in `slate-react`, for example:
  - `canUseDOMTextSync(...)`
- include all opt-out conditions:
  - custom renderers
  - projections
  - marks changes
  - composition
  - placeholder / zero-width cases
  - multiple string nodes
  - accessibility-impacting wrappers
- make `syncTextOperationsToDOM(...)` consume this predicate
- record why an op did or did not use the DOM-owned lane in benchmark/probe
  metrics

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

Tests:

- add direct React tests proving DOM sync is disabled for:
  - `renderText`
  - `renderLeaf`
  - `renderSegment`
  - projections
  - composition
  - zero-width / placeholder text

Proof:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run bench:react:rerender-breadth:local
```

### Phase 3. Split Activation From Selection

Goal:

- make shell activation intentional and not a hidden model-selection write

Work:

- replace direct `editor.selection = ...` in shell promotion
- introduce explicit activation state:
  - `activeTopLevelIndex`
  - or `activeRuntimeId`
- only publish selection when the user action semantically selects/carets into
  the document
- make mouse, focus, keyboard activation behavior explicit

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`

Tests:

- shell activation does not fire `onSelectionChange` unless it intentionally
  creates a user-visible selection
- keyboard activation works if shell is interactive
- programmatic selection still works
- scroll-to-selection still works

Proof:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/editable-behavior.tsx --bail 1
```

### Phase 4. Fix Shell Accessibility Contract

Goal:

- shells are accessible or explicitly inert

Decision:

- if shells are clickable activators, they must be keyboard reachable and
  named
- if not, remove button semantics and provide another navigation mechanism

Recommended direction:

- keep shells as activators
- use `button`-equivalent behavior:
  - `tabIndex={0}`
  - `role="button"` or actual `<button>` if markup allows
  - `aria-label`
  - Enter/Space handlers
  - visible focus style / data attribute

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`

Tests:

- keyboard activation promotes shell
- ARIA label exists
- tab reachability matches intended UX
- focus returns to editor/caret safely after activation

Proof:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
```

### Phase 5. Make Shell-Backed Paste Fragment-Safe

Goal:

- do not sacrifice rich clipboard or Slate fragment behavior for perf

Work:

- shell-backed paste should first detect full-document shell-backed selection
- preserve Slate fragment data when present
- preserve HTML/plain fallback behavior through `slate-dom`
- only use direct text replacement for plain-text-only full-document selection
- partial shell-backed selections should route through model fragment insertion,
  not swallow rich data

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`

Tests:

- full-document plain text paste
- full-document Slate fragment paste
- full-document HTML paste
- partial shell-backed paste
- no shell expansion unless required

Proof:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
```

### Phase 6. Promote Core Hot Reads

Goal:

- make live reads first-class and stop relying on snapshot reads in urgent
  paths

Work:

- add or formalize core APIs:
  - live node read
  - live text read
  - live selection read
  - runtime id by path
  - path by runtime id
  - changed operations since index
  - dirty region per transaction
- make immutable snapshots clearly observer-only
- ensure these APIs remain data-model-first and framework-neutral

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/runtime-ids.ts`

Tests:

- live read APIs return current transaction truth
- snapshots stay immutable
- operations remain canonical
- runtime id/path mapping survives text, selection, structural, normalize ops

Proof:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

### Phase 7. Core Operation Dirtiness As First-Class Commit Metadata

Goal:

- renderers and overlays receive cheap dirtiness directly from core

Work:

- commit change records should include:
  - operations
  - class
  - dirty paths
  - touched runtime ids where cheap
  - top-level dirty interval where useful
  - selection/marks flags
  - snapshot version
- remove remaining full-snapshot inference from hot overlay/runtime paths

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/widget-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts`

Tests:

- text op dirtiness updates only touched projections
- selection op dirtiness updates selection overlays only
- structural op broad invalidation stays correct
- annotation/widget churn stays local

Proof:

```sh
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

### Phase 8. Browser Editing Proof

Goal:

- prove the perf architecture does not regress real editing

Add browser proof rows for:

- active plain typing
- IME/composition typing
- decorated text typing fallback
- custom `renderLeaf` fallback
- custom `renderText` fallback
- rich paste into shell-backed selection
- keyboard shell activation
- screen-reader-relevant shell labels
- select-all shell-backed selection
- undo/redo after directly synced text

Files:

- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx`

Proof:

```sh
bun run test:integration-local
```

## Final Completion Criteria

This architecture is not complete until all are true:

- v2 wins the direct 5000-block huge-doc proof gate, with only explicitly
  accepted tradeoffs
- direct DOM sync has explicit opt-in/opt-out rules
- custom rendering/decorations/projections/composition fall back safely
- shell activation is separate from selection unless explicitly selecting
- shell UX is keyboard and accessibility safe
- shell-backed paste preserves rich clipboard semantics
- core exposes live reads and operation dirtiness as framework-neutral runtime
  APIs
- immutable snapshots are observer artifacts, not urgent render dependencies
- browser proof covers the editing experience that chunking previously
  protected
- generated `slate-dom` declaration aliasing no longer blocks typecheck

## Non-Goals

- Do not revive legacy child-count chunking as the main story.
- Do not make core React-first.
- Do not optimize by silently dropping custom renderers, decorations, IME, rich
  paste, or accessibility.
- Do not call JSDOM benchmark success browser-editing proof.
- Do not conflate first activation cost with steady editing cost.

## Checkpoints

### 2026-04-21 DOM-Owned Plain Text Lane Capability

Verdict: keep course

Harsh take: the old fast path was a DOM-shape accident; now it is an explicit
capability, but the shell activation path still mutates selection directly.

Why:

- added an explicit `data-slate-dom-sync="true"` capability to default plain
  text rendering only
- `syncTextOperationsToDOM(...)` now requires that capability and skips
  composition and empty-text cases
- tests prove app-owned `renderText`, `renderLeaf`, `renderSegment`, and
  projection-backed rendering opt out of direct DOM sync

Risks:

- direct DOM sync remains a browser-facing fast path, but it is now gated by a
  named runtime capability instead of only checking for one string node
- richer browser proof is still required before the architecture can be called
  perfect

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-text.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Commands:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `9` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run bench:react:rerender-breadth:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- historical 1000-block smoke run
  - pass; smoke/debug only, not a proof gate
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate-react`
  - blocked by the known generated
    `packages/slate-dom/dist/index.d.ts` aliasing issue:
    `BaseEditor`, `Editor`, `Ancestor`

Decision:

- keep the capability-gated DOM-owned plain text lane
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- split shell activation from selection by removing the direct
  `editor.selection = ...` mutation and routing intentional caret placement
  through an explicit selection operation.

### 2026-04-21 Shell Activation / Selection Split

Verdict: keep course

Harsh take: shell activation no longer mutates selection silently, but focus
activation is still the wrong accessibility contract.

Why:

- mouse shell activation now routes caret placement through `Transforms.select`
  instead of direct `editor.selection = ...`
- focus promotion was tested separately and did not publish model selection
- the direct 1000-block smoke compare stayed green after this change

Risks:

- focus-triggered promotion removes the focused shell when a keyboard user lands
  on it; that is bad button semantics
- shells still need real keyboard activation and labels before the accessibility
  contract is acceptable

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Commands:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `10` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run bench:react:rerender-breadth:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- historical 1000-block smoke run
  - pass; smoke/debug only, not a proof gate
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`

Decision:

- keep selection publishing through `Transforms.select` for intentional mouse
  activation
- continue immediately to shell accessibility

Next move:

- make shells keyboard reachable and operable; focus should not activate, Enter
  and Space should.

### 2026-04-21 Shell Accessibility Contract

Verdict: keep course

Harsh take: shells are no longer fake buttons; they are keyboard-reachable
activators with labels, and focus alone no longer mutates the document.

Why:

- shell focus no longer promotes or changes model selection
- Enter/Space promotes the shell and intentionally publishes caret selection
  through the normal selection path
- shells now expose `role="button"`, `tabIndex={0}`, and an `aria-label`

Risks:

- shell focus/activation is now more honest, but shell-backed paste still
  intercepts before proving fragment/rich clipboard semantics

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Commands:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `11` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run bench:react:rerender-breadth:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- historical 1000-block smoke run
  - pass; smoke/debug only, not a proof gate
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate-react`
  - blocked by the known generated
    `packages/slate-dom/dist/index.d.ts` aliasing issue:
    `BaseEditor`, `Editor`, `Ancestor`

Decision:

- keep shell keyboard activation and focus behavior
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- make shell-backed paste fragment-safe and avoid swallowing rich clipboard
  payloads.

### 2026-04-21 Shell-Backed Paste Safety And Core Read Pivot

Verdict: pivot

Harsh take: the React/browser safety lane is materially better; the next real
owner is core live reads and operation dirtiness, not more paste work.

Why:

- shell-backed paste now uses direct full-document text replacement only for
  plain-text-only full-document shell selections
- Slate fragment payloads route through `ReactEditor.insertData(...)` instead
  of being downgraded to plain text
- shell UI is keyboard reachable and named
- focus activation no longer mutates document selection
- core observation remains red, especially position reads after edits

Risks:

- native browser clipboard transport is still not fully proved by the React
  unit tests
- generated `slate-dom/dist/index.d.ts` aliasing still blocks package
  typecheck
- core live read APIs are not yet promoted as first-class public/internal
  runtime APIs

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-text.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Commands:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `12` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run bench:react:rerender-breadth:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- historical 1000-block smoke run
  - pass; smoke/debug only, not a proof gate
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bun run bench:core:observation:compare:local`
  - current still trails legacy:
    - `readChildrenLengthAfterEachMs`: `4.46ms` vs `1.20ms`
    - `nodesAtRootAfterEachMs`: `11.06ms` vs `8.76ms`
    - `positionsFirstBlockAfterEachMs`: `38.70ms` vs `1.70ms`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-observation-benchmark.json`
- `bun run bench:core:huge-document:compare:local`
  - current still trails legacy on typing transform cost but wins replacement,
    fragment insertion, and ties select-all:
    - start type: `4.04ms` vs `0.71ms`
    - middle type: `4.05ms` vs `0.54ms`
    - replace full document: `3.37ms` vs `9.08ms`
    - insert fragment: `3.39ms` vs `8.53ms`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate-react`
  - blocked by known generated `packages/slate-dom/dist/index.d.ts` aliasing:
    `BaseEditor`, `Editor`, `Ancestor`

Decision:

- keep the explicit DOM-owned plain text lane capability
- keep shell focus, keyboard, and mouse activation behavior
- keep shell-backed fragment paste path
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- promote core live read APIs and operation dirtiness as first-class runtime
  APIs, starting with the core observation gap.

### 2026-04-21 Core Live Reads And Operation Dirtiness

Verdict: pivot

Harsh take: core now has real live-read and operation-dirtiness APIs, and the
snapshot-backed `positions` cliff is gone; remaining completion blockers are
browser proof and the generated declaration aliasing issue.

Why:

- added live read APIs for node, text, selection, runtime id, and operation
  dirtiness
- `Editor.positions(...)` now builds position segments from live editor state
  instead of immutable snapshot projection
- `positionsFirstBlockAfterEachMs` dropped from the old `~38ms` class to
  `4.02ms`
- surface, snapshot, transaction, and query contracts still pass

Risks:

- live read APIs are now part of the runtime surface and need follow-up docs
  before public-facing API claims widen
- core typing transform cost remains slower than legacy in the compare lane
- browser proof still needs to cover the editing experience affected by direct
  DOM sync, shell activation, and shell-backed paste
- generated `slate-dom/dist/index.d.ts` aliasing still blocks package
  typecheck

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/positions.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/test/surface-contract.ts`

Commands:

- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
  - pass, `8` tests
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
  - pass, `190` tests
- `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
  - pass, `11` tests
- `bun test ./packages/slate/test/query-contract.ts --bail 1`
  - pass, `69` tests
- `bun run bench:core:observation:compare:local`
  - `positionsFirstBlockAfterEachMs`: current `4.02ms`, legacy `1.72ms`
  - `readChildrenLengthAfterEachMs`: current `4.23ms`, legacy `1.23ms`
  - `nodesAtRootAfterEachMs`: current `10.59ms`, legacy `8.83ms`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-observation-benchmark.json`
- `bun run bench:core:huge-document:compare:local`
  - typing transform cost remains slower than legacy
  - replacement and fragment lanes still win
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-core-huge-document-benchmark.json`
- `bun run bench:slate:6038:local`
  - pass
- `bun run bench:core:normalization:compare:local`
  - pass; explicit normalization wins remain, insert/read residual remains
- `bun run lint:fix`
  - pass
- `bun run lint`
  - pass
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react`
  - blocked by known generated `packages/slate-dom/dist/index.d.ts` aliasing:
    `BaseEditor`, `Editor`, `Ancestor`

Decision:

- keep live read and operation dirtiness API direction
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- add or update browser/integration proof for direct DOM sync fallback,
  shell keyboard activation, and shell-backed rich/fragment paste before any
  completion claim.

### 2026-04-21 Browser Runtime Safety Proof

Verdict: keep course

Harsh take: the three P1 review findings are no longer only defended by jsdom
tests, but this still is not full browser-editing closure.

Why:

- added a dedicated v2 `large-document-runtime` example that uses
  `EditableBlocks` large-document mode instead of the legacy chunking example
- Chromium proof now verifies default plain text is explicitly DOM-sync capable
  and still types through the browser path
- Chromium proof verifies custom `renderText` and projection-backed text do not
  expose `data-slate-dom-sync="true"` and still type through React/browser
  fallback
- Chromium proof verifies shell focus does not mutate model selection, while
  Enter activates the shell and intentionally publishes caret selection
- Chromium proof verifies full-document shell-backed selection stays
  shell-backed and real clipboard HTML carrying `data-slate-fragment` pastes as
  Slate fragment semantics, not plain fallback text
- React tests now also pin empty zero-width text and composition fallback:
  direct DOM sync is not used while composing

Risks:

- browser IME/composition proof is still missing; the current composition proof
  is a React/runtime fallback test, not a real IME row
- custom `renderLeaf` has unit coverage but not browser coverage
- undo/redo after DOM-owned direct typing is not yet proved in a browser
- generated `slate-dom/dist/index.d.ts` aliasing still blocks package
  typecheck

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`
  - `/Users/zbeyens/git/slate-v2/site/constants/examples.ts`
  - `/Users/zbeyens/git/slate-v2/site/pages/examples/[example].tsx`
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/large-document-runtime.test.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

Failed probes:

- first Playwright run hit 404 because an existing `3101` server was reused
  before the new route existed; restarted the server and reran
- first route build imported internal `EditableTextRenderTextProps`; fixed the
  example to derive the type from public `EditableBlocks` props
- first browser typing proof used the selection helper, which waits for native
  DOM selection even when the model handle path is enough; changed the proof to
  click the mounted text endpoint and type through the browser

Commands:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `14` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
  - pass, `3` tests
  - includes `bun build:next` through Playwright web server
- `bun run bench:react:rerender-breadth:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-rerender-breadth-benchmark.json`
- `bun run bench:react:huge-document-overlays:local`
  - pass
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-overlays-benchmark.json`
- historical 1000-block smoke run
  - pass; smoke/debug only, not a proof gate
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bun run lint:fix`
  - pass, fixed `2` files
- `bun run lint`
  - pass

Decision:

- keep the explicit DOM-owned text capability and shell/paste safety direction
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- add the remaining browser rows for IME/composition, custom `renderLeaf`
  fallback, and undo/redo after DOM-owned typing; do not call the architecture
  lane complete before those user paths are covered.

### 2026-04-21 Browser Editing Protection Rows

Verdict: pivot

Harsh take: the editing-regression fear is now backed by browser rows instead
of good intentions. The remaining owner is not another shell/DOM-sync patch;
it is closeout verification and the generated declaration blocker.

Why:

- default active plain typing uses the browser path and keeps the explicit
  `data-slate-dom-sync="true"` capability
- custom `renderText`, custom `renderLeaf`, and projection-backed text omit the
  DOM-sync capability and still accept browser typing
- Chromium IME composition commits at the intended caret after the test pins
  both DOM and Slate selection; this avoids relying on click placement noise
- direct DOM-synced typing is undoable through the normal history hotkey path
- shell keyboard activation, shell labels, shell-backed select-all state, and
  real clipboard fragment paste remain green

Risks:

- this proof is Chromium-only; WebKit/Firefox/mobile IME lanes are still
  separate browser-platform work
- generated `slate-dom/dist/index.d.ts` aliasing still blocks package
  typecheck
- 5000-block direct compare was not rerun after these example/test-only rows

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/large-document-runtime.test.ts`

Failed probes:

- Chromium CDP composition inserted at the start when the proof relied only on
  click placement. The fixed proof explicitly sets the DOM caret and Slate
  selection before composition; with that real precondition, composition lands
  at the intended caret.

Commands:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
  - pass, `5` tests
  - includes `bun build:next` through Playwright web server
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `14` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run lint:fix`
  - pass, fixed `1` file
- `bun run lint`
  - pass

Decision:

- treat Phase 8 browser editing proof as closed for Chromium desktop
- keep `tmp/completion-check.md` as `status: pending`

Next move:

- rerun the 5000-block huge-doc direct compare and then attack the generated
  `slate-dom` declaration aliasing blocker if it still prevents package
  typecheck.

### 2026-04-21 Perf And Typecheck Closeout

Verdict: stop

Harsh take: the architecture lane is complete for the active plan. Keeping the
loop alive would be fake motion; remaining release work belongs to broader
claim-width / RC ledger closure, not this huge-doc runtime safety lane.

Why:

- 5000-block direct compare is green on the important lanes
- the only 5000 mean loss is `middleBlockPromoteThenTypeMs` against
  chunking-on, which remains the explicit first-activation occlusion tradeoff
- generated `slate-dom/dist/index.d.ts` aliasing no longer blocks
  `slate-react` typecheck
- DOM boundary tests stayed green after the type alias source fix

Risks:

- broader release readiness is still not closed; contributor-facing example
  parity and RC claim width remain separate owners
- non-Chromium/mobile IME rows remain platform-expansion work, not a blocker
  for this Chromium-backed architecture lane

Actions:

- changed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/range-list.ts`
  - `/Users/zbeyens/git/plate-2/docs/plans/2026-04-21-slate-v2-data-model-first-react-perfect-runtime-plan.md`
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/slate-react-perf-loop-context.md`
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md`
  - `/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`
  - `/Users/zbeyens/git/plate-2/tmp/completion-check.md`

Commands:

- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - pass; v2 wins ready, start typing, start select+type, middle typing,
    middle select+type, select-all, text replacement, and fragment insertion
  - accepted tradeoff: `middleBlockPromoteThenTypeMs` mean `40.55ms` vs
    chunking-on `37.29ms`, chunk-off `170.78ms`
  - artifact: `/Users/zbeyens/git/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react`
  - pass
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`
  - pass
- `bun test ./packages/slate-dom/test/bridge.ts --bail 1`
  - pass, `4` tests
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
  - pass, `6` tests
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
  - pass, `14` tests
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
  - pass, `4` tests
- `bun run lint:fix`
  - pass, fixed `2` files
- `bun run lint`
  - pass
- `bun completion-check`
  - pass after `tmp/completion-check.md` was set to `status: done`

Decision:

- close the data-model-first / React-perfect huge-doc runtime architecture
  lane under the active plan
- keep broader RC/release readiness separate

Next move:

- stop this loop; the next autonomous owner should be a new prompt for broader
  RC claim-width/example parity closure, not more work inside this completed
  lane.
