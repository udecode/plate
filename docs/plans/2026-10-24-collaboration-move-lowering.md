---
review_scopes: [collaboration]
verdict: stop
review_basis: [2026-10-16-react-editor-release]
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/topics/collaboration.md, docs/plans/2026-10-21-cut-join-storage.md, packages/plitejs/src/yjs/core/event-change-bridge.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/src/core/change/join.ts, packages/plitejs/src/core/change/mapping.ts, packages/plitejs/src/authored/ledger/ledger.ts, packages/plitejs/src/core/change/classification.ts, packages/plitejs/test/join-collab.test.ts, packages/plitejs/test/yjs/move-node-contract.spec.ts]
---

# Collaboration: how one update that moves blocks reaches Yjs

Status: closed: Stop verdict
Topic: collaboration
Playbook: verdict

**Stop. The Yjs binding keeps its writers for a local update, and three of their rules get fixed in place.** Three failure kinds share those writers, and each is a local rule error that any redesign would still have to get right. The composite writer removed and inserted region by region, so a later removal found the placeholder it had just written and deleted it. The sparse writer paired an equal-length range by position, so a move beside a retype wrote the wrong block. The exact-move writer trusted a move read only from the change's replacements, so a retype elsewhere in the same update was dropped. On `next`, 3,412 of 12,000 generated cases leave the peers apart. With task t_50039fd9's fix of all three rules, 66 still do. In every one the sender's editor matches its own Yjs root and the receiving peer's editor reads another order, which suggests a bug in the receiving peer's import. Their replays include a block inserted right after a block an earlier update moved, one inserted right before it, and an update with no insert. Deleting the exact-move writer buys no correctness, and its cost per move is inferred, not measured. Deleting the move writers altogether loses a peer's typing inside a moved block. The writers this review keeps still lose a peer's typing in two shapes: a block one update moves and types into, and a block one update splits while it moves another. Typing in a block the update only edits is kept (`probe-r3-typing-sibc-a2.log`).

## Brief

### What will change?

The Yjs binding keeps its design. Three rules inside it get fixed, so one update that moves blocks and edits others reaches every peer the same. Task t_50039fd9 lands all three fixes.

### What could go wrong?

The generated updates only use plain paragraphs and headings at the top level, with one text each. A peer typing in a block that one update moves and types into, or in a block it splits while it moves another, still loses that typing, though both peers end on one document. A block placed next to a block an earlier update moved can still land on the wrong side of it for other peers.

## Teach

When you edit, the Yjs binding turns your change into Yjs writes so other people get it. It tries the cheapest writer that fits: a plain move, then a writer for moved blocks, then a writer that only touches changed blocks.

The bugs showed up when one update moved a block and also changed another. Each writer had one wrong rule for that case. One deleted a block it had just placed, one matched blocks by position, and one ignored a retype.

This review asked whether the writers should be replaced. They shouldn't. Fixing the three rules makes the generated cases match, except 66 where a block next to an earlier move lands on the wrong side, which looks like a separate bug on the receiving side. The simpler alternatives fix nothing more, and one of them loses someone's typing inside a moved block.

## Public API

No public call changes. The pair shows the binding's dispatch for a moved block, which this review keeps, and the strongest deletion lane, which loses.

```ts before
// packages/plitejs/src/yjs/core/event-change-bridge.ts
const exactMove = getExactDocumentChangeRelocation(
  change,
  this.rootKey,
  indexes().before
);
const relocationResult = exactMove
  ? this.lowerExactRelocation(change, expected, exactMove)
  : null;

if (relocationResult !== null) return relocationResult;
```

