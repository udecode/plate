---
title: Workspace package typecheck may need a root build first
category: test-failures
date: 2026-03-17
tags:
  - workspace
  - typecheck
  - build
  - exports
---

# Workspace package typecheck may need a root build first

## Problem

A filtered package build can still leave package typecheck looking broken with unresolved workspace imports.

The failure smells real because it shows a wall of `Cannot find module ...` errors, but sometimes the package just does not have all required workspace-built exports available yet.

## Root Cause

In this repo, some package typechecks depend on built outputs from other workspace packages that are not reliably satisfied by a narrow `pnpm turbo build --filter=./packages/<name>` pass.

That means the filtered build can succeed while the later filtered typecheck still sees missing package entrypoints.

## Solution

Use the normal build-first flow first:

```bash
pnpm install
pnpm turbo build --filter=./packages/<name>
pnpm turbo typecheck --filter=./packages/<name>
```

If typecheck still shows unresolved workspace-package imports, run the root build and retry:

```bash
pnpm build
pnpm turbo typecheck --filter=./packages/<name>
```

This cleared the false failures for `@platejs/selection` and `@platejs/docx-io`.

## Prevention

- Do not label unresolved workspace imports as package debt until after a root `pnpm build`.
- Keep package verification notes honest: filtered build first, root build fallback second.
- Prefer documenting the exact verification path that actually got to green, not the one that should have worked in theory.
