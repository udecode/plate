# @platejs/footnote

Footnote plugins for Plate.

This package adds dedicated footnote reference and footnote definition nodes, plus transforms and queries for inserting, resolving, navigating, and repairing footnotes.

## Features

- Parse GFM footnote references and definitions into Plate nodes
- Serialize footnote nodes back to markdown footnotes
- Insert a reference and matching definition with one transform
- Allocate the next free numeric ref automatically
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
  FootnotePlugin,
} from '@platejs/footnote/react';
import { createPlateEditor } from '@platejs/core/react';
import { MarkdownPlugin } from '@platejs/markdown';
import remarkGfm from 'remark-gfm';

const editor = createPlateEditor({
  plugins: [
    FootnotePlugin,
    FootnoteDefinitionPlugin,
    MarkdownPlugin.configure({
      initialState: {
        remarkPlugins: [remarkGfm],
      },
    }),
  ],
});
```

## Package Surface

Reads:

- `editor.read.footnote.nextRef`
- `editor.read.footnote.definition`
- `editor.read.footnote.definitions`
- `editor.read.footnote.definitionText`
- `editor.read.footnote.duplicateDefinitions`
- `editor.read.footnote.duplicateRefs`
- `editor.read.footnote.hasDuplicateDefinitions`
- `editor.read.footnote.isDuplicateDefinition`
- `editor.read.footnote.isResolved`
- `editor.read.footnote.references`

Commands:

- `editor.update.footnote.insert`
- `editor.update.footnote.createDefinition`
- `editor.update.footnote.focusDefinition`
- `editor.update.footnote.focusReference`
- `editor.update.footnote.normalizeDuplicateDefinition`

## Documentation

- Footnote docs: https://platejs.org/docs/footnote
- Markdown docs: https://platejs.org/docs/markdown

## License

[MIT](../../LICENSE)
