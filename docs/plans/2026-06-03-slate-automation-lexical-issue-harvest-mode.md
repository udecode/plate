# slate automation lexical issue harvest mode

Objective:
Repair Slate automation skills so `slate-automation` can supervise external
editor issue harvests, including Lexical open and closed issues, without user
micro-routing.

Goal plan:
docs/plans/2026-06-03-slate-automation-lexical-issue-harvest-mode.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: `slate-automation` should supervise Lexical issue-corpus
  robustness mining, not only ordinary test harvests, and it must include closed
  issues as well as open ones.
- observed miss: `editor-test-harvester` could mine repo tests and apply
  ClawSweeper provenance only when a test pointed to an issue, but it had no
  first-class `--issues --state all` mode. `slate-automation` had no routing
  ladder for external issue corpora. `clawsweeper` was Slate-ledger-shaped and
  not discoverable as an external provenance layer.
- owning skill/template/helper: `.agents/rules/slate-automation.mdc`,
  `.agents/rules/editor-test-harvester.mdc`, `.agents/rules/clawsweeper.mdc`.
- repair classification: derived skill topology/routing repair.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Future invocations such as `slate-automation facebook/lexical --issues
  --state all batch-loop` are discoverable and route through
  `editor-test-harvester --issues` with ClawSweeper provenance.
- Issue-mode defaults to all-state issue discovery unless the user narrows it,
  clusters before deep reads, writes scratch artifacts under
  `.tmp/editor-issue-harvester/<repo>/`, skips unrelated framework/product
  issues, and blocks implementation until a portable invariant, coverage map,
  owner, proof kind, and verification command exist.
- Repair closure is legal only when source rules are patched, generated skills
  are synced, source/generated audits prove the repair text exists, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-lexical-issue-harvest-mode.md` passes.

Verification surface:
- `pnpm install` regenerates `.agents/skills/**/SKILL.md` from source rules.
- `rg` audits source and generated skills for `--issues`, `state all`,
  `editor-issue-harvester`, external issue-harvest routing, and ClawSweeper
  external provenance text.
- Manual agent-native review checks discoverability, action ownership, artifact
  paths, and no GitHub/Slate-ledger mutation.
- `check-complete.mjs` validates this repair plan.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: user request to use `slate-automation` as supervisor for
  Lexical all-issue robustness harvesting, plus source rules under
  `.agents/rules/**`.
- Allowed edit scope: `slate-automation`, `editor-test-harvester`, and
  `clawsweeper` source rules plus generated mirrors from `pnpm install`.
- Derived skill scope: routing/provenance/reporting workflow only.
- Non-goals: run the actual Lexical harvest, mutate GitHub, update Slate issue
  ledgers, patch `.tmp/slate-v2`, commit, push, or create PR.

Output budget strategy:
- Use focused `sed`, `rg`, and `git diff -- <paths>` only. Do not stream
  external issue output; this repair only changes routing instructions.

Blocked condition:
- Block only if source/generated skill sync fails or the skill ownership cannot
  be made unambiguous without a user decision.

Repair state:
- repair_type: derived skill routing/topology repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete-ready

Current verdict:
- verdict: repaired
- confidence: high
- next owner: `slate-automation facebook/lexical --issues --state all` when the
  user wants the actual harvest run.
- reason: source rules and generated skill mirrors now expose the supervised
  all-state external issue-harvest flow.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-lexical-issue-harvest-mode.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope captured: `slate-automation` supervisor, Lexical external issues, open and closed states, patch skills as needed, no actual harvest run requested. |
| Expectation restated | yes | Expectation section names the missing `--issues --state all` supervised workflow. |
| Active goal checked | yes | `get_goal` returned null; `create_goal` started this repair objective. |
| Named plan or skill read | yes | Read generated plan, `autogoal`, `slate-automation`, `editor-test-harvester`, `clawsweeper`, and `agent-native-reviewer`. |
| Owning source selected | yes | Source owners: `.agents/rules/slate-automation.mdc`, `.agents/rules/editor-test-harvester.mdc`, `.agents/rules/clawsweeper.mdc`. |
| Repair classification selected | yes | Derived skill routing/topology repair. |
| Safety conflict checked | yes | Repair keeps issue bodies scratch-only, forbids GitHub mutation, forbids Slate-ledger claims, and blocks implementation without local invariant proof. |
| Output budget strategy recorded | yes | Focused `rg`, `sed`, and path-scoped diff only; no external issue corpus streamed. |
| Agent-native pack selected | yes | Agent-native pack applies because skills and user-action tooling changed. |
| Agent-facing action surface identified | yes | Future agent reads `slate-automation` for supervision, `editor-test-harvester` for `--issues`, and `clawsweeper` for provenance. |
| Source rule versus generated mirror boundary identified | yes | Patched `.agents/rules/**`; ran `pnpm install` to sync `.agents/skills/**/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `agent-native-reviewer`; manual review found the new action discoverable, artifacted, and bounded. |

