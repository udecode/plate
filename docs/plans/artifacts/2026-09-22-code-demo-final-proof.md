# Code demo follow-up proof — 2026-09-22

The full `EditorKit` mounts `DefaultAuthoredPlugin`, which requires a current
`userId` for an authored write. The small and 10,000-line code demos lacked
one. Both demos now use `userId: 'demo'`, consistent with the other editable
demos. The large-code browser assertion checks the live read-only state through
`aria-readonly`; the stale `data-readonly` assertion was removed.

On a restarted source-matched Next dev server at port 3105 with
`PLATE_WWW_PLITE=1` and `PLATE_WWW_DEV_SOURCE=1`, this command passed all six
Chromium rows in one run:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3105 pnpm exec playwright test --config playwright.config.ts --project=chromium tests/browser/code-block-demos.spec.ts tests/browser/code-block-views.spec.ts
```

The rows cover native docs preview and CodeMirror scrolling, small-demo Enter
and copy, initial Python hydration, 10,000-line editing with undo/redo, IME and
viewing mode, mixed native/CodeMirror edits and syntax, and the copied JSON
button. `pnpm --filter www build:registry`, `pnpm --filter www typecheck`,
targeted Ultracite and `git diff --check` also passed after the demo changes.
The browser timing assertion passed as part of the existing docs row; this
work makes no comparative performance or production-bundle claim.
