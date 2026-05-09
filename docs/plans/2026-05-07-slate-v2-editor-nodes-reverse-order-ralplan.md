# Slate v2 Editor Nodes Reverse Order Ralplan

Date: 2026-05-07

## 1. Current Verdict

Done.

`#5080` is the next right owner. The fragment cluster is closed enough for now,
and this is a clean package-only traversal contract bug with a live mismatch in
current `../slate-v2`.

The v2 target is not "bring back legacy `Editor.nodes` as a static API." Current
v2 exposes this through `editor.read((state) => state.nodes.match(...))`, which
delegates to the same `editor/nodes.ts` traversal. Fix the traversal contract
there. Resurrecting old API shape would be a dumb side quest.

Current score: `0.92`.

Current-state read, related issue discovery, issue-ledger sync, and
intent/decision hardening, source refresh, and performance/TDD pressure are
complete. Objection/high-risk pressure and closure score are complete too. The
plan is ready for Ralph execution.

## 2. Intent And Boundary

Intent: make the public editor query reverse option mean the real reverse of
forward matched traversal, not "reverse siblings while still yielding parents
before nested matches."

Desired outcome:

- Forward editor query traversal for a fixed `at`, `match`, `mode`, `voids`,
  and `pass` returns stable DFS order.
- Reverse editor query traversal for the same inputs returns the exact opposite
  sequence of matched entries.
- `Fixes #5080` is only claimed after a public v2 query test proves the original
  nested-match shape.

In scope:

- `../slate-v2/packages/slate/src/editor/nodes.ts`
- `../slate-v2/packages/slate/src/interfaces/node.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `Node.nodes` only if the later source refresh deliberately escalates the
  owner beyond the editor query layer
- issue coverage, fork dossier, PR reference, and completion state sync

Non-goals:

- no React, browser, DOM, or clipboard proof;
- no transform behavior changes;
- no `Editor.positions` or `Editor.levels` rewrite unless caller audit proves
  shared breakage;
- no raw `Node.nodes` / `Node.descendants` contract change by default;
- no legacy static `Editor.nodes` public API expansion unless a later public API
  pass explicitly accepts it;
- no closure for same-keyword transform or selection issues from gitcrawl
  neighbors.

Decision boundaries:

- Ralph may add the red test through current public v2 read API.
- Ralph may patch `../slate-v2/packages/slate/src/editor/nodes.ts`, because it
  is the current editor query owner behind `state.nodes.match`.
- Ralph may patch `Node.nodes` only after the source-refresh pass accepts the
  broader raw iterator contract change and updates direct iterator fixtures.
- Fixed issue language requires exact nested-match proof.

Unresolved user-decision points: none. The remaining uncertainty is technical
and can be answered from source and tests.

## 3. Decision Brief

Principles:

- Reverse must be a contract, not a vibe.
- Public v2 tests should use current v2 API, not legacy syntax.
- The editor query layer should not allocate the whole document just to reverse
  it unless the source-refresh pass proves the safer fix needs buffering.
- Issue closure needs exact repro shape and exact proof.

Top drivers:

- `docs/slate-issues/open-issues-ledger.md:850` marks `#5080` valid, direct,
  core-only, API-contract, ready-now, and high confidence.
- `docs/slate-issues/test-candidate-map/5129-5066.md:277` marks the public test
  route as `Editor.nodes` reverse traversal ordering.
- Current v2 exposes the path as `state.nodes.match` in
  `../slate-v2/packages/slate/src/core/public-state.ts:943`.
- `../slate-v2/packages/slate/src/editor/nodes.ts:37` flips `from` / `to` and
  delegates `reverse` to `Node.nodes`.
- `../slate-v2/packages/slate/src/interfaces/node.ts:669` yields a node before
  descent, and `interfaces/node.ts:686` only flips child order in reverse mode.
  That explains the exact mixed order from the issue.
- Direct `Node.descendants(..., { reverse: true })` fixtures currently expect a
  structural order where the parent still appears before reversed children, so
  changing raw `Node.nodes` is a wider contract change than this issue needs.

