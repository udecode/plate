---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-25-settle-empty-block]
work_kind: implementation
review_commit: a4cc22ee30af0ae44795678aef9e6850b80d96ec
review_inputs: [docs/plans/2026-10-25-settle-empty-block.md, docs/plans/topics/authored.md, docs/plans/topics/collaboration.md, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/core/change/retraction.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/yjs/core/retraction.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/src/yjs/core/text-runs.ts]
---

# Settle hands storage the repair it decided

Status: executed
Topic: authored
Playbook: plan

The diff panel on the settle build found that the repair loses which block settle kept. Settle decides which line of a level survives and which removed block becomes the completion's empty line, then returns only the value. Admission rebuilds each block's repair with a value diff, and the Yjs writer guesses the kept line back from that diff. Inside a quote the guess fails: two peers store two quotes, or the writer removes the kept one of two equal lines and a third peer's letter goes with it. Settle now writes its own decisions into the repair as exact deletions and property writes, and the writer reads them without guessing.

## Brief

### What will change?

When two editors accept the same late deletion, the shared document now keeps one copy, and a letter typed into the kept line stays. Three review rounds passed. One round-two fix was undone, and its case is now a known limit.

### What could go wrong?

Deleting a line with Backspace twice can still leave an empty line if the accept arrives first. Editors that get related accepts in different orders can still leave a quote or similar block empty. Speed checks found no difference, but they ran on a busy machine.

## Teach

A Plite change is a list of sections over the document's tokens. A section keeps a range, deletes it, rewrites the properties of the node there, or inserts new tokens. The Yjs writer stores a deletion as a deletion and a property section as an attribute write, so peers that write the same section merge into one.

Settle knew which node each decision touches, but it returned only a value, and admission diffed the old block against it. A diff cannot tell two equal lines apart, so the writer deleted the wrong line or wrote fresh nodes on every peer.

Now settle writes each decision as a section where it read the node: a dropped text or block as a deletion, a changed claim as a property section, and a removed block reused as the completion's empty line as a retype plus a deletion of its content. The writer reads those sections directly.

## Public API

No public call changes. Settle, admission and the Yjs binding change what storage holds after a late verdict, not how a caller asks for it.

## Main changes

