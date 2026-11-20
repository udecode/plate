---
'platejs': patch
---

- Keep a Markdown file's leading YAML or TOML front matter. `editor.api.markdown.parse` stores it at `meta['markdown.frontmatter']` instead of reading it as a rule and a heading, `serialize` writes it back first, and `getMarkdownFrontmatter` from `platejs/markdown` reads it
- Fail `serialize` under the reject policy with `markdown-frontmatter-omitted` when the stored front matter cannot be written back; under `lossPolicy: 'allow'` it writes the file without the block and warns
- Start a serialized file with a line ending when its body would otherwise open with a block that reads back as front matter, such as two `---` rules
