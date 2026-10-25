# Collaboration binding, transport and presence

Page: https://claude.ai/artifact/WcqeKceiK9ygWa4RiMBcEC

The app owns the `Y.Doc`, initial-load readiness, awareness and the provider. One native Yjs binding consumes accepted commits and imports remote changes canonically, and its inferred `api.yjs` exposes presence and compaction methods only when their inputs are supplied. Plate composes that binding with no store of its own, and there is no `read.yjs` or `tx.yjs`. The 2026-10-04 audit found the 2026-09-14 lifetime target live and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [lifetime plan](../2026-09-14-collaboration-lifetimes.md)). `node tooling/scripts/review-ledger.mjs show collaboration` prints the full history.

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

## Layer and owner

```text
app-owned provider → document + explicit readiness + awareness
native Yjs binding ↔ accepted commits / canonical remote imports
mounted editor view → mapped cursor reads → copied Plate presentation
```

| Responsibility | Decision |
| --- | --- |
| Document truth | Accepted canonical changes; a discarded spec or aborted update publishes none of its effects. |
| Remote import | Keeps schema admission, named roots, selection mapping, history policy and shared authored effects; pre-sync room content is never replaced by a placeholder, and an import never deletes a stored text inside an element. |
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
| Keeping a cut chain's texts in the first line on Enter | It kept a letter a teammate typed after the cut but brought back a letter a teammate deleted there, where `next` keeps it deleted. `t_649d2131`'s cut marker owns the split. |

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
- An import never deletes a stored text inside an element; only bare texts
  among a block root's children and duplicate placeholders are pruned. Before
  a local change is written to storage, the binding writes an empty text into
  each gap of every block the change touches, and after a structural change
  into each gap of the result's blocks, so every reader that pairs stored and
  editor children by position finds them in step. The fill writes and never
  deletes, because a delete races a peer typing into that text. A schema with
  content roots fills every block before the root's rewrite. The fill skips a
  block it already checked until a peer's update does more than type into
  stored texts. A read inside a lowering finds each referenced node through
  the root's lent index instead of walking the document.

## What other editors do

The `yjs-collaboration` pages under `docs/research/sources/` hold the provider and binding prior art. For the empty text beside an inline element:

slate-yjs at `69f3e0ea` and y-prosemirror at `9200946f` were read, not run. Neither stores an empty text, and neither rewrites a node to change an attribute.

| Editor | Where an empty text beside an inline lives | How an attribute change is written | Does loading delete stored content? |
| --- | --- | --- | --- |
| slate-yjs | Nowhere. An element is one `Y.XmlText` whose delta holds text and embedded children, and path mapping skips zero-length children (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/utils/location.ts`, lines 66 to 105) | `setAttribute` on the target in place (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/applyToYjs/node/setNode.ts`) | No |
| y-prosemirror | Nowhere. ProseMirror has no empty text nodes | A nested delta diff, so a changed attribute is a `modify` on a retained node (`yjs/y-prosemirror@9200946f:src/sync-utils.js`, lines 393 to 409) | No |
| Plite before 2026-10-24 | A separate empty `Y.XmlText` that the seeding peer writes, a joining peer deletes and an element insert never writes | In place only while stored children match the editor's one to one; otherwise the whole block is removed and reinserted | Yes, for empty attribute-free texts inside an element with more than one visible child |
| Plite | The same `Y.XmlText`, kept by every peer, and written by the first local edit of a block where none was | In place, once the edited block's gaps hold an empty text | No, inside elements |

## Main changes

- Transport commands and Plate's duplicate Yjs store are gone; the binding takes its configuration once at construction.
- Every peer keeps the empty texts beside an inline element that storage holds, and each local edit first writes the ones its blocks lack, so two peers changing one link at once keep one paragraph.
- When a change only inserts or removes elements, an empty editor text takes the stored empty text in its place, so adding and removing a link stores no new text.
- Core corrections keep an empty text beside an inline only where no lettered text shares its run, and a caret at the start of a lettered text stays in that text when the empty text before it goes.

## Open work

