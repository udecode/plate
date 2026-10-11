---
review_scopes: [authored, suggestions]
review_basis: [2026-10-08-authored-review]
verdict: pursue
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [docs/plans/2026-10-08-authored-review.md, docs/plans/2026-10-09-authored-structural.md, docs/plans/artifacts/2026-10-08-authored-review/values/grounding.md, docs/plans/artifacts/2026-10-08-authored-review/values/explorer/answer.md, docs/plans/artifacts/2026-10-08-authored-review/values/architect/task.md, docs/plans/artifacts/2026-10-08-authored-review/values/architect/runner-opus.md, docs/plans/artifacts/2026-10-08-authored-review/values/architect/runner-astra.md, docs/plans/artifacts/2026-10-08-authored-review/values/architect/runner-sol.md, docs/plans/artifacts/2026-10-08-authored-review/values/architect/judge.md, docs/plans/artifacts/2026-10-08-authored-review/values/panel-plan-1/seat-opus.md, docs/plans/artifacts/2026-10-08-authored-review/values/panel-plan-1/seat-astra.md, docs/plans/artifacts/2026-10-08-authored-review/values/panel-plan-1/seat-sol.md, docs/plans/artifacts/2026-10-08-authored-review/values/probes/controls-tree-a2.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/base-controls-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/derived-tree-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/derived-two-changes-a2.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/derived-preset-pending-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/derived-editing-correction-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/derived-struck-corrections-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/link-plain-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/link-empty-a2.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/link-url-base-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/probes/proto-copy-marks-a1.log, docs/plans/artifacts/2026-10-08-authored-review/values/bench/baseline-a2.log, docs/plans/artifacts/2026-10-08-authored-review/values/bench/evaluate-planted-a1.log, docs/plans/artifacts/2026-10-08-authored-review/structural/panel-build-3/repro/round3-main-after-a1.log, docs/plans/artifacts/2026-10-08-authored-review/structural/panel-build-3/seat-opus.md, docs/plans/artifacts/2026-10-08-authored-review/structural/panel-build-3/seat-astra.md, docs/plans/artifacts/2026-10-08-authored-review/structural/panel-build-3/seat-sol.md, docs/plans/artifacts/2026-10-08-authored-review/panel-3/seat-opus.md, docs/plans/artifacts/2026-10-08-authored-review/panel-3/seat-astra.md, docs/plans/artifacts/2026-10-08-authored-review/panel-3/seat-sol.md, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/proof-plugin.ts, packages/plitejs/src/core/change/builder.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/content-text.ts, packages/plitejs/src/editor/correct-document.ts, packages/plitejs/src/core/correction.ts, packages/plitejs/src/yjs/core/replacement.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/features/table/lib/internal/mutation.ts]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b']
---

# Authored: stacked property suggestions and split links

Status: executed: closed 2026-10-11 after the decision-trail review; the redesign iteration is next
Playbook: plan

**Pursue all three, with value layers that are never rewritten.** Today the order you decide suggestions in can change what you get, in ordinary one-person editing. Two pending column inserts followed by normal typing come back to 30/70 when rejected in one order and to 41/59 in the other, and accepting a preset and a column deletion one at a time gives 35/65 where both at once give 30/70. Rejecting every bold suggestion on a word can leave it bold, and rejecting two Enters typed inside one link leaves three links. Phase 2 of the parent plan builds the production owner on decisions that commute, so it waits for this.

The design keeps one tag per property write. A tag names the tags it was written on top of and the value it replaced, and nothing edits it afterwards; a decision only removes tags and writes values. A rejection takes its value from the tag above it, never from comparing values. A suggestion built on another depends on it, so stacked suggestions are accepted from the bottom up, rejected from the top down, or decided together. Suggestions two people made on one property at the same time form a fork, decided as one group. Plugin corrections and the commands and reads that compute values from children or the document, such as column widths, table repair or duplicate tags, skip what is crossed out. Each split of an inline element tags both halves with its own cut, the cuts follow the pieces through later splits and removals, and rejecting one joins exactly those halves.

This iteration continues `docs/plans/2026-10-08-authored-review.md` (P1.14 kept Phase 1 on 2026-10-10) and takes the items the structural iteration `docs/plans/2026-10-09-authored-structural.md` handed to "the formats and links iteration".

## Brief

### What will change?

For "go poteto authored": stacked suggestions on formatting or column widths keep the same structure and suggestions in any decision order, rejecting them all brings back the original, and rejecting an Enter inside a link rejoins it.

### What could go wrong?

Widths a plugin recomputes can differ by decision order. Table borders and list items next to a deleted row or item, and nested empty elements, still go wrong; the next iteration fixes them. Five speed checks run slower.

## Teach

A suggestion can change a property instead of text, such as making a word bold or resizing columns. The editor keeps the new value in place and adds a tag that remembers the old one, so rejecting the suggestion puts the old value back.

Today each change keeps one tag per word holding its old and new value, and rejecting one guesses what to restore by comparing values. A toggle, a change made again later, or column widths the column plugin recomputes from columns that are already crossed out all break that guess. Rejecting an Enter typed inside a link also leaves the link in pieces.

Now every suggestion on a property stacks a new tag that never changes again, and rejecting it restores the value it replaced. The column plugin ignores crossed-out columns when it fixes widths. Each Enter inside a link tags both pieces with its own cut, so rejecting it joins exactly those pieces.

![before](artifacts/2026-10-08-authored-review/values/teach-before.svg) ![after](artifacts/2026-10-08-authored-review/values/teach-after.svg)

## Public API

Code that derives a value from children asks each node whether it is content, so a node a pending suggestion deletes stays where it is and counts for nothing.

```ts before
// packages/platejs/src/features/tag/lib/BaseMultiSelectPlugin.ts
if (
  isTagElement(node, type) &&
  tx.nodes.some({
    at: [],
    type: plugin,
    match: (candidate, candidatePath) =>
      candidate.value === node.value &&
      !PathApi.equals(candidatePath, path),
  })
) {
```

```ts after
// packages/platejs/src/features/tag/lib/BaseMultiSelectPlugin.ts
if (
  isTagElement(node, type) &&
  tx.nodes.isContent(node) &&
  tx.nodes.some({
    at: [],
    type: plugin,
    match: (candidate, candidatePath) =>
      candidate.value === node.value &&
      !PathApi.equals(candidatePath, path) &&
      tx.nodes.isContent(candidate),
  })
) {
```

## What other editors do

The subject's table covers where deleted text lives. This one covers property suggestions, read from local checkouts on 2026-10-10 where a commit is named, otherwise from the format specification.

| Editor | What a property suggestion stores | A second suggestion on the same property | Reject |
| --- | --- | --- | --- |
| Word (OOXML) | `w:rPrChange`, `w:pPrChange` and `w:tcPrChange` hold the previous properties; the run, paragraph or cell holds the current ones | The schema allows one property revision per run, paragraph or cell, so a second change cannot stack; which previous value Word keeps was not checked | Restores the stored previous properties |
| prosemirror-suggest-changes `653fba7` | A `modification` mark per changed attribute, with its previous and new value | A new edit replaces the existing mark, keeps its suggestion id, and takes the value just before the edit as the previous value, so the original is lost (`src/__tests__/attrStep.test.ts:57-108`) | Restores the previous value the mark holds |

## Document shape

A `format` tag holds one property, its own `id`, the ids of the tags it was written on top of (`over`, absent when it was written over the accepted value) and the value it replaced (`before`, absent when the property was absent). There is no depth and no stored new value: the top tag shows the live value, and a lower tag shows the `before` of the tag over it. A JSON `null` counts as absent, as the Yjs binding already stores it (`yjs/core/replacement.ts:167-177`). A word that change C bolded, change D unbolded on top, and C bolded again through `propose`:

```json before
{ "text": "word", "bold": true, "authored": [
  { "kind": "format", "change": "C", "author": "ai", "at": 1, "before": { "bold": null }, "after": { "bold": true } },
  { "kind": "format", "change": "D", "author": "bo", "at": 2, "before": { "bold": true }, "after": { "bold": null } } ] }
```

```json after
{ "text": "word", "bold": true, "authored": [
  { "kind": "format", "change": "C", "author": "ai", "at": 1, "id": "t1", "key": "bold" },
  { "kind": "format", "change": "D", "author": "bo", "at": 2, "id": "t2", "key": "bold", "over": ["t1"], "before": true },
  { "kind": "format", "change": "C", "author": "ai", "at": 1, "id": "t3", "key": "bold", "over": ["t2"] } ] }
```

Each Enter that splits an inline element tags both halves with a `cut`, a split tag with its own id and the side of the half it sits on; today only the right half carries a plain split tag.

```json before
[ { "type": "paragraph", "children": [ { "text": "" },
    { "type": "link", "url": "u", "children": [{ "text": "a" }] }, { "text": "" } ] },
  { "type": "paragraph", "authored": [{ "kind": "split", "change": "bob:1", "author": "bob", "at": 1 }], "children": [ { "text": "" },
    { "type": "link", "url": "u", "authored": [{ "kind": "split", "change": "bob:1", "author": "bob", "at": 1 }], "children": [{ "text": "b" }] }, { "text": "" } ] } ]
```