- Settle records each decision as a section at the position of the node it read. Each settled entry keeps its index in the level as read, because dropped texts and inline elements make a settled level shorter than the stored one. A dropped text or inline element and a removed block become deletions, a node whose claims or formats change becomes a property section, a level whose every text went keeps one empty text, and a removed block that a completion reuses becomes a property section that retypes it plus a deletion of its content that leaves the completion's empty text. The settled value is that change applied (`packages/plitejs/src/authored/facts/settle.ts`).
- Admission composes the rejected-tag replay, claim compaction as property sections, settle's change and the cut relinks, instead of rebuilding each touched block with a value diff. `blockRepair`, `retracts`, `resized` and the shift loop go. Load uses the same recorder, so settle no longer diffs a whole document (`packages/plitejs/src/authored/facts/admission.ts`).
- `retractionOf` reads which elements and characters a change deletes from its sections, and no longer pairs new content with stored content. It returns nothing for a section that inserts a letter or an element, or deletes one bracket of an element without the other. `levelsOf` and `embed` go (`packages/plitejs/src/core/change/retraction.ts`).
- Settle's donor check runs `retractionOf` on the donor's own sections, the reader the Yjs writer lowers with, so the two cannot disagree. Settle accepts a donor whose stored text all goes only when the completion's empty text equals what `readEmptyText` says an element with no stored text reads as after the import's canonicalization. Otherwise settle keeps the shell on every peer alike.
- The writer compares each stored block with the repair's base as the import reads it, defaults included. It leaves out an empty text's properties, because the import's gap filling reads a spacer text that storage does not hold. A property a normalizer gives that spacer exists only in the editor. A text default, a spacer text or a spacer's generated property that storage leaves implicit no longer makes the writer refuse the repair and store the paragraph twice.
- When a peer's update changes the binding's Yjs types after an import and before the binding lowers its repair, the binding writes nothing and imports storage again with every record pending, so admission settles what storage now holds. The update can come from a listener of the import's commit, whose transaction Yjs observes only after the outer cleanup. The binding notes each remote transaction as it starts and checks whether it changed a type the binding opened, so a write to another Yjs type, even one named under the binding's root name, no longer makes it import again on every commit. If that import throws on a missing reference, it stays pending for the next attempt. The binding no longer rewrites the root from the editor's older children (`packages/plitejs/src/yjs/core/controller.ts`).
- A peer's own update that writes the verdicts lowers the same exact repair through the bridge that lowers local commits, so it no longer deletes the kept one of two equal lines.
- Settle and the resolver's `waitOnPrefix` share `slotDecidingInsertions`, which reads a level before accepted insertions are stripped. Settle now waits at the front of a level where the resolver waits, so it no longer keeps a deleted heading the resolver rebuilds.
- The decision-order gate also loads each state it builds through production settle, on quotes without inline elements, and compares it with the resolver model it already checks (`packages/plitejs/scripts/authored-decision-order.ts`, `packages/plitejs/test/support/authored-laws.ts`).
- The collaboration subject's import rule says an admission repair deletes stored texts and elements in place, and names the joined-update and different-verdict limits with their owner.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Settle writes its decisions as sections | Plite | `plitejs` authored, `facts/settle.ts` | Only settle knows which node survives and which removed block becomes the completion's line |
| Admission composes exact repair steps | Plite | `plitejs` authored, `facts/admission.ts` | Admission owns the repair a load or commit returns |
| The section reader and the empty-line check | Plite | `plitejs` core, `core/change/retraction.ts` and `core/editor-schema.ts` | Core owns what a change deletes from its base |
| The writer keeps reading the reader's answer | Plite | `plitejs` yjs, `yjs/core/retraction.ts` and `yjs/core/controller.ts` | The binding owns how a change reaches storage |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Two peers admit one update whose verdicts remove lines on both sides of a kept quote line, or a kept and a removed line with different text | Storage holds one quote, with no `rewrite` trace | R1 and R2 in `packages/plitejs/test/yjs/authored-admission-contract.spec.ts` |
| A third peer types into the kept one of two equal lines, or a kept empty line between two removed ones, before or after the repair | The letter survives in either delivery order | R3 and R4 in the same file |
| A deleted quote settles into the root's line whose text has a schema default | Every peer stores one line with the default text, read back from a stored paragraph that holds no text, with no `rewrite` trace | R5 in the same file |
| A peer's own update writes the verdicts while a third peer types into the kept line | The letter survives | The local-verdict test in the same file |
| A second accepted deletion reaches a paragraph whose text a default completed, or a deleted link leaves spacer texts that take a default | Storage holds one paragraph, with no `rewrite` trace | The two default-text tests in the same file |
| A peer's update reaches storage while an import notifies its commit | That peer's new line and letter survive on every peer, with no `rewrite` trace | The commit-notification test in the same file |
| A provider's readiness rises inside the Yjs transaction that applied an update | The binding settles the update once and stores one paragraph | The readiness test in the same file |
| A commit listener writes to a Yjs map named under the binding's root name as an update imports | The update imports once | The outside-write test in the same file |
| A deleted link leaves an implicit spacer that takes a generated property | Storage holds one paragraph, with no `rewrite` trace | The generated-property test in the same file |
| Two peers settle one emptied level knowing different verdicts | Every peer converges with no `rewrite` trace; the level's emptied storage stays the stated limit | R6 in the same file |
| Loading or committing every case the first plan covered | The same values as before | The settle tests in `packages/plitejs/test/authored-facts.test.ts` and the twelve `settled` cases of the admission spec, each with no insert and no `rewrite` |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Peers that receive a late claim that empties a level and the verdict on one of its sibling claims in different orders empty the level in storage, and typing then stores two lines (R6) | Keep it a stated limit, as it fails the same way before this run (look) | Pick a donor every peer agrees on whatever verdicts it knows, or keep an emptied level in the binding: a new donor rule or binding change with its own design round, panel and tests, about one more plan iteration | fix different verdicts | small |
| A peer's update changes the binding's Yjs types between an import and its repair's lowering | Write nothing, import storage again with every record pending and settle what it holds, as critical findings of both diff panel rounds asked (look) | The whole-root rewrite from the editor's children, which deleted that peer's line and letter | rewrite stale repairs | small |
| Another editor's change that arrives in the middle of a cleanup write | Leave it as a known limit, because the check that caught it could loop forever and lost data (look) | Hold the cleanup write until that change is read, a bigger change that needs its own review | read joined updates | small |
| Backspace twice on a line leaves an empty line when the accept arrives first | Leave it to the follow-up task t_e3dcf88b, which handles accepted joins (answer) | Fix it now, which adds about one more plan round and its review | build the late join | big |

