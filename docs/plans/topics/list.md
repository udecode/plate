# Lists and indentation

Page: https://claude.ai/artifact/WiaDRhCCtFsHYbD6nnobtC

Plate lists are flat properties on ordinary blocks: `listType` (bulleted, numbered or task), a shared `indent` depth, an optional `listStyle` marker, the `listId` of the item's list, a Word list's `listLevels`, a conditional `listStart`, a forced `listRestart` and a task's `checked`. No list container exists, so split, merge, move, paste, drag and type change work on list items like on any block. Items that share a `listId` form one list whatever blocks sit between them, and an item without one belongs to its root's default list. A numbered item's number is derived from its list and never stored. The ledger question is how list structure, numbering and indentation compose with generic block editing. The 2026-09-24 audit kept the flat model, and the 2026-10-04 audit found that live numbering had no owner in a mounted view. The 2026-10-10 review numbers lists by identity through a per-root index, keeps each mounted list's `start` current after commits, and carries Word list identity through DOCX import and export. The 2026-10-10 import identity iteration counts Word files the way Word does and keeps each list in per-level lanes, so an edit renumbers only the numbers it changes. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show list`.

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

## Main changes

- Each editor runtime keeps one list index per root, keyed by node key. A commit that changes structure or properties reads its changed and presence keys, and text, mark and selection commits do no list work. The index builds on the first read of a root.
- The index keeps each list as per-level lanes, each stored as a list of chunks of at most 128 entries; a chunk that drops under 16 entries merges into a neighbor. One lane per level holds the level's numbered items in document order, and another holds every item at that level. An insert copies at most a chunk plus, once in about 64 inserts, the chunk directory, and a recount walks one level's numbered lane from the edit and stops at the first number that holds, then jumps to the next changed point in that level. It finds whether an item between two numbered items closes their level with a cursor per shallower level that moves forward with the walk. A level's restart rule comes from the counted item's `listLevels`, not from the item that closes it, and a limit at or beyond the level acts as the default. Where copies of `listLevels` in one list differ, each number continues the one before it in its lane under its own item's limit; Word files never produce such copies, since Word ignores `w:lvlRestart` inside an override. The full count for encoders and builds uses the same rule in one pass. A commit that changes more than an eighth of a list filters and merges its lanes in one pass instead of placing entries one at a time. A changed item keeps its lane place only when a check shows its order held, and every other changed item is placed again. A level whose rule is 0 never restarts, and an item at indent 0 counts as a level above level 1, the way Markdown and the list commands read it.
- The counting rule follows Word's level rules. In one list, an item resets each deeper level whose restart level it reaches, which by default is every deeper level. A numbered item takes its `listRestart`, opens its level at its `listStart`, the list's level start or 1, or counts on. Bulleted and task items reset deeper levels and do not count. While `listRestart` is present, a `listStart` on the same item stays latent instead of being deleted, and so does every start on an item whose kind changes.
- The React `ListPlugin` has no per-view producer. After each React commit that changes structure, properties or a replace, the view's writer reads the index's change log per root. Up to 1,024 changed keys, it writes each one's `start` through `api.dom.resolveDOMNode` for its own root and by `data-editor-node-key` for a content root it renders. With more keys, or when the log lost track, it walks the mounted `ol`s and reads each host's key. The wrappers render the first `start` for SSR and hydration.
- One join rule assigns identity, visiting at most 64 blocks. A new item takes the id of a compatible item at its depth, walking back over deeper blocks and stopping at any same-depth block that is not compatible. Failing that, when the first shallower block before it is a list item whose list has no item at this depth after it, the new item takes that list's id. Failing both, it gets a fresh id. Every write that gives an item an id also copies that list's `listLevels`. A correction applies the rule to list items an edit creates without an id. Enter, Tab and Shift+Tab keep the id, and taking a root item out of a list drops it.
- DOCX import reads `numbering.xml`, styles and each paragraph's `numPr` in its own module beside Mammoth.
- DOCX import maps Word's count, after MS-DOC 2.4.6.4, onto list facts and counts nothing itself. Each definition becomes one list, and each instance's start override becomes `listRestart` on its first paragraph at that level. Plate's own count of those facts gives Word's numbers, so the importer's Word and Plate counters and its pinned numbers are gone. An override's `w:lvl` keeps its format and level text, but not its `w:start` or `w:lvlRestart`. A bullet-format paragraph stays a bullet and does not count, also when its instance overrides a numbered level's format; MS-DOC's step list, read literally, would count it.
- DOCX export writes Word's `decimalZero` level for a `decimal-leading-zero` list, which used to fail the export. It writes a restart, or any number Word would not reach, as a new instance on that item only and returns the items after it to the list's own instance, so it writes no override that a later restart could reapply. An item with `listRestart` gets that instance even when its number already matches, so the restart survives a round trip.
- Encoders number the content being encoded with the same counting rule. The HTML and plain-text encoders give format mappings the slice itself as the document when they encode a slice.
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

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `listId` property, the counting rule, the per-root list index and the document reader | Plate | `platejs` (`features/list`, private modules, not in the barrel) | `ListPlugin` owns list schema, numbering and format mappings (`docs/vision/plate.md:1327-1329`) |
| The join rule, its correction, and the `restart` and `continue` commands | Plate | `platejs` (`features/list`) | Commands own identity; counting never infers it |
| Per-view writer that keeps each mounted item's `start` current after commits | Plate | `platejs/react` (`react/features/list`) | Numbers are dense derived presentation under the direct-host exception (`docs/vision/plate.md:314-328`). It finds hosts through the view's `api.dom` and each host's `data-editor-node-key`, so Plite gains nothing |
| Restart and Continue in the numbered-list menu | Plate copied UI | `apps/www/src/registry` | Product UI belongs in copied registry source (`docs/vision/plate.md:86-92`) |
| `migrateListIdentity` | Plate | `platejs/migrations` | Persisted documents convert at the storage boundary; corrections never run on load |
| DOCX numbering import and identity-keyed export | Plate | `platejs/docx` (`docx/import`, `docx/export`) | Mammoth drops `numId`, starts and overrides |
| Identity in HTML, Markdown, plain text and Word HTML paste | Plate | `platejs` (`features/list`, `markdown`, `docx/paste`) | One identity rule behind every codec |
| Attribute subscription by the element's stable key | Plate | `platejs/react` (`react/utils`) | A woken element that moved re-subscribed under the key at its old path |
| Slice model view in the HTML and plain-text encoders | Plate | `platejs` (`lib/plugins/html`, `internal/plugin`) | The encoders paired the full document with slice-relative paths |
| Root Shift+Tab | Plate | `platejs` (`features/list`) | The list owns ⇥ and ⇤ before generic indent (`markdown-editing-spec.md:728-732`) |

## Hard cuts and app migration

Removed with no alias: `update.indent` and `IndentListOptions`; `read.expandItemsWithChildren`; `read.getNext` and `read.getPrevious`; the `api` group (`getSequenceSiblingOptions`, `isSequenceBoundary`); the `getSiblingListOptions` plugin state and `ToggleListOptions` field, `BaseListPluginState`, `GetSiblingListOptions` and `ListSiblingState`; `MigratePlateV54Options` and `PlateV54Migration`'s options parameter; `toggle`'s `listRestart` option; and the `hli`, `hlic`, `hol` and `hul` test JSX tags in `plitejs/testing`.

An app makes blocks list items with `toggle` and deepens them with Tab or `indent.increase`. An app that configured `getSiblingListOptions` has no replacement, and one that passed a `list` policy to `migrateV54` drops it. Restart goes through `update.restart`.

Numbering follows list identity:

- A plain paragraph, a heading or a bullet between items of one list does not end it; Restart numbering ends it on purpose.
- Numbered items without `listId` in one root form one list. Persisted documents get ids from `migrateListIdentity`, which an app registers as its next schema step: the schema gains `listId` and `listLevels`, which changes its compiled fingerprint. Hand-written values with more than one list need ids.
- Taking a middle item out of a list, by Backspace, Enter on an empty root item, outdent or toggle, keeps the following items in the same list, so they count on.
- Word HTML paste carries `mso-list` identity instead of forced restarts.
- Static and HTML output write `data-list-id` on each list element.

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
| Pasting list items next to a compatible list | They join it | Clipboard test through `writeDataTransferFragment` and paste |
| A kind change, an HTML round trip or a migration that hides a start | The start stays latent and shows again after the edit that makes its item first | Headless tests that apply the exposing edit |
| Word documents | Lists keep their membership, level rules and numbers through import, an insert, export and re-import, counted the way Word counts them: instances of one definition share each level's count, and a start override restarts it once. A bullet-format paragraph inside a numbered level stays an uncounted bullet. Inserting before, deleting or moving the first paragraph of a restarted instance leaves the restart on its item, where Word moves it to the instance's first paragraph | DOCX import specs against an oracle written from MS-DOC 2.4.6.4, and round trips, before and after an insert |
| Word HTML paste of interleaved lists | Identity from `mso-list`, no forced restarts | `WordPastePlugin.spec.ts` interleaved case |
| Markdown round trip | Each Markdown list stays in the root's default list and opens with a forced start; an insert there visits only the numbers it changes and copies at most a chunk of pointers, while its time still grows with the number of lists; serialize starts each run at its number | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `EDIT-LIST-START-MD-401`, scale line L4 |
| Migration of stored documents | Same numbers before and after `migrateListIdentity`, and running it twice changes nothing | Migration oracle test |
| Shift+Tab on a root list item | No change and no undo step; deeper selected blocks still outdent | Keyboard-pipeline test with history read; Chromium keyboard run |
| Shift+Tab on a root list item inside a blockquote | The item leaves the list and the quote in one press (`EDIT-BQ-LIST-STAB-001`) | Keyboard-pipeline test tagged `EDIT-BQ-LIST-STAB-001` |
| Enter at the end of a checked task | The new task stays checked | Headless spec tagged `EDIT-TASK-ENTER-001`; Chromium keyboard run |
| Plain text and HTML of a whole document or a copied part | Each numbered item writes its derived number within what was copied | `plain-text.spec.ts` and HTML clipboard cases |
| A list item at indent 0 | Counts as a level above level 1, the way Markdown nests it, and a level whose rule is 0 still never restarts | `listIndex.internal.spec.ts` and the indent-0 case in `standardList.spec.ts` |
| An edit in one long list | The recount visits the numbers the edit changes | Work-unit lines for start, middle and end edits in a 10,000-item list |

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
- The toolbar and block-menu Outdent call `indent.decrease`, which still drops `indent` on a root list item (cosmetic: numbering already reads a missing indent as 1). owner: zbeyens. stop: a list toolbar plan, or 2026-12-31.
- A woken element keeps the `renderPath` it rendered with, and the fast path passes none, although live wrapper props type it as required. owner: zbeyens. stop: a Plate React renderer plan, or 2026-12-31.
- Step 3.2's proof failed two lines in both final runs. An insert among N Markdown lists of 10 in the root's default list takes 24 to 28 µs at N = 10 and 69 to 75 µs at N = 3,000, because finding its place compares paths in one list that holds them all; its visits and copies stay flat. So your example of N separate lists holds for lists with their own ids and not yet for parsed Markdown lists. Two fixes are known: give each parsed Markdown list its own id, which plan panel round 1 cut for its cost to AI rewrites, paste joins and parse equality, or start an insert's search at its neighbor's place. Typing after a mark toggle does 15 compares where the zero-work line allows none, for the reason the next item gives. Step 3.2 keeps its approved wording in Steps. owner: zbeyens. stop: the restart-runs iteration, which revisits Markdown list identity and can start an insert's search at its neighbors.
- Which changed list items keep their lane places. Plite marks a mark split as a structural change, so an item at its old path pays an order check per level lane in that commit. Typing after a mark toggle in a 10,000-item list does about 15 compares, bolding across 2,000 of its items places most of them again and rebuilds the list, and a list with 10,000 distinct levels pays 20,000 compares. An order-preserving move of a quote that holds a whole list also places all of it again, and the pass for shifted items saves only a constant factor over placing them. owner: zbeyens. stop: the next list iteration, with a move signal from Plite's commit or a check per run of unmoved items.
- An item shallower than its list's first item, such as indents 1, 0 and 1, has no faithful Markdown form. Markdown numbers the indent-0 item as the outer list's second item, while Plate counts it as a level of its own. owner: zbeyens. stop: the restart-runs iteration, or 2026-12-31.
- A failed index update rebuilds its own root and rethrows, so a later root in the same commit stays stale until its next structural commit, and a failed rebuild replaces the first error. No update fails by contract. owner: zbeyens. stop: the next list iteration.
- Each walk opens a closer cursor for every populated shallower level, and an `indent` of NaN, which only the transaction API can write, gives a level that no comparison orders. owner: zbeyens. stop: the next list iteration.
- Plite's snapshot `pathOf` walks the whole document for a key it has not cached, so the list index asks the before snapshot only about keys it indexed; the work counters cannot see such a walk, and only the measured probe caught the round 2 code that asked about inserted keys. owner: zbeyens. stop: a Plite snapshot index plan that makes such a lookup visible or cheap.
- Where a restart lives once items are added before it, or it is deleted or moved. Plate's Restart, a Markdown list's forced start and a Word instance's start override all sit on one item, so deleting or moving that item drops the restart and the rest continues the list before, and an item added before it does not take it over. Word applies an instance's override at whichever paragraph is first, and Google Docs keeps a restarted list restarted. Markdown's forced starts also store numbers through AI rewrites and paste joins. owner: zbeyens. stop: the next list iteration, which plans restarts that follow their run.
- The writer redraws every mounted list once a commit changes more than 1,024 numbers or a view falls 64 commits behind, so that walk grows with the other mounted lists; per-view mounted refs would write only the changed lists. owner: zbeyens. stop: step 3.2's writer line above the frame budget, or the word writer-refs.
- DOCX export takes each level's format, text and restart limit from a list's first item, so an instance that overrides the format, such as `%1)` against `%1.`, or items whose `listLevels` copies differ, export with the first item's and report `list-structure`. owner: zbeyens. stop: the restart iteration, which gives Plate instances.
- An AI rewrite that spans two lists keeps only the first in its list: the paste middleware joins only the first source list to the landing list. owner: zbeyens. stop: a list command plan, or 2026-12-31.
- A bullet-format paragraph inside a numbered Word level does not count in Plate, where MS-DOC's step list, read literally, counts it, so a number after such a paragraph can show one less than that reading. No Word run settles which Word does. owner: zbeyens. stop: a Word-written file with such an instance and its displayed numbers, or the word count-bullets.
- Word's "first paragraph of an instance" is read per instance and level, which pandoc's Word 16 file cannot tell from per instance, because its restart instance covers one level. owner: zbeyens. stop: a Word-written file with a multi-level restart instance and its displayed numbers, or 2026-12-31.
- A `numFmt` `none` level imports as a numbered list that shows its numbers, where Word shows none. owner: zbeyens. stop: a list marker plan, or 2026-12-31.
- DOCX import scans every paragraph of the document part in order, so text boxes, the fallback copies of alternate content and tracked deletions join the body's count, where Word counts each story apart. owner: zbeyens. stop: a DOCX import plan, or 2026-12-31.
- A whole insert among N lists still grows with N, because Plite's own commit does (0.31 ms at N = 10 to 2.62 ms at N = 1,000 for plain paragraphs); the list share outside the index, 0.10 to 0.24 ms, is too close to the run-to-run spread to call. The owner's flat-cost ask stays unmet for the whole insert until Plite's commit is flat. Plite's transactions also grow with the nodes they touch: removing every other item of a 20,000-item list in one transaction took 112.5 s, so step 3.2 restated its removal line to I7's and did not run the kind toggle of a 10,000-item run. owner: zbeyens. stop: a Plite commit performance plan, or 2026-12-31.
- Three www DOCX fixtures, `lists_continuing.docx`, `lists_restarting.docx` and `lists_sublist_reset.docx`, are byte-identical to pandoc's test files, and pandoc is released under the GPL, version 2 or later, while this repository is MIT. They predate this work. owner: zbeyens. stop: you confirm their license or replace them, or 2026-12-31.
