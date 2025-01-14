---
'@udecode/plate-core': patch
---

`editor.api.html.deserialize`: Support deserialization from PlateStatic.

New: `getEditorDOMFromHtmlString` returns the editor element in html string (the one with `data-slate-editor="true"`).

New utilities for checking Slate nodes in HTML:
- `isSlateVoid`: Check if an HTML element is a Slate void node
- `isSlateElement`: Check if an HTML element is a Slate element node
- `isSlateString`: Check if an HTML element is a Slate string node
- `isSlateLeaf`: Check if an HTML element is a Slate leaf node
- `isSlateNode`: Check if an HTML element is any type of Slate node
- `isSlatePluginElement`: Check if an HTML element is a Slate element node with a specific plugin key
- `isSlatePluginNode`: Check if an HTML element has a specific plugin key class
- `getSlateElements`: Get all Slate element nodes in an HTML element
