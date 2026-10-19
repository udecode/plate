---
'platejs': patch
---

Add `platejs/lint` with `BaseLintPlugin`, which checks text blocks with your own `LintRule`s and reports `LintFinding`s by id.

- A rule receives one block's content text, read through inline elements without struck suggestions, with the block and the editor, and returns offsets, a message and optional fixes. Return a promise for a server check; its result counts only while the block matches the one it sent, marks and properties included.
- The plugin checks again only the blocks a commit changes. `api.findings()` lists findings in document order, and `api.at()` returns the finding under the selection focus.
- `api.run(rules?)` lints the whole document again and `api.clear()` stops linting until the next run.
- `update.fix(id, index?)` applies a fix as its own undo step and returns `false` for a finding whose text changed. `update.select(id)` and `update.move(1 | -1)` select a finding.
- Findings paint as decorations carrying `data-lint-id`, `data-lint-rule` and `data-lint-severity`, so nothing is written into the document.
