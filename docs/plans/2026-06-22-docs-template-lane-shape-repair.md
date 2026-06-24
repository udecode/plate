# docs template lane shape repair

Objective:
Repair docs template lane-shape gates; done when future docs plans require
lane-specific proof rows.

Goal plan:
docs/plans/2026-06-22-docs-template-lane-shape-repair.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: `docs-creator` backed docs goals must catch page-shape
  misses like `01-installing-slate.mdx`, not only broad parser/link/source
  checks.
- observed miss: `docs/plans/templates/docs.md` allowed generic "docs lane
  shape satisfied" evidence without forcing install/get-started rows such as
  short opening only before first heading, `## Installation`, `## Usage`,
  ownership table, titled app-file snippets, and exact next-page links.
- owning skill/template/helper: primary owner is
  `docs/plans/templates/docs.md`; secondary owner is
  `.agents/rules/docs-creator.mdc` because generated skill guidance must tell
  agents to materialize lane-specific rows.
- repair classification: derived docs-skill/template repair, not generic
  autogoal lifecycle repair.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: patch source owner, regenerate skill, smoke template,
  verify unfinished plan fails and completed expectation can be represented
- final score / loop closure: source and template enforce lane-specific proof

Completion threshold:

- Future docs plans cannot close docs-lane shape with a generic statement; they
  must resolve lane-specific proof rows, including strict install/get-started
  rows for installation pages.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-docs-template-lane-shape-repair.md` passes.

Verification surface:

- `rg` source audit for lane-specific proof wording.
- `pnpm install` to regenerate `.agents/skills/docs-creator/SKILL.md`.
- instantiate a smoke docs plan and verify it includes the new
  lane-specific table.
- verify an unfinished smoke plan fails `check-complete.mjs`.
- verify a completed smoke copy can record the install expectation without
  editing the template.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: latest `go repair` request after identifying the
  `01-installing-slate.mdx` docs-creator miss.
- Allowed edit scope: `docs/plans/templates/docs.md`,
  `.agents/rules/docs-creator.mdc`, regenerated
  `.agents/skills/docs-creator/SKILL.md`, and this repair plan/smoke artifacts.
- Derived skill scope: docs-creator/docs template only.
- Non-goals: do not rewrite Plite docs pages in this repair; do not patch
  generic autogoal lifecycle rules; do not add new scripts unless prose gates
  cannot express the expectation.

Output budget strategy:

- Read exact owner files and use focused `rg`; cap generated smoke output to
  file paths/counts instead of streaming broad docs content.

Blocked condition:

- Block only if the docs template cannot express lane-specific rows without
  weakening existing autogoal checks.

Repair state:

- repair_type: template plus derived skill rule
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:

- verdict: repair required
- confidence: high
- next owner: docs template and docs-creator source rule
- reason: broad docs closure proved parser/link/source checks but missed
  install/get-started page-shape specifics.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-docs-template-lane-shape-repair.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to repair the docs-template/docs-creator gap after the install page was not fully aligned. Scope is future workflow repair, not rewriting that page now. |
| Timed checkpoint parsed | no | No duration requested. |
| Expectation restated | yes | Future docs goals must require lane-specific proof rows, not generic "lane shape satisfied" assertions. |
| Active goal checked | yes | `get_goal` returned null before creating this repair goal. |
| Named plan or skill read | yes | Read `autogoal`, `docs-creator`, and `docs/plans/templates/docs.md`. |
| Owning source selected | yes | Primary owner: `docs/plans/templates/docs.md`; secondary owner: `.agents/rules/docs-creator.mdc` with generated skill sync. |
| Repair classification selected | yes | Derived docs-skill/template repair. |
| Safety conflict checked | yes | Repair strengthens evidence gates; it does not weaken completion checks. |
| Output budget strategy recorded | yes | Use focused reads/searches and smoke artifacts only. |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A.
- [x] Patch touches source-of-truth files only.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Patched `docs/plans/templates/docs.md` with `Lane-Specific Shape Proof`; patched `.agents/rules/docs-creator.mdc` to require resolving the selected lane row. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed after `.agents/rules/docs-creator.mdc` edit; `rg` verified matching rule text in `.agents/skills/docs-creator/SKILL.md`. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Created `docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md`; `rg` verified `Lane-Specific Shape Proof`, `Install / get-started`, and the anti-generic assertion gate materialized. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md` failed as expected with unresolved objective, gates, unchecked items, and open phase rows. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Smoke plan contains editable `Applies` and `Evidence` cells for the selected install/get-started lane plus non-selected lane rows, so a future completed plan can record exact proof without template edits. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker script changed. |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: source-rule/template repair only; proof is source audit, generated sync, smoke plan, and incomplete-plan guard. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `pnpm exec prettier --write docs/plans/templates/docs.md docs/plans/2026-06-22-docs-template-lane-shape-repair.md` passed; `.agents/rules/docs-creator.mdc` formatted with `--parser markdown`. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches were scoped to skill, rule, template, and smoke plan. No broad repo output streamed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-docs-template-lane-shape-repair.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | created repair plan and active goal | target selection |
| Target selection | complete | selected docs template plus docs-creator source rule | patch |
| Patch | complete | patched docs template and docs-creator source rule | verification |
| Verification | complete | `pnpm install`, source audit, smoke plan, and incomplete-plan guard passed | closeout |
| Closeout | complete | final goal-plan check passed | final response |

