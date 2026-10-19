---
review_scopes: [layout]
verdict: pursue
review_basis: [2026-10-04-layout-audit]
work_kind: implementation
review_commit: dc06078008c67fe939dd307760606791c0da2aa4
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/review-records/2026-10-04-layout-audit.json, docs/research/review-scopes/layout.json, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.spec.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.authored-tree.spec.ts, packages/platejs/src/react/features/layout/ColumnPlugin.tsx, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.spec.ts, packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/media/lib/BaseMediaPlugin.ts, packages/platejs/src/internal/plugin/pluginInjectNodeProps.ts, packages/platejs/src/internal/plugin/pluginInjectNodeProps.spec.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/lib/plugin/PluginDefinition.ts, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/internal/xml-builder.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.spec.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/plitejs/src/core/editor-schema.ts, tooling/entrypoints/entrypoint-dag.mjs, apps/www/src/registry/components/editor/line-height.tsx, apps/www/src/registry/components/editor/line-height-toolbar-button.tsx, apps/www/src/registry/components/editor/align.tsx, apps/www/src/registry/components/editor/align-toolbar-button.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/indent.tsx, apps/www/src/registry/components/editor/font.tsx, apps/www/src/registry/components/editor/column.tsx, apps/www/src/registry/components/editor/column-static.tsx, apps/www/src/registry/components/editor/caption-static.tsx, apps/www/src/registry/components/editor/media-image.tsx, apps/www/src/registry/components/editor/media-embed.tsx, apps/www/src/registry/components/editor/media-audio.tsx, apps/www/src/registry/components/editor/media-video.tsx, apps/www/src/registry/components/editor/table.tsx, apps/www/src/registry/components/editor/heading.tsx, apps/www/src/registry/components/editor/editor-static.tsx, apps/www/src/registry/components/editor/insert-toolbar-button.tsx, apps/www/src/registry/components/editor/slash.tsx, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, apps/www/src/registry/components/editor/fixed-toolbar.tsx, apps/www/src/registry/components/editor/plugins-static.ts, apps/www/src/registry/components/editor/list.tsx, apps/www/src/__tests__/package-integration/docx/testDocxDeserializer.tsx, apps/www/src/__tests__/package-integration/docx/alternate_document_path.slow.tsx, apps/www/src/__tests__/package-integration/docx/dummy_item_after_list_item.slow.tsx, apps/www/src/__tests__/package-integration/docx/legal-in.slow.tsx, apps/www/src/__tests__/package-integration/docx/legal.slow.tsx, apps/www/src/__tests__/package-integration/docx/line-height.slow.tsx, apps/www/src/__tests__/package-integration/docx/dummy_item_after_paragraph.slow.tsx, apps/www/src/__tests__/package-integration/docx/lists_sublist_reset.slow.tsx, apps/www/src/__tests__/package-integration/docx/tabs.slow.tsx, apps/www/src/registry/components/editor/font.tsx, apps/www/src/registry/components/editor/font-static.tsx, apps/www/src/registry/components/editor/caption.tsx, packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts, packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx, apps/www/api-reference.config.json, .changeset/layout-v54-runtime.md, .changeset/platejs-column-side-drop.md, .changeset/basic-styles-v54-runtime.md, 'content/docs/(plugins)/(styles)/font.mdx', 'content/docs/(plugins)/(elements)/column.mdx', 'content/docs/(plugins)/(styles)/line-height.mdx', 'content/docs/(plugins)/(styles)/text-align.mdx', 'content/docs/(guides)/plugin.mdx', 'content/docs/(guides)/editor.mdx', 'content/docs/(guides)/document-model.mdx']
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../prosemirror@c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../quill@539cbffd0a13b18e9c65eb84dd35e6596e403158']
---

# Columns, alignment and spacing: one rule for saved layout values

Status: executed
Playbook: plan

**Pursue.** The strongest reason is a measured second authority. The schema decides which line heights a block may save, and the render step keeps its own value list and default. So a pasted `line-height: 1.75` is saved and exported to HTML, yet the editor, the static render and Word export all drop it (`docs/plans/artifacts/2026-10-18-layout-review/probe-a1.log`, `probe-docx-a2.log` in the same folder). The package also ships 1.5 as line height's default, a theme pick, where Vision asks for neutral defaults. The column plugins have crossed names. `BaseColumnPlugin` owns `columnGroup` and `BaseColumnItemPlugin` owns `column`, the only crossed pair under `packages/platejs/src/features/`. The column plugin also has `moveMiddle`, which nothing outside its specs calls and whose `'right'` direction does nothing, and the column docs teach it beside a hook that no longer exists. This review keeps the 2026-10-04 audit's verdict and its requirements. It replaces that audit's line-height target, a schema default set through plugin state, with no package default at all, because no line height is neutral and an app setting would change what documents save.

**The plan.** An arena of three runners picked runner 3's design, which the judge scored 22 of 24 (`docs/plans/artifacts/2026-10-18-layout-review/architect/judge-answer.md`), and three plan panels changed seven of its picks. The schema stores line height only as a positive number, so the browser, HTML export and Word read one form. Paste parses CSS text into that number and warns about the lengths it drops. The unreleased v54 step converts the line heights v53 documents saved as text, and Plate ships no later step, as `docs/vision/plate.md:523-524` asks. Migrated v53 format suggestions, which fail to load at base, go to their own session, because each of three diff rounds found a wrong reject in this plan's repair of them. The render stops hiding values, so `validNodeValues` and `defaultNodeValue` both leave, and no kit hides pasted black any more. Line height, alignment and text indent share one `set` and `clear`, and `set` saves exactly what it is given. Alignment keeps its schema, `start` included. Word export writes line multiples and fixed lengths as the released 53.3.16 exporter does, maps all six alignments, and writes text indent, negative values included. The copied media items place all six alignments. The group plugins become `BaseColumnGroupPlugin` and `ColumnGroupPlugin`, the column plugins keep their names, and `moveMiddle` goes.

## Brief

### What will change?

Every saved line height, alignment and text indent now shows on screen and in Word exports. Line heights are saved as numbers, and the column group plugin has a new name. Review undid this plan's fix for old suggestions. A later Codex review found bugs in the landed change, and a second commit fixes them. Word list paragraphs now keep their alignment and line height. The v54 step now leaves an app plugin's own layout values alone, unless the plugin uses a built-in plugin's name.

### What could go wrong?

Apps built on unreleased v2 code can't open saved documents until they convert their stored line heights. The Close says how. Pasted black text shows. Kits that set a default won't compile. Format suggestions from v53 still break, as before. An app plugin named like a built-in one, such as `lineHeight`, still has its values converted by the v54 step. That fix gets its own session.

## Teach

Block layout is how a block sits and spaces its lines: alignment, line height, indent and columns. Each style is an optional value saved on the block, and a plugin turns it into CSS when the block draws. Columns are structure, a group that holds two or more columns.

Today the schema decides what a block may save, but the draw step keeps its own list and default. So a pasted 1.75 is saved but never drawn. Word paste saves text like 107%, and once that list goes, Word export would turn it into 107 times the spacing.

After this, the schema alone decides. A line height is a positive number. Paste turns 150% into 1.5, and the v54 upgrade step converts text values in older documents. Every saved value draws and exports. Set saves what it is given, and clear removes it, as color marks do. The group plugin gets a name that says it holds the group.

## Public API

The copied line-height kit stops listing values and a default. Every saved line height draws, and the toolbar keeps the five choices it shows.

```tsx before
// apps/www/src/registry/components/editor/line-height.tsx
BaseLineHeightPlugin.configure({
  inject: {
    nodeProps: {
      defaultNodeValue: 1.5,
      validNodeValues: [1, 1.2, 1.5, 2, 3],
    },
  },
  targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
}),
```

```tsx after
// apps/www/src/registry/components/editor/line-height.tsx
BaseLineHeightPlugin.configure({
  targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
}),
```

The toolbar keeps its presets in its own file. A selection whose blocks all have no line height shows Default, a selection that mixes values checks nothing, and picking Default clears the value so the block follows the theme.

```tsx before
// apps/www/src/registry/components/editor/line-height-toolbar-button.tsx
const { nodeProps } = editor.plugin(LineHeightPlugin).inject;

if (!nodeProps) {
  throw new Error('Line height node properties are not configured.');
}
const { defaultNodeValue, nodeKey, validNodeValues = [] } = nodeProps;
const values = validNodeValues.filter((value) => typeof value === 'number');

const value = useSelectionFragmentProp({
  defaultValue: defaultNodeValue,
  key: nodeKey,
});

<DropdownMenuRadioGroup
  value={String(value)}
  onValueChange={(newValue) => {
    editor.plugin(LineHeightPlugin).update.set(Number(newValue));
  }}
>
```

