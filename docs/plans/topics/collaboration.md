# Collaboration binding, transport and presence

Page: https://claude.ai/artifact/WcqeKceiK9ygWa4RiMBcEC

The app owns the `Y.Doc`, initial-load readiness, awareness and the provider. One native Yjs binding consumes accepted commits and imports remote changes canonically, and its inferred `api.yjs` exposes presence and compaction methods only when their inputs are supplied. Plate composes that binding with no store of its own, and there is no `read.yjs` or `tx.yjs`. A split travels as a cut marker inside a line's Yjs text, so every letter keeps its Yjs identity. The 2026-10-04 audit found the 2026-09-14 lifetime target live and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [lifetime plan](../2026-09-14-collaboration-lifetimes.md)). `node tooling/scripts/review-ledger.mjs show collaboration` prints the full history.

## Public API

The collaboration example binds its room with the native binding's options.

```ts
// apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx
  yjs({
    ...options,
    initialReady: true,
    rootName: ROOT_NAME,
  });
```

The Yjs docs page binds a provider's room with the same options, and a room an older build saved fails at this call.

```tsx
// content/docs/plite/libraries/plite-yjs.mdx
// A room saved in format 4 fails here with "Cannot open a Yjs document
// written with schema metadata format 4; this editor reads format 5."
const editor = createEditor({
  plugins: [
    history(),
    yjs({
      doc: provider.document,
      initialReady: createHocuspocusInitialReadiness(provider),
      awareness: provider.awareness,
      rootName: "plitejs",
    }),
  ],
  initialValue,
});
```

## Document shape

Every peer that loads a room keeps the empty texts beside a link that storage holds.

```json
// Stored Y.XmlElement tree of the paragraph after Ed loads the room
{ "nodeName": "paragraph", "children": [
  { "text": "" },
  { "nodeName": "link", "attributes": { "ref": "r1" }, "children": [{ "text": "ab" }] },
  { "text": "" }
] }
```

When a peer inserts a link into an empty paragraph, storage holds no empty text before it until the next local edit there writes one. Two peers that write it at once store two empty texts, which read as one.

```json
// Stored children after Alice's link insert, then Alice proposes ref r3 while Ed unsets ref
[{ "nodeName": "paragraph", "children": [{ "text": "" }, { "text": "" }, { "nodeName": "link" }, { "text": "" }] }]
```

The editor value drops an empty text beside a link where a lettered text shares its side, in every editor, so a bold letter typed after a link leaves no empty text between them.

```json
// Editor value of the paragraph's children after a bold X is typed after the link
[{ "text": "" }, { "type": "link", "ref": "r1", "children": [{ "text": "ab" }] }, { "text": "X", "bold": true }]
```

A split stores a cut marker in the line's Yjs text and an empty view text in the new line, so each letter keeps its Yjs id. Splitting "word" after "wo" stores this, with ids written as `client.clock`.

```json
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" },
    "children": [ { "xmlText": { "yjs:id": "t1" }, "items": [
      { "id": "1.0", "insert": "wo" }, { "id": "1.4", "insert": { "yjs:cut": 1 } }, { "id": "1.2", "insert": "rd" } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" },
    "children": [ { "xmlText": { "yjs:id": "t2", "yjs:cut-source": "t1", "yjs:cut-at": [1, 4] }, "items": [] } ] } ] }
```

A split before an inline element moves it and the text after it into the new line by placeholder and hides the originals where they are. The new line starts with the empty text Plite keeps before a link.

```json
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" }, "children": [
    { "xmlText": { "yjs:id": "t1" }, "items": [ { "insert": "word" } ] },
    { "element": { "type": "link", "yjs:id": "l1", "yjs:hidden": true }, "children": [ { "xmlText": { "yjs:id": "t2" }, "items": [ { "insert": "LINK" } ] } ] },
    { "xmlText": { "yjs:id": "t3", "yjs:hidden": true }, "items": [ { "insert": "tail" } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" }, "children": [
    { "xmlText": { "yjs:id": "t7" }, "items": [] },
    { "element": { "yjs:virtual-child-id": "l1", "yjs:virtual-placeholder": true } },
    { "element": { "yjs:virtual-child-id": "t3", "yjs:virtual-placeholder": true } } ] } ] }
```

