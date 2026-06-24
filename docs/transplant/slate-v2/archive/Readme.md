# Slate

Slate is a customizable framework for building rich-text editors. It owns the
document model, selection model, operations, history, DOM bridge, and React
editable runtime while leaving product features such as toolbars, schema rules,
serialization, comments, sync adapters, and layout to application code or
extensions.

The current public lifecycle is:

```tsx
const value = editor.read((state) => state.value.get())

editor.update((tx) => {
  tx.text.insert('Hello')
})
```

Reads run through `editor.read(...)`. Writes run through `editor.update(...)`.
Inside an update, `tx.nodes`, `tx.text`, `tx.selection`, `tx.marks`,
`tx.fragment`, `tx.operations`, `tx.roots`, and extension namespaces own
mutation.

## Install

For a React editor:

```text
npm install slate slate-dom slate-react react react-dom
```

Use the matching command for pnpm, Yarn, or Bun when your project uses another
package manager.

## Quick Start

```tsx
import { Editable, Slate, useSlateEditor } from 'slate-react'

type CustomText = { text: string }
type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
type CustomValue = ParagraphElement[]

const initialValue: CustomValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const editor = useSlateEditor<CustomValue>({ initialValue })

  return (
    <Slate
      editor={editor}
      onChange={(value, change) => {
        if (!change.valueChanged) return

        localStorage.setItem('slate.children', JSON.stringify(value))
      }}
    >
      <Editable placeholder="Start typing..." />
    </Slate>
  )
}
```

Use `onChange` for the current provider root value. Use
`editor.subscribe(...)` and `editor.read((state) => state.value.get())` when an
app needs the full persisted document with named roots and state fields.

## Core Ideas

- **Data model first.** Slate documents are nested JSON nodes with explicit
  selections, paths, ranges, operations, runtime ids, and commits.
- **Read/update lifecycle.** App code reads from `state` and writes through
  `tx`; direct mutable editor fields are not the primary API.
- **Transaction namespaces.** Built-in and extension-owned APIs live on
  `editor`, `state`, and `tx` groups.
- **React runtime locality.** `slate-react` keeps DOM repair, native selection,
  browser input, void shells, hidden content, and large-document rendering owned
  by the editable runtime.
- **Projection architecture.** Decorations, annotations, widgets, diagnostics,
  and search highlights share projection infrastructure instead of forcing every
  overlay through one render callback.
- **Explicit proof infrastructure.** `slate-browser` owns browser proof helpers,
  native selection assertions, clipboard/IME helpers, screenshots, generated
  stress replay, and proof-scope classifiers.

## Packages

| Package | Purpose |
| --- | --- |
| `slate` | Core editor, document model, operations, transactions, state fields, transforms, refs, and extension runtime. |
| `slate-dom` | DOM bridge, clipboard bridge, selection conversion, hotkeys, and contenteditable coverage helpers. |
| `slate-react` | React editor factory, `<Slate>`, `<Editable>`, rendering primitives, hooks, decoration sources, annotations, widgets, and DOM strategies. |
| `slate-history` | Undo/redo history extension exposed through `state.history` and `tx.history`. |
| `slate-hyperscript` | JSX-style test/document creation helpers. |
| `slate-layout` | Experimental page layout and page-level rendering helpers. |
| `slate-browser` | Browser proof harness. It is test infrastructure, not the product editing API. |

## Documentation

- [Installing Slate](./docs/walkthroughs/01-installing-slate.md)
- [Adding Event Handlers](./docs/walkthroughs/02-adding-event-handlers.md)
- [Defining Custom Elements](./docs/walkthroughs/03-defining-custom-elements.md)
- [Applying Custom Formatting](./docs/walkthroughs/04-applying-custom-formatting.md)
- [Executing Commands](./docs/walkthroughs/05-executing-commands.md)
- [Editor API](./docs/api/nodes/editor.md)
- [Transforms](./docs/api/transforms.md)
- [Slate Browser](./docs/libraries/slate-browser.md)
- [Slate React](./docs/libraries/slate-react/README.md)

## Examples

Examples live in [`site/examples/ts`](./site/examples/ts). Start with:

- [`plaintext`](./site/examples/ts/plaintext.tsx)
- [`richtext`](./site/examples/ts/richtext.tsx)
- [`markdown-shortcuts`](./site/examples/ts/markdown-shortcuts.tsx)
- [`inlines`](./site/examples/ts/inlines.tsx)
- [`editable-voids`](./site/examples/ts/editable-voids.tsx)
- [`paste-html`](./site/examples/ts/paste-html.tsx)
- [`hidden-content-blocks`](./site/examples/ts/hidden-content-blocks.tsx)
- [`huge-document`](./site/examples/ts/huge-document.tsx)

Experimental pagination and virtualized rendering examples are useful for
research and stress proof, not the default editor path.

## Development

Fast local gate:

```text
bun check
```

Full browser proof gate:

```text
bun check:ci
bun check:full
```

Playwright integration coverage lives outside the fast `bun check` loop.
Focused browser proof uses Playwright through the package script:

```text
bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium
```

Slate is MIT licensed.
