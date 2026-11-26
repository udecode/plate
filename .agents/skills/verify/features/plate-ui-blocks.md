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

Preconditions: `www-drive` (port 3519) or `www-plite-drive` (port 3653) is running from this checkout and `curl -sf http://127.0.0.1:<port>/api/plite/ready` confirms `devSource` and `dynamicDocs` (plus `plite` for www specs).

- **Scope:** `node tooling/scripts/hand-drive.mjs scope <changed-files>` lists required cells.
- **Drive preview:** open `http://127.0.0.1:3519/blocks/<name>` at 1280x900 light, exercise the control, confirm visible state updates, and save screenshots to `docs/plans/artifacts/<task-slug>/`.
- **Check visits:** wait >=5 s after the last edit, reload, then run `node tooling/scripts/hand-drive.mjs check <changed-files>` (exit 0).
- **Browser spec:** warm the route via `curl`, then run `PLAYWRIGHT_BASE_URL=http://localhost:3653 pnpm --filter www test:www-browser:chromium tests/browser/<spec>.spec.ts`.
- **Install consumer:** run `pnpm --filter www test:create-install editor-basic editor-ai` (use `PLATE_CREATE_KEEP_TEMP=1` to inspect built output).

## Gotchas

- Bun specs skip React Compiler; prove copied-UI values in `apps/www` without `PLATE_WWW_WEBPACK`.
- A Radix demo does not prove Base UI variants (`registry-variants.ts`); verify both families.
- `pnpm --filter www dev` rewrites registry output; use `www-drive` for clean-tree proofs.
- `/blocks/html-export` needs `apps/www/public/tailwind.css` (`pnpm --filter www build:tw`).
