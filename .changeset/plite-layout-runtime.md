---
'plitejs': major
---

Add `createPliteLayout(editor, options)` with atomic `runtime.reconfigure`, React pagination surfaces, discriminated virtualized page and top-level layout data, and a typed error sink that isolates subscriber and page-break write failures after publication. React layout hooks connect only after commit, so StrictMode cannot leak discarded render-time runtimes or subscriptions.

Export strict versioned codecs for persisted page settings and page-break snapshots.

Keep the headless root install independent from React. React pagination remains available from `plitejs/pagination/react`.

Install `@chenglou/pretext` when importing `plitejs/pagination` or `plitejs/pagination/react`.