Viable options:

1. Fix the editor query layer in `editor/nodes.ts`.
   - Best because `#5080` is an editor query contract and current v2 public
     reads call it through `state.nodes.match`.
   - Keeps raw `Node.nodes` / `Node.descendants` contract changes out unless a
     later audit explicitly accepts them.
   - Risk: transforms also import this query helper, so reverse editor-query
     callers still need a focused audit.
2. Fix raw `Node.nodes` reverse DFS semantics.
   - Cleaner if Slate wants every node iterator to mean full reverse traversal.
   - Too wide by default because direct `Node.descendants(reverse)` fixtures
     currently encode parent-before-child structural order.
3. Patch only `core/public-state.ts` for `state.nodes.match`.
   - Lowest blast radius for v2 public read API.
   - Too narrow because it leaves the shared editor query helper inconsistent.
4. Keep behavior and document it.
   - Lowest implementation risk.
   - Wrong for a bug that has a strong reproducible mismatch and no good DX
     defense.

Chosen direction: option 1. `editor/nodes.ts` is the first owner. Raw
`Node.nodes` is an escalation path, not the default.

Consequences:

- Add public read-API proof first.
- Patch `editor/nodes.ts` by collecting emitted editor-query matches from a
  forward traversal and yielding that result list in reverse when `reverse` is
  true. Store matched entries only, not the whole node walk.
- If implementation changes raw `Node.nodes`, add direct iterator coverage for
  reverse nested traversal, `from` / `to`, and `pass`, and update legacy
  `Node.descendants(reverse)` expectations deliberately.

## 4. Live Source Grounding

Current public v2 owner:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:180` defines
  `EditorStateNodesApi`.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:200` names the public
  read API as `nodes.match`.
- `../slate-v2/packages/slate/src/core/public-state.ts:943` implements
  `state.nodes.match` by calling `getNodes(editor, options)`.

Current traversal owner:

- `../slate-v2/packages/slate/src/editor/nodes.ts:37` sets `from = reverse ?
  last : first`.
- `../slate-v2/packages/slate/src/editor/nodes.ts:41` delegates to
  `Node.nodes(editor, { reverse, from, to, pass })`.
- `../slate-v2/packages/slate/src/interfaces/node.ts:669` breaks on range
  bounds.
- `../slate-v2/packages/slate/src/interfaces/node.ts:674` yields before
  descending.
- `../slate-v2/packages/slate/src/interfaces/node.ts:686` chooses the last child
  first when `reverse` is true.
- `../slate-v2/packages/slate/test/interfaces/Node/descendants/reverse.tsx`
  currently expects a parent entry before reversed child text entries, proving
  raw `Node.nodes` has existing direct-fixture pressure.
- Reverse editor-query callers include `delete-text.ts`, `unwrap-nodes.ts`,
  `split-nodes.ts`, `wrap-nodes.ts`, `leaf-lifecycle.ts`, `previous.ts`, and
  `unhang-range.ts`; these are source-refresh audit targets before patching.

Source-refresh decision:

| Owner / caller | Current reverse use | Decision |
| --- | --- | --- |
| `core/public-state.ts` | `state.nodes.match` delegates to `getNodes(editor, options)`. | Target covered by patching `editor/nodes.ts`; do not patch `public-state.ts` only. |
| `editor/previous.ts` | asks for the first reverse match before a location. | Full reverse-of-forward matched output is the right contract for "previous". |
| `editor/unhang-range.ts` | scans text nodes backward and skips the hanging endpoint. | Full reverse-of-forward matched output preserves intent. |
| `transforms-text/delete-text.ts` | collects reverse text/element paths before cleanup mutations. | Full reverse matched order is safer because child/later paths appear before parents/earlier paths. |
| `transforms-node/unwrap-nodes.ts` | collects reverse matched nodes before unwrapping. | Full reverse matched order is the safer deepest/later-first mutation order. |
| `core/leaf-lifecycle.ts` | collects reverse element/editor paths before cleanup. | Full reverse matched order is safer for child-before-parent cleanup. |
| `split-nodes.ts`, `before.ts`, `positions.ts`, `levels.ts` | use `Editor.levels`, `Editor.positions`, or non-query reverse paths. | Out of scope for this patch. |
| raw `Node.nodes` / `Node.descendants` | direct iterator fixtures expect structural reverse order, not exact reverse DFS. | Do not change by default. Escalate only with explicit fixture updates. |

