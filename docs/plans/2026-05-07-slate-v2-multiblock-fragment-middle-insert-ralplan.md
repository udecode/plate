# Slate v2 Multiblock Fragment Middle Insert Ralplan

Date: 2026-05-07

## 1. Current Verdict

Ready for Ralph.

The next issue-backed owner should be `#5089`, not `#5080`.

- `#5089` is the remaining ready-now fragment-shape issue from the lane just
  touched. It asks for multi-block fragment insertion in the middle of a
  paragraph to preserve block separation instead of flattening all text into
  the destination block.
- `#5080` is a clean package-only query-order bug, but it is isolated and does
  not finish the open fragment/clipboard cluster.
- `#4542` and `#3155` stay related. They are broader paste/wrapper and fragment
  non-merging policy rows, not this exact middle-paragraph multi-block proof.

Final score: `0.93`.

The plan is strong enough to execute. The closure bar is narrow: prove `#5089`
through the public core fragment API and the DOM clipboard boundary before any
fixed claim. `#4542` and `#3155` stay related, not fixed.

## 2. Intent And Boundary

Intent: finish the narrow fragment insertion shape claim that remains after the
explicit-target and empty-block caret lane.

Desired outcome:

- `Editor.insertFragment` / transaction fragment insertion preserve multi-block
  structure when a multi-block fragment is inserted at a collapsed point inside
  an existing text block.
- The first fragment block merges with the destination prefix, the final
  fragment block merges with the destination suffix, and middle fragment blocks
  remain separate top-level blocks.
- `#5089` can move to `Fixes` only after exact package proof lands and the
  paste-path proof bar is satisfied.

In scope:

- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` if the claim uses
  clipboard/paste wording.
- issue coverage matrix, fork dossier, PR reference, and completion state.

Non-goals:

- no broad `#4542` nested-wrapper paste closure without matching DOM/browser
  proof;
- no public non-merging policy/API for `#3155`;
- no `Editor.nodes({ reverse: true })` query-order fix for `#5080`;
- no replace/rewrap transform API for `#5129`;
- no public multi-node remove helper for `#3891`.

Decision boundaries:

- Ralph may add exact package and DOM/browser proof for `#5089`.
- Ralph may patch `insert-fragment.ts` only if the exact package proof fails.
- Ralph may claim `Fixes #5089` only when the proof matches the original
  middle-paragraph multi-block insertion report.
- Keep `#4542` and `#3155` related unless their own repro shape is proven.

## 3. Decision Brief

Principles:

- Core fragment insertion owns model shape.
- Clipboard and browser paths must not be used to hide a core transform bug.
- Exact issue closure needs exact proof, not cluster proximity.
- Raw Slate should expose deterministic insertion behavior, not product paste
  policy.

Top drivers:

- `#5089` is `ready-now` in
  `docs/slate-issues/test-candidate-map/5129-5066.md`.
- Live source already has special fragment fitting logic in
  `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`.
- A runtime probe against current source produced the desired split shape:
  `before one` / `twoafter` from a collapsed middle insertion.
- Existing `clipboard-contract.ts` has no exact `#5089` middle-paragraph
  multi-block assertion.

Viable options:

1. Select `#5089` next.
   - Best because it closes the remaining ready-now fragment-shape proof.
   - Risk: exact auto-close may require DOM/browser paste proof, not only core.
2. Select `#5080` next.
   - Clean package-only query red test.
   - Weaker now because it abandons the active fragment cluster.
3. Select `#4542` next.
   - User-visible and adjacent.
   - Too broad for a single package-first lane because wrapper import policy
     needs DOM/browser proof.

Chosen: option 1, with `#5080` deferred as the next separate query-order lane.

Consequences:

- The first Ralph slice may be proof-only if live source already satisfies the
  exact shape.
- If only package proof lands, the plan must decide whether to claim `Fixes`
  or keep a narrower `Improves` line until DOM/browser paste proof lands.

## 4. Live Source Grounding

Current source owners:

- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` owns
  fragment fitting.
- `insert-fragment.ts` partitions fragment content into `starts`, `middles`,
  and `ends`, with middle block preservation around the destination split.
- `../slate-v2/packages/slate/test/clipboard-contract.ts` currently covers
  explicit target insertion, empty-block selection placement, single-block
  fitting, and target-block preservation, but not the exact `#5089`
  middle-paragraph multi-block insertion shape.

Live probe from `/Users/zbeyens/git/slate-v2`:

```bash
bun -e 'import { createEditor } from "./packages/slate/src"; import { Editor } from "./packages/slate/src/internal"; const editor=createEditor(); Editor.replace(editor,{children:[{type:"paragraph",children:[{text:"before after"}]}], selection:{anchor:{path:[0,0],offset:7}, focus:{path:[0,0],offset:7}}, marks:null}); Editor.insertFragment(editor,[{type:"paragraph",children:[{text:"one"}]},{type:"paragraph",children:[{text:"two"}]}]); console.log(JSON.stringify(Editor.getSnapshot(editor)));'
```

