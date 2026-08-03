# plite-history

Canonical-change undo and redo for Plite editors.

Install history with the `history()` extension.

```ts
import { createEditor } from '@platejs/plite'
import { History, history } from '@platejs/plite-history'

const editor = createEditor({
  extensions: [history({ newBatchDelay: 500 })],
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
})

const isHistoryValue = editor.read((state) =>
  History.isHistory(state.history())
)
```

`newBatchDelay` defaults to 500 milliseconds. It applies only to otherwise
compatible automatic native edit groups. Explicit `merge()` and `newBatch()`
transactions remain authoritative. History JSON never persists timestamps.

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

Read history through `state.history`, replay it through
`editor.update.history.*`, and choose the history policy with a policy-first
`editor.update` call.

```ts
const undoCount = editor.read((state) => state.history().undos.length)

editor.update.history.undo()

editor.update({ history: 'skip' }).text.insert('draft')
```

Use `History.isHistory(value)` when library code needs to validate an unknown
history value.

Persist and restore validated history with version 4 JSON. The envelope
includes the editor's schema identity, so decoding fails before batch data is
read when the installed schema does not match.

```ts
const json = History.toJSON(editor)
const decoded = History.fromJSON(editor, json)

editor.update((tx) => {
  tx.history.restore(decoded)
})
```
