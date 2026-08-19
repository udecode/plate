---
"@platejs/basic-nodes": major
---

Require React and React DOM 19.2 or newer.

Remove the Heading, Basic Blocks, and Basic Marks grouping descriptors and
package-owned preset arrays. The package exports each Base and React capability
plugin independently. Built-in marks expose semantic read and update methods.
`ScriptPlugin` represents subscript and superscript through one
`script: 'sub' | 'sup'` property.
Paragraphs and horizontal rules persist under the canonical plugin identities
`paragraph` and `horizontalRule`.

**Migration:** List the package plugins your editor supports, or install the
matching app-owned Plate registry kit.

```tsx
import { H1Plugin, H2Plugin } from '@platejs/basic-nodes/react';

const plugins = [H1Plugin, H2Plugin];
```

Replace `SubscriptPlugin` and `SuperscriptPlugin` with `ScriptPlugin`. Toggle
the requested position with `editor.update.script.toggle('sub' | 'sup')`.
Toggle headings through their generic text-block commands. Toggle blockquotes
through `editor.update.blockquote.toggle()`, which owns wrap and unwrap
semantics.

Add the shared v54 document step while loading persisted v53 text marks:

```tsx
import { defineDocumentMigrations, migratePlateV54 } from 'platejs/migrations';

const migrations = defineDocumentMigrations(EditorSchema, {
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});
```

Replace six heading plugins with one Heading plugin and required level.