```json after
[ { "type": "paragraph", "children": [ { "text": "" },
    { "type": "link", "url": "u", "authored": [{ "kind": "split", "change": "bob:1", "author": "bob", "at": 1, "cut": "k7", "side": "end" }], "children": [{ "text": "a" }] }, { "text": "" } ] },
  { "type": "paragraph", "authored": [{ "kind": "split", "change": "bob:1", "author": "bob", "at": 1 }], "children": [ { "text": "" },
    { "type": "link", "url": "u", "authored": [{ "kind": "split", "change": "bob:1", "author": "bob", "at": 1, "cut": "k7", "side": "start" }], "children": [{ "text": "b" }] }, { "text": "" } ] } ]
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Layer semantics: how a key's tags order, decide, wait and fork | Plite | `plitejs/authored` (`authored/tree/layers.ts`, new) | One pure owner that the recorder, the resolver and the review UI share |
| The `format` and inline `split` tag shapes and their validator | Plite | `plitejs/authored` (`authored/tree/marks.ts`) | One immutable tag per property write, linked to what it was written on; one cut per inline split |
| Recording a property write as a tag, and moving cuts when a fragment splits or goes | Plite | `plitejs/authored` (`authored/tree/record.ts`) | Suggesting adds a tag over the current tips, Editing commands take a key over, Editing corrections keep every tag |
| Which writes come from a plugin correction | Plite | `plitejs` core (`core/correction.ts`, `core/change/builder.ts`) | The recorder must tell a correction from a command; the scope sits inside `runEditorCorrection`, the one call every correction passes |
| One content predicate for texts and elements, and a node read that asks it | Plite | `plitejs` core (`core/content-text.ts` widened, and a `nodes` read settled through `best-api`) | A plugin skips non-content nodes while keeping each child's real path, the way input rules already ask for content text |
| Corrections, commit hooks, and commands and reads that derive values from children or the document skip non-content nodes | Plate | `platejs` (column, multi-select and table plugins first, then each one S2's sweep names) | A struck column, row or tag must not skew a width, a repair or a duplicate check |
| Cuts: creating, moving on a split or a removal, and merging on rejection | Plite | `plitejs/authored` (`authored/tree/cuts.ts`, new, called by `record.ts`, `resolve.ts` and the decide transaction) | One pure owner for which pieces a rejected split joins; `record.ts` is already over 2,000 lines |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Rejecting a suggested Enter inside a link | Gives one link back, in a batch and in every order, with a chain of Enters, with two links split in one suggestion, after Editing deletes a middle piece, and with accepted text typed between the halves, which joins the link | `authored-tree-cuts.test.ts`; Chromium, the proof route's link test, five warm runs |
| Accepting that Enter, or another author's Backspace join | Keeps two links, as plain editing does (`values/probes/link-plain-a1.log`) | `authored-tree-cuts.test.ts` |
| Toggling bold in Suggesting, then rejecting | The word returns to its first value in every order, also after a change is made again | `authored-tree-layers.test.ts` and the resolve laws; Chromium, the proof route's bold test, five warm runs |
| Accepting a suggestion that sits on another pending one, or rejecting one that has another on top | Answers that it waits for the other, and changes nothing | `authored-tree-layers.test.ts`, `authored-tree-decisions.test.ts` |
| Typing, deciding or dragging next to a crossed-out column | Widths of the other columns stay what Editing would give; the crossed-out column keeps its width, wherever it sits in the group | `BaseColumnPlugin.authored-tree.spec.ts` on the real column plugin |
| Typing in a table with a crossed-out row | No cell is added; rejecting restores the original table | `BaseTablePlugin.authored-tree.spec.ts` on the real table plugin |
| Suggesting a replacement for a crossed-out tag with the same value, or typing a query beside it | The replacement and the query stay, as in Editing | `BaseMultiSelectPlugin.authored-tree.spec.ts` on the real multi-select plugin |

## Main changes

- A `format` tag holds one key, its `id`, `over` (the ids of the key's tips when it was written, absent over the accepted value) and `before` (the value it replaced). Every local write's `over` is the key's current set of tips, so after any local write the key has one tip. Nothing edits a tag after it is written: recording adds a tag, or removes the writer's own run of tags at the top when the value returns to that run's first `before`; decisions and Editing takeover only remove tags and write live values. An own amendment is an ordinary new tag over the current tip.
- `over` is read against the tags present: an id that names a removed tag means the accepted value underneath. The top tag shows the live value, and a lower tag shows the `before` of the tag over it; no tag stores what it shows, so a correction that rewrites a live value never changes what a rejection restores.
- `decideKey`, a pure function in `layers.ts`, reads the key's tags as a chain of steps. Where the present tags have two or more tips or two or more roots, the region from their first point of divergence up to the tips is one fork step; every other tag is a step of its own. A suggestion built on another depends on it: accepting a step waits on every pending step below it, and rejecting a step waits on every pending step above it, so a stack is accepted from the bottom up, rejected from the top down, or decided in one batch, each wait a `blocked` result naming the changes to decide with. A fork decides as one step: any decision on one of its tags waits on all of them; all of them accepted keeps the live value when the fork is on top and otherwise takes the `before` of the step over it; any of them rejected restores the value under the fork, the `before` of its bottom tags, taken from the bottom tag with the smallest id when a correction made them differ. Accepting a step drops every step below it, which by then is decided or in the same batch. Corrections never change which tags form a fork.
- In Suggesting, the recorder records nothing on struck content, writes the value with no tag on the writer's own pending insertion when no other change holds a tag on that key, and otherwise adds a tag. In Editing, a command's write takes the key over and drops its tags; a plugin correction's write keeps every tag.
- `runEditorCorrection` (`core/correction.ts`) wraps the correction it runs in a builder scope that marks the steps' `source` as `correction`, apart from their primitive origin, so a wrap inside a correction cannot hide it. The builder's canonical construction origin becomes `canonical`, so `correction` names only plugin corrections. The decide transaction stays unrecorded; its corrections write live values and leave every tag.
- One content predicate, widened from today's text predicate (`core/content-text.ts`), answers for texts and elements. A `nodes` read, named through `best-api`, asks it for one node, so an adopter iterates real children and skips non-content ones while every write keeps its real path. Every plugin correction reads the proposed view, skipping content a pending suggestion deletes, because the command that made the suggestion left that view coherent; so do the commands and reads that compute values from children or the document. The column plugin's correction, `setColumns` and side-transfer width and limit adopt it, the multi-select duplicate correction and its commit cleanup, and the table repair. S2 sweeps every Plate plugin that registers corrections or commit hooks, and the column and table commands, with one probe each.
- A split's continued element copies the content tags of the element it continues, and the format tags of each key the schema keeps on that split (`elementPropertiesForSplitAt`, `core/editor-schema.ts:2455`), never boundary or enclosure tags. Today only insert and delete tags travel, so rejecting a pending url change restores only the left half of a link split after it (`values/probes/link-url-base-a1.log`).
- Cuts have one pure owner, `authored/tree/cuts.ts`, which the recorder and the resolver call. Each split of an inline element creates one cut: a `split` tag with the change, a fresh `cut` id and a `side`, `end` on the left half and `start` on the right half, where the `start` side also keeps the original element's properties that the schema drops on that split, such as an element id. When a fragment that carries cuts splits again, its `end` cuts move to the new right fragment and its `start` cuts stay. When any local transaction removes a fragment that carries cuts, in either intent, from a correction or inside a decision, its `end` cuts move to the fragment before it in that family and its `start` cuts to the fragment after it, looked up in the fragment's block and its neighbours. A writer who takes back their own Enter keeps its cut tags pending: Editing leaves the halves as two elements, so accepting keeps two and rejecting joins them back into the one the start had.
- On a rejected cut, the resolver groups the inline fragments of whatever block holds them by the rejected cut ids they carry and merges each group's surviving fragments. The merged element keeps the left fragment's properties, as joining two elements does, or the `start` side's kept properties when no left fragment survives; its tags are the union of both halves' split and cut tags minus the rejected cut, plus the insert and delete tags both halves carry. Text that survives between the halves joins the merged element at the cut; any other surviving node between them keeps them apart. A decision that removes a fragment carrying a pending cut waits on that cut; a rejected cut waits on pending content between its halves and on any pending tag only one half carries.

## Comparison

| Target | Same-property laws | Derived values | Concurrency and links | Cost | Verdict |
| --- | --- | --- | --- | --- | --- |
| Control: today's tree, one tag per change per node, value matching | fail: c1, c2 (`controls-tree-a2.log`) | single suggestions pass; stacked inserts give 41/59; corrections counting a struck column give 35/65 and 37.5/37.5/25 (`derived-struck-corrections-a1.log`) | a rejected Enter leaves the link split | none new | rejected |
| Immutable linked tags, rejections from the top, forks as one step, content reads, cuts (opus runner as base, after panel rounds 1 and 2) | by construction over admissible orders; a buried rejection is blocked | restores read `before`; content-reading plugins skip struck nodes | forks found from links and decided as one step; cuts follow pieces | one pure module, a correction scope, one content read, plugin adoptions by sweep | picked |
| Immutable writes with parent links, base and proposed snapshots, kept evidence (astra runner) | by construction with no blocking | exact mixed results after an Editing correction | inline families with cut transfer (grafted) | four value-record kinds, a stored copy of the live value kept current by hand, document-wide retention, a forced correction worklist | grafted from |
| Immutable writes, decision receipts, guarded correction snapshots, a proposed execution draft (sol runner) | by construction | rests on capturing every read a correction makes | receipts kept until a checkpoint nobody owns | a second coordinate space for commands and a Yjs-priority guess | rejected |

The cross-judge (opus, blinded copies) scored the base 22, the astra candidate 21, the sol candidate 16 and the control 14 (`values/architect/judge.md`). It is the same family as the lead, because the cross-judge pool holds only opus, so the plan panel attacks the pick.

Grafts and cuts:

1. The plan takes planted-defect controls for every law, and endpoints checked against an independent Editing editor with schema validity at every publication (sol).
2. From the must-answer probes, continued elements copy format tags but never boundary or enclosure tags (`values/probes/proto-copy-marks-a1.log`); round 2 limits the format tags to keys the schema keeps on split.
3. It keeps the base's content read, which the first draft cut; corrections, commands and document-wide reads that count struck nodes break both endpoints (`values/probes/derived-struck-corrections-a1.log`, panel rounds 1 and 2).
4. It takes the astra runner's write links in place of the base's depth, and its cut ids with their transfer, after the panel showed depth cannot tell concurrent writes apart and a change id cannot name one split.
5. It renames the builder's canonical `correction` origin to `canonical` (panel round 1, opus).
6. It does not take the judge's graft of kept rejected-layer records instead of blocking a buried rejection. It widens the admissible orders, but it adds a record kind, dangling records after a concurrent accept, and collection rules, and the structural iteration's decisions already block the same way. The Defaults row on stacked suggestions names it.
7. It does not protect a pending inserted node's values against Editing corrections. Mixed decisions after an Editing correction are recomputed by the plugin's own correction; the laws require only order independence and both endpoints.
8. It drops the absent-versus-`null` distinction, because the Yjs binding removes an attribute set to `null` (panel round 1, astra).
9. From panel round 3, it takes the rejected sol candidate's placement of surviving gap text inside the merged element, and the astra candidate's point that corrections must see a coherent view: table repair reads content too.

Cases a losing candidate handles that the base handles differently, each a graft or a limit:

1. Astra decides a rejection of Alice's column alone, with Bob's column on top, with exact values; the base blocks it until both are decided. Limit, as a Defaults row.
2. Astra restores mixed results after an Editing correction exactly; the base recomputes them through the plugin's correction. Limit.
3. Astra and sol keep each concurrent write's value and decide mixed outcomes from it; the base decides a fork as one step and restores the value under it on any rejection. Limit, as a Defaults row.
4. Astra and sol keep the inputs an Editing correction overwrites, so rejecting a width suggestion after Editing inserted a column gives what Editing alone gives; the base gives the plugin's repair. Limit, as a Defaults row.

## Challenge delta

Improved after the plan panel's round 1 (`values/panel-plan-1/`):

- Restored: the content read for corrections that derive a value from their children, which the first draft cut on a probe that covered only one ordering (all three seats).
- Replaced: the mixed-fork rule, which read a stale `wrote`, with contested keys decided as one set (astra, sol, opus).
- Added: a cut id and side on each inline split, moved when a fragment splits again (astra, sol).
- Removed: the absent-versus-`null` distinction, which the Yjs binding cannot carry (astra).
- Re-owned: the correction scope moves inside `runEditorCorrection`; the canonical origin is renamed (opus).
- Restructured: S1 stays a pure prototype; the laws compare whole documents and run corrections (all three seats).

Improved after round 2 (`values/panel-plan-2/`):

- Replaced: depth and value-matched contested keys with write links, so forks come from immutable tags and a correction can never make a key look contested (all three seats); a fork now decides as one step, so layers below and above it keep their own decisions (opus).
- Replaced: the same-depth amendment replacement with an ordinary new tag, so a concurrent stack on the old value shows as a fork in either Yjs orientation (all three seats; sol proposed this).
- Re-owned: the content read moves from a filtered `children` list, which lost each child's real path, to a per-node predicate; it covers commands and document-wide reads, so the multi-select duplicate check and the column side transfer adopt it (astra, sol, opus).
- Added: cuts move to the neighbouring fragments when any transaction removes a fragment (all three seats); a rejected cut merges its halves keeping the left fragment's properties, as joining elements does, so a split-dropped id or an accepted one-sided change no longer keeps them apart (astra, sol); format tags follow the schema's split policy (astra); an untagged write on the writer's own insertion happens only when no other change holds the key (opus).
- Restructured: the content read and its adoptions become their own step before the tag migration, and the S1 probe measures the prototype through an adapter with asserted decisions (opus, astra, sol).
- Narrowed: three races are named limits with exact assertions (opus, sol).

Improved after round 3 (`values/panel-plan-3/`), the last plan round; the build's diff panel reviews what changed here:

- Added: accepting a step waits on the pending steps below it, so stacks decide bottom up, top down or together, and decision corrections between steps cannot make the result depend on order (astra).
- Replaced: forks found from tags with the same tips by a region from the first divergence of the present tags, with a missing `over` read as the accepted value, so diverged tips and partial deliveries still form one decided step (opus, sol); structure repairs counting every child by every correction reading the proposed view, after table repair added a cell beside a struck row (astra).
- Added: cuts get their own module, run in every local transaction including decisions (sol, opus); the merged element's tags are explicit, a one-sided element tag makes the cut wait, surviving gap text joins the merged element, and the `start` side keeps the original's split-dropped properties (opus, astra, sol); merges happen in whatever block holds the pieces, for any inline split (opus).
- Narrowed: rejecting a width suggestion after an Editing correction rewrote an untagged value gives the plugin's repair (sol); table widths stay one array, so an Editing resize during a pending column deletion loses the deleted column's width (astra, sol); fork bottoms a correction made differ take the smallest-id tag's value (astra, sol, opus); a withdrawn own run racing a stack on it, and concurrent removals of neighbouring cut pieces, are named races (astra, opus).

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Format tag | One per change per node, `before` and `after` per key | One immutable tag per write, linked to the tips it was written on | `plitejs/authored` | Value matching cannot order repeated values or survive corrections, and depth cannot tell concurrent writes apart | Proof plugin, until the parent's Phase 2 | S1, S3 | More tags for multi-key writes and repeated amendments | rearchitect |
| Decisions on one key | Value matching in `rejectFormats` | `decideKey` over a chain of tags and fork regions; stacks accepted bottom up, rejected top down, or together | `plitejs/authored` (`layers.ts`) | Order independence by construction, also when decision corrections run between steps | Proof plugin decide and both reads | S1, S3, S5 | More decisions answer `blocked` | rearchitect |
| Correction writes | Recorded under their primitive origin; Editing takes over | `source: correction`; Editing corrections keep tags | `plitejs` core and `plitejs/authored` | A repair must not erase what a rejection restores | Every plugin correction | S3 | none known; one call site | move |
| Derived values | Commands, corrections and queries count every node | Every correction, and the commands and reads that derive values, read the proposed view through one node predicate | `plitejs` core read, Plate plugins | A struck node must not skew a derived value, a repair or a duplicate check | Column, multi-select and table plugins, then each one the sweep names | S2 | A reader the sweep misses; table widths stay one array | rearchitect |
| Inline splits | Right half tagged; no merge | Cuts on both halves, moved on a further split or a removal; merge on rejection with explicit tags, gap text and kept properties | `plitejs/authored` (`cuts.ts`) | Reject means the split never happened | Proof plugin | S4 | Concurrent removals of neighbouring pieces | rearchitect |
| Canonical origin | `correction` | `canonical` | `plitejs` core | `correction` now names plugin corrections | Builder and recorder | S3 | none known | cut |

## Failures, blast radius and rollback

Three realistic failures this change could cause:

1. A property write path that bypasses `formattedProps` leaves a key without its tag. The recording laws generate real commands that toggle, reopen and correct properties in both intents, and the decision law checks every admissible order against the batch on whole documents.
2. A plugin that derives a value from its children or the document and does not read content keeps counting struck nodes. S2's sweep lists every plugin that registers corrections, and the column and table commands, each with a probe that strikes a node and checks both endpoints.
3. Tags per write and cuts grow saved documents and Yjs updates. S1 measures saved bytes for one, three and ten tags and a three-key write against today's tree, and S9 measures the Yjs update on the built path.

The blast radius is small. The tag shape and cuts live behind `authoredTreeProof`, so plain editing never records a tag; the correction `source` is a new field every other builder consumer ignores; without a registered content predicate every node is content, so the adopting plugins behave as before in every editor without the review tree. To roll back, revert this iteration as one unit, which leaves the structural iteration's tree in place.

## Steps

The Build playbook executes this plan. Execution authority is the owner's "go poteto authored" on 2026-10-09, which runs every slice without pausing and adds no commit authority; the lead writes the code in the `next` checkout, and subagents map and review. Packet: `packages/plitejs/src/authored/tree/` (`layers.ts` and `cuts.ts` new; `marks.ts`, `record.ts`, `resolve.ts`, `proof-plugin.ts`), `packages/plitejs/src/core/` (`content-text.ts`, `correction.ts`, `change/builder.ts`, the `nodes` read in `interfaces/editor.ts` and its implementation), the Plate plugins S2 adopts (`BaseColumnPlugin.ts`, `BaseMultiSelectPlugin.ts`, the table repair, and each one the sweep names), their tests under `packages/plitejs/test/` and beside each plugin, and `apps/www/tests/browser/authored-review.spec.ts`. The base is frozen commit `8e3883fca1c6a7c42159537c43b7aa945472f064` (`docs/plans/artifacts/2026-10-08-authored-review/values/base/`), the working tree after the structural iteration with this plan's verdict.

#### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Base controls fail today for every behavior step | yes | row "Base controls for every behavior step, rerun in a detached worktree of the iteration base"; `values/probes/base-controls-a1.log` |
| S1's microbench passes its frozen rule before S2 starts, and S3's document rows pass the frozen budgets before S4 | yes | rows "S1 key microbench" and "S3 document rows on the migrated resolver" |
| Decision and recording laws pass with their planted controls | yes | row "built: S5 laws" |
| Chromium proof route, five warm runs | yes | row "Chromium five warm runs on the bytes after the list walk's revert"; `values/close/chromium-final2-run-1.log` to `-5.log` |
| Build panel on this iteration's diff | yes | three rounds, `values/panel-build-1/` to `panel-build-3/`; the panel rows from the first `seats` row |
| Writing passes per panel round | yes | the `writing` rows before each round and after round 3's settlement |
| `oxlint --type-aware` on the task's files before each panel freeze | yes | `values/panel-build-1/lint-task-a3.log`, `values/panel-build-2/lint-task-a2.log`, `values/panel-build-3/lint-task-a1.log`; last check `values/close/lint-task-a2.log` |
| `pnpm check` steps the edits reach, before the Chromium runs | yes | partial: rows "pnpm check on the final tree, each failure attributed" and "pnpm check's failing steps attributed in detached worktrees"; `values/close/isolated-summary.txt` |
| Changesets for `plitejs` and `platejs` | yes | `.changeset/plite-authored-values.md`, `.changeset/platejs-authored-content.md` |
| Decision-trail review | yes | the Close's Decision-trail review |
| `best-api` on the content node read | yes | row "best-api: the content read" |
| `plate-docs` | yes | row "plate-docs on the nodes.isContent paragraph" |

- [x] S1. Layers, as a pure prototype that changes no active code path. Add `authored/tree/layers.ts` with `decideKey`, `writeLayer` and `formatLayerView` over the linked tag shape, with waits and forks. Proof: a pure property law over generated keys with toggles, reopened changes, amendments and forks of different branch lengths (every admissible order equals the batch on the key's value and its remaining tags, every kept tag is the same object as an input tag, rejecting everything gives the value before the first tag, accepting everything keeps the live value, and a correction that changes only the live value changes no decision), three planted defects that must each fail it (value matching, a rewritten kept tag, a buried rejection that does not wait), and Benchmark's pre-acceptance probe on the claimed scaling law: a microbench of `decideKey` against today's `rejectFormats` on one node with 1, 10 and 100 tags, each asserting the decided value before timing, under a rule frozen on the base before S1's code (the larger of 1.25 times and 0.05 ms above today's at each size). Freeze the three-key byte row's baseline in `values/bench/budgets.json` in the same pass. Done 2026-10-10 on frozen commit 172e8166d8: the law test fails each planted defect, plus a fourth that reads concurrent tags in one arbitrary order, which needed a sixth law (the order a client holds the tags in changes no decision); the first `decideKey` failed the 100-tag line at 0.22 ms, so steps are built in linear time, checked against the first version on 20,000 random tag graphs; the microbench then passed at 0.0012, 0.0046 and 0.0274 ms, the 100-tag line by its 0.05 ms floor, and the planted run failed it (decision rows "S1 law test against four planted defects" and "S1 key microbench").
- [x] S2. Content reads. Widen the content predicate to elements, add the `nodes` read that asks it for one node (its call shape through `best-api` first), and register the proof plugin's predicate for both. Adopt the read in the column plugin's correction, `setColumns` (every branch: equal count, grow and shrink) and side-transfer width and limit, in the multi-select duplicate correction and its commit cleanup, and in the table repair. Then sweep every Plate plugin that registers corrections or commit hooks, and the column and table commands, through a how-explorer reading, and adopt the read in each that reads children or the document. Proof: package tests on the real plugins, each failing on the base: the three struck-column cases (control `derived-struck-corrections-a1.log`) and the same cases with the first and the middle column struck; a drag beside a struck column; a replacement tag beside a struck tag with the same value, and a query typed beside it; Editing typing in a table whose row a pending suggestion deletes across a merged cell, which adds no cell; and one probe per swept plugin that strikes a child, runs an Editing transaction, and checks accept-all against an independent Editing editor and reject-all against the start, table and list at least. Done 2026-10-10 on frozen commit 6445f07253: the read is `nodes.isContent(node)` (decision row "best-api: the content read"); the column, multi-select, table, details and list specs each fail on the S1 commit or through their mutant, and nine mutants that undo one adoption each fail them; the sweep adopted details and list identity, kept element ids counting struck nodes, and left the multi-select commit cleanup unchanged because its cases already match Editing (rows "the sweep", "element id uniqueness", "deviation: the multi-select commit cleanup"); S2's spec run also found and fixed a Yjs bridge regression from the structural iteration (row "fix: an insertion with no old children"). At the close, the decision-trail review showed that the list identity adoption broke the per-keystroke cost rule, and the close reverted it (row "revert: the list walk past struck siblings").
- [x] S3. Linked tags, recording and resolution, as one buildable slice. Switch `marks.ts` to the linked tag shape, route every key of `formattedProps` through `writeLayer`, replace `rejectFormats` with `decideKey` per key in `resolveList`, add the correction scope inside `runEditorCorrection` and `DraftStep.source`, rename the canonical origin, and copy content tags and the format tags of split-kept keys onto a split's continued element. Proof: package tests, each failing on the base: c1 restated (rejecting C or D alone answers `blocked` and changes nothing; the batch restores plain) and c2 from `values/probes/controls.probe.test.ts`; the Editing correction over pending widths gives Editing's 45/55 on reject (control `derived-editing-correction-a1.log`); a pending url change then an Enter restores both halves on reject (control `link-url-base-a1.log`); a pending `listRestart` change then an Enter leaves the continued block without it on reject; two pending column inserts give 30/70 batched and Bob first, and Alice first answers `blocked` with Bob (control `derived-two-changes-a2.log`); round 2's single-client histories where a correction makes a live value equal an earlier tag's give one result for every partition; round 3's preset accepted over a pending deletion and insertion answers `blocked` until those two are decided or batched, and every admissible partition gives one result; a tag whose `over` names a tag another decision removed reads as written over the accepted value. One limit is pinned as a test with its exact result: rejecting a width suggestion after Editing inserted a permanent column gives the plugin's repair, where Editing alone gives 15/35/50. The six single-suggestion derived cases and the preset over a pending deletion keep their results (`derived-tree-a1.log`, `derived-preset-pending-a1.log`), checked against an independent Editing editor. Then rerun S1's document rows on the migrated resolver against the frozen budgets (`values/bench/budgets.json`, baseline `values/bench/baseline-a2.log`, planted control `values/bench/evaluate-planted-a1.log`), with each timed decision's result asserted first and a three-key row added to the byte rows. Done 2026-10-10 on frozen commit bea324111d: the new tests fail on the S2 commit for 12 cases and five mutants each fail their test (row "built: S3 linked tags"); c1 is restated with one author per change, since one author's write back to a key's first value withdraws their own tag; the split-dropped `listStart` case rests on its mutant; the document rows pass all six timing lines after two fast paths, and the three-key bytes line fails by 28 bytes (rows "S3 document rows", "S3 saved bytes").
- [x] S4. Cuts and the inline merge, in `authored/tree/cuts.ts`. Record a cut on both halves of each inline split, move cuts on a further split and on any local removal of a fragment, decisions included, merge rejected cuts in whatever block holds them after its children are built and before the canonical form, with the merged tags, gap text and kept properties Main changes names, and add the inline waits. Proof: package tests: c3 (two Enters inside one link, every order and every accept and reject mix, exact link boundaries) and c5 (separator text removed by the same batch), both failing on the base; c4 restated, since deciding the left half's removal first is now `blocked` and the batch result is unchanged; two links split by one suggestion return as two links on reject; Editing deletes the middle piece of a twice-split link, then rejecting both Enters gives one link in every order; a link with an element id split and rejected returns as one link with the original id, also after Editing deletes the left half; a url change accepted on one half, crossed with accepting and rejecting the Enter, keeps the left half's url on a rejected Enter; a deletion that struck only the left half makes rejecting the Enter wait, and the batch gives the right half alone; accepted text typed between the halves joins the merged link; a correction inside a decision that removes a middle piece keeps the chain; removing the link from the middle of a range and rejecting it gives one link; an accepted split keeps two links; Alice's Enter and Bob's Backspace give one link when everything is rejected and two when everything is accepted. Done 2026-10-10 on frozen commit 04a664003d: the 13 cut tests fail on the S3 commit for 10 cases, c3 and c5 among them, and nine mutants each fail their test (row "built: S4 cuts"); a decision that empties a piece already waits on its pending cuts, so the correction case uses a correction that removes a piece the decision leaves non-empty (row "a correction inside a decision").
- [x] S5. Laws. In `authored-tree-resolve-laws.test.ts`, compare whole canonical documents and remaining tags instead of block texts; generate linked tags on texts and elements (stacks, reopened changes, amendments, forks) and inline cuts; drop the same-key and inline exclusions. Add Enter inside an inline element and Editing removals of cut pieces, in both intents, to `authored-tree-recording-laws.test.ts`. Add a decision-partition law through the public `decide` on an editor with a generic test correction that resizes children to sum to 100, over recorded histories that include an Editing correction followed by another suggestion. Proof: the laws pass on three fresh seeds, and each fails on a planted defect through `mutate.mjs`: a wrong value with every wait intact, `decideKey`'s waits removed, a cut left on the wrong fragment, and the content read removed from the test correction. Done 2026-10-10 on frozen commit 346bc16240: the laws pass on fresh seeds and each planted defect fails them (row "built: S5 laws"); the partition law compares structure and tags and checks the sum after every decision, because sizes depend on the order (row "deviation: the partition law"); the laws found three defects, now fixed (row "three defects the laws found"); links stay out of the general recording laws, which they made fail one run in three on transfer cases now in Open work.
- [x] S6. Collaboration, on the collab tests' one-seed pair harness, run with each client winning the scalar. Two clients suggesting one property concurrently produce a fork, with equal branches, branches of different lengths, and one client amending its own tag while the other stacks on the old one; a single decision on a fork tag answers `blocked`; deciding the whole fork gives the live value when all are accepted and the value under it when any is rejected, on both clients; tags stacked above a fork keep their own decisions; two reviewers each deciding the whole fork converge; two clients each insert a column, a third types in Editing, and rejecting both gives 30/70 on every client; one client adding a tag while another removes one converges. A partial delivery, where one client joins a fork before another branch arrives, forms one fork region; one client accepting a tag while another stacks on it leaves a tag whose `over` is gone, read as written over the accepted value. Record the named races as limit assertions with their exact results: a rejection racing a suggestion stacked on the rejected tag; overlapping batches on one key decided differently or compatibly; an Editing takeover racing a suggestion stacked on the taken-over tag; a writer withdrawing its own run while another client stacks on it; two clients removing neighbouring cut pieces; and a correction on one client before a fork, which makes its bottom tags differ. Proof: the collab test log, with each case's outcome recorded. Done 2026-10-10: 14 collaboration cases pass for both winners and the named races are pinned with their exact results (rows "S6 collaboration tests", "S6 named races"); the races exposed two Yjs binding losses, now limits with Open work (row "two collaboration losses").
- [x] S7. Structural leftovers that this iteration's laws depend on. A struck quote whose block children are all withdrawn keeps one default child, with a law that every element holds a child (the structural iteration's build panel round 3 reproduced the defect); the Editing law's fallback normalizes only the boundary after a struck block, with a planted dropped split as a second control. Proof: one test per item, each failing on the base. Done 2026-10-10 on frozen commit c61ac936f8: the emptied struck quote keeps its default child and fails on the S5 commit, the laws check every element holds a child, and the narrowed fallback catches a planted dropped split (row "built: S7 structural leftovers"); a suggested join that crosses into a quote stays in the pre-existing flaky family Open work names.
- [x] S8. Native proof. Add to `apps/www/tests/browser/authored-review.spec.ts`: Enter inside a link in Suggesting, then reject, gives one link and takes follow-up typing; bold toggled twice by two changes, then rejected, returns to plain. Run the spec five times warm without retries. Proof: the five Playwright logs. Done 2026-10-10: the proof route gained a `values` fixture with a link and a seeded bold change; all 21 tests of the spec pass in five warm Chromium runs with no retries (row "built: S8 native proof").
- [x] S9. Speed on the built path, through `benchmark`. Rerun S1's and S3's rows on the final tree, and add the integrated recorder: Suggesting typing and a Suggesting format write at 100, 5,000 and 20,000 blocks with fixed local history, then 1, 10 and 100 tags on one text at fixed size, each with a deterministic count of nodes the recorder visits; Enter inside a link and an Editing removal of a cut piece at 100, 5,000 and 20,000 blocks, counting the nodes the cut lookup visits; a 60-step Suggesting drag of a column border, with its tag count and saved bytes; a decision on a fork and a blocked decision; and the Yjs update size for one more tag and one cut. Freeze these new rows' budgets on the base before reading the candidate, reuse the parent's P1.13 typing budgets where a row matches, and require a planted whole-document scan to fail. Proof: the evaluator's logs. Done 2026-10-10 on frozen commit 7207d27aa3 against the base 8e3883fca1, three interleaved packets per side (`values/bench/s9/`): the first run found that the cut relink read every node twice on each Editing keystroke and decision, and that the resolver read every list again to look for cuts. The relink now reads only the nodes a transaction replaced, and the resolver skips the join when no cut is rejected (rows "fix: bounded cut relink" and "fix: the resolver skips joining"). After the build panel, a rerun on frozen commit 508c7b6245 (`values/bench/s9/evaluate-rec-a3.log`, `evaluate-key-a3.log`, `evaluate-doc-a3.log`) replaced that run. Every work and bounded-reads line passes, the planted scan fails all 15 bounded-reads lines, and the S1 microbench passes. Five lines fail, each with a Defaults row: the Suggesting bold toggle at 5,000 and 20,000 blocks, the three-key bytes row, and two lines that passed before the panel and moved only on this loaded run, Suggesting typing scaling and a top rejection at 20,000 blocks. Timed alone, the relink that the panel added to Suggesting typing costs 0.026 ms at 20,000 blocks (`values/bench/s9/relink-cost-a1.log`). The decision rows are "S9 recorder rows rerun on the final tree after build panel round 3", "S9 reruns of S1 and S3 on the final tree after build panel round 3", "isolate the relink cost on a Suggesting keystroke" and the accepted rows after them.
- [x] S10. Decide keep or revert this iteration, then return to the parent plan's Phase 2. Proof: a decision-log row citing S1 to S9. Done 2026-10-10: kept (row "S10: keep this iteration" in `docs/plans/2026-10-10-authored-values.decisions.tsv`); the parent plan's Phase 2 follows this iteration's close.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Suggestions built on each other | Accept them from the bottom up, reject them from the top down, or decide them together; column inserts in one group always stack this way, and a later edit that makes the column plugin fix widths joins the stack (look) | Decide each alone; the editor keeps extra records so any order works | decide stacked separately | big |
| Two people suggesting the same property at the same moment | Their suggestions are decided as one group; if any of them is rejected, the value from before the group comes back (look) | Keep each one's value so a mixed decision can keep the accepted one | keep concurrent values | small |
| Deciding suggestions one at a time when a plugin fixes values like widths | Every order keeps the same structure and suggestions, and each decision leaves valid values, such as widths that sum to 100; the numbers themselves can depend on the order, since the plugin recomputes them from what each decision leaves (look) | Keep enough history to give the exact earlier numbers | exact mixed values | small |
| How plugins compute values like column widths or duplicate tags | They skip crossed-out nodes, by asking each node whether it is content; the table repair fixes a table only when what remains without crossed-out rows and cells is broken, and then fixes every row (look) | Leave plugins unchanged and accept wrong widths and lost tags after some decisions | leave plugins | big |
| Undoing an Enter inside a link after one half changed | The joined link keeps the left half's properties, as joining two elements does | Refuse to join halves that differ | refuse different halves | detail |
| A property set to null | Counts as absent, as collaboration already stores it | Tell null and absent apart | keep null | detail |
| Suggestions inside code blocks | Still off for now; stopping typing before it reaches the code editor waits for phase 2, which brings in the code block plugin (look) | Design it here too | code blocks here | small |
| Leftover fixes from the structural iteration | This iteration takes the two its tests depend on: an emptied quote left with an empty paragraph, and the too-wide Editing check; IME starting on a selection, uneven splits, a withdrawn split read as an unwrap and the step origin as a parameter wait in open work | Take all six here | all leftovers here | small |
| Two people acting at the same moment on stacked suggestions of one property, or on neighbouring pieces of a split link | The results merge the way two plain edits do, so a rejected value can stay, a suggestion can keep a value it did not propose, or a link can stay in two pieces; each case is pinned in a test | Keep extra records so every such race resolves exactly | hold stacks | detail |
| Rejecting a width suggestion after normal editing changed the same group | The plugin repairs the widths from what remains, which can differ from what normal editing alone would give (look) | Keep the values normal editing overwrote so the result is exact | exact widths | small |
| A list item added next to a crossed-out item | For now it joins the crossed-out item's list, because skipping crossed-out items read every one of them on each keystroke; the next iteration skips them without that cost (look) | Join the list normal editing gives, reading past every crossed-out item | skip struck items | detail |
| Multi-select cleanup after each commit | Unchanged: typing a query next to a crossed-out tag already matches normal editing | Make it skip crossed-out text and tags too | adopt cleanup | detail |
| Saved size of a suggestion that writes several properties at once | Each property gets its own tag, so a write of three properties saves about 140 bytes more than today (363 against 223, over the 1.5 times budget); one property costs less than today (look) | Merge the properties of one write into one tag, which loses the per-property links | compact tags | small |
| Tag ids | 12 random hex digits, since an id only has to differ from the other tags on one property of one node | Full UUIDs | uuid tag ids | detail |
| Table column widths while a column deletion is pending | Resizing a column in normal editing replaces the table's whole width list, so rejecting the deletion leaves the restored column's width wrong (look) | Store a width on each column first | per-column widths | small |
| Toggling bold on and off in Suggesting | The second toggle takes back the writer's own suggestion and the text merges back into one piece, as in normal editing, so each toggle costs what a normal-editing toggle costs: about 24 ms at 20,000 blocks, where the old code took 12 ms because it left an empty record that kept the text split (look) | Leave an empty record behind so the text stays split | keep toggle residue | small |
| Taking back your own Enter inside a link | The split stays a pending change: accepting keeps the two links normal editing leaves, and rejecting joins them back into the one link you started with (look) | Remove the split marks, which leaves two plain links that rejecting cannot join | strip withdrawn cuts | small |
| Plugin fixes on something a pending suggestion deletes | A fix about a crossed-out node does not run until the suggestion is decided; a fix on a live parent can still change its crossed-out children (look) | Let each plugin decide whether to fix crossed-out nodes | correct struck nodes | small |
| Deleting a piece of a split link at 20,000 blocks | It takes 7 to 10 ms longer than before, because moving the piece's split records to its neighbours updates the document a second time; that is still inside its speed budget (look) | Fold that move into the first update before keeping this | fold cut moves | small |
| A green check on a checkout other sessions are changing | Close on the check run apart from their work. The one failure this work caused is fixed, and the rest fail the same way without it (look) | Wait until their work lands and the whole check passes | green check | small |
| Two S9 lines on a loaded host | Close this iteration with both over budget. They passed before the build panel and fail after it under the frozen rule, and the cause is not found: the relink the panel added costs 0.026 ms alone, and the same check at 5,000 blocks did not move. The next iteration reruns both (look) | Find the cause and rerun them before closing | quiet rerun | small |

## Open work

- Code-block suggestions stay refused until the parent plan's Phase 2 adopts the code block plugin. owner: zbeyens, through the parent plan's Open work item on code blocks. stop: that item's own stop.
- Table column widths are one list on the table, so an Editing resize during a pending column deletion loses the deleted column's width on reject (panel round 3). owner: zbeyens, through the parent plan's Phase 2 table adoption. stop: the table plugin stores a width on each column, or the owner keeps the Defaults row.
- The Yjs controller drops an error thrown while it turns a commit into Yjs changes, so a commit can reach no peer and no test sees it; S2 found one through a table spec (decision row "fix: an insertion with no old children"). owner: zbeyens, through the parent plan's Open work. stop: a lowering error fails the commit, or reaches the debug channel that tests read.
- The Yjs binding re-creates the siblings of an element another client inserts in Editing, which drops a concurrent suggestion's tags on them, and two clients removing neighbouring pieces of a twice-split link bring a removed piece's text back when the Enters are rejected (both pinned in S6's races). owner: zbeyens, through the parent plan's Yjs binding work. stop: the races test pins the suggestion's tags kept and the piece gone.
- Transfers and moves of text into, out of and across links diverge from Editing or leave an extra link piece in long histories, such as a removed link followed by two transfers, or a range deletion into a link followed by an Editing transfer and an Enter (S5's saved runs, `values/build/s5/rl9-1.log` to `rl9-6.log`). owner: zbeyens, through the parent plan's Open work. stop: the general recording laws hold with links in their documents.
- The recording laws fail on some seeds before this iteration too, 2 of 20 runs on the S1 commit (a moved node with an Editing transfer and a paste, and a quote with a suggested Backspace then an Editing Backspace; `values/build/s4/laws-flake-s1-a1.log`). owner: zbeyens, with the structural leftovers below. stop: 50 runs pass.
- Handing a removed piece's cut records to its neighbours updates the document index a second time, about 7 ms at 20,000 blocks, because each index update copies and freezes the root's child array; the S9 profiles attribute most of a transaction's cost at that size to those copies (`values/build/s9/profile/`). owner: zbeyens, through the parent plan's Phase 2 benchmark item, which has to attribute the 20,000-block cost. stop: the recorder makes the cut moves inside its own index update, or the per-update copy stops growing with the document.
- A writer's Backspace that takes back their own Enter after an inline element strikes the empty text before the boundary as a new pending change, so a change with nothing visible stays; this predates this iteration (`values/panel-build-1/repro/`, probe k10). owner: zbeyens, through the parent plan's Phase 2 cutover of the recorder slot. stop: the withdrawal removes the spacer with the boundary, or a probe shows Editing keeps it too.
- Table border commands beside a pending row or cell deletion write the raw neighbour's edge, so accepting both can leave the border where Editing would not put it, past struck rows, merged rows and shrunk row spans (build panel round 3 reverted the scan; probe `values/panel-build-3/repro/border-rowspan-on-round3-tree-a1.log`). owner: zbeyens, through the parent plan's Phase 2 table adoption, which compiles the table grid over the proposed view. stop: a border spec beside a pending row deletion matches Editing, merged and spanning cells included.
- An emptied struck element's default child is filled down to a text one level at a time, so a required child whose own content allows none can stay empty; no platejs schema reaches that shape, and the resolver fills a child a decision empties by a different rule. owner: zbeyens, through the parent plan's Phase 2. stop: one schema-owned fill to a leaf serves the recorder, the resolver and `schema.create`.
- `nodes.isContent` reads a node's own strike, but the resolver keeps a struck element that holds live content, such as a row whose struck cell Editing typed into; the proposed projection keeps that row while `isContent` answers false for it (`redesign/probes/p5-survival-a3.log`). Plugins that skip it during the pending state recompute it in the decision's own corrections, and no endpoint law in this iteration's tests reaches the case. owner: zbeyens, through the redesign iteration. stop: the content read follows the resolver's survival rule.
- List numbering and ordinals read stored items, so a struck item still takes a number and shifts the ordinals after it (`listIndex.internal.ts`, `listNumbering.internal.ts`; found by the redesign's code map, `redesign/explorer/answer.md`). owner: zbeyens, through the redesign iteration. stop: an ordinal spec beside a struck item matches the display rule that iteration picks.
- List identity counts a struck item as a list item, so an item typed after a struck item joins the struck item's list, which can differ from the list normal editing gives once the deletion is accepted. The close reverted the walk that skipped struck items, because it read every struck sibling on one keystroke (`values/close/list-walk-a1.log`, `values/close/list-walk-a2.log`). owner: zbeyens, through the redesign iteration. stop: list identity skips struck items through an index of content neighbours, with a read count that stays flat beside a long struck run.
- The cut relink still compares references across the root's children, walks changed nested containers in full when a span changes length, and starts its outward search at a changed region rather than at the removed fragment. owner: zbeyens, through the parent plan's Phase 2 benchmark item. stop: the relink derives its regions from the recorded change's ranges.
- `keepsOnSplit` re-derives ancestors from the review draft's root and fakes a value to ask the schema about one key. owner: zbeyens, through the parent plan's Phase 2 cutover. stop: the schema answers a per-key split question from explicit ancestors.
- Four structural leftovers from `docs/plans/2026-10-09-authored-structural.md`'s round 3, each inferred by its reviewer and never run: composition start reads the selection before it deletes it; a split that reopens fewer elements than it closes; a withdrawn split after a removed first node read as an unwrap; `replaceChildren` taking its origin as a parameter instead of the ambient scope. owner: zbeyens, through the parent plan's Phase 2 cutover, which rewrites the recorder slot and composition path. stop: each reproduces and is fixed there, or a probe shows it does not reproduce.

## Close

### Reversals and deviations

- S1 approved a `formatLayerView` read in `layers.ts`. The build deleted it, because nothing calls it before the review card exists; that card adds the read with its first caller (row "deviation: formatLayerView is deleted").
- Build panel round 1 made a writer's taken-back Enter strip its cut tags. Round 2 reverted that, because a reject then left two links. The cut stays pending, as Main changes says and the Defaults row "strip withdrawn cuts" records.
- Round 1 added a content-aware edge to the table border commands, and round 2 replaced it with a grid scan. Round 3 reverted the border commands to the code before this iteration, so the claim narrows. Border commands beside a pending row or cell deletion still write the raw neighbour's edge (Open work).
- Round 2 replaced the approach of three more round-1 fixes: the details correction's skip became the correction runner's skip of an entry that is not content, the default child carries every insertion and deletion of its element and fills by its type's content, and struck list siblings count for nothing instead of using a separate cap. Round 3 dismissed its critical on the default child's fill with a reason, and the close reverted the list walk (next bullet).
- S2 adopted the content read in list identity. Build panel round 3 dismissed the critical that its walk reads every struck sibling on a keystroke, because the list it picks is right; the decision-trail review showed that reason does not answer the per-keystroke cost rule. The walk had already had its one replacement, so the close reverted it to the code before this iteration and narrowed the claim: an item typed after a struck item joins the struck item's list again (Defaults row "skip struck items"; `values/close/list-walk-a1.log` reads 2,001 siblings beside 2,000 struck items, `values/close/list-walk-a2.log` reads one). Its two tests went with it.
- S2 left the multi-select commit cleanup unchanged instead of adopting the content read, because its cases already match Editing (row "deviation: the multi-select commit cleanup").
- S5's partition law compares structure and remaining tags and checks every decision leaves valid widths, instead of the exact numbers, because a plugin's repair depends on what each decision leaves (Defaults row "exact mixed values").
- The plan kept blocking a buried rejection instead of the cross-judge's kept rejected-layer records (Defaults row "decide stacked separately"), and moved code-block suggestions to the parent's Phase 2 (Defaults row "code blocks here").
- S9 accepted five lines over their frozen budgets, each a Defaults row: the Suggesting bold toggle at 5,000 and 20,000 blocks ("keep toggle residue"), the three-key bytes row ("compact tags"), and Suggesting typing scaling and a top rejection at 20,000 blocks, which passed before the build panel and fail after it with the cause not found ("quiet rerun"). An earlier draft of this Close called them host noise; the decision-trail review showed the run sat under the frozen rule's load limit, so they count as failures. The a2 run that S9 first closed on measured the tree before the panel; the a3 rerun on the final tree replaces it. A cut-piece removal at 20,000 blocks, accepted on a2 ("fold cut moves"), passes on a3.
- The plan said no public docs page needed changing. `nodes.isContent` is a public read, so `content/docs/api/editor-api.mdx` and its Chinese twin teach it, and the plate-docs gate applies.

### What landed

- Format suggestions are immutable tags linked to the tags they were written over. `decideKey` in `authored/tree/layers.ts` decides each key, so stacked suggestions decide bottom up, top down or together, and concurrent ones decide as one group.
- `runEditorCorrection` marks a plugin correction's writes as `source: correction`, Editing corrections keep every tag, and the builder's canonical origin is `canonical`.
- `nodes.isContent(node)` answers whether a node is content. The column, multi-select, table repair and details plugins skip what a pending suggestion deletes, and the correction runner skips an entry that is not content.
- A split's continued element copies the content tags and the format tags of keys the schema keeps on that split.
- Each Enter inside an inline element puts a cut on both halves. `authored/tree/cuts.ts` moves cuts on later splits and removals, in both intents, and the resolver joins a rejected cut's surviving pieces.
- A struck element whose children a suggestion all withdraws keeps a default child that carries the element's marks.

### Proof

- The decision and recording laws compare whole documents on fresh seeds, and each planted defect fails them (rows "S1 law test against four planted defects", "built: S5 laws"). The general recording laws leave links out, because transfers into and out of links failed two of six runs (Open work); the cut tests and the cut recording law cover Enter inside a link and the removal of a cut piece.
- Every new package test fails on the commit before its slice or through a mutant (rows for S2 to S4, S7 and each build panel round).
- 14 collaboration cases pass with each client winning the scalar, and the named races are pinned (rows "S6 collaboration tests", "S6 named races").
- The authored review spec passes five warm Chromium runs on the final bytes, after the list walk's revert (row "Chromium five warm runs on the bytes after the list walk's revert").
- On the final tree, every speed work and bounded-reads line passes and a planted whole-document scan fails all 15 bounded-reads lines; the S1 microbench passes; five timing and bytes lines fail, each a Defaults row (row "S9 recorder rows rerun on the final tree after build panel round 3").
- `pnpm check` fails 12 of 25 steps on the shared checkout. Run at HEAD and at HEAD plus this task's files in detached worktrees, HEAD alone fails three of them (an `apps/www` test batch, a knowledge citation and a stale API reference manifest). The task's files add three: two recording laws timing out under load, now moved to the slow lane; the entrypoint Turbo state test, from copying a generated file that carries other sessions' partitions; and knowledge findings on lines that cite files not yet committed (rows "pnpm check's failing steps attributed in detached worktrees" and "fix: the recording laws move to the slow lane"). Every `platejs` and `plitejs` typecheck partition on the shared checkout reports errors only in `listIndex.internal.ts`, another session's file (`values/close/typecheck-all-a1.log`).

### Proof limits

- Native proof ran in Chromium only. Firefox and WebKit did not run the spec.
- Collaboration ran on the collab tests' in-process pair harness, not over a network.
- Timing ran on one development machine under load, with interleaved packets.
- `pnpm check` cannot pass on this checkout while other sessions' list and DOCX work is uncommitted, so the check gate rests on the isolated attribution, not a green run, and counts as partial.
- The general recording laws now run in the slow lane, `authored-tree-recording-laws.slow.ts`, because each takes 1.8 to 5 seconds; S5's step names the file it had.
- Two S9 lines that passed before the build panel fail after it, and their cause is not found; the redesign iteration reruns them.
- S7's law that every element holds a child holds for the schemas this repository registers; a schema whose required child allows no text and names no default element can still leave that child empty (build panel round 3; Open work).
- The correction gate stops a correction whose entry a pending suggestion deletes. A correction on a live parent can still rewrite struck children, and no probe covers a children-only correction after a rejection.

### Counts

22 items: the 10 steps and the 12 completion gates. 21 done, 1 partial (the `pnpm check` gate), 0 skipped, 0 blocked, 0 open. S9 counts as done through its accepted rows, and S2 through its narrowed claim after the list walk's revert.

### Build panel

Three rounds ran with opus at high, astra at xhigh and sol at xhigh (`values/panel-build-1/` to `panel-build-3/`). Rounds 1 and 2 applied every critical. Round 3, at the cap, reverted the table border scan and dismissed two criticals: the default child's one-level fill reaches no shape a `platejs` schema registers (`values/panel-build-3/repro/plate-create-a1.log`), and the list walk past struck siblings computes the right list. The decision-trail review showed the second reason misses the per-keystroke cost rule, so the close reverted the walk. Both are Open work for the redesign iteration.

### Decision-trail review

Reviewed by gpt-6.1-sol @xhigh, on frozen commit `634d575ffe` (`values/trail/seat-sol.md`), against both session transcripts.

Attention:

- Critical. The Close called two S9 failures host noise while the run sat under the frozen rule's load limit. They now count as failures with the cause not found, under the Defaults row "quiet rerun", and the redesign iteration reruns them.
- Critical. `pnpm check` had been attributed by reading failure lines. A run in detached worktrees replaced that; it found one real task failure, the recording laws timing out under load, now in the slow lane.
- Critical. The title and Brief promised order-independent decisions while widths a plugin recomputes can differ by order. Both now say structure and suggestions match in any order and those widths can differ.
- Critical. Build panel round 3 dismissed the list walk's per-keystroke cost because its output was right. The close reverted the walk to the code before this iteration, so a new item beside a struck item joins the struck item's list again until the redesign's list plan.
- Warnings. The link exclusion from the general recording laws, the childless-descendant limit on S7's law and the entry-only correction gate are now in Proof and Proof limits; the parent plan's Phase 2 gained a code block step; the redesign plan labels the older page's description inferred; these counts were recounted.


### Reflect

One opus reviewer applied the judgment, tooling and divergent lenses to the transcript from the owner's "ok go" onwards (`values/reflect/reviewer.md`); the lead synthesized.

- Applied without waiting: none, since no finding fixes a script that refuses a case its own rule allows or rewords a rule with no net words.
- Built: none in this session. Three findings repeat the structural iteration's reflect Backlog (helper usage on `--help`, `freeze.mjs` path lists, rule triggers on compaction): `cross.mjs` printing its usage, `freeze.mjs` naming missing paths, and `reread.mjs` listing the skills to reload after a compaction. All three are shared pstack helpers, so they go to the shared source through sync-pstack's Lesson mode and a panel; a proposed session carries them.
- Backlog, owner: zbeyens, stop: the owner takes or drops each: `decisions-check.mjs` refusing an accepted row that calls a `verdict: fail` log noise; a repository script for attributing `pnpm check` failures in detached worktrees, which blame rows cite; `decisions-check.mjs` requiring a dismissed critical to cite a failing planted run; a script that lists every Plate schema's min-zero content slots for absence claims; a Stop hook that warns when a plan changed since the last publish and the reply carries no page link; a `Previous page:` line in subject files; a running marker from `cross.mjs`; `lint:task --from <paths file>`; `proof-worktree.mjs` refusing `--with` on generated files; a blinding script for arena copies; a close-order exception that runs the decision-trail review before the repeated acceptance proof when the last panel dismissed criticals; a hook that checks plate-docs was loaded before a `content/docs` edit; `decisions-check.mjs` printing a stage only on a real stage change.
- Rejected: a future iteration as proof (already covered by `benchmark`'s pre-acceptance rule, which the run skipped and the trail review caught); the owner's pasted status (already covered by Autopilot's most-reversible pick); the docs for `nodes.isContent` (accurate: they describe a node's own strike).

### Open work

The `## Open work` section lists each item with its owner and stop. The redesign iteration the owner approved on 2026-10-11 ("ok go, we want the long term route bestly redesigned from first principles to win this") takes seven of them: the cut relink's regions and its second index update, the table borders, the list walk and list numbering, the default-child fill, and a content read that follows the resolver's survival rule.

