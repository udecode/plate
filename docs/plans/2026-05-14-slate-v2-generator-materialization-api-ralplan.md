# Slate v2 Generator Materialization API Ralplan

Date: 2026-05-14

## 1. Current Verdict

Status: done.

No, this shape is not absolute best:

```ts
const entries = e.read((state) => {
  const matches: NodeEntry[] = [];

  for (const entry of state.nodes.entries({
    at: path,
    mode: "all",
    voids: true,
  })) {
    matches.push(entry);
  }

  return matches;
});
```

It is better than returning a lazy generator out of `editor.read`, but it is
still public API smell. It means Slate v2 currently has a good lazy primitive
and no good read-boundary materialization primitive.

Target shape:

```ts
const entries = e.read((state) =>
  state.nodes.toArray({ at: path, mode: "all", voids: true }),
);
```

For transform-style callers that need a derived array in one pass:

```ts
const pathRefs = tx.nodes.toArray(
  { at: target, match, mode, voids },
  ([, path]) => Editor.pathRef(editor, path),
);
```

Keep generator APIs. Add an explicit materializer only where the state/tx read
boundary needs one. Do not spray `filter`, `map`, `every`, `querySelectorAll`,
or product helpers across raw Slate.

Current score: `0.93`.

The current-state, ecosystem, high-risk API, proof-plan, and closure passes are
complete. This is ready for a later Ralph execution. No `.tmp/slate-v2` source was
edited by Slate Ralplan.

## 2. Intent And Boundary

Intent: make Slate v2 generator APIs fast by default, hard to misuse across the
read lifecycle, and still Slate-close.

Desired outcome:

- Lazy traversal stays the normal hot path.
- First-match and boolean checks stay early-exit through `find` / `some`.
- Legitimate array materialization has a first-class, allocation-explicit name.
- Returning a state/tx generator from `editor.read` is not taught or blessed.
- Low-level `NodeApi` / static `Editor` generators stay lean and legacy-close.

In scope:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/test/query-contract.ts`
- `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- first-party callers that materialize `state.nodes.entries` or return it out of
  `read`
- first-party callers that use `Array.from(...)[0]` or `.length` on high-fanout
  Slate generators when an early-exit helper is possible
- docs/research and issue/reference accounting for the query API surface

Non-goals:

- no replacement of generators with arrays;
- no callback-only ProseMirror-style API;
- no selector strings or product query helpers in raw Slate;
- no global type index without benchmark proof;
- no blanket `toArray` methods on every low-level generator family.

Decision boundary:

- Slate Ralplan owns this API target and proof plan only.
- Ralph owns any `.tmp/slate-v2` code edits.
- The completed node-query plan stays valid for `entries` / `find` / `some`;
  this plan supersedes only its earlier rejection of a materializer.

Goal-tool note: the thread still has a completed prior Ralph goal and the
current runtime rejected creating a replacement goal. This plan records the
intended end state explicitly instead of silently reusing the old execution
goal.

## 3. Current Source Evidence

Live Slate v2 source read:

