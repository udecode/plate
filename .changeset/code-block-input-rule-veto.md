---
'platejs': patch
---

- Run no input rule inside a code block, so typed `# `, `**x**` and `->`, Enter after `$$`, and a pasted URL stay as typed. Export `inputRuleVeto`; an element that contributes its type to it keeps rules out the same way, and a rule's `enabled` cannot let it back in
- Run no input rule when `insertText` passes an explicit `at` other than the selection range
- Markdown no longer converts plain text pasted into a code block
- Turn `---` and `___ ` into a divider only when the marker is the block's only content. After the divider, add the block Enter adds on a divider, which is the container's declared default, such as a `title` in an app whose root defaults to `title` or the quote's default block inside a blockquote. Typed beside existing text or an inline element such as a mention, the marker stays as typed
- List numbering, TOC headings and Shift+Tab out of a quote read the installed heading and blockquote plugins, so they no longer treat a plugin that only shares the `heading` or `blockquote` name as one
- Resolve a plugin descriptor in format lookups the way `editor.plugin` does
- Without a paragraph plugin, land each top-level Markdown paragraph in the root's default block for its position, and write that block back as a Markdown paragraph. Markdown refuses a paragraph that cannot land, such as one inside a container or in a slice, and `parseMarkdown` reads the app's schema. In such an app, Markdown no longer reads or writes an app block stored as `paragraph` as a paragraph, so copying part of a block that no Markdown mapping claims writes no `text/markdown`
