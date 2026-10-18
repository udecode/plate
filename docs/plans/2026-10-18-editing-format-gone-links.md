---
review_scopes: [authored]
review_basis: []
work_kind: implementation
review_commit: 4e332b497c6b60e09b382b82bccd37f2cbaba258
review_inputs: [packages/plitejs/src/authored/tree/layers.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/record-completion.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/authored/facts/records.ts, packages/plitejs/src/authored/facts/facts.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/changes.ts, packages/plitejs/test/authored-tree-collab.test.ts, packages/plitejs/test/authored-facts.test.ts, packages/plitejs/test/authored-tree-record.test.ts, packages/plitejs/test/authored-tree-layers.test.ts, docs/plans/topics/authored.md]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Format suggestions keep the values that landed

Status: executed
Playbook: plan

## Brief

### What will change?

An Editing edit over someone's pending format suggestion leaves it up for review, and deciding it later keeps the Editing edit. In the tested cases, undo and decisions don't bring back rejected, withdrawn or undone values. It landed on next.

### What could go wrong?

Accepted changes and Editing edits over suggestions keep records forever, so a reject among 10,000 accepted changes takes about 1.7 times next's time. Fourteen known cases give a wrong value, seven also on next. The Close lists the proof's limits.

## Teach

A pending format suggestion is a small tag on the text. It records who changed which property, the value before and the value written. A suggestion on top of another lists the tags under it.

Today an Editing edit over someone's pending suggestion deletes their tag. A tag that left is read as accepted, so rejecting the suggestion on top can bring back a value someone undid.