## Steps

- [x] **1. Exact repair.** Settle records its decisions as sections, admission and load compose them, `retractionOf` reads them without pairing, and one empty-line check serves settle, the reader and the writer. Proof: R1 to R5 and the local-verdict test fail at `a4cc22ee30` and pass with the change, each on its own; the twelve `settled` cases and the third-peer tests keep converging with no `rewrite` trace; the settle tests in `authored-facts.test.ts` pass unchanged; a mutant of each refusal in `retractionOf` and of the donor's empty-text rule fails a test; both partitions and the type check pass.
- [x] **2. Waits and the gate.** Settle's prefix wait matches `waitOnPrefix`, and the decision-order gate compares production settle with the resolver model. Proof: the deleted-heading case fails before and passes after, and `pnpm check:authored-order` passes with the settle leg, which fails on a planted settle mutant.
- [x] **3. Subjects and limits.** The collaboration subject's import rule describes the repair and the different-verdict limit with its owner; the authored settle rule covers blocks; the first plan's limits and its research table read as measured. Proof: `review-ledger.mjs check` and `plan-page.mjs --check` pass.
- [x] **4. Close.** Writing passes, a panel on the diff, the three Yjs and authored benchmark lanes against `6a1ad26f32`, a hand drive of the suggestion and Yjs docs pages, and landing through `land.mjs`. Proof: the panel's rows, the benchmark logs and the landed commit.

## Close

Reversals first. Round 2 of the diff panel added a check for a peer update that joins the repair's own Yjs transaction. Round 3 found that the check loops when a provider's readiness rises inside the transaction that applied an update, and that it drops that update's shared effects. The run removed it, and that update is now a stated limit with an owner. The deslop pass typed the binding's set of opened types more narrowly, tsc refused it, and the reviewed type stays.

Settle records each decision as a section of the change at the node it read. Admission composes those sections into the repair, `retractionOf` reads which stored elements and characters the repair deletes, and the Yjs binding lowers it as deletions and attribute writes in place. When a peer's update changes the binding's Yjs types between an import and its repair, the binding writes nothing and imports storage again. The binding records each type it opens, so a write to another type, even one named under its root name, does not count.

Proof. R1 to R5 and the local-verdict test failed at `a4cc22ee30` and pass with the change, each on its own, and both partitions, the type check and the order gate passed on the built tree (rows 7 to 13). After the round-3 writing passes, the admission spec passes 30 of 30, all 518 Yjs tests pass, and lint and tsc pass on the final files (row 31). Each round-3 fix that stays fails its own test when reverted alone (rows 27 and 29). The hand drive covered the suggestion and Yjs docs pages, where typing in one peer reached the other. No page reaches a late verdict on a recorded deletion, so it drove no settle case (rows 32 and 36).

Speed. Twenty alternating pairs of the event-change lane against `6a1ad26f32`, at load averages of 6 to 52 on 18 cores, show no measurable difference. Each metric's median sits inside the other side's range, such as a batch sync p95 of 47.2 ms against 47.8 ms. Three candidate runs and no base run had one of five property-context samples stall at 15 to 34 ms, on code the change does not touch, and the ten pairs at the lowest load had none. The authored lane met its absolute budgets on both sides and missed its relative budget against an idle-machine baseline on both, the base in 4 of 6 rows and the candidate in 5, while the base's own passes at 100 blocks ranged 6.8 to 52.9 ms. The donor Yjs lane passed on both sides with no correctness failure. Its one difference, an edit cursor remap p95 of 56.4 ms against 40.9 ms, sits inside the base's own spread of 40.9 to 101.1 ms across this plan's three runs (rows 33 to 35).

