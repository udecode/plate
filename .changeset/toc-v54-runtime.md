---
'@platejs/toc': major
---

Require React and React DOM 19.2 or newer.

Keep TOC interaction controllers in copied renderers. The package exposes heading discovery and insertion instead of renderer-specific hooks.

Track headings through editor-scoped `NodeKey` values. TOC does not install `ElementIdPlugin` or require persisted element IDs.

Read headings through `editor.plugin(TocPlugin).read.headings()` and insert a table of contents through `editor.update.toc.insert()`. The plugin owns heading discovery and insertion instead of exported editor/transaction helpers.

Copy `toc-node` for active-heading observation, scrolling, and navigation feedback.