```tsx after
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

Clearing every line height in the document uses the new `clear` instead of setting the old default. Color marks already clear with `clear`, and text indent gets the same `set` and `clear`.

```tsx before
// content/docs/(plugins)/(styles)/line-height.mdx
editor.update.lineHeight.set(2);
editor.update.lineHeight.set(1.5, { at: [] });
```

```tsx after
// content/docs/(plugins)/(styles)/line-height.mdx
editor.update.lineHeight.set(2);
editor.update.lineHeight.clear({ at: [] });
```

The copied align kit stops repeating the package's own values.

```tsx before
// apps/www/src/registry/components/editor/align.tsx
BaseTextAlignPlugin.configure({
  inject: {
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
  },
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

```tsx after
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

Clearing alignment uses `clear`, because `set('start')` now saves `start`, which aligns to the start edge even inside a centered container.

```tsx before
// content/docs/(plugins)/(styles)/text-align.mdx
editor.update.textAlign.set("center");
editor.update.textAlign.set("start", { at: [] });
```

```tsx after
// content/docs/(plugins)/(styles)/text-align.mdx
editor.update.textAlign.set("center");
editor.update.textAlign.clear({ at: [] });
```

The render stops hiding any value, so neither font kit hides pasted black any more. Hiding it through a `query` instead would turn off native text sync for every colored leaf.

```tsx before
// apps/www/src/registry/components/editor/font.tsx
FontColorPlugin.configure({
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
    },
  },
}),
```

```tsx after
// apps/www/src/registry/components/editor/font.tsx
FontColorPlugin,
```

The group plugin is named for the group it owns, matching `editor.update.columnGroup`. The column plugin keeps `ColumnItemPlugin`, a true name for a column inside a group, so no existing name changes meaning. The middle-column command goes.

```tsx before
// content/docs/(plugins)/(elements)/column.mdx
const columnGroup = editor.plugin(ColumnPlugin);
const column = editor.plugin(ColumnItemPlugin);

columnGroup.update.insert({ columns: 3 }, { select: true });
columnGroup.update.setColumns({ at: columnGroupPath, widths: ['33%', '67%'] });
columnGroup.update.toggle({ columns: 2 });
column.update.moveMiddle(columnGroupEntry, { direction: 'left' });
column.update.selectAll();
```

```tsx after
// content/docs/(plugins)/(elements)/column.mdx
const columnGroup = editor.plugin(ColumnGroupPlugin);
const column = editor.plugin(ColumnItemPlugin);

columnGroup.update.insert({ columns: 3 }, { select: true });
columnGroup.update.setColumns({ at: columnGroupPath, widths: ['33%', '67%'] });
columnGroup.update.toggle({ columns: 2 });
column.update.selectAll();
```

## Document shape

Word paste saves this, and the editor, static pages, HTML export and Word export all read it.

```json before
{ "type": "paragraph", "lineHeight": "107%", "children": [{ "text": "Lorem ipsum" }] }
```

```json after
{ "type": "paragraph", "lineHeight": 1.07, "children": [{ "text": "Lorem ipsum" }] }
```

Picking 1.5 in the toolbar saves this. Today it clears the value, because 1.5 is the package default.

```json before
{ "type": "paragraph", "children": [{ "text": "Spaced" }] }
```

```json after
{ "type": "paragraph", "lineHeight": 1.5, "children": [{ "text": "Spaced" }] }
```

Calling `textAlign.set('start')` saves this. Today it clears the value.

```json before
{ "type": "paragraph", "children": [{ "text": "Start edge" }] }
```

```json after
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

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Line height's stored form and the paste parser | Plate | `platejs/standard/basic-styles`, beside `BaseLineHeightPlugin` | the schema and the HTML decoder own what a pasted line height becomes |
| Converting stored text line heights | Plate | `platejs/migrations`, inside the unreleased v54 step, with its own frozen parser | implementation batches amend an unreleased target instead of inventing later schema versions (`docs/vision/plate.md:523-524`), and a released step's output must not move when paste parsing changes, the way the v54 step already keeps its own alignment list (`migratePlateV54Ast.internal.ts:19-26`) |
| The render's value filter and hidden default | Plate | `platejs` root, `pluginInjectNodeProps.ts` and `PluginDefinition.ts` | the schema decides which values exist; the inject options `isBlock`, `maxLevel` and the exclude lists still pick which nodes draw |
| `set` and `clear` on line height, alignment and text indent | Plate | `platejs` root, one helper in `BaseStylePlugins.ts` | callers clear without restating the target match, with the verb color marks already use |
| Hiding pasted black text | nobody, until the styles review rules | neither font kit | a render filter in the copied kit costs native text sync on colored text, and the styles review owns whether to drop black at paste |
| Word line spacing, alignment and text indent | Plate | `platejs/docx`, `xml-builder.ts` | Word reads 240ths of a line under `lineRule="auto"`, and a hanging indent is `w:hanging` |
| Toolbar presets and the Default item | copied UI | `apps/www/src/registry/components/editor/line-height-toolbar-button.tsx` | presets are a product choice (`VISION.md` line 90) |
| Six alignments on media | copied UI only | `getMediaTextAlign` in `caption-static.tsx` for the static items and its twin in `caption.tsx` for the live ones, mapping each alignment to the three placements `Caption` and `Resizable` take | the align kit targets four media types, `platejs/media` may not import basic-styles (`entrypoint-dag.mjs:92`), and live and static siblings keep twin lookup helpers (`docs/vision/plate.md:1180-1183`) |
| The group descriptor's name | Plate | `platejs/layout` and `platejs/layout/react` | the group descriptor is the one name in `features/` that names its neighbor's key |

## Hard cuts and app migration

The Pursue verdict counts as the owner's ask for these cuts, as the Hard cut section of `.agents/playbooks/references/architecture.md` says, and each cut is a `look` row under Defaults.

- `inject.nodeProps.validNodeValues` and `inject.nodeProps.defaultNodeValue` leave `BaseInjectProps`, the render and the docs. Font color's package default `'black'` goes with them, and no copied kit hides pasted black text.
- Line height's package default `1.5` and alignment's package default `'start'` go.
- `update.set` no longer clears when it receives a default. `update.clear(options?)` is the clear, on line height, alignment and text indent.
- The line-height schema stops accepting text. A stored `"107%"` or `"normal"` makes the editor refuse to load until a migration step converts it.
- `moveMiddle` and `MoveMiddleColumnOptions` go.
- `BaseColumnPlugin` and `ColumnPlugin` become `BaseColumnGroupPlugin` and `ColumnGroupPlugin`. `BaseColumnItemPlugin` and `ColumnItemPlugin` keep their names.

What breaks in apps:

- A kit that sets `validNodeValues` or `defaultNodeValue` stops type-checking. Delete both lines, and move any list of choices into the toolbar. Because both fail, a kit cannot keep a stale `defaultNodeValue: 1.5` that would hide a saved 1.5 while HTML and Word export it.
- Code that calls `set(1.5)` or `set('start')` to clear now saves that value. Call `clear`.
- Every reference to `ColumnPlugin` or `BaseColumnPlugin` stops compiling. Rename each to `ColumnGroupPlugin` or `BaseColumnGroupPlugin`. No name changes meaning, so nothing compiles against the wrong plugin.
- Documents saved by published releases, the v54 betas included, are v53-shaped, and the v54 step converts their text line heights. Their format suggestions still don't migrate, as at base, so accept or reject them in v53 first. Line heights those kits hid, such as Word's `107%`, start drawing.
- An app built from unreleased v2 source with line height installed gets a new schema fingerprint, so every saved document refuses to load, with or without a line height. The app bumps its schema version, supplies the old fingerprint from any stored envelope, and registers its own step. That step reads every stored line height the way the v54 step does and drops any value that is then not a positive number, on nodes in every root and on both sides of `lineHeight` suggestion tags, as the Close spells out. No changeset says this, because no release carries the old fingerprint.
- Pasted black text draws black in every kit, dark themes included, until the styles review decides whether to drop it at paste.

The copied static column kit changes like this. The live kit in `column.tsx` and the toolbar, slash and turn-into items get the same rename.

```tsx before
// apps/www/src/registry/components/editor/column-static.tsx
export const BaseColumnKit = [
  BaseColumnPlugin.configure({
    component: ColumnGroupElementStatic,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementStatic,
  }),
];
```

