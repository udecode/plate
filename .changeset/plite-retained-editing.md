---
'plitejs': patch
---

Allow direct deletion of selected struck-through text and preserve independent input inside pending deletions. Use the native caret in retained text and preserve its position through consecutive Backspace and deletion of newly inserted text. In Suggesting mode, Backspace moves left through existing deleted text without creating another edit. Keep text, suggestion associations, and retained-content selections consistent through undo, redo, saving, and collaboration.

Fix Editing-mode range deletion across pending inline suggestions and retained text, including selecting and deleting the entire document across multiple blocks. Preserve accepted text and suggestion visibility through deletion, undo, and redo.

Preserve full native text selections in ordinary content when markup is visible. Resolve typing, deletion, formatting, and composition against the selected live or retained text, and commit prepared commands without losing their individual deletion steps. Keep composition completion and follow-up input on the same mounted editor.
