# Slate v2 Editable Runtime And Root Selector Hard-Cut Plan

## Status

Done.

Execution started from `complete-plan` on 2026-04-27.

Current next owner: complete. The Editable runtime/root selector hard-cut lane
meets its closure gates.

This plan resolves the two current architecture findings:

1. `EditableDOMRoot` still owns too much hot engine policy.
2. Root render paths still use generic `useSlateSelector` and snapshot reads
   where named source selectors should own the facts.

Do not treat this as a local cleanup. This is the next React 19.2 architecture
cut. The goal is not a smaller `Editable` file for aesthetics. The goal is a
runtime-owned editing engine with React as projection and wiring.

## Source Findings

### Finding 1: `Editable` owns too much engine policy

Current hot owner:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- high-risk region: `EditableDOMRoot`, especially selectionchange,
  composition, Android input, repair, kernel trace, and force-render wiring

Observed live responsibilities still inside `EditableDOMRoot`:

- selector wakeup subscription to `Editor.getLastCommit(...)`
- `EDITOR_TO_FORCE_RENDER` registration
- composition state
- `onDOMSelectionChange` throttling
- selection import ownership classification
- event-frame creation and kernel trace recording
- DOM repair queue cancellation
- Android manager wiring
- model-selection preference mutation
- shell-backed selection state

Harsh call: this is still too much editor engine inside a React component.
React should wire refs/listeners and subscribe to runtime state. Runtime
modules should decide selection import/export, repair, composition, Android,
kernel trace, and forced view repair policy.

### Finding 2: root selectors are still too generic

Current hot owners:

- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- root selector region: top-level runtime ids, selected top-level index,
  placeholder state, large-document island plan

Observed live pattern:

- root render code uses generic `useSlateSelector`
- selector bodies read `Editor.getSnapshot(...)`
- root facts are mixed with rendering and large-document planning

Harsh call: some root-level subscription is legitimate, but the current shape
does not meet the absolute architecture bar. Named source selectors should own
root runtime ids, selected top-level index, placeholder visibility, and island
planning inputs.

## North Star

React is a projection layer.

Runtime owns hot editing policy.

Named selector sources own root render facts.

Browser proof owns regression safety.

The final shape should make these statements true:

- `EditableDOMRoot` wires root attributes, refs, listeners, and children.
- selection import/export policy lives in runtime modules, not React component
  closures.
- repair and force-render policy lives behind runtime repair/view modules.
- Android and composition quirks enter through runtime controllers.
- root render facts are exposed through named hooks/selectors, not ad hoc
  generic selector calls.
- static guards prevent broad root subscriptions and `Editable` policy creep
  from returning.

## Non-Goals

- Do not rewrite the document model.
- Do not pivot to Lexical, ProseMirror, or Tiptap.
- Do not reintroduce public mutable fields or public `Editor.getLive*`.
- Do not hide failures behind broad `forceRender()`.
- Do not change public app renderer DX unless a runtime ownership cut requires
  a hard-cut correction.
- Do not put slow generated stress in default `bun check`.
- Do not claim raw mobile proof from Playwright mobile viewport or semantic
  proxy rows.

## Target Architecture

### Runtime Modules

The runtime module graph should make ownership obvious:

- `editable/runtime-live-state.ts`
  - live node/text reads and runtime id resolution
- `editable/runtime-selection-state.ts`
  - live/model selection reads and fallback policy
- `editable/runtime-mutation-state.ts`
  - marks, target runtime, and low-level mutation wrappers
- `editable/runtime-selection-engine.ts`
  - DOM selection import/export decisions
  - selection ownership classification
  - selectionchange scheduling policy
- `editable/runtime-repair-engine.ts`
  - DOM repair queue policy
  - force-render requests
  - repair-induced selection ownership
- `editable/runtime-composition-engine.ts`
  - composition state transitions
  - native/composition abort policy
- `editable/runtime-android-engine.ts`
  - Android input manager construction and lifecycle policy
- `editable/runtime-kernel-trace.ts`
  - event-frame creation
  - trace recording
  - illegal transition assertions
- `editable/root-selector-sources.ts`
  - top-level runtime ids
  - selected top-level index
  - placeholder visibility
  - large-document mounted range facts

Names can change during implementation. Ownership cannot.

