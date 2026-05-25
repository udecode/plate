---
date: 2026-04-16
problem_type: developer_experience
component: tooling
root_cause: missing_tooling
title: Slate v2 tooling port should stage package build owners separately from repo-wide source lint
tags:
  - slate-v2
  - pnpm
  - turbo
  - biome
  - eslint
  - build-graph
  - lint-rollout
severity: high
---

# Slate v2 tooling port should stage package build owners separately from repo-wide source lint

## Problem

The fresh `slate-v2` clone needed the modern root toolchain from the draft
lane:

- `pnpm`
- Turbo-owned package builds
- declaration syncing
- Biome
- flat ESLint

The trap was treating that as one indivisible switch.

Doing that immediately turned tranche 1 into fake work:

- Turbo build cycles from test-only workspace edges
- declaration generation failing on missing package build owners
- repo-wide source lint exploding across unrecovered package and example code

## Solution

Split the rollout into two honest layers.

### 1. Land the root and package build owners first

- move the repo to `pnpm`
- add package-local `build` / `typecheck` owners
- add declaration sync as a real build step
- fix build-graph blockers that are purely packaging fallout
  - type-only exports
  - stale `@ts-expect-error` comments
  - workspace-root entry shims where declaration generation needs them

### 2. Stage repo-wide source lint behind package recovery

Do **not** make the new lint owner enforce the whole repo before package
recovery starts.

Instead:

- let tranche 1 lint only the root/tooling/docs surface
- keep the repo-wide ESLint source rollout as a later package-by-package lane
- record that deferral explicitly instead of pretending the lint migration is
  complete

## Why This Works

Build ownership and source-style enforcement look related, but they fail for
different reasons.

The build graph has to become real immediately or every later tranche rests on
lies.

Repo-wide source lint does not. Turning it on too early just floods the queue
with unrelated source cleanup and destroys tranche boundaries.

## Prevention

- when modernizing a repo toolchain mid-migration, separate:
  - build/type/package ownership
  - source lint enforcement
- if Turbo hits a package cycle, question whether the edge is really a build
  dependency or just a test-time dependency
- if declaration generation fails, fix the package-resolution seam first before
  blaming source behavior
- if a new linter reports hundreds of source errors outside the active tranche,
  stage the rollout and record the deferred lane explicitly
