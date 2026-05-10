# Slate v2 Remaining Harvest Test Lanes Ralplan

status: done
score: 0.93
date: 2026-05-10
skill: `slate-ralplan`
target repo: `/Users/zbeyens/git/slate-v2`
current pass: `final-completion-accounting`
next pass: `none`

Inputs:

- `docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`
- `docs/editor-test-harvester/lexical/report.md`
- `docs/editor-test-harvester/lexical/slate-processing-ledger.md`
- `docs/editor-test-harvester/prosemirror/report.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`

## Current Verdict

The all-editor-harvest plan is done. That only closed harvest accounting and the
already-executed PM-08/09/10/12/13 slices. It does not mean every accepted
harvested behavior is already in Slate v2.

The remaining work should be processed as focused owner lanes, not as another
broad harvester run. The best order is:

1. Clipboard and HTML structural context.
2. Operation mapping and range/selection rebase.
3. Structural fit and normalization pressure.
4. History remote rebase and collaboration browser proof.
5. Table model/navigation and table paste model.
6. HR/block-void plus drag/drop runtime.
7. Public lifecycle and optional extension/state metadata rows.
8. Raw mobile/device closure.

The required ClawSweeper related-issue pass is complete. Lane 1 clipboard/HTML
structural context is implemented and verified. Lane 2 operation mapping and
range/selection rebase is closed as coverage work because the probed behaviors
already held. Lane 3 structural fit and normalization pressure is implemented
and verified. Lane 4 history remote rebase and collaboration runtime proof is
implemented and verified. Lane 5 table model/navigation and table paste model is
closed as browser coverage plus explicit model deferral. Lane 6 HR/block-void
plus drag/drop runtime is closed as nested-editor drop coverage plus explicit HR
owner deferral. Lane 7 public lifecycle and optional extension/state metadata
rows are implemented and verified. Lane 8 raw mobile/device closure is closed as
an explicit no-claim deferral: the raw proof script exists, but real
Appium/Android/iOS artifacts were not available in this session, and Playwright
mobile viewport, semantic mobile handles, or proxy proof cannot satisfy raw
device claims. All remaining lanes are now complete or explicitly deferred.

## Intent Boundary

Intent: turn the remaining Lexical and ProseMirror harvested test pressure into
a clean Slate v2 execution queue.

Outcome: a plan that tells later `ralph` execution which tests to add, where to
add them, which foreign editor mechanics to reject, and which proof command owns
each lane.

In scope:

- Remaining accepted Lexical deferrals: table model/navigation, raw
  mobile/device, slate-yjs browser proof, HR/block-void, drag/drop, and optional
  extension/state/update-metadata/memory rows.
- Remaining ProseMirror rows PM-01/02/03/05/06/07/11/14.
- Current Slate v2 owner-test mapping.
- Issue-ledger discipline before any fixed or improved claim.

Non-goals:

- No Slate v2 implementation edits in this planning pass.
- No one-for-one upstream test copy.
- No ProseMirror schema expression, numeric position, Step JSON, NodeView,
  MarkView, or PluginView API clone.
- No Lexical node-class, command registry, React Composer, private MIME, or
  playground product behavior clone.
- No mobile closure from Playwright mobile viewport.

Decision boundaries:

- Package tests prove model, operations, transactions, history, and ref
  behavior.
- Browser tests prove real DOM selection, clipboard, paste, drag/drop,
  composition, geometry, and table interaction.
- Raw-device rows require a real device/Appium lane.
- Issue closure requires exact repro proof, not adjacency to a harvested row.

## Decision Brief

Principles:

- Preserve Slate's raw, unopinionated core.
- Steal behavior pressure, not foreign architecture.
- Strengthen existing owner files before adding new test islands.
- Keep browser-owned behavior in browser proof.
- Keep claims narrower than the evidence.

Main drivers:

- Lexical's selected lane is closed, but its ledger intentionally deferred table
  model, device, yjs/browser, HR/block-void, drag/drop, and optional extension
  rows.
- ProseMirror's remaining rows are high-value because they pressure structure,
  fragment context, operation mapping, history rebasing, lifecycle, and DOM
  import/export.
- Current Slate v2 already has strong owners for many families, so the work is
  mostly targeted strengthening, not new architecture.
- Current issue ledgers separate full-corpus sync from PR-facing exact claims;
  future execution must preserve that split.

Chosen path:

- Process all remaining accepted rows through eight owner lanes.
- Start with clipboard/HTML structural context because it has the broadest
  overlap across Lexical, ProseMirror, current issue pressure, and existing
  Slate owners.
- Run ClawSweeper once per touched surface before implementation claims change.

Rejected paths:

- Restarting Lexical harvesting: the report and processing ledger are closed.
- Copying all remaining upstream tests directly: this would import API shape and
  product policy.
- Starting with raw mobile/device: useful, but tooling-gated and not the fastest
  autonomous lane.
- Hiding table model or HR/block-void decisions inside generic clipboard tests:
  those need accepted model owners first.

## Current Slate v2 Owners

| Owner | Current evidence | Use in this plan |
| --- | --- | --- |
| Clipboard model contract | `../slate-v2/packages/slate/test/clipboard-contract.ts` has fragment extraction, list fitting, target placement, inline link paste, multi-block insertion, and block-fragment replacement rows. | Lane 1 and Lane 3. |
| DOM clipboard boundary | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` has payload round-trip, custom MIME, plain-text fallback, decorated text export, inline void export, and multiline fallback rows. | Lane 1. |
| Paste HTML browser corpus | `../slate-v2/playwright/integration/examples/paste-html.test.ts` has Google Docs BIU/font-size, list, link, image, Google Docs table, Quip table, Google Sheets table, clipboard gauntlet, and drop gauntlet rows. | Lane 1, Lane 5, Lane 6. |
| Operations contract | `../slate-v2/packages/slate/test/operations-contract.ts` has replace, move, set_selection, split, merge, remove_node, remove_text, and selection rebase rows. | Lane 2 and Lane 3. |
| Range refs | `../slate-v2/packages/slate/test/range-ref-contract.ts` has transaction publication, default affinity, top-level move, moved-block, and nested-move rows. | Lane 2. |
| Selection rebase | `../slate-v2/packages/slate/test/selection-rebase-contract.ts` has destructive cleanup, forward delete, inline removal, top-level removal, and only-block removal rows. | Lane 2. |
| Selection controller | `../slate-v2/packages/slate-react/test/selection-controller-contract.ts` has DOM import/export policy and selectionchange ownership rows. | Lane 2 and Lane 8. |
| History | `../slate-v2/packages/slate-history/test/history-contract.ts` has grouping, redo clearing, composition history, selection restore, move undo, join undo, delete undo, and insertBreak undo rows. | Lane 4. |
| Collaboration/history runtime | `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts` has deterministic commit replay, three-peer convergence, replace_children paste replay, bookmark ranges, and local runtime target rows. | Lane 4. |
| Transaction/public lifecycle | `../slate-v2/packages/slate/test/transaction-contract.ts`, `../slate-v2/packages/slate-react/test/surface-contract.tsx`, and `../slate-v2/packages/slate-react/test/editable-behavior.tsx` own transaction metadata, extension registry, surface boundaries, and editable callbacks. | Lane 7. |
| Tables/browser | `../slate-v2/playwright/integration/examples/tables.test.ts` and table-related transform fixtures own current table containment and table fragment behavior. | Lane 5. |
| Drag/drop runtime | `../slate-v2/packages/slate-react/src/editable/runtime-drag-events.ts` and paste/drop gauntlet browser rows are current owners. | Lane 6. |

## Ecosystem Strategy Synthesis

Lexical's useful habit is issue-shaped browser proof. Keep the browser transport
for IME, clipboard, table, drag/drop, and DOM repair. Reject its node-class,
command-registry, private clipboard MIME, Composer, and playground product
contracts.

ProseMirror's useful habit is transaction/runtime rigor. Keep the pressure from
open slices, mapping, history rebase, DOM import/export, and view lifecycle.
Reject content-expression cloning, numeric positions, Step JSON, and view-class
APIs.

Tiptap remains only a public-DX comparison point. Do not use it to drive raw
Slate behavior unless a future extension ergonomics pass accepts that owner.

React pressure matters only when a lane touches subscriptions, projection, or
surface lifecycle. Browser/editor correctness remains the primary oracle for
clipboard, table, selection, drag/drop, and device behavior.

## Remaining Execution Lanes

| Lane | Harvest rows | Accepted work | Reject/defer | Slate v2 owners | Focused verification |
| --- | --- | --- | --- | --- | --- |
| 1. Clipboard and HTML structural context | PM-02, PM-03, PM-11; Lexical residual HTML/table/list/link rows | Add missing open-edge fragment, comment/wrapper context, malformed DOM recovery, custom serializer fallback, and table/list context rows that current owners do not already prove. | Reject generic full-editor HTML serializer and app-owned checklist/link-plugin policy. Defer table widths, rowspan/colspan, grid merge, and HR insertion to owners below. | `clipboard-contract.ts`, `clipboard-boundary.ts`, `paste-html.test.ts`, `site/examples/ts/paste-html-import.ts` | `cd ../slate-v2 && bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts`; browser rows through `playwright test playwright/integration/examples/paste-html.test.ts --project=chromium` when browser import changes. |
| 2. Operation mapping and range/selection rebase | PM-05, PM-06 | Add replace-around-like wrap/unwrap conflicts, atom-boundary rebase, multi-op replay/inversion rows, and selection/range-ref movement through split/merge/move/delete combinations not already covered. | Reject PM Step JSON and numeric mapping APIs. | `operations-contract.ts`, `range-ref-contract.ts`, `selection-rebase-contract.ts`, `selection-controller-contract.ts` | `cd ../slate-v2 && bun test ./packages/slate/test/operations-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate-react/test/selection-controller-contract.ts` |
| 3. Structural fit and normalization pressure | PM-01 plus Lexical list/normalization deferrals | Add schema-less fit rows around list/quote/table paste, impossible insert/delete rejection, root split rejection, required wrapper behavior, and normalization fixpoint interactions. | Reject PM content expressions, filler semantics, and schema validation as public Slate API. | transform fixtures under `packages/slate/test/transforms/**`, `clipboard-contract.ts`, `operations-contract.ts`, normalization fixtures | Focused package tests for changed transform fixtures plus `bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate/test/operations-contract.ts`. |
| 4. History remote rebase and collaboration browser proof | PM-07; Lexical slate-yjs collaboration browser proof | Add simultaneous edit history, remote rebase selection restore, local undo with remote commits, and later browser yjs proof once the adapter/example owner is accepted. | Reject Lexical shared-history/nested-editor internals and PM collab plugin API shape. | `history-contract.ts`, `collab-history-runtime-contract.ts`, future slate-yjs/browser owner | `cd ../slate-v2 && bun test ./packages/slate-history/test/history-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts`; browser yjs gate only when owner exists. |
| 5. Table model/navigation and table paste model | Lexical table model/navigation; PM structural/table clipboard pressure | Add table selection model rows only after deciding Slate's raw table owner: cell selection, column insert selection, repeated table selection, nested table range, multi-cell paste/replacement, width/layout non-claims. | Do not pretend current containment rows equal a whole-table selection model. Do not hide layout policy in generic paste tests. | `playwright/integration/examples/tables.test.ts`, table transform fixtures, `paste-html.test.ts`, future table model contract | Focused table browser rows plus table transform fixtures; final browser proof on Chromium and any engine named by the issue. |
| 6. HR/block-void plus drag/drop runtime | Lexical HR/block-void, drag/drop; PM DOM clipboard/drop pressure | Add HR import/insertion once HR/block-void owner is accepted; add drag/drop transfer, selection preservation, and drop-data runtime proof using Slate's existing drop gauntlet owner. | Reject product upload behavior and toolbar drag affordances. Defer HR rows until the block-void model is explicit. | `paste-html.test.ts`, `editable-voids.test.ts`, `runtime-drag-events.ts`, generated drop gauntlet | Focused browser rows for drop/void/HR; package tests only for model insertion behavior. |
| 7. Public lifecycle and optional extension/state metadata | PM-14; Lexical extension/state/update-metadata/memory optional rows | Strengthen transaction metadata, extension registry, commit listener, editable callback, and surface lifecycle rows only where they are public Slate contracts. | Reject PM PluginView/NodeView/MarkView lifecycle and Lexical extension wiring unless a raw Slate extension owner accepts a matching public behavior. | `transaction-contract.ts`, `surface-contract.tsx`, `editable-behavior.tsx`, public surface contracts | `cd ../slate-v2 && bun test ./packages/slate/test/transaction-contract.ts`; `cd ../slate-v2/packages/slate-react && bun test:vitest -- surface-contract editable-behavior`. |
| 8. Raw mobile/device closure | Lexical mobile table/input rows; PM browser selection/mobile-adjacent pressure | Add real-device table/input/selection rows only on a lane that can produce raw Appium/Android/iOS artifacts. | Reject Playwright mobile viewport as mobile proof. Do not claim exact mobile issue closure from desktop browser rows. | future raw-device proof files, `slate-browser` helpers, current mobile proof scripts | `cd ../slate-v2 && bun test:mobile-device-proof:raw` only on real-device lane; `bun check:full` before release-quality closure. |

## Issue-Ledger Accounting

No fixed, improved, or PR-facing issue claim changes in this planning pass.

ClawSweeper discovery completed on 2026-05-10:

- `gitcrawl doctor --json` reports `version: 0.2.1`, `thread_count: 659`,
  `open_thread_count: 659`, `cluster_count: 617`, and
  `last_sync_at: 2026-05-04T14:58:11.123944Z`.
- `github_token_present: false` and `api_supported: false`, so this pass used
  the local archive and repository ledgers for read-only candidate discovery.
  No fresh live sync was possible, and no live sync was needed because this
  planning pass makes no exact current-state issue claim.
- Read inputs: `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/package-impact-matrix.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/references/pr-description.md`, and the closed all-harvest
  plan gap-fill review.

Discovery by execution lane:

- Lane 1 clipboard/HTML structural context: existing exact claims already cover
  #5233, #3486, #5412, #5429, and #5089. Existing related or reviewed rows
  include #2694, #3155, #2560, and #4268. The next Lane 1 work starts as
  related/non-claim only. It can run as one focused ralplan first; table layout,
  table model, and HR/block-void rows stay out of Lane 1.
- Lane 2 operation mapping and range/selection rebase: #5977 is already fixed,
  #5558 is already improved, and #2881/#3212/#2865/#2355/#1654 remain core
  pressure unless exact package proof upgrades them. No issue claim changes now.
- Lane 3 structural fit and normalization: existing claims cover
  #4121/#2500/#3965/#3950 and improve #5811. PM-01 rows stay structural
  pressure only; do not turn them into a public schema-validation promise.
- Lane 4 history remote rebase and collaboration browser proof: existing claims
  cover #3534/#4559/#3551/#3964/#3973/#4357/#3499. Fork-dossier accounting
  already routes #5771/#5533/#2288/#1770/#3741 as related collaboration/history
  pressure. No OT, Yjs, or browser collaboration closure is claimed.
- Lane 5 table model/navigation and table paste model: #6034 is already fixed.
  #2558 remains no-claim table-selection-model pressure, with #5355/#4658/#6034
  as related table-boundary rows. A table model lane needs its own accepted
  owner before any broader table selection claim.
- Lane 6 HR/block-void plus drag/drop runtime: #3991 and #4301 are already fixed
  void rows, #4730 remains related/no-claim trailing void pressure, and #5749
  remains related shadow-DOM drag/drop pressure. HR ownership is not accepted in
  this plan.
- Lane 7 public lifecycle and optional extension/state metadata: current rows
  belong to `v2-react-runtime` and `v2-api-dx`. The PR reference already covers
  extension input rules and decoration/projection lifecycle pressure. Do not
  clone PM PluginView, NodeView, or MarkView APIs.
- Lane 8 raw mobile/device closure: mobile/IME macro accounting already says
  `149` frozen R7 input-runtime rows were reviewed with `0` new exact fixed or
  improved claims. Raw device closure stays gated on real device/Appium proof,
  not Playwright mobile viewport.

Ledger decision:

- Do not edit `docs/slate-issues/gitcrawl-v2-sync-ledger.md` in this planning
  pass. The current ledgers already own the relevant fixed, improved, related,
  reviewed, and no-claim classifications.
- Future execution updates the issue ledgers only when a slice changes an exact
  claim, improves a named issue, reviews a new row, or intentionally excludes a
  live issue/cluster.
- PR description and coverage matrix stay unchanged until implementation proof
  changes PR-facing claim counts or proof references.

## Implementation Skill Notes

- `editor-test-harvester`: applied. Harvest artifacts are closed and should not
  be rerun for this plan unless source drift is found.
- `clawsweeper`: applied. Related issue discovery is complete for planning
  closure. Re-run during execution only when a lane changes issue claims or
  touches a materially different issue surface.
- `tdd`: apply during execution. Use one red behavior row at a time; do not
  write a batch of imagined tests before the first implementation.
- `performance`: skipped for now. None of the remaining lanes is a benchmark
  lane unless a clipboard/table/selection row explicitly changes performance
  budgets.
- `vercel-react-best-practices`: apply only in Lane 7 or any React surface lane
  that changes subscription/render behavior.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issue | Next owner |
| --- | --- | --- | --- | --- | --- |
| Skill reload and boundary | complete | Reloaded `slate-ralplan`, `editor-test-harvester`, `clawsweeper`, `tdd`, `learnings-researcher`, and `planning-with-files`. | Scope locked to planning, not Slate v2 code edits. | none | current-state read |
| Harvest current-state read | complete | Read all-harvest closure, Lexical report/ledger, ProseMirror report, current owner test names, solution notes, and issue/pr ledgers. | New eight-lane queue written. | resolved by ClawSweeper pass below | ClawSweeper |
| ClawSweeper related-issue discovery | complete | Ran `gitcrawl doctor --json`; reread live/v2 sync ledgers, issue clusters, package impact, PR reference, coverage matrix, fork dossier, and all-harvest gap-fill review. | Recorded lane-by-lane no-claim decisions and confirmed no ledger churn is needed for planning-only work. | none | final hardening |
| Final plan hardening and score | complete | Raised issue-ledger readiness after ClawSweeper discovery. | Score raised from `0.88` to `0.93`; plan marked `done`. | none | `ralph` |
| Ralph handoff | complete | `tmp/continue.md` points to Lane 1 clipboard/HTML structural context as the first execution lane. | Ready for later `ralph` execution. | none | `ralph` |
| Lane 1 execution start | complete | Completion state moved to `pending`; first owner was clipboard and HTML structural context. | Ralph execution started from the completed planning gate. | no claim changes | Lane 1 |
| Lane 1 comment-bounded HTML paste | complete | Added a red browser row for `StartFragment`/`EndFragment` clipboard HTML that ignored wrapper text, patched `paste-html-import.ts`, and verified package/browser owners. Commands: `bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium -g "comment-bounded"` failed before the fix, then passed; `bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium -g "(Google Docs table|Quip table|Google Sheets table|comment-bounded)"`; `bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts`; `bunx biome check site/examples/ts/paste-html-import.ts playwright/integration/examples/paste-html.test.ts --fix`. | Lane 1 now has comment-bounded fragment coverage; no issue-ledger claim changed. | no claim changes | Lane 2 |
| Lane 2 operation/range rebase coverage | complete | Added explicit contract rows for composed `split_node` plus `insert_text` replay/inversion, `rangeRef` split-branch rebase, and `rangeRef` merge-node rebase. Commands: `bun test ./packages/slate/test/operations-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate-react/test/selection-controller-contract.ts`; `bunx biome check packages/slate/test/operations-contract.ts packages/slate/test/range-ref-contract.ts --fix`. | Lane 2 closed as behavior-preserving coverage; no implementation or issue-ledger change was needed. | no claim changes | Lane 3 |
| Lane 3 root structural rejection | complete | Added red contract rows for root-path `insertNodes` and `removeNodes`, then added explicit transform guards. Commands: `bun test ./packages/slate/test/transforms-contract.ts -t "editor root"` failed before the fix, then passed; `bun test ./packages/slate/test/transforms-contract.ts ./packages/slate/test/normalization-contract.ts ./packages/slate/test/clipboard-contract.ts ./packages/slate/test/operations-contract.ts`; `bunx biome check packages/slate/src/transforms-node/insert-nodes.ts packages/slate/src/transforms-node/remove-nodes.ts packages/slate/test/transforms-contract.ts --fix`. | Lane 3 now has direct impossible root insert/remove rejection proof; no issue-ledger claim changed. | no claim changes | Lane 4 |
| Lane 4 history remote rebase | complete | Added a red collaboration-history row for local undo/redo batches after a remote text commit, then rebased skipped remote commits through `slate-history` undo/redo stacks. Commands: `bun test ./packages/slate/test/collab-history-runtime-contract.ts -t "rebases local undo"`; `bun test ./packages/slate-history/test/history-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts`; `bunx biome check packages/slate-history/src/with-history.ts packages/slate-history/src/history.ts packages/slate/test/collab-history-runtime-contract.ts --fix`. | Lane 4 now proves local history remains anchored to the local intent after remote text commits; browser yjs proof remains deferred until the adapter/example owner exists. | no claim changes | Lane 5 |
| Lane 5 table browser and paste proof | complete | Added browser rows for leftward cell-boundary navigation and `<th>` header table paste. Commands: `bunx playwright test playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium -g "(moves left from a cell start\|imports table header cells)"`; `bunx playwright test playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium -g "(table\|cell\|Google Docs table\|Quip table\|Google Sheets table\|comment-bounded\|table header)"`; `bunx biome check playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts --fix`. | Lane 5 adds missing browser coverage. Whole-table selection and in-place cell-grid paste remain deferred until a raw table model owner is accepted. | no claim changes | Lane 6 |
| Lane 6 HR/block-void plus drag/drop runtime | complete | Added browser proof that rich HTML drop into a nested editor inside an editable void uses the drop-data runtime path, preserves the parent editor selection, and keeps follow-up parent typing valid. Commands: `bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "drops rich HTML inside nested editor"` failed first on an idealized drop-point expectation, then passed after matching the browser-resolved drop point; `bunx biome check playwright/integration/examples/editable-voids.test.ts --fix`; `bunx playwright test playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium -g "(drops rich HTML inside nested editor\|pastes rich HTML inside nested editor\|generated drop data gauntlet)"`. | Lane 6 adds drag/drop runtime coverage around editable islands. HR rows stay deferred because this checkout has no accepted HR/block-void owner. | no claim changes | Lane 7 |
| Lane 7 public lifecycle and optional extension/state metadata | complete | Added package rows for extension registration cleanup/signal abort and state/editor/transaction group exposure plus cleanup. Commands: `bun test ./packages/slate/test/transaction-contract.ts -t "extension"` failed first because the test did not provide an explicit insertion target for the tx group, then passed after making the target explicit; `bunx biome check packages/slate/test/transaction-contract.ts --fix`; `bun test ./packages/slate/test/transaction-contract.ts`; `cd packages/slate-react && bun test:vitest -- surface-contract editable-behavior`. | Lane 7 strengthens public lifecycle and extension metadata without cloning ProseMirror PluginView/NodeView/MarkView APIs. | no claim changes | Lane 8 |
| Lane 8 raw mobile/device closure | complete | Confirmed `/Users/zbeyens/git/slate-v2/package.json` exposes `test:mobile-device-proof:raw` as `SLATE_BROWSER_RAW_MOBILE_REQUIRED=1 bun ./scripts/proof/mobile-device-proof.mjs`. Confirmed `packages/slate-browser/src/core/release-proof.ts`, `packages/slate-browser/test/core/release-proof.test.ts`, `packages/slate-browser/test/core/proof.test.ts`, and `packages/slate-browser/src/transports/appium.ts` keep raw mobile proof tied to direct mobile-device/Appium-style artifacts. | Lane 8 stays a release/device gate. No raw Android/iOS artifacts were available in this session, so mobile/IME rows remain reviewed/no-claim and cannot be closed by Playwright viewport or semantic/proxy proof. | no claim changes | final completion |

## Plan Deltas From Review

- Raised the score after ClawSweeper discovery proved the remaining lanes can be
  processed without immediate issue-ledger edits.
- Confirmed no new fixed, improved, or PR-facing issue claims.
- Confirmed Lane 1 can run first as one focused ralplan.
- Kept table model/navigation, HR/block-void, and raw mobile/device proof out of
  the clipboard/HTML lane.
- Preserved the no-code-edit boundary for this planning pass.
- Closed Lane 8 as explicit raw-device deferral, not desktop-browser or
  viewport proof.

## Confidence Score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Harvest completeness | 0.95 | Lexical and ProseMirror harvests are closure-grade and have full inventories. |
| Slate owner grounding | 0.90 | Current owner files and test names were reread from `/Users/zbeyens/git/slate-v2`. |
| Issue-ledger readiness | 0.91 | ClawSweeper discovery completed against the current local gitcrawl archive and live/v2 ledgers; no new planning-only ledger edits are needed. |
| Execution actionability | 0.91 | Every lane has owners and commands, and lanes that need accepted model owners are explicitly deferred. |
| Claim discipline | 0.95 | The plan makes no new closure claims and keeps mobile/browser proof boundaries explicit. |

Weighted score: 0.93. Closure threshold is met. Lanes 1-7 are implemented or
closed with focused coverage, and Lane 8 is explicitly deferred to a real
raw-device proof lane.

## Next Pass

None. Run final verification and `bun run completion-check`.
