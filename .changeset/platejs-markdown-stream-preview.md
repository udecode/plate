---
'platejs': patch
---

- Fix `parseSlice` with `previous` returning a different preview than a fresh parse when the streamed Markdown holds no-break spaces in a blank line or after a fence, a line of inline code in triple backticks, a math block opened with more than two dollars, a link definition inside a quote or list item or with an escaped or multiline label, a byte order mark or a lone CR line ending
