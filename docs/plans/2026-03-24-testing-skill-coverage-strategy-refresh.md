---
title: Testing Skill Coverage Strategy Refresh
type: docs
date: 2026-03-24
status: completed
---

# Testing Skill Coverage Strategy Refresh

## Goal

Update `.agents/rules/testing.mdc` so it pushes future coverage work toward value-first, file-first, multi-pass regression confidence instead of package sweeps or vanity coverage.

## Inputs

- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- `docs/plans/2026-03-09-test-suite-excellence-plan.md`

## Status

- [x] Read source docs
- [x] Rewrite testing guidance
- [x] Sync generated skill files

## Verification

- `pnpm prepare`
- verified generated pointers in `.agents/rules/testing/SKILL.md`
- verified generated pointers in `.agents/rules/testing-review/SKILL.md`
