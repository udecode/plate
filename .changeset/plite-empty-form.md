---
'plitejs': patch
---

- Give an emptied element whose content admits text one empty text, whether its characters were deleted, its only text node was removed or `editor.read.schema.create` built it; content that admits only blocks may still be empty
- Load `createEditor({ initialValue })` in canonical form, adding the empty text an element needs and merging and spacing texts as an edit would
- Refuse an applied document change that leaves an element whose content admits text with no children, with an `EditorSchemaValidationError`
- Keep an emptied line's formatting in the selection's pending marks instead of on its empty text, so typing at the caret keeps the formatting, and the line is plain once the caret leaves or the document reloads
- Report the formatting an empty line or inline spacer drops with the `omit-empty-text-property` fit repair, which HTML, Markdown and DOCX imports read as lossless
- Build required content once, at the element's site, for edits, schema construction, loading and authored decisions, and fail to compile a content rule whose `min` no content reaches within its `max`, such as `schema.content.text({ min: 2 })`
