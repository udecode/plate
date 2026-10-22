---
review_scopes: [authored, suggestions]
review_basis: [2026-10-08-authored-review]
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [docs/plans/2026-10-08-authored-review.md, docs/plans/2026-10-10-authored-values.md, docs/plans/2026-10-10-authored-values.decisions.tsv, packages/plitejs/src/authored/tree/cuts.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/proof-plugin.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/src/core/change/document-index.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/representation.ts, packages/plitejs/src/core/content.ts, packages/platejs/src/features/table/lib/internal/grid.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.ts]
---

# Authored: change-driven cut relink

Status: executed: closed 2026-10-11 after the decision-trail review; the parent plan's Phase 2 waits on the table, list, construction-value and fill plans
Playbook: plan

The owner asked, after the values iteration's build panel stopped converging, "how is it going? did you redesign things from first principles - would redesigning more things help?", and then "ok go, we want the long term route bestly redesigned from first principles to win this". The lead proposed moving three jobs of `docs/plans/2026-10-10-authored-values.md` to their owners: the cut relink, plugin structure beside struck nodes, and element fill. The architect arena and two plan panel rounds tested each proposal against today's code. What held after three plan rounds: the review tree would fill an emptied element through Editing's own completion, and the cut relink would keep its whole-transaction meaning but find the changed regions from the transaction's own change instead of scanning root arrays. The build landed the relink. The fill went through two approaches and three build panel rounds. What Editing leaves depends on the gesture, which the review tree does not record, and the second approach made decisions depend on their order. So the fill went back to the values iteration's code, and it gets its own plan. Table structure beside suggestions, lists, and property values a fill constructs (generated ids and validators) each turned out to need their own design, and the parent plan's cutover waits for them. This iteration continues `docs/plans/2026-10-08-authored-review.md`, whose Phase 2 cutover waits for it.

## Brief

### What will change?

For "ok go, we want the long term route bestly redesigned from first principles to win this": tracking split link pieces stops scanning the whole document on every edit. Filling emptied elements stays as before and gets its own plan.

### What could go wrong?

Emptied elements still fill the old way, which doesn't always match normal editing. Tables, lists, preview ids and that fill each get their own plan before this ships.

## Teach

The review tree keeps suggestions inside the document. When a suggestion empties an element, something must fill it, and when an edit deletes a piece of a split link, the piece's records must move to the pieces that stay.

Today three fillers fill an emptied element three different ways. To find deleted link pieces, the code that moves their records compares the whole document before and after every edit.

Now that code looks only at what the edit changed, plus any root the edit deleted. The fillers stay as they were. What normal editing leaves depends on whether text or whole blocks were removed, and when the build's fill followed that, accepting two suggestions in a different order gave a different document.

## What other editors do

Read from local checkouts on 2026-10-11: `prosemirror-model` 6264de0, `prosemirror-suggest-changes` 653fba7; Word from the OOXML format. None was run.

| Editor | Filling an emptied node | Ids on a node a suggestion creates |
| --- | --- | --- |
| ProseMirror | `NodeType.createAndFill` fills required content until the node is valid and leaves a child whose content allows nothing empty (`prosemirror-model/src/schema.ts:172-184`, `content.ts:79-90`) | Node attributes come from the schema's defaults when the node is created; the schema has no generator hook |
| prosemirror-suggest-changes | Uses the schema's fill | Same as ProseMirror |
| Word (OOXML) | n/a | Paragraph ids (`w14:paraId`) are written when the document is saved |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Reverted at the build panel's cap: one function built from Editing's completion, which the recorder and the resolver would both call | Plite | `plitejs` core (`core/representation.ts`), called from `plitejs/authored` | Its own plan, after three build panel rounds showed the fill needs the gesture |
| The cut relink's changed regions read from the transaction's change and its deleted roots, with a partner search seeded at each removed range that reaches every root | Plite | `plitejs/authored` (`authored/tree/cuts.ts`, `proof-plugin.ts`), with the recorder slot's input in `core/document-recorder.ts` | The change already says where the transaction changed the document |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Rejecting an Enter inside a link after Editing deleted a piece | Same result; the relink finds the piece from the change | unproven; package tests, and the Chromium proof route's link test, five warm runs |

## Main changes

No public call or return value changes. `nodes.isContent` keeps reading a node's own strike, and `schema.create` keeps filling to each element's minimum.

- The fill stays as the values iteration built it: `defaultChildOf` and `filledElement` in the proof plugin, and the resolver's two-branch fill. The build replaced them with one function built from Editing's completion, then reverted it at the build panel's cap, as R1 records; construction keeps calling the schema's generators and validators, so previews still allocate ids.
- `relinkCuts(change, before, after, indexOf)` keeps its before and after meaning but takes its removed and current cut holders from the elements whose opening token lies in a range the transaction changed. The recorded path passes the recorder's composed change; the decision path passes the slot's change. Both read their indexes through `DocumentIndex.fromValue`, whose identity cache returns the index the transaction already built. Each root the change deletes counts as removed in full, since a lifecycle-only deletion shows no range. The search for a lost side's partner starts at the child boundary where that side's own range lands in the after document, not at the deepest region. It reads the two sides of that boundary one node at a time in turn, so a large neighbour on one side cannot delay a partner on the other at the same level, and it reaches every other root before it gives up. A start inside a long container still reads the rest of that container before a partner outside it, which the work law does not yet bound. A lost side from a deleted root has no range in the after document, so its search reads every root from the start. `changedHolders`' identity scan of root arrays goes.

