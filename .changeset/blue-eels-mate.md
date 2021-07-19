---
"@udecode/plate-common": major
"@udecode/plate-html-serializer": patch
---

changes:
- BREAKING CHANGE: `normalizeDescendantsToDocumentFragment` parameters are now: `(editor, { descendants })`. Used by the HTML deserializer.
- fix: Handles 1st constraint: "All Element nodes must contain at least one Text descendant."
- fix: Handles 3rd constraint: "Block nodes can only contain other blocks, or inline and text nodes."
