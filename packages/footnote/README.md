# @platejs/footnote

Footnote plugins for Plate.

This package adds dedicated footnote reference and footnote definition nodes,
plus transforms and queries for inserting, resolving, navigating, and repairing
footnotes.

## Features

- Parse GFM footnote references and definitions into Plate nodes
- Serialize footnote nodes back to markdown footnotes
- Insert a reference and matching definition with one transform
- Allocate the next free numeric identifier automatically
- Create a missing definition for an unresolved reference
- Detect and repair later duplicate definitions
- Navigate between references and definitions

## Installation

```bash
npm install @platejs/footnote @platejs/markdown remark-gfm
```

## Usage

```tsx
import {
  FootnoteDefinitionPlugin,
  FootnoteReferencePlugin,
} from '@platejs/footnote/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { createPlateEditor } from 'platejs/react';
import remarkGfm from 'remark-gfm';

const editor = createPlateEditor({
  plugins: [
    FootnoteReferencePlugin,
    FootnoteDefinitionPlugin,
    MarkdownPlugin.configure({
      options: {
        remarkPlugins: [remarkGfm],
      },
    }),
  ],
});
```

## Package Surface

Queries:

- `api.footnote.nextId`
- `api.footnote.definition`
- `api.footnote.definitions`
- `api.footnote.definitionText`
- `api.footnote.duplicateDefinitions`
- `api.footnote.duplicateIdentifiers`
- `api.footnote.hasDuplicateDefinitions`
- `api.footnote.isDuplicateDefinition`
- `api.footnote.isResolved`
- `api.footnote.references`

Transforms:

- `tf.insert.footnote`
- `tf.footnote.createDefinition`
- `tf.footnote.focusDefinition`
- `tf.footnote.focusReference`
- `tf.footnote.normalizeDuplicateDefinition`

## Documentation

- Footnote docs: https://platejs.org/docs/footnote
- Markdown docs: https://platejs.org/docs/markdown

## License

[MIT](../../LICENSE)
