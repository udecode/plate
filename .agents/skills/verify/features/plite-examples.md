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

Preconditions: `node apps/plite/scripts/inspect-plite-browser.mjs doctor` has been run (it always exits 0; read both `fresh` fields, as managed runs rebuild stale artifacts automatically) and no other Plite browser run holds the lock.

- **Discover:** `node apps/plite/scripts/inspect-plite-browser.mjs journeys plaintext [--case '<substring>']` returns route, spec, and runner argv (`<example>` is required before `--case`).
- **Focused suite:** `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/plaintext.test.ts` exits 0 (set `PLITE_BROWSER_PORT=<free port>` if `127.0.0.1:3102` is held by another checkout; copy any `apps/plite/test-results/` before rerunning).
- **Interactive:** open `http://localhost:3298/examples/plite/plaintext`, focus `[data-editor="true"]`, type key by key, and read DOM text plus `document.querySelector('[data-editor="true"]').__EDITOR_BROWSER_HANDLE__.getValue()`.
- **Yjs peers:** start `PLITE_YJS_STORAGE_DIR=<run-dir>/yjs-data bun tooling/plite/donor/yjs/hocuspocus-server.ts`, open `peer=a` and `peer=b` with `?connection=manual&room=r1`, wait for `[data-admission-status="waiting"]`, click `Online` in both until `[data-admission-status="ready"]`, edit in A, and verify B converges.
- **Matrix:** run `pnpm check:plite:browser-matrix` for WebKit/mobile closure.

## Gotchas

- Never run Playwright specs via `bun test`.
- `-g` is a regex (`+` and `(` must be escaped). `node apps/plite/scripts/run-plite-browser.mjs direct` accepts extra Playwright flags, but omits `--project` and runs every browser project unless `--project=chromium` (or another project) is passed.
- Unchanged managed runs reuse cached passing proofs unless `PLITE_BROWSER_FORCE_PROOF=1` is set.
- `apps/plite` uses `output: 'export'` and has no `/api/plite/ready` route; managed Playwright serves `apps/plite/out` on `127.0.0.1:3102` (not `3298`), and interactive `next dev` rewrites `apps/plite/AGENTS.md` and `apps/plite/next-env.d.ts` (restore before commit).
- `apps/plite` shares `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`; never create a second registry.
