---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

Support heading levels on Details titles without moving their text into the body. Preserve title levels through wrapping, unwrapping, HTML and Markdown. HTML and Markdown write a leveled title as `<summary><h2>Title</h2></summary>`, the form GitHub renders, and Markdown also reads `<summary level="2">`. Format titles and ordinary blocks together with `editor.plugin(BaseHeadingPlugin).update.setLevel(level)`, which returns `false` with nothing changed when the schema refuses any block, and read a level with `read.level(node)`. Heading `toggle` removes a level through `blocks.reset` and sets one through `setLevel`, so it no longer dispatches the `block.toggle` command. The paragraph shortcut, `mod+alt+0` or `mod+shift+0`, removes a Details title's level in place instead of moving its text into the body. Other blocks selected with the title reset as they do when you choose Text. `editor.plugin(TocPlugin).read.headings()` lists a Details title that has a level as a heading of that depth, in document order.

Return Backspace at the start of the following paragraph to the collapsed Summary without changing hidden body content.

Keep the caret on the visible Summary after deleting a whole paragraph or a selected block following collapsed Details.

**Migration:** Import `BaseDetailsPlugin` from `platejs/details` and `DetailsPlugin` from `platejs/details/react`. Persist one `details` element whose first child is a `summary` text block and whose remaining children are direct body blocks. Read and update transient disclosure state through `editor.plugin(BaseDetailsPlugin)`.

Add the v54 document migration when loading persisted v53 Toggle values:

```tsx
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from 'platejs/migrations';

const migrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema,
  sourceFingerprints: { 53: v53Fingerprint },
  steps: { 54: migrateV54 },
});

const current = migrateDocument(persisted, { migrations }).output;
```

Remove empty paragraphs when returning to a collapsed Summary with Backspace, and unwrap only the selected Details container while preserving nested and parent containers.

Unwrap the nearest Details for selected title text or body blocks, and keep explicitly targeted changes inside their document root.

Convert a Details title with `editor.update.list.toggle({ type })`, the Turn into menu or a typed list marker. The title becomes a list item, its body stays one level deeper under it, and only that Details layer goes. The list toggle returns `false` and changes nothing when a body block cannot take an indent or the result would not fit its parent. Other selected blocks stay unchanged too. `editor.update.codeBlock.toggle()` turns a title selected alone into a code block and leaves its body as the blocks after it. It returns `false` and changes nothing when the selection holds the title and more blocks or the code block would not fit the parent.

Keep a Details title in place when Quote, Callout, Columns, Paragraph, `blocks.set` or three typed dashes would replace it. Nothing changes, and `editor.plugin(BlockquotePlugin).update.toggle()` returns `false`. Enter, paste and Duplicate in a title create body paragraphs, and an AI answer that rewrites a selected title keeps its first block as the title and puts a table answer below it. A value whose Summary is not the first child, or that has two, fails to load. HTML treats the first `<summary>` as the title and turns later ones into body blocks, a paragraph or the heading each holds; Markdown in that shape fails to parse.

Land a block inserted from a closed Details title after the Details, and one inserted from an open title at the start of its body. This holds for block insert commands, files pasted or submitted from the title, the slash menu and AI Insert below and accept. An explicit `after` still lands where it points, and an empty title keeps its place, also with `replaceEmpty: true`.
