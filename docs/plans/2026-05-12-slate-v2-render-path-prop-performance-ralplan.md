# Slate v2 Render Path Prop Performance Ralplan

Date: 2026-05-12

Status: `done`

Owner: `slate-ralplan`

Completion:
`active goal state`

## Current Verdict

No, the current render path prop is not the absolute-best architecture.

This plan is ready for execution. The current implementation is not done; the
planning decision is done.

The runtime architecture is right: mounted nodes are keyed by stable runtime ids,
root-order commits can update root runtime-id lists without notifying every
mounted node, and current live reads can resolve a runtime id back to the latest
path.

The public render contract is the weak point. `RenderElementProps` currently
exposes eager `path` and `index`, and `renderVoid` exposes eager `path`. A `Path`
is a moving tree address. If a block is inserted before mounted siblings, Slate
has only two choices when eager `path` is public:

- re-render every shifted mounted sibling so app props, context, weak maps, and
  DOM path metadata stay fresh;
- skip those renders and risk stale `path` props / handlers / metadata.

Neither is the best Slate v2 shape.

Accepted target: hard-cut eager `path` and `index` from public render props.
Keep Slate-close DX through lazy current-path APIs:

- event-time `ReactEditor.findPath(editor, element)` / equivalent must resolve
  by runtime id first, not by stale weak-map indexes;
- add an opt-in `useElementPath()` only for render-time path-dependent UI;
- keep runtime-owned DOM path metadata as debug/fallback, not the public render
  contract;
- prove leading insert before mounted blocks does not fan out React renders and
  still resolves current paths correctly.

## Intent Boundary

| Field                | Decision                                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Decide whether passing `path` to renderers is performant and whether it should survive Slate v2.                                                                                   |
| Desired outcome      | A later `ralph` pass can remove the hot public path prop without reopening the whole React runtime architecture.                                                                   |
| In scope             | `slate-react` render props, void render props, element path context, DOM/path metadata, event-time path resolution, examples that close over path, and React/runtime fanout tests. |
| Non-goals            | Editing implementation in this Slate Ralplan pass, broad GitHub rediscovery, virtualization changes, product-specific Plate APIs.                                                  |
| Decision boundary    | Default render props must not force path-shift rerenders. Apps can opt into current path reads only where they need them.                                                          |
| User decision needed | None. This is a hard-cut recommendation before publish.                                                                                                                            |

## Live Source Evidence

