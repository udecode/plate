# regression local completion status

Objective:
Repair Regression so a fully verified local run/case is marked `completed`
even when uncommitted or unpushed, while pushed/integration/release evidence
continues to own shipped and public-status claims.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-regression-local-completion-status.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: Regression marks locally finished work `completed` even
  when it has not been pushed.
- observed miss: Regression currently limits `fixed`, `shipped`, and
  `completed` to pushed/integration/release evidence, forcing a fully proved
  local run to remain `candidate-local` or `verified-local`.
- owning skill/template/helper: `.agents/rules/regression.mdc`, its methodology
  reference and plan template, generated `.agents`/`.claude` mirrors, and the
  focused Regression contract test.
- repair classification: derived-skill completion/claim rule repair

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: one-shot execution
- initial confidence score: N/A: binary source/sync/contract gates exist
- improvement loop: patch the smallest doctrine surface, sync, test, review
- final score / loop closure: N/A: close only when every binary gate passes

Completion threshold:
- Regression doctrine, methodology, template, and generated mirrors state that
  a local run/case is `completed` when its local executable proof, final-source
  replay, stability, review, and plan gates pass, regardless of commit/push.
- The same sources reserve `shipped`, integrated, released, and public GitHub
  completion/labels for the evidence and authority that own those claims.
- Focused Regression contract tests, source/mirror parity, template closure
  smoke, and agent-native review all pass with zero accepted findings.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-regression-local-completion-status.md` passes.

Verification surface:
- focused rule/mirror contract tests in `.agents/rules/regression/scripts` and
  `.agents/skills/regression/scripts`
- `pnpm install` plus `sync-resources.mjs --check` for source/mirror parity
- source audit across Regression rule, methodology, template, and generated
  `.agents`/`.claude` skill mirrors
- unfinished/completed goal-plan checker smoke
- agent-native capability-map review

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.
- Do not run lint or Autoreview, per the user's standing session instruction.
- Preserve the distinction between local completion and shipped/public issue
  completion; this repair grants no commit, push, label, or public mutation.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/regression.mdc`, its methodology/template/
  focused contract source, generated `.agents` and `.claude` Regression mirrors,
  dependency metadata changed by required sync, and this plan.
- Derived skill scope: Regression's internal run/case/goal status vocabulary.
- Non-goals: Autogoal lifecycle semantics, Maintainer public-issue policy,
  product code, commit/push/PR, public GitHub mutation, lint, and Autoreview.

Output budget strategy:
- Read exact Regression owners only; use scoped `rg` for claim words; cap
  command output; exclude product source, generated builds, logs,
  `node_modules`, `.next`, `.turbo`, and unrelated skill trees.

Blocked condition:
- Block only if source-to-mirror sync cannot be made deterministic after three
  distinct attempts or the requested local completion rule cannot coexist with
  higher-authority public mutation policy. Ordinary test failures are repair
  work, not blockers.

Repair state:
- repair_type: derived Regression claim/status rule
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete locally

Current verdict:
- verdict: PASS: Regression closes fully proved local work as `completed`
- confidence: verified by source, generated, template, and agent-native proof
- next owner: final goal-plan checker
- reason: all source/mirror/contract gates pass; public status remains separate

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-regression-local-completion-status.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Local completion regardless of push; narrow Regression repair; sync and proof; no lint/Autoreview/public mutation captured above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section distinguishes completed-local from shipped/public completion |
| Active goal checked | yes | No prior active goal; created this exact repair goal |
| Named plan or skill read | yes | Regression entrypoint and methodology read completely |
| Owning source selected | yes | `.agents/rules/regression.mdc` plus owned reference/template/contract |
| Repair classification selected | yes | Derived-skill completion/claim rule repair |
| Safety conflict checked | yes | Local workflow completion changes; public issue labels/status remain Maintainer-owned |
| Output budget strategy recorded | yes | Exact owners and scoped claim-word searches only |
| Agent-native pack selected | yes | Agent workflow doctrine and generated mirrors change |
| Agent-facing action surface identified | yes | Regression final handoff and case/goal status vocabulary |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` and `.claude/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Skill read completely before product mutation |

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
- [x] Secondary owners are justified: methodology and template teach the same
      status law; the focused contract mechanically prevents regression.
