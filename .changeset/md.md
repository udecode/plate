---
'@udecode/plate-markdown': minor
---

- `api.markdown.deserialize`: add second argument option: `processor?: (processor: Processor) => Processor`. You could use this to add other remark plugins like `remark-gfm`.
- Add `delete` text rule. This does not add support for strikethrough yet.
