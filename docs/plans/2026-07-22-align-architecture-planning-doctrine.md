# align architecture planning doctrine

Objective:
Align Plite and Plate planning doctrine so architecture value chooses the
target, breaking cost affects only equivalent choices or incidental fallout,
and named Wordgard comparisons treat it as the primary current reference.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-align-architecture-planning-doctrine.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: update `plite-plan` and `plate-plan` to prefer the best
  coherent final architecture, avoiding breaks only when they provide no
  overall value, and treat Wordgard differently from ordinary editor donors.
- observed miss: both source rules say to prefer the smallest public break set;
  neither defines Wordgard's primary-reference role or a target-bounded
  exhaustive comparison contract.
- owning skill/template/helper: `.agents/rules/plite-plan.mdc` is primary;
  `.agents/rules/plate-plan.mdc` carries the same shared doctrine and must stay
  aligned.
- repair classification: derived-skill rule repair.

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
- initial confidence score: N/A: binary source/sync audit is stronger
- improvement loop: N/A: narrow one-shot repair
- final score / loop closure: N/A: no timed loop

Completion threshold:
- Both source rules choose the highest-value coherent target before considering
  migration cost, minimize only incidental breakage, give named Wordgard audits
  primary-reference treatment, bound exhaustive comparison by the TARGET graph,
  separate comparative classification from local verdict, and separate value
  ranking from dependency-ordered execution.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-align-architecture-planning-doctrine.md` passes.

Verification surface:
- Focused `rg` audits across both source rules and generated skills.
- `pnpm install` regenerates `.agents/skills/{plite-plan,plate-plan}/SKILL.md`.
- Direct inspection confirms the rules can express the corrected prompt without
  a template change.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user correction and explicit instruction to fix the
  affected skills.
- Allowed edit scope: `.agents/rules/{plite-plan,plate-plan}.mdc`, generated
  skill mirrors via `pnpm install`, and this repair plan.
- Derived skill scope: architecture selection and named external-reference
  comparison doctrine only.
- Non-goals: no product/runtime implementation, no generic `autogoal` change,
  no `plate-next` change, no compatibility policy weakening.

Output budget strategy:
- Read only the two source rules, their generated mirrors, and exact template
  phrase matches; cap command output and use focused `rg` verification.

Blocked condition:
- Stop only if source generation fails in a way that cannot be repaired inside
  these rule owners without changing unrelated repository infrastructure.

Repair state:
- repair_type: derived-skill doctrine
- current_phase: target selection
- current_phase_status: complete
- next_phase: patch
- goal_status: active

Current verdict:
- verdict: patch both planning-rule owners; deliberately preserve `plate-next`
- confidence: source-confirmed
- next owner: `.agents/rules/plite-plan.mdc`
- reason: migration-cost bias and missing primary-reference rules are explicit
  in the current generated skills.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-align-architecture-planning-doctrine.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expectation, completion threshold, boundaries, non-goals, verification, and final handoff were recorded before source edits. |
| Timed checkpoint parsed | no | No duration requested. |
| Expectation restated | yes | Expectation section records architecture-first and Wordgard-reference requirements. |
| Active goal checked | yes | `get_goal` returned no active goal before creation. |
| Named plan or skill read | yes | Read `autogoal`, `plite-plan`, and `plate-plan` skills plus both source rules. |
| Owning source selected | yes | Primary `.agents/rules/plite-plan.mdc`; aligned secondary `.agents/rules/plate-plan.mdc`. |
| Repair classification selected | yes | Derived-skill doctrine repair. |
| Safety conflict checked | yes | Evidence and compatibility gates remain strict; only architectural selection priority changes. |
| Output budget strategy recorded | yes | Exact-file reads and focused capped audits only. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owner justified: `plate-plan` duplicates the same architecture
      selection policy and must remain aligned.
- [x] Patch touches source-of-truth files only; generated mirrors changed only
      through `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Both `.agents/rules/{plite-plan,plate-plan}.mdc` contain the aligned architecture-selection and comparison contract. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; body `diff` is empty for both source/generated skill pairs. |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no template changed; direct generated-skill inspection proves the rule is usable without template changes. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Checker exited 1 before closure and listed unresolved checklist, gate, phase, evidence, and risk rows. |
