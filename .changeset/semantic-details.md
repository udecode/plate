---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

Return Backspace at the start of the following paragraph to the collapsed Summary without changing hidden body content.

Keep the caret on the visible Summary after deleting a whole paragraph following collapsed Details.

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
