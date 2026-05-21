# Slate v2 Node Query API Ralplan

Date: 2026-05-14

## 1. Current Verdict

Status: done.

No, the current example shape is not absolute best:

```ts
const [link] = editor.read((state) =>
  Array.from(
    state.nodes.match({
      match: (n) => NodeApi.isElement(n) && n.type === "link",
    }),
  ),
);
```

The underlying v2 traversal is still lazy and generator-based, but this call
site throws that away by materializing all matches to read one entry. It also
has avoidable API stutter: `state.nodes.match({ match: ... })`.

Draft target:

```ts
const link = editor.read((state) =>
  state.nodes.find({
    match: (n) => NodeApi.isElement(n) && n.type === "link",
  }),
);

const isActive = editor.read((state) =>
  state.nodes.some({
    match: (n) => NodeApi.isElement(n) && n.type === "link",
  }),
);

for (const [node, path] of state.nodes.entries({ at, match })) {
  // lazy all-match traversal
}
```

Current score: `0.94`.

Current-state read, issue-ledger cache validation, source/research grounding,
alias policy, API objection pass, DX-extension audit, benchmark acceptance rows,
and closure score are complete. The plan is ready for user review and a later
Ralph execution.

Follow-up note, 2026-05-14: the broader generator-materialization review in
`docs/plans/2026-05-14-slate-v2-generator-materialization-api-ralplan.md`
supersedes only this plan's earlier blanket rejection of `state.nodes.toArray`.
`entries` / `find` / `some` stay accepted; the new plan reopens a narrow
allocation-explicit materializer for read-boundary array returns.

## 2. Intent And Boundary

Intent: keep Slate v2's query API as fast as legacy Slate for first-match and
iterator consumers while keeping the accepted `editor.read` / `editor.update`
lifecycle boundary.

Desired outcome:

- First-match active checks do not call `Array.from`.
- Boolean active checks do not call `Array.from`.
- All-match consumers still get lazy traversal.
- Public names are less weird than `nodes.match({ match })`.
- Slate v2 keeps the state/tx API shape instead of restoring static
  `Editor.nodes(editor, ...)` as the normal public route.

In scope:

- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/editor/nodes.ts`
- current examples that use `state.nodes.match` for first-match checks
- focused query-contract tests and a small query benchmark
- issue-ledger accounting for the `Editor.nodes` / query API cluster

Non-goals:

- no React render/runtime rewrite;
- no raw tree model rewrite;
- no ProseMirror integer-position model;
- no Lexical node-map/type-index migration unless benchmarks prove repeated
  global type queries are hot;
- no current-version Plate or slate-yjs adapter compatibility promise.

Decision boundaries:

- Slate Ralplan may decide public API target shape and proof gates.
- Ralph owns implementation edits in `.tmp/slate-v2`.
- Hard cut `state.nodes.match` to `state.nodes.entries` by default. The local
  built `dist` contains the draft API, but the package changelog has no public
  v2/state-query release note; treat this as pre-release until a release owner
  proves otherwise. If the draft API already shipped outside this repo, keep a
  deprecated `match` alias to `entries` for one cycle only and remove it before
  stable v2.

Unresolved user-decision points: none for the current pass. The remaining work
is technical proof and score hardening.

## 3. Decision Brief

Principles:

- Keep reads explicit through `editor.read`.
- Keep traversal lazy by default.
- Do not make common first-match checks allocate arrays.
- Keep Slate terminology close to `NodeEntry`, `match`, `mode`, `voids`, and
  `pass`.
- Prefer a small generic query surface over plugin/product helpers in core.
- Add generic boolean helpers only when they mirror Slate's existing
  match-filter semantics without requiring a second candidate predicate.

Top drivers:

- Current v2 query owner is a generator:
  `.tmp/slate-v2/packages/slate/src/editor/nodes.ts:6`.
- Raw node traversal is also a generator:
  `.tmp/slate-v2/packages/slate/src/interfaces/node.ts:677`.
- Public read state exposes `state.nodes.match`:
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts:960`.
- Examples materialize first-match checks:
  `.tmp/slate-v2/site/examples/ts/inlines.tsx:180` and
  `.tmp/slate-v2/site/examples/ts/richtext.tsx:411`.
