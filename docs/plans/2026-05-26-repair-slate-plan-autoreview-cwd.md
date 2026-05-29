# repair slate plan autoreview cwd

Objective:
Repair Slate Plan execution closeout so autoreview always runs from the git
checkout that owns the implementation patch. For Slate v2 execution work under
`.tmp/slate-v2`, the review helper must run with cwd `.tmp/slate-v2`, not the
`plate-2` root, while still allowing the helper binary to live in `plate-2`.

Goal plan:
docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: Slate Plan execution review should never run dirty-local
  autoreview from the wrong repo root.
- observed miss: autoreview was first run from `plate-2`, producing a 2.99M
  character bundle of unrelated root skill/docs changes instead of the
  `.tmp/slate-v2` implementation diff.
- owning skill/template/helper: `.agents/rules/slate-plan.mdc` and
  `docs/plans/templates/slate-plan.md`.
- repair classification: derived skill rule plus template gate repair.

Completion threshold:
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md` passes.
- The repaired Slate Plan rule must require autoreview target selection from the
  owning git checkout and explicitly name `.tmp/slate-v2` as the cwd for Slate
  v2 implementation patches.
- The Slate Plan template must include an autoreview workspace gate so future
  plans record reviewed patch owner, cwd, command, result, and notes.

Verification surface:
- Source audit with `rg` over `.agents/rules/slate-plan.mdc`,
  `.agents/skills/slate-plan/SKILL.md`, and
  `docs/plans/templates/slate-plan.md`.
- Generated skill sync with `pnpm install`.
- Repair-plan completion check with
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md`.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/slate-plan.mdc`,
  `docs/plans/templates/slate-plan.md`, generated sync output from
  `pnpm install`, and this repair plan.
- Derived skill scope: Slate Plan execution closeout and template gates only.
- Non-goals: changing the autoreview helper implementation, changing generic
  autogoal lifecycle rules, resuming the paused hidden-content execution goal,
  or reviewing the Slate v2 implementation diff.

Blocked condition:
- Block only if the Slate Plan source rule/template cannot be edited or the
  generated skill sync fails repeatedly with no source-level repair path.

Repair state:
- repair_type: derived-skill-workspace-gate
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete-without-new-goal

Current verdict:
- verdict: repaired
- confidence: high
- next owner: none
- reason: Slate Plan now names the autoreview workspace rule in both source
  rule and template, and generated skill sync contains the repaired wording.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Expectation restated | yes | Restated above: Slate Plan dirty-local autoreview must run from the owning checkout, `.tmp/slate-v2` for Slate v2 patches. |
| Active goal checked | yes | `get_goal` showed paused hidden-content execution goal; no second goal was created. |
| Named plan or skill read | yes | User pasted `autogoal` and `slate-plan`; source reads covered `.agents/rules/slate-plan.mdc`, `docs/plans/templates/slate-plan.md`, and `docs/plans/templates/goal-repair.md`. |
| Owning source selected | yes | Primary owner selected as `.agents/rules/slate-plan.mdc`; template owner selected as `docs/plans/templates/slate-plan.md`. |
| Repair classification selected | yes | Derived skill rule plus template gate repair. |
| Safety conflict checked | yes | No evidence gate weakened; repair tightens review workspace authority. |

Work Checklist:
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A.
- [x] Patch touches source-of-truth files only.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/slate-plan.mdc` now has `Autoreview Workspace Gate` and cwd rules for `.tmp/slate-v2`. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed and `rg` found repaired wording in `.agents/skills/slate-plan/SKILL.md`. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Direct template inspection found `Autoreview workspace gate` with `Reviewed patch owner`, `Cwd`, `Command`, `Result`, and `Notes`. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Pre-fill check exited 1 as expected before the repair plan was filled. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Template now has explicit autoreview workspace row and final gate text for completed plans to fill. |
| Helper/checker tests | N/A: no scripts changed | If scripts changed, run focused script tests; otherwise N/A | No helper/checker code was changed. |
| Autoreview / review | N/A: source-rule/template-only repair | Run applicable review gate or record N/A for docs-only/source-rule-only repair | No implementation code was changed by this repair. |
| Final lint | N/A: markdown/rule-only repair | Run scoped formatter/lint or record ignored-path/N/A reason | `pnpm install` generated skill sync passed; source audit covers changed wording. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md` | Passed after final repair evidence was recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Expectation restated and active paused goal checked | target selection |
| Target selection | complete | Primary owner is Slate Plan rule; secondary owner is Slate Plan template | patch |
| Patch | complete | Patched `.agents/rules/slate-plan.mdc` and `docs/plans/templates/slate-plan.md` | verification |
| Verification | complete | `pnpm install` sync passed; `rg` source audit passed | closeout |
| Closeout | complete | Final repair handoff filled; final check rerun pending in verification evidence | final response |

Findings:
- Slate Plan already required Slate v2 verification commands to run in
  `.tmp/slate-v2`, but its autoreview wording only said dirty-local
  `--mode local` and did not bind the review cwd to the implementation checkout.
- Running dirty-local autoreview from `plate-2` can review unrelated root
  skill/docs changes and miss or drown out the `.tmp/slate-v2` implementation
  patch.

Decisions and tradeoffs:
- Repair `slate-plan`, not generic `autogoal`: the miss is lane-specific
  because Slate Plan executes against a nested Slate v2 checkout while keeping
  planning ledgers in `plate-2`.
- Do not modify the autoreview helper: the helper correctly reviews the current
  git checkout; the caller selected the wrong cwd.
- Do not broaden the repair to all templates: `docs/plans/templates/goal.md`
  already has a generic workspace-authority gate.

Repair patch notes:
- Added `Autoreview Workspace Gate` to `.agents/rules/slate-plan.mdc`.
- Strengthened Slate Plan execution-goal and closeout wording so dirty-local
  autoreview runs from the checkout that owns the patch.
- Added `Autoreview workspace gate` to `docs/plans/templates/slate-plan.md`.
- Ran `pnpm install` so `.agents/skills/slate-plan/SKILL.md` synced from the
  source rule.

Deliberate non-repairs:
- No change to `.agents/rules/autogoal.mdc`; generic goal templates already
  require workspace authority and the miss is Slate Plan execution-specific.
- No change to autoreview helper code; cwd selection belongs to the calling
  workflow.
- No attempt to resume or close the paused hidden-content execution goal in
  this repair.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `ps -axo pid,ppid,command | rg 'autoreview|codex exec'` confirmed no stale
  autoreview/codex review process remained after cleanup.
- `pnpm install` in `plate-2` passed and ran `bun x skiller@latest apply`.
- `rg -n "Autoreview Workspace Gate|git checkout that owns|\\.tmp/slate-v2.*autoreview|wrong bundle|Reviewed patch owner" .agents/rules/slate-plan.mdc .agents/skills/slate-plan/SKILL.md docs/plans/templates/slate-plan.md`
  passed and found repaired wording in source rule, generated skill, and
  template.
- Pre-fill `check-complete` on this repair plan failed as expected, proving
  unfinished repair plans still do not self-close.
- Final `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-repair-slate-plan-autoreview-cwd.md`
  passed.

Final repair handoff:
- Expectation: Slate Plan execution autoreview runs in the correct repo.
- Repaired owner: `.agents/rules/slate-plan.mdc` plus
  `docs/plans/templates/slate-plan.md`.
- Files changed: Slate Plan source rule, Slate Plan generated skill via sync,
  Slate Plan template, and this repair plan.
- Verification: source audit, generated skill sync, and final
  `check-complete` passed.
- Caveat: the paused hidden-content execution goal remains paused.

Timeline:
- 2026-05-26T12:30:29.479Z Goal repair plan created.
- 2026-05-26 Killed stale autoreview/codex review processes from the interrupted
  closeout.
- 2026-05-26 Read Slate Plan source rule/template and identified missing
  autoreview cwd authority.
- 2026-05-26 Patched Slate Plan source rule and template.
- 2026-05-26 Ran `pnpm install`; generated skill sync passed.
- 2026-05-26 Source audit found the repaired wording in source rule, generated
  skill, and template.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake |
| Where am I going? | Final response |
| What is the goal? | Repair Slate Plan autoreview cwd selection for future execution closeouts |
| What have I learned? | The missing rule was Slate Plan-specific; autoreview itself reviews whatever cwd it is given |
| What have I done? | Patched rule/template, synced generated skill, and recorded verification |

Open risks:
- None for the repair. The paused implementation goal still needs its own
  autoreview rerun later from `.tmp/slate-v2`.