### React Component Shape

`EditableDOMRoot` should become a small wiring component:

- resolve props
- create refs
- instantiate runtime controllers
- attach listeners returned by runtime modules
- render the editable root
- expose app callbacks such as `scrollSelectionIntoView`

It should not contain:

- selection ownership branching
- DOM repair policy branching
- Android selection fallback decisions
- composition abort decisions
- force-render decisions
- direct kernel trace payload construction
- ad hoc selector predicates

### Root Selector Shape

Root render facts should have named hooks, for example:

- `useRootRuntimeIds(...)`
- `useSelectedTopLevelIndex(...)`
- `usePlaceholderVisibility(...)`
- `useLargeDocumentIslandInputs(...)`

The exact public/internal naming can change, but each source must own:

- selector body
- update predicate
- equality function
- snapshot/live-read choice
- test contract

`EditableTextBlocks` should consume these facts. It should not build them with
inline `useSlateSelector` calls.

## Execution Plan

### Phase 0: Characterization And Inventory

Purpose: avoid a blind extraction that changes browser timing.

Actions:

- Inventory all hot `EditableDOMRoot` responsibilities and classify each as:
  selection, repair, composition, Android, kernel trace, force render, root
  state, or React-only wiring.
- Inventory all `useSlateSelector` calls under `packages/slate-react/src`.
- Classify each selector as:
  public app selector, mounted node/text render selector, root source selector,
  selection selector, or tolerated broad selector.
- Add or update a static inventory guard that prints the tolerated broad
  selector list.

Acceptance:

- The plan has a concrete owner table before policy moves.
- Every remaining broad selector has a named owner and reason.
- The inventory distinguishes real runtime debt from legitimate root wiring.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Tests:

- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

### Phase 1: Extract Selectionchange Runtime Owner

Purpose: remove the largest hot policy closure from `EditableDOMRoot`.

Actions:

- Move the body of `onDOMSelectionChange` into a runtime selection engine.
- Keep React-owned refs passed in as explicit dependencies.
- Runtime selection engine returns a stable handler and scheduler contract.
- `EditableDOMRoot` wires the returned handlers; it does not construct the
  selection policy.
- Preserve current throttling/debouncing behavior before optimizing it.

Acceptance:

- `EditableDOMRoot` no longer directly calls:
  - `getEditableSelectionChangeOwnership`
  - `beginEditableEventFrame`
  - `applyEditableDOMSelectionChange`
  - `recordEditableKernelTrace`
  - `completeEditableSelectionChangeImport`
  inside the component body.
- Selection import/export browser rows stay green.
- Kernel trace tests still assert the same ownership transitions.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-runtime.ts`
- new or expanded `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`

Tests:

- `../slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`
- `../slate-v2/packages/slate-react/test/selection-controller-contract.ts`
- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.ts`
- browser rows:
  - hovering toolbar mouse selection
  - mentions inline void navigation
  - tables right-arrow boundary
  - images void navigation
  - search highlighting focus retention

### Phase 2: Extract Repair And Force-Render Runtime Owner

Purpose: make repair decisions explicit and stop leaking `forceRender` policy
through React component state.

Actions:

- Create a repair/view runtime owner around:
  - DOM repair queue lifecycle
  - repair-induced selection ownership
  - forced render requests
  - model-owned history repair
  - browser handle repair paths
- Keep `EDITOR_TO_FORCE_RENDER` only as a compatibility bridge if no direct
  replacement is possible in this slice.
- Add a static guard that all direct `forceRender()` calls in `slate-react/src`
  are owned by the repair/view runtime or an audited proof handle.
- Replace raw `forceRender` prop threading with a named repair request API
  where feasible.

Acceptance:

- `EditableDOMRoot` does not register bare `forceRender` as policy.
- Direct `forceRender()` calls are allowlisted with owners.
- Repair requests carry a reason, owner, and expected selection ownership.
- Undo, redo, model-owned insert, browser handle, and Android repair paths
  remain green.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- new or expanded `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`

Tests:

