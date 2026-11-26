# Docs and registry outputs

English and Chinese docs routes, live editor previews, API reference manifests, and shadcn registry JSON files served by `apps/www`.

## Sub-features

- `docs-render`: render `/docs/<slug>` and `/cn/docs/<slug>` MDX pages with live previews.
- `docs-route-health`: check every docs and example route across Chromium, Firefox, and WebKit.
- `registry-build`: generate `apps/www/src/__registry__/` and `apps/www/public/r/*.json`.

## How to get to it (user POV)

- Open `/docs/<slug>` or `/cn/docs/<slug>` on `apps/www` or `https://beta.platejs.org`.
- Run `pnpm --filter www build:registry` and `node tooling/scripts/page-health.mjs [--list]`.

## Driving it with www-drive and page-health

Preconditions: `www-drive` (port 3519) is running from this checkout or `--base <url>` is reachable.

- **List routes:** `node tooling/scripts/page-health.mjs --list` prints canonical docs, component, and example routes with reference twins.
- **Render check:** open `http://localhost:3519/docs/<slug>`, wait past `Loading...` for embedded previews to mount, verify zero console/page errors, and inspect a screenshot.
- **Registry build:** run `pnpm --filter www build:registry && pnpm check www` after editing `apps/www/src/registry/`.
- **Route health:** run `node tooling/scripts/page-health.mjs --base http://localhost:3519` and confirm zero errors or Not Found routes.

## Gotchas

- Docs MDX is hard-wrapped; collapse whitespace before grepping `curl` HTML/RSC output.
- HTTP 200 and `<title>` stream before client previews mount; wait for the rendered editor.
- `/cn/docs` falls back to English without a `.cn.mdx` twin, and custom app routes override MDX; record both separately.
