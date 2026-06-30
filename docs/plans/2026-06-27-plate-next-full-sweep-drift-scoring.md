# plate-next full sweep drift scoring

Objective:
Repair `plate-next` so full Core sweeps cannot sample files; done when every
Core source file must have a drift score and score gate before closure.

Goal plan:
docs/plans/2026-06-27-plate-next-full-sweep-drift-scoring.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: `plate-next` sweep means review all Core files, not a
  narrow packet; the autogoal plan must include one check for every single Core
  file with a drift score and a score gate.
- observed miss: the parser command sweep closed after a targeted packet and
  missed drift in `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts`.
- owning skill/template/helper: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, and a ledger checker under the
  `plate-next` source rule.
- repair classification: derived-skill workflow repair plus project template
  and mechanical checker.

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
- initial confidence score: N/A: mechanical source/template checks are the metric
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `plate-next` says `sweep`, `all core`, `full-loop`, or an equivalent broad
  Core request requires a full Core drift ledger, not a sampled source map.
- The ledger covers every file under `packages/core/src/**/*.{ts,tsx,mts,cts}`
  and, when type surfaces are in scope, `packages/core/type-tests/**/*`.
- Every covered file must have a numeric drift score, verdict, evidence, owner,
  and next action when the score is meaningful.
- A score gate blocks closure when files are missing, scores are invalid, or
  high-drift files are left unowned.
- Future `plate-next` goal plans use a dedicated `plate-next` template instead
  of the generic `auto` template for Plate Next work.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-full-sweep-drift-scoring.md` passes.

Verification surface:
- Source audit for `full Core drift ledger`, `drift_score`, and
  `check-core-drift-ledger`.
- `pnpm install` to regenerate `.agents/skills/plate-next/SKILL.md`.
- `node --check .agents/rules/plate-next/scripts/check-core-drift-ledger.mjs`.
- Checker smoke: an initialized blank ledger fails, and a tiny completed ledger
  proves the script can validate score rows.
- `node .agents/skills/autogoal/scripts/check-complete.mjs` on this repair plan.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/plate-next.mdc`,
  `.agents/rules/plate-next/scripts/**`, `docs/plans/templates/plate-next.md`,
  generated `.agents/skills/plate-next/SKILL.md` via `pnpm install`, and this
  repair plan.
- Derived skill scope: `plate-next` only.
- Non-goals: fixing `AffinityPlugin.ts` runtime drift in this repair packet,
  changing generic `autogoal`, changing `auto`, or sweeping all Core files now.

Output budget strategy:
- Use targeted reads and exact source audits. For file lists, use counts or
  checker output instead of streaming the full Core manifest.

Blocked condition:
- Block only if `pnpm install` cannot regenerate generated skills or the
  checker cannot be made deterministic from the current Core file tree.

Repair state:
- repair_type: derived-skill workflow repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-close

Current verdict:
- verdict: keep
- confidence: high after source audit, generated mirror audit, template smoke,
  checker failure/pass smoke, script syntax check, scoped Biome check, and
  agent-native route review.
- next owner: plate-next
- reason: broad Core sweeps now have a dedicated template and mechanical
  full-file drift score gate.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-full-sweep-drift-scoring.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expectation, observed miss, scope, non-goals, proof, and success criteria recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Expectation restated | yes | `plate-next` broad Core sweeps require every Core file to have a drift score and score gate. |
| Active goal checked | yes | New active repair goal created for this plan. |
| Named plan or skill read | yes | `plate-next`, `autogoal`, and `agent-native-reviewer` skills read. |
| Owning source selected | yes | `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, and checker script. |
| Repair classification selected | yes | Derived-skill workflow repair plus project template and mechanical checker. |
| Safety conflict checked | yes | No evidence gate weakened; repair makes broad sweep closure stricter. |
| Output budget strategy recorded | yes | Targeted reads/audits; manifest handled through checker output, not chat stream. |

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
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/plate-next.mdc` patched with Full Core Sweep Law. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` ran; mirror stayed stale, so `bun x skiller@latest apply` ran; source/generated audit passed. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | `create-goal-scratchpad --template plate-next` created a smoke plan. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Smoke plan `check-complete` failed with unresolved rows as expected. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Checker pass smoke validated a complete 376-row drift ledger. |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | `node --check`; blank ledger failed; filled 376-row smoke ledger passed. |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Agent-native review route/source/proof map passed. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Scoped `pnpm exec biome check ...` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Core manifest handled through checker summaries; no full manifest streamed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-full-sweep-drift-scoring.md` | Ready after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Repair plan created and checkpoint zero filled. | done |
| Target selection | complete | Owner is `plate-next` source rule/template/checker, not generic `autogoal`. | done |
| Patch | complete | Source rule, template, checker script, generated mirror, and plan patched. | done |
| Verification | complete | Source audit, mirror audit, syntax, checker smoke, template smoke, scoped Biome, agent-native review. | done |
| Closeout | complete | Final handoff rows filled; plan ready for check-complete. | final response |