- `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/target-runtime-contract.ts`
- `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
- browser rows:
  - richtext undo/redo
  - persistent native word-delete
  - paste/normalize/undo generated stress

### Phase 3: Extract Composition And Android Runtime Owners

Purpose: isolate platform-specific editing policy from React render code.

Actions:

- Move composition state transitions behind a runtime composition engine.
- Move Android input manager construction/lifecycle behind a runtime Android
  engine.
- Keep `EditableDOMRoot` responsible for passing refs and listener handles
  only.
- Preserve existing Android and composition fallback behavior first.
- Only optimize scheduling after the behavior-preserving extraction is green.

Acceptance:

- `EditableDOMRoot` no longer owns composition abort rules.
- `EditableDOMRoot` no longer owns Android manager lifecycle policy.
- Composition, beforeinput, native input, and Android rows preserve kernel
  metadata.
- No new broad rerenders are introduced for composition status changes.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- new or expanded `../slate-v2/packages/slate-react/src/editable/runtime-composition-engine.ts`
- new or expanded `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`

Tests:

- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- generated IME/composition stress rows
- scoped mobile guard

### Phase 4: Cut Generic Root Selectors Into Named Sources

Purpose: resolve the root selector finding without inventing fake micro-hooks.

Actions:

- Create root selector source helpers for:
  - top-level runtime ids
  - selected top-level index
  - placeholder visibility
  - large-document island inputs
- Move selector body, update predicate, and equality into those source helpers.
- Keep legitimate whole-root subscriptions explicit and named.
- Add a static guard that `EditableTextBlocks` does not add new inline
  `useSlateSelector` calls without an allowlist entry.

Acceptance:

- `EditableTextBlocks` consumes named source hooks/selectors for root facts.
- Inline `useSlateSelector` calls in `EditableTextBlocks` are gone or
  explicitly allowlisted with owner comments and test coverage.
- No top-level runtime id churn.
- Placeholder behavior stays correct after type/delete/undo.
- Large-document island promotion stays stable.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- new `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Tests:

- root source selector contract for top-level ids
- root source selector contract for selected top-level index
- placeholder type/delete/undo browser row
- huge-document island render proof
- rerender breadth benchmark row if touched

### Phase 5: Static Guards And Architecture Locks

Purpose: prevent the same regression class from returning under deadline
pressure.

Actions:

- Add static guard for `EditableDOMRoot` forbidden responsibilities.
- Add static guard for root inline generic selector additions.
- Add static guard for direct `forceRender()` owners.
- Keep the existing `slate/internal` import guard.
- Extend release discipline only with fast guards, not full browser stress.

Acceptance:

- Adding a new direct hot policy branch to `EditableDOMRoot` fails a package
  contract unless it is explicitly allowlisted.
- Adding a new inline root `useSlateSelector` in `EditableTextBlocks` fails a
  package contract unless it is explicitly classified.
- Adding a direct `forceRender()` call outside repair/view owners fails a
  package contract.
- Guard names are included in release-proof discipline if they are fast and
  deterministic.

Likely tests:

- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- release proof guard list under `../slate-v2/packages/slate-browser/src/core/release-proof.ts`

### Phase 6: Browser Proof And Stress Expansion

Purpose: prove this was not just an architectural reshuffle.

Actions:

- Keep fast package contracts as the inner loop.
- Run targeted browser rows after each risky extraction batch.
- Use `test:stress` for generated operation-family rows, not default CI.
- Expand generated stress only where this plan touches ownership:
  - selectionchange import/export
  - repair-induced selectionchange
  - composition/IME
  - placeholder type/delete/undo
  - large-document shell activation
  - root selector external decoration refresh
- Record replay artifacts for any red generated row.

Acceptance:

- Focused package contracts pass.
- Focused browser rows for previously reported regressions pass.
- `test:stress` passes for the touched operation families.
- `bun check` passes.
- `bun check:full` passes before marking this plan complete.
- Any full-gate retry is recorded and rerun alone with retries disabled before
  closure.

## Implementation Order

1. Phase 0 inventory and static tracer.
2. Phase 1 selectionchange runtime extraction.
3. Phase 4 root selector sources for the least risky root facts.
4. Phase 2 repair/force-render owner extraction.
5. Phase 3 composition/Android owner extraction.
6. Phase 4 remaining root selector sources.
7. Phase 5 static guards.
8. Phase 6 full proof and closure.

Reason for this order:

- selectionchange is the highest-risk `Editable` policy owner.
- root selectors are a separate performance/DX smell and can move without
  waiting for repair extraction.
- repair and Android/composition are more timing-sensitive; move them after
  selection contracts are stable.
- static guards land after owner boundaries are real enough to enforce.

## Verification Matrix

### Fast package gates

- `slate-react` surface contracts
- selector/provider hook contracts
- selection runtime/controller contracts
- editing kernel and epoch contracts
- rendered DOM shape contracts
- release-discipline guards

### Browser regression rows

- hovering toolbar mouse selection
- mentions inline void navigation
- tables right-arrow cell boundary
- images void navigation
- search highlighting input focus
- placeholder type/delete/undo
- richtext undo/redo and native word-delete
- large-document shell activation and paste rows

### Stress lanes

- generated selection repair / IME family
- generated paste/normalize/undo family
- generated inline void boundary family
- generated block void navigation family
- generated table cell boundary family
- generated external decoration refresh family

### Release closure

- `bun check`
- `bun test:stress` scoped to touched families during iteration
- `bun check:full` before setting completion state to `done`

## Completion Definition

This plan is complete only when:

- `EditableDOMRoot` no longer owns hot selection, repair, composition, Android,
  force-render, or kernel trace policy.
- React root code only wires runtime controllers, refs, listeners, and visible
  render output.
- root render facts use named selector sources.
- broad generic root selector use is either gone or explicitly classified.
- direct force-render calls are owned by repair/view runtime or proof-only
  handles.
- static guards prevent regression of both findings.
- browser and generated stress proof for touched operation families stays
  green.
- `bun check:full` passes, with any retry investigated and recorded.

## Stop And Replan Conditions

Replan if:

- selection behavior becomes green only by broadening React rerenders.
- `forceRender()` use grows instead of shrinking.
- root selector sources duplicate large snapshot work instead of centralizing
  it.
- Android/composition extraction needs product behavior changes.
- static guards require a large allowlist to pass.
- browser rows pass while DOM selection, model selection, focus owner, or
  render counts are unasserted.

## Open Questions

- Should `slate-dom` keep direct `slate/internal` access as the DOM bridge
  owner, or should it get its own internal facade layer too?
- Should force-render requests become commit metadata, repair queue commands,
  or a separate view-runtime channel?
- Should root selector sources live under `editable/` or a new
  `runtime-sources/` folder once there are more than a few?
- Which Plate adapter row is the first migration proof after this runtime
  extraction: void/image, mention inline void, table, or marks?

## Activation Note

This plan is active.

`tmp/completion-check.md` is `pending` and points at this file.

## Execution Ledger

### 2026-04-27 Complete-Plan Activation

Actions:

- Activated this plan.
- Refreshed `tmp/completion-check.md` for the Editable runtime/root selector
  lane.
- Wrote `tmp/continue.md`.
- Started Phase 0.

Commands:

- `bun run completion-check` passed before activation while the previous lane
  was still marked done.

Artifacts:

- `tmp/completion-check.md`
- `tmp/continue.md`
- this plan

Evidence:

- Existing learnings confirm this lane must preserve model-truth public
  selectors, repair-induced model ownership, DOM-selection import before
  model-owned keydown, and runtime-owned hidden void structure.

Hypothesis:

- The safest first code slice is a static inventory/guard over hot
  `EditableDOMRoot` policy and root selector use, before moving timing-sensitive
  selection or repair code.

Decision:

- Start with Phase 0 inventory and static tracer.

Owner classification:

- Current owner is `slate-react` architecture/test guard ownership.

Changed files:

- `tmp/completion-check.md`
- `tmp/continue.md`
- `docs/plans/2026-04-27-slate-v2-editable-runtime-and-root-selector-hard-cut-plan.md`

Rejected tactics:

- Do not jump straight into selectionchange extraction without a current owner
  table and guard.
- Do not fix individual examples as the main safety net.

Next action:

- Inspect `../slate-v2/packages/slate-react` hot owner files and add/update the
  Phase 0 static inventory guard.

### 2026-04-27 Phase 0 Inventory And Static Tracer

Actions:

- Added a `useSlateSelector` ownership inventory to the `slate-react` surface
  contract.
- Added an `EditableDOMRoot` hot policy ownership inventory to the kernel
  authority audit contract.