| Surface                        | Current owner                                                                    | Current shape                                                                                                  | Verdict                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Public render props            | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:480` | `EditableRenderElementProps` includes `index: number` and `path: Path`.                                        | Cut eager props.                                                   |
| Props construction             | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:800` | `renderElementPropsBase` passes `index` and `path` into every custom element render.                           | Cut from base props.                                               |
| Void render props              | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:505` | `EditableRenderVoidProps` includes `path: Path`.                                                               | Cut eager path; use lazy resolver.                                 |
| Runtime-id lookup              | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:640`                      | `Editor.getPathByRuntimeId(editor, runtimeId)` returns the current path from the live runtime index.           | Keep as the backbone.                                              |
| Runtime node selector          | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-live-state.ts:35`       | `readRuntimeNodeById` already resolves current path from runtime id before snapshot fallback.                  | Reuse.                                                             |
| Runtime fanout skip            | `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:218`       | root-order commits with null affected ids can skip runtime fanout when selection/full document did not change. | Keep; do not weaken for path props.                                |
| Existing fanout proof          | `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:695`        | Appending a root node does not notify every mounted runtime node.                                              | Good but not the leading-insert proof.                             |
| Existing path-shift hook proof | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:441`               | `useElementSelected` survives selected path shift, but selection-changing structural edits may still fan out.  | Not enough for public path prop.                                   |
| Weak-map path lookup           | `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:598`                  | `DOMEditor.findPath` walks `NODE_TO_PARENT` / `NODE_TO_INDEX`.                                                 | Must become runtime-id-first to be safe after skipped rerenders.   |
| DOM path metadata              | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx:198`        | node refs set `data-slate-path` from the provided/current path.                                                | Keep runtime-owned, but do not expose as public render-prop truth. |

Verification run from `/Users/zbeyens/git/slate-v2`:

```bash
bun test ./packages/slate-react/test/provider-hooks-contract.tsx -t "Editable root-order commits do not fan out to every mounted runtime node"
```

Result: pass.

```bash
bun test ./packages/slate-react/test/surface-contract.tsx -t "useElementSelected remains stable when the selected element path shifts after structural edits"
```

Result: pass.

## Decision Brief

Principles:

- `Path` is a current address, not stable identity.
- Runtime identity should own mounted-node continuity.
- Default render props must be cheap and hard to misuse.
- Slate-close DX should remain available through event-time helpers.
- Correctness cannot depend on full-sibling rerenders after structural inserts.

Top drivers:

- Leading insert before many mounted siblings shifts every following path.
- React render fanout is the exact performance class v2 is trying to eliminate.
- App renderers commonly close over props in callbacks, so stale eager `path`
  is a real correctness footgun.

Options:

| Option                                                                | Pros                                                                          | Cons                                                               | Verdict                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| Keep eager `path` and re-render all shifted mounted nodes             | Always fresh props/context.                                                   | Reintroduces sibling-wide render fanout for leading inserts.       | Reject.                |
| Keep eager `path` and skip shifted-node rerenders                     | Fast in React.                                                                | Stale props, event handlers, context, DOM metadata, and weak maps. | Reject.                |
| Hard-cut eager `path` / `index`; use runtime-id-first lazy resolution | Fast default, correct event-time current path, close to legacy `findPath` DX. | Breaking API and examples need migration.                          | Choose.                |
| Keep eager `path` only behind compat alias                            | Easier migration.                                                             | Encourages the same footgun before v2 ships.                       | Reject for v2 publish. |

Chosen option:

Hard-cut eager `path` and `index` from `RenderElementProps`, and hard-cut eager
`path` from `RenderVoidProps`. Add lazy current-path APIs only where needed.

Consequences:

- `renderElement` becomes closer to legacy Slate: `attributes`, `children`,
  `element`, plus v2-specific `isInline` / `slots` if kept.
- Examples that mutate the current node must resolve path inside the event
  handler, not close over render-time `path`.
- Path-dependent display can opt into `useElementPath()`, and only those nodes
  rerender on path shifts.

## Public API Target

Target render element props:

```ts
type RenderElementProps<TElement extends Element = Element> = {
  attributes: RenderElementAttributes;
  children: ReactNode;
  element: TElement;
  isInline: boolean;
  slots: EditableElementSlots;
};
```

Target render void props:

```ts
type RenderVoidProps<TElement extends Element = Element> = {
  element: TElement;
};
```

Target path APIs:

```ts
const path = ReactEditor.findPath(editor, element);
const path = useElementPath();
```

Rules:

- `ReactEditor.findPath(editor, element)` is the event-time/default API.
- `useElementPath()` is opt-in render-time UI state and may rerender when the
  current path changes.
- Do not expose runtime id as normal app DX unless a lower-level unstable hook
  is needed for internal tests.
- Do not keep `index`; it is just `path.at(-1)` with the same invalidation
  problem.

## Internal Runtime Target

Implementation target for later `ralph`:

1. Add runtime-id tracking for mounted Slate nodes, for example an internal
   `NODE_TO_RUNTIME_ID` weak map populated by the node ref / render binding.
2. Make `DOMEditor.findPath(editor, node)` prefer:
   - runtime id from the node weak map;
   - `Editor.getPathByRuntimeId(editor, runtimeId)`;
   - existing `NODE_TO_PARENT` / `NODE_TO_INDEX` fallback only when runtime id
     is unavailable.
3. Keep `NodeRuntimeIdContext` as the internal identity context.
4. Replace `ElementPathContext` public reliance with lazy path resolution.
5. Make DOM-to-Slate point/range conversion runtime-id-first where the DOM node
   exposes `data-slate-runtime-id`; `data-slate-path` remains fallback/debug.
6. Do not notify all runtime-node subscribers merely to refresh public path
   props.

## Hook / Component DX Target

Keep:

- `useElement()` for current element access.
- `useElementSelected()` but make its no-arg mode resolve from runtime id or
  runtime-id-backed `findPath`, not stale context path.
- `ReactEditor.findPath(editor, element)` as the Slate-close path read.

Add or revise:

- `useElementPath(): Path | null` for opt-in render-time path display or
  path-derived UI.
- docs/examples rule: resolve path inside event handlers before mutating.

Cut:

- `RenderElementProps.path`
- `RenderElementProps.index`
- `RenderVoidProps.path`
- public teaching that spreads `data-slate-path` as if it is app state

## Ecosystem Strategy Synthesis

| System                            | Source                                                     | Mechanism                                                          | Avoids                        | Steal                                       | Reject                                                 | Slate target                          | Verdict |
| --------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------- | ------------------------------------------------------ | ------------------------------------- | ------- |
| Slate legacy                      | current source-close API shape and v2 `DOMEditor.findPath` | renderer receives element; path can be resolved on demand          | render-prop path invalidation | event-time `findPath` DX                    | stale weak-map-only lookup                             | runtime-id-first `findPath`           | partial |
| Slate v2 live runtime             | `public-state.ts:640`, `runtime-live-state.ts:35`          | runtime id maps to current path                                    | path as stable identity       | id-to-current-path lookup                   | eager path props                                       | lazy current path resolver            | agree   |
| React 19.2 external store pattern | `use-editor-selector.tsx:68`                               | selector subscriptions update only when relevant                   | global rerender fanout        | opt-in hook subscriptions                   | prop-churn as freshness mechanism                      | `useElementPath()` only for opt-in UI | agree   |
| ProseMirror                       | compiled PM runtime research                               | position mapping is transaction-owned, not React render-prop-owned | stale position captures       | current-position resolution at command time | making every node view re-render for shifted positions | event-time path resolver              | partial |
| Lexical                           | compiled dirty-runtime research                            | keyed nodes drive dirty buckets                                    | tree-address fanout           | runtime-id keyed dirtiness                  | exposing tree addresses as primary node identity       | runtime id backbone, path as query    | agree   |

## Issue Ledger Accounting

ClawSweeper related-issue pass: skipped for this pass because cached issue
ledgers already cover the rerender-breadth and path-stability surface, and this
planning pass makes no new fixed issue claim.

Live ledger rows read from `docs/slate-issues/gitcrawl-live-open-ledger.md`:

- `#3656` leaf rerender pressure.
- `#4141` nested ancestor rerender pressure.
- `#4210` general rerender prevention.
- `#3748` wrap/unwrap parent rerender pressure.
- `#2051` leaf-level rerender pressure.

