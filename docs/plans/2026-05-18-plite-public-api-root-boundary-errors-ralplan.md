# Plite Public Query Root-Boundary Error Ralplan

## Verdict

Hard cut the public query throw.

`Editor.previous(editor, { at: [] })` should return `undefined`, not throw. Same policy for `Editor.next(editor, { at: [] })` even if the current `next` throw is mostly dead behind `Editor.after(...)`.

This is not "avoid all throws in public API." That would be mush. The sharper rule is:

- Public editor search/query APIs return `undefined` when a valid location has no result.
- Core math helpers still throw when the operation itself is impossible, for example `PathApi.previous([])`.
- Runtime invariants and destructive transforms may throw when continuing would corrupt the document or hide invalid state.

Root is a valid editor location. It simply has no previous sibling. Throwing there forces app/plugin authors into try/catch for ordinary boundary probing, which is bad Plite DX.

## Current State Evidence

- `packages/plite/src/editor/previous.ts:10` returns `undefined` when no `at` exists.
- `packages/plite/src/editor/previous.ts:14` throws for root path.
- `packages/plite/src/editor/previous.ts:20` returns `undefined` when there is no point before the requested location.
- `packages/plite/src/editor/next.ts:16` returns `undefined` when there is no point after the requested location.
- `packages/plite/src/editor/next.ts:22` still contains a root-path throw.
- `packages/plite/test/query-contract.ts:2840` currently locks the `Editor.previous(editor, { at: [] })` throw.
- `packages/plite/src/interfaces/path.ts:372` keeps the correct lower-level invariant: `PathApi.previous([])` throws because root has no previous index.
- `packages/plite/src/transforms-node/merge-nodes.ts:120` already treats `Editor.previous(...)` as optional and bails when no previous node exists.

## Accepted API Law

### Public queries

Public query methods should be safe to compose:

```ts
const previous = Editor.previous(editor, { at });

if (!previous) return;
```

Target:

```ts
Editor.previous(editor, { at: [] }); // undefined
Editor.next(editor, { at: [] }); // undefined
state.nodes.previous({ at: [] }); // undefined
state.nodes.next({ at: [] }); // undefined
```

Public query APIs may throw for invalid input shape or corrupted editor state, but not for a boundary miss.

### Core path math

Path math stays strict:

```ts
PathApi.previous([]); // throws
PathApi.parent([]); // throws
```

That is the right place for invariant pressure. A path helper is not searching the document; it is constructing a path that cannot exist.

### Transforms and runtime internals

Transforms should keep throwing when the call asks for an invalid or destructive root operation. They may no-op only when that is already the public transform contract.

This keeps errors where they protect data, not where they punish normal probing.

## Why The Current Throw Is Wrong

The current `previous` implementation says "no result" everywhere except root:

```ts
if (!at) return;
if (!pointBeforeLocation) return;
```

Then root path gets special-cased into an exception. That is not a better invariant; it is an API scar from path arithmetic leaking into query DX.

For Plite-ish code, the common shape should be:

```ts
const previous = editor.state.nodes.previous({ at });

if (!previous) return;
```

Not:

```ts
let previous;

try {
  previous = editor.state.nodes.previous({ at });
} catch (error) {
  if (PathApi.equals(at, [])) return;
  throw error;
}
```

The second shape is garbage for plugin authors and agents.

## Rejected Alternatives

### Keep the throw for legacy parity

Rejected. Legacy parity is useful when behavior is good or compatibility is required. Here it preserves surprising public-query control flow. Plite is already doing hard cuts; this is exactly the kind worth taking.

### Add `safePrevious`

Rejected. That duplicates the API and teaches users the unsafe one exists. Public query should be the safe shape.

### Add `{ strict: true }`

Rejected for now. It adds configuration before a real use case exists. If strict diagnostics become useful later, they should be debug tooling or assertion helpers, not the default query path.

### Never throw from public APIs

Rejected. Too broad. Invalid document shape, impossible path math, and destructive root transforms still need hard failure.

## Steelman Objection

"Root path is not a node entry you can move before, so throwing exposes bad caller logic early."

Fair, but wrong for this API. `Editor.previous` is not `PathApi.previous`; it is a query that already has `NodeEntry | undefined` in its public type. The root case is exactly a "no previous result" case. If a caller truly needs assertion semantics, they can assert the result:

```ts
const previous = Editor.previous(editor, { at });

if (!previous) {
  throw new Error("Expected a previous node.");
}
```

Make strictness opt-in at the caller, not a trap inside the query.

## High-Risk Notes

Trigger: public API behavior change.

Blast radius:

- `packages/plite/src/editor/previous.ts`
- `packages/plite/src/editor/next.ts`
- `packages/plite/test/query-contract.ts`
- `packages/plite/test/query-extension-contract.ts`
- any public docs/examples that describe query error behavior

Risk:

- Existing callers that rely on the throw will stop catching root and may continue with `undefined`.
- This is acceptable because the method type already advertises `undefined`.
- Add direct tests so future refactors do not reintroduce the throw.

## Proof Plan For Ralph

Use TDD in `Plate repo root`.

1. Change the current root-path throw test in `packages/plite/test/query-contract.ts` to assert:
   - `Editor.previous(editor, { at: [] }) === undefined`
   - `Editor.next(editor, { at: [] }) === undefined`
2. Add or update state-query coverage:
   - `editor.read((state) => state.nodes.previous({ at: [] })) === undefined`
   - `editor.read((state) => state.nodes.next({ at: [] })) === undefined`
3. Keep path invariant tests green:
   - `PathApi.previous([])` throws
   - `PathApi.parent([])` throws
