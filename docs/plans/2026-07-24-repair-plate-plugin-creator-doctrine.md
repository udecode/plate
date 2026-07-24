# repair plate plugin creator doctrine

Objective:
Repair Plate plugin authoring doctrine so every preventive Plate Next rule is
enforced when plugins are created or refactored; done when source, references,
generated skill, and focused audits agree.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-repair-plate-plugin-creator-doctrine.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: fully repair `plate-plugin-creator` to contain the
  applicable `plate-next` rules.
- observed miss: the creator defaults private behavior to `internal/`, lacks
  owner-first production/React/test colocation, and omits current inference,
  options, scoped API, transaction, query, and normalization laws.
- owning skill/template/helper: `.agents/rules/plate-plugin-creator.mdc` plus
  the creator's mandatory `rules/*` and audit reference.
- repair classification: derived-skill doctrine repair.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary doctrine checklist
- improvement loop: patch, regenerate, audit, review
- final score / loop closure: N/A: exact verification gates replace scoring

Completion threshold:

- Every Plate Next rule that prevents bad plugin authoring is represented in
  `plate-plugin-creator`; migration supervision, scoring, package manifests,
  and compatibility-cleanup loop mechanics remain in `plate-next`.
- Contradictory `internal/` defaults and weak inference guidance are removed.
- Mandatory references and live examples agree with the main rule.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-repair-plate-plugin-creator-doctrine.md` passes.

Verification surface:

- source audit mapping Plate Next authoring laws to creator sections;
- `pnpm install` generated-skill sync;
- exact stale-wording and dead-reference searches;
- Markdown/style validation available in the repo;
- final diff review and goal-plan checker.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: latest user request plus current `plate-next` and
  `plate-plugin-creator` source/rules.
- Allowed edit scope: `.agents/rules/plate-plugin-creator.mdc`,
  `.agents/skills/plate-plugin-creator/rules/*`,
  `.agents/skills/plate-plugin-creator/references/*`, generated
  `.agents/skills/plate-plugin-creator/SKILL.md`, and this plan.
- Derived skill scope: preventative plugin creation/refactor mechanics.
- Non-goals: copying Plate Next review modes, drift scoring, package manifests,
  compatibility migration ledgers, browser lanes, or loop orchestration.

Output budget strategy:

- Read exact skill/source files only; use bounded `rg`, `sed`, and diff output;
  exclude generated/build trees and avoid repo-wide unbounded output.

Blocked condition:

- Stop only if `pnpm install` cannot regenerate the skill or current source
  reveals an irreconcilable owner conflict requiring user taste.

Repair state:

- repair_type: derived-skill doctrine repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: patch creator owner and mandatory references
- confidence: high
- next owner: plate-plugin-creator
- reason: the authoring skill must prevent the topology/API/type debt that the
  migration supervisor detects.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-repair-plate-plugin-creator-doctrine.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | expectation, threshold, boundaries, and non-goals above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section |
| Active goal checked | yes | `get_goal` returned no active goal |
| Named plan or skill read | yes | complete creator, Plate Next, autogoal, skill-creator, and mandatory reference reads |
| Owning source selected | yes | creator `.mdc` plus mandatory references |
| Repair classification selected | yes | derived-skill doctrine repair |
| Safety conflict checked | yes | no safety conflict; migration-only mechanics deliberately excluded |
| Output budget strategy recorded | yes | bounded exact-file reads above |

Work Checklist:

- [x] N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners justified: mandatory creator references carry detailed
      mechanics without bloating the generated main skill.
- [x] Patch touches source-of-truth and creator-owned mandatory reference files
      only; generated SKILL changes only through sync.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: repaired owner/files, doctrine
      transferred, exact proof, and deliberate migration-only exclusion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/plate-plugin-creator.mdc` plus all mandatory creator references repaired |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; generated body equals source exactly |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | rule inspected directly; `quick_validate.py` passes |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | pre-close checker exited 1 and listed open checklist/gates/phases |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | this materialized repair plan records requirement, exclusions, proof, and handoff |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no scripts or checker logic changed |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | fresh read-only agent applied the skill correctly to source, React, test, API, and inference decisions |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Prettier check and scoped `git diff --check` pass |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | all reads/searches exact-file, bounded, or count-first |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-repair-plate-plugin-creator-doctrine.md` | pass after final closeout update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | prompt and exact source/reference reads | target selection |
| Target selection | complete | creator source plus mandatory references | patch |
| Patch | complete | creator source and four mandatory reference files repaired; generated skill synced | verification |
| Verification | complete | 43/43 doctrine audit, validation, links, stale search, formatting, diff check, forward test | closeout |
| Closeout | complete | plan and final handoff populated | final response |

Findings:

- Main creator rule directly contradicts its own composition reference:
  `internal/` default versus inline single-use helpers.
- The creator is current on semantic base/React layering but lacks owner-first
  source, React family, test family, inference, options, tx, query, and
  normalization doctrine.
- `BasicBlocksPlugin.tsx` and `PlaywrightPlugin.ts` audit references are dead.

Decisions and tradeoffs:

- Copy all preventative authoring laws, not Plate Next's migration supervisor
  workflow. This keeps the creator focused and under the skill context budget.
- Keep detailed rules one reference level below the main skill; make those
  references mandatory at the relevant authoring decision.

Repair patch notes:

- Replaced the `internal/` default with owner-first production, React-family,
  and test-family colocation with no line ceiling.
- Added inference, options-only descriptor, extension, scoped API/tx, flat
  portal verb, active transaction, Plite primitive, normalization,
  subscription, package dependency, and generated-barrel laws.
- Rebuilt creation-flow, typing, and composition references around those laws.
- Replaced dead audit paths with live bounded examples and explicit rejected
  precedent.

Deliberate non-repairs:

- Plate Next review modes, scoring caps, package/Core manifest ledgers,
  correction sweep accounting, compatibility verdicts, and timed loops remain
  owned by `plate-next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Doctrine coverage assertion failed on wrapped `barrel export` wording | 2 | allow Markdown whitespace in the audit regex | 43/43 passed without changing doctrine |
| Initial Prettier check could not infer `.mdc` parser and found three unformatted Markdown files | 1 | run scoped Prettier with `--parser markdown`, regenerate, and recheck | all matched files pass |

Verification evidence:

- `pnpm install` -> pass; Skiller regenerated Codex and Claude skill output.
- generated-body comparison -> exact source/generated equality.
- Plate Next authoring doctrine audit -> `43/43`.
- local-link/stale audit -> five files valid; zero dead links; zero stale
  `internal/`, config-alias, BasicBlocks, Playwright, or caution wording.
- `quick_validate.py .agents/skills/plate-plugin-creator` -> `Skill is valid!`.
- Prettier check over source, generated skill, references, and plan -> pass.
- scoped `git diff --check` -> pass.
- fresh-agent forward test -> correct source/helper deletion, React flattening,
  test-family merge, `insertFoo()` API, and builder-owner inference repair.
- unfinished-plan checker -> expected failure before gates were resolved.
- final goal-plan checker -> complete.

Final repair handoff:

- Expectation: creator enforces every preventative Plate Next authoring law.
- Repaired owner: `.agents/rules/plate-plugin-creator.mdc` and mandatory creator
  references.
- Files changed: source rule, generated skill, creation flow, typing,
  composition, audit reference, and this plan.
- Verification: 43/43 doctrine audit plus sync, validation, links, stale
  search, formatting, diff check, and fresh-agent forward test.
- Caveat: Plate Next migration supervision/scoring remains deliberately outside
  the authoring skill.

Timeline:

- 2026-07-24T08:50:37.964Z Goal repair plan created.
- 2026-07-24 Source owner and mandatory references repaired.
- 2026-07-24 `pnpm install` regenerated the skill; body parity proved exact.
- 2026-07-24 Doctrine, links, stale wording, validation, formatting, diff, and
  forward-test gates passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final checker, goal completion, final response |
| What is the goal? | Make creator enforce all preventative Plate Next authoring law |
| What have I learned? | Creator can carry the full preventive doctrine in 299 main-skill lines plus mandatory focused references |
| What have I done? | Repaired, regenerated, audited, formatted, and independently forward-tested the skill |

Open risks:

- None. Migration-only review mechanics remain with `plate-next` by design.
