---
date: 2026-05-07
topic: slate-v2-core-caret-movement-word-insert-break
status: done
skill: slate-ralplan
score: 0.92
---

# Slate v2 Core Caret Movement And InsertBreak Ralplan

## 1. Current Verdict

Select `v2-core-caret-movement-word-insert-break` as the next issue-backed
lane.

The decision:

```txt
Fix the model caret contract before adding more public movement hooks.
insertBreak must publish the new-block caret after marked/fragmented leaves.
word movement must walk logical text across sibling leaves.
Browser repair can only mirror the model result.
```

This is the right next lane because `#3964` and `#3973` are both `ready-now`
core caret repros, both were deliberately excluded from the structural delete
lane, and both hit the same architectural pressure: Slate must project a logical
caret through fragmented text without trusting DOM selection magic.

## 2. Intent And Boundary

Intent:

- Close the obvious core caret gap after delete/normalization and operation
  validation.
- Keep caret movement model-owned and transaction-backed.
- Prove marked/split leaves are not a special-case footgun for `insertBreak`.
- Prove `unit: 'word'` movement works when a word spans multiple sibling text
  leaves at the start of a block.

Desired outcome:

- Exact issue-shaped tests for `#3964` and `#3973`.
- Related mark/Enter rows are routed through the same package proof when the
  repros match.
- Browser proof only mirrors model-owned behavior; it does not become the owner.

In scope:

- `../slate-v2/packages/slate/src/editor/insert-break.ts`
- `../slate-v2/packages/slate/src/transforms-selection/move.ts`
- `../slate-v2/packages/slate/src/editor/positions.ts`
- `../slate-v2/packages/slate/src/editor/after.ts`
- `../slate-v2/packages/slate/src/editor/before.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/packages/slate/test/transforms/move/both/unit-word*.tsx`
- `../slate-v2/packages/slate-react/src/editable/caret-engine.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Non-goals:

- No public `normalizePoint` API for `#4618`.
- No punctuation/word-boundary policy expansion for `#4648` unless it falls out
  of the exact `#3973` fix.
- No `removeNodes({ at: range })` helper for `#3891`.
- No fragment insertion `at` repair for `#5412`.
- No reverse DFS query cleanup for `#5080`.
- No replace-node convenience transform for `#5129`.
- No Firefox-native claim for `#3841` without Firefox browser proof.

Decision boundaries:

- Ralph may patch `../slate-v2` code and tests.
- Ralph may claim `Fixes #3964` only after a package test proves Enter at the
  end of marked text creates the new block and moves selection there.
- Ralph may claim `Fixes #3973` only after a package test proves
  `selection.move({ unit: 'word' })` advances from the start of a multi-leaf
  word.
- Ralph may add browser proof if the model fix touches React keydown or DOM
  repair.
- Ralph must not claim Firefox/mobile/native parity unless the browser matrix
  proves those exact rows.

Unresolved user-decision points:

- None. This is execution-ready.

## 3. Decision Brief

Principles:

- Core owns logical caret placement.
- DOM selection export/import repairs the view; it does not decide model
  movement.
- Leaf fragmentation is representation detail. Users should not feel it.
- Public movement hooks come after the default movement contract is solid.

Top drivers:

- `#3964`: Enter after a mark creates a new line but leaves the caret on the
  original line.
- `#3973`: `Transforms.move(..., { unit: 'word' })` fails when a document starts
  with multiple text leaves and no leading spaces.
- Current `Editor.insertBreak` delegates to `splitNodes({ always: true })` at
  `../slate-v2/packages/slate/src/editor/insert-break.ts:9`.
- Current `selection.move` lowers to `Editor.before` / `Editor.after` at
  `../slate-v2/packages/slate/src/transforms-selection/move.ts:34`.
- Current word positions concatenate block segments and map logical offsets back
  to points at `../slate-v2/packages/slate/src/editor/positions.ts:581`.

Viable options:

1. Patch React keydown/DOM repair.
   - Pro: might fix the visible browser symptom.
   - Con: package-level `Editor.insertBreak` and `selection.move` would still be
     wrong.
   - Verdict: reject as owner.

2. Add a public point-normalization hook.
   - Pro: app authors could patch local movement.
   - Con: turns a broken default into an extension burden and reopens
     selection interception chaos.
   - Verdict: reject for this lane.