- Added the missing `.test.ts` wrapper so the kernel authority audit actually
  runs under Vitest.
- Replaced the test-only `import.meta.dir` path root with
  `fileURLToPath(import.meta.url)`.
- Updated stale authority counts exposed by making the dead audit live.

Commands:

- `bun --filter slate-react test:vitest -- kernel-authority-audit-contract surface-contract`
  - only ran one file because those names are treated as filters.
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun lint:fix`

Artifacts:

- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.test.ts`

Evidence:

- Focused contract files pass: 2 files, 12 tests.
- `slate-react` typecheck passes.
- `bun lint:fix` reports no fixes needed.

Hypothesis:

- The next safest behavior-moving slice is Phase 1: move selectionchange policy
  into a runtime engine while preserving the exact current throttle/debounce
  and Android callback shape.

Decision:

- Phase 0 is complete.
- Continue to Phase 1.

Owner classification:

- `EditableDOMRoot` hot policy debt is now inventoried, with selectionchange
  owned next by a runtime selection engine.
- Generic root selector debt is now inventoried, with top-level ids, selected
  index, and placeholder visibility owned next by root source selectors.

Changed files:

- `tmp/completion-check.md`
- `tmp/continue.md`
- `docs/plans/2026-04-27-slate-v2-editable-runtime-and-root-selector-hard-cut-plan.md`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.test.ts`

Rejected tactics:

- Do not trust non-`.test` contract files as live guards unless they are
  imported by an included test wrapper.
- Do not move selectionchange code before making the current hot owner
  inventory explicit.

Next action:

- Extract `onDOMSelectionChange` construction into
  `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
  and leave `EditableDOMRoot` as ref/listener wiring.

### 2026-04-27 Phase 1 Selectionchange Runtime Extraction

Actions:

- Extracted the throttled `onDOMSelectionChange` policy into
  `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`.
- Extracted the debounced selectionchange scheduler creation into the same
  runtime module.
- Left `EditableDOMRoot` responsible for wiring refs/controllers and passing
  the returned callbacks to Android/input/selection listeners.
- Added `.test.ts` wrappers for the plan-referenced selection/kernel contracts
  so they run under the package Vitest include pattern.
- Updated authority audit counts after selectionchange ownership moved.

Commands:

- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react test:vitest test/selection-runtime-contract.test.ts test/selection-controller-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "hovering toolbar|selectionchange|persistent native word-delete"`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.test.ts`
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.test.ts`
- `../slate-v2/packages/slate-react/test/selection-controller-contract.test.ts`

Evidence:

- Full `slate-react` package Vitest suite passes: 18 files, 97 tests.
- `slate-react` typecheck passes.
- `slate-react` build passes. It reports the existing externalized
  `is-hotkey` warning from `slate-dom`.
- `bun lint:fix` passes.
- Browser proof passes in Chromium with retries disabled:
  - hovering toolbar appears
  - hovering toolbar appears after real mouse selection
  - hovering toolbar disappears
  - richtext persistent native word-delete coherence
  - richtext selectionchange and repair kernel results

Hypothesis:

- Root selector source extraction is lower timing risk than repair/Android
  extraction and should be the next move before changing more input policy.

Decision:

- Phase 1 is complete.
- Continue to the least risky Phase 4 subset: top-level runtime ids and
  selected top-level index source selectors.

Owner classification:

- Selectionchange event-frame, ownership, trace, and completion policy now
  belongs to the runtime selection engine.
- `EditableDOMRoot` still owns other event-family trace/repair policy and
  remains open for later phases.

Changed files:

- `tmp/completion-check.md`
- `docs/plans/2026-04-27-slate-v2-editable-runtime-and-root-selector-hard-cut-plan.md`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.test.ts`
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.test.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.test.ts`
- `../slate-v2/packages/slate-react/test/selection-controller-contract.test.ts`

Rejected tactics:

- Do not optimize selectionchange throttling/debouncing in the extraction
  slice.
- Do not treat package contracts as enough proof for browser selectionchange
  behavior.

Next action:

- Create `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
  and move top-level runtime ids plus selected top-level index selector bodies
  out of `EditableTextBlocks`.

### 2026-04-27 Phase 4 Root Selector Sources, Least-Risk Subset

