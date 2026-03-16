---
name: internal-workspace-devdeps-hoist
description: >-
  Manages internal workspace devDependency hoisting in the Plate monorepo. Use
  when removing internal @platejs/* devDependencies from individual packages,
  hoisting shared workspace tooling deps to the root package.json, or debugging
  typecheck failures caused by missing internal dev deps. Not for managing
  external third-party dependencies or production dependencies.
---

## Overview

Internal `@platejs/*` devDependencies in individual `packages/*/package.json`
files should be removed and hoisted to root `package.json` with `workspace:^`.
This prevents typecheck resolution failures (e.g. `@platejs/combobox` breaking
via `@platejs/test-utils`) and keeps the dependency graph clean. Includes a
verification checklist: scan for remaining internal devDeps, then run `pnpm
install`, `bun typecheck`, and `bun lint:fix`.

@.claude/skills/internal-workspace-devdeps-hoist/internal-workspace-devdeps-hoist.mdc
