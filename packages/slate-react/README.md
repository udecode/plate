# slate-react

React runtime for Slate editors.

`slate-react` owns editor creation, the `Slate` provider, the `Editable`
surface, browser event handling, native selection sync, void shells, hidden DOM
coverage, decoration sources, annotations, widgets, and large-document DOM
strategies.

Start with `useSlateEditor`, `Slate`, and `Editable`.

```tsx
import { Slate, Editable, useSlateEditor } from '@platejs/slate-react'

const Editor = () => {
  const editor = useSlateEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  })

  return (
    <Slate editor={editor}>
      <Editable placeholder="Start typing..." />
    </Slate>
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
  handlers customize browser behavior without replacing Slate's runtime.
- Decoration sources, annotation stores, and widget stores attach external UI
  to Slate ranges and nodes.
- DOM coverage boundaries describe hidden, staged, or virtualized same-root
  content for selection, copy, find, and materialization.

Render primitives `SlateElement`, `SlateText`, `SlateLeaf`, and
`SlatePlaceholder` carry Slate's DOM attributes when custom renderers need to
keep the native editing contract intact.

Common hooks include `useSlateEditor`, `useEditorSelector`,
`useEditorSelection`, `useSlateRuntimeState`, `useSlateRootEditor`,
`useSlateRootState`, `useSlateActiveEditor`, `useSlateCommandCallback`,
`useSlateRootEffect`, `useElementPath`, `useElementSelected`, and
`useSlateHistory`.

Advanced helper hooks include `useSlateNodeRef`,
`useDOMStrategyVirtualOffset`, and `useSlateRangeDecorationSource`.

Use `slate-react` for React applications. Use `slate` for the core model and
transactions, `slate-dom` for DOM bridge utilities, and `slate-browser` for
browser proof infrastructure.
