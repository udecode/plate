---
'platejs': patch
---

- Allow `defineFormats({ html, plainText })` without requiring `markdown`, and tighten `DocxNodeMapping`, `MarkdownNodeMapping`, and `PlainTextNodeMapping` types and runtime guards to match schema roles
- Report `property-dropped` diagnostics on DOCX export only for rendered roots and anchored comment bodies, and admit multi-property element-property plugins
- Preserve `data-locked` and empty `codeBlock.meta` in HTML round trips, report unclaimed `data-locked`, `data-meta`, and board arrow/frame/stroke attributes, and remove no-op `plainText` encoders on callout, code block, and column plugins so foreign overrides and contributed content roots apply
- Skip absent foreign `markdown`, `plainText`, and `docx` targets and reject mismatched schema-family targets at runtime
