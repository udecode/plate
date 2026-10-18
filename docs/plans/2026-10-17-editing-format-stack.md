---
review_scopes: [authored]
review_basis: []
work_kind: implementation
review_commit: b40cebebee406953abdb72ff277fad4849435f0e
review_inputs: [packages/plitejs/src/authored/tree/layers.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/record-completion.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/test/authored-tree-collab.test.ts, packages/plitejs/test/authored-facts.test.ts, packages/plitejs/test/authored-tree-record.test.ts, docs/vision/plite.md]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Format suggestions keep their values through Editing and decisions

Status: superseded: by docs/plans/2026-10-18-editing-format-gone-links.md after plan review round 2
Playbook: plan

## Brief

### What will change?

An edit in Editing mode over someone's pending format suggestion leaves it up for review, because the first plan's review found that the takeover loses values. No accept, reject or undo brings back a value someone rejected, withdrew or undid.

### What could go wrong?

Three races lose a value: an accept racing a peer's suggestion on the property, an edit racing a property's first suggestion, and a decision or withdrawal racing an edit. Next handles one case of the first. Long stacks cost space.

## Teach

A pending format suggestion is a small tag on the text. It records who changed which property, the value before and the value written. A suggestion on top of another lists the tags under it.

Today an edit in Editing mode over someone's pending suggestion deletes their tag. When a tag under a suggestion is gone, the code assumes it was accepted. So a later decision or the accepted preview can bring back a value somebody rejected. Accepted tags kept beside pending ones block unrelated decisions.

Now an Editing edit over pending tags stacks its accepted tag on top and leaves theirs pending. Each stacked tag lists the tags under it and what each wrote. A gone tag stays gone, even once the rest of its change is accepted, so a rejected, withdrawn or undone value never returns. An accepted tag stays while a pending tag sits over or under it. Accepted tags no longer block unrelated decisions.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Editing over another author's pending format suggestion | Their suggestion stays up for review, and deciding it later never undoes the Editing edit (look) | Keep the takeover, where the Editing edit removes their suggestion and decides their whole change | take over | big |
| Accepting a suggestion that sits on another pending one | It still waits for the one under it, as today | Accept it alone and keep it stored until the one under it is decided | accept alone | small |
| Accepting a suggestion while a peer suggests on the same property, beside it or over it | Rejecting the peer's suggestion afterwards gives the value from before both, because the accept already removed the tag it was written over. Next keeps the accepted value when the peer wrote over it, because it treats every gone tag as accepted. Two tests pin this, and the law says so (look) | Read a gone tag's verdict, which brings back a suggestion undone under a stack once the rest of its change is accepted (C17), or keep every accepted value forever, which stores a record for every edit in every document | keep concurrent accepts | small |
| An edit at the same time as the first suggestion on a property | Rejecting the suggestion restores what its writer saw, as today. The law says so | Record every Editing edit, which stores a record in every document | record every edit | small |
| A decision or withdrawal at the same time as an edit | It stays as on next. When the deciding peer wins the merge, the edit is lost. Two tests pin it, the law and the docs say so, and a suggested task owns the fix (look) | Fix it in this run, which needs a stored record of each Editing write and another plan round | close the edit race | small |
| Suggestions on both sides of an Editing edit | They still wait on each other, though the edit fixes the value. Accepting one over the edit waits on those under it, and rejecting one under it waits on those over it. A suggested task owns the question | Skip the edit's other side, which broke order independence in two reviewers' probes | skip waits | small |
| Your own pending suggestion under your Editing edit | It stays up for review like anyone's, because an Editing edit never takes back a suggestion | Your Editing edit takes back your own suggestion | take back mine | detail |
| Space for stacked suggestions | Each stacked tag lists every tag under it. That takes about 1.4 times next's bytes at three stacked suggestions and 7.8 times at forty, inside the budget frozen before measuring | Link only the nearest tag, which cannot read a gone tag's parents | smaller stacks | detail |
| Stacked suggestions saved before this change | They fail to load, as a suggestion with no stored value already does. No release ever wrote them | Add a reader that upgrades them on load | read old suggestions | detail |
| A fork after one member is rejected | The accepted member with the smallest id lands, whoever wrote last | The last writer's value lands | last writer | detail |
| Where this work shows | On the authored subject's page, because it changes that subject's law. The old plan's page stays as history | Keep the old plan's own page | own page | detail |
| Who writes the code | I write the code and its tests, because the Codex login refuses the configured models | A Codex worker writes them, and I review every line, caller and test | use Codex | detail |
| Review before building | Plan review rounds until one applies no critical finding, at most three, then the build | Build without a review | fast | detail |