## Comparison

| Target | Fill | Cut relink | Plugin structure | Verdict |
| --- | --- | --- | --- | --- |
| Control: today's tree | Three fillers; the resolver adds a text Editing would not, and its fill can run a property generator, so previews allocate ids (`ElementIdPlugin.ts:63` generates every element id) | Root identity scan; walks whole nested containers when a changed span changes length; searches only the changed roots (round 2, astra and sol) | Own-strike checks per plugin; table borders and header inference read stored rows | rejected |
| Settled target, after plan panel round 3 | Editing's per-parent completion, extracted and shared; construction values as today | The same before and after semantics, regions from the change and deleted roots, searches seeded per removed range and across roots | Unchanged here; tables and lists get their own plans | picked; the fill reverted at the build panel's cap |
| Round 2's target | Editing's completion with site context, generator-free in the resolver, ids made at commit | Regions from the change, partner search across roots | Unchanged | replaced in round 3 |
| Round 1's target | Editing's fill plus a text rule | Today's relink, unchanged | A content grid for the whole table class | replaced in round 2 |
| Arena pick: opus runner (cand-2) with grafts | A leaf rule in a compiled fill plan | Moves where removals happen, a search bounded to linked blocks, a one-pass apply | A survival-based content check for every plugin | replaced in round 1 |

The opus cross-judge scored the arena's candidates on blinded copies (`redesign/architect/judge.md`): cand-2 29.75, astra 28.75, sol 28. Plan panel round 1 (`redesign/panel-plan-1/`) found the pick's unique parts wrong and replaced most of it. Round 2 (`redesign/panel-plan-2/`) found the text rule still wrong, the site context missing, the generator narrowing unsound, and every table change exposing a new coordinate or membership defect: resize handles that measure DOM rows, planners that skip struck rows, repair that invents cells, and borders routed around a struck row that accepting keeps. The table class needs its own design, so the plan kept the two parts the rounds confirmed. Round 3 (`redesign/panel-plan-3/`) found that previews without generated values fail the schema's own validation, that commit-time generation still makes generated content depend on decision order, and that construction also runs property validators, so owning construction values needs a design of its own; it also found the relink's range discovery misses deleted roots and named the inputs per path.

## Challenge delta

Replaced after plan panel round 1: the arena pick's cut moves, survival content check and leaf rule, as the round-1 rows record.

Narrowed after round 2 (`redesign/panel-plan-2/seat-*.md`):

- The fill drops its text rule and takes the site's ancestors and root (astra, opus, sol).
- The resolver's construction runs no generator, and the decision's commit materializes generated properties once (astra, opus, sol); `ElementIdPlugin` declares one on every element (opus).
- The relink takes its regions from the change and searches every root for a missing partner (astra, sol).
- Moved out: the table structure phase, to its own plan with round 2's table findings as its must-answer list (opus, sol, astra).
- Added: the values iteration's two failing speed lines rerun in this plan's keep gate (astra, sol).

Settled at the cap after round 3 (`redesign/panel-plan-3/seat-*.md`):

- Moved out: generator-free construction and commit-time materialization (R2), because previews without generated values fail schema validation (astra, opus, sol), commit-time generation makes generated content depend on decision order (astra, sol), and construction also runs property validators (sol, astra). Construction values owned per site become their own plan.
- Improved: the fill is Editing's per-parent completion extracted and shared, not a second function beside it (opus).
- Improved: the relink counts each deleted root as a removed range (astra, sol, opus), names its inputs per path (opus, sol) and seeds each partner search at its own removed range (opus).
- Narrowed: a lost side whose partner left in an earlier transaction still searches outward, so the relink's work law holds only when the partner is present or in the change (astra, sol); an endpoint lookup is Open work.
- Added: the parent plan's Phase 2 keep waits on the table, list and construction-value plans' builds (astra, opus, sol).

Build panel (`redesign/panel-build-1/` to `redesign/panel-build-3/`):

- Round 1: the fill's empty text ignored the content's grammar (sol, astra), applied by completing first; the search seeded inside the next node (sol, astra), applied; the work law rested on an unasserted index cache (opus), applied with an encode counter; the oracle file was removed after its runs (opus).
- Round 2: completing first broke rejected typing in mixed content (astra, opus), and an inline default overflowed (sol), so the fill's approach was replaced once, by a fill told what went; the search alternates the two sides (astra, sol, opus); the encode counter counts tokens (astra, sol, opus).
- Round 3, the cap: the replacement made mixed-content decisions depend on their order and kept the inline overflow (astra, sol, opus), so the fill left the loop and reverted to the values iteration's code. Two fill gaps the frozen base also has stay open under the fill plan, and the cross-level search bound is deferred.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Element fill | Recorder: `defaultChildOf` and `filledElement`; resolver: a text-or-completion branch | Editing's completion, told the gesture | `plitejs` core, used by `plitejs/authored` | One owner, and the review tree fills as Editing does | none here | R1, reverted | A fill that depends on what the last decision removed breaks commutation | defer |
| Construction values in resolution | Generators and validators run, previews allocate ids | Unchanged here; values owned per construction site in their own plan | `plitejs` core | Three rounds showed no commit-time or generator-free variant keeps reads valid and decisions exact | none here | none | Previews keep allocating ids | defer |
| Cut relink regions | Root identity scan, changed roots only | Change ranges and deleted roots, per-path inputs, seeded searches across roots | `plitejs/authored` | Work grows with the change, not the document, while a partner is present at the search start's level; a start inside a long container and a deleted root's lost sides still read further (Open work) | Proof plugin | R4, R5 | A removal the change does not show | rearchitect |
| Table structure | Stored rows and cells | Its own plan | `platejs/table` | Two rounds found a coordinate or membership defect in each table change | none here | none | Border and header defects stay | defer |
| Change apply | Two passes for a mixed change | Unchanged here | `plitejs` core | The per-pass root copy is the core index's scaling owner | none | none | none | defer |

