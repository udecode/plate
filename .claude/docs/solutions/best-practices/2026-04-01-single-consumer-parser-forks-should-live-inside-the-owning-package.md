---
title: Keep single-consumer parser forks inside the owning package
type: solution
date: 2026-04-01
status: completed
category: best-practices
module: markdown
tags:
  - markdown
  - parser
  - remark
  - mdast
  - vendor
  - package-ownership
  - workspace
---

# Problem

The streaming markdown work introduced two top-level private workspace packages:

- `packages/remark-parse`
- `packages/mdast-util-from-markdown`

Only `@platejs/markdown` consumed them.

# Symptoms

- The workspace package graph suggested those parser forks were shared infrastructure when they were really markdown implementation details.
- `packages/markdown/package.json` depended on a private workspace package instead of owning its forked parser runtime directly.
- Release and lockfile churn now had to account for extra workspace packages that could never be published or reused on their own.

# Solution

Move both forks under `packages/markdown` as internal vendor code and let `@platejs/markdown` own their runtime dependencies directly.

The final layout is:

- `packages/markdown/src/internal/vendor/remark-parse/*`
- `packages/markdown/src/internal/vendor/mdast-util-from-markdown/*`

Then update the live dependency edges:

- `deserializeMd.ts` imports the local vendor entrypoint instead of `@platejs/remark-parse`
- the vendored `remark-parse` files import the vendored `mdast-util-from-markdown` files by relative path
- `packages/markdown/package.json` carries the parser runtime dependencies itself
- the old top-level private package directories are deleted

# Why This Works

These forks exist to support markdown deserialization and streaming-tail parsing inside one published package. They are not a reusable public surface and they are not shared workspace infrastructure.

Putting them under `packages/markdown` makes the ownership match reality:

- the fork boundary stays close to the code that depends on it
- the top-level workspace package graph gets smaller and easier to read
- release metadata no longer needs to represent private helper packages
- future parser changes can stay package-private until there is a real second consumer

# Verification

## Build and install

```bash
corepack pnpm install
corepack pnpm turbo build --filter=./packages/markdown
```

Result: passing

## Typecheck

```bash
bun ./node_modules/typescript/bin/tsc -p packages/markdown/tsconfig.json --noEmit
```

Result: passing

The standard `corepack pnpm turbo typecheck --filter=./packages/markdown` and `corepack pnpm --filter @platejs/markdown typecheck` commands crashed in this environment inside Node `23.3.0` with a V8 `unreachable code` fatal error before reporting any TypeScript diagnostics.

## Lint

```bash
bun node_modules/@biomejs/biome/bin/biome check . --fix
```

Result: passing, no fixes needed

The standard `corepack pnpm lint:fix` command hit the same Node `23.3.0` V8 crash in this environment before Biome finished.

## Targeted tests

```bash
bun test ./packages/markdown/src/lib/deserializer/deserializeMd.spec.ts ./packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx
```

Result: passing

# Working Rule

If a local upstream fork only serves one published package, keep it inside that package as internal vendor code. Only promote it to a top-level workspace package after a real second consumer appears.
