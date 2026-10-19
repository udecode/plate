---
review_scopes: [suggestions, authored]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 51f3a53b665263bd0b0ae81b99978f542eede86f
review_inputs: [packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/facts/facts.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/types.ts, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/proposed.ts, packages/plitejs/src/authored/facts/editing.ts, packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts, packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.authored-tree.spec.ts, packages/plitejs/test/authored-tree-commands.test.ts, packages/plitejs/test/authored-tree-collab.test.ts, packages/plitejs/test/authored-facts.test.ts, packages/plitejs/test/authored-tree-decisions.test.ts, packages/plitejs/test/authored-tree-marks.test.ts, packages/plitejs/test/yjs/authored-admission-contract.spec.ts, docs/editor-behavior/scenarios/suggestions.md, docs/plans/2026-10-13-review-tree-pivot.md, docs/vision/plite.md]
---

# What an Editing deletion does once no join holds it

Status: superseded by docs/plans/2026-10-17-join-keeps-target.md, after the plan panel found the landing rule below cannot meet the frame law, decision-order independence or local inverse undo
Playbook: plan

**Pursue. An Editing deletion never waits in storage, and the join's own landing rule decides the line type it keeps.** The review-tree pivot added a hold so that deleting, in Editing, the whole line a pending join merges into still lets the join keep that line's heading type (`docs/plans/2026-10-13-review-tree-pivot.md`, P1.3b). Diff panel round 3 removed the lapse that applied such a deletion once its join went away. The hold also breaks the law that Editing accepts the writer's own claims in the same commit (`docs/vision/plite.md:381-382`). Measured at `51f3a53b66`, it breaks more than the task's two open questions. A mounted editor draws the stored deletion as live text, so Editing's Backspace looks like it did nothing (S13). Deleting a whole plain heading beside a pending join breaks the frame law, and so does a chain of two joins. A peer that deletes before the join reaches it lands a paragraph. With Ann's pending text in the line, the hold blocks both accepting and rejecting the join. The design drops the hold. A join keeps its target's type unless deletions older than the join take every piece of the target, and an older deletion that would do that is decided together with the join. Settle removes a deleted inline element as the resolver does. Suggested task t_dd0dd0bd asked the question, and this continues the open Pursue of the `suggestions` and `authored` scopes, `2026-10-12-suggestions-complete`.

## Brief

### What will change?

Deleting in Editing mode removes the text at once, links included, even next to a suggested line join. A joined line keeps its heading unless deletions suggested before the join took that whole line.

### What could go wrong?

Accepting a suggested deletion of a whole line waits for a suggested join into that line, so you decide both together. Undo your deletion after someone accepts that join, and your text comes back after the joined text.

## Teach

In Suggesting mode every edit waits as a pending change for a reviewer. In Editing mode an edit applies at once, like a plain editor. A suggested line join is pending too. Once someone accepts it, the joined line takes the type of the line it merges into, such as a heading.

Today, when you delete in Editing the whole line a pending join merges into, the editor keeps your deletion stored so the join still sees content there. The editor draws that stored text as if nothing happened. A later review leaves a deleted link behind, and a suggestion typed into the line breaks the hold.

Now your deletion applies at once. The join keeps the line's type unless deletions suggested before the join took all of that line. A review also removes a deleted link along with its text.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| An Editing deletion next to a pending join | It applies at once, like a plain editor (look) | It waits in storage until the join is decided, as today | hold | big |
| The line type a join keeps | The line keeps its type unless deletions suggested before the join took all of it (look) | The line always keeps its type, and a merge into a line that shows nothing deletes that line instead; its first try broke four tests | never flip | small |
| A join into a line whose suggested text was rejected | The joined line keeps the heading (look) | The joined line becomes a paragraph, as today | paragraph | small |
| Accepting an older deletion of a whole line alone | It waits for the join, so you decide both together (look) | It applies alone, and the order you accept in changes the line type | alone | small |
| A deleted link a review settles | It goes with its text (safe) | It stays as an empty link, as today | keep links | small |
| A deleted whole line a review settles | Left for its own task (safe) | Removed in this change too | blocks | detail |
| Undo of your deletion after a peer accepts the join | Your text comes back after the joined text, left to its own task (look) | Fix how undo maps over a peer's decision in this change | undo order | small |
| A stored Editing deletion from before this change | Refused on load, since no release stored one (look) | Applied on load | apply | small |
| How the design is picked | A design arena, a judge, then a panel on the plan | My own design pass | fast | detail |
| Where the verdict is recorded | In this plan, under the open suggestions review | A new review question | scope | detail |

