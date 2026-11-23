---
'platejs': patch
---

- Keep `AIChatPlugin`'s preview, its pending proposal and its change id when a transaction guard refuses the write. `accept`, `insertBelow` and `replaceSelection` close the session only once their write commits, or once it commits nothing because the draft already matches the document.
- Return `{ status: 'invalid' }` and keep the session from `hide`, `reset`, `show`, `submit` and `reload` when a guard refuses discarding the pending proposal. `reload` and `submit` then send no request.
- Keep a streamed proposal when a guard refuses the next chunk, and propose the chunk after it in the same undo step.
