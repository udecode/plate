---
date: 2026-05-10
topic: resolve-slate-issue-skill
status: done
owner: task
---

# Resolve Slate Issue Skill

## Intent

Create a repo-local skill that resolves one Slate issue end to end:

- issue-first intake like `task`
- architecture/proof discipline from `slate-ralplan`
- no PR creation
- direct `gh issue comment` after verified outcome
- concise issue comment format without PR or issue metadata lines

## Scope

In scope:

- source rule under `.agents/rules/resolve-slate-issue.mdc`
- generated skill sync through `pnpm install`
- `.agents/AGENTS.md` skill list update
- verification that generated `.agents/skills/resolve-slate-issue/SKILL.md`
  exists and matches the rule source

Non-goals:

- no change to `task` or `slate-ralplan`
- no GitHub issue comment during skill creation
- no PR

## Requirements

- Start every run from `gh issue view ... --comments --json ...`.
- Treat issue body, comments, attached media, and commit/branch metadata as
  source of truth.
- If the issue names an origin commit, compare against current `Plate repo root`;
  the issue may already be fixed by later commits.
- If current Slate v2 already passes the repro, do not patch code. Record
  `already-accounted` with evidence and comment that current v2 matches the
  expected behavior.
- If current Slate v2 is red, add the smallest proof row first, fix the durable
  owner, then verify.
- Comment directly with `gh issue comment` only after a meaningful verified
  outcome.
- Comment format must omit PR lines and issue/Fixes metadata.

## Progress

- [x] Read source skill/rule patterns.
- [x] Add source rule and AGENTS skill list entry.
- [x] Run `pnpm install` to sync generated skill.
- [x] Verify generated skill exists and points to source rule.
- [x] Run completion check.

## Verification

- `pnpm install`: regenerated `.agents/skills/resolve-slate-issue/SKILL.md`
  through Skiller.
- `rg resolve-slate-issue ...`: confirmed generated skill, source rule, root
  `AGENTS.md`, and `.agents/AGENTS.md` references.
- `pnpm lint:fix`: checked 3398 files, no fixes applied.
- `bun run completion-check`: passed with no session state to block.
