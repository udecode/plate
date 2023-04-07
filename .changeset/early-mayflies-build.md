---
"@udecode/plate-dnd": patch
"@udecode/plate-ui-dnd": patch
---

- add an **optional** `onDropHandler` to the `draggableProps` property. This handler takes the same arguments as the `drop`function in the `useDropNode` hook and should return `boolean`.If the function returns `true`, the default onDropNode behavior will not be called since it would be considered handled. If the function returns `false`, the default onDropNode will be triggered.
- add an `editorId` property to the `dragItem` property so there is always a reference to the editor from which the item was dragged. This allows for better support and more control when working with nested editors.
