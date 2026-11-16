---
'platejs': patch
---

- Fix Markdown serialization writing a link's text as raw HTML when the text is its URL and the URL holds `<`, `>` or whitespace. Such a link now serializes as a Markdown link.
- Fix Markdown serialization dropping a link whose URL GFM does not link in bare text, such as `https://[::1]/docs`.