Exact patch strategy for Ralph:

1. Add the red public query test in `query-contract.ts`.
2. In `editor/nodes.ts`, normalize `at` into forward `from` / `to` bounds even
   when `reverse` is requested.
3. Run the existing `Node.nodes` traversal forward and keep the current
   `match`, `mode`, `universal`, `voids`, and `pass` filtering logic.
4. When `reverse` is false, yield as today.
5. When `reverse` is true, push emitted editor-query matches into a result
   array and `yield* results.reverse()` after traversal.
6. Do not change raw `Node.nodes` unless the red/green pass proves this strategy
   cannot satisfy `#5080` or breaks an accepted editor-query invariant.

Live probe from `/Users/zbeyens/git/slate-v2`:

```bash
bun -e 'import { createEditor } from "./packages/slate/src"; import { Editor } from "./packages/slate/src/internal"; const editor = createEditor(); Editor.replace(editor, { children: [{ type: "p", children: [{ text: "a" }, { type: "x", children: [{ text: "b" }] }, { text: "c" }, { type: "x", children: [{ text: "d" }] }] }, { type: "p", children: [{ text: "e" }] }], selection: null }); const match = node => node && typeof node === "object" && (node.type === "p" || node.type === "x"); const paths = opts => editor.read(state => Array.from(state.nodes.match({ at: [], match, ...opts })).map(([, path]) => path.join("."))); const forward = paths({}); const reverse = paths({ reverse: true }); console.log(JSON.stringify({ forward, reverse, expectedReverse: [...forward].reverse() }, null, 2));'
```

Observed:

```json
{
  "forward": ["0", "0.1", "0.3", "1"],
  "reverse": ["1", "0", "0.3", "0.1"],
  "expectedReverse": ["1", "0.3", "0.1", "0"]
}
```

Verdict: the bug reproduces in current v2 through the current read API.

Current test gap:

- `../slate-v2/packages/slate/test/query-contract.ts:74` has a helper for
  `state.nodes.match`.
- `query-contract.ts:1219` covers `Editor.positions(... reverse: true)`.
- `query-contract.ts:2163` covers `Editor.levels(... reverse: true)`.
- No current `state.nodes.match({ reverse: true })` nested-match assertion
  exists.

## 5. Performance And TDD Pressure

Verdict: matched-entry buffering is acceptable for editor-query `reverse`.

Why this is the right trade:

- It stores only entries that pass the editor-query filters, not every visited
  node in the document walk.
- Exact reverse-of-forward output requires knowing the full emitted result set
  unless we build a much more complex mirrored mode engine. That complexity
  would be a worse default for this bug.
- `editor/nodes.ts` already buffers for `universal`; this adds buffering only
  for caller-requested `reverse: true` output.
- Reverse query callers are finite package operations. Several cleanup and
  transform callers already materialize paths before mutating, so a matched
  result array does not introduce a new mutation style.
- The real cost is O(m) memory where `m` is emitted matches. A match-all reverse
  query over a huge document can allocate a large array, but that is the
  correctness cost of exact reverse output. It should be locked with
  query-contract coverage, not benchmarked in this plan unless a later
  performance pass identifies a hot path.

Rejected alternatives:

- Full tree buffering: too broad; it stores entries that never match.
- Raw `Node.nodes` rewrite: too wide for this issue because direct iterator
  fixtures already encode structural reverse behavior.
- Mirrored reverse mode engine: theoretically avoids result buffering, but it
  duplicates subtle `mode`, `universal`, `voids`, and `pass` behavior. That is
  where bugs breed.

