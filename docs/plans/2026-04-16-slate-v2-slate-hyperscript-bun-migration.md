---
date: 2026-04-16
topic: slate-v2-slate-hyperscript-bun-migration
status: completed
---

# Goal

Fully migrate `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript` off the
Mocha fixture harness onto the root Bun test setup.

# Constraints

- Keep only the root `/Users/zbeyens/git/slate-v2/bunfig.toml`
- Keep the `test/` directory name
- No fake skips or suppressed tests
- Do not broaden the change into `slate` or `slate-history`

# Findings

- Current package test entry started Mocha-only:
  `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js`
- direct Bun TSX still does not honor the hyperscript pragma path here
- the legacy fixture bank and dynamic harness are gone
- the package now uses one first-class Bun spec file plus a tiny local JSX helper
- the remaining bridge is a scoped preload transform in `config/bun-test-setup.ts`
  that targets the Bun spec file instead of the old fixture corpus

# Plan

1. Replaced the package's Mocha test entry with a Bun spec entrypoint
2. Replaced the old fixture bank with a first-class Bun spec:
   `packages/slate-hyperscript/test/hyperscript.spec.tsx`
3. Added a tiny local JSX helper:
   `packages/slate-hyperscript/test/jsx.ts`
4. Retargeted the scoped Bun preload transform to the new Bun spec file
4. Renamed `config/tsconfig.bun-test.json` to `config/tsconfig.test.json`
5. Rewired root and package test scripts for this package
6. Verified package build, lint, root test flow, and Bun package test flow

# Verification

- `pnpm install`
- `pnpm turbo build --filter=./packages/slate-hyperscript`
- `pnpm turbo typecheck --filter=./packages/slate-hyperscript`
- `bun test ./packages/slate-hyperscript/test/hyperscript.spec.tsx`
- `pnpm test:bun`
- `pnpm test`
- `pnpm lint`
