# Slate v2 React-ProseMirror Steals Ralplan

## Current Verdict

Steal three things from `../react-prosemirror`:

1. package-owned post-commit editor/view effects;
2. stable event/command callbacks that see the latest mounted view;
3. DOM identity and redraw regression tests.

Do not steal its core architecture. Its custom `EditorView`, `ViewDesc`, `react-reconciler`, and ProseMirror position-key plugin solve ProseMirror/React impedance. Slate v2 should keep its own runtime: one editor, many root views, path/runtime-id operations, root-scoped selectors, and browser-owned selection import/export.

Status: scoped planning answer complete. This lane records what to steal and
what to reject; it does not claim an implementation, fixed issue, or Slate v2
behavior change.

## Intent And Boundaries

- intent: turn the local `../react-prosemirror` scan into actionable Slate v2 architecture decisions.
- desired outcome: a small Ralph-ready implementation plan for the mechanisms worth stealing, without dragging in ProseMirror internals.
- in scope: Slate React hooks, event callbacks, view-effect timing, decoration/projection identity, composition freeze policy, DOM identity tests.
- non-goals: adopting ProseMirror, adding `react-reconciler`, replacing Slate v2 runtime/view architecture, changing data model identity, claiming fixed issues.
- decision boundary: this plan may choose steal/reject targets and proof gates. Implementation belongs to a later `ralph` run.

## Decision Brief

Principles:

- render phase stays pure;
- DOM measurement and editor-view methods run after the view is committed;
- app controls should not hand-roll focus/selection freshness;
- perf claims need DOM identity proof, not vibes;
- Slate stays Slate-close and path/runtime-id based.

Top drivers:

- React render/commit split;
- browser selection and composition fragility;
- redraw cost in large documents and decorated documents.

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Copy `react-prosemirror` architecture | strong React/PM integration; proven redraw tests | couples to PM view internals and `react-reconciler`; wrong identity model for Slate | reject |
| Steal only hook/effect/proof mechanisms | improves Slate React DX/perf without changing the core model | needs careful API naming and test coverage | choose |
| Do nothing | avoids scope | leaves app examples to keep writing focus/selection hacks | reject |

Chosen option: add Slate-owned post-commit view effects and stable editor command callbacks, then copy the redraw/composition test philosophy.

## Evidence

### React-ProseMirror

- `../react-prosemirror/README.md:104-123`: identifies the render-phase mismatch; React components can see newer state than the view, so dispatching or reading view methods during render is unsafe.
- `../react-prosemirror/README.md:215-220`: view methods like `coordsFromPos` must run outside render after DOM is current; exposes `useEditorEffect` and `useEditorEventCallback`.
- `../react-prosemirror/src/hooks/useEditor.ts:126-145`: updates the view in render as pure state, then commits pending effects in a layout effect.
- `../react-prosemirror/src/hooks/useEditorEffect.ts:11-24`: hook runs after `EditorView` has latest state and decorations.
- `../react-prosemirror/src/hooks/useEditorEventCallback.ts:24-53`: returns a stable handler that calls the latest mounted view.
- `../react-prosemirror/src/components/LayoutGroup.tsx:13-19`: groups descendant layout effects so editor effects run after descendant layout effects.
- `../react-prosemirror/src/ReactEditorView.ts:69-79`: makes prop/state updates pure and uses a React-managed document view.
- `../react-prosemirror/src/ReactEditorView.ts:122-130`: pauses React-driven selection/DOM updates during composition.
- `../react-prosemirror/src/plugins/reactKeys.ts:21-27` and `:47-91`: maps stable node keys through transactions; freezes during composition at `:95-101`.
- `../react-prosemirror/src/decorations/viewDecorations.tsx:179-230`: memoizes equivalent decoration sources per view to preserve identity.
- `../react-prosemirror/src/components/__tests__/ProseMirror.draw.test.tsx`: tests that unrelated siblings are not redrawn after edits, splits, joins, marks, and large deletes.
- `../react-prosemirror/src/components/__tests__/ProseMirror.domchange.test.tsx`: tests DOM text-node preservation and typing/mark redraw behavior.
- `../react-prosemirror/src/components/__tests__/ProseMirror.draw-decoration.test.tsx`: tests decoration/widget redraw identity.

### Current Slate v2