| Surface                   | Current owner                                                                                             | Finding                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| State node API            | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:180`                                               | `state.nodes` exposes `levels`, `entries`, `find`, and `some`. No materializer exists.                                                     |
| State implementation      | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:928`                                               | `entries` returns `getNodes(editor, options)` directly; `find` and `some` early-exit.                                                      |
| Read lifecycle            | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:1211`                                              | `editor.read` only keeps `READ_DEPTH` active during the callback. A returned generator can be consumed after the read boundary.            |
| Write guard               | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:493`                                               | Writes are blocked inside `editor.read`; iterator consumption itself is not guarded.                                                       |
| DOM bridge caller         | `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:277`                                             | `getPathRefMatches` hand-rolls an array inside `read` so it can safely use entries after the callback. This is exactly the missing helper. |
| Query tests               | `.tmp/slate-v2/packages/slate/test/query-contract.ts:71`                                                  | `getNodeEntries` returns `state.nodes.entries(options)` from `read`, which teaches the wrong lifecycle shape.                              |
| Low-level node generators | `.tmp/slate-v2/packages/slate/src/interfaces/node.ts:129`, `:143`, `:162`, `:172`, `:254`, `:270`, `:292` | Raw `NodeApi` traversal methods are generator-based and should stay that way.                                                              |
| Static editor generators  | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1435`, `:1521`                                     | `Editor.levels` and `Editor.positions` remain legacy-compatible generators.                                                                |
| Bounded level traversal   | `.tmp/slate-v2/packages/slate/src/editor/levels.ts:23`                                                    | `Editor.levels` already buffers path-depth entries internally for reverse support; this is bounded by path depth.                          |
| Position traversal        | `.tmp/slate-v2/packages/slate/src/editor/positions.ts:515`                                                | `Editor.positions` can be high-fanout and should stay lazy; array materialization needs call-site justification.                           |

## 4. Decision Brief

Principles:

- Generators are the right default for Slate tree traversal.
- Array allocation should be explicit in the API name.
- The state/tx read lifecycle is part of the contract, not decoration.
- Raw Slate should expose substrate primitives; Plate owns product helpers.
- Add the smallest helper that removes real boilerplate and prevents misuse.

Top drivers:

- The previous `entries` / `find` / `some` plan fixed first-match allocation,
  but the DOM bridge still needs full materialization inside `read`.
- `editor.read((state) => state.nodes.entries(...))` creates a generator inside
  `read` and can consume it after `READ_DEPTH` is gone. That is too easy to
  misuse.
- Internal transform code often materializes before mutating paths. That is a
  legitimate snapshot pattern and should not be blindly "optimized" away.

Viable options:

| Option                                                     | Pros                                                                           | Cons                                                                                                           | Verdict           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------- |
| Keep manual loops inside `read`                            | No public API change.                                                          | Ugly, repeated, and teaches users to reinvent `Array.from` with more code.                                     | reject            |
| Tell callers to use `Array.from(state.nodes.entries(...))` | Standard JS and concise.                                                       | Still not Slate-branded, still obscures allocation, and encourages returning generators from `read` elsewhere. | reject as default |
| Add `state.nodes.toArray(options, map?)`                   | Explicit allocation, one-pass mapping, clean read-boundary returns, small API. | Adds one public method.                                                                                        | chosen            |
| Add `entriesArray` / `levelsArray` for every generator     | Symmetric.                                                                     | Noisy API names and no evidence that every generator family needs it.                                          | reject            |
| Add generic `filter` / `map` / `every`                     | Familiar collection DX.                                                        | Makes raw Slate look like a product query DSL and reopens the vacuous-`every` problem.                         | reject            |
| Copy ProseMirror callbacks                                 | Lifecycle-safe and allocation-free.                                            | Worse Slate DX and loses the useful legacy generator shape.                                                    | reject            |
| Copy Lexical/Tiptap array-first helpers                    | Friendly for app code.                                                         | Raw Slate would pay API and allocation cost for product-layer convenience.                                     | reject            |
| Add type indexes for node kind queries                     | Could beat DFS for repeated global scans.                                      | Adds memory/update complexity without current benchmark need.                                                  | defer             |

Chosen option:

- Add `state.nodes.toArray(options, map?)` to `EditorStateNodesApi`.
- Because `tx.nodes` extends `state.nodes`, the materializer is available inside
  updates too.
- Keep `entries`, `find`, `some`, and `levels`.
- Try a dev/test read-bound iterator guard for state/tx generators only if it
  can be implemented without production hot-path tax. It is a useful misuse
  detector, not a blocker for the `toArray` API.

Consequences:

- The old "reject `state.nodes.toArray`" row is superseded for this narrow
  materialization helper only.
- `filter`, `map`, `every`, `count`, selector strings, and product query helpers
  remain rejected or deferred.
- Tests and examples should stop returning `state.nodes.entries(...)` from
  `read`.

## 5. Public API Target

```ts
type EditorStateNodesApi = {
  entries: <T extends Node>(
    options?: EditorNodesOptions<T>,
  ) => Generator<NodeEntry<T>, void, undefined>;

  find: <T extends Node>(
    options?: EditorNodesOptions<T>,
  ) => NodeEntry<T> | undefined;

  some: <T extends Node>(options?: EditorNodesOptions<T>) => boolean;

  toArray: {
    <T extends Node>(options?: EditorNodesOptions<T>): NodeEntry<T>[];
    <T extends Node, R>(
      options: EditorNodesOptions<T> | undefined,
      map: (entry: NodeEntry<T>) => R,
    ): R[];
  };
};
```

Naming verdict: `toArray`, not `all`, not `collect`.

- `toArray` says allocation out loud.
- `all` collides mentally with `mode: 'all'`.
- `collect` is fine in Rust, but less obvious for JavaScript users.

No `levelsArray` in this pass. `levels` is bounded by ancestor depth and does
not currently create the same high-fanout read-boundary boilerplate. Add it only
if first-party or Plate call sites prove repeated need.

## 6. Generator Taxonomy

| Family                                                                                       | Keep generator? | Add materializer? | Add early-exit helpers?         | Reason                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | --------------- | ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state.nodes.entries`                                                                        | yes             | `toArray`         | already has `find` / `some`     | High-fanout public read query; needs explicit safe materialization.                                                                                                                   |
| `state.nodes.levels`                                                                         | yes             | not now           | use existing `above` / `parent` | Path-depth bounded; no current high-fanout smell.                                                                                                                                     |
| `Editor.levels`                                                                              | yes             | no                | existing `above` / `parent`     | Legacy-compatible static API and bounded traversal.                                                                                                                                   |
| `Editor.positions`                                                                           | yes             | no                | not in this pass                | Can be high-fanout, but its consumers need position-specific algorithms, not generic arrays.                                                                                          |
| `NodeApi.nodes` / `descendants` / `texts` / `elements` / `children` / `ancestors` / `levels` | yes             | no                | not generically                 | Low-level tree utilities; internal callers may materialize before mutation. Do call-site fixes where they currently use `Array.from(...)[0]` or `.length` for a boolean/first result. |
| `RangeApi.points`                                                                            | yes             | no                | no                              | Two entries only; array helper is nonsense.                                                                                                                                           |

