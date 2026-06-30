# plate-next template-only drift gate

Objective:
Repair `plate-next` so broad Core drift scoring is enforced by the autogoal
template, not by a custom script.

Goal plan:
docs/plans/2026-06-27-plate-next-template-only-drift-gate.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: no script for drift scoring; use the Plate Next autogoal
  template/checklist only.
- observed miss: previous repair added
  `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs` and wired the
  skill/template to call it.
- owning skill/template/helper: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated
  `.agents/skills/plate-next/SKILL.md`, and deletion of the drift checker.
- repair classification: derived-skill workflow repair; remove over-engineered
  helper and keep the gate in the project template.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs` is deleted.
- No `plate-next` rule, generated skill, or template tells agents to run a
  drift checker script.
- Broad Core sweeps still require every Core file to be represented in the
  autogoal plan/template drift ledger with score, verdict, owner, evidence,
  and next action.
- Completion relies on the normal autogoal plan rows and `check-complete.mjs`,
  not on a custom drift script.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-template-only-drift-gate.md` passes.

Verification surface:
- Source audit: no `check-core-drift-ledger` or
  `.agents/rules/plate-next/scripts` references remain in `plate-next` source,
  generated skill, or template.
- Generated mirror sync: `bun x skiller@latest apply`.
- Template smoke: instantiate `--template plate-next` and verify unfinished
  plan fails `check-complete`.
- Final repair plan check: `check-complete.mjs` on this plan.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/plate-next.mdc`,
  `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs`,
  `docs/plans/templates/plate-next.md`, generated
  `.agents/skills/plate-next/SKILL.md`, and this plan.
- Derived skill scope: `plate-next` only.
- Non-goals: fixing `AffinityPlugin.ts`, running a real full Core sweep, or
  changing generic `autogoal`.

Output budget strategy:
- Use exact source audits and short template reads. Do not stream Core file
  manifests.

Blocked condition:
- Block only if generated skill sync cannot be run or the template cannot make
  the drift ledger required without a custom script.

Repair state:
- repair_type: derived-skill template repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-close

Current verdict:
- verdict: keep
- confidence: high after deletion, source/template/generated audit, template
  smoke, unfinished-plan guard, and final plan check.
- next owner: plate-next
- reason: drift gate now lives in the Plate Next autogoal template only.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-template-only-drift-gate.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User corrected: no drift script, just autogoal template. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Expectation restated | yes | Plate Next broad Core drift gate must be template-only. |
| Active goal checked | yes | New repair goal created for this correction. |
| Named plan or skill read | yes | `plate-next` and `autogoal` skills read. |
| Owning source selected | yes | `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, generated skill mirror. |
| Repair classification selected | yes | Derived-skill template repair. |
| Safety conflict checked | yes | Evidence safety preserved through required template rows and normal `check-complete`. |
| Output budget strategy recorded | yes | Exact source audits; no Core manifest streamed. |

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
- [x] Patch touches source-of-truth files only, with generated mirror synced by Skiller.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/plate-next.mdc` and `docs/plans/templates/plate-next.md` patched to template-only. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run sync and verify generated `SKILL.md` sync | `bun x skiller@latest apply` ran; source/generated audit passed. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | `create-goal-scratchpad --template plate-next --title "plate-next template-only smoke"` created a smoke plan. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Smoke plan failed `check-complete` as expected, then was removed. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Template contains manifest command/count rows, Core file drift rows, and score gate rows. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: correction deleted the helper script. |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: source-rule/template-only correction with direct audits. |
| Final lint | no | Run scoped formatter/lint or record ignored-path/N/A reason | Biome processed 0 files because `.mdc`/`.md` surfaces are ignored by repo config. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Only exact audits and short template reads. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-template-only-drift-gate.md` | Ready after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Repair plan created and checkpoint zero filled. | done |
| Target selection | complete | Owner is `plate-next` source rule and template; no helper script. | done |
| Patch | complete | Script deleted; source rule/template/mirror patched. | done |
| Verification | complete | Source audit, generated mirror audit, smoke plan failure, directory deletion proof. | done |
| Closeout | complete | Final handoff rows filled; plan ready for check-complete. | final response |

Findings:
- Previous repair was over-engineered: a drift checker script was unnecessary
  because the user wanted the autogoal template to carry the ledger and gate.
- Source/template/generated Plate Next surfaces now have no checker script
  command references.

Decisions and tradeoffs:
- Removed the custom drift checker entirely.
- Kept the full Core sweep requirement in the Plate Next autogoal template:
  manifest command, expected/actual/missing/extra counts, score gate, top drift
  rows, and per-file drift rows.

Repair patch notes:
- Deleted `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs` and
  removed the empty script directory.
- Updated `.agents/rules/plate-next.mdc` to say the template owns the drift
  ledger, manifest count, score gate, and top-drift handoff.
- Updated `docs/plans/templates/plate-next.md` to remove script commands and
  add template-only ledger/count/score rows.
- Regenerated `.agents/skills/plate-next/SKILL.md`.

Deliberate non-repairs:
- Historical completed plan files may still mention the removed script as
  history. They are not source policy. Active source surfaces are clean.
- Did not fix `AffinityPlugin.ts`; this is workflow repair only.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scoped Biome on `.mdc`/`.md` surfaces processed 0 files | 1 | Treat lint as N/A and use source audits/template smoke. | Recorded as ignored-path N/A. |

Verification evidence:
- `bun x skiller@latest apply` -> generated mirror sync passed.
- `rg -n "check-core-drift-ledger|drift checker script|scripts/check-core|\\.agents/rules/plate-next/scripts" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md` -> zero matches.
- `test ! -e .agents/rules/plate-next/scripts && echo scripts-dir-deleted` -> `scripts-dir-deleted`.
- `rg -n "Core file drift rows|Manifest command|Expected row count|Actual row count|Score gate|template-only|--template plate-next" ...` -> source/template/generated mirror contain the template-only rows.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template plate-next --title "plate-next template-only smoke"` -> instantiated repaired template.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-template-only-smoke.md` -> failed as expected for unfinished plan.
- Smoke plan removed.

Final repair handoff:
- Expectation: no custom drift script; enforce full Core drift scoring through
  the Plate Next autogoal template.
- Repaired owner: `.agents/rules/plate-next.mdc` and
  `docs/plans/templates/plate-next.md`.
- Files changed: source rule, generated skill mirror, Plate Next template,
  deleted checker script, this repair plan.
- Verification: source/generated/template audit, script path deletion proof,
  template smoke, unfinished-plan guard.
- Caveat: historical completed plans can still mention the removed script as
  past history; they are not active policy.

Timeline:
- 2026-06-27T11:54:17.236Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Repair complete; final plan check next. |
| Where am I going? | Run `check-complete`, then close the goal. |
| What is the goal? | Make Plate Next drift scoring template-only. |
| What have I learned? | Script enforcement was not wanted; template rows are enough. |
| What have I done? | Deleted script, updated rule/template, regenerated mirror, smoke-tested template. |

Open risks:
- None blocking.