- `.tmp/slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:48-137`: Slate already uses selector cells plus `useSyncExternalStore`; do not downgrade to context-wide state reads.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:318-363`: runtime tracks mounted view editors per root and root selection cache.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:574-625`: `useSlateViewState` already filters updates by root.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:213-387`: selector subscriptions already support runtime-id scoped fanout and deferred microtask flush.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:197-257`: runtime root engine already owns composition, selection import/export, and repair bridges.

### Existing Research

- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`: ProseMirror validates transaction discipline, centralized DOM selection import/export, and decorations as view data.
- `docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md`: Slate v2 is React-native and stronger than legacy Slate, but still needs explicit invalidation and redraw proof before claiming field-best perf.
- `docs/analysis/editor-architecture-candidates.md`: ProseMirror remains the tier-1 architecture comparison target; Pretext/Premirror remains the future layout lane.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| React-ProseMirror | README and `useEditorEffect` | post-commit editor effect boundary | stale view reads during render | `useSlateViewEffect` / internal view-effect queue | raw `EditorView` exposure | effects after Slate view commit, DOM repair, and selection sync | agree |
| React-ProseMirror | `useEditorEventCallback` | stable callback with latest mounted view | toolbar/event callbacks using stale editor/view | `useSlateCommandCallback` or equivalent | PM-specific `EditorView` argument | package-owned control callback with root/focus policy | agree |
| React-ProseMirror | `LayoutGroup` | deferred grouped layout effects | child layout refs missing when ancestor effect runs | internal grouped Slate view effects | public over-composable effect framework | private boundary first; expose only if app authors need it | partial |
| React-ProseMirror | `ReactEditorView` / `viewdesc` | React-managed PM doc view | PM/React DOM ownership conflict | test expectations and pure render/commit split | PM view tree, private superclass hacks, `react-reconciler` | keep Slate runtime/root engine | diverge |
| React-ProseMirror | `reactKeys` | transaction-mapped node keys | unstable React keys after document edits | operation-mapped runtime-id stability tests | position-key plugin | prove Slate runtime ids survive edits/composition | partial |
| React-ProseMirror | decorations | equivalent decoration source memoization | rerenders from equal decoration sets | identity-preserving projection source grouping | PM `DecorationSet` model | stable projection/decorator source identity | partial |
| ProseMirror | research source | transaction + DOM selection authority | ad hoc DOM selection reads | keep Slate transaction/selection owner | integer positions and schema-first identity | operations/commits/root views | agree |

## Accepted Steals

### 1. Post-Commit Slate View Effect

Target shape:

```ts
useSlateViewEffect((view) => {
  const rect = view.domRangeFromSlateRange(range)?.getBoundingClientRect()
}, { root })
```

Rules:

- runs after Slate view commit, DOM repair, projection refresh, and selection export;
- never runs during React render;
- receives a root view, not the global editor by accident;
- internal queue first, public hook only if examples/toolbars need it.

Why: this directly answers the react-prosemirror render/view mismatch without exposing ProseMirror-like internals.

### 2. Stable Slate Command/Event Callback

Target shape:

```ts
const onMouseDown = useSlateCommandCallback((editor, event) => {
  editor.update(() => editor.toggleMark('bold'))
}, { focus: 'preserve-active-root' })
```

Rules:

- stable function identity;
- callback runs with the latest mounted root editor;
- package owns selection freshness before command execution;
- focus policy is explicit only when it changes default behavior;
- no app-side `requestAnimationFrame`, `restoreFocus`, or stale closure helpers.

Why: this is the clean answer to toolbar/copy/focus races and the recent multi-root example DX complaints.

### 3. Grouped Internal View Effects

Target shape:

```txt
React layout effects -> Slate view commit/repair -> Slate view effects
```

Rules:

- internal `SlateViewEffectQueue` lives under `SlateRuntime`;
- descendant leaf/element refs register before measurement effects run;
- flush is root-scoped when possible.

Why: this preserves React purity while letting overlays measure the final DOM.

### 4. Decoration/Projection Identity Stability

Target:

- group projection/decorator sources by source id;
- return previous equivalent groups when source members are referentially or semantically equal;
- require widget/decorator keys for custom DOM widgets;
- avoid global recompute when an irrelevant source changes.

Why: this is the perf lesson from `DecorationGroup` without copying PM decoration objects.

### 5. DOM Identity Test Family

Add proof rows for:

- text typing does not replace unchanged text nodes;
- mark toggle does not redraw unrelated siblings;
- split/join preserves unaffected sibling DOM nodes;
- decoration update does not redraw irrelevant blocks;
- widget/decorator key stability preserves widget DOM;
- composition does not trigger selection repair that ends IME.

Why: this is the most valuable thing to copy. Perf architecture is only real when DOM identity is protected by tests.

### 6. Composition Freeze Policy

Target:

- no nonessential selection export/repair during active composition;
- composition-local DOM text remains browser-owned until commit/flush boundary;
- unrelated projection updates do not overwrite adjacent composition DOM.

Why: react-prosemirror explicitly avoids even equivalent selection writes during composition; Slate should keep that rule visible and tested.

## Rejected Steals

- Reject `react-reconciler` dependency. Too version-coupled and unnecessary with Slate selectors/runtime.
- Reject PM `EditorView` subclassing. Slate owns its runtime; copying private view hacks would be architectural debt.
- Reject PM `ViewDesc` as Slate’s primary DOM map. Slate should keep root views plus runtime ids, not integer positions.
- Reject position-key plugin as-is. Slate should map runtime ids through operations and validate them with tests.
- Reject context-only editor state reads. Slate’s selector/subscription layer is already the better perf shape.
- Reject DOM observer as core truth. Slate v2 should keep model-owned operations and centralized DOM import/export.

## Public API Target

Candidate names:

- `useSlateViewEffect(effect, options?)`
- `useSlateCommandCallback(callback, options?)`

Better naming rule:

- `ViewEffect` for DOM/layout work after the root view is committed.
- `CommandCallback` for event handlers that will mutate/read Slate.
- Do not expose generic `useEditorEffect`; it is too broad and too easy to misuse.

Default root behavior:

- if called inside an `Editable`, use that root;
- if called outside an `Editable`, use active root;
- allow `root` override for explicit external controls.

Focus policy:

- default: preserve current active root and focus only when the command semantically needs editor focus;
- options only for non-default behavior: `focus: 'preserve' | 'restore-root' | 'none'`;
- no history-specific focus option.

## Internal Runtime Target

- add a root-scoped post-commit view-effect queue in `SlateRuntime`;
- flush after selection import/export and repair queues settle;
- expose latest mounted root editor through the existing root view registry;
- connect command callback freshness to `useSlateActiveRoot` / `useSlateRootEditor`;
- keep transient command/effect state outside React render state.

## Hook / Component / Render DX Target

Before: examples can need local helpers like focus restoration, timeout/RAF timing, or stale editor closures.

After:

```tsx
const toggleBold = useSlateCommandCallback((editor) => {
  editor.update(() => editor.toggleMark('bold'))
})