## 7. Ecosystem Strategy Synthesis

| System       | Source                                                                                                                                                          | Mechanism                                                                              | Slate takeaway                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Legacy Slate | `../slate/packages/slate/src/editor/nodes.ts:6`                                                                                                                 | `Editor.nodes` is a generator. Destructuring can consume only the first yield.         | Keep lazy traversal. Do not regress first-match checks into arrays.                                     |
| ProseMirror  | `../prosemirror-model/src/node.ts:79`; `../prosemirror-model/src/fragment.ts:29`                                                                                | Callback traversal avoids arrays and can prune children when callback returns `false`. | Keep allocation-free traversal and prune discipline, but do not make callbacks the only DX.             |
| Lexical      | `../lexical/packages/lexical/src/LexicalEditorState.ts:122`; `../lexical/packages/lexical/src/LexicalSelection.ts:527`                                          | Reads run inside a lifecycle; selection `getNodes()` returns a cached array.           | Read lifecycle matters. Arrays are acceptable only when deliberately cached or explicitly materialized. |
| Tiptap       | `../tiptap/packages/core/src/NodePos.ts:206`; `../tiptap/packages/core/src/helpers/findChildren.ts:11`; `../tiptap/packages/core/src/helpers/isNodeActive.ts:8` | Product helpers often return arrays; `querySelector` has a first-item escape.          | Steal first-match/active-check ergonomics, not selector/product array APIs for raw Slate.               |

## 8. Implementation Acceptance For Ralph

Implementation units:

1. Add `state.nodes.toArray(options, map?)` in `.tmp/slate-v2/packages/slate`.
2. Add focused tests proving:
   - `toArray` returns the same sequence as `entries`;
   - mapper overload runs in one traversal;
   - `find` and `some` still early-exit;
   - no test helper returns `state.nodes.entries(...)` from `read`.