Now an Editing edit stacks its writer's own tag and leaves the others pending. Each accepted change and each such edit stores a small record, and undo removes it. A tag that left counts only while its record is there. An undo that takes a tag off gives what rejecting that tag gives now, so Carol's green over Alice's rejected red undoes to no color, not red. To make that work, Carol's tag stays on the text, unseen.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Editing over another author's pending format suggestion | Their suggestion stays up for review, and deciding it later never undoes the Editing edit (look) | Keep the takeover, where the Editing edit removes their suggestion and decides their whole change | take over | big |
| A suggestion under another one that left the property | It counts when it was accepted or written in Editing, and stops counting once undone. Each accepted format change and each Editing edit over a suggestion keeps one small record for good (look) | Count every one that left as accepted, as next does, which brings back an undone value once the rest of its change is accepted | read as accepted | big |
| An edit over a suggestion that is later rejected, withdrawn or undone, and then undone itself | The undo lands what rejecting the edit gives now. The edit's tag stays on the text, unseen, while a write under it neither stays nor landed, and an undo that takes a tag off sets the property to what rejecting that tag gives (look) | Drop the tag at the decision, so the undo brings back the rejected value as plain text with no card, which all three round 1 seats found | drop held tags | small |
| An edit undone or redone when its commit also typed, split, or added or removed blocks | The undo fixes each node from what it kept of it: its letters, or an element's opening. Text it joined splits where the parts need different values. Anything it did not keep, such as another writer's typing, the text of a wrapped block or a replaced block, keeps the replayed value, so a rejected value can come back (look) | Keep matching in order and list the split at a block's start as a known case | keep range pairing | small |
| A decision, or another undo, at the same time as an Editing writer's undo | Only the client that undoes fixes the value, so a rejected or undone value can stay as plain text. Suggested task t_b8a4ce47 holds the fix (look) | Fix the value on every peer whose update removes an Editing tag with its record. Review round 3 found this misses when no live peer holds that tag, and its write can beat another Editing write made at the same time | repair peer updates | small |
| Undoing a reject after the Editing edit over the suggestion was undone | The suggestion comes back without its value, so accepting it writes nothing. Suggested task t_b8a4ce47 owns this fix too (look) | When an undo puts a pending tag back alone on top, write its value again. Review round 3 found this overwrites a plain write made after the decision | put back on undo | small |
| The old value a change card shows | The value its writer saw, as on next (look) | Show what rejecting the tag gives now. Review round 3 found that value can change while the card's revision stays the same, so a decision made from a stale card still goes through | card shows rejecting | small |
| Editing writers taking turns over a pending suggestion | Each turn adds a tag that links every tag below it, so links grow with the square of the turns while the suggestion is pending. One writer's own turns join into one tag (look) | One Editing tag for all writers, which brings back a value one writer undid after another wrote over it | one tag for all writers | small |
| An Editing edit over a hidden Editing tag | Each such edit stores another small record for good, even when nothing reads it | Store no record when nothing pending lies under the edit, which needs another way to tell an undone Editing tag from a standing one | skip hidden records | detail |
| A split whose new block refuses a value a suggestion under an Editing edit could restore | The new block drops that property's tags and keeps the Editing value | Keep the tags on the new block, where the suggestion under the edit holds a value its type refuses | keep split tags | detail |
| Accepting a suggestion while a peer suggests over it | Rejecting the peer's suggestion afterwards keeps the accepted value, as next does | Lose the accepted value, as the last plan picked | lose concurrent accepts | small |
| Accepting a suggestion while a peer suggests beside it without seeing it | The accepted value is lost when the peer's suggestion is rejected, as on next. A test pins it, and the law says so | Store every accepted value on the text for good | keep beside accepts | small |
| A decision or withdrawal at the same time as an edit | It stays as on next. When the deciding peer wins the merge, the edit is lost. Two tests pin it, the law and the docs say so, and suggested task t_b8a4ce47 gets this run's fix sketch (look) | Fix it in this run, which has the document write a property value back when it merges | close the edit race | small |
| An Editing edit at the same time as a suggestion on that property | Rejecting the suggestion restores what its writer saw, as today. The law says so | Record every Editing edit, which stores a record in every document | record every edit | small |
| Suggestions on both sides of an Editing edit | They still wait on each other, though the edit fixes the value. Suggested task t_7314eae0 keeps the question | Skip the edit's other side, which broke order independence in two reviewers' probes | skip waits | small |
| A suggestion undone, then redone over a stack whose tags changed meanwhile | It lands what its writer saw, as on next. Rejecting it loses an Editing value written while it was undone. The law says so (look) | Have redo record the write again, reading the property as it is now | redo reads now | small |
| Part of a suggestion withdrawn while a peer suggests over that part, or while a peer's suggestion there is undone and then redone after the rest is accepted | Rejecting the peer's suggestion after the rest is accepted lands the withdrawn value, as on next, because one record covers every leaf a write touched | One record per leaf, which costs about 90 KB when one change over 1,000 leaves is accepted | record per leaf | detail |
| An undo or withdrawal at the same time as an accept of the same change | The undone value counts as accepted, as on next | Treat it as undone, which needs a record of every undo | count the undo | detail |
| A value accepted, then undone by its writer after it left the property | It still counts under a suggestion that comes back later, as on next | Remove its record on that undo, which ties every decision's record to each write's history | forget on undo | detail |
| Your own pending suggestion under your Editing edit | It stays up for review like anyone's, because an Editing edit never takes back a suggestion | Your Editing edit takes back your own suggestion | take back mine | detail |
| Space for stacked suggestions | About 1.2 to 2.7 times next's bytes at two to ten stacked suggestions and 54 KB at forty, plus a 90-byte record per accepted change and the edit tag a reject leaves, inside the budget frozen before measuring | Link only the nearest tag, which cannot read a gone tag's parents | smaller stacks | detail |
| Stacked suggestions saved before this change | They fail to load, as a suggestion with no stored value already does. No release ever wrote them | Add a reader that upgrades them on load | read old suggestions | detail |
| A fork after one member is rejected | The accepted member with the smallest id lands, whoever wrote last | The last writer's value lands | last writer | detail |
| Where this work shows | On the authored subject's page. The last plan stays as history | Keep the last plan's page | own page | detail |
| The authored subject's page | The page at https://claude.ai/artifact/LzfdwnVufGpA4S1r9qnDmv, which next's root-deletion run published once the old one at https://claude.ai/artifact/9cWhXkwmQrpyrwSVkbZkcM stopped opening | This run's own replacement at https://claude.ai/artifact/SWetTm2CndTk914mZiqkQv | use this run's page | detail |
| Who writes the code | I write the code and its tests, because the change is a collaboration rule whose cases live in this run | A code worker writes them in its own worktree, and I review every line, caller and test | delegate | detail |
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

Plite's DOCX export of a stack with an Editing tag on top writes a format revision whose old and new values are both the Editing value. The pending suggestion under it has no OOXML form, because OOXML keeps one previous property set per run (inferred from `w:rPrChange`).

## Document shape

Admission's validator, every decision, the change cards, Yjs and saved documents read a stacked suggestion. Yjs merges `authored` as a set of whole members and each record set as a map keyed by record id.

Bob's blue over Alice's pending red, on next and after:

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
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "blue" } }
  ]
}
```

Carol's Editing green over Alice's pending red deletes Alice's tag on next. After this change, Alice's tag stays, Carol's accepted tag goes on top, and Carol's commit stores one landed record for its write:

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
    { "id": "carol-w:1", "key": "color", "kind": "format", "change": "~edit:carol", "author": "carol", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "green" } }
  ],
  "records": { "authored-landed": { "carol-w:1": { "at": 1000, "change": "~edit:carol" } } }
}
```