```tsx after
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

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| HTML and Word paste of a line height | `150%` and `1.5em` save `1.5`, `1e0` saves 1, `normal` saves nothing, and lengths save nothing with a dropped-property warning | jsdom specs on the decoder, server-parse specs for exponents, and the eight www Word paste specs; native clipboard unproven |
| Typing in colored text | unchanged: no font kit adds a `query`, so colored leaves keep native text sync | `pipeRenderLeaf` spec on the shipped font kit |
| HTML paste of `text-align: start` | unchanged: saves `start`, so a stored `start` survives Plate's own HTML round trip | jsdom round-trip spec |
| Undo of the toolbar's Default | one clear operation, undone like a set | package spec on `clear` |
| Word export | whole-number `w:line` for multipliers and an at-least `w:line` in twips for fixed lengths, as released 53.3.16 writes, all six alignments, and `w:firstLine` or `w:hanging` for text indent in the paragraph's one `w:ind`, skipped on list paragraphs, which keep the alignment and line height they draw with | `exportDocx.spec.ts` cases in bun and a run through the copied `BaseEditorKit`; opening the file in Word is unproven |

## Main changes

- `pluginInjectNodeProps.ts` stops filtering by a value list or a default, so the live and static renders draw every value the schema admits.
- One helper gives the line-height, alignment and text-indent plugins the same `set` and `clear`, and `set` stops reading render config, so the render config no longer decides what gets saved.
- `xml-builder.ts` writes `w:line` as a whole-number multiple for unitless, percent and `em` line heights and as an at-least line in twips for lengths, as the released 53.3.16 exporter does, drops the branch that multiplied an `auto` line by the font size, maps `start` to left, `end` to right and `justify` to both, and writes `text-indent` into the paragraph's one `w:ind`, as `w:firstLine` or, when negative, `w:hanging`, except on a list paragraph. `buildList` gives each numbered, bulleted or to-do paragraph the alignment and line height that its table cell, listed block, list and list item set, and the nearest one wins. Word's own stylesheet reader also takes a line height written with an exponent, such as `1.5e0`.
- The v54 step turns stored text line heights into numbers with its own frozen parser and drops `normal`, unreadable, zero and negative ones, beside its existing alignment normalization. It converts `lineHeight`, `textAlign`, `indent`, `listStart` and `listRestart` only on a property declared by the plugin named `lineHeight`, `textAlign`, `indent` or `list`, read from a private map the migration target records at compile time. So an app plugin with another name keeps its own property with the same key, and a target copied outside `defineDocumentMigrations` throws a named error.
- The HTML decoder's line-height parser reads exponents, such as `1e0` and `1.5e2%`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens next | Review the plan, then build it | Stop at the plan | hold | big |
| How the work lands | Its own worktree, pushed to next when done (look) | Left uncommitted in the main checkout, as the first brief said | main checkout | detail |
| A block with no line height | Follows the app's theme, and the package sets no default (look) | Keep 1.5 as the package default | keep default | big |
| Line heights the toolbar doesn't list, such as a pasted 1.75 | Show and export them as saved (look) | Keep hiding them | hide values | big |
| Line heights saved as text, like 107% from Word | Saved as numbers, and old documents convert (look) | Keep the text and teach every exporter to read CSS | keep text | big |
| Documents from apps built on unreleased v2 source | Only the v54 step converts, so those apps bump their version and write their own small conversion, which the Close shows (look) | Ship a separate upgrade step for them to register | ship step | big |
| Pasted fixed line heights, such as 24px or normal | Saved as nothing, so they follow the theme, with a warning for each | Keep them as text | keep lengths | small |
| Migrated v53 suggestions, which fail to load at base | Left to their own session, which plans a new repair with its own panel, because each of three diff rounds found a wrong reject in this plan's repair. This plan converts only nodes (answer) | Repair them here, as a new plan iteration with `architect`, a plan panel and a diff panel | repair suggestions | big |
| Getting back to the theme's line height | A Default item in the toolbar | Pick 1.5, which no longer clears | no default item | small |
| Picking 1.5 in the toolbar | Saves 1.5 (look) | Clears the value, as today | clear default | small |
| Who lists the line height choices | The copied toolbar | The plugin config, as today | kit presets | small |
| Alignment set to start | Saved as start, and a separate clear removes it (look) | Never saved, as the verdict first said | omit start | small |
| Pasted start alignment | Saved as start, as today, because Plate must warn about any pasted property it drops (look) | Saved as nothing, without a warning | drop pasted start | detail |
| Media alignment | All six draw on images, embeds, audio and video, each placed left, center or right by a copied helper with a live and a static twin, and the media insert type stays as it is | Media keeps three, left to the media review | media three | small |
| Word export of start and end | Left and right | Left out, as today | skip start end | detail |
| Text indent in Word | Written as a first-line indent, or a hanging indent when negative, and skipped on list paragraphs | Left out, as today | skip indent | detail |
| Column plugin names | Only the group plugin is renamed, and the column plugin keeps its name (look) | Swap the names so the old group name means the column, as the arena picked | swap names | big |
| The middle-column command | Removed, since nothing calls it and one of its two directions does nothing (look) | Keep it | keep middle | small |
| Font color's black default | Gone everywhere, so pasted black draws in every kit until the styles review decides whether to drop it at paste (look) | Both font kits hide black through a query, which costs native text sync on colored text and needs a typing benchmark | keep black hidden | small |
| The command that removes a style | Named clear, as color marks already name it | Named unset | unset verb | small |
| Text indent commands | Set and clear, like line height and alignment | Callers keep setting the property on nodes directly | no indent commands | small |
| Where the paste parser lives | Beside the line-height plugin, with a frozen copy in the migration step | One parser shared by paste and migration | shared parser | detail |
| Review seats while Codex can't log in | Opus seats, marked same-family | Wait for Codex before each review | wait codex | detail |
| Once Codex was back | Codex reviewed the landed commit, and its fixes landed as a second commit | Skip the Codex round | skip codex round | detail |
| Where the review lives | The layout subject page | A one-off page | one-off | detail |
| The plugin key mismatch the judge found | One line in the backlog | Fix it in this plan | fix node key | detail |

## Design

Three Opus runners each designed a target from the same task, and an Opus judge scored anonymized copies (`docs/plans/artifacts/2026-10-18-layout-review/architect/`). The Codex runners could not log in, so the arena is same-family.

| Candidate | Line height | Alignment | Saved-data cost | Score |
| --- | --- | --- | --- | --- |
| cand-1, runner 1 | any string, parsed by each exporter | no default, `start` stored | none | 21 |
| cand-2, runner 2 | number or `'normal'`, with `default` and `omitDefault` | `start` omitted by the schema | both fingerprints change | 16 |
| cand-3, runner 3 (base) | positive number, CSS parsed at paste | schema unchanged, pasted `start` dropped | line height's fingerprint changes | 22 |
| control | the kits lose their inject config and nothing else | unchanged | none | loses, since Word paste text exports at 107 times the spacing and the toolbar breaks |

Grafts into cand-3:

1. cand-1's gated rename, narrowed by the panel to the group alone. Code goes through the TypeScript rename and must typecheck, and MDX, JSON, skills and changesets go through whole-word edits checked by a grep that skips file paths.
2. cand-1's restraint on font color, revised by both panels. No kit hides pasted black, and the styles review decides whether the copied kit should drop it at paste.
3. cand-2's placement. The v54 step converts v53 documents and their suggestions with its own frozen parser, and no later step ships.
4. cand-2's paste table, now the line-height docs contract, and its extra silent sites, the `migratePlateV54Ast.spec.ts` fixtures and the docs' `<API name>` sections.
5. cand-1's proof gates. Alignment's schema identity stays the same for an editor with only the align kit, and Word writes 1.75 as 420, a pasted `150%` as 360, 1.07 as 257 and `end` as right.
6. Every stored text fixture changes, `107%` (9), `115%` (7), `normal` (6), `150%` (2) and `200%` (1).

Named limits, each a case a losing candidate handled that the base drops:

- Pasted fixed lengths and `normal` save nothing. cand-1 kept them as text.
- Line height's schema fingerprint changes for apps built from unreleased v2 source, so every saved document, room and history of such an app with line height installed refuses to load until the app bumps its version and converts its stored line heights itself. No published release carries the old fingerprint. cand-1 cost saved documents nothing.
- The v54 step drops a stored `12pt` or other length silently, because a migration step has no channel to report a loss, the same way it already drops an unknown `textAlign`.
- Pasted black text draws, dark themes included, because no render filter remains to hide it.
- Word `start` and `end` map to left and right, which is wrong for right-to-left text, because the exporter writes no `w:bidi`.
- A stored `start` differs from no value only under an aligned ancestor. The only one in the copied UI is the table header cell's `text-left`, and there the two differ only in right-to-left text.
- Media placement maps `start` and `justify` to left and `end` to right, which is wrong for right-to-left text, because `Caption` and `Resizable` take only left, center and right.

Challenge delta from plan panel round 1, three Opus seats labeled same-family (`plan-panel-r1-seat-{a,b,c}.md`). Four critical findings were applied. Seats A and B showed that keeping `defaultNodeValue` would let an upgraded kit hide a saved 1.5 while HTML and Word export it, so it leaves with `validNodeValues`. Seat B showed that apps on the unreleased branch had no conversion, so `migrateLineHeight` ships as a step with its own frozen parser. Seat C showed that no rule asks a plugin name to equal its key (`FontColorPlugin` owns `color`), so only the crossed group name changes, and no name changes meaning. Seats A, B and C found the pending column changesets still teaching the old names. The warnings changed `unset` to `clear`, gave text indent the same commands and Word export, kept the media type, fixed the rename gate, added committed Word export cases, added loss diagnostics for pasted lengths, and corrected the fixture count to eight.

Challenge delta from plan panel round 2, three Opus seats labeled same-family (`plan-panel-r2-seat-{a,b,c}.md`). One critical finding, raised by all three seats, was applied. The static font kit installs a bare font color plugin, so once the package default goes, every editor built from `BaseEditorKit` would draw the pasted black that the live editor hid, and a `query` in both kits would turn off native text sync for colored text. So no kit hides black, and the styles review decides. All three seats also read `docs/vision/plate.md:523-524` as forbidding a later schema version for an unreleased target, so `migrateLineHeight` goes and only the v54 step converts, which reverses round 1's fix for seat B. The warnings made the v54 step convert suggestion tags and drop zero and negative numbers, made Word write a negative text indent as `w:hanging` in one `w:ind`, moved release notes out of the zero gates with an expected path-only count of 13, and fixed the toolbar's descriptor key. Seat C's stored `start` drop and seat B's file rename stay dismissed.

Challenge delta from plan panel round 3, three Opus seats labeled same-family (`plan-panel-r3-seat-{a,b,c}.md`), the last plan round. One critical finding, raised by all three seats, was applied. Since `2e865a0bc4`, a format tag needs `write`, and the v54 suggestion step writes none, so every migrated v53 update suggestion fails to load at base (`suggestions-base-a1.log`). Step 4 now repairs those tags and converts both of their sides. Seats B and C showed from the `legal` fixture that Word writes `line-height: normal` as an author's pick, so every pasted line height the parser cannot store warns. The nits made Word skip text indent on numbered paragraphs, kept line height's empty `nodeProps`, moved gates to each phase's exit, and sent text indent's unit handling to the backlog.

Diff panel round 3, three Opus seats labeled same-family (`diff-panel-r3-seat-{a,b,c}.md`), the last diff round, reverted that tag repair. Round 2 had already replaced its guard once. Seats A and C each found a v53 suggestion that loaded and then rejected to a wrong value: a removed list number came back as an explicit start, and `listRestart: 0` restarted the list at 0. Seat B found the same gap under a schema that keeps unknown keys. The probe stored both wrong values before the revert (`r3-reject-probe-head-a1-a1.log`). After it, each case fails to open or resolve, as at base (`r3-reject-probe-reverted-a1.log`). The project's panel rule takes a mechanism out of the review loop once it has had its one replacement. This plan's goal needs only node conversion, so the suggestion step is back to its base code, and its repair goes to its own session.

Diff panel round 4, the two Codex seats on the landed commit (`diff-panel-r4-seat-{astra,sol}.md`), was the first review from another model family. Its three critical findings were fixed in a second commit. Both seats showed that the v54 step converted or dropped an app's own `lineHeight`, `textAlign`, `indent`, `listStart` and `listRestart`, because it checked only that some property had the key. Only line height was this plan's regression. All five now convert only on a property that the first-party plugin of that name declares. Astra showed that HTML import dropped a line height written with an exponent. Sol showed that Word export dropped the alignment and line height of numbered, bulleted and to-do paragraphs, as 53.3.16 did. The warnings tightened the recipe for unreleased v2 builds and the `pnpm check` attribution.

Diff panel round 5, Opus and both Codex seats on round 4's fixes (`diff-panel-r5-seat-{opus,astra,sol}.md`), applied no critical finding, so no round follows. Sol found that the new check compares plugin names, so an app plugin named `lineHeight` still counts as first-party. Astra found that the profile's legacy list conversion checks ownership without root context. Both hold across the whole v54 step, which finds every first-party plugin by name and may not import those plugins (`tooling/entrypoints/entrypoint-dag.mjs:369-371`), so they go to their own session. Round 4's check already converts only a subset of what the base converted. Both Codex seats showed that a list paragraph in Word took one host's styles and missed its item's, its nested list's and its table cell's, and that Word's own reader rejected a stylesheet `1.5e0`. Both are fixed. Opus's warning made the recipe say how to read stored values. Its nits added a `w:numPr` assertion to the Word case, a copied-kit test and a named error for a copied migration target.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Render value filter | `validNodeValues` and `defaultNodeValue` on `inject.nodeProps`, read by the render and the toolbar | gone | the schema property | a second authority hides saved values (P1, P6, `blast-safety-a3.log`) | align, line-height and font kits, the toolbar, `plugin.mdx`, `font.mdx`, `line-height.mdx`, `text-align.mdx` and their twins, generated registry | static render draws 1.75, 1.5 and `start`; Word writes 420 | an app that relied on hiding values sees them | cut |
| Line height value | number or any text, package default 1.5 | positive number, no default | `BaseLineHeightPlugin` schema | one form for browser, HTML and Word (P9, P10) | kit, toolbar, docs, Word paste fixtures, v54 step | spec cases and the P9 rerun | fingerprint change; text docs refuse to load | rearchitect |
| Line height paste | saves the CSS text | parses to a multiplier, drops `normal` and lengths | the HTML decoder | Word paste stores `107%` today | the docs paste table | decoder spec and www Word paste specs | pasted fixed spacing is lost | rearchitect |
| Alignment default | package `'start'` hides it, `set('start')` clears | no default, `start` stored and pasted | `BaseTextAlignPlugin` | `start` is not absence under an aligned ancestor | text-align docs and twin | schema identity unchanged; round-trip spec | stored `start` beats an app's aligned container | rearchitect |
| Clearing a style | `set(default)`, and nothing for text indent | `update.set(value, options?)` and `update.clear(options?)` | one helper for the line-height, alignment and text-indent plugins | no sentinel value, and the verb color marks already use | toolbar, docs, the basic-styles changeset | package spec | none found | rearchitect |
| Text indent in Word | not written | `w:firstLine`, or `w:hanging` when negative, in the paragraph's one `w:ind` | `xml-builder.ts` | every admitted value exports, signed values included | none | `exportDocx.spec.ts` cases for 1, -1, a margin plus a text indent, and a blockquote | none found | rearchitect |
| Word line spacing | `parseFloat` times 240, times font size when one is set | multiplier times 240, rounded, and an at-least line in twips for lengths, as released 53.3.16 writes | `xml-builder.ts` | `w:line` is 240ths of a line under `auto` (P9) | none | P9 rerun and a `24px` stylesheet case | Word reading rounded values is unproven | rearchitect |
| Word alignment | four values, `start` and `end` dropped | six values mapped | `xml-builder.ts` | every admitted value exports (P8) | none | P8 rerun | right-to-left text maps wrong | rearchitect |
| Media alignment | three values honored, the rest draw centered | six values mapped to three placements through `getMediaTextAlign` and its live twin | copied media items, the static twins that draw alignment, and both captions | the align kit targets four media types | registry media items | typecheck and static render | right-to-left placement maps wrong | rearchitect |
| Font color default | package `defaultNodeValue: 'black'` hides pasted black text in both kits | no default, so every kit draws it | the styles review, for whether to drop black at paste | the render hides no value, and a `query` would cost native text sync on colored text | `font.tsx`, `font.mdx` and twin | static render of pasted black through `BaseEditorKit`, and a `pipeRenderLeaf` case keeping DOM text sync for colored text | pasted black draws on dark themes | cut |
| Column group descriptor name | `BaseColumnPlugin` owns the group, `BaseColumnItemPlugin` the column | `BaseColumnGroupPlugin` and `ColumnGroupPlugin` for the group, the column unchanged | `platejs/layout` | the group name names its neighbor's key | code, docs, skills and two pending changesets | typecheck after the rename, the path-skipping grep at 0 with 13 path-only lines, and release-note lines read by hand | none, every old group reference stops compiling | rename |
| `moveMiddle` | column command with `MoveMiddleColumnOptions` | gone | none | no caller; `'right'` does nothing | column docs and twin | typecheck and column specs | none found | cut |
| `useDebouncePopoverOpen` in docs | taught, but missing from the code | gone from the docs | column docs | the hook no longer exists | column docs and twin | docs check | none | cut |
| v54 step | normalizes stored `textAlign` on nodes, and writes suggestion tags with no `write`, which fail to load since `2e865a0bc4` | also converts stored line heights on nodes with its own frozen parser, and leaves suggestion tags as at base for their own session | `platejs/migrations` | amends an unreleased target instead of inventing a later schema version (`plate.md:523-524`) | `document-model.mdx` and twin, which state the suggestion limit, and one changeset sentence for builds from unreleased source | the AST migration spec's line-height cases | apps built from unreleased source convert their own documents | rearchitect |
| Configured `nodeKey` | render prefers a configured key the schema may not store | unchanged | plugin system (`editing` scope) | outside this plan's values and names | backlog line | none | a style plugin can draw nothing | defer |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Each step lands as part of one squashed commit through `node .agents/pstack/land.mjs`.

### Phase 1: Style values

Keep the phase when the decoder, migration and Word cases below pass, every touched spec passes, the typecheck across packages and apps is green, and the render filter gate in `gates-r3.sh` reads 0 lines, against 60 at base. Revert the whole phase otherwise, since its parts share the stored form.

- [x] Cut `validNodeValues` and `defaultNodeValue` from `BaseInjectProps`, `pluginInjectNodeProps.ts` and the `query` arguments, drop line height's `1.5`, alignment's `'start'` and font color's `'black'` package defaults while line height keeps an empty `nodeProps: {}`, and delete the font kit's `configure` so `font.tsx` installs a bare `FontColorPlugin`. Proof: `pluginInjectNodeProps.spec.ts`; `blast-safety.spec.ts` rerun on the shipped kits, drawing a stored 1.75, 1.5 and `start`; a static render of pasted black through `BaseEditorKit` drawing `color: black`; and a `pipeRenderLeaf` guard case showing colored text under the shipped `FontKit` keeps DOM text sync.
- [x] Narrow line height to a positive number with `isLineHeight` and `parseLineHeight` beside `BaseLineHeightPlugin`, parse at the HTML decoder, and report every pasted line height it cannot store through the decode context's `report` as a dropped property, keywords included. Proof: decoder spec cases for `150%`, `1.5em` and `107%` saving numbers; `normal`, `24px`, `0`, `-1` and `abc` saving nothing with a warning, narrowed in the build to `normal`, `24px`, `1.5rem` and `0`, because jsdom and the browser blank `style.lineHeight` for `-1` and `abc` before any decoder runs; the `legal` fixture's `line-height: normal` paragraph warning; and a stored `"107%"` refusing to load.
- [x] Give line height, alignment and text indent the same `set` and `clear` from one helper, each using the plugin's match. Proof: spec cases for `set(1.5)` and `set('start')` saving their values and `clear` removing each of the three styles; `editor.read.schema.identity()` for an editor with only the align kit still `fnv1a64:fc917d301389cde9`, its value at base; and a stored `start` kept through HTML export and import.
- [x] Make the v54 step convert stored text line heights with its own frozen parser in `platejs/migrations`, and drop zero, negative, non-finite and unreadable values. Leave the suggestion step as it is at base. Its format tags carry no `write`, which `2e865a0bc4` made required (`suggestions-base-a1.log`). Diff round 3 reverted this plan's repair of those tags, and their own session plans the next one. Export nothing new. Proof: migration cases turning `"107%"` into 1.07, `"1.38"` into 1.38, `"150%"` and `"1.5em"` into 1.5, and dropping `"normal"`, `"12pt"`, `0` and `-1`; a line height under `roots`; every other migration spec passing except the suggestion spec's one base failure; and the entrypoint graph check.
- [x] Write Word's `w:line` as a whole-number multiple for unitless, percent and `em` line heights and as an at-least line in twips for lengths, as the released 53.3.16 exporter does. Delete the font-size branch, map all six alignments, and write text indent into the paragraph's one `w:ind`, as `w:firstLine` or, when negative, `w:hanging`, and skip it on a list paragraph, as the blockquote branch skips its indent. Proof: `exportDocx.spec.ts` cases for 1.75 writing 420, 1.07 writing 257, a paragraph with both a font size and a line height, a stylesheet `line-height: 24px` writing an at-least `w:line` of 360, `start`, `end` and `justify` writing left, right and both, a text indent of 1 writing its first-line indent, -1 writing a hanging indent, a paragraph with a margin and a text indent writing one `w:ind` with both, a blockquote with a text indent, and a numbered list paragraph with a text indent keeping its list indent.
- [x] Change every stored text line height in the eight Word paste fixtures to its number, and remove the `normal` ones. Proof: the eight www Word paste slow specs pass: `alternate_document_path`, `dummy_item_after_list_item`, `dummy_item_after_paragraph`, `legal-in`, `legal`, `line-height`, `lists_sublist_reset` and `tabs`.
- [x] Reduce the copied line-height and align kits to their targets, give the line-height toolbar its presets, a Default item and a mixed selection that checks nothing, and give the align toolbar the same mapping so a mixed selection checks nothing. Proof: registry typecheck and a hand drive of the line-height toolbar picking Default, 1.5 and 2, then selecting one block at 1.5 and one at 2, and of the align toolbar on one centered and one right-aligned block.
- [x] Make `getMediaTextAlign` in `caption-static.tsx` map `start` and `justify` to left, `end` to right and an unset alignment to center, give `caption.tsx` its live twin, and use them in the four media items and the static twins that draw alignment, with `AlignedMediaInsertInput`, `Caption` and `Resizable` unchanged. Proof: registry typecheck and a hand drive of an image set to end and justify.
- [x] Through `plate-docs`, update `line-height.mdx` with the paste table and `clear`, `text-align.mdx` with `clear`, `font.mdx` and `plugin.mdx` without `defaultNodeValue` and `validNodeValues`, and `document-model.mdx` for the v54 step's line-height conversion, each with its Chinese twin. Proof: the docs checks and a preview of each page.

### Phase 2: Columns

Keep the phase when the typecheck, the column, Word export and turn-into specs pass, and `gates-r3.sh` reads 0 lines for the group gate, against 106 at base, with 13 path-only lines, the 9 at base plus the 4 one-line imports whose identifier changes, and 0 for the `moveMiddle` gate, against 16 at base. Revert it otherwise; phase 1 stands alone.

- [x] Delete `moveMiddle`, `MoveMiddleColumnOptions`, their spec cases and their `apps/www/api-reference.config.json` entry. Proof: typecheck and the column specs.
- [x] Rename the group with the TypeScript rename, `BaseColumnPlugin` to `BaseColumnGroupPlugin` and `ColumnPlugin` to `ColumnGroupPlugin`, and `ColumnDocx` to `ColumnGroupDocx` in `docxStaticComponents.tsx`, then make whole-word edits in MDX, JSON and skills, the `describe` titles at `BaseColumnPlugin.spec.ts:58` and `:207`, the local `BaseColumnPlugin` stub in `migratePlateV54Ast.spec.ts` and the comment in `apps/www/src/__tests__/package-integration/ai-utils/__tests__/createTestEditor.ts`. In the two pending column changesets, every old name becomes the new one except a line that maps the v53 name to the new one. Proof: a green typecheck across packages and apps right after the TypeScript rename, and each release-note line `gates-r3.sh` lists mapping an old name to its replacement.
- [x] Confirm the schema adoption check and Word export pass with no baseline diff, since the baseline names only `BaseColumnItemPlugin` and file paths, and the Word component map is keyed by `.name`. Proof: `tooling/check-plate-schema-adoption.mjs` and `exportDocx.spec.ts`.
- [x] Through `plate-docs`, rename the group plugins in `column.mdx` and drop `moveMiddle` and `useDebouncePopoverOpen`, with the Chinese twin. Proof: the docs checks and a preview of the page.

### Phase 3: Release

Keep the phase when every generated file matches its source and `pnpm check` passes. A failure here never reverts phases 1 or 2; fix it in place.

- [x] Run `pnpm brl`, `pnpm --filter www build:registry`, the `plate generate` schema output and the API reference manifest. Proof: each generator's output diff and its check mode.
- [x] Amend the pending changesets in place: `layout-v54-runtime.md` for the group rename, with one line mapping v53's `ColumnPlugin` to `ColumnGroupPlugin`, and for removing `moveMiddle`; `platejs-column-side-drop.md` for `ColumnGroupPlugin`; and `basic-styles-v54-runtime.md` for `clear`, text indent's commands, the removed inject options, font color's removed black default, and its stale `codecs: ({ defineCodecs })` line, which becomes `formats: ({ defineFormats })`. Write one changeset for the v54 line-height conversion, the paste diagnostics and Word export, leaving builds from unreleased v2 source to the Close: bump the schema version, list the old fingerprint in `sourceFingerprints`, and read every stored line height on nodes in every root and on both sides of `lineHeight` suggestion tags the way the v54 step does, dropping any value that is then not a positive number. Write one registry changelog entry for the kits, both toolbars, the font kit and the media items. Proof: the changeset files, the registry changelog check, and `gates-r3.sh`'s release-note listing read by hand, each old name only in a line that maps it or says it was removed.
- [x] Run `best-api repair` on the layout subject. Proof: the folded subject file and a grep showing no skill or Vision file teaches the rejected shapes.
- [x] Run `pnpm check` once on the settled change. Proof: its log.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Arena picked the target (reviews: api-plan) | yes | `docs/plans/artifacts/2026-10-18-layout-review/architect/judge-answer.md` |
| Base premises proved by running them | yes | P8, P9 and P10 logs |
| Each step's cheapest control at base, in a detached worktree | yes | `base-control-a1.log`, `base-control-b-a1.log` and `gates-base-a1.log`: each failing half failed at `dc06078008` as its step claims |
| Plan panel on the finished plan (reviews: api-plan) | yes | round 1: `plan-panel-r1-seat-{a,b,c}.md`, four critical findings applied; round 2: `plan-panel-r2-seat-{a,b,c}.md`, one critical finding applied; round 3: `plan-panel-r3-seat-{a,b,c}.md`, one critical finding applied, the last round before the build |
| Parser placement under the entrypoint graph | yes | `base-control-b-a1.log`: `platejs/migrations` importing the style feature fails `entrypoint-dag(no-forbidden-imports)`, so the migration step keeps its own frozen parser |
| Blast radius on the public API change | yes | `blast-radius.md` and `blast-safety-a3.log`: with no package default and no value list, all six stored cases draw at base, and a kit that passes `defaultNodeValue: undefined` keeps the package default. Plan panel round 2's three seats traced the moves round 1 added, the font kit, the export and text indent's commands, and step 1's proof runs on the shipped static kit |
| Rename and cut gates at base | yes | `gates-r3-base-a2.log`: group gate 106 lines with 9 path-only lines skipped, `moveMiddle` gate 16, render filter gate 60, and 7 release-note lines in the two column changesets |

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Focused proof for each step | `r3-package-specs-a1.log`: 525 pass and 1 fail, the suggestion spec's base failure; `r3-migration-specs-a1.log`: 120 pass and the same failure; `r3-slow-a1.log`: 51 pass, the eight Word paste specs among them; after rounds 4 and 5, `r5-final-package-specs-a1.log`: 536 pass and the same failure, `r5-www-docx-set-a1.log`: 46 pass, and `r5-slow-a1.log`: 51 pass |
| `plate-docs` on each named page | `d4-check-docs-a1.log` and `d4-docs-parity-a2.log`, then each page read on `:3519` after the round 1 to 3 docs fixes (`drive-notes.md`) |
| Hand drive of the changed pages | `drive-notes.md`: the line-height toolbar, the align toolbar and image placement driven, and every changed page opened |
| Playtest scope check | `drive-scope.sh check` prints `hand drive done`; `r3-load-cells-a1.log`: 226 pages, 0 with problems |
| Shared-code review (thermos) | skip: the `api-build` and `push` rows owe a panel on the diff |
| oxlint before the diff panel | `merged-lint-a2-a1.log`, `r3-lint-a1.log` after round 3, `r4-lint-a1.log` before round 5 and `r5-lint-a1.log` after it |
| Writing passes | `deslop` and `no-comments` on the build and on each round's fixes, `unslop` on each round's prose, then `unslop` and `bro` on the Close |
| Diff panel (reviews: api-build, push) | rounds 1 to 3, `diff-panel-r{1,2,3}-seat-{a,b,c}.md`, all Opus and labeled same-family; round 3's criticals reverted the suggestion repair. Round 4, `diff-panel-r4-seat-{astra,sol}.md`, two Codex seats on the landed commit, whose three criticals the second commit fixes. Round 5, `diff-panel-r5-seat-{opus,astra,sol}.md`, on those fixes, whose two criticals go to their own session |
| `best-api repair` | the folded `docs/plans/topics/layout.md`; `close-gates-a1.log`: group 0 with 16 path-only lines, the 13 expected plus three file paths in subject files, `moveMiddle` 0, render filter 0; `close-teaching-sweep-a1.log`: no skill, Vision or subject file teaches a cut name |
| `pnpm check` | `close-pnpm-check-a1.log`: 15 of 26 steps pass, every generator's check mode among them. Each of the 11 red steps also fails at `origin/next` `7b7b76573b` (`close-attribute-a1.log`, `close-next-smoke-a1.log`). Three specs inside them fail only beside other specs, and two of those were never run grouped at `7b7b76573b`. The run's one new failure, two knowledge citations in the layout subject, was fixed after it. Not rerun for the second commit, whose files the targeted specs, both typechecks (`r5-typecheck-packages-a1.log`, `r5-www-typecheck-a1.log`, only the base TS2345) and lint cover |
| Landed through `land.mjs` | `aa2f91c342`, then the second commit with the round 4 and 5 fixes |

## Verification

- Package, migration and Word paste specs pass on the final bytes, except the suggestion spec's one failure, which fails the same way at base and at `origin/next` `7b7b76573b`. `pnpm check` fails 11 of 26 steps, each of which also fails at `7b7b76573b`.
- The rename and cut gates read 0 across code, docs, skills, Vision and subject files, and every changed page renders on the dev server with no error.
- Proof stops short of native clipboard paste, of opening an exported file in Word and of right-to-left text. Codex seats reviewed only the landed commit and its fixes.

## Close

**Reversal.** Diff panel round 3 reverted this plan's repair of migrated v53 format suggestions. Two of its seats each found a suggestion that loaded and then rejected to a wrong value. Round 2 had already replaced the repair's guard once. The suggestion step and its specs are back to base code, so those suggestions fail to open or resolve as they did before this plan. Their fix goes to its own session.

**Deviations.** The work landed from its own worktree through `land.mjs`, not as uncommitted changes in the main checkout, because the owner moved the project to trunk delivery before the build. The three plan panels and the first three diff panels ran three Opus seats, labeled same-family, because both Codex seats refused the logged-in account until the owner's "codex is back". Diff round 4 then ran the two Codex seats on the landed commit, and its fixes landed as a second commit. A raw JSON response runs no visit reporter, so the four registry changelog files route their drive cells to `/docs/releases`, which renders their entry, and the lead read the JSON back in the browser. `/pstack:correct` did not run on the teaching class. Its tool already runs in `best-api repair`, and its gate is open work in `docs/plans/topics/correct.md`. The round 1 and 2 seats' hits were the subject file, which the plan-page rule keeps at its old state until the fold.

**What landed.** `aa2f91c342`, one squashed commit on `next` built from 15 branch commits:

- Every saved line height, alignment and text indent draws in the live and static renders. `validNodeValues` and `defaultNodeValue` leave `inject.nodeProps`, and line height's `1.5`, alignment's `start` and font color's `black` package defaults go.
- Line height stores a positive number. Paste parses `150%`, `1.5em` and Word's `107%` into numbers and warns about each value it drops. The v54 step converts stored text line heights.
- Line height, alignment and text indent share `set` and `clear`, and `set` saves what it receives.
- Word export writes line multiples and fixed lengths as 53.3.16 does, all six alignments, and text indent as a first-line or hanging indent.
- The copied kits name only their targets, the line-height toolbar keeps its presets and a Default item, and media items place all six alignments.
- `BaseColumnPlugin` and `ColumnPlugin` became `BaseColumnGroupPlugin` and `ColumnGroupPlugin`, and `moveMiddle` with `MoveMiddleColumnOptions` is gone.
- The docs and their Chinese twins, the release notes, the registry changelog and the generated output match the code.

**Round 4 and 5 fixes.** A second commit on `next` fixes what diff round 4's Codex seats found in `aa2f91c342`, and what round 5 found in those fixes:

- The v54 step converts `lineHeight`, `textAlign`, `indent`, `listStart` and `listRestart` only on a property declared by the plugin of that name, `list` for the two list keys. Before, an app plugin's own `lineHeight: "150%"` became 1.5 and then failed its string schema, and its `textAlign: "domain"`, `indent: "two"` and `listStart: "seven"` were dropped. Only the line-height case came from this plan; the other four fail the same way at `7b7b76573b`.
- HTML import reads a line height written with an exponent, such as `1e0` or `1.5e2%`, which the server parser keeps as written. The base stored these, and `aa2f91c342` dropped them.
- Word export gives a numbered, bulleted or to-do paragraph the alignment and line height it draws with. A value on the list item beats one on its list, which beats the listed block's, which beats the table cell's. The released 53.3.16 exporter dropped them all, so the changeset says so. Word's own reader also takes a stylesheet value written with an exponent, such as `1.5e0`.
- The v54 step throws a named error for a migration target copied outside `defineDocumentMigrations`. Before, it skipped all five conversions without a word, and the load then failed on the unconverted value.
- The recipe for apps built from unreleased v2 source now says to read stored line heights the way the v54 step does and to drop every value that is then not a positive number. The `pnpm check` attribution names what it did not rerun, the registry changelog summary no longer promises clearing alignment, and the Document shape uses `paragraph`.

**Proof.** Each row names its own scope in the decision log.

- Round 4 and 5 fixes, on the final bytes: the package specs for migrations, Word export, basic styles, HTML and the compiler pass 536 and fail the base suggestion case (`r5-final-package-specs-a1.log`). The www Word specs pass 46, the copied-kit cases for numbered and task paragraphs and for a numbered paragraph in a styled cell among them (`r5-www-docx-set-a1.log`), and the slow Word and static HTML specs pass 51 (`r5-slow-a1.log`). Each new case failed before its fix (`r5-red-package-a2.log`, `r5-red-www-a1.log`, `r5-red-copied-target-a1.log`), and each fix's mutant fails its case (`r4-owner-mutant-head-a1.log`, `r4-owner-mutant-installed-a1.log`, `r4-exponent-mutant-a1.log`, `r4-list-style-mutant-a1.log`, `r5-word-mutants-a1.log`). Both typechecks fail only on the base TS2345 (`r5-typecheck-packages-a1.log`, `r5-www-typecheck-a1.log`), lint is clean (`r5-lint-a1.log`), and the registry changelog check passes (`r4-changelog-check-a1.log`).
- The package specs pass 525 and fail 1 (`r3-package-specs-a1.log`). The failure is `migratePlateV54Suggestions.spec.ts`'s base case (`suggestions-base-a1.log`).
- The migration specs pass 120 and fail the same case (`r3-migration-specs-a1.log`).
- The Word paste and static HTML slow specs pass 51 (`r3-slow-a1.log`).
- The package and www typechecks fail only on TS2345 in the base suggestion step (`r3-typecheck-packages-a2.log`, `r3-www-typecheck-a1.log`, `r3-www-tsc-integration-a1.log`). A detached worktree at `origin/next` `7b7b76573b` fails the same way (`r3-next-typecheck-migrations-a1.log`).
- Lint is clean (`r3-lint-a1.log`). Schema adoption fails only on `lint.tsx` and `lint-demo.tsx`, as at base (`r3-schema-adoption-a1.log`). The entrypoint config is current (`r3-entrypoint-turbo-a1.log`).
- The gates and the teaching sweep read as the Completion Gates row says (`close-gates-a1.log`, `close-teaching-sweep-a1.log`).
- The hand drive is in `drive-notes.md` and `r3-load-cells-a1.log`.
- The full check passed 15 of its 26 steps (`close-pnpm-check-a1.log`). Every generator's check mode passed, and `pnpm brl` left no diff. `close-attribute-a1.log` reran the red steps in a detached worktree at `origin/next` `7b7b76573b`:
  - The typecheck, type tests, Plite tests and www steps fail only on the base TS2345.
  - Lint, the core audits, the Plite bridge check and the review ledger fail with the same findings as at `7b7b76573b`.
  - The knowledge check matches `7b7b76573b`'s 100 findings once the layout subject's two citations of an ignored run file were removed.
  - The import smoke fails at `7b7b76573b` (`close-next-smoke-a1.log`). The slow suite's import case reads the same stale list, which this branch does not touch.
  - The slow suite's two recording laws fail when run alone, with 40 passing and 2 failing in both trees.
  - Three specs fail only beside other specs. Footnote navigation passes alone, and at `dc06078008` it failed the same way beside other specs. The link iframe case hit its 5000ms timeout, and the list paste gallop took 78s against its 60s limit. Each of those two passes alone in both trees, 5 of 5 and 13 of 13, but neither grouped run was repeated at `7b7b76573b`, so their cause is not attributed.
  - Each failure left in place has a line in `docs/plans/backlog.md`, or a card for the suggestion step's TS2345.

**Limits.** The run never tried native clipboard paste, opening an exported file in Word or right-to-left text. Codex seats reviewed only the landed commit and its fixes, so the arena and the three plan rounds stayed same-family. The v54 step still finds first-party plugins by name, so an app plugin named `lineHeight`, `textAlign`, `indent` or `list` has its values converted, and its profile still checks list ownership without root context. Both go to their own session. A listed heading in Word still ignores a line height or alignment that a stylesheet sets on its list or list item. The suggestion spec and the TS2345 stay red, as at base, until the suggestion session lands. `pnpm check` stays red on the same 11 steps as `next` until their backlog lines and that session land.

**Apps built from unreleased v2 source.** No release carries their line-height fingerprint, so no changeset covers them. Such an app with line height installed:

1. Bumps `EditorSchema.version`.
2. Lists the fingerprint its stored envelopes carry under the old version in `sourceFingerprints`.
3. Registers its own step for the new version that reads every stored `lineHeight` on nodes in `children` and every root, and on both sides of `lineHeight` suggestion tags. It reads a text value the way the v54 step does. A percent is divided by 100, a unitless or `em` value stays as it is, and an exponent such as `1e0` is allowed. A length such as `"24px"`, a keyword such as `"normal"` and any value that is then not a positive finite number are dropped. So `"150%"` becomes 1.5, `"1.5em"` becomes 1.5, and `"24px"`, `0` and `-1` go. Reading with `parseFloat` instead would store `"150%"` as 150 and `"24px"` as 24, and both would load with no warning.

**Review inputs.** The review read the doctrine in `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md` and `docs/vision/plite.md`, and the prior record `docs/research/review-records/2026-10-04-layout-audit.json` with its scope `docs/research/review-scopes/layout.json`. Its column sources were `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts`, `packages/platejs/src/features/layout/lib/BaseColumnPlugin.spec.ts`, `packages/platejs/src/features/layout/lib/BaseColumnPlugin.authored-tree.spec.ts` and `packages/platejs/src/react/features/layout/ColumnPlugin.tsx`. Its style and plugin sources were `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts`, `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.spec.ts`, `packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`, `packages/platejs/src/internal/plugin/pluginInjectNodeProps.ts`, `packages/platejs/src/internal/plugin/pluginInjectNodeProps.spec.ts`, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/lib/plugin/PluginDefinition.ts`, `packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/plitejs/src/core/editor-schema.ts` and the entrypoint graph `tooling/entrypoints/entrypoint-dag.mjs`. Its Word export sources were `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx` and `packages/platejs/src/docx/export/lib/internal/xml-builder.ts`, and its migration sources were `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts` and `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`. Its copied UI sources were `apps/www/src/registry/components/editor/line-height.tsx`, `apps/www/src/registry/components/editor/line-height-toolbar-button.tsx`, `apps/www/src/registry/components/editor/align.tsx`, `apps/www/src/registry/components/editor/align-toolbar-button.tsx`, `apps/www/src/registry/components/editor/block-menu.tsx`, `apps/www/src/registry/components/editor/indent.tsx`, `apps/www/src/registry/components/editor/font.tsx`, `apps/www/src/registry/components/editor/font-static.tsx`, `apps/www/src/registry/components/editor/column.tsx`, `apps/www/src/registry/components/editor/column-static.tsx`, `apps/www/src/registry/components/editor/caption-static.tsx`, `apps/www/src/registry/components/editor/caption.tsx`, `apps/www/src/registry/components/editor/media-image.tsx`, `apps/www/src/registry/components/editor/media-embed.tsx`, `apps/www/src/registry/components/editor/media-audio.tsx`, `apps/www/src/registry/components/editor/media-video.tsx`, `apps/www/src/registry/components/editor/table.tsx`, `apps/www/src/registry/components/editor/heading.tsx`, `apps/www/src/registry/components/editor/editor-static.tsx`, `apps/www/src/registry/components/editor/insert-toolbar-button.tsx`, `apps/www/src/registry/components/editor/slash.tsx`, `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx`, `apps/www/src/registry/components/editor/fixed-toolbar.tsx`, `apps/www/src/registry/components/editor/plugins-static.ts` and `apps/www/src/registry/components/editor/list.tsx`. Its Word paste specs were `apps/www/src/__tests__/package-integration/docx/testDocxDeserializer.tsx`, `apps/www/src/__tests__/package-integration/docx/alternate_document_path.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/dummy_item_after_list_item.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/dummy_item_after_paragraph.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/legal-in.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/legal.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/line-height.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/lists_sublist_reset.slow.tsx` and `apps/www/src/__tests__/package-integration/docx/tabs.slow.tsx`. Its release and docs sources were `apps/www/api-reference.config.json`, `.changeset/layout-v54-runtime.md`, `.changeset/platejs-column-side-drop.md`, `.changeset/basic-styles-v54-runtime.md`, `content/docs/(plugins)/(styles)/font.mdx`, `content/docs/(plugins)/(elements)/column.mdx`, `content/docs/(plugins)/(styles)/line-height.mdx`, `content/docs/(plugins)/(styles)/text-align.mdx`, `content/docs/(guides)/plugin.mdx`, `content/docs/(guides)/editor.mdx` and `content/docs/(guides)/document-model.mdx`.