Red/green proof order for Ralph:

1. Add one failing public query test in
   `../slate-v2/packages/slate/test/query-contract.ts` through
   `editor.read((state) => state.nodes.match(...))`.
2. Use nested matching elements where a parent and descendant both match; assert
   `reverse` equals `[...forward].reverse()`.
3. Start with `mode: "all"`, because that is the issue contract. Add
   `mode: "highest"` / `mode: "lowest"` coverage only if the implementation
   changes shared mode handling or the first red/green cycle exposes mode
   drift.
4. Do not change `Node.nodes` fixtures unless the implementation deliberately
   escalates the raw iterator contract.
5. Run focused proof first:

   ```bash
   bun test ./packages/slate/test/query-contract.ts -t "nodes reverse"
   ```

6. After the patch, run package checks:

   ```bash
   bun --filter slate typecheck
   bun lint:fix
   ```

Performance/TDD status: complete.

## 6. Issue Ledger Accounting

Target:

| Issue | Cluster | Claim | Why | Proof route | Sync status |
| --- | --- | --- | --- | --- | --- |
| #5080 | editor-nodes-reverse-iteration-order | intended fix | Valid, direct, core-only query API bug. | public v2 query-contract test plus iterator coverage if `Node.nodes` changes | pending |

Related candidates reviewed by ClawSweeper:

| Issue | Current read | Reason |
| --- | --- | --- |
| #5684 | Related / needs-repro | Same `SlateEditor.nodes` / match traversal API family, but live GitHub and local dossier show no concrete document shape, match predicate, or expected yielded path. |
| #5028 | Related | Same traversal API family. Current v2 already exposes `pass`; this lane owns reverse order only. |
| #3885 | Not claimed | Docs-only selection-relative `Editor.nodes` confusion; not traversal order behavior. |
| #4232, #5611, #3551, #3858 | Not current-lane claims | Found by broad `reverse true` search. They are input/history/destructive-transform failures, not `Editor.nodes` reverse matched traversal. |
| #3868, #3408, #4718, #5557 | Not current-lane claims | Neighbor hits are transform/selection/runtime issues, not reverse query ordering. |
| #5089, #4542, #3155 | not this lane | Fragment and clipboard owners are already handled or related in the prior lane. |

Current sync state:

- `docs/slate-issues/gitcrawl-live-open-ledger.md:188` still lists `#5080` as
  open.
- `docs/slate-issues/open-issues-dossiers/5129-5066.md:901` records the issue
  summary and direct v2 relevance.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` now has sections for `#5080`,
  `#5684`, `#5028`, and `#3885`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` now has related/non-claim
  rows for `#5684`, `#5028`, and `#3885`.
- `docs/slate-v2/references/pr-description.md` records `#5080` as pending
  reverse traversal target and has no `#5080` fixed claim yet.
- `docs/slate-v2/references/pr-description.md` non-fix row count was refreshed
  to `123`, matching the current coverage-matrix table counts:
  `71 Related`, `37 Improves`, `15 Not claimed`.
- `docs/slate-issues/gitcrawl-live-open-ledger.md` stays unchanged: it is a
  generated live-thread list without claim-status columns, and the richer
  `docs/slate-issues/open-issues-ledger.md` already has the matching
  classifications for `#5080`, `#5684`, `#5028`, and `#3885`.

ClawSweeper status: complete.

Commands used:

```bash
gitcrawl doctor --json
gitcrawl threads ianstormtaylor/slate --numbers 5080,5684 --include-closed --json
gitcrawl search ianstormtaylor/slate --query "reverse true" --mode hybrid --limit 20 --json
gitcrawl search ianstormtaylor/slate --query "SlateEditor.nodes match issue" --mode hybrid --limit 20 --json
gh issue view 5080 --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,updatedAt
gh issue view 5684 --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,updatedAt
```