## What other editors do

I read the docs of Google Docs, Word and CKEditor 5 and the source of prosemirror-suggest-changes at 653fba70, and searched Slate at 945a484df, Lexical at dd5c41b13 and Tiptap at 91c51be53 for a tracked-changes model by file name. None was run, and none documents what a direct edit does to another author's pending format suggestion (`docs/plans/artifacts/2026-10-17-editing-format-takeover/prior-art-codex.md`).

| Editor | Stores a pending format change | Records the value it wrote | Direct edit over another author's pending format | Rejecting it afterwards |
| --- | --- | --- | --- | --- |
| Google Docs | yes | not documented | not documented | not documented |
| Word (OOXML) | yes, `w:rPrChange` | no, only the previous property set | not documented | restoring the stored set would undo the direct edit (inferred) |
| CKEditor 5 (commercial) | yes | yes, `oldValue` and `newValue` | not documented | not documented |
| prosemirror-suggest-changes | yes, as a replaced copy | yes, the copy holds it | the suggestion stays (source read) | the direct edit is lost (source read) |
| ProseMirror core, prosemirror-changeset | no pending suggestions | no | no | no |
| Slate, Lexical, Tiptap open source | no tracked changes (file-name search) | no | no | no |
| Plite after this plan | yes | yes | the suggestion stays | the direct edit stays |

Plite's DOCX export of a stack with an Editing tag on top, as in C2, writes a format revision whose old and new values are both Carol's green. Alice's pending red under it has no OOXML form, because OOXML keeps one previous property set per run (inferred from `w:rPrChange`).

## Document shape

Admission's validator, every decision, the change cards, Yjs and saved documents all read a stacked suggestion, and Yjs merges `authored` as a set of whole members.

Bob's blue over Alice's pending red, today and after:

```json before
{
  "text": "word",
  "color": "blue",
  "authored": [
    { "id": "alice-t:1", "key": "color", "kind": "format", "change": "alice:1", "author": "alice", "at": 1000,
      "write": { "kind": "set", "value": "red" } },
    { "id": "bob-t:1", "key": "color", "kind": "format", "change": "bob:1", "author": "bob", "at": 1000,
      "before": "red", "over": ["alice-t:1"],
      "write": { "kind": "set", "value": "blue" } }
  ]
}
```

```json after
{
  "text": "word",
  "color": "blue",
  "authored": [
    { "id": "alice-t:1", "key": "color", "kind": "format", "change": "alice:1", "author": "alice", "at": 1000,
      "write": { "kind": "set", "value": "red" } },
    { "id": "bob-t:1", "key": "color", "kind": "format", "change": "bob:1", "author": "bob", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }],
      "write": { "kind": "set", "value": "blue" } }
  ]
}
```

Carol's Editing green over Alice's pending red deletes Alice's tag today, and after this change Alice's tag stays with Carol's accepted tag on top:

```json before
{ "text": "word", "color": "green" }
```

```json after
{
  "text": "word",
  "color": "green",
  "authored": [
    { "id": "alice-t:1", "key": "color", "kind": "format", "change": "alice:1", "author": "alice", "at": 1000,
      "write": { "kind": "set", "value": "red" } },
    { "id": "carol-t:1", "key": "color", "kind": "format", "change": "~edit:carol", "author": "carol", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }],
      "write": { "kind": "set", "value": "green" } }
  ]
}
```

An Editing write on a property with no pending tag stores nothing, as today.

## Hard cuts and app migration

Nothing public is removed, and apps change nothing. The stored shape of a stacked format suggestion changes, and admission refuses the old one, as it already refuses a format tag with no `write`. No plitejs release ever wrote either shape, because npm lists only plitejs 0.0.1, published 2026-08-26 (`npm view plitejs time`, read 2026-10-17).

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo of an Editing format write over a pending suggestion | Undo removes the stacked Editing tag and restores the value; Alice's suggestion stays pending, and a suggestion stacked over the undone write reads it as gone | jsdom and Yjs tests in step 4 |
| Collaboration | Two and three peers converge on the same tags and value in both delivery orders and both client-id orders, before and after a save and reload | Yjs collaboration tests in step 4 |

