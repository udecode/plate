---
"@platejs/markdown": patch
---

- Keep HTML that has no rule as source: unknown tags, raw `html` nodes and HTML comments deserialize as a text leaf with `rawHtml: true` and serialize back unescaped. Before, `<b>x</b>` came back as `\<b>x\</b>`, and comments were dropped.
- Keep Markdown inside unknown tags: `` <b>`code`</b> `` no longer loses its backticks, and a list or paragraph inside a block tag such as `<details>` keeps the blank lines around it, so it still renders as Markdown.
