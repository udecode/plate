---
date: 2026-05-04
topic: openclaw-clawsweeper-skill-steal
status: done
source_repo: ../openclaw/.agents
---

# OpenClaw ClawSweeper Skill Steal

## Goal

Steal the useful issue-processing discipline from `../openclaw/.agents` and
adapt it for the Slate v2 issue-ledger workflow in this repo.

## Source Skills Reviewed

- `clawsweeper`: report/job/gate discipline, narrow cluster ownership, durable
  evidence output.
- `tag-duplicate-prs-issues`: duplicate proof bar, one-group rule, live GitHub
  verification before action.
- `openclaw-small-bugfix-sweep`: small high-certainty fix loop, skip gates, no
  speculative patching.
- `gitcrawl`: archive-first candidate discovery with live GitHub as final truth.
- `openclaw-pr-maintainer`: maintainer-safe triage hygiene and evidence bar.
- `openclaw-testing`: cheapest safe verification path.
- `openclaw-test-performance`: evidence-first benchmark/profiling discipline
  for performance rows.
- `security-triage`: not imported; security advisory flow is too
  OpenClaw-specific for the Slate issue-ledger lane.

## Decisions

- Keep the `clawsweeper` name because the user asked for that exact lane.
- Pull the transferable sections into one skill; do not create separate
  Plate-local skills for each OpenClaw helper.
- Adapt the body to Slate issue work, not OpenClaw bot operations.
- Use `docs/slate-issues/open-issues-ledger.md` as frozen corpus truth.
- Use `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md`
  and its issue matrix as architecture classification truth.
- Use `.tmp/slate-v2` only for current implementation proof.
- Exact `Fixes #...` remains forbidden unless the original issue repro is
  proved end to end.
- Add compiled issue dossier mode for one section per issue, without GitHub
  comments.

## Work Items

- [x] Inspect OpenClaw source skills from `../openclaw/.agents`.
- [x] Pick the transferable mechanics.
- [x] Add Plate source rule for `clawsweeper`.
- [x] Update `.agents/AGENTS.md` to mention the skill.
- [x] Run `pnpm install` to sync generated skills.
- [x] Inspect generated `SKILL.md`.
- [x] Re-pass direct `../openclaw/.agents` sources after path correction.

## Verification

- `pnpm install`: passed; Skiller applied rules for Claude Code and Codex.
- Generated skill: `.agents/skills/clawsweeper/SKILL.md`.