## Evidence

Model: claude-opus-5-5 at xhigh effort ran the verdict and the plan.

### Requirements

- Decisions commute over every admissible order and batch; rejecting everything gives the document before the suggestions, and accepting everything gives what Editing gives. Source: the parent plan's Main changes and the structural iteration's decision and endpoint laws. Same-key formats and Enter inside an inline element are carved out today by the parent's Defaults row "Format suggestions and Enter inside a link after the structural iteration".
- One resolver implements accept and reject, and it runs no plugin code (`packages/plitejs/src/authored/tree/resolve.ts:17-34`).
- No branch keyed on a Plate command or plugin, or the plan returns to review (the parent's Defaults row "When to stop"). Plugins see everything and ask for content when they need it (the parent's Defaults row "What plugins see").
- Editing inside suggestions feels like normal editing; the mode only decides whether an edit becomes a suggestion (the owner's typed ask, quoted in the parent plan's Requirements).
- Two collaborators converge on suggestions and decisions (`docs/vision/common.md`, Claim Width).
- Hard laws: `DocumentChange` is the only mutation truth, and every document a consumer reads is schema-valid (`VISION.md`).

### What the current tree does

- Stacked formats, `values/probes/controls-tree-a2.log` (source `values/probes/controls.probe.test.ts`), reproduced in a worktree of the base (`values/probes/base-controls-a1.log`): c1, a change made again through `propose` after another change built on it, stays bold after both are rejected in every order; c2, a mixed batch over toggles, drops the value of the last accepted change in both orders tried.
- Links, same logs: c3, rejecting two Enters typed inside one link leaves three links in a batch and both orders; c5, text another change typed between the halves and the same batch rejects still keeps them apart. c4, deciding the left half's removal first, gives the batch result today, and c6, two reviewers concurrently rejecting competing formats, ends on the original today.
- Derived values with one suggestion, `values/probes/derived-tree-a1.log`: all six cases from the parent's P1.5 pass. Accepting gives what Editing gives and rejecting gives the start, for the 30/70 and 33/33/33 presets, a column inserted into 30/70, a second resize by the same writer, a row deleted across a merged cell, and a task item switched to a bulleted list. A correction that removes a duplicate tag records nothing, because the insert and the removal cancel in one transaction.
- Derived values with two suggestions, `values/probes/derived-two-changes-a2.log`: two changes each insert a column into 30/70, then plain Editing typing, which writes nothing because the widths already sum to 100. Rejecting both in one batch, or Bob's insert first, gives 30/70. Rejecting Alice's first gives 41.1/58.9: the decision's own column correction rewrites the live widths to 20.7/40.7/38.5 while Bob's tags still say 13.3 and 31.1, so Bob's rejection does not recognize the value and restores nothing.
- Corrections that count a struck column, `values/probes/derived-struck-corrections-a1.log` (panel round 1): with Bob's deletion of the third column pending and Alice's 30/70 preset on top, accepting both at once gives 30/70 but Alice then Bob gives 35/65, and rejecting both at once gives the start but Alice then Bob gives 37.5/37.5/25. A suggested shrink from 20/30/50, Editing typing, then reject gives 20/46.7/33.3.
- An Editing command whose correction rewrites widths a pending suggestion holds, `values/probes/derived-editing-correction-a1.log`: Alice suggests a column into 20/30/50, then Editing removes the third column; the correction takes over Alice's width tags, and rejecting her column gives 46.7/53.3 where Editing alone gives 45/55.
- A preset suggested over a pending column deletion, `values/probes/derived-preset-pending-a1.log`: accept-all gives Editing's 30/70 and reject-all the start; the struck column's width drops from 33.34 to 25.0 when Alice is rejected first, which equal widths hid in the first reading.
- A pending url change, then a suggested Enter inside that link, `values/probes/link-url-base-a1.log`: rejecting the url change restores only the left half.
- Plain Plite, no review tree, `values/probes/link-plain-a1.log`: Enter inside a link and then Backspace leave two links. Only rejecting a suggested Enter must give one link back, because rejecting means the Enter never happened.
- Plate's link plugin, `values/probes/link-empty-a2.log`: a Suggesting deletion of a half's whole text strikes the link element itself, so accepting it removes the element; nothing depends on the plugin's empty-link removal.
- Code map, `values/explorer/answer.md` (a Codex reader at medium effort; every asked source covered): a plugin correction's writes reach the recorder with their own origin, such as `props`; the decide transaction runs plugin corrections; no code merges two inline halves; Yjs keeps one scalar value per key by its own conflict rule and every set member under its own key, and removes an attribute set to `null` (`yjs/core/replacement.ts:167-177`). Every plugin correction runs through one call site ([`core/correction.ts`](../../packages/plitejs/src/core/correction.ts), from `editor/correct-document.ts:416`), and eleven Plate plugins register corrections.
- The first two-client column probe did not run its case: its second client seeded the column group a second time (`values/probes/derived-tree-two-clients-a6.log`). S5 replaces it with the collab tests' harness.
- S1's baseline, `values/bench/baseline-a2.log`: today's tree projects 5,000 blocks in about 6.3 ms proposed and 4.8 ms accepted, and 20,000 blocks in 23 to 30 ms; a text with 10 stacked suggestions saves as 1,032 bytes. The planted double-resolve fails every timing line (`values/bench/evaluate-planted-a1.log`).

