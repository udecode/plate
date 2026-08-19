# cut regression ledger

Objective:
Hard-cut the manual Regression ledger; done when executable tests are the behavior authority, ledger tooling/data/doctrine are deleted, generated mirrors sync, and focused workflow plus agent-native review gates pass.

Goal plan:
docs/plans/2026-08-18-cut-regression-ledger.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: tests are enough for regression coverage; remove the ledger bureaucracy from Regression
- observed miss: a single fixed bug accumulated a 21-column TSV, validator, plan duplication, fingerprints, and ambiguous “covered by Regression” wording despite the executable test being the real guard
- owning skill/template/helper: `.agents/rules/regression.mdc` and its reference/template/tooling surface
- repair classification: hard cut

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary deletion and proof gates apply
- improvement loop: N/A: one-shot hard cut
- final score / loop closure: N/A

Completion threshold:
- Regression uses executable tests and current-source replay as the behavior authority; it creates no manual TSV ledger for single cases or corpora.
- Delete the 21-column ledger validator/tests, current ledger data, resource entries, template rows, and live doctrine/routing that require or teach a master ledger.
- Corpus work discovers executable cases from tests/source/issues and records only transient coordination in the goal plan; it does not recreate a second behavior database.
- Zero live non-historical authoring matches remain for `21-column`, `validate-ledger`, `master ledger`, `ledger row`, or the removed TSV path outside explicit hard-cut evidence in this plan.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-cut-regression-ledger.md` passes.

Verification surface:
- scoped `rg` audit over `.agents`, `.claude`, root/project AGENTS sources, templates, scripts, and current editor-behavior docs
- `pnpm install` generated mirror sync and `.agents`/`.claude` parity
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`
- focused source/resource tests that survive the deletion
- instantiate or inspect the Regression template and prove unfinished/completed plan behavior without a ledger
- agent-native review and P2 autoreview if executable workflow code changes remain

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user instruction to update Regression and hard-cut the ledger
- Allowed edit scope: Regression source rule/reference/resources/scripts, Regression plan template, routing/AGENTS source that teaches ledger ownership, generated mirrors via `pnpm install`, and the current TSV ledger
- Derived skill scope: Regression only; generic Autogoal remains the lifecycle owner
- Non-goals: product/runtime behavior, executable regression tests, GitHub issue state, historical completed plans as archival evidence, or inventing replacement manifest tooling

Output budget strategy:
- Count and list exact live references first with scoped `rg`; inspect only owning files. Exclude node_modules/build/generated app output and cap source reads/review output.

Blocked condition:
- Block only if resource generation requires an unavailable external owner or deleting the ledger would remove the only executable proof for a current behavior. Otherwise keep cutting.

Repair state:
- repair_type: hard cut derived-skill workflow debt
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete with degraded tool control; the unrelated blocked #5066 goal could not be replaced

