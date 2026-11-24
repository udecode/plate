---
'platejs': patch
---

- Add `RawHtmlPlugin` to `platejs/markdown`. Installed beside `MarkdownPlugin`, it keeps a Markdown file's raw HTML, such as a README's centered header, and HTML comments on lines of their own. Export writes that HTML back when it passes a check of tags, attributes and URLs, and otherwise writes it escaped with a `markdown-unsafe-content` warning.
- Keep raw HTML as plain text when `MarkdownPlugin`'s `plainMarks`, or a `serialize` call's, names `rawHtml`.
- Drop a 53.x document's saved `rawHtml` in `migrateV54` where no plugin declares it, as `migrateV54` drops `ai`.
- Refuse a 53.x document in `migrateV54` when a pending suggestion changes `ai` and no plugin declares `ai`, instead of opening a suggestion that loses the mark when accepted.
