# @platejs/plite-layout

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add `createPliteLayout(editor, options)` with atomic `runtime.reconfigure`, React pagination surfaces, discriminated virtualized page and top-level layout data, and a typed error sink that isolates subscriber and page-break write failures after publication. React layout hooks connect only after commit, so StrictMode cannot leak discarded render-time runtimes or subscriptions.

  Export strict versioned codecs for persisted page settings and page-break snapshots.

  Keep the headless root install independent from React. React pagination remains available from `@platejs/plite-layout/react`.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.
