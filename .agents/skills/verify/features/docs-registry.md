# Docs and registry outputs

English and Chinese docs routes, live editor previews, API reference manifests, and shadcn registry JSON files served by `apps/www`.

## Sub-features

- `docs-render`: render `/docs/<slug>` and `/cn/docs/<slug>` MDX pages with live previews.
- `docs-route-health`: check every docs and example route across Chromium, Firefox, and WebKit.
- `registry-build`: generate `apps/www/src/__registry__/` and `apps/www/public/r/*.json` (plus gitignored `apps/www/public/rd/*.json` and `apps/www/src/__registry__/create-preview/`).
- `api-reference`: build and check `apps/www/src/generated/api-reference-manifest.json` against `apps/www/api-reference-baseline.json`.

## How to get to it (user POV)

- Open `/docs/<slug>` or `/cn/docs/<slug>` on `apps/www` or `https://beta.platejs.org`.
- Run `pnpm --filter www build:registry`, `pnpm --filter www api-reference:check`, and `node tooling/scripts/page-health.mjs [--list] [--base <url>]`.

## Driving it with www-drive and page-health

Preconditions: `www-drive` (port 3519) from `.claude/launch.json` is running from this checkout or `--base <url>` is reachable. If port 3519 is held by another checkout (check `lsof -nP -iTCP:3519-3522 -sTCP:LISTEN`), start a `.claude/launch.json` spare (`www-drive-spare` 3520, `www-drive-spare-2` 3521, `www-drive-spare-3` 3522) or launch `next dev --port <free-port>` from `apps/www` with the `www-drive` env vars, and pass that port in URLs and `--base`.

- **List interactive routes:** `node tooling/scripts/page-health.mjs --list [--base <url>]` prints tiered interactive demo routes (`Slate`, `Plate`, `New Slate`, `New Plate`) and issues live `HEAD` requests to `https://platejs.org` (it does not list `/docs/components/*`, non-preview docs, `/cn/docs/*`, or `/docs/releases/*`).
- **Render check:** open `http://localhost:3519/docs/<slug>`, wait past `Loading…` for `[data-editor-node="value"]` to mount, verify zero console/page errors, and inspect a screenshot. Verify `/cn/docs/<slug>` renders translated Chinese or shows `[data-docs-untranslated]` on English fallback.
- **Registry and API reference build:** run `pnpm --filter www build:registry && pnpm check www registry-icons registry-changelog` after editing `apps/www/src/registry/` (`pnpm check www` already checks `api-reference:check`, but skips `registry-icons` and `registry-changelog`). Run `pnpm --filter www api-reference` to regenerate the API manifest after `platejs` export changes.
- **Route health:** run `node tooling/scripts/page-health.mjs --base http://localhost:3519 [--engines chromium] [--only /docs/table]` (omit `--engines`/`--only` for all routes across Chromium, Firefox, and WebKit) and confirm zero reported problems.

## Gotchas

- Docs MDX is hard-wrapped; collapse whitespace before grepping `curl` HTML/RSC output.
- HTTP 200 and `<title>` stream before client previews mount; wait for `[data-editor-node="value"]`.
- `page-health.mjs` checks HTTP `<400`, non-404 title, uncaught `pageerror`, and `[data-editor-node="value"]` on editor routes, but does not listen to `console` errors.
- `/cn/docs` falls back to English with `[data-docs-untranslated]` when no `.cn.mdx` twin exists, and custom app routes override MDX; record both separately.
