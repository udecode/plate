---
date: 2026-05-07
topic: slate-v2-marked-enter-undo-caret
status: done
skill: slate-ralplan
score: 0.92
---

# Slate v2 Marked Enter Undo Caret Ralplan

## 1. Current Verdict

Done. Select `#3499` as the next Slate v2 execution lane.

The right target is not the already-fixed marked-Enter caret placement covered
by `#3964` / `#4357`. The remaining useful claim is narrower and sharper:

```txt
Prove marked Enter plus undo restores the exact pre-split document, mark props,
and selection.
```

The plan is now execution-ready for Ralph. The completion target is a strong
plan, not the implementation itself.

Current score: `0.92`.

## 2. Intent And Boundary

Intent:

- Close the leftover `#3499` history/mark-restoration part after the
  marked-Enter caret proof.
- Keep the fix package-owned unless browser proof shows a React export/import
  fault.
- Avoid turning a specific undo regression into a broad mark-state redesign.

Desired outcome:

- A red package test in `slate-history` proves Enter before a bold word moves
  that word to the next block, then undo restores the original paragraph,
  bold mark props, and the original selection.
- Issue accounting can say exactly what is fixed, improved, related, or still
  not claimed.
- No new public API is added unless later evidence proves the current
  operation/history contract cannot express the behavior.

In scope:

- `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts`
- `.tmp/slate-v2/packages/slate/src/editor/insert-break.ts`
- current `splitNodes({ always: true })` behavior only as the operation source
- issue coverage, fork dossier, PR reference, and completion state sync

Non-goals:

- Do not reopen `#3964` / `#4357` unless the new undo test proves the existing
  package proof was too narrow.
- Do not claim `#4195`, `#3841`, `#5629`, or `#4648` without exact repro proof.
- Do not change React keydown, DOM selection repair, or browser event handling
  during the planning gate.
- Do not change collaborative undo semantics without a separate slate-yjs
  migration-backbone answer.
- Do not add a public mark-restoration hook.

Decision boundaries:

- Ralph may add one red public history contract test before implementation.
- Ralph may patch history batching, inverse replay, or selection restoration
  only after the red test identifies the current fault.
- Ralph may inspect and patch core split behavior only if the failing proof
  shows the history layer receives incomplete operations.
- `Fixes #3499` is allowed only after the original two-part repro is proven:
  caret placement and undo mark restoration.

Unresolved user-decision points:

- None for this planning slice. The remaining uncertainty is technical and can
  be answered from source, tests, and issue evidence.

## 3. Decision Brief

Principles:

- History undo restores the observable state from before the saved commit.
- Mark props are document data, not view decoration.
- Selection restoration must be explicit and replayable, not a side effect of
  DOM focus repair.
- Issue closure requires exact repro proof, not family resemblance.

Top drivers:

- `gitcrawl threads --numbers 3499 --include-closed --json` reports the issue
  as open and asks for two outcomes: caret at the start of bold `you` on the new
  line, and undo restoring a state where `you` is still bold.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:104` already classifies
  `#3499` as related because caret placement is covered but exact undo/mark
  restoration needs separate history proof.
- `docs/slate-v2/references/pr-description.md:214` keeps `#3499` as related
  open debt for undo/mark restoration.
- `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts:1189` proves the
  current core package can place the selection into a new block after marked
  text.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:48` replays inverse
  operations on undo and restores `selectionBefore`.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:133` records
  `selectionBefore` from the previous snapshot for new undo batches.

Viable options:

1. Treat `#3499` as already fixed by the `#3964` marked-Enter proof.

   - Pro: avoids another lane.
   - Con: ignores the explicit undo/mark half of the issue.
   - Verdict: reject.

2. Patch React/DOM selection handling first.

   - Pro: matches the richtext browser repro surface.
   - Con: the remaining claim is undo state restoration, which has a package
     owner and package tests already.
   - Verdict: reject for the first pass.

3. Add a `slate-history` red contract test around marked Enter plus undo.

   - Pro: proves the exact remaining issue without public API expansion.
   - Con: may expose deeper split-operation data if history receives an
     already-lossy commit.
   - Verdict: chosen.

