---
'@udecode/plate-dnd': major
'@udecode/plate-slash-command': major
'@udecode/plate-autoformat': major
'@udecode/plate-selection': major
'@udecode/plate-trailing-block': major
'@udecode/plate-emoji': major
'@udecode/plate-select': major
'@udecode/plate-docx': major
---

- The following plugins now default to `editOnly: true`. This means their core functionalities (handlers, rendering injections, etc.) will be disabled when the editor is in read-only mode. To override this behavior for a specific plugin, configure its `editOnly` field. For example, `SomePlugin.configure({ editOnly: false })`.
