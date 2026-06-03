---
'@platejs/docx-io': patch
---

Fix `exportToDocx` adding blank paragraphs at the top of the document. `wrapHtmlForDocx` emitted a `<!DOCTYPE html>` and indented the template; html-to-docx (html-to-vdom) keeps the DOCTYPE and the whitespace-only text nodes between tags and renders each as a blank paragraph. The wrapper now emits tight markup with no DOCTYPE.
