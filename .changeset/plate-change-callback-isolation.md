---
'platejs': patch
---

- Fix a throwing change callback skipping the ones after it. Each plugin `on.nodeChange` and `on.textChange` handler runs on its own, and so does each `EditorRoot` `onCommit`, `onValueChange`, `onSelectionChange`, `onNodeChange` and `onTextChange` callback. `lifecycleErrorSink` receives each failure with the plugin's name, or `EditorRoot` for a callback.
- Fix a change callback that unsubscribes and subscribes again while it runs being called again by the same commit.