## 7. Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | React is out of scope; no browser or render path changes are planned. Performance pressure accepted matched-entry buffering only for caller-requested editor-query reverse output and rejected broader rewrites. |
| Slate-close unopinionated DX | 0.94 | Current v2 read API is `state.nodes.match`; source refresh keeps legacy static API and raw `Node.nodes` drift out of the target; objection rows accept the current API test route. |
| Plate/slate-yjs migration backbone | 0.90 | Deterministic editor-query ordering helps stable operation/query reasoning; high-risk review keeps the proof at shared query behavior without adding collab API claims. |
| Regression-proof testing strategy | 0.94 | Red public query test route, exact nested-match assertion, mode escalation rule, focused test command, full query-contract fallback, package typecheck, and lint gate are named. |
| Research evidence completeness | 0.93 | Local issue ledgers, gitcrawl, live GitHub for #5080/#5684, source, tests, coverage matrix, fork dossier, PR reference, generated live ledger, reverse caller audit, and objection/high-risk rows were read or updated. |
| shadcn-style composability | 0.86 | No UI/component surface; the review explicitly keeps Slate core unopinionated and avoids UI/API creep. |

Total: `0.92`.

Closure verdict: passes. Every required planning pass is complete, every score
dimension is at least `0.85`, and the total score reaches the Slate Ralplan
threshold. `#5080` remains planned, not fixed, until Ralph lands red/green
implementation proof.

## 8. Applicable Review Lenses

| Lens | Status | Reason | Required delta |
| --- | --- | --- | --- |
| `clawsweeper` | applied | Issue-facing behavior and exact claim sync are in scope. | Related set classified: `#5684` related/repro-first, `#5028` related, `#3885` not claimed, noisy reverse hits excluded. |
| `tdd` | applied | This is a behavior bug with a sane public test route. | Ralph must add one failing `state.nodes.match({ reverse: true })` nested-match test first, then patch. |
| `performance-oracle` | applied | Traversal can be hot on large documents. | Matched-entry buffering is accepted for reverse editor queries; full-tree buffering and raw iterator rewrite stay rejected. |
| `steelman-pass` | applied | The plan changes a public traversal behavior contract. | Objection ledger accepts the shared query helper change, current API test route, bounded buffering, and exact issue-claim boundary. |
| `high-risk-deliberate-pass` | applied | The shared editor query helper backs public reads and package callers. | High-risk trigger, blast radius, pre-mortem, proof plan, and rollback answer are recorded. |
| `vercel-react-best-practices` | skipped | No React render/subscription path. | Revisit only if the plan unexpectedly touches `slate-react`. |
| `react-useeffect` | skipped | No effects. | No change. |
| `build-web-apps:shadcn` | skipped | No UI. | No change. |

