---
"@platejs/markdown": major
---

- Move Markdown parsing and serialization from `SlateEditor` to `BaseEditor`
- Return immutable Markdown slices and fit them through the compiled editor schema
- Keep deserialization state local to each call and hard-cut the public parser/memoization escape hatch

**Migration:** Pass a v54 Plate editor to exported Markdown helpers and install
`MarkdownPlugin` for editor host-codec parsing and serialization.
