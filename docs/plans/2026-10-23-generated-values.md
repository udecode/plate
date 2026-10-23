---
review_scopes: [authored]
review_basis: []
work_kind: implementation
review_commit: be4cac3bd50723e842895d50d69f3e5d85c79952
review_inputs: [packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/halves.ts, packages/plitejs/test/written-default-storage.test.ts]
---

# Give a line its id back when a suggested Enter at its start is rejected

Status: partial: the fix moved to the Construction values plan
Playbook: plan

This iteration was the first part of suggested task t_f821f679, which asked that a suggested Enter split a block in an editor that makes block ids. The task's probe showed a second defect under that one, F1, which happens on next with no id maker at all. Rejecting a suggested Enter at a line's start brings the line back with the values the Enter gave the new line, so every value a split drops is lost, a block id among them. Three diff panel rounds reviewed two designs for F1, and the last round found that the second one also made the result depend on decision order. The panel rule then reverts the fix, so this iteration lands no source change. F1 goes back to planning as a narrower step of [Construction values](2026-10-23-construction-values.md), which also holds the rest of the task.

## Brief

### What will change?

Nothing in the editor. The authored subject file now says that rejecting an Enter at a line's start loses the line's block id, and names the plan that owns the fix.

### What could go wrong?

Nothing new ships. F1 stays as on next until the Construction values plan builds its line-start step.

## Teach

An Enter at the start of a line leaves an empty line where you pressed and moves the text into a new line below it. Some values never follow a split, such as a block id, so the new line gets a fresh id or none.

Rejecting that Enter should give the line back as it was. In mid-line it does, because the editor merges the two lines and keeps the first line's values. At a line's start the first line is empty, so the editor keeps the second line in its place, and the line's own id is lost.

Two designs tried to give those values back. Review rounds found decision orders that stored different lines with each, and two suggestions that could only be decided together. So this plan lands no fix, and a narrower one goes back to planning.

## What other editors do

Read from local checkouts on 2026-10-23 by a Codex explorer and run by none. Every editor that tracks a split gives the rejected line one block's id, and none drops the line's own id.

| Editor | Id after a rejected split |
| --- | --- |
| BlockNote `1e26f1c` | The left block's, through prosemirror-suggest-changes' join (inferred) |
| prosemirror-suggest-changes `653fba7` | The left block's (`commands.ts:110`, inferred) |
| manuscripts track-changes `62f4d19` | The source block's (`revertChange.ts:30`) |
| EigenPal DOCX `84c4622` | The tail's (`tree-op-revisions.ts:883`, inferred) |
| Tiptap, CKEditor 5, Lexical, Slate | No tracked split in the open source |
| Plite after this plan | Unchanged: the new line's, so the line's own id is lost |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| None in source; the authored subject file states F1's limit | Plite | `docs/plans/topics/authored.md` | The subject file owns current behavior |

No import crosses `tooling/entrypoints/entrypoint-dag.mjs`.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rejected split with an empty left half | The right half stands in the left half's place with its own values | Unchanged here; the Construction values plan's line-start step | `plitejs/authored` resolver | Both designs broke decision order | None | Step 1 | F1 stays | defer |

## Failures and rollback

Nothing ships, so nothing rolls back. Rejecting a suggested Enter at a line's start keeps losing the values the split dropped, the block id among them, as on next.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where F1's fix goes after the revert | A step of the Construction values plan, whose panel reviews it before any code (look) | Its own plan iteration, with its own panel | own plan | small |
| Which metadata a rejected Enter at a line's start gives back there | Only keys whose target holds on every element type at every place, as Plate's block id does (look) | Every metadata key, which the third round showed needs a design for a type that cannot hold the value | every metadata key | small |

## Steps

- [ ] 1. **Metadata back at a line's start.** Built twice and reverted after diff round 3; see Challenge delta. The step continues as the line-start step of the Construction values plan.
- [x] 2. **Close.** The writing passes, the three diff panel rounds (reviews: push, for Plite core), the revert and the subject file's limit.

## Proof

Diff round 3's two cases fail on the reviewed tree and pass at `be4cac3bd5` (`diffr3-findings-current-a1.log`, `diffr3-findings-base-a1.log`), and so do round 2's (`diffr2-findings-current-a1.log`, `diffr2-findings-base-a1.log`). After the revert, `git diff be4cac3bd5` holds no source change. The reverted bytes and their last proof runs stay in `docs/plans/artifacts/generated-id-split/phase1-reverted/` and the `ls3-*` logs beside it.

## Challenge delta

Plan panel round 1 (Opus, Astra and Sol at xhigh) read the three-phase draft. Two findings changed step 1. The empty-left landing skipped the halves' verdict, so a later write on the new line was lost (Astra, Sol). The first fix made the result depend on decision order when the new line held a pending suggestion on a dropped key (Opus). Step 1 then ran the verdict and merged decided values. Round 2 read the narrowed plan and its prototype. Two Enters at a line's start lost the value when rejected together but not one by one (all three seats), and restoring the left half's type skipped the retype check (Opus, Sol). Seven findings showed the generated-values phases cannot meet the Construction values stop as drawn, and they moved to [Construction values](2026-10-23-construction-values.md) with the warnings on those phases.

Diff round 1 (the same seats) read the built step and found three ways the verdict at a line's start broke decision order or made two rejections decidable only together (Astra twice, Opus once). Its fixes carried the empty line's pending splits onto the standing line and counted them as touching the verdict.

Diff round 2 (the same seats) read those fixes. All three seats found that a standing line hid the split it carried, so three Enters stored different lines per decision order. All three found that the touching rule took the line before as empty only when stored so, and a pending insertion or deletion broke the order the same way. Opus found that one suggestion that writes the new line and splits it could only be decided together with the first Enter. Giving back any compared value changes what a later Enter's verdict compares, so the landing at a line's start went back to next's and gave back only metadata, which no verdict compares. That was the mechanism's one replacement.

Diff round 3 (the same seats) read the replacement, and all three seats found the same two cases. A chain of standing lines copied the id without checking that the middle line could hold it, so with the middle line retyped by Editing, rejecting both Enters together kept the id and rejecting them one by one lost it. A suggestion that pressed Enter at the new line and retyped it made each rejection wait on the other. Both fail on the replacement and pass at base. A mechanism that draws a critical finding after its replacement leaves the loop, so the fix was reverted. Opus's warning on the proposal case and its nit on empty taken records name code the revert removed, and they go to the Construction values plan as must-answer items.

## Open work

- F1, the line's values after a rejected Enter at its start, as a narrower step of the [Construction values](2026-10-23-construction-values.md) plan, reviewed by that plan's panel before any code. owner: this run's lead. stop: that plan's build.
- Suggesting, previews and exports under a schema that makes element ids, the rest of task t_f821f679. owner: this run's lead. stop: the same build.
- S7 of the [cut-join storage](2026-10-21-cut-join-storage.md) table with `ElementIdPlugin`. owner: this run's lead. stop: the same build.
- Values a split drops that the halves compare, such as a list's start number, stay lost when an Enter at a line's start is rejected. A mid-line Enter, then an Enter on its right half meeting a value equal to the line's, stores `abcd` with `ref` deciding both together and two lines deciding the later Enter first, at `be4cac3bd5`. Both need a rule under which giving a compared value back keeps every decision order equal. owner: one suggested task this run offers at its close. stop: none in this plan.
- Rejecting a suggested Enter at a slotted title's start returns `invalid` at `be4cac3bd5`. owner: a suggested task this run offers at its close. stop: none in this plan.
