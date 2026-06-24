# Lexical Selection Notes

Relevant source:
- `../lexical/packages/lexical/src/LexicalEditorState.ts:28-46`
- `../lexical/packages/lexical/src/LexicalUtils.ts:633-649`
- `../lexical/packages/lexical/src/LexicalUtils.ts:1192-1210`

Take:
- Lexical makes dirty selection an explicit editor-state signal.
- `$setSelection` marks a selection dirty and clears cached selected nodes.
- `$selectAll` is model-level root selection; it does not depend on native DOM
  text selection spanning the document.

Plite implication:
- Benchmark select-all, delete, and undo as model/projection operations.
- Do not conflate native selected text length with model select-all correctness
  in partial DOM lanes.
