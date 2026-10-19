# regression proof escalation repair

Objective:
Repair Regression so an exact owner-level unit/package RED is the durable
regression test and stops new E2E creation; E2E is allowed only when the exact
regression cannot be reproduced RED at that lower layer.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-regression-proof-escalation-repair.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: add an E2E regression test only when the exact bug cannot
  be reproduced RED in an owner-level unit/package test.
- observed miss: Regression currently escalates from a package RED to
  Playwright/fresh-host proof by default, and the completed caption packet added
  a focused E2E despite an exact 11/12 package RED.
- owning skill/template/helper: primary `.agents/rules/regression.mdc`;
  secondary methodology, regression plan template, semantic validator and
  workflow contract tests; generated mirrors sync through `pnpm install`.
- repair classification: derived-skill proof-selection repair

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary source/test/sync gates apply
- improvement loop: one narrow rule, mechanical validator rejection, mirror sync
- final score / loop closure: 54/54 Regression workflow tests pass; generated
  resources are exact; the real `test:plite-browser:chromium` escape found in
  review has its own RED-to-GREEN proof.

Completion threshold:
- Regression requires the smallest exact unit/package RED first. When it exists,
  the selected case cannot add a new E2E test; route/Browser work may verify the
  final behavior without becoming permanent E2E coverage.
