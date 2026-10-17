# Yjs text with marks beside the letters

Status: waiting on your commit
Page: https://claude.ai/artifact/T8whvrugcYGuZ4Uq4k49xL
Playbook: bug-fix

## Brief

### What will change?

When two people format the same words at once, each word shows up once, and nobody's mark spreads onto words they never touched. Undo and redo keep working when someone else edits the same words.

### What could go wrong?

Rooms saved in the old layout show an error instead of opening. A rejected suggestion someone was typing into stays rejected, and only their new letters remain. Each key may cost up to a fifth more in a large document.

## Teach

The shared copy of a document lives in Yjs. Before this change, each run of text with the same marks was its own Yjs text. Marking part of a run split it, and Yjs can't move letters, so the split deleted them and wrote copies. Two people splitting the same letters at once kept both copies, so the word showed up twice.

Now a block's letters sit in one Yjs text, and each mark is a separate record that names the first and last letter it covers. Marking text only adds a record, so letters are never copied. A record covers only its own letters, so a mark can't spread when someone deletes text next to it.

History changed too. It now remembers which letters a mark covered, not where the editor cut the text. So undo and redo still hit the right letters after someone else's edit splits them differently.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Rooms saved in the old layout | They show a clear error instead of opening, and the editor refuses old suggestions that never stored their value the same way. You handed this call back. The vision already says the app moves old Yjs rooms over and the editor opens only the current layout (look) | Add a reader that converts old rooms when they load | read old rooms | big |
| Where marks are stored | A record per mark next to the letters (look) | Keep Yjs's own formatting and accept that marks can spread | yjs formatting | big |
| Splitting a paragraph | Copies the second half into a new text, as today | Keep the original letters across both halves | keep split letters | small |
| Rejecting a suggestion someone is typing into | The reject wins and only their new letters stay. This is my reading of your "pick best standard"; I did not check Google Docs. A suggestion that holds someone else's suggestion inside it stays as it was, as before | The suggestion comes back with their letters inside | bring it back | small |
| Typing inside a paragraph someone suggested deleting | The typed letters join the suggested deletion, as typing in Editing already does | They stay outside the deletion, as before | keep typing outside | small |
| Redo after a collaborator rewrote the same mark | Redo writes its mark over every letter it first covered | Redo skips the letters a collaborator rewrote | redo yields | small |
| An empty value on a mark | One stored value per mark, so the later write wins | A separate empty flag that always loses to a value | empty flag | detail |
| When the editor rereads a block | Only blocks where the schema hid a value from the other person | Every block a local edit touched | reread every block | detail |
| Plan page link | The old page no longer opened, so this plan has a new page. The old link was RT7BZsXW1MB3iVikGCdP32 and the new one is T8whvrugcYGuZ4Uq4k49xL | Keep only the old page | drop new page | detail |
| Design round length | Gave each design runner 50 minutes | The usual 30 | (none) | detail |
| Typing speed in a 10,000-block document | Accept a key that may cost 10 to 20 percent more than before, about 0.1 to 0.4 ms. Syncing and remote edits match the old layout. Other jobs kept the machine busy, so these numbers are not firm (look) | Rerun on a quiet machine before you commit | rerun bench | small |
| Typing in a very long paragraph | A key in a 10,000-letter paragraph costs about 0.7 ms with one mark run and 1.1 to 1.2 ms with 200, roughly twice the old layout, measured on a busy machine (look) | Track letters by edit instead of walking the paragraph on each key | faster long paragraphs | small |

## Main changes

- `packages/plitejs/src/yjs/core/text-runs.ts` owns every write to a Yjs text, the property codec, the reader and the point mapping. A Yjs text holds plain letters only. Each mark write is an immutable `yjs:mark:<client>.<clock>` record on that text, naming its first and last letter by Yjs identity, its value and the writer's frontier. The reader drops records another covering record causally supersedes, then picks among concurrent ones by a total order, and keeps a resolved index so a keystroke never walks the record history. The index keeps each Yjs item's letters until Yjs splits or merges that item, so a keystroke looks up only the letters it changed. Yjs formatting is never written, and the reader refuses it.
- Marks, leaf splits and leaf merges go through the compatible replacement path as record writes. `lowerTextLeafSplit`, `findTextLeafSplit`, `findCollapsedTextLeaves`, `alignTextLeaves` and `lowerCollapsedTextLeaves` are deleted, along with the per-leaf text encoders.
- After a local commit, the controller rereads each written block whose last import hid a value, and imports any difference as a history-skipped collaboration change.
- History records a mark change as character ranges with the values it wrote, over a character index that ignores where leaves are cut, and replays them through the schema. Before this, history replayed the editor's leaf-token change, which broke once a collaborator's edit re-cut the leaves. Redo marked one letter instead of the word. Undo wiped a collaborator's mark from the rest of a word. Redoing a subscript after a collaborator added superscript threw a schema error, even on plain editors. Now redo's written mark wins over an exclusive sibling, and undo never restores a mark by evicting one a collaborator wrote later. `DocumentChange.transform` and the history JSON format are unchanged.
- Authored format tags store the value they wrote, and decisions resolve each key's value from the surviving tags' writes before the schema picks among exclusive properties.
- Schema metadata moves to format 4, and format 3 rooms are refused.

