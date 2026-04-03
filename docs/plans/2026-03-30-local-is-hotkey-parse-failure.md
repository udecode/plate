---
title: Local is-hotkey Parse Failure
type: debugging
date: 2026-03-30
status: completed
---

# Local is-hotkey Parse Failure

## Goal

- Fix the local-only `is-hotkey` parse failure that blocks `apps/www` routes.
- Repair the environment, not repo code that already works in CI.

## Current Plan

1. Inspect the installed `is-hotkey` payload and patch application result.
2. Confirm whether local `.bun` install state is corrupted.
3. Repair the broken dependency state with the smallest reliable reinstall path.
4. Verify the docs route loads again.

## Findings

- The repo patch at `patches/is-hotkey@0.2.0.patch` is sane.
- The installed file at `node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/lib/index.js` is corrupted.
- Local file state is impossible from source control alone:
  - `name = ALIASES()[name] || name;` is injected into `toKeyCode` after a `return`
  - the closing brace before `function toKeyName` is missing
  - `toKeyName` still uses stale `ALIASES[name]`
- That points to a broken local install / patch application, not a real app or CI failure.
- `pnpm install --ignore-scripts` did not help because pnpm rebuilt `.pnpm`, while the broken file lived in Bun's separate `.bun` install layout.
- A full non-versioned local env wipe removed the stale `.bun` mirror entirely.
- After the clean rebuild, `node_modules/.bun` stayed absent and `apps/www` resolved dependencies from the normal pnpm tree.

## Verification Target

- Installed `is-hotkey` file matches the intended patch shape.
- `PORT=3002 pnpm -C apps/www dev` can serve `/docs/dnd` without the `is-hotkey` parse error.

## Verification Results

- Removed non-versioned local env state:
  - `node_modules`
  - `apps/www/.next`
  - `apps/www/.contentlayer`
  - `.turbo`
- Rebuilt with `pnpm install`
- Confirmed `node_modules/.bun` is absent after reinstall
- `curl -I http://localhost:3002/docs/dnd` returned `HTTP/1.1 200 OK`
- Browser verification:
  - local route `http://localhost:3002/docs/dnd`
  - page title `Drag & Drop - Plate`
  - `h1` text `Drag & Drop`