## Layer and owner

```text
app-owned provider → document + explicit readiness + awareness
native Yjs binding ↔ accepted commits / canonical remote imports
mounted editor view → mapped cursor reads → copied Plate presentation
```

| Responsibility | Decision |
| --- | --- |
| Document truth | Accepted canonical changes; a discarded spec or aborted update publishes none of its effects. |
| Remote import | Keeps schema admission, named roots, selection mapping, history policy and shared authored effects; pre-sync room content is never replaced by a placeholder, and an import never deletes a stored text inside an element unless an authored admission repair removes it. It reads a split from what the batch moved, counting each node where it showed before the batch. At each level of the new line, the copy is the element right before the first placeholder of a moved node, whatever new text comes before it. |
| Splits | A split travels as a cut marker inside the Yjs text, and whole children after it move by placeholder. The receiving peer reads the cut back as the split, and a join of a cut's two halves deletes the cut. No write copies letters to split. |
| Removed letters | Each binding write notes the nodes it stops showing and the cuts it makes. When the write ends, it deletes the letters no line shows and removes a cut whose new line was never written. Each transaction settles only its own notes. A rewrite may replace a line that holds no node another line shows. |
| Plite path lookups | Every lookup from a Plite path to a Yjs node, and back, pairs children at each level through the one alignment owner. |
| Joins that undo a split | A join at several levels, as the undo of an Enter inside an inline element makes, lowers as one join. At each inline level it heals the cut or drops the empty copy, and the second line's later children move back by placeholder. The receiving peer reads it as one join. Two undos still travel as a rewrite, as on next, and Open work names them. In one, the Enter cut at a child boundary inside a nested inline element. In the other, its commit changed the copy's type. |
| Empty texts after a structural change | The fill stays. A line a split or a join wrote drops each empty text the same write stored that never held a letter and sits next to another text. A line that the undo of an Enter inside an inline element joins also drops older ones. |
| Transport | The app or provider owns connection, errors and teardown; the editor has no transport commands. |
| Presence | Transient and view-specific; automatic selection publication stays commit-owned. |
| Plate configuration | `YjsPlugin.create(options)` builds the complete descriptor; copied UI derives `CollaborationPlugin` once with `YjsPlugin.require('awareness').map(stage)`. The native owner is the only source of option-dependent document, presence, compaction and cursor-data capabilities. |
| Cursors | Plite owns mapping and neutral reads, Plate supplies unstyled selection decorations, and the copied overlay owns appearance. |
| Custom adapters | `YjsUpdatePolicy` stays for the documented custom-adapter job. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Live `tx.yjs` transport calls | Fired provider, awareness and pause effects even when the transaction was discarded or aborted. |
| Plate's nullable `YjsPluginState` copy of the options | A second configuration owner with no reconfiguration job. |
| A neutral Hocuspocus helper | No job the app-owned provider lacks. |
| A generic collaboration session service | Would duplicate the provider and the private binding owner. |
| Awareness merged into document content | Presence has its own expiry and undo semantics. |
| All collaboration inside Plate | Raw Plite examples need neutral synchronization and cursor reads. |
| Generic commit or snapshot broadcast instead of Yjs | Local changes alone give no concurrent or offline convergence or durable relative identity. |
| One Yjs writer for every local move, a single move included | It fixes nothing the current writers miss once three of their rules are fixed. Those writers still leave the peers apart in 66 of 12,000 generated updates over top-level paragraphs and headings, each with the receiving import's signature ([2026-10-24 review](../2026-10-24-collaboration-move-lowering.md)). Each single move would cost work that grows with the moved block, inferred from source and not measured. |
| Writing each changed window as removals and insertions | A moved block would become a new Yjs node, so a peer's typing inside it would be lost. |
| Pairing a stored block past a missing empty text in `canReplace` | The other readers that pair stored and editor children by position still failed, 80 of 932 race cases in rooms an older build trimmed ([2026-10-24 plan](../2026-10-24-collaboration-empty-text-runs.md)). |
| Deleting the second empty text two peers write into one gap | A delete races a peer typing into that text, and reads already merge the two into one run. |
| Keeping a cut chain's texts in the first line on Enter | It kept a letter a teammate typed after the cut but brought back a letter a teammate deleted there, where `next` keeps it deleted. The cut marker keeps both halves' letters instead. |
| Delete the second half and write a copy | A teammate's edit on the moved letters lands on letters that no longer exist. |
| Letter pools or owner partitions for every block | They rewrite every block's storage and need a placement CRDT before any case passes. |
| Decide from the commit which letters leave | A rewrite writes fresh copies while the commit says the line moved. |
| Leave nested path lookups counting Yjs children | Removed links and doubled fills leave more stored texts than Plite texts. |
| Keep next's fill in a split's lines and step over its texts | Typing at the new line's start hides the split anyway, and keeping the texts in the first line moves a teammate's letter there. |
| Keep the undo's rewrite and delete hidden lines no line shows | A teammate's letter typed at the same moment is still lost. |
| Mark each split on the new element | A second stored truth beside the placeholder the split already writes. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Native Yjs collaboration receives its exact `Y.Doc`, initial-load readiness,
  optional awareness and explicit seed authority at descriptor construction.
  The app owns provider connection, replacement, errors and destruction. The
  binding admits a compatible room once per document generation, blocks
  document and shared-effect publication before admission, retains failed
  imports for explicit retry, and remains admitted during later disconnects so
  offline edits and local history continue. Presence and compaction methods
  exist in the inferred `api.yjs` only when their inputs are supplied. Live
  admission and awareness state never become replayable `read` methods or
  transaction updates; each `(Y.Doc, rootName)` has one binding owner while
  mounted views retain exact selection projection. The binding takes its
  document when its editor goes live and frees it when the editor is released, so a
  remount or a replaced editor binds the same document again. Before that, its
  status answers waiting and its cursors answer none.
