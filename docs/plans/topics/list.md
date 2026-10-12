# Lists and indentation

Page: https://claude.ai/artifact/WiaDRhCCtFsHYbD6nnobtC

Plate lists are flat properties on ordinary blocks: `listType` (bulleted, numbered or task), a shared `indent` depth, an optional `listStyle` marker, the `listId` of the item's list, a Word list's `listLevels`, a conditional `listStart`, a forced `listRestart` and a task's `checked`. No list container exists, so split, merge, move, paste, drag and type change work on list items like on any block. Items that share a `listId` form one list whatever blocks sit between them, and an item without one belongs to its root's default list. A numbered item's number is derived from its list and never stored. The ledger question is how list structure, numbering and indentation compose with generic block editing. The 2026-09-24 audit kept the flat model, and the 2026-10-04 audit found that live numbering had no owner in a mounted view. The 2026-10-10 review numbers lists by identity through a per-root index, keeps each mounted list's `start` current after commits, and carries Word list identity through DOCX import and export. The 2026-10-10 import identity iteration counts Word files the way Word does and keeps each list in per-level lanes, so an edit renumbers only the numbers it changes. The 2026-10-11 first-principles pass gives each parsed Markdown list its own id and cuts the identity correction and indent's `change`, `tab` and `untab`. Its AI landing iteration lands pasted and AI-written lists through one rule. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show list`.

## Public API

The copied toolbar sets or clears list semantics on the selected blocks.

```tsx
// apps/www/src/registry/components/editor/list-toolbar-button.tsx
editor.plugin(ListPlugin).update.toggle({
  type: ListType.Bulleted,
});
```

The copied numbered wrapper reads the derived number while it renders.

```tsx
// apps/www/src/registry/components/editor/block-list.tsx
listStart={innerProps.editor
  .plugin(ListPlugin)
  .read.ordinal(innerProps.element)}
```

A static renderer passes the path it already knows.

```tsx
// apps/www/src/registry/components/editor/block-list-static.tsx
listStart={innerProps.editor
  .plugin(BaseListPlugin)
  .read.ordinal(innerProps.path)}
```

The static wrapper names the list on its list element, so static HTML and the DOCX exporter group items by identity.

```tsx
// apps/www/src/registry/components/editor/block-list-static.tsx
<InnerList
  className="relative m-0 p-0"
  data-list-id={props.element.listId ?? ''}
  data-list-levels={
    props.element.listLevels
      ? JSON.stringify(props.element.listLevels)
      : undefined
  }
  style={{ listStyleType: markerStyle }}
  start={listType === ListType.Numbered ? listStart : undefined}
>
```

Restart forces the selected numbered item's number.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx
editor.update.list.restart({ start: 7 });
```

Continue removes a restart, or joins a list from its first item onto the nearest compatible list before it.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx
editor.update.list.continue();
```

The copied numbered-list menu offers both.

```tsx
// apps/www/src/registry/components/editor/list-toolbar-button.tsx
              Upper Roman (I, II, III)
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              finalFocus={() => editor.api.dom.focus()}
              onSelect={() => {
                editor.plugin(ListPlugin).update.restart();
              }}
            >
              Restart numbering
            </DropdownMenuItem>
            <DropdownMenuItem
              finalFocus={() => editor.api.dom.focus()}
              onSelect={() => {
                editor.plugin(ListPlugin).update.continue();
              }}
            >
              Continue numbering
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
```

Stored documents get list ids at the storage boundary through a migration step.

```ts
// content/docs/(guides)/editor.mdx
import {
  defineDocumentMigrations,
  migrateListIdentity,
  migrateV54,
} from "platejs/migrations";

export const EditorSchema = { id: "acme-document", version: 55 } as const;

export const EditorMigrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema,
  sourceFingerprints: { 53: v53Fingerprint, 54: v54Fingerprint },
  steps: { 54: migrateV54, 55: migrateListIdentity },
});
```

The docs' Commands section teaches the remaining commands.

```ts
// content/docs/(plugins)/(styles)/list.mdx, Commands
list.update.outdent();
list.update.clear();
list.update.insert({ type: ListType.Numbered }, { replaceEmpty: true, select: true });
```

DOCX import numbers two restarted instances of one Word definition that alternate the way Word does.

```ts
// packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.slow.ts
expect(await importNumbers(source)).toEqual([
  'A1:1',
  'B1:1',
  'A2:2',
  'B2:3',
]);
```

The documented way to insert parsed Markdown keeps its call, and its lists arrive with their own ids.

```ts
// content/docs/(plugins)/(serializing)/markdown.mdx
const blocks = editor.api.markdown.parseSlice('- One\n- Two');
if (blocks.ok) editor.update.slice.replace(blocks.slice);
```

The list's outdent decreases the depth through indent and clears its own list facts at the top.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
tx.indent.decrease({ nodes: { at } });