## Steps

- [x] Readback after a local commit: the edit full-range acceptance case passes through undo, selection and redo. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/acceptance-a2.log`.
- [x] History replays mark changes as character ranges: a history regression test where a history-skipped change re-cuts the leaves before redo, `test/history` and the collaboration history contract pass. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/bun-all-a2.log`.
- [x] The acceptance undo and redo cases pass through history, with their selections. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/acceptance-a2.log`.
- [x] A batch that both types and marks redoes over a concurrent exclusive sibling without throwing: a second history regression case. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/bun-all-a2.log`.
- [x] Proposed values in authored format tags: the propose full-range case passes its reject from saved JSON. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/acceptance-a2.log`.
- [x] Mark records: a binding regression spec where a peer deletes a marked word while another types inside it, and where two peers bold overlapping ranges, passes in both delivery orders; attributes, schema identity and canonical replacement contracts pass. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/bun-all-a2.log`.
- [x] Split, merge, wrap, splice, selection, awareness and import on mark records: the whole `test/yjs` suite and its slow files pass, with each layout-bound expectation rewritten and named. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/bun-all-a2.log`, `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/slow-a5.log`.
- [x] All 18 acceptance cases and the authored suite pass, with the seven cases where a reject races typing inside it moved to the concurrency limits. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/acceptance-a2.log`, `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/bun-all-a2.log`.
- [x] Records visited per keystroke stay flat as history grows: a work-count case. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/slow-a5.log`.
- [x] Typecheck and lint for plitejs. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/typecheck-a2.log`, `docs/plans/artifacts/2026-10-17-yjs-block-text/proof/lint-a2.log`.
- [x] Benchmark the Yjs typing and remote-import lanes against the base, within the time budget. Accepted on a busy machine. Six paired rounds on the final code put a local edit 10 to 20 percent slower, with sync close and remote events matching the base. Proof: `docs/plans/artifacts/2026-10-17-yjs-block-text/merged-bench/bench-summary.tsv`.

## Close

Two people formatting the same words at once now see each word once. All 18 acceptance cases pass, along with the whole Bun suite (3,854 tests) and every slow file this change touches. All of this ran after merging next at 51f3a53b66 into the work. The binding keeps a block's letters in one Yjs text and stores each mark as its own record beside them. History replays marks as letter ranges, so undo and redo still hit the right letters after a collaborator re-cuts them.

Reversals and deviations. I read the owner's "pick best standard" as settling the open question. A reject or withdraw that races typing inside a flat suggestion wins, and only the typed letters stay. That this matches Google Docs is my inference; I did not run Google Docs. A suggestion that holds another person's suggestion inside it keeps its old behavior. Those cases now sit under the concurrency limits with titles that say so. Refusing old rooms and old suggestions was my own pick, so it waited under Open questions until the owner handed the call back. It is now a Defaults row, because the vision already makes moving old Yjs rooms the app's job. Review cut undo's removed-key exception, which never changed an outcome. It rewrote the two new tests that drove internals so they go through the editor. It fixed the bridge benchmark's own guard, which failed on the base too. It also rewrote the letter index after a probe showed typing in a 10,000-letter paragraph cost six times the base. With one mark run it now costs about twice the base, under a millisecond.

Proof and its limits. The base for every control is next at 51f3a53b66. The React suite has one failure, and the base fails the same test the same way. Typecheck and lint pass. The old fixture runner `test/index.slow.ts` fails the same 568 cases with the same errors on the base and the candidate. Two recording-law cases fail with the same counterexamples on the base, so next brought them in. The first bridge benchmark ran before the letter index rewrite, on a machine loaded far past its 18 cores, so it no longer counts. Two six-round runs on the final code, one at a load of about 10 and one after the merge at 45 to 95, agree. A local edit at 10,000 blocks cost 10 to 20 percent more, about 0.1 to 0.4 ms. Sync cost up to a tenth more, and remote events match the base. Rounds swung up to twofold with load, so that cost is likely but not firm, and the Defaults row's "rerun bench" reopens it. No code-review panel ran on the diff; the decision log says why.

Counts: 11 steps, 11 done, 0 partial, 0 skipped, 0 blocked, 0 open. No question waits for you, and one follow-up stays under Open work.

Attention, from the decision-trail review:

- Reviewed by gpt-6.1-sol at xhigh. The acceptance repair holds, and the Close needed corrections, now made.
- Refusing old rooms and old suggestions had no clearance from you. You handed the call back, so it is now a Defaults row whose word adds a reader.
- Google Docs parity is my inference, and a nested suggestion keeps its old reject behavior.
- The first benchmark predated the letter index rewrite. Reruns on the final code show local typing 10 to 20 percent slower.
- The page no longer says the patch landed before it did. The slow-suite failures match the base in name and error, not in one cause.

## Open work

- Keep the original letters across both halves of a paragraph split, so a concurrent delete or mark on the second half survives. Tracked as suggested task t_649d2131. owner: the owner. stop: t_649d2131 lands or is dropped.