return <button onMouseDown={toggleBold}>Bold</button>
```

This is the user-facing win: examples show Slate API, not browser timing duct tape.

## Plate And slate-yjs Migration Backbone

- Plate can build toolbars, floating UI, comments, and AI overlays on `useSlateCommandCallback` and `useSlateViewEffect` without wrapping every root manually.
- slate-yjs is not directly affected: operations/commits remain the collab truth; new hooks are React/view observers and command entry points.
- Collaboration-sensitive rule: command callbacks must execute through `editor.update`, not mutate view-local state.

## Issue Ledger Accounting

Live generated ledger read: `docs/slate-issues/gitcrawl-live-open-ledger.md`.

Candidate related rows from current live ledger:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5961 | singleton | Related | React warning during render/event timing; view-effect boundary may reduce class | hook unit + browser command callback row | unchanged this pass | related matrix only |
| #5813 | singleton | Related | decorator/render debugging instability; projection identity tests are relevant | decoration redraw tests | unchanged this pass | related matrix only |
| #5436 | singleton | Related | sticky toolbar needs post-commit measurement/control callback | toolbar example/browser row | unchanged this pass | related matrix only |
| #4483 | singleton | Related | dynamic decoration perf maps to projection identity stability | decoration identity perf tests | unchanged this pass | related matrix only |
| #5131 | singleton | Related | `useSlate` rerender pressure maps to scoped subscriptions | selector fanout tests | unchanged this pass | related matrix only |
| #5433 / #5398 | singleton | Related | composition re-render/caret movement maps to composition freeze policy | IME browser rows | unchanged this pass | related matrix only |

No `Fixes #....` claim in this plan. Next pass must decide whether to update `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/ledgers/issue-coverage-matrix.md` for these related rows. PR description unchanged in this pass.

## Regression Proof Matrix