3. Fix core logical projection and selection publication.
   - Pro: one package-level contract covers commands, React, history, and DOM
     export.
   - Con: requires careful tests around leaf boundaries and marks.
   - Verdict: chosen.

4. Copy VS Code's word classifier wholesale.
   - Pro: rich plain-text word movement policy.
   - Con: Slate rich text has elements, voids, marks, and paths; plain-text
     column movement is not the architecture.
   - Verdict: steal classifier discipline later, not the implementation now.

Chosen option:

- Red-test `#3964` and `#3973` in `packages/slate`.
- Fix the smallest core projection/publication owner.
- Add browser proof only after the package contract is green.

Consequences:

- The next slice is narrow enough to execute with TDD.
- `#3499`, `#4357`, and `#4195` may become exact fixes if their repros collapse
  to the same mark/Enter package contract.
- `#3841`, `#5629`, and `#4648` stay related unless extra browser/punctuation
  proof lands.

## 4. Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Slate-close unopinionated DX | 0.94 | No new public API; fixes existing `Editor.insertBreak`, `Editor.after`, `Editor.before`, and `selection.move`. |
| Regression-proof testing strategy | 0.93 | Issue candidate map marks `#3964` and `#3973` `ready-now`; plan requires red package tests before patching. |
| Browser/runtime realism | 0.88 | Browser word movement already has a DOM/model sync row, but Firefox/mobile are explicitly non-claims. |
| Ecosystem evidence | 0.90 | Lexical, ProseMirror, Tiptap, and VS Code were checked for movement/split strategy. |
| Minimality | 0.94 | Rejects normalizePoint, punctuation policy, range-remove, fragment insert, reverse traversal, and replace-node expansion. |
| Execution readiness | 0.94 | Live source owners and target tests are named. |

Total: `0.92`.

## 5. Live Source Grounding

Current Slate v2 owner map:

- `Editor.insertBreak` is a thin command wrapper around `splitNodes({ always:
  true })` at `../slate-v2/packages/slate/src/editor/insert-break.ts:9`.
- `selection.move` resolves target points through `Editor.before` /
  `Editor.after` at
  `../slate-v2/packages/slate/src/transforms-selection/move.ts:34`.
- `Editor.after` and `Editor.before` iterate `Editor.positions` and skip
  non-selectable elements at `../slate-v2/packages/slate/src/editor/after.ts:14`
  and `../slate-v2/packages/slate/src/editor/before.ts:14`.
- Word positions group text by block, concatenate segment text, and map logical
  offsets back to points at
  `../slate-v2/packages/slate/src/editor/positions.ts:577`.
- Existing package proof covers simple `insertBreak` selection at
  `../slate-v2/packages/slate/test/snapshot-contract.ts:1151`.
- Existing word-position proof covers inline fragmentation, not sibling text
  leaves at the start of a word, at
  `../slate-v2/packages/slate/test/interfaces/Editor/positions/all/unit-word-inline-fragmentation.tsx:8`.
- Existing transform fixture covers normal word movement, not the `#3973`
  initial multi-leaf repro, at
  `../slate-v2/packages/slate/test/transforms/move/both/unit-word.tsx:7`.
- React word movement routes to `tx.selection.move({ unit: 'word' })` at
  `../slate-v2/packages/slate-react/src/editable/caret-engine.ts:138`.
- Browser proof for word movement currently skips Firefox/mobile at
  `../slate-v2/playwright/integration/examples/richtext.test.ts:2861`.

Gap:

- No exact package test proves `insertBreak` after a mark places selection in
  the created block.
- No exact package test proves word movement from the start of a multi-leaf word.

## 6. ClawSweeper Issue Pass

Live gitcrawl status:

- `gitcrawl doctor --json` is usable but GitHub API sync is unavailable because
  no token is present.
- `gitcrawl threads --numbers 3964,3973,3891,5080,5412,5129,3962,4618,1654
  --include-closed --json ianstormtaylor/slate` grounded the candidate list.
- `gitcrawl neighbors --number 3964` links `#3499`, `#4357`, `#4195`, and
  `#3841`.
- `gitcrawl neighbors --number 3973` links `#3841`, `#5629`, `#4648`, and
  broader DOM/caret noise.