## 9. Pass Schedule

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and candidate selection | complete | Read prior execution checkpoint, `#5080` ledger/dossier/candidate rows, gitcrawl thread/neighbors, current v2 source/tests, and ran a live probe. | Selected `#5080`; targeted current `state.nodes.match`, not legacy static API shape. | none | ClawSweeper related-issue pass |
| related issue discovery | complete | Read gitcrawl doctor, #5080/#5684 threads, #5684 neighbors, broad reverse searches, live GitHub for #5080/#5684, local dossiers, and test-candidate maps. | Added fork dossier sections for #5080/#5684/#5028/#3885 and matrix rows for #5684/#5028/#3885. | none | Issue ledger pass |
| issue-ledger pass | complete | Checked active plan, coverage matrix, fork dossier, PR reference, generated live ledger, open issue ledger, package impact/requirements maps, benchmark map, and research index. | Refreshed PR non-fix count to `123`; recorded live-ledger unchanged reason; kept #5080 out of fixed claims until implementation proof. | none | Intent/boundary and decision brief |
| intent/boundary and decision brief | complete | Re-read current editor query owner, raw `Node.nodes` docs/fixtures, `state.nodes.match`, and reverse editor-query callers. | Chose `editor/nodes.ts` as first owner; raw `Node.nodes` is escalation only; no user question needed. | source-refresh audit still pending before implementation | Source refresh |
| research/source refresh | complete | Audited `state.nodes.match`, `editor/nodes.ts`, raw `Node.nodes` fixtures, `previous`, `unhangRange`, cleanup transforms, `unwrapNodes`, and leaf cleanup. | Chose forward traversal plus reverse emitted editor-query matches; raw `Node.nodes` remains untouched by default. | none | Performance/TDD pressure |
| performance/TDD pressure | complete | Re-read `editor/nodes.ts`, current query-contract gap, and TDD/performance skill rules. | Accepted matched-entry buffering for reverse editor queries; rejected full-tree buffering, raw iterator rewrite, and mirrored reverse mode engine; named red/green proof order. | none | objection/high-risk pass |
| objection/high-risk pass | complete | Re-read `editor/nodes.ts`, `public-state.ts`, raw `Node.nodes`, query-contract helper coverage, and reverse caller search; applied steelman/high-risk rules. | Accepted the public query contract change, accepted high-risk trigger for the shared helper, expanded proof plan, and kept raw iterator rewrite rejected. | none | closure score |
| closure score | complete | Re-read the active plan, checkpoint, continuation prompt, and parent ledger; checked final score thresholds and remaining gates. | Raised final score to `0.92`; marked the ralplan ready for Ralph execution while keeping #5080 as planned, not fixed. | none | Ralph execution |

## 10. Implementation Phases Draft

1. Add a failing test in
   `../slate-v2/packages/slate/test/query-contract.ts` using
   `editor.read((state) => state.nodes.match(...))`.
2. Assert that `reverse: true` returns exactly `[...forward].reverse()` for
   nested matching elements where a parent and descendant both match.
3. Patch `editor/nodes.ts` so reverse editor-query output is
   `forwardMatchedEntries.reverse()`.
4. Store emitted matches only; do not buffer every visited node.
5. Keep raw `Node.nodes` unchanged unless red/green proof forces escalation.
6. Sync issue coverage, fork dossier, PR reference, and completion state.

## 11. Fast Driver Gates Draft

```bash
bun test ./packages/slate/test/query-contract.ts -t "nodes reverse"
bun --filter slate typecheck
bun lint:fix
```

Add direct `Node.nodes` tests only if implementation escalates to raw iterator
semantics.

## 12. Objection And High-Risk Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Fix `Node.nodes` reverse order | Some callers and fixtures rely on the old structural parent-before-child order. | Do not make this the default owner. Escalate only after source-refresh accepts the wider raw iterator contract change. | keep |
| Use `state.nodes.match` instead of legacy `Editor.nodes` in tests | The issue names `Editor.nodes`. | Current v2 public read API is `state.nodes.match`; testing old syntax would prove the wrong thing. | keep |
| Fix `editor/nodes.ts` first | It affects transform callers that import the same query helper. | True; source-refresh must audit those callers before implementation. It is still the right owner because it covers v2 public reads and the shared editor query contract without widening raw `Node.nodes`. | keep |
| Buffer forward results and reverse them | It can allocate O(m) entries for match-all reverse queries over huge documents. | Accepted. It buffers emitted matches only, is limited to caller-requested `reverse: true`, matches existing `universal` buffering style, and avoids duplicating the subtle mode/filter engine. | keep |
| Claim related transform issues | Same gitcrawl neighborhood is not same bug. | Keep transform/selection neighbors out unless ClawSweeper proves exact query-order relation. | keep |
| Start with `mode: "all"` coverage | `highest`, `lowest`, `universal`, and `pass` can also interact with traversal order. | Keep the first red test on the issue contract. Add mode-specific coverage only if the patch touches mode logic or the first red/green cycle exposes drift. Existing `query-contract.ts` already has pass/universal coverage at lines 1704-1777. | keep |
| Change the shared editor query helper | Internal transforms might have accidentally depended on the mixed reverse order. | Source refresh already audited the reverse query callers and the new order is safer for child/later-before-parent mutation walks. If implementation exposes a caller regression, patch or test that caller before closure. | keep |