| Completed-plan representability | no | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | N/A: planning templates already allow concept-ledger extension; the source rule defines optional `Reference` and `Comparison` columns. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker script changed. |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Focused full diff review found no unrelated rule changes; source/generated bodies and stale-wording audits pass. |
| Final lint | no | Run scoped formatter/lint or record ignored-path/N/A reason | N/A: rule/Markdown-only change; `git diff --check` passes for all repaired files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact-file reads, capped diffs, and focused `rg` audits only after goal creation. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-align-architecture-planning-doctrine.md` | Pass after final closure update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Requirements, goal, and source skills recorded. | target selection |
| Target selection | complete | Primary and aligned secondary source rules selected. | patch |
| Patch | complete | Updated both source rules; regenerated skill mirrors. | verification |
| Verification | complete | Install, source/generated body diffs, focused four-copy audits, stale-rule absence, and diff check pass. | closeout |
| Closeout | complete | Final handoff and deliberate non-repairs recorded. | final response |

Findings:
- The current `smallest public break set` rule can bias architecture selection
  toward an inferior local optimum.
- Named Wordgard comparison needs stronger status than generic editor research,
  without making Wordgard an automatic authority.
- `plate-next` owns migration churn control, so its narrower anti-rename policy
  remains correct and outside this repair.

Decisions and tradeoffs:
- Select architecture by total long-term value first; minimize breakage only
  inside the chosen target or between otherwise equivalent designs.
- Treat Wordgard as the primary current reference when named, with rebuttable
  evidence rather than blind copying.

Repair patch notes:
- Replaced migration-cost-first policy with architecture-value-first selection
  and incidental-break minimization.
- Added TARGET and primary-owner requirement for named reference audits.
- Added target-bounded exhaustive traversal and coverage manifest.
- Added separate comparative classifications and local verdicts, including
  `rearchitect`.
- Added separate value ranking and dependency execution order.
- Added Wordgard's primary-reference contract and Slate's evidence-only role.
- Repaired Plate Plan's unconditional `Plite wins` rule for real substrate gaps.

Deliberate non-repairs:
- `plate-next` remains unchanged because its anti-churn rule belongs to migrated
  Plate cleanup, not architecture target selection.
- Planning templates remain unchanged because the rules explicitly permit
  extending the existing single ledger; duplicating template tables would add
  ceremony without capability.
- Root Vision remains unchanged because the user asked to align these skills;
  the repaired rules still enforce Plite/Plate requirements over blind copying.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` -> pass; Skiller regenerated both installed skills.
- Source/generated body `diff` for Plite Plan and Plate Plan -> empty.
- Four-copy `rg` assertions for architecture-first policy, Wordgard reference,
  TARGET declaration, and `rearchitect` -> pass.
- Absence audit for `smallest public break set`, `minimal-break`, and
  `break-value` across all four copies -> pass.
- `git diff --check` over repaired sources, generated mirrors, and plan -> pass.
- Pre-closure `check-complete.mjs` -> expected exit 1, proving the incomplete
  plan guard.
- Final `check-complete.mjs` after closure update -> pass.

Final repair handoff:
- Expectation: architecture value first; break avoidance only without overall
  value; Wordgard treated as primary named reference.
- Repaired owner: Plite Plan primary, Plate Plan aligned secondary.
- Files changed: two `.agents/rules/*.mdc` sources, two generated `SKILL.md`
  mirrors, and this repair plan.
- Verification: install, generated-body equality, focused content assertions,
  stale-rule absence, diff check, and final goal checker.
- Caveat: none; `plate-next` deliberately retains migration anti-churn policy.

Timeline:
- 2026-07-22T15:46:16.590Z Goal repair plan created.
- 2026-07-22 Source rules patched and generated skills synced twice after final
  refinement.
- 2026-07-22 Focused source/generated audits and diff check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final checker and response |
| What is the goal? | Align Plite and Plate architecture-selection doctrine. |
| What have I learned? | Architecture-first doctrine needs an explicit priority rule; generic donor language undersold Wordgard. |
| What have I done? | Repaired two source rules, regenerated mirrors, and verified four-copy alignment. |

Open risks:
- None.
