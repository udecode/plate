---
"@platejs/markdown": patch
---

- Fixed an issue where empty paragraphs were lost during markdown serialization and deserialization. Empty paragraphs are now preserved using zero-width spaces (`\u200B`) internally.
  
  ```ts
  // Before: Empty paragraphs would disappear
  const markdown = serializeMd(editor); // "Text\n\nMore text" → "Text\nMore text"
  
  // After: Empty paragraphs are preserved
  const markdown = serializeMd(editor); // "Text\n\nMore text" → "Text\n\nMore text"
  ```

- Added `preserveEmptyParagraphs` option to control this behavior (defaults to `true`)