Actions:

- Added
  `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`.
- Moved top-level runtime ids and selected top-level index selector bodies out
  of `EditableTextBlocks`.
- Kept placeholder visibility as the only remaining generic root selector in
  `EditableTextBlocks`.
- Added a provider hook contract for root selector sources.
- Updated the static `useSlateSelector` ownership inventory.

Commands:

- `bun --filter slate-react test:vitest test/surface-contract.test.tsx test/provider-hooks-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/large-document-runtime.test.ts --project=chromium`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Evidence:

- Root selector focused contracts pass: 2 files, 16 tests.
- Full `slate-react` package Vitest suite passes: 18 files, 98 tests.
- `slate-react` typecheck passes.
- `slate-react` build passes with the existing externalized `is-hotkey`
  warning.
- Large-document Chromium browser proof passes: 17 tests.

Hypothesis:

- The remaining root selector is placeholder visibility. It is lower risk to
  defer that until after the repair/view owner cut, because repair and
  force-render still create broader root wakeups.

Decision:

- Least-risk Phase 4 subset is complete.
- Continue to Phase 2 repair/force-render runtime owner extraction.

Owner classification:

- Root runtime id and selected top-level index facts are owned by
  `root-selector-sources.ts`.
- Placeholder visibility is still temporary root selector debt.

Changed files:

- `tmp/completion-check.md`
- `docs/plans/2026-04-27-slate-v2-editable-runtime-and-root-selector-hard-cut-plan.md`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Rejected tactics:

- Do not move placeholder into the same slice without its own focused browser
  row, because placeholder regressions were already user-visible.
- Do not optimize island planning; preserve existing behavior first.

Next action:

- Inventory repair and force-render request paths, then extract
  `requestEditableRepair`/direct `forceRender` application behind a runtime
  repair/view module.

### 2026-04-27 Phase 2 Repair And Force-Render Runtime Owner

Actions:

- Added
  `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`.
- Moved root `EDITOR_TO_FORCE_RENDER` registration into the runtime repair
  engine.
- Moved root repair request application behind `useRuntimeRepairEngine(...)`.
- Added static inventory for direct `forceRender()` call owners.
- Updated repair authority inventory after the owner move.

Commands:

- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx test/editing-kernel-contract.test.ts`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "persistent native word-delete|selectionchange|rendered DOM shape after repeated leaf-boundary word-delete"`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps model and DOM coherent after persistent native word-delete"`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- Full `slate-react` package Vitest suite passes: 18 files, 99 tests.
- `slate-react` typecheck passes.
- `slate-react` build passes with the existing externalized `is-hotkey`
  warning.
- `bun lint:fix` passes.
- First richtext no-retry browser group run was red on persistent native
  word-delete: expected 4 destructive repair-induced selectionchanges, got 2.
- The exact failed row passed alone with retries disabled.
- The exact three-row richtext group passed twice afterward with retries
  disabled.

Hypothesis:

- The first browser red is residual timing/flakiness around the persistent
  word-delete repair trace row, not a deterministic regression from the repair
  owner extraction. Keep this noted until `check:full` closure.

Decision:

- Phase 2 owner slice is complete.
- Continue to Phase 3 composition/Android extraction.

Owner classification:

- Root repair request application and root force-render registration are owned
  by `runtime-repair-engine.ts`.
- Direct force-render calls remain in browser proof handle, keyboard worker,
  and mutation repair executor, with explicit static owners.

Changed files:

- `tmp/completion-check.md`
- `docs/plans/2026-04-27-slate-v2-editable-runtime-and-root-selector-hard-cut-plan.md`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Rejected tactics:

- Do not treat the first browser red as invisible. It must stay recorded until
  full closure.
- Do not move remaining direct `forceRender()` calls blindly; browser proof
  handle and keyboard fallback need separate owner cuts.

Next action:

- Extract composition state transition wiring and Android input manager
  lifecycle wiring into runtime modules while keeping `EditableDOMRoot` as
  ref/listener wiring.

### 2026-04-27 Phase 3 Composition And Android Runtime Owners

Actions:

- Added runtime wrappers for composition and Android manager ownership:
  `runtime-composition-engine.ts` and `runtime-android-engine.ts`.
