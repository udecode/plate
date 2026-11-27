# API examples

`docs/vision/plate.md` holds the public API that examples teach; these rules keep
examples honest to it.

## Code Example Rules

- Repo-backed examples only. If a kit does what you're teaching, cite the exact kit file.
- Include real imports from the owning distribution (`platejs`, `platejs/react`,
  and optional `platejs/<feature>` in Plate docs; `plitejs`, `plitejs/react`,
  and optional `plitejs/<subpath>` in Plite docs).
- Use `// ...otherPlugins,` only when the omission is obvious.
- No placeholder comments (`// your logic here`, `// Your validation logic`).
- `showLineNumbers` + `{n-m}` highlights on snippets longer than ~15 lines.
- `title="filename.tsx"` when file context matters.
- Teach model behavior through semantic commands and input rules. An `onDOMBeforeInput` example appears only as a native escape hatch and never carries text-insertion or formatting semantics on its own.

Inline code hygiene:

- CommonMark matches inline-code delimiters by backtick-run length. Literal `` ` ``` ` `` inline breaks rendering.
- To show triple backticks, rephrase ("a triple-backtick fence") or use a fenced block.
