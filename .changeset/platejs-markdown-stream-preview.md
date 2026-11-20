---
'platejs': patch
---

- Fix `parseSlice` with `previous` returning a different preview than a fresh parse when the streamed Markdown holds no-break spaces in a blank line or after a fence closer, a line of inline code in triple backticks, a math block opened with more than two dollars, a link definition with an escaped bracket or a label across lines, a byte order mark or a lone CR line ending
