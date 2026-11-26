# Plite browser examples

Interactive Plite editor examples covering plain text, rich text, marks, tables, links, suggestions, and Yjs collaboration in real browsers.

## Sub-features

- `plite-discover`: list examples and Playwright journeys without launching a server.
- `plite-managed-suite`: run Chromium/Firefox/WebKit browser specs on registered examples.
- `plite-interactive`: drive an example live to inspect caret, selection, paint, and focus.
- `plite-yjs`: sync two peers over a local Hocuspocus server on `/examples/plite/yjs-hocuspocus`.

## How to get to it (user POV)

- Open `/examples/plite/<registered-path>` on `apps/plite` (`pnpm --filter plite exec next dev --port 3298`) or `apps/www`.
- Run `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.

## Driving it with inspect-plite-browser and Playwright

Preconditions: `node apps/plite/scripts/inspect-plite-browser.mjs doctor` passes (read both `fresh` fields) and no other Plite browser run holds the lock.

- **Discover:** `node apps/plite/scripts/inspect-plite-browser.mjs journeys plaintext` returns route, spec, and runner argv.
- **Focused suite:** `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/plaintext.test.ts` exits 0; copy any `apps/plite/test-results/` before rerunning.
- **Interactive:** open `http://localhost:3298/examples/plite/plaintext`, focus `[data-editor="true"]`, type key by key, and read DOM text + `__EDITOR_BROWSER_HANDLE__.getValue()`.
- **Yjs peers:** start `PLITE_YJS_STORAGE_DIR=<run-dir>/yjs-data bun tooling/plite/donor/yjs/hocuspocus-server.ts`, open `peer=a` and `peer=b` with `?connection=manual&room=r1`, click `Online`, edit in A, verify B.
- **Matrix:** run `pnpm check:plite:browser-matrix` for WebKit/mobile closure.

## Gotchas

- Never run Playwright specs via `bun test`.
- `-g` is a regex (`+` and `(` must be escaped); use `node apps/plite/scripts/run-plite-browser.mjs direct` for extra Playwright flags.
- `apps/plite` shares `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`; never create a second registry.
