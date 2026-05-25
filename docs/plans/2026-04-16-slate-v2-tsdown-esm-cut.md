---
date: 2026-04-16
topic: slate-v2-tsdown-esm-cut
status: complete
---

# Goal

Hard-cut Rollup from `/Users/zbeyens/git/slate-v2`, move package builds to
`tsdown`, and publish ESM-only package output.

# Decisions

- keep package output ESM-only
- cut `cjs` and `umd`
- use a shared `config/tsdown.config.mts` shaped after Plate's architecture,
  not Plate's exact config
- keep Next dev resolving package `src` directly so HMR does not depend on
  package builds

# Implementation

- added `/Users/zbeyens/git/slate-v2/config/tsdown.config.mts`
- deleted `/Users/zbeyens/git/slate-v2/config/rollup/rollup.config.js`
- deleted `/Users/zbeyens/git/slate-v2/scripts/sync-package-types.mjs`
- converted package manifests to ESM-only `dist/index.js` + `dist/index.d.ts`
- switched package `build` scripts to `tsdown`
- simplified root `dev` to `pnpm serve`
- switched Jest to source mapping for workspace packages so ESM dist does not
  break the test lane
- fixed `slate-dom` public DOM helper type exports for bundled declarations

# Verification

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

# HMR Proof

- reused the live Next dev server on `http://localhost:3100`
- opened `/examples/plaintext`
- typed editor content into the page
- patched `packages/slate-react/src/components/string.tsx`
  temporarily to add a probe attribute
- observed the open page update to include the new attribute while preserving
  the typed text
- reverted the probe patch

That proves the app is consuming package `src` live in dev without any package
build step.
