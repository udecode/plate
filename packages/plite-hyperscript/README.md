# plite-hyperscript

JSX fixture helpers for Plite documents and tests.

Use `plite-hyperscript` when nested editor state is easier to read as markup
than as raw JSON.

```tsx
/** @jsx jsx */
import { jsx } from '@platejs/plite-hyperscript'

const editor = (
  <editor>
    <element type="paragraph">
      alpha
      <cursor />
    </element>
  </editor>
)
```

The built-in tags create normal Plite objects:

- `<editor>` creates a Plite editor.
- `<fragment>` creates a `Descendant[]`.
- `<element>` creates an element with resolved `children`.
- `<text>` creates one text node.
- `<cursor />` creates a collapsed selection point.
- `<anchor />` and `<focus />` create an expanded selection.
- `<selection>` creates a standalone `Range` from child anchor/focus tags.

Define domain tags with `createHyperscript`.

```tsx
import { createHyperscript } from '@platejs/plite-hyperscript'

const h = createHyperscript({
  elements: {
    paragraph: { type: 'paragraph' },
  },
})

const paragraph = h('paragraph', {}, 'hello')
```

`createEditor` and `createText` are low-level creators for custom factories.
Use `createEditorFixture` as the `editor` creator when a test needs a plain
`HyperscriptEditorFixture` without editor normalization. `HyperscriptCreators`
and `HyperscriptShorthands` are TypeScript helper types for custom factories.

Keep hyperscript in tests and fixtures. Runtime editor code should use normal
Plite node values.
