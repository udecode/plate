---
'platejs': major
---

Remove Auto language detection from `CodeHighlightPlugin`. A code block whose language is `auto`, set on the block or through `defaultLanguage`, now shows plain text, and in development it logs a missing-language warning. `CodeHighlightLowlight` no longer includes `highlightAuto`.

**Migration:** Replace `defaultLanguage: 'auto'` with a real language. In saved documents, replace `language: 'auto'` with the block's real language, or remove the property so the block uses `defaultLanguage`.
