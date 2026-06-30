# plite

Core Plite editor runtime.

`plite` owns the document model, operations, paths, points, ranges,
transactions, state fields, schema extensions, and pure node/location helper
namespaces.

```ts
import { createEditor } from '@platejs/plite'

const editor = createEditor({
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
})
```

Use `isEditor` when library code needs to validate an unknown value before
treating it as an editor.

Use `createEditorRuntime` and `createEditorView` when framework/runtime
packages need multiple root-scoped editor views over one committed editor
runtime. App UI should normally use framework helpers, such as
`usePliteEditor` in `plite-react`.

Read committed state with `editor.read(...)`. Use direct read methods for
one-shot reads and the callback form when several reads must share one state
view.

```ts
const value = editor.read.value()
const selection = editor.read.selection()

const info = editor.read((state) => ({
  text: state.text.string([]),
  value: state.value(),
}))
```

Write document, selection, mark, root, state-field, and operation changes inside
`editor.update(...)`. Use direct update methods for one-shot writes and the
callback form when a command groups related writes into one commit.

```ts
editor.update.text.insert('Hello')

editor.update((tx) => {
  tx.text.insert(' ')
  tx.text.insert('world')
})
```

Use `defineEditorExtension`, `defineStateField`, and `elementProperty` when a
library needs schema facts, state groups, transaction groups, normalizers,
operation middleware, commit listeners, or mounted runtime APIs.

Middleware and debug APIs include transform middleware, query middleware,
operation apply handlers, and debug value scrubbers for advanced library code.

Pure data helpers live on namespaces such as `ElementApi`, `NodeApi`,
`PathApi`, `PointApi`, `RangeApi`, `SpanApi`, and `TextApi`. Inside a live
editor, prefer `editor.read.<group>.<method>()` for one-shot reads, grouped
`state.*` reads for custom read logic, `editor.update.<group>.<method>()` for
one-shot writes, and grouped `tx.*` writes for composed commands.

The `/internal` package subpath is reserved for sibling Plite packages in this repo.
Applications, extension libraries, and framework adapters outside this
workspace should use the root `plite` export.