Limits. Selecting a line and pressing Backspace twice still leaves an empty line when the verdict arrives before the claim, and t_e3dcf88b owns that. Peers that get a late claim and a sibling's verdict in different orders can still empty a level (R6). A peer update applied inside one of the binding's own Yjs transactions is not read. No test fails without the writer's base check. These and the deferred panel warnings sit in the Open work of the authored and collaboration subjects, each with its owner and stop.

Counts. Three diff panel rounds ran, each with all three seats. They raised eight criticals, and seven stay applied after round 3 reverted round 2's joined check. The card asked three things, and each has an answer here and in the first plan. Settle drops the block. The join and split facts keep settle waiting where deciding waits, except the late join above. The prior art covers what accepting a paragraph's deletion does but says nothing on when settling runs. The reflect's reviewer returned 33 findings. Five led to fixes in this run, such as the order gate's rule, which now describes its settle leg. Nineteen backlog items wait on the owner, and eight findings were rejected as already covered or duplicates (row 40).

The review read `docs/plans/2026-10-25-settle-empty-block.md`, `docs/plans/topics/authored.md`, `docs/plans/topics/collaboration.md`, `packages/plitejs/src/authored/facts/settle.ts`, `packages/plitejs/src/authored/facts/admission.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/core/change/retraction.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/yjs/core/retraction.ts`, `packages/plitejs/src/yjs/core/controller.ts` and `packages/plitejs/src/yjs/core/text-runs.ts`.

## Open work

- When peers receive a late claim that empties a level and the verdict on one of its sibling claims in different orders, each deletes the other's kept block, so the level ends empty in storage and two peers typing into it store two lines (R6, measured before and after this run). A peer that imports storage again because a peer's update reached it mid-import receives the claim and the verdict at once, which is one such order. owner: zbeyens. stop: a donor every peer agrees on whatever verdicts it knows, or a binding that keeps an emptied level.
- Typing inside a block the repair removes is lost, because the deletion wins. owner: zbeyens. stop: the owner asks for a fix or drops it.
- No test fails without the Yjs writer's check that a stored block still reads as the repair's base. With the comparison removed, all 518 Yjs tests pass. Before that check runs, the binding's stale-write check catches a peer's update that lands while an import notifies its commit. An update that joins the repair's own transaction reaches the check, which refuses and rewrites the root, as the next item says. owner: zbeyens. stop: a case where storage differs from the import's base without a peer's write, or a proof that none exists and the check goes.
- A peer update that a `beforeTransaction` listener applies inside one of the binding's own Yjs transactions joins it under the binding's origin, and the binding never reads it. When that transaction is a repair, the base check refuses, and the root rewrite removes that peer's new line and letter on every peer (`docs/plans/artifacts/2026-10-25-settle-empty-block/panel-4/r3-joined-limit-a1.log`). No provider in this repository delivers updates that way, and the binding's local-commit transactions have the same gap. owner: zbeyens. stop: the binding reads an update that joins any of its own transactions, or the owner drops it.
- An import that carries only records reads no storage, so its repair's base is the editor's state. A peer update applied during the import transaction's own cleanup is open when the import takes its snapshot, so the stale-write check trusts it as read. If it inserted a block before the repaired one, the base check refuses and the rewrite removes that block on every peer (Opus, diff panel round 3, not run). owner: zbeyens. stop: a base-check refusal imports storage again instead of rewriting, or the owner drops it.
- The writer's base check leaves out the properties of every empty text, though the binding keeps a stored empty text's properties as attributes and only an implicit spacer has none. The stale-write check catches a peer's write there first, so no known case differs. owner: zbeyens. stop: the check leaves out only properties storage leaves implicit, or the owner drops it.
- A line deleted with its boundary records a join plus a deletion of its text. Selecting the line and pressing Backspace twice records that pair, and so does a selection from the end of the line before it. Deciding it at once removes the line, but a verdict that arrives before the claim leaves an empty line, because settle keeps an accepted join unlanded. The decision-order gate skips every change that carries a join, so it does not see this case. Triple-click, text-only and block-selection deletes give the same result in Editing, when decided at once and when settled late. owner: zbeyens. stop: t_e3dcf88b lands or is dropped.
- An import with no repair still clears the events of a peer's update that lands while it notifies its commit outside a Yjs cleanup, so the editor misses that update until the next full import. It predates this run, and the repair path now imports storage again instead. owner: zbeyens. stop: every import that sees a storage write in its window imports again, or the owner drops it.
- Settle keeps Editing's claim on a block that goes with a pending join until the join lands. `next` already had that rule, and no test fails without it. owner: zbeyens. stop: a case where dropping the claim early changes what deciding leaves, or deleting the rule.
- The reflect's 19 workflow lessons, which bind nothing: record which node an operation touched where it happens; read a library's event order before a fix that depends on it; check research claims of every or no source row by row, and log the search behind a universal negative; name which questions prior art can answer before research lanes start, and record only screened repositories; write a process verdict down as it happens; deny an unquoted zsh word that starts with `=`; make a mutation script prove its anchor matches once; load the authored benchmark's frozen baseline in a worktree; reconcile review-ledger's Public API demand with plan-page on an open plan; name the format when decisions-check refuses a panel severity; note the second-Yjs and hidden-console probe traps; map which gestures record a reported shape at intake; land a base defect in another owner first; isolate code delegates as land.md says; name the base commit in diff-scoped briefs; run full speed lanes once on the final bytes; treat a warning that reproduces the ask's symptom as an ask miss; test a multi-actor case's precondition and the guard a limit reaches; and count a hand drive only when it ran the change's interaction. owner: zbeyens. stop: the owner takes or drops each.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Settling applies a claim as a decision would ([the authored subject](topics/authored.md), its Rules).
- A repair every admitting peer lowers converges only when it deletes or rewrites stored items in place and inserts nothing another peer also inserts, because Yjs keeps two concurrent identical inserts and merges deletes and attribute writes.
- Writing a changed window as removals and insertions makes a moved block a new Yjs node, so a peer's typing inside it is lost ([the collaboration subject](topics/collaboration.md), its Rejected table).

