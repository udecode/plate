---
'plitejs': major
---

Add `createPliteLayout(editor, options)` with atomic `runtime.reconfigure`, React pagination surfaces, discriminated virtualized page and top-level layout data, and a typed error sink that isolates subscriber and page-break write failures after publication. React layout hooks connect only after commit, so StrictMode cannot leak discarded render-time runtimes or subscriptions.

Export strict versioned codecs for persisted page settings and page-break snapshots.

Keep the headless root install independent from React. React pagination remains available from `plitejs/page-layout/react`.

Install `@chenglou/pretext` when using either page-layout entrypoint.
