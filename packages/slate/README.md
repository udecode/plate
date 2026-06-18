# slate

Core Slate editor runtime.

`slate` owns the document model, operations, paths, points, ranges,
transactions, state fields, schema extensions, and pure node/location helper
namespaces.

```ts
import { createEditor } from '@platejs/slate'

const editor = createEditor({
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
})
```

Use `isEditor` when library code needs to validate an unknown value before
treating it as an editor.

Use `createEditorRuntime` and `createEditorView` when framework/runtime
packages need multiple root-scoped editor views over one committed editor
runtime. App UI should normally use framework helpers, such as
`useSlateEditor` in `slate-react`.

Read committed state with `editor.read(...)`.

```ts
const value = editor.read((state) => state.value.get())
const selection = editor.read((state) => state.selection.get())
```

Write document, selection, mark, root, state-field, and operation changes inside
`editor.update(...)`.

```ts
editor.update((tx) => {
  tx.text.insert('Hello')
})
```

Use `defineEditorExtension`, `defineStateField`, and `elementProperty` when a
library needs schema facts, state groups, transaction groups, normalizers,
operation middleware, commit listeners, or mounted runtime APIs.

Middleware and debug APIs include transform middleware, query middleware,
operation apply handlers, and debug value scrubbers for advanced library code.

Pure data helpers live on namespaces such as `ElementApi`, `NodeApi`,
`PathApi`, `PointApi`, `RangeApi`, `SpanApi`, and `TextApi`. Inside a live
editor, prefer grouped `state.*` reads and `tx.*` writes.

The `/internal` package subpath is reserved for sibling Slate packages in this repo.
Applications, extension libraries, and framework adapters outside this
workspace should use the root `slate` export.
