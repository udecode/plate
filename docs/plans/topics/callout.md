# Callouts and disclosure

Page: https://claude.ai/artifact/Tyhb89oz7EQTvETPc7g74a

Plate has two container presentations in this scope. A callout is an emphasized text block. A Details block is a disclosure: its first child, the Summary, is the title that stays visible, and the blocks after it form a body that hides when the Details closes. The ledger asks how both compose standard block editing. The 2026-10-04 audit gave a Pursue verdict: the schema should own the Summary slot, and the callout's emoji default and unrendered variant should leave the package. The 2026-10-15 Details title slot plan built the Details half; the callout half is still open. Since then, Details titles gained heading levels, Code and List conversions that release the Details, and closed-title landing, through the October 2026 Details plans. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show callout`.

## Public API

A Details value starts with one Summary, and every later child is a body block.

```tsx
// content/docs/(plugins)/(elements)/details.mdx
const value = [
  {
    type: 'details',
    children: [
      { type: 'summary', children: [{ text: 'Shipping details' }] },
      { type: 'paragraph', children: [{ text: 'Ships in 2–3 days.' }] },
    ],
  },
];
```

Heading levels and Text format a title in place.

```tsx
// content/docs/(plugins)/(elements)/details.mdx
import { BaseHeadingPlugin } from 'platejs';

editor.plugin(BaseHeadingPlugin).update.setLevel(2);
editor.update.blocks.reset({ unset: ['level'] });
```

The Details schema keeps the title first.

```ts
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
schema: ({ plugins }) => ({
  element: {
    content: schema.content.prefix(
      [{ element: BaseDetailsSummaryPlugin }],
      plugins.blockContent({ default: BaseParagraphPlugin })
    ),
  },
}),
```

The paragraph shortcut drops any heading level first, then asks for Paragraph, which the schema refuses on a title, so a title loses its level and stays a title.

```tsx
// packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx
handler: ({ editor }) => {
  editor.update((tx) => {
    tx.blocks.reset({ unset: 'level' });
    tx.blocks.toggle({ type: editor.plugin(BaseParagraphPlugin).schema.type });
  });
},
```

The Quote toggle tells its caller whether it changed anything, so a menu can skip its other edits when Quote is refused.

```tsx
// content/docs/(plugins)/(elements)/blockquote.mdx
const quoted = editor.plugin(BlockquotePlugin).update.toggle();
```

Inside the packages, Details asks for the real Heading plugin when it releases a title, and asks Heading for the level when it wraps one.

```ts
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
const heading = editor.plugin(BaseHeadingPlugin);

return isSummaryHeadingLevel(level) && heading.installed
  ? { level, type: heading.schema.type }
  : { type: editor.plugin(BaseParagraphPlugin).schema.type };
```

Heading finds the Summary plugin by name and reads its type from that plugin, in its level read and in its commands.

```ts
// packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts
const summary = getCompiledPlatePlugin(editor, PLUGINS.detailsSummary);
const summaryType = summary
  ? editor.plugin(summary).schema.type
  : undefined;
```

## Document shape

Loading a Details with no Summary adds an empty one in front. The renderer reads the result.

```json
{ "type": "details", "children": [
  { "type": "summary", "children": [{ "text": "" }] },
  { "type": "paragraph", "children": [{ "text": "B" }] }
] }
```

A suggestion that deletes a title strikes only its text and keeps the Summary. The review UI reads this shape. Accepting gives an empty title and rejecting gives the title back, in both.

```json
{ "type": "details", "children": [
  { "type": "summary", "children": [{ "text": "Title", "authored": ["delete"] }] },
  { "type": "paragraph", "children": [{ "text": "Body" }] }
] }
```

Pasting two paragraphs at the end of a title keeps them in the same section.

```json
[
  { "type": "details", "children": [
    { "type": "summary", "children": [{ "text": "TitleX" }] },
    { "type": "paragraph", "children": [{ "text": "Y" }] },
    { "type": "paragraph", "children": [{ "text": "Body" }] }
  ] }
]
```

## Main changes

- `BaseDetailsPlugin` declares its content as `schema.content.prefix([{ element: BaseDetailsSummaryPlugin }], plugins.blockContent({ default: BaseParagraphPlugin }))`, so the schema refuses any change that moves, removes or retypes the title, and Plite checks each change against it before writing. The title is child 0 of a Details when that child is live content. HTML import moves each `details` element's first `summary` to the front and turns later ones into body blocks that keep their formatting.
- Plite builds the tail of a split, each later line of a plain-text paste, each copy of a duplicate and each block pasted over picked blocks with its source's type when the parent admits it there, and otherwise with that position's default block, through one internal read, `placeElementAt`. Its slice fitter keeps a paste that ends in another text block inside the title, quote or cell it lands in.
- Plite's Duplicate reads the blocks of a caret or text range through the blocks read that block set, reset and toggle use, so it copies only the innermost blocks by default, and a caret in a title copies just that title.
- Plite's blocks read returns no blocks for a range or point whose path no longer exists, and skips each picked block that no longer exists, so Duplicate, block set, reset and toggle change nothing for a deleted block.
- Code and List conversions of a title read the Details' `blockRelease` contribution, which unwraps that Details and turns the title into the converted block. A closed title's `insertionAnchor` contribution sends an implicit insert after the whole Details.
- AI types each answer block for its landing position, the Column toggle checks placement before it replaces a block, and `BlockquotePlugin`'s `toggle()` returns whether it applied, so the copied menus clear List only when Quote applied.
- The paragraph shortcut in `ParagraphPlugin` resets the level, then toggles Paragraph, which the schema refuses on a title.
- Details finds Heading through `editor.plugin(BaseHeadingPlugin)` and its installed check. A released title takes Heading's type, a wrapped block takes its level from Heading's `read.level`, and `platejs/details` depends on `standard/basic-nodes` in the entrypoint graph.
- Heading reads the Summary type from the Summary plugin it finds by name, through the same lookup list and upload use, instead of the compiled model's name table.
- `BaseCalloutPlugin` persists `icon` with a `'💡'` default and a `variant` that no copied component renders.