## Main changes

- An Editing format write over a property that holds pending tags replaces the Editing tags on top, whoever wrote them, with one accepted tag under the writer's reserved Editing change. That tag is written over every tag below it, and the Suggesting tags stay in place. An Editing write never withdraws, so writing back the value below still stores its tag. A Suggesting write never counts an Editing tag as its own run. The mark validator lets an Editing tag stay stored only when it is written over at least one tag. An Editing write on a property with no tags stays a plain write.
- Every stacked tag stores `base`, the accepted value its writer read without any Editing write, and one link per tag under it with that tag's id and written value. A parent that is gone never stands, whatever the verdict on the rest of its change. When every parent stands, rejecting the tag lands its `before`. Otherwise it lands the written value of the highest standing parent, or `base` when none stands.
- A tag accepted before the decision is settled. It waits on nothing, and no decision waits on it. An accepted tag, Editing or Suggesting, stays stored while a pending tag lies under or over it, so rejecting that pending tag later gives its value back. Decisions drop it once neither holds, and so does admission's collaboration pass, in a document with verdicts or without.
- A fork that loses a member to a reject lands the written value of the accepted member with the smallest id.
- `recordFormats` in `layers.ts` records every format write, Editing and Suggesting, command and correction. Completion's kept shell calls it and applies its whole delta, withdrawn tags included, so Editing no longer throws there. An Editing correction keeps every tag and stores nothing, as today.
- `acceptedValues` reads the standing claims, accepted tags still stored included, and gives `writeLayer` its `base`, `reviewOf` its accepted values and DOCX export its previous values. next's exclusive-key restore (`tipsWrittenValue`) reads tips from links.
- The split reader of rejected values (`droppedOnSplit`) and the reader of resting changes (`restingChanges`) skip Editing tags, because no decision rejects an Editing write. The split reader also checks `base`.
- Accepting a step still waits on every pending step below it.

## Evidence

### What the code does today

Every case runs on next at b40cebebee406953abdb72ff277fad4849435f0e the same as on 51f3a53b66, where the arena ran; only generated ids and paths differ. The fixtures gained `write` through `docs/plans/artifacts/2026-10-17-editing-format-takeover/fill-writes.ts`, because next refuses a format tag without it.

| Case | Today on next | After this plan | Proof |
| --- | --- | --- | --- |
| C1, an amendment races an Editing write | rejecting the amendment lands red, the value from before both | the Editing value stays | `probe-amend-race-a1.log` |
| C2, a third peer stacks on a tag an Editing write took over | the accepted preview shows Alice's red; rejecting Bob lands it with no change left | Alice's change stays pending; rejecting Bob keeps Carol's green; rejecting Alice waits on Bob, and accepting Bob waits on Alice | `probe-r3-third-peer-cand-a1.log` |
| C3, rejecting D in a fork that keeps C's accepted value | the fork falls back to red, so C's value is lost | C's value stays | `probe-fork-cause-next-a2.log` |
| C4, two forks, or a fork and C1's state | decisions block each other | each applies | `probe-r3-compound-next-a2.log` |
| C5, deciding a new incarnation of C over the fork | blocked with D | reject applies; accept still waits on D | `probe-fork-stack-next-a2.log` |
| C6, rejecting R between pending P and accepted S | blocked with P | applies, and S's value stays; rejecting P first still waits on R | `probe-r2-criticals-next-a2.log` |
| C7, Editing removes the only block over Alice's pending align | throws | applies, Alice's change stays pending | `probe-r3-kept-shell-next-a2.log` |
| C8, Editing over a change that also inserts elsewhere | Alice's format claim goes without a verdict | it stays until Alice's change is decided | the replaced plan's step 2 |
| C10, an unrelated insertion beside an accepted chain | blocked with P | applies | `seat-opus-r3.md` |
| C11 and C12, a stack over a tag rejected or withdrawn at the same moment | the preview shows the rejected red; rejecting Bob lands it with nothing to review | no color, which is the value before both | `probe-c11-c12-next-a1.log` |
| C13, Carol undoes her Editing green after Bob stacked blue over it | the accepted preview shows the undone green | the preview shows no color, and rejecting Bob lands Alice's pending red | `new-tests-next-a1.log` |
| C14, Carol writes Alice's red back in Editing while Bob stacks on her green | the preview and rejecting Bob both show Carol's overwritten green | Carol's red stays, and Alice's change stays pending | `new-tests-next-a1.log` |
| C15, a decision or withdrawal at the same time as an Editing write | when the deciding peer wins the merge, the color ends null and the edit is lost | the same, pinned by `rejectionRaceDropsEditing` and `withdrawalRaceDropsEditing` | `base-loss-class-a1.log` |
| C16, Bob suggests over his own Editing green on Ann's pending blue, then his suggestion is rejected | Bob's Editing write took over Ann's suggestion | Bob's green stays, and Ann's suggestion stays pending | `new-tests-next-a1.log` |
| C17, Alice undoes her red under Bob's stacked blue, with or without accepting the rest of her change | the preview shows the undone red, and rejecting Bob lands it | the preview shows no color, rejecting Bob lands no color, and a red accepted under Bob's blue stays | `new-tests-next-r4-a1.log` |
| C18, Alice accepts her red while Bob, who has not seen the accept, suggests blue over it | rejecting Bob lands Alice's red | rejecting Bob lands no color, the value from before both, as the Defaults row says | `new-tests-next-r4-a1.log` |