Findings:
- The prior `plate-next` loop allowed a "small source map" even when the user
  meant a broad sweep. That is why a targeted parser packet missed
  `AffinityPlugin.ts`.
- `pnpm install` did not update the generated `plate-next` skill mirror in this
  run; `bun x skiller@latest apply` did. Source/generated audit is therefore
  mandatory after sync.
- The Core source manifest currently has 376 files under `packages/core/src`
  for the checker's default scope.

Decisions and tradeoffs:
- Added a dedicated `plate-next` plan template instead of bloating the generic
  `auto` template.
- Added a mechanical ledger checker instead of relying on prose.
- Kept the checker under `.agents/rules/plate-next/scripts` because the
  requirement is repo-local Plate Next workflow, not generic `autogoal`.

Repair patch notes:
- `.agents/rules/plate-next.mdc`: added Full Core Sweep Law and switched plan
  creation to `--template plate-next`.
- `docs/plans/templates/plate-next.md`: added broad Core drift ledger rows,
  score gate, completion gates, and handoff fields.
- `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs`: added ledger
  init/checker with manifest coverage and score validation.
- `.agents/skills/plate-next/SKILL.md`: regenerated from source.

Deliberate non-repairs:
- Did not fix `AffinityPlugin.ts` in this repair packet; the goal is to repair
  the sweep workflow so the next `plate-next` sweep must score it.
- Did not patch generic `autogoal` or `auto`; this miss is specific to
  `plate-next` broad Core sweeps.
- Did not repair the global "pnpm install should sync generated skills" rule;
  this run used direct Skiller sync and recorded the workflow finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` did not update generated `plate-next/SKILL.md` | 1 | Run direct Skiller sync. | `bun x skiller@latest apply` updated generated mirror; audit passed. |
| First scoped Biome check failed on checker formatting/perf lint | 1 | Patch script and rerun. | Scoped Biome check passed. |

Verification evidence:
- `node --check .agents/rules/plate-next/scripts/check-core-drift-ledger.mjs` -> passed.
- `rg -n "Full Core Sweep Law|drift_score|check-core-drift-ledger|--template plate-next" ...` -> source/template/generated mirror all contain the repair.
- `pnpm install` -> ran; did not sync generated mirror.
- `bun x skiller@latest apply` -> generated mirror sync passed.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template plate-next --title "plate-next template smoke"` -> instantiated repaired template.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-template-smoke.md` -> failed as expected for unfinished plan.
- `node .agents/rules/plate-next/scripts/check-core-drift-ledger.mjs --init docs/plans/plate-next-ledger-smoke.md` -> wrote 376 rows.
- Blank smoke ledger check -> failed as expected on missing scores/verdicts/evidence.
- Filled 376-row smoke ledger check -> passed with `max=0`.
- Smoke artifacts removed; audit found no smoke leftovers.
- `pnpm exec biome check .agents/rules/plate-next/scripts/check-core-drift-ledger.mjs docs/plans/templates/plate-next.md .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/2026-06-27-plate-next-full-sweep-drift-scoring.md` -> passed.
- Agent-native review map -> pass: user action `plate-next sweep`, route `plate-next`, source owner `.agents/rules/plate-next.mdc` and `docs/plans/templates/plate-next.md`, generated mirror `.agents/skills/plate-next/SKILL.md`, proof checker script.

Final repair handoff:
- Expectation: `plate-next` full Core sweep must review every Core file with a
  drift score and score gate.
- Repaired owner: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`,
  `.agents/rules/plate-next/scripts/check-core-drift-ledger.mjs`.
- Files changed: source rule, generated skill mirror, new Plate Next template,
  new checker script, this repair plan.
- Verification: source/generated audit, template smoke, incomplete-plan guard,
  checker fail/pass smoke, syntax check, scoped Biome check, agent-native review.
- Caveat: `AffinityPlugin.ts` is intentionally not fixed here; next broad sweep
  must score it instead of missing it.

Timeline:
- 2026-06-27T11:39:11.732Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Repair complete; final plan check next. |
| Where am I going? | Run `check-complete`, then close the goal. |
| What is the goal? | Repair `plate-next` full Core sweep drift scoring. |
| What have I learned? | The old rule allowed sampling; generated sync needed direct Skiller. |
| What have I done? | Patched source rule/template/checker, synced mirror, and verified fail/pass gates. |

Open risks:
- None blocking. Remaining product work: run a real `plate-next` broad Core
  sweep and fix `AffinityPlugin.ts` or score/defer it there.