3. Replace `getPathRefMatches` in `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
   with `state.nodes.toArray(...)`.
4. Audit first-party `Array.from` on Slate generators:
   - keep transform snapshot arrays where mutation requires stable paths;
   - replace first-entry and boolean/count checks with `find` / `some` / small
     local loops when they are high-fanout;
   - leave test fixture materialization alone unless it teaches a public read
     anti-pattern.
5. Optionally wrap state/tx generator methods with a dev/test guard that throws
   when iteration happens outside `editor.read` or `editor.update`. Drop it if
   the implementation adds production cost or type/runtime noise.
6. Update public API and research docs for `toArray`; do not add new fixed issue
   claims.

Suggested bad-pattern grep after implementation:

```bash
rg -n "editor\\.read\\(\\(state\\) => state\\.nodes\\.entries\\(|Array\\.from\\(\\s*state\\.nodes\\.entries\\(|state\\.nodes\\.entries\\([^\\n]*\\)\\)\\[0\\]" packages site/examples/ts scripts
```

This grep is a guardrail, not a substitute for review. `Array.from` inside a
multi-line read callback may still be valid when the plan explicitly accepts it.

## 9. Testing And Verification Plan

Slate v2 gates:

```bash
cd .tmp/slate-v2
bun test ./packages/slate/test/query-contract.ts
bun test ./packages/slate/test/state-tx-public-api-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun typecheck:site
bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
bun check
```

Benchmark rows to preserve or add:

- first-match array path versus `find`;
- first-match `toArray(...)[0]` remains intentionally worse than `find`;
- full materialization `Array.from(entries)` versus `toArray` within noise;
- mapper overload versus `Array.from(entries, mapFn)`;
- 10k-block stress row.

Regression rules:

- `find` and `some` must not allocate arrays internally.
- `toArray` is allowed to allocate exactly the result array.
- `toArray(..., map)` must not allocate an intermediate `NodeEntry[]`.
- State/tx generator guard is optional. If added, it must be dev/test-only or
  benchmark-proven negligible.

## 10. Issue-Ledger Accounting

No new fixed issue claim from this plan.

| Issue | Current classification | Plan impact                                                                                      |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| #5080 | Fixes already claimed  | Keep wording based on `state.nodes.entries({ reverse: true })`; no new claim.                    |
| #5684 | Related                | Materializer improves query DX but does not prove the vague upstream repro.                      |
| #5028 | Related                | `pass` semantics stay unchanged.                                                                 |
| #3885 | Not claimed            | Better examples may help docs clarity, but docs issue closure needs a docs-specific proof route. |
| #4041 | Not claimed            | Generator transpilation for IE11 remains out of scope.                                           |

Reference sync target:

- `docs/slate-v2/references/pr-description.md` should mention `toArray` only if
  Ralph lands the API.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` stays unchanged unless
  implementation changes a fixed issue claim.

## 11. Review Pass Matrix

| Pass                      | Status                      | Evidence                                                                                  | Next                                                |
| ------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| current-state-read        | complete                    | Live source rows in section 3; external source rows in section 7.                         | high-risk deliberate API pass                       |
| related-issue-discovery   | skipped for this pass       | Existing query issue cache read; no new fixed issue claim.                                | Reopen only if implementation changes issue claims. |
| architecture-strategist   | applied                     | Decision brief keeps raw Slate substrate small and rejects product query DSL.             | Validate final API after Ralph.                     |
| performance-oracle        | applied                     | Generator taxonomy, mapper overload, benchmark rows.                                      | Measure after implementation.                       |
| performance               | applied                     | High-fanout node entries get helper; bounded `levels` does not.                           | Add 10k benchmark row.                              |
| tdd                       | applied as Ralph acceptance | Tests are named in section 9; no code was edited in this planning pass.                   | Ralph must add/update tests first.                  |
| high-risk-deliberate-pass | complete                    | Section 12A records trigger, blast radius, pre-mortem, proof plan, rollback, and verdict. | Ralph execution.                                    |
| final closure             | complete                    | Section 13 records the final handoff; score is above threshold for a planning lane.       | User review or Ralph.                               |

