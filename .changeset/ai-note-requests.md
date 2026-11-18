---
'platejs': patch
---

- Fix Insert below after an AI edit response, so it inserts the response below its target and keeps the target as it was, also when the response equals the target or rewrites whole blocks. It inserts nothing once review has decided the response. After a table-cell edit, it still inserts nothing
- Send an AI request made in a board note with only that note's blocks, so a server editor without the board plugins can load it. Two selected table cells send their whole table, `{editor}` expands to the note's blocks, and Try again sends the same request from any view
- Send a pending review change in an AI request as plain text, so a server editor without the review plugin can load it