**Counts.** The owner sent four messages, all done: the `/verdict layout` brief, "c", which continued it, "codex is back", which ran the Codex review of the landed commit, and "c" again after a usage stop. The decision log holds 176 rows. Three plan panel rounds and five diff panel rounds ran. Rounds 1 to 3 had three Opus seats, round 4 the two Codex seats, and round 5 Opus and both Codex seats.

## Open work

- Everything moved to the layout subject's Open work with its owners and stops, the suggestion migration first.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Alignment, line height, text indent and indent stay separately optional properties on the blocks each plugin targets (2026-10-04 audit, unchanged).
- One authority owns each property's values and its default, and every value the schema admits renders and exports the same way (2026-10-04 audit, unchanged).
- Packages ship semantically neutral defaults, and product choices such as toolbar presets belong in copied source ([VISION.md](../../VISION.md) line 90, [plate.md](../vision/plate.md) line 107).
- Plite drops a property's default on load and on set when the property declares `default` with `omitDefault: true` (P4 in `probe-a1.log`). Column width does not use it: `BaseColumnPlugin.ts:55` sets `omitDefault: false`.
- Public descriptor names, definition types and docs tell the truth about what they own, and names are API surface ([common.md](../vision/common.md), Taste).
- Columns keep a structural job: a group of at least two columns that each carry a percentage width, with width corrections, a transfer veto that keeps a column in its group, and side drops that build a group of up to five columns.
- The v2 beta takes hard cuts over compatibility (`AGENTS.md`, Redesign from First Principles), and migration convenience affects sequencing, never the target ([VISION.md](../../VISION.md) line 25).