Rejecting Alice's red under Carol's Editing green leaves Carol's tag and record, where next stores no tag, so a later undo by Carol reads that Alice's red is gone:

```json before
{ "text": "word", "color": "green" }
```

```json after
{
  "text": "word",
  "color": "green",
  "authored": [
    { "id": "carol-w:1", "key": "color", "kind": "format", "change": "~edit:carol", "author": "carol", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "green" } }
  ],
  "records": { "authored-landed": { "carol-w:1": { "at": 1000, "change": "~edit:carol" } } }
}
```

Accepting `alice:1` once nothing pending lies under her tag removes the tag and stores one landed record for the commit that wrote it, however many leaves that commit wrote. The record names the change's `inc` too when it has one:

```json before
{ "records": { "authored-verdicts": { "…": "…" } } }
```

```json after
{ "records": { "authored-verdicts": { "…": "…" }, "authored-landed": { "alice-t:1": { "at": 1000, "change": "alice:1" } } } }
```

Every format tag one commit writes shares that commit's write id, so the record names the write. An Editing write on a property with no pending tag stores nothing, as today. When Editing writers take turns over a pending tag, each turn stacks its own tag, linked to every tag below it.

## Hard cuts and app migration

Nothing public is removed, and apps change nothing. The stored shape of a stacked format suggestion changes and admission refuses the old one, as it already refuses a format tag with no `write`. No plitejs release ever wrote either shape: npm lists only plitejs 0.0.1, published 2026-08-26 (`npm view plitejs time`, read 2026-10-17). The new `authored-landed` record set saves with the document like the other review records.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo of an Editing format write over a pending suggestion | Undo removes the stacked Editing tag and its landed record and restores the value. Alice's suggestion stays pending, and a suggestion stacked over the undone write reads it as gone. When a write under the tag left without landing since, the undo lands what rejecting the tag gives now, on every block that kept its content. A block the commit replaced gets none of the old values | jsdom and Yjs tests in step 4 |
| Redo of a suggestion over a stack | It lands what its writer saw, a named limit | the Yjs tests in step 4 |
| Undo and redo of a decision | Undo removes the decision's landed records with its verdicts, and redo puts them back | jsdom tests in step 4 |
| Collaboration | Two and three peers converge on the same tags, records and value in both delivery orders and both client-id orders, before and after a save and reload | Yjs collaboration tests in step 4 |

## Main changes

- An Editing format write over a property that holds pending tags replaces its writer's own Editing tag on top, if there is one, with one accepted tag under the writer's reserved Editing change, written over every tag below it. Another Editing writer's tag stays, and the new tag stacks over it. The Suggesting tags stay. An Editing write never withdraws. A Suggesting write never counts an Editing tag, or its writer's own accepted tag, as its own run. The mark validator lets an Editing tag stay stored only when it is written over at least one tag. An Editing write on a property with no tags stays a plain write.
- Each recording mints one write id, the id of every format tag it writes, across every draft step and root it records. A tag only needs an id unique within its node and key, and split copies already share one. Cut ids keep `createTagId`.
- A new record set, `authored-landed`, maps a write id to the change and incarnation that wrote it. The recorder stores one whenever an Editing commit writes a format tag, the kept shell's included. `decideKey` reports the write ids of the accepted Suggesting tags it removes, and its callers that remove tags store them: `decideFormats` in the decision's own change, `settleFormats` in admission's repair, and `acceptOwn` in the recorder's commit. Projections store none. A record counts only while its change is accepted or is an Editing change, so undoing a decision voids its records even where a peer stored a copy. An Editing tag stands only while its own record exists, and the commit that writes it counts its own write as landed. The set uses default history, so undo and redo carry each record with the commit that stored it.
- A stacked tag stores its links grouped by step, bottom step first, each link with the tag's id and written value, plus `base`, the key's value with every tag on it undone. A link to a tag no longer on the key stands when its write has a landed record that counts. Rejecting a tag lands its `before` when the top step under it stands whole. Otherwise it lands the written value of the smallest-id standing link in the highest step that has one, or `base`. The change card's `before` stays the value its writer saw.
- A step with a pending tag keeps all its tags, fork siblings included. An accepted or Editing tag stays stored while a pending step lies under it, or while a write under it neither stays on the key nor landed, because a later undo of it reads that write. A pending tag over it reads it through its landed record, so decisions and admission drop it once neither holds. A decision's blocked result and its waits name only pending changes.
- Undo and redo run no recorder, so admission repairs them. On each key where an undo or redo removes format tags, adds none and changes the value, the key takes what deciding its old tags gives with the removed ones rejected, unless that waits on a pending tag. A peer's update gets no repair. Each node the replay changed takes its repair from the nodes its kept tokens came from before the replay, as `docs/plans/2026-10-18-undo-repair-nodes.md` builds. A text leaf reads its kept characters, and an empty leaf or an element reads its kept opening. A leaf joined from pieces that repair differently splits at their edge. Characters with no kept token keep the replayed value.
- A fork that loses a member to a reject lands the written value of the accepted member with the smallest id.
- `recordFormats` in `layers.ts` records every format write, Editing and Suggesting, command and correction. Completion's kept shell calls it and applies its whole delta. An Editing correction keeps every tag and stores nothing.
- `writeLayer` reads `base` from the bottom step. `acceptedValues` reads the standing claims and gives `reviewOf` its accepted values and DOCX export its previous values. `restoredBy` also reads each link's written value. The reader of resting changes skips Editing tags. The split reader drops a key's tags when the new block refuses a value any of them could restore, an Editing tag's links included.
- Accepting a step still waits on every pending step below it.