- Legacy Slate let first-match destructuring consume only the first generator
  yield: `../slate/packages/slate/src/editor/nodes.ts:6`.

Viable options:

| Option                                                   | Pros                                                           | Cons                                                                            | Verdict                     |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| Keep `state.nodes.match` only                            | Smallest change; current tests already use it.                 | Keeps `match({ match })` stutter and encourages `Array.from(...)[0]`.           | reject as not absolute best |
| Add `find` / `some`, keep `match` as lazy all-match name | Low churn; fixes performance footgun for common checks.        | Still leaves the odd all-match name public.                                     | viable fallback             |
| Rename all-match to `entries`, add `find` / `some`       | Best DX and preserves lazy semantics with clear result naming. | Breaking rename from current v2 draft API.                                      | chosen if pre-release       |
| Restore public static `Editor.nodes(editor, ...)`        | Closest to legacy Slate snippets.                              | Fights accepted state/tx read lifecycle and creates two public read routes.     | reject                      |
| Copy ProseMirror callback traversal                      | Allocation-free.                                               | Worse Slate DX; no natural first entry return.                                  | reject                      |
| Copy Lexical array/type-map query surface                | Can be fast for type-index reads.                              | Overfits Lexical's key/node-map runtime and makes Slate less path/tree-native.  | reject for this slice       |
| Copy Tiptap product query helpers                        | Broad app DX: `querySelector`, `findChildren`, `isNodeActive`. | Moves plugin/product policy into raw Slate and encourages selector/string APIs. | reject for core             |

Chosen option: rename lazy all-match read API to `state.nodes.entries`, add
`state.nodes.find`, and add `state.nodes.some`. Keep `match` as the predicate
option name.

Consequences:

- Existing v2 examples/tests using `state.nodes.match` need a mechanical rename.
- First-match examples become both shorter and more honest about traversal cost.
- `find` and `some` must be implemented by consuming the existing generator only
  until the result is known.

Follow-ups:

- Add a small first/last/no-match benchmark in Ralph or extend the existing
  query-ref benchmark.
- Add a visit-count contract test.

## 4. Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | No React surface changes; the hot-path concern is avoiding allocation during read selectors and toolbar active checks. Current examples at `.tmp/slate-v2/site/examples/ts/inlines.tsx:180`, `.tmp/slate-v2/site/examples/ts/richtext.tsx:411` materialize first-match reads; the target replaces them with early-exit helpers. The DX audit rejects ambiguous all-selected helpers unless a candidate/predicate split is proven. `cwd .tmp/slate-v2`, `bun ./scripts/benchmarks/core/current/query-ref-observation.mjs` passed and recorded current query-read overhead for the existing all-match path. |
| Slate-close unopinionated DX                             |  0.94 | Keeps `editor.read`, `NodeEntry`, `match`, `mode`, `voids`, `pass`; rejects static API restoration. Evidence: `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:180`, `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1047`; legacy generator pressure from `../slate/packages/slate/src/editor/nodes.ts:6`.                                                                                                                                                                                                                                                                                  |
| Plate and slate-yjs migration-backbone shape             |  0.90 | Deterministic lazy query primitives remain substrate-level and plugin-friendly; no serialized operation, remote-apply, or current Plate adapter claim is made. Maintainer pass accepts the raw-core boundary and rejects product helpers.                                                                                                                                                                                                                                                                                                                                                                 |
| Regression-proof testing strategy                        |  0.94 | Focused query-contract, public-surface typecheck, early-exit visit-count tests, reverse/pass/void/mode parity, and grep cleanup gates are named. Current gates passed: `cwd .tmp/slate-v2`, `bun test ./packages/slate/test/query-contract.ts` -> `79 pass`; `bun --filter slate typecheck` -> pass.                                                                                                                                                                                                                                                                                                      |
| Research evidence completeness                           |  0.93 | Local legacy Slate, ProseMirror, Lexical, and Tiptap sources were read; research decision added at `docs/research/decisions/slate-v2-node-query-api-should-keep-lazy-entries-and-add-first-match-helpers.md`; issue cache rows were reused without broad GitHub rediscovery.                                                                                                                                                                                                                                                                                                                              |
| shadcn-style composability and hook/component minimalism |  0.88 | No UI; the API removes app helper boilerplate while keeping raw Slate core small. Example cleanup is part of Ralph scope, not an extra product layer.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Total: `0.94`.