Work Checklist:
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Patched all three source rules. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` ran twice and Skiller completed successfully. |
| Template smoke | N/A | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | No template/helper changed; source/generated skill inspection is the smoke. |
| Incomplete-plan guard | N/A | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | No checker/template behavior changed. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | This completed repair plan records the expectation, owners, sync proof, and non-repairs. |
| Helper/checker tests | N/A | If scripts changed, run focused script tests; otherwise N/A | No scripts changed. |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Formal autoreview remains user-disabled; manual agent-native review completed. |
| Final lint | N/A | Run scoped formatter/lint or record ignored-path/N/A reason | Markdown source-rule-only repair; `pnpm install` regenerated mirrors without lint errors. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Only focused source/diff/sync output was streamed; no external issue corpus read. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-lexical-issue-harvest-mode.md` | To run after this closeout patch. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Source/generated `rg` audit found matching issue-harvest text in rules and generated skills. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `slate-automation` examples and ladder expose the call; `editor-test-harvester` argument hint exposes `--issues --state`; `clawsweeper` argument hint exposes external issue provenance. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Review result: pass; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Created repair plan and captured prompt requirements | target selection |
| Target selection | complete | Selected `slate-automation`, `editor-test-harvester`, and `clawsweeper` source rules | patch |
| Patch | complete | Patched source rules and synced generated skills | verification |
| Verification | complete | Ran source/generated `rg` audits and manual agent-native review | closeout |
| Closeout | complete | Plan updated; `check-complete` follows | final response |

Findings:
- `slate-automation` lacked a supervised external issue-corpus lane.
- `editor-test-harvester` lacked a first-class all-state issue mode and scratch
  artifact contract.
- `clawsweeper` was useful discipline, but its discoverability and wording were
  Slate-ledger-only.

Decisions and tradeoffs:
- Keep `slate-automation` as supervisor, not a new top-level skill.
- Add `--issues --state all` to `editor-test-harvester` because the output is a
  behavior/test matrix, not an issue-claim ledger.
- Extend `clawsweeper` as a provenance layer only. It must not mutate GitHub,
  Slate ledgers, or PR claims for external repos.
- Store external issue bodies/comments in scratch under
  `.tmp/editor-issue-harvester/**`; only fresh local invariants can be promoted
  into versioned Slate/Plate output.

Repair patch notes:
- `.agents/rules/slate-automation.mdc`: added issue-harvest invocation examples,
  checkpoint owner, backlog ladder, repair duty, scratch consolidation target,
  and final handoff fields.
- `.agents/rules/editor-test-harvester.mdc`: added `--issues [--state
  all|open|closed]`, all-state default, issue inventory/cluster pass,
  `.tmp/editor-issue-harvester/<repo>/` artifacts, score caps, verification,
  and no-patch-without-invariant rule.
- `.agents/rules/clawsweeper.mdc`: added external issue provenance mode,
  all-state gitcrawl shapes, external routing buckets, and no Slate claim/ledger
  mutation rules.
- Generated mirrors synced by `pnpm install`:
  `.agents/skills/slate-automation/SKILL.md`,
  `.agents/skills/editor-test-harvester/SKILL.md`,
  `.agents/skills/clawsweeper/SKILL.md`.

Deliberate non-repairs:
- Did not run the actual Lexical issue harvest.
- Did not create a new `slate-*` skill; ownership is cleaner with
  `slate-automation` supervising existing `editor-test-harvester` and
  `clawsweeper`.
- Did not change autogoal templates or helper scripts.
- Did not patch Slate runtime/tests.
- Did not mutate GitHub, Slate issue ledgers, PR descriptions, commits, or
  branches.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| No relevant memory hit for this exact Lexical issue-harvest mode | 1 | Use current skill/source audit | Proceeded from source rules. |

Verification evidence:
- `pnpm install` completed and Skiller regenerated Codex/Claude skill mirrors.
- Source/generated parity audit:
  - `rg -n "external editor issue|issue-harvest|--issues|state all|open and closed|editor-issue-harvester|portable-invariant|lexical all issues|facebook/lexical" .agents/rules/... .agents/skills/...`
  - confirmed matching source and generated text in all three skills.
- Discoverability audit:
  - `clawsweeper` description/argument-hint now mention external editor issue
    harvests.
  - `editor-test-harvester` argument-hint now exposes `--issues [--state
    all|open|closed]`.
  - `slate-automation` examples include Lexical all-issue harvest prompts.
- Agent-native manual review:
  - action parity: future agent can invoke through `slate-automation`;
  - context parity: artifact paths and no-mutation boundaries are in the skills;
  - primitive ownership: harvester owns matrix, clawsweeper owns provenance,
    supervisor owns routing.

Final repair handoff:
- Expectation: `slate-automation` supervises all-state external editor issue
  harvests, especially Lexical open and closed issues.
- Repaired owner: `slate-automation` supervisor plus `editor-test-harvester`
  issue-mode and `clawsweeper` external provenance mode.
- Files changed: `.agents/rules/clawsweeper.mdc`,
  `.agents/rules/editor-test-harvester.mdc`,
  `.agents/rules/slate-automation.mdc`,
  generated `.agents/skills/**/SKILL.md` mirrors for those three skills, and
  this plan.
- Verification: `pnpm install`, source/generated `rg` audit, manual
  agent-native review, and `check-complete` after this patch.
- Caveat: actual Lexical issue corpus has not been harvested yet; this patch
  makes the workflow runnable.

Timeline:
- 2026-06-03T19:46:30.249Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Run `check-complete`, mark goal complete, final response. |
| What is the goal? | Patch skills so `slate-automation` can supervise all-state external issue harvests. |
| What have I learned? | The missing owner was not a new skill; it was a supervised issue-mode in the harvester plus ClawSweeper provenance. |
| What have I done? | Patched source rules, synced generated skills, audited discoverability, and recorded the repair. |

Open risks:
- `gitcrawl search issues ""` may be unsupported or capped for some repos; the
  skill now requires recording fallback and not claiming comprehensive coverage.
- The actual Lexical harvest can still be large; it should run as an autogoal
  batch with scratch artifacts, not chat output.