## Failures, blast radius and rollback

Three realistic failures:

1. The shared fill differs from what Editing leaves for some content shape, so a rejection no longer restores the start. R1 compared the fill with Editing's for each shape the panels named; build panel round 3 found the second approach broke commutation, and the fill reverted.
2. The extracted completion changes the transaction pass's own output. R1 runs the plitejs and platejs suites before and after the extraction, and the transaction pass's existing tests must not change.
3. A removal the change does not show escapes the relink. R4's oracle law runs today's relink, with the cross-root search and the deleted-root fix added, beside the new one over the cut tests' and recording laws' histories, migrations, cross-root moves and root deletions included.

Phase 1's extraction reaches every editor's transaction pass with no change in output; the rest reaches only editors with the review tree installed. Each phase reverts as one unit.

## Steps

The Build playbook executes this plan, after the plan panel. Execution authority is the owner's "ok go, we want the long term route bestly redesigned from first principles to win this" on 2026-10-11, which adds no commit authority; the lead writes the code in the `next` checkout, and subagents map and review. Each base control runs in a detached worktree of the frozen base the build records first.

#### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Base controls fail today for every behavior step | yes | row "Base controls for R1 and R4"; `redesign/base/base-controls-a2.log` |
| Benchmark: interleaved base-against-candidate packets after each phase, and the values iteration's two failing lines | yes | rows "R3 packets", "R5 packets on the final tree" and "the values iteration's typing and document lines, five alternating packets per side on a quiet host"; `docs/plans/artifacts/2026-10-08-authored-review/redesign/bench/evaluate-rec-r5d.log`, `docs/plans/artifacts/2026-10-08-authored-review/redesign/bench/s9-values/evaluate-focus-f2.log` |
| Chromium proof route, five warm runs on the final bytes | yes | row "Chromium five warm runs on the final bytes"; `docs/plans/artifacts/2026-10-08-authored-review/redesign/close/chromium-final-run-5.log` |
| Build panel on this iteration's diff | yes | three rounds settled at the cap, rows from the build panel's first `seats` row; `docs/plans/artifacts/2026-10-08-authored-review/redesign/panel-build-3/seat-sol.md` |
| Writing passes per panel round | yes | the `writing` rows after each round; `docs/plans/artifacts/2026-10-08-authored-review/redesign/comment-sicko/round2-fixes.md` |
| `oxlint --type-aware` on the task's files before each panel freeze | yes | `docs/plans/artifacts/2026-10-08-authored-review/redesign/build/oxlint-pre-panel-a3.log` and the lint fix's `docs/plans/artifacts/2026-10-08-authored-review/redesign/build/lint-task-a1.log` |
| `pnpm check` steps the edits reach, attributed in detached worktrees | yes | row "pnpm check steps this iteration's edits reach"; `docs/plans/artifacts/2026-10-08-authored-review/redesign/close/isolated-summary.txt` |
| Changeset for `plitejs` | no | skip: the cut relink is new in the unreleased batch, and the unreleased `.changeset/plite-authored-values.md` covers its behavior (row "built: skip: no new changeset for R4") |
| Decision-trail review | yes | row "seats gpt-6.1-sol @xhigh" under phase trail; `docs/plans/artifacts/2026-10-08-authored-review/redesign/trail/seat-sol.md` |
| `best-api repair` | no | skip: no public call or return value changes |
| `plate-docs` | no | skip: no public docs page describes the review tree's fill or relink |

Phase 1: one pure fill owner.

