# Slate v2 Selector And Live-Read Runtime Hard-Cut Plan

## Status

Done as of 2026-04-27.

This plan covers the next two cleanup cuts after the completed items 4/5/6
hard-cut lane:

1. Remove `skipSyncedTextOperations` from generic public selector options.
2. Centralize scattered `slate/internal` live-read imports behind
   `slate-react` runtime modules.

`tmp/completion-check.md` is `done` for this lane.

## Execution Ledger

### 2026-04-27: complete-plan activation

- Slice name: activation and selector contract tracer.
- Owner classification: Plan 1A/1B, selector public truth versus internal
  mounted render policy.
- Actions taken: set `tmp/completion-check.md` to `pending`, refreshed
  `tmp/continue.md`, and marked this plan active.
- Commands run: none yet for code; this is the control-file activation step.
- Evidence: completion state and continuation prompt now point at this plan.
- Decision: start with contracts before cutting the public selector option.
- Changed files: `tmp/completion-check.md`, `tmp/continue.md`,
  `docs/plans/2026-04-27-slate-v2-selector-and-live-read-runtime-hard-cut-plan.md`.
- Rejected tactics: no code-first refactor before a selector contract.
- Next action: in `../slate-v2`, add selector contracts proving public
  `useTextSelector` reports text changes while mounted render subscriptions
  can skip directly synced text-only commits.

### 2026-04-27: selector/live-read hard cut complete

- Slice name: selector/live-read runtime hard cut.
- Owner classification: Plan 1 and Plan 2 closure.
- Actions taken:
  - Added public/internal selector contracts.
  - Removed `skipSyncedTextOperations` from public selector options.
  - Added internal mounted render selector hooks for synced-text render skips.
  - Added `slate-react` runtime live-state, selection-state, and mutation-state
    facade modules.
  - Migrated components, hooks, input strategies, repair queues, Android input,
    browser handle, clipboard, and selection code away from direct
    `slate/internal` imports.
  - Added static guards for public selector policy and runtime facade import
    ownership.
- Commands run:
  - `bun --filter slate-react test:vitest -- provider-hooks-contract`
  - `bun --filter slate-react test:vitest -- provider-hooks-contract surface-contract`
  - `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract`
  - `bun --filter slate-react test:vitest -- runtime-live-state-contract surface-contract`
  - `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract selection-controller-contract editing-kernel-contract target-runtime-contract runtime-live-state-contract surface-contract`
  - `bun --filter slate-react typecheck`
  - `bun --filter slate-react build`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 STRESS_ROUTES=plaintext STRESS_FAMILIES=paste-normalize-undo bunx playwright test playwright/stress/generated-editing.test.ts --project=mobile --reporter=line`
  - `bun lint:fix`
  - `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract runtime-live-state-contract surface-contract`
  - `bun check`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/search-highlighting.test.ts --reporter=line`
  - `bun check:full`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps model and DOM coherent after persistent native word-delete" --reporter=line`
- Evidence:
  - The RED selector contract failed before implementation because
    `useMountedNodeRenderSelector` did not exist.
  - Focused selector/runtime contracts pass.
  - `rg "from 'slate/internal'" packages/slate-react/src` is limited to the
    three runtime facade modules.
  - `bun check` passes.
  - The named browser regression rows pass across projects.
  - `bun check:full` passes. It reported one Chromium richtext word-delete row
    as flaky; the exact row passed alone with retries disabled.
- Decision: close this lane as complete, while keeping the full-gate flake
  recorded as residual browser-harness risk rather than hiding it.
