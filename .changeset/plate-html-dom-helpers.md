---
'platejs': major
---

Remove the HTML DOM helpers from the `platejs` root: `collapseWhiteSpace`, `getHtmlComments`, `htmlBrToNewLine`, `htmlTextNodeToString`, `isHtmlBlockElement`, `isHtmlComment`, `isHtmlElement`, `isHtmlInlineElement`, `isHtmlText`, `postCleanHtml`, `removeHtmlNodesBetweenComments`, `replaceTagName`, `someHtmlElement`, `traverseHtmlElements`, and `traverseHtmlNode`.

Remove `getEditorDOMFromHtmlString` from `platejs/static`.

**Migration:** Declare HTML behavior through plugin `formats.html` mappings, or use DOM APIs directly in application code. Replace `getEditorDOMFromHtmlString(html)` with `parseHtml(html, { plugins })` or `editor.api.html.parse(html)`, which read the exported `[data-editor="true"]` root.