4. Design a public mark/selection restore API.
   - Pro: gives consumers escape hatches.
   - Con: makes every app author pay for a core/history invariant failure.
   - Verdict: reject unless the red test proves the invariant is impossible.

Chosen direction:

- Implementation: red `slate-history` proof, then patch the smallest owner
  shown by that red test.

Consequences:

- The implementation target is likely package-only and low API risk.
- TDD is mandatory because the issue claim is behavior-facing.
- Browser proof is conditional: use it only if package state is correct and the
  richtext path still fails.

## 4. Confidence Scorecard

| Dimension                                 | Weight | Score | Evidence                                                                                                                   |
| ----------------------------------------- | -----: | ----: | -------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance            |   0.20 |  0.90 | No React surface is selected; browser/React proof is gated behind package proof and cannot contaminate the first patch.    |
| Slate-close unopinionated DX              |   0.20 |  0.94 | Plan adds no API; it uses current `Editor.insertBreak`, `editor.undo()`, and snapshot contracts.                           |
| Plate and slate-yjs migration backbone    |   0.15 |  0.91 | Local history is the owner; any operation/history metadata change must record Plate/slate-yjs impact before issue closure. |
| Regression-proof testing strategy         |   0.20 |  0.94 | Ralph must start with one red `slate-history` contract and rerun existing history selection/insertBreak guards.            |
| Research evidence completeness            |   0.15 |  0.90 | ClawSweeper reviewed the target, neighbors, coverage matrix, dossier, live ledger, and current source/test owners.         |
| shadcn-style composability and minimalism |   0.10 |  0.94 | No component API, hook API, prop shape, or renderer expansion is planned.                                                  |

Weighted total: `0.92`.

Ready threshold is met for Ralph execution.

## 5. Source-Backed Architecture North Star

The north star is boring and strict: undo should restore the exact visible state
from before the split. If a saved history batch captures a split commit, inverse
operation replay plus saved selection must be enough to recover the original
tree and selection.

Current source owners:

- `.tmp/slate-v2/packages/slate/src/editor/insert-break.ts:9` delegates to
  `splitNodes({ always: true })` through the command registry.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:57` wraps undo replay
  in `HistoryEditor.withoutSaving`.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:60` computes inverse
  operations and replays them in reverse order.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:63` restores the
  saved `selectionBefore`.
- `.tmp/slate-v2/packages/slate-history/src/with-history.ts:211` excludes pure
  `set_selection` operations from history saves.

## 6. Ecosystem Strategy Synthesis

Status: skipped with reason.

This plan does not use Lexical, ProseMirror, Tiptap, React 19.2, or external
browser behavior as affirmative evidence. The target is an existing raw Slate
history invariant with local source and issue proof. External comparison would
be research theater unless the red test exposes a real design fork:

| Reference   | Status  | Needed only if                                                         |
| ----------- | ------- | ---------------------------------------------------------------------- |
| React 19.2  | skipped | Browser selection export/import becomes the owner.                     |
| Lexical     | skipped | History batching or command transaction strategy needs comparison.     |
| ProseMirror | skipped | Operation transaction inversion or selection mapping needs comparison. |
| Tiptap      | skipped | Extension-facing history behavior becomes a public DX question.        |

## 7. Public API Target

Target: no public API change.

The desired public behavior is observable through existing calls:

- `Editor.insertBreak(editor)`
- `editor.undo()`
- `Editor.getSnapshot(editor)`

Any public API proposal in a later pass must first prove why current operation
replay and selection snapshots cannot express the invariant.

## 8. Internal Runtime Target

Initial target:

- write a history contract using the real editor update path;
- split before a bold leaf in a single paragraph;
- assert the post-split caret lands at the start of the moved bold text;
- call undo;
- assert the original paragraph, bold leaf, and original selection are restored.

Expected starting shape:

```txt
before: paragraph("hey ", bold("you")), selection at [0,0] offset 4 or [0,1] offset 0
after Enter: paragraph("hey "), paragraph(bold("you")), selection at [1,0] offset 0
after undo: paragraph("hey ", bold("you")), selection at the original split point
```

The exact path form must be established by the red test because the split point
can be represented either at the end of the plain leaf or the start of the bold
leaf.

## 9. Hook, Component, And Render DX Target

Status: no target yet.

This lane should not add React hooks, renderer props, or component contracts.
React becomes relevant only if package state is correct and the browser still
exports/imports the wrong selection.

## 10. Plate Migration-Backbone Target

Plate should inherit correct raw Slate history behavior. No Plate adapter,
Plate plugin API, or `editor.api` / `editor.tf` compatibility work belongs in
this lane.

If the implementation changes operation shape or history metadata, the later
migration pass must state how Plate plugins can keep relying on deterministic
snapshots and undo batches.

## 11. slate-yjs Migration-Backbone Target

Do not conflate local undo with collaborative undo.

This plan can close `#3499` for local raw Slate history. If the fix changes
operation inversion, history metadata, or commit grouping, a later pass must
record the slate-yjs impact before closure.