### Lanes

1. **Keep the current design. Loses.** P1 shows a pasted 1.75 saved and exported as `<p style="line-height: 1.75">`, while the static render draws no line height and the 2 control draws `line-height:2`. P6 shows Word export writing `<w:spacing w:lineRule="auto"/>` with no `w:line` for 1.75, against `w:line="480"` for 2. A string such as `'24px'` is saved and never drawn.
2. **The 2026-10-04 target: the schema owns the domain, with a line-height default set through plugin state. Loses for line height.** CSS's own initial value is `normal`, and no number is neutral, so the package would still ship a theme pick or force every app to set one. A configurable default also makes saved JSON depend on app config: the same document saves `1.5` in one app and nothing in another. Saving the user's explicit pick exports faithfully to Word, whose default spacing differs from the theme.
3. **The schema alone decides, with no line-height default. Wins.** The arena kept this lane's line-height half and replaced its alignment half: `start` stays a stored value instead of an omitted default, and line height narrows to a number, as the Design section says. `validNodeValues` and `defaultNodeValue` leave `inject.nodeProps`, because only the align, line-height and font kits and three package plugins set them, and a kept `defaultNodeValue` would let an upgraded kit hide a saved value that HTML and Word export. No kit replaces the black filter with a `query`, which would turn off native text sync for colored text. Both `update.set` methods stop reading render config. The copied toolbar owns its five presets and a Default item. The kits keep only their targets. Predicted benefits, which the plan's Close marks held or falsified: every saved line height draws and exports, `inject.nodeProps` loses two options, and the two kits lose four lines that repeat the package.
4. **Merge the four style plugins into one block-style plugin. Loses**, as in 2026-10-04. Each property is optional on its own, and text indent and indent mean different things: the first line versus the whole block's margin.
5. **Move the style mapping into Plite. Loses.** Drawing a value as CSS is Plate presentation, and Plite already owns the default and omission law that Plate reuses.
6. **Draw every value but keep the value lists in plugin config for the toolbar. Loses.** It keeps a list in plugin config that the render ignores and only the copied toolbar reads, so the toolbar should hold it.
7. **Refuse a configured `nodeKey` that differs from the schema key. Loses here.** P3 shows that configuring `nodeKey: 'legacyLineHeight'` saves `lineHeight` and draws nothing, but the copied list kits set `nodeKey: 'listType'` on purpose (`apps/www/src/registry/components/editor/list.tsx:30`), because the list plugin binds seven properties. The judge's narrower fix, refusing a key a single-property plugin does not bind, goes to the backlog.
8. **Strongest deletion: delete both `update.set` methods and let callers call `tx.nodes.set`. Loses.** Every caller would restate the plugin's target match, which Vision's identity rule forbids.
9. **Columns as a CSS property on one container. Loses**, as in 2026-10-04. Columns hold blocks, carry widths and veto transfers, which a style cannot do.
10. **Rename the group only, to `ColumnGroupPlugin`, and keep `ColumnItemPlugin`. Wins after the plan panel.** The arena's swap moved `ColumnPlugin` to the column, so a v53 app's `[ColumnPlugin]`, `useElement(ColumnPlugin)` and `.name`-keyed maps would still compile against the wrong plugin. No rule asks a name to equal its key: `FontColorPlugin` owns `color`, `CodeHighlightPlugin` owns `codeSyntax` and `SlashPlugin` owns `slashCommand`. The group descriptor is the one name that names its neighbor's key, and renaming it alone turns every old reference into a compile error, as `VISION.md` line 41's "do not churn them casually" asks.
11. **Delete `moveMiddle` and `MoveMiddleColumnOptions`. Wins, as part of lane 3.** Only `BaseColumnPlugin.spec.ts` and `BaseColumnPlugin.authored-tree.spec.ts` call it, the docs teach it, its `'right'` direction returns without a change, and Vision names no job for it. Predicted benefit: one fewer command and options type to learn and document, with no runtime change.

