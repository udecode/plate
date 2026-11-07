---
'platejs': patch
---

- Fix a throwing change callback skipping the ones after it. Each plugin `on.nodeChange` and `on.textChange` handler runs on its own, and so does each `EditorRoot` `onCommit`, `onValueChange`, `onSelectionChange`, `onNodeChange` and `onTextChange` callback. `lifecycleErrorSink` receives each failure with the plugin's name, or `EditorRoot` for a callback.
