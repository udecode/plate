---
'platejs': patch
---

- Keep `AIChatPlugin`'s preview and pending proposal when a transaction guard refuses its write. `accept`, `insertBelow` and `replaceSelection` close the session only once their write commits.
- Return `{ status: 'invalid' }` from `hide`, `reset`, `show`, `submit` and `reload`, and keep the session, when a guard refuses discarding the pending proposal.
- Keep a streamed proposal when a guard refuses a chunk, and add the next chunk to the same undo step.
