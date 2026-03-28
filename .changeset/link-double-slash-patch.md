---
'@platejs/link': patch
---

- Fixed link validation so text starting with `//` is no longer treated as an internal path. This stops comment-style paste content from being autolinked by mistake, including inside code blocks.
