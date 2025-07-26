---
"@platejs/code-block": patch
---

Fix: Restore syntax highlighting after code block formatting

- Reset cached decorations after formatting code blocks
- Trigger re-render to ensure syntax highlighting is reapplied
- Fixes issue where formatting JSON code blocks would cause syntax highlighting to disappear