- An import never deletes a stored text inside an element unless an authored
  admission repair removes it; otherwise only bare texts among a block root's
  children and duplicate placeholders are pruned. Before
  a local change is written to storage, the binding writes an empty text into
  each gap of every block the change touches, and after a structural change
  into each gap of the result's blocks, so every reader that pairs stored and
  editor children by position finds them in step. The fill writes and never
  deletes, because a delete races a peer typing into that text. A schema with
  content roots fills every block before the root's rewrite. The fill skips a
  block it already checked until a peer's update does more than type into
  stored texts. A read inside a lowering finds each referenced node through
  the write scope's root index instead of walking the document. After the
  fill, a line a split or a join wrote drops each empty text the same write
  stored that never held a letter and sits next to another text, which no
  peer can be typing into yet. A line that the undo of an Enter inside an
  inline element joins also drops older ones, and a teammate's letter typed
  into one at that moment is lost.
- When authored admission repairs an import, the binding lowers that repair
  once, after the import's own bookkeeping. It writes deletions of the stored
  items and letters the repair removes and attribute writes on the items it
  keeps, never insertions, so admitting peers that write the same repair merge
  into one copy. Settle names
  each node it removes or reuses in the repair itself; the writer never pairs
  stored and editor children by value to find it. The writer compares each
  stored block with the repair's base as the import reads it, defaults
  included, and leaves out an empty text's properties, because the import
  reads a spacer text that storage does not hold.
  When a peer's update changes the binding's Yjs types after an import and
  before the binding lowers its repair, such as from a listener of the
  import's commit, the binding writes nothing and imports storage again with
  every record pending, so admission settles what storage now holds. A write
  to a Yjs type the binding did not open does not count. A repair the writer
  cannot express, or a stored block that still differs from the repair's base,
  takes the root rewrite, traced as `rewrite`. Limit: a peer update that a
  `beforeTransaction` listener applies inside one of the binding's own Yjs
  transactions joins it under the binding's origin and is never read, so a
  repair's root rewrite can remove it. No provider in this repository delivers
  updates that way. Owner: zbeyens, until the binding reads such an update.
  Limit: when peers receive a late claim that empties a level and the verdict
  on one of its sibling claims in different orders, they reuse
  different removed blocks, so the level can end empty in storage and two
  peers typing into it store two lines. A peer that imports storage again
  receives both at once, which is one such order. Owner: zbeyens, until a donor
  every peer agrees on or a binding that keeps an emptied level
  ([2026-10-26 plan](../2026-10-26-settle-repair-identity.md)).