```ts after
// a sketch of the deletion lane; no source holds it
// Every move, a single one included, goes through the composite writer.
const relocations = getDocumentChangeRelocations(change, this.rootKey);

return this.lowerRegions(change, expected, relocations);
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the binding writes an update that moves blocks | Keep its writers and fix three rules | Send every move through one writer for moved blocks | pursue one writer | big |
| More work on this question | Hold | Review again, or have other models challenge it | again, interrogate | small |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata through the session tool.

### Requirements

- After each delivered update, every peer reads the same document. Accepted canonical changes are document truth ([collaboration subject](topics/collaboration.md), Layer and owner).
- Yjs is there for concurrent and offline convergence and durable relative identity; local changes alone give neither (the subject's rejected "Generic commit or snapshot broadcast" row). So a move keeps the moved block's Yjs node, and a peer's typing inside it survives (`packages/plitejs/test/yjs/move-node-contract.spec.ts`, "preserves concurrent remote text when an offline same-parent move reconnects").
- An undo over a join whose own lines move in the same update rebases by position ([plite.md](../vision/plite.md), the history bullet on joins). In the task's case Alice's accept and move reach Bob as one change, and neither that change nor Bob's undo carries a join record, so the join rebase returns null at its first check (`packages/plitejs/src/core/change/join.ts:932`, traced in `probe-join-trace-next-a1.log` and `probe-join-trace-sibc-a1.log`) and the caller falls back to the plain transform. When the accept reaches Bob before the move, the rebase reads it as a join and keeps it (`:979`, `probe-move-r3-trace-sibc-a1.log`). Here the move is a later commit that reaches Bob in one delivery with the join, which the by-position list does not name, so task t_23fa5708 decides which result the undo owes. Convergence is this review's requirement; the rebase's result is not.
- The binding's write work scales with the change, not the document. The sparse path reads one top-level node for an untouched projected sibling (`move-node-contract.spec.ts`, "keeps an untouched projected sibling on the sparse event path").
- Each `(Y.Doc, rootName)` has one binding owner ([collaboration subject](topics/collaboration.md), Rules).

### What the code does

- `lowerStructure` tries a canonical split, then an exact single move, then the split and splice detectors, then `lowerRegions` with the change's relocations (`packages/plitejs/src/yjs/core/event-change-bridge.ts:2104-2143` at the review commit `05b58b8c9a`, as are the other line numbers here). `lowerRegions` runs `sparseLowerRegions`, then `lowerCompositeRelocations`, then the range writer.
- `lowerCompositeRelocations` walked the regions from the end, removing each region's old nodes and then inserting its new ones before moving to the next region (`event-change-bridge.ts:3090`, the loop the run replaces). A moved node's new placeholder shows that node, so `rootIndex.indexOf` on an earlier region's old node found the placeholder and removed it. It also inserted at the region's before position. It made a new Yjs node for every block in its regions that did not move, edited ones included.
- `sparseLowerRegions` treats a range whose before and after lengths match as in-place replacements and pairs them by position (`event-change-bridge.ts:1367`).
- `getExactDocumentChangeRelocation` reads `RootChange.movedNode`, which counts only replacements (`packages/plitejs/src/core/change/root-change.ts:3069`, `:3017`), so a property change elsewhere in the update still yields one move. `lowerExactRelocation` then writes a bare Yjs move and drops the retype (`event-change-bridge.ts:3041`).

The run's first generated check ran one update over fresh roots and skipped any case that threw. The plan panel found both gaps, so the run's second check, `gen-lower-c.mjs`, runs one to three updates from either peer, checks each against both editors and each editor's own Yjs root, draws each case from its own random stream and counts a throw as a failure. On `next` at `05b58b8c9a`, seeds 1 to 6 fail 3,412 of 12,000 cases and none throws (`gen-c-base-seed1-a2.log` to `gen-c-base-seed6-a2.log` in the run directory, `docs/plans/artifacts/2026-10-24-join-moved-lines/`). Named by the writer that ran, the composite kind fails 2,163, the sparse kind 980 and the exact-move kind 223. In the other 46 the sender's editor matches its own Yjs root and the receiving peer's editor does not. In the probed one, a block inserted right after a block an earlier update moved, the receiving peer's own Yjs root reads the right order and its editor does not, so that kind is the import's (`probe-insert-after-move-next-a1.log`).

### Lanes

1. **Keep the writers and fix three rules. Wins.** The composite writer removes every old node before it inserts any new one, inserts at the region's after position, and updates in place a region that touches no move and keeps its blocks' number and nesting (`canReplaceCompatibleYjsChildren`). The sparse writer stops pairing a range by position when the update changes more than one stretch. The exact-move writer must not write a bare move when the update also changes properties. Task t_50039fd9 lands all three. The run that called this review drafted the composite fix and the property rule first. Its draft of the property rule (`slice2.patch`) sent such an update to the composite writer as it stood, which lost a peer's typing in the retyped block; t_50039fd9's commit keeps it (`probe-retype-concurrent-sibc-a1.log`). With t_50039fd9's fix, 66 of 12,000 cases fail (`gen-c-sibc-seed1-a1.log` to `-seed6-a1.log`). Their replays (`replay-sibc-seed1-a1.log` to `-seed6-a1.log`) show 77 failing steps, each with the import's signature and none another. Some are an insert right after the earlier move, but case 235 of seed 1 inserts right before it and case 885 of seed 2 has no insert, so that all 66 share R9's cause is inferred. Task t_1b68f351 owns them. Six of them pass on `next`. The fix now writes the earlier update's move as a real move, and the later insert then reaches the import bug (`gen-ids-sibpre-seed1-a1.log`, `-seed3-`, `-seed5-`).
2. **The strongest deletion: drop the exact-move writer and send every move through the composite writer. Not taken.** It removes one writer and one rule, and buys no correctness, because lane 1 fixes every case it would fix. The exact writer moves one Yjs node and shifts a length index, while the composite writer measures the moved region's old and new nodes, builds placeholders and splices lengths, so each single move would cost work that grows with the moved block. That cost is inferred from source and not measured. Timing one move of a large block through `lowerExactRelocation`, and again with `getExactDocumentChangeRelocation` returning null, would settle it, and `again` reopens this review with that number.
3. **A wider deletion: drop the move writers and write each changed window as removals and insertions. Loses.** It breaks durable identity. A moved block would become a new Yjs node, and a peer's typing inside it would be lost, which the move-node contract tests guard. Lane 1's writers have this cost only for a block one update moves and also types into, and for a block one update splits while it moves another (`probe-r3-typing-sibc-a2.log`).
4. **Carry move identity in the change, so the binding writes moves without detecting them. Not this review's target.** Task t_22bb6284 already asks whether changes should carry move identity, for carets, and changing the change format touches history, Yjs and the review recorder together. No case this run found needs it.
5. **Make `movedNode` itself refuse a change that also changes properties. Loses.** Its other callers read it as a replacements-only question, such as `packages/plitejs/src/authored/ledger/ledger.ts:347` and `packages/plitejs/src/core/change/classification.ts:92`, and classification tracks properties apart. Task t_50039fd9 adds `RootChange.exactMove` instead, which returns null when the change also changes properties (`packages/plitejs/src/core/change/root-change.ts:3069` at `cc8f03b861`). Two callers read it: `getExactDocumentChangeRelocation` in `mapping.ts`, whose only production caller is `lowerStructure`, and representation fitting (`packages/plitejs/src/core/representation.ts:1564`).

**Proof limits.** The generated check covers top-level paragraphs and headings with one text each, typing only at a block's start, one root, and one to three updates of up to three operations each, every update delivered before the next, with no concurrent remote edit. The task's case, a join accepted and moved in one update and then an undo, is covered only by the run's probes (`probe-move-sibc-a1.log`, and `probe-move-r3-sibc-a1.log`, which also delivers the accept apart and compares each editor with its own Yjs root), not by the generator or a committed test. A peer's typing in a block one update moves and types into is lost, and so is typing in a block it splits while it moves another; both peers still converge (`probe-r3-typing-sibc-a2.log`), while on `next` the peers also split (`probe-r3-typing-next-a2.log`). Task t_c313ad28 owns both. Typing in a block the update only edits is kept, even with a move between two edited blocks. Two planted bugs in the composite writer fail no test: rebuilding a region's unmoved changed blocks when it holds a second move (`sib-c/run-mutants-first.out`), and dropping set-valued properties such as review marks (`sib-c/run-setvalued-2.out`). A peer's typing inside a nested paragraph moved within its parent is task t_043a0fd7's.

### Dependents

- `distribution`: unaffected. Its files, such as `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, import the scope's members, and this review changes no export or call shape.
- `editing`: unaffected, for the same reason, through `packages/platejs/src/utils/plugins/SingleBlockPlugin.ts` and its siblings.
- `ui`: unaffected, for the same reason, through `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx` and its siblings.

### History

- [2026-10-16-react-editor-release](2026-10-16-react-editor-release.md), the head: this review supersedes it as the scope's head with a Stop on a question it did not judge, how one local update that moves blocks reaches Yjs. Its Pursue on how the binding takes and frees its document stands.
- [2026-10-21-cut-join-storage](2026-10-21-cut-join-storage.md): this review retains it. Its Yjs slice stopped short of children moved out of order, and its Open work hands concurrent edits under such a move to t_043a0fd7, which this review leaves there.
- Commit `e36f5fc2bf` (2026-10-19) left joins whose own lines move in the same update on positional behavior. Task t_50039fd9's fix gives that case the convergence it lacked, and this review keeps its rebase law.
- External checkouts: none.

## Close

**Stop. The binding keeps its writers, and three rules get fixed.** Each failure was a local rule error, and the strongest deletion buys no correctness. Task t_50039fd9 lands all three fixes, and the run that called this review, [2026-10-24-join-moved-lines](2026-10-24-join-moved-lines.md), records the proof. That run offered t_c313ad28 for the retype rule, which t_50039fd9 then took, and t_c313ad28 now holds the two typing losses that remain. It offered t_1b68f351 for the import's kind, which now holds all 66 cases.