**Proof limits.** P1 to P5 ran under `bun test` at `61fa924e8d` (`probe-a1.log`), and P6 ran the DOCX export the same way (`probe-docx-a2.log`, after `probe-docx-a1.log` failed to resolve `jszip`). P8 and P9 ran Word export on every stored form with the render filters unset (`probe-docx-b-a1-a2.log`), and P10 loaded stored text under a number-only schema at `dc06078008` (`probe-number-a2.log`), though the spec on disk is an earlier version that no longer reproduces that log, so the build commits the refusal as a spec case. P4 tested a probe plugin's enum property, not `textAlign` itself. No browser ran, so the live editor's drop of 1.75 is inferred from the shared injection path that the static render runs (`packages/platejs/src/internal/plugin/pluginInjectNodeProps.ts`). The editor comparison is a source read by an Opus seat, `editors-answer.md` in the same folder, which ran nothing; the Codex explorer it replaced failed on its account (`editors-answer.err`).

### Dependents

- `react`: affected. `packages/platejs/src/react/features/layout/ColumnPlugin.tsx` exports the group descriptor, which gets renamed.
- `documents`: affected. `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx` renders the group descriptor in Word export and renames `ColumnDocx`, and `xml-builder.ts` writes line spacing, alignment and text indent.
- `media`: affected. `AlignedMediaInsertInput` in `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts` stays as it is, the copied media items place six alignments through `getMediaTextAlign` in `caption-static.tsx` and its twin in `caption.tsx`, and `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` gets the group rename.
- `editing`: affected. `packages/platejs/src/lib/plugin/PluginDefinition.ts` loses `validNodeValues` and `defaultNodeValue`, which the verdict listed as unaffected, and `ExitBreakPlugin.spec.ts` gets the group rename.
- `ui`: affected. `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` inserts a column group through the group descriptor, and `apps/www/src/registry/components/editor/fixed-toolbar.tsx` and `apps/www/src/registry/components/editor/plugins-static.ts` compose the kits whose config changes.
- `basic`, `callout`, `canvas`, `code`, `date`, `link`, `math`, `slash`, `table` and `toc`: affected through two shared files. They reach this scope through `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` and `apps/www/src/registry/components/editor/slash.tsx`, which call the group descriptor's `insert` and `upsert`, so the rename edits those lines and nothing else of theirs.
- `ai`: unaffected. Its files reach this scope through `packages/platejs/src/ai/react/AIChatPlugin.ts`'s use of `PLUGINS.columnGroup`, and keys don't change.
- `distribution`: unaffected. It reaches this scope only through `packages/platejs/src/utils/plate-keys.ts`, whose `PLUGINS` names don't change.
- `styles` is not a dependent but owns `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts`, where the alignment and line-height change lands.

