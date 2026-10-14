---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

Support heading levels on Details titles without moving their text into the body. Preserve title levels through wrapping, unwrapping, HTML and Markdown. Format titles and ordinary blocks together with `editor.plugin(BaseHeadingPlugin).update.setLevel(level)`, which returns `false` with nothing changed when the schema refuses any block, and read a level with `read.level(node)`. Heading `toggle` removes a level through `blocks.reset` and sets one through `setLevel`, so it no longer dispatches the `block.toggle` command. The paragraph shortcut, `mod+alt+0` or `mod+shift+0`, removes a Details title's level in place instead of moving its text into the body. Other blocks selected with the title reset as they do when you choose Text.

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