## 12. Full Issue-Ledger Accounting

ClawSweeper related-issue pass:

- status: `complete`
- trigger: behavior-facing issue claim for marked Enter, undo, selection, and
  mark restoration
- first issue: `#3499`
- neighbor candidates from gitcrawl: `#3841`, `#3964`, `#3497`, `#3756`
- already-known related rows: `#4195`, `#5629`, `#4648`
- gitcrawl freshness:
  `gitcrawl doctor --json` reports local Slate data from
  `2026-05-04T14:58:11.123944Z`; GitHub API sync is unavailable because no
  token is configured.
- related searches:
  `gitcrawl search ... "bold you undo split_node selectionBefore insertBreak"`
  and `"marked text undo selection history set_selection"` returned no stronger
  duplicate/neighbor than the explicit issue set.

Issue decisions:

| Issue   | Current decision | Reason                                                                                                       |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `#3499` | target for Ralph | Caret half appears covered; undo/mark restoration remains open and has a direct `slate-history` proof route. |
| `#3964` | already fixed    | Existing package proof covers marked Enter caret placement.                                                  |
| `#4357` | already fixed    | Same marked Enter new-block focus family as `#3964`.                                                         |
| `#4195` | related          | Same return-key placement family; exact repro not yet proven here.                                           |
| `#3841` | related          | Firefox custom `insertBreak` override requires browser proof.                                                |
| `#5629` | related          | Punctuation word navigation is adjacent policy, not this undo lane.                                          |
| `#4648` | not claimed      | Punctuation policy remains outside this target.                                                              |
| `#3756` | related guard    | Same history/selection family, but broader multi-block delete selection restore; do not auto-close.          |
| `#3497` | not claimed      | React parent-rerender focus loss, not local history undo restoration.                                        |

Live ledger sync:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` already contains current
  rows for the reviewed issues and no raw corpus row needed a change.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` now points `#3499` at this
  plan as the active unclaimed target.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` now records `#3499` as
  `issue-reviewed` and Ralph-ready rather than merely related to `#3964`.

PR reference sync:

- `docs/slate-v2/references/pr-description.md` names `#3499` as the next
  planned history proof target while preserving the no-fixed-claim boundary.

## 13. Legacy Regression Proof Matrix

| Behavior                             | Proof route                                                   | Status                                |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------- |
| Marked Enter caret placement         | `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts:1189` | existing package proof                |
| Marked Enter undo restores marks     | new `slate-history` contract                                  | missing                               |
| Marked Enter undo restores selection | new `slate-history` contract                                  | missing                               |
| Browser richtext reproduction        | Playwright richtext only if package proof is insufficient     | conditional                           |
| Firefox custom override from `#3841` | browser-specific proof                                        | out of scope for first implementation |

## 14. Browser Stress And Parity Strategy

Package proof comes first. Browser proof is not allowed to drive the first
patch unless the package contract is already green and the visible browser path
still fails.

Potential later browser row:

- Chrome richtext: split before bold word, undo, assert DOM/selection mirrors
  the package snapshot.

Explicit non-claims:

- no Firefox closure for `#3841`;
- no mobile/native parity claim;
- no punctuation word-boundary claim.