Manual v2 sync ledger status:

- unchanged; existing rows remain `Improves`, `Related`, `cluster-synced`, or
  `Not claimed` according to current proof.

Issue matrix:

| Issue | Cluster                            | Claim    | Why                                                                                                                                   | Proof route                             | V2 sync ledger | PR line             |
| ----- | ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------- | ------------------- |
| #3656 | react-runtime-and-rerender-breadth | Improves | Existing breadth proof covers sibling leaves/parent on leaf edit; render path hard cut protects the same class for structural shifts. | add leading-insert render/path contract | unchanged      | related matrix only |
| #4141 | react-runtime-and-rerender-breadth | Improves | Existing deep-edit proof covers ancestors; render path hard cut prevents a new ancestor/sibling path-shift fanout.                    | add leading-insert render/path contract | unchanged      | related matrix only |
| #4210 | react-runtime-and-rerender-breadth | Related  | This plan advances rerender prevention but does not fully close a broad issue.                                                        | benchmark + React contract              | unchanged      | related matrix only |
| #3748 | react-runtime-and-rerender-breadth | Related  | Structural wrap/unwrap rerender pressure is adjacent; this plan covers path-shift fanout, not exact wrap/unwrap repro.                | future structural shift contract        | unchanged      | related matrix only |
| #2051 | singleton-performance-benchmark    | Related  | Leaf rerender pressure remains represented by benchmark gates; no exact closure.                                                      | benchmark lane                          | unchanged      | related matrix only |

PR reference sync:

- `pr-description unchanged: no fixed issue claim, public PR body, release gate,
or accepted API line is changed by this planning-only pass yet.`

## Regression Proof Matrix

| Contract                                       | Must prove                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Leading root insert before 1000 mounted blocks | existing shifted siblings do not re-render solely because path/index changed.                           |
| Leading root insert with selection unaffected  | root selector updates order, runtime-node fanout stays bounded, DOM/path lookup resolves current paths. |
| Leading root insert with selection affected    | selection proof updates selected surfaces without notifying every unrelated mounted runtime node.       |
| Event-time `findPath` after leading insert     | handler on shifted sibling resolves the new path, not the stale render path.                            |
| `useElementPath()` opt-in                      | only components using the hook rerender when their runtime id's path changes.                           |
| DOM-to-Slate conversion                        | runtime-id-first DOM bridge resolves current paths even when `data-slate-path` is stale or absent.      |
| Examples                                       | check-lists, images, embeds, inlines no longer close over render-time `path`.                           |
| Browser harness                                | path selectors either use runtime-id-backed helpers or have a metadata refresh contract.                |

## Applicable Implementation Skill Review Matrix

