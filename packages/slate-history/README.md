# slate-history

Operation-based undo and redo for Slate editors.

Install history with the `history()` extension.

```ts
import { createEditor } from '@platejs/slate'
import { History, history } from '@platejs/slate-history'

const editor = createEditor({
  extensions: [history()],
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
})

const isHistoryValue = editor.read((state) =>
  History.isHistory(state.history.get())
)
```

`useSlateEditor` installs history by default. Disable it explicitly when an
editor should not expose history state or transaction helpers.

```ts
import { history } from '@platejs/slate-history'
import { useSlateEditor } from '@platejs/slate-react'

const editor = useSlateEditor({
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
