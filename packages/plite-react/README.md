# plite-react

React runtime for Plite editors.

`plite-react` owns editor creation, the `Plite` provider, the `Editable`
surface, browser event handling, native selection sync, void shells, hidden DOM
coverage, decoration sources, annotations, widgets, and large-document DOM
strategies.

Start with `usePliteEditor`, `Plite`, and `Editable`.

```tsx
import { Plite, Editable, usePliteEditor } from '@platejs/plite-react'

const Editor = () => {
  const editor = usePliteEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  })

  return (
    <Plite editor={editor}>
      <Editable placeholder="Start typing..." />
    </Plite>
  )
}
```

The lower-level `createReactEditor` factory installs the React runtime for
framework code. Use it outside React component ownership, such as test harnesses
or runtime adapters.

Use component props for application behavior:

- `renderElement`, `renderLeaf`, `renderText`, and `renderPlaceholder` render
  document content.
- `onKeyDown`, `onDOMBeforeInput`, `onPaste`, `onCopy`, `onDrop`, and selection
  handlers customize browser behavior without replacing Plite's runtime.
- Decoration sources, annotation stores, and widget stores attach external UI
  to Plite ranges and nodes.
- DOM coverage boundaries describe hidden, staged, or virtualized same-root
  content for selection, copy, find, and materialization.

Render primitives `PliteElement`, `PliteText`, `PliteLeaf`, and
`PlitePlaceholder` carry Plite's DOM attributes when custom renderers need to
keep the native editing contract intact.

Common hooks include `usePliteEditor`, `useEditorSelector`,
`useEditorSelection`, `usePliteRuntimeState`, `usePliteRootEditor`,
`usePliteRootState`, `usePliteActiveEditor`, `usePliteCommandCallback`,
`usePliteRootEffect`, `useElementPath`, `useElementSelected`, and
`usePliteHistory`.

Advanced helper hooks include `usePliteNodeRef`,
`useDOMStrategyVirtualOffset`, and `usePliteRangeDecorationSource`.

Use `plite-react` for React applications. Use `plite` for the core model and
transactions, `plite-dom` for DOM bridge utilities, and `plite-browser` for
browser proof infrastructure.
