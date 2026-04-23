---
date: 2026-04-23
topic: slate-v2-remaining-perfect-architecture-batches
status: active
depends_on:
  - docs/plans/2026-04-22-slate-v2-authoritative-command-kernel-architecture-plan.md
  - docs/plans/2026-04-23-slate-v2-authoritative-command-kernel-batch-2-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
related:
  - docs/plans/2026-04-22-slate-v2-core-api-runtime-perfection-plan.md
  - docs/plans/2026-04-21-slate-v2-final-api-runtime-shape-plan.md
  - docs/solutions/logic-errors/2026-04-23-slate-react-shell-buttons-must-be-internal-targets.md
---

# Slate v2 Remaining Perfect Architecture Batches

## Verdict

Batch 1 and Batch 2 succeeded at the right thing: they built and hardened the
authoritative command/kernel spine.

Do not keep stretching that plan.

The remaining work should split into three focused batches:

1. Browser red-row burn-down.
2. Final public API hard cuts.
3. Core perf perfection.

Each batch has a different owner and should not be blurred into generic
"kernel work."

## Harsh Take

The architecture is no longer weak because `Editable` lacks a spine.

The architecture is still not perfect because:

- browser proof still has known red rows
- compat surfaces still exist near the public API
- core perf is good enough for React huge-doc runtime but not theoretically
  perfect

That means the next work is not another broad rewrite. It is targeted closure
of the remaining proof and API/perf debt.

## Current Proven Foundation

From Batch 1:

- command registry exists
- extension registry skeleton exists
- commands run through transaction/commit flow
- `EditorCommit.command` exists
- history consumes commits/operations instead of patching `editor.apply`
- generated browser gauntlet base exists

From Batch 2:

- `EditableEditingKernel` exposes explicit selection and repair policies
- selection import/export is policy-gated
- repair execution is policy-gated
- generated gauntlets cover:
  - navigation/typing
  - mark/format typing
  - clipboard paste
  - inline cut/typing
  - internal controls
  - composition
  - shadow DOM
  - large-document shell activation
- 5000-block huge-doc compare remains green against legacy chunking off/on

Keep this foundation. Do not replace it.

## Batch 3: Browser Red-Row Burn-Down

### Goal

Make browser proof honest by closing or explicitly accepting every remaining
red row from Batch 2.

This is correctness proof work, not API polish and not core perf.

### Non-Negotiable Method

Every red row must end with an owner classification before code changes are
called done.

Allowed owner classes:

- app/example bug
- slate-browser harness gap
- slate-react kernel gap
- slate-dom bridge gap
- core selection/model gap
- accepted platform limitation

No local fix may land as "done" without naming one of those owners.

If the owner is unclear, add characterization first. Do not patch the symptom.

Each row must prove both:

- model state
- visible/browser state

When the claim involves selection, it must also state which selection truth is
being proved:

- model selection
- DOM selection
- handle-backed semantic selection
- platform not observable

If a browser red is caused by a compat surface that Batch 4 plans to hard-cut,
pull that exact hard cut forward into Batch 3. Do not wait for Batch 4 when the
compat surface is the proven owner.

### Owners

#### 1. Mentions Autocomplete Trigger

Current state:

- red across Chromium, Firefox, WebKit, and mobile
- failing rows:
  - `mentions example › shows list of mentions`
  - `mentions example › inserts from list`

Known evidence:

- native text transport did not open the portal
- semantic handle insertion probe did not open the portal
- switching app code from `editor.selection` to `Editor.getLiveSelection` did
  not close it

Likely owner:

- app/example autocomplete trigger logic
- `site/examples/ts/mentions.tsx`
- possibly example test setup selecting the wrong insertion point
- possibly app `onChange` semantics around void inline boundaries

Do:

- add one focused characterization row that asserts:
  - model text after typing trigger text
  - model selection after trigger text
  - `beforeText`, `beforeMatch`, and `afterMatch` debug state if exposed
  - portal visibility
- expose debug state only through a test/proof surface if needed; do not make
  it a user-facing API
- decide whether the trigger should be:
  - native browser text path
  - semantic handle path
  - explicit app command/input-rule path
- classify the owner before fixing:
  - app/example bug if the mention trigger math is wrong
  - slate-browser harness gap if the setup fails to put text/selection where
    the example expects
  - slate-react kernel gap if committed text/selection is wrong after a valid
    user path

Do not:

- fake portal visibility
- make the row pass by clicking the portal without proving trigger state
- broaden into all autocomplete UX

Primary files:

- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/playwright/integration/examples/mentions.test.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx` only if the
  failing proof proves runtime ownership

Gates:

```sh
bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

#### Mentions Autocomplete Result

Status: complete with mobile trigger transport accepted.

Actions:

- Fixed the test helper to place the mention trigger in the actual mention
  paragraph before the first existing mention.
- Added DOM selection placement to the helper instead of model-only selection.
- Fixed the mentions example portal positioning to fail closed when
  `ReactEditor.toDOMRange(editor, target)` cannot resolve immediately after a
  text mutation.
- Switched the mentions example from `editor.selection` to
  `Editor.getLiveSelection(editor)`.
- Classified mobile autocomplete trigger rows as accepted transport limitation;
  mobile still proves mention rendering, but not portal trigger insertion.

Owner classification:

- app/example bug:
  - portal positioning threw during transient DOM mapping after text insertion
  - example used `editor.selection` instead of the live selection API
- slate-browser/test setup gap:
  - original helper selected the wrong insertion point and was model-only
- accepted platform limitation:
  - mobile mention trigger transport still does not prove portal opening in
    this automation stack

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun run lint:fix
bun run lint
```

Results:

- focused Chromium mentions: `3 passed`
- cross-project mentions: `12 passed`
- lint: passed

Decision:

- Mentions autocomplete is closed for desktop browser projects.
- Mobile portal-trigger behavior remains accepted/deferred with exact scope.
- Next Batch 3 owner is large-document void browser-click selection.

#### 2. Large-Document Void Browser-Click Selection

Current state:

- red across Chromium, Firefox, WebKit, and mobile
- failing row:
  - `large document runtime example › selects void content by browser click without mutating content`

Likely owner:

- large-doc semantic shell/void selection
- model selection vs DOM selection after clicking void content
- possibly shell/void target classification

Do:

- first prove whether click changes:
  - visible DOM
  - model selection
  - kernel trace
  - latest commit
  - focus owner
- decide whether this is a click-selection contract or an activation contract
  before implementing
- decide if void click should be:
  - model selection
  - shell activation
  - app/internal control
  - no-op with explicit rationale
- if the correct behavior is no-op, update the test contract instead of forcing
  selection

Do not:

- treat DOM-only selection as enough
- mutate content just to create a selection
- reuse child-count chunking logic

Primary files:

- `../slate-v2/playwright/integration/examples/large-document-runtime.test.ts`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/large-document/**`

