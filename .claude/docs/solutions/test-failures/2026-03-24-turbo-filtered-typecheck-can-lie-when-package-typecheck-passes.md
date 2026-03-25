---
title: Turbo filtered typecheck can lie when package typecheck passes
category: test-failures
date: 2026-03-24
tags:
  - turbo
  - typecheck
  - workspace
  - verification
---

# Turbo filtered typecheck can lie when package typecheck passes

## Problem

A filtered `pnpm turbo typecheck --filter=...` run can fail on one package even when that same package passes its own direct `typecheck` command.

The bad version looks like real package debt because Turbo prints concrete TypeScript errors, but the signal can still be wrong.

## Root Cause

In this repo, Turbo typecheck can overlap package work in a way that exposes transient workspace state. That can produce false negatives during a broad filtered run, especially when nearby package builds and generated exports are moving at the same time.

The giveaway is simple:

- `pnpm --filter @platejs/<pkg> run typecheck` passes
- the same package fails only inside the wider Turbo run

That means the failure is not honest package debt yet. It is a verification race until proven otherwise.

## Solution

Start with the normal build-first flow:

```bash
pnpm install
pnpm turbo build --filter=./packages/<...>
pnpm turbo typecheck --filter=./packages/<...>
```

If the filtered Turbo typecheck fails on one package, verify the package directly:

```bash
pnpm --filter @platejs/<pkg> run typecheck
```

If the direct package run passes, retry the Turbo pass serialized:

```bash
pnpm turbo typecheck --concurrency=1 --filter=./packages/<...>
```

In this case:

- `@platejs/list-classic` passed on its own
- the parallel Turbo run still failed
- the serialized Turbo run cleared the fake package failure and exposed the next real spec typing issue instead

That is the right outcome. It turns a noisy failure into an honest one.

## Prevention

- Do not call a package broken just because Turbo says so once.
- Check the failing package directly before you start “fixing” a swamp that may not exist.
- When filtered Turbo typecheck smells racey, rerun it with `--concurrency=1`.
- Keep verification notes precise about whether the failure was real debt, root-build noise, or Turbo concurrency noise.