Completion threshold is met. The plan is ready for user review.

## 5. Source-Backed Architecture North Star

Slate v2 should remain:

- read/update lifecycle first;
- lazy traversal by default;
- explicit all-match iteration for structural code;
- first-match helpers for common active checks;
- unopinionated core primitives, not product/plugin shortcuts.

## 6. Ecosystem Strategy Synthesis

| System       | Source                                                                                                                                                                         | Mechanism                                                                                     | Avoids                                                | Steal                                                            | Reject                                                            | Slate target                                           | Verdict |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ------- |
| Legacy Slate | `../slate/packages/slate/src/editor/nodes.ts:6`                                                                                                                                | Generator-based `Editor.nodes` traversal.                                                     | Full-array work for first entry destructuring.        | Lazy node-entry iteration semantics.                             | Static editor-first public route as normal v2 API.                | `state.nodes.entries(...)` lazy iterable.              | partial |
| ProseMirror  | `../prosemirror-model/src/node.ts:79`; `../prosemirror-model/src/fragment.ts:29`                                                                                               | Callback traversal with prune-by-`false`.                                                     | Allocation in core traversal.                         | Allocation-free traversal and prune discipline.                  | Callback-only public DX.                                          | Existing `pass` plus lazy entries.                     | partial |
| Lexical      | `../lexical/packages/lexical/src/LexicalEditorState.ts:122`; `../lexical/packages/lexical/src/LexicalSelection.ts:527`; `../lexical/packages/lexical/src/LexicalUtils.ts:1274` | Read lifecycle, cached selection arrays, optional type-to-node map for read-only type lookup. | Unsafe reads and repeated full scans for type groups. | Keep read lifecycle; consider indexes only with benchmark proof. | Array return shape for Slate DFS query.                           | `editor.read` plus lazy `entries` / `find` / `some`.   | partial |
| Tiptap       | `../tiptap/packages/core/src/NodePos.ts:206`; `../tiptap/packages/core/src/helpers/findChildren.ts:11`; `../tiptap/packages/core/src/helpers/isNodeActive.ts:8`                | Product helpers return arrays; `querySelector` has first-item escape.                         | Bad product DX around common queries.                 | First-match and active-check convenience.                        | Product-layer array helpers and selector strings as raw core law. | `find` / `some` in core, arrays only by caller spread. | partial |

## 7. Public API Target

Target:

```ts
type EditorStateNodesApi = {
  entries: <T extends Node>(
    options?: EditorNodesOptions<T>,
  ) => Generator<NodeEntry<T>, void, undefined>;
  find: <T extends Node>(
    options?: EditorNodesOptions<T>,
  ) => NodeEntry<T> | undefined;
  some: <T extends Node>(options?: EditorNodesOptions<T>) => boolean;
};
```

Keep existing direct accessors like `above`, `children`, `first(at)`, `get`,
`levels`, `next`, `previous`, and `void`. Do not overload `first` for query
matching because it already means first node at a location.

Hard cut:

- Cut `state.nodes.match` by default. The local `dist` artifact contains the
  draft API, but `.tmp/slate-v2/packages/slate/CHANGELOG.md` has no
  v2/state-query release entry. Treat this as pre-release local build state.
- If a release owner confirms that `state.nodes.match` already shipped outside
  this repo, keep a deprecated alias to `entries` for one cycle only, with
  examples and docs moved to `entries`, `find`, and `some`.

## 7.1 Public DX Candidate Audit

Accepted now: no additional public node-query method beyond `entries`, `find`,
and `some`.

Rejected or deferred:

| Candidate                                          | Reference pressure                                                                                                              | Verdict                    | Reason                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state.nodes.every(options)`                       | JavaScript collection symmetry; all-selected checks in editor toolbars; ProseMirror callback traversal can stop on first false. | reject for this plan       | With Slate's current `EditorNodesOptions`, `match` is the yield filter. An `every` helper would either be vacuous over already-matched entries or require a second candidate predicate. Use `some` with a negative match or a product helper until a clean candidate/assertion API is proven.                                |
| `state.nodes.closest` / `findParent`               | Lexical `$findMatchingParent`; Tiptap parent helpers.                                                                           | reject for this plan       | Slate already has `above`, which is the established path/location-aware ancestor query. Adding a second name weakens Slate-close DX.                                                                                                                                                                                         |
| `state.nodes.querySelector` / `querySelectorAll`   | Tiptap `NodePos` selector DX.                                                                                                   | reject for core            | Selector strings are product-layer policy and do not map cleanly to Slate's unopinionated node shape, custom element typing, or path options.                                                                                                                                                                                |
| `state.nodes.findChildren` / `findChildrenInRange` | Tiptap helper surface.                                                                                                          | reject for core            | `entries({ at, match })` is the raw primitive; product helpers can live in Plate or examples.                                                                                                                                                                                                                                |
| `state.nodes.count`                                | Common app convenience.                                                                                                         | defer                      | It can avoid array allocation but still forces full traversal unless a limit is introduced. Add only after real first-party or Plate migration call sites prove repeated count checks are hot.                                                                                                                               |
| `state.nodes.toArray` / `filter` / `map`           | Lexical/Tiptap array-heavy helpers; later `slate-dom` read-boundary materialization pressure.                                   | split by follow-up plan    | `filter` / `map` stay rejected for raw core. A narrow allocation-explicit `state.nodes.toArray(options, map?)` materializer is reopened by `docs/plans/2026-05-14-slate-v2-generator-materialization-api-ralplan.md` because manual loops inside `editor.read` are worse DX and returning a generator from `read` is unsafe. |
| Type-index lookup by element type                  | Lexical read-only type-to-node map.                                                                                             | benchmark-only future lane | Could win repeated global type queries, but it changes memory/update complexity. Do not add without a benchmark showing DFS is the bottleneck.                                                                                                                                                                               |

## 8. Internal Runtime Target

- `entries` delegates to the existing `getNodes(editor, options)` generator.
- `find` uses `for (const entry of getNodes(...)) return entry`.
- `some` uses `for (const _ of getNodes(...)) return true`.
- No `Array.from` inside the helpers.
- No global type index in this slice.

## 9. Hook / Component / Render DX Target

- Toolbar active checks use `state.nodes.some(...)`.
- Uniform selection checks can use `some` with a negative match or a Plate-level
  helper; raw Slate should not add an ambiguous `every` yet.
- Callers that need the actual node use `state.nodes.find(...)`.
- Structural transforms and DOM bridge code use `for...of state.nodes.entries`.
- Examples should not teach `Array.from(...)[0]`.

## 10. Plate Migration-Backbone Target

Plate can build product helpers on top of `find`, `some`, and `entries` without
wrapping every core call or restoring static `Editor.nodes`. The target is a
small substrate, not Plate's current public API.

## 11. Slate-Yjs Migration-Backbone Target

No direct collab data-model change. Deterministic lazy query order remains
important for plugin and normalization decisions, but this plan makes no
serialized operation or remote-apply claim.

## 12. Issue-Ledger Accounting

ClawSweeper / cache status: reuse existing query-surface cache. Do not run
broad live GitHub discovery.

| Issue | Cluster                               | Claim                       | Why                                                                                                                                                                                                        | Proof route                                                                                 | V2 sync ledger | PR line             |
| ----- | ------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- | ------------------- |
| #5080 | editor-nodes-reverse-iteration-order  | already fixed by prior lane | Current plan must not reopen reverse-order semantics; it depends on the existing lazy query owner.                                                                                                         | `.tmp/slate-v2/packages/slate/test/query-contract.ts`; coverage matrix row already present. | unchanged      | unchanged           |
| #5684 | editor-nodes-traversal-ambiguity      | Related                     | Vague `SlateEditor.nodes` match issue; this API cleanup may improve ergonomics but cannot claim the unknown repro.                                                                                         | ask-for-repro if issue is revisited                                                         | unchanged      | related matrix only |
| #5028 | editor-nodes-pass-filtering           | Related                     | `pass` already exists; this plan keeps it and does not create a new pass claim.                                                                                                                            | source pointers in `interfaces/editor.ts` and `interfaces/node.ts`                          | unchanged      | related matrix only |
| #3885 | docs-api-confusion-and-example-gaps   | Not claimed                 | Renaming `match` to `entries` and examples using `find`/`some` improves local example clarity, but the issue asks docs to explain selection-relative `Editor.nodes`; closure needs an explicit docs route. | docs/example cleanup only if Ralph includes it                                              | unchanged      | related matrix only |
| #4041 | legacy-browser-and-compatibility-debt | Not claimed                 | Generator transpilation for IE11 is stale environment debt, not current v2 API law.                                                                                                                        | none                                                                                        | unchanged      | none                |

PR description status: unchanged. This plan changes no fixed issue claims,
accepted release-gate claims, or maintainer-facing PR narrative yet; the
existing #5080 fixed line remains correct and #5684/#5028/#3885 stay related or
not claimed.

## 13. Legacy Regression Proof Matrix

| Contract                 | Current evidence                                                          | Required Ralph proof                                                            |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Lazy all-match traversal | `editor/nodes.ts:6`; `NodeApi.nodes` at `interfaces/node.ts:677`          | `state.nodes.entries` returns the same sequence as current `state.nodes.match`. |
| First-match laziness     | legacy generator destructuring; current examples regress via `Array.from` | visit-count test proves `find` stops after first match.                         |
| Boolean active checks    | examples use materialized first match                                     | `some` returns true/false without full materialization.                         |
| Reverse ordering         | #5080 fixed in existing query contract                                    | rename/alias must not regress reverse-order test.                               |
| `pass` pruning           | current options include `pass`                                            | `entries` / `find` / `some` all honor `pass`.                                   |

## 14. Browser Stress / Parity Strategy

No browser behavior changes are planned. Browser proof is not required unless
Ralph touches `slate-react`, `slate-dom` DOM bridge behavior, or examples with
interactive selection assertions.

## 15. Applicable Implementation-Skill Review Matrix

| Lens                          | Status          | Reason                                                                 | Finding                                                                | Plan delta                                           |
| ----------------------------- | --------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| `vercel-react-best-practices` | applied         | Read selectors and toolbar active checks are React-adjacent hot paths. | Avoid allocating arrays during render-adjacent selectors.              | Add `some`/`find`; examples stop using `Array.from`. |
| `performance-oracle`          | applied         | Node queries can scan large documents or large selections.             | Keep generator; add early-exit helpers; benchmark first/last/no match. | Benchmark gate required.                             |
| `performance`                 | skipped for now | No production p95/RUM claim.                                           | Use only if benchmarks expose repeated-query cohorts.                  | none                                                 |
| `tdd`                         | applied         | Public API change and performance footgun.                             | Add public contract tests before implementation.                       | Red tests first.                                     |
| `build-web-apps:shadcn`       | skipped         | No UI component surface.                                               | Example code cleanup only.                                             | none                                                 |
| `react-useeffect`             | skipped         | No effect/subscription change.                                         | none                                                                   | none                                                 |

## 16. High-Risk Deliberate Mode

Triggered because this changes public API.

Pre-mortem:

1. Alias policy confusion leaves both `match` and `entries` in examples forever.
2. `find` / `some` accidentally call `Array.from` internally and only improve DX.
3. Rename breaks extension state groups or tx groups because both spread
   `state.nodes` into transaction nodes.

Proof plan:

- Public-surface type test for `entries`, `find`, and `some`.
- Query-contract sequence parity for `entries`.
- Visit-count early-exit test for `find` and `some`.
- Reverse / pass / voids regression tests through renamed API.
- Example grep banning `Array.from(state.nodes.entries(...))[0]` style.

Rollback / hard-cut answer: hard cut `match` to `entries` by default. If the
release owner proves `match` already shipped, keep `match` as a deprecated alias
for one cycle and still add `find` / `some`. Do not drop the early-exit helpers.

## 17. Hard Cuts And Rejected Alternatives

- Cut example first-match `Array.from` patterns.
- Cut `match` as the all-match method name if pre-release.
- Reject static `Editor.nodes` as normal v2 public API.
- Reject callback-only ProseMirror traversal.
- Reject global type indexes without benchmark proof.
- Reject product-style query helpers in raw Slate core.
- Defer `count` and type indexes until benchmarks prove a real hot path.

## 18. Slate Maintainer Objection Ledger

| Change                                       | Likely objection                                          | Steelman antithesis                                              | Why still keep                                                                                                                  | Migration answer                                                                                                | Regression proof                                         | Verdict       |
| -------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- |
| `state.nodes.match` -> `state.nodes.entries` | "Why rename a working API?"                               | Current name is already close enough and avoids churn.           | `match({ match })` is awkward public API and teaches bad examples; `entries` names the result.                                  | Hard cut before release; one-cycle deprecated alias only if release owner proves the draft API already shipped. | public-surface and query-contract parity.                | keep          |
| Add `find`                                   | "Users can destructure the iterator."                     | Advanced users can write `for...of`; extra API grows surface.    | Current examples already show users reaching for `Array.from`; first-match is common and generic.                               | Replace `Array.from(...)[0]` with `find`.                                                                       | early-exit visit-count test.                             | keep          |
| Add `some`                                   | "Boolean helper is redundant with `find`."                | `!!find(...)` is enough.                                         | Active checks are common; `some` communicates no node allocation or node use.                                                   | Replace `!!Array.from(...)[0]` with `some`.                                                                     | early-exit visit-count test.                             | keep          |
| Reject `every` for now                       | "All-selected checks are common; JavaScript has `every`." | A symmetric collection API is attractive and could avoid arrays. | Slate's `match` option already filters yielded entries, so `every({ match })` is not clean without another candidate predicate. | Plate/product helpers can compose `entries` or negative `some` until a better raw API is proven.                | candidate audit plus no public type surface for `every`. | keep rejected |
| Do not restore `Editor.nodes` public route   | "Legacy Slate snippets were simpler."                     | Static route has known DX and lets destructuring stay lazy.      | v2 read/update lifecycle is accepted architecture; two read routes confuse extension boundaries.                                | Use `editor.read((state) => state.nodes.entries/find/some(...))`.                                               | public API docs and examples.                            | keep          |

## 19. Pass Schedule And Pass-State Ledger

| Pass                                         | Status   | Evidence added                                                                                                                                                                                                            | Plan delta                                                                                                           | Open issues | Next owner                     |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------ |
| current-state read and initial score         | complete | Read live `.tmp/slate-v2` query source, examples, query tests, legacy Slate, ProseMirror, Lexical, Tiptap, cached issue rows; ran focused query-contract test.                                                            | Drafted target `entries` / `find` / `some`; rejected current `Array.from` shape.                                     | none        | Related issue cache validation |
| related issue cache validation               | complete | Reused `gitcrawl-live-open-ledger`, `gitcrawl-v2-sync-ledger`, `issue-coverage-matrix`, `fork-issue-dossier`, and PR reference rows for #5080/#5684/#5028/#3885/#4041.                                                    | Kept #5080 unchanged as already fixed; #5684 repro-first; #5028 related; #3885 not claimed; #4041 stale/not claimed. | none        | Intent/boundary hardening      |
| intent/boundary and decision brief hardening | complete | Checked local package changelog, package metadata, and built dist exposure.                                                                                                                                               | Accepted hard cut by default; alias only if release owner proves shipped API.                                        | none        | Performance and benchmark pass |
| performance and benchmark pass               | complete | Ran `bun ./scripts/benchmarks/core/current/query-ref-observation.mjs` in `.tmp/slate-v2`; current all-match query-read overhead recorded as `nodesReadAfterWriteMs mean 20.28ms`, `+5.72ms` over write-only in that lane. | Added benchmark thresholds and early-exit proof requirements.                                                        | none        | Objection/high-risk pass       |
| objection/high-risk pass                     | complete | Re-scored maintainer objections after alias policy and issue cache validation.                                                                                                                                            | Accepted `entries` rename, `find`, `some`, and no static `Editor.nodes` restoration.                                 | none        | DX-extension audit             |
| DX-extension audit                           | complete | Re-read ecosystem helper pressure from Lexical, ProseMirror, and Tiptap.                                                                                                                                                  | Rejected/deferred `every`, `closest`, selector APIs, child/product helpers, count, arrays, and type indexes.         | none        | Closure score                  |
| closure score                                | complete | Re-read plan gates and current verification.                                                                                                                                                                              | Raised score to `0.94`; ready for user review and later Ralph execution.                                             | none        | User review                    |

## 20. Plan Deltas From Review

Added:

- Draft hard-cut target from `state.nodes.match` to `state.nodes.entries`.
- Draft `find` and `some` helpers.
- DX candidate audit for extra helpers from Lexical, ProseMirror, and Tiptap.
- Research decision comparing legacy Slate, ProseMirror, Lexical, and Tiptap.
- Focused `.tmp/slate-v2` verification row for current query contract.

Dropped:

- Restoring static `Editor.nodes` as normal v2 public route.
- Copying ProseMirror callback traversal.
- Treating Lexical array returns as a Slate core query model.
- Copying Tiptap selector and product helper APIs into raw Slate.
- Adding `every` before Slate has a clean candidate/assertion split.

Strengthened:

- Example cleanup must remove first-match `Array.from`.
- Benchmark/test gates must prove early exit.

## 21. Open Questions And What Would Change The Decision

- Hard cut `state.nodes.match` by default. Use a deprecated alias for one cycle
  only if a release owner proves the draft API already shipped outside this
  repo.
- If benchmarks show repeated global type queries dominate, plan a separate
  optional index lane. Do not mix that into this API cleanup.
- If real call sites need count-without-materialization, plan a separate
  `state.nodes.count` lane with `limit` semantics and benchmark proof.
- If source audit finds many all-match consumers where `entries` reads worse,
  keep `match` as the all-match method and still add `find` / `some`.

## 22. Implementation Phases With Owners

Ralph phase 1:

- Add public API tests for `entries`, `find`, and `some`.
- Add early-exit visit-count tests.
- Add parity tests proving `entries` matches current `match` ordering,
  including `reverse`, `pass`, `voids`, and modes.

Ralph phase 2:

- Implement helpers in `core/public-state.ts` and types in `interfaces/editor.ts`.
- Rename examples and package callers.
- Decide and implement alias policy.

Ralph phase 3:

- Add or run focused benchmark for first/last/no-match query cases.
- Run release gates.
- Sync issue/docs ledgers if docs/examples change.

## 23. Fast Driver Gates

Planning-only gate:

```bash
# cwd: /Users/zbeyens/git/plate-2
bun run completion-check
```

Slate v2 gates:

```bash
# cwd: /Users/zbeyens/git/slate-v2
bun test ./packages/slate/test/query-contract.ts
bun --filter slate typecheck
rg -n "Array\\.from\\(\\s*state\\.nodes\\.(match|entries)|Array\\.from\\(\\s*tx\\.nodes\\.(match|entries)" packages site/examples/ts
```

Benchmark gate draft:

```bash
# cwd: /Users/zbeyens/git/slate-v2
bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
```

Acceptance thresholds for Ralph's focused query helper benchmark:

- first-match-at-start: `find` and `some` must visit no more than the matched
  prefix plus ancestors needed by current traversal;
- first-match-at-end / no-match: no worse than current `entries` traversal by
  more than 5 percent median across five warm samples;
- first-match-at-start: `find` and `some` must be at least 10x faster than
  `Array.from(entries(...))[0]` on a 10k-block document, or the benchmark must
  explain why traversal setup dominates and still prove early-exit visit count;
- no helper may allocate an all-match array internally.

The current pass ran:

```bash
# cwd: /Users/zbeyens/git/slate-v2
bun test ./packages/slate/test/query-contract.ts
# result: 79 pass, 0 fail

