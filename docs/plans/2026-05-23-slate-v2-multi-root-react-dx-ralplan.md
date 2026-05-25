# Slate v2 multi-root React DX ralplan

Status: done - Slate Ralplan complete, ready for Ralph execution
Runtime id: `019e46be-4ec4-7d11-bc6e-9fcf033a8803`
Skill: `slate-ralplan`
Scope: `.tmp/slate-v2` multi-root React API, package ownership, and example DX

## Intent

Make multi-root editing feel like Slate with one editor and multiple editable
surfaces.

The app should own document layout and product state. The package should own
root activation, view-editor creation, DOM selection preservation, focus repair,
and root-local DOM sync.

## Verdict

The current example is dirty app land.

The right public DX is:

```tsx
const editor = useSlateEditor({
  extensions: [documentTitle],
  initialValue: {
    roots: {
      footer: [{ type: 'paragraph', children: [{ text: 'Prepared' }] }],
      header: [{ type: 'paragraph', children: [{ text: 'Confidential' }] }],
      main: [{ type: 'paragraph', children: [{ text: 'Body' }] }],
    },
    state: {
      [documentTitle.key]: 'Q2 Operating Plan',
    },
  },
})

return (
  <Slate editor={editor}>
    <DocumentTitleInput />
    <Editable root="header" aria-label="Header editor" />
    <Editable aria-label="Body editor" />
    <Editable root="footer" aria-label="Footer editor" />
  </Slate>
)
```

That is the API users will expect from legacy Slate: one editor provider, many
editable DOM surfaces. `SlateRuntime`, `createEditorView`, and manual
`window.getSelection()` calls should not appear in the canonical example.

Current score after pass 10: 0.92.
Target score after execution: >= 0.92, with no dimension below 0.85.

This plan is ready for Ralph execution. All Slate Ralplan passes, issue-sync
accounting, confidence scoring, and closure gates are closed.

## Evidence Read

- `site/examples/ts/multi-root-document.tsx`
  - imports `createEditorView`, `SlateRuntime`, `useSlateRuntime`,
    `useSlateRuntimeState`, and `useSlateViewState`;
  - `updateHistory` manually creates a root view editor for undo and redo;
  - `focusEditableAtEnd` and `focusEditablePreservingSelection` directly mutate
    DOM selection and dispatch `selectionchange`;
  - `RootEditor` owns `activeRoot`, `flushSync`, DOM ids, and root focus;
  - `restoreTitleFocus` and `restoreActiveRootFocus` queue focus repairs in app
    code.
- `packages/slate-react/src/components/slate.tsx`
  - current public shape is `<SlateRuntime><Slate root>...</Slate></SlateRuntime>`;
  - `<Slate editor>` and `<Slate root>` are mutually exclusive.
- `packages/slate-react/src/hooks/use-state-field.ts`
  - `useSetStateField` already preserves DOM selection and avoids forced focus;
  - the missing DX is making that hook available from the top-level Slate
    provider without a root-specific app wrapper.
- `packages/slate-react/src/hooks/use-slate-runtime.tsx`
  - the package already has the per-root view registry and root-local text-op
    DOM sync machinery.
- `playwright/integration/examples/multi-root-document.test.ts`
  - browser expectations are good; the implementation burden is in the wrong
    layer.

## Accepted API Shape

### 1. One Slate Provider

`<Slate editor={editor}>` should be the canonical multi-root provider.

```tsx
<Slate editor={editor}>
  <TitleField />
  <Header />
  <Body />
  <Footer />
</Slate>
```

`SlateRuntime` remains as an advanced substrate API for custom hosts and
adapter authors. Canonical examples should not teach it first; advanced docs
can document it explicitly.

### 2. Editable Owns Root Views

`Editable` should accept `root?: RootKey` directly.

```tsx
<Editable root="header" />
<Editable />
<Editable root="footer" />
```

Internally, `Editable root` should:

- create or reuse the root view editor;
- register the view editor in the runtime registry;
- provide the correct editor context to descendants;
- update active root on focus, pointer, and selection entry;
- restore DOM selection for its root after root-local commits and document
  history replay.

### 3. State Fields Work From the Top Provider

State field hooks should work under `<Slate editor>` even when they are rendered
outside a specific `Editable`.

```tsx
const title = useStateFieldValue(documentTitle)
const setTitle = useSetStateField(documentTitle)

return (
  <input
    value={title}
    onChange={(event) => setTitle(event.currentTarget.value)}
  />
)
```

Add a tuple convenience hook only if it is implemented as a tiny wrapper:

```tsx
const [title, setTitle] = useStateField(documentTitle)
```

This should preserve the existing setter semantics:

- preserve DOM selection by default;
- do not steal focus;
- do not scroll editor views.

### 4. Root Wording Beats View Wording

Add or alias public hooks around root language:

```tsx
const headerText = useSlateRootState('header', rootText)
const activeRoot = useSlateActiveRoot()
const editor = useSlateRootEditor(activeRoot)
```

`useSlateViewState` can remain as a lower-level alias, but examples should use
`useSlateRootState`. "View" is implementation vocabulary. "Root" is user DX.

### 5. History Uses the Active Root Internally

App code should not call `createEditorView(runtime, { root: activeRoot })` for
undo and redo.

```tsx
const activeRoot = useSlateActiveRoot()
const editor = useSlateRootEditor(activeRoot)

editor.update((tx) => {
  tx.history.undo()
})
```

`useSlateActiveEditor()` may exist as a tiny convenience over active root plus
root editor, but it should not be the only documented command path.

```tsx
const activeRoot = useSlateActiveRoot()
const editor = useSlateRootEditor(activeRoot)
```

The package still owns how active root maps to the runtime view.

## Example Cleanup Target

Delete this from `site/examples/ts/multi-root-document.tsx`:

- `createEditorView`
- `SlateRuntime`
- `useSlateRuntime`
- `useSlateRuntimeState` where a normal editor selector exists
- `useSlateViewState` in favor of `useSlateRootState`
- `activeRoot` React state in the example
- `setActiveRoot`
- `flushSync`
- `focusEditableAtEnd`
- `focusEditablePreservingSelection`
- `restoreTitleFocus`
- `restoreActiveRootFocus`
- DOM id based focus routing
- direct `window.getSelection()` / `document.createRange()` / `selectionchange`
  dispatch from app code

The example should contain normal Slate code only:

- create editor;
- render document title input;
- render three editables;
- show root status badges;
- show commit summary;
- call undo/redo through package hooks.

## Rejected Alternatives

### Keep `<SlateRuntime><Slate root>`

Rejected as canonical DX. It exposes the runtime/view split to every user and
forces examples to manage focus and active root manually.

Keep it only as an advanced substrate for custom host integrations.

### Add a Product `MultiRootEditor` Component

Rejected for raw Slate. Plate can ship product-shaped components. Slate should
ship primitives: `Slate`, `Editable root`, state field hooks, and root hooks.

### Tell Users to Call `createEditorView`

Rejected for app code. It is the right internal primitive, but not the right
example API.

### Keep Only `useSlateViewState`

Rejected for public examples. The hook may stay, but the documented API should
say root, not view.

## Package Ownership

`slate-react` should own:

- root-view editor lifecycle;
- root activation;
- root-scoped focus state;
- per-root DOM selection cache and restore;
- document history focus preservation;
- state-field update focus preservation;
- root-local text operation DOM sync.

Apps should own:

- where surfaces are rendered;
- styling;
- labels;
- business fields;
- toolbar commands.

## Tests

### Unit / Contract

Add or update `packages/slate-react/test/*` rows:

- `<Slate editor>` can host multiple `<Editable root>` descendants.
- `<Editable />` defaults to `main`.
- `<Editable root="header">` binds operations, selection, and editor context to
  `header`.
- Single-root `<Slate editor><Editable /></Slate>` behavior is unchanged.
- `useStateFieldValue` and `useSetStateField` work under top-level `<Slate>`
  outside any `Editable`.
- state field writes keep focused inputs focused and do not focus an editor.
- `useSlateRootState(root, selector)` only re-renders for that root's changes.
- `useSlateActiveRoot` updates after focus, pointer activation, keyboard entry,
  and selection entry.
- `useSlateRootEditor(activeRoot)` runs history against the expected root.
- optional `useSlateActiveEditor` is tested only as a convenience wrapper if it
  exists.
- unmounted sibling roots do not receive DOM text sync work.

### Browser

Keep the current Playwright coverage, but make it prove package ownership:

- edit header, body, footer, and title through one editor runtime;
- title input remains focused after state field changes;
- undo/redo uses the active root without app focus repair;
- document undo preserves the currently focused root caret even when undoing a
  sibling root's batch;
- clicking visible header/footer/body blank area focuses the expected root;
- modifier shortcuts in the title field preserve title focus;
- select all, copy, paste remain root-local.

Add a source-level assertion for the example:

- no `restoreTitleFocus`;
- no `restoreActiveRootFocus`;
- no `window.getSelection`;
- no `document.createRange`;
- no `createEditorView`;
- no `SlateRuntime`.

## Pre-Mortem

- Active root can go stale after toolbar mouse down if pointer/focus handlers are
  not centralized.
- Nested editor contexts can regress `renderElement`, `renderLeaf`, `useEditor`,
  and selection hooks.
- State field inputs can steal editor focus if defaults are not applied through
  the public hook path.
- Root-local DOM sync can accidentally run against hidden or unmounted views.
- Undo/redo can replay correct operations but restore selection into the wrong
  root if active root and selection root drift.

## Ralph Execution Order

1. Refactor `<Slate editor>` so it can own the runtime context for document
   roots.
2. Move root-view editor creation from `<Slate root>` to `Editable root`.
3. Add root-named public hooks:
   - `useSlateRootState`
   - `useSlateActiveRoot`
   - `useSlateRootEditor`
   - optional `useSlateActiveEditor`
   - optional `useStateField`
4. Move focus, active root, and selection restoration into `slate-react`.
5. Rewrite `site/examples/ts/multi-root-document.tsx` to one `<Slate>` and many
   `<Editable root>` surfaces.
6. Keep the browser tests behaviorally identical, then add the source-cleanliness
   assertion.

## Verification Commands For Ralph

Run from `.tmp/slate-v2`:

```bash
bun test ./packages/slate-react/test/slate-runtime-provider-contract.test.tsx
bun test ./packages/slate-react/test/state-field-selector-contract.test.tsx
bun --filter ./packages/slate-react typecheck
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1
bun lint:fix
```

If package exports or public hook files move, run the repo's barrel/update
command before the final typecheck.

## Closure Bar

The plan is ready for Ralph only when:

- the example no longer contains app-owned focus repair;
- the public example shows one Slate provider with multiple Editables;
- the package owns active root and root selection restoration;
- root/state hooks are documented by use at the example call site;
- browser proof passes without weakening the current behavior assertions.