## 15. Applicable Implementation-Skill Review Matrix

| Skill                         | Status                 | Reason                                                                    |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `slate-ralplan`               | applied                | This plan is scored and execution-ready.                                  |
| `continue`                    | applied                | Existing `#5080` lane was done; this pivots to the next lane.             |
| `clawsweeper`                 | applied                | Related issues were reviewed and durable accounting was updated.          |
| `tdd`                         | applied as requirement | Implementation must start with one red behavior test.                     |
| `intent-boundary-pass`        | applied inline         | Intent, scope, non-goals, and decision boundaries are explicit.           |
| `steelman-pass`               | applied inline         | Maintainer objections are recorded and answered.                          |
| `high-risk-deliberate-pass`   | applied inline         | User-visible undo behavior has a pre-mortem and proof plan.               |
| `vercel-react-best-practices` | skipped                | No React code target unless package proof clears and browser still fails. |
| `performance-oracle`          | skipped                | No hot path or algorithm change selected.                                 |
| `performance`                 | skipped                | No browser-scale performance lane selected.                               |

## 16. High-Risk Deliberate-Mode Pre-Mortem

Status: applied.

Initial risk list:

1. The package test passes but browser selection still points at the wrong DOM
   location.
2. A history fix preserves marks but breaks selection restore for multi-block
   operations already covered in `history-contract.ts`.
3. Operation inversion is correct locally but creates an unclear collaborative
   undo story.

Proof response:

- keep the first implementation package-only;
- rerun existing history selection tests around `deleteFragment`, `moveNodes`,
  reverse joins, and `insertBreak`;
- escalate to browser proof only after the package behavior is green.

## 17. Hard Cuts And Rejected Alternatives

- Cut React-first repair.
- Cut public mark-restoration API.
- Cut broad mark-state architecture work.
- Cut punctuation word-navigation policy.
- Cut collaborative undo redesign from this lane.
- Cut any `Fixes #3499` wording until both original bugs are proven.

## 18. Slate Maintainer Objection Ledger

Status: applied.

Initial objections:

| Objection                                      | Current answer                                                                                        | Status |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| This is already fixed by `#3964`.              | Not fully. `#3964` covers caret placement; `#3499` also asks for undo preserving bold text.           | keep   |
| This is old Slate `0.57.1` noise.              | Maybe, but v2 has a direct history proof route and current source owners. Red test decides.           | keep   |
| Browser richtext repro means React owns it.    | Only if package state is already correct. History gets first proof.                                   | keep   |
| Fixing history might touch collaborative undo. | True if operation semantics change; Ralph must record Plate/slate-yjs impact before claiming closure. | keep   |

## 19. Pass Schedule And Pass-State Ledger

| Pass                                    | Status   | Evidence added                                                                             | Plan delta                             | Open issues | Next owner    |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------ | -------------------------------------- | ----------- | ------------- |
| current-state read and target selection | complete | `gitcrawl` #3499 thread/neighbors; coverage row; PR reference row; live source/test owners | selected `#3499` undo/mark restoration | none        | ClawSweeper   |
| related issue discovery                 | complete | gitcrawl threads/search, live ledger rows, dossier rows, coverage rows                     | narrowed target and rejected neighbors | none        | slate-ralplan |
| issue-ledger pass                       | complete | coverage matrix, fork dossier, PR reference, live ledger checked                           | `#3499` points to this plan            | none        | slate-ralplan |
| intent/boundary and decision brief      | complete | explicit scope, non-goals, decision boundaries, options                                    | no user question needed                | none        | slate-ralplan |
| research and live-source refresh        | complete | current `insertBreak`, `with-history`, `history-contract`, `snapshot-contract` owners      | external research skipped with reason  | none        | slate-ralplan |
| pressure passes                         | complete | TDD, high-risk, steelman, React/perf skips recorded                                        | proof plan tightened                   | none        | slate-ralplan |
| issue sync accounting                   | complete | issue coverage, fork dossier, PR reference updated                                         | no fixed claim added                   | none        | slate-ralplan |
| closure score                           | complete | score `0.92`, no dimension below `0.85`                                                    | ready for Ralph                        | none        | Ralph         |