# cwd: /Users/zbeyens/git/slate-v2
bun --filter slate typecheck
# result: pass

# cwd: /Users/zbeyens/git/slate-v2
bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
# result: pass; nodesReadAfterWriteMs mean 20.28ms, delta +5.72ms

# cwd: /Users/zbeyens/git/slate-v2
rg -n "Array\\.from\\(\\s*state\\.nodes\\.(match|entries)|Array\\.from\\(\\s*tx\\.nodes\\.(match|entries)|state\\.nodes\\.match\\(|tx\\.nodes\\.match\\(" packages site/examples/ts
# result: existing `state.nodes.match` callers found in examples, slate-dom,
# and query-contract; these are Ralph rename/cleanup targets.

# cwd: /Users/zbeyens/git/plate-2
bun run completion-check
# result before closeout: expected failure while Slate Ralplan was pending.
```

## 24. Final User-Review Handoff Outline

Ready handoff:

- Public API: `state.nodes.match` -> `state.nodes.entries`; add `find`; add
  `some`; alias policy.
- Runtime: generator retained; `find`/`some` early-exit.
- DX: examples stop using `Array.from` for first match.
- Tests: public-surface, query parity, early-exit, reverse/pass/void
  regression.
- Issues: no new `Fixes` claim; #3885 stays not claimed unless a docs route is
  explicitly added.
- Hard cuts: no static `Editor.nodes` restoration.

## 25. Final Completion Gates

Passed:

- score is `0.94` and no dimension is below `0.85`;
- issue-ledger pass is complete and PR reference status is recorded as
  unchanged;
- alias policy is decided: hard cut by default, one-cycle alias only if release
  owner proves external shipment;
- benchmark/test acceptance rows are concrete;
- objection ledger rows are accepted;
- continuation file can be removed after marking completion done.

## 26. Ralph Execution Result

Status: complete.

Execution date: 2026-05-14.

Implemented in `.tmp/slate-v2`:

- Added `state.nodes.entries(options)` as the lazy all-match query API.
- Added `state.nodes.find(options)` and `state.nodes.some(options)` as
  early-exit helpers.
- Cut the public `state.nodes.match(options)` draft API from the state/tx node
  surface.
- Updated first-party examples and DOM internals away from `Array.from(
state.nodes.match(...))` first-match patterns.
- Extended `query-ref-observation.mjs` with first-match array, `find`, `some`,
  last-match, and no-match lanes.

Proof:

```bash
# cwd: .tmp/slate-v2
bun test ./packages/slate/test/query-contract.ts
# result: 80 pass, 0 fail