### Lanes

- **Settle writes its decisions as sections in the existing change.** The design arena picked it. Two of three runners reached it on their own, and the blind judge scored it first, 14 against 12 and 9. It adds no type to the admission contract and deletes the diff-and-guess code.
- **An explicit plan of source positions beside the change.** Rejected, because a second carrier has to compose with the change through every admission pass, and the local commit path would need it too.
- **Remove only what the existing guess handles.** Rejected, because every nested removal would keep its empty shell, which misses the card's ask.
- **Refuse a stale repair and settle again from storage.** Taken after the diff panel showed a peer's update landing while an import notified its commit, where the rewrite from the editor's older children deleted that peer's line. It is the pick of the second Defaults row. The second round found an update that joins the repair's own transaction, and a write outside the document that made the binding import again on every commit, so the binding read what each remote transaction changed and checked the repair's transaction before it wrote. The third round found that this check loops when a provider's readiness rises inside the transaction that applied an update, and that it drops the joined update's shared effects. The run removed the check and states the joined update as a limit. It also replaced the binding's match on its root name with the set of types the binding opens, because a map named under that name still made it import again on every commit.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts`, unaffected, it decides changes and never reads how settle stores a decided block.
- `comments`: `apps/www/src/registry/components/editor/discussion.tsx`, unaffected, it reads cards and anchors, and a settled block carries no card.
- `documents`, `exports`, `html`: `packages/platejs/src/docx/export/lib/reviewProjection.tsx`, `apps/www/src/registry/components/editor/export-toolbar-button.tsx`, `packages/platejs/src/static/renderStaticHtml.tsx`, unaffected beyond an empty paragraph that no longer appears.
- `persistence`: `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, unaffected, no stored shape changes.
- `react`, `suggestions`, `ui`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `apps/www/src/registry/components/editor/suggestion.tsx`, unaffected beyond the empty line that no longer renders.
- Dev pages `authored-review` and `suggestion-performance`: unaffected beyond the same empty line.

### History

This iteration supersedes the Yjs step of `2026-10-25-settle-empty-block`, whose diff panel found that a value diff loses which block settle kept, and keeps that plan's settle rule. This plan's first step replaces that Yjs step.