## What other editors do

The `yjs-collaboration` pages under `docs/research/sources/` hold the provider and binding prior art. For the empty text beside an inline element:

slate-yjs at `69f3e0ea` and y-prosemirror at `9200946f` were read, not run. Neither stores an empty text, and neither rewrites a node to change an attribute.

| Editor | Where an empty text beside an inline lives | How an attribute change is written | Does loading delete stored content? |
| --- | --- | --- | --- |
| slate-yjs | Nowhere. An element is one `Y.XmlText` whose delta holds text and embedded children, and path mapping skips zero-length children (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/utils/location.ts`, lines 66 to 105) | `setAttribute` on the target in place (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/applyToYjs/node/setNode.ts`) | No |
| y-prosemirror | Nowhere. ProseMirror has no empty text nodes | A nested delta diff, so a changed attribute is a `modify` on a retained node (`yjs/y-prosemirror@9200946f:src/sync-utils.js`, lines 393 to 409) | No |
| Plite before 2026-10-24 | A separate empty `Y.XmlText` that the seeding peer writes, a joining peer deletes and an element insert never writes | In place only while stored children match the editor's one to one; otherwise the whole block is removed and reinserted | Yes, for empty attribute-free texts inside an element with more than one visible child |
| Plite | The same `Y.XmlText`, kept by every peer, and written by the first local edit of a block where none was | In place, once the edited block's gaps hold an empty text | No, inside elements |

For a paragraph split, a Codex explorer read upstream source on 2026-10-24 and ran none of it: y-prosemirror `f89fadd2a8`, slate-yjs `69f3e0eaec`, Lexical `dd5c41b131`, Automerge `1618c976ca`, Loro `d5da57dd2a` with loro-prosemirror `0e036a9bed`, Yjs `676cc334ed` and CKEditor 5 `14e73cc31b`. Only the editors that move letters instead of copying them keep a concurrent edit in the new paragraph.

| Editor | How a split travels | Does the second half keep its letters? | A teammate's typing after the cut lands in | Source |
| --- | --- | --- | --- | --- |
| y-prosemirror | It reconciles the document, deletes the suffix and writes a fresh paragraph | No | the old paragraph | `yjs/y-prosemirror@f89fadd2a8:src/plugins/sync-plugin.js`, lines 1075 to 1090 |
| slate-yjs | A text split keeps letters, and a paragraph split clones the suffix | No, for a paragraph | the old element | `BitPhinix/slate-yjs@69f3e0eaec:packages/core/src/applyToYjs/node/splitNode.ts`, lines 47 to 88 |
| Lexical | It reconciles children with fresh containers and string inserts | No | the old element | `facebook/lexical@dd5c41b131:packages/lexical-yjs/src/CollabElementNode.ts`, lines 586 to 629 |
| Automerge | It inserts a block marker into the same flat text | Yes | the new block | `automerge/automerge@1618c976ca:rust/automerge/src/transaction/inner.rs`, lines 893 to 928 |
| Loro with loro-prosemirror | It reconciles the kept text and creates the other side | No | the original container | `loro-dev/loro-prosemirror@0e036a9bed:src/lib.ts`, lines 187 to 226 |
| CKEditor 5 | A split operation moves the suffix, and operational transformation moves concurrent positions | Yes | the new paragraph | `ckeditor/ckeditor5@14e73cc31b:packages/ckeditor5-engine/src/model/operation/splitoperation.ts`, lines 195 to 211 |

