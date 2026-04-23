---
date: 2026-04-06
topic: slate-v2-single-roadmap-consolidation
status: in_progress
---

# Slate v2 Single Roadmap Consolidation

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Make the doc stack stop fighting itself:

- `cohesive-program-plan.md` owns numbered program phases
- `package-end-state-roadmap.md` owns package-level sequencing and next slices
- downstream docs and `slate-v2` repo docs should point at those owners instead of
  restating competing roadmap language
- patch the stale endgame phase model so the docs stop pretending all remaining
  work is one giant Phase 7 blob

## Plan

1. Audit plate-2 and `../slate-v2` for duplicated roadmap and status language.
2. Define the exact ownership split for phases, package sequencing, migration,
   and compatibility docs.
3. Edit docs to remove duplicated roadmap claims and point back to the owning
   doc.
4. Verify formatting and record remaining follow-up drift.

## Findings

- `cohesive-program-plan.md` clearly owns Phases 0-7.
- `package-end-state-roadmap.md` clearly owns package-level done/next/later,
  but it needed an explicit ownership section so people stop treating it like a
  vague appendix.
- `overview.md` and `final-synthesis.md` both restate concrete next execution
  order in enough detail to drift from the package roadmap.
- `phase7-migration-story.md` and `phase7-compatibility-envelope.md` are fine as
  supporting docs, but they should not read like primary roadmap owners.
- `../slate-v2/Readme.md` still contains sequence language like "the next
  v2-native inline-family slice after mentions", which will rot.
- public `../slate-v2` docs are allowed to describe the current proved surface,
  but they should not narrate future queue order.

## Changes Made

- added explicit roadmap ownership rules to
  `docs/slate-v2/package-end-state-roadmap.md`
- renamed its queue section from `Immediate Next Package Work` to
  `Current Package Queue`
- updated `docs/slate-v2/overview.md` to summarize state and defer queue
  ownership to `package-end-state-roadmap.md`
- replaced the stale `The Next Execution Order` section in
  `docs/slate-v2/final-synthesis.md` with an execution hand-off rule
- updated `docs/slate-v2/cohesive-program-plan.md` so it owns phases, not the
  concrete package queue
- removed ordered inline-family queue language from
  `docs/slate-v2/phase7-migration-story.md`
- removed stale "first/next slice" wording from `../slate-v2/Readme.md`
- marked `../slate-v2/docs/general/replacement-candidate.md` and
  `../slate-v2/site/examples/Readme.md` as current-surface docs, not roadmap
  owners
- patched the stale endgame phase ladder in
  `docs/slate-v2/cohesive-program-plan.md`:
  - Phase 7 = historical public-surface cashout
  - Phase 8 = active package API shaping
  - Phase 9 = replacement-envelope expansion
  - Phase 10 = release-readiness gate
- updated downstream docs so they stop talking like Phase 7 is still the live
  bucket:
  - `docs/slate-v2/engine.md`
  - `docs/slate-v2/overview.md`
  - `docs/slate-v2/final-synthesis.md`
  - `docs/slate-v2/phase6-hardening.md`
  - `docs/slate-v2/package-end-state-roadmap.md`

## Current Follow-On

- patch numbered phases so Phase 7 becomes historical cashout instead of the
  forever-current bucket
- update downstream docs that still mention "the next move is Phase 7"

## Remaining Follow-Up

- `phase7-compatibility-envelope.md` and `../slate-v2/docs/general/replacement-candidate.md`
  both list the current envelope. That duplication is acceptable because one is
  internal and one is public, but they still need sync discipline.
- anchor-surface bullets are repeated across `Readme.md`, package READMEs, and
  examples docs. That is probably fine reference duplication, not urgent DRY debt.
- the `phase7-*` filenames are now historical labels. That is acceptable for
  now, but if the doc stack gets noisier later, rename or add a tiny historical
  note at the top instead of pretending those files are the active phase queue.

## Progress

- Loaded planning/research skills.
- Audited top-level plate-2 docs and key `../slate-v2` public docs for roadmap
  ownership drift.
- Edited the doc stack so phases live in `cohesive-program-plan.md` and package
  queue ownership lives in `package-end-state-roadmap.md`.
- Re-cut the endgame so the active phase is Phase 8 instead of the old fake
  forever-Phase-7 story.
- Verified formatting with Prettier in both repos.
- Verified the stale "next/first slice" phrases are gone from the audited docs.