Observed model:

- block 0 text: `before one`
- block 1 text: `twoafter`
- selection: `[1,0]@3`

Verdict: current source likely already satisfies the core `#5089` model shape.
The execution lane should prove it with a durable test before claiming anything.

## 5. Issue Ledger Accounting

Target:

| Issue | Cluster | Claim | Why | Proof route | Live ledger sync | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5089 | clipboard-fragment-insertion-shape | fixes-claimed | Ready-now middle-paragraph multi-block fragment insertion bug. | package proof plus DOM clipboard boundary proof landed | live gitcrawl row read; fork dossier/matrix synced | fixed line added after proof |

Related/non-target:

| Issue | Claim | Reason |
| --- | --- | --- |
| #4542 | Related | Empty-block nested-wrapper paste policy is broader and needs DOM/browser proof. Dossier refreshed. |
| #3155 | Related | General non-merging policy is broader than one middle-paragraph multi-block insertion. Dossier section added. |
| #5151 | Improves stays | Target-block preservation already has proof; not the same repro. |
| #5429 | Fixes stays | Empty-block caret placement is already closed by the previous lane. |
| #5412 | Fixes stays | Explicit `at` insertion is already closed by the previous lane. |
| #5080 | Deferred | Query traversal order is a separate core query owner. |
| #3891 | Deferred | Multi-node remove helper semantics are separate API design. |
| #5129 | Deferred | Replace/rewrap transform API is separate API design. |

ClawSweeper pass status: complete for the current surface.

- `#5089`: fixed claim backed by package proof and DOM clipboard boundary
  proof.
- `#4542`: kept related because nested-wrapper empty-block paste is broader.
- `#3155`: added as related because fragment non-merging policy is broader than
  one middle-paragraph insertion shape.

`docs/slate-issues/gitcrawl-live-open-ledger.md` status: generated live fields
read; no row mutation because claim status is not final and current claim sync
lives in the fork dossier and coverage matrix.

`docs/slate-v2/references/pr-description.md`: unchanged in pass 2 because exact
fixed claim status is not final.

Issue-ledger proof-route verdict:

- Package proof alone is not enough for `Fixes #5089` because the original issue
  is paste-framed even though the root owner is core fragment insertion.
- Exact closure needs:
  - core package proof that `Editor.insertFragment` preserves multi-block shape
    at a collapsed middle text point;
  - DOM clipboard boundary proof that a rich Slate fragment paste routes that
    multi-block fragment into the same core shape;
  - no browser proof unless DOM boundary proof cannot model the issue payload
    or execution touches browser/example paste code.
- Execution landed both package proof and DOM clipboard boundary proof, so
  `Fixes #5089` is now claimed.

## 6. Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.90 | React is out of scope unless browser paste proof becomes required. |
| Slate-close unopinionated DX | 0.91 | Uses existing `insertFragment` / `tx.fragment.insert`; no new API. |
| Plate/slate-yjs migration backbone | 0.86 | Deterministic model shape helps collaboration, but collab proof is not required unless operations change. |
| Regression-proof testing strategy | 0.93 | Exact proof route is package core plus DOM clipboard boundary; browser proof is conditional on touched surface. |
| Research evidence completeness | 0.91 | Live gitcrawl, candidate maps, dossier rows, coverage matrix, prior clipboard plan, and source were read; no new external ecosystem claim is needed. |
| shadcn-style composability | 0.90 | No UI/component surface. |

Total: `0.93`.

## 7. Applicable Review Lenses

| Lens | Status | Reason | Current delta |
| --- | --- | --- | --- |
| `tdd` | applies | `#5089` is a behavior regression with a public insertion surface. | Red package proof first. |
| `performance-oracle` | applied lightly | Fragment insertion must not flatten by building broad post-hoc normalization work. | Keep proof focused; no benchmark unless implementation changes complexity. |
| `performance` | skipped | No benchmark/perf claim. | Revisit only if implementation touches hot large-paste paths. |
| `vercel-react-best-practices` | skipped | No React render/subscription surface. | Revisit only if browser/example proof changes React path. |
| `build-web-apps:shadcn` | skipped | No UI. | No change. |
| `react-useeffect` | skipped | No effects. | No change. |

