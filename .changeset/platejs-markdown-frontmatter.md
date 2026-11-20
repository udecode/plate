---
'platejs': patch
---

- Write a document's `meta['markdown.frontmatter']`, a `{ format, value }` YAML or TOML front matter block, before the body when `editor.api.markdown.serialize` exports it
- Fail `serialize` under the reject policy with `markdown-frontmatter-omitted` when the stored front matter cannot be written back; under `lossPolicy: 'allow'` it writes the file without the block and warns
