---
'platejs': patch
---

- Fix `parseSlice` with `previous` returning a different preview than a fresh parse for streamed Markdown that holds, among others, no-break spaces in a blank line, a math block opened with more than two dollars, a link definition with an escaped bracket, a byte order mark or a lone CR line ending