Current verdict:
- verdict: PASS
- confidence: high; deterministic workflow, mirror, doctrine, template, source-audit, and P2 gates pass
- next owner: user review / normal git workflow
- reason: executable tests now own durable behavior and every manual duplicate registry surface is deleted

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-cut-regression-ledger.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Hard cut the manual ledger; tests are the behavior authority; remove related workflow debt and verify mirrors/reviews. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Expectation restated | yes | Remove ledger bureaucracy rather than rename, deprecate, or replace it. |
| Active goal checked | yes | Prior #5066 promotion goal is blocked but the goal tool refuses replacement as unfinished; latest user explicitly authorized this separate repair, so durable state continues in this plan with degraded goal control. |
| Named plan or skill read | yes | Read Regression, Skill Creator, Hard Cut, and Agent-Native Reviewer completely. |
| Owning source selected | yes | `.agents/rules/regression.mdc` plus directly owned reference/template/resources/tooling. |
| Repair classification selected | yes | Hard cut. |
| Safety conflict checked | yes | Executable tests and GitHub/pushed-ref evidence remain; no product proof is deleted. |
| Output budget strategy recorded | yes | Scoped reference counts and owner reads only. |
| Agent-native pack selected | yes | Materialized `agent-native` pack in this plan. |
| Agent-facing action surface identified | yes | `$regression` and `auto regression` routing. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` and `.claude` through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md` completely. |

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
- [x] Secondary owners are justified: reference, template, resources, validator, routing docs, generated mirrors, and current TSV are direct ledger surface.
- [x] Patch touches source-of-truth files only; generated mirrors changed only through `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded: Regression owns this debt; Autogoal remains unchanged.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: decision, deleted surface, surviving test authority, proof, route-host caveat, and git status boundary.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed action is discoverable from `$regression`, `auto regression`, AGENTS routing, and Patch delegation.
- [x] Agent-native pack: `pnpm install` regenerated `.agents` mirrors and `.claude` symlinks resolve to them.
- [x] Agent-native pack: agent-native review is PASS with no accepted findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Regression rule/reference/template, Patch handoff, Auto/AGENTS routing, resource sync, v99 doctrine, and autoformat test are test-first. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; generated Regression/Patch parity is enforced by the 4-case contract. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Instantiated `regression-test-first-smoke` from the repaired template. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Fresh smoke plan failed with unresolved objective/checklist/gates/phases. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | The same smoke plan passed after filling executable evidence only; no registry was created. |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | Source and generated contract suites pass 8/8; Plate Next doctrine suite passes 14/14. |
| P2 autoreview / review | yes | Run applicable autoreview gate with `--max-priority P2`; P3 is opt-in only, or record N/A for docs-only/source-rule-only repair | Final bounded P2 review clean at 0.97 confidence after one accepted minimum-gate fix. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Biome checked the three executable changed files with no remaining fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped/capped; one browser-host failure was noisy and subsequent proof used focused listing/source gates. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-cut-regression-ledger.md` | Passed: `[autogoal] complete: docs/plans/2026-08-18-cut-regression-ledger.md`. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Resource sync exact; methodology `cmp` parity 0; `.claude` links to `.agents` skills. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `$regression`, `auto regression`, AGENTS routing, template, and Patch executable packet all resolve. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: user action -> route -> source -> mirror -> proof -> handoff is complete. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | completed | Requirements, skills, source boundary, and hard-cut threshold recorded. | target selection |
| Target selection | completed | Live graph included rule, methodology, template, validator/tests, Patch/Auto/AGENTS coupling, generated resources, TSV, and autoformat test. | patch |
| Patch | completed | Deleted registry/validator/data and rewrote the surviving workflow around executable tests. | verification |
| Verification | completed | Contract 8/8, doctrine 14/14, v99 valid, sync exact, template red/green smoke, lint clean, P2 clean. | closeout |
| Closeout | completed | Agent-native PASS, limitations and deliberate non-repairs recorded. | final response |

Findings:
- #5066 proved the ledger duplicated executable tests, GitHub provenance/status, Autogoal state, source fingerprints, and public proof while confusing the user about what actually prevented recurrence.
- One live browser test read route and risk metadata from the TSV; it now owns its route and behavior directly.
- The removed graph was larger than the skill prose: validator plus tests, source/generated resources, Patch return vocabulary, AGENTS/Auto routing, template gates/tables, and the TSV.
- The autoformat browser route remains blocked by pre-existing generated registry imports and React server/client drift. Playwright still discovers the executable test; this hard cut does not claim the route behavior green.

Decisions and tradeoffs:
- Delete rather than make optional: optional manual ledgers become zombies and keep teaching agents to create them.
- Keep executable regression tests, exact replay/stability, current-ref authority, and methodology self-repair; those were never the problem.
- Use the goal plan only for transient multi-step coordination, not as another permanent behavior database.

Repair patch notes:
- Replaced `.agents/rules/regression.mdc` and its methodology with test-first authority and an explicit ban on duplicate case registries.
- Replaced the Regression plan template with executable-case coordination and proof gates.
- Deleted source/generated ledger validators and the local TSV data file.
- Rewired Patch delegation/return evidence, Auto routing, and AGENTS ownership wording.
- Removed the autoformat test's filesystem parser and hardcoded its owned route.
- Added a positive four-case workflow contract, mirrored it, and made source/generated execution part of Regression's minimum verification.
- Bumped Plate Next doctrine to v99 and validated the new fingerprint/history.