## Slate Ralplan Pass State

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | Live `.tmp/slate-v2` source, existing plan, research index/log, issue ledgers, PR reference, and multi-root browser tests read. | Changed lane from `ready for Ralph execution` to pending full-gate review; added confidence scorecard and pass ledger. | Issue discovery, ecosystem synthesis, maintainer objection, high-risk proof, and closure gates remain open. | Slate Ralplan |
| 2. Related issue discovery | complete | Live/open, sync, issue coverage, package impact, requirements, clusters, gitcrawl clusters, fork dossier, and PR reference rows read. | Added related issue classification matrix; kept new exact fixed/improved claims at zero; marked older `SlateRuntime` + `<Slate root>` public accounting stale for pass 11. | Need durable ledger/PR wording sync in pass 11. | Slate Ralplan / ClawSweeper discipline |
| 3. Issue-ledger pass | complete | Full issue-ledger index, package impact matrix, requirements file, issue clusters, gitcrawl clusters, open ledger, test candidate map, benchmark candidate map, sync ledger, coverage matrix, fork dossier, and PR reference read. | Added ownership/accounting pass: runtime-boundary issue pressure supports moving focus/selection/root ownership into `slate-react`/`slate-dom`, but still produces zero new issue claims for this plan. | Need intent/decision brief to settle public API shape and non-goals. | Slate Ralplan |
| 4. Intent/boundary and decision brief | complete | Source plan, current example evidence, issue-ledger ownership pass, and intent-boundary guidance read. | Added intent/outcome/scope/non-goals/decision boundaries plus public API decision brief; chose `<Slate editor>` + `<Editable root>` as canonical and demoted runtime/view APIs to substrate. | Need research/ecosystem synthesis before score can exceed 0.85 on research or migration. | Slate Ralplan |
| 5. Research/ecosystem synthesis | complete | Read/update decision, state/tx namespace decision, data-model-first React runtime decision, Lexical/ProseMirror/Tiptap corpus ledger, React 19.2 external-store research, and steal/reject/defer map read. | Added ecosystem strategy table for Lexical, ProseMirror, Tiptap, React 19.2, VS Code, Pretext/Premirror, Plate, and slate-yjs/collab. | Need performance/DX/migration/regression pressure matrix before score can approach threshold. | Slate Ralplan |
| 6. Performance/DX/migration/regression pressure passes | complete | Slate Ralplan pressure-pass guidance, performance, performance-oracle, tdd, Vercel React, react-useeffect, shadcn, live runtime selectors, state-field selectors, provider contracts, and browser tests read. | Added perf/DX/migration/regression matrix, cohorts, repeated-unit budgets, 10x/100x/1000x projections, proof rows, and source-cleanliness assertions. | Need maintainer objection and high-risk passes before closure. | Slate Ralplan |
| 7. Maintainer objection / steelman | complete | Steelman guidance, current API decision, runtime/view substrate evidence, issue-ledger ownership, and research decisions read. | Added maintainer objection ledger; kept canonical `<Slate editor>` + `<Editable root>` but revised wording to keep runtime/view APIs as advanced substrate, not legacy-bad API. | Need high-risk deliberate pass for API/browser/focus blast radius. | Slate Ralplan |
| 8. High-risk deliberate mode | complete | High-risk deliberate guidance, current plan, maintainer objection pass, perf/DX proof matrix, and continuation state read. | Added high-risk trigger, blast-radius matrix, three-scenario pre-mortem, expanded proof plan, adoption/rollback answer, and keep-with-guardrails verdict. | Need ecosystem maintainer pass for Plate/slate-yjs/plugin substrate answers. | Slate Ralplan |
| 9. Ecosystem maintainer pass | complete | Slate Ralplan ecosystem guidance, Plate-fit hard-cut dossier, issue coverage extension/collab rows, state/tx namespace decision, and issue requirements read. | Added Plate/plugin and slate-yjs/collab maintainer answers, affected extension points, migration-backbone surfaces, collab contract, and proof requirements. | Need revision pass to fold accepted guardrails into final target and resolve stale wording. | Slate Ralplan |
| 10. Revision pass | complete | Full target sections, pass 7-9 guardrails, stale score/current-status wording, API hook preference, source-cleanliness scope, and ecosystem answers reviewed. | Folded accepted guardrails into top-level API/test/execution target; explicit `useSlateRootEditor(root)` is canonical; runtime/view APIs are advanced substrate; score raised to threshold but lane remains pending. | Need issue sync accounting before closure. | Slate Ralplan |
| 11. Issue sync accounting pass | complete | Current manual sync ledger, issue coverage matrix, PR reference, generated live rows, gitcrawl clusters, fork dossier multi-root row, and pass 10 issue-sync scope read. | Synced public target wording to canonical `<Slate editor>` + `<Editable root>` while preserving advanced runtime/view substrate and zero new fixed/improved issue claims. | Need closure score/final gates. | Slate Ralplan |
| 12. Closure score and final gates | complete | Pass ledger, score threshold, issue-sync artifacts, allowed edit scope, completion state, and continuation state audited. | Added closure audit and done handoff; marked lane ready for Ralph execution. | None for Slate Ralplan; implementation belongs to Ralph. | Ralph |

## Pass 1 - Current-State Read And Initial Score

### Live Current Shape

`site/examples/ts/multi-root-document.tsx` currently teaches the wrong layer:

- imports `createEditorView`, `SlateRuntime`, `useSlateRuntime`,
  `useSlateRuntimeState`, and `useSlateViewState` at lines 4-18;
- creates a root editor manually for history at lines 211-240;
- mutates DOM focus and selection directly at lines 252-289;
- stores `activeRoot` in app React state and uses `flushSync` at lines 294-320;
- renders one `<Slate root>` per root at lines 354-366;
- restores title and active-root focus from app code at lines 384-453;
- mounts `<SlateRuntime runtime={runtime}>` at lines 530-568.

`packages/slate-react/src/components/slate.tsx` confirms the current public
shape:

- `SlateProps` has `editor?: ...` and `root?: RootKey` at lines 181-197;
- `<Slate editor>` and `<Slate root>` are mutually exclusive at lines 212-214;
- root views require an outer `<SlateRuntime>` at lines 216-225;
- `SlateRuntimeView` creates and registers a view editor at lines 238-267.

`packages/slate-react/src/hooks/use-state-field.ts` already has the right
state-field mutation default:

- `useSetStateField` routes through `editor.update`;
- setter options preserve DOM selection and avoid forced focus at lines 25-38;
- the hook currently needs an editor context at lines 55-69.

`packages/slate-react/src/hooks/use-slate-runtime.tsx` already has substrate the
clean API should reuse:

- mounted view editors are stored by root at lines 222-247;
- text operations are grouped by root before DOM sync at lines 249-290.

The browser tests are valuable and should survive the cleanup:

- edit header/body/footer/title through one runtime at
  `playwright/integration/examples/multi-root-document.test.ts` lines 7-85;
- undo/redo and follow-up typing stay in the active root at lines 87-128;
- document undo preserves focused-root caret at lines 130-246;
- visible header-area click and inactive text-surface caret are covered at
  lines 248-315;
- modifier-key and root-local copy/paste rows are covered at lines 317-416.

### Research And Ledger Read

Research layer:

- `docs/research/index.md` points this surface to the editor architecture lane,
  React 19.2 external-store/background UI, and the read/update runtime decisions
  at lines 75-130.
- `docs/research/log.md` confirms editor architecture evidence has already been
  maintained for React 19.2, ProseMirror, Lexical, VS Code, and Slate v2 at lines
  199-213.
- `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`
  accepts `editor.read` / `editor.update` as the public lifecycle and places
  DOM selection policy outside React at lines 21-51 and 133-150.
- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
  records Lexical read/update and dirty reconciliation, ProseMirror transaction
  and centralized DOM selection authority, and Tiptap command/extension DX at
  lines 23-129.
- `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
  says React 19.2 supports external stores and background UI, but does not
  replace core invalidation at lines 29-64 and 80-102.
- `docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md`
  explicitly rejects Tiptap-style `chain().focus()` ceremony as required public
  UX at lines 158-170.

Issue and PR ledgers:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` reports 630 live open issues
  at lines 8-14.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` already records the older
  multi-root/provider target as optional `SlateRuntime` plus `<Slate root>` at
  lines 55-61; this plan likely needs to revise that accounting.
- The same sync ledger already links multi-root and focus pressure to `#6016`,
  `#5537`, and `#5117` at lines 78-80 and 97-98.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` has a 2026-05-21
  React Runtime Provider / Multi-root Planning Sync section at lines 76-90.
- `docs/slate-v2/references/pr-description.md` says PR claims must not add issue
  numbers because they sound related at lines 135-143.

### Confidence Scorecard

| Dimension | Weight | Score | Weighted | Evidence | Reason |
| --- | ---: | ---: | ---: | --- | --- |
| React 19.2 runtime performance | 0.20 | 0.78 | 0.156 | `use-slate-runtime.tsx` root registry/text-op grouping; React 19.2 research lines 29-64 and 80-102. | Direction is right: root-local registry and external-store posture exist. Score stays below 0.85 because active-root subscriptions and view-editor creation are not designed in the plan yet. |
| Slate-close unopinionated DX | 0.20 | 0.84 | 0.168 | Plan target `<Slate editor><Editable root>`; live example lines 530-568 show current dirt. | One Slate with many Editables is the right Slate-ish surface. Score stays below 0.85 until decision brief and migration wording are complete. |
| Plate and slate-yjs migration backbone | 0.15 | 0.76 | 0.114 | State fields are collab/history/persist-capable in example lines 20-26; sync ledger lines 43-53. | Good substrate, but no Plate/plugin or slate-yjs maintainer answer for root views and state fields yet. |
| Regression-proof testing strategy | 0.20 | 0.82 | 0.164 | Existing Playwright rows lines 7-416; plan test rows lines 256-297. | Strong browser rows exist. Missing package-level contract rows and source-cleanliness assertion keep it below 0.85. |
| Research evidence completeness | 0.15 | 0.78 | 0.117 | Research index/log, read/update decision, corpus ledger, React 19.2 source page, perfect-plan map. | Relevant research exists. Score stays below 0.85 because this plan lacks the required ecosystem synthesis table for the multi-root decision. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.80 | 0.080 | Plan API target lines 80-181; shadcn lens loaded for component minimalism. | Minimal surface is promising. Need explicit prop/hook minimalism pass and no product `MultiRootEditor` defense. |

Total: `0.80`.

Threshold not met:

- total must be `>= 0.92`;
- every dimension must be `>= 0.85`;
- issue discovery and sync are not complete;
- ecosystem strategy table is missing;
- maintainer objection and high-risk deliberate passes are missing;
- closure pass is not eligible in this activation.

### Initial Keep / Revise Calls

- Keep: one `<Slate editor>` with many `<Editable root>` surfaces.
- Keep: app code owns layout, labels, product state, and toolbar placement.
- Keep: package owns root view lifecycle, active root, focus, selection restore,
  and root-local DOM sync.
- Revise: prior 2026-05-21 accounting that taught optional `SlateRuntime` plus
  `<Slate root>` as public target; that should become an advanced substrate, not
  canonical DX.
- Revise: plan must add a real issue matrix instead of saying browser tests are
  enough.
- Revise: plan must add a decision brief and maintainer objection row before
  claiming "absolute best."

### Applicable Lens Matrix

| Lens | Applicability | Current result | Next required delta |
| --- | --- | --- | --- |
| `intent-boundary-pass` | applied, pending pass 4 | Intent is clear enough to proceed. | Add non-goals, decision boundaries, and viable options. |
| `vercel-react-best-practices` | applied, pending pass 6 | Relevant rules are external-store subscriptions, rerender-defer-reads, effect-to-event, event-handler refs, and stable callbacks. | Prove active root does not become a global React state rerender source. |
| `performance-oracle` | applied, pending pass 6 | Root registry and operation grouping are bounded by touched roots. | Add 10x/100x/1000x multi-root cohort expectations. |
| `performance` | applied, pending pass 6 | Multi-root repeated units are root views/editable surfaces. | Add budgets for mounted root views, selectors, listeners, DOM sync, and focus listeners. |
| `tdd` | applied, pending pass 6 | Existing tests are good behavioral seeds. | Require package contracts before example rewrite, then browser proof. |
| `react-useeffect` | applied, pending pass 6 | App focus repair is exactly the type of effect/timing workaround to remove. | Package internals may synchronize with DOM, but examples should not. |
| `shadcn` | applied, pending pass 6 | Useful as component minimalism lens only. | No product-shaped `MultiRootEditor`; keep primitive composition. |
| `steelman-pass` | applied, pending pass 7 | Triggered by public React API change. | Add strongest objection and migration answer. |
| `high-risk-deliberate-pass` | applied, pending pass 8 | Triggered by public API and browser focus/selection behavior. | Add blast radius and proof plan. |
| `clawsweeper` | applied, pending passes 2-3 | Ledger-first issue discipline loaded. | Reuse existing ledgers, no broad live GitHub search. |

### Pass 1 Plan Deltas

- Changed status from `ready for Ralph execution` to full-gate `pending`.
- Added scored confidence matrix.
- Added pass-state ledger.
- Added live source line evidence for current app-land dirt.
- Added initial issue/research evidence.
- Preserved the target API, but demoted it from "ready" to "directionally
  accepted, still under review."

## Pass 2 - Related Issue Discovery

ClawSweeper discipline applied: use the existing issue ledgers first, avoid a
broad live GitHub search, and do not inflate issue claims because a bug sounds
related.

Search scope:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/gitcrawl-clusters.md`

