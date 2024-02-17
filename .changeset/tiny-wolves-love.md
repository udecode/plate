---
"@udecode/plate-diff": minor
---

`computeDiff`: Add `lineBreakChar?: string` option to replace `\n` characters in inserted and removed text with a character such as '¶'. Without this option, added or removed line breaks may be difficult to notice in the diff.