Paths are under `docs/plans/artifacts/2026-10-17-editing-format-takeover/`. C13, C14 and C16 to C18 come from this plan's new and changed tests run on next by `run-new-on-next.sh` and `run-new-on-next-r4.sh`; each fails there. One more new test, an accept under a stack before a reject over it, passes there because the takeover lands the same value, and the `accepted-dropped-under-pending-above` mutant in `mutate-spec-kept.json` fails it. This plan deletes next's resolve test that read a tag over a decided tag as written over the accepted value, because reading a gone tag as accepted is what brings rejected values back. C18's test pins the opposite.

### Stack cost

Stacked tags store more bytes, so Benchmark's performance pack applies. The budget in `docs/plans/artifacts/2026-10-17-editing-format-takeover/stack-cost-budget.md` was frozen before the target ran. The probe beside it stacks one suggestion per author on one property and times rejecting the top one, as the median of 7 runs after a warm-up. Its budget file describes two changes taking turns, which leaves the same number of tags and links.

| Cohort | Depth | Bytes, next | Bytes, after | Budget | Reject ms, next | Reject ms, after | Budget |
| --- | --- | --- | --- | --- | --- | --- | --- |
| normal | 2 | 301 | 369 | at most 2x | 1.03 | 1.02 | at most 2x next plus 1 ms |
| normal | 3 | 470 | 664 | at most 2x | 0.94 | 1.05 | at most 2x next plus 1 ms |
| large | 5 | 808 | 1,428 | at most 3x | 1.07 | 1.47 | at most 2x next plus 1 ms |
| stress | 10 | 1,653 | 4,353 | at most 5x | 1.53 | 2.95 | at most 5 ms |
| pathological | 40 | 6,812 | 52,877 | at most 256 KiB | 5.83 | 32.3 | at most 50 ms |

Every cohort is inside its budget in two rounds that alternate next and the build (`stack-cost-interleaved-a1.log`); the table shows the first round. Bytes grow with the square of the depth, because each tag links every tag under it. Alternating Editing writers keep two tags, because each Editing write replaces the Editing tag on top. The correctness guard is the authored, yjs and history test partitions and both slow law suites. No production detector covers authored review, so that gate does not apply.

### Comparison

The arena's three runners and its cross-judge, with the incumbent as the control that adds no new artifact (`docs/plans/artifacts/2026-10-17-editing-format-takeover/arena/synthesis.md`):