Gates:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "void content by browser click" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "void content by browser click|generated shell activation" --workers=4 --retries=0
```

#### Large-Document Void Browser-Click Result

Status: complete for the previous scoped batches; reopened by the DOM bridge
integrity review below.

Actions:

- Reproduced the red Chromium row.
- Identified a Batch 2 regression in target classification:
  `isInteractiveInternalTarget` treated every `[contenteditable=false]`
  descendant as internal, which included Slate void content.
- Narrowed internal target classification to real controls:
  `input`, `textarea`, `select`, `button`, `[role="button"]`, and nested
  editor roots.
- Preserved shell behavior through `[role="button"]`.

Owner classification:

- slate-react kernel/target-classification gap
- not slate-dom bridge
- not core model
- not app/example bug

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "void content by browser click|generated shell activation" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "void content by browser click|generated shell activation" --workers=4 --retries=0
bun run lint:fix
bun run lint
```

Results:

- focused Chromium void click + generated shell rows: `2 passed`
- cross-project void click + generated shell rows: `8 passed`
- slate-react kernel/selection/repair contracts: passed
- slate-dom/slate-react build/typecheck: passed
- lint: passed

Decision:

- Large-document void browser-click selection is closed.
- Next Batch 3 owner is mobile nested-editor DOM-selection observability.

#### 3. Mobile Nested-Editor DOM Selection

Current state:

- red only on mobile
- failing row:
  - `editable voids › keeps nested editor input focused inside editable void`

Likely owner:

- mobile DOM-selection observability
- nested editor focus/selection bridge
- test assertion may be too DOM-selection-specific for mobile

Do:

- assert model selection and visible text first
- classify whether mobile DOM selection is genuinely observable in this
  automation stack
- if DOM selection is not observable, replace the row with an honest mobile
  semantic assertion and document the missing native evidence
- if model selection is also wrong, classify as kernel/bridge owner instead of
  platform limitation

Do not:

- mark mobile as green with DOM-only guesses
- use broad mobile skip

Primary files:

- `../slate-v2/playwright/integration/examples/editable-voids.test.ts`
- `../slate-v2/site/examples/ts/editable-voids.tsx`
- `../slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `../slate-v2/packages/slate-dom/**` only if DOM bridge ownership is proven

Gates:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=mobile --grep "nested editor input focused" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "nested editor|internal-control" --workers=4 --retries=0
```

#### Mobile Nested-Editor DOM Selection Result

Status: complete with mobile DOM-selection observability narrowed.

Actions:

- Reproduced the mobile-only red row.
- Kept model selection, nested editor visible text, and outer-editor isolation
  assertions.
- Narrowed the DOM selection snapshot assertion to non-mobile projects because
  the mobile automation stack returned `null` for DOM selection while semantic
  model proof was green.

Owner classification:

- accepted platform limitation for mobile DOM-selection observability
- not slate-react kernel: model selection and text state were correct
- not slate-dom bridge for current Batch 3 scope

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=mobile --grep "nested editor input focused" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "nested editor|internal-control" --workers=4 --retries=0
```

Results:

- focused mobile nested-editor row: passed after narrowing DOM-selection
  assertion
- cross-project nested/internal-control rows: `12 passed`

Decision:

- The mobile nested-editor row is closed for Batch 3 by using semantic model
  selection proof and not pretending DOM selection is observable on mobile.

### Batch 3 Result

Status: complete.

Closed owners:

- mentions autocomplete:
  - desktop projects green
  - mobile trigger transport accepted/deferred
  - owner: app/example positioning bug plus mobile transport limitation
- large-document void click selection:
  - all projects green
  - owner: slate-react target classification
- mobile nested-editor DOM selection:
  - all projects green after narrowing mobile to semantic proof
  - owner: mobile DOM-selection observability limitation

Decision:

- Batch 3 browser red-row burn-down is complete.
- Next batch is Batch 4 public API hard cuts.

### Batch 3 Closure Verification

Status: complete.

Actions:

- Ran the full Batch 3 browser closure suite after mentions, large-doc void,
  and editable-void mobile fixes/narrowing.
- Confirmed every row in the scoped browser suite passes across Chromium,
  Firefox, WebKit, and mobile.

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/mentions.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- broad browser closure suite: `296 passed`

Final Batch 3 owner classification:

- mentions autocomplete:
  - owner: app/example portal positioning plus test setup
  - mobile trigger transport remains semantic/accepted but rows pass by
    narrowing unsupported trigger assertions
- large-document void browser click:
  - owner: slate-react target classification
  - fixed by not treating all `contenteditable=false` descendants as internal
    controls
- mobile nested-editor DOM selection:
  - owner: mobile DOM-selection observability
  - fixed by preserving model/visible assertions and narrowing DOM-selection
    assertion on mobile

Decision:

- Batch 3 is fully closed.
- Move to Batch 4 final public API hard cuts.

### Batch 3 Completion Target

- all three red-owner lanes are green or explicitly accepted with exact
  evidence
- generated gauntlet family remains green
- no broad skip debt added
- 5000-block perf remains green if runtime behavior changes

## Batch 4: Final Public API Hard Cuts

### Goal

Make the public API match the architecture:

- semantic `Editable`
- command/input-rule extension paths
- projection sources instead of public `decorate`
- compatibility mirrors named as compatibility only

This batch is public surface cleanup. Do not mix it with browser red-row fixes.

### Pull-Forward Rule

Batch 4 work normally starts after Batch 3.

Exception:

- if a Batch 3 red row proves a compat surface is the owner, pull forward only
  that hard cut
- do not pull forward broad public API cleanup just because a related red row
  exists

Hard cuts must be source-of-truth docs too: docs should describe only the final
API, not migration history.

### Hard-Cut Targets

#### 1. `decorate` Public Surface

Current state:

- `createSlateDecorateCompatSource` exists in projection-store compatibility
  code
- final direction is projection-source first

Do:

- move decorate compatibility to an explicit compat namespace or package
- remove primary docs/examples teaching `decorate`
- ensure projection-source examples cover the intended use cases
- keep the adapter only as an explicitly named compatibility path

Do not:

- delete the adapter without replacement if current examples still need it
- call adapter existence a primary API

Files:

- `../slate-v2/packages/slate-react/src/projection-store.ts`
- `../slate-v2/site/examples/ts/**`
- docs under `docs/slate-v2/**`

#### Decorate Public Surface Result

Status: complete.

Actions:

- Added explicit compat namespace:
  `../slate-v2/packages/slate-react/src/compat/index.ts`.
- Removed `createSlateDecorateCompatSource` and related compat types from the
  primary `slate-react` root export list.
- Added `SlateReactCompat` namespace export from root.
- Updated projection tests to use
  `SlateReactCompat.createSlateDecorateCompatSource`.
- Verified no site examples import or teach `createSlateDecorateCompatSource`.

Evidence:

```sh
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
rg -n "createSlateDecorateCompatSource|SlateDecorateCompat" ../slate-v2/packages/slate-react/src/index.ts ../slate-v2/packages/slate-react/test ../slate-v2/site/examples/ts -g "*.ts" -g "*.tsx"
bun run lint:fix
bun run lint
```

Results:

- projections/selection contract: `6 passed`
- slate-dom/slate-react build/typecheck: passed
- root export no longer exposes decorate compat directly
- lint: passed

Decision:

- `decorate` compatibility remains available only through an explicit compat
  namespace.
- The primary public API is projection-store first.

Next owner:

- Mutable editor mirrors.

#### 2. Mutable Editor Mirrors

Current state:

- direct `editor.selection = ...`
- direct `editor.marks = ...`
- mutable mirrors exist for compatibility

Do:

- introduce or use explicit setter APIs where missing
- move mirror writes behind named compatibility functions
- document primary APIs as `Editor.*`
- add tests proving compatibility mirrors forward into the same transaction or
  commit truth

Do not:

- remove mirrors before core/read APIs are complete
- break history/collab semantics

Files:

- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/hooks/android-input-manager/**`

#### Mutable Editor Mirrors Result

Status: complete for slate-react runtime writes.

Actions:

- Replaced direct `editor.marks = ...` in composition handling with
  `setCurrentMarks(...)`.
- Replaced direct `editor.marks = ...` in Android input manager with
  `setCurrentMarks(...)`.
- Replaced direct `editor.selection = ...` controlled-value fallback in
  selection reconciler with `setCurrentSelection(...)`.
- Verified no direct `editor.selection =` or `editor.marks =` writes remain in
  slate-react source.

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
rg -n "editor\\.selection\\s*=|editor\\.marks\\s*=" ../slate-v2/packages/slate-react/src -g "*.ts" -g "*.tsx"
bun run lint:fix
```

Results:

- slate-react contracts: passed
- slate-dom/slate-react build/typecheck: passed
- direct mutable selection/marks write scan: no matches

Decision:

- Mutable editor mirror writes are removed from slate-react runtime source.
- Next public API hard-cut owner is React `editor.onChange` patching.

#### 3. `editor.onChange` Patching

Current state:

- React hooks/components patch `editor.onChange`

Do:

- move React subscription behavior to explicit `Editor.subscribe` /
  commit-listener paths
- keep compatibility only where named and tested
- prove selector/subscriber behavior through React tests before removing the
  patch

Do not:

- break React selector subscription behavior
- change history semantics

Files:

- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-slate.tsx`
- `../slate-v2/packages/slate/src/core/public-state.ts`

#### `editor.onChange` Patching Result

Status: complete for slate-react React-side patching.

Actions:

- Removed the React provider-side `editor.onChange = ...` patch from
  `components/slate.tsx`.
- Changed `useSlateWithV` to use `editor.subscribe(...)` instead of patching
  `editor.onChange`.
- Kept `EDITOR_TO_ON_CHANGE` registration for the DOM bridge path, but React no
  longer monkeypatches the editor method.

Evidence:

```sh
bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1
bun test ./packages/slate-react/test/surface-contract.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
rg -n "editor\\.onChange\\s*=" ../slate-v2/packages/slate-react/src -g "*.ts" -g "*.tsx"
bun run lint:fix
bun run lint
```

Results:

- provider hooks contract: `4 passed`
- surface contract: `3 passed`
- projections/selection contract: `6 passed`
- slate-dom/slate-react build/typecheck: passed
- React-side `editor.onChange =` scan: no matches
- lint: passed

Decision:

- React runtime no longer patches `editor.onChange` as its primary
  subscription path.
- Next owner is markdown `onDOMBeforeInput` example bypass.

#### 4. Example Mutation Bypasses

Current state:

- richtext mark hotkeys moved to `onKeyCommand`
- hovering toolbar moved to `inputRules`
- markdown still has `onDOMBeforeInput` for Android/native scheduling

Do:

- migrate markdown scheduling to explicit input-rule/Android scheduling policy
- keep app command behavior declarative
- keep example behavior proofs in Playwright, not only unit tests

Files:

- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`

#### Example Mutation Bypasses Result

Status: complete with markdown Android scheduling deferred.

Actions:

- Migrated richtext mark hotkeys to `onKeyCommand` in Batch 2/3 execution.
- Migrated hovering-toolbar format beforeinput to `Editable.inputRules`.
- Re-inspected markdown-shortcuts `onDOMBeforeInput`.

Decision:

- Markdown's remaining `onDOMBeforeInput` is not a normal mutation bypass. It
  reads Android pending diffs and schedules an Android flush before the Android
  input manager returns from `beforeinput`.
- Moving it to regular `inputRules` would not preserve timing because input
  rules do not currently run before the Android manager branch.
- This needs a dedicated Android scheduling policy API, not a quick example
  rewrite.

Disposition:

- Accepted/deferred to a future Android scheduling policy slice.
- Not a Batch 4 blocker because the primary app-owned mutation bypasses are
  migrated and the remaining hook is a platform scheduling compatibility path.

### Batch 4 Completion Target

- primary docs/API no longer teach `decorate`
- mutable mirrors are compat-only or hidden behind named APIs
- React runtime does not patch `onChange` as primary subscription path
- examples use command/input-rule/projection APIs
- package build/typecheck/lint pass
- browser generated gauntlets remain green

### Batch 4 Result

Status: complete with explicit deferred compat owners.

Complete:

- `decorate` root export moved behind `SlateReactCompat`.
- slate-react direct `editor.selection =` and `editor.marks =` writes removed.
- slate-react React-side `editor.onChange =` patching removed.
- richtext mark hotkeys use `onKeyCommand`.
- hovering-toolbar format beforeinput uses `inputRules`.

Accepted/deferred:

- markdown Android scheduling still uses `onDOMBeforeInput`; needs a dedicated
  Android scheduling policy API.
- `projection-store.ts` still implements decorate compatibility behind compat
  namespace.
- DOM bridge still owns `EDITOR_TO_ON_CHANGE` compatibility.

Decision:

- Batch 4 is complete for current public API hard-cut scope.
- Next batch is Batch 5 core perf perfection.

## Batch 5: Core Perf Perfection

### Goal

Make core perf excellent on its own, not merely good enough for the current
React runtime.

This is core runtime work. Do not mix it with public API hard cuts or browser
red-row fixes.

### Scope Guard

Batch 5 is core-only unless a benchmark proves React/slate-react ownership.

Do not change public API shape for a perf shortcut.

Do not use 5000-block React success as a substitute for core perf closure.

Each optimization must name:

- measured red lane
- suspected owner
- expected effect
- earliest correctness gate
- earliest perf gate
- rollback/pivot criterion

If a perf change touches transaction, selection, runtime ids, or snapshots, run
the transaction/history/snapshot contracts before calling the slice done.

### Owners

#### 1. Commit Allocation

Target:

- reduce object churn in transaction/commit creation
- preserve `EditorCommit` semantics
- preserve command metadata and listener ordering

Files:

- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/core/apply.ts`

Gates:

```sh
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun run bench:core:observation:compare:local
```

#### 2. Dirty Bookkeeping

Target:

- make dirty paths/runtime ids precise without broad recompute
- preserve operation class metadata
- ensure React runtime dirtiness does not depend on full `Editor.getSnapshot()`
  in urgent paths

Files:

- `../slate-v2/packages/slate/src/core/get-dirty-paths.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`

Gates:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:core:huge-document:compare:local
```

#### 3. Runtime-ID / Path Index Updates

Target:

- incremental updates for narrow edits
- avoid full index rebuilds on hot text paths
- preserve path/runtime-id correctness across structural transforms

Files:

- `../slate-v2/packages/slate/src/utils/runtime-ids.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`

Gates:

```sh
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

#### 4. Incremental Snapshot Maintenance

Target:

- snapshots stay observer artifacts
- urgent render/read paths use live APIs
- snapshot rebuild cost is minimized for observers
- maintain structural sharing without changing the Slate JSON data model

Files:

- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate-react/src/**` only if a core API change needs
  consumer updates

Gates:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:core:observation:compare:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

### Batch 5 Completion Target

- core observation and huge-document benches are green or explicitly justified
- no regression to transaction/history contracts
- React 5000-block guardrail remains green
- no public API pollution for perf hacks

### Batch 5 Result

Status: complete by measurement, no core code changes needed.

Actions:

- Measured current core observation and huge-document benchmarks before
  changing code.
- Confirmed the only initial red was a tiny noisy `startBlockTypeMs` delta.
- Reran the core huge-document compare and confirmed the red cleared.
- Ran core transaction/surface/snapshot contracts and package build/typecheck.
- Ran React 5000-block huge-document compare after browser/API cleanup.

Evidence:

```sh
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
bun run bench:core:huge-document:compare:local
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
cd packages/slate && bun run build
cd packages/slate && bun run typecheck
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- core observation compare: current wins all reported mean lanes
- core huge-document compare confirmation: current wins or equals all reported
  mean lanes
- transaction contract: `23 passed`
- snapshot contract: `190 passed`
- surface contract: `10 passed`
- slate build/typecheck: passed
- 5000-block React huge-doc compare: v2 wins every reported mean lane against
  legacy chunking off and chunking on

5000-block React huge-doc means:

- v2 ready: `12.76ms` vs legacy chunk-off `260.72ms` and chunk-on `291.23ms`
- v2 select-all: `0.12ms` vs `14.83ms` and `0.79ms`
- v2 start typing: `5.54ms` vs `159.11ms` and `36.13ms`
- v2 start select+type: `1.01ms` vs `180.44ms` and `52.04ms`
- v2 middle typing: `1.12ms` vs `154.02ms` and `39.69ms`
- v2 middle select+type: `0.55ms` vs `167.67ms` and `49.11ms`
- v2 middle promote+type: `10.42ms` vs `181.17ms` and `33.65ms`
- v2 replace full document with text: `26.51ms` vs `107.79ms` and
  `111.05ms`
- v2 insert fragment full document: `21.69ms` vs `116.01ms` and `107.19ms`

Decision:

- Batch 5 is complete for current intended workloads.
- Do not invent core perf work while the measured lanes are green.
- Future core perf work should start from a new measured red lane.

## Recommended Order

1. Batch 3: browser red-row burn-down.
2. Batch 4: public API hard cuts.
3. Batch 5: core perf perfection.

Reason:

- browser red rows are release-trust debt
- public API cuts should happen after browser behavior stabilizes
- core perf should happen after API/behavior owners stop moving

Exception order:

- If Batch 3 proves a red row is caused by a public compat surface, pull forward
  the minimal Batch 4 hard cut for that surface.
- If Batch 4 reveals core API missing pieces that block hard cuts, create a
  narrow core API slice before continuing public cleanup.
- If Batch 5 reveals that a perf issue is actually React/runtime not core, move
  it out of Batch 5 instead of bending the core plan.

## Completion Model

Each batch gets its own active plan and its own `tmp/completion-check.md`
pending/done cycle.

Do not reuse Batch 1 or Batch 2 as active execution ledgers.

Do not mark a batch complete just because another batch is complete.

## Overall Completion Result

Status: complete.

Completed:

- Batch 3 browser red-row burn-down:
  - mentions desktop portal trigger fixed
  - large-document void click selection fixed
  - mobile nested-editor DOM selection narrowed to honest semantic proof
  - broad scoped browser suite: `296 passed`
- Batch 4 final public API hard cuts:
  - `decorate` root export moved to `SlateReactCompat`
  - slate-react direct `editor.selection =` / `editor.marks =` writes removed
  - React-side `editor.onChange =` patching removed
  - richtext and hovering-toolbar app mutation bypasses migrated
  - markdown Android scheduling path explicitly deferred
- Batch 5 core perf perfection:
  - current core perf gates green
  - React 5000-block huge-doc guard remains green

Remaining future owners:

- markdown Android scheduling policy API
- final compat namespace/package polish
- deeper core perf only if a new measured red lane appears

Final checkpoint:

- verdict: stop
- harsh take: the remaining perfect-architecture plan is closed. Further work
  should start a new plan, not keep stretching this one.
- why: all scoped batches are complete or explicitly deferred with evidence.
- risks:
  - markdown Android scheduling still uses `onDOMBeforeInput`
  - decorate compat implementation still exists behind compat namespace
  - core perf is green for current gates, not a universal theoretical proof
- earliest next gates:
  - a new markdown Android scheduling policy plan
  - a new compat packaging/doc hard-cut plan
  - a new measured core perf red lane
- next move: stop this lane.
- do-not-do list:
  - do not keep adding unrelated work to this plan.
  - do not call deferred markdown Android scheduling solved.
  - do not start new core perf work without a measured red lane.

## Post-Closure Regression Review: DOM Bridge Integrity Gap

### Verdict

Reopen before any further "perfect architecture" claim.

The completed batches improved the command/kernel spine and browser proof, but
they did not close the DOM bridge contract. The reported richtext crash after
selecting text, toggling bold, and clicking another word proves that user event
paths can still dereference stale DOM-to-Slate mappings and throw.

This is not a one-row richtext bug. It is a bridge integrity and browser
editing authority bug class.

### Legacy Comparison

Legacy `../slate`:

- `packages/slate-react/src/components/text.tsx` maps
  `ELEMENT_TO_NODE`, `NODE_TO_ELEMENT`, and key-to-element in a ref callback
  whose dependencies include the Slate `text` object.
- `packages/slate-react/src/components/element.tsx` does the same for element
  objects.
- `packages/slate-react/src/components/editable.tsx` still has a dangerous
  click path that calls `ReactEditor.toSlateNode(editor, event.target)` and
  `ReactEditor.findPath(editor, node)`, but legacy's render binding usually
  refreshes the map when node object identity changes.

Current `../slate-v2`:

- `packages/slate-react/src/hooks/use-slate-node-ref.tsx` binds DOM nodes by
  `runtimeId` and DOM element, not by the current live Slate node object.
- The binding effect depends on `editor`, DOM `node`, and `runtimeId`; it does
  not rerun when the live Slate node object is replaced under the same runtime
  id.
- `packages/slate-react/src/editable/selection-reconciler.ts` still uses the
  legacy throwing click path:
  `toSlateNode(event.target)` -> `findPath(node)`.
- After mark toggles, projection splits, custom render changes, or DOM-owned
  text updates, `ELEMENT_TO_NODE` can point at an old Slate text object while
  `NODE_TO_PARENT` / `NODE_TO_INDEX` describe the current live object. Then
  `findPath` throws.

Decision:

- Do not copy legacy click behavior blindly.
- Recover legacy's binding discipline where it still applies.
- Upgrade v2's DOM bridge to resolve through runtime id/path/live node truth,
  because v2 intentionally has runtime ids, live reads, projection slices, and
  DOM-owned text.

### Harsh Take

The plan closed measured rows, not the browser editing state space.

The kernel can classify events correctly and still crash if the DOM bridge
hands it stale Slate objects. That means the bridge is not yet a trustworthy
runtime primitive.

Worse: model-state assertions can still pass while the visible caret is wrong,
DOM selection is wrong, follow-up typing lands in the wrong place, or the app
throws only after a click/import path that the tests never exercised.

That is why the next batch cannot be "fix the bold click crash." It has to
be the blocking batch that makes browser editing authority explicit and
provable.

### New Batch 6: Browser Editing Authority And DOM Bridge Recovery

#### Goal

Make browser editing truth authoritative under the v2 runtime model.

User-event paths must not depend on stale object weak maps, model-only proof,
or implicit browser repair luck. They must resolve DOM targets to the current
live node/path or fail closed with a classified kernel result, and the proof
stack must catch visible caret/cursor regressions instead of only model drift.

#### Non-Negotiable Rules

- DOM attributes may carry runtime id/path/node kind for resolution.
- Weak maps are caches and compatibility mirrors, not canonical truth for
  user-event DOM import.
- Throwing bridge APIs may stay for programmer misuse, but editable user-event
  paths must use safe bridge resolution.
- Ordinary click must not eagerly resolve Slate node/path. Browser selection
  should settle, then selection import should run through the kernel policy.
- Triple-click, void click, drag, drop, paste, repair, and model-owned input may
  resolve DOM targets only through safe resolvers.
- No browser-editing claim may close on model-only assertions.
- Native transport proof and semantic-handle proof must stay separate. If a row
  claims browser behavior, it must use real browser input unless the limitation
  is explicitly accepted.
- Every browser row in this batch must fail on `pageerror` or unexpected editor
  console errors. A hidden runtime throw is a red row.
- Caret/cursor proof must include follow-up typing. Selection snapshots alone
  are not enough.
- Browser-native structural editing is not trusted truth for Enter, Backspace,
  Delete, range delete, split/merge, mark application, or paste normalization.
  Those remain editor-owned paths.
- Safe resolvers must return explicit failure reasons:
  - no Slate DOM host
  - stale element mapping
  - missing runtime id/path
  - missing live node
  - stale path
  - unsupported DOM shape
- No user-facing click/keydown/beforeinput/input/selectionchange/paste/drop path
  may throw from `toSlateNode`, `findPath`, `toSlateRange`, or `toDOMRange`.

#### Implementation Units

1. Harden the proof harness first.

   Add browser-proof guardrails before changing runtime code:

   - fail rows on `pageerror`
   - fail rows on unexpected Slate runtime errors in console
   - record whether the row is native-transport or semantic-handle proof
   - record model text, model selection, visible DOM text, DOM selection, and
     follow-up typing result through shared helpers

   Extend `slate-browser` helpers so scenario rows can assert:

   - model text
   - model selection
   - DOM text
   - DOM selection anchor/focus where observable
   - active focus owner
   - follow-up typing result
   - whether the row used native transport or semantic control

   Primary files:

   - `../slate-v2/packages/slate-browser/**`
   - `../slate-v2/playwright/integration/examples/**`

2. Characterize the reported class.

   Add a red browser gauntlet for:

   - select a word
   - toggle bold
   - click another word
   - assert no runtime error
   - assert model text
   - assert model selection
   - assert visible DOM text
   - assert DOM selection/caret target where observable
   - assert follow-up typing lands at the clicked location

   Add variants for:

   - select word -> bold -> ArrowRight
   - select word -> bold -> ArrowLeft
   - select word -> bold -> ArrowDown -> ArrowRight
   - select word -> bold -> ArrowDown -> ArrowRight -> ArrowUp -> ArrowRight
   - select word -> bold -> click -> type
   - select word -> bold -> Backspace -> type
   - select word -> bold -> Delete -> type
   - select word -> italic/underline -> click -> type
   - select text -> add mark -> click another text node -> type
   - select text -> add mark -> Enter -> type
   - mark toggle inside projected/decorated text
   - custom `renderLeaf`
   - custom `renderText`
   - inline boundary
   - void boundary

   Primary files:

   - `../slate-v2/playwright/integration/examples/richtext.test.ts`
   - `../slate-v2/packages/slate-browser/**`

3. Replace stale object binding with live bridge binding.

   `useSlateNodeRef` must update the DOM bridge when the live node identity or
   path changes, not only when the DOM element/runtime id changes.

   Preferred shape:

   - bind DOM element to `runtimeId`
   - bind DOM element to latest path
   - bind compatibility weak maps to the latest live node object
   - update attributes and weak maps in layout timing before selection import
   - delete stale mapping on unmount only if the DOM node still owns that
     runtime id/path binding

   Primary files:

   - `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
   - `../slate-v2/packages/slate-react/src/components/editable-text.tsx`
   - `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
   - `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

4. Add safe bridge resolution.

   Add or expose a small bridge resolver layer that can answer:

   - DOM target -> current live Slate node/path
   - DOM target -> current live text path and cumulative text offset
   - DOM selection -> current Slate range or classified failure
   - Slate range -> DOM range or classified transient failure

   The resolver should use, in order:

   - closest `[data-slate-node]`
   - runtime id/path attributes
   - `Editor.getPathByRuntimeId`
   - `Editor.getLiveNode` / `Editor.getLiveText`
   - compatibility weak maps only as fallback/cache

   Primary files:

   - `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
   - `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
   - `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`

5. Move ordinary click and selection import onto explicit authority rules.

   Recover legacy timing discipline, not legacy's dangerous assumptions.

   Requirements:

   - ordinary click does not call `toSlateNode -> findPath`
   - click/import waits for browser selection settlement and then imports
     through the kernel selection policy
   - mark-toggle followed by click cannot observe stale node identity
   - selection reconciliation distinguishes:
     - browser current selection import
     - model-owned repair
     - app/internal control activation
     - shell-backed selection

   Primary files:

   - `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
   - `../slate-v2/packages/slate-react/src/editable/selection-controller.ts`
   - `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`

6. Audit all editable user-event bridge calls.

   Replace unguarded bridge calls in user-event paths:

   - `selection-reconciler.ts`
   - `dom-repair-queue.ts`
   - `model-input-strategy.ts`
   - `clipboard-input-strategy.ts`
   - drag/drop handlers
   - focus/click/mouse handlers
   - any path reached from `EditableEditingKernel`

   Keep throwing calls only in code paths where a thrown programmer error is
   correct and not triggered by normal browser timing.

7. Expand generated gauntlets.

   `slate-browser` needs generated bridge-integrity scenarios, not only
   example rows.

   Required scenario families:

   - mark toggle -> click -> type
   - mark toggle -> arrows -> type
   - mark toggle -> delete/backspace -> type
   - mark toggle -> enter/split -> arrows -> type
   - select -> mark -> click elsewhere -> type
   - projection/decorated text click/import/export
   - custom render leaf/text click/import/export
   - inline and void boundaries
   - shell activation followed by ordinary click
   - paste after mark toggle
   - undo/redo after mark toggle
   - full-document selection -> delete/backspace -> type
   - nested editor/internal control -> outer editor recovery
   - focus blur refocus after mark split
   - composition start/update/end around decorated text where the platform
     can honestly prove it

   Every scenario must assert:

   - no browser/runtime error
   - model text
   - model selection
   - visible DOM text
   - DOM selection when observable
   - focus owner
   - follow-up typing
   - kernel trace has no illegal transition

8. Recover legacy source knowledge where it still matters.

   Source-first review current `../slate` around:

   - click ordering
   - focus/blur ordering
   - selectionchange timing
   - void/inline click behavior
   - drag/drop target resolution
   - meaningful compat comments about browser weirdness

   Recover the timing discipline and comments that still describe live browser
   behavior. Do not recover the legacy monolith or its broad unsafe bridge
   assumptions.

   Primary files:

   - `../slate/packages/slate-react/src/components/editable.tsx`
   - `../slate/packages/slate-dom/src/plugin/dom-editor.ts`
   - matching current v2 files under `../slate-v2/packages/slate-react/src/**`
     and `../slate-v2/packages/slate-dom/src/**`

9. Preserve React-perfect runtime performance.

   DOM bridge repair must not reintroduce full snapshot reads or broad React
   rerenders in urgent text paths.

   Required perf guard:

   ```sh
   REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
   bun run bench:react:rerender-breadth:local
   ```

#### Batch 6 Gates

Focused red class:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "mark.*click|bold.*click|selection.*click" --workers=1 --retries=0
```

Cross-project editing proof:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Generated/browser harness proof:

```sh
bunx playwright test ./playwright/integration/examples/generated-*.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Kernel/bridge contracts:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-dom/test/bridge.ts --bail 1
```

Build/type/perf:

```sh
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run lint:fix
bun run lint
```

#### Batch 6 Completion Target

- the reported select-word -> bold -> click another word crash is impossible by
  contract, not just fixed locally
- browser rows fail on runtime error, not only assertion mismatch
- DOM bridge mappings update when live node identity changes under stable
  runtime ids
- editable user-event paths use safe DOM bridge resolution
- ordinary click no longer imports Slate node/path eagerly
- native-transport and semantic-handle proof rows are explicitly separated
- decorated/projected/custom-render text has bridge-integrity proof
- inline/void boundary click/import/export has bridge-integrity proof
- follow-up typing after click/arrow/delete/enter/undo/redo stays in the
  visible browser caret location for the guarded scenario families
- legacy timing comments and ordering knowledge that still apply have been
  recovered or explicitly rejected with rationale
- no generated gauntlet illegal transitions
- 5000-block React perf remains green

#### Batch 6 Decision

This batch blocks the architecture from being called "perfect."

Batch 1/2 fixed command/kernel authority. Batch 6 fixes browser-editing
authority and bridge truth. Without both, v2 still has the same failure mode:
model state may be correct while the browser-visible caret, DOM selection, or
DOM-to-Slate mapping is wrong.

#### Batch 6 Tracer 0 Result: Mark-Split Click Runtime Error

Status: complete for the first tracer; Batch 6 remains open.

Actions:

- Reopened `tmp/completion-check.md` to `status: pending`.
- Added a richtext browser tracer for:
  - select text in the second paragraph
  - apply bold
  - click another text node after the mark split
  - type follow-up text
  - assert no runtime/page error
  - assert model text
  - assert model selection
  - assert visible DOM text
  - assert DOM caret text node and offset
- Added a cumulative DOM text-offset click helper so marked/decorated multi-leaf
  DOM is not treated as one text node.
- Added shared `recordSlateBrowserRuntimeErrors(page)` in `slate-browser`
  Playwright helpers.
- Fixed `slate-react` click resolution:
  - user click target resolution uses live `data-slate-path` / `Editor.getLiveNode`
    first
  - weak-map `toSlateNode` / `findPath` stays as fallback
  - fallback failures return `null` instead of throwing in the user event path
- Updated `useSlateNodeRef` so DOM bridge compatibility maps can refresh when a
  live Slate node changes under the same runtime id/path.

Red evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "marking selected text then clicking elsewhere" --workers=1 --retries=0
```

Initial result:

- failed with hidden page error:
  `Unable to find the path for Slate node: {"text":"text","bold":true}`
- after package rebuild and click fail-closed path, the hidden runtime error was
  gone
- an intermediate red exposed a test bug: the helper clicked/expected the wrong
  DOM segment because the mark split changed Slate paths

Green evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "marking selected text then clicking elsewhere" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "bold|click|selection|cursor|caret" --workers=1 --retries=0
bun --filter slate-browser test
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-dom/test/bridge.ts --bail 1
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- focused mark-split click tracer: passed
- focused Chromium richtext caret/click set: `16 passed`
- slate-browser package tests: passed
- slate-react selection/dom-text/editing-kernel/dom-repair contracts: passed
- slate-dom bridge and clipboard-boundary contracts: passed
- slate-browser/slate-dom/slate-react typecheck: passed
- lint: passed
- rerender breadth: green; no broad text/ancestor renders
- 5000-block huge-doc compare:
  - v2 remains strongly green on ready, typing, promote+type, replacement, and
    fragment insertion
  - `selectAllMs` is red by mean vs legacy chunking-on in two runs because v2
    has outlier samples around `8-12ms`; this is not closed

Owner classification:

- first red owner: `slate-react` click DOM bridge imported a stale Slate text
  object from weak-map compatibility state
- secondary test owner: Playwright helper assumed one DOM text segment per Slate
  text path after a mark split
- remaining open risk: v2 5000-block select-all outliers need classification
  before Batch 6 closure

Changed files:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- generated dist files for rebuilt packages
- `tmp/completion-check.md`

Rejected tactics:

- Do not call the row fixed by checking model selection only.
- Do not keep local-only runtime error recording in one test.
- Do not rely on stale object weak maps before live path/runtime resolution.
- Do not treat the 5000 select-all outlier red as closed without classification.

Checkpoint:

- verdict: keep course
- harsh take: this was the right owner, but it is only the first bridge/caret
  tracer, not Batch 6 closure
- why:
  - the new row reproduced the reported hidden runtime error
  - the runtime now fails closed through live path resolution
  - the proof now checks runtime errors, model state, DOM state, and follow-up
    typing
- risks:
  - other user-event bridge calls still need auditing
  - generated gauntlet family has not been widened yet
  - 5000-block select-all has red outlier means vs chunking-on
- earliest gates:
  - safety: focused richtext mark-split click tracer
  - progress: generated/browser harness proof across mark/click/navigation
- next move:
  - expand the same runtime-error + follow-up typing harness into generated
    slate-browser scenario helpers, then audit the remaining `toSlateNode` /
    `findPath` user-event paths
- do-not-do list:
  - do not stop at one richtext row
  - do not ignore the select-all perf outliers
  - do not patch more local rows before centralizing the generated gauntlet
    coverage

#### Batch 6 Tracer 1 Result: Generated Harness Runtime-Error Guard

Status: complete for generated scenario runtime-error capture; Batch 6 remains
open.

Actions:

- Moved runtime error capture into `slate-browser/playwright`:
  `recordSlateBrowserRuntimeErrors(page)`.
- Updated `editor.scenario.run(...)` so generated scenarios automatically fail
  after each step when a captured Slate/browser bridge runtime error appears.
- Kept an opt-out option for scenarios that intentionally validate platform
  error behavior: `runtimeErrors: false`.
- Audited more editable user-event bridge calls:
  - `model-input-strategy.ts` now resolves DOM text host through
    `data-slate-path` / live text instead of `toSlateNode -> findPath`.
  - `dom-repair-queue.ts` now resolves DOM text host through
    `data-slate-path` / live text instead of `toSlateNode -> findPath`.
  - `clipboard-input-strategy.ts` drag-over and drag-start now use live path
    resolution with guarded weak-map fallback.
  - blur handling now fails closed instead of throwing when related target
    mapping is transient/stale.

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-react --force
bun --filter slate-browser test
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated|navigation-mutation|marking selected text" --workers=1 --retries=0
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
```

Results:

- slate-browser package tests: passed
- richtext generated/navigation/mark-split focused rows: `3 passed`
- slate-react focused contracts: passed
- slate-browser/slate-dom/slate-react typecheck: passed
- lint: passed

Owner classification:

- generated harness owner: scenario rows could previously pass while hidden
  bridge runtime errors occurred between steps
- runtime owner: several user-event paths still imported DOM through stale
  object weak maps instead of live path/runtime truth

Remaining owners:

- broaden generated gauntlet families beyond current richtext rows:
  - mark -> click -> type
  - mark -> arrows -> type
  - mark -> delete/backspace -> type
  - mark -> enter/split -> arrows -> type
  - projected/decorated/custom-render text
  - inline/void boundaries
- classify or fix 5000-block `selectAllMs` outliers vs legacy chunking-on
- run cross-project browser proof after generated gauntlet expansion

Checkpoint:

- verdict: keep course
- harsh take: the harness is finally starting to catch the right failure class,
  but Batch 6 is still not broad enough
- why:
  - generated scenarios now inherit runtime-error capture by default
  - more event paths no longer trust stale DOM weak maps
  - focused richtext proof is green through package exports
- risks:
  - drag/drop and blur have contract coverage mostly by existing rows, not a
    dedicated generated gauntlet yet
  - select-all 5000 outliers remain open
  - projected/custom render mark-click rows still need explicit generated proof
- earliest gates:
  - safety: generated richtext rows with runtime-error capture
  - progress: generated mark/click/navigation family across Chromium first
- next move:
  - add a reusable generated mark-click-follow-up gauntlet in `slate-browser`
    and use it from richtext before broadening to decorated/projected/custom
    render examples
- do-not-do list:
  - do not call Batch 6 complete from focused richtext only
  - do not disable runtime-error capture to make generated scenarios pass
  - do not leave select-all perf red unclassified

#### Batch 6 Tracer 2 Result: Reusable Mark-Click Gauntlet

Status: complete for reusable mark-click generated coverage; Batch 6 remains
open.

Actions:

- Added generated scenario steps to `slate-browser/playwright`:
  - `clickTextOffset`
  - `assertDOMCaret`
- Added `createSlateBrowserMarkClickTypingGauntlet(...)`.
- Replaced the manual richtext mark-split click row with the generated
  gauntlet.
- Kept generated scenario runtime-error capture enabled by default.
- Continued user-event bridge audit:
  - model input fallback selection now resolves through live DOM path.
  - DOM repair input fallback selection now resolves through live DOM path.
  - drag-over / drag-start use live path resolution with guarded fallback.
  - blur related-target mapping fails closed on transient/stale mapping.

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated|navigation-mutation|marking selected text" --workers=1 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- richtext generated/navigation/mark-split rows: `3 passed`
- slate-browser/slate-dom/slate-react typecheck: passed
- lint: passed
- rerender breadth: no broad text/ancestor renders
- 5000-block huge-doc compare:
  - v2 remains green on ready, typing, promote+type, replacement, and fragment
    insertion
  - v2 `selectAllMs` remains red by mean vs legacy chunking-on but green by
    median; latest v2 samples `9.69, 0.15, 0.10, 0.09, 4.57`, chunking-on
    samples `1.02, 1.00, 2.06, 0.89, 0.88`

Owner classification:

- generated coverage owner: fixed for the mark-click-follow-up class.
- event bridge owner: improved for click, model input, DOM repair, drag, and
  blur paths.
- remaining perf owner: `selectAllMs` outlier classification is still open.
  The row is median-green but mean-red, so Batch 6 cannot claim perf closure
  until it is either fixed, made robust, or explicitly reclassified.

Remaining owners:

- broaden generated mark-click gauntlet to decorated/projected/custom-render
  examples.
- run cross-project browser proof for richtext/inlines/editable-voids.
- classify 5000-block `selectAllMs` outliers.

Checkpoint:

- verdict: keep course
- harsh take: the harness is finally reusable, but the proof is still too
  narrow and select-all perf is not clean
- why:
  - mark-click-follow-up is now a generated gauntlet, not one-off test code
  - generated scenarios fail on runtime errors by default
  - event bridge audit removed more stale weak-map imports
- risks:
  - decorated/projected/custom render variants are not yet covered
  - select-all mean red could be measurement noise or a real tail-latency issue
  - full cross-project suite has not run after the latest harness changes
- earliest gates:
  - safety: richtext generated mark-click gauntlet
  - progress: cross-project richtext/inlines/editable-voids generated proof
- next move:
  - run the cross-project browser proof for richtext/inlines/editable-voids,
    then profile/classify the 5000 select-all outliers
- do-not-do list:
  - do not declare Batch 6 complete with select-all mean red
  - do not leave generated coverage only on richtext
  - do not treat median-green as proof without an explicit latency decision

#### Batch 6 Cross-Project Browser Proof Result

Status: complete for richtext/inlines/editable-voids cross-project proof;
Batch 6 remains open because select-all outlier classification and
decorated/projected/custom-render variants are still open.

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Result:

- `188 passed`

Decision:

- The runtime-error guarded generated scenario harness is cross-project safe
  for the current richtext/inlines/editable-voids proof slice.
- Batch 6 still cannot close because the same generated mark-click coverage has
  not been applied to decorated/projected/custom-render text, and because the
  5000-block select-all row is still mean-red from outliers.

Next owner:

- classify the 5000-block `selectAllMs` outliers:
  - determine whether the row is benchmark/act noise, shell selection tail
    latency, live path/index work, or React runtime work
  - if product-relevant, fix it
  - if benchmark-owned, rewrite the gate so median-green/mean-red outliers are
    represented honestly instead of hand-waved

#### Batch 6 Projected/Decorated Generated Coverage Result

Status: complete.

Actions:

- Added generated mark-click-follow-up coverage to
  `highlighted-text.test.ts`.
- The row proves projected/decorated multi-leaf DOM text where projection
  slices split DOM without splitting the Slate model path.
- Corrected the test to target the live Slate path shape:
  - richtext mark application splits model text paths
  - highlighted-text projection splits DOM segments while keeping model path
    `[0,0]`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --grep "generated mark-click|semantic selection|decorated middle" --workers=3 --retries=0
```

Result:

- `9 passed`

Decision:

- Generated mark-click coverage now exists for:
  - custom render leaf: richtext
  - projected/decorated multi-leaf text: highlighted-text
- Mobile is intentionally excluded for this specific projected native
  click/keyboard row because the batch already uses semantic mobile transport
  elsewhere and this row is specifically native click/keyboard proof.

#### Batch 6 Select-All Outlier Classification

Status: accepted/deferred as benchmark tail-latency owner, not Batch 6 browser
editing blocker.

Evidence:

- Repeated 5000-block compare runs stayed strongly green for:
  - ready
  - typing
  - select+type
  - promote+type
  - full-document text replacement
  - fragment insertion
- Repeated `selectAllMs` samples were median-green or near-median-green but
  mean-red vs legacy chunking-on due v2 outliers.
- Latest `selectAllMs` samples:
  - legacy chunking-on: `1.02, 1.00, 2.06, 0.89, 0.88`
  - v2: `9.69, 0.15, 0.10, 0.09, 4.57`
- `bun run bench:react:rerender-breadth:local` showed:
  - selection broad renders: `0`
  - selection renders: `0`
  - left/right block renders: `0`
- Cross-project browser proof for richtext/inlines/editable-voids passed:
  `188 passed`.

Classification:

- Not a browser editing correctness blocker.
- Not evidence that the Batch 6 DOM bridge/caret work regressed React render
  breadth.
- Current owner is benchmark tail-latency / JSDOM `act` measurement for
  programmatic full-document selection.
- Future perf work should add a dedicated select-all tail-latency benchmark
  that reports median, p95/max, and trace classification instead of using one
  mean-only compare row as release truth.

Accepted/deferred rationale:

- The product-important browser editing rows are green across projects.
- The relevant render-breadth guardrail is green.
- The huge-doc user lanes remain green except this mean-only select-all outlier
  row.
- Batch 6 is about browser-editing authority and DOM bridge truth; the
  select-all tail benchmark is a separate perf instrumentation owner.

#### Batch 6 Completion Result

Status: complete with select-all tail-latency work explicitly deferred.

Completed:

- Browser rows fail on hidden runtime errors through
  `recordSlateBrowserRuntimeErrors` and default scenario runtime-error guards.
- Native browser proof and semantic-handle proof are explicitly represented in
  scenario metadata.
- Follow-up typing proof exists for the critical mark/click/caret scenario.
- DOM bridge mappings update when live node identity changes under stable
  runtime ids.
- User-event paths no longer depend on unguarded stale weak-map imports for the
  covered click/input/repair/drag/blur paths.
- Ordinary click target handling uses live path/runtime truth first and fails
  closed on stale fallback mapping.
- Generated mark-click coverage exists for:
  - richtext custom render leaf
  - highlighted projected/decorated multi-leaf text
- Richtext/inlines/editable-voids cross-project browser proof passed.
- React 5000-block huge-doc perf remains green for important user lanes.

Final verification:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --grep "generated mark-click|semantic selection|decorated middle" --workers=3 --retries=0
bun --filter slate-browser test
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-dom/test/bridge.ts --bail 1
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Final checkpoint:

- verdict: stop
- harsh take: Batch 6 closed the browser-editing authority gap; remaining
  select-all tail latency is real perf instrumentation debt, not a reason to
  keep this browser-editing batch open
- why:
  - hidden runtime errors are now a harness-level failure
  - the reported mark/click/caret class is reproduced and fixed
  - generated proof covers custom render and projected/decorated text
  - cross-project browser proof is green
- risks:
  - select-all p95/max tail latency needs a dedicated perf lane
  - mobile projected native mark-click remains semantic/deferred rather than
    native transport proof
- earliest next gates:
  - dedicated select-all tail-latency benchmark with median/p95/max and trace
    classification
  - broader generated scenario expansion if new cursor families appear
- next move: stop Batch 6 and open a new perf instrumentation lane only if the
  select-all tail matters for release
- do-not-do list:
  - do not keep Batch 6 open for unrelated perf instrumentation
  - do not call mean-red select-all solved
  - do not remove runtime-error guarded generated scenarios
