# Columns, alignment and spacing

Page: https://claude.ai/artifact/A3ATS6f2LX6PDeRary3XcX

Block layout in Plate: where a block sits and how its lines space out. Alignment, line height, first-line indent and margin indent are optional properties on configured target blocks. `BaseTextAlignPlugin`, `BaseLineHeightPlugin` and `BaseTextIndentPlugin` live in `platejs`, and `BaseIndentPlugin` lives at `platejs/indent`. Each declares a schema element property, an HTML mapping and a render injection that turns the stored value into an inline style. The schema alone decides what a block saves. A line height is a positive number with no package default, and the render draws every value the schema admits. Columns are structure, not a style. `platejs/layout` ships `BaseColumnGroupPlugin` for a group of two or more columns and `BaseColumnItemPlugin` for each column. A column holds blocks and a percentage `width`. Width corrections keep the widths summing to 100, and a transfer veto keeps a column inside its own group. Since 2026-10-07 a block dropped beside another block builds a group, or adds a column of up to five. The 2026-10-18 review ([2026-10-18-layout-review](../2026-10-18-layout-review.md)) adopted the 2026-10-04 Pursue with a new line-height target. `node tooling/scripts/review-ledger.mjs show layout` prints the history.

## Public API

Align the selected blocks, or clear the alignment so the block follows its container. `set('start')` saves `start`.

```tsx
// content/docs/(plugins)/(styles)/text-align.mdx
editor.update.textAlign.set("center");
editor.update.textAlign.clear({ at: [] });
```

Set the line height of the selected blocks, or clear it so the block follows the theme. Text indent has the same `set` and `clear`.

```tsx
// content/docs/(plugins)/(styles)/line-height.mdx
editor.update.lineHeight.set(2);
editor.update.lineHeight.clear({ at: [] });
```

The copied line-height kit only lists which blocks it applies to.

```tsx
// apps/www/src/registry/components/editor/line-height.tsx
BaseLineHeightPlugin.configure({
  targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
}),
```

The copied toolbar keeps its presets in its own file. Blocks with no line height check Default, a mixed selection checks nothing, and Default clears the value.

```tsx
// apps/www/src/registry/components/editor/line-height-toolbar-button.tsx
const presets = [1, 1.2, 1.5, 2, 3];

const value = useSelectionFragmentProp({
  getProp: (node) =>
    ElementApi.isElement(node) ? (node.lineHeight ?? 'default') : undefined,
});

<DropdownMenuRadioGroup
  value={value === undefined ? '' : String(value)}
  onValueChange={(newValue) => {
    const lineHeight = editor.plugin(LineHeightPlugin);

    if (newValue === 'default') lineHeight.update.clear();
    else lineHeight.update.set(Number(newValue));
  }}
>
```

The copied align kit only lists which blocks it applies to.

```tsx
// apps/www/src/registry/components/editor/align.tsx
BaseTextAlignPlugin.configure({
  targetPlugins: [
    PLUGINS.heading,
    PLUGINS.paragraph,
    PLUGINS.image,
    PLUGINS.mediaEmbed,
    PLUGINS.audio,
    PLUGINS.video,
  ],
}),
```

The copied font kit installs a bare font color plugin, so pasted black draws.

```tsx
// apps/www/src/registry/components/editor/font.tsx
FontColorPlugin,
```

Insert, resize and toggle a column group. `ColumnGroupPlugin` owns the group, and `ColumnItemPlugin` owns each column.

```tsx
// content/docs/(plugins)/(elements)/column.mdx
const columnGroup = editor.plugin(ColumnGroupPlugin);
const column = editor.plugin(ColumnItemPlugin);

columnGroup.update.insert({ columns: 3 }, { select: true });
columnGroup.update.setColumns({ at: columnGroupPath, widths: ['33%', '67%'] });
columnGroup.update.toggle({ columns: 2 });
column.update.selectAll();
```

The copied static column kit configures both plugins.

```tsx
// apps/www/src/registry/components/editor/column-static.tsx
export const BaseColumnKit = [
  BaseColumnGroupPlugin.configure({
    component: ColumnGroupElementStatic,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementStatic,
  }),
];
```

## Main changes