## Evidence

### What the code does today

The cases come from the gone-link design brief (`docs/plans/artifacts/2026-10-17-editing-format-takeover/arena2/brief.md`). "Build" is the last plan's build at commit 18e63955899f4d8e9d7875d05ddab56812ef3837, and next is b40cebebee406953abdb72ff277fad4849435f0e. Each case starts with Alice, Bob and Carol on one leaf with no color.

| Case | Build | Next | After this plan |
| --- | --- | --- | --- |
| G1, Bob undoes his blue over Alice's red, her change is accepted, Bob redoes, reject Bob | none | red | red |
| G2, as G1 with Carol's Editing green under Bob and Alice's change rejected | none | green | green |
| G3, Alice decides her red while Bob suggests over Carol's green | none | green | green |
| G4, as G3 with Alice undoing her red instead | none or green by order | green | green in every order |
| G5, as G4 with Alice suggesting before Carol's settle reaches her | none | green | green |
| G6, a settle reaches a third peer before Bob's suggestion over the accepted red | none | red | red |
| G7, an accept while Bob suggests over it unseen (C18) | none | red | red |
| G8, a fork under Dave's suggestion, then Alice undoes the tag under the fork | green | blue | blue |
| G9, Alice undoes her red under Bob's blue and the rest of her change is accepted (C17) | none | red | none |
| G10, Carol undoes her green under Bob's blue (C13), then Alice undoes her red | red, then none | green | red with Alice pending, then none |
| G11, Alice's red rejected or withdrawn under Bob's blue | none | none | none |
| C15, a decision or withdrawal at the same time as an Editing write | none or green by merge winner | the same | the same, a named limit |
| R1, Carol's Editing green over Alice's red, Alice's change rejected, then Carol undoes | red, plain | red, Alice pending | none |
| R2, as R1 with Alice undoing her red instead | red, plain | red, Alice pending | none |
| R3, Bob's blue over Alice's red, Alice undoes, then Bob undoes | not run | red, plain | none |
| R4, Alice undoes and redoes her red under Carol's green, then her change is rejected, with Bob's blue on top rejected first or no Bob | green, or none without Bob | green | green |
| R5, Bob undoes his blue over Alice's red, Carol's Editing green, Alice's change accepted, Bob redoes, reject Bob | none | red | red, a named limit |
| R6, as R1 with Carol's commit also inserting a block before or after Alice's | not run | not run | none |
| R7, Alice's red over a plain blue, Carol's Editing commit replaces that block with another, Carol undoes and redoes | not run | not run | the new block with no color |
| R8, as R1 with Carol's commit also typing into the leaf or splitting its block | not run | not run | none |
| R9, Bob suggests blue and bold in one commit, changes the blue to yellow and undoes that, then his change is accepted | not run | not run | blue and bold |
| R10, Bob's Editing yellow forks with Carol's Editing green over Alice's red, Carol undoes, Alice's change is rejected | not run | not run | yellow |
| R10b, as R10 with Bob suggesting blue instead, and Bob undoes | not run | not run | green |
| R11, Bob's Editing yellow over Carol's Editing green over Alice's red, Carol undoes, Bob undoes, Alice's change is rejected | not run | not run | yellow, red, then none |
| R12, Alice rejects or undoes her red, or Bob rejects it, while Carol undoes her green | not run | not run | red as plain text, a named limit |
| R13, Alice's change accepted under Carol's green, then Carol undoes and Alice undoes her accept, then rejects | not run | not run | red pending, then none |
| R13b, as R13 with Alice's change rejected, then accepted after both undos | not run | not run | Alice pending with no color, then no color, a named limit |
| R14, as R1 on a block property with a block inserted or removed before it | not run | not run | none |
| R15, Bob accepts Alice's red, Carol's Editing green, then Bob undoes his accept | not run | green, Alice pending | green, Alice pending |
| R16, as R1 with Carol's commit also pressing Enter at the block's start | not run | red, Alice pending | none, through `docs/plans/2026-10-18-undo-repair-nodes.md` |
| R17, as R12 with two or three Editing writers undoing at the same time as the reject | not run | red, Alice pending | an undone Editing value or red, as plain text, a named limit |

