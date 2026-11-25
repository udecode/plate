---
'platejs': patch
---

- Add the eraser to `platejs/ink/react`. `setTool({ size, type: 'erase' })` removes each mark whose painted ink the eraser's path touches. One contact's removals undo as one step unless another edit, local or remote, lands between them. `InkTool` is now a union, so code that reads `tool.brush` checks `tool.type === 'draw'` first.