- `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts` owns text align, line height and text indent. The schema property checks each stored value, and one helper gives all three the same `set` and `clear`. `set` saves what it receives and reads no render config.
- `isLineHeight` and `parseLineHeight` sit beside `BaseLineHeightPlugin`. The HTML decoder parses pasted CSS into a number, exponents such as `1e0` included, and reports every line height it cannot store as a dropped property.
- `packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts` owns margin indent. The schema checks the level, and the render maps it to `marginLeft` through `offset` and `unit` in plugin state.
- `packages/platejs/src/internal/plugin/pluginInjectNodeProps.ts` turns a stored property into class names and styles for the live and static renders, with no value list or default to filter by.
- `packages/platejs/src/docx/export/lib/internal/xml-builder.ts` writes `w:line` as a whole-number multiple for unitless, percent and `em` line heights and as an at-least line in twips for lengths, maps all six alignments, and writes text indent into the paragraph's one `w:ind`, skipping list paragraphs. `buildList` gives each numbered, bulleted or to-do paragraph the alignment and line height that its table cell, listed block, list and list item set, and the nearest one wins. Word's own stylesheet reader also takes a line height written with an exponent, such as `1.5e0`.
- The v54 step in `platejs/migrations` converts stored text line heights on nodes with its own frozen parser and drops `normal`, lengths, zero, negative and unreadable values. It converts `lineHeight`, `textAlign`, `indent`, `listStart` and `listRestart` only on a property declared by the built-in line height, alignment, indent or list plugin, so an app plugin keeps its own property with the same key even when it reuses a built-in name. Each built-in plugin registers its descriptor family in `internal/plugin/firstPartyPlugin.ts`, and the migration target records the installed built-in bindings and property owners in a private table in `documentMigrationFirstParty.internal.ts`. A target copied outside `defineDocumentMigrations` throws a named error, and `compileEditor`'s output stays as it was.
- `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts` owns `BaseColumnGroupPlugin` and `BaseColumnItemPlugin`: schema, width corrections, the transfer veto, the side-drop read and the group commands.
- The copied `align`, `line-height`, `indent` and `column` registry items configure targets and render the toolbars and column UI. The copied media items place all six alignments through `getMediaTextAlign` in `caption-static.tsx` and its live twin in `caption.tsx`.

## What other editors do

A source read of eight editors on 2026-10-18, read only, nothing run. None of them stores a value it then refuses to draw. Each editor's allowed list is enforced where the value is written, or the editor draws whatever it stores.

| Editor | Alignment | Line height | Indent | Columns |
| --- | --- | --- | --- | --- |
| Lexical | `format` on every block; core owns six values; always written, `''` when unset | none | integer `indent`; step is a CSS variable | playground only: a container with a grid template and items with no width |
| Tiptap | `textAlign` on configured types; an `alignments` option the commands enforce; default `null` | free string on the `textStyle` mark; only the demo toolbar lists values; default `null` | none | none |
| CKEditor 5 | `alignment` on blocks; config owns four values; the default is never stored | premium, not in the open source | `blockIndent` CSS length or class; paste keeps any `margin-left` | none; layout tables instead |
| BlockNote | `textAlignment` prop; four values in the types; `left` stored as default | none | nesting, not a property | `columnList` holding two or more `column` blocks with a flex weight |
| Slate examples | `align` on elements; the example toolbar owns the list; unset deletes the key | none | none | none |
| Quill | `align` on the line; left is absence | none | levels 1 to 8; 0 removes it | none |

ProseMirror and Milkdown ship none of these on paragraphs; Milkdown aligns only GFM table cells from the Markdown delimiter row.

- **Line height has no package default anywhere.** Tiptap's is `null` and its value list lives in the demo toolbar, which matches the copied-toolbar presets Plate keeps.
- **Alignment's default is absence.** CKEditor, Slate and Quill never store it, and only Lexical and BlockNote write an explicit default.
- **Columns are a group of columns.** BlockNote names them `columnList` and `column` with a schema minimum of two, and unwraps a two-column list once one column is empty. Lexical's playground stores widths once on the container. Plate stores a percentage on each column, as CKEditor's table columns do.

## Document shape

Word paste saves this, and the editor, static pages, HTML export and Word export all read it.

```json
{ "type": "paragraph", "lineHeight": 1.07, "children": [{ "text": "Lorem ipsum" }] }
```

Picking 1.5 in the toolbar saves this.

```json
{ "type": "paragraph", "lineHeight": 1.5, "children": [{ "text": "Spaced" }] }
```

Calling `textAlign.set('start')` saves this.

```json
{ "type": "paragraph", "textAlign": "start", "children": [{ "text": "Start edge" }] }
```

| Pasted CSS line height | Saved value | Diagnostic |
| --- | --- | --- |
| `1.5`, `150%`, `1.5em` | `1.5` | none |
| `107%` from Word | `1.07` | none |
| `normal`, another keyword, `calc()` or `var()` | nothing, so the block follows the theme | a dropped-property warning |
| `24px`, `18pt`, `1.5rem` | nothing, so the block follows the theme | a dropped-property warning |
| zero | nothing | a dropped-property warning |
| a negative number or other invalid CSS | nothing | none in a browser, a dropped-property warning on the server |

A browser drops a negative number or other invalid CSS before Plate reads the style, so that paste saves nothing and warns about nothing. `platejs/html/server` keeps those declarations, so a server parse warns about them too.

## Layer and owner

