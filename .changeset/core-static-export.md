---
'@platejs/core': major
---

Moved static rendering functionality to `@platejs/core/static` / `platejs/static` to make `@platejs/core` / `platejs` React-free.

**Migration**
To migrate, update your imports from `platejs` to `platejs/static` for all static rendering features listed below:

- `createStaticEditor`, `CreateStaticEditorOptions` - Create static editor instance
- `serializeHtml`, `SerializeHtmlOptions` - Serialize editor content to HTML string
- `PlateStatic`, `PlateStaticProps` - Main static editor component
- `SlateElement`, `SlateElementProps` - Static element component
- `SlateText`, `SlateTextProps` - Static text component
- `SlateLeaf`, `SlateLeafProps` - Static leaf component
- `getEditorDOMFromHtmlString`