- Removed direct `setEditableComposingState(...)` and
  `useAndroidInputManager(...)` ownership from `EditableDOMRoot`.
- Kept `EditableDOMRoot` as ref/listener wiring for platform handlers.

Commands:

- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/editing-epoch-kernel-contract.test.ts`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "composition|Android|IME"`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/runtime-composition-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- Full `slate-react` package Vitest suite passes: 18 files, 99 tests at this
  checkpoint.
- `slate-react` typecheck passes.
- `slate-react` build passes with the existing externalized `is-hotkey`
  warning.
- Large-document Chromium browser proof passes.

Decision:

- Phase 3 is complete.
- Continue to the remaining Phase 4 root selector sources.

### 2026-04-27 Phase 4 Root Selector Source Completion

Actions:

- Moved placeholder visibility into `root-selector-sources.ts`.
- Added placeholder hook coverage for empty, typed, and deleted editor states.
- Moved large-document root derivation behind
  `useLargeDocumentRootSources(...)`.
- Moved the editable root commit wakeup out of `EditableDOMRoot` and into
  `useEditableRootCommitWakeup()`.
- Removed inline generic `useSlateSelector` calls from both
  `EditableTextBlocks` and `EditableDOMRoot`.

Commands:

- `bun --filter slate-react test:vitest test/surface-contract.test.tsx test/provider-hooks-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/placeholder.test.ts --project=chromium`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/large-document-runtime.test.ts --project=chromium`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Evidence:

- Root selector focused contracts pass: 2 files, 17 tests.
- Full `slate-react` package Vitest suite passes: 18 files, 100 tests.
- Placeholder Chromium proof passes: 3 tests.
- Large-document Chromium proof passes: 17 tests.

Decision:

- Phase 4 is complete.
- Continue to Phase 5 static guards and remaining runtime owner cuts.

### 2026-04-27 Phase 5 Static Guards And Runtime Owner Locks

Actions:

- Added `runtime-kernel-trace.ts` and moved non-selectionchange event frame,
  trace, DOM-input repair trace, and keydown trace payload construction out of
  `EditableDOMRoot`.
- Moved DOM repair queue construction into `runtime-repair-engine.ts`.
- Moved keydown/mouseup/beforeinput DOM-selection import policy behind
  `createRuntimeSelectionImportController(...)`.
- Updated static authority inventories for:
  - hot `EditableDOMRoot` policy ownership
  - generic selector ownership
  - selection bridge ownership
  - mutation/repair bridge ownership
  - direct `forceRender()` ownership
- Updated the release escape-hatch inventory after reducing the
  `react-runtime:bridge` count from 28 to 27.

Commands:

- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx test/selection-controller-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts`
- `bun --filter slate-react test:vitest`
- `bun --filter slate-react build`
- `bun lint:fix`
- `bun test:release-discipline`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/runtime-kernel-trace.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`

Evidence:

- Focused authority and selector contracts pass: 5 files, 43 tests.
- Full `slate-react` package Vitest suite passes: 18 files, 100 tests.
- `slate-react` typecheck and build pass.
- Release discipline passes: 83 tests.

Decision:

- Phase 5 is complete.
- Continue to Phase 6 browser proof and closure gates.

### 2026-04-27 Phase 6 Browser Proof And Closure

Actions:

- Ran the targeted browser regression pack over the reported regression
  families.
- Ran generated browser stress over all configured stress families.
- Ran the full release-quality gate.

Commands:

- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/large-document-runtime.test.ts playwright/integration/examples/richtext.test.ts --project=chromium`
- `bun test:stress`
- `bun check:full`

Artifacts:

- `../slate-v2/test-results/release-proof/persistent-browser-soak.json`
- generated stress artifacts under `../slate-v2/tmp/stress-artifacts`

Evidence:

- Targeted Chromium browser pack passes: 89 tests, retries disabled.
- Generated stress passes: 10 tests, retries disabled.
- `bun check:full` passes:
  - `bun check`
  - release discipline
  - `slate-browser` release proof
  - scoped mobile proof
  - persistent profile soak: 5 iterations
  - full local Playwright integration: 628 passed, 4 replay rows skipped by
    design

Decision:

- This plan is complete.
- `tmp/completion-check.md` can be set to `done`.