Deliberate non-repairs:
- Historical completed/blocked plans remain archival evidence; they are excluded from live skill/routing/template audits.
- Auto packet tracking, ClawSweeper issue ledgers, and harvester research ledgers are different workflow owners, not Regression's duplicate behavior registry.
- The blocked #5066 promotion goal and public issue state are unchanged.
- The unrelated generated registry route-host failure is recorded, not patched or hidden.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| New repair goal rejected because blocked #5066 goal is still considered unfinished | 1 | Keep the blocked goal honest; proceed under this user-authorized repair plan without faking completion | Degraded goal control recorded; do not call the old goal complete. |
| Generic Skill Creator validator rejected repo-specific Skiller frontmatter | 1 | Use the repository generator, exact source/generated parity test, and doctrine validation | `pnpm install`, 4-case mirror contract, and v99 validation pass. |
| Autoformat browser run could not mount because generated registry imports are stale | 1 | Do not edit generated output or misattribute the host failure; run Playwright discovery and record the existing blocker | Test lists cleanly; no behavior-green claim made. |
| First P2 pass reported the untracked TSV as surviving | 1 | Correct the bounded review baseline to expose the pre-cut local path deletion | Finding rejected against actual absence proof; no zombie absence assertion added. |
| Second P2 pass found the new contract suite outside the minimum skill gate | 1 | Add source and generated contract commands to Regression verification | Accepted and fixed; 8/8 gate passes; final P2 clean. |

Verification evidence:
- `node --test` source plus generated test-first contracts -> 8/8 pass.
- Plate Next doctrine tests -> 14/14 pass; `version.mjs validate --json` -> v99 valid, 44 packages, 2 retired.
- `pnpm install` -> Skiller applied source rules and resource sync completed.
- `sync-resources.mjs --check` -> exact; methodology source/generated `cmp` -> 0.
- Repaired Regression template -> fresh plan fails unfinished and passes when filled from executable evidence only.
- Scoped Biome -> three executable changed files clean.
- Playwright `--list` -> one autoformat executable test discovered; full run blocked by unrelated current generated route host.
- Removed data path -> absent; scoped non-historical live legacy audit -> 0 hits.
- P2 autoreview final -> clean, patch correct at 0.97 confidence.
- Agent-native capability map -> PASS: `auto regression`/`$regression` -> source rules -> generated skills/Claude links -> executable contract/template proof -> test-first handoff.
- Final Autogoal checker -> complete.

Final repair handoff:
- Expectation: tests are sufficient durable regression coverage; remove the duplicate manual registry
- Repaired owner: Regression source rule, methodology, template, and directly coupled routing/resource/Patch owners
- Files changed: source/generated Regression and Patch workflow, Auto/AGENTS routing, Plate Next resource/version doctrine, autoformat executable test; validator/data files deleted
- Verification: contract 8/8, doctrine 14/14 and v99 valid, template red/green smoke, mirror parity, lint, source audit, P2 clean, agent-native PASS
- Caveat: autoformat's live route remains blocked by unrelated generated registry drift; the executable test is discoverable but not claimed green in this repair

Timeline:
- 2026-08-18T08:40:16.673Z Goal repair plan created.
- 2026-08-18: user accepted the harsh-feedback verdict and requested a hard cut; loaded Skill Creator, Hard Cut, Regression, and Agent-Native Reviewer.
- 2026-08-18: goal replacement failed because the blocked #5066 promotion goal remains unfinished; continued under explicit user authority with this durable repair plan.
- 2026-08-18: deleted ledger validator/data/coupling, rewrote Regression/Patch/template/routing around executable tests, and regenerated mirrors.
- 2026-08-18: bumped Plate Next doctrine to v99, added positive workflow contracts, and proved source/generated parity.
- 2026-08-18: template smoke failed unfinished and passed completed without a registry; final P2 review clean after one accepted minimum-gate fix.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final mechanical plan check and user handoff |
| What is the goal? | Hard-cut the manual Regression ledger without weakening executable proof |
| What have I learned? | The ledger duplicated authoritative tests/status and created misleading coverage language |
| What have I done? | Hard-cut the registry/validator/data graph, rewrote the workflow test-first, synced mirrors, versioned doctrine, and passed focused/P2/agent-native gates |

Open risks:
- Historical plans may mention the deleted ledger as archival evidence; they should not be rewritten unless they are active/live routing inputs.
- The current #5066 promotion goal remains blocked independently; this workflow repair must not falsely complete that issue.
- The autoformat route host is currently broken by unrelated generated registry imports, so this repair proves test ownership/discovery rather than the product behavior itself.