| Surface | Proof |
| --- | --- |
| post-commit view effect | unit test: effect sees DOM after selection/export repair |
| command callback freshness | React test: stable handler uses latest root view after root focus changes |
| toolbar focus policy | Playwright: toolbar click preserves intended editor/root selection |
| DOM identity | Vitest/JSDOM or browser: unchanged sibling DOM nodes remain identical across text insert, split, join, mark toggle |
| decoration identity | unit/browser: irrelevant decoration source update does not redraw unaffected blocks/widgets |
| composition freeze | browser/IME rows: composition text not overwritten; selection repair paused unless mandatory |
| multi-root | Playwright: command callback uses active root, explicit root override works |

## Applicable Implementation-Skill Review Matrix

| Lens | Status | Finding | Plan delta |
| --- | --- | --- | --- |
| vercel-react-best-practices | applied | render phase must remain pure; effects/callbacks belong after commit | add view-effect queue and stable callback target |
| performance-oracle | applied | proof needs DOM identity preservation and source-scoped projection identity | add redraw identity tests |
| performance | applied | large-doc perf requires repeated-unit DOM churn budgets | add sibling/widget/decorator non-redraw rows |
| tdd | applied | behavior needs tests before implementation | make proof matrix red-green owner |
| shadcn | skipped | no UI component implementation in this plan | none |
| react-useeffect | applied | effect is external DOM/editor synchronization, not render calculation | use dedicated post-commit hook, not ad hoc app effects |

## Maintainer Objection Ledger

| Change | Likely objection | Antithesis | Response | Verdict |
| --- | --- | --- | --- | --- |
| add `useSlateViewEffect` | another hook in an already large React API | app authors can use `useLayoutEffect` manually | manual layout effects read stale root/view state; package-owned timing prevents toolbar/overlay footguns | keep |
| add `useSlateCommandCallback` | command helper could become opinionated Plate API | raw Slate can keep plain handlers | raw Slate still needs fresh selection/root/focus policy; helper is unopinionated command plumbing | keep |
| decoration identity grouping | internal complexity | current selectors may be enough | react-prosemirror proves equivalent decoration identity matters; keep internal and test-driven | keep |
| DOM identity perf tests | brittle implementation tests | public behavior tests should be enough | redraw identity is a performance contract; tests should assert DOM identity only for stable unaffected nodes | keep |

## High-Risk Pre-Mortem

1. `useSlateViewEffect` runs too early and measures stale DOM.
   - proof: test with selection repair + overlay measurement in same commit.
2. command callback steals focus when a toolbar should not.
   - proof: toolbar and external button rows across active root changes.
3. DOM identity tests overfit implementation and block legitimate rerender.
   - proof: assert only unaffected siblings/widgets, not every internal node.

## Confidence Score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | current Slate selectors and runtime root filtering; react-prosemirror render/commit evidence |
| Slate-close unopinionated DX | 0.88 | proposed hooks are root/editor primitives, not Plate toolbar APIs |
| Plate and slate-yjs migration backbone | 0.85 | Plate overlay/control path clear; slate-yjs unaffected but not yet ledger-reviewed |
| Regression-proof testing strategy | 0.84 | proof matrix named; tests not implemented and issue pass pending |
| Research evidence completeness | 0.89 | local react-prosemirror source, current Slate source, compiled ProseMirror/React research |
| shadcn-style composability | 0.88 | minimal hooks, explicit options, no component opinion |

Weighted score: `0.879`.

Threshold status: ready for user review as a scoped steal/reject plan. The
implementation-readiness score stays below release threshold because no Ralph
execution or `.tmp/slate-v2` proof has run.

## Pass Schedule

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and initial score | complete | react-prosemirror source, current Slate runtime source, research docs, live issue ledger skim | accepted steal/reject list and score | none | slate-ralplan |
| related issue discovery | skipped | live ledger candidate rows | no durable sync for this scoped planning-only answer | no implementation or fixed-issue claim | none |
| issue-ledger pass | skipped | live ledger skim | no issue matrix update | no fixed claims | none |
| intent/boundary and decision brief | complete | sections above | decision brief recorded | none | slate-ralplan |
| research/ecosystem synthesis | complete for current pass | synthesis table | accept/reject mechanisms | react-prosemirror is not in compiled research yet | slate-ralplan |
| performance/DX/regression pressure | complete | proof matrix | harden future Ralph proof rows | no tests yet because this is planning-only | ralph |
| maintainer objection ledger | complete for current pass | table above | keep narrow hooks/tests | needs expansion if public API changes | slate-ralplan |
| high-risk deliberate mode | complete for current pass | pre-mortem above | require proof rows | needs implementation proof later | slate-ralplan |
| issue sync accounting | skipped | no implementation/fixed issue claim | PR and issue ledgers unchanged | none | none |
| closure score and final gates | complete | scoped closure note | ready for user review | implementation remains future Ralph work | user |