for (const [node, path] of tx.nodes.blocks({ at, mode: 'lowest' })) {
  if (ElementApi.isElement(node) && !node.indent) {
    tx.nodes.unset([...LIST_FIELDS], { at: path });
  }
}
```

## Main changes

- Each editor runtime keeps one list index per root, keyed by node key. A commit that changes structure or properties reads its changed and presence keys, and text, mark and selection commits do no list work. The index builds on the first read of a root.
- The index keeps each list as per-level lanes, each stored as a list of chunks of at most 128 entries; a chunk that drops under 16 entries merges into a neighbor. One lane per level holds the level's numbered items in document order, and another holds every item at that level. An insert copies at most a chunk plus, once in about 64 inserts, the chunk directory, and a recount walks one level's numbered lane from the edit and stops at the first number that holds, then jumps to the next changed point in that level. It finds whether an item between two numbered items closes their level with a cursor per shallower level that moves forward with the walk. A level's restart rule comes from the counted item's `listLevels`, not from the item that closes it, and a limit at or beyond the level acts as the default. Where copies of `listLevels` in one list differ, each number continues the one before it in its lane under its own item's limit; Word files never produce such copies, since Word ignores `w:lvlRestart` inside an override. The full count for encoders and builds uses the same rule in one pass. A commit that changes more than an eighth of a list filters and merges its lanes in one pass instead of placing entries one at a time. A changed item keeps its lane place only when a check shows its order held, and every other changed item is placed again. A level whose rule is 0 never restarts, and an item at indent 0 counts as a level above level 1, the way Markdown and the list commands read it.
- The counting rule follows Word's level rules. In one list, an item resets each deeper level whose restart level it reaches, which by default is every deeper level. A numbered item takes its `listRestart`, opens its level at its `listStart`, the list's level start or 1, or counts on. Bulleted and task items reset deeper levels and do not count. While `listRestart` is present, a `listStart` on the same item stays latent instead of being deleted, and so does every start on an item whose kind changes.
- The React `ListPlugin` has no per-view producer. After each React commit that changes structure, properties or a replace, the view's writer reads the index's change log per root. Up to 1,024 changed keys, it writes each one's `start` through `api.dom.resolveDOMNode` for its own root and by `data-editor-node-key` for a content root it renders. With more keys, or when the log lost track, it walks the mounted `ol`s and reads each host's key. The wrappers render the first `start` for SSR and hydration.
- One join rule assigns identity, visiting at most 64 blocks. A new item takes the id of a compatible item at its depth, walking back over deeper blocks and stopping at any same-depth block that is not compatible. Failing that, when the first shallower block before it is a list item whose list has no item at this depth after it, the new item takes that list's id. Failing both, it gets a fresh id. Every write that gives an item an id also copies that list's `listLevels`. `insert` and `upsert` apply it to the item they create, inside their own transaction; no correction applies it on later edits, so undo restores exactly. Enter, Tab and Shift+Tab keep the id, and taking a root item out of a list drops it.
- DOCX import reads `numbering.xml`, styles and each paragraph's `numPr` in its own module beside Mammoth.
- DOCX import maps Word's count, after MS-DOC 2.4.6.4, onto list facts and counts nothing itself. Each definition becomes one list, and each instance's start override becomes `listRestart` on its first paragraph at that level. Plate's own count of those facts gives Word's numbers, so the importer's Word and Plate counters and its pinned numbers are gone. An override's `w:lvl` keeps its format and level text, but not its `w:start` or `w:lvlRestart`. A bullet-format paragraph stays a bullet and does not count, also when its instance overrides a numbered level's format; MS-DOC's step list, read literally, would count it.
- DOCX export writes Word's `decimalZero` level for a `decimal-leading-zero` list, which used to fail the export. It writes a restart, or any number Word would not reach, as a new instance on that item only and returns the items after it to the list's own instance, so it writes no override that a later restart could reapply. An item with `listRestart` gets that instance even when its number already matches, so the restart survives a round trip.
- Encoders number the content being encoded with the same counting rule. The HTML and plain-text encoders give format mappings the slice itself as the document when they encode a slice.
- Markdown decode gives each list family a fresh id from `createListId()`, the generator HTML decode uses, and writes a start other than 1 as `listStart`. The serializer groups task and bullet items of one list into one Markdown list, claims a `listStart` only when the written list starts at it, and audits each emitted list against the lists decode will read back, reporting a split or a merge.
- Inserted content lands through one private function in `features/list`. It groups the content's list items by source id across the whole content, tables included, and lets only the first top-level group join a compatible landing item. Every other group gets a fresh id. The paste middleware keeps pasted depths, starts and restarts; AI callers also take the landing's depth and move a replaced item's start and restart to the joined item. `joinListIdentity` has a backward-only walk for the empty-line landing.
- Each AI write path names its landing in `aiOutputLanding.internal.ts`, beside `AIChatPlugin.ts`. `captureTarget` trims a selection at block edges and widens a cross-block selection to the whole lowest blocks it touches, and the prompt and every write read that one range. Whole lowest blocks are replaced as blocks where their parent's schema leaves children's positions free and allows the new count; any other range goes to the slice fitter. Formatting copies the source's properties only onto an answer with no list items, never its list id or starts.
- A suggestion over whole blocks parses its source's Markdown round trip once per request. An answer that keeps that shape edits the source blocks' text in place, pairing blocks by position, and any other answer lands like a Replace. The draft runs as an unpublished transaction spec.
- Indent's `update` is `increase` and `decrease`; Tab and Shift+Tab are its shortcut handlers. The list's outdent decreases the indent, then clears the list facts of each block left at the top level.
- Plate's element renderer subscribes each element to its published attributes by its stable node key instead of the key at its rendered path.
- A copy or drag of a list item carries its deeper children, and a dropped list family lands after the target's own deeper run.

## What other editors do

| Editor | List model | Where the number comes from |
| --- | --- | --- |
| BlockNote `1e26f1c` | Flat `numberedListItem` blocks with an optional `start` | A ProseMirror plugin derives each item's index after every transaction, scanning from the first changed position and stopping once indexes match again, and paints it as a `data-index` node decoration that CSS reads (`IndexingPlugin.ts`, `Block.css`). HTML export derives it again |
| Lexical `dd5c41b` | `ListNode` container holding `ListItemNode` children | A node transform writes each item's `value` into the model after every update (`updateChildrenListItemValue` in `formatList.ts`) |
| prosemirror-schema-list `d5515fe` | `ordered_list` container with an `order` attribute | The browser numbers `<ol start>` children natively |
| Tiptap `91c51be` | `orderedList` container with a `start` attribute | The browser numbers `<ol start>` children natively |
| LibreOffice Writer | A list id on every numbered paragraph; one `SwList` per id holds a numbering tree | Cached numbers per list, a "last valid child" boundary, and demand-driven revalidation of that list's suffix only (`sw/inc/SwNumberTree.hxx`, `sw/source/core/doc/list.cxx`) |
| docx-preview (docxjs) | Word paragraphs with `numId` and `ilvl` | One CSS counter per (`numId`, level), started at `start - 1` and incremented in `:before`; other paragraphs leave it alone (`src/html-renderer.ts`) |
| SuperDoc (`docx-editor`) | Word `numId` and `ilvl` | A forward pass whose counters are shared per abstract numbering definition and scoped to the concrete `numId` when a start override applies (`word-layout/src/numbering-manager.ts`) |
| eigenpal docx editor | Word `numId` and `ilvl` | Nine counters per `numId` over a whole-story pass; plain paragraphs skip without clearing (`core/src/layout/list-counters.ts`) |
| CKEditor 5 | Flat blocks with `listItemId`, `listIndent` and `listType` | Contiguous only: an id groups the blocks of one item, and a list ends at the first other block |
| Microsoft Word (MS-DOC 2.4.6.4, MS-OI29500 17.9.10 and 17.9.25) | A list per numbering definition; paragraphs reference instances of it | One sequence per definition and level shared by every instance. A shallower paragraph restarts a level within its restart limit. An instance's start override resets the sequence once, at its first paragraph at that level. Word ignores `w:start` and `w:lvlRestart` inside a level override |
| pandoc `bde8c29` | Lists keyed by abstract numbering definition | Its DOCX reader keys continuation on the definition and notes that Word writes "restart numbering" as a new instance on the restarted item only, with the following items back on the original instance (`src/Text/Pandoc/Readers/Docx/Parse.hs`, issue #8367) |

BlockNote and CKEditor share Plate's flat model and number contiguous runs. Lexical stores the number, which Plate's rule against derived state in canonical JSON forbids. Word, LibreOffice and the DOCX renderers number a list by identity and skip paragraphs that are not list items, and only LibreOffice keeps an incremental per-list structure. Plate takes the identity model and LibreOffice's per-list locality. The browser draws the marker from the list element's `start`, which Plate keeps current, because pure CSS counters miscount when virtualization or pagination leaves items unmounted.

SuperDoc's counter, which the importer copied, reads an override instance's own record at an overridden level, so its numbers differ from Word's when a restarted instance is used again after another instance of its definition. The rdocx project reported checking Word for Mac, where two plain instances of one definition continue one count and an instance with a start override restarts it. Microsoft's Open Specifications team confirmed that list format overrides pointing to one list identifier are one list. Pandoc's `test/docx/lists_restart_8367.docx`, written by Microsoft Office Word 16, has that shape. The first item of section 2 points at a new instance with a start override, the rest stay on the style's original instance, and pandoc expects 1, 2, 3, 4. MS-DOC's shared count gives those numbers, and so does SuperDoc's; a reader that counts each instance apart, as the eigenpal editor does, gives 1, 4, 5, 6, so it misreads Word's own files. The exporter adopts Word's shape.

Most editors find an inserted list item's list by its container, so none needs a landing rule. Plate numbers by list id, so the landing rule gives inserted content its ids (inferred from the comparison above, not re-read).

| Editor | How inserted list items find their list (inferred) |
| --- | --- |
| ProseMirror, Tiptap | Slice fitting places the items inside the `ordered_list` node they land in, or beside it as a new list |
| Lexical | Pasted `ListItemNode`s join the `ListNode` they are inserted into |
| BlockNote, CKEditor 5 | Adjacent items of one kind count together |
| Plate | The list id decides, so the landing rule gives inserted lists their ids |

## Document shape

A list that continues past a note shares one id.

```json
[
  { "type": "p", "listType": "numbered", "listId": "steps", "indent": 1, "children": [{ "text": "Mix" }] },
  { "type": "p", "children": [{ "text": "Note: use cold water." }] },
  { "type": "p", "listType": "numbered", "listId": "steps", "indent": 1, "children": [{ "text": "Bake" }] }
]
```

Two restarted instances of one Word definition that alternate import as one list, each instance's first paragraph carrying its restart.

```json
[
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 1, "children": [{ "text": "A1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 1, "children": [{ "text": "B1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "A2" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "B2" }] }
]
```

Word shows 1, 1, 2, 3 there, the same numbers the after shape counts to. The ids pass through HTML decode, which remaps them per conversion, so the stored ids are fresh.

Two Markdown lists parse with their own ids. The id strings are examples, not a contract, and a second parse of the same text gives other strings with the same lists.

```json
[
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "V8sQ2mK7xA", "children": [{ "text": "A" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "V8sQ2mK7xA", "children": [{ "text": "B" }] },
  { "type": "p", "children": [{ "text": "Note" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "r3N9bT4wLp", "children": [{ "text": "C" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "r3N9bT4wLp", "children": [{ "text": "D" }] }
]
```

A Markdown list that starts at another number reads its start the way HTML does, as the conditional `listStart`.

```json
{ "type": "p", "listType": "numbered", "indent": 1, "listId": "a7Hx2Pq9Lm", "listStart": 0, "children": [{ "text": "Zero" }] }
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `listId` property, the counting rule, the per-root list index and the document reader | Plate | `platejs` (`features/list`, private modules, not in the barrel) | `ListPlugin` owns list schema, numbering and format mappings (`docs/vision/plate.md:1327-1329`) |
| Per-view writer that keeps each mounted item's `start` current after commits | Plate | `platejs/react` (`react/features/list`) | Numbers are dense derived presentation under the direct-host exception (`docs/vision/plate.md:314-328`). It finds hosts through the view's `api.dom` and each host's `data-editor-node-key`, so Plite gains nothing |
| Restart and Continue in the numbered-list menu | Plate copied UI | `apps/www/src/registry` | Product UI belongs in copied registry source (`docs/vision/plate.md:86-92`) |
| `migrateListIdentity` | Plate | `platejs/migrations` | Persisted documents convert at the storage boundary; corrections never run on load |
| DOCX numbering import and identity-keyed export | Plate | `platejs/docx` (`docx/import`, `docx/export`) | Mammoth drops `numId`, starts and overrides |
| Identity in HTML, Markdown, plain text and Word HTML paste | Plate | `platejs` (`features/list`, `markdown`, `docx/paste`) | One identity rule behind every codec: each decoded list gets a fresh id, and the Markdown serializer reports what Markdown cannot carry |
| Attribute subscription by the element's stable key | Plate | `platejs/react` (`react/utils`) | A woken element that moved re-subscribed under the key at its old path |
| Slice model view in the HTML and plain-text encoders | Plate | `platejs` (`lib/plugins/html`, `internal/plugin`) | The encoders paired the full document with slice-relative paths |
| Root Shift+Tab | Plate | `platejs` (`features/list`) | The list owns ⇥ and ⇤ before generic indent (`markdown-editing-spec.md:728-732`) |
| Fresh list ids at Markdown decode | Plate | `platejs` (`features/list`) | A decoded id is a durable identity, the same rule HTML decode follows, so no later path has to repair it |
| Identity for an item `insert` or `upsert` creates | Plate | `platejs` (`features/list`) | The command that creates an item decides its list; a correction cannot tell creation from undo (`packages/plitejs/src/core/correction.ts` lines 30 to 56) |
| The join rule and the `restart` and `continue` commands | Plate | `platejs` (`features/list`) | Commands own identity; counting never infers it, and no correction guesses it on later edits |
| Landing of inserted lists: identity, depth and starts for pasted and AI content | Plate | `platejs` (`features/list`, private), called by the paste middleware and by `platejs/ai` (`ai/react`) through the existing `ai/react` to `standard/list` edge | One rule decides where inserted lists belong; the AI paths only name where their output lands |

## Hard cuts and app migration

Removed with no alias: `update.indent` and `IndentListOptions`; `read.expandItemsWithChildren`; `read.getNext` and `read.getPrevious`; the `api` group (`getSequenceSiblingOptions`, `isSequenceBoundary`); the `getSiblingListOptions` plugin state and `ToggleListOptions` field, `BaseListPluginState`, `GetSiblingListOptions` and `ListSiblingState`; `MigratePlateV54Options` and `PlateV54Migration`'s options parameter; `toggle`'s `listRestart` option; and the `hli`, `hlic`, `hol` and `hul` test JSX tags in `plitejs/testing`.

An app makes blocks list items with `toggle` and deepens them with Tab or `indent.increase`. An app that configured `getSiblingListOptions` has no replacement, and one that passed a `list` policy to `migrateV54` drops it. Restart goes through `update.restart`.

Numbering follows list identity:

- A plain paragraph, a heading or a bullet between items of one list does not end it; Restart numbering ends it on purpose.
- Numbered items without `listId` in one root form one list. Persisted documents get ids from `migrateListIdentity`, which an app registers as its next schema step: the schema gains `listId` and `listLevels`, which changes its compiled fingerprint. Hand-written values with more than one list need ids.
- Taking a middle item out of a list, by Backspace, Enter on an empty root item, outdent or toggle, keeps the following items in the same list, so they count on.
- Word HTML paste carries `mso-list` identity instead of forced restarts.
- Static and HTML output write `data-list-id` on each list element.

Removed on 2026-10-11 with no alias: `IndentPlugin`'s `update.change`, `update.tab` and `update.untab`, and `IndentChangeOptions`' `setNodeProps` and `unsetNodeProps`. An app that called `update.change({ offset })` calls `increase` or `decrease` once per step.

Markdown parse output carries `listId` and `listStart` where it carried `listRestart`, and two parses of one text differ in list id strings. A raw write of a list item without `listId` stays in the root's default list and no longer joins a neighbor on the next structural edit; the list commands do that.

## Native behavior and proof

| Behavior | What happens | Proof surface |
| --- | --- | --- |
| A list continues past a plain paragraph, a heading or a bullet; two interleaved lists | Numbered by identity | Headless and React DOM tests on both render paths; Chromium screenshot in the www list demo |
| Restart numbering and Continue numbering | Restart writes a forced number; Continue removes it, or joins a list from its first item to the previous compatible list | Command specs, including Restart then Continue and Continue from a first item; Chromium run through the numbered-list menu |
| Typing a number that continues the list before a note | Joins that list | Input-rule spec |
| Inserting into one list among N lists | Index work stays bounded by that list; the whole insert still grows with the root | Scale lines I1, I2' and I6 at N = 10, 100 and 1,000; the Report line |
| Top insert or start change in a 10,000-item list | One React render (the new item); every other number is written into its list's `start` | Render counts; Chromium frame time on a production bundle, 72 ms over a plain insert (D1', accepted below its frozen line) |
| Typing, mark toggles, plain-paragraph edits anywhere | No recount and no list render; typing after a mark toggle checks the typed item's order, about 15 compares in a 10,000-item list | Scale line I8, which fails its zero-work line; work counters and the keystroke cost cases |
| Virtualized and paginated views | A mounted item shows its number at first paint and after each edit; unmounted items cost nothing | Scale line D7; Chromium run in a virtualized 10,000-item list on `/dev/list-perf` |
| Two views, SSR, hydration, host replacement, detach and a transition render | Every mounted view's lists stay current; SSR and static output carry the number | React DOM lifecycle tests; `renderToString` test |
| Lists in a content root | Numbered correctly; each list edit there costs time proportional to that root | React DOM content-root test; named limit in Open work |
| Taking a middle item out of a list | Following items count on | Headless tests for Backspace, empty-item Enter, outdent and toggle (`EDIT-LIST-ID-403`) |
| Pasting list items next to a compatible list | The first top-level pasted list joins it when list kind, style and heading role match; items of one source list keep one id across the paste, tables included; a list that lives only inside a pasted table keeps its own; pasted starts and restarts stay | Clipboard specs in `BaseListPlugin.spec.tsx` |
| A kind change, an HTML round trip or a migration that hides a start | The start stays latent and shows again after the edit that makes its item first | Headless tests that apply the exposing edit |
| Word documents | Lists keep their membership, level rules and numbers through import, an insert, export and re-import, counted the way Word counts them: instances of one definition share each level's count, and a start override restarts it once. A bullet-format paragraph inside a numbered level stays an uncounted bullet. Inserting before, deleting or moving the first paragraph of a restarted instance leaves the restart on its item, where Word moves it to the instance's first paragraph | DOCX import specs against an oracle written from MS-DOC 2.4.6.4, and round trips, before and after an insert |
| Word HTML paste of interleaved lists | Identity from `mso-list`, no forced restarts | `WordPastePlugin.spec.ts` interleaved case |
| Markdown round trip | Each Markdown list gets its own fresh id and keeps its start as `listStart`; task and bullet items of one list stay one list; serialize starts each run at its number and alternates the delimiter between adjacent lists, and reports a forced restart or a split list it cannot carry | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `markdownContinuation.spec.ts`, `EDIT-LIST-START-MD-401`, scale line L4 on parsed Markdown |
| Migration of stored documents | Same numbers before and after `migrateListIdentity`, and running it twice changes nothing | Migration oracle test |
| Shift+Tab on a root list item | No change and no undo step; deeper selected blocks still outdent | Keyboard-pipeline test with history read; Chromium keyboard run |
| Shift+Tab on a root list item inside a blockquote | The item leaves the list and the quote in one press (`EDIT-BQ-LIST-STAB-001`) | Keyboard-pipeline test tagged `EDIT-BQ-LIST-STAB-001` |
| Enter at the end of a checked task | The new task stays checked | Headless spec tagged `EDIT-TASK-ENTER-001`; Chromium keyboard run |
| Plain text and HTML of a whole document or a copied part | Each numbered item writes its derived number within what was copied | `plain-text.spec.ts` and HTML clipboard cases |
| A list item at indent 0 | Counts as a level above level 1, the way Markdown nests it, and a level whose rule is 0 still never restarts | `listIndex.internal.spec.ts` and the indent-0 case in `standardList.spec.ts` |
| An edit in one long list | The recount visits the numbers the edit changes | Work-unit lines for start, middle and end edits in a 10,000-item list |
| Backspace or a move at a Markdown list's first item | The rest of that list keeps counting from 1, as an HTML list does | Headless spec of the probe's cases, tagged `EDIT-LIST-START-MD-401` |
| Pasting or inserting two Markdown lists | They stay two lists through paste, a raw insert, a value built from two parses and a transfer between editors | Clipboard spec through `parseSlice` and `slice.replace`; headless specs for raw insert and transfer |
| Undo after deleting an item of a list without ids | The document and its numbers come back exactly | Headless spec with history undo and redo |
| Delete or Backspace on the first item of an id-less list after a note | The rest counts on from the list above, by the default-list rule, where the deleted correction used to give it a fresh id | Headless spec; hand-written values and released documents loaded without `migrateListIdentity` |
| A client editor that parses Markdown in its value initializer, rendered on the server and hydrated | One hydration warning on the list element, and the hydrated DOM keeps the server parse's list ids until an item's list id changes, while an item added later carries the client's; HTML read from the page, such as a copy whose model HTML the encoder declines, then splits that list; Open work tracks it | `renderToString` and hydrate test |
| AI output placed below or over list items | The answer's first top-level list joins the item it lands at when list kind, style and heading role match; its other lists, and lists inside its tables, keep their own ids and starts; it lands at the landing's depth with its own nesting; a replaced item's start and restart go to the joined item | `AIChatPlugin.lists.spec.ts` |
| An AI answer over selected text | When the AI opens, the selection is trimmed at block edges and, when it crosses blocks, widened to the whole lowest blocks it touches, so the prompt and the write cover the same blocks; whole blocks are replaced as blocks where their parent's schema leaves its children's positions free and allows the new count, such as in a quote or a table cell, and elsewhere the slice fitter merges the answer's first line into the first block; a selection inside one block lands as a paste would, keeping that block | `AIChatPlugin.lists.spec.ts` |
| An AI suggestion over list items | Over whole blocks, an answer with the items' count and Markdown shape edits their text in place and keeps each block's key, list, depth and starts by index, so an answer that adds one item and drops another can move a start; any other answer lands like a Replace. Inside one block, the answer replaces the selected text | `AIChatPlugin.lists.spec.ts` and `AIChatPlugin.suggestions.spec.ts` |
| An insert-mode answer on an empty line below a list | Continues the list above at the line's depth; on an empty list item, it takes that item's place, plain text included | `AIChatPlugin.lists.spec.ts` |

## Open work

- Regenerate the generated registry and API reference outputs for the list review's doc and config edits (`pnpm --filter www build:registry`, then `pnpm --filter plitejs build && pnpm --filter platejs build && pnpm --filter www api-reference`). Another session has those files staged. owner: zbeyens. stop: that session's staged generated files land, then run the commands and confirm `pnpm --filter www api-reference --check`.
- `migrateV54` keeps the numbers of documents migrated under a v53 policy that split runs where the live rule continues them only as far as it did before the option was cut, and a conditional restart on a page container's first item now applies. owner: zbeyens. stop: a migration report from an app that used a custom v53 policy, or 2026-12-31.
- Lists in a content root renumber in time proportional to that root, because Plite rebuilds a named root's snapshot index per commit. The flat-cost claim for N lists covers the main root until then. owner: zbeyens. stop: Plite core carries named-root indexes across commits, or 2026-12-31.
- Each separate Word list writes a full eight-level definition, about 2.6 KB, and the exporter stores the zip uncompressed. Sharing definitions would merge lists on import, so compression is the lever. owner: zbeyens. stop: a DOCX export size plan, or 2026-12-31.
- A renumber in another root makes each view match one `data-editor-node-key` selector per changed key, because a view's `api.dom` does not resolve the keys of the content roots it renders. owner: zbeyens. stop: Plite's `api.dom` resolves a rendered content root's keys.
- Bulleted items that the static kit renders as list-item paragraphs export to DOCX as indented paragraphs, not Word list items. owner: the DOCX session's proposed "DOCX export: list hosts beyond paragraphs". stop: the owner starts that session.
- Static HTML drops a bulleted item's list facts, because the static kit renders bullets as list-item paragraphs without a wrapper. owner: zbeyens. stop: the static kit renders bullets with list facts, or the DOCX session's list hosts work starts.
- The typed `N. ` rule tests whether the toggle joined a list by walking for a listmate, because the toggle does not report a fresh list; it also compares block types where the join rule compares heading roles, because the rule's editor has no Plate runtime to read the heading type. owner: zbeyens. stop: a list command plan, or 2026-12-31.
- D6, the shipped writer against the incumbent producer, did not run: the old tree does not bundle under Bun and needs an offline install for a dev server. owner: zbeyens. stop: a D6 run from a `proof-worktree.mjs --install` dev server at `1d56131a`, or the word rerun-d6 on the list review page.
- Word's compound labels such as 1.2. are kept in `listLevels` but drawn as plain per-level numbers. owner: zbeyens. stop: a list marker plan, or 2026-12-31.
- Outdent from the toolbar or block menu on a top list item drops its `indent` while it stays a list item, where Shift+Tab leaves it unchanged. A list rule there needs either indent to read list facts or a list correction whose undo step is unproven. owner: zbeyens. stop: a list toolbar plan, or 2026-12-31.
- A woken element keeps the `renderPath` it rendered with, and the fast path passes none, although live wrapper props type it as required. owner: zbeyens. stop: a Plate React renderer plan, or 2026-12-31.
- Step 3.2's proof failed two lines in both final runs. An insert among N Markdown lists of 10 in the root's default list took 24 to 28 µs at N = 10 and 69 to 75 µs at N = 3,000, because finding its place compared paths in one list that held them all. The 2026-10-11 first-principles pass gives each parsed Markdown list its own id. Its step 1.7 holds every work count flat to 3,000 lists, while the index update's time still doubles, as the item on that update says. Typing after a mark toggle does 15 compares where the zero-work line allows none, for the reason the next item gives. Step 3.2 keeps its approved wording in Steps. owner: zbeyens. stop: the restart-runs iteration, which can start an insert's search at its neighbors.
- Which changed list items keep their lane places. Plite marks a mark split as a structural change, so an item at its old path pays an order check per level lane in that commit. Typing after a mark toggle in a 10,000-item list does about 15 compares, bolding across 2,000 of its items places most of them again and rebuilds the list, and a list with 10,000 distinct levels pays 20,000 compares. An order-preserving move of a quote that holds a whole list also places all of it again, and the pass for shifted items saves only a constant factor over placing them. owner: zbeyens. stop: the next list iteration, with a move signal from Plite's commit or a check per run of unmoved items.
- An item shallower than its list's first item, such as indents 1, 0 and 1, has no faithful Markdown form. Markdown numbers the indent-0 item as the outer list's second item, while Plate counts it as a level of its own. owner: zbeyens. stop: the restart-runs iteration, or 2026-12-31.
- A failed index update rebuilds its own root and rethrows, so a later root in the same commit stays stale until its next structural commit, and a failed rebuild replaces the first error. No update fails by contract. owner: zbeyens. stop: the next list iteration.
- Each walk opens a closer cursor for every populated shallower level, and an `indent` of NaN, which only the transaction API can write, gives a level that no comparison orders. owner: zbeyens. stop: the next list iteration.
- Plite's snapshot `pathOf` walks the whole document for a key it has not cached, so the list index asks the before snapshot only about keys it indexed; the work counters cannot see such a walk, and only the measured probe caught the round 2 code that asked about inserted keys. owner: zbeyens. stop: a Plite snapshot index plan that makes such a lookup visible or cheap.
- Where a restart lives once items are added before it, or it is deleted or moved. Plate's Restart, a Markdown list's `listStart` and a Word instance's start override all sit on one item, so deleting or moving that item drops the restart and the rest continues the list before, and an item added before it does not take it over. Word applies an instance's override at whichever paragraph is first, and Google Docs keeps a restarted list restarted. For AI output, the landing function moves a replaced head's start and restart to the item that joins its list, and paste keeps pasted starts. owner: zbeyens. stop: the next list iteration, which plans restarts that follow their run.
- The writer redraws every mounted list once a commit changes more than 1,024 numbers or a view falls 64 commits behind, so that walk grows with the other mounted lists; per-view mounted refs would write only the changed lists. owner: zbeyens. stop: step 3.2's writer line above the frame budget, or the word writer-refs.
- DOCX export takes each level's format, text and restart limit from a list's first item, so an instance that overrides the format, such as `%1)` against `%1.`, or items whose `listLevels` copies differ, export with the first item's and report `list-structure`. owner: zbeyens. stop: the restart iteration, which gives Plate instances.
- An AI rewrite that spans two lists keeps only the first in its list: the landing function that paste and AI share joins only the content's first top-level list to the landing list, and every other list gets a fresh id. owner: zbeyens. stop: a list command plan, or 2026-12-31.
- A bullet-format paragraph inside a numbered Word level does not count in Plate, where MS-DOC's step list, read literally, counts it, so a number after such a paragraph can show one less than that reading. No Word run settles which Word does. owner: zbeyens. stop: a Word-written file with such an instance and its displayed numbers, or the word count-bullets.
- Word's "first paragraph of an instance" is read per instance and level, which pandoc's Word 16 file cannot tell from per instance, because its restart instance covers one level. owner: zbeyens. stop: a Word-written file with a multi-level restart instance and its displayed numbers, or 2026-12-31.
- A `numFmt` `none` level imports as a numbered list that shows its numbers, where Word shows none. owner: zbeyens. stop: a list marker plan, or 2026-12-31.
- DOCX import scans every paragraph of the document part in order, so text boxes, the fallback copies of alternate content and tracked deletions join the body's count, where Word counts each story apart. owner: zbeyens. stop: a DOCX import plan, or 2026-12-31.
- A whole insert among N lists still grows with N, because Plite's own commit does (0.31 ms at N = 10 to 2.62 ms at N = 1,000 for plain paragraphs); the list share outside the index, 0.10 to 0.24 ms, is too close to the run-to-run spread to call. The owner's flat-cost ask stays unmet for the whole insert until Plite's commit is flat. Plite's transactions also grow with the nodes they touch: removing every other item of a 20,000-item list in one transaction took 112.5 s, so step 3.2 restated its removal line to I7's and did not run the kind toggle of a 10,000-item run. owner: zbeyens. stop: a Plite commit performance plan, or 2026-12-31.
- Three www DOCX fixtures, `lists_continuing.docx`, `lists_restarting.docx` and `lists_sublist_reset.docx`, are byte-identical to pandoc's test files, and pandoc is released under the GPL, version 2 or later, while this repository is MIT. They predate this work. owner: zbeyens. stop: you confirm their license or replace them, or 2026-12-31.
- Two editors loaded from one saved value share list ids, so a transfer copy between them keeps the copied items in that list. This holds for every codec today. owner: zbeyens. stop: a report of such a merge, or 2026-12-31.
- HTML decode joins an `<ol start=N>` to a list before it whose next number is N, even across a paragraph, while Markdown parses the same text as two lists. It serves Google Docs paste, and its tests check numbers only. owner: zbeyens. stop: a captured Google Docs clipboard fixture that shows whether it needs the rule, or 2026-12-31.
- An AI rewrite of a list that a paragraph interrupts, such as A, a note and B in one Word list, gives B a new list, because Markdown writes the two parts as two lists and the landing function joins only the answer's first top-level list. The same rule joins a first sublist with its own id to its parent's list. Plan panel round 3 of the first-principles plan rated it critical. patch: match AI output to the source's Markdown runs and give each run back its source list. owner: zbeyens. stop: an AI correspondence plan, or 2026-12-31.
- The Markdown serializer's audit skips id-less items, so a hand-written value whose default list Markdown splits into two lists reports nothing. owner: zbeyens. stop: a report of a silent default-list split, or 2026-12-31.
- The list index's update among parsed Markdown lists does the same work at 10 and 3,000 lists but takes twice as long at 3,000, and neither shifted paths nor more `pathOf` calls explain it. owner: zbeyens. stop: a profile of the update below its work counters, or 2026-12-31.
- A client editor that parses Markdown in its value initializer on the server and again on the client warns at hydration on each list element, and the hydrated DOM keeps the server parse's list ids until an item's list id changes, because each parse draws fresh list ids. An item added after hydration carries the client's id, so HTML read from the page, such as a copy whose model HTML the encoder declines, splits that list. owner: zbeyens. stop: a plan that hands the server's parsed value to the client or derives list ids from the source, or 2026-12-31.
- An AI answer that starts with a table or a quote, replacing part of one item's text, is refused by the slice fitter, as it is today. owner: zbeyens. stop: an AI replace report that needs it, or 2026-12-31.
- A suggestion over items that start deeper than later ones, whose answer adds or removes items, puts the later ones at the first item's depth. The prompt's Markdown cannot say that a first item is nested, so the answer's depths are relative to it. owner: zbeyens. stop: a prompt format that carries depth, or 2026-12-31.
- `ai/react` calls the list landing function through an entrypoint edge; a read the list plugin contributes would let AI run without importing list code. owner: zbeyens. stop: an AI setup without the list plugin, or 2026-12-31.
- Paste keeps the slice fitter's block merging. Pasting tasks over a fully selected numbered item keeps the first task numbered, and a table-first paste over a head's text loses its start, as today. owner: zbeyens. stop: a paste report, or 2026-12-31.
- The suggestion's shape check serializes the chat nodes, while the prompt serializes the blocks inside a node-selected container; sharing one serializer from `platejs/ai` is a public API change. owner: zbeyens. stop: a container rewrite report, or 2026-12-31.
- Every text op in a Plite transaction copies and freezes the document's top-level children, about 2 ms per op at 10,000 blocks, so a suggestion with many edits costs more on a large document; typing pays it once per keystroke. Measured in `artifacts/2026-10-11-ai-list-landing/perf/spec-ops-micro-a2.log` and `artifacts/2026-10-11-ai-list-landing/perf/spec-ops-nofreeze-a2.log`; tracked as a session task, "Remove Plite's per-op root array freeze cost". owner: zbeyens. stop: a Plite plan that makes a text op's cost flat in document size, or 2026-12-31.
- Two phase 2 branches have no spec that fails when they change. A suggestion inside one block writes with closed edges, and a mutation that opens them passes every spec. A single table cell answer keeps the incumbent merge, and no phase 2 mutation targets that branch. Both are step 2.3 rows of the decision log. owner: zbeyens. stop: a report that one of them breaks, or 2026-12-31.
- The plain-block rule lets an answer without a list marker keep a single source item in its list. Only the client's node-selection template shows that block without its marker; the copied server route's edit prompt shows the marker, so an answer there that drops it on purpose keeps the list. Building the round trip from the value the prompt actually sent would tie the rule to that prompt. owner: zbeyens. stop: a report of a single-item suggestion that keeps a list it should drop, or 2026-12-31.
- A stream whose chunks change text and then restore it leaves a replacement of the restored text in the suggestion, because the stored change composes each chunk's inverse with the next. Accept writes the right text. The incumbent does the same (`artifacts/2026-10-11-ai-list-landing/panel-diff-1/probe-round1-base-a3.log`). owner: zbeyens. stop: a report of wrong suggestion marks on a streamed answer, or 2026-12-31.
- The suggestion draft projects the whole authored document on every streamed chunk, about 160 of 210 ms per chunk at 1,000 other lists, for paragraphs and lists alike. Measured in `artifacts/2026-10-11-ai-list-landing/perf/draft-cpu-a1.log`; `2026-10-11-ai-draft-projection-benchmark.md` makes one projection per request, and a fully flat chunk is Plite open work there. owner: zbeyens. stop: a draft whose per-chunk cost is flat in document size, or 2026-12-31.
- A replace lands on its first block. So when that block is plain and list items follow it, the answer's list takes a fresh id and the list splits, as the base does: a Replace ([null, 1, 2, 1, 2]), a suggestion that lands as a Replace, and a table cell answer whose list item follows a paragraph ([5, 6, 6]; `artifacts/2026-10-11-ai-list-landing/panel-diff-3/probe-round3-fixed-a1.log`, the `opus-3` lines). Round 1 joined it to the first covered item, and round 2 reverted that because the item's depth moved plain output (`artifacts/2026-10-11-ai-list-landing/panel-diff-2/probe-round1-on-r2fixed-a2.log`, the `opus-3` lines). Joining needs a landing that names its depth block and its list block apart. owner: zbeyens. stop: a report of a list that splits under a Replace, or 2026-12-31.
- A table-first answer that replaces a selection from a list head's start into a quote loses the head's start ([null, 1, 2]; the base kept it on leftover text, [5, null, 1, 6]). Whether the slice fitter keeps or removes the start block depends on the answer, and the AI code cannot see its choice (`artifacts/2026-10-11-ai-list-landing/panel-diff-2/probe-round1-on-r2fixed-a2.log`, the `astra-4` lines). Moving the start needs the fitter's result to say whether that block survived. owner: zbeyens. stop: a slice write that reports the blocks it removed, or 2026-12-31.
- A suggestion that changes the shape of blocks inside a container, such as a quote, keeps the first source block's properties, as the base does. A list answer over a quote's only paragraph merges its first item into that paragraph (`artifacts/2026-10-11-ai-list-landing/panel-diff-2/probe-round1-on-r2fixed-a2.log`, the `opus-5b` lines). Turning two quoted items into tasks loses the first checkbox (`artifacts/2026-10-11-ai-list-landing/panel-diff-3/probe-round3-fixed-a1.log`, the `sol-1` lines). Writing it as blocks needs one fitted operation that replaces sibling blocks and counts the removed text against `maxLength`. owner: zbeyens. stop: such an operation in Plite, or 2026-12-31.
- A whole-block Replace at the main root's top level assumes the root leaves its children's positions free, because Plite has no public read of the main root's content. There it skips every placement check, so a main root that fixes positions, such as the forced-layout example's title and paragraph, or that limits its child count or child types, can throw where the slice fitter would have fitted or refused the answer. Plite's internal placement check already answers this question. owner: zbeyens. stop: a public placement read or a fitted sibling replace in Plite, or 2026-12-31.
- A suggestion with as many blocks as its source, which keeps their Markdown shape but adds one block and drops another, pairs blocks by index, so a source block's properties, such as a latent start, move to another block ([5, 6] where [1, 2] is right; `artifacts/2026-10-11-ai-list-landing/panel-diff-3/probe-round2-on-r3fixed-a1.log`, the `round1-c3` lines), as the base does. Round 2's check broke typo fixes whose text equals another block's (`artifacts/2026-10-11-ai-list-landing/panel-diff-3/probe-round3-panel-diff-a3-a1.log`, the `astra-1` lines), so round 3 removed it. A check that tolerates repeated texts and stays linear needs its own plan iteration. owner: zbeyens. stop: that plan, or 2026-12-31.
- A Replace whose answer would give a parent more children than its schema allows throws in Plite's slice fitter and changes nothing, as the base does (`artifacts/2026-10-11-ai-list-landing/panel-diff-2/probe-round2-slot-a2.log`, the `max` lines); a session task, "Fix Plite slice fitter throw on a parent's max", tracks it. owner: zbeyens. stop: that task lands or is dismissed, or 2026-12-31.