### Lanes

Format suggestions on one property:

1. Control, keeping the narrowed claim. The decision laws keep excluding stacked formats. It loses because the measured order dependence stays, and AI requests that reopen their own change reach it.
2. Take over at recording, as Word does. A suggestion on a property that another pending suggestion holds takes that property over and keeps the original value. It deletes the stack, and it loses on the two-column case. The takeover drops Alice's layers, so rejecting Bob restores 30/70 while Alice's column still stands, and the decision's correction then gives 35/65 when Alice is rejected (opus runner, Alternatives).
3. Never-rewritten layers ordered by depth. It loses because depth cannot tell concurrent writes apart, and a correction can make a value-matched contested test fire for one client (panel rounds 1 and 2).
4. Immutable tags linked to the tips they were written on, with fork regions decided as one step and stacks decided in order or together. Picked, as the Comparison says.

Column widths and other derived values:

1. Control, where corrections stay recorded into the suggestion, count every child, and Editing corrections take over. It loses because stacked derived values, struck columns and Editing corrections break as measured.
2. Never suggest derived values; corrections apply directly, and a decision's correction derives them again. It loses because rejecting a column insert gives the plugin's repair of what remains, 36.7/63.3 for the 30/70 insert under its equal-deficit rule, where today's tree gives 30/70.
3. Derived values are layers like any other, corrections count only content children, and an Editing correction keeps every layer. Picked.
4. Corrections see a proposed view in core, with their writes mapped back to the review tree. It loses because it brings back a second coordinate space, the cost the parent plan removed (sol runner, rule 3).

