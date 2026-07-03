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
  History.isHistory(state.history())
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

Read history through `state.history`, write through `tx.history`, and use
`editor.update.history.*` for a single controlled update.

```ts
const undoCount = editor.read((state) => state.history().undos.length)

editor.update((tx) => {
  tx.history.undo()
})

editor.update.history.skip((tx) => {
  tx.text.insert('draft')
})
```

Use `History.isHistory(value)` when library code needs to validate an unknown
history value.