## 20. Plan Deltas From Review

Created this plan from the completed `#5080` lane.

Accepted:

- `#3499` is the next target.
- ClawSweeper confirms `#3499` is the only target.
- Top-level status is `done` because the Ralplan is ready for Ralph execution.
- Implementation proof belongs to Ralph, not the Ralplan completion gate.

Dropped:

- `#5684` as next lane, because it still needs a concrete traversal repro.
- `#5028` as next lane, because it is adjacent API pressure, not the best
  immediate issue-shaped proof.
- `#3885` as next lane, because it is docs-only relative to the current core
  package work.

## 21. Open Questions

- Red test decides whether current v2 already preserves the bold leaf on undo
  for the exact `#3499` split-before-mark shape.
- Red test decides whether the canonical split point is `[0,0]@4` or
  `[0,1]@0` before Enter.
- `#3756` remains a related guard, not an auto-close target.
- Browser proof is conditional and Chrome richtext is enough for this lane
  unless package state is green and browser behavior still diverges.

## 22. Implementation Phases With Owners

Phase 0, planning:

- Done.

Phase 1, red proof:

- Add one `slate-history` contract test for marked Enter plus undo.
- Confirm it fails before any implementation patch.

Phase 2, smallest owner patch:

- If history replay/selection restore is wrong, patch `with-history.ts`.
- If split operations are lossy before history sees them, patch the core split
  owner.
- If package state is correct but browser is wrong, pivot to React/browser
  proof.

Phase 3, claim sync:

- Update issue coverage matrix, fork dossier, PR reference, and completion file
  only after proof supports the claim.

## 23. Fast Driver Gates

First implementation gates:

```bash
bun test ./packages/slate-history/test/history-contract.ts -t "marked Enter undo"
bun test ./packages/slate/test/snapshot-contract.ts -t "insertBreak after marked text"
bun --filter slate-history typecheck
bun --filter slate typecheck
bun lint:fix
```

Broaden only if the touched owner requires it:

```bash
bun test ./packages/slate-history/test/history-contract.ts
bun test ./packages/slate/test/snapshot-contract.ts
bun check
```

## 24. Final User-Review Handoff Outline

When closure is ready, the handoff should list:

- exact issue claim text;
- proof commands and results;
- issue rows changed;
- source files changed in `.tmp/slate-v2`;
- whether browser proof was needed;
- remaining related non-claims.

## 25. Final Completion Gates

Set `done` because:

- score is `0.92`;
- no dimension is below `0.85`;
- ClawSweeper related-issue pass is complete;
- issue-ledger sync is complete for the planning surface;
- fork dossier sync is complete for reviewed issues whose classification
  changed;
- `docs/slate-v2/references/pr-description.md` is current;
- TDD, intent-boundary, high-risk, and steelman rows are applied or skipped with
  reasons;
- implementation proof is assigned to Ralph;
- no unresolved public API or collaboration question blocks execution.

## 26. Ralph Execution Result

Status: done.

Implementation result:

- Added `slate-history` proof for marked Enter plus undo:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`.
- The red run exposed the real loss: core split created an empty right text leaf
  before the moved bold leaf, so selection landed on the empty leaf.
- Patched the core split owner:
  `.tmp/slate-v2/packages/slate/src/transforms-node/split-nodes.ts`.
- The patch tracks the next sibling start when splitting at the end of a text
  leaf and skips manufacturing an empty split leaf before moved marked text.

Issue claim:

- Claim `Fixes #3499`: marked Enter before a bold word moves the word into the
  new block, places selection at the moved word start, and undo restores the
  original marked paragraph plus selection.
- `#3756` remains a broader related history-selection guard.

Verification:

```bash
bun test ./packages/slate-history/test/history-contract.ts -t "marked Enter undo"
bun test ./packages/slate/test/snapshot-contract.ts -t "insertBreak after marked text"
bun test ./packages/slate-history/test/history-contract.ts
bun test ./packages/slate/test/snapshot-contract.ts
bun --filter slate-history typecheck
bun --filter slate typecheck
bun lint:fix
```

Issue sync:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/open-issues-ledger.md`
