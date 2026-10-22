---
review_scopes: [list]
review_basis: [2026-10-04-list-audit-2]
verdict: pursue
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/research/decisions/list-ownership.md, docs/research/review-records/2026-10-04-list-audit-2.json, docs/research/review-records/2026-09-24-list-audit.json, packages/platejs/src/react/features/list/ListPlugin.spec.tsx, packages/platejs/src/plain-text.ts, packages/platejs/src/internal/plugin/compilePlainTextMappings.ts, packages/platejs/src/internal/plugin/compilePlateFormats.ts, packages/platejs/src/internal/plugin/pluginFormatOperation.ts, packages/platejs/src/react/components/EditorRefEffect.tsx, packages/platejs/src/react/plugin/PlatePlugin.ts, packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx, packages/platejs/src/react/utils/pipeRenderElement.internal.tsx, packages/platejs/src/react/utils/pluginRenderElement.internal.tsx, packages/platejs/src/react/internal/rendered-attributes.tsx, packages/platejs/src/static/pluginRenderElementStatic.internal.tsx, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts, packages/platejs/src/migrations/migratePlateV54.ts, packages/platejs/src/migrations/migratePlateV54Profile.internal.ts, packages/platejs/src/migrations/migratePlateV54.spec.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/transforms-text/insert-text.ts, packages/plitejs/src/core/commit.ts, packages/plitejs/src/react/hooks/use-plite-node-ref.tsx, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/platejs/src/docx/paste/lib/WordPastePlugin.ts, content/docs/(plugins)/(styles)/list.mdx, content/docs/(guides)/unit-testing.mdx]
review_upstreams: ['../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../libreoffice-core@760394bbadd6077379f9eef116e5ba87bb5cb31c', '../docxjs@191d3e0db009da578fbe4da70d55305cd8d50226', '../docx-editor@cabf6fae68167efa98eeec13ec11bdb0461fb674', '../eigenpal-docx-editor@84c46227d4ce4c4098a04dbccc4516578f2ab72d', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Lists: numbers that stay right after every edit

Status: executed; the follow-up iteration 2026-10-10-list-import-identity carries the open DOCX and Markdown gaps
Playbook: plan

Pursue, superseding `2026-10-04-list-audit-2`. Numbered lists showed wrong numbers in a mounted editor after ordinary edits, plain text dropped every number, and partial copies wrote starts that matched neither side. Phases 1 and 3 landed: the list API lost the surfaces with no job, and Shift+Tab and Enter follow the locked list laws. Phase 2 first delivered live numbers through one producer per view. Then the owner steered: "switch to the most performant algorithm for 10000items. For example N separate lists of 10 items should not affect the perf of inserting in a list. Use the most performant listing counting, with full docx support (non contiguous list items). Redesign from first principles." The redesign rebuilds Phase 2 around list identity. Each list item names its list, like a Word `numId`. A list counts only its own items, so a plain paragraph between items no longer ends a list, and two lists can interleave. Each editor keeps one index per root that updates only the lists a commit touches. After each commit, a per-view writer sets the changed numbers as the `start` of each mounted item's list element, with no React render. Restart and continue become commands and menu items. DOCX import and export carry the identity, and the phase ends only after Word round trips pass. `list` stays out of `packages/plitejs/src/core/**` and off the `authored` and `suggestions` files.

## Brief

### What will change?

Numbered lists now work like Word's: a list can continue after a note, two lists can alternate, and editing one leaves the others alone. The menu gains Restart and Continue, and Word files keep their lists, with one gap.

### What could go wrong?

Saved documents need a migration step. A top insert into a 10,000-item list takes 143 ms to show, over the 100 ms target. Markdown lists and alternating Word restarts still need the next plan.

## Teach

A numbered item in Plate is an ordinary paragraph with a list type. It stores no number. Plate counts the number when it needs one.

Today the neighbors decide which list an item belongs to. A plain paragraph between two items ends the list, so a Word list that continues past a note can't be shown, and two lists can't take turns. Every list edit recounts the whole document, and a renumber redraws each later item through React.

After the change, each item stores the id of its list, the way Word does. Plate counts each list on its own and updates only the lists an edit touches. It then writes each changed number into the page's list markup, and the browser draws the marker. Restart numbering and Continue numbering in the list menu split or join lists.

![before](artifacts/2026-10-10-list-review/teach-identity-before.svg) ![after](artifacts/2026-10-10-list-review/teach-identity-after.svg)

## Public API

List items carry an optional `listId`. Items that share it form one list, whatever blocks sit between them; an item without one belongs to its root's default list. A list imported from Word also carries `listLevels`, its level rules (start, restart level and label), copied onto each of its items. `read.ordinal(element)` and `read.ordinal(path)` keep their call and number by list identity. The copied and package wrappers keep their render-time `start={read.ordinal(element)}`; after each commit the list plugin keeps that `start` current on every mounted item.

Restart moves out of `toggle` into its own command.

```ts before
// packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx
editor.update.list.toggle({
  listRestart: 7,
  type: ListType.Numbered,
});
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx
editor.update.list.restart({ start: 7 });
```

Continue undoes a restart on the selected item; on the first item of a list, it joins that list to the nearest compatible list before it, past any blocks between them.

```ts before
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx
editor.update.list.continue();
```

The copied numbered-list menu offers both.

```tsx before
// apps/www/src/registry/components/editor/list-toolbar-button.tsx
              Upper Roman (I, II, III)
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
```

```tsx after
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

Adding `listId` and `listLevels` changes the compiled schema fingerprint, so stored documents need a new schema version. A new idempotent migration step gives them list ids at the storage boundary.

```ts before
```

```ts after
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

The static wrapper keeps its explicit start and names the list, so static HTML and the DOCX exporter can group Word lists by identity. Its `li` carries the item's indent, list id, level rules, restart, start, type and checked state, so HTML decode reads them back without counting.

```tsx before
// apps/www/src/registry/components/editor/block-list-static.tsx
<InnerList
  className="relative m-0 p-0"
  style={{ listStyleType: markerStyle, marginLeft }}
  start={listType === ListType.Numbered ? listStart : undefined}
>
```

```tsx after
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

The combined indent-and-list command leaves the docs and the plugin.

```ts before
// content/docs/(plugins)/(styles)/list.mdx
list.update.indent({ type: ListType.Bulleted });
```

```ts after
```

Custom sibling traversal leaves the plugin state, the toggle options and the exported types.

```tsx before
// packages/platejs/src/features/list/lib/BaseListPlugin.slow.tsx
const pagedListPlugin = BaseListPlugin.configure({
  initialState: {
    getSiblingListOptions: {
      getNextEntry: ([, path], state) => {
```

```tsx after
```

The v54 migration's frozen sibling policy leaves with it, because the live editor can no longer number the way that policy assumed.

```ts before
// packages/platejs/src/migrations/migratePlateV54.ts
export type MigratePlateV54Options = Readonly<{
  /** Frozen v53 list sibling policy used to interpret historical numbering. */
  list?: MigrationListSiblingOptions;
}>;
```

```ts after
```

The public family-expansion read leaves; transfer keeps the private helper.

```tsx before
// packages/platejs/src/features/list/lib/BaseListPlugin.slow.tsx
expect(editor.read.list.expandItemsWithChildren([parent])).toHaveLength(2);
```

```tsx after
```

`api.getSequenceSiblingOptions`, `api.isSequenceBoundary`, `read.getNext` and `read.getPrevious` have no call site outside `BaseListPlugin.ts` and leave the public surface with the types `GetSiblingListOptions`, `ListSiblingState`, `IndentListOptions`, `MigrationListSiblingOptions` and `PlateV54Migration`'s options parameter. `read.ordinal`, `read.isActive`, and `update.toggle`, `outdent`, `clear`, `insert` and `upsert` stay: Vision names `ordinal` as the presentation read (`docs/vision/plate.md:1269-1271`) and `insert`, `upsert` and `toggle` as the plugin command shape (`:836-850`); `outdent` is the list exit the keys run, and `clear` removes list semantics from a mixed selection of list kinds, which `toggle` cannot. `toggle` keeps `listStart`, which the numbered input rule writes.

## What other editors do

| Delta | Editor | List model | Where the number comes from |
| --- | --- | --- | --- |
| added | LibreOffice Writer | A list id on every numbered paragraph; one `SwList` per id holds a numbering tree | Cached numbers per list, a "last valid child" boundary, and demand-driven revalidation of that list's suffix only (`sw/inc/SwNumberTree.hxx`, `sw/source/core/doc/list.cxx`) |
| added | docx-preview (docxjs) | Word paragraphs with `numId` and `ilvl` | One CSS counter per (`numId`, level), started at `start - 1` and incremented in `:before`; other paragraphs leave it alone (`src/html-renderer.ts`) |
| added | SuperDoc (`docx-editor`) | Word `numId` and `ilvl` | A forward pass whose counters are shared per abstract numbering definition and scoped to the concrete `numId` when a start override applies (`word-layout/src/numbering-manager.ts`) |
| added | eigenpal docx editor | Word `numId` and `ilvl` | Nine counters per `numId` over a whole-story pass; plain paragraphs skip without clearing (`core/src/layout/list-counters.ts`) |
| added | CKEditor 5 | Flat blocks with `listItemId`, `listIndent` and `listType` | Contiguous only: an id groups the blocks of one item, and a list ends at the first other block |

Word, LibreOffice and the DOCX renderers number a list by identity and skip paragraphs that are not list items. Only LibreOffice keeps an incremental per-list structure. The editors without Word semantics number contiguous runs. Plate takes the identity model and LibreOffice's per-list locality. The browser draws the marker from the list element's `start`, which Plate keeps current, because pure CSS counters miscount when virtualization or pagination leaves items unmounted.

## Document shape

A list that continues past a note shares one id. Today the second run restarts unless it stores a start.

```json before
[
  { "type": "p", "listType": "numbered", "indent": 1, "children": [{ "text": "Mix" }] },
  { "type": "p", "children": [{ "text": "Note: use cold water." }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listStart": 2, "children": [{ "text": "Bake" }] }
]
```

```json after
[
  { "type": "p", "listType": "numbered", "listId": "steps", "indent": 1, "children": [{ "text": "Mix" }] },
  { "type": "p", "children": [{ "text": "Note: use cold water." }] },
  { "type": "p", "listType": "numbered", "listId": "steps", "indent": 1, "children": [{ "text": "Bake" }] }
]
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `listId` property, the counting rule, the per-root list index and the document reader | Plate | `platejs` (`features/list`, private modules, not in the barrel) | `ListPlugin` owns list schema, numbering and format mappings (`docs/vision/plate.md:1327-1329`) |
| The join rule, its correction, and the `restart` and `continue` commands | Plate | `platejs` (`features/list`) | Commands own identity; counting never infers it |
| Per-view writer that keeps each mounted item's `start` current after commits | Plate | `platejs/react` (`react/features/list`) | Numbers are dense derived presentation; the doctrine change widens the direct-host exception (`docs/vision/plate.md:314-328`). It finds hosts through the view's `api.dom` and each host's `data-editor-node-key`, so Plite gains nothing |
| Restart and Continue in the numbered-list menu | Plate copied UI | `apps/www/src/registry` | Product UI belongs in copied registry source (`docs/vision/plate.md:86-92`) |
| `migrateListIdentity` | Plate | `platejs/migrations` | Persisted documents convert at the storage boundary; corrections never run on load (`artifacts/2026-10-10-list-review/redesign/premises-a3.log`) |
| DOCX numbering import and identity-keyed export | Plate | `platejs/docx` (`docx/import`, `docx/export`) | Mammoth drops `numId`, starts and overrides; export grouped by kind and depth |
| Identity in HTML, Markdown, plain text and Word HTML paste | Plate | `platejs` (`features/list`, `markdown`, `docx/paste`) | One identity rule behind every codec |
| Attribute subscription by the element's stable key | Plate | `platejs/react` (`react/utils`) | A woken element that moved re-subscribed under the key at its old path |
| Slice model view in the HTML and plain-text encoders | Plate | `platejs` (`lib/plugins/html`, `internal/plugin`) | The encoders paired the full document with slice-relative paths |
| Root Shift+Tab | Plate | `platejs` (`features/list`) | The list owns ⇥ and ⇤ before generic indent (`markdown-editing-spec.md:728-732`) |
| Legacy container JSX tags | Plite | `plitejs/testing` | Test vocabulary for the deleted container model |

## Hard cuts and app migration

Deleted with no alias in Phase 1: `update.indent` and `IndentListOptions`; `read.expandItemsWithChildren`; `read.getNext` and `read.getPrevious`; the `api` group (`getSequenceSiblingOptions`, `isSequenceBoundary`); the `getSiblingListOptions` plugin state and `ToggleListOptions` field, `BaseListPluginState`, `GetSiblingListOptions` and `ListSiblingState`; `MigratePlateV54Options` and `PlateV54Migration`'s options parameter, with the internal `MigrationListSiblingOptions`; and the `hli`, `hlic`, `hol` and `hul` test JSX tags in `plitejs/testing`.

Callers that break, from the caller census and the blast-radius run in step 1.1: `BaseListPlugin.spec.tsx` (the `update.list.indent` cases at lines 715, 746 and 755), `BaseListPlugin.slow.tsx` (the page-container traversal and the custom-traversal cache case), `migratePlateV54.spec.ts` (the `migrationList` helper parameter and the two page-traversal cases at lines 912 and 982), `content/docs/(plugins)/(styles)/list.mdx:94,125` and `list.cn.mdx:105`, `content/docs/(guides)/unit-testing.mdx:87` and its twin, `apps/www/api-reference.config.json:329,357,406,1060-1062`, and the generated `api-reference-manifest.json` and `public/r/*.json`. No copied registry component calls a removed member, and no docs page teaches the migration option; the finished plan `docs/plans/2026-09-16-persistence-immutable-conversion.md:214` still shows `migrateV54(context, { list })` as history.

`update.indent` made a block a list item of a kind one level deeper in one step; no single surviving command does that. An app makes blocks list items with `toggle` and deepens them with Tab or `indent.increase`. An app that configured `getSiblingListOptions` has no replacement. An app that passed a `list` policy to `migrateV54` drops it.

The redesign cuts `toggle`'s `listRestart` option: `update.restart` replaces it, and the only caller is a spec. It also changes numbering behavior:

- A plain paragraph, a heading or a bullet between items of one list no longer ends it; the numbering continues past it. Restart numbering ends it on purpose.
- Numbered items without `listId` in one root form one list. Persisted documents get ids from `migrateListIdentity`, which an app registers as its next schema step; until it runs, separate id-less lists in one root count as one. Hand-written values with more than one list need ids.
- Taking a middle item out of a list, by Backspace, Enter on an empty root item, outdent or toggle, keeps the following items in the same list, so they count on.
- Word HTML paste stops writing forced restarts at identity boundaries; the pasted ids carry the interleaving.
- Static and HTML output write `data-list-id` on each list element.
- The schema gains `listId` and `listLevels`, which changes its compiled fingerprint: an app bumps its schema version, registers the previous fingerprint and adds `migrateListIdentity` as that version's step.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A list continues past a plain paragraph, a heading or a bullet; two interleaved lists | Numbered by identity | Headless and React DOM tests on both render paths; Chromium screenshot in the www list demo |
| Restart numbering and Continue numbering | Restart writes a forced number; Continue removes it, or joins a list from its first item to the previous compatible list | Command specs, including Restart then Continue; Chromium run through the numbered-list menu |
| Typing a number that continues the list before a note | Joins that list | Input-rule spec |
| Inserting into one list among N lists | Index work stays bounded by that list; the whole insert still grows with the root | Scale lines I1, I2' and I6 at N = 10, 100 and 1,000; the Report line |
| Top insert or start change in a 10,000-item list | One React render (the new item); every other number is written into its list's `start` | Render counts; Chromium frame time on a production bundle, 72 ms over a plain insert (D1', accepted below its frozen line); the comparison with the old writer (D6) is open work |
| Typing, mark toggles, plain-paragraph edits anywhere | No numbering work and no list render | Scale line I8 and work counters |
| Virtualized and paginated views | A mounted item shows its number at first paint and after each edit; unmounted items cost nothing | Scale line D7; Chromium run in a virtualized 10,000-item list on the dev harness |
| Two views, SSR, hydration, host replacement, detach and a transition render | Every mounted view's lists stay current; SSR and static output carry the number | React DOM lifecycle tests; `renderToString` test |
| Lists in a content root | Numbered correctly; each list edit there costs time proportional to that root | React DOM content-root test; named limit in Open work |
| Taking a middle item out of a list | Following items count on | Headless tests for Backspace, empty-item Enter, outdent and toggle |
| Pasting list items next to a compatible list | They join it | Clipboard test through `writeDataTransferFragment` and paste |
| A kind change, an HTML round trip or a migration that hides a start | The start stays latent and shows again after the edit that makes its item first | Headless tests that apply the exposing edit |
| Word documents | Lists that continue past paragraphs, interleave, restart, override a start, never restart a level or start a level elsewhere keep their membership, level rules and numbers through import, an edit, export and re-import; two restarted instances of one definition that interleave keep their imported numbers as restarts | DOCX round trips against SuperDoc's numbering as the pinned oracle; the shared-abstract case is inferred until a Word check |
| Word HTML paste of interleaved lists | Identity from `mso-list`, no forced restarts | `WordPastePlugin.spec.ts` interleaved case |
| Markdown round trip | Each Markdown list stays in the root's default list and opens with a forced start, so an edit there moves pointers across every Markdown list; serialize starts each run at its number | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `EDIT-LIST-START-MD-401` |
| Migration of stored documents | Same numbers before and after `migrateListIdentity`, and running it twice changes nothing | Migration oracle test |
| Shift+Tab on a root list item | No change and no undo step; deeper selected blocks still outdent | Keyboard-pipeline test with history read; Chromium keyboard run |
| Shift+Tab on a root list item inside a blockquote | The item leaves the list and the quote in one press (`EDIT-BQ-LIST-STAB-001`) | Keyboard-pipeline test tagged `EDIT-BQ-LIST-STAB-001` |
| Enter at the end of a checked task | The new task stays checked | Headless spec tagged `EDIT-TASK-ENTER-001`; Chromium keyboard run |
| Plain text and HTML of a whole document or a copied part | Each numbered item writes its derived number within what was copied | `plain-text.spec.ts` and HTML clipboard cases |

## Main changes

- Each editor runtime keeps one list index per root, keyed by node key: an item map and, per list id, its items in document order. A commit that changes structure or properties reads its changed and presence node keys and skips every key whose list facts and order are unchanged, so mark edits and leaf splits cost nothing. It removes the remaining items, places each one that is still a list item by binary search on document order, and recounts each touched list. A batch larger than a quarter of a list filters or merges it in one pass, and a single item finds its place by binary search on document order, a listed container before the items it holds. Text, mark and selection commits do no list work. The index builds on the first read of a root.
- The counting rule follows Word's level rules. In one list, an item resets each deeper level whose restart level it reaches, which by default is every deeper level. A numbered item takes its `listRestart`, opens its level at its `listStart`, the list's level start or 1, or counts on. Bulleted and task items reset deeper levels and do not count. While `listRestart` is present, a `listStart` on the same item stays latent instead of being deleted, and so does every start on an item whose kind changes.
- The React `ListPlugin` drops its per-view producer. After each React commit that changes structure, properties or a replace, the view's writer reads the index's change log per root. Up to 1,024 changed keys, it writes each one's `start` through `api.dom.resolveDOMNode` for its own root and by `data-editor-node-key` for a content root it renders. With more keys, or when the log lost track, it walks the mounted `ol`s and reads each host's key. The wrappers render the first `start` for SSR and hydration.
- One join rule assigns identity, visiting at most 64 blocks. A new item takes the id of a compatible item at its depth, walking back over deeper blocks and stopping at any same-depth block that is not compatible. Failing that, when the first shallower block before it is a list item whose list has no item at this depth after it, the new item takes that list's id. Failing both, it gets a fresh id. Every write that gives an item an id also copies that list's `listLevels`. A correction applies the rule to list items an edit creates without an id. Enter, Tab and Shift+Tab keep the id, and taking a root item out of a list drops it.
- DOCX import reads `numbering.xml`, styles and each paragraph's `numPr` in its own module beside Mammoth. Every instance of a definition joins that definition's list, its items carry the instance's level rules, and where Plate's count would differ from Word's an item keeps Word's number as `listRestart`. Export maps each list to one Word definition, opens an override instance where a shown number differs from Word's count, and reports `list-structure` and `list-start` losses.
- Encoders number the content being encoded with the same counting rule. The HTML and plain-text encoders give format mappings the slice itself as the document when they encode a slice.
- Plate's element renderer subscribes each element to its published attributes by its stable node key instead of the key at its rendered path.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which item to review | Lists, which touch nothing the suggestions work is editing | Neutral naming, the queue's first pick, which edits the same clipboard files | naming | small |
| What happens after the verdict | Plan and build the numbering fix now | Stop after the review and wait | hold | big |
| Remove the unused list options and the migration's numbering policy | Delete them with no replacement (look) | Keep them | keep-list-api | big |
| How lists decide which items belong together | Each item stores its list's id, as in Word: lists continue past notes and can take turns (look) | Neighbors decide, and a note ends the list | adjacency | big |
| How changed numbers reach the screen | Each list's start number is rewritten on the page, the faster of the two direct ways in Chrome (look) | A style variable on each item, about a third slower | style-variable | big |
| Taking an item out of the middle of a list | The items after it keep counting, as in Word and Google Docs; Restart numbering splits them (look) | The items after it start again at 1 | split-on-exit | big |
| Stored documents | Ship a migration step that gives each old list its own id; apps add it as their next schema step (look) | No step, so separate old lists count as one | no-migration | big |
| Word's level rules | Kept on each imported list's items and used for numbering; labels like 1.2. are kept but show plain numbers (look) | Also draw compound labels, with marker text instead of the list's start number | word-labels | big |
| Restart and continue | Commands plus two menu items; Continue undoes a restart or joins a list from its first item | No commands; split and join lists only by editing | no-list-commands | small |
| Items without a list id | They share one default list, for hand-written values | Every list item must carry an id | require-id | small |
| Pasting list items next to a list | They join that list | They stay a separate list | paste-separate | small |
| Lists in custom content roots | Numbers stay right; edits there cost more on big roots until Plite fixes it | Hold the plan for the Plite fix | hold-roots | small |
| Numbers in a partial copy | Count from the first copied item, the same in HTML and plain text | Keep the source numbers, which needs the copy to remember where it came from | source-numbers | small |
| Enter after a checked task | The new task stays checked, as the editing law says (look) | The new task starts unchecked, and the law changes | unchecked | small |
| Shift+Tab on a top list item | Nothing changes and no undo step | The item leaves the list | leave-list | small |
| Lists without the copied kit | Keep plain numbered list markup in the package | Remove it, so only copied UI draws lists | bare | small |
| A heading or bullet inside a numbered list | The numbers keep counting past it, as in Word | They start again, as today | restart-at-format | detail |
| Toggling the kind of one item in a mixed list | Convert the item plus the contiguous items of its list, kind and depth; toggling back converts the run the item joined, as Google Docs does (look) | Convert only the selected items, as Word does | toggle-selection | small |
| Whether demo values carry list ids | Keep them without ids; none numbers differently on the default list (safe) | Give every multi-list value ids | demo-ids | small |
| The DOCX `lvlRestart` oracle disagreement | Follow ECMA-376 and eigenpal: a level restarts only after a level at or above its `lvlRestart` (look) | Follow SuperDoc, which also restarts after the level below it | superdoc-restart | small |
| The speed check against the old number writer (D6) | Skip it; the production check of the new writer (D1') stands in, and D6 waits in Open work (look) | Hold the plan until the old tree runs in a browser again | rerun-d6 | small |
| Speed target for renumbering 10,000 items | Count only the 72 ms lists add on top of a plain insert; the whole frame takes 143 ms, and a plain insert alone takes 71 ms (look) | Hold the whole frame to 100 ms, which the page misses | strict-frame | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| List membership | Adjacency: neighbors decide, a plain block, a heading or a kind change ends a list | Stored `listId` is the only boundary besides an explicit restart; an id-less item joins its root's default list; a Word list's level rules are copied onto its items as `listLevels` | `BaseListPlugin` schema | The owner's steer: Word lists continue past paragraphs and interleave | `migrateListIdentity` for stored documents; join rule and correction in commands | Headless and DOM specs; migration oracle | Stored documents that skip the step count their separate lists as one | rearchitect |
| Numbering structure | Per-root `children` cache, an adjacency gate and a cache carry | Per-root index of lists, eager suffix recount per touched list | `listIndex.internal.ts` | The gate missed batched edits, and any list edit ran a full pass over every numbered item | None | Property test against a fresh build and an independent oracle; I-lines | Content roots pay O(root) per list edit until Plite carries their index | rearchitect |
| Live numbering delivery | One producer per view through `render.useViewElementAttributes`; every renumbered item re-renders | Render-time `start` seed, then a per-view writer that sets `start` on each mounted host's list element after React commits | React `ListPlugin` | 10,003 renders for a 10,000-item top insert; in Chromium, `ol.start` writes took 85.4 ms against 133.4 ms for a custom property on realistic items | None: wrappers keep their seed | DOM render counts; Chromium D-lines against the incumbent; lifecycle tests | React and the writer both set `start`; the writer runs after React commits | rearchitect |
| View-attribute doctrine | The direct-host exception covers private, view-local interaction state | Also dense derived presentation owned by one feature's index, with the same proofs | `docs/vision/plate.md:314-328` | Numbers are dense and document-derived | `best-api repair` | Teaching sweep | Another feature may lean on the wider exception | rearchitect |
| Identity assignment | None; adjacency | One join rule, at most 64 blocks, in toggle, input rules, insert, paste and a correction for edit-created items; `restart` and `continue` commands | `listIdentity.internal.ts`, `BaseListPlugin` | Counting never infers identity; without commands a user cannot split or join lists | Copied menu items | Command and correction specs; Chromium menu run | A collaborative merge can leave two adjacent lists, shown 1, 1 as in Word | rearchitect |
| Latent starts | The correction, toggle's kind change, HTML decode and the v53 migration delete starts that do not apply | Precedence everywhere: `listRestart` wins and `listStart` stays latent | `BaseListPlugin`, `migratePlateV54Profile.internal.ts` | Inactive intent is not derived state (`docs/vision/plate.md:690-698`) | None | Tests that apply the edit exposing each latent start | None found | cut |
| Attribute subscription key | Key looked up at the element's rendered path | The element's stable node key | Plate React element renderer | A moved item stopped waking: B showed 3 against 7 | Every view-attribute publisher | React DOM test on both paths | None found | keep |
| Slice model view | Full document with slice-relative paths | The slice as its own document | HTML and plain-text encoders | Partial copies wrote HTML starts 1 and 4 | None | HTML and plain-text slice specs | A mapping that relied on the full document now sees the slice | keep |
| Plain-text numbering | `listRestart ?? 1` | Shared counting rule | `BaseListPlugin` plain-text mapping | One rule behind every codec | None | `plain-text.spec.ts` | None found | keep |
| Codec identity | HTML decode scans previous lists; Markdown decode writes `listRestart` for adjacent lists; Word paste writes forced restarts | Fresh ids per source list and sublist, remapped per conversion, with a token for the default list; Word paste carries `mso-list` identity | `BaseListPlugin`, Markdown, `WordPastePlugin` | One identity rule | None | Codec specs, `EDIT-LIST-START-MD-401` | A list continued past a paragraph re-imports from Markdown as two lists with the same numbers | rearchitect |
| Markdown grouping | A deeper plain paragraph splits a run and the next list restarts at its stored start | Each emitted run starts at its derived number | Markdown serializer | Identity makes the run's number known | None | `standardList.spec.ts` | None found | rearchitect |
| DOCX numbering | Export groups by kind, depth and style; import drops `numId`, starts and overrides through Mammoth | Import reads `numbering.xml` and `numPr` into identity, `listLevels` and restarts; export maps each list to one `num` and each restart to an override `num` | `platejs/docx` | The owner asked for full DOCX support; the DOCX session agreed the exporter keys on the id | The static wrapper emits `data-list-id` | Round trips that compare membership and level rules after re-import | Compound labels draw as plain numbers; the shared-abstract mapping is inferred until a Word check | rearchitect |
| Custom sibling traversal | State, toggle option, two types | None | — | No Vision job; pagination is a view variant | Slow spec, docs, manifest | Typecheck, specs, teaching sweep | Outside apps that configured it break | cut |
| v54 migration list policy | `list` option | None; `migrateV54` stays frozen and `migrateListIdentity` assigns ids as its own step | `platejs/migrations` | Its only use kept the migration in step with a removed live traversal; a v54 step cannot reach documents already stamped 54 | Migration spec, docs | Migration oracle | Outside callers that passed it break | cut |
| `update.indent` | Public command | None | — | No caller; Vision names no job | Docs, specs | Typecheck, teaching sweep | Outside callers break | cut |
| `expandItemsWithChildren`, `getNext`, `getPrevious`, `api` group | Public | Private or deleted | `BaseListPlugin` | Internal use only | Slow spec | Typecheck | None found | cut |
| Legacy JSX tags | `hli`, `hlic`, `hol`, `hul` | None | `plitejs/testing` | Deleted container model; no use | `unit-testing.mdx` | Typecheck, sweep | Outside tests that used them break | cut |
| Root Shift+Tab | Drops `indent`, keeps `listType`; second press claims success | A list shortcut outdents the selected blocks that can outdent and leaves root list items; inside a blockquote it takes a root list item out of the list and the quote | `BaseListPlugin` | List owns ⇤; `EDIT-BQ-LIST-STAB-001` failed | None | Keyboard tests with history, tagged blockquote case | The toolbar Outdent still drops `indent` | rearchitect |
| Enter split cleanup | Wrapper re-unsets starts | Schema `split: 'drop'` only | `BaseListPlugin` schema | Duplicate | None | Existing specs | None found | cut |
| Task Enter at the end | New task unchecked | New task keeps `checked` | Split | Locked `EDIT-TASK-ENTER-001`; Milkdown keeps it | None | Tagged spec | Users used to unchecked continuations | cut |
| Package default wrapper | `ol`/`ul`/`li` with `start` | Keep; the writer keeps its `start` current | React `ListPlugin` | Package-only consumers (`ListPlugin.spec.tsx:29`, `plate-schema-descriptors.tsx:512`) | None | `ListPlugin.spec.tsx` | None | keep |

## Steps

Every step names its proof. The build runs in three phases, each ending with a keep or revert decision.

### Phase 1: cut the list API to its jobs

- [x] 1.1 Run `pstack:blast-radius` on every removed member and type, and a delete-and-typecheck spike in a detached worktree at the build base. Proof: the spike's typecheck log lists exactly the callers this plan names. Done: `artifacts/2026-10-10-list-review/spike/platejs-test-typecheck-a1.log` against `artifacts/2026-10-10-list-review/spike/base-test-typecheck-a1.log`.
- [x] 1.2 In `BaseListPlugin.ts`, delete `update.indent` and `IndentListOptions`, the `api` group, `read.expandItemsWithChildren`, `read.getNext` and `read.getPrevious` (the toggle calls module-private functions instead), and `getSiblingListOptions` (`initialState`, `BaseListPluginState`, the `ToggleListOptions` field, `GetSiblingListOptions`, `ListSiblingState`). `deriveListOrdinal`, `getListOrdinal` and `getDocumentListOrdinal` take the heading type only. Proof: `pnpm --filter platejs typecheck` and the list specs pass.
- [x] 1.3 In `migratePlateV54.ts` and `migratePlateV54Profile.internal.ts`, delete the `list` option, `MigrationListSiblingOptions` and the options parameter; the migration finds sequence starts with the live rule, as it already does without the option. Replace the two page-traversal cases with one preservation case: a numbered item that starts a page container keeps its migrated start, and the live editor shows the number v53 showed. Proof: the case passes before and after; it fails with the removed cross-page policy planted back into the migration (`mutate.mjs`). No type test pins the removed parameter, because re-adding one is an API change, not a defect (decision log).
- [x] 1.4 Delete the `update.list.indent` spec cases, and in `BaseListPlugin.slow.tsx` delete the page-container traversal case and rewrite the 10,000-item cache case without custom traversal. Proof: `bun test` of both list spec files passes.
- [x] 1.5 Delete `hli`, `hlic`, `hol` and `hul` from `packages/plitejs/src/testing/jsx.ts`. Proof: `pnpm --filter plitejs typecheck` passes.
- [x] 1.6 Through `plate-docs`, remove `update.indent` from `list.mdx` and `list.cn.mdx` and the legacy tags from `unit-testing.mdx` and its twin. Proof: the docs checks `plate-docs` names pass.
- [x] 1.7 Through `best-api repair`, run `node tooling/scripts/teaching-sweep.mjs` on every removed name and remove the removed entries in `apps/www/api-reference.config.json`. Write no generated registry or API reference file: another session has them staged, so their regeneration waits in Open work, and this step checks the regenerated output in a scratch worktree only. Proof: the sweep lists no live hit outside generated files, and a scratch-worktree `build:registry` plus `api-reference` run shows only this plan's names removed.
- [x] 1.8 Phase exit: keep when 1.2 to 1.7 pass; otherwise revert the phase. Proof: decision row. Done: the phase 1 exit row, frozen at `8c1a2603`.

### Phase 2: count and deliver numbers by list identity

The first Phase 2 built one producer per view. The owner's steer replaced its gate, cache carry and producer. The approved steps stay below as written. Steps 2.11 and later replace 2.2, 2.3 and 2.5, keep 2.4, 2.6 and 2.7, and replace 2.8 and 2.10. The owner's ask for full DOCX support outranks the architecture reference's three-phase limit, so DOCX import and export sit inside this phase.

- [x] 2.1 Add failing tests. In `ListPlugin.spec.tsx` (package wrapper on the fast path) and `apps/www/src/registry/components/editor/list.spec.tsx` (copied `ListKit` on the component path), cover an insert at the top, a `listStart` change, `listType` set on a middle paragraph, a plain paragraph inserted mid-run, numbered A, a deeper plain paragraph and numbered B followed by an insert at the top and then a start change on the new first item, a numbered list inside a table cell, and two `EditorContent` views. In `plain-text.spec.ts`, cover a run starting at 3, a partial copy through `writeDataTransferFragment` whose HTML and plain text both number from the first copied item, and a numbered list in a content root. Proof: `proof-worktree.mjs --expect-fail` at the build base fails each case with its own title.
- [x] 2.2 Add a private `listOrdinals` module in `features/list/lib` with `affectsListOrdinals(commit, root)`, the carried cache and the entries collector for one root. Proof: a unit spec shows that text, selection, a bold toggle, the leaf split from typing after a mark toggle, and Enter or Backspace among plain paragraphs away from any list return false, including Enter before a gap of 5,000 deeper plain paragraphs that ends in a plain barrier, within 64 sibling visits; that a list-fact change on an element, an element insert, remove or move that a later item's walk can reach, a `setValue` that changes only `listStart`, and a remote-style replace return true; and that a `listStart` change in a named root returns true for that root and false for the main root. Superseded by 2.13.
- [x] 2.3 Carry the cache in `BaseListPlugin`'s `on.commit` when the gate returns false for every root, and move each replaced element's cached number to its replacement when their list facts match. Proof: in the scale probe, the bold row on the last of 10,000 items and line 7's mixed cohort read a constant number of nodes per keystroke. Superseded by 2.13.
- [x] 2.4 In `pluginRenderElement.internal.tsx` and the fast path in `pipeRenderElement.internal.tsx`, subscribe to published attributes with the element's stable node key. Proof: the 2.1 case with the deeper plain paragraph passes on both paths, and the existing view-attribute specs (`BlockPlaceholderPlugin`, `NavigationFeedbackPlugin`, `rendered-attributes`) still pass.
- [x] 2.5 In the React `ListPlugin`, add `render.useViewElementAttributes` built on `useEditorRuntimeState(view, collect, { shouldUpdate, equalityFn })` with the view's root. Proof: the 2.1 live cases pass on both paths. Superseded by 2.15.
- [x] 2.6 In `encodeCompiledHtml` and `serializePlatePlainText`, build the format model view from the content being encoded, its own roots and its own paths. Proof: the 2.1 partial-copy and content-root cases pass, and the HTML, plain-text, Markdown and list specs still pass.
- [x] 2.7 Write each numbered plain-text marker from `getDocumentListOrdinal`. Proof: the 2.1 plain-text cases pass. Done: `artifacts/2026-10-10-list-review/build/phase2-specs-a2.log`.
- [x] 2.8 Rerun the scale contract on the final production path through `benchmark`. skip: superseded by 2.23, which reruns the identity budget on the final path.
- [x] 2.9 Through `verify`, prove it in Chromium. In the www list demo, insert a numbered item above a run and type "5. " on a new first item, and screenshot the numbers after each. Proof: inspected screenshots. Done: `artifacts/2026-10-10-list-review/browser/2.9-proof-a1.log`, `2.9-after-insert.png` and `2.9-after-start.png`.
- [x] 2.10 Phase exit for the first Phase 2. skip: superseded by 2.25, the redesigned phase's exit.
- [x] 2.11 Add failing tests, each titled by its case, in `listIndex.internal.spec.ts`, `BaseListPlugin.spec.tsx`, `ListPlugin.spec.tsx`, the copied `list.spec.tsx`, the codec specs and the migration specs. Cases:
  - a list continues past a plain paragraph, a heading and a bullet;
  - interleaved lists A1, B1, A2, B2 show 1, 1, 2, 2;
  - numbered items nested under bulleted items of one list restart after each bullet;
  - two Markdown sublists under one item keep their own starts;
  - id-less items form the root's default list, and HTML keeps it one list;
  - the `batched-a1` reproduction numbers right;
  - taking a middle item out by Backspace, empty-item Enter, outdent and toggle keeps the next items counting;
  - `restart` and `continue` from the commands and from the copied menu, Restart followed by Continue on the same item, and Continue disabled on the last item of an interleaved list;
  - toggling one item of a mixed list to bulleted and back keeps the other items' kinds;
  - Word level rules: a never-restarting level with a default-restart level below it (levels 1, 2, 3, 2, 3 show 1, 1, 1, 2, 1), and a level start that survives deleting the run's first item, Tab and Shift+Tab;
  - typing a number that continues the list before a note joins it;
  - list items pasted next to a compatible list join it;
  - an item an edit creates without an id gets the join rule's id;
  - a kind change, an HTML round trip of a bulleted item, a v53 forced-plus-conditional start and v53 starts on a bullet and a task each keep the latent start, and the edit that makes it apply shows it;
  - a mark toggle and the first typed character inside a list item recount nothing;
  - a top insert into 10,000 items renders only the new item, and every mounted `ol` start equals an independent oracle that never reads the index;
  - two views, SSR, hydration, host replacement, detach and a commit during a transition render;
  - a content-root list.

  Proof: `proof-worktree.mjs --expect-fail` at the build base fails each case with its own title.

  Done: `artifacts/2026-10-10-list-review/build3/base-211-a1.log` and `artifacts/2026-10-10-list-review/build3/base-211-a2.log` fail every case at the build base by its title. The exceptions are the new-module specs, which fail at load and are proven by the mutants in `artifacts/2026-10-10-list-review/build3/mutate-identity-run.out`, and the Markdown sublist case, which the adjacency base already passed and which now guards the identity parse. Deviations: the mixed-toggle case asserts only the first toggle, because the run rule in 2.14 makes the toggle back convert the bulleted run the item joined. The copied menu is proven in Chromium under 2.24, and Continue stays enabled.
- [x] 2.12 In `BaseListPlugin.ts`, add the `listId` element property (a string that splits with its item and survives type change), the `listLevels` element property (per level: `start`, `restartAfter`, `label`; it splits with its item), and one shared `LIST_FIELDS` list that toggle, outdent, clear and unset use. Replace every deletion of an inactive start with precedence: the correction, toggle's kind change, and HTML decode on non-numbered items. Proof: the 2.11 latent-start cases pass, and `pnpm --filter platejs typecheck`.

  Done: `artifacts/2026-10-10-list-review/build3/typecheck-platejs-a2.log` and `artifacts/2026-10-10-list-review/build3/list-specs-a1.log`.
- [x] 2.13 Add `listIndex.internal.ts`: `readListFacts`, `countList`, the per-root index with its item map and lists, `applyListCommit`, the lazy build and the document reader for encoders. `applyListCommit` skips candidates whose list facts and order are unchanged, removes the rest, places items by binary search, recounts each touched list whole with the list's `listLevels`, rebuilds a list in one filter-and-merge pass when a batch touches more than a quarter of it, and records a per-root delta. Point `read.ordinal` at it, and delete `listOrdinals.internal.ts` with its gate, cache carry, collector and adjacency walk. Proof: a property test of 1,000 seeded runs of multi-operation transactions (insert, remove, batched replace, move, group move, container move, indent, kind, start, restart, toggle, paste, undo and remote apply). After each step the incremental index must equal a fresh build and an independent oracle written from Word's rules without `countList`. A `mutate.mjs` mutant that numbers every item 1 must fail it. The 2.11 headless cases also pass.

  Done: the mutant that numbers every continuing item 1 fails the property test (`artifacts/2026-10-10-list-review/build3/mutate/count-every-item-one-a1.log`).
- [x] 2.14 Add `listIdentity.internal.ts` with the join rule (at most 64 blocks visited), its correction, `restart` and `continue`, and route toggle, the input rules, `insert`, `upsert`, outdent, clear and transfer landing through it. Every write that gives an item an id copies that list's `listLevels`. Toggle on one item changes the selection plus the contiguous items of the same id, kind and level. Add `update.restart({ at?, start? })`, which writes `listRestart`, and `update.continue({ at? })`, which removes a restart from the selected item or, on a list's first item, moves the rest of that list onto the nearest previous compatible list's id and levels; delete toggle's `listRestart` option. The numbered input rule joins the previous compatible list when the typed number continues it. A pasted source list that lands next to a compatible list takes that list's id, and every other pasted list gets a fresh id. Through `plate-ui`, add Restart numbering and Continue numbering to the copied numbered-list menu with its registry changelog entry. Proof: the 2.11 command, menu, input-rule, correction and paste cases pass, and `EDIT-LIST-START-ENTER-402`, `EDIT-TASK-ENTER-001` and `EDIT-BQ-LIST-STAB-001` stay green.

  Done: `artifacts/2026-10-10-list-review/build3/list-specs-a1.log`, plus the join-rule mutant in `artifacts/2026-10-10-list-review/build3/mutate/join-always-fresh-a1.log`. The menu items are proven in Chromium under 2.24.
- [x] 2.15 Delivery. In the React `ListPlugin`, compose each numbered item's host ref through Plate's element render path, without a public API, so each view keeps a map from node key to the item's mounted `ol` and sets its `start` from the index on attach. After each React commit, the view's writer walks the deltas accumulated since its last run, or the map when that is smaller, and sets `start`. Delete the producer and `sameListOrdinalEntries`. The copied and package wrappers keep their `start={read.ordinal(element)}` seed. `block-list-static.tsx` adds `data-list-id`. Proof: the 2.11 DOM, lifecycle, two-view, content-root and SSR cases pass on both render paths.

  Done: `ListPlugin.spec.tsx` covers SSR, hydration, host replacement, detach, a transition and a content root. `ListPlugin.slow.tsx` checks a top insert into 10,000 items against a list-free control and an oracle (`artifacts/2026-10-10-list-review/build3/list-10k-dom-a1.log`). The copied wrapper's interleaved and table-cell cases pass in `list.spec.tsx`. Deviations: the writer finds hosts through the view's `api.dom` and each host's `data-editor-node-key`, not through a composed host ref. It walks nested content-root views, which Plate's `afterEditable` slot never reaches. The 2.4 subscription by stable key stays: a diff panel found that reverting it left rendered-attribute publishers on a stale path after an insert.
- [x] 2.16 Through `best-api repair`, widen the direct-host exception in `docs/vision/plate.md:314-328` to dense derived presentation owned by one feature's index, with the same proofs, and fix every artifact the teaching sweep finds still teaching the old shape. Proof: `teaching-sweep.mjs` lists no live hit.

  Done: `docs/vision/plate.md` now admits dense presentation derived from a feature's own index, reached through the host ref or the view's `api.dom` lookups. The writer uses `api.dom.root` and `api.dom.resolveDOMNode`, and reads each host's `data-editor-node-key` for content roots and full rewrites, so the Plite getter added earlier is gone and `plitejs/dom`'s public surface is unchanged. The sweep for `getMountedNodeElements` lists no hit.
- [x] 2.17 Codecs.
  - HTML encode writes `data-list-id`, using a conversion-local token for the default list.
  - HTML decode remaps ids once per conversion and moves its previous-list scan into the join rule.
  - Markdown decode gives each list a fresh id. A nested list takes its parent item's id only when it is the first nested list at that level under that parent.
  - Markdown encode splits a run where a block intervenes or the id changes, and starts each ordered run at its first number.
  - Word HTML paste maps `mso-list` identity to `data-list-id` and deletes its forced restarts at identity boundaries.
  - Format readers keep an open slice as a slice, never typed as a document.

  Proof: codec specs for interleaved, continued and default lists; `EDIT-LIST-START-MD-401`; the `WordPastePlugin.spec.ts` interleaved case; and a Markdown round-trip test that pins how a continued list re-imports.

  Done: the list, Markdown, HTML and docx specs pass, and the 27 www DOCX paste fixtures now name which list each item joined. Deviation: Markdown decode keeps items without ids and forces a restart on each list, because random ids broke the continued-parse equality.
- [x] 2.18 Add `migrateListIdentity` to `platejs/migrations`. It is a standalone, idempotent document step that gives each legacy adjacency sequence a random id. A sequence that already holds exactly one id gives that id to its other items. As a bug fix in `migratePlateV54Profile.internal.ts`, keep a v53 conditional start beside a forced one and keep starts on bullets and tasks as latent intent. Give every multi-list demo value and spec fixture its ids. Proof: a migration oracle test where the old adjacency derivation equals the identity derivation on every list fixture and on 500 random adjacency documents; a second run that changes nothing; a mixed document whose sequence already holds one id; and the 2.11 v53 latent-start cases. Also compute the schema fingerprint before and after the property change, and record the version bump in the docs step.

  Done: `migrateListIdentity.spec.ts` matches an independent copy of the adjacency rule on 500 seeded documents, a second run changes nothing, and runs that hold ids keep them. The v54 spec covers the v53 latent starts. The fingerprint of `{ id: "acme-document", version: 54 }` with the list plugin moved from `fnv1a64:741fde44cfd16a22` to `fnv1a64:0a09e1192a3f3f3b` (`build3/fingerprint-*.log`). Deviation: no demo value needed ids, because none numbers differently once id-less lists share the default list (`build3/demo-values-a2.log`).
- [x] 2.19 Tell the DOCX export session the identity contract and what this step changes in `packages/platejs/src/docx/**`, then add DOCX numbering import in its own module under `docx/import/lib/numbering/`. A reader of `numbering.xml`, styles and paragraph `numPr` lists numbered paragraphs in body order. Mammoth's `transformDocument` gives the k-th numbered paragraph a synthetic bookmark that renders as an anchor inside its `li`. Before HTML decode, a pass moves the reader's facts for that paragraph onto the `li` as `data-list-*` attributes and removes the anchor. When a paragraph's text does not match the reader's, the import keeps Mammoth's numbers, drops identity for that document and reports `docx-numbering-unaligned`. Word facts map onto the model:
  - `ilvl` becomes indent;
  - a `num` without overrides takes its abstract definition's id;
  - an override `num` whose first use follows another `num` of the same abstract definition is a restart of that list, mapped to `listRestart` on its first item;
  - any other override `num` gets its own id;
  - each level's `start`, `lvlRestart` and `lvlText` become that list's `listLevels`, copied onto each of its items.

  Proof: imported numbers equal the pinned oracle, SuperDoc's `numbering-manager.ts`, on fixtures for a list continued past paragraphs, interleaved lists, a restart, a start override, `lvlRestart` 0 and `lvlRestart` 1, a level start, a table-cell list, and two `num`s sharing one abstract definition. That last fixture is the one the oracles disagree on, labelled inferred (`artifacts/2026-10-10-list-review/redesign/docx-oracle-note.md`).

  Done: `importDocxNumbering.slow.ts` runs the real import on the two real Word fixtures and seven synthetic ones. The vendored SuperDoc manager (`build3/superdoc-oracle-a1.log`) gives the same numbers on all but `lvlRestart` 1. There SuperDoc compares a zero-based level with the raw value and restarts after level 2 as well; the import follows ECMA-376 17.9.11 and eigenpal. Deviations: a marker run carries each numbered paragraph through Mammoth, in place of a bookmark plus a text-match guard, so alignment is exact and `docx-numbering-unaligned` is not needed. The import also pins Word's number as a restart wherever Plate's count of the mapped facts would differ. Diff panel rounds 2 and 3 found that mapping restarted instances to separate lists either merged interleaved instances or stored derived numbers, so the mapping left the review loop. Every instance of a definition now joins that definition's list, its items carry the instance's level overrides, and a start override, like the numbers of two restarted instances that interleave, is stored as a restart.
- [x] 2.20 DOCX export, in its own module, maps each Plate list to one Word `num` whose abstract definition comes from the list's `listLevels` and its items' styles. Each `listRestart` becomes an override `num` that continues the same abstract definition. An item whose style differs from its level's format is reported as a loss. Proof: import, export and re-import give the same partition of items into lists and the same level rules, allowing renamed ids. An insert applied to each re-imported list then numbers the same as that insert applied to the original document.

  Done: `list-roundtrip.spec.tsx` exports interleaved, continued, restarted, started and level-ruled lists, imports them back, and gets the same lists, level rules and numbers, before and after an insert into each list. Its marker case reports `list-marker` without failing a reject export. For list HTML without ids, `numbering.xml` is byte-identical to the DOCX session's final tree on four cohorts (`artifacts/2026-10-10-list-review/build3/generic-numbering-now-a1.log`, `artifacts/2026-10-10-list-review/build3/generic-numbering-docx-final-a2.log`). Deviations: the mapping lives in the exporter's `DocxDocument`, which already owned numbering, not in a new module. The import takes a list's level rules from the abstract definition, not from an instance's override, and drops Word's plain `%N.` level text, so a round trip adds no rules the original lacked. The DOCX session handed this step over (`artifacts/2026-10-10-list-review/build3/docx-export-handoff.md`).
- [x] 2.21 Copy `docs/editor-behavior/markdown-editing-spec.md` to the run directory. Then add a proposed law for numbering past an item taken out of a list, naming Word and Google Docs as its authority for list identity, and reconcile `EDIT-LIST-START-MD-401`'s parse wording with fresh ids. Proof: the law's tagged tests from 2.11 pass.

  Done: `EDIT-LIST-ID-403` (proposed) takes the middle item out by Backspace, empty-item Enter, outdent and toggle; its four tagged cases pass. `EDIT-LIST-START-MD-401` now says parse forces each ordered list's start, and the stale proof lines for 401 and 402 point at current source. Copy: `build3/markdown-editing-spec.before-2.21.md`.
- [x] 2.22 Through `plate-docs`, teach `listId`, identity, the default list, restart and continue in `list.mdx` and `list.cn.mdx`, `migrateListIdentity` in `editor.mdx` and its twin, and DOCX numbering on the DOCX page. Proof: the docs checks `plate-docs` names pass.
  Done: `pnpm --filter www build:source` and the docs source parity check pass (`artifacts/2026-10-10-list-review/build3/docs-build-source-a1.log`, `artifacts/2026-10-10-list-review/build3/docs-parity-a1.log`). `check:docs` stops at its first link, `api-reference:check`, because the packages' `dist` declarations are not built here; the API reference regeneration is in Open work.
- [x] 2.23 Through `benchmark`, rerun on the final production path. Run the lines of `artifacts/2026-10-10-list-review/redesign/budget-identity.md` as amended through amendment 3 (D1', D6, D7, I2', I4, I7, I8, I9), plus typing work 0 at 10,000 items and the list-free render line. D6 runs the incumbent producer from a worktree at the build base on the same page shape. Every known-bad arm the budget names must fail its line, as must a root-wide recount arm and a doubled-write arm. Proof: the evaluator passes every line for the shipped arm and rejects each known-bad arm, the report arms attribute the end-to-end insert growth, and the Brief quotes only these matched lines.
  Done: every headless line passes on the shipped index (`artifacts/2026-10-10-list-review/perf/list-index-production-a3.json`, Bun, load about 4 on 18 cores). Inserting into the middle list of N lists of 10 takes 13 work units and about 0.02 ms of index update at N = 10, 100 and 1,000, while the root-walk arm grows to 2.2 ms (I1, I2', I6). A top insert into a 10,000-item, three-level list updates the index in 0.25 ms (I4). Deleting 5,000 of 10,000 items in one commit takes 7.2 ms and pasting 5,000 takes 11.7 ms, against 22.3 ms for per-item splicing (I7). A mark toggle and a typed character recount nothing (I8), and the counting cases match their hand-written sequences while an all-ones arm fails (I9). In Chromium, the painted markers read 1., 5001. and 10001. after a top insert, and hiding markers fails that line (D2', D5). In a virtualized view with 21 mounted rows, the writer adds 0.4 ms over plain paragraphs, against 31 ms for resolving every key (D7; `artifacts/2026-10-10-list-review/perf/list-delivery-a3.json`, dev build). D1' fails its frozen line. In a production bundle of the shipped writer, a 10,000-item top insert takes a median 142.8 ms (range 141.2 to 143.2, 5 alternating packets) from the commit's layout effects to the next frame, against the 100 ms line. A plain-paragraph insert on the same page takes 71.1 ms, so lists add a median 71.7 ms (range 71.0 to 72.2), of which the writer itself takes 10.3 ms (`artifacts/2026-10-10-list-review/perf/list-delivery-prod5-a1.json`); Chromium's style and layout of 10,000 changed `start` values is the rest. Subtracting the plain frame changes the frozen metric, so D1' is accepted under the strict-frame Defaults row, not passed. Deviations: D6 did not run, because the round-1 tree's sources do not bundle under Bun (a circular import leaves `dataTransferFormats` undefined) and a dev server at that commit needs an offline install; it is in Open work. The doubled-write arm did not run either. The end-to-end insert still grows with the root, because Plite's own commit does, as the Report line shows (0.45 ms list against 0.35 ms plain at N = 10, 2.66 ms against 2.26 ms at N = 1,000). The gap between list and plain also grows, from 0.10 ms to 0.40 ms, while the index work stays at 13 units; its cause is not measured yet.
- [x] 2.24 Through `verify`, prove it in Chromium. In the www list demo, show a list continuing past a note, interleaved lists, a top insert, a start change, and Restart numbering and Continue numbering from the menu, with screenshots. In the virtualized huge-document example, insert at the top while scrolled to item 5,000, then scroll and check newly mounted items. Also show two views, and one frame check that the inserted item and its renumbered siblings paint together. Proof: inspected screenshots and the frame log.
  Done: `artifacts/2026-10-10-list-review/perf/browser/verify-224.perf.ts` passes twice on the dev server (`artifacts/2026-10-10-list-review/verify-224/run-a2.out`), and again on the final bytes after the harness's view keys changed (`artifacts/2026-10-10-list-review/verify-224/run-a3.out`). In `/blocks/list-demo`, typed input continues a list past a note, Enter at the first item's start inserts above it and renumbers, a typed `9.` opens a list at 9, Restart numbering and Continue numbering from the toolbar menu give 1 and then 3 again, and a native paste of interleaved lists numbers 1, 1, 2, 2. The screenshots are `artifacts/2026-10-10-list-review/verify-224/a-continue-past-note.png` to `f-interleaved.png`. Two views renumber identically, every frame after an insert shows the whole renumber, and in a virtualized 10,000-item list scrolled to item 5,000 the mounted items and the ones a later scroll mounts show their positions (`g-two-views.png`, `h-virtual-after-insert.png`, `i-virtual-after-scroll.png`, `verify-224.json`). Deviation: the virtualized case runs on `/dev/list-perf?virtual=1`, because the huge-document example holds no lists, so the proof covers that harness and its insert call, not the huge-document example.
- [x] 2.25 Phase exit: keep when 2.11 to 2.24 pass, the DOCX round trips included; otherwise revert the redesign to the first Phase 2's tree. Proof: decision row. Done: the 2.25 keep row, with `artifacts/2026-10-10-list-review/build3/list-specs-a6.log` and `artifacts/2026-10-10-list-review/verify-224/run-a3.out`.

### Phase 3: list keys follow the locked laws

- [x] 3.1 Add failing tests that press the keys through the editor's keydown pipeline. Shift+Tab on a root numbered item changes nothing and leaves no undo step; Shift+Tab over a root list item and a deeper paragraph outdents only the paragraph; Shift+Tab on `> - |Item` gives `|Item` in one press (`[EDIT-BQ-LIST-STAB-001]`); Enter at the end of a checked task keeps the new task checked (`[EDIT-TASK-ENTER-001]`). Proof: `--expect-fail` at the build base fails each case with its own title.
- [x] 3.2 Add a list `untab` shortcut ahead of indent's and below the table's. On a root list item inside a blockquote it removes the item's list fields and lifts it out of the quote in one transaction; when the selection holds a root list item elsewhere, it decreases every other selected block that can outdent and changes nothing when none can; otherwise it leaves the key to the next handler. Proof: the 3.1 Shift+Tab cases pass. Done: `artifacts/2026-10-10-list-review/browser/list-keys-spec-x5-a3.log`.
- [x] 3.3 Delete the start-unset half of the first Enter wrapper (`BaseListPlugin.ts:1674-1693`, keeping the empty-item outdent) and the task-end wrapper (`:1695-1723`). Proof: the 3.1 task case and the split specs at `:427,452,473` pass.
- [x] 3.4 Through `plate-docs`, fix the Markdown start sentence in `list.mdx` and its twin. Proof: the docs checks pass.
- [x] 3.5 Through `verify`, in Chromium in the www list demo, type a character, press Shift+Tab on a root item, then undo, and screenshot that the undo removed the character; press Enter at the end of a checked task and screenshot the new checked task. Proof: inspected screenshots. Done: `artifacts/2026-10-10-list-review/browser/3.5-proof-a1.log` and the three `3.5-after-*.png` screenshots.
- [x] 3.6 Phase exit: keep when 3.1 to 3.5 pass; otherwise revert the phase. Proof: decision row. Done: the phase 3 exit row, with `artifacts/2026-10-10-list-review/browser/list-keys-spec-x5-a1.log`.

### Close

- [x] Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and this plan. Done: the `writing` rows after each build and panel round, and the close's `unslop` row.
- [x] Panel on the diff (reviews: api-build). Done: three diff rounds after the `built:` row, the cap (`artifacts/2026-10-10-list-review/panel-diff-2/`, `artifacts/2026-10-10-list-review/panel-diff-3/`, `artifacts/2026-10-10-list-review/panel-diff-4/`); open criticals carry their patch, owner and stop.
- [x] Mutation proofs through `mutate.mjs` for the identity index, the join rule and its correction, `restart` and `continue`, the writer, start precedence, the DOCX mapping, the untab priority and code-block deferral, and the plain-text marker. Done: 18 caught on the final frozen tree (`close-mutate/mutate-a2.out`, `close-mutate-old/mutate-a1.out`, `close-mutate-old/mutate-a2.out`).
- [x] Changesets for `platejs` and `plitejs`, and the registry changelog entry for the copied menu, through `changeset`. Done: `.changeset/list-scoped-api.md`, the test JSX tags in `.changeset/slate-browser-proof-lane.md`, and `2026-10-10-list-restart-continue.mdx`.
- [x] `pnpm lint:fix` on this task's files, and the `pnpm check` steps the edits reach. Done: `pnpm lint:task` on the task's files after the close edits.
- [x] `/pstack:correct` on the per-keystroke class, which the plan panel found twice. Done: the keystroke cost cases and the `CODING_STANDARDS.md` row (decision log).
- [x] Close, fold into `docs/plans/topics/list.md`, decision-trail review. Done: `## Close`, the subject file, and `trail/seat-sol-a1.md`.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | The index is a runtime projection per root, and the writer touches every mounted renumbered host |
| User-facing operation and runtime owner identified | yes | Insert, remove, start change, restart, continue and typing in numbered lists; owner today is the per-view producer and the adjacency gate |
| Scale variables and cohorts fixed | yes | N separate ten-item lists at 10, 100 and 1,000; one list of 10,000 items with three levels; 10,000 rendered items with realistic content (`artifacts/2026-10-10-list-review/redesign/budget-identity.md`) |
| Budget frozen before target measurement | yes | `artifacts/2026-10-10-list-review/redesign/budget-identity.md`, frozen before any target arm ran; amendments 1 and 2 were each logged before the arms they cover ran |
| Baseline and target probe selected | yes | `artifacts/2026-10-10-list-review/redesign/index-proto-v2.probe.spec.ts` (prototype, root-wide and whole-root-walk arms) and `delivery-proto-v2.probe.mjs` (custom-property, `ol.start`, forced-layout and suppressed-marker arms); the incumbent producer's Chromium arm runs in 2.23 |
| Correctness guard selected | yes | A fresh build from the final document after every step, an independent oracle that never reads the index, and marker text from Chromium's accessibility tree |
| Production detector decision recorded | N/A | No runtime detector owns editor numbering; the work counters are the guard |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Pre-acceptance scale proof | yes | Prototype lines as amended | `artifacts/2026-10-10-list-review/redesign/index-proto-v2-a1.log` and `delivery-proto-v2-a1.log`: every frozen line passes and every known-bad arm fails |
| Warm latency budget | yes | Typing work 0 at 10,000 items | I8 places and recounts nothing for a mark toggle and a typed character (`artifacts/2026-10-10-list-review/perf/list-index-production-a3.json`), and the keystroke cost cases in `BaseListPlugin.spec.tsx` count the same list work at 10 and 300 lists |
| Large/stress scaling | yes | I-lines flat across N = 10, 100 and 1,000 | I1, I2' and I6: 13 work units at every N while the root-walk arm grows (`list-index-production-a3.json`); `ListPlugin.slow.tsx` gives equal renders, recounts and `start` writes at 10, 100 and 1,000 lists. The whole insert still grows with the root (Report line, Open work) |
| Cold and failure paths | yes | Lazy index build cost recorded at each cohort | First read builds the index once: 0.33 ms at 110 blocks, 1.0 ms at 1,100, 8.0 ms at 11,000 and 8.7 ms for one 10,000-item list, each item counted once (`artifacts/2026-10-10-list-review/perf/list-index-cold-a3.json`) |
| Payload and fan-out | yes | Hosts written per operation equal the changed numbers | The writer skips a host whose `start` already matches; `ListPlugin.slow.tsx` counts the same `start` writes at every N, and the 10,000-item top insert renders as many items as plain paragraphs. The doubled-write arm did not run |
| Production-path rerun | yes | Step 2.23 | Every headless line passes; D1' fails its frozen line and is accepted under strict-frame; D6 did not run (rerun-d6) |
| Correctness guard | yes | Step 2.23 oracle line and the 2.13 property test | I9 matches hand-written sequences and its all-ones arm fails; the 2.13 property test fails on the count-every-item-one mutant (`build3/mutate/count-every-item-one-a1.log`) |
| Before/after receipt | yes | Matched logs before and after | Partial: the before side is the first Phase 2's happy-dom packet (`bench/quick-a1/`, 10,003 renders for a top insert) and the after side the render-count and Chromium logs above; D6, the matched Chromium comparison, did not run |
| Detector and privacy | N/A | No detector; no data leaves the editor | N/A |
| Performance regression check | yes | The 2.23 evaluator on the final logs | `list-index-production-a3.json` lines all true; `list-delivery-a3.json` D2', D5 and D7 true and D1 false on the dev build; `list-delivery-prod5-a1.json` records D1' as list-attributable time only |

## Close

Reversals and deviations come first.

- The run reverted the mapping that gave each Word instance with a start override a list of its own, because its second replacement drew a critical finding. Every instance of a definition now joins that definition's list, and two restarted instances that interleave keep their imported numbers as restarts, which an edit between them does not renumber. The decision-trail review found this short of the owner's "full docx support", so it goes back to planning in `2026-10-10-list-import-identity.md`.
- The run reverted the identity correction on property edits. A raw property edit never changes an item's list; only edits that create items run the join rule.
- One change landed after the last panel round, at the cap, so no panel reviewed it. A full rewrite of mounted lists reads each host's `data-editor-node-key` again, because resolving every host through `api.dom` cost 51 to 160 ms for 10,000 hosts against 4.5 to 8.9 ms (`perf/list-delivery-a2.json`, `perf/list-delivery-a3.json`), and `docs/vision/plate.md` names that read.
- D1' fails its frozen 100 ms line, because the frame after a 10,000-item top insert takes 142.8 ms. Lists add 71.7 ms over a plain insert, and the writer takes 10.3 ms of that. It is accepted under the strict-frame Defaults row. D6 and the doubled-write arm did not run.
- The virtualized proof ran on `/dev/list-perf`, because the huge-document example holds no lists.
- Markdown decode keeps parsed lists in the root's default list with a forced start each, so they share one index array, and an edit there moves pointers across all of them. That also goes to the next iteration.
- Smaller deviations, each in its step's Done note: the writer finds hosts through `api.dom` and host keys, not a composed host ref (2.15); a marker run carries each Word paragraph through Mammoth instead of a bookmark (2.19); the DOCX mapping lives in `DocxDocument` (2.20); no demo value needed ids (2.18).

What landed: list identity (`listId`, `listLevels` and the root's default list), a per-root list index that recounts only touched lists, a per-view writer that sets `start` on mounted lists after each commit, `update.restart` and `update.continue` with copied menu items, `migrateListIdentity`, DOCX numbering import and identity-keyed export, identity in HTML, Markdown, plain text and Word HTML paste, root Shift+Tab and checked-task Enter by the locked laws, and the Phase 1 API cuts.

Proof, by each row's scope:

- In Bun, on the shipped index, inserting into one of N lists of 10 does 13 units of index work at N = 10, 100 and 1,000; a 10,000-item top insert updates the index in 0.25 ms; a mark toggle or a typed character recounts nothing; counting matches hand-written Word sequences (`perf/list-index-production-a3.json`). The first read builds a root's index in 8.0 ms at 11,000 blocks (`perf/list-index-cold-a3.json`). The whole insert still grows with N, and the list share of that growth, 0.10 ms to 0.40 ms, is not attributed.
- In React DOM on happy-dom, a 10,000-item top insert renders as many items as plain paragraphs and writes every mounted number; typing and an insert among 10, 100 and 1,000 lists cost the same renders, recounts and writes (`ListPlugin.slow.tsx`); lifecycle, two views, SSR, hydration and content roots pass (`ListPlugin.spec.tsx`).
- In Chromium on the Next dev server, typed input, the toolbar's Restart numbering and Continue numbering, native paste of interleaved lists, two views, a same-frame renumber and a virtualized 10,000-item list on `/dev/list-perf` all pass (`verify-224/run-a3.out`). Painted markers read 1., 5001. and 10001. after a top insert (D2', D5).
- In Chromium on a production bundle, D1' measured as above (`perf/list-delivery-prod5-a1.json`).
- DOCX round trips of continued, interleaved, restarted, started and level-ruled lists keep lists, level rules and numbers through an insert, against SuperDoc's numbering as the oracle. No Word install ran, so the shared-definition case stays inferred.
- On the final frozen tree, 18 mutants are caught and none survive. They cover the index, the join rule, the writer, `restart` and `continue`, start precedence, the Shift+Tab rules, the plain-text marker, the DOCX import and export, the migration and Word paste (`close-mutate/mutate-a2.out`, `close-mutate-old/mutate-a1.out`, `close-mutate-old/mutate-a2.out`). Two earlier mutants guarded code that was later reverted, so they no longer apply.
- Happy-dom proves render dependencies and JavaScript work, not paint. Wall times come from a shared host, and the D-lines ran in Playwright's Chromium only.

Counts: 46 items in Steps and the Close checklist. 44 are done, 2.23 among them under the rerun-d6 and strict-frame rows. 2 are skipped (2.8 and 2.10, superseded). None are partial, blocked or open. The plan's open work moved to the subject file, each item with its owner and stop.

The review read these inputs at `review_commit`, and the predicted benefit held for the main root: every mounted view, static render and codec numbers by list identity after any commit, with the limits above. Inputs: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `2e865a0bc4:docs/research/decisions/list-ownership.md`, `docs/research/review-records/2026-10-04-list-audit-2.json`, `docs/research/review-records/2026-09-24-list-audit.json`, `packages/platejs/src/react/features/list/ListPlugin.spec.tsx`, `packages/platejs/src/plain-text.ts`, `packages/platejs/src/internal/plugin/compilePlainTextMappings.ts`, `packages/platejs/src/internal/plugin/compilePlateFormats.ts`, `packages/platejs/src/internal/plugin/pluginFormatOperation.ts`, `packages/platejs/src/react/components/EditorRefEffect.tsx`, `packages/platejs/src/react/plugin/PlatePlugin.ts`, `packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx`, `packages/platejs/src/react/utils/pipeRenderElement.internal.tsx`, `packages/platejs/src/react/utils/pluginRenderElement.internal.tsx`, `packages/platejs/src/react/internal/rendered-attributes.tsx`, `packages/platejs/src/static/pluginRenderElementStatic.internal.tsx`, `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts`, `packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts`, `packages/platejs/src/migrations/migratePlateV54.ts`, `packages/platejs/src/migrations/migratePlateV54Profile.internal.ts`, `packages/platejs/src/migrations/migratePlateV54.spec.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/transforms-text/insert-text.ts`, `packages/plitejs/src/core/commit.ts`, `packages/plitejs/src/react/hooks/use-plite-node-ref.tsx`, `packages/plitejs/src/react/editable/editable-dom-runtime.ts`, `packages/platejs/src/docx/paste/lib/WordPastePlugin.ts`, `content/docs/(plugins)/(styles)/list.mdx`, `content/docs/(guides)/unit-testing.mdx`.

Decision-trail review, Attention as the seat wrote it:

reviewed by GPT-6 (Codex)

- Full DOCX support remains unmet: restarted instances lose independent identity, and the edit assertion that exposed this was removed.
- Markdown lists still make edits proportional to unrelated lists. The general pointer-movement limit is missing from the plan's Open work and public docs.
- D1′ passed a changed metric. The recorded production measurement exceeds the frozen 100 ms budget.
- Step 2.25 accepts missing and narrowed proof as completion. D6 and the doubled-write control have no successful measurement.

The first two stay open for the next iteration. The strict-frame row and the 2.23 note answer the third, and the reversals above state the fourth. The warnings are applied in the plan and the DOCX docs (decision log, trail rows).

## Open work

- Regenerate the generated registry and API reference outputs for this plan's doc and config edits (`pnpm --filter www build:registry`, then `pnpm --filter plitejs build && pnpm --filter platejs build && pnpm --filter www api-reference`). Another session has those files staged. owner: zbeyens. stop: that session's staged generated files land, then run the commands and confirm `pnpm --filter www api-reference --check`.
- `migrateV54` keeps the numbers of documents migrated under a v53 policy that split runs where the live rule continues them only as far as it did before the option was cut, and a conditional restart on a page container's first item now applies. owner: zbeyens. stop: a migration report from an app that used a custom v53 policy, or 2026-12-31.
- Lists in a content root renumber in time proportional to that root, because Plite rebuilds a named root's snapshot index per commit (`artifacts/2026-10-10-list-review/redesign/premises-a3.log`). The R1 claim covers the main root until then. owner: zbeyens. stop: Plite core carries named-root indexes across commits, or 2026-12-31.
- Check in Word whether two `num`s sharing one abstract definition without overrides continue one count, the case where SuperDoc and eigenpal disagree (`artifacts/2026-10-10-list-review/redesign/docx-oracle-note.md`). owner: zbeyens. stop: a Word run of that fixture, or 2026-12-31.
- Plite's own commit for a root insert grows with the root: a plain-paragraph insert cost 0.53 ms at 110 blocks and 2.50 ms at 11,000 (`artifacts/2026-10-10-list-review/redesign/index-proto-v2-a1.log`). owner: zbeyens. stop: a Plite commit performance plan, or 2026-12-31.
- Inserting into one of N lists still grows with N beyond Plite's share: the whole list insert costs 0.10 ms more than a plain one at N = 10 and 0.40 ms more at N = 1,000, while the index work stays at 13 units (`artifacts/2026-10-10-list-review/perf/list-index-production-a3.json`). The cause is not measured, and the doubled-write arm of 2.23 did not run. owner: zbeyens. stop: the next list iteration, `docs/plans/2026-10-10-list-import-identity.md`.
- Each separate Word list writes a full eight-level definition, about 2.6 KB, and the exporter stores the zip uncompressed. Sharing definitions would merge lists on import, so compression is the lever. owner: zbeyens. stop: a DOCX export size plan, or 2026-12-31.
- Two restarted instances of one Word definition that interleave import as one list with stored numbers, which an insert between them does not renumber the way Word would. The owner's ask names full DOCX support, so separate lists for them go back to planning. owner: zbeyens. stop: the next list iteration, `docs/plans/2026-10-10-list-import-identity.md`.
- A numbered Markdown list followed by many bullet lists keeps them all in the root's default list, so an edit there recounts the whole list (10,000 items, about 0.13 ms; `artifacts/2026-10-10-list-review/perf/list-index-bullets-a2.json`). Every Markdown list shares that one index array, so an insert or removal there moves pointers across all of them. owner: zbeyens. stop: the next list iteration, `docs/plans/2026-10-10-list-import-identity.md`.
- A renumber in another root makes each view match one `data-editor-node-key` selector per changed key, because a view's `api.dom` does not resolve the keys of the content roots it renders. owner: zbeyens. stop: Plite's `api.dom` resolves a rendered content root's keys.
- Bulleted items that the static kit renders as list-item paragraphs export to DOCX as indented paragraphs, not Word list items. owner: the DOCX session's proposed "DOCX export: list hosts beyond paragraphs". stop: the owner starts that session.
- The typed `N. ` rule tests whether the toggle joined a list by walking for a listmate, because the toggle does not report a fresh list; it also compares block types where the join rule compares heading roles, because the rule's editor has no Plate runtime to read the heading type. owner: zbeyens. stop: a list command plan, or 2026-12-31.
- D6, the shipped writer against the incumbent producer, did not run: the round-1 tree does not bundle under Bun and needs an offline install for a dev server. owner: zbeyens. stop: a D6 run from a `proof-worktree.mjs --install` dev server at `1d56131a`, or the word rerun-d6.
- Static HTML drops a bulleted item's list facts, because the static kit renders bullets as list-item paragraphs without a wrapper. owner: zbeyens. stop: the static kit renders bullets with list facts, or the DOCX session's list hosts work starts.
- Word's compound labels such as 1.2. are kept in `listLevels` but drawn as plain per-level numbers. owner: zbeyens. stop: a list marker plan, or 2026-12-31.
- The toolbar and block-menu Outdent call `indent.decrease`, which still drops `indent` on a root list item (cosmetic: numbering already reads a missing indent as 1). owner: zbeyens. stop: a list toolbar plan, or 2026-12-31.
- A woken element keeps the `renderPath` it rendered with, and the fast path passes none, although live wrapper props type it as required. owner: zbeyens. stop: a Plate React renderer plan, or 2026-12-31.

## Challenge delta

Plan panel round 1 (Opus at high, GPT-6 Astra at xhigh, GPT-6.1 Sol at xhigh) improved the plan. Deleted: the `renderPath` reads and the two renderer repairs (a woken item keeps a stale path), and the indent-floor correction (it loops against `indentMax: 0` and leaves an empty undo step). Added: the carried numbering cache, the element-level root-aware gate, the slice model-view fix in the encoders, the migration option cut, keyboard-level Shift+Tab tests and a fail-closed evaluator with a pinned base arm. Moved out: the spec edit (staged by another session) and the Markdown grouping case (markdown scope). Re-owned: the clipboard slice fix, from a separate session into the plan, because the plain-text step depends on it.

Plan panel round 2 (the same seats) improved it again. Added: subscription by the element's stable key in Plate's element renderer, after B showed 3 against 7 on both render paths (`artifacts/2026-10-10-list-review/stalekey-mixed-package-a1.log`, `stalekey-mixed-copied-a1.log`); cache transfer to replaced elements; a gate that ignores structure edits no numbering walk can cross; a migration that writes a start or restart wherever the live number differs from the legacy one; and replacement renumbering lines frozen before the production run (`bench/budget.md` amendment), with the lead's `look` pick "Renumbering limits". Changed: the list Shift+Tab shortcut leaves the key to the blockquote inside a quote (`EDIT-BQ-LIST-STAB-001`), and generated files regenerate in this checkout instead of being copied from a worktree.

Plan panel round 3 (the same seats, the last plan round) changed it again. Reverted: round 2's migration rewrite, which could write permanent restarts and overwrite conditional starts in user documents; the migration now only loses its option. Changed: the list shortcut implements `EDIT-BQ-LIST-STAB-001` itself, because today's handlers dead-end inside a quote; generated files are not written while another session has them staged; the gate's forward scan is bounded at 64 siblings; and the budget amendment pins the timing comparator to the build base, splits insert and start-change render limits, counts gate visits and adds a list-free render line.

Diff panel round 1 confirmed that the adjacency gate misses batched edits and that content-root and named-root lists had no delivery. The owner's steer then replaced the target, so the redesign's tests settle those findings instead of gate fixes. Replaced: the per-view producer, the adjacency gate and the cache carry, by list identity, a per-list index and host writes. Decisive evidence: the owner's steer and the prototype lines in `artifacts/2026-10-10-list-review/redesign/`.

Plan panel round 4, the redesign's first, improved it (`artifacts/2026-10-10-list-review/panel-plan-4/verdict.md`).
- Deleted: the run key that let a heading or kind change restart a list; the Plite host getter; the custom-property delivery, which measured 133.4 ms against 85.4 ms for `ol.start` on realistic items; and the sibling-plan deferral of DOCX.
- Added: `restart` and `continue` with menu items; typed continuation; the edit-time correction; start precedence in toggle, HTML decode and the v53 migration; `migrateListIdentity` as a standalone step; DOCX import and export with round trips in the phase exit; and probe lines that fail closed.
- Narrowed: R1 to the main root until Plite core keeps named-root indexes.

Plan panel round 5, the last plan round, improved it again (`artifacts/2026-10-10-list-review/panel-plan-5/verdict.md`).
- Deleted: the id split for never-restarting Word levels, start copying in commands, host resolution through `api.dom.resolveDOMNode`, and the resumed counter state.
- Added: `listLevels` as each Word list's level rules; Continue that undoes Restart; export that keeps one `num` per list and an import that maps restart `num`s back; a per-view map of mounted list elements filled through the host ref; candidate filtering; batch rebuild; a 64-block join bound; and budget amendment 3 with a line against the incumbent, a virtualized line, batch, mark-edit and semantic lines, each with a known-bad arm.
- Narrowed: the shared-abstract DOCX mapping to inferred, with a Word check in Open work. R1 stays open end to end as a Plite dependency.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

This review supersedes `2026-10-04-list-audit-2`. Its verdict, target and cut list hold on current source, and this page replaces its inferred stale-numbering claim with a measured one and adds the plain-text and clipboard findings. Eleven of its fingerprinted inputs changed since it was recorded on `17195da367`; none of the list owners did. `listToMdastTree.ts` now writes an item's paragraph through `encodeMarkdownParagraph`, `importDocx.ts` dropped the hidden Plate envelope, `list.spec.tsx` added `indent: 1` to a task fixture, `HtmlPlugin.ts` changed two casts, and `markdown-editing-spec.md` added the proposed laws `EDIT-LIST-START-ENTER-402` and `EDIT-LIST-START-MD-401`, which current source meets. The law moved from `VISION.md` into `docs/vision/plate.md`. The view-attribute rule (`plate.md` lines 314 to 328) and the neutral-default rule (`plate.md` lines 86 to 92) keep the meaning the last review cited, and `docs/vision/common.md` added that a cut justified only by "no production caller" first checks whether Vision names a job for the API. The 2026-09-30 content-root design, execution and closure stay reopened for this question, as that record set them, because they adopt none of this target. The list decision page (`2e865a0bc4:docs/research/decisions/list-ownership.md`) still states the 2026-10-04 Pursue and stays true until the build lands.

The editor comparison read `../BlockNote` at `1e26f1c5e1`, `../lexical` at `dd5c41b131`, `../prosemirror-schema-list` at `d5515fe141`, `../tiptap` at `91c51be53c` and `../milkdown` at `6a4db480`. Front matter names only the two whose numbering owner shaped the lanes. The redesign's explorer read LibreOffice Writer, docx-preview, SuperDoc's `docx-editor`, the eigenpal docx editor and CKEditor 5 (`artifacts/2026-10-10-list-review/redesign/how-refs-a1.md`).

### Requirements

- The owner's steer, verbatim: "switch to the most performant algorithm for 10000items. For example N separate lists of 10 items should not affect the perf of inserting in a list. Use the most performant listing counting, with full docx support (non contiguous list items). Redesign from first principles."
- Lists stay flat semantic properties of ordinary blocks, so generic split, merge, move, paste, drag and type change need no list structure (`docs/vision/plate.md` lines 1327 to 1329).
- Displayed and exported numbers equal the derived ordinal of the current document after every commit, in every mounted view, static render and codec.
- Derived display state never enters canonical JSON, and inactive author intent is preserved (`docs/vision/plate.md` lines 690 to 698).
- Sparse attributes that custom components receive through React go through `render.useViewElementAttributes`; per-node `render.attributes` and `inject.nodeProps.transformProps` stay pure and hook-free; a feature may bind state directly to mounted node hosts under the stated proofs (`docs/vision/plate.md` lines 314 to 328).
- Feature presentation reads take the known path, as in `read.list.ordinal(path)` (`docs/vision/plate.md` lines 1269 to 1271).
- Package defaults are semantically neutral; product presentation belongs in copied registry source (`docs/vision/plate.md` lines 86 to 92).
- Every public method and option has a current user job (`VISION.md` Common Essentials, `docs/vision/common.md` lines 38 to 41).
- Locked list laws hold, and a contradiction between a law and source is resolved explicitly (`docs/editor-behavior/markdown-editing-spec.md` List and Task List sections).
- Hard cuts beat aliases (`VISION.md` Invariants 1).
- No performance claim without a matched scale comparison (`VISION.md` Common Essentials).
- Plite core stays out of this plan; another session is editing `packages/plitejs/src/core/**`.
- User constraint: "next while we're doing authored one (pick non conflicting one)". The work stays off the `authored` and `suggestions` files.

### Current source

- The copied [`block-list.tsx`](../../apps/www/src/registry/components/editor/block-list.tsx) and the package [`ListPlugin.tsx`](../../packages/platejs/src/react/features/list/ListPlugin.tsx) both call `read.ordinal` inside a `wrapNodeChildren` wrapper during render.
- At the build base, a source-first React DOM probe (probe `docs/plans/artifacts/2026-10-10-list-review/live-ordinal.probe.spec.tsx`, log `docs/plans/artifacts/2026-10-10-list-review/live-ordinal-a2.log`) rendered `[1,2,2,3]` after a top insert while `read.ordinal` returned `[1,2,3,4]`, `[1,2,1,2]` after setting `listType` on a middle paragraph, and `[5,2,3]` after a start change.
- The list's plain-text mapping wrote `${node.listRestart ?? 1}.` for every numbered item (probe `docs/plans/artifacts/2026-10-10-list-review/headless.probe.spec.ts`, log `docs/plans/artifacts/2026-10-10-list-review/headless-a2.log`), and partial copies wrote HTML starts 1 and 4 (probe `docs/plans/artifacts/2026-10-10-list-review/clipboard.probe.spec.ts`, log `docs/plans/artifacts/2026-10-10-list-review/clipboard-a1.log`).
- The adjacency gate of the first Phase 2 misses batched edits: two plain paragraphs inserted at the top and two removed in one transaction move a later item's number while the gate returns false (probe `docs/plans/artifacts/2026-10-10-list-review/redesign/batched.probe.spec.ts`, log `docs/plans/artifacts/2026-10-10-list-review/redesign/batched-a1.log`).
- The first Phase 2's quick scale packet (`artifacts/2026-10-10-list-review/bench/quick-a1/`) measured a 10,000-item top insert at about 1,490 ms p50 with 10,003 list-item renders, of which the producer pass itself is 12.5 ms cold (`bench/producer-cost-a1.log`).
- DOCX import goes through Mammoth, which keeps only `abstractNumId` per `numId` and drops `numId` identity, `w:start`, `w:lvlRestart` and the overrides; export at the build base groups lists by kind and depth (`artifacts/2026-10-10-list-review/redesign/how-answer-a1.md`).
- Corrections run on edits only, never on `initialValue` or `value.replace` (`artifacts/2026-10-10-list-review/redesign/premises-a3.log`), and `ElementIdPlugin` accepts elements without ids.
- Each mounted view keeps its own NodeKey to host map (`artifacts/2026-10-10-list-review/redesign/premises-react-a2.log`). Resolving an unmounted key through `api.dom.resolveDOMNode` falls through to a DOM query (`packages/plitejs/src/dom/plugin/dom-node-path.ts:67-94`), so the writer keeps its own map instead.
- `migrateDocument` runs only the steps after a document's stored version (`packages/platejs/src/migrations/documentMigrations.ts:697`), so a changed v54 step cannot reach documents already stamped 54.
- A plain-paragraph insert costs Plite 0.53 ms of commit time at 110 blocks and 2.50 ms at 11,000 blocks (`artifacts/2026-10-10-list-review/redesign/index-proto-v2-a1.log`).

The predicted benefit is that every numbered item in a mounted view, static render and codec shows its number by list identity after any commit, and an edit in one list costs work bounded by that list. The plan's Close marks it held or falsified.

### Lanes

- **Stop and keep the current design.** Loses. The editor showed wrong numbers after inserting an item and after changing a start, and plain text dropped every number.
- **Container lists, as Lexical, ProseMirror and Tiptap model them.** Loses again. Generic block editing, DOCX paragraph numbering and collaborative property edits all favor flat items.
- **Store the number, as Lexical's transform does.** Rejected by the rule that derived display state stays out of canonical JSON.
- **Per-item subscription in each wrapper.** Correct, but every keystroke ran one selector per numbered item: 10,000 evaluations and 54.9 ms p50 at n=10,000.
- **One gated producer per view, the first Phase 2.** Typing did no work, but a top insert re-rendered every renumbered item (about 1.4 s at n=10,000), any gated edit ran a full pass over every numbered item in the root, the gate missed batched edits, and adjacency cannot express Word lists. Replaced by the owner's steer.
- **Identity with a balanced counter tree and a stored Word program (Sol) or a definitions root (Astra).** O(log L) index upkeep and full Word level semantics, at the cost of a second persisted list structure, a summary algebra and, for Astra, O(K) rewrites per restart. Rejected: a fully mounted renumber writes L hosts anyway, and the prototype's per-list array recount costs microseconds.
- **CSS counters per list and level.** Small JavaScript cost, but counters miscount when virtualization or pagination leaves items unmounted, and lists across containers need dynamic root-level resets. Rejected as the owner.
- **A custom property on each host read by `counter-set`.** Keeps the copied wrapper free of `start`, but it restyles each item's subtree: 133.4 ms against 85.4 ms for `ol.start` on 10,000 realistic items in Chromium, and it needs Safari 17.2. Rejected after the matched run.
- **Identity with a per-list array index and `ol.start` writes, the pick.** One stored field, one counting rule, bounded work per list, no React render per renumbered item, and the same `start` encoding live and static.

### Design

The first Phase 2 design ran `pstack:architect` with three runners and an Opus cross-judge (`artifacts/2026-10-10-list-review/architect/judge-a1.md`) and three plan panel rounds.

After the owner's steer, `pstack:architect` ran again. Phase A grounded the redesign through two Codex explorers (`artifacts/2026-10-10-list-review/redesign/how-answer-a1.md`, `how-refs-a1.md`) and `redesign/grounding.md`. Phase B ran three runners on `redesign/task.md` and `redesign/runner-brief.md`: Opus at high effort, GPT-6 Astra at xhigh and GPT-6.1 Sol at xhigh (`redesign/runner-*-a1.md`). An Opus cross-judge scored anonymized copies against `redesign/rubric.md` (`redesign/judge/judge-a1.md`): Opus 25, Sol 22, Astra 18. The judge took Opus's package as the base. The first synthesis (`redesign/synthesis.md`) grafted latent starts, paste joining the landing list, same-frame paint and known-bad controls, and added the lead's own run key. Plan panel rounds 4 and 5 then reshaped it; the synthesis's two revision sections and the Challenge delta record each change, such as deleting the run key, moving delivery to `ol.start`, adding `listLevels`, restart and continue, and bringing DOCX into this plan.

The premises ran before the plan (`redesign/premises-a3.log`, `premises-react-a2.log`):
- Moves and container moves reach the changed keys.
- Main-root lookups stay flat in N.
- Corrections never run on load.
- A seeded value and later host writes work live, in SSR and across views.
- Content-root lookups grow with the root.

Plan panel round 4 found the first prototypes too narrow. The run therefore froze budget amendment 2 and reran:
- The index prototype now removes first, handles levels and containers, and checks a fresh build after every step. It does 25 work units per insert at N = 10, 100 and 1,000 in an absolute 0.035 ms. A root-wide arm grows to 6.76 ms and a whole-root-walk mutant to 2.35 ms, and both fail. A top insert into one 10,000-item, three-level list costs 0.18 ms, and batched replacements, group moves and container moves all match the fresh build (`redesign/index-proto-v2-a1.log`).
- In Chromium on 10,000 items holding bold, italic and link spans, `ol.start` writes reach the next frame at 85.4 ms p50 and the custom property at 133.4 ms. Both paint the written markers, read from the accessibility tree. A suppressed marker reads nothing, and the forced-layout arm takes 711 ms (`redesign/delivery-proto-v2-a1.log`).

### Proof limits

The live-numbering and scale probes run React DOM in happy-dom, not a browser; they prove render dependencies and JavaScript work, not paint or layout cost. The Chromium prototype ran a standalone page, not the editor, so 2.23 and 2.24 rerun delivery on the production path against the incumbent. Wall time comes from a shared host. No Word or LibreOffice install is available, so the DOCX oracle is an independent Word-numbering implementation (SuperDoc's `numbering-manager.ts` or eigenpal's `list-counters.ts`), not Word itself. Typora's behavior for Enter after a checked task was not checked; the pick rests on the locked law and Milkdown's source.
