---
"@platejs/code-block": major
---

Keep `Backspace` at the start of a non-empty first code line inside the code block.
Merge an empty inner code line into the previous code line instead of unwrapping the block.

**Migration:** Expect `Backspace` at code-line boundaries to stay code-local unless the whole code block is empty.