## What other editors do

Read from source, not run: Tiptap `91c51be53c`, ProseMirror transform `662b7a937b`, Lexical `dd5c41b131`, BlockNote `1e26f1c5e1` and Slate `945a484df2`. Schema editors make the title a required position, so a type change there is skipped; correction editors repair or dissolve the container after the fact.

| Editor | Where the title rule lives | A block type change on the title | Notes |
| --- | --- | --- | --- |
| Tiptap | `details` content `detailsSummary detailsContent` in the schema (`packages/extension-details/src/details.ts:72`) | Skipped by ProseMirror's `setBlockType`, whose `canChangeType` refuses a type the parent cannot hold (`prosemirror-transform` `src/structure.ts:117-170`) | The summary holds only text; the body is its own container |
| ProseMirror | Content expressions on each node type | Same `canChangeType` skip | Parsers fill missing required nodes from the content match |
| Lexical | Node transforms in the playground's Collapsible extension (`CollapsibleExtension/index.ts:204-235`) | A broken title or content child makes the transform unwrap the whole container | No schema; structure is repaired after the edit |
| Slate | No schema; `normalizeNode` repairs | Whatever the app's normalizer does | Plate's current corrections follow this model |
| BlockNote | A toggle heading is a heading block with `isToggleable` (`packages/core/src/blocks/Heading/block.ts:54`) | The title is the block itself, so a type change turns the whole toggle | Children nest under the block |
| Notion | Not read this session; its public block API models a toggle heading as a heading with `is_toggleable` | Same as BlockNote | Inferred from its public API, not checked |

How an extension finds an optional peer, read from source, not run: Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror model `6264de069d` and Slate `945a484df2`. Class-based editors check a peer by its class; name-based editors look it up by name and add types by declaration merging, which Plate's law refuses for lookups.

| Editor | How an extension finds an optional peer | Where its types come from |
| --- | --- | --- |
| Lexical | `editor.hasNodes([HeadingNode])`, a check by class (`packages/lexical/src/LexicalEditor.ts:1570`) | The imported class |
| Tiptap | `getNodeType(name, schema)`, a lookup in `schema.nodes` by name (`packages/core/src/helpers/getNodeType.ts`) | Module augmentation of `Commands` (`packages/extension-heading/src/heading.ts:25`) |
| ProseMirror | `schema.nodes[name]`, keyed by name (`src/schema.ts:585`) | None; node types are untyped by name |
| Slate | No plugin registry; plugins compare `element.type` strings | The app's own custom types |

## Open work

- The callout half of the 2026-10-04 audit: the package's `'💡'` icon default and the `variant` no copied component renders. owner: zbeyens. stop: a callout plan runs or the owner drops it.
- A message in the copied menus when a block change is refused. owner: zbeyens. stop: the owner asks for it or drops it.
- A Duplicate over a selection that crosses a Details edge puts every copy after the last innermost block, so an inward selection copies the block above into the Details body. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- A Duplicate of a closed Details title puts the copy in the hidden body instead of after the Details. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- `tx.slice.replace` crashes when `at` is a block pick, and returns false for a pick outside command paths, on `next` (`probe/pick-replace-base-a1.log`, `probe/pick-replace-base-a2.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Lifting a Details title throws "primary root cannot contain summary" on `next` (`probe/lift-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Rejecting a pending title-level suggestion after Enter split the title returns `invalid` on `next` (`probe/r2w-base-a1.log`). Plite's split retypes the tail, so the same reject turns `invalid` in every Plite editor whose Enter in a fixed slot used to throw, such as forced-layout's. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- A `nodes.set` with `split: true` over the end of a title moves that text into the body on `next` (`probe/r3b-base-a1.log`), against `details.mdx` line 46. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- After AI answers a picked title in a named root from the main editor, the main selection lands on an unrelated main-root block on `next` (`probe/r3b-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Accepting an insert-mode AI answer whose target sits in a named root writes it into the main root by bare path on `next`, and replaces the main root's first block when the target is an empty paragraph (`probe/r3c-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- An open slice pasted at the end of a root block that is not the last one does not join its first line into that block, on `next` (`probe/slice-places-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- When a prefix slot fixes a property, placement can still return a block the slot refuses, so Enter there throws at commit and writes nothing. That happens when the fixed value is the property's omitted default. Separately, when one preserved property conflicts with the slot, every other preserved property resets to the slot's defaults. No schema in the repository has such a slot. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- A node selection with no root targets the main root in core, but `rootOf` gives a named view's commands that view's root. List toggle from a named view over such a selection refuses and writes nothing, on base and on this build (`panel-diff-r3/probe/list-node-base.log`). Column and Details commands read the same helper and were not probed. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- AI `show()` from a named view labels captured main-root nodes with the view's root. On this build the answer's write is then refused and changes nothing, where base empties the title. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Inserting a block at an inline boundary of the matched block lands it before that block, as on `next`. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Refresh `tooling/entrypoints/platejs-entrypoint-sizes.json` with `pnpm plite:entrypoint-sizes:update` once the platejs build passes; the Details and Heading lookup change moved root `platejs`, `platejs/details`, `platejs/details/react` and `platejs/toc`. owner: zbeyens. stop: `t_dc44fa5c` lands and the refresh runs, or the owner drops it.