4. Implementation target:
   - remove the root-path throw from `editor/previous.ts`
   - remove the root-path throw from `editor/next.ts`
   - keep optional return type unchanged
5. Run from `/Users/zbeyens/git/plite`:
   - focused query tests for `packages/plite/test/query-contract.ts`
   - focused extension query tests for `packages/plite/test/query-extension-contract.ts`
   - package typecheck for `slate`
   - `bun check` before claiming execution closure

## Examples To Update

Any example or docs row that teaches catch-based query handling should become optional-result handling:

```ts
const previous = editor.state.nodes.previous({ at });

if (!previous) return;

const [node, path] = previous;
```

Do not extract a helper for this unless reused. The inline optional-result shape is the point.

## Initial Score

| Dimension                              | Score | Evidence                                                                                       |
| -------------------------------------- | ----: | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| React runtime performance              |  0.90 | This removes exceptional control flow from query paths; no render/runtime surface touched.     |
| Plite-close unopinionated DX           |  0.95 | Query type already returns `NodeEntry                                                          | undefined`; root boundary becomes ordinary optional result. |
| Plate and slate-yjs migration backbone |  0.88 | State query middleware composes better when boundary misses return values instead of throwing. |
| Regression-proof testing               |  0.82 | Proof plan names focused query and state-query tests, but no Ralph execution yet.              |
| Research evidence completeness         |  0.80 | Current pass is live-source grounded; ecosystem pass remains pending.                          |
| shadcn-style composability/minimalism  |  0.90 | One public query shape, no `safePrevious`, no config flag.                                     |

Weighted score: 0.878. Not closure-ready until issue/accounting closure is checked.

## Issue Ledger Result

Existing ledger coverage is enough for this scoped review.

- `docs/plite-issues/gitcrawl-live-open-ledger.md` has #3641, "Plite throws exceptions too liberally in relation to selection failures."
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md:223` already classifies #3641 as `cluster-synced`, not fixed.
- `docs/plite/ledgers/issue-coverage-matrix.md:253` already keeps #3641 as `Related`.
- `docs/plite/ledgers/fork-issue-dossier.md:4186` records the same decision: related selection-failure strictness, no exact closure.

No ledger edit is needed for this plan because the proposed root-query behavior does not claim to fix #3641. It is the same principle in a narrower public-query API surface: boundary misses should not become page-killing errors, but DOM selection failure policy remains separate.

## Intent And Boundary

Intent:

- Stop public query APIs from throwing on normal boundary probes.

Outcome:

- Public node navigation queries become optional-result APIs.
- Core path math and true invariants stay strict.

In scope:

- `Editor.previous`
- `Editor.next`
- `state.nodes.previous`
- `state.nodes.next`
- query tests and state-query middleware tests

Non-goals:

- No "never throw" policy.
- No DOM bridge error-policy change.
- No broad selection-failure issue closure.
- No new `safePrevious`, `{ strict: true }`, or duplicate API surface.

Decision boundary:

- Ralph may implement the hard cut in `Plate repo root` without asking again if tests prove the optional-result behavior and path invariants remain strict.

## Final Scoped Score

| Dimension                              | Score | Evidence                                                                                                                                                                  |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React runtime performance              |  0.94 | No render surface touched; removes exceptional control flow from hot query composition.                                                                                   |
| Plite-close unopinionated DX           |  0.97 | `Editor.previous`/`next` already type as optional results; root becomes consistent with other misses.                                                                     |
| Plate and slate-yjs migration backbone |  0.92 | State query middleware can compose with returned absence instead of catch-based control flow.                                                                             |
| Regression-proof testing               |  0.92 | Proof plan names direct static API, state API, and retained `PathApi` invariant tests.                                                                                    |
| Research evidence completeness         |  0.88 | Live source, tests, compiled research index, and issue ledgers checked; external editor comparison intentionally skipped as irrelevant to this narrow query-boundary law. |
| shadcn-style composability/minimalism  |  0.95 | Single API shape; rejected helper/config duplication.                                                                                                                     |

Weighted score: 0.929. Closure-ready for planning review. Implementation still belongs to Ralph.

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                      | Plan delta                                       | Open issues | Next owner    |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ | ----------- | ------------- |
| Current-state read and initial score | complete | Live `previous`, `next`, query contract, path invariant, and merge caller reads     | Accepted public query `undefined` law            | None        | Ralph         |
| Related issue discovery              | complete | #3641 found in live ledger, sync ledger, issue coverage matrix, and fork dossier    | No fixed issue claim                             | None        | Ralph         |
| Issue-ledger pass                    | complete | Existing #3641 `Related` row already covers strict exception pressure               | No ledger edit needed                            | None        | Ralph         |
| Intent/boundary and decision brief   | complete | Scope/non-goals/decision boundary recorded above                                    | Ralph may implement without another API decision | None        | Ralph         |
| Research/ecosystem synthesis         | skipped  | Live Plite source/test contract is the authority for this narrow query-boundary law | External editor comparison would be noise here   | None        | Ralph         |
| Steelman pass                        | complete | Objection recorded above                                                            | Keep chosen target                               | None        | Plite Ralplan |
| High-risk deliberate pass            | complete | Blast radius and proof plan recorded above                                          | Keep target with TDD proof                       | None        | Plite Ralplan |
| Closure score and final gates        | complete | Final scoped score is 0.929 with no dimension below 0.88                            | Plan ready for Ralph execution                   | None        | Ralph         |

## Completion Gates

- Current plan status: `done` for scoped review.
- Later `ralph` execution must edit `Plate repo root`; this planning pass must not.
- Implementation proof remains pending in `Plate repo root`.
