---
'@platejs/core': patch
---

- Fixed BR tags between block elements from Google Docs creating two empty paragraphs instead of one. The deserialization now correctly converts BR tags between blocks to single empty paragraphs.