- Manual soaks and broader checkout failures recorded by the lifetime plan stay unrun. owner: the next collaboration review. stop: a soak run on the current tree.
- In a room an older build trimmed, a caret in a block nobody has edited since the load throws in the binding's commit listener and goes unpublished, as on `next`, in 3 of 4 cases. owner: the collaboration subject; stop: the first local edit in that block, which writes its empty texts, or `t_649d2131`'s room format 5.
- Enter before a link, or anywhere before a teammate's edit later in the line, still loses that edit, because the split copies every later child into the new line and deletes the originals (`splitVisibleYjsChildren`), as on `next`. A letter, a letter in the link and a direct `ref` unset are each lost, and letters a teammate deletes in a text the split copies come back. Enter after a link while a teammate types at the start of the text after it loses that letter in all five rooms of row 21 (`push-r3/final/race-table6-a1.log`). The two deletion cases the push panel found, where the split moves the text, stay deleted, and `next` brings back the first (`push-r3/final/cut-delete-a1.log`, `push-r3/final/sol-trailing-empty-a1.log`). owner: `t_649d2131`, whose cut marker keeps each later child; stop: that task's landing.
- A void inline, such as a mention, costs one more stored read on the first keystroke in its block after the memo is cleared, because its editor children always hold an empty text. owner: the collaboration subject; stop: a measured cohort with mentions misses the 1.10 budget.
- A stray empty text that a foreign writer puts in a block container, such as a section, now reads as an empty paragraph, and a race there still copies the section. `next` deletes that text but copies the section on every race there, with the stray text or without it (`stray-container-text.ts`). No writer in this repository stores one. owner: the collaboration subject; stop: a writer found that stores one.
- A letter typed inside the text that a cut splits in place lands in the first line, not where it was typed, as on `next`. owner: `t_649d2131`, whose cut marker keeps it in the half where it was typed; stop: that task's landing.
- A cut inside a text writes the letters after it into a new text in the first line, and the split then copies that text into the new line and deletes it, so each such Enter stores one extra text and one deletion, as on `next` (Opus, push panel). owner: `t_649d2131`, whose cut marker writes the new line's first run once; stop: that task's landing.
- An authored change's `revision` hashes each node's JSON, so two peers holding equal nodes whose properties come in another order read different revisions, on `next` too (`push-r1/probes/revision-order-fix-a2.log`). Nothing compares revisions across peers today. owner: the authored subject; stop: a caller that compares revisions across peers.
- A range end in the kept empty text after a link the range starts in maps as on `next`, not into that text. owner: the collaboration subject; stop: a reported selection that ends in the wrong text after an empty text beside a link goes.
- A range end at the start of a lettered text right after another lettered text maps to the later text's start even when the caller asks for the backward side, where `next` maps it to the earlier text's end. Both are the same visible place (Opus, push round 2). owner: the collaboration subject; stop: a reported mark or selection change at a range end beside a removed empty text.
- The collaboration example's awareness stand-in reports its own client as changed when a remote state arrives (`ExampleAwareness.setRemoteState`, `apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx:243-252`), so the page's cursor labels never show a remote caret, as on `next`. The binding decodes the caret once it hears the right client: a listener event for client 101 made peer B read A's caret at `[0,0]` offsets 0 to 5. owner: the www Plite examples; stop: that example announces the remote client's id.
- The race table has no schema with content roots, so only spec case 14 runs the card's race there (Opus, push round 3). owner: the collaboration subject; stop: a race reported in a schema with content roots.
- A peer whose editor lost focus keeps its caret at the same offset when a teammate types before it, so the caret ends before another letter, as on `next` (`push-r3/drive/blurred-caret-control.md`). owner: the collaboration subject; stop: a report of a blurred peer's caret or typing landing in the wrong place after a teammate's insert.
- `2026-10-10-authored-values.md` keeps an Open work item that waits until the races test pins Alice's removed piece gone. This plan's landing pins it gone, so that item reaches its stop. owner: the authored subject; stop: this plan's landing.
- A saved comment range holds paths, and the comments plugin reads them against the document after loading has corrected it. A document saved by an earlier beta loses each empty text between a link and a text with other marks when it loads, so a range saved after one in that paragraph points one child too far, and creating the editor throws when that path ends inside a text, as the saved playground's did (`land/playground-head-a1-a1.log`). Any later change to the stored shape does the same. owner: the comments subject; stop: a report of a saved comment that fails to load or moves, or Plate v2 promising a saved-document format.