Target rows:

| Issue | Decision | Reason |
| --- | --- | --- |
| `#3964` | target | Exact ready-now package repro for marked `insertBreak` caret placement. |
| `#3973` | target | Exact ready-now package repro for word movement across initial sibling leaves. |

Related rows:

| Issue | Decision | Reason |
| --- | --- | --- |
| `#3499` | related | Mark + Enter + undo pressure; may be improved by `#3964`, exact undo claim needs history proof. |
| `#4357` | related | Same mark-end Enter symptom as `#3964`; can become fixed if the same package proof covers it. |
| `#4195` | related | Same inconsistent return-key caret family; can become fixed if the same repro collapses to `#3964`. |
| `#3841` | related | Word movement inside custom `insertBreak`, but exact thread is Firefox-specific. |
| `#5629` | related | Word navigation pressure, likely punctuation/DOM path; keep separate unless core word projection fails the same way. |
| `#4648` | not claimed | Punctuation definition request, not the same as multi-leaf projection. |
| `#4618` | not claimed | Public `normalizePoint` hook remains rejected in this lane. |

Excluded ready rows:

| Issue | Reason |
| --- | --- |
| `#3891` | Remove-range helper API needs separate design. |
| `#5412` | `insertFragment({ at })` regression is a fragment insertion lane. |
| `#5080` | Reverse `Editor.nodes` traversal is a query API lane. |
| `#5129` | Replace-node convenience transform is API design, not caret movement. |

## 7. Ecosystem Strategy Synthesis

| System | Evidence | Mechanism | Slate target | Verdict |
| --- | --- | --- | --- | --- |
| Lexical | `../lexical/packages/lexical-selection/src/range-selection.ts:503`; `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2234` | Word movement delegates to selection modification; paragraph insertion is tested across multiple text nodes. | Keep model movement centralized and add fragmented-text insertion proof. | steal tests, not DOM dependency |
| ProseMirror | `../prosemirror-commands/src/commands.ts:355`; `../prosemirror-commands/test/test-commands.ts:332` | `splitBlock` maps transaction position and tests split selection shape. | Keep split selection publication transaction-owned. | agree |
| Tiptap | `../tiptap/packages/core/src/commands/splitBlock.ts:33` | Wraps ProseMirror split behavior with optional mark preservation. | Do not expose product-level `keepMarks`; fix raw selection first. | partial |
| VS Code | `../vscode/src/vs/editor/common/cursor/cursorWordOperations.ts:211` | Word movement has explicit classifier policy. | Consider a later punctuation policy for `#5629`/`#4648`; do not block `#3973` on it. | defer |

## 8. Ralph Execution Plan

Phase 1: red package tests.

- Add `#3964` package proof:
  - setup paragraph with text split by marks;
  - place selection at the end of the marked segment;
  - call `Editor.insertBreak(editor)` inside `editor.update`;
  - assert children split correctly;
  - assert selection is collapsed at the start of the created block.
- Add `#3973` package proof:
  - setup a paragraph whose first word spans multiple sibling text leaves;
  - place selection at the start of the first leaf;
  - call `editor.selection.move({ unit: 'word' })`;
  - assert selection advances to the logical word boundary, not the original
    point.

Phase 2: smallest core fix.

- Prefer fixing `positions` logical-offset mapping or `before`/`after`
  iteration if the red test proves the target point exists but is skipped.
- Prefer fixing `splitNodes`/selection publication only if `insertBreak` creates
  the right nodes and publishes the wrong selection.
- Do not patch React keydown unless the package contract is green and browser
  export remains wrong.

Phase 3: related issue proof.

- If the `#3964` red test also covers `#4357`/`#4195`, update the exact fixed
  claims.
- If `#3499` requires undo/marks beyond the package split, keep it `Related` and
  add a history follow-up.
- If `#3973` uncovers punctuation-policy behavior, keep `#5629`/`#4648`
  separate unless a focused test is added.

Phase 4: browser mirror proof.

- Run existing richtext word-movement proof if React/DOM paths changed.
- Add one browser row only if package proof is green but DOM selection export or
  repair is suspect.
- Keep Firefox/mobile non-claims unless directly proved.

Phase 5: ledgers and PR reference.

- Update `issue-coverage-matrix.md`, fork issue dossier, and
  `pr-description.md`.
