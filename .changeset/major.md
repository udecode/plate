---
"@udecode/plate-core": major
---

rename:
- `getAbove` to `getAboveNode`
- `getParent` to `getParentNode`
- `getText` to `getEditorString`
- `getLastNode` to `getLastNodeByLevel`
- `getPointBefore` to `getPointBeforeLocation`

Removing node props types in favor of element types (same props + extends `TElement`). You can use `TNodeProps` to get the node data (props).
- `LinkNodeData` -> `TLinkElement`
- `ImageNodeData` -> `TImageElement`
- `TableNodeData` -> `TTableElement`
- `MentionNodeData` -> `TMentionElement`
- `MentionNode` -> `TMentionElement`
- `MentionInputNodeData` -> `TMentionInputElement`
- `MentionInputNode` -> `TMentionInputElement`
- `CodeBlockNodeData` -> `TCodeBlockElement`
- `MediaEmbedNodeData` -> `TMediaEmbedElement`
- `TodoListItemNodeData` -> `TTodoListItemElement`
- `ExcalidrawNodeData` -> `TExcalidrawElement`
