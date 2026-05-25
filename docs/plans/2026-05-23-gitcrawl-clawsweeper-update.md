---
date: 2026-05-23
topic: gitcrawl-clawsweeper-update
status: active
---

# Gitcrawl ClawSweeper Update

Goal: update local `gitcrawl` to the current stable release and sync the useful API/workflow changes into `.agents/rules/clawsweeper.mdc`.

## Plan

- [x] Update installed `gitcrawl` and capture the live CLI surface.
- [x] Refresh `../gitcrawl` and inspect docs/changelog for new command shapes.
- [x] Patch `.agents/rules/clawsweeper.mdc` only for portable workflow changes.
- [x] Run `pnpm install` to regenerate `.agents/skills/clawsweeper/SKILL.md`.
- [x] Verify source/generated sync and completion check.

## Findings

- `gitcrawl` upgraded from `0.2.1` to `0.4.3`.
- The local PATH resolves `gitcrawl` through `/Users/zbeyens/.local/bin/gitcrawl`, symlinked to `/opt/homebrew/bin/gitcrawl`.
- `0.4.3` makes `check-update`, `metadata --json`, `status --json`, `runs`, durable cluster inspection, richer thread refs, and PR-status shim reads stable enough for ClawSweeper.
- `0.4.4` exists only as unreleased changelog text in `../gitcrawl`; do not treat it as workflow contract.

## Progress

- 2026-05-23: Started ClawSweeper `<update>` mode for gitcrawl/tooling refresh.
- 2026-05-23: Upgraded Homebrew `openclaw/tap/gitcrawl` to `0.4.3`, pulled `../gitcrawl`, and patched `.agents/rules/clawsweeper.mdc`.
- 2026-05-23: Ran `pnpm install`, targeted rule/generated-skill greps, `gitcrawl` smoke commands, and `node tooling/scripts/completion-check.mjs`.