bun --filter slate typecheck
# result: pass

bun --filter slate-dom typecheck
# result: pass

bun typecheck:site
# result: pass

bun check
# result: pass; includes lint, package/site/root typecheck, Bun tests, and
# slate-react Vitest suite

bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
# result: pass; default 200-block run recorded firstMatchArrayMs mean 23.20ms,
# firstMatchFindMs mean 0.45ms, firstMatchSomeMs mean 0.28ms

DRIFT_BENCH_BLOCKS=10000 DRIFT_BENCH_QUERY_OPS=20 \
DRIFT_BENCH_WRITE_OPS=5 DRIFT_BENCH_REFS=5 DRIFT_BENCH_ITERATIONS=3 \
bun ./scripts/benchmarks/core/current/query-ref-observation.mjs
# result: pass; 10k-block run recorded firstMatchArrayMs mean 190.70ms,
# firstMatchFindMs mean 0.23ms, firstMatchSomeMs mean 0.11ms,
# lastMatchFindMs mean 135.88ms, noMatchFindMs mean 123.50ms

rg -n "Array\\.from\\(\\s*state\\.nodes\\.(match|entries)|Array\\.from\\(\\s*tx\\.nodes\\.(match|entries)|state\\.nodes\\.match\\(|tx\\.nodes\\.match\\(" packages site/examples/ts scripts
# result: no matches
```

Reference docs:

- `docs/slate-v2/references/pr-description.md` now names
  `state.nodes.entries`, `state.nodes.find`, and `state.nodes.some` as the
  current public query shape.
- #5080 ledger wording now uses `state.nodes.entries({ reverse: true })`.
- No new fixed issue claim was added.

Residual risk:

- `.tmp/slate-v2` had unrelated dirty example/runtime files before this execution
  (`site/examples/ts/embeds.tsx`, `site/examples/ts/images.tsx`,
  `site/examples/ts/paste-html.tsx`, `site/examples/ts/rendering-strategy-runtime.tsx`,
  and related example registry/test files). They were not reverted or claimed
  as part of this slice.