The round 2 probes (`docs/plans/artifacts/2026-10-17-editing-format-takeover/r2-probes-build-a1.log`, `r2-probes-next-a1.log`) reproduce G1 to G3 on the build and on next. Plan review round 1's probes give R1 to R5 on the build, on next and on the candidate (`seat-probe-build.log`, `seat-probe-nextbase.log`, `seat-probe-w1.log`, and seat C's `probe-p3-undo-redo-a1.log` and `probe-p4-undo-redo-nostack-a1.log` for R4 on the build). The last plan's cases C1 to C14, C16 and C17 keep the outcomes its Evidence table gave (`docs/plans/2026-10-17-editing-format-stack.md`). C18 flips to keep the accepted value, as next does. The authored record suite failed the same five tests under "rejecting a pending property change after Enter places the tail in another slot" on next and on the build (`record-baseline-next-a1-a1.log`, `record-baseline-build-a1-a2.log`), because their fixture tags held no written value. This build gives them one, and they pass. Review round 2 of the build found R9 to R14 and the replaced-block case of R7, and each of their tests fails on the build under review at f3215d59 (`r2-regressions-candidate-a1.log`). Review round 3 found R13b and R15 to R17, and a card read gone stale while its revision stayed the same. The peer repair round 2 added for R12 and the put-back it added for R13b overwrote other writes, so both are reverted and each case is a named limit. The card's `before` goes back to the value its writer saw. R16 goes to the next plan (`r3-seat-a-*.log`, `r3-seat-b-*.log`, `r3-seat-c-*.log` and `r3-b4-*.log`).

### Stack cost

The budget in `docs/plans/artifacts/2026-10-17-editing-format-takeover/stack-cost-budget.md` holds for stacked tags, and `gone-links-budget.md` beside it adds the landed records and gone links, frozen before this target was measured. The next column is next's stored bytes (`stack-cost-next-a1.log`). The after column is `gone-links-bytes-a1.log`'s transform of the build's stacks, so step 7 measures the candidate's own bytes:

| Cohort | Depth | Bytes, next | Bytes, after | Budget |
| --- | --- | --- | --- | --- |
| normal | 2 | 301 | 371 | at most 2x |
| normal | 3 | 470 | 670 | at most 2x |
| large | 5 | 808 | 1,448 | at most 3x |
| stress | 10 | 1,653 | 4,443 | at most 5x |
| pathological | 40 | 6,812 | 54,437 | at most 256 KiB |

One landed record with production-sized ids takes 90 bytes. An Editing tag a reject leaves on the text keeps the bytes it had, a line frozen in `gone-links-budget.md` before measuring. The timing lines and the record counts run on the build's final bytes in step 7.

### Performance

- applicability: applied
- questions answered: cohorts, repeated unit, memory and DOM; interaction latency covers the decide call only, and native behavior covers undo, redo and collaboration
- repeated unit: a format tag on one key, and a landed record per accepted or stacking Editing commit
- cohorts: stack depth 2, 3, 5, 10 and 40; 1, 10 and 1,000 leaves per accepted commit; a depth 10 and 40 stack whose lower tags all left the key
- budgets: `stack-cost-budget.md` and `gone-links-budget.md`
- interaction metrics: decide time as the median of 7 runs after a warm-up; no typing path changes, because recording a write adds one id per commit
- memory tags: bytes on the key and bytes of records; no DOM changes
- degradation contract: N/A, no rendering mode changes
- dashboard and RUM gap: no production detector covers authored review, so the claim is lab-only
- plan delta: the count lines run as authored partition tests, and the timing lines rerun on the final bytes with a planted control each

### Comparison

The gone-link arena's three runners and cross-judge (`docs/plans/artifacts/2026-10-17-editing-format-takeover/arena2/synthesis.md`). The controls that add no artifact are the build's rule and next's:

| Target | Stores | Reads a tag that left | Fails |
| --- | --- | --- | --- |
| Build: a gone link never stands | nothing | as gone | G1 to G8 |
| Next: a gone link reads as accepted | nothing | as accepted | G9, G10 |
| Void ledger | a record per undone or withdrawn part of a change, and each link's incarnation | accepted unless voided | G4 by pass order, as the judge traced |
| Receipts | a record per removed accepted tag, per leaf for Editing | by receipt | none traced; 68 KB per 1,000-leaf Editing write |
| Landed writes (picked, with grafts) | a record per accepted or stacking Editing commit, and an Editing or accepted tag over a write that left without landing | by landed record | R1 to R3 without the tag it keeps, as plan review round 1 found |

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editing format write over pending tags | removes the tags it read | stacks an accepted Editing tag over every tag on the key | `recordFormats`, `layers.ts` | the law says Editing leaves every other author's claims pending | `editingOverStack` keeps all three tags | step 2 tests | another author's card stays after an Editing edit | rearchitect |
| Format tag links | string ids, a missing id reads as accepted | steps of links with id and write, plus `base` | `layers.ts`, `marks.ts` | a rejected, withdrawn or undone value never returns (G9 to G11) | admission refuses the old stacked shape | steps 1 and 2 tests | links grow with stacks | rearchitect |
| Whether a gone tag's value counts | not stored | a landed record per write, inverted by undo | `records.ts`, `decideKey`, the recorder | an accepted or Editing value survives its tag (G1 to G8) | a new record set saved with the document | steps 1, 2 and 4 tests | one 90-byte record per accepted commit for good | rearchitect |
| Format tag ids | one per tag | one per commit | the recorder | one record per accepted commit, whatever the leaf count | none | step 1 count test | a part withdrawal racing a stack | rearchitect |
| Accepted tags in decisions | a pending step | settled, stored while a pending step lies under them | `decideKey`, `settleFormats` | C3 to C6, C10 | none | step 2 tests and mutants | none found | rearchitect |
| Fork after a reject | the value under the fork | the smallest-id accepted member's write | `decideKey` | C3, C4 | none | step 3 test | none found | rearchitect |
| Change card `before` | `tag.before` | unchanged | `changes.ts` | a computed `before` changed without the card's revision, review round 3 found | none | existing tests | the card can show a value a reject no longer brings back, as on next | keep |
| Undo of a tag over a write that left | restores what its writer saw | what rejecting the tag gives now | `decideKey`, admission | a rejected or undone value never comes back as plain text (R1 to R3) | none | step 4 tests and mutants | an unseen Editing tag stays on such text for good | rearchitect |
| Accept dependency | waits on every pending step below | unchanged | `decideKey` | public decision law the ask leaves alone | none | existing tests | none | keep |

### Challenge delta

The last plan, `docs/plans/2026-10-17-editing-format-stack.md`, kept another author's tag by reading a gone link as never standing. Its plan review round 2 replaced that reading. All three seats found that a decision or undo dropping a settled Editing tag loses the Editing value, and seat A found that a redo over a dropped accepted tag loses that value. The lead reproduced both on the build and found next keeps the value (`r2-probes-build-a1.log`, `r2-probes-next-a1.log`). The delta is `replaced`. The rejected target is the stack with gone links that never stand, and the new one is the stack with landed records. This plan's review round 1 found that an undo after the write under it left brings that value back as plain text, so the plan keeps such tags and repairs the replay.

## Steps

Execution playbook: Build. One phase lands everything, and it ends with a keep or revert decision on the gates in step 7.