### History

- This review supersedes [2026-10-04-layout-audit](../research/review-records/2026-10-04-layout-audit.json). It keeps that audit's verdict, its requirements, the column rename and the `moveMiddle` cut. It replaces the line-height target, a schema default configured through plugin state, with no package default, for the reasons in lane 2.
- [2026-10-06-dnd-side-drop-columns](2026-10-06-dnd-side-drop-columns.md): retained. It added side drops that build or extend a column group, which this plan keeps.
- [2026-07-12-plate-next-layout-link-legacy-list-package-reviews](2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md) and [2026-07-15-restore-insert-column-parity](2026-07-15-restore-insert-column-parity.md): historical. The package shape they reviewed is the current one.
- Member changes since 2026-10-04, read with `git log`: `002891202b` adds the side drop and its transfer veto. `422564e6f6`, `c5921381cf` and `8f5afd571d` touch the style plugins and the injection path, adding `txLocate` and `textScope`. None lands the 2026-10-04 target.
- External checkouts read: `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../ckeditor5` at `14e73cc31b869ce483bd8449f40b9102ac7746da`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../prosemirror` at `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`, `../BlockNote` at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032`, `../milkdown` at `6a4db480b00db8dd0322b517117dfa2154f3e2e2` and `../quill` at `539cbffd0a13b18e9c65eb84dd35e6596e403158`.