### Related Issue Classification

| Issue / cluster | Current ledger status | Discovery result for this plan | Claim policy | Proof route | Sync impact |
| --- | --- | --- | --- | --- | --- |
| `#6016` displaying two Slate components with same initial value | `triage-closed` / non-fix; use one SlateRuntime with root-bound views. | Still relevant, but the target changes from "many Slate providers" to "one provider with many roots." It does not support sharing the same node object across independent runtimes. | No `Fixes`. Keep as architectural pressure and documentation guard. | Example proves one editor/runtime with header/main/footer roots, not two editors with shared object identity. | Pass 11 should update stale provider wording from `<SlateRuntime><Slate root>` to canonical `<Slate><Editable root>`. |
| `#5537` autofocus with multiple editors | `cluster-synced` v2-react-runtime. | Strong related pressure: root focus must be package-owned. Not exact enough to close from this DX plan alone. | No new claim. | Browser row: changing title/header/body/footer preserves focused root and follow-up typing target. | Keep cluster-synced; add note that canonical API removes app-land focus repair. |
| `#5117` placeholder measurement leaks across editors | `future-proof` / example pressure. | Related to per-root DOM bridge and measurements. Not exact enough to claim fixed. | No new claim. | Package tests should assert root-local editable DOM ownership and no cross-root placeholder/measurement leak. | Keep future-proof. |
| `#4612` external state update | `improves-claimed`. | Preserved: state fields and explicit setters give a package-owned external update path without app focus hacks. | Preserve existing improves claim; no exact `Fixes`. | Package state-field hook rows and browser title-edit row. | Pass 11 should keep status unchanged but align wording with top-level provider hooks. |
| `#5281` controlled input | `not-claimed`. | Still not a controlled-input redesign. State fields are document-owned runtime state, not React-controlled children. | No claim. | None. | Explicitly preserve not-claimed. |
| `#3497` loses focus when parent triggers unrelated state change | `cluster-synced` v2-react-runtime. | Related: app rerenders should not own editor focus repair. This plan improves the architecture, but exact closure needs direct repro proof. | No new claim. | Add browser row: unrelated app state update does not move caret from active root. | Keep cluster-synced. |
| `#3634` / `#4961` focus after programmatic change cluster | `cluster-synced` v2-react-runtime. | Related to selection import/export and focus restoration. The plan should preserve rooted selection identity. | No new claim. | Browser rows around toolbar/title update, undo, redo, and follow-up typing target. | Keep cluster-synced. |
| `#3893` toolbar button focus state | `related`. | Related because active root should not depend on toolbar DOM focus. | No claim until toolbar/menu scenario has exact proof. | Add or preserve toolbar interaction row if execution touches toolbar. | Keep related. |
| `#5867`, `#5538`, `#5826` focus/scroll rows | `related` / focus-scroll pressure. | Relevant to package-owned focus/selection repair, especially `focus` and `scrollSelectionIntoView` defaults. | No new claim. | Preserve no-forced-scroll defaults in state-field setter and add browser row only if scroll behavior changes. | Keep related. |
| `#4477`, `#4483`, `#3383`, `#5515`, `#3741`, `#3715`, `#3482` adjacent rows | existing statuses preserved. | Multi-root React DX should not touch their claim status. | No new claim. | Existing issue-specific proofs only. | Preserve. |
| `#6013`, `#5605`, `#5709` provider initialization claims | existing `fixed` claims in matrix/PR reference. | This plan is adjacent, not the source of those claims. | Preserve only if execution does not regress provider initialization. | Existing provider-init proof plus multi-root browser sanity. | No new claim; avoid bundling this DX cleanup into those fixes. |

### Pass 2 Decision

The issue lesson is simple: most of the related bugs are not "multi-root API"
bugs; they are React runtime, focus, DOM selection, and root-ownership bugs.
That makes the current example worse than a messy sample. It teaches users to
work around the exact subsystem Slate v2 is supposed to own.

The accepted public direction therefore stays:

- canonical: `<Slate editor={editor}>` with many `<Editable root>` surfaces;
- advanced substrate: `SlateRuntime`, `createEditorView`, and lower-level view
  registration;
- app-owned: layout, labels, toolbar placement, non-editor product state;
- package-owned: root activation, root-local selection, focus restoration,
  view-editor lifecycle, and root-local DOM sync.

### Claim Accounting After Pass 2

- New exact fixed claims: `0`.
- New improved claims: `0`.
- Existing exact fixed claims preserved: `#6013`, `#5605`, `#5709`.
- Existing improved claim preserved: `#4612`.
- Explicitly not claimed: `#5281`.
- Related but not fixed: `#5537`, `#5117`, `#3497`, `#3634`, `#4961`,
  `#3893`, `#5867`, `#5538`, `#5826`.
- `#6016` remains a non-fix for sharing one node object across independent
  runtimes, but becomes a strong proof row for one runtime with many root
  editables.

### Score After Pass 2

Total remains `0.80`.

The issue-discovery gate is closed, but the issue-ledger sync, decision brief,
ecosystem synthesis, performance/DX testing matrix, steelman, high-risk, and
closure passes are still open. Raising the score now would be fake confidence.

### Pass 2 Plan Deltas

- Added related issue classification matrix.
- Preserved strict claim policy: no new fixed/improved issue claims.
- Marked older public accounting around optional `SlateRuntime` plus
  `<Slate root>` as stale for the issue-sync pass.
- Converted issue evidence into proof obligations for the execution plan.

## Pass 3 - Issue-Ledger Pass

Full ledger pass applied across the issue corpus artifacts, not just the rows
that already sounded close to multi-root editing.

Read set:

- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/test-candidate-map.md`
- `docs/slate-issues/test-candidate-map/*`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

### Corpus Pressure

The full ledger does support this plan, but not by creating a pile of new issue
claims.

The package-impact matrix says runtime-boundary ownership has `407` issues,
while core-engine ownership has `113`. It also says docs/examples must not
absorb architecture decisions that belong in packages. That is directly
applicable here: `multi-root-document.tsx` should not be the place where active
root, focus repair, DOM selection preservation, and root-local DOM sync are
invented.

The requirements file makes the same call in architecture language:

- R5: split runtime ownership cleanly between `slate-react-v2` and
  `slate-dom-v2`;
- R6: make selection a dedicated runtime subsystem;
- `slate-react-v2` owns subscriptions, lifecycle, focus timing, placeholder and
  render timing, editor replacement semantics, and React-facing lifecycle;
- `slate-dom-v2` owns DOM point/path translation, clipboard DOM formats,
  selection bridge mechanics, shadow DOM, and nested-editor DOM boundaries.

This plan is therefore correctly package-owned:

- `slate-react`: public React provider, `Editable root`, root-view lifecycle,
  hook ergonomics, active root subscription, focus lifecycle;
- `slate-dom`: DOM selection bridge and root-local DOM sync mechanics;
- `slate`: roots, operations, state fields, commits, and selection/root identity;
- examples: product layout only.

### Test Candidate Accounting

| Issue | Test-candidate state | What this plan can use | What it cannot claim |
| --- | --- | --- | --- |
| `#6016` | `ready-now`: dual-editor render with same Slate value reference; v2 capability test, not current-Slate obligation. | Use as proof pressure for one runtime/editor with multiple root editables. | Cannot claim support for sharing one node-object graph across independent runtimes. |
| `#6013` / `#5605` | `ready-now` / duplicate via `#6013`. | Preserve existing provider-init fixed claims. | No new claim from the multi-root DX plan. |
| `#5709` | `ready-now`: provider hook editor replacement. | Preserve existing provider replacement fixed claim. | No new claim unless execution touches replacement behavior. |
| `#5537` | `not-a-test-candidate`: raw DOM focus across multiple editors. | Treat as pressure to keep raw DOM focus hacks out of app examples. | No exact fixed/improved claim. |
| `#5117` | `ready-now`: multiple editors placeholder min-height isolation. | Add root-local DOM/placeholder proof obligation if execution touches placeholder or inactive roots. | No exact closure without the specific placeholder repro. |
| `#4961` | `ready-now`: `ReactEditor.focus` after `insertNodes`. | Use as focus-after-programmatic-change pressure. | No exact closure from API cleanup alone. |
| `#3634` | `ready-now`: `ReactEditor.focus` should allow immediate typing between editors. | Use as active-root/follow-up typing browser proof pressure. | No exact closure without the original focus scenario. |
| `#3497` | `ready-now`: parent rerenders from unrelated state should not steal focus. | Add unrelated parent-state update proof for multi-root example execution. | No exact closure until replay exists. |
| `#4612` | `not-a-test-candidate` in current contract. | Preserve existing improves claim through state fields and explicit transaction APIs. | Do not claim a React-controlled `value` fix. |
| `#5281` | `not-a-test-candidate`: controlled input request. | Preserve explicit non-claim. | Do not turn state fields into controlled editor children. |
| `#5867` | `ready-now`: `DOMEditor.focus` with selected inline void. | Use as focus-preserves-logical-selection pressure. | No exact closure unless inline void selection is replayed. |
| `#5538` | `blocked-on-repro`: focus-to-end scroll jump. | Keep as focus/scroll pressure. | No claim. |
| `#5826` | `ready-now`: refocus auto-scroll on long document. | Preserve no-forced-scroll defaults and browser-scroll proof if execution touches focus defaults. | No claim without long-document refocus replay. |
| `#3893` | `ready-now`: focus state update when clicking ordinary HTML buttons. | Use as toolbar/button active-root pressure. | No claim without exact toolbar button proof. |

The benchmark candidate map does not add a direct performance issue for this
specific API cleanup. The performance obligation comes from runtime-boundary
architecture and rerender/subscription breadth, not from a known benchmark issue
whose closure this plan can claim.

### Ledger Decision

The public API cleanup is justified by issue corpus ownership:

1. It removes app-land focus and selection repair from the example.
2. It places root-view lifecycle in `slate-react`, where the ledger says React
   lifecycle/focus/subscription bugs belong.
3. It keeps DOM selection mechanics in `slate-dom`, instead of burying
   `window.getSelection()` and `selectionchange` dispatches in app code.
4. It keeps core Slate unopinionated: roots, operations, state fields, and
   selection identity stay model/runtime primitives, not React product widgets.

It does not justify any broad issue closure. The correct claim policy is still:

- new exact fixed claims: `0`;
- new improved claims: `0`;
- preserve existing `#6013`, `#5605`, `#5709` fixed claims;
- preserve existing `#4612` improves claim;
- keep the focus/multi-editor/placeholder/scroll rows as related proof pressure.

### Score After Pass 3

Total remains `0.80`.

The ledger pass closes an evidence gap, but the plan still lacks the decision
brief, ecosystem strategy table, maintainer objection ledger, high-risk pass,
performance/DX proof matrix, revision pass, and final issue sync accounting.

### Pass 3 Plan Deltas

- Added full issue-ledger ownership synthesis.
- Added test-candidate accounting for the related issue set.
- Confirmed benchmark map does not create a direct closure claim.
- Preserved strict no-new-claims accounting.
- Strengthened the execution proof obligations around parent rerenders,
  active-root follow-up typing, toolbar focus, placeholder isolation, and
  no-forced-scroll focus behavior.

## Pass 4 - Intent Boundary And Decision Brief

Intent-boundary pass applied. No user question is needed: the repo and issue
evidence answer the boundary question.

### Intent Boundary Record

| Field | Decision |
| --- | --- |
| Intent | Make multi-root editing feel like normal Slate: one editor object, one provider, multiple editable DOM surfaces. |
| Desired outcome | App code renders document layout and product fields. `slate-react` creates root views, tracks active root, preserves focus, restores root-local selection, and routes root-local DOM sync. |
| In scope | Public React API shape, root provider composition, root hooks, state-field hooks outside an editable, active-root/history routing, example cleanup, and package/browser proof obligations. |
| Non-goals | No product `MultiRootEditor`; no Plate-only component; no support for sharing the same node-object graph across independent runtimes; no React-controlled `value` comeback; no broad issue closure; no pagination/layout work in this plan. |
| Decision boundaries | This plan may decide the public multi-root React API, hook naming direction, app/package ownership split, issue claim policy, and required proof rows. It may not edit `.tmp/slate-v2` implementation from the Ralplan skill. |
| Unresolved user-decision points | None. Hook naming can still be refined during execution review, but the architectural boundary is settled. |

Pressure test:

If the example still needs `restoreTitleFocus`, `restoreActiveRootFocus`,
`flushSync`, DOM ids, or `window.getSelection()`, the API has failed. A public
example is not allowed to normalize package architecture debt into app code.

### Decision Brief

#### Principles

1. Keep Slate's mental model simple: one editor for one document.
2. Make root identity explicit where DOM surfaces split.
3. Keep browser timing, focus, and selection repair inside packages.
4. Expose primitives, not product components.
5. Keep advanced runtime/view APIs available without teaching them first.

#### Top Drivers

1. Current app code leaks runtime internals and DOM selection repair into the
   example.
2. The issue corpus says the biggest pain is runtime-boundary ownership, not
   lack of a wrapper component.
3. Users coming from legacy Slate expect provider + editable composition, not a
   separate runtime/view ceremony.

#### Viable Options

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| `<Slate editor={editor}>` with many `<Editable root>` surfaces | Matches Slate composition, keeps one editor object, hides root-view lifecycle, lets examples stay clean. | Requires `slate-react` to own view creation and active-root context instead of exposing the lower layer. | Chosen. |
| Keep canonical `<SlateRuntime><Slate root>` | Mirrors current substrate and is explicit about runtime/view split. | Forces every app to learn internals, makes examples own focus repair, and teaches the wrong layer. | Rejected as canonical; keep as advanced substrate only. |
| Independent `<Slate>` editors with shared value object | Looks close to legacy multi-editor examples and explains `#6016` directly. | Shared node-object identity across runtimes is unsupported and makes DOM path ownership ambiguous. | Rejected. |
| Product `MultiRootEditor` wrapper | Very easy demo API. | Too opinionated for raw Slate, hides primitives, and belongs in Plate or app code. | Rejected. |
| Keep app-owned focus helpers | Minimal package work. | It preserves the exact class of runtime-boundary bugs v2 is meant to remove. | Rejected. |

#### Chosen Public Shape

Canonical userland:

```tsx
<Slate editor={editor}>
  <DocumentTitleInput />
  <Editable root="header" />
  <Editable />
  <Editable root="footer" />
</Slate>
```

Root API split:

- `Editable root?: RootKey` creates or reuses the root view editor and provides
  the correct editor context to descendants.
- `useSlateActiveRoot()` returns the root that currently owns editing intent.
- `useSlateRootEditor(root)` returns a root-bound editor explicitly.
- `useSlateActiveEditor()` may exist as a tiny convenience over active root plus
  root editor, but should not be the only API.
- `useSlateRootState(root, selector)` is public example vocabulary;
  `useSlateViewState` may remain lower-level.
- `useStateFieldValue`, `useSetStateField`, and optional `useStateField` work
  under top-level `<Slate>` outside any `Editable`.

This keeps the public API explicit enough for multi-root correctness without
making every app call `createEditorView`.

#### Consequences

- `<Slate root>` becomes legacy/substrate wording, not the canonical public
  example.
- `Editable` becomes the public root-view mounting point.
- State fields become the supported way to edit document-owned non-node state
  from inputs outside editable surfaces.
- Toolbar/history code should call root-aware package hooks instead of creating
  view editors manually.
- Source-cleanliness tests are required because this is partly an API pedagogy
  fix: the example must stop teaching the bad pattern.

#### Follow-Ups For Ralph

1. Prefer additive hook aliases first if that keeps the migration small.
2. Keep `SlateRuntime` and `createEditorView` available for custom hosts.
3. Rewrite the example only after package contracts prove root context and
   state-field hooks work.
4. Preserve current browser behaviors before adding new proof rows.

### Score After Pass 4

Total rises from `0.80` to `0.81`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.78 | 0.78 | No new subscription/perf matrix yet. |
| Slate-close unopinionated DX | 0.84 | 0.88 | Public API choice, non-goals, and rejected alternatives are now explicit. |
| Plate and slate-yjs migration backbone | 0.76 | 0.77 | Product wrapper rejection helps, but collab/plugin substrate still needs pass 9. |
| Regression-proof testing strategy | 0.82 | 0.82 | No new test matrix beyond proof obligations. |
| Research evidence completeness | 0.78 | 0.78 | Ecosystem synthesis still pending. |
| shadcn-style composability and hook/component minimalism | 0.80 | 0.83 | The plan now rejects a product wrapper and keeps primitive composition. |

Weighted total: `0.81`.

Still below threshold because research/ecosystem, performance/DX, maintainer
objection, high-risk, revision, issue-sync, and closure gates are open.

### Pass 4 Plan Deltas

- Added explicit intent, outcome, scope, non-goals, decision boundaries, and
  unresolved-decision state.
- Added the public API decision brief.
- Chose root on `Editable`, not root on a nested `<Slate>`, as the canonical
  public mounting point.
- Kept runtime/view APIs as advanced substrate.
- Raised score to `0.81`, still pending.

## Pass 5 - Research And Ecosystem Synthesis

Research/ecosystem synthesis applied. This pass converts the research layer into
specific architecture calls for the multi-root React DX slice.

Read set:

- `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`
- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`
- `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`
- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
- `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
- `docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md`
- issue-coverage collaboration and Plate-fit rows for slate-yjs/Plate pressure

### Ecosystem Strategy Table

| System | Steal | Reject | Adapt For Multi-root React DX |
| --- | --- | --- | --- |
| Lexical | Read/update lifecycle, dirty leaves/elements, update tags for policy, command execution inside update context. | Class-node document model, `$function` public style, bespoke node mutation as the mental model. | Root-view lifecycle should run inside the Slate transaction/commit discipline. Active root, DOM sync, and selection restoration should be commit effects, not React app effects. |
| ProseMirror | Transaction authority, selection mapping, durable bookmarks, one DOM observer/selection import/export authority. | Integer positions as public Slate coordinates, schema-first identity, heavy plugin system as raw Slate DX. | Root-local selection caches should be Slate path/root aware, but the authority model should be ProseMirror-like: one package-owned DOM selection bridge, not per-example repairs. |
| Tiptap | Extension packaging, command ergonomics, React selector guidance, product-quality docs. | Required `chain().focus().run()` ceremony as normal mutation DX. | Plate can own product components and command sugar. Raw Slate should expose primitive root hooks and state/tx namespaces; focus freshness must be runtime-owned instead of user-called `focus()`. |
| React 19.2 | `useSyncExternalStore`, transitions/deferred non-urgent UI, Activity for hidden panes, Performance Tracks for render proof. | Treating React scheduling as a replacement for editor invalidation. | Active editing stays urgent and root-local. Status badges, commit panels, hidden roots, and diagnostics can subscribe/defer; active root must not become global app state that rerenders every root. |
| VS Code | Split model, view model, decorations, widgets, comments, and services. | Turning raw Slate into a full app/editor workbench. | Multi-root roots are view surfaces over one document runtime. Product UI stays outside raw Slate; root hooks expose enough view state for app layout without owning selection repair. |
| Pretext / Premirror | Derived layout/measurement lane over document truth. | Pulling pagination/layout into this React DX cleanup. | Keep this plan root/view/focus only. The root API should not block future layout roots, but pagination remains a separate layout strategy lane. |
| Plate | Product components, plugin bundles, opinionated toolbars, renderer/plugin composition. | Raw Slate shipping a product `MultiRootEditor` or Plate-shaped `tf/api` core names. | Raw Slate provides clean primitives: `<Slate>`, `<Editable root>`, state fields, root hooks, extension namespaces. Plate can wrap them into document editor components later. |
| slate-yjs / collaboration | Operation-first model, transaction metadata, remote/local commit distinction, state fields that persist outside node content. | A Yjs-specific public React API or controlled React `value` revival. | Multi-root roots and document state must remain operation/transaction-owned so collaboration can replay root-specific operations without app-owned focus hacks. |

### Concrete Keep / Reject / Diverge Calls

Keep:

- Slate JSON-like tree and operation model.
- `editor.read` / `editor.update` lifecycle.
- `state` and `tx` grouped namespaces.
- transaction/commit-owned root selection and history semantics.
- React external-store selector posture.
- root-named public hooks for examples.

Reject:

- public mutable `editor.selection` / `editor.children` / `editor.operations`
  as the way app code coordinates roots;
- app-land `window.getSelection()` and manual `selectionchange`;
- Tiptap-style `chain().focus()` as the required fix for stale selection;
- Plate-shaped product wrapper in raw Slate;
- layout/pagination as part of this multi-root DX slice;
- independent runtimes sharing the same node object.

Diverge:

- From Lexical: keep Slate's JSON model and operations instead of class nodes.
- From ProseMirror: keep Slate paths/root keys instead of integer positions.
- From Tiptap: keep command sugar optional and package/runtime freshness primary.
- From React: use React as subscriber/scheduler, not as editor truth.

### Research Decision For This Plan

The research points to one best architecture:

```txt
Slate document/runtime
  owns roots, operations, state fields, commits, selection identity

slate-dom
  owns DOM selection import/export and root-local DOM sync mechanics

slate-react
  owns provider composition, Editable root mounting, root-view lifecycle,
  active-root subscriptions, focus lifecycle, and hooks

apps / Plate
  own layout, product toolbars, product wrappers, and opinionated UI
```

That exactly supports `<Slate editor>` plus many `<Editable root>` surfaces.
It also explains why the current example is wrong: it lets app React state and
DOM selection repair impersonate a runtime subsystem.

### Score After Pass 5

Total rises from `0.81` to `0.84`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.78 | 0.80 | External-store and urgent/non-urgent split is now tied to active-root subscriptions, but perf budgets are still pending. |
| Slate-close unopinionated DX | 0.88 | 0.89 | Ecosystem pass reinforces one editor/many editables and rejects focus ceremony. |
| Plate and slate-yjs migration backbone | 0.77 | 0.81 | Plate and collab boundaries are clearer, but pass 9 still needs maintainer-level substrate answers. |
| Regression-proof testing strategy | 0.82 | 0.82 | No new replay matrix yet. |
| Research evidence completeness | 0.78 | 0.90 | Research sources are now synthesized into concrete keep/reject/diverge calls. |
| shadcn-style composability and hook/component minimalism | 0.83 | 0.85 | Primitive composition is now explicitly preferred over product wrappers. |

Weighted total: `0.84`.

Still below threshold because the pressure passes, maintainer objection,
high-risk pass, ecosystem maintainer pass, revision pass, issue sync, and final
closure gates are open.

### Pass 5 Plan Deltas

- Added concrete ecosystem strategy table.
- Converted research into keep/reject/diverge calls.
- Confirmed this plan should not absorb pagination/layout.
- Confirmed Plate owns product wrappers while raw Slate owns primitives.
- Confirmed collaboration pressure supports operation/transaction-owned roots,
  not React-controlled values.
- Raised score to `0.84`, still pending.

## Pass 6 - Performance, DX, Migration, And Regression Pressure

Pressure passes applied: performance, performance-oracle, TDD, Vercel React,
react-useeffect, and shadcn-style primitive composition.

Read set:

- `performance` skill: cohorts, repeated-unit budgets, interaction latency,
  memory/DOM tags, degradation contracts, React 19 runtime proof.
- `performance-oracle` skill: 10x/100x/1000x projection, algorithmic and memory
  pressure.
- `tdd` skill: behavior-first tests through public APIs.
- `vercel-react-best-practices` skill: selector/rerender/event-handler rules.
- `react-useeffect` skill: effects are escape hatches; use external-store
  subscriptions and event handlers instead of effect-driven state mirroring.
- `shadcn` skill: compose primitives, not custom product wrappers.
- Live `.tmp/slate-v2` evidence:
  - `useSlateRuntimeState` and `useSlateViewState` route through selector
    context and root-aware `shouldUpdate`;
  - `useStateFieldValue` filters by `dirtyStateKeys`;
  - provider contracts already prove sibling root reads, root as dependency,
    mark-only root commits, one shared focus listener pair, and distinct editor
    view objects;
  - browser tests already prove root-local typing, undo/redo focus preservation,
    blank-area focus, title shortcuts, and root-local copy/paste.

### Performance Pressure Matrix

| Pressure | Required shape | Evidence / current substrate | Execution requirement |
| --- | --- | --- | --- |
| Hot subscription path | Root selectors must only update for touched roots or dirty state fields. | `useSlateViewState` filters through `isRootAffected`; `useStateFieldValue` filters through `dirtyStateKeys`. | New `useSlateRootState` must preserve the same filtering and not become a broad runtime subscription. |
| Listener count | Many roots must not install many document-level focus listeners. | Provider contract already asserts one `focusin` and one `focusout` listener pair across sibling root views. | `Editable root` refactor must keep one runtime-level listener pair. |
| View lookup | Root view lookup must be O(1) by root key, not a scan of mounted editables. | Runtime currently keeps mounted view editors by root. | Public `Editable root` must reuse that registry instead of prop-drilling editors. |
| DOM sync | Text DOM sync must run for changed root/runtime ids only. | Runtime groups text operations by root before sync. | Keep root-local grouping after `Editable root` moves view creation. |
| Active root | Active root is interaction state, not app React state. | Current example leaks it into app state; plan moves it into runtime hooks. | `useSlateActiveRoot` should subscribe to a small scalar; event handlers should read active editor lazily when only commands need it. |
| State fields | Non-node document state should not rerender body roots. | `useStateFieldValue` ignores body commits when field key is unchanged. | Top-level state-field hooks under `<Slate>` must preserve selection/focus defaults and dirty-key filtering. |
| Hidden/inactive roots | Inactive roots must not receive DOM sync or urgent rerenders unless affected. | Existing tests assert unmounted sibling roots do not receive sync work. | Keep hidden/inactive root behavior explicit; no silent global materialization. |

### Cohorts And Budgets

| Cohort | Shape | Budget |
| --- | --- | --- |
| Normal | `1-3` roots: title, header, main, footer. | One runtime provider, one global focus listener pair, one mounted editor view per visible root, root-local updates only. |
| Large | `10-20` roots: sections, side notes, header/footer variants. | O(changed roots + subscribed affected selectors); no per-root document listeners; inactive roots may stay mounted but idle. |
| Stress | `100` root surfaces. | Root registry lookup stays O(1); committing to one root must not rerender all roots; root selector fanout must be measurable by affected subscribers. |
| Pathological | `1000` roots or generated split surfaces. | Not a default native-editing target. Use explicit virtualization/layout strategy later; this plan must not fake support by degrading native selection invisibly. |

10x / 100x / 1000x projection:

- 10x roots: should behave like normal if selectors are root-scoped.
- 100x roots: acceptable only if active root and commit panels subscribe to
  small scalars and root selectors short-circuit unchanged roots.
- 1000x roots: belongs to explicit virtualization/layout lanes, not this native
  multi-root API. Do not hide degradation behind the base API.

### DX Pressure

Keep:

- `<Slate editor>` as the document provider.
- `<Editable root>` as the root DOM surface.
- `useSlateRootState`, `useSlateActiveRoot`, `useSlateRootEditor`.
- optional `useSlateActiveEditor` convenience.
- state-field hooks under top-level Slate.

Cut from canonical example:

- `SlateRuntime`
- `createEditorView`
- `useSlateRuntime`
- `useSlateRuntimeState`
- `useSlateViewState`
- manual active-root React state
- `flushSync`
- DOM ids for focus routing
- `window.getSelection()` / `document.createRange()` / `selectionchange`

Do not overbuild:

- no product `MultiRootEditor`;
- no required command-chain/focus ceremony;
- no Plate-shaped `api/tf` naming in raw Slate;
- no extra alias layer unless it removes visible app-land runtime concepts.

### Migration Backbone

Plate route:

- Plate can wrap the primitives into document editor components.
- Plate can provide toolbars, layout presets, comments, side panels, and
  opinionated state fields.
- Raw Slate must not ship those product wrappers.

slate-yjs / collaboration route:

- roots are part of the runtime/document value, not React component state;
- operations and commits remain the collaboration backbone;
- state fields can be `collab: 'shared'`, persisted, and history-aware;
- active-root/focus metadata is local runtime state unless explicitly modeled
  as document state;
- no React-controlled `value` revival.

This is a believable backbone route, not current adapter support. Pass 9 still
needs the ecosystem maintainer answer before the migration dimension can go
above `0.85`.

### Regression And TDD Matrix

Package contract rows to add or preserve:

| Behavior | Test shape |
| --- | --- |
| One provider hosts multiple roots | Render `<Slate editor>` with header/main/footer `<Editable root>` descendants; descendants see root-bound editor contexts. |
| Root selectors are scoped | Commit in `main`; `header` selector does not rerender. Commit mark-only change in `header`; `header` selector rerenders. |
| Active root is package-owned | Focus, pointer entry, keyboard entry, and selection entry update `useSlateActiveRoot` without app state. |
| History targets active root | Undo/redo command through package hook restores the correct root selection and follow-up typing target. |
| State field hooks work outside roots | Title input under `<Slate>` but outside any `Editable` reads/writes state field and does not focus or scroll an editor. |
| Root view lifecycle is bounded | Sibling roots share one runtime listener pair and distinct root view editors. |
| Unmounted sibling roots stay idle | Root-local text DOM sync does not run for unmounted or untouched roots. |
| Source cleanliness | Example source contains none of the forbidden runtime/focus/DOM repair symbols. |

Browser rows to preserve or add:

| Behavior | Browser proof |
| --- | --- |
| Root-local editing | Type in header/body/footer/title and assert only that target changes. |
| Parent rerender focus | Trigger unrelated app state update while caret is in a root; focus and follow-up typing stay in that root. |
| Active-root history | Undo body then header while focus remains in body; selection and follow-up typing stay body-local. |
| Toolbar/button focus | Click ordinary toolbar button; active root remains the last editor root unless command explicitly changes it. |
| Blank-area click | Clicking blank area at end/mid paragraph focuses the expected root and caret target. |
| Placeholder isolation | Inactive/empty root placeholder or min-height state does not leak across roots. |
| No forced scroll | State-field update and root switch do not scroll editor unless the command asks for scroll. |
| Native behavior | Select-all, copy, paste, shortcuts, IME/composition, and follow-up typing stay root-local. |

### Verification Workspace Rule

All implementation proof belongs in `.tmp/slate-v2`, not `plate-2`.

This Ralplan pass records required proof only. Ralph execution must run the
named `.tmp/slate-v2` tests and browser rows before any implementation claim.

### Score After Pass 6

Total rises from `0.84` to `0.88`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.80 | 0.87 | Root-scoped selectors, listener budget, DOM sync locality, and cohort budgets are now explicit. |
| Slate-close unopinionated DX | 0.89 | 0.90 | Public primitive API remains simple and the bad example concepts are explicitly cut. |
| Plate and slate-yjs migration backbone | 0.81 | 0.85 | Plate/product and collaboration backbone routes are explicit, but ecosystem maintainer pass is still pending. |
| Regression-proof testing strategy | 0.82 | 0.88 | Package contract rows, browser rows, source-cleanliness assertions, and workspace proof rules are explicit. |
| Research evidence completeness | 0.90 | 0.90 | No change; pass 5 already closed the research synthesis. |
| shadcn-style composability and hook/component minimalism | 0.85 | 0.87 | Primitive composition and no product wrapper are now tied to testable API constraints. |

Weighted total: `0.88`.

Still below threshold because maintainer objection, high-risk deliberate mode,
ecosystem maintainer pass, revision pass, issue sync accounting, and closure
gates are open.

### Pass 6 Plan Deltas

- Added performance pressure matrix.
- Added cohorts and repeated-unit budgets.
- Added 10x/100x/1000x projection.
- Added DX cuts for canonical example cleanup.
- Added Plate and slate-yjs migration backbone.
- Added package contract and browser regression matrices.
- Raised score to `0.88`, still pending.

## Pass 7 - Maintainer Objection / Steelman

Steelman pass applied. This is the skeptical Slate-maintainer read: keep the
simple object model, avoid over-abstracting, do not make raw Slate feel like a
closed framework, and do not rename things just to look cleaner.

### Objection Ledger

| Decision | Strongest fair objection | Steelman antithesis | Tradeoff tension | Answer | Verdict |
| --- | --- | --- | --- | --- | --- |
| Canonical `<Slate editor>` with many `<Editable root>` surfaces | "Slate has always been simple JS composition. Why invent a higher-level runtime API when users can already compose editors?" | Keep the current explicit runtime/view API. It is honest about what exists and does not hide complexity. | The package has to own more lifecycle code and the public API grows. | The current example proves explicit runtime/view leaks too much: app code creates views, tracks active root, and patches DOM selection. That is not Slate simplicity; it is browser-runtime debt in userland. Keep `<Slate editor><Editable root>` as canonical. | keep |
| Move root view mounting from `<Slate root>` to `Editable root` | "`Slate root` is more symmetric with the existing provider shape. Putting root on `Editable` could blur provider and surface responsibilities." | Keep each root as its own provider under `SlateRuntime`, so context boundaries stay explicit. | `Editable` becomes more than a renderer; it becomes a root-view mount point. | A root is only meaningful when a DOM editing surface exists. The provider should describe the document runtime; the editable should mount the root view. This matches what users see and removes nested providers from normal examples. | keep |
| Demote `SlateRuntime` / `createEditorView` from examples | "Power users need these primitives. Hiding them makes Slate feel closed and less hackable." | Keep low-level APIs public and documented first, then let examples show exactly what is happening. | Docs need two layers: normal DX and advanced host integration. | Keep the APIs as advanced substrate. Do not call them bad or legacy in docs. The canonical example should not require them, but custom hosts can still use them. | keep with wording revision |
| Add root hooks (`useSlateRootState`, `useSlateActiveRoot`, `useSlateRootEditor`) | "More hooks can turn Slate into a React framework and make the API feel bigger." | Keep only lower-level runtime hooks and let apps build their own root state. | More public hooks mean more API to maintain. | These hooks are narrow aliases over real runtime concepts. They reduce app-land focus/selection hacks and are easier to teach than `view` vocabulary. Keep only primitives; no product wrapper. | keep |
| Package-owned active root/focus restoration | "Focus timing is app-specific; package-level focus repair can become magic and hard to debug." | Let apps control focus explicitly with DOM APIs and callbacks. | Package internals become responsible for tricky browser timing. | The issue ledger says focus/selection/runtime ownership is the core pain. App-level DOM focus repair is the bug class, not the solution. Package ownership must be observable through tests and opt-in metadata, not hidden magic. | keep |
| State fields outside editable roots | "Non-node document state may pull Slate toward app state management." | Keep non-node UI state in app React state and only store document nodes in Slate. | State fields add a document-owned data channel that can be abused. | The plan limits state fields to document-owned state with persistence/history/collab policy. Product UI state stays app/Plate-owned. Title/settings examples are valid document state; toolbar hover state is not. | keep |
| Source-cleanliness assertions | "Testing source strings is brittle and not behavior-driven." | Only test browser behavior and let internals change freely. | Source checks can become annoying during refactors. | Here the source check guards pedagogy, not runtime behavior. The example must not teach `window.getSelection`, `createEditorView`, or app-owned focus repair. Keep it narrow and example-specific. | keep |

### Accepted Revisions

- Do not describe `SlateRuntime`, `<Slate root>`, or `createEditorView` as
  "bad" APIs in maintainer-facing docs. Call them advanced substrate or custom
  host APIs.
- Keep an explicit `useSlateRootEditor(root)` path. `useSlateActiveEditor()` may
  exist, but it must not be the only command route because implicit active-root
  behavior can feel too magical.
- Keep single-root `<Slate editor><Editable /></Slate>` unchanged as the
  baseline mental model.
- Make source-cleanliness tests scoped to the canonical example only; do not ban
  low-level APIs from package tests or advanced docs.

### Dropped Choices

- Drop product `MultiRootEditor` from raw Slate.
- Drop required app-level focus restoration helpers.
- Drop canonical `SlateRuntime` ceremony from introductory examples.
- Drop any claim that this plan fixes multi-editor shared object identity.

### Maintainer-Facing Summary

This is not "make Slate more closed." It is "keep the low-level runtime
available, but stop making every app act like a runtime maintainer."

The raw Slate surface stays primitive:

```tsx
<Slate editor={editor}>
  <Editable root="header" />
  <Editable />
  <Editable root="footer" />
</Slate>
```

Advanced hosts can still use the runtime/view substrate. Normal users should
not need to know that substrate to render header, body, and footer roots for one
document.

### Proof Required

- Package contracts prove root contexts and root hooks through public APIs.
- Browser tests prove focus/selection/history behavior without app repair code.
- Source-cleanliness check proves the canonical example no longer imports or
  calls low-level runtime/focus DOM APIs.
- Docs preserve the advanced substrate story for custom hosts.

### Score After Pass 7

Total rises from `0.88` to `0.90`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.87 | 0.87 | No new perf evidence; high-risk proof still pending. |
| Slate-close unopinionated DX | 0.90 | 0.92 | Objections are answered while preserving primitive composition and low-level substrate. |
| Plate and slate-yjs migration backbone | 0.85 | 0.86 | Maintainer pass clarifies raw Slate vs Plate/product boundary. |
| Regression-proof testing strategy | 0.88 | 0.89 | Source-cleanliness scope and proof requirements are sharper. |
| Research evidence completeness | 0.90 | 0.90 | No change. |
| shadcn-style composability and hook/component minimalism | 0.87 | 0.89 | Product wrapper is rejected again; primitive API remains the contract. |

Weighted total: `0.90`.

Still below threshold because high-risk deliberate mode, ecosystem maintainer
pass, revision pass, issue sync accounting, and closure gates are open.

### Pass 7 Plan Deltas

- Added maintainer objection ledger.
- Kept canonical `<Slate editor>` plus `<Editable root>`.
- Revised wording: runtime/view APIs stay advanced substrate, not "bad" APIs.
- Required explicit `useSlateRootEditor(root)` in addition to any active-editor
  convenience.
- Scoped source-cleanliness tests to canonical example pedagogy.
- Raised score to `0.90`, still pending.

## Pass 8 - High-Risk Deliberate Mode

High-risk deliberate pass applied.

### Trigger

This plan changes a public React API path and moves focus, selection,
root-view lifecycle, and history-targeting behavior from app code into
`slate-react` / `slate-dom`. That is high-risk because failure is immediately
visible as lost caret, wrong-root typing, scroll jumps, stale hook values, or
broken custom-host integrations.

### Blast Radius

| Area | Affected surface | Risk | Guardrail |
| --- | --- | --- | --- |
| Public React API | `<Slate editor>`, `<Editable root>`, `useSlateRootState`, `useSlateActiveRoot`, `useSlateRootEditor`, optional `useSlateActiveEditor` | API confusion or incompatible provider nesting. | Additive canonical path first; preserve single-root behavior; preserve advanced runtime/view substrate. |
| Runtime/view substrate | `SlateRuntime`, `<Slate root>`, `createEditorView`, runtime root registry | Custom hosts may depend on explicit view creation. | Keep substrate APIs valid; document as advanced/custom-host layer, not removed. |
| Selection/focus | focusin/focusout, selection entry, root-local selection cache, DOM selection import/export | Wrong root becomes active, toolbar clicks steal focus, title input loses focus, undo restores selection into sibling root. | Package contracts plus browser rows for title, toolbar, parent rerender, undo/redo, blank-area click, and follow-up typing. |
| History | active root undo/redo, root-bound view editor selection restore | Operation replay succeeds but caret lands in wrong root. | Browser rows must assert active element, selection containment, and follow-up typing target after undo/redo. |
| State fields | document title/settings outside editable roots | State update can focus editor, scroll editor, or rerender body roots. | Preserve `dom: preserve`, `focus: false`, `scroll: false`, and dirty-state-key filtering. |
| Performance | root subscriptions, listener count, DOM sync fanout | Many roots cause global rerenders or listener explosions. | O(changed roots + affected selectors), one focus listener pair, O(1) root lookup, root-local DOM sync. |
| Docs/examples | canonical multi-root example | Example can keep teaching low-level APIs despite package fixes. | Source-cleanliness assertion scoped to canonical example. |
| Issue/PR claims | related focus/multi-editor issues | Overclaiming fixes without exact repro proof. | Keep new fixed/improved claims at zero until exact proof exists. |

### Three-Scenario Pre-Mortem

1. **The API looks clean, but focus gets magical.**

   A toolbar click, title-field edit, or undo operation silently changes active
   root. Users see text inserted into the wrong root. The fix is not to push
   focus back to app code; it is to add explicit root-owner tests, expose
   `useSlateRootEditor(root)`, and keep active-editor convenience optional.

2. **The refactor hides runtime power from advanced hosts.**

   Custom integrations that need `SlateRuntime` or `createEditorView` think the
   API was deprecated or broken. The fix is maintainer-facing docs and examples
   that keep the substrate valid while making it clear normal app code starts
   at `<Slate editor>` plus `<Editable root>`.

3. **Root-scoped architecture accidentally becomes global.**

   A small hook alias subscribes to the whole runtime, root commits rerender all
   surfaces, or each root adds focus listeners. The fix is to block execution
   closure until selector fanout, listener count, and root-local DOM sync tests
   prove bounded behavior.

### Expanded Proof Plan

| Proof lane | Required proof |
| --- | --- |
| Unit / contract | `<Slate editor>` hosts multiple `<Editable root>` descendants; root editor contexts are distinct; root selectors short-circuit unchanged roots; state-field hooks outside roots preserve focus/scroll defaults; root lookup remains registry-backed. |
| Integration | History/undo targets active root through package hooks; mounted roots share one document listener pair; unmounted sibling roots stay idle; runtime/view substrate still works for advanced tests. |
| Browser | Type in header/body/footer/title; parent rerender does not steal focus; toolbar button preserves active root; undo/redo preserves focused-root caret; blank-area clicks map to expected root/caret; select-all/copy/paste/shortcuts stay root-local. |
| Migration / adoption | Single-root `<Slate editor><Editable /></Slate>` remains unchanged; old advanced `<SlateRuntime><Slate root>` path still has tests or docs; new hooks are additive aliases where possible. |
| Docs / examples | Canonical example uses one provider and many editables; source-cleanliness check rejects app-owned focus/selection repair; docs call runtime/view APIs advanced substrate, not bad APIs. |
| Performance | Selector fanout test, one listener pair test, root-local DOM sync test, and stress budget notes for 10x/100x roots. |
| Issue accounting | No new fixed/improved claims; related issue rows stay related until exact repro proof lands. |

Security-specific proof is not applicable. The risk is editor behavior,
selection, performance, and public API adoption.

### Adoption And Rollback Answer

Adoption:

- implement as additive canonical DX first;
- keep existing advanced substrate usable during the transition;
- keep single-root behavior unchanged;
- add root-named hooks as wrappers over existing runtime selector behavior when
  possible;
- rewrite only the canonical multi-root example after package contracts pass.

Rollback/remediation:

- if `<Editable root>` proves too risky, keep `<SlateRuntime><Slate root>` as
  the escape hatch while preserving the package-level focus/selection contract;
- if active-editor convenience is too magical, keep `useSlateRootEditor(root)`
  as the documented command path and demote `useSlateActiveEditor`;
- if source-cleanliness blocks legitimate advanced examples, scope it tighter
  to `multi-root-document.tsx` only;
- if root selector fanout is broad, do not ship the example rewrite until
  selector filtering is fixed.

### High-Risk Verdict

Keep, with guardrails.

The risk is real, but the current app-owned focus/selection repair is worse.
The plan is acceptable only because it preserves the low-level substrate,
requires explicit root-editor APIs, and blocks execution closure on package and
browser proof.

### Score After Pass 8

Total rises from `0.90` to `0.91`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.87 | 0.89 | High-risk pass adds listener/fanout/DOM-sync closure blockers. |
| Slate-close unopinionated DX | 0.92 | 0.92 | No change; decision already accepted with maintainer objections answered. |
| Plate and slate-yjs migration backbone | 0.86 | 0.87 | Adoption/rollback keeps raw primitives and advanced substrate available. |
| Regression-proof testing strategy | 0.89 | 0.92 | Expanded proof plan covers unit, integration, browser, migration, docs, perf, and issue accounting. |
| Research evidence completeness | 0.90 | 0.90 | No change. |
| shadcn-style composability and hook/component minimalism | 0.89 | 0.89 | No change. |

Weighted total: `0.91`.

Still below threshold because the ecosystem maintainer pass, revision pass,
issue sync accounting, and closure gates are open.

### Pass 8 Plan Deltas

- Added high-risk trigger.
- Added blast-radius matrix.
- Added three-scenario pre-mortem.
- Added expanded proof plan.
- Added adoption and rollback/remediation answer.
- Kept the plan with guardrails.
- Raised score to `0.91`, still pending.

## Pass 9 - Ecosystem Maintainer Pass

Ecosystem maintainer pass applied because this plan touches root identity,
React runtime boundaries, extension hook surfaces, state fields, operation
routing, and collaboration-relevant local metadata.

### Plate / Plugin Maintainer Answer

Can a product layer migrate without wrapping every core call, losing
composition, or becoming a compatibility junk drawer?

Yes, if raw Slate keeps this boundary:

- raw Slate exposes primitives: `<Slate editor>`, `<Editable root>`,
  `useSlateRootEditor(root)`, `useSlateActiveRoot`, `useSlateRootState`,
  state fields, `editor.read`, `editor.update`, `state.*`, and `tx.*`;
- raw Slate keeps render/event escape hatches and model/runtime extension
  namespaces;
- Plate owns product wrappers: document layout presets, toolbars, menus,
  comments, review panels, keymaps, input rules, paste rules, renderer
  registries, and opinionated state fields;
- root/view substrate stays available for custom hosts but does not become the
  first teaching layer.

The Plate-fit ledgers already make this law explicit: renderer composition
pressure is real, but raw Slate should not own a renderer registry; Plate owns
product renderer/plugin composition. This multi-root plan follows the same
rule. It gives Plate a better primitive backbone rather than shipping a raw
Slate `MultiRootEditor`.

### slate-yjs / Collaboration Maintainer Answer

Do operations, identity, snapshots, normalization, remote apply, and conflict
behavior stay deterministic?

Yes, with these constraints:

- roots are part of the document/runtime value, not app React state;
- operations remain root-explicit or root-resolved by transaction/view context;
- commits remain the local execution unit for history, rendering, and DOM
  repair;
- state fields carry explicit policy (`persist`, `history`, `collab`) instead
  of hiding non-node state inside document nodes;
- active root and DOM focus are local runtime metadata by default, not
  collaborative document state;
- remote apply must not depend on mounted React editables;
- collaboration proof stays operation/transaction based, not DOM based.

This does not claim slate-yjs adapter compatibility. It says the raw substrate
does not block it. Existing collaboration ledger rows stay conservative:
operation replay and high-QPS selection work can improve the collaboration
family, but no OT/Yjs/browser collaboration closure is created by this API
cleanup.

### Affected Extension Points

| Surface | Ecosystem rule |
| --- | --- |
| `Editable root` | Public root mount primitive for raw Slate and Plate wrappers. |
| `useSlateRootEditor(root)` | Explicit command route for toolbars and product UI. |
| `useSlateActiveRoot` | Local UI/runtime signal, not collaborative document truth. |
| `useSlateRootState(root, selector)` | Root-scoped selector primitive for product chrome and diagnostics. |
| `useStateFieldValue` / `useSetStateField` / optional `useStateField` | Document-owned non-node state with explicit persistence/history/collab policy. |
| `state.*` / `tx.*` extension namespaces | Plugin migration backbone for typed read/write extension APIs. |
| `SlateRuntime` / `createEditorView` | Advanced substrate for custom hosts and adapters, not removed. |

### Plugin Migration-Backbone Surface

Plate/plugin code should be able to migrate by wrapping primitives:

```tsx
function DocumentFrame({ editor }: { editor: Editor }) {
  return (
    <Slate editor={editor}>
      <PlateTitleField />
      <Editable root="header" />
      <Editable />
      <Editable root="footer" />
      <PlateToolbar />
    </Slate>
  )
}
```

Toolbar commands should use explicit root editor access when needed:

```ts
const root = useSlateActiveRoot()
const editor = useSlateRootEditor(root)

editor.update((tx) => {
  tx.nodes.set({ type: 'heading' })
})
```

Plugins should extend `state` and `tx` namespaces rather than monkeypatching
root view internals:

```ts
defineEditorExtension({
  key: 'comments',
  state: {
    comments(state) {
      return { activeThread() {} }
    },
  },
  tx: {
    comments(tx) {
      return { resolveThread() {} }
    },
  },
})
```

That gives Plate product DX room without forcing raw Slate to own Plate-shaped
APIs.

### Collaboration Contract Affected

| Contract | Required answer |
| --- | --- |
| Root identity | Serialized operations and snapshots must identify the root deterministically. |
| Local active root | Must stay local metadata unless explicitly modeled as shared document state. |
| State fields | Must declare `collab` policy; shared fields replay through transaction/state APIs. |
| Remote apply | Must not require mounted React views or DOM selection. |
| History | Local undo/redo can restore local focus/selection, but remote collaboration metadata must not enter local undo accidentally. |
| Normalization | Root-local normalization must remain deterministic independent of mounted editable surfaces. |

### Proof Required Before Closure

- Package contract: operations/state fields replay without mounted React views.
- Package contract: root-explicit operations do not depend on active DOM root.
- Package contract: active-root/focus metadata is not serialized as shared
  document state by default.
- React contract: Plate-style wrapper can render title/header/main/footer with
  one `<Slate>` and root editables.
- Browser contract: toolbar command through `useSlateRootEditor(activeRoot)`
  mutates the intended root.
- Issue accounting: no new collaboration, renderer registry, keymap, or
  product-wrapper issue claims.

### Ecosystem Verdict

Keep.

The plan gives ecosystem maintainers the right substrate:

- Plate gets primitive composition and extension namespaces, not a raw-Slate
  product component.
- slate-yjs/collab gets deterministic roots, operations, state fields, and
  local-only focus semantics, not React-controlled document truth.

### Score After Pass 9

Total stays `0.91`, but the migration dimension improves.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.89 | 0.89 | No new perf proof. |
| Slate-close unopinionated DX | 0.92 | 0.92 | No change. |
| Plate and slate-yjs migration backbone | 0.87 | 0.91 | Plate/plugin and collab maintainer answers are now explicit. |
| Regression-proof testing strategy | 0.92 | 0.92 | No change. |
| Research evidence completeness | 0.90 | 0.91 | Ecosystem ledger rows are now tied to the plan. |
| shadcn-style composability and hook/component minimalism | 0.89 | 0.89 | No change. |

Weighted total: `0.91`.

Still below threshold because revision, issue sync accounting, and closure
gates are open.

### Pass 9 Plan Deltas

- Added Plate/plugin maintainer answer.
- Added slate-yjs/collab maintainer answer.
- Named affected extension points.
- Added plugin migration-backbone surface.
- Added collaboration contract and proof requirements.
- Kept no-new-issue-claims policy.
- Score remains `0.91`, still pending.

## Pass 10 - Revision Pass

Revision pass applied. This pass folds accepted guardrails back into the
top-level target so Ralph gets one coherent plan instead of a pile of review
appendices.

### Revisions Applied

| Area | Before revision | After revision |
| --- | --- | --- |
| Current status | Pointed to ecosystem pass and revision-next. | Points to revision complete and issue-sync next. |
| Score header | Said current score was after pass 8. | Updated to pass 10 score `0.92`. |
| Completion wording | Said full Slate Ralplan gates broadly remained open. | Names the actual remaining gates: issue-sync accounting and closure. |
| Runtime substrate wording | `SlateRuntime` "may remain" but docs/examples should not teach it first. | `SlateRuntime` remains valid advanced substrate; canonical examples avoid it, advanced docs may document it. |
| Active editor hook | Preferred `useSlateActiveEditor()` first. | Canonical command route is explicit `useSlateRootEditor(useSlateActiveRoot())`; `useSlateActiveEditor()` is optional convenience only. |
| Test target | Allowed `useSlateActiveEditor` or root editor as equivalent. | Requires `useSlateRootEditor(activeRoot)` proof; optional active-editor wrapper proof only if shipped. |
| Ralph order | Root hook list treated active/root editor as alternatives. | Requires `useSlateRootEditor`; active-editor convenience is optional. |

### Final Target After Revision

Canonical public API:

```tsx
const editor = useSlateEditor({ initialValue, extensions })

return (
  <Slate editor={editor}>
    <DocumentTitleInput />
    <Editable root="header" />
    <Editable />
    <Editable root="footer" />
  </Slate>
)
```

Canonical command path:

```tsx
const activeRoot = useSlateActiveRoot()
const editor = useSlateRootEditor(activeRoot)

editor.update((tx) => {
  tx.history.undo()
})
```

Advanced substrate:

- `SlateRuntime`
- `<Slate root>`
- `createEditorView`
- `useSlateRuntimeState`
- `useSlateViewState`

Those APIs stay valid for custom hosts, adapter authors, and advanced docs.
They are not canonical example DX.

### Accepted Guardrails Now In The Target

- Raw Slate ships primitives, not a product `MultiRootEditor`.
- Plate owns product wrappers, renderer registries, keymaps, input rules,
  paste rules, comments, and toolbars.
- State fields are document-owned only when they declare persistence/history or
  collaboration policy; product UI state stays outside raw Slate.
- Active root/focus metadata is local runtime state by default, not shared
  document/collaboration truth.
- New fixed/improved issue claims remain zero.
- Source-cleanliness assertions apply to the canonical multi-root example only,
  not advanced docs or package tests.

### Remaining Issue-Sync Scope

Pass 11 must sync wording in:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`

Required sync decisions:

- revise stale accepted target wording from optional `SlateRuntime` plus
  `<Slate root>` as public target to canonical `<Slate editor>` plus
  `<Editable root>`;
- keep `#6016` triage-closed/non-fix;
- keep `#5537`, `#5117`, `#3497`, `#3634`, `#4961`, `#3893`, `#5867`,
  `#5538`, and `#5826` related only;
- keep `#5281` not claimed;
- preserve `#4612` improves claim;
- preserve `#6013`, `#5605`, and `#5709` fixed claims;
- add no new fixed/improved claim counts.

### Score After Pass 10

Total rises from `0.91` to `0.92`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.89 | 0.90 | Final target now explicitly preserves root-scoped selector and runtime-substrate guardrails. |
| Slate-close unopinionated DX | 0.92 | 0.93 | Canonical command path is explicit root editor, reducing magic while keeping one-provider DX. |
| Plate and slate-yjs migration backbone | 0.91 | 0.92 | Ecosystem answers are folded into the target and issue-sync scope. |
| Regression-proof testing strategy | 0.92 | 0.92 | No change; proof rows already explicit. |
| Research evidence completeness | 0.91 | 0.91 | No change. |
| shadcn-style composability and hook/component minimalism | 0.89 | 0.91 | Product wrapper remains cut and primitive composition is now top-level target. |

Weighted total: `0.92`.

The score threshold is met, but completion is still pending. Score is necessary,
not sufficient. Issue sync accounting and closure gates remain open.

### Pass 10 Plan Deltas

- Folded maintainer/high-risk/ecosystem guardrails into top-level sections.
- Made `useSlateRootEditor(activeRoot)` the canonical command route.
- Kept `useSlateActiveEditor()` optional only.
- Clarified advanced runtime/view APIs remain valid substrate.
- Added explicit issue-sync scope for pass 11.
- Raised score to `0.92`, still pending.

## Pass 11 - Issue Sync Accounting

Issue-sync accounting pass applied.

Read set:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`

### Synced Artifacts

| Artifact | Change |
| --- | --- |
| `docs/slate-issues/gitcrawl-v2-sync-ledger.md` | Revised React multi-root DX wording from optional `SlateRuntime` + `<Slate root>` as the accepted public target to canonical `<Slate editor>` + multiple `<Editable root>` surfaces. Preserved runtime/view APIs as advanced substrate. |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | Revised React Runtime Provider / Multi-root Planning Sync target to canonical provider/editable-root API, with runtime/view APIs as advanced substrate/custom-host APIs. |
| `docs/slate-v2/references/pr-description.md` | Replaced stale "later optional SlateRuntime / Slate root" wording with the canonical multi-root React DX target and advanced substrate note. |

Generated live rows were read for current issue presence, but not edited.

### Claim Accounting

- New fixed claims: `0`.
- New improved claims: `0`.
- `#6016`: remains triage-closed/non-fix. Shared node-object graphs across
  independent editor runtimes remain unsupported; canonical answer is one
  editor/runtime with root-bound editable surfaces.
- `#5537`, `#5117`, `#3497`, `#3634`, `#4961`, `#3893`, `#5867`, `#5538`,
  `#5826`: remain related pressure only.
- `#5281`: remains not claimed.
- `#4612`: preserves existing improves claim.
- `#6013`, `#5605`, `#5709`: preserve existing fixed claims.
- Collaboration, renderer registry, keymap, product-wrapper, and slate-yjs rows
  get no new claims from this plan.

### Sync Decision

The issue-facing truth is now aligned:

```txt
canonical API:
  <Slate editor={editor}>
    <Editable root="header" />
    <Editable />
    <Editable root="footer" />
  </Slate>

advanced substrate:
  SlateRuntime
  <Slate root="...">
  createEditorView
  useSlateRuntimeState
  useSlateViewState
```

This is a planning/accounting sync only. It does not claim `.tmp/slate-v2`
implementation proof.

### Score After Pass 11

Score remains `0.92`.

The issue-sync gate is now complete. The only remaining scheduled pass is the
closure score and final gates pass.

### Pass 11 Plan Deltas

- Synced stale public target wording in the manual issue sync ledger.
- Synced stale public target wording in the issue coverage matrix.
- Synced stale public target wording in the PR reference.
- Preserved all issue claim counts.
- Left generated live rows untouched.

## Pass 12 - Closure Score And Final Gates

Closure pass applied. This pass audits whether the Slate Ralplan lane can
truthfully move from pending to done.

### Closure Audit

| Gate | Result | Evidence |
| --- | --- | --- |
| Pass schedule | pass | Pass rows 1-11 were complete before this closure pass; pass 12 is now complete. |
| Current pass | pass | `current_pass` is `closure-score-and-final-gates`; `current_pass_status` is complete. |
| Confidence threshold | pass | Final score is `0.92`, meeting the `>= 0.92` threshold. |
| Minimum dimension floor | pass | Lowest final dimension is `0.90`, above the `0.85` floor. |
| Issue discovery and ClawSweeper discipline | pass | Issue discovery, issue-ledger pass, and issue-sync accounting are complete. |
| Issue claim accounting | pass | New fixed claims: `0`; new improved claims: `0`; existing claims preserved only where already recorded. |
| Research / ecosystem evidence | pass | Research synthesis, ecosystem maintainer pass, Plate/plugin, and slate-yjs/collab answers are complete. |
| Performance / DX / migration / regression passes | pass | Perf/DX/migration/regression pressure rows and proof matrix are complete. |
| Maintainer and high-risk passes | pass | Maintainer objection, steelman, high-risk deliberate mode, adoption, rollback, and proof guardrails are complete. |
| Allowed edit scope | pass | This skill edited only planning, issue-ledger/reference, and scoped `.tmp` state artifacts. No `.tmp/slate-v2` implementation files were edited. |
| Continuation state | pass | No next Slate Ralplan pass remains. Ralph owns implementation execution. |

### Final Confidence Score

| Dimension | Final score | Closure note |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.90 | Root-scoped selector and runtime-substrate guardrails are explicit. |
| Slate-close unopinionated DX | 0.93 | Canonical API is one `<Slate editor>` with many `<Editable root>` surfaces. |
| Plate and slate-yjs migration backbone | 0.92 | Raw Slate primitives, Plate/product ownership, and collab-local metadata are separated. |
| Regression-proof testing strategy | 0.92 | Package, browser, source-cleanliness, and workspace proof rows are explicit. |
| Research evidence completeness | 0.91 | Lexical, ProseMirror, Tiptap, React 19.2, Plate, slate-yjs, Pretext/Premirror, and VS Code evidence is synthesized. |
| shadcn-style composability and hook/component minimalism | 0.91 | Product wrapper remains cut; primitive composition is the top-level target. |

Weighted total: `0.92`.

Threshold: pass.

### Done Handoff

- Plan is ready for Ralph execution.
- Accepted public API: `<Slate editor={editor}>` with multiple
  `<Editable root>` surfaces.
- Canonical command path: `useSlateRootEditor(useSlateActiveRoot())`.
- Optional convenience: `useSlateActiveEditor()`, only if it stays a thin
  package-owned helper.
- Advanced substrate remains valid: `SlateRuntime`, `<Slate root>`,
  `createEditorView`, `useSlateRuntimeState`, and `useSlateViewState`.
- Issue sync is closed with zero new fixed/improved claims.
- Implementation must happen in `.tmp/slate-v2`, not from this Slate Ralplan
  pass.

Required Ralph verification from `.tmp/slate-v2`:

```bash
bun test ./packages/slate-react/test/slate-runtime-provider-contract.test.tsx
bun test ./packages/slate-react/test/state-field-selector-contract.test.tsx
bun --filter ./packages/slate-react typecheck
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1
bun lint:fix
```

## Ralph Execution Ledger

Execution started for the closed Slate Ralplan.

### Slice 1 - TDD Pass

| Field | Value |
| --- | --- |
| Status | complete |
| Owner | `.tmp/slate-v2/packages/slate-react` |
| Public behavior | `<Slate editor>` hosts multiple root-bound `<Editable root>` surfaces without app-created views. |
| Trigger | Public React API behavior requires red-green-refactor proof. |
| Scope | Package API/hooks/provider, canonical multi-root example, focused package/browser verification. |
| Related issue sweep | No rerun yet; pass 11 already swept this multi-root React DX surface with zero new fixed/improved claims. |
| Reference docs | Added `docs/solutions/developer-experience/2026-05-23-slate-react-multi-root-editable-dx-needs-package-owned-root-views.md`; no issue-claim or PR narrative change. |
| Red proof | `bun --filter ./packages/slate-react test:vitest slate-runtime-provider-contract -t "Slate editor hosts multiple root-bound Editable surfaces"` failed with `useSlateActiveRoot is not a function`. |
| Implementation | Added root-named hooks, root-bound view editor creation, `<Editable root>`, top-level `<Slate editor>` runtime context, root-local DOM text sync, and rewrote the canonical example to one Slate provider. |
| Build-fix | Site typecheck exposed example helper type erasure around history; fixed helper types with `ReactEditor` and removed global DOM lookup for root chrome focus. |
| Diff review | Complete; no P0/P1/P2 findings. Accepted small internal casts around view-editor rebinding because the runtime already owns that substrate boundary. |
| Verification | `bun lint:fix`; `bun --filter ./packages/slate-react test:vitest slate-runtime-provider-contract`; `bun --filter ./packages/slate-react test:vitest state-field-selector-contract`; `bun --filter ./packages/slate-react typecheck`; `bun typecheck:site`; source-cleanliness `rg`; `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1`. |
| Next action | None. Ralph execution is complete. |