- [x] 0. **Build in the task worktree.** The build starts in a scratch copy at next 4e332b497c with the last plan's build applied (`docs/plans/artifacts/2026-10-17-editing-format-takeover/stack-build-r2b.patch`, three-way), then moves into this task's worktree and merges next's latest before any final gate. Proof: the worktree's diff against next at each review, saved as a patch in the run directory.
- [x] 1. **Stored shape and records.** One write id per recorded commit. `over` as steps of links. `base` with every tag undone. The `authored-landed` record set, with its parser in the one table that `assertRecordWrites` and `assertRecordStore` read, refusing a value that is not an object. Proof: a `marks` test refuses a flat `over` and admits steps; a records test refuses a malformed landed record; a count test accepts one format change written in one commit over 1, 10 and 1,000 leaves and finds exactly one landed record each time, and the planted per-leaf id fails it.
- [x] 2. **Reading and landing.** `IsLanded` in `KeyReading`; `replacedValue`; the kept rule without a pending tag above; waits on pending tags only; `decideKey` reporting removed accepted writes, stored by `decideFormats` and `settleFormats`; the recorder's Editing landing. Then the hold rule and the replay repair. Proof: tests for G1 to G11 and R1 to R4 through `rejectInBothOrders` or both delivery orders, each failing on the build, on next or under a step 3 mutant and passing on the candidate; G5 and G11 pass on both baselines, so they stay only where a mutant fails them; a test that C5's blocked result names only `bob:1`; a count test that an Editing commit over pending tags on 1,000 leaves stores one record; the layers order law carries each step's landed writes and the Editing landings.
- [x] 3. **The rest of the reading.** `restoredBy` with link writes, the fork rule, and the split and resting readers. Proof: a fork test; a test for each reader, which fails with its Editing rule removed; `mutate-final.mjs` in the run directory, which runs the authored tests with no mutant first and then with each mutant, each removing one mechanism, and each mutant fails a named test or carries a logged reason.
- [x] 4. **Collaboration, history and reload.** Every new collaboration test runs both client-id orders. Nine also run both delivery orders and decide again after a save and reload, and the round 2 regression tests run both delivery orders, except the one for a redo that replaces a suggested block. G6 uses a relay that delivers one update first. `editingOverStack` keeps all three tags, C18 keeps the accepted value, `lateSiblingDropsAccepted` pins the beside case, and `rejectionRaceHoldsEditing` and `withdrawalRaceHoldsEditing` pin C15. Tests undo and redo an Editing write over a pending suggestion and a decision over a stack. Proof: `pnpm --filter plitejs test:partition:authored`, `test:partition:yjs` and `test:partition:history` logs.
- [x] 5. **Law, docs, API, changeset and suggested tasks.** The Rules in `docs/plans/topics/authored.md` say Editing stacks an accepted claim over pending formats and never takes back a suggestion, its writer's own included. They say a decision keeps an accepted claim while a pending one lies under it and records each landed format write. They name the nine known cases this plan leaves wrong, seven as on next, and say an undo lands what rejecting its tag gives now. `plate-docs` adds one sentence on Editing over a pending format suggestion, with the decision-race limit, to `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin. `best-api repair` runs on the exported `AuthoredMark` type, whose format member gains `base` and stepped links. A plitejs changeset. The suggested-task ledger logs this card's task t_80279835 as landed and dismisses t_9fd027cd, the recorded-value question this plan answers, so the tasks that waited on this card stop waiting. t_b8a4ce47 gains the put-back sketch from the arena synthesis. Proof: the docs checks `plate-docs` names, the `best-api repair` search, and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [x] 6. **Hand drive of `/docs/suggestion` at desktop width.** In the format preview, switch to Editing and remove the bold from the sentence its seeded suggestion bolded, and see that suggestion's card stay. Reject the card, and see the sentence stay plain. Drive next first and record what its card does. The demo has one user, so this drives her own suggestion; another author's case runs only in the jsdom and Yjs tests. Proof: `node tooling/scripts/hand-drive.mjs check` passes, with the screenshot read.
- [x] 7. **Gates on the final bytes.** `pnpm --filter plitejs typecheck`, the authored, yjs and history partitions, both slow law suites, the stack cost probe and the gone-link timing lines against their frozen budgets with a planted control each, and `pnpm lint:task` on the task's paths. A conclusive timing miss sends the design back to `architect`. Proof: one log per command; a failure that fails the same way on next names its owner.

## Proof

Every proof command runs through `node .agents/pstack/proof.mjs --dir /Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-17-editing-format-takeover`, from `packages/plitejs` unless it names another directory. Each new behavior test runs once on next at 4e332b497c, where it must fail unless the Evidence section says why it passes there, and once on the candidate. The final gates run on the patch's exact bytes.

## Close

- Diff review round 3 reverted two fixes round 2 had added. The undo put-back of a lone pending top tag overwrote a plain write made after the decision, so undoing a reject after the Editing edit over it was undone brings the suggestion back without its value (R13b). The repair of peer updates failed when no live peer held the Editing tag, so a decision or another undo at the same time as an Editing writer's undo leaves the value as plain text (R12, R17). Both are named limits, and t_b8a4ce47 owns their fix.
- The change card's old value went back to the value its writer saw (C2), because the value rejecting a tag gives can change while the card's revision stays the same.
- R16, an undo whose commit also pressed Enter at the block's start, moved to its own plan, `docs/plans/2026-10-18-undo-repair-nodes.md`, which landed in the same commit.
- The arena ran with no Codex runner, and plan review round 1 and diff review round 2 seated Opus in place of both Codex seats, so those three reviews were one model family. Diff review round 3 and the undo plan's six review rounds seated both Codex models.
- Step 5 wrote its follow-ups as lines of `docs/plans/backlog.md`. Next's commit b8fb01f798 restored the suggested-task ledger and deleted that file, so the lines became ledger tasks, t_b8a4ce47's put-back sketch included.
- Step 7 compared the recording law failures with next c83502bc25, the commit of next this branch merged.
- Step 7 added a timing line after the final run. The frozen plant that scans every landed record passed the depth 10 and 40 reject lines, because those stacks hold only 9 and 39 landed records. So a reject after 10,000 earlier accepts got its own line, 1.5 times next plus 1 ms, frozen before the candidate ran.

What landed, with the undo repair in one commit on next:

- An Editing format write over another author's pending format suggestion stacks the writer's own accepted tag over it and leaves the suggestion pending. Deciding the suggestion later never undoes the Editing value. A writer's later Editing turns join their own tag.
- A stacked tag stores its links in steps with their written values, plus `base`. Each accepted format commit and each Editing commit over pending tags stores one record in the new `authored-landed` set, and a link to a tag that left stands only while its record counts. Undoing a decision voids its records.
- Undo and redo that take a tag off set the property to what rejecting that tag gives now, node by node.
- The Rules in `docs/plans/topics/authored.md`, a sentence in `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese translation, and a plitejs changeset say so and name the known misses.

Proof and its limits:

- Each G, R and C case in Evidence has a test that fails on the last build, on next or under a mutant and passes on the final bytes. Of 35 mutants of the landed-writes mechanisms, 32 fail a named authored test, and the decision log gives the reason each of the other three survives. The count tests find one landed record for one commit over 1, 10 and 1,000 leaves, and the per-leaf id plant fails them.
- In step 6's hand drive of `/docs/suggestion` and `/cn/docs/suggestion`, an Editing un-bold over the seeded bold suggestion keeps its card, and rejecting the card leaves the sentence plain. On `/docs/yjs`, a split and a bold reach the other editor equal and undo back. The demo has one user, so another author's case runs only in the jsdom and Yjs tests, and the discussion count stays stale after the reject, as on next after an accept.
- On the final bytes, step 7's typecheck, `pnpm lint:task`, the authored, yjs, history, core and diff partitions, the resolve laws and the registry check pass. The recording law suite fails the same two laws as next, which t_cbe5346a and t_820a6175 own.
- Against next c83502bc25, accepting one change over 1,000 leaves takes 1.023 times next's time, under the budget of 2. Every stacked-tag byte line passes. Rejecting the top of a stack passes at depths 2, 3, 5 and 10, and at depth 40 its median of five rounds is 46.5 ms against a 50 ms limit, with 2.6 ms of same-code noise, bound by core's copying and freezing of the 54 KB on the key (inferred from a profile). The gone-link rejects take about 1.1 ms against 5 and 50 ms. The 150 ms delay plant fails every line.
- The many-records reject line is inconclusive in two runs. The candidate's median, 11.15 and 11.46 ms, is over its limit of about 10.7 ms with 0.8 to 0.9 ms of same-code noise, and the scan plant cannot be told from the candidate. Core rebuilds the whole records JSON on each commit that writes a record, and the landed records double the store, so this reject takes 10.9 ms on the final bytes and 6.0 ms on next in a profiled run. t_541200bb settles the line, and t_a7c7c429 owns the core cost.

Counts: 8 of 8 steps done, and three review rounds, round 1 on the plan and rounds 2 and 3 on the diff.

## Open work

- A decision or withdrawal at the same time as an Editing write can lose the edit, as on next (C15). Suggested task t_b8a4ce47 owns the fix and holds the arena's put-back sketch. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A wrong value can still come back after an undo in four cases. Characters another writer typed keep the replayed value, and so do a block whose opening the undo replaced and the text of a block the undone commit wrapped or unwrapped. Undoing an Editing commit that replaced a block brings back the old block with any format another author then suggested on the new one. Suggested task t_128bbd1d decides these four. owner: the owner. stop: t_128bbd1d lands or is dropped.
- A decision or undo at the same time as an Editing writer's undo leaves a rejected or undone value as plain text (R12, R17), and undoing a reject after that undo brings the suggestion back without its value (R13b). Suggested task t_b8a4ce47 holds both. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A partial withdrawal racing a suggestion over it gives a result that depends on decision order, and next gives the withdrawn value in both orders. A host that drops a document's records loses its Editing values with no error. The discussion button keeps a stale count after a decision that changes only `authored`, as on next. Suggested tasks t_a0284bee, t_f1233d76 and t_1ccd8173 hold them, in that order. owner: the owner. stop: each task lands or is dropped.
- Suggestions on both sides of an Editing edit wait on each other. Suggested task t_7314eae0 owns the question. owner: the owner. stop: t_7314eae0 lands or is dropped.
- The accepted line join that blocks decisions on the same block stays with suggested task t_a269db34. owner: the owner. stop: t_a269db34 lands or is dropped.
- The many-records reject line of step 7 is inconclusive, and its next probe counts landed-record reads before it times the line again on a quiet host. Suggested task t_541200bb runs it, and t_a7c7c429 owns core's rebuild of the records JSON on each record write. owner: the owner. stop: each task lands or is dropped.
- The recording law suite fails two laws, the same way on next. Suggested tasks t_cbe5346a and t_820a6175 own them. owner: the owner. stop: each task lands or is dropped.