- A selected case may use E2E only with a recorded `e2e-required:` reason that
  names why no exact unit/package RED is possible. The semantic validator rejects
  E2E commands paired with `unit-red:`.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-regression-proof-escalation-repair.md` passes.

Verification surface:
- focused Regression workflow contracts including one validator rejection for
  `unit-red:` plus an E2E command and one accepted `e2e-required:` case
- `pnpm install` generated mirror sync and
  `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`
- direct regression template/source audit and scoped formatting/diff checks
- agent-native manual review; `autoreview` remains prohibited on `next`

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: Regression source rule, methodology, plan template,
  semantic validator/tests, workflow contract test, generated Regression mirror,
  and this repair plan.
- Derived skill scope: Regression proof selection only; generic Autogoal goal
  lifecycle is unchanged.
- Non-goals: no product/runtime edits, no retroactive deletion of existing E2E
  files, no waiver of repo-required final Browser verification, no weakening of
  exact Chrome/device proof when no unit reproduction exists, and no commit,
  push, PR, release, or tracker mutation.

Output budget strategy:
- Read only Regression source/template/validator/test owners and capped matching
  ranges. Exclude generated/build trees except the named generated mirror parity
  check. Run focused tests before the minimum combined workflow proof.

Blocked condition:
- Block only if the validator cannot distinguish unit-red from justified E2E
  without weakening a hard browser/device correctness law. Current source offers
  a narrow selected-case field, so no blocker exists.

Repair state:
- repair_type: derived-skill proof-selection repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: user handoff
- goal_status: ready_for_completion

Current verdict:
- verdict: repair-now
- confidence: high before implementation; source and validator owners are clear
- next owner: Regression source rule and semantic validator
- reason: the completed packet demonstrates redundant E2E escalation after an
  exact package RED, matching the user's correction.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-regression-proof-escalation-repair.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope is Regression skill repair only: unit/package RED stops new E2E creation; E2E requires documented lower-layer inability. No timing, product-test deletion, or public mutation requested. |
| Timed checkpoint parsed | N/A: none requested | Binary verification gates recorded. |
| Expectation restated | yes | Unit/package RED stops E2E test creation; E2E requires recorded inability to reproduce RED below the browser boundary. |
| Active goal checked | yes | Prior caption goal was complete; a new repair goal names this plan. |
| Named plan or skill read | yes | Regression skill/methodology, Skill Creator, Autogoal repair mode, template, validator, and contract tests read. |
| Owning source selected | yes | `.agents/rules/regression.mdc` is primary; methodology/template/validator/tests are justified enforcement surfaces. |
| Repair classification selected | yes | Derived-skill proof-selection repair, not generic Autogoal lifecycle work. |
| Safety conflict checked | yes | Final Browser verification remains available; exact browser/device E2E stays legal only when a unit RED cannot reproduce the claim. |
| Output budget strategy recorded | yes | Narrow exact-file reads and focused tests only. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A because no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A.
- [x] Patch touches source-of-truth files only; `pnpm install` regenerated the
      `.agents/skills/regression/**` mirror from `.agents/rules/**`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded below.
- [x] Final response shape is recorded: expectation, repaired owner, mechanical
      proof, mirror sync, deliberate non-repairs, and local-only status.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/regression.mdc`, methodology, template, validator, and source tests enforce unit-first escalation. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` completed; `sync-resources.mjs --check` reports `Required skill resources: exact.` |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Direct inspection proves the selected-case column, checklist, threshold, and completion gate; a throwaway plan would add noise. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | The initial repair plan failed with unchecked work and open Patch, Verification, and Closeout phases. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | The semantic validator's complete fixture records `unit-red:` and passes in the 26/26 validator suite. |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | Real Plate browser-command RED failed 0/1, then passed 2/2; combined source, validator, and generated-mirror proof passes 54/54. |
| P1 autoreview / review | N/A: autoreview is forbidden on `next` | Run applicable autoreview gate with `--max-priority P1`; P2/P3 are opt-in only, or record N/A for docs-only/source-rule-only repair | Manual agent-native P1 review is PASS after adding Plate's `test:plite-browser:*` path to the validator. |
| Final lint | N/A: `.agents/**` is ignored by Ultracite | Run scoped formatter/lint or record ignored-path/N/A reason | Ultracite reported no eligible files; `node --check` for all changed scripts and scoped `git diff --check` both pass. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads and searches stayed on named Regression owners with capped output; only the 54-test final proof was printed in full. |
| Timed checkpoint | N/A: none requested | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration or hard stop was requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-regression-proof-escalation-repair.md` | Final mechanical plan check reports `[autogoal] complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirement, boundaries, and proof threshold recorded | target selection |
| Target selection | complete | Regression rule plus methodology/template/validator/tests selected | patch |
| Patch | complete | Canonical rule, methodology, template, validator, and tests patched | verification |
| Verification | complete | Exact RED-to-GREEN, 54/54 workflow proof, mirror parity, syntax, and diff checks pass | closeout |
| Closeout | complete | Manual agent-native review passes with no remaining P1; plan gates resolved | final response |

Findings:
- Regression's current `Proof Selection` permits multiple layers whenever model
  and browser behavior can disagree, but it does not stop escalation after an
  exact owner-level unit/package RED.
- The template and validator have no selected-case field recording whether E2E
  is justified, so the current workflow cannot mechanically reject redundant
  E2E creation.
- The first validator detector missed Plate's real
  `test:plite-browser:chromium` command even though it caught generic `e2e` and
  Playwright commands. The agent-native review exposed this before closeout.

Decisions and tradeoffs:
- Add one `Red-test escalation` selected-case field. `unit-red:` forbids an E2E
  test command; `e2e-required:` must name the lower-layer limitation and use an
  E2E command. This is narrower and more enforceable than weakening every
  browser/fresh-host rule.
- Keep Browser route verification distinct from E2E test creation. The repo may
  still require an interactive final check for package/UI changes without adding
  permanent Playwright coverage.
- Detect both generic E2E/Playwright commands and Plate's owned
  `apps/plite/tests/plite-browser/**` plus `test:plite-browser:*` routes. Do not
  classify generic package tests merely because their prose mentions a browser.

Repair patch notes:
- Regression attempts the exact owner-level unit/package RED first. A successful
  RED records `unit-red:` and ends new durable-test creation.
- E2E creation requires `e2e-required:` with the specific lower-layer
  reproduction limitation. The validator rejects `unit-red:` paired with an E2E
  command and rejects `e2e-required:` without one.
- The plan template exposes the decision in every selected case and gives it a
  completion gate. Browser route verification stays evidence, not automatic
  permanent E2E coverage.
- `pnpm install` regenerated the installed Regression skill and resources from
  canonical `.agents/rules/**` sources.

Deliberate non-repairs:
- Do not modify Autogoal: this is Regression-specific test selection.
- Do not delete or rewrite product E2E files in a skill-only repair.
- Do not waive exact browser/device proof when no unit RED can reproduce the
  reported invariant.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial workflow contracts after adding unit-first assertions | 1 | Patch canonical Regression rule, template, and validator | Expected RED: 38 passed and 2 failed; the repaired suite is green. |
| Plate's actual `test:plite-browser:chromium` command escaped the first detector | 1 | Replace the generic fixture with the real command and extend the detector | Expected RED: 0/1; focused final proof is 2/2 green. |
| Skill Creator `quick_validate.py` rejected repo-supported frontmatter keys | 1 | Keep canonical repo frontmatter and use repo-owned source/mirror contracts | Generic validator incompatibility; repo proof passes 54/54 and resources are exact. |
| Ultracite excluded all named `.agents/**` files | 1 | Run syntax and whitespace proof directly | `node --check` and scoped `git diff --check` pass. |

Verification evidence:
- Initial expected RED: combined workflow test run reported 38 passed and 2
  failed because the unit-first rule and validator rejection did not exist.
- Review-derived expected RED: the exact Plate browser command was accepted;
  focused test reported 0/1 before detector repair.
- Focused GREEN: unit-red rejection plus justified E2E acceptance pass 2/2.
- Validator GREEN: complete and negative fixtures pass 26/26.
- Final combined GREEN: source contracts, validator semantics, and generated
  skill contract pass 54/54.
- Mirror proof: `pnpm install` completed and
  `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` reports
  `Required skill resources: exact.`
- Static proof: all three changed scripts pass `node --check`; scoped
  `git diff --check` passes.

Agent-native review:

Verdict: PASS

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|-------------|-------------|--------------|-----------------|-------|--------|
| Select the smallest regression layer | `regression` | `.agents/rules/regression.mdc` | generated Regression skill and methodology | source and generated contract tests | pass |
| Record or reject E2E escalation | Regression selected-case plan plus semantic validator | Regression template and validator | `docs/plans/templates/regression.md` | real Plate command RED-to-GREEN and 26/26 validator suite | pass |
| Regenerate and discover the repaired workflow | `pnpm install` through Skiller | `.agents/rules/**` | `.agents/skills/regression/**` | sync-resource audit and generated-mirror contract | pass |

- Findings: no remaining P1. The review-found Plate command escape was repaired
  and proved before this verdict.
- Accepted: unit-first source policy, mechanical plan enforcement, and explicit
  Browser-versus-E2E distinction.
- Rejected: changing repo-supported skill frontmatter to satisfy a generic
  validator that does not understand this repository's schema.
- Needs attention: none for this repair.

Final repair handoff:
- Expectation: unit/package RED stops new E2E creation; E2E needs a recorded
  lower-layer reproduction failure.
- Repaired owner: Regression source rule, methodology, plan template, semantic
  validator, and workflow contracts; generated mirrors were synced.
- Files changed: canonical Regression rule/resources/scripts, generated
  Regression mirror, template, and this goal plan.
- Verification: exact workflow RED-to-GREEN, 54/54 final tests, resource parity,
  syntax, whitespace, and manual agent-native P1 review all pass.
- Caveat: existing product E2E files are outside this skill-only repair.

Timeline:
- 2026-08-26T08:40:13.199Z Goal repair plan created.
- 2026-08-26 Regression proof-selection rule and validator repaired test-first.
- 2026-08-26 Agent-native review found and closed the Plate browser-command gap.
- 2026-08-26 Generated mirrors synced and final workflow proof passed 54/54.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for goal completion and user handoff. |
| Where am I going? | Complete the goal, then report the local repair. |
| What is the goal? | Make owner-level unit RED the stop condition for new E2E test creation. |
| What have I learned? | The policy needs both explicit case metadata and detection of Plate's actual browser-test commands. |
| What have I done? | Patched canonical owners, proved two RED-to-GREEN paths, synced mirrors, and completed the agent-native review. |

Open risks:
- No known blocker. A future rename of owned E2E scripts or paths must update
  the detector and its real-command contract test; generic browser prose remains
  intentionally outside the detector.