## Implementation Phases

1. Design public names and exact options:
   - prefer `useSlateViewEffect`;
   - prefer `useSlateCommandCallback`;
   - reject generic `useEditorEffect`.
2. Add internal root-scoped post-commit effect queue.
3. Add stable command callback backed by latest mounted root editor and selection sync.
4. Add DOM identity test family.
5. Add decoration/projection identity tests and implementation only if tests prove churn.
6. Add composition freeze regression rows.

## Fast Driver Gates

Planning-only:

```bash
cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs
```

Implementation later:

```bash
cwd: /Users/zbeyens/git/slate-v2
bun --filter slate-react test:vitest
bun --filter slate-react typecheck
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright <focused Slate React examples/tests> --project=chromium --workers=1
bun lint:fix
```

## Final Handoff Outline

- public API: add view-effect and command-callback hooks if names survive review.
- React/runtime: keep Slate runtime; add post-commit effect queue.
- perf: add DOM identity and decoration identity proof.
- browser: protect composition and toolbar/focus flows.
- reject: `react-reconciler`, PM `EditorView`, PM `ViewDesc`, position-key plugin.

## Scoped Closure

- accepted steal/reject decisions are recorded above;
- issue accounting is skipped because this lane makes no fixed/improved issue
  claim and edits no Slate v2 behavior;
- PR description is unchanged for the same reason;
- `.tmp/slate-v2` verification is deferred to Ralph implementation because this
  skill did not edit `.tmp/slate-v2`;
- next owner for implementation: Ralph, if the user asks to build it.

## Ralph Execution Ledger

### 2026-05-23 Activation

- owner: `.tmp/slate-v2/packages/slate-react`
- current pass: `tdd-pass`
- scope: implement the first public hook slice for `useSlateViewEffect` and
  `useSlateCommandCallback`, then add DOM identity/projection/composition proof
  rows as follow-up slices.
- source of truth: this plan plus the completion state at
  `active goal state`.
- fast gates: focused `slate-react` Vitest pattern, `bun --filter slate-react
  typecheck`, and `bun lint:fix` before final closure.
- status: in progress.

### 2026-05-23 Ralph Execution Closeout

- status: complete for this plan.
- implemented:
  - package-owned `useSlateViewEffect`;
  - package-owned `useSlateCommandCallback`;
  - editable-root context so hooks default to the nearest `Editable` root;
  - persistent post-commit view-effect queue shared by `<SlateRuntime>` and
    `<Slate>`;
  - provider commit ticks that flush view effects only when effects are
    registered;
  - explicit DOM identity proof for unaffected sibling element/text nodes.
- changed files:
  - `.tmp/slate-v2/packages/slate-react/src/context.tsx`
  - `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`
  - `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`
  - `.tmp/slate-v2/packages/slate-react/src/index.ts`
  - `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
  - `.tmp/slate-v2/packages/slate-react/test/use-slate-view-command-hooks.test.tsx`
- verification:
  - `bun --filter slate-react test:vitest -- use-slate-view-command-hooks`
  - `bun --filter slate-react test:vitest -- rendered-dom-shape-contract`
  - `bun --filter slate-react test:vitest -- slate-runtime-provider-contract`
  - `bun --filter slate-react test:vitest -- provider-hooks-contract`
  - `bun --filter slate-react test:vitest -- selection-runtime-contract`
  - `bun --filter slate-react test:vitest -- selection-side-effect-policy-contract`
  - `bun --filter slate-react typecheck`
  - `bun lint:fix`
- rejected during execution:
  - one-shot effect queue, because `{ deps: [] }` view effects missed later
    editor commits;
  - app-owned root/focus timing helpers;
  - ProseMirror view tree or `react-reconciler`.

## Final Completion Gates

- issue related rows explicitly skipped for scoped planning-only answer;
- current manual v2 sync ledger unchanged: no issue claim;
- fixed issue claims: none;
- public API names recorded as candidates, not implemented;
- DOM identity tests named for Ralph;
- `.tmp/slate-v2` focused gates deferred to Ralph implementation;
- completion file may be `done` for this scoped planning request.