## What other editors do

Read from local clones on 2026-10-17: prosemirror-suggest-changes `653fba7`, prosemirror-commands `52a84a8`, Slate `945a484df`, Lexical `dd5c41b13` and Tiptap `91c51be53`. The one open suggestion engine keeps the earlier line's type on an accepted join even when that line is empty, and applies a direct edit at once with nothing deferred.

| Editor | Block type after a join into an empty line | Block type after a join into a line with content | Direct edit beside a pending suggestion | Source |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes | The earlier line's: accepting runs deletions first, then joins each boundary with no emptiness check | The earlier line's | Applies at once; nothing keeps deleted text for a pending join | `src/commands.ts:110-124`, `src/withSuggestChanges.ts:207` |
| ProseMirror commands | The later line's: `joinBackward` deletes the empty earlier line | The earlier line's | No suggestions | `src/commands.ts:438-452` |
| Slate | The later line's: `mergeNodes` removes an empty earlier element | The earlier line's | No suggestions | `src/transforms-node/merge-nodes.ts:135`, `src/editor/should-merge-nodes-remove-prev-node.ts:11` |
| Lexical | The later line's, when both share a parent | The earlier line's | No suggestions | `packages/lexical/src/LexicalSelection.ts:1813-1828` |
| Tiptap | Inherits ProseMirror's `joinBackward` | The earlier line's | No open track-changes package in the clone | `packages/core/src/commands/join.ts:59` |

Plain editors give an empty earlier line's place to the later line, which is the rule a Plite plain merge follows too. A suggested join is different: the line it merges into had content when the join was made, which is why prosemirror-suggest-changes keeps its type and why this design keeps it unless older deletions took that content.

## Document shape

Bob deleting, in Editing, the whole heading Alice's pending join merges into. The resolver, settle, admission and every peer read this stored shape.

```json before
[
  { "type": "heading", "children": [
    { "text": "ab", "authored": [{ "at": 1000, "author": "bob", "change": "~edit:bob", "kind": "delete" }] }
  ] },
  { "type": "paragraph", "authored": [{ "at": 999, "author": "alice", "change": "alice:1", "kind": "join" }], "children": [{ "text": "cd" }] }
]
```

```json after
[
  { "type": "heading", "children": [{ "text": "" }] },
  { "type": "paragraph", "authored": [{ "at": 999, "author": "alice", "change": "alice:1", "kind": "join" }], "children": [{ "text": "cd" }] }
]
```

Carol's suggested deletion of a whole link, accepted by a verdict and settled on load. Settle writes this shape for every peer.

```json before
[{ "type": "paragraph", "children": [
  { "text": "see " },
  { "type": "link", "url": "u", "authored": [{ "at": 1, "author": "carol", "change": "carol:1", "kind": "delete" }], "children": [{ "text": "" }] },
  { "text": " now" }
] }]
```