Steelman antithesis:

- The strongest argument against the chosen plan is that Slate's current
  reverse iterator behavior is internally consistent if "reverse" means
  reversed child selection during a pre-order walk, not exact reverse of emitted
  matches.
- That argument loses for the editor query API because `#5080` reports the
  public matched traversal contract, and current v2 exposes that through
  `state.nodes.match` in
  `../slate-v2/packages/slate/src/core/public-state.ts:942-943`.
- Keeping the old order would make `reverse` impossible to explain without
  apologizing for it. That is bad DX.

High-risk trigger: public traversal behavior and shared package helper change.

Blast radius:

- Files: `../slate-v2/packages/slate/src/editor/nodes.ts`,
  `../slate-v2/packages/slate/src/core/public-state.ts`, and
  `../slate-v2/packages/slate/test/query-contract.ts`.
- Callers: public `editor.read((state) => state.nodes.match(...))`, plus package
  callers that request reverse editor queries such as `previous`, `unhangRange`,
  leaf cleanup, and transform cleanup.
- Data affected: yielded `NodeEntry` order only. No document schema, operation
  payload, React rendering, browser DOM, storage, or collaboration API changes.
- Docs/examples affected: PR reference and issue coverage only until
  implementation proof lands.

Pre-mortem:

1. Bounds regression: normalizing reverse traversal to forward collection could
   mishandle `at` spans or path ranges. Proof must keep range/bounds behavior in
   `query-contract.ts`, and raw `Node.nodes` stays untouched unless explicitly
   escalated.
2. Mode regression: `highest`, `lowest`, or `universal` could drift if the patch
   forks filtering logic. Proof plan says reuse the current filtering path and
   add mode coverage only if implementation changes that logic.
3. Caller-order regression: cleanup transforms might reveal an assumption about
   old mixed order. Source refresh says full reverse matched order is safer, but
   implementation must respond to any focused caller failure before claiming
   `#5080`.

Expanded proof plan:

- Unit: one red public query-contract test where parent and descendant elements
  both match; assert `reverse` equals `[...forward].reverse()`.
- Integration: run the focused reverse query test, then run the full
  `query-contract.ts` file if the focused test passes after patching.
- Browser/visual: skipped. No React, DOM, browser selection, or rendering path.
- Migration/adoption: no legacy static API expansion; current v2 public API is
  the adoption route.
- Docs/example: PR reference stays pending until implementation proof; no docs
  claim before code lands.
- Performance: accepted O(m) emitted-match buffering for `reverse: true`; no
  benchmark unless the implementation exposes a hot path.

Rollback/remediation answer:

- If focused proof fails because editor-query buffering cannot preserve accepted
  `mode` behavior, revise the patch while keeping the public test.
- If raw iterator fixtures must change, split to a wider `Node.nodes` contract
  plan instead of smuggling it into `#5080`.
- If a transform caller fails from the new order, add a caller-specific proof or
  keep that caller behavior local; do not weaken the public reverse contract.

High-risk verdict: keep. The change is narrow enough for Ralph, but closure
requires the red public test plus focused query-contract proof.

## 13. Plan Deltas From This Activation

- Created the `#5080` plan as the next owner after the `#5089` execution lane.
- Confirmed the live v2 mismatch with `state.nodes.match`.
- Set the initial target to traversal contract repair, not legacy API revival.
- Completed related issue discovery.
- Classified `#5684` as related but repro-first, `#5028` as adjacent traversal
  API pressure, and `#3885` as docs-only/non-claim.
- Added fork dossier sections and coverage matrix rows for the reviewed
  non-target issues.
- Completed issue-ledger sync.
- Refreshed PR non-fix count to `123`.
- Recorded that the generated live ledger remains unchanged because it has no
  claim-status columns and the richer open issue ledger already matches the
  classifications.
