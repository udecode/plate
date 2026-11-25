# Potion feature map

One file per user-facing feature. Each says how a user reaches it, how to drive
it with the built-in browser against the stack that [stack.md](../stack.md) starts, and what end state
proves it. Status says whether a run of this recipe has driven it end to end.

| Feature | File | Entry points | Status |
| --- | --- | --- | --- |
| Documents: create, title, body, persist | [documents.md](documents.md) | sidebar new-page button, `/<id>` | driven 2026-11-25 on the D1 stack |
| Editor playground (no sign-in) | [editor-playground.md](editor-playground.md) | `/editor`, sidebar `Editor` | not yet driven |
| Collaboration | [collaboration.md](collaboration.md) | off until native sync | none |
| Publish and preview | [publish-preview.md](publish-preview.md) | navbar share, `/preview/<id>` | not yet driven |
| Export and print | [export.md](export.md) | navbar `More actions`, `/print/<id>` | not yet driven |

Routes come from `src/routes`: `_main/index.tsx` (home), `_main/$documentId.tsx`,
`login.tsx`, `preview.$documentId.tsx`, `print.$documentId.tsx`, `editor.tsx`
and `chat.tsx`. The `_main` layout signs out to `/login`.
