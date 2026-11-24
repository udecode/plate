---
'platejs': patch
---

- Add `RawHtmlPlugin` to `platejs/markdown`. Installed beside `MarkdownPlugin`, it keeps a Markdown file's raw HTML, such as a README's centered header, and most HTML comments on lines of their own in the document, a block quote or a list item. Export writes that text back as HTML when its block passes a check of tags, attributes and URLs. When a marked block fails the check, export writes that block's marked text escaped with a `markdown-unsafe-content` warning
- Keep raw HTML as plain text when `MarkdownPlugin`'s `plainMarks` names `rawHtml`. Import then leaves unmapped HTML without the `rawHtml` mark and drops comment blocks, and export writes marked text escaped. Naming it in a `serialize` call's `plainMarks` escapes marked text for that call
- Drop a 53.x document's saved `rawHtml` in `migrateV54` where no plugin declares `rawHtml`, as `migrateV54` drops `ai`. Keep both inside an element property that an app's plugin declares, such as its own `caption`
- Refuse a 53.x document in `migrateV54` when a pending suggestion on its text changes `ai` and no plugin declares `ai`, instead of opening a suggestion that loses the mark when someone accepts it