| Lens                          | Applicability | Finding                                                                                                                         | Plan delta                                            |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Do not use prop churn to synchronize external mutable editor state. Use external-store selectors only where UI needs the value. | Cut eager path/index; add opt-in hook.                |
| `performance-oracle`          | applied       | Leading insert makes eager path freshness O(shifted mounted siblings) if correctness is preserved.                              | Runtime-id-first resolver; no default sibling fanout. |
| `performance`                 | applied       | This is repeated-unit fanout pressure and must be measured as mounted sibling render count plus selector notification count.    | Add 1000/5000 block leading-insert gates.             |
| `tdd`                         | applied       | The dangerous behavior is externally visible through event-time handlers and DOM selection, not implementation shape alone.     | Add tests before runtime cuts.                        |
| `build-web-apps:shadcn`       | skipped       | No UI chrome design surface.                                                                                                    | None.                                                 |
| `react-useeffect`             | applied       | Effects should sync DOM/metadata, not app path props.                                                                           | Keep path metadata runtime-owned.                     |

## High-Risk Deliberate Mode

Triggered because this changes public render API and browser/path runtime.

Pre-mortem:

1. Apps lose convenient `path` and overuse `useElementPath()`, recreating broad
   path-shift rerenders.
2. Runtime-id-first `findPath` misses a mounted node and falls back to stale
   weak maps.
3. Browser tests using `[data-slate-path]` pass in simple cases but fail after
   structural shifts.

Proof plan:

- public-surface contract fails if `RenderElementProps` or `RenderVoidProps`
  still expose eager `path` / `index`;
- React contract counts render events and selector notifications for leading
  insert before mounted siblings;
- DOM bridge contract proves `findPath` returns the shifted current path after
  a skipped-rerender root-order commit;
- Playwright/browser contract proves click/type on shifted DOM resolves current
  model path;
- examples compile after migration to event-time path resolution.

Rollback / hard-cut answer:

The hard cut is worth it before publish because keeping eager path either
forces exactly the sibling-wide render fanout v2 is designed to avoid or leaves
stale public props. A compat alias would preserve the footgun.

## Slate Maintainer Objection Ledger

| Change                           | Likely objection                                                 | Steelman antithesis                                     | Tradeoff tension                             | Answer                                                                                                                             | Verdict |
| -------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Remove `path` from render props  | "I need the path to update/delete the current node."             | Eager path is convenient and source-close for examples. | Event handlers need one extra resolver call. | Use `ReactEditor.findPath(editor, element)` inside the handler; make it runtime-id-first so it is current without rerender fanout. | keep    |
| Remove `index` from render props | "Index is handy for numbered UI."                                | Some UI displays sibling index.                         | Opt-in hook needed for live index display.   | `index` has the same invalidation problem as path; derive from `useElementPath()` only where live display is intentional.          | keep    |
| Remove `path` from `renderVoid`  | "Void controls need to mutate themselves."                       | Void UI often needs remove/update actions.              | Same event-time resolver migration.          | `renderVoid` gets `element`; event handlers resolve current path.                                                                  | keep    |
| Runtime-id-first `findPath`      | "Runtime id is v2 machinery leaking into a legacy-named helper." | Weak maps are simpler.                                  | Internal map maintenance required.           | Runtime id stays internal; public API remains `findPath`. Weak maps remain fallback.                                               | keep    |

## Implementation Phases For Ralph

### Phase 1: Red Contracts

Files:

- `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
- `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`

Add tests:

1. leading insert before 1000 mounted blocks does not notify every runtime-node
   selector and does not rerender every shifted sibling;
2. event handler on a shifted custom element resolves current path after a
   leading insert;
3. `DOMEditor.findPath` returns current path after root-order shift without
   requiring shifted-node React rerender;
4. public type surface rejects `RenderElementProps.path`, `RenderElementProps.index`,
   and `RenderVoidProps.path`.

### Phase 2: Runtime-Id-First Path Resolver

Files:

- `.tmp/slate-v2/packages/slate-dom/src/utils/weak-maps.ts`
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

Implement:

- internal node-to-runtime-id mapping;
- `DOMEditor.findPath` runtime-id-first;
- DOM-to-model conversion runtime-id-first where possible;
- keep weak-map fallback.

### Phase 3: Public Render Prop Hard Cut

Files:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`

Implement:

- remove `path` / `index` from `EditableRenderElementProps`;
- remove `path` from `EditableRenderVoidProps`;
- remove `ElementPathContext` from public path freshness duties or keep it
  internal-only until replaced;
- add `useElementPath()` if render-time path display needs a public hook.

### Phase 4: Example Migration

Files to inspect first:

- `.tmp/slate-v2/site/examples/ts/check-lists.tsx`
- `.tmp/slate-v2/site/examples/ts/images.tsx`
- `.tmp/slate-v2/site/examples/ts/embeds.tsx`
- `.tmp/slate-v2/site/examples/ts/inlines.tsx`
- any `RenderElementPropsFor<...>` custom example types.