Findings:

- `docs/plans/templates/docs.md` had generic docs-lane gates but no
  materialized per-lane proof surface.
- `docs-creator` already described lane shapes, but did not tell agents to copy
  the selected lane contract into the goal plan.
- The `01-installing-slate.mdx` miss was exactly the gap this repair should
  prevent: broad parser/link/source proof without install-page shape proof.

Decisions and tradeoffs:

- Primary repair owner is `docs/plans/templates/docs.md` because future plans
  need concrete rows the checker can see.
- Secondary repair owner is `.agents/rules/docs-creator.mdc` because agents
  must know generic "lane shape satisfied" assertions are invalid.
- Did not patch generic `autogoal`; the miss is docs-lane policy, not lifecycle
  semantics.

Repair patch notes:

- Added `Lane-Specific Shape Proof` to `docs/plans/templates/docs.md`.
- Changed the `Docs lane shape satisfied` completion gate to point at the
  selected lane row instead of a generic assertion.
- Added explicit install/get-started proof requirements to
  `.agents/rules/docs-creator.mdc`.
- Regenerated `.agents/skills/docs-creator/SKILL.md` with `pnpm install`.

Deliberate non-repairs:

- Did not rewrite `content/docs/plite/walkthroughs/01-installing-slate.mdx` in
  this repair; the requested owner was the future workflow/template gap.
- Did not add scripts. The check-complete unresolved-cell mechanics plus the new
  table are enough for this expectation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm exec prettier --write ... .agents/rules/docs-creator.mdc` could not infer a parser for `.mdc` | 1 | Run Prettier with `--parser markdown` for `.mdc` | Passed, then `pnpm install` regenerated the skill mirror |

Verification evidence:

- `pnpm install` passed and regenerated `.agents/skills/docs-creator/SKILL.md`.
- `rg -n "Lane-Specific Shape Proof|install/get-started pages|broad \"docs lane shape satisfied\"|Do not mark the lane row complete by vibe" .agents/skills/docs-creator/SKILL.md .agents/rules/docs-creator.mdc docs/plans/templates/docs.md docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md` found the repaired wording in source, generated skill, template, and smoke plan.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template docs --title "smoke docs lane shape proof" --path docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md --force` created a smoke docs plan with the lane-specific table.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md` failed as expected on the unfinished smoke plan.
- `pnpm exec prettier --write docs/plans/templates/docs.md docs/plans/2026-06-22-docs-template-lane-shape-repair.md` passed.
- `pnpm exec prettier --write --parser markdown .agents/rules/docs-creator.mdc` passed.

Final repair handoff:

- Expectation: docs goals must require concrete lane-specific proof, especially
  install/get-started shape proof.
- Repaired owner: `docs/plans/templates/docs.md` plus
  `.agents/rules/docs-creator.mdc`.
- Files changed: docs template, docs-creator source rule, generated
  docs-creator skill, repair plan, smoke plan artifact.
- Verification: source audit, generated sync, smoke plan, incomplete-plan guard,
  scoped formatting.
- Caveat: existing docs pages are not rewritten by this repair.

Timeline:

- 2026-06-22T04:03:54.248Z Goal repair plan created.
- 2026-06-22T04:04Z Active repair goal created.
- 2026-06-22T04:07Z Patched docs template with lane-specific shape proof.
- 2026-06-22T04:08Z Patched docs-creator source rule.
- 2026-06-22T04:09Z Ran `pnpm install` and regenerated skill mirror.
- 2026-06-22T04:10Z Created smoke docs plan and verified unfinished plan fails.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final check and handoff |
| What is the goal? | Repair docs template lane-shape gates |
| What have I learned? | The template needed concrete selected-lane rows; docs-creator prose alone was not enough |
| What have I done? | Patched template/rule, regenerated skill, created smoke plan, verified unfinished smoke fails |

Open risks:

- None for the repair. Existing docs pages still need reruns if we want to
  enforce the newly stricter template retroactively.