| Target | Stores on a document nobody suggests on | Keeps another author's claim | Reads a lost parent | Fork keeps an accepted value | Races left |
| --- | --- | --- | --- | --- | --- |
| Incumbent: the takeover | nothing | no | as accepted | no | C1, C2, C11, C12, C15 |
| Editing writes a verdict | nothing | no, it decides their whole change | as accepted | no | C8 decides an insertion Editing never touched |
| Retained archive (Sol) | a record per Editing write, kept for good | no | by archive | yes | none found |
| Accepted register (Astra) | an entry per Editing write | yes | by write order | yes | none found |
| Stack with links (Opus, picked) | nothing | yes | as gone, and accepted parents stay stored | yes | an accept while a peer suggests on the property (C18); a first suggestion beside an Editing write; C15 |

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editing format write over pending tags | removes the tags it read and writes plainly | stacks an accepted Editing tag over every tag on the key | `recordFormats`, `layers.ts` | the law says Editing leaves every other author's claims pending; the takeover loses values (C1, C2, C8) | `editingOverStack` keeps all three tags | step 2 tests | another author's card stays after an Editing edit | rearchitect |
| Format tag value model | `write`, `before`, string `over`; a missing id reads as accepted | `write`, `before`, `base`, links with each parent's id and write | `layers.ts`, `marks.ts` | a gone parent never stands, so no decision brings back a rejected, withdrawn or undone value (C2, C11 to C13, C17) | admission refuses the old stacked shape | steps 1 and 3 tests | links grow with stacks; C18 | rearchitect |
| Accepted tags in decisions | a stored accepted tag is a pending step | settled status, stored while a pending tag lies over or under it | `decideKey`, `settleFormats` | C3 to C6, C10, C17 | none | step 3 tests and mutants | accepted tags stay stored longer | rearchitect |
| Fork after a reject | the value under the fork | the smallest-id accepted member's write | `decideKey` | C3, C4 | the mixed fork expectation lands red | step 3 tests | none found | rearchitect |
| Completion's kept shell | records with the propose intent, so Editing throws | `recordFormats` with the whole delta | `record-completion.ts` | C7 | none | step 2 test | none found | rearchitect |
| Editing mark validator | refuses every Editing format mark | allows one written over at least one tag | `marks.ts` | the Editing step must stay stored | none | step 1 test | none found | rearchitect |
| Accepted values | `acceptedValues` over pending marks | over standing claims with the accepted reader, also giving `base` | `layers.ts`, `reviewOf` | one reader for writes, previews and DOCX | DOCX previous follows | step 3 test | none found | keep |
| Accept dependency | accepting a step waits on every pending step below it | unchanged | `decideKey` | public decision law the ask leaves alone | none | existing tests | none | keep |
| Split and resting readers | read every format tag's `before` | skip Editing tags; the split reader also checks `base` | `droppedOnSplit` in `record.ts`, `restingChanges` in `record-completion.ts` | no decision rejects an Editing write | none | step 4 test | none found | keep |

### Challenge delta

The previous plan, `docs/plans/2026-10-17-editing-format-takeover.md`, kept the takeover. Its plan review round 3 replaced that target. Opus found the takeover's race also reaches a third peer's stack, Sol found the planned patch let decisions reach the losses it left open, and Opus found Editing completion throws. I confirmed each on running code (`probe-r3-third-peer-cand-a1.log`, `probe-r3-compound-cand-a1.log`, `probe-r3-kept-shell-base-a1.log`). The delta is `replaced`. The rejected target is the takeover with a held status, and the new one is the stack with links and a settled status.

## Steps

Execution playbook: Build. The lead writes the code and its regression tests, then reviews the whole diff, each caller of every changed symbol and every test.

