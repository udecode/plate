---
date: 2026-04-18
topic: plate-bun-hard-cut
status: active
---

# Goal

Hard-cut `pnpm` as the repo package manager and move the root workflow to Bun.

# Constraints

- Delete the `pnpm` surface. No compatibility aliases.
- Keep the existing root `bunfig.toml`; do not fork test config per package.
- Use `../better-convex` only as a pattern source, not as truth.
- Start with root/tooling/docs ownership before chasing every doc/example string.
- Leave no zombie root scripts that shell back into `pnpm`.

# Findings

- Root already has `bunfig.toml` and `bun.lock`, so the repo is already split
  between Bun-owned test setup and pnpm-owned install/build/release glue.
- Root `package.json` still declares `packageManager: pnpm@9.15.0`, keeps a
  `pnpm` engine, and routes most important scripts through `pnpm`.
- `pnpm-workspace.yaml` still exists even though `package.json` also has a
  `workspaces` field.
- Tooling/docs/rules contain a large amount of `pnpm` guidance that will drift
  immediately if the root package manager flips without a docs sweep.
- `../better-convex` uses Bun directly in root scripts with `packageManager:
  bun@...`, keeps Turbo, and does not keep a parallel workspace-manager file.

# Plan

1. Flip root package-manager ownership:
   - `package.json`
   - `pnpm-workspace.yaml`
   - reinstall/build/typecheck/release wrappers
2. Replace direct `pnpm` script glue in repo-owned tooling with Bun-owned
   commands where the repo actually controls the call site.
3. Sweep root docs/instructions/config for package-manager truth:
   - AGENTS and local repo guidance
   - key docs and migration/troubleshooting surfaces
4. Run focused verification on surviving root workflow.
5. Grep again for `pnpm` and classify leftovers as:
   - legitimate historical/archive/reference text
   - external-command examples that should also change now
   - follow-up work

# Verification Target

- `bun install`
- focused root script checks after rewrite
- at least one surviving Bun-owned build/typecheck/test command path