```json after
[{ "type": "paragraph", "children": [{ "text": "see  now" }] }]
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One rule for the type a join lands with, read by the resolver's landing loop and the proposed projection | Plite | `plitejs`, `src/authored/tree/resolve.ts` | Today the landing loop and `proposedKeepsContentAtJoin` each decide it, and the hold patches the gap between storage and the join's history |
| Settle removes an inline element whose own deletion is accepted once none of its content survives | Plite | `plitejs`, `src/authored/facts/settle.ts` | Settle must write what the resolver's survival rule already computes |
| The validator refuses a stored Editing deletion | Plite | `plitejs`, `src/authored/tree/marks.ts` | No recorder writes one once the hold is gone |

## Hard cuts and app migration

The hold is deleted: `joinHeldLines`, `lapsedHeldLines`, `heldByPendingJoins`, `heldByJoinsAt`, the resolver's local `heldDeletion`, `survivalAfter`, `subtreesOf` and settle's `heldByJoin` pass field, all internal. The stored shape it allowed, an Editing `delete` claim, is refused on load like an Editing `insert` is today. No release stores the review tree (plitejs 0.0.1 and platejs 54.0.0-beta.1 predate the pivot, read from npm on 2026-10-17), so no app or copied registry component changes. The search for stored Editing deletions found only the tests listed in step 1.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo of an Editing deletion beside a pending join | Undo restores the deleted text through local inverse history, as for any Editing deletion, instead of removing a stored claim. After a peer accepts the join, the text comes back after the joined text (`cdab` for `abcd`); at HEAD the same undo revives the decided join instead. Both are history rebasing over a peer's decision, left to its own task | bun tests over two Yjs peers in `authored-tree-collab.test.ts`; the limit in `probe-undo-head-a1.log` and `probe-undo-r2-a1.log` |
| Caret after the deletion | The caret sits in a truly empty line, so no reader has to skip stored text | bun tests through the command harness; no browser drive |

## Main changes

- `resolveAuthoredChildren` in `packages/plitejs/src/authored/tree/resolve.ts` lands a pending join with its target's type unless the target held content and none of it survives the accepted deletions older than the join. A target with no content keeps its type. When every piece of the target sits under older pending deletions, the join and those deletions wait on each other. A rejected split's rejoin keeps the old rule. The proposed projection reads the same rule; today it lands a paragraph where the resolver lands a heading for a line with no content.
- The hold is gone, so `acceptOwn` applies every Editing deletion in its commit and settle has no Editing deletion to keep.
- `settleNodes` in `packages/plitejs/src/authored/facts/settle.ts` drops an inline element whose own deletion is accepted once its settled children hold no content, the rule `survivalUnder` gives the resolver.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editing deletion beside a pending join | Stored as a held claim until the join is decided | Applied in its commit | `acceptOwn` and the resolver | The stored claim draws as live text, blocks decisions and leaks links on settle | Internal; tests in step 1 | Step 1 | A peer's late claim on deleted text | cut |
| Line type a join keeps | Content at resolve time, older deletions excluded, plus the hold | Target type unless older accepted deletions take all its content, with a two-way wait | `resolve.ts` landing rule, read by `proposed.ts` | Frame law in T7, E1, E5 and H without stored evidence | Internal | Step 1 | E3b, E3d and F3b keep their failures from HEAD | rearchitect |
| Settled deletion of an inline element | Text removed, element kept with its claim | Element removed when no content survives | `settleNodes` | Mirrors the resolver's survival rule | Internal | Step 2 | Element with another author's pending content | rearchitect |
| Settled deletion of a whole block | Empty block kept with its claim | Unchanged here | `settleNodes` | Block removal moves join targets | Suggested task | none | An empty line stays visible | defer |
| Stored Editing deletion | Validator allows it | Validator refuses it | `marks.ts` | No recorder writes one | No release stores one | Step 1 | A dev document from the pivot fails to load | cut |

## Design

### The rule

A pending join lands with its target's type in every case but one: the target held content, and every piece of it goes under accepted deletions older than the join (`mark.at <= join.at`, the join's own incarnations excluded). A target with no content in storage keeps its type. Nothing new is stored.

The stored state can reach an empty target three ways. An Editing deletion after the join must keep the target's type (the frame law, T7, E1, E5). A newer suggested deletion accepted first must keep it too, so the order of acceptance does not matter. An older deletion accepted first would need the joining line's type, because `tx.text.deleteBackward` records a join into a line whose only text an older change struck, and its frame law lands a paragraph (`authored-tree-decisions.test.ts:317`). The design removes that third route: when every piece of the target's content sits under older pending deletions, the join and those deletions wait on each other, so they are decided together. The join already waits on its target's content claims at HEAD; the new wait is the reverse direction.

### Answers to the three questions

1. An Editing deletion applies in its own commit, always, so nothing is left to apply when the join goes away.
2. An Editing deletion of a link removes the link with its text through the usual same-commit acceptance. A suggested deletion of a link that a verdict settles now removes the link too, through settle's new element rule.
3. No hold remains, so a pending fill has nothing to break. A fill that is rejected leaves the target empty, and the join keeps the heading. A fill that is accepted is content, and the join keeps the heading.

### Three realistic failures

- Bob deletes a heading's text in Editing beside Alice's pending join, Alice accepts the join on her peer, and Bob undoes. His text comes back after `cd`. HEAD revives Alice's join in the same flow. The cause is how local undo rebases over a peer's decision, which this design does not touch, so it goes to a suggested task.
- A reviewer accepts an older suggested deletion of a whole line alone and is told it waits on a join. The waiting result names the join, as other waits do.
- E3b and F3b: a heading holds Ann's suggested deletion of part of its text, older than Alice's join, and the rest goes later, by Bob in Editing (E3b) or by Carol's suggestion accepted first (F3b). The joined line lands a paragraph where the frame law or S19 wants a heading. HEAD fails both. The judge's never-flip rule fixes them with nothing stored, once a direct merge into a line that shows nothing records a line deletion as Backspace does. That recorder change broke four tests on its first try, so the pair goes to a suggested task.

### Blast radius and rollback

Readers of the hold: `settle.ts` (its pass), `resolve.ts` (landing, kept members, lapse), the validator in `marks.ts`, `isStruck` and `reviewOf().hidden` in `authored.ts` (which read any accepted deletion, so they keep working for a remote peer's settled deletion), and the tests in step 1. The Plate spec `BaseBlockPlugins.authored-tree.spec.ts` only classifies Editing writes. Rollback is a revert of the patch; no stored shape is added, so no document needs repair.

### Arena synthesis

Three runners were briefed (`docs/plans/artifacts/2026-10-17-held-editing-deletion/architect/task.md`). Astra and Sol both stored join-time content evidence on the join and its target, kept Ann pending as a structural-only change, and shared one removal rule between resolve and settle. Opus dropped out on its weekly limit. The lead's measured lane, the rule above, stood in as the third candidate. An Opus cross-judge read the three as anonymized copies and scored them 12 (Astra), 13 (Sol) and 13 (the lead's lane), picking the lead's lane because only it ran and it stores nothing (`architect/judge/verdict.md`). The judge rejected stored evidence: it buys one outcome no law asks for, a paragraph after Ann's text is rejected, and its reference to Ann can dangle once Ann undoes her insertion.

The judge proposed replacing this rule with never-flip: a join always keeps its target's type, and `tx.nodes.merge` and `tx.text.deleteBackward` record a line deletion when the target shows nothing, as Backspace already does. Never-flip alone passes every frame case, E3b included, but breaks two recordings that need a paragraph (`architect/judge/probes/c4-2.log`). The lead tried the recorder half by making the merge read struck text as empty. That fixed one of the two, but reordered text in an Editing write (`cNd` for `Ncd`), changed two quote joins and broke an undo recording law (`nf-authored-a1.log`). So never-flip and its recorder change go to one suggested task, and this plan keeps the measured rule.

Grafts: settle removes elements by the resolver's survival rule (Astra); one rule decides the landing type for the resolver and the proposed projection, which disagree today on a line with no content (Sol, measured in `architect/judge/probes/c3-2.log`); `AuthoredReview.hidden` and `isStruck` stay, because they also hide a deletion a peer's verdict accepted (Sol); and a mounted test shows no deleted text, link or suggestion attributes after the deletion (Sol). Both runners come from the Codex family and reached stored evidence alone, and the pick is the Claude family's alone, so the plan panel attacks both.

The runner brief tagged the current resolver rule, a join into an emptied line keeping the joining block's type, as law. It is current behavior, which may have pushed both runners toward storing evidence.

Cases a losing candidate handles that this base drops, each a limit of the plan: E3b and E3d; Ann rejected, then the join accepted, which the runners land as a paragraph and this base as a heading; and settle removal of a whole block, which goes to its own task.

## Evidence

Model: claude-opus-5-5 at xhigh, in the worktree `priceless-newton-36c3ca` at `51f3a53b66`.

This review retains the `2026-10-12-suggestions-complete` Pursue and the review-tree pivot plan, and reopens only the pivot's P1.3b hold. No earlier review judged an Editing deletion that no join holds.

### Requirements

- [ask] "in a document with a verdict, the next settle of the block applies a deleted text but keeps a deleted inline element such as a link, with an empty text, as the lapse did"
- [ask] "a pending suggestion that fills the held line breaks the hold, so in a document with a verdict a settle of that line applies the deletion; when the fill is rejected and the join accepted, the join lands as a paragraph instead of keeping the heading's type"
- [ask] "Decide whether such a deletion applies, how a design removes elements as well as text, and whether a pending fill breaks the hold."
- [law] "Editing records the same way and accepts the writer's own claims in the same commit", and "Undo is local inverse history" (`docs/vision/plite.md:381-388`).
- [law] The frame law: a recording accepted through the proposed projection equals what the commands wrote on the proposed projection (`assertFramedLaw` in `packages/plitejs/src/authored/authored.ts`).
- [law] S13, "Switch to Editing and type, then Backspace", gives "Plain text and plain deletion, no suggestion" (`docs/editor-behavior/scenarios/suggestions.md:36`).
- [law] S19, accept all, "the result matches resolving each card in turn" (`docs/editor-behavior/scenarios/suggestions.md:42`).
- [law] S22, "In Editing, select across a pending join and delete", gives "The two lines become one, as a plain editor joins them" (`docs/editor-behavior/scenarios/suggestions.md:45`).
- Current behavior, not law: a join into a line that still has content keeps that line's type, and a join into an emptied line keeps the joining block's own type (`keepsContent` and `emptiedTargets` in `packages/plitejs/src/authored/tree/resolve.ts`). The arena brief tagged this as law by mistake.

### Findings

- A mounted editor draws a stored Editing deletion `ab` as plain `ab` in both the edit and propose views, held or free; only the accepted preview hides it. Plate paints only `reviewOf().marks`, which exclude Editing claims. So the task's premise that every view shows the claim as deleted holds only for the accepted preview. Measured in `docs/plans/artifacts/2026-10-17-held-editing-deletion/probe-render.out`.
- Deleting a whole plain heading in Editing next to a pending join makes a plain write that never forms a hold, and accepting the join then lands a paragraph. Under the test-mode frame check the same gesture breaks the frame law at HEAD. Measured in `probe-held-clock-a1.log` and `probe-frame-head-a1.log`.
- With the hold disabled, 10 of 643 authored tests fail: the collab hold trio, five admission hold tests, T7 in Editing and one storage timeout. T7 is the hold's real reason. Measured in `nohold-authored-a1.log` and `probe-frame-nohold-a1.log`.
- With a held deletion, rejecting the join is blocked by Ann's unrelated pending insertion, while without the hold it applies. Measured in `probe-decide-clock-a2.log`.
- With a verdict, a pending fill breaks the hold, a settle applies Bob's deletion, and after the fill is rejected the accepted join lands a paragraph. Suggesting has the same order dependence. Measured in `probe-held-clock-a1.log`.
- Backspace into an empty line, or one holding only struck text, records a block deletion, never a join; `tx.text.deleteBackward` records a join into a struck-only line, whose frame law needs a paragraph. Measured in `probe-empty-head-a1.log` and `authored-tree-decisions.test.ts:317`.
- A join that always keeps its target's type fails 11 tests: the hold pins plus those two struck-only recordings. Measured in `lane-always-authored-a2.log`.
- The design's landing rule, with the hold dropped, fails 9 of 643 authored tests, each one pinning the hold or the storage timeout that passes alone. With the settle fix it fails 8 of 643, each pinning the hold. Measured in `lane-r2-authored-a2.log` and `lane-r2-settle-authored-a1.log`.
- Under the design, T7, E1 and a chain of two joins keep the heading in both intents, while HEAD breaks the frame law in E1 and the chain. E3b and E3d fail at HEAD and under the design. Measured in `probe-frame-e3b-r2-a1.log`, `probe-frame-e5-head-a1.log` and `probe-frame-e5-r2-a1.log`.
- Bob deleting before Alice's join reaches him lands heading `cd` under the design in both delivery orders, plain and with Ann's insertion; HEAD lands paragraph `cd` for the plain heading and blocks the accept with Ann's. Measured in `probe-premises-head-a1.log` and `probe-premises-r2-a1.log`.
- Carol's older deletion of the whole heading and the join each wait on the other under the design and land paragraph `cd` together; at HEAD Carol's applies alone. Measured in `probe-premises-r2-a1.log`.
- A link deleted in Editing beside a pending join goes at once with its text under the design, and both join decisions apply; at HEAD, Ann's case blocks both. Measured in `probe-link-head-a1.log` and `probe-link-r2-a1.log`.
- Settle keeps a deleted link with its claim and an empty text, and keeps an empty paragraph for a deleted paragraph, independent of the hold. The settle fix removes the link, merges its neighbours and keeps a link that holds pending text. Measured in `probe-settle-link-head-a2.log` and `probe-settle-link-r2-a2.log`.
- F3b breaks S19 with no Editing at all: a heading holds Ann's older struck `a` and plain `b`, Alice's join is pending and Carol suggests deleting `b`. Accepting all three together lands heading `cd`, while accepting Carol's first lands paragraph `cd`, at HEAD and under this design. Measured by the judge in `architect/judge/probes/head.log` and `c3.log`.
- The judge's never-flip rule passes every frame case, E3b and E3d included, and lands heading `cd` in every F3b order, but breaks the two recordings of a join into a line that only an older change struck (`architect/judge/probes/c4-2.log`, `c4-authored.log`). Reading struck text as empty in the core merge fixed one of them but broke four other authored tests, among them an Editing write that lands `cNd` for `Ncd` and an undo recording law (`nf-authored-a1.log`).
- Bob's undo of an Editing deletion after Alice accepts her join on her peer brings back `cdab` under this design, and at HEAD brings back `ab` with Alice's join pending again (`probe-undo-head-a1.log`, `probe-undo-r2-a1.log`).
- Under this design the Plite bun suite fails only the hold pins, the E3b and E3d probes and the 8 Yjs property tests that also fail at HEAD (`r2-bun-all-a1.log`, `yjs-exclusive-head-a1.log`).
- No published release holds the review tree: plitejs is at 0.0.1 and platejs beta at 54.0.0-beta.1, both before the pivot, read from npm on 2026-10-17.

### Lanes

- Keep the hold and fix its edges. Every reader must then hide held text, which the transient `hidden` contract of `AuthoredReview` does not describe, and an undo after a lapse stays lost.
- Drop the hold with no new landing rule. Breaks the frame law in T7 and in the plain-heading case.
- Drop the hold and let the join's landing rule decide from what the review keeps. This plan's pick.
- Drop the hold and store on each join whether its line showed content. Handles E3b but adds a stored field; both Codex runners picked it, and the judge rejected it.
- Drop the hold and never flip the type, with the recorder writing a line deletion for a merge into a line that shows nothing. Handles E3b and F3b with nothing stored; its recorder half needs its own design.

Proof limits: the probes ran in bun against the source at `51f3a53b66` and a scratch prototype (`proto-r2-settle.diff`), plus one mounted render in vitest and jsdom; no browser drive.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts`, unaffected, it reads review marks, which never held Editing claims.
- `comments`: `apps/www/src/registry/components/editor/discussion.tsx`, unaffected for the same reason.
- `documents`: `packages/platejs/src/docx/export/lib/reviewProjection.tsx`, unaffected, it projects review marks.
- `exports`: `apps/www/src/registry/components/editor/export-toolbar-button.tsx`, unaffected.
- `html`: `packages/platejs/src/static/renderStaticHtml.tsx`, unaffected.
- `persistence`: `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, unaffected, it writes Suggesting claims only.
- `react`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, unaffected.
- `suggestions`: `packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts`, unaffected, it paints review marks; `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.authored-tree.spec.ts` names Editing writes and is checked in the build.
- `ui`: `apps/www/src/registry/components/editor/suggestion.tsx`, unaffected.
- `distribution`, `editing`: `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, unaffected, it calls no authored reader.

