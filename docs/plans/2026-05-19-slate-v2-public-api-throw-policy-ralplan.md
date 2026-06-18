# Slate v2 Public API Throw Policy Ralplan

## Verdict

Hard cut accidental public API throws. Do not hard cut invariant throws.

## Context Grounding

Task: execute the Slate v2 public throw-policy plan in `Plate repo root`, including
the final DOM mapping API decision.

Desired outcome: Slate v2 runtime/event code uses absence-returning APIs for
expected browser/editor mismatch, assertion APIs remain explicit and sharp, and
examples teach the canonical call-site shape.

Known facts:

- `docs/slate-issues/` throw/exception scan found 29 live-ledger candidates and
  no new fixed issue claim is allowed from planning alone.
- DOM mapping names are currently ambiguous: `to*` throws, `resolve*` returns
  absence, and `findPath` / `findEventRange` throw despite sounding like
  searches.
- The final decision is a hard API rename: canonical `resolve*` for optional
  DOM mapping, canonical `assert*` for strict DOM mapping, no public DOM
  mapping `to*` / throwing `find*` names.

Constraints:

- Do not hide real app bugs with catch-all runtime swallowing.
- Do not crash the editor runtime in production for expected DOM/editor
  lifecycle races.
- Keep Slate raw and unopinionated; Plate owns product APIs.

Likely touchpoints:

- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-dom/test/**`
- `packages/slate-react/src/**` DOM-boundary call sites
- Slate examples/docs that currently call DOM mapping `to*` / throwing `find*`

## Repair Note

The first closeout for this plan was invalid. It collapsed multiple Slate
Ralplan passes into one artifact and under-scoped the issue pass.

This repaired plan has explicit pass artifacts:

- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/passes/01-live-throw-inventory.md`
- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/passes/02-docs-slate-issues-scan.md`
- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/passes/03-issue-ledger-accounting.md`
- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/passes/04-api-classification-pressure.md`

The `docs/slate-issues/` pass scanned 72 markdown files, found 184 matching
throw/exception lines across 48 files, identified 44 unique issue refs, and
pulled 29 current live-ledger candidates. The earlier short issue list was not
good enough.

The rule is simple:

- Public search, query, iterator, and optional resolver APIs return absence: `undefined`, `null`, `false`, or an empty iterator.
- Public transforms no-op when there is no valid matching target, unless continuing would corrupt the document.
- Strict assertion APIs still throw: `NodeApi.get`, `PathApi.previous`, `editor.api.dom.assertDOMPoint`, `editor.getApi(extension)`.
- Runtime lifecycle, extension registration, operation replay, normalization, and proof tooling still throw.

The current bad areas are:

1. `Editor.previous` and `Editor.next` throwing at root.
2. `liftNodes` and `unwrapNodes` throwing "currently supports only ..." from public transform calls.
3. `Editor.positions` throwing when an otherwise valid-looking live range no longer maps into the current editor.
4. React mutation observer helpers throwing when a ref is temporarily null.
5. Browser-handle `undo` / `redo` throwing when history is disabled or absent.
6. Stale React path/DOM mapping pressure must use optional resolver/hook APIs, not assertion APIs in lifecycle-sensitive code.
7. DOM mapping API names must be hard-cut from ambiguous `to*` / throwing `find*` names to explicit `resolve*` / `assert*` names.

Everything else is mostly correct. A "never throw from public API" policy would be soft garbage. Slate needs sharp assertion APIs; it just should not punish ordinary absence checks.

## Current-State Inventory

Generated inventory:

- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/slate-v2-throw-inventory.tsv`
- `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/slate-v2-throw-inventory-summary.json`

Scan command equivalent: non-test `*.ts` / `*.tsx` files under `Plate repo root/packages`, excluding `test`, `tests`, `__tests__`, `.test.*`, `.spec.*`, `dist`, `coverage`, and `node_modules`.

Totals:

| Metric                   | Count |
| ------------------------ | ----: |
| Source files scanned     |   470 |
| Files containing `throw` |    55 |
| Raw `throw` lines        |   242 |

Package distribution:

| Package             | Throw lines | Ralplan verdict                                                                                    |
| ------------------- | ----------: | -------------------------------------------------------------------------------------------------- |
| `slate`             |         121 | mostly keep; convert query/root, transform support-gap, iterator stale-range                       |
| `slate-dom`         |          19 | hard-cut ambiguous `to*` / throwing `find*`; canonicalize `resolve*` / `assert*`                   |
| `slate-react`       |          15 | convert ref-null observers and browser-handle history absence; keep hook misuse/runtime invariants |
| `slate-history`     |           3 | keep selection patch invariants                                                                    |
| `slate-hyperscript` |           9 | keep fixture DSL assertions                                                                        |
| `slate-browser`     |          75 | keep proof/harness assertions                                                                      |

## Per-File Classification

| File                                                                   | Count | Classification                                   | Decision                                                                                      |
| ---------------------------------------------------------------------- | ----: | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `slate/src/editor/previous.ts`                                         |     1 | public query boundary                            | convert root to `undefined`                                                                   |
| `slate/src/editor/next.ts`                                             |     1 | public query boundary                            | convert root to `undefined`                                                                   |
| `slate/src/transforms-node/lift-nodes.ts`                              |     5 | public transform support gaps                    | revise: no "currently supports only" throws for legal public calls                            |
| `slate/src/transforms-node/unwrap-nodes.ts`                            |     6 | public transform support gaps                    | revise: no-op or full support instead of public support-gap throws                            |
| `slate/src/editor/positions.ts`                                        |     4 | public iterator plus invalid-point assertions    | revise stale live-range misses to empty; keep invalid offset assertions                       |
| `slate-react/src/hooks/use-mutation-observer.ts`                       |     1 | React lifecycle ref absence                      | convert missing ref to no-op until mounted                                                    |
| `slate-react/src/components/restore-dom/restore-dom.tsx`               |     1 | React lifecycle ref absence                      | convert missing ref to no-op until mounted                                                    |
| `slate-react/src/editable/browser-handle.ts`                           |     2 | optional history capability absence              | convert missing history undo/redo to no-op/false path                                         |
| `slate-react/src/editable/mutation-controller.ts`                      |     1 | history state/API mismatch invariant             | keep internal assertion after capability check                                                |
| `slate-dom/src/plugin/dom-editor.ts`                                   |    13 | DOM bridge mapping contracts                     | canonicalize `resolve*` / `assert*`; remove or demote public `to*` and throwing `find*` names |
| `slate/src/interfaces/node.ts`                                         |    10 | strict node getters and invalid path shape       | keep; `getIf` / `has` cover optional reads                                                    |
| `slate/src/interfaces/path.ts`                                         |     6 | path math impossible states                      | keep                                                                                          |
| `slate/src/interfaces/transforms/general.ts`                           |    25 | operation replay/data integrity                  | keep                                                                                          |
| `slate/src/transforms-node/insert-nodes.ts`                            |     1 | destructive root insertion ambiguity             | keep; whole-document writes use value APIs                                                    |
| `slate/src/transforms-node/remove-nodes.ts`                            |     1 | destructive root removal                         | keep                                                                                          |
| `slate/src/transforms-node/split-nodes.ts`                             |     1 | destructive root split                           | keep                                                                                          |
| `slate/src/transforms-node/merge-nodes.ts`                             |     1 | incompatible node-kind merge                     | keep                                                                                          |
| `slate/src/transforms-selection/select.ts`                             |     1 | full range required when selection is null       | keep                                                                                          |
| `slate/src/transforms-text/delete-text.ts`                             |     1 | internal surviving endpoint invariant            | keep                                                                                          |
| `slate/src/editor/point.ts`                                            |     1 | exact point resolver assertion                   | keep                                                                                          |
| `slate/src/editor/normalize.ts`                                        |     2 | normalization fixpoint/budget invariants         | keep                                                                                          |
| `slate/src/range-projection.ts`                                        |     7 | committed snapshot/runtime-id invariants         | keep at low level; React selectors may soften above it                                        |
| `slate/src/core/public-state.ts`                                       |    10 | read/update lifecycle and replay invariants      | keep                                                                                          |
| `slate/src/core/editor-extension.ts`                                   |    18 | extension config/dependency/lifecycle invariants | keep                                                                                          |
| `slate/src/core/extension-registry.ts`                                 |     6 | extension conflict/reserved-name invariants      | keep                                                                                          |
| `slate/src/create-editor.ts`                                           |     3 | `editor.getApi(extension)` assertion             | keep                                                                                          |
| `slate/src/core/query-middleware.ts`                                   |     1 | `next()` double-call invariant                   | keep                                                                                          |
| `slate/src/core/normalize-node.ts`                                     |     1 | normalizer `next()` double-call invariant        | keep                                                                                          |
| `slate/src/core/transform-registry.ts`                                 |     1 | uninitialized registry invariant                 | keep                                                                                          |
| `slate/src/core/editor-runtime.ts`                                     |     1 | uninitialized runtime invariant                  | keep                                                                                          |
| `slate/src/interfaces/operation.ts`                                    |     1 | unknown operation inversion                      | keep                                                                                          |
| `slate/src/utils/modify.ts`                                            |     4 | internal tree mutation assertions                | keep                                                                                          |
| `slate/src/utils/runtime-ids.ts`                                       |     1 | runtime-id ownership invariant                   | keep                                                                                          |
| `slate-history/src/history-extension.ts`                               |     3 | selection patch invariants                       | keep                                                                                          |
| `slate-hyperscript/src/hyperscript.ts`                                 |     2 | fixture DSL invalid input                        | keep                                                                                          |
| `slate-hyperscript/src/creators.ts`                                    |     7 | fixture DSL invalid shape                        | keep                                                                                          |
| `slate-dom/src/utils/hotkey-match.ts`                                  |     5 | hotkey config validation                         | keep                                                                                          |
| `slate-dom/src/utils/dom.ts`                                           |     1 | invalid DOM index input                          | keep                                                                                          |
| `slate-react/src/hooks/use-editor.tsx`                                 |     1 | required context hook misuse                     | keep                                                                                          |
| `slate-react/src/hooks/use-editor-selector.tsx`                        |     1 | required context hook misuse                     | keep                                                                                          |
| `slate-react/src/hooks/use-element.ts`                                 |     1 | required element context misuse                  | keep                                                                                          |
| `slate-react/src/hooks/use-generic-selector.tsx`                       |     2 | rethrow user selector errors with context        | keep                                                                                          |
| `slate-react/src/components/slate.tsx`                                 |     1 | invalid editor prop                              | keep                                                                                          |
| `slate-react/src/rendering-strategy/create-segment-plan.ts`            |     1 | invalid segment config                           | keep                                                                                          |
| `slate-react/src/editable/editing-kernel.ts`                           |     1 | illegal runtime transition                       | keep                                                                                          |
| `slate-react/src/projection-store.ts`                                  |     1 | rethrow unknown projection errors                | keep                                                                                          |
| `slate-react/src/hooks/android-input-manager/android-input-manager.ts` |     1 | comment false-positive                           | no code change                                                                                |
| `slate-browser/src/browser/selection.ts`                               |     2 | proof helper assertions                          | keep                                                                                          |
| `slate-browser/src/transports/contracts.ts`                            |     8 | proof transport assertions                       | keep                                                                                          |
| `slate-browser/src/core/first-party-browser-contracts.ts`              |     6 | proof registry assertions                        | keep                                                                                          |
| `slate-browser/src/core/plugin-contracts.ts`                           |     6 | proof registry assertions                        | keep                                                                                          |
| `slate-browser/src/core/proof.ts`                                      |     4 | proof payload assertions                         | keep                                                                                          |
| `slate-browser/src/core/release-proof.ts`                              |     1 | release proof failure                            | keep                                                                                          |
| `slate-browser/src/playwright/index.ts`                                |    47 | browser harness assertions                       | keep                                                                                          |
| `slate-browser/src/playwright/ime.ts`                                  |     1 | browser harness assertion                        | keep                                                                                          |

## Accepted API Law

### Query and iterator APIs

Queries return absence for ordinary boundary misses:

```ts
const previous = Editor.previous(editor, { at });

if (!previous) return;
```

Target:

```ts
Editor.previous(editor, { at: [] }); // undefined
Editor.next(editor, { at: [] }); // undefined

editor.read((state) => state.nodes.previous({ at: [] })); // undefined
editor.read((state) => state.nodes.next({ at: [] })); // undefined
```

`Editor.positions` should follow iterator semantics:

```ts
Array.from(Editor.positions(editor, { at: staleRange })); // []
```

But invalid points inside existing text still throw:

```ts
Array.from(
  Editor.positions(editor, {
    at: {
      anchor: { path: [0, 0], offset: -1 },
      focus: { path: [0, 0], offset: 0 },
    },
  }),
);
// throws: invalid offset
```

Boundary miss is not corruption. Invalid point math is corruption.

### Transform APIs

Transforms should not throw just because the public implementation only handles one shape today.

Target:

```ts
editor.update((tx) => {
  tx.nodes.unwrap({ at: selection });
  tx.nodes.lift({ at: selection });
});
```

If no wrappable/liftable element exists, no-op. If a valid range is deeper than the current helper can handle, implement the generic behavior or no-op for non-matches. Do not leak "currently supports only top-level wrapper block ranges" into public API.

Keep throwing for destructive or corrupting transforms:

```ts
tx.nodes.remove({ at: [] }); // throws
tx.nodes.split({ at: [] }); // throws
tx.nodes.insert(node, { at: [] }); // throws; use value/document APIs
```

Root replacement is a document/value operation, not a child transform.

### DOM APIs

Use explicit `resolve*` / `assert*` APIs. Hard cut ambiguous `to*` and
throwing `find*` names from the public DOM mapping surface.

```ts
const point = editor.api.dom.resolveSlatePoint(domPoint, { exactMatch: false });

if (!point) return;
```

Assertion paths must say `assert` at the call site:

```ts
const point = editor.api.dom.assertSlatePoint(domPoint, {
  exactMatch: true,
});
```

Target public DOM API:

```ts
editor.api.dom.resolveSlatePoint(domPoint); // Point | null
editor.api.dom.resolveSlateRange(domRange); // Range | null
editor.api.dom.resolveSlateNode(domNode); // Node | null
editor.api.dom.resolveDOMNode(node); // HTMLElement | null
editor.api.dom.resolveDOMPoint(point); // DOMPoint | null
editor.api.dom.resolveDOMRange(range); // DOMRange | null
editor.api.dom.resolveEventRange(event); // Range | null
editor.api.dom.resolvePath(node); // Path | null

editor.api.dom.assertSlatePoint(domPoint); // Point
editor.api.dom.assertSlateRange(domRange); // Range
editor.api.dom.assertSlateNode(domNode); // Node
editor.api.dom.assertDOMNode(node); // HTMLElement
editor.api.dom.assertDOMPoint(point); // DOMPoint
editor.api.dom.assertDOMRange(range); // DOMRange
editor.api.dom.assertEventRange(event); // Range
editor.api.dom.assertPath(node); // Path
```

Remove or demote these names from the public API:

```ts
toSlatePoint;
toSlateRange;
toSlateNode;
toDOMPoint;
toDOMRange;
toDOMNode;
findPath;
findEventRange;
suppressThrow;
```

Examples and app-facing code should use `resolve*` unless the code truly wants
assertion behavior. Tests, diagnostics, and impossible internal states use
`assert*`. Do not make app authors catch `to*` exceptions to keep production
editors alive.

### React/browser runtime APIs

Ref-null React effects should wait, not crash:

```ts
useEffect(() => {
  const current = node.current;
  if (!current) return;

  observer.observe(current, options);
  return () => observer.disconnect();
}, [node, observer, options]);
```

Browser handle history commands should be absence-tolerant:

```ts
undo: () => {
  if (!applyModelOwnedHistoryIntent({ direction: "undo", editor })) return;
  forceRender();
};
```

If `history({ enabled: false })` is valid, browser shortcuts and test handles cannot explode just because history is absent. The internal `mutation-controller` assertion after a positive capability check stays strict; a state/API mismatch is an extension bug.

### Assertion APIs

Keep these strict:

```ts
NodeApi.get(root, path);
NodeApi.child(root, index);
PathApi.previous(path);
editor.getApi(history());
editor.api.dom.assertDOMPoint(point);
editor.api.dom.assertSlatePoint(domPoint);
```

These are assertion APIs. If callers want optional behavior, they should use the optional sibling or wrap the result at the caller.

## Why This Is The Best Slate-ish Shape

Slate's best historical DX is "small primitives with clear contracts." The old mistake was not that Slate threw; the mistake was throwing from APIs whose type and usage already mean "maybe no result."

The right split is:

- `get`, `assert`, path math, operation replay: assertion.
- `previous`, `next`, `resolve`, `has`, iterators: absence.
- transforms: no-op on no match, throw on impossible/destructive edit.
- runtime setup: fail fast.

That is stricter and easier to teach than either extreme.

## Rejected Alternatives

### Never throw from public APIs

Rejected. That hides broken documents, invalid extension config, corrupt operations, and app misuse. It would turn Slate into a silent failure machine.

### Add `safePrevious`, `safeToDOMPoint`, `safeUnwrapNodes`

Rejected. Duplicate APIs are a bad DX tax. The useful split is not `safe*` vs
plain names; it is `resolve*` for absence and `assert*` for invariants.

### Keep `to*` as the strict DOM mapping name

Rejected. `to*` reads like conversion, not assertion. It caused exactly the
wrong production habit: runtime code calls it, it throws on normal DOM/editor
lifecycle mismatch, and Sentry gets noisy. Strict DOM mapping must be named
`assert*`.

### Add `{ strict: false }` everywhere

Rejected. Config flags make call sites noisy and create a support matrix. The default contract should carry the semantics.

### Keep `liftNodes` / `unwrapNodes` throws until generic support exists

Rejected. "Currently supports only" is an implementation apology, not a public API contract. If a transform cannot act on a matched target, it should no-op or the implementation should be completed.

## Issue Ledger Result

No fixed issue claim is allowed from this plan alone.

The repaired ClawSweeper pass found 29 live-ledger candidates:

| Issue | Existing ledger status                    | Throw-policy verdict                                                                                               |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| #5771 | `improves-claimed`                        | related collaboration-selection exception pressure; no new claim                                                   |
| #5711 | `cluster-synced`                          | related DOM point strictness; use `resolve*` at event/browser boundaries and `assert*` for invariants              |
| #5749 | `cluster-synced`                          | related shadow DOM drag/drop DOM point strictness                                                                  |
| #5647 | `triage-closed`                           | keep point/root assertion strict unless current valid repro exists                                                 |
| #4851 | `issue-reviewed` / coverage `Not claimed` | app-specific DOM bridge pressure; no raw API closure                                                               |
| #3858 | `cluster-synced`                          | stale path lifecycle pressure; route to soft hooks/resolvers                                                       |
| #3834 | `issue-reviewed`                          | DOM point strictness; no closure                                                                                   |
| #3641 | `cluster-synced`                          | broad selection-failure strictness; no closure                                                                     |
| #5202 | `triage-closed`                           | install/tooling exception, out of scope                                                                            |
| #4081 | `cluster-synced`                          | stale path lifecycle pressure; route to soft hooks/resolvers                                                       |
| #5171 | `cluster-synced`                          | unfocused selection update pressure; browser proof needed                                                          |
| #3836 | `issue-reviewed`                          | DOM point strictness; no closure                                                                                   |
| #5107 | `cluster-synced` / coverage `Related`     | shadow DOM event range mapping; rename throwing `find*` to explicit `assert*`, use resolver where absence is valid |
| #4984 | `fixes-claimed`                           | already fixed by nested-editor DOM selection proof; do not re-claim                                                |
| #4971 | `triage-closed`                           | invalid `text: null`; keep invalid data strict                                                                     |
| #3621 | `triage-closed`                           | invalid/stale report; no API law change                                                                            |
| #4789 | `fixes-claimed`                           | already fixed by fail-closed external selection import; do not re-claim                                            |
| #4564 | `improves-claimed`                        | whole-document replacement/stale DOM pressure; no new claim                                                        |
| #4643 | `cluster-synced` / coverage `Related`     | invalid selection import; fail closed at browser boundary                                                          |
| #4581 | `cluster-synced` / coverage `Related`     | Firefox void/decorated deletion; no exact closure                                                                  |
| #4485 | `issue-reviewed`                          | DOM point strictness; no closure                                                                                   |
| #4328 | `cluster-synced`                          | transform boundary around void selection; no exact claim                                                           |
| #4337 | `cluster-synced` / coverage `Related`     | shadow DOM image; no exact closure                                                                                 |
| #4323 | `cluster-synced`                          | stale DOM/value sync pressure; route to soft hooks/resolvers                                                       |
| #4236 | `triage-closed`                           | IE parser exception perf; out of scope                                                                             |
| #4088 | `cluster-synced` / coverage `Related`     | mention range DOM point failure; no exact closure                                                                  |
| #3723 | `triage-closed`                           | duplicate-candidate row                                                                                            |
| #3918 | `issue-reviewed` / coverage `Related`     | page-refresh DOM point crash; no exact closure                                                                     |
| #3586 | `cluster-synced` / coverage `Related`     | native format DOMPoint crash; no exact closure                                                                     |

Cluster accounting:

| Issue / cluster                                                                                         | Status                                     | Why                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #3641                                                                                                   | related, not fixed                         | The plan narrows public API throw policy, but #3641 is broader selection-failure strictness.                                                                               |
| #5711, #3834, #3836, #4984, #4789, #4564, #4643, #4323, #4088, #3918, #5749, #5107, #4851, #4337, #4581 | related DOM bridge cluster, not fixed      | DOM mapping assertions stay strict under `assert*`; optional `resolve*` usage and browser proof own app-facing tolerance. Existing ledger rows already track this cluster. |
| #3858, #4081, #5697 dossier context, #6053                                                              | stale React path lifecycle pressure        | Do not soften assertion mapping APIs; use `resolvePath` and soft React hooks at lifecycle boundaries.                                                                      |
| #5647                                                                                                   | core point/root assertion pressure         | Keep `Editor.point` strict for invalid root/end cases until a current valid repro proves otherwise.                                                                        |
| #5771                                                                                                   | collaboration selection exception pressure | Keep snapshot/projection internals strict; public selection/position iteration can soften stale live endpoints.                                                            |
| #4328                                                                                                   | related, not fixed                         | `Transforms.insertNodes` with void selection is adjacent transform-boundary pressure. This plan does not claim the original repro.                                         |
| #4971                                                                                                   | not claimed                                | Invalid `text: null` remains invalid data shape, not an API absence case.                                                                                                  |
| #5202                                                                                                   | not claimed                                | Install/tooling exception is unrelated to public editor API throw policy.                                                                                                  |
| #6053                                                                                                   | precedent only                             | Existing fixed row proves the right hook-level shape: stale/removed React state returns `false` instead of throwing.                                                       |

Ledger edits are not needed in this planning pass because there are no new `Fixes` / `Improves` claims. Ralph execution must update `docs/slate-v2/ledgers/issue-coverage-matrix.md`, `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, and `docs/slate-v2/references/pr-description.md` only if implementation makes an issue claim.

## Decision Brief

Principles:

- Do not make app authors `try/catch` ordinary absence.
- Do not swallow corruption.
- Keep optional and assertion APIs visibly distinct.
- Rename ambiguous DOM mapping APIs so the call-site name carries the contract.
- Public examples should teach the direct call-site shape, inline when used once.

Top drivers:

1. Slate-ish primitive clarity.
2. Agent-readable API surfaces.
3. Plate/slate-yjs migration pressure around predictable state/tx reads.
4. Browser runtime resilience without hiding engine bugs.
5. Hard-cut simplicity.

Chosen option:

- Soft absence APIs, explicit assertion APIs, transform no-op on no match.

Invalidated options:

- all public APIs non-throwing
- safe API duplicates
- ambiguous `to*` / throwing `find*` DOM names
- config flags
- keeping partial-transform throws as "temporary"

Consequences:

- Some tests that currently assert throws become optional-result tests.
- Public transform implementation must get more complete or more deliberately no-op.
- DOM assertion APIs remain sharp under `assert*`, so examples must use `resolve*` at browser boundaries.

## Proof Plan For Ralph

Use TDD in `/Users/zbeyens/git/slate-v2`.

1. Query boundary:

   - Change `Editor.previous(editor, { at: [] })` to `undefined`.
   - Change `Editor.next(editor, { at: [] })` to `undefined`.
   - Add state-query mirror tests for `state.nodes.previous/next`.
   - Keep `PathApi.previous([])` and `PathApi.parent([])` throw tests.

2. Public transform support gaps:

   - Add current-behavior tests for `liftNodes` / `unwrapNodes` on non-wrappable targets and deeper legal ranges.
   - Convert no-match/non-wrappable cases to no-op.
   - Implement generic support where the target is valid and expected to change.
   - Remove user-visible "currently supports only ..." throws.

3. Positions iterator:

   - Add tests where a range endpoint no longer exists.
   - Expected result: empty iterator.
   - Keep invalid offset tests throwing.

4. React lifecycle:

   - Add tests for `useMutationObserver` and `RestoreDOM` with initially-null refs.
   - Expected result: no throw, observer attaches once ref exists.

5. Browser handle history:

   - Add a handle-level test for no history extension or `history({ enabled: false })`.
   - Expected result: `undo` / `redo` no-op, no page crash.
   - Keep internal state/API mismatch assertion.

6. DOM examples:

   - Update browser-boundary examples to use `editor.api.dom.resolve*`.
   - Update assertion examples to use `editor.api.dom.assert*`.
   - Remove or demote public `to*`, throwing `find*`, and `suppressThrow` usage.
   - Add public surface tests for the canonical `resolve*` / `assert*` names.

7. Verification:
   - Focused package tests for `slate`, `slate-react`, `slate-dom`, and `slate-history` surfaces touched.
   - Focused browser tests for DOM selection/history handle surfaces when touched.
   - `bun check` before execution closure.

## Examples To Update

Bad:

```ts
try {
  const previous = editor.read((state) => state.nodes.previous({ at }));
  if (!previous) return;
} catch {
  return;
}
```

Good:

```ts
const previous = editor.read((state) => state.nodes.previous({ at }));

if (!previous) return;
```

Bad:

```ts
const point = editor.api.dom.toSlatePoint(domPoint, { exactMatch: false });
```

Good at browser boundaries:

```ts
const point = editor.api.dom.resolveSlatePoint(domPoint, {
  exactMatch: false,
});

if (!point) return;
```

Good when asserting:

```ts
const point = editor.api.dom.assertSlatePoint(domPoint, {
  exactMatch: true,
});
```

Bad:

```ts
editor.update((tx) => {
  try {
    tx.nodes.unwrap({ at: selection });
  } catch {
    // unsupported shape
  }
});
```

Good:

```ts
editor.update((tx) => {
  tx.nodes.unwrap({ at: selection });
});
```

The transform owns no-match behavior. The caller should not be forced into support-gap exception handling.

## Steelman Objections

| Objection                                           | Answer                                                                                                                                              | Verdict                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| "Throwing at root catches bad caller logic."        | Not for `previous` / `next`. Those APIs already return optional entries; root is a no-result boundary.                                              | convert                        |
| "No-op transforms hide bugs."                       | Only no-op on no valid target. Destructive root edits and corrupt operation shapes still throw.                                                     | revise, not drop               |
| "DOM errors are the main user pain; why keep them?" | Keep strict DOM mapping, but name it `assert*`. `to*` is ambiguous and should not be the public sharp path.                                         | hard rename                    |
| "A stale range might be a caller bug."              | In React/browser runtime it is also a normal lifecycle race. Iterators should return empty for missing live endpoints; invalid offsets still throw. | convert missing endpoints only |
| "History should always exist."                      | Default history is reasonable, but `enabled: false` must not make browser handles crash. Optional capability absence should no-op.                  | convert browser handle only    |

## High-Risk Notes

Trigger: public API behavior policy across packages.

Blast radius:

- `packages/slate` query, iterator, transform tests and implementation.
- `packages/slate-react` ref lifecycle and browser handle behavior.
- `packages/slate-dom` docs/examples only unless optional resolver docs are stale.
- Issue/pr reference only if implementation claims related issue improvements.

Pre-mortem:

1. Over-softening hides real data bugs. Mitigation: keep strict `NodeApi`, `PathApi`, operation replay, runtime lifecycle, and DOM `assert*` assertions.
2. Transform no-op behavior masks an app typo. Mitigation: no-op only for no match/non-wrappable target; exact destructive root operations still throw.
3. DOM bridge crash issues remain because strict APIs stay strict. Mitigation: examples and app-facing code must use `resolve*`; browser proof targets runtime event handling, not raw assertion mapping.

Rollback/remediation:

- Each conversion is independently testable and reversible.
- Do not land all conversions as one opaque patch. Split Ralph execution into query, transform, iterator, React lifecycle, and browser-handle slices.

## Performance Notes

- Removing exception-based boundary flow is cheaper and clearer.
- `Editor.positions` empty-return for missing endpoints should short-circuit before segment collection.
- Transform no-op checks should use existing path/match traversal, not broad extra tree scans.
- DOM `resolve*` already returns null without exception stack overhead.

## Research / Ecosystem Synthesis

External editors are not the authority for this exact API law. The useful mechanism is already visible in Slate v2 live source:

- Slate v2 should make DOM strict/optional pairs explicit: `assert*` vs
  `resolve*`. Legacy `to*` is too ambiguous for a production editor runtime.
- Slate has strict/optional pairs in nodes: `get` vs `getIf`.
- State/tx public APIs are meant to compose without exception control flow.
- Existing React hook precedent exists in #6053: stale removed element selection returns `false`, not a thrown stale path.

Lexical/ProseMirror/Tiptap comparison is useful only at the mechanism level: strict model assertions are fine; public traversal/search APIs should not make ordinary misses exceptional. Do not import their product-level command abstractions into raw Slate.

## Score

| Dimension                              | Score | Evidence                                                                                                                            |
| -------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------- |
| React runtime performance              |  0.91 | Ref-null and browser-history conversions remove avoidable runtime crashes; no render model change.                                  |
| Slate-close unopinionated DX           |  0.96 | Keeps primitive assertion APIs strict while making absence APIs composable.                                                         |
| Plate and slate-yjs migration backbone |  0.91 | State/tx calls avoid try/catch flow; transforms stay deterministic.                                                                 |
| Regression-proof testing               |  0.90 | Proof plan names focused tests per converted surface and retained invariant tests.                                                  |
| Research evidence completeness         |  0.89 | Live full-source inventory, existing issue ledgers, and existing research enough for this API policy; no stale external dependency. |
| shadcn-style composability/minimalism  |  0.94 | No safe duplicates, no flags, no helper bloat; DOM names carry their contract.                                                      |

Weighted score: 0.920. Planning closure is ready. Source execution belongs to Ralph.

## Pass-State Ledger

| Pass                                | Status   | Evidence added                                                                                               | Plan delta                                                        | Open issues            | Next owner    |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------- | ------------- |
| Pass 01 live throw inventory        | complete | `.tmp/.../passes/01-live-throw-inventory.md`; 470 source files, 242 throw lines, 55 throw files              | Inventory recorded separately                                     | None                   | Slate Ralplan |
| Pass 02 `docs/slate-issues` scan    | complete | `.tmp/.../passes/02-docs-slate-issues-scan.md`; 72 md files, 184 matches, 29 live candidates                 | Added missing issue pressure                                      | None                   | Slate Ralplan |
| Pass 03 issue ledger accounting     | complete | `.tmp/.../passes/03-issue-ledger-accounting.md`; all 29 candidates matched to sync rows                      | No new claim edits                                                | None                   | Slate Ralplan |
| Pass 04 API classification pressure | complete | `.tmp/.../passes/04-api-classification-pressure.md`; verdict pressure from stale path/collab/root-point rows | Added `resolve*` / `assert*` DOM policy and #5647/#5771 decisions | None                   | Slate Ralplan |
| Pass 05 closure gate                | complete | `.tmp/.../passes/05-closure-gate.md`; repaired pass ledger closed                                            | Plan ready for Ralph execution                                    | Implementation pending | Ralph         |

## Completion Gates

- Current plan status: `done` for Slate Ralplan planning.
- Ralph execution implemented the throw-policy source slices in `Plate repo root`.
- Public DOM mapping uses `resolve*` for optional mapping and `assert*` for strict mapping. The old public DOM mapping `to*`, throwing `find*`, and `suppressThrow` names are absent from the public DOM API.
- `Editor.next` / `Editor.previous` return `undefined` at root. `Editor.positions` returns an empty iterator for stale range endpoints and still throws for invalid live offsets.
- `liftNodes` / `unwrapNodes` no-op when the current selection has no valid wrapper/lift target instead of leaking "currently supports only" throws.
- React MutationObserver lifecycle code waits on initially-null refs. Browser-handle `undo` / `redo` no-op when history is disabled or absent.
- Slate React reference docs teach `resolvePath` in event handlers and list the canonical `resolve*` / `assert*` DOM API.
- No new issue fix claim was made. Existing related issue accounting remains reference-only.
- Closure evidence from `Plate repo root`: `bun check` passed after implementation and docs sync.