Yjs itself has no move and no shared view of part of a text, so a split that keeps both halves' letters needs data Yjs does not have (`yjs/yjs@676cc334ed:src/types/YText.js`, lines 254 to 271, and `yjs/yjs@676cc334ed:src/utils/RelativePosition.js`, lines 163 to 186). The cut marker brings Automerge's approach to Yjs. It puts a marker in the same text, and a view element keeps every block a real Yjs element. Nobody read how Automerge or CKEditor 5 handles a removal that races a merge. The lead inferred from Automerge's design that a block is a marker in one flat text. Removing it deletes its letters, a concurrent merge deletes only the marker, and the letters stay gone.

## Main changes

- Transport commands and Plate's duplicate Yjs store are gone; the binding takes its configuration once at construction.
- Every peer keeps the empty texts beside an inline element that storage holds, and each local edit first writes the ones its blocks lack, so two peers changing one link at once keep one paragraph.
- When a change only inserts or removes elements, an empty editor text takes the stored empty text in its place, so adding and removing a link stores no new text.
- Core corrections keep an empty text beside an inline only where no lettered text shares its run, and a caret at the start of a lettered text stays in that text when the empty text before it goes.
- The binding lowers an import's admission repair through `retractYjsRoot` in `packages/plitejs/src/yjs/core/retraction.ts`, as deletions and attribute writes in place, and checks each stored block against the repair's base first. `packages/plitejs/src/yjs/core/controller.ts` records each Yjs type the binding opens, notes each remote transaction as it starts and, when one changed those types between an import and its repair, imports storage again instead of writing the repair ([2026-10-26 plan](../2026-10-26-settle-repair-identity.md)).
- A split travels as a cut marker inside the line's Yjs text and an empty view text in the new line, and whole children after it move by placeholder while the originals stay hidden. The binding finds the split in the commit's own tokens, and the receiving peer reads it back from the Yjs batch, so history rebases over it as over a join. A join of a cut's halves deletes the cut.
- A text child shows one piece, from its cut to the next live cut. Point mapping counts letters per piece, and a mark that starts a piece anchors on its cut, so the first line's marks never reach the second.
- Each controller transaction opens one write scope. Every helper that can stop a node showing, and `cutTextAt`, takes its handle, and when the scope ends it deletes the letters no line shows and removes a cut whose view never reached the document. Every element removal goes through one private delete in `document.ts`, and a check fails on any other.
- A node shows at one placeholder only, the one in the block that comes last in the document, else the higher Yjs item id.
- `yjsAddressesOf` in `addresses.ts` pairs Plite and Yjs children at every level through `alignYjsChildren` for each lookup from a Plite path, and the raw lookups by Yjs position are gone.
- The import counts each node where it showed before the batch and finds an Enter at an inline element's end from the first placeholder of a moved node. The undo of an Enter inside an inline element lowers and imports as one join across levels.
- A remote import maps the local text selection through its change, so a caret keeps its letter when a teammate edits before it.
- Room metadata moves to format 5, and a room in another format refuses to open.

## Open work