- Claim `Fixes` only for exact issue-shaped proofs.
- Leave the live gitcrawl corpus files unchanged unless a corpus classification
  column exists; they are inventory, not the fork claim overlay.

## 9. Verification Plan

Focused package proof:

```bash
cd ../slate-v2
bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/query-contract.ts ./packages/slate/test/transforms/move/both/unit-word.tsx ./packages/slate/test/transforms/move/both/unit-word-reverse.tsx
bun --filter slate typecheck
```

If React/DOM changed:

```bash
cd ../slate-v2
bun --filter slate-react test:vitest -- caret-engine editing-kernel
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=webkit --grep "word movement|insertBreak|selection synchronized" --workers=2 --retries=0
```

Closeout:

```bash
cd ../slate-v2
bun lint:fix
cd ../plate-2
bun run completion-check
```

## 10. Maintainer Objections

| Objection | Answer |
| --- | --- |
| "This is a browser bug; let native selection handle it." | No. The public `Editor.insertBreak` and `selection.move` contracts must be correct without React. Browser proof mirrors the model. |
| "Just expose `normalizePoint`." | Too early. That makes apps patch a broken default and would become another fragile selection interception API. |
| "Word boundary behavior is subjective." | True for punctuation. Not true for a single word split across sibling leaves. `#3973` is projection, not policy. |
| "Tiptap exposes `keepMarks`; should Slate add it?" | No for raw core. The default split selection must be correct first; product mark behavior belongs in extension policy if needed. |
| "Why not include #3891/#5412/#5080/#5129 now?" | Because they are different owners. Mixing them would hide the caret bug under API sprawl. |

## 11. Plan Deltas

- Promoted `#3964` and `#3973` from excluded structural-delete rows to the next
  active target lane.
- Routed `#3499`, `#4357`, `#4195`, `#3841`, `#5629`, `#4648`, and `#4618` with
  explicit claim boundaries.
- Kept public API expansion out of scope.
- Added ecosystem evidence for split and word movement strategy.
- Added exact Ralph red-test order.
- Ralph execution added package regression proof. The current source already
  satisfied both issue-shaped cases, so the closure work is proof and claim
  accounting, not another core patch.

## 12. Issue Ledger Accounting

Ralph execution landed tests. Exact fixed claims now change for the cases with
package proof:

Coverage updates made by this planning and execution pass:

- `#3964`: `Fixes`, marked `insertBreak` publishes selection in the created
  block.
- `#3973`: `Fixes`, word movement crosses initial sibling text leaves.
- `#3499`: `Related`, mark/Enter/undo cluster; exact history claim deferred.
- `#4357`: `Fixes`, exact same marked-end Enter focus repro as `#3964`.
- `#4195`: `Related`, same return-key caret family.
- `#3841`: `Related`, custom `insertBreak`/word movement with Firefox proof
  requirement.
- `#5629`: `Related`, word navigation pressure outside this exact projection
  repro.
- `#4648`: `Not claimed`, punctuation policy request.

PR auto-close count increases by 3.

Execution proof:

- `../slate-v2/packages/slate/test/snapshot-contract.ts`: `insertBreak after
  marked text moves selection into the new block`.
- `../slate-v2/packages/slate/test/transaction-contract.ts`: `moves word
  selection across initial sibling text leaves`.
- `bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/transaction-contract.ts`
  passed with 222 tests.
- `bun --filter slate typecheck` passed.
- `bun lint:fix` passed.

Live gitcrawl ledger sync:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` remains generated live-field
  inventory only; v2 claim state is synced through this plan,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md`.

## 13. Applicable Skill Notes

- `clawsweeper`: applied. Used gitcrawl thread/neighbors and local issue maps.
- `tdd`: applied through package behavior tests. Both issue-shaped tests passed
  against current source, so no core patch was needed.
- `performance`: skipped. This is correctness-first; no hot-path data structure
  change is planned.
- `vercel-react-best-practices`: skipped. React is browser proof only unless
  package proof exposes a DOM repair issue.
- `high-risk-deliberate-pass`: applied through claim boundaries and exact
  non-goals.

## 14. Final Verdict

Ralph execution complete.

This was proof closure, not implementation. The current core moves the caret
correctly across split leaves and after marked Enter.
