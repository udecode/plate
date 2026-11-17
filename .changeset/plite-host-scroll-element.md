---
'plitejs': patch
---

Add a `fallback` option to `useEditorScrollElementRef`. A fallback element scrolls the editor only while no other element is registered. An element registered without the option applies to every editor of the document, view editors inside `EditorRoot` included, so `editor.api.dom.scroll()`, `scrollIntoView` and `VirtualizedEditable` scroll it.
