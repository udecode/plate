# Plate copied UI and blocks

Plate copied UI and blocks deliver editor toolbars, popovers, dialogs, and full demos through the shadcn registry in Radix and Base UI variants.

## Sub-features

- `ui-block-preview`: render a block or `-demo` route in `apps/www` under React Compiler.
- `ui-hand-drive`: verify desktop light layout, console cleanliness, and live interaction.
- `ui-www-browser`: run Playwright specs in `apps/www/tests/browser/` in Plite mode.
- `ui-create-install`: install copied Base and Radix components into disposable Next.js apps.

## How to get to it (user POV)

- Open `/blocks/<name>` (prefer `-demo`) or `/docs/<feature>` on `apps/www`.
- Run `PLAYWRIGHT_BASE_URL=http://localhost:3653 pnpm --filter www test:www-browser:chromium <spec>`.
- Run `pnpm --filter www test:create-install editor-basic editor-ai`.

## Driving it with www-drive and Playwright

Preconditions: `www-drive` (port 3519) or `www-plite-drive` (port 3653) from `.claude/launch.json` is running from this checkout (outside Claude Preview, run `PLATE_WWW_DYNAMIC_DOCS=1 pnpm --filter www build:source:dev` first in a fresh worktree, then launch `next dev` from `apps/www` with the matching env vars) and `curl -sf http://localhost:<port>/api/plite/ready` confirms `root` matches this checkout plus `devSource` and `dynamicDocs` (and `plite` for www specs).

- **Scope:** `node tooling/scripts/hand-drive.mjs scope <changed-files>` lists required cells.
- **Drive preview:** open `http://localhost:3519/blocks/<name>` in a non-webdriver browser at 1280x900 light (with `PLATE_WWW_DRIVE_DIR=docs/plans/artifacts/drive`), exercise the control, confirm visible state updates, and save screenshots to `docs/plans/artifacts/<task-slug>/`.
- **Check visits:** wait >=5 s after the last edit, reload, then run `node tooling/scripts/hand-drive.mjs check <changed-files>` (exit 0; empty args vacuously exit 0).
- **Browser spec:** warm the route via `curl`, then run `PLAYWRIGHT_BASE_URL=http://localhost:3653 pnpm --filter www test:www-browser:chromium tests/browser/<spec>.spec.ts` (add `PLATE_WWW_SYNC_DEMO=1` to the server env for `sync-demo.spec.ts`).
- **Install consumer:** run `pnpm --filter www test:create-install editor-basic editor-ai` (use `PLATE_CREATE_KEEP_TEMP=1` to inspect built output).

## Gotchas

- Bun specs skip React Compiler; prove copied-UI values in `apps/www` without `PLATE_WWW_WEBPACK` (keeping Turbopack's Rust React Compiler active instead of falling back to webpack/Babel).
- `hand-drive.mjs` reads `docs/plans/artifacts/drive/visits.jsonl` directly and rejects desktop visits with `navigator.webdriver === true`.
- A Radix demo does not prove Base UI variants (`registry-variants.ts`); verify both families.
- Both `pnpm --filter www dev` and `pnpm --filter www dev:plite` run `build:registry` and rewrite registry output; use `www-drive` or `www-plite-drive` for clean-tree proofs.
- `/blocks/html-export` needs `apps/www/public/tailwind.css` (`pnpm --filter www build:tw`).