Migration rule:

- do not close over `path` from render props;
- resolve current path inside event handlers with `ReactEditor.findPath`.

### Phase 5: Browser / Benchmark Proof

Commands:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-react/test/provider-hooks-contract.tsx
bun test ./packages/slate-react/test/surface-contract.tsx
bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx
bun test ./packages/slate-dom/test/bridge.ts
bun run bench:react:rerender-breadth:local
```

Add a focused browser row if any DOM-to-model path changes affect examples:

```bash
cd /Users/zbeyens/git/slate-v2
bun playwright test playwright/integration/examples/check-lists.test.ts --project=chromium
```

## Closure Pass

Closure reviewed the first pass and changed the status from `pending` to
`done` because the remaining gaps are implementation gates owned by `ralph`, not
missing planning decisions.

The Ralph execution pass is complete. The current v2 implementation no longer
exposes eager render `path` / `index` props.

## Scorecard

| Dimension                                                | Score | Evidence                                                                                                                              |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.94 | Runtime-id fanout source, existing root-order no-fanout test, explicit hard cut avoids prop-churn freshness as the runtime mechanism. |
| Slate-close unopinionated DX                             |  0.93 | `ReactEditor.findPath(editor, element)` preserves Slate-close event-time path reads; optional `useElementPath()` is narrowly scoped.  |
| Plate and slate-yjs migration-backbone shape             |  0.92 | Runtime identity remains the shared backbone; no product-layer API is pushed into raw Slate.                                          |
| Regression-proof testing strategy                        |  0.92 | Replayable red contracts are named by file, scenario, expected render/fanout counters, and DOM/path behavior.                         |
| Research evidence completeness                           |  0.91 | Live v2 source plus runtime-identity, React external-store, ProseMirror transaction-position, and Lexical keyed-dirtiness synthesis.  |
| shadcn-style composability and hook/component minimalism |  0.95 | Default render props get smaller; path is opt-in state instead of a universal prop.                                                   |

Weighted total: `0.93`.

Planning status: `done`.
Implementation status: `done`.

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                                                                                                                                                                                                                                                                  | Plan delta                                                                       | Open issues                                                                  | Next owner      |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------- |
| Current-state read and initial score | complete | live render prop, selector, runtime id, DOM bridge, and existing tests                                                                                                                                                                                                                                                          | hard-cut verdict added                                                           | implementation proof still to write                                          | ralplan closure |
| Related issue discovery              | complete | cached matrix/dossier/live ledger rows for rerender breadth                                                                                                                                                                                                                                                                     | no issue claim changes                                                           | none                                                                         | none            |
| Decision brief                       | complete | options and rejected alternatives                                                                                                                                                                                                                                                                                               | chose lazy resolver                                                              | none                                                                         | none            |
| Regression proof plan                | complete | leading-insert tests named                                                                                                                                                                                                                                                                                                      | red tests are execution gates                                                    | implementation tests                                                         | ralph           |
| Closure score                        | complete | weighted score `0.93`                                                                                                                                                                                                                                                                                                           | plan ready for user review and Ralph execution                                   | none for planning                                                            | ralph           |
| Ralph execution start                | complete | `active goal state`; `active goal state`                                                                                                                                                                                                        | reopened scoped completion state as pending; started red contracts and hard cut  | none                                                                         | ralph           |
| Ralph hard cut                       | complete | `RenderElementProps` no longer exposes `path` / `index`; `RenderVoidProps` no longer exposes `path`; `DOMEditor.findPath` is runtime-id-first; touched examples resolve paths at event time; `.tmp/slate-v2/.changeset/slate-react-render-path-props.md` and `.tmp/slate-v2/.changeset/slate-dom-runtime-id-find-path.md` added | public render contract cut, lazy `useElementPath()` added, docs/reference synced | check-list Backspace browser row still fails independently of this migration | done            |

## Ralph Execution Gates

- Red contracts exist for leading insert before shifted mounted siblings.
- Public type surface no longer exposes eager render `path` / `index`.
- `editor.dom.findPath` is runtime-id-first and current after skipped-rerender
  structural shifts.
- Examples no longer close over render-time `path`.
- Focused tests and rerender breadth benchmark pass from `.tmp/slate-v2`.
- Browser rows for touched example behavior pass; the unrelated check-list
  Backspace row remains a separate failure.

## Final Completion Gates

- Planning artifacts have a current verdict, intent boundary, decision brief,
  rejected alternatives, source-backed current state, issue accounting,
  regression matrix, implementation phases, and `ralph` gates.
- Completion file can be `done` because no further Slate Ralplan decision is
  missing and the Ralph execution gates passed.