## Steps

- [x] Run the design arena's judge and fold its verdict into this plan. Proof: `docs/plans/artifacts/2026-10-17-held-editing-deletion/architect/judge/verdict.md`, with the never-flip measurement in `nf-authored-a1.log` and `nf-bun-all-a1.log`.
- [x] Run the panel on the plan. Proof: the round's `seats` row and one row per critical finding in the decision log, with the seats' answers in `docs/plans/artifacts/2026-10-17-held-editing-deletion/panel-plan/r1/`. All five critical findings stay `open` with `docs/plans/2026-10-17-join-keeps-target.md` as their patch, and the steps below are superseded by that plan.
- [ ] Build the landing rule and drop the hold. In `resolve.ts`, replace `keepsContent`'s use for joins with the new rule and its two-way wait, make `proposedKeepsContentAtJoin` give the same answer, and delete the hold functions named under Hard cuts. In `settle.ts`, delete the `heldByJoin` pass field and its branch. In `marks.ts`, drop `delete` from the stored Editing kinds and fix its error message. In `editing.ts`, drop the held deletion from the JSDoc. Tests: T7, E1 and E5 frame laws in Editing and Suggesting; H in both delivery orders, plain and with Ann's pending insertion; each decision order of scenario A with Ann; the two-way wait; the Suggesting order case; the pending fill at both edges with and without a verdict; a link deleted in Editing beside a pending join; the proposed projection and the resolver landing the same type for a line with no content; and a mounted editor showing no deleted text, link or suggestion attribute after the deletion. Replace the collab trio "an Editing deletion a suggested join holds, on two clients", the five admission tests "keeps an Editing deletion a pending join holds ...", and the two "keeps the claim of an Editing deletion that no pending join holds" tests with ones that assert the new behavior. Proof: each new test fails at `51f3a53b66` and passes after, and `bun test` over `packages/plitejs/test/authored-*` passes, logged under the run directory.
- [ ] Settle removes a deleted inline element. In `settleNodes`, drop an inline element whose own deletion is accepted once its settled children hold no content. Tests in `authored-facts.test.ts`: a deleted link settles away and its neighbours merge, a deleted mention settles away, and a deleted link that holds another author's pending text stays. Proof: each test fails at `51f3a53b66` and passes after.
- [ ] Docs and changeset. Add the rule to the authored section of `docs/vision/plite.md`: Editing applies its deletions in their commit, inline elements included, and keeps none stored for a pending join; a pending join keeps the type of the line it merges into unless deletions older than the join take all of that line. Add a `plitejs` patch changeset. Proof: the docs diff gets its `unslop` pass.
- [ ] Checks. `pnpm --filter plitejs typecheck`, `pnpm lint:task` on the changed files, the Plite bun suite with only the 8 `yjs/exclusive-property-contract.spec.ts` failures that also fail at `51f3a53b66` (`yjs-exclusive-head-a1.log`), the slow recording laws in `packages/plitejs/test/authored-tree-recording-laws.slow.ts`, and the Plate spec `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.authored-tree.spec.ts`. Proof: each command's log under the run directory with exit 0.

## Open work

- Never flip, undo after a peer's merge and settle's split tags moved into `docs/plans/2026-10-17-join-keeps-target.md`, which this run builds. owner: zbeyens. stop: that plan closes.
- Settle keeps an empty paragraph for a suggested deletion of a whole paragraph that a verdict accepted (`probe-settle-link-head-a2.log`). owner: zbeyens, who starts or drops the suggested task offered for it. stop: that task lands or is dropped.
- `packages/plitejs/test/yjs/exclusive-property-contract.spec.ts` fails 8 of 17 tests at `51f3a53b66` (`yjs-exclusive-head-a1.log`), unrelated to this plan. owner: zbeyens, who starts or drops the suggested task offered for it. stop: that task lands or is dropped.
