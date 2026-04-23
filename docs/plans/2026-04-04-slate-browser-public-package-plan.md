---
date: 2026-04-04
topic: slate-browser-public-package-plan
status: completed
---

# Slate Browser Public Package Plan

## Goal

Move `slate-browser` out of `support/` and into `../slate-v2/packages/` as a real
workspace package with a public package shape.

## Repo Facts

- `../slate-v2` only treats `packages/*` as workspace packages
- root `build:rollup` manually enumerates each public package in
  `config/rollup/rollup.config.js`
- `support/slate-browser` exists today as a nested npm island because it was
  born as a fast spike around Yarn PnP friction
- that shape is no longer good enough if `slate-browser` is meant to be public

## Promotion Requirements

1. real package directory under `packages/slate-browser`
2. public package metadata and build outputs
3. root scripts promoted away from `support/`
4. browser/core test lanes still runnable from repo root
5. docs updated to describe the package as first-tranche public surface, not a
   leftover spike

## Open Decisions

1. whether repo-internal tests should import the package name directly or keep
   thin local wrappers onto package source during the transition
2. whether `slate-browser` should ship as a regular public semver package now
   or keep an experimental version/description while still living in `packages/`

## Current Recommendation

- move the implementation into `packages/slate-browser`
- keep thin local wrappers during transition if they reduce build-order pain
- give the package a real public-looking package shape
- keep release semantics conservative if publishing itself is not part of this
  exact turn

## Progress

### 2026-04-04

- copied the current implementation into `../slate-v2/packages/slate-browser`
- added package metadata, build config, and package-local tests there
- split the public API into:
  - top-level pure/browser exports
  - `slate-browser/core`
  - `slate-browser/browser`
  - `slate-browser/playwright`
- promoted the root `slate-browser` commands away from the nested `support/`
  path and onto workspace scripts
- added `slate-browser` to Rollup’s explicit package build list
- removed the old `support/slate-browser` duplicate
- added a Yarn `packageExtensions` fix so the Vitest browser lane works under
  PnP once it lives in a real workspace package
- switched repo Playwright consumers to `slate-browser/playwright`
- added targeted `build:slate-browser` so Playwright consumers of built subpath
  exports do not require a full repo rollup first
- proved the real paste seam through browser clipboard write plus actual paste
  gesture
- public clipboard scope now includes:
  - `copy()`
  - `copyPayload()`
  - `pasteText()`
  - `pasteHtml()`
- strengthened the Playwright API shape with:
  - getter namespace
  - selection namespace
  - exact-vs-contains HTML assertions
  - clipboard assertion helpers
  - smarter `openExample(...)` readiness options
- kept fixture scope honest:
  `openFixture(...)` is omitted until a real fixture lane exists

## Verification

- `yarn install`
- `yarn workspace slate-browser test`
- `yarn build:slate-browser`
- `yarn test:slate-browser`
- `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:e2e`
- `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:ime`
- `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:clipboard`
- `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:anchors`
- `yarn build:rollup`
- `yarn lint:typescript`
