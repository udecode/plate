---
"@platejs/markdown": patch
---

- Deserialize `<ul>` and `<ol>` inside table cells as indent-list paragraphs, including nested lists, `<ol start>`, and checkbox todo items.
- Serialize list paragraphs inside table cells as `<ul>` and `<ol>` instead of breaking the table row.
- Serialize line breaks inside table cells as `<br/>`.
- Fix inline HTML `<a href>` links losing their URL on deserialize.
