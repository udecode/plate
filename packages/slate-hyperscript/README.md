# slate-hyperscript

JSX fixture helpers for Slate documents and tests.

Use `slate-hyperscript` when nested editor state is easier to read as markup
than as raw JSON.

```tsx
/** @jsx jsx */
import { jsx } from '@platejs/slate-hyperscript'

const editor = (
  <editor>
    <element type="paragraph">
      alpha
      <cursor />
    </element>
  </editor>
)
```

The built-in tags create normal Slate objects:

- `<editor>` creates an editor-like fixture with `children`, `selection`, and
  `marks`.
- `<fragment>` creates a `Descendant[]`.
- `<element>` creates an element with resolved `children`.
- `<text>` creates one text node.
- `<cursor />` creates a collapsed selection point.
- `<anchor />` and `<focus />` create an expanded selection.
- `<selection>` creates a standalone `Range` from child anchor/focus tags.

Define domain tags with `createHyperscript`.

```tsx
import { createHyperscript } from '@platejs/slate-hyperscript'

const h = createHyperscript({
  elements: {
    paragraph: { type: 'paragraph' },
  },
})

const paragraph = h('paragraph', {}, 'hello')
```

`createEditor` and `createText` are low-level creators for custom factories and
fixture helpers. `HyperscriptCreators` and `HyperscriptShorthands` are
TypeScript helper types for custom factories.

Keep hyperscript in tests and fixtures. Runtime editor code should use normal
Slate node values.
