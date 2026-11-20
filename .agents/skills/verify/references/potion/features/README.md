# Potion feature map

One file per user-facing feature. Each says how a user reaches it, how to drive
it with the built-in browser against the stack that [stack.md](../stack.md) starts, and what end state
proves it. Status says whether a run of this recipe has driven it end to end.

| Feature | File | Entry points | Status |
| --- | --- | --- | --- |
| Documents: create, title, body, persist | [documents.md](documents.md) | sidebar new-page button, `/<id>` | driven 2026-10-28 |
| Editor playground (no sign-in) | [editor-playground.md](editor-playground.md) | `/editor`, sidebar `Editor` | not yet driven |
| Collaboration (Yjs) | [collaboration.md](collaboration.md) | navbar `Collaborate`, two tabs on `/<id>` | not yet driven |
| Publish and preview | [publish-preview.md](publish-preview.md) | navbar share, `/preview/<id>` | not yet driven |
| Export and print | [export.md](export.md) | navbar `More actions`, `/print/<id>` | not yet driven |

Routes come from `src/app`: `(main)/(protected)/page.tsx` (home),
`(protected)/[documentId]`, `(auth)/login`, `(public)/preview/[documentId]`,
`(export)/print/[documentId]`, `editor`, `(dev)/chat`.