- [x] Patch touches source-of-truth files only; generated mirrors changed only
      through `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded:
      Regression owns claim width; generic Autogoal already permits evidence-
      complete local goal closure and is unchanged.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded below.
- [x] Final response shape is recorded: repaired semantics, owners/files,
      exact proof, and public/shipping caveat.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. No findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Rule, methodology, Regression plan template, and focused contract now encode local completion separately from shipment/public status |
| Generated skill sync | complete | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` completed; source and installed contract tests plus sync-resources parity pass |
| Template smoke | complete | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Direct inspection confirms completion threshold, constraint, checklist, completion gate, and handoff fields; avoided persistent smoke-plan noise |
| Incomplete-plan guard | complete | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Checker rejects `docs/plans/templates/regression.md`, including unresolved new `Local completion status` gate |
| Completed-plan representability | complete | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Existing locally completed/unpushed #5085 plan passes checker; focused contract proves repaired template exposes the local-completion gate |
| Helper/checker tests | complete | If scripts changed, run focused script tests; otherwise N/A | Source and installed Regression contract suites pass 10/10; no checker implementation changed |
| P1 autoreview / review | no | Run applicable autoreview gate with `--max-priority P1`; P2/P3 are opt-in only, or record N/A for docs-only/source-rule-only repair | N/A: user explicitly stopped Autoreview for this session |
| Final lint | no | Run scoped formatter/lint or record ignored-path/N/A reason | N/A: user explicitly prohibited lint in this session |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact skill owners and scoped claim-word searches only; one combined initial read truncated and all later reads were split/capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-regression-local-completion-status.md` | Fresh final run reports `[autogoal] complete` |
| Agent source / generated sync | complete | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; `sync-resources.mjs --check` reports exact; `.claude/skills/regression` resolves to the installed `.agents` skill |
| Agent action discoverability | complete | Source-audit the skill/rule path an agent will read | New rule appears in source, `.agents/skills/regression/SKILL.md`, and `.claude/skills/regression/SKILL.md`; old prohibition has zero matches |
| Agent-native review | complete | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS capability map below; zero findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements, constraints, boundaries, and goal captured before edits | target selection |
| Target selection | complete | Regression source rule is primary; owned reference/template/contract are secondary | patch |
| Patch | complete | source rule, methodology, template, and focused contract patched | verification |
| Verification | complete | contracts 10/10; mirror parity exact; template incomplete/complete checker smoke passed; source audit passed | closeout |
| Closeout | complete | agent-native review passes; final evidence and handoff recorded | final response |

Findings:
- Regression's final sentence forbids `completed` without pushed/integration/
  release evidence, even though generic Autogoal correctly closes fully proved
  local goals.
- Methodology encodes the same mismatch in `Honest Claims And Stops` and in
  pushed-ref requirements for `fixed/completed` proof.

Decisions and tradeoffs:
- Use `completed` as the terminal Regression status and require the handoff to
  state `local, uncommitted, and unpushed` when true. Keep `shipped`, integrated,
  released, and public issue completion separate.

Repair patch notes:
- Added `completed` as the terminal evidence-complete local status.
- Made commit/push explicitly non-gating for local completion.
- Kept integrated/shipped/released/public issue claims under their existing
  coordinator evidence and authority.

Deliberate non-repairs:
- Generic Autogoal already allows evidence-complete local goals; changing it
  would duplicate Regression policy.
- Maintainer's public GitHub issue/label policy stays unchanged; this request
  does not authorize public mutation or a shipped claim.

Agent-native review:
- verdict: PASS; zero P0-P3 findings.

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|-------------|-------------|--------------|-----------------|-------|--------|
| Complete a fully proved local Regression run without pushing | `$regression` final handoff and methodology | `.agents/rules/regression.mdc` and owned methodology/template | `.agents/skills/regression`; `.claude/skills/regression` symlink | 10/10 contract tests, source audit, template checker smoke | pass |
| Distinguish local completion from shipment/public issue completion | Regression authority and claim table; Maintainer owns public state | Regression rule/methodology plus existing public-status policy | Generated Regression skill | scoped stale-doctrine audit and parity check | pass |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined governing-skill read exceeded the output cap | 1 | Split each required skill/reference into bounded complete reads | Resolved before edits; every required source was read completely |
| Generic Skill Creator `quick_validate.py` rejects repo-supported `argument-hint` and `disable-model-invocation` frontmatter | 1 | Use the owning Skiller sync, generated equality contract, and repo parity checker | Incompatible generic validator recorded; repo-native proof passes |
| First final plan check treated `required` in an N/A evidence cell as unresolved | 1 | Remove the unrelated clause from the Autoreview N/A evidence | Resolved; agent-native review proof remains in its own completed gate |

Verification evidence:
- Pre-sync source test: new local-completion subtest passed; generated equality
  failed exactly because the installed skill was stale.
- `pnpm install`: Skiller applied rules for Claude Code and Codex; required
  skill resources synced.
- `node --test .agents/rules/regression/scripts/test-first-contract.test.mjs
  .agents/skills/regression/scripts/test-first-contract.test.mjs`: 10/10 pass.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`:
  `Required skill resources: exact.`