Enter inside an inline element:

1. Control, keeping the limit, which breaks "rejecting everything gives the document before".
2. Merge at the seam by adjacency with the round-3 patches. It loses because adjacency picks an unrelated link once a half is gone.
3. Merge equal adjacent inline elements everywhere. It loses because it changes plain editing, risks merging voids such as two mentions, and Enter then Backspace would start giving one link.
4. A split tag with the change id on both halves. It loses because one change can split several links (panel round 1).
5. A cut id and side on both halves, moved on a further split. It loses because an Editing deletion of a middle piece breaks the chain (panel round 2).
6. Cuts that also move when any transaction removes a piece, merged keeping the left half's properties. Picked.

### Architect

Three runners received one task (`values/architect/task.md`, grounding `values/grounding.md`) and returned candidates (`runner-opus.md`, `runner-astra.md`, `runner-sol.md`; Sol's first run returned nothing and its rerun answered). The opus cross-judge read blinded copies (`cand-1.md` to `cand-3.md`, map `name-map.tsv`) against a rubric frozen before any candidate was read (`judge-rubric.md`), with the lead's later probes named in its prompt, and verified the claims its scores rest on (`judge.md`). The synthesis takes the opus design as base with the grafts and cuts in the Comparison.

### Plan panel

Round 1 ran opus at high, astra at xhigh and sol at xhigh on frozen commit `71b6da34e6` (`values/panel-plan-1/seat-*.md`). All three seats found that corrections in later transactions and in decisions still count a column an earlier suggestion struck, which the lead reproduced on today's tree (`derived-struck-corrections-a1.log`). Astra and opus found that depth does not say which client's write is live after a merge; astra, sol and opus that an in-place amendment leaves a stale `wrote` that the mixed-fork rule then restored; astra and sol that a change id cannot name one inline split and that splitting a half loses the earlier cut. Astra's side finding showed the Yjs binding drops `null`.

Round 2 ran the same seats on frozen commit `7409312841` (`values/panel-plan-2/seat-*.md`). All three found that inferring concurrency from a live value matching an earlier tag lets a correction make a single client's decisions depend on order, and that a same-depth amendment leaves another client's tag pointing at a value nobody proposes. All three found that the filtered children list loses each child's real path, so a struck middle column takes the wrong width, and that an Editing deletion of the middle piece of a twice-split link breaks the cut chain. Astra found that copying format tags overrides the schema's split policy and that split-dropped ids keep two halves apart; astra and sol that the multi-select duplicate check counts a struck tag; sol that an accepted one-sided url change keeps halves apart. The lead checked each code fact (`BaseListPlugin.ts:359-376`, `ElementIdPlugin.ts:58-68`, `BaseMultiSelectPlugin.ts:61-70`, `interfaces/editor.ts:961`).

Round 3, the last plan round, ran on frozen commit `4217367d45` (`values/panel-plan-3/seat-*.md`). Astra found that accepting a later preset over pending structure lets decision corrections give different widths per order, and that table repair counting a struck row adds a cell; astra and sol that table widths are one array an Editing resize takes over, and that a correction before a fork makes its bottom tags differ; sol that an Editing correction overwrites a value no tag protects, and that removing the original left half loses its id; astra that a withdrawn own run drops ancestry another client stacked on, that concurrent removals of neighbouring pieces lose cuts, and that accepted gap text keeps the halves apart; opus that the merge's tags were undefined and that a removed `over` left tags unordered. The fixes at the cap and the narrowed claims are in the Challenge delta; the build's diff panel reviews them. The decision log holds one row per finding.

### Retained reviews

This iteration retains `2026-10-08-authored-review` (Pursue), whose review tree it keeps, and builds on `2026-10-09-authored-structural`, whose per-step recorder and two-phase resolver it extends. It reopens neither.

### Proof limits

The probes ran single-client on the working tree, except c6, which ran two Yjs peers. Every probe that used a forced change id kept one author, so no probe tested two real authors. The prior-art rows come from the format specification and test names, not a run of either editor. These limits cover the planning probes; the Close's Proof limits cover the build.
