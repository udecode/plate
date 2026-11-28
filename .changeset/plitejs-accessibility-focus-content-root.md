---
'plitejs': patch
---

- Unify content-root owner-chain resolution in `content-root-navigation.ts`, keeping duplicated synced-block hosts on the focused host during projected selection extension and guarding cross-root focus retries against intervening focus moves.
- Use shadow-aware selection, containment, and flat-tree visibility checks in `runtime-focus-mouse-events.ts`, `selection-void-target.ts`, `caret-engine.ts`, and `interaction-owner.ts`.
- Make `refusesReadOnlyWrite` root-aware and refuse partial writes whose range starts or ends inside a read-only inline across `insertText`, `insertBreak`, `deleteFragment`, and `deleteText`.
