---
"@platejs/basic-nodes": major
---

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

Add the versioned migration plugin while loading persisted pre-v54 text marks:

```tsx
import { ScriptV54MigrationPlugin } from '@platejs/basic-nodes/migrations';
import { ScriptPlugin } from '@platejs/basic-nodes/react';

const plugins = [ScriptV54MigrationPlugin, ScriptPlugin];
```

Remove `ScriptV54MigrationPlugin` after every persisted document is resaved.