- Changed files:
  - `tmp/completion-check.md`
  - `tmp/continue.md`
  - `docs/plans/2026-04-27-slate-v2-selector-and-live-read-runtime-hard-cut-plan.md`
  - `../slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx`
  - `../slate-v2/packages/slate-react/src/components/editable-text.tsx`
  - `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - `../slate-v2/packages/slate-react/src/editable/runtime-live-state.ts`
  - `../slate-v2/packages/slate-react/src/editable/runtime-selection-state.ts`
  - `../slate-v2/packages/slate-react/src/editable/runtime-mutation-state.ts`
  - `../slate-v2/packages/slate-react/src/**` callers migrated to runtime
    facades.
  - `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
  - `../slate-v2/packages/slate-react/test/surface-contract.tsx`
  - `../slate-v2/packages/slate-react/test/runtime-live-state-contract.ts`
  - `../slate-v2/packages/slate-react/test/runtime-live-state-contract.test.ts`
- Rejected tactics:
  - No public stale-data selector option.
  - No broad `forceRender()` fallback.
  - No compatibility aliases.
  - No scattered direct `slate/internal` imports in React callers.
- Next action: none for this lane.

### 2026-04-27: knowledge capture

- Slice name: `ce-compound` extraction.
- Owner classification: developer-experience runtime selector learning.
- Actions taken: added a focused solution note for the public selector truth
  versus internal render policy boundary and the live-read facade rule.
- Commands run: `rg -n "slate-react|selector|live-read|skipSyncedTextOperations|slate/internal|runtime facade" docs/solutions`.
- Evidence: overlap with existing docs was moderate, not high; no existing
  note owned the combined selector-truth and runtime-live-read facade rule.
- Decision: create a new focused doc instead of merging into undo, selection,
  void, or render-breadth notes.
- Changed files:
  - `docs/solutions/developer-experience/2026-04-27-slate-react-public-selectors-must-stay-model-truth.md`
- Rejected tactics: no duplicate broad architecture essay in this plan; keep
  the reusable lesson in `docs/solutions/`.
- Next action: none for this lane.

## Harsh Call

The last mobile paste/undo fix was correct, but the shape is still too
footgunny.

`skipSyncedTextOperations` currently sits on generic selector options, which
makes it look like a public truth-policy knob. That is wrong. Public selectors
must report model truth. The optimized "do not rerender mounted text after a
directly synced text-only commit" policy belongs to internal render
subscriptions only.

The scattered `slate/internal` live-read imports are also not the final shape.
They are better than public `Editor.getLive*`, but they leak core runtime
mechanics across React components, hooks, Android input, browser handles,
selection reconciliation, clipboard handling, and repair queues. The runtime
should expose a small React-owned live-read facade, not ask every hot file to
import core internals directly.

## North Star

Public app code gets truthful selector APIs and clean DX.

Internal mounted editor render paths get high-performance subscriptions without
lying to app selectors.

React components consume a `slate-react` runtime facade; core live-read imports
stay inside that facade and a few explicitly classified runtime modules.

## Non-Goals

- Do not change the document model.
- Do not reintroduce public `Editor.getLive*`.
- Do not add compatibility aliases.
- Do not make generic `useNodeSelector` / `useTextSelector` stale.
- Do not broaden `forceRender()` to hide selector mistakes.
- Do not treat generated browser stress as default `bun check`.
- Do not remove real browser compatibility fallbacks just because their names
  contain "fallback" or "compat".

## Current Surface

Current relevant hits:

- `packages/slate-react/src/hooks/use-node-selector.tsx`
  - exports `SlateRuntimeSelectorOptions`
  - includes `skipSyncedTextOperations?: boolean`
  - imports `getEditorLiveNode` from `slate/internal`
- `packages/slate-react/src/components/editable-text.tsx`
  - passes `skipSyncedTextOperations: true`
- `packages/slate-react/src/components/editable-text-blocks.tsx`
  - passes `skipSyncedTextOperations: true`
  - imports `getEditorLiveNode` from `slate/internal`
- many `slate-react/src/**` modules import `getEditorLiveNode`,
  `getEditorLiveText`, or `getEditorLiveSelection` from `slate/internal`
- `packages/slate/src/internal/index.ts` re-exports the core live-read helpers
  under `getEditorLive*` names

## Plan 1: Hard Cut `skipSyncedTextOperations` From Generic Selectors

### Target API

Generic selectors:

```ts
useNodeSelector(selector, equalityFn?, options?)
useTextSelector(selector, equalityFn?, options?)
```

must always observe model truth. Their options may include runtime id and
defer/scheduling policy, but not stale-data policy.

Internal mounted render subscriptions get a separate owner API, for example:

```ts
useMountedTextRenderSelector(selector, equalityFn?, options?)
useMountedNodeRenderSelector(selector, equalityFn?, options?)
```

or a lower-level internal helper:

```ts
useRuntimeNodeSelector(selector, equalityFn, {
  runtimeId,
  updatePolicy: 'model-truth' | 'skip-synced-text-render',
})
```

The exact naming can change during implementation, but the boundary cannot:

- public selector hooks default to model truth and cannot opt out of text
  commits
- internal render hooks may skip text-only commits when direct DOM sync owns
  visible text

### Acceptance

- `skipSyncedTextOperations` is gone from public exported selector option types.
- `useNodeSelector` and `useTextSelector` stay model-correct for app code.
- `editable-text.tsx` and `editable-text-blocks.tsx` still avoid mounted render
  churn after directly synced text-only commits.
- Provider hook contracts still prove public selectors report model text
  changes.
- The focused mobile plaintext paste/normalize/undo stress row still passes.

### Execution Slices

#### 1A. Add The Contract First

Add or update `slate-react` contracts so the desired split is executable:

- public `useTextSelector` reports text updates after `insert_text` /
  `remove_text`
- internal mounted text render hook does not rerender for directly synced
  text-only commits
- internal mounted node/block render hook does not rerender for directly synced
  text-only commits
- non-text commits still invalidate mounted render hooks

Likely test files:

- `packages/slate-react/test/provider-hooks-contract.tsx`
- `packages/slate-react/test/projections-and-selection-contract.tsx`
- a new focused internal render-selector contract if the existing files become
  too broad

#### 1B. Split Public And Internal Selector Options

Refactor `packages/slate-react/src/hooks/use-node-selector.tsx`:

- remove `skipSyncedTextOperations` from the exported public options type
- keep the generic selector update predicate model-correct
- introduce an internal-only helper that accepts a render update policy
- keep runtime id resolution and equality semantics shared

Do not duplicate selector logic. The split should be policy-level, not a copied
hook stack.

#### 1C. Migrate Mounted Render Callers

Move the two known render optimizations:

- `components/editable-text.tsx`
- `components/editable-text-blocks.tsx`

to the internal render selector helper.

No app-facing or exported hook should expose the skip policy.

#### 1D. Static Guard

Add a release-discipline or package contract guard that fails on:

- `skipSyncedTextOperations` in exported types
- `skipSyncedTextOperations` usage outside the internal render-selector module
  and its mounted render callers
- public docs/examples mentioning synced-text skip policy

#### 1E. Verification

Run:

```bash
bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract
bun --filter slate-react typecheck
bun --filter slate-react build
PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 STRESS_ROUTES=plaintext STRESS_FAMILIES=paste-normalize-undo bunx playwright test playwright/stress/generated-editing.test.ts --project=mobile --reporter=line
bun lint:fix
bun check
```

If selector contracts touch public exports, also run the release-discipline
guard directly.

## Plan 2: Centralize `slate/internal` Live Reads Behind React Runtime Modules

### Target Architecture

Only a small number of `slate-react` runtime modules should import
`slate/internal`.

Proposed owner modules:

- `editable/runtime-live-state.ts`
  - current live node/text/selection reads
  - snapshot fallback policy
  - runtime id/path resolution helpers
- `editable/runtime-selection-state.ts`
  - selection import/export read helpers
  - model-vs-DOM authority read helpers
- `editable/runtime-mutation-state.ts`
  - marks/live mutation helper wrappers such as `setEditorMarks`
  - target runtime writes such as `setEditorTargetRuntime` if they remain

Everything else imports from these runtime modules, not from `slate/internal`.

This is not hiding the core dependency for aesthetics. It creates one place to
enforce:

- fallback order
- stale snapshot behavior
- composition exceptions
- model-owned vs DOM-owned selection authority
- testable live-read ownership

### Acceptance

- `rg "from 'slate/internal'" packages/slate-react/src` returns only the
  approved runtime facade modules.
- components, hooks, input strategies, repair queues, browser handles,
  Android manager, clipboard strategy, and selection reconciler do not import
  `slate/internal` directly.
- Runtime facade contracts prove fallback behavior for live node, live text,
  live selection, marks, and target runtime writes.
- Browser contracts for toolbar, mentions, images, tables, search
  highlighting, paste/undo, and IME remain green.

### Owner Classification

Keep direct core live reads only where the file is itself a runtime owner:

| Area | Current problem | Target |
| --- | --- | --- |
| public hooks | `use-node-selector.tsx` imports core live node | route through runtime facade |
| mounted components | text blocks import core live node | route through render/runtime facade |
| `Editable` | imports live selection and target runtime setter | route through selection/mutation runtime |
| keyboard/input strategies | import live selection | route through selection runtime |
| browser handle | imports live selection | route through selection runtime |
| Android manager | imports live selection and marks setter | route through selection/mutation runtime |
| selection reconciler | imports live node/text/selection | keep as runtime owner or depend on facade |
| DOM repair queue | imports live text/selection | keep as runtime owner or depend on facade |
| clipboard strategy | imports live node/selection | route through clipboard/runtime facade |

### Execution Slices

#### 2A. Inventory And Allowlist Contract

Add a static contract that lists allowed direct `slate/internal` import files in
`packages/slate-react/src`.

Initial allowlist should be intentionally tiny:

- `editable/runtime-live-state.ts`
- `editable/runtime-selection-state.ts`
- `editable/runtime-mutation-state.ts`

During the first implementation slice, a temporary allowlist can include the
current heaviest runtime owners if needed, but the end state should keep direct
core internals out of components and hooks.

#### 2B. Create Runtime Live-State Facade

Create `editable/runtime-live-state.ts` with wrappers like:

```ts
readRuntimeNode(editor, path)
readRuntimeText(editor, path)
readRuntimeSelection(editor)
readRuntimeNodeById(editor, runtimeId)
```

Rules:

- wrappers return `null` instead of throwing for absent live state unless the
  caller needs strict behavior
- wrappers encode fallback order once
- wrappers are testable without full React render

#### 2C. Migrate Low-Risk Callers First

Start with callers that only read:

- `hooks/use-selected.ts`
- `hooks/use-slate-selection.tsx`
- `hooks/use-node-selector.tsx`
- `large-document/island-shell.tsx`
- `components/editable-text-blocks.tsx`
- `editable/model-input-strategy.ts`

Run focused tests after this slice before touching event-heavy files.

#### 2D. Migrate Event/Repair Owners In Smaller Batches

Then migrate:

- `editable/keyboard-input-strategy.ts`
- `editable/browser-handle.ts`
- `editable/selection-controller.ts`
- `editable/dom-repair-queue.ts`
- `editable/clipboard-input-strategy.ts`
- `editable/editing-kernel.ts`
- `hooks/android-input-manager/android-input-manager.ts`

Do not big-bang these. These files carry selection authority, IME,
clipboard, Android, undo, and DOM repair risk.

#### 2E. Decide Final Runtime Owner Files

After migration, decide whether these remain direct runtime owners or consume
the facade:

- `editable/selection-reconciler.ts`
- `editable/dom-repair-queue.ts`

If they remain owners, document why in the static contract. If they can use the
facade without loss, move them too.

#### 2F. Static Guard

Add or extend release-discipline tests:

- no `slate/internal` imports outside approved runtime modules
- no `getEditorLive*` imports from components/hooks/input strategies
- no direct live-read fallback logic duplicated outside runtime modules

#### 2G. Verification

Run focused package checks first:

```bash
bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract selection-controller-contract editing-kernel-contract target-runtime-contract
bun --filter slate-react typecheck
bun --filter slate-react build
```

Then run browser rows that touch the migrated event owners:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 bunx playwright test \
  playwright/integration/examples/hovering-toolbar.test.ts \
  playwright/integration/examples/mentions.test.ts \
  playwright/integration/examples/tables.test.ts \
  playwright/integration/examples/images.test.ts \
  playwright/integration/examples/search-highlighting.test.ts \
  --reporter=line
```

Then run the generated stress row that caused the last selector/live-read fix:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 STRESS_ROUTES=plaintext STRESS_FAMILIES=paste-normalize-undo bunx playwright test playwright/stress/generated-editing.test.ts --project=mobile --reporter=line
```

Close with:

```bash
bun lint:fix
bun check
```

Use `bun check:full` only if this lane is activated as a release-quality
architecture claim.

## Combined Execution Order

1. Add public/internal selector contracts for item 1.
2. Split `skipSyncedTextOperations` out of public selector options.
3. Migrate mounted text/block renderers to internal render selector helpers.
4. Add static guard for public selector truth.
5. Add `slate/internal` import allowlist contract for item 2.
6. Create runtime live-state/selection/mutation facade modules.
7. Migrate low-risk read callers.
8. Migrate event/repair callers in batches.
9. Tighten allowlist to final owner modules.
10. Run focused tests, browser rows, generated stress row, `bun lint:fix`, and
    `bun check`.
11. Update this plan and the research verdict with actual evidence.
12. If execution continues through release-quality closure, activate
    `tmp/completion-check.md` and require `bun check:full` before `done`.

## Stop And Replan Conditions

Stop and replan if:

- public selectors stop reporting model text changes
- internal render hooks skip non-text commits
- direct DOM text sync needs a broad `forceRender()` again
- `Editable` gains more policy while trying to remove direct live-read imports
- the static allowlist grows instead of shrinks after two migration batches
- a browser row passes through model-only assertions while DOM/focus/selection
  is wrong

## Done Definition

This plan is complete only when:

- public selectors are model-truth-only
- synced-text render skipping is internal-only
- direct `slate/internal` imports in `slate-react/src` are limited to approved
  runtime owner modules
- browser and generated stress proof stay green
- static guards prevent reintroducing both smells
