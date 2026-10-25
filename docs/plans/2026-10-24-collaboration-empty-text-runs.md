---
review_scopes: [collaboration, model, selection]
review_basis: [2026-10-16-react-editor-release]
verdict: pursue
work_kind: implementation
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [packages/plitejs/test/yjs/remote-import-contract.spec.ts, packages/plitejs/test/yjs/split-merge-contract.spec.ts, packages/plitejs/test/yjs/structural-soak-contract.spec.ts, packages/plitejs/test/yjs/support/collaboration.ts, packages/plitejs/test/content-completion-laws.test.ts, packages/plitejs/test/schema-fit-report.test.ts, docs/research/sources/plite/collaboration.md, docs/vision/plite.md, packages/platejs/src/internal/plugin/markdownParagraph.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, packages/platejs/src/utils/plugins/SingleBlockPlugin.ts, packages/platejs/src/utils/plugins/SingleLinePlugin.ts]
review_upstreams: ['../slate-yjs@69f3e0eaecc0b81049dc57e70403df60e7a10163', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7']
---

# Collaboration: keep the empty text beside an inline element

Status: executed: landed on `next`; the Enter letter waits with the split task
Playbook: plan

**Pursue.** Two peers that edit one paragraph holding a link end with two paragraphs, and a letter typed beside the link while another peer joins is lost. Both come from how the Yjs binding pairs a stored paragraph with the editor's. The editor keeps an empty text on each side of a link, but storage often lacks one. A joining peer's import deletes it (`removeRedundantEmptyYjsTextChildren`), an element insert never writes it (`elementOnlySpliceEdits`), and a split leaves the line without one. Several readers then pair stored and editor children by position, among them `canReplace`, `canonical-split.ts`, `lowerInlineTextCut`, `lowerNestedChildSplice` and the caret mapping in `text-runs.ts`. Each edit in such a paragraph rewrites the whole block, and two concurrent rewrites both survive. The strongest reason is the binding's own rule that a peer's concurrent text survives only while an edit keeps the Yjs node that peer is editing (`docs/research/sources/plite/collaboration.md:55`). The history shows the same whole-block rewrite duplicating paragraphs four times before (October 9, 15, 18 and 23). This plan makes four changes. Neither import deletes a text inside an element. Before an edit is written to storage, the binding writes an empty text into each gap of the blocks the edit touches, so every positional reader finds storage and editor in step. A schema with content roots fills every block before it rewrites the root, because the rewrite compares every block. After an edit that adds or removes nodes, it fills the blocks of the result the same way, before the caret is published. It writes texts and deletes none. It skips a block it already checked while peers only type into stored texts, and forgets every block after any other update from a peer, so a keystroke there reads no more storage than on `next`. A read inside a lowering finds each referenced node through the root's index instead of walking the document for it. Enter cuts and splits as on `next`. The core correction keeps an empty text beside an inline only where no lettered text shares its run. The caret maps as on `next`, and a caret at the start of a lettered text stays in that text. Round 2 of the panel found that pairing past a gap in `canReplace` alone left the other positional readers failing, and writing the gap before the edit replaced it. Round 3 found four more failures: a caret beside a link just inserted, a block read through a reference, an inline removed before the caret, and a letter typed into the second of two filled texts. The push panel's first round found four more: a cut whose chain holds a text the split moves, a caret walk that crossed a surviving empty link, schemas with content roots, which skipped the fill, and a fill that walked the whole document to read a merged paragraph. Its second round found three: the fill before a content-root rewrite skipped untouched blocks, each link added and removed stored one more empty text because the link landed before the empty text it followed, and Enter brought back letters a teammate deleted later in the line. Its third round found that the cut, which kept the chain's texts in the first line and copied their letters, brought back a letter a teammate deleted where `next` keeps it deleted. This plan had already replaced the cut once, so it went back to `next`'s. Enter while a teammate types at the start of the text after it then loses that letter, as on `next`, and the split task owns it. Every peer still reads the same lines.

## Brief

### What will change?

Two people changing one link at once now keep one paragraph, and a proposal stays proposed. Typing beside a link survives a teammate's edit or join, Enter after a link reaches everyone, and teammates see the cursor.

### What could go wrong?

Enter after a link still drops a teammate's letter typed after it, because keeping it brought back deleted letters. Only headless tests and Chromium ran. Older editors cause extra writes. Some comments saved by an earlier beta fail to load.

## Teach

A shared document stores each paragraph as one node that holds its pieces in order: runs of text and inline elements such as a link. The editor always keeps a text on each side of a link, even an empty one, so the cursor has somewhere to stand.

Storage does not always hold those empty texts. A joining editor deletes them, inserting a link never writes them, and Enter can leave a line without one. Each edit then finds storage and the editor out of step and rewrites the whole paragraph. When two people do that at once, both copies survive.

The change stops deleting stored empty texts. Before each edit, and after one that adds a link, the editor writes any empty text the paragraph lacks, so the pieces line up. It deletes no text, so it never fights a teammate's typing. The editor also drops an empty text beside real text, without moving the cursor into the link.

## What other editors do

slate-yjs at `69f3e0ea` and y-prosemirror at `9200946f` were read, not run. Neither stores an empty text, and neither rewrites a node to change an attribute.

| Editor | Where an empty text beside an inline lives | How an attribute change is written | Does loading delete stored content? |
| --- | --- | --- | --- |
| slate-yjs | Nowhere. An element is one `Y.XmlText` whose delta holds text and embedded children, and path mapping skips zero-length children (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/utils/location.ts`, lines 66 to 105) | `setAttribute` on the target in place (`BitPhinix/slate-yjs@69f3e0ea:packages/core/src/applyToYjs/node/setNode.ts`) | No |
| y-prosemirror | Nowhere. ProseMirror has no empty text nodes | A nested delta diff, so a changed attribute is a `modify` on a retained node (`yjs/y-prosemirror@9200946f:src/sync-utils.js`, lines 393 to 409) | No |
| Plite today | A separate empty `Y.XmlText` that the seeding peer writes, a joining peer deletes and an element insert never writes | In place only while stored children match the editor's one to one; otherwise the whole block is removed and reinserted | Yes, for empty attribute-free texts inside an element with more than one visible child |
| Plite pursued | The same `Y.XmlText`, kept by every peer, and written by the first local edit of a block where none was | In place, once the edited block's gaps hold an empty text | No, inside elements |

## Public API

No public call changes. The collaboration example binds the room the same way before and after.

```ts before
// apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx
  yjs({
    ...options,
    initialReady: true,
    rootName: ROOT_NAME,
  });
```
```ts after
// apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx
  yjs({
    ...options,
    initialReady: true,
    rootName: ROOT_NAME,
  });
```

## Document shape

Every peer that loads the room reads this stored paragraph. Today Ed's first load deletes both empty texts; after the change they stay.

```json before
// Stored Y.XmlElement tree of the paragraph after Ed loads the room
{ "nodeName": "paragraph", "children": [
  { "nodeName": "link", "attributes": { "ref": "r1" }, "children": [{ "text": "ab" }] }
] }
```
```json after
// Stored Y.XmlElement tree of the paragraph after Ed loads the room
{ "nodeName": "paragraph", "children": [
  { "text": "" },
  { "nodeName": "link", "attributes": { "ref": "r1" }, "children": [{ "text": "ab" }] },
  { "text": "" }
] }
```

When Alice inserts the link into an empty paragraph, storage gets no empty text before it. Each peer's next edit writes that text first, so the race ends with one paragraph. Both peers wrote the text at once, so it stores two empty texts before the link, which read as one.

```json before
// Stored children after Alice's link insert, then Alice proposes ref r3 while Ed unsets ref
[{ "nodeName": "paragraph", "children": [{ "nodeName": "link" }, { "text": "" }] },
 { "nodeName": "paragraph", "children": [{ "nodeName": "link" }, { "text": "" }] }]
```
```json after
// Stored children after Alice's link insert, then Alice proposes ref r3 while Ed unsets ref
[{ "nodeName": "paragraph", "children": [{ "text": "" }, { "text": "" }, { "nodeName": "link" }, { "text": "" }] }]
```

Every view and serializer reads the editor value. Today a bold letter typed after a link leaves an extra empty text that storage and every reload drop, even in an editor with no Yjs (`core-spacer-base-a1.log` in this run's directory).

```json before
// Editor value of the paragraph's children after a bold X is typed after the link
[{ "text": "" }, { "type": "link", "ref": "r1", "children": [{ "text": "ab" }] }, { "text": "" }, { "text": "X", "bold": true }]
```
```json after
// Editor value of the paragraph's children after a bold X is typed after the link
[{ "text": "" }, { "type": "link", "ref": "r1", "children": [{ "text": "ab" }] }, { "text": "X", "bold": true }]
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Remote import | Keeps schema admission, named roots, selection mapping, history policy and shared authored effects; pre-sync room content is never replaced by a placeholder, and an import never deletes a stored text inside an element. |

Today a writer may or may not store the empty text, a joining import deletes it, and each later edit there rewrites the whole block. After the change, the import keeps a stored one, each local edit first writes the ones its blocks lack, and the write stays in place. Every row stays in Plite, and the entrypoint graph is unchanged.

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Neither import deletes a text inside an element | Plite | `plitejs/yjs` | The delete races a peer typing into that text |
| Each local edit first writes the empty texts its blocks lack | Plite | `plitejs/yjs` | Inserts, splits, joins and older rooms leave a stored block without an empty run the editor holds, and several readers pair by position |
| A read inside a lowering finds each referenced node through the root's index | Plite | `plitejs/yjs` | Walking the document for each reference made a keystroke cost grow with the document |
| One rule decides which empty texts a run keeps, and a caret at a lettered text's start stays in it | Plite | `plitejs` core | The extra empty text breaks `docs/vision/plite.md:732` in every editor, and dropping it must not move the caret into the link |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A remote cursor beside a link | Ed shows Alice's caret before, inside or after the link in a room Ed joined | Headless cursor cases with the test awareness, and a hand drive of `/examples/plite/yjs-collaboration` in the in-app browser |
| Undo and redo of a split and merge beside a link | With no trim on load, the history still leaves canonical leaves on every peer | A case in the new Yjs spec under Bun |
| Typing a bold letter after a link | The extra empty text is dropped, and the caret stays after the link | Core law tests under Bun |
| A caret that `value.replace` hands in beside a dropped empty text | Typing lands where `next` puts it, and a caret at the start of a lettered text stays in that text when the empty text before it goes | Core law tests under Bun |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Element trim on import | The full import and the event import delete empty attribute-free texts inside an element (`removeRedundantEmptyYjsTextChildren`, `document.ts:1325`) | Neither import deletes a text inside an element | `plitejs/yjs` document import | The delete races a peer typing into that text | Internal; the pinning test at `remote-import-contract.spec.ts:1457` now keeps the text it reads and still checks its trace | Spec case 2, rows 8 and 9 | Rooms keep more empty texts, which reads already merge; a stray empty text that a foreign writer puts in a block container reads as an empty paragraph instead of going | cut |
| Root and placeholder prunes | Bare texts among a block root's children and duplicate placeholders are deleted on import | Kept | `plitejs/yjs` document import | No peer can be editing either; no root grammar admits text (`schema-compiler.ts:4283-4328`) | None | `premise-probe.ts` | None found | keep |
| Gaps in touched blocks | Readers pair stored and editor children by position (`canReplace`, `canonical-split.ts`, `lowerInlineTextCut`, `lowerNestedChildSplice`, the caret mapping in `text-runs.ts`), so a stored block missing an empty run is rewritten whole | `YjsEventChangeBridge.lower` first writes an empty `Y.XmlText` into each gap of every block the change touches (`fillYjsTextGaps`), lined up through `alignSegments`, and skips an element whose editor children hold no empty run. After a structural lowering it fills the result's blocks the same way, before the caret sync reads them. It deletes no text. It skips a block it already checked until a peer writes anything but a stored text's letters, which forgets every block, or a reset. On a schema with content roots, the controller fills every block before `reconcileYjsRoot` rewrites the root, because the rewrite compares every block (`fillBeforeReconcile`), and keeps the memo across the rewrite (`resync`) | `plitejs/yjs` lowering | Several writers leave a stored block without an empty run the editor holds: an element insert, a split, a join, every room an older build trimmed and every older peer still in the room. Round 2 found that pairing past the gap in `canReplace` alone left the other positional readers failing. Round 3 found a caret beside a just-inserted link unpublished on both peers (all three seats), and a block read through a reference kept in the memo after a peer's write (Astra and Sol). The push panel found that a schema with content roots never ran the fill, so the card's race still copied the paragraph there (Astra, and Opus as a warning). Its second round found that this fill covered only the touched blocks, so an untouched trimmed paragraph still made both peers rewrite and copy both paragraphs (all three seats) | Internal; `replacement.ts` stays as on `next` | Every case of `race-table6.ts` in five rooms; spec cases 1, 3, 5, 8, 9, 10 and 14 | Two peers that fill one gap at once leave two empty texts, which read as one; a keystroke by a link reads more storage after a peer's structural or property write; in a schema with content roots, the first letter after such a write reads every block's stored children once more, 2,400 against 2,100 at 100 blocks; an older peer in the room trims the text again after each fill, and with content roots each keystroke then refills every block it trimmed, 19,900 deletes after 50 letters at 100 blocks, where two `next` peers delete 76,223 | adopt |
| Cut at the start of a stored text | `cutTextChain` (`text-runs.ts:1157`) moves the whole stored text to the new line when the cut is at its start, and the split copies it unless a placeholder holds it, which deletes the node a peer is typing into | As on `next` | `plitejs/yjs` split lowering | Row 21 lost Ed's letter (round 1, Astra and Opus), and every change this plan tried lost something else. Splitting every text in place left an empty text behind on each Enter, 81 after 40 cycles (round 1). Moving every text but a run's first lost the letter once two peers had filled one gap (round 2, Sol). Cloning the chain's later texts lost a letter typed into the second of two filled texts (round 3, Astra). Stopping the walk at a merged text lost a letter typed into a later stored one (push panel, Astra and Sol). Keeping every text up to the last one the split cannot move emptied the movable texts before it and copied their letters, so a teammate's deletion there came back where `next` keeps it deleted (push round 3, Sol). This plan had already replaced the cut once, so it went back to `next`'s | Internal; `t_649d2131` replaces `cutTextChain` with its cut marker | Spec cases 4, 5, 11, 12, 13 and 17, `growth-probe.ts`, `sol-trailing-empty.ts` | Row 21 loses Ed's letter in all five rooms, as on `next`, though every peer reads the same lines | revert to `next` |
| Spacer correction | `canonicalizeInlineChildren` (`content-completion.ts`) keeps an empty text beside an inline even when a lettered text with other properties stands next to it, through a filter, merge-loop flags and a trailing stage | One owner decides survival per run of texts between inlines: a run with letters keeps no empty text except a protected edge spacer, a letterless run keeps exactly one where an inline or the line needs it; then only equal lettered texts merge | `plitejs` core corrections | `docs/vision/plite.md:732`; round 1 found the first draft non-idempotent (Sol) and against the report laws (Opus) | Every editor; the two report laws change on purpose | Core law cases, rows 25 and 26, `spacer-idempotent.ts` | Report codes for that repair change | replace |
| Caret mapping over a changed run | `mapCanonicalRepresentationPoint` counts inline edges as zero width and maps backward, so a caret at the start of the bold X lands at the link's end | `next`'s mapping, plus one rule: a point at offset 0 of a text that holds letters maps toward that text | `plitejs` core selection mapping | Round 1 found typing moved into the link (Astra); round 2 found that counting edges from the block's start moved the caret when an inline elsewhere in the block went (Astra); round 3 found that an empty inline removed between the last letter and the caret moved typing into the next link (Astra and Sol). Matching surviving inlines by identity or key failed six suite tests, because canonicalization rebuilds nodes and fresh input has no keys. The push panel found round 3's edge cap crossed a surviving empty link (Astra and Sol). `next`'s mapping keeps that caret and round 3's in place, and only a caret at the start of the bold X, whose empty text the core rule now drops, needs the new rule | Every editor | Core law cases, among them a caret kept before an empty link when an empty link between it and the last letter goes and a caret kept in the bold text it starts; `spacer-selection.ts`, `boundary-selection.ts` | A caret at a lettered text's start that `next` mapped into the text before it now stays | adopt |
| Per-keystroke cost | The lowering reads each stored child of the edited block once per keystroke | A keystroke in a block the fill already checked reads what it reads on `next`, also while a teammate types; the first touch of a block, and the first after a peer's structural or property write, reads its stored children once more; a structural local change reads its result's blocks once. A read inside a lowering finds each referenced node through the root's lent index instead of walking the document | `plitejs/yjs` lowering, `plitejs` core corrections | The fill must read storage to find a gap, and that read cost about 8% per keystroke beside 50 links. Round 3 found the timing never measured the fill, because no cohort had a teammate (Opus). The push panel found the fill's read of a merged paragraph walked the whole document for each reference, 30,082 stored attributes and 12,008 child lists per letter at 2,000 blocks (Opus). Its second round found that each link added and removed after an empty text stored one more empty text, because the write cursor put the link before that text, so after 200 cycles a keystroke there cost 1.17 of `next`, past the budget (Astra). An empty editor text now takes the stored empty text in its place | None | `lowering-work-r4.ts` counts, spec case 15, which counts the stored children each letter reads in a merged paragraph at 50 and 500 blocks, spec case 16, which checks that 21 link cycles store no more empty texts than one, `push-r2/repro/link-cycles.ts` at 200 cycles, and `interleave-probe.ts` at budget 1.10 over seven cohorts, three with a teammate's update before each local keystroke, on the built tree | A paragraph whose links a teammate keeps changing pays the read on each local keystroke after one of their changes | adopt |

## Layer gates

Four realistic failures:

1. With the trim gone, undo and redo of a split and merge leave extra empty leaves, the job the trim did in May 2026, and remote paragraphs render taller. Spec case 7 asserts canonical leaves on every peer.
2. In a mixed-version room an older peer still trims an empty text while a new peer types into it, and the letter is lost. Only refusing older peers prevents it, so it stays a stated limit that the word "block old peers" reverses; `t_649d2131`'s room format 5 refuses older peers once it lands. Once the trim reaches a new peer, that peer's next edit there writes the text again, which spec case 8 checks. The older peer then trims it again, so in a mixed room each keystroke writes and deletes one empty text. After 200 letters after a link, two new peers store 18 structs in 728 bytes with no delete, and a new and an older peer store 619 structs in 3603 bytes with 404 deletes, growing linearly (`r3/probes-r3/r3-fix2/mixed-room-growth-a1.log`). With content roots, the fill before the root's rewrite refills every block the older peer trimmed, so each keystroke writes and deletes about four empty texts per block. After 50 letters in a trimmed room, a new and an older peer delete 1,900 more stored items at 10 blocks and 19,900 at 100, where without content roots they delete 100 at both sizes (`push-r3/final/mixed-growth-base2111-50-a1.log`). Two `next` peers delete more in the same steps, 1,973 at both sizes without content roots and 8,723 and 76,223 with them (`push-r3/final/mixed-growth-next-50-a1.log`). Two new peers delete nothing after the first fill.
3. The run rule drops an empty text that a cursor or a serializer still needs, such as between two links or beside a selected inline. A letterless run between two inlines keeps exactly one empty text, a protected spacer stays, and `pnpm check --affected` runs every affected package's tests at landing.
4. Two peers fill one gap at once and store two empty texts there. Reads merge them into one run, and spec case 6 asserts that repeated Enter, merge and undo keep at most two in the paragraph. Adding and removing a link once left one more empty text per cycle, 202 after 200 cycles, and a keystroke there then cost 1.17 of `next` (`push-r2/repro/link-cycles-200-a1.log`). An empty editor text now takes the stored empty text in its place, so the paragraph keeps four stored children through 200 cycles. On the final bytes a keystroke there costs 1.026 of `next`, where the same-code copy reads 1.020 and the 15% plant 1.154 (`push-r3/final/link-cycles-200-a1.log`).

Blast radius. In `plitejs/yjs` the change reaches both imports through the one shared prune, every local lowering through the fill in `YjsEventChangeBridge.lower`, and every content-root rewrite through `fillBeforeReconcile`. Inside a lowering, every reference lookup that passes no resolver goes through the root's lent index, as the binding's lazy resolver already did. Receiving a peer's update writes nothing, because the fill runs only for local changes. An update that does more than type into stored texts only makes the fill recheck every block. Plate's `YjsPlugin` composes the binding with no store of its own, so it inherits the change with no edit. In the `plitejs` core it reaches every editor value with an empty text beside an inline, and every caret that a value replace or a construction maps across a changed run. The core change is safe because the law already removes that leaf (`docs/vision/plite.md:732`) and storage and reloads already drop it. Stored rooms get no migration pass; a block gets its missing empty texts on its first local edit.

Rollback. The change lands as one commit and reverts alone. Reverting it leaves rooms with more empty texts, which older code trims on its next load, the behavior on `next` today. Nothing writes a shape that older code cannot read.

Focused proof. The new Yjs spec and the rest of the Yjs suite, the core law tests, `authored-tree-collab.test.ts`, and `pnpm check --affected` at landing.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What storage holds for an empty text beside a link | Keep any a peer stored, and write a missing one on the first edit there (look) | Never store it, like slate-yjs | never store | big |
| Rooms an older editor already stripped | They mend on their first edit beside the link (look) | Leave them as they are | leave stripped rooms | big |
| How an edit handles a missing empty text | Write it first, then make the edit (look) | Line the pieces up past the gap | architect again | big |
| Enter while a teammate types right after the link | Their letter is lost, as today, until the split task lands. Every teammate reads the same two lines, and repeating Enter, merge and undo leaves at most two empty texts (look) | Keep the texts of the cut in the first line, which kept the letter but brought back letters a teammate deleted | keep cut texts | small |
| Remembering which paragraphs were checked | Don't recheck a paragraph while teammates only type. Recheck every paragraph after any other change from a teammate, and check the result of Enter or a similar edit right away (look) | Check on every keystroke, which was about 8% slower in a paragraph with 50 links | check every keystroke | small |
| Two people writing the same missing text at once | Both stay and read as one empty text | Delete the extra one, which can fight typing | dedupe | detail |
| An extra empty text after a link, in any editor | Drop it when real text shares its side of the link, as the editor's own rule says (look) | Keep it | keep spacer | small |
| What the repair report says when that text goes | It reports a removed empty text and a merge of the lettered texts (look) | Keep the old report wording | keep report codes | small |
| Where a caret goes when an empty text next to it goes | Where the editor puts it today, except that a caret at the start of a text with letters stays in that text (look) | Count link edges, as round 3 did, which moved typing past an empty link | track edges | small |
| How the speed budget is judged | A probe that times each version keystroke by keystroke, all in one process (look) | The gate that times each version in its own process, which load on this machine left inconclusive | rerun the gate | small |
| Empty texts left by adding and removing a link | None are left. A link added after an empty text goes after that text, so 21 cycles store no more empty texts than one (look) | Let each cycle leave one more, 202 after 200 cycles, which made typing there 17% slower than today | keep spare texts | small |
| Enter while a teammate deletes letters later in the line | Letters deleted in a text the split moves stay deleted. Letters deleted in a text the split copies can come back, as today, until the split task lands (look) | Redesign Enter in this plan instead of the split task | third cut | small |
| Deleting the only plain letter between a link and bold text, then typing | The new letter is bold, as the same delete does with no link (look) | Keep it plain | type plain | small |
| Two people removing pieces of a split link | Both removed pieces stay gone after they sync (look) | Bring Alice's removed piece back, as today | keep removed piece | small |
| Other cleanup on load, of loose top-level text and duplicate placeholders | Stays as it is | Remove it too | cut root cleanup | detail |
| What counts as a clean edit in the check | Changing a property or typing a letter deletes nothing stored (look) | Only count blocks and letters | count only | small |
| Two peers set the same property at once | Yjs keeps one of the two values, the same on both peers | A rule the owner picks | ref rule | small |
| Older editors in the same room | Allowed, with the risk written down | Keep older editors out | block old peers | detail |
| Where the collaboration page lives | A new page, https://claude.ai/artifact/WcqeKceiK9ygWa4RiMBcEC, because the old one, https://claude.ai/artifact/SAjFbdLhSgdDodmntTwMxG, no longer opens (look) | Go back to the old link once it opens again | drop new page | detail |

## Expected results

Every row starts from one paragraph holding a link `[ab]` with `ref` `r1`, an empty text on each side unless the row says otherwise, and two peers, Alice and Ed. Rows 15 to 24 start with `tail` after the link, apart from 16, which has `head` before it, and 18 and 24, which keep both sides empty. The room is `joined` when Ed loaded it before either write, `join race` when Alice writes before Ed's load reaches her, `fresh` when Alice inserts the link into an empty paragraph after Ed joined, `trimmed` when an older editor already deleted both side texts, and `doubled` when a peer stored a second empty text beside each stored text. Each row must end with Alice, Ed and a fresh reload reading the same document: the paragraphs the row names, every letter both peers typed in its place and order, its formatting, its property values and authored state, and no stored text or node deleted by a local property write or keystroke. This plan owns every row in every room except Ed's letter in row 21, which `t_649d2131` owns; there every peer must still read the same lines. The check is `race-table6.ts` in this run's directory, run as `bun --preload ../../config/plite-source-aliases.ts <race-table6.ts> <tree>` from `packages/plitejs`. It runs `race-table4.ts`'s cases, exits 1 when a P0 or P1 case fails, and also checks that Alice, Ed and a reload hold the same pending changes, that a proposal stays pending until it is accepted, and that a direct write leaves none pending. It compares changes with their ids and `revision` masked, because `revision` hashes each node's JSON and so differs between peers whose properties come in another order, on `next` too. The build adds one spec case per failure mode to the Yjs suite.

| # | Case | Room | Alice | Ed | Then | Must end with | Rank | On next |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | The card's race | joined | proposes `ref` r3 | unsets `ref` | nothing | `""[ab]""`, one `ref` both read | P0 | two paragraphs |
| 2 | Card's race, then accept | joined | proposes `ref` r3 | unsets `ref` | Alice accepts | `""[ab]""` | P1 | two paragraphs |
| 3 | Two direct sets | joined | sets r3 | sets r9 | nothing | `""[ab]""`, r3 or r9 on both | P0 | two paragraphs |
| 4 | Set and unset, text beside | joined, `x` | sets r3 | unsets `ref` | nothing | `"x"[ab]"x"` | P1 | passes |
| 5 | Type after, unset | joined | types X after | unsets `ref` | nothing | `""[ab]"X"` | P0 | two paragraphs |
| 6 | Type before, type after | joined | types Y before | types P after | nothing | `"Y"[ab]"P"` | P0 | two paragraphs, P lost |
| 7 | Both type in the link | joined | types I in the link | types J in the link | nothing | link holds a, b, I and J, with I and J where each was typed | P0 | two paragraphs |
| 8 | Type after while Ed joins | join race | types X after | joins | nothing | `""[ab]"X"` | P0 | X lost |
| 9 | Type before while Ed joins | join race | types Y before | joins | nothing | `"Y"[ab]""` | P0 | Y lost |
| 10 | Trimmed room, set and unset | trimmed | sets r3 | unsets `ref` | nothing | `""[ab]""` | P0 | two paragraphs |
| 11 | Trimmed room, type and set | trimmed | types X after | sets r9 | nothing | `""[ab]"X"`, `ref` r9 | P0 | two paragraphs |
| 12 | Trimmed room, both type | trimmed | types Y before | types P after | nothing | `"Y"[ab]"P"` | P0 | two paragraphs |
| 13 | Card's race, then a reload | joined | proposes `ref` r3 | unsets `ref` | a third peer loads | the third peer reads row 1's result | P1 | two paragraphs |
| 14 | Card's race, then typing | joined | proposes `ref` r3 | unsets `ref` | Alice types Z at the end | `""[ab]"Z"` | P1 | two paragraphs |
| 15 | Enter after the link | joined, join race | presses Enter after the link | nothing | nothing | `""[ab]""` / `"tail"` | P0 | joined: the split never reaches the room |
| 16 | Enter before the link | joined, join race | presses Enter before the link | nothing | nothing | `"head"` / `""[ab]""` | P0 | passes |
| 17 | Enter, then merge back | joined, join race | presses Enter after the link, then merges | nothing | nothing | `""[ab]"tail"` | P0 | joined: the binding throws |
| 18 | Enter with nothing after the link | joined, join race | presses Enter after the link | nothing | nothing | `""[ab]""` / `""` | P0 | passes |
| 19 | Wrap while typing | joined, join race | wraps `ta` in a second link | types Q at the end | nothing | `""[ab]""[ta]"ilQ"` | P0 | joined: Q lands in a second paragraph; join race: the wrap is lost |
| 20 | Insert a link while typing | joined, join race | inserts link `z` after `tail` | types Q at the end of `tail` | nothing | `""[ab]"tailQ"[z]""` | P0 | the link is lost |
| 21 | Enter while Ed types at the text's start | joined, join race | presses Enter after the link | types P before `tail` | nothing | `""[ab]"P"` / `"tail"` | P0 | joined: peers disagree; join race: `tail` twice |
| 22 | Merge while typing | joined, join race | merges the next paragraph, `tail`, into one that ends with the link | types Q in `tail` | nothing | `""[ab]"tailQ"` | P0 | passes |
| 23 | Move the link while typing in it | joined, join race | moves the link after `tail` | types J in the link | nothing | `"tail"[abJ]""` | P0 | joined: two paragraphs; join race: the move is lost |
| 24 | Two first letters, then a wrap | joined, join race | types X after the link, then wraps it | types P after the link, then Q at its end | nothing | `""[ab]""[X]"PQ"` or `""[ab]""[P]"XQ"` | P0 | joined: three paragraphs; join race: letters lost |
| 25 | Bold letter after the link | joined, join race | types a bold X after the link | nothing | nothing | `""[ab]"X"{bold}` | P1 | join race: X lost |
| 26 | Proposed letter after the link | joined, join race | proposes X after the link | nothing | nothing | `""[ab]"X"`, X still proposed | P0 | join race: X lost |
| 27 | A remote caret beside the link | joined | puts the caret before, inside or after the link | watches | nothing | Ed shows the caret at the same point | P0 | 3 of 4 carets never published |
| 28 | The card's race in a fresh room | fresh | proposes `ref` r3 | unsets `ref` | nothing | `""[ab]""` | P0 | two paragraphs |
| 29 | Split, remove, then the card's race | joined | splits after the link, then removes the second paragraph, then proposes `ref` r3 | unsets `ref` | nothing | `""[ab]""` | P0 | two paragraphs |
| 30 | The card's race in a section | joined, the paragraph and a second one, `b`, inside a section | proposes `ref` r3 | unsets `ref`, or types Q before `tail` | nothing | one section holding `""[ab]"tail"` or `""[ab]"Qtail"`, and `"b"` | P0 | two sections |
| G | Every pair of the seven writes | every room | any write | any write | nothing, a later edit or a reload | the shared result above | P0 | fails in every room |

The seven writes are nothing, a direct set, a proposed set, an unset, and one letter after, before or inside the link. The grid enumerates every combination inside its bounds and draws no random seed, so the playbook's seed rounds do not apply to it; the seeded structural soak in the suite runs as it does today. Rows 28 and 29 run `fresh-link-race.ts` and `split-remove-race.ts`, row 30 runs `stray-container-text.ts` with `NOSTRAY=1` in both of its variants, and row 27 runs `cursor-table.ts`, from this run's directory the same way.

Measured on scratch copies, 1544 cases across the five rooms, with `race-table4.ts` at `ecbfce7d9b`, `race-table5.ts` at `2111c23ad7` and `race-table6.ts` for the push panel's fixes:

| Tree | Cases failing | Paragraph copied | Binding throws | Wrong result | Letter lost |
| --- | --- | --- | --- | --- | --- |
| `next` at `ecbfce7d9b` | 756 | 456 | 8 | 200 | 92 |
| This plan, as the round 3 prototype | 0 | 0 | 0 | 0 | 0 |
| `next` at `2111c23ad7` | 756 | 456 | 8 | 200 | 92 |
| This plan, with round 3's fixes | 0 | 0 | 0 | 0 | 0 |
| `next` at `2111c23ad7`, authored state checked | 756 | 456 | 8 | 200 | 92 |
| This plan, with the push panel's fixes, authored state checked | 0 | 0 | 0 | 0 | 0 |
| This plan, with `next`'s cut, authored state checked | 5 | 0 | 0 | 0 | 5 |

On the round 3 prototype, row 30 passes in both variants, where `next` copies the section. The cursor cases publish all four carets in joined rooms, where `next` publishes one. With round 3's fixes, a caret beside a link a peer just inserted publishes on both peers, where `next` and the prototype throw. Forty and 120 cycles of Enter after the link, merge and undo keep at most two empty texts in the paragraph. Receiving a link insert or a letter writes nothing on the receiving peer. The authored race test in `authored-tree-collab.test.ts` now ends with both removed pieces of a split link gone, where `next` brings Alice's removed piece back.

## Main changes

- An empty editor run with no properties reads the same whether storage holds one empty text for it, two or none. Every peer keeps a stored one, and nothing deletes one, because a delete races typing.
- The full and event imports delete no text inside an element. Only bare texts among a block root's children and duplicate placeholders are still pruned.
- Before a local change is written to storage, the binding writes an empty text into each gap of every block the change touches, and of each inline element there whose editor children hold an empty run. After a change that adds or removes nodes, it does the same for the blocks of the result, before the caret is published. It writes texts and deletes none, so two peers filling one gap leave two empty texts. At a slot a reference holds, writing the text also clears the parent's reference and writes a placeholder, and two peers doing that leave duplicate placeholders, which the import's kept prune removes. Every reader that pairs by position then finds storage and editor in step. A schema with content roots fills every block before the root's rewrite, because the rewrite compares every block, and keeps its memory of checked blocks across the rewrite. The binding remembers each block it checked. A peer's update that only types into stored texts keeps that memory, and any other peer's update or a reset clears it.
- When a change only inserts or removes elements, an empty editor text takes the stored empty text in its place, so a link inserted after it goes after that text, and adding and removing a link stores no new text.
- A read inside a lowering that meets a reference finds the referenced node through the root's lent index, as the binding's lazy resolver already did, instead of walking the document.
- Core corrections decide which empty texts survive once per run of texts between inline elements, and merge only lettered texts with equal properties. A lettered text keeps its own key when an empty neighbour goes.
- Selection mapping maps a point as on `next`, except that a point at the start of a text that holds letters maps toward that text, so it stays there when the empty text before it goes.

## Steps

The change lands as one commit through `node .agents/pstack/land.mjs --message <file> --check 'pnpm check --affected'`, after its deslop and no-comments passes and the push panel. Write each step's cases first and see them fail on `next` before the change. The race cases move into the Yjs suite as `packages/plitejs/test/yjs/empty-text-runs-contract.spec.ts`, one case per failure mode, so the suite is green at landing; `race-table5.ts` and `cursor-table.ts` stay probes in this run's directory.

- [x] Log a started row in the suggested-tasks ledger for `packages/plitejs/src/core/content-completion.ts`, `packages/plitejs/src/core/representation.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/test/content-completion-laws.test.ts` and `packages/plitejs/test/authored-tree-collab.test.ts`, sync the worktree with `next`, then record the pre-edit baselines: the Yjs suite, the core law tests and `authored-tree-collab.test.ts`. Proof: the ledger row and each baseline log.
- [x] Add the core law cases (a bold or proposed letter after a link, a stored extra spacer, a caret at the start of the bold X and of `"b"{bold}`, a caret after its letter when an empty link earlier in the block goes, a caret kept out of the next link when an empty link before it goes, a caret kept before an empty link when an empty link between it and the last letter goes, a protected spacer, the split and left-side carets, an authored insertion, both sides of an empty inline and a run longer than the window), then build the run rule and the start-of-text caret rule. Proof: each case fails on `next`, the round 3 prototype or the push panel's tree and passes after; removing the start-of-text rule fails the bold-start case, and round 3's edge cap fails the empty-link case; `content-completion-laws.test.ts` and `schema-fit-report.test.ts` are green; `spacer-idempotent.ts`, `spacer-selection.ts` and `boundary-selection.ts` exit 0.
- [x] Stop the shared prune from deleting a text inside an element, keeping the root bare-text and duplicate placeholder prunes. Rewrite the pinning test at `remote-import-contract.spec.ts:1457` so it keeps the text it reads and still checks its trace. Proof: spec case 2 fails on `next` and passes after.
- [x] Add the fill to `YjsEventChangeBridge.lower`, before lowering and on the result of a structural lowering, then rewrite the authored race pin in `authored-tree-collab.test.ts` from Alice's removed piece coming back to both pieces gone. Then add the fill before a content-root rewrite and the lent index default for reference lookups inside a lowering, and keep `next`'s cut. Proof: spec cases 1, 3 to 14 and 17 fail on `next` and pass after, cases 12 to 15 fail on the push panel's first tree, cases 14, 16 and 17 fail with its second tree's code for the part each checks, and case 12 fails with its third tree's cut; removing the fill, the fill of the result or the fill before a content-root rewrite, filling only the touched blocks there, letting an empty editor text skip the stored one in its place, forgetting only the physical parent a peer's update touched, or dropping the lent index default, each fails its named case; `growth-probe.ts` at 120 cycles keeps at most two empty texts.
- [x] Prove the spec as a whole. Proof: the spec's seventeen cases pass, and each fails on `next` or on a push panel round's tree; `race-table6.ts` on the built tree fails 5 of 1544 cases, each Ed's letter in row 21 with every peer reading the same lines, where `next` fails 756; `cursor-table.ts` fails only its three trimmed-room cases, which `next` fails too.
- [x] Count stored reads and writes per keystroke in a paragraph with 1 and 50 links, at 100 and 2000 blocks, with and without a teammate's update before each local keystroke, on `next` and the built tree, then run the paired timing gate. Proof: `lowering-work-r4` logs whose counts grow with links and stay flat with blocks; `interleave-probe.ts` at budget 1.10 passes all seven cohorts on the built tree, the same-code copy stays near the candidate, every planted arm of 15 percent fails, and a conclusive miss sends the target back to `architect`.
- [x] Hand drive `/examples/plite/yjs-collaboration` and `/examples/plite/inlines`: map the changed files to them with `node tooling/scripts/hand-drive.mjs route`, the Yjs files to the first and the core files to both. The collaboration example has no link, so there, type key by key in one peer while another disconnects and reconnects, press Enter, and read every peer's text and cursor. On the inlines example, put a caret on each side of a link, type there, and check that the letters land outside the link. Do this at each width and theme `hand-drive.mjs scope` lists. Run both examples' browser specs, `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts` and `inlines.test.ts`, through their package runner. Proof: `hand-drive.mjs check` passes, every cell's screenshot is read, and both spec logs are green.
- [x] Update `docs/research/sources/plite/collaboration.md`, which still says the import removes redundant empty texts. Proof: the docs knowledge check reports nothing in that file. Its 88 findings elsewhere, all K7, are the same on `next`, and `t_13ef6379` owns them.
- [x] Run `changeset` for the `plitejs` change. Proof: the changeset or its recorded skip.
- [x] Decide keep or revert from the counts and the timing gate, then land. Proof: the decision row and the landed commit.
- [x] Leave the split task's session a note in the shared notes folder on what this change does to its files. Proof: the note.
- [x] Fold this plan into `docs/plans/topics/collaboration.md`, adding the storage and fill rules to its Rules, and write the Close. Proof: `plan-page.mjs --folded` renders.

No public docs page changes, because `content/docs` teaches only the binding's options, which stay the same.

## Proof

- From `packages/plitejs`: `bun test --preload ../../config/plite-source-test-setup.ts ./test/yjs` for the Yjs suite with the new spec, `bun test --preload ../../config/plite-source-test-setup.ts test/content-completion-laws.test.ts test/schema-fit-report.test.ts` for the core laws, and the same for `test/authored-tree-collab.test.ts`.
- From `packages/plitejs`, against a tree root: `bun --preload ../../config/plite-source-aliases.ts <run dir>/race-table6.ts <tree>`, and the same for `race-table5.ts`, `cursor-table.ts`, `growth-probe.ts`, `r3/lowering-work-r4.ts` and the probes under `panel-plan-r1/probes/`, `panel-plan-r2/repro/`, `r3/probes-r3/`, `push-r1/repro/`, `push-r1/probes/`, `push-r2/repro/`, `push-r3/repro/` and `architect-core/probes/`, each through `node ../../.agents/pstack/proof.mjs`.
- From `packages/plitejs`: `bun --preload ../../config/plite-source-aliases.ts <run dir>/r3/interleave-probe.ts all 3000 base=<next> base2=<next copy> candidate=<built tree> same=<built tree copy> planted=<next copy>@15`, which times every arm one keystroke at a time in one process. The separate-process gate, `paired-timing.mjs` with `r3/lowering-timing-r4.json`, stays the check the word "rerun the gate" restores.
- The hand drive and the browser spec, as their step names them.
- `pnpm check --affected` at landing, through `land.mjs`.

## Open work

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

## Close

Reversals first. The push panel's third round found that this plan's cut, which kept a cut chain's texts in the first line, brought back a letter a teammate deleted where `next` keeps it deleted. This plan had already replaced the cut once, so it went back to `next`'s and the claim narrowed. Enter after a link while a teammate types at the start of the text after it still loses that letter, as on `next`, in 5 of 1544 race cases, all in row 21, with every peer reading the same lines; `t_649d2131` owns it. The separate-process timing gate stayed inconclusive under this machine's load, so the interleaved probe, which times every arm in one process, judged the budget; the word "rerun the gate" restores the old gate.

What landed. One `plitejs` commit on `next` through `land.mjs`. Neither Yjs import deletes a text inside an element. Each local edit first writes the empty texts its blocks lack, and a structural edit fills its result's blocks before the caret is published. A schema with content roots fills every block before the root's rewrite. A link inserted after an empty text lands after it, so link cycles store no new texts. A read inside a lowering finds each referenced node through the root's lent index. The core correction drops an empty text beside an inline where a lettered text shares its run, and a caret at the start of a lettered text stays in that text. The saved rich-text playground loses its empty text after the suggestion link, so its comment range and its test's paths move one child left. Its generator now anchors the range the fixture stores. `empty-text-runs-contract.spec.ts` adds seventeen cases, and the changeset, the research page and row 58 of `docs/development/enforcement.md` describe the final behavior.

Proof, each from its decision row's scope:

- The spec's seventeen cases pass on the final bytes. Fifteen fail on `next`, and with round 3's cut planted back only the deletion case fails.
- `race-table6.ts` fails 5 of 1544 cases in five rooms, each Ed's letter in row 21, where `next` fails 756.
- The Yjs suite passes 493 of 494 tests. The one failure, a key-work count past its 5-second limit at a load average near 140, fails on `next` too under that load, and both trees pass that file's 49 cases at 60 seconds. The landing's `pnpm check --affected` runs the suite again.
- The core laws pass 99 tests and `authored-tree-collab.test.ts` 188. `cursor-table.ts` fails only its three trimmed-room cases, as `next` does, and 40 cycles of Enter, merge and undo keep two empty texts. Lint, format and both typechecks pass.
- After 200 link cycles a keystroke costs 1.026 of `next`, against 1.020 for a copy of the same code. In all seven interleaved cohorts the candidate reads 0.999 to 1.024 of `next`, its same-code copy 0.982 to 1.022 and a 15% plant 1.123 to 1.155, so it stays inside the 1.10 budget.
- Both examples' browser specs pass, 2 and 48 cases, in Chromium. The hand drive covers `/examples/plite/yjs-collaboration` and `/examples/plite/inlines` on the final bytes at desktop width in light.
- The saved rich-text playground's six cases pass on `next` with the old fixture, fail on this change with it and pass with the new one. Its generator writes the new fixture again, apart from timestamps and change ids.
- The landing's first `pnpm test` timed out the DOCX retained-source benchmark at 240 seconds. Run alone, side by side, it passes in 202.6 seconds on this change and 203.2 on `next`.

Limits. Bun and Playwright's Chromium ran the proof, with no Firefox, WebKit, real provider or device. The race table has no schema with content roots, so only spec case 14 runs the race there. In a room with an older client and content roots, each keystroke refills every block the older client trimmed, 19,900 deletes after 50 letters at 100 blocks, where two `next` peers delete 76,223. A comment range saved by an earlier beta after an empty text this landing drops points one child too far, and the editor throws on load when that path ends inside a text.

The run had one ask, and it is done. "Keep one block when two peers race a suggested and a direct property write on one element" holds in all five rooms, and the proposal stays proposed on every peer (`race-table6.ts`, spec cases 1 and 14).

Open work moved to the collaboration subject's Open work, fourteen items, each with its owner and stop. The comments subject owns the comment ranges saved before this landing. `t_649d2131` owns the three Enter items. The collaboration subject owns the trimmed-room caret, the void inline read, the stray container text, the two range ends, the race table without content roots and the blurred peer's caret. The www Plite examples own the awareness stand-in, and the authored subject owns the cross-peer `revision` and the authored-values item this landing closes.

## Evidence

Model: claude-opus-5-5 (Opus 5.5) at xhigh effort led this review; one read-only Codex `gpt-6.1-sol @medium` reader searched earlier sessions, plans, commits and GitHub for the history (`recall-codex` in this run's directory, `docs/plans/artifacts/yjs-property-race/`).

The owners are [event-change-bridge.ts](../../packages/plitejs/src/yjs/core/event-change-bridge.ts), whose `lower` writes local changes to storage, [text-runs.ts](../../packages/plitejs/src/yjs/core/text-runs.ts), whose alignment helpers the fill uses and whose `cutTextChain` moves the text a peer types into, [document.ts](../../packages/plitejs/src/yjs/core/document.ts), whose `removeRedundantEmptyYjsTextChildren` deletes empty texts on import, [content-completion.ts](../../packages/plitejs/src/core/content-completion.ts), whose `canonicalizeInlineChildren` keeps the extra spacer, and [representation.ts](../../packages/plitejs/src/core/representation.ts), whose caret mapping moves a caret across a changed run. [replacement.ts](../../packages/plitejs/src/yjs/core/replacement.ts), whose `canReplace` refuses a stored paragraph without its spacers, stays as on `next`.

Earlier reviews and plans of this scope:

- `2026-10-16-react-editor-release` (head): retains it, because its question, when a component editor takes and frees the shared document, is untouched here.
- `2026-10-04-collaboration-audit` and `2026-09-14-collaboration-lifetimes`: retains their laws on transport, admission and lifetime, which this change does not touch.
- `2026-10-18-undo-repair-nodes`: retains its split write, which already adds an empty text chain instead of sending a split beside an inline element to range lowering.
- `2026-10-21-cut-join-storage`: retains it. Its give-back panel found this race and recorded it as an older defect with an unknown cause.
- `2026-10-24-yjs-split-identity` (open, `t_649d2131`): retains it. It owns the split, sends a split as a cut marker, aligns empty spacers in `canReplace` through `alignSegments`, and moves rooms to format 5, which refuses every room an older build wrote. This plan leaves `replacement.ts` as on `next`.
- `2026-10-23-plite-unkeyed-insert-liveness` (model head) and `2026-10-17-named-root-targeting` (selection head): retains both. Neither decides how empty texts beside an inline survive or how a point maps across a changed run.
- `2026-10-10-authored-values` (executed): its Open work item on a removed link piece coming back reaches its stop with this plan, as Open work says.

The history reader found the trim's origin and no earlier attempt at this fix. The May 2026 donor added it to delete empty leaves that piled up after split and merge undo and made remote paragraphs render taller (commit `f8d1987838`, `packages/yjs/src/core/document.ts:774`). Today the editor value joins adjacent stored texts and corrections remove every empty leaf that is not a line anchor or spacer before render (`docs/vision/plite.md:732`), so that job has moved to the read side. Join alignment landed in `e36f5fc2bf` and lets an empty editor run have no stored text, but only for joins. An October 17 design proposed removing leaf-level empty-text cleanup, and the build kept it.

### Requirements

- One block stays one block when two peers race a suggested and a direct property write on one element (the card's ask, `t_229f59cc`).
- An empty text survives as a required inline spacer and stores no formatting (`docs/vision/plite.md:732`).
- A peer's concurrent text survives only while an edit keeps the `Y.XmlText` or `Y.XmlElement` that peer is editing (`docs/research/sources/plite/collaboration.md:55`).
- Remote import keeps schema admission, named roots, selection mapping, history policy and shared authored effects (`docs/plans/topics/collaboration.md`, Layer and owner).
- A missing stored empty run is a legitimate state, because inserts, splits, joins and older rooms all write it, and the first local edit of its block fills it. This is the lead's conclusion, to attack.
- A fill that writes texts and deletes none races nothing: two peers that fill one gap leave two empty texts, which read as one run. At a slot a reference holds, it also clears the reference and writes a placeholder, and the import's kept prune removes a duplicate. This is the lead's conclusion, to attack.
- The fill's reads stay proportional to the edited block, because a read inside a lowering finds each referenced node through the root's lent index, and an inline element whose editor children hold letters only costs no read. A block the fill already checked costs no read until a peer's update other than letters in stored texts, or a reset. Before a content-root rewrite, which compares every block, the fill reads every unchecked block once. A structural local change reads its result's blocks once and keeps them checked. This is the lead's conclusion, to attack.
- Only a peer's structural or property write, or a reset, can open a gap in a checked block. A local text edit or property write either keeps the block's stored child list or rewrites it from the editor value, and that rewrite stores every empty text the value holds (`createYjsNodes`). A local structural change is filled on its result. A peer's letters typed into a stored text change no child list, and a drift read writes no storage. This is the lead's conclusion, to attack.

### Lanes

- **Keep the current design (control).** Loses every P0 row: 756 of 1544 table cases fail on `next` (`r3/table4-next-a1.log`), including both reported shapes.
- **Stop the element trim only (round 1's pick).** Leaves fresh rooms duplicating (`table2-tree-guard-a1.log`, `fresh-link-race-tree-guard-a1.log`). Round 1 rejected it.
- **Pair past a missing empty run in `canReplace` (round 2's pick).** Left 80 of 932 cases failing on the older table, all in trimmed rooms (`final2/table2-a1.log`). Round 2's panel then found what that table missed: typing into a gap of a fresh room, Enter, wraps and carets there, the caret walk and the cut each failed.
- **Write each gap before the edit (picked).** Fails 0 of 1544 cases in five rooms, on the round 3 prototype and with round 3's fixes (`r3/table4-memo2-a1.log`, `r3/table5-r3-fix2-a1.log`).
- **Pairing and the cut change without the guard.** Left 239 of 932 cases failing, 159 of them outside trimmed rooms (`panel-plan-r2/variants/table2-tree-nog-a1.log`), because the import keeps deleting the texts the pairing needs.
- **Write the missing spacers at every writer.** Fixes fresh rooms but leaves every room already written without them, and each new writer has to remember it. The picked lane writes them at the one step every local edit passes, so old rooms mend on their first edit and no writer has to remember.
- **The split task's full working copy.** Its pairing in `canReplace` has round 2's gaps; the rest is its own phase 2 and room format.
- **Delete all empty-text cleanup, top level and duplicate references included (strongest deletion).** The top-level pass also serves inserted placeholders and truncated root texts (`yjsRootNeedsNormalization`, `document.ts:510`), and duplicate virtual references are a move-integrity job, neither one on this defect's path.
- **Never store an empty run (slate-yjs shape).** Older peers and existing rooms still hold empty chains, so lowering needs the same tolerance anyway, and the common keystroke beside a link turns into a structural insert.

The picked lane predicts that every row passes in every room, the cursor cases pass in joined rooms, and no local property write or keystroke in those rows deletes a stored node or text. The Close marks that prediction held or falsified.

Prior art was read, not run. The table check drives two headless editors per case through Bun from `packages/plitejs`, not a browser.

### Architect

Round 1's architect ran three runners on one brief: Opus 5.5, gpt-6-astra and gpt-6.1-sol, all at xhigh. A cross-judge on Opus 5.5 picked gap alignment over durable text containers and logical gaps with retained carriers. All three stopped the element trim in both imports and kept the root and placeholder prunes. Its full writer waits in `architect/synthesis.md`.

A second architect round designed the core rule after the round 1 panel, with the same three runners at xhigh (`architect-core/` in this run's directory). The cross-judge on Opus 5.5 scored anonymized copies on six criteria and picked one owner of empty-text survival per run with an edge-counting caret walk, 26 against 22 and 20, with five grafts: side rules for an empty text beside an inline, the split and left-side caret laws, the authored-insertion and both-sides range laws, an incremental-equals-full law, and, only if the report change is refused, keeping the old report codes.

After round 2, the lead's own design pass replaced the pairing with writing each gap before the edit. Two criticals shared one premise: storage may lack a run the editor holds while every reader pairs by position. The pairing fixed one reader, and the fill removes the premise with inserts only. The word "architect again" reverses it.

The lead ran the premises instead of only citing them (`premise-probe.ts`). Both root grammars that admit text are refused, and a stored paragraph with extra empty texts, or with none, reads as the same value with no load-time delete.

In Benchmark's pre-acceptance probe, counted work does not move with load. Per keystroke, a letter writes one stored item and deletes nothing, and a `ref` write deletes one item, as on `next`. The first paired timing run of the round 3 prototype passed three cohorts and left the 50-link cohort inconclusive just over the budget, both copies of the new code about 12% slower (`r3/lowering-timing-r3-a1.log`). The fill was reading every link's storage. Skipping an element whose editor children hold no empty run brought that cohort to 1.063, and a rerun put it at 1.128 with same-code noise of 0.164 (`r3/lowering-timing-r3-a2.log`, `r3/lowering-timing-r3-a3.log`). Six interleaved rounds put about 8% of the excess on the fill's one read of the block's stored children and about 2.5% on the core rule (`r3/attribute-stress-a1.log`). Remembering the blocks the fill checked removes that read from every later keystroke there. Stored reads per keystroke now equal `next`'s in every cohort, 27 attributes and 7 child lists with one link and 958 and 203 with 50, the same at 100 and 2000 blocks (`r3/lowering-work-memo-a1.log`). The paired timing then passed every cohort, 1.026, 1.033, 1.023 and 0.997 against the budget of 1.10, over six alternating runs per arm, and every planted slowdown failed (`r3/lowering-timing-r3-a4.log`).

### Panel round 1

Three seats read the first draft: Opus 5.5, gpt-6-astra and gpt-6.1-sol, all at xhigh (`panel-plan-r1/` in this run's directory). Challenge delta: improved. The pairing past a missing empty run was added for fresh rooms (Astra and Sol), the cut change was added for row 21 (Astra and Opus), the spacer filter was replaced by one rule per run (Sol and Opus), and the caret walk was added (Astra). The table now checks letter order, formatting and authored state (Sol).

### Panel round 2

The same three seats read the round 2 draft (`panel-plan-r2/` in this run's directory). Challenge delta: improved. Four criticals came back. Typing into an empty text that storage never held still rewrote the block, in fresh rooms too (all three). Enter, wraps and remote carets still paired storage with the editor by position (Opus and Astra). The caret walk counted the edges of an inline that canonicalization removed, so typing moved after the next letter (Astra). The cut moved a text a peer typed into whenever an empty text stood before it in its run (Sol). Each reproduction fails on the round 2 prototype and passes on the round 3 one. Four warnings were applied: the trimmed-room follow-up goes because the fill mends those rooms, `replacement.ts` no longer changes, the growth claim drops its comparison with `next`, whose control never splits, and the table now compares property values and authored state. Three warnings wait in Open work or with the split task: the stray container text, a letter typed inside a text the cut splits, and the prune helper's name.

### Round 3 prototype

The lead reran every check on the round 3 prototype (`r3/` in this run's directory). `race-table4.ts` passes 1544 of 1544 cases in five rooms, where `next` fails 756. The eight spec cases pass, and all eight fail on `next` (`r3/spec-v4-memo-a4.log`, `r3/spec-v4-next-a1.log`). Each planted mutant fails the cases named for it: removing the guard, the fill or both, moving the cut back to every text start or to all but a run's first text, never moving it, reverting the core rule, reverting the caret walk, counting edges from the block's start, and keeping a checked block after a structural change or after a remote update. Removing the drop on drift failed no case, so the memo no longer drops drifted blocks. The package suite passes 6211 tests with none failing, and the race table still passes 1544 of 1544 (`r3/suite-memo-a1.log`, `r3/table4-memo2-a1.log`). Two pinned tests change on purpose: the empty-text event case keeps the text it reads, and the authored race test ends with both removed pieces gone, an outcome `2026-10-10-authored-values.md` had recorded as a loss. Forty and 120 cycles of Enter, merge and undo keep two empty texts in the paragraph, in 2946 and 7426 bytes (`r3/growth40-cut2-a1.log`, `r3/growth120-cut2-a1.log`). A receive writes nothing on the receiving peer (`r3/round3-facts-a1.log`). The fill's skip and its memo were each rerun through the race table and the spec, all green (`r3/table4-proto4skip-a1.log`, `r3/table4-memo2-a1.log`).

### Panel round 3

The same three seats read the round 3 prototype with the memo (`panel-plan-r3/` in this run's directory). Challenge delta: improved. Four criticals came back, and each was applied. A caret beside a link a peer just inserted threw on both peers (all three), so the fill now also runs on the result of a structural edit. A block read through a reference stayed in the memo after a peer's write, and the card's race copied the section (Astra and Sol), so any peer update that does more than type into stored texts now clears the memo. An empty link removed between the last letter and the caret moved typing into the next link, which `next` does not do (Astra and Sol), so the caret walk now counts no more edges than remain. Enter before two filled texts deleted the second one, where Ed had typed (Astra), so the cut now keeps every text of its chain. The seats suggested matching surviving inlines by identity for the caret; that failed six suite tests, because canonicalization rebuilds nodes and fresh input has no keys. Six warnings were applied: the mixed-room growth, the timing cohorts with a teammate, the Brief's Enter claim, the fill's placeholder at a reference, the proposal record in spec case 1, and a race table that exits 1 on failure. A void's extra read waits in Open work.

### Round 3 fixes

The lead reran every check on a scratch copy of `2111c23ad7` with the final source (`r3/fix/` and `r3/probes-r3/final/` in this run's directory). Each of the four round 3 cases fails on the prototype and passes with the fixes, and reverting each fix alone fails its own case (`r3/fix/mutant-final-*-a1.log`). The spec's eleven cases pass, and all eleven fail on `next` (`r3/spec-final-a1.log`, `r3/spec-r3-base2111-a1.log`). `race-table5.ts` passes 1544 of 1544 and exits 1 on `next`'s 756 failures (`r3/table5-final-a1.log`). The package suite passes 6217 of 6218 tests (`r3/suite-final-a1.log`). The other one, a 1000-paragraph work count in `carried-moves-work.test.ts`, ran past its 5-second limit with the host's load near 20, and run alone it fails one of two runs on `next` too (`r3/carried-moves-base2111-a1.log`, 6.9 seconds). Every round 3 probe exits 0, and 120 cycles of Enter, merge and undo still keep two empty texts in 7426 bytes (`r3/growth120-final-a1.log`). With a teammate setting a link's `ref` before each local keystroke, a keystroke reads 33 stored attributes and 8 child lists beside one link, where `next` reads 27 and 7. Beside 50 links it reads 1111 and 204, where `next` reads 958 and 203. A teammate's letters leave the reads equal to `next`'s (`r3/lowering-work-r4-r3-fix2-a1.log`, `r3/lowering-work-r4-base2111-a1.log`).

### Push panel round 1

The same three seats read the built diff on `2111c23ad7` (`push-r1/` in this run's directory). Challenge delta: improved. Four criticals came back, and each was applied. Enter in a cut chain that holds a merged text lost a letter a peer typed into a later stored text (Astra and Sol), so the cut now keeps every text up to the last one the split cannot move. Round 3's caret cap crossed a surviving empty link and moved typing after it, which `next` does not do (Astra and Sol), so the caret maps as on `next`, with one rule for a caret at the start of a lettered text. A schema with content roots never ran the fill, and the card's race still copied the paragraph there (Astra, and Opus as a warning), so the fill now runs before the root's rewrite. The fill's read of a merged paragraph walked the whole document for each reference, 30,082 stored attributes per letter at 2,000 blocks (Opus), so a read inside a lowering now finds each referenced node through the root's lent index. That finding repeats a rule-only part of row 58 in `docs/development/enforcement.md`, which now names the lent index and the new work case. The cut and the caret fixes each replace an approach round 3 added, so each has had its one replacement. Four warnings and nits were applied: the content-root warning joined its critical, the timing is judged by the interleaved probe, the race table checks authored state, and the memo's name says it holds checked blocks. Two wait in Open work: the cut's double write and the empty texts a link cycle leaves.

### Push round 1 fixes

The lead reran every check on a scratch copy of `2111c23ad7` with the final source (`push-r1/final/`, `push-r1/arch/` and `push-r1/final2/`). Each round 1 case fails on the reviewed tree and passes with the fixes, and reverting each fix alone fails its own case. The spec's fifteen cases pass. `race-table6.ts` passes 1544 of 1544 with authored state checked, where `next` fails 756. The package suite passes 6222 tests with none failing. Typing into a merged paragraph after a teammate's `ref` write reads 102 stored attributes and 13 child lists at both 100 and 2,000 blocks, where `next` reads 83 and 12. Without the lent index default the work case reads 22,572 stored children at 500 blocks against 2,322 at 50. Passing the fill its own reader also fixed the read, but only for the fill, so the lead moved the rule to the shared lookup. In the interleaved timing on the final bytes, the candidate reads 0.996 to 1.025 of `next` in all seven cohorts, within 0.01 of its byte-identical copy, while the 15% plant reads 1.140 to 1.159 (`push-r1/final/interleave-final-a1.log`).

### Push panel round 2

The same three seats read the round 1 fixes on `2111c23ad7` (`push-r2/` in this run's directory). Challenge delta: improved. Three criticals came back. The fill before a content-root rewrite filled only the touched blocks, so an untouched trimmed paragraph still made both peers copy both paragraphs (all three). The fill now covers every block and keeps its memo across the rewrite, which is this approach's one replacement. Each link added and removed after an empty text stored one more empty text, and after 200 cycles a keystroke cost 1.17 of `next`, past the budget (Astra). An empty editor text now takes the stored empty text in its place. Keeping every text up to the last one the split cannot move lets letters a teammate deletes in an emptied text come back during an Enter (Astra). `next` does the same, so the finding stays open with the split task, and the word "third cut" reopens it. Three warnings were applied: the cut reads the paragraph's slots once instead of once per text (Sol and Astra, Opus as a nit), the fill's doc says it deletes no text, and the cut's limit is stated. One nit waits in Open work: a range end at a lettered text's start maps into that text even on the backward side (Opus).

### Push round 2 fixes

The lead reran every check on the final bytes in the worktree (`push-r2/fix/` and `push-r2/final/`). The spec's seventeen cases pass, and fifteen fail on `next`. The other two count reads per letter and empty texts per link cycle, which `next` keeps flat (`push-r2/final/spec-ordered-a2.log`, `push-r2/final/spec-base2111-a1.log`). Restoring round 2's fill fails case 14, round 2's cursor fails case 16, and reading the slots once per text fails case 17 (`push-r2/repro/spec-mutant-m1-a1.log`, `push-r2/repro/spec-mutant-cursor-a1.log`, `push-r2/repro/spec-mutant-slots-a1.log`). `race-table6.ts` passes 1544 of 1544. The Yjs suite passes 494 tests, the core laws 99 and `authored-tree-collab.test.ts` 188. `cursor-table.ts` fails only its three trimmed-room cases, as `next` does, and 40 cycles of Enter, merge and undo keep two empty texts. In a schema with content roots, each letter at 100 blocks reads 2,100 stored children, as on `next`, except the first letter after a teammate's `ref` write, which reads 2,400 (`push-r2/repro/content-root-reads-fix-a1.log`). After 200 link cycles, a keystroke on the final bytes costs 0.997 of `next`, its same-code copy 1.018 and the 15% plant 1.172 (`push-r2/final/link-cycles-200-a1.log`).

### Push panel round 3

The same three seats read the round 2 fixes on `2111c23ad7` (`push-r3/` in this run's directory). Challenge delta: improved. One critical came back (Sol). The import now keeps the empty text after a merged text. The cut could not move that text, so it kept the movable text before it in the first line, emptied it and copied its letter. A letter a teammate deleted there came back on every peer, where `next` keeps it deleted (`push-r3/repro/sol-trailing-empty-r3-a1.log` exit 1, `push-r3/repro/sol-trailing-empty-base-a1.log` exit 0). This plan had already replaced the cut once, in the push panel's first round, so the cut went back to `next`'s instead of a fourth design, and the claim narrowed. Enter while a teammate types at the start of the text after it loses that letter, as on `next`, and `t_649d2131` owns it. Astra found nothing. Opus raised three warnings and two nits. With content roots and an older client in the room, each keystroke may fill every block the older client trimmed again, not one text. Case 14 checked only block counts, so it now checks the proposal and that Alice, Ed and a reload read one value. The research page's account of round 2's deletion case was wrong, and it now describes `next`'s cut. The cursor claim lost a condition that is always true, and row 58 of `docs/development/enforcement.md` no longer names a helper. Opus also noted that an element inserted at the edge of an empty run now lands after the old stored empty text, so a teammate's caret at offset 0 there ends on its other side; no letter moves.

### Push round 3 fixes

The lead reran every check on the final bytes in the worktree (`push-r3/fix/` and `push-r3/final/`). The spec's seventeen cases pass. Fifteen fail on `next` (`push-r3/fix/spec-next-a1.log`), and with round 3's cut planted back only the deletion case fails (`push-r3/fix/spec-mutant-r3-cut-a1.log`). `race-table6.ts` fails 5 of 1544 cases, each Ed's letter in row 21 with every peer reading the same lines, where `next` fails 756 (`push-r3/final/race-table6-a1.log`). The Yjs suite passes 493 of 494 tests. The one failure is a key-work count that ran past its 5-second limit at a load average near 140. At that limit `next` failed 7 of that file's 49 cases and this plan 5, and with a 60-second limit both pass all 49 (`push-r3/final/key-work-next-60s-a1.log`, `push-r3/final/key-work-cand-60s-a1.log`). The core laws pass 99 tests and `authored-tree-collab.test.ts` 188. `cursor-table.ts` fails only its three trimmed-room cases, as `next` does, and 40 cycles of Enter, merge and undo keep two empty texts. In a schema with content roots, each letter at 100 blocks reads 2,100 stored children, as on `next`, except the first letter after a teammate's `ref` write, which reads 2,400 (`push-r3/final/content-root-reads-a1.log`). After 200 link cycles a keystroke costs 1.026 of `next`, its same-code copy 1.020 and the 15% plant 1.154. In the interleaved timing the candidate reads 0.999 to 1.024 of `next` in all seven cohorts, its same-code copy 0.982 to 1.022 and the plant 1.123 to 1.155 (`push-r3/final/interleave-a1.log`). Both examples' browser specs pass, 2 and 48 cases. The hand drive covers both pages on the final bytes: after Enter while a teammate was offline and typing, and after the join, all four peers read the same lines (`push-r3/final/hand-drive-check-a1.log`, `push-r3/drive/yjs-final-drive.md`).

### The split task

`t_649d2131`'s session is building `docs/plans/2026-10-24-yjs-split-identity.md` in its own worktree from the same base. Its working copy changes `replacement.ts`, `event-change-bridge.ts` and `text-runs.ts`, and its phase 2 rewrites the prune in `document.ts` (steps 2.4 and 2.5) and replaces `cutTextChain` with its cut marker. This plan leaves `replacement.ts` and `cutTextChain` alone and adds the fill call to `lower` in `event-change-bridge.ts`, the fill and the write cursor's claim to `text-runs.ts`, and the prune guard and the lent index default to `document.ts`, so whichever lands second redoes its change on the newer copy.

### Dependents

- distribution, editing: unaffected; `packages/platejs/src/internal/plugin/markdownParagraph.ts`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `packages/platejs/src/utils/plugins/SingleBlockPlugin.ts` and `packages/platejs/src/utils/plugins/SingleLinePlugin.ts` import only plugin keys from `plate-keys`, which this change does not touch.
- ui: unaffected; the Plite example pages import the example registry, which this change does not touch.
