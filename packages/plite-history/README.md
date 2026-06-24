# plite-history

Operation-based undo and redo for Plite editors.

Install history with the `history()` extension.

```ts
import { createEditor } from '@platejs/plite'
import { History, history } from '@platejs/plite-history'

const editor = createEditor({
  extensions: [history()],
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
})

const isHistoryValue = editor.read((state) =>
  History.isHistory(state.history.get())
)
```

`usePliteEditor` installs history by default. Disable it explicitly when an
editor should not expose history state or transaction helpers.

```ts
import { history } from '@platejs/plite-history'
import { usePliteEditor } from '@platejs/plite-react'

const editor = usePliteEditor({
  extensions: [history({ enabled: false })],
  initialValue,
})
```

Read history through `state.history`, write through `tx.history`, and control
batching through `editor.api.history`.

```ts
const undoCount = editor.read((state) => state.history.get().undos.length)

editor.update((tx) => {
  tx.history.undo()
})

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.text.insert('draft')
  })
})
```

Use `History.isHistory(value)` when library code needs to validate an unknown
history value.
