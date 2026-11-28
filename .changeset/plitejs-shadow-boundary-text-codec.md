---
'plitejs': patch
---

- Fix pointer, drag, clipboard, Android composition, and DOM integrity caret restoration inside open and closed shadow roots
- Restore empty-leaf zero-width carets and preserve sibling decorated spans when reverting refused native text inserts
- Recognize trailing display newlines on custom-rendered leaves as canonical during DOM integrity checks