- [ ] 0. **Build copy.** The lead writes steps 1 to 4 in a scratch copy at next b40cebebee, because the Codex login refuses the configured models, and plan review round 2 reads that copy's diff. Proof: the copy's diff, saved as a patch in the run directory and cited by the review row.
- [ ] 1. **Tag shape and admission.** `FormatLink`, `base`, the validator's Editing exception, and refusal of a string `over`. Proof: a `marks` test refuses the old stacked shape and admits the new one, failing on next for the new shape; `pnpm --filter plitejs test:partition:authored` log.
- [ ] 2. **One recorder.** `recordFormats` serves `formattedProps` and `keptShell`; Editing replaces the Editing run on top, never withdraws and stores nothing on a plain key; Suggesting never takes an Editing tag as its own; Editing corrections keep tags; the kept shell applies the whole delta. Proof: tests for C1, C2, C7, C8, C14 and C16 fail on next and pass on the candidate; a test shows an Editing write on an untagged key stores no `authored` member; a test keeps one Editing tag however many Editing writers take turns; a test withdraws the writer's own pending property on the block their removal leaves.
- [ ] 3. **Decisions.** Links of id and write, a gone link that never stands, `base` without Editing writes, settled status, accepted tags kept while a pending tag lies over or under them, the fork rule, settling in admission's collaboration pass with or without verdicts, `acceptedValues` over standing claims, and tips read from links. The slow resolve laws give each stepped run the verdicts its earlier steps stored. Proof: tests for C3 to C6, C10 to C13 and C17 fail on next and pass; `mutate.mjs` with `docs/plans/artifacts/2026-10-17-editing-format-takeover/mutate-spec-kept.json` kills all 14 mutants; next's `exclusive-property-contract` and `text-marks-contract` specs pass.
- [ ] 4. **Collaboration and history.** Every new collaboration test runs both delivery orders and both client-id orders, then saves, reloads and decides again; `editingOverStack` keeps `alice:1`, `bob:1` and Carol's Editing tag; the mixed fork lands Alice's red; two tests pin the loss of a value accepted while a peer suggests on the property, beside it (`lateSiblingDropsAccepted`) or over it (C18); `rejectionRaceDropsEditing` and `withdrawalRaceDropsEditing` pin C15; a test undoes an Editing write over a pending suggestion, another undoes one under a stack (C13), and another undoes a suggestion under a stack and accepts the rest of its change (C17); the split and resting readers each get a test that skips an Editing tag, or a logged reason no test can see it. Proof: `pnpm --filter plitejs test:partition:authored`, `test:partition:yjs` and `test:partition:history` logs.
- [ ] 5. **Law, docs, API and changeset.** The Editing sentence in the authored law, in `docs/vision/plite.md` or in `docs/plans/topics/authored.md` once the move staged in the main checkout lands, says Editing stacks an accepted claim over pending formats and never takes back a suggestion, its writer's own included. It names the three losses this plan keeps, with task `t_b8a4ce47` and the owner as the owner of C15, and says suggestions on both sides of an Editing edit wait on each other, with task `t_7314eae0`. `plate-docs` adds one sentence on Editing over a pending format suggestion, with the C15 limit, to `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin. `best-api repair` runs on the exported `AuthoredMark` type, whose format member gains `base` and links. A plitejs changeset. Proof: the docs checks that `plate-docs` names, the `best-api repair` search, and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [ ] 6. **Hand drive of `/docs/suggestion` at desktop width.** In the page's format preview (`suggestion-format-demo`), switch to Editing and remove the bold from the sentence its seeded `bold-sentence` suggestion bolded, and see that suggestion's card stay. Reject the card, and see the sentence stay plain. Drive next first and record what its card does. The demo has one user, Alice, so this drives her own suggestion (C16's rule); another author's case runs only in the jsdom and Yjs tests. Proof: `node tooling/scripts/hand-drive.mjs check` passes, with the screenshot read.
- [ ] 7. **Gates on the final bytes.** `pnpm --filter plitejs typecheck`, the authored, yjs and history test partitions, both slow law suites (`authored-tree-recording-laws.slow.ts` and `authored-tree-resolve-laws.slow.ts`), the stack cost probe against its frozen budget, and `pnpm lint:fix` on the task's paths. Proof: one log per command; a failure that fails the same way on next names the open task that owns it.

## Proof

Every proof command runs through `node .agents/pstack/proof.mjs --dir docs/plans/artifacts/2026-10-17-editing-format-takeover`, from `packages/plitejs` unless it names another directory. Each new behavior test runs once on next at b40cebebee, where it must fail unless the Evidence section says why it passes there, and once on the candidate. The final gates run on the patch's exact bytes in a detached worktree at its base.

## Open work

- The accepted line join that blocks decisions on the same block is suggested task `t_a269db34`. owner: the owner. stop: that task lands or is dropped.
- A decision or withdrawal at the same time as an Editing write can lose the edit, as on next (C15). Suggested task `t_b8a4ce47` owns the fix, and the law and docs sentences in step 5 name the limit until it lands. owner: the owner. stop: a plan that keeps the Editing value lands, or the owner drops the task.
- Suggestions on both sides of an Editing edit wait on each other. Suggested task `t_7314eae0` owns the question. owner: the owner. stop: that task lands or is dropped.
- This plan answers the recorded-value task `t_9fd027cd`: every tag keeps next's `write`, and each link records its parent's written value. That task already waits on this card's task, so the ledger logs it `dismissed done` right after this task's `landed` row. owner: the lead. stop: the ledger shows it dismissed.
- The review-tree pivot plan's P1.3b deviation says an Editing format write replaces the key's pending values. This plan reverses that clause; the pivot plan keeps it as history. owner: the owner. stop: this plan's build lands.
