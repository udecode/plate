---
"@platejs/toc": major
---

Read headings through `editor.plugin(TocPlugin).read.headings()` and insert a
table of contents through `editor.update.toc.insert()`. The plugin owns heading
discovery and insertion instead of exported editor/transaction helpers.

Import the complete React hook family from `@platejs/toc/react`; its content,
observer, element, controller, and sidebar hooks share one `useToc` owner.