## 12. Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.91 | No React render surface change; the plan preserves lazy `entries`, early-exit `find`/`some`, and makes full scans explicit through `toArray`. Section 9 names benchmark rows, including 10k stress and mapper-overload comparison. |
| Slate-close unopinionated DX                             |  0.94 | Keeps generator primitives, `NodeEntry`, `match`, `mode`, `voids`, `pass`; adds one JS-obvious materializer and rejects product helpers. Section 5 locks the public target.                                                        |
| Plate and slate-yjs migration-backbone shape             |  0.91 | Deterministic traversal order and operation/collab surfaces remain unchanged; `tx.nodes` inherits the read helper without adapter-shaped namespaces. Sections 2 and 10 keep claims conservative.                                   |
| Regression-proof testing strategy                        |  0.93 | Section 9 names unit, public API, typecheck, benchmark, and grep gates; section 8 makes tests the first Ralph unit. No implementation proof is claimed from this planning pass.                                                    |
| Research evidence completeness                           |  0.94 | Live Slate v2, legacy Slate, ProseMirror, Lexical, and Tiptap sources were read locally and synthesized in sections 3 and 7.                                                                                                       |
| shadcn-style composability and hook/component minimalism |  0.93 | No UI or hook expansion; the API stays a small `entries` / `find` / `some` / `toArray` group and rejects collection-DSL creep.                                                                                                     |

Total: `0.93`.

Completion threshold is met for a planning-only Slate Ralplan lane. Slate v2
implementation, tests, and benchmark proof are deferred to Ralph and must not be
presented as already shipped.

## 12A. High-Risk Deliberate Pass

Trigger: public API and read-lifecycle boundary change.

Blast radius:

- packages/files: `packages/slate` state API and public types,
  `packages/slate-dom` DOM bridge caller, query/public API tests, and examples
  that teach node-query usage;
- users/consumers: Slate v2 consumers using `editor.read`, `tx.nodes`, and node
  traversal helpers;
- data/behavior: no document model, operation, collaboration, history, or DOM
  behavior changes are intended;
- docs/examples/tests: examples should teach `find`/`some` for early exit and
  `toArray` only for real materialization.

Pre-mortem:

1. `toArray` makes arrays feel free.
   Mitigation: the name says allocation, examples still prefer `find`/`some`,
   and benchmarks must show `toArray(...)[0]` is intentionally worse than
   `find`.
2. Mapper overload becomes cute TypeScript noise.
   Mitigation: keep one `Array.from`-style overload only:
   `toArray(options, mapEntry)`. If inference is bad during Ralph, drop the
   mapper overload and keep plain `toArray(options)`.
3. Dev/test iterator guard adds runtime weirdness.
   Mitigation: make it optional. Add it only if it has no production hot-path
   tax and no confusing stack behavior. The API does not depend on the guard.

Expanded proof plan:

- unit: `query-contract.ts` covers sequence parity, mapper one-pass behavior,
  `find`/`some` early exit, and no returned state generator helper;
- integration: `slate-dom` `getPathRefMatches` uses `state.nodes.toArray`;
- browser/visual: not required for this API-only plan unless Ralph changes DOM
  behavior beyond the caller cleanup;
- migration/adoption: additive API, no compatibility alias needed; examples
  teach `find`/`some`/`toArray`;
- docs/example: research note and PR reference update only after Ralph lands the
  API;
- performance: benchmark rows from section 9, including 10k stress and mapper
  comparison;
- security: not applicable.

Rollback/remediation:

- Pre-release hard drop if the overload or guard is ugly.
- If `toArray` lands but later proves too broad, keep it internal for
  `slate-dom` and examples, then expose only after a second call-site audit.
- No data migration or document compatibility cost.

Verdict: keep the plan. `state.nodes.toArray(options, map?)` is the right narrow
fix; dev/test iterator guard is optional; `levelsArray` and blanket low-level
materializers stay cut.

## 13. Final Ralph Handoff

Accepted:

- Add only `state.nodes.toArray(options, map?)`.
- Keep `entries`, `find`, `some`, and `levels` as-is.
- Do not add `filter`, `map`, `every`, `count`, selector helpers,
  `querySelectorAll`, type indexes, `levelsArray`, or low-level `NodeApi`
  materializers.
- Use `toArray` for read-boundary materialization like `slate-dom`
  `getPathRefMatches`.
- Use `find`/`some` for first-match and boolean checks.
- Keep transform snapshot arrays when mutation requires stable paths.
- Try the dev/test iterator guard only if it stays clean and zero-cost in
  production.

Before/after target:

```ts
// before
const entries = e.read((state) => {
  const matches: NodeEntry[] = [];
  for (const entry of state.nodes.entries(options)) matches.push(entry);
  return matches;
});

// after
const entries = e.read((state) => state.nodes.toArray(options));
```

Verification for Ralph remains section 9.

## 14. Ralph Execution Ledger

Status: done.

Execution started: 2026-05-14.

Current pass: `verification-sweep-pass`.

Goal: Slate v2 exposes `state.nodes.toArray(options, map?)`, first-party callers
use the intended generator/materialization shape, reference docs are synced, and
focused plus broad verification gates pass.

Pass schedule:

| Pass                       | Status   | Evidence                                                                                                                                                                                                                  | Next    |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| tdd-pass                   | complete | Added public API tests first; red run failed with `TypeError: state.nodes.toArray is not a function`; green runs passed `query-contract.ts` 80/80 and `state-tx-public-api-contract.ts` 15/15.                            | Closed. |
| implementation             | complete | Added `EditorStateNodesApi.toArray(options, map?)`, implemented one-pass materialization in `public-state.ts`, replaced `slate-dom` manual read-boundary collection, added benchmark rows, and added a `slate` changeset. | Closed. |
| clawsweeper-related-issues | complete | No rerun: this additive query API does not change any fixed issue claim. Existing #5080 wording stays about reverse `entries`; #5684/#5028 remain related only.                                                           | Closed. |
| diff-review-pass           | complete | Reviewed the changed `toArray` implementation, DOM bridge caller, tests, benchmark rows, changeset, and synced reference docs. No `toArray` issue found.                                                                  | Closed. |
| verification-sweep-pass    | complete | Final focused tests, package typechecks, site typecheck, bad-pattern grep, benchmark, lint, and `bun check` passed.                                                                                                       | Closed. |

Commands run:

```bash
bun test ./packages/slate/test/query-contract.ts
bun test ./packages/slate/test/state-tx-public-api-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun typecheck:site
bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
bun lint
bun check
bun run completion-check
```

Focused evidence:

- `query-contract.ts`: 80 pass, 0 fail.
- `state-tx-public-api-contract.ts`: 15 pass, 0 fail.
- `slate` typecheck: pass.
- `slate-dom` typecheck: pass.
- `typecheck:site`: pass.
- Query/ref benchmark: pass; `firstMatchFindMs` and `firstMatchSomeMs` stay far
  faster than materialized first-match lanes, while full `toArray`
  materialization stays in the manual collection band.
- Bad-pattern grep across `packages`, `site/examples/ts`, and `scripts`: no
  returned `state.nodes.entries(...)` generator from `editor.read` and no
  first-entry `Array.from(...)[0]` teaching pattern.
- `bun lint`: pass.
- `bun check`: pass. It includes Biome, ESLint, package/site/root typecheck,
  Bun tests, and Slate React Vitest.
- `bun run completion-check`: pass against
  `.tmp/019e2695-bb53-7f13-aecf-17e30265a140/completion-check.md`.

Broad-gate cleanup:

- `bun check` initially exposed an existing Slate React annotation projector
  runtime failure and then a lint issue in the projector overload shape.
- The cleanup kept the already-present projector API, unified its hook
  signatures, added the missing `useMemo` import in `site/examples/ts/inlines.tsx`,
  and preserved the explicit custom-deps contract with the same narrow lint
  pattern used by `useEditorState`.
- Focused proof after cleanup:
  `bun test:vitest -- test/annotation-store-contract.test.tsx` passed 10/10.

Changed implementation files:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/test/query-contract.ts`
- `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `.tmp/slate-v2/scripts/benchmarks/core/current/query-ref-observation.mjs`
- `.tmp/slate-v2/.changeset/slate-state-nodes-to-array.md`

Additional broad-gate cleanup files:

- `.tmp/slate-v2/site/examples/ts/inlines.tsx`
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-widget-store.tsx`

Changed reference/state files:

- `docs/slate-v2/references/pr-description.md`
- `docs/research/decisions/slate-v2-node-query-api-should-keep-lazy-entries-and-add-first-match-helpers.md`
- `.tmp/019e2695-bb53-7f13-aecf-17e30265a140/completion-check.md`