## 8. Pass Schedule

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and candidate selection | complete | Read previous execution state, full issue ledger row, gitcrawl for #5089/#4542/#3155/#5080, candidate map, live `insert-fragment.ts`, and current tests; ran one live source probe. | Selected `#5089`; deferred `#5080`. | Full claim-proof route still pending. | ClawSweeper related-issue pass |
| related issue discovery | complete | Read gitcrawl threads, candidate maps, open issue dossiers, existing fork dossier, and coverage matrix for #5089/#4542/#3155. | Refreshed #5089/#4542 dossier text, added #3155 dossier section, and added #3155 related matrix row. | exact package-vs-paste proof bar unresolved | Issue ledger pass |
| issue-ledger pass | complete | Reviewed proof route against #5089 issue wording, candidate map, DOM clipboard boundary owner, and coverage matrix rules. | Requires package plus DOM clipboard boundary proof before `Fixes`; package-only proof can only improve. | none | Intent/decision pass |
| intent/boundary and decision brief | complete | Hardened scope, non-goals, and claim boundary. | Kept #4542/#3155 related and #5080 deferred. | none | Research/source refresh |
| research/source refresh | complete | Re-read live source/test owners and prior clipboard plan/matrix rows. | No new external ecosystem strategy needed; this is a local core/DOM proof lane. | none | pressure passes |
| objection/high-risk pass | complete | Added proof gate that prevents auto-close from package-only evidence. | Browser proof is conditional; DOM boundary proof is required for fixed claim. | none | closure |
| closure score | complete | Score `0.93`, all dimensions >= `0.90` except migration `0.86` acceptable because no collab surface changes. | Ready for Ralph execution. | none | user review |
| Ralph execution | complete | Added exact package and DOM clipboard boundary proof; focused tests, package typechecks, and lint passed. | Moved `#5089` to `Fixes`; kept `#4542` and `#3155` related; no source patch needed. | none | next Slate Ralplan |

## 9. Execution Result

Ralph execution is complete.

- Added package proof in
  `../slate-v2/packages/slate/test/clipboard-contract.ts` for a multi-block
  fragment inserted at `[0,0]@7` in `before after`.
- Added DOM clipboard boundary proof in
  `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` for a rich
  multi-block Slate fragment paste into the same middle text point.
- Current source already satisfies the model shape, so
  `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` was not
  patched.
- `#5089` moved to `Fixes`; `#4542` and `#3155` stay related.

Verification:

```bash
bun test ./packages/slate/test/clipboard-contract.ts -t "multi-block"
bun test ./packages/slate-dom/test/clipboard-boundary.ts -t "multi-block"
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun lint:fix
bun run completion-check
```

All passed on 2026-05-07.

## 10. Implementation Phases Draft

1. Add exact package proof in
   `../slate-v2/packages/slate/test/clipboard-contract.ts`:
   multi-block fragment inserted at `[0,0]@7` in `before after` produces
   `before one` and `twoafter`.
2. If that package proof fails, patch only
   `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`.
3. Add DOM clipboard boundary proof before claiming `Fixes #5089`.
4. Add browser paste proof only if DOM boundary proof cannot model the payload
   or implementation touches browser/example paste code.
5. Sync issue coverage, fork dossier, PR reference, and completion state.

## 11. Fast Driver Gates Draft

```bash
bun test ./packages/slate/test/clipboard-contract.ts -t "multi-block"
bun test ./packages/slate-dom/test/clipboard-boundary.ts -t "fragment"
bun --filter slate typecheck
bun lint:fix
```

If browser proof is required:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/huge-document.test.ts --project=chromium --grep "paste"
```

The exact browser command is provisional until the next pass confirms the
available route.

## 12. Objection Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Claim `#5089` from package proof only | The issue is paste-framed; package proof could miss clipboard import behavior. | Require DOM clipboard boundary proof before `Fixes`. | keep |
| Fold `#4542` into this lane | Empty-block nested-wrapper paste is broader than middle-paragraph multi-block insertion. | Keep related until exact DOM/browser repro proof exists. | keep |
| Fold `#3155` into this lane | General non-merging policy needs broader structural fragment proof. | Keep related; this lane proves one concrete bug. | keep |
| Jump to `#5080` instead | Query reverse order is clean but isolated. | Defer it after the fragment cluster proof. | keep |

## 13. Final User-Review Handoff Outline

- Public API: keep existing `Editor.insertFragment` / `tx.fragment.insert`;
  no new API.
- Core runtime: prove middle-paragraph multi-block fitting in
  `insert-fragment.ts`.
- Clipboard boundary: require DOM clipboard proof before any `Fixes #5089`
  line.
- Issue accounting: `#5089` selected; `#4542` and `#3155` related; `#5080`
  deferred.
- Execution gate: package test, DOM clipboard test, package typecheck, lint.

## 14. Completion Gates

This Ralplan is ready for user review only when:

- ClawSweeper related-issue pass is complete for `#5089`, `#4542`, and `#3155`.
- Issue matrix states exact `Fixes` / `Improves` / `Related` route.
- PR reference update or unchanged reason is recorded.
- Regression proof route names package and DOM clipboard gates precisely.
- High-risk/browser proof pass is applied or skipped with a concrete reason.
- final score is `>= 0.92` and no dimension is below `0.85`.
- `tmp/completion-checks/slate-v2-multiblock-fragment-middle-insert-ralplan.md`
  is `done`.

Status: complete.