- Manual soaks and broader checkout failures recorded by the lifetime plan stay unrun. owner: the next collaboration review. stop: a soak run on the current tree.
- A void inline, such as a mention, costs one more stored read on the first keystroke in its block after the memo is cleared, because its editor children always hold an empty text. owner: the collaboration subject; stop: a measured cohort with mentions misses the 1.10 budget.
- A stray empty text that a foreign writer puts in a block container, such as a section, now reads as an empty paragraph, and a race there still copies the section. `next` deletes that text but copies the section on every race there, with the stray text or without it (`stray-container-text.ts`). No writer in this repository stores one. owner: the collaboration subject; stop: a writer found that stores one.
- An authored change's `revision` hashes each node's JSON, so two peers holding equal nodes whose properties come in another order read different revisions, on `next` too (`push-r1/probes/revision-order-fix-a2.log`). Nothing compares revisions across peers today. owner: the authored subject; stop: a caller that compares revisions across peers.
- A range end in the kept empty text after a link the range starts in maps as on `next`, not into that text. owner: the collaboration subject; stop: a reported selection that ends in the wrong text after an empty text beside a link goes.
- A range end at the start of a lettered text right after another lettered text maps to the later text's start even when the caller asks for the backward side, where `next` maps it to the earlier text's end. Both are the same visible place (Opus, push round 2). owner: the collaboration subject; stop: a reported mark or selection change at a range end beside a removed empty text.
- The collaboration example's awareness stand-in reports its own client as changed when a remote state arrives (`ExampleAwareness.setRemoteState`, `apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx:243-252`), so the page's cursor labels never show a remote caret, as on `next`. The binding decodes the caret once it hears the right client: a listener event for client 101 made peer B read A's caret at `[0,0]` offsets 0 to 5. owner: the www Plite examples; stop: that example announces the remote client's id.
- The race table has no schema with content roots, so only spec case 14 runs the card's race there (Opus, push round 3). owner: the collaboration subject; stop: a race reported in a schema with content roots.
- A peer whose editor lost focus keeps its caret at the same offset when a teammate types before it, so the caret ends before another letter, as on `next` (`push-r3/drive/blurred-caret-control.md`). owner: the collaboration subject; stop: a report of a blurred peer's caret or typing landing in the wrong place after a teammate's insert.
- `2026-10-10-authored-values.md` keeps an Open work item that waits until the races test pins Alice's removed piece gone. This plan's landing pins it gone, so that item reaches its stop. owner: the authored subject; stop: this plan's landing.
- A saved comment range holds paths, and the comments plugin reads them against the document after loading has corrected it. A document saved by an earlier beta loses each empty text between a link and a text with other marks when it loads, so a range saved after one in that paragraph points one child too far, and creating the editor throws when that path ends inside a text, as the saved playground's did (`land/playground-head-a1-a1.log`). Any later change to the stored shape does the same. owner: the comments subject; stop: a report of a saved comment that fails to load or moves, or Plate v2 promising a saved-document format.
- A peer update that a `beforeTransaction` listener applies inside one of the binding's own Yjs transactions joins it under the binding's origin, and the binding never reads it. When that transaction is a repair, the base check refuses and the root rewrite removes that peer's new line and letter on every peer. No provider in this repository delivers updates that way, and local-commit transactions have the same gap ([2026-10-26 plan](../2026-10-26-settle-repair-identity.md)). owner: zbeyens. stop: the binding reads an update that joins any of its own transactions, or the owner drops it.
- An import that carries only records reads no storage, so its repair's base is the editor's state, and the stale-write check trusts a peer update applied during the import transaction's own cleanup as read. If that update inserted a block before the repaired one, the base check refuses and the rewrite removes that block on every peer (Opus, diff panel round 3, not run). owner: zbeyens. stop: a base-check refusal imports storage again instead of rewriting, or the owner drops it.
- The writer's base check leaves out the properties of every empty text, though the binding keeps a stored empty text's properties as attributes and only an implicit spacer has none. The stale-write check catches a peer's write there first, so no known case differs. owner: zbeyens. stop: the check leaves out only properties storage leaves implicit, or the owner drops it.
- An import with no repair still clears the events of a peer's update that lands while it notifies its commit outside a Yjs cleanup, so the editor misses that update until the next full import, as on `next`. owner: zbeyens. stop: every import that sees a storage write in its window imports again, or the owner drops it.
- A link inserted mid-text still rewrites the whole text, so a teammate's typing or delete anywhere in it is lost. Wrapping part of a text in a link keeps its letters, but a letter a teammate types before the end of the wrapped part lands after the link. On a line a split moved children to, a link inserted into the tail or lines pasted at its start still rewrite the line, so a teammate's letter typed in that line at that moment is lost. These copies are now the only way a rejected deletion comes back, so the authored rule that holds it again lost its two-client cases, and that task checks whether the rule still has a caller. owner: suggested task t_92048e79. stop: that task's plan.
- A room built by hand, where a line points at a placeholder whose target still shows, shows that text twice, as before the split change. No writer is known to make it. owner: the collaboration subject. stop: a user report.
- A teammate's undo of a merge that crossed an Enter where two leaves meet, with no delete, keeps every letter on both peers but drops the Enter. The editor joins the two texts that meet into one, and that join comes back as a whole-line import. Before the split change the peers ended on different documents. owner: the collaboration subject. stop: a user report.
- Rejecting an Enter inside a pending link whose url a teammate changed offline leaves two links side by side, the left with the new url and the right with the old, because a split copies the link's attributes into the right half when it is made. Before the split change the link showed twice. owner: the collaboration subject. stop: a user report.
- Unwrapping a link loses a teammate's letter typed inside it at the same moment, as before the split change. owner: the collaboration subject. stop: a user report.
- Two splits of one line at different points can show the new lines swapped when the later cut's writer has the lower client id. owner: the collaboration subject. stop: a report, or a placement rule for moves.
- A heal racing a removal of the first line leaves the second half's letters in no line, as the old join did. This is the split plan's judge's read, not a probe. owner: the collaboration subject. stop: a user report.
- A peer that never saw a split and removes its block leaves the second line empty, where the old split left a copied half. owner: the collaboration subject. stop: a user report.
- A batch that moves a line and splits it, such as a move and an Enter that a teammate receives together, imports as a replacement. The documents still match, but the teammate's undo of their own letter typed in that line does nothing, as before; delivered one at a time, the undo works. An Enter at a line's end that arrives with a later line's move falls back the same way through `translate`'s read of the root move, though the caret stays. owner: the collaboration subject. stop: an import that reads a batch's moves before its splits.
- The split plan's family keystroke gate stays open. On the landed bytes no run missed its budget of 1.10, 1.25 or 2.0 conclusively, and no single run passed all three lines. The next probe is one run of `bench27/family-key-warm7-config.json` in the repairs plan's run directory through `paired-timing.mjs` that passes every line, and a conclusive miss sends the cut layout back to `architect`. owner: the collaboration subject. stop: that run.
- A source element whose every child moved out by placeholder stays in the room as a hidden element, and a source text whose views all go stays as an empty hidden text, so such Enters leave hidden nodes behind. The hidden empty text behind a placeholder the drop removes may stay the same way, which a delegate inferred without a case. owner: the collaboration subject. stop: a Yjs room compaction task or a room-size report.
- A fresh element of any type that one commit puts right before a moved child reads back as the split's copy. The peers converge and no letter moves; only that line's history and caret degrade. owner: the collaboration subject. stop: a user report.
- Letters a teammate merges or types into a line someone removes at the same moment go with it, as before. owner: the collaboration subject. stop: a user report.
- Fresh lines that replace a line, while a teammate deletes one of its letters and then undoes that, restore the letter twice, wo / rrd where the binding before the split change gave wor / rd, because the teammate's import reads the replacement as a value diff. owner: the collaboration subject. stop: a user report.
- `captureYjsEventBatch`, `mergeYjsEventBatches` and `readBatch` could move out of `event-change-bridge.ts` into their own module, and `findJoins` with its batch helpers into `joins.ts`. `event-change-bridge.ts` holds 5,368 lines and `document.ts` 2,472. owner: the collaboration subject. stop: a refactor of `event-change-bridge.ts`.
- The undo of an Enter at an inline element's start inside another inline element reads as no join, because `joinRunsOf` reads no end at a child boundary inside a nested inline element. The undo rewrites the line and loses a teammate's letter typed into the moved text, as before. owner: the collaboration subject. stop: a user report, or the next change to `joinRunsOf`.
- After the writer undoes an Enter whose commit changed the copied element's type, the teammate's undo of a letter typed into the copy does nothing, as before, because `findJoins` pairs only inline elements of one type. owner: the collaboration subject. stop: a user report.
- In `p('w', span('', link('ab'), 'cd'), 'tail')`, after an Enter at the link's start and a teammate's X typed into the copied link, the writer's undo puts X outside the link, as before. owner: the collaboration subject. stop: a user report.
- The check for element deletes does not flag a raw `setAttribute` or `removeAttribute` of a visibility key, which would skip the write scope's notes; `setYjsAttribute` refuses those keys at runtime. owner: the collaboration subject. stop: a new visibility write outside `writeYjsVisibility`.
- A node that one remote transaction both creates and deletes counts in the batch view as a referrer from before the batch, because its old value is its last one. The worst outcome is a worse read. owner: the collaboration subject. stop: a case that reaches it.
- A line one teammate removes while another joins the next line into it leaves the joined letters stored and hidden in the room, as before. No transaction's own write hid them, so none deletes them. owner: the collaboration subject. stop: a room-size report.
- A teammate's letter typed into an empty text while the writer undoes an Enter at an inline element's end is lost, as before, when the undo rewrote the line. The undo drops the empty texts that Enter stored, which loses a letter typed after the element in the first line, and it drops the empty copy, which loses a letter typed into the copy. The fix is for the split and join writers to reuse those texts instead of storing new ones each cycle, so the drop can keep every older text, and the undo-of-Enter limits in `docs/vision/plite.md` then drop this one. owner: the collaboration subject. stop: a user report, or the next change to the split or join writer.
- When every text of a run is empty, the run's props are read from and written to its first text, while typing and carets go into the text the drop keeps. No case diverges, because a letter's marks come from mark records. owner: the collaboration subject. stop: the next change to the drop or to how a run's props are stored.
- A teammate's published caret on an empty text the drop removes reads as no cursor on the writer until the teammate's next awareness message, as before. owner: the collaboration subject. stop: a report of a remote cursor that vanishes after an Enter or an undo.
- The shown-letters law makes no inline element, mark, undo or concurrent fill, so the drop, the witness walk and `findJoins` have only their named cases. owner: the collaboration subject. stop: the next change to the drop, the witness walk or `findJoins`.
- Ten Enters and undos at a link's end store 6 nodes, one placeholder more than the 5 the binding stored before the split change, because the undo brings the tail back by placeholder so the teammate's import reads the join. With the link inside a span after an Enter at the span's end, twelve such cycles store 14 nodes, three placeholders more than the old 11, and stay at 14. The repairs plan asked for no more than before. owner: the collaboration subject. stop: the owner accepts the extra placeholders, or a design keeps the teammate's join without them.
- A remote block move reads children in proportion to the document on the receiving peer, 17,032 at 1,000 lines, as before. owner: the collaboration subject. stop: a benchmark of remote moves in a large room.
- Each edit of a Yjs text rebuilds its letter index by walking all its letters, as before, and removing one half of a split line adds one such walk. owner: the collaboration subject. stop: the keystroke gate misses in a long paragraph.
- Three guards no input reaches stay untested: keeping the first batch's old values when batches merge, which only a skipped flush reaches, and the batch view's hidden-referrer filter and child read from before the batch. owner: the collaboration subject. stop: a case that reaches one.
- The shown-letters law checks only the pinned seed in CI. Random seeds still find seed 960121270's divergence, which fails the same way before the split change. owner: suggested task t_6d3563c9. stop: that task lands.