- Completed intent/boundary and decision-brief hardening.
- Chose `editor/nodes.ts` as the first implementation owner.
- Reclassified raw `Node.nodes` as an escalation path only, because direct
  iterator fixtures currently encode broader structural reverse behavior.
- Completed source refresh.
- Audited reverse editor-query callers and accepted the editor-query result
  reversal strategy.
- Named the exact patch strategy: forward traversal, current filtering/mode
  logic, reverse emitted matches only.
- Completed performance/TDD pressure.
- Accepted matched-entry buffering for `reverse: true` editor queries and
  rejected full-tree buffering, raw iterator rewrite, and mirrored reverse mode
  engine.
- Locked the Ralph proof order: one red public query-contract test first, then
  patch, focused query test, package typecheck, and lint.
- Completed objection/high-risk pressure.
- Accepted the public `state.nodes.match` reverse contract despite the old raw
  iterator structural order.
- Recorded high-risk trigger, blast radius, pre-mortem, expanded proof plan,
  and rollback answer for the shared editor query helper.
- Completed closure score.
- Marked the Ralplan done at score `0.92` and ready for Ralph execution.

## 14. Final User-Review Handoff Outline

- Public API: current v2 `state.nodes.match`, not legacy static `Editor.nodes`.
- Core runtime: fix the shared editor query owner in `editor/nodes.ts` first.
- Proof: red query-contract test first, plus direct iterator tests only if raw
  `Node.nodes` is deliberately changed.
- Issue accounting: `#5080` intended fix; `#5684` related/repro-first; `#5028`
  related traversal API pressure; `#3885` docs-only/not claimed.
- Verification: focused test, direct iterator tests if applicable, package
  typecheck, lint, completion-check.

## 15. Completion Gates

This Ralplan is ready for Ralph:

- ClawSweeper related-issue pass is complete for `#5080` and same-keyword
  neighbors.
- Issue coverage matrix, fork dossier, and PR reference have exact pending/fixed
  claim state or explicit unchanged reasons.
- TDD and performance pressure rows are complete.
- Maintainer objection rows and high-risk rows have accepted answers.
- final score is at least `0.92` and no dimension is below `0.85`.
- `tmp/completion-checks/slate-v2-editor-nodes-reverse-order-ralplan.md` is
  `done`.

Status: done.

## 16. Ralph Execution Ledger

| Slice | Status | Evidence | Plan delta | Next owner |
| --- | --- | --- | --- | --- |
| activation | complete | User invoked `ralph`; checkpoint set back to `pending`; `tmp/continue.md` regenerated for implementation. | Ralph execution started from the accepted `#5080` Ralplan. | red public query-contract test |
| red query-contract test | complete | `bun test ./packages/slate/test/query-contract.ts -t "nodes reverse"` failed before the fix with reverse paths `["1", "0", "0.3", "0.1"]` instead of `["1", "0.3", "0.1", "0"]`. | Added a public nested-match regression in `../slate-v2/packages/slate/test/query-contract.ts`. | editor query implementation |
| editor query implementation | complete | `../slate-v2/packages/slate/src/editor/nodes.ts` traverses the forward range through existing filtering/mode logic, then reverses emitted matches for `reverse: true`. | Raw `Node.nodes` remains unchanged; `#5080` is fixed at the public query layer. | scoped verification |
| scoped verification | complete | Focused reverse query proof passed; full `query-contract.ts` passed with `74 pass`; `bun --filter slate typecheck` passed; `bun lint:fix` passed with no final fixes. | Required package proof for the `#5080` lane is complete. | issue claim sync |
| full check baseline | accepted external red | `bun check` failed in delete/insertFragment transform fixtures; the same failures reproduced with `editor/nodes.ts` temporarily restored to the pre-fix traversal. | The full-suite red is baseline transform debt outside this query-order lane. | none |
| issue claim sync | complete | Matrix, PR reference, fork dossier, open issue ledger, checkpoint, continuation prompt, and solution note were synced after proof. | `#5080` moved from planned to fixed; `#5684`, `#5028`, and `#3885` stay bounded. | none |