- [x] R1. Approved: Extract the transaction pass's per-parent completion from `core/representation.ts` into one function, and call it from the transaction pass, the recorder's default child and the resolver's emptied-element fill; the recorder carries the element's insert and delete marks onto what it adds. Delete `defaultChildOf`, `filledElement`, the resolver's two-branch fill and the adapter's separate `canonicalizeElementChildren` path. Proof: package tests that fail today, each comparing with an Editing editor that removes every child with `nodes.remove`: rejecting an insertion into a legal empty non-inline text element restores it empty (sol's case); the recorder's default child for a struck group whose rows a suggestion all withdraws; an element whose child takes a parent-scoped static default (astra's case); a suggested vertical merge on the real table plugin accepting to the table Editing gives, with an empty covered row. The values iteration's default-child tests pass, with their assertion moved to Editing's fill and their law restated from "every element holds a child" to "an emptied element takes Editing's fill"; the transaction pass's existing tests pass unchanged. Built, then reverted at build panel round 3's cap: the build first shared one fill built from Editing's completion, then replaced its approach in round 2 with a fill told what went, inline content or blocks. Every round-3 critical hit that replacement, and decisions on mixed content stopped commuting, so the panel rule reverted the fill to the values iteration's code. Its goal moves to its own plan under Open work. Proof: skip: reverted at the build panel's cap (rows "built: reverted at the cap" and build panel round 3's criticals).
- [x] R2. Removed by plan panel round 3: generator-free construction made previews schema-invalid and left generated content order-dependent. Construction values owned per site are Open work. Proof: skip: the step leaves this plan.
- [x] R3. Keep or revert Phase 1, after interleaved base-against-candidate packets of the values iteration's S9 recorder and S3 document rows show the candidate no worse than the base. Proof: a decision-log row citing R1 and the packets' evaluator logs. Built: kept on R3's packets (rows "R3 packets" and "R3: keep Phase 1"; `redesign/bench/evaluate-rec-a1.log`), then superseded when the fill reverted at the build panel's cap.

Phase 2: the relink reads the change.

- [x] R4. Approved: Take the relink's removed and current cut holders from the transaction's change, with paired inputs per path (the recorder's composed change, its indexed after and the before indexes in the recorded path; the slot's change and the builder's after index in the decision path); count each deleted root as one removed range; seed each lost side's partner search at its own removed range mapped into the after document, then every other root; delete `changedHolders`' identity scan. Proof: every test in `authored-tree-cuts.test.ts` passes; an oracle law runs today's relink, with the cross-root search and the deleted-root fix added, beside the new one over the recording laws' and the cut tests' histories on three seeds, with a migration that removes a piece, a remove-and-insert across two roots, a lifecycle-only deletion of a root holding a piece, and a Suggesting deletion of another author's whole middle piece added, and its planted control, an `end` side moved right, fails it; astra's round-2 history and the round-3 root deletion each reject to one link; `authored-tree-work.test.ts` counts nodes visited for sol's nested case and for an edit inside a quote at the start plus a cut-piece removal at the end, and both counts stay the same at 100 and 2,000 paragraphs. Built: Take the relink's removed and current cut holders from the transaction's change: the recorder's composed change in the recorded path and the slot's change in the decision path, with indexes from `DocumentIndex.fromValue`'s cache; count each deleted root as removed in full; seed each lost side's partner search at its own range in the after document, then every other root; delete `changedHolders`' identity scan. Proof: every test in `authored-tree-cuts.test.ts` passes. An oracle law ran the identity-scan relink, with its search widened to every root, beside the new one. The build kept its runs as proof and removed the file after build panel round 1, because a permanent copy of the deleted relink would need updating with every later relink change. It replayed the cut tests' and the recording laws' histories on three seeds, plus a migration that removes a piece and a Suggesting deletion of another author's middle piece; the cut tests carry the remove-and-insert across two roots and a lifecycle-only deletion of a root holding a piece. Its planted control, an `end` side moved right, failed it. Astra's round-2 history and the round-3 root deletion each reject to one link; the first fails at base, and a mutant that drops deleted roots fails the second. `authored-tree-work.test.ts` counts marks read and tokens encoded for sol's nested case, for an edit inside a quote at the start plus a cut-piece removal after it, and for removals just before and just after a long quote, and every count stays the same at 100 and 2,000 quoted paragraphs.
- [x] R5. Speed, through `benchmark`: interleaved base-against-candidate packets of the values iteration's S9 recorder and S3 document rows on the final tree, three per side under the frozen load rule, with the planted scan; the candidate keeps when no line is worse than the base, and the absolute budget failures stay on the values iteration's rows. Proof: the evaluator logs. Built: the final tree passes every line, with fewer mark reads on every recorder row (row "R5 packets on the final tree"; `redesign/bench/evaluate-rec-r5d.log`, `redesign/bench/evaluate-doc-r5d.log`).
- [x] R6. Keep or revert Phase 2, then return to the parent plan's Phase 2, whose keep waits on the table, list and construction-value plans' builds. Proof: a decision-log row citing R4 and R5. Built: Phase 2 kept (row "R6: keep Phase 2"; `redesign/bench/evaluate-rec-r5d.log`), and the parent plan's Phase 2 gate now also waits on the fill plan.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What goes in an element a suggestion or a decision empties | For now, the old fill. An element that holds text gets one empty text, and anything else gets its schema's default child, filled down to a text. Matching normal editing gets its own plan (look) | Keep the build's new fill, even though its result depends on the order you decide suggestions in | gesture fill | small |
| Rejecting text someone added to an element that had no text at all | The element comes back with one empty text. The review tree can't tell it from a normal empty paragraph, and the paragraph is the common case (look) | Have the recorder remember the element had no text, so rejecting restores it exactly | exact empty | small |
| Where this subject's page lives | A new page, https://claude.ai/artifact/LANDD6RaVxZxMeXQGsUpYp, because the old one, https://claude.ai/artifact/8UUrvKZCpNKJVHPigcvcHu, belongs to another account and this session cannot publish to it (look) | Go back to the old page once its owner shares edit access | old page | small |
| Ids and other made-up values on an element a fill builds | Unchanged for now: previews make new ones, as today; their own plan gives each one a fixed owner before the cutover ships (look) | Hold the cutover until that plan lands | values here | small |
| Records of a split link when a piece goes | Keep today's meaning, read from the edit's own change (look) | Have the recorder move them as it removes pieces | move at removal | small |
| Tables beside deleted rows and cells | Their own plan, built before the parent's cutover ships, starting from this panel's findings (look) | Fix borders and headers here | tables here | big |
| Lists beside crossed-out items | Their own plan, once another session's list work lands | Change the list files in this plan | lists here | small |

## Open work

- The fill: an element a suggestion or a decision empties should get what normal editing leaves. The build tried two approaches and reverted at the build panel's cap (the decision log's rows from the build panel's first `seats` row). What its plan must answer: what normal editing leaves depends on the gesture, since deleted characters keep an empty text while a removed text node or block completes to the minimum, and the review tree records neither; a fill that reads what the last decision removed makes decisions depend on their order; completion counts children before inline spacers, so an inline default with a bounded maximum overflows, at the frozen base too; and the round-1 and plan round 2 cases, a required prefix with no room for text, a mixed content's element default and a scoped static default on a built child. owner: zbeyens, in its own plan, which the parent plan's Phase 2 keep waits on. stop: its build fills as Editing does for every case named here with decisions that commute, or the owner keeps the values iteration's fill for the cutover.
- The partner search alternates the two sides of its start only within one level, so a start inside a long container reads the rest of that container before a partner outside it (build panel round 3, opus). owner: zbeyens, through the parent plan's Phase 2 benchmark item. stop: the search reads in document order across levels, or that item keeps it with a measured budget.
- Tables beside suggestions: border edges, header inference, cell info, selection landing, resize handles, planners and repair, which read stored rows today and which round 2 showed need one decision on membership (own strike or what accepting keeps) and one on coordinates (stored rows, DOM rows or content rows) before any change (`redesign/panel-plan-2/seat-*.md`). owner: zbeyens, in its own plan, which the parent plan's Phase 2 keep waits on. stop: its build agrees with Editing on every case this panel named, or the owner drops tables from the cutover.
- Lists: list identity, run siblings and numbering beside crossed-out items read content neighbours through the list index, with a flat read count beside a long struck run (`values/close/list-walk-a1.log`). owner: zbeyens, in its own plan, which starts once the list-identity work in progress is committed on `next` and which the parent plan's Phase 2 keep waits on. stop: its build shows list identity and numbering agree with Editing beside struck items with flat read counts, or the owner drops lists from the cutover.
- Construction values: a fill that builds an element runs the schema's property generators and validators inside the resolver, so previews allocate ids, a blocked decision can run them, and generated content can depend on decision order (plan panel rounds 2 and 3; `redesign/probes/p11-commit-id-a1.log` shows a commit refuses a value missing a generated id). owner: zbeyens, in its own plan, which the parent plan's Phase 2 keep waits on. stop: its build keeps every read schema-valid, runs no application callback inside resolution and gives every admissible order the same document, or the owner accepts the behavior for the cutover.
- A lost cut side whose partner left in an earlier transaction makes the partner search read outward until it gives up, so that edit's work grows with the document (round 3, astra and sol). owner: zbeyens, through the parent plan's Phase 2 benchmark item. stop: a lookup keyed by cut and side answers absence without a search, or that item keeps it with a measured budget.
- The fill uses the emptied element's ancestry at the point the resolver fills it, which an unwrap or hoist decided in the same batch can change afterwards (round 3, astra and sol). owner: zbeyens, through the parent plan's Phase 2. stop: the completion takes the final resolved ancestry, or a probe shows the combination keeps the projection valid.
- A container left below its minimum with some children is dissolved and its children hoisted, while one left with none is filled, so the resolver has two answers where Editing fills both (round 3, opus). owner: zbeyens, through the parent plan's Phase 2. stop: the below-minimum branch uses the shared completion, or a Defaults row keeps it.
- The canonical pass after the recorder can remove a cut holder, such as a link Editing turns into a block, and its cuts then vanish (`redesign/panel-plan-1/repro/finalize-gap-a1.log`). owner: zbeyens, through the parent plan's Phase 2 cutover of the recorder slot. stop: the relink sees the committed document, or the canonical pass keeps cut holders.
- Each index pass copies the root's child array, so a removal at 20,000 blocks costs 5.7 ms and a mixed change pays it twice (`redesign/probes/p1-fold-cost-a2.log`). owner: zbeyens, through the parent plan's Phase 2 benchmark item. stop: an index apply's cost stops growing with the root's child count, or that item keeps it with a measured budget.
- The values iteration's partition law compares structure, tags and sums, not exact widths, so decision orders can still give different widths (round 2, sol). owner: zbeyens, through the values iteration's Defaults row "exact mixed values". stop: the owner says that row's word, or the parent plan's Phase 2 closes with the row standing.
- A cut representation in which each piece carries its family's cuts to its left, so removing a piece needs no move (round 1, opus). owner: zbeyens, through the parent plan's Phase 2. stop: a probe shows it keeps the cut tests and the saved split-dropped properties, or it is dropped.

- A lost cut side from a root the transaction deletes searches every root from its start, so that edit's work grows with the document even when the partner is present (build panel round 1, opus). owner: zbeyens, through the parent plan's Phase 2 benchmark item. stop: a deleted root's lost sides seed from the change's surviving ranges or an endpoint lookup, or that item keeps it with a measured budget.
- `keepsOnSplit` still asks the schema about one key by faking a value (from `docs/plans/2026-10-10-authored-values.md`). owner: zbeyens, through the parent plan's Phase 2 cutover. stop: the schema answers a per-key split question from explicit ancestors.

## Claims this plan corrects

- The lead told the owner the review tree would fill an emptied element exactly as normal editing does. What normal editing leaves depends on the gesture, which the review tree does not record, and the build's fill that read what the last decision removed made decisions depend on their order, so the fill reverted at the build panel's cap.
- The lead told the owner the redesign would have the recorder hand the relink the fragments it removed. Round 1 showed a recorder-side collector misses migrations and the canonical pass; the relink keeps its before and after meaning and reads its regions from the change instead.
- The lead told the owner plugins would build structure from a content view mapped back to real paths. Rounds 1 and 2 showed no filter reproduces accepting and each table change needs its own membership and coordinate decisions, so tables and lists get their own plans.
- The lead told the owner one schema-owned fill to a leaf would serve every caller. Round 1 showed the leaf rule breaks Plate's tables, so the shared fill is Editing's, which fills to each element's minimum.
- R1's step said a suggested vertical merge on the real table plugin fails today. At the frozen base it accepts to Editing's table with an empty covered row (`redesign/build/r1-base-control-a1.log`), because today's resolver fills an element whose content allows no text only to its minimum. The invented cell belonged to round 1's leaf rule, so the build cut that test.
- R1's step asked that rejecting an insertion into a legal empty text element restore it with no text (sol's case). The first build did that by dropping the resolver's text rule, and rejecting typing into an ordinary empty paragraph then left it with no text where Editing's undo and the base leave one empty text (`redesign/build/r1-empty-paragraph-candidate-a1.log`). The review tree loses whether an element held an empty text, so the build keeps the paragraph case, and the Defaults row "exact empty" records sol's case.
- The lead told the owner previews would stop making new ids. Round 3 showed every generator-free preview fails the schema's own validation, so previews keep making ids until the construction-value plan lands.
- The lead said no production schema declares a property generator. `ElementIdPlugin` declares one on every element (round 2, opus); the earlier search used a pathspec that matched nothing.
- The lead said a decision rebuilds each root's index from scratch with `DocumentIndex.fromValue` on every decision. The judge found it cached by identity (`document-index.ts:514-520`); a decision builds the index once per new value.
- The lead called the older page https://claude.ai/artifact/HmRjqgC5E9htfk2Kn5psAB the frozen 10-08 copy. That rests on the repository's records of when it was published and that another account owns it; its contents were not read, so the description is inferred.

## Close

### Reversals and deviations

- The approved R1 step extracts Editing's per-parent completion and shares it between the recorder and the resolver. The build shared one fill, then build panel round 2 replaced its approach with a fill told whether inline content or blocks went. Round 3 found that replacement made decisions on mixed content depend on their order, so the lead reverted the fill to the values iteration's code at the cap, as the panel rule requires (rows "built: reverted at the cap" and round 3's criticals). The fill moves to its own plan under Open work.
- R3 kept Phase 1 on its packets; the revert supersedes that keep (row "superseded: R3's keep of Phase 1").
- R1's build kept one empty text for an element that holds text, against the plan's text, because rejecting typing into an empty paragraph otherwise lost the text Editing's undo restores (row "built: reversal"); sol's legal-empty case stays a Defaults row ("exact empty"), which the restored values fill also meets. The planned vertical-merge test passed at base and was cut (row "built: cut").
- R4 reads both paths' indexes through `DocumentIndex.fromValue`'s cache instead of a new recorder input (row "built: deviation"). The oracle law's file was removed after build panel round 1 and re-run from a saved copy on the final tree. Round 2 made the partner search alternate the two sides of its start, and round 3's cross-level bound is deferred with R4's claim narrowed.
- No new changeset for R4, because the cut relink is new in the unreleased batch (row "built: skip: no new changeset for R4").

### What landed

- `relinkCuts(change, before, after, indexOf)` in `packages/plitejs/src/authored/tree/cuts.ts` takes its removed and current cut holders from the elements whose opening token lies in a range the transaction changed, counts each deleted root as removed in full, and seeds each lost side's partner search at its own range's child boundary, reading both sides in turn and then every other root. The identity scan of root arrays is gone, and both paths in `proof-plugin.ts` pass their change.
- Tests: two cut cases, a partner in another root and a lifecycle-only root deletion; work cases that count mark reads and encoded tokens for sol's nested case, an edit at a quote's start with a cut-piece removal after it, and removals just before and just after a long quote; and a resolve case that rejecting typing into an empty paragraph restores it as Editing's undo does.
- The fill, `record.ts`, `resolve.ts` and `representation.ts` are as the values iteration left them.

### Proof

- Base controls: the two quote work cases and the cross-root case fail at the frozen base, at 8,012 against 412 and 4,023 against 223 mark reads and two links where one should come back (`redesign/build/r4-base-control-a1.log`); the root-deletion case passes at base and fails when the relink drops deleted roots.
- Oracle law: the identity-scan relink, widened to every root, beside the new one over the cut tests' and recording laws' histories, passes 26 of 26 on three seeds on the final tree, and its planted control, an `end` side moved right, fails it (`redesign/build/final-oracle-seed1-a1.log` to `-seed3-a1.log`, `redesign/build/final-oracle-planted-a1.log`).
- Mutants on round 3's tree: reading one side of the start before the other, a before index that misses the cache, dropping deleted roots and dropping other roots each fail their test (`redesign/panel-build-3/repro/mutate/`, `redesign/build/mutate/`).
- R5 on the final tree passes every line of the frozen rule against the plan's base, with fewer mark reads on every recorder row (`redesign/bench/evaluate-rec-r5d.log`, `redesign/bench/evaluate-doc-r5d.log`).
- The values iteration's two failing speed lines pass on the final tree against the values base, in five alternating packets per side on a quiet host: Suggesting typing scaling at 26.55x against 37.73x, and a top rejection at 20,000 blocks at 26.88 ms against 27.95 (`redesign/bench/s9-values/evaluate-focus-f2.log`).
- The plitejs suite passes. The platejs suite failed only `migrateListIdentity`'s 500-document case, on its 5 s timeout at load 10.9; its partition passes 97 of 97 on the final tree at load 3.6, and the spec's imports never reach `plitejs/authored` (`redesign/build/final-platejs-suite-a1.log`, `redesign/close/final-platejs-migrations-a1.log`).
- `pnpm check`, isolated: no step fails only on the final tree, and the steps that fail on both fail on identical cases outside this iteration's files (`redesign/close/isolated-summary.txt`).
- Chromium: the authored review spec passes 21 of 21 in five warm runs without retries, against the proof server serving this checkout's source after the last code edit (`redesign/close/chromium-final-run-1.log` to `-run-5.log`).

### Proof limits

- R5's rows outside the typing and document rows ran three packets per side, fewer than the benchmark checklist's five; the typing and document rows reran with five.
- The bold toggle at 5,000 and 20,000 blocks and the three-key bytes line still fail the values evaluator, as the values iteration accepted.
- The partner search bounds its work only at its start's level, and a lost side from a deleted root searches every root from the start (Open work).
- Native proof ran in Chromium only.

### Counts

Seventeen items: twelve done (R3, R4, R5, R6, and the base controls, benchmark, Chromium, build panel, writing passes, typed lint, `pnpm check` and decision-trail review gates), five skipped (R1, reverted at the cap; R2, removed by the plan panel; the changeset; `best-api repair`; `plate-docs`), and none partial, blocked or open. R3's keep is done but superseded by R1's revert.

### Build panel

Three rounds on the build's diff (`redesign/panel-build-1/` to `redesign/panel-build-3/`), three seats each, settled at the cap: Opus 5.5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh; the Opus seat's first round-2 run exited with no output and its second answered. Round 3's criticals against the fill were applied by its revert, or left open where the frozen base has the same gap: an inline default with a bounded maximum overflows, and the fill cannot tell deleted characters from a removed text node. The Challenge delta's Build panel list has each round.

### Decision-trail review

Reviewed by gpt-6.1-sol @xhigh, on a snapshot of the plan, its log and the authored files (`docs/plans/artifacts/2026-10-08-authored-review/redesign/trail/seat-sol.md`). Nine flags, no critical, each settled before reflect (row "the trail review's flags"):

- The values rerun's scaling pass divided by a slow 100-block median. A five-packet rerun on a quiet host now passes every typing and document line.
- The platejs suite's timeout had no baseline. Its partition passes on the final tree on a quiet host, and the spec cannot reach the changed code.
- R5 used three packets per side, fewer than the checklist's five. The typing and document rows reran with five, and the Close states the rest as a limit.
- The test-order fix changed two things at once. A control with fresh pieces and identical ids passes, so the ids were the cause.
- This Close first counted the trail review as done before it ran, and showed no partial while a partial row stood. The counts above follow the review and the reruns.
- The description of the older page https://claude.ai/artifact/HmRjqgC5E9htfk2Kn5psAB was inferred, as the plan's claims already say.
- The changeset skip's baseline: `.changeset/pre.json` ships seven changesets, not `plite-authored-values`.
- The decision ledger's work bound now names the start's level.
- Narration stayed high after the owner's "Wow 1h30 running wtf"; reflect takes it up.

### Reflect

One opus reviewer applied the judgment, tooling and divergent lenses to this iteration's transcript (`redesign/reflect/reviewer.md`); the lead synthesized. It found one slip: build panel round 2 replaced the fill's approach without the `verdict` run the Build playbook asks for (row "built: slip: build panel round 2 replaced the fill's approach without running verdict first").

- Applied without waiting: none. No finding fixes a helper that refuses a case its own rule allows, or rewords a rule with no net words.
- Built: none. Two findings repeat earlier reflects, rereading rule files after a compaction and freeze path lists. Both concern shared pstack helpers whose mechanisms partly exist (`reread.mjs` and the compaction hook, `freeze.mjs`'s refusal), so they go to the shared source through sync-pstack.
- Backlog, owner: zbeyens, stop: the owner takes or drops each. A deviation that swaps the approved mechanism gets its own label that forces review, and a plan that promises "equals X" calls X's own path. A claim that code matches a reference behavior compares against it over generated inputs, not hand-picked shapes. `decisions-check.mjs` refuses a replacement row without a `verdict` row. A mechanism still drawing criticals at the plan panel's cap moves to its own plan before the build. A hook warns when `git grep` omits `--untracked` in this repository, whose new source is often untracked. A helper joins reflect's lens prompts. `cross.mjs` shows stdout's tail when stderr is empty, and `mutate.mjs` takes `--only`. The verify command notes gain Bun's `mock.module` process isolation, the `ROOT`-parameterized probe pattern, the lifecycle-only root deletion, and recovering a test's pre-edit copy from the index. Keep gates and final speed runs go after the last diff round. The benchmark method's packet minimum matches its checklist's five.
- Rejected: keeping an oracle against deleted code in the run directory, already covered by the Tests rule's cut of duplicate tests and done in this run; editing through Edit after a whole-function read instead of swap scripts, already covered by the user's instructions.

Model: claude-opus-5-5 at xhigh effort ran the plan.

### Requirements

- The owner's two asks, quoted in the lead paragraph.
- Decisions commute over admissible orders, rejecting everything gives the document before, and accepting everything gives what Editing gives (the parent plan's Main changes; the values iteration's laws).
- Per-keystroke work stays bounded as the document grows (`CODING_STANDARDS.md`, enforced by `packages/plitejs/test/authored-tree-work.test.ts`).
- Plite owns substrate law and Plate owns plugin structure; a view never becomes a writable authority (`VISION.md`, `docs/vision/common.md` Boundary Law).

### Probes

Each ran on the working tree on 2026-10-11 (`redesign/probes/`).

- p1 (`p1-fold-cost-a2.log`): at 20,000 blocks, removing a link piece applies in 5.7 ms, the removal with two cut adds in one change in 8.5 ms, and the removal then a separate property change in 8.1 ms; at 100 blocks, 0.03, 0.08 and 0.08 ms. Folding the moves into one change saves nothing, because the apply runs properties and replacements in two passes.
- p2 (`p2-cuts-a1.log`): Editing deletes all of the middle piece's text; the empty link keeps its cuts, and rejecting both Enters gives one link "ac".
- p3 (same log): Editing moves the far piece's block seven blocks away, then removes the middle piece; today's relink moves the cuts there, and rejecting both Enters leaves "a" and "c" apart, which a search bounded to linked blocks also gives.
- p4: no command moves a node across roots in one step (`transforms-node/move-nodes.ts` takes one root); a transaction can still remove in one root and insert in another.
- p5 (`p5-survival-a3.log`): Editing types "!" into a struck row's cell; `nodes.isContent` answers false for the row and the cell, and the proposed projection keeps the row holding "!".
- p8 (`p8-create-a1.log`): `schema.create` gives a group with an empty row, an empty row, and a three-deep chain ending in an empty element.
- p9: a `git grep` for `generate:` in package sources found nothing, but its pathspec matched no files; `ElementIdPlugin.ts:63` declares a generator on every element (round 2, opus).
- p10 (`p10-span-a1.log`): a generic Suggesting removal of a spanned row leaves the span shortened to 2 in the pending table, because the table repair runs in the same transaction, and accept-all equals Editing.
- The list probes wait: the list index, numbering and identity files are another session's uncommitted work, still moving.

### Architect

Three runners received one task (`redesign/architect/task.md`, grounding `redesign/grounding.md`, code maps `redesign/explorer/answer.md` and `answer-a2.md`) and each returned a candidate (`runner-opus.md`, `runner-astra.md`, `runner-sol.md`). The opus cross-judge read blinded copies (`cand-1.md` to `cand-3.md`, map `redesign/name-map.tsv`) against a rubric frozen before any candidate was read (`judge-rubric.md`) and verified its claims against the code (`judge.md`).

### Plan panel

Round 1 ran opus at high, astra at xhigh and sol at xhigh on frozen commit `014967603f` (`redesign/panel-plan-1/seat-*.md`). All three found the search bounded to linked blocks loses cuts once Editing moves pieces apart and back; opus and sol found the leaf rule puts an invented cell into a row that row spans cover, and sol that it breaks a maximum of zero; astra and sol found that no filter of stored children reproduces accepting's hoists and constructed rows; astra found migration steps bypass the recorder's collector, table header inference reads struck cells, and a survival check reopens corrections on struck nodes and scans whole struck subtrees on a keystroke; opus found a survival check misaligns stored spans; sol found the canonical pass after the recorder removes cut holders today too (`redesign/panel-plan-1/repro/finalize-gap-a1.log`); all three found the resolver's fill can call a property generator. The Challenge delta lists what changed; the decision log has one row per finding.

Round 2 ran the same seats on frozen commit `df46dbb918` (`redesign/panel-plan-2/seat-*.md`). All three found the shared fill's text rule differs from Editing's completion and that narrowing the generator law left the resolver impure, and opus found `ElementIdPlugin` declares a generator on every element; astra found the fill lacks the site's ancestors and root, and that today's relink misses a partner in an unchanged named root; sol found the relink walks whole nested containers when a changed span changes length; every seat found a new defect in the table phase (planners skipping struck rows, repair inventing cells, resize handles measuring DOM rows, borders routed around a struck row accepting keeps); astra and sol found the two failing speed lines missing from the gates.

Round 3, the last plan round, ran the same seats on frozen commit `68c7fdd791` (`redesign/panel-plan-3/seat-*.md`). All three found previews without generated values fail schema validation; astra and sol found commit-time generation leaves generated content order-dependent and construction still runs property validators; astra, sol and opus found range discovery misses a deleted root; astra and sol found a missing partner still makes the search read the whole document; opus and sol found the recorded path's inputs misnamed; opus found the fill was a second function beside Editing's and the search started at the deepest region; all three asked the parent's cutover to wait on the plans this one sent out. The Challenge delta's last list settles each.

### Proof limits

The probes ran single-client on the working tree. The prior-art rows come from source reading, not runs. The design is unbuilt; every outcome above is a claim the steps must prove.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `docs/plans/2026-10-08-authored-review.md`
- `docs/plans/2026-10-10-authored-values.md`
- `docs/plans/2026-10-10-authored-values.decisions.tsv`
- `packages/plitejs/src/authored/tree/record.ts`
- `packages/plitejs/src/authored/tree/resolve.ts`
- `packages/plitejs/src/authored/tree/proof-plugin.ts`
- `packages/plitejs/src/core/change/root-change.ts`
- `packages/plitejs/src/core/change/document-index.ts`
- `packages/plitejs/src/core/editor-schema.ts`
- `packages/plitejs/src/core/representation.ts`
- `packages/plitejs/src/core/content.ts`
- `packages/platejs/src/features/table/lib/internal/grid.ts`
- `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`