- Scoped source audit: new local-completion rule appears in source, `.agents`,
  and `.claude`; old pushed-only `completed` prohibition has zero matches;
  source/generated methodology and contract files are byte-equal.
- Unfinished guard: `check-complete.mjs docs/plans/templates/regression.md`
  exits 1 and names unresolved `Local completion status`.
- Completed representation: `check-complete.mjs
  docs/plans/5085-floating-toolbar-bold-regression.md` reports complete for the
  local unpushed run.
- Agent-native review: PASS; capability route, source owner, mirror, proof, and
  handoff are all present; zero findings.

Final repair handoff:
- Expectation: locally proved Regression work is completed even when unpushed
- Repaired owner: Regression source rule, methodology, plan template, and
  focused contract
- Files changed: `.agents/rules/regression.mdc`, owned methodology/contract,
  generated `.agents/skills/regression` mirrors, Regression plan template, and
  this repair plan; `.claude` consumes the generated skill through its symlink
- Verification: contracts 10/10, repo sync exact, unfinished/completed checker
  smoke, stale-doctrine source audit, and agent-native review pass
- Caveat: local completion is not shipped/integrated/released or public issue
  completion

Timeline:
- 2026-08-19T18:49:19.819Z Goal repair plan created.
- 2026-08-19: Selected Regression's final claim rule, methodology claim table,
  plan template, and focused contract as the complete repair surface.
- 2026-08-19: Patched all source owners and added a mechanical local-completion
  contract before generated mirror sync.
- 2026-08-19: Captured the expected pre-sync mirror failure, ran `pnpm install`,
  passed 10/10 contracts and exact parity, proved template guard/closure, and
  completed the agent-native review with zero findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; all substantive verification is green |
| Where am I going? | Final goal-plan checker and completed local handoff |
| What is the goal? | Let Regression close locally proved work as completed without implying shipment |
| What have I learned? | The overconstraint is Regression-specific, not an Autogoal lifecycle defect |
| What have I done? | Synced and proved the source rule, methodology, template, installed mirrors, and focused contract |

Open risks:
- None within Regression local workflow. The explicit boundary still prevents
  agents from treating local completion as shipped/integrated/released or as
  authority to change public issue status/labels.
