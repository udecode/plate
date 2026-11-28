---
'platejs': patch
---

Disallow formatting marks inside `codeBlock` elements via `contentMarks: false` while keeping review metadata (`authored`) allowed, extend `CodeBlockRules.markdown` with `on: 'space'` and language-capturing `'space'`/`'break'` fences plus `normalizeLanguage`, align cross-block HTML/slice paste on the landing start block, check `lowlight.registered(language)` on highlight errors, strip disallowed formatting marks from single-text code blocks in `migratePlateV54CodeBlocks`, and remove `BaseCodeBlockPlugin`'s `read.entry`, `read.indentDepth`, `read.isEmpty`, and `update.resetBlock`.

**Migration:**

- Replace `editor.plugin(CodeBlockPlugin).read.entry()` with `editor.read.nodes.above({ type: CodeBlockPlugin })`.
- Replace `read.isEmpty()` with `!NodeApi.string(block)` on the containing code block.
- Replace `update.resetBlock()` with `if (editor.read.nodes.block({ type: CodeBlockPlugin })) editor.plugin(CodeBlockPlugin).update.toggle()`.
- Apps that persisted unreleased `v54` beta envelopes or Yjs rooms with the pre-cut code-block schema fingerprint must strip formatting marks from `codeBlock` leaves or migrate from the prior beta fingerprint before reopening.