| Concern | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Line height's stored form and the paste parser | Plate | `platejs/standard/basic-styles`, beside `BaseLineHeightPlugin` | the schema and the HTML decoder own what a pasted line height becomes |
| Converting stored text line heights | Plate | `platejs/migrations`, inside the unreleased v54 step, with its own frozen parser | implementation batches amend an unreleased target instead of inventing later schema versions (`docs/vision/plate.md:523-524`), and a released step's output must not move when paste parsing changes |
| Which nodes draw a style | Plate | `platejs` root, `pluginInjectNodeProps.ts` and `PluginDefinition.ts` | the schema decides which values exist; the inject options `isBlock`, `maxLevel` and the exclude lists pick which nodes draw |
| `set` and `clear` on line height, alignment and text indent | Plate | `platejs` root, one helper in `BaseStylePlugins.ts` | callers clear without restating the target match, with the verb color marks already use |
| Hiding pasted black text | nobody, until the styles review rules | neither font kit | a render filter in the copied kit costs native text sync on colored text, and the styles review owns whether to drop black at paste |
| Word line spacing, alignment and text indent | Plate | `platejs/docx`, `xml-builder.ts` | Word reads 240ths of a line under `lineRule="auto"`, and a hanging indent is `w:hanging` |
| Toolbar presets and the Default item | copied UI | `apps/www/src/registry/components/editor/line-height-toolbar-button.tsx` | presets are a product choice (`VISION.md` line 90) |
| Six alignments on media | copied UI only | `getMediaTextAlign` in `caption-static.tsx` and its twin in `caption.tsx` | `platejs/media` may not import basic-styles (`entrypoint-dag.mjs:92`), and live and static siblings keep twin lookup helpers (`docs/vision/plate.md:1180-1183`) |
| The group descriptor's name | Plate | `platejs/layout` and `platejs/layout/react` | `BaseColumnGroupPlugin` owns `columnGroup`, and `BaseColumnItemPlugin` owns `column` |

## Native behavior and proof

| Behavior | Now | Proof surface |
| --- | --- | --- |
| HTML and Word paste of a line height | `150%` and `1.5em` save `1.5`, `1e0` saves 1, `normal` saves nothing, and lengths save nothing with a dropped-property warning | jsdom specs on the decoder, server-parse specs for exponents, and the eight www Word paste specs; native clipboard unproven |
| Typing in colored text | no font kit adds a `query`, so colored leaves keep native text sync | `pipeRenderLeaf` spec on the shipped font kit |
| HTML paste of `text-align: start` | saves `start`, so a stored `start` survives Plate's own HTML round trip | jsdom round-trip spec |
| Undo of the toolbar's Default | one clear operation, undone like a set | package spec on `clear` |
| Word export | whole-number `w:line` for multipliers and an at-least `w:line` in twips for fixed lengths, all six alignments, and `w:firstLine` or `w:hanging` for text indent in the paragraph's one `w:ind`, skipped on list paragraphs, which keep the alignment and line height they draw with | `exportDocx.spec.ts` cases in bun and a run through the copied `BaseEditorKit`; opening the file in Word is unproven |

## Open work

- Migrated v53 format suggestions fail to open or resolve, as before the 2026-10-18 review. `migratePlateV54Suggestions.spec.ts` keeps its one failure, and the migrations typecheck partition keeps its TS2345. Patch: tags derived by migrating both the accepted and the rejected v53 document and comparing them. Owner: the suggestion migration session. Stop: that session's plan panel.
- A listed heading in Word export ignores a line height or alignment that a stylesheet sets on its list or list item. Owner: the documents scope, as a backlog line. Stop: taken or dropped.
- Whether the copied font kit should drop pasted black at paste, now that nothing hides it. Owner: the styles review. Stop: its verdict.
- Text indent's decoder drops a pasted value in any unit but its configured one with no warning, though `pt`, `in`, `cm` and `mm` convert exactly, and Word paste may copy a list item's `text-indent` onto the item. Owner: the styles review, as a backlog line. Stop: taken or dropped.
- An align toolbar item that calls `textAlign.clear`. Owner: the styles review, as a backlog line. Stop: taken or dropped.
- Generated `set` and `clear` for every plugin that owns one element property, the way marks get theirs, which would replace the hand-written helper. Owner: the plugin system, as a backlog line. Stop: taken or dropped.
- Right-to-left media placement of `start` and `end`. Owner: the media review. Stop: `Caption` and `Resizable` taking logical placements.
- Whether media alignment should be its own placement property instead of `textAlign`. Owner: the media review. Stop: its verdict.
- Right-to-left Word export of `start` and `end`. Owner: the documents scope. Stop: an exporter that writes `w:bidi`.
- A configured `nodeKey` that the schema does not store. Owner: the plugin system, as a backlog line. Stop: taken or dropped.
- A server parse keeps `!important` in a pasted line height, so it warns and drops `1.5 !important` where a browser stores 1.5. Owner: the backlog. Stop: taken or dropped.
