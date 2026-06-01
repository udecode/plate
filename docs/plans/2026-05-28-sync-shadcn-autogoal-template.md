# sync shadcn autogoal template

Objective:
Repair `sync-shadcn` so it is an `autogoal`-derived workflow, not a standalone
audit script. Future runs must create or continue an active goal, instantiate
`docs/plans/templates/sync-shadcn.md`, write upstream range evidence under
`docs/sync/shadcn/runs/`, update `lastPlannedCommit` only after a complete
plan, and advance `lastSyncedCommit` only after implementation/accounting is
verified.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-autogoal-template.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: "`sync-shadcn` should be an `autogoal` template and the
  skill should depend on `autogoal`."
- observed miss: `.agents/rules/sync-shadcn.mdc` defined standalone planning
  mechanics and no `docs/plans/templates/sync-shadcn.md` existed.
- owning skill/template/helper: `.agents/rules/sync-shadcn.mdc` plus new
  `docs/plans/templates/sync-shadcn.md`; generated skill mirrors must be synced
  by `pnpm install`.
- repair classification: derived-skill rule plus future generated-plan
  template repair.

Completion threshold:
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-autogoal-template.md` passes.
- `.agents/rules/sync-shadcn.mdc` declares the derived `autogoal` contract:
  lifecycle, flow mode, template, default packs, start gates, completion gates,
  evidence types, handoff, and what remains delegated to `autogoal`.
- `docs/plans/templates/sync-shadcn.md` exists and can be instantiated by
  `create-goal-scratchpad.mjs --template sync-shadcn`.
- Generated `.agents/skills/sync-shadcn/SKILL.md` includes the autogoal
  dependency after `pnpm install`.
- A blank instantiated `sync-shadcn` plan fails `check-complete.mjs`.
- The repair does not modify `apps/www` implementation behavior.

Verification surface:
- Source audits with `rg` over `.agents/rules/sync-shadcn.mdc`,
  `.agents/skills/sync-shadcn/SKILL.md`, and
  `docs/plans/templates/sync-shadcn.md`.
- `pnpm install` to regenerate skill mirrors after source-rule edits.
- Template smoke via `create-goal-scratchpad.mjs --template sync-shadcn`.
- Incomplete-plan guard via `check-complete.mjs` on the smoke plan.
- Final repair plan check with `check-complete.mjs` on this file.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: user correction in this thread plus
  `.agents/skills/autogoal/SKILL.md` derived-skill contract.
- Allowed edit scope: `.agents/rules/sync-shadcn.mdc`,
  `docs/plans/templates/sync-shadcn.md`, generated skill mirrors from
  `pnpm install`, this goal plan, and smoke-plan artifacts created only for
  verification.
- Derived skill scope: shadcn docs sync planning/tracking under
  `docs/sync/shadcn` using `../shadcn/apps/v4` and `apps/www`.
- Non-goals: no `apps/www` migration implementation, no registry build output,
  no generic `autogoal` rule changes unless the derived contract proves
  impossible.

Output budget strategy:
- Use exact file reads and capped `rg` output. Do not stream large upstream
  diffs; the sync skill must save them to `docs/sync/shadcn/runs/<range>/`.
- One early `rg --files` discovery command over-returned plan filenames; record
  that as an error attempt and continue with narrow reads/audits.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills, the template helper
  cannot instantiate `sync-shadcn`, or the checker cannot validate ordinary
  generated plans after source-consistent fixes.

Repair state:
- repair_type: derived-skill autogoal-template repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: repair required
- confidence: high
- next owner: sync-shadcn source rule/template
- reason: The expectation is lane-specific; `autogoal` already defines the
  derived-skill contract, so `sync-shadcn` must implement it.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-autogoal-template.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Expectation restated | yes | User said `sync-shadcn` should be an `autogoal` template and depend on `autogoal`. |
| Active goal checked | yes | `get_goal` returned no active goal, then `create_goal` created this repair objective. |
| Named plan or skill read | yes | User provided `autogoal` skill body; `.agents/rules/sync-shadcn.mdc`, `docs/plans/templates/goal.md`, `task.md`, and `goal-repair.md` read. |
| Owning source selected | yes | Repair belongs to `.agents/rules/sync-shadcn.mdc` plus new `docs/plans/templates/sync-shadcn.md`, not generic `autogoal`. |
| Repair classification selected | yes | Derived-skill rule plus reusable template repair. |
| Safety conflict checked | yes | No conflict: this strengthens evidence/lifecycle gates and preserves existing sync mechanics. |
| Output budget strategy recorded | yes | Exact reads/capped `rg`; broad sync evidence stays in run artifacts. |

Work Checklist:
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
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/sync-shadcn.mdc`, `.agents/AGENTS.md`, and `docs/plans/templates/sync-shadcn.md` patched. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; Skiller regenerated `.agents/skills/sync-shadcn/SKILL.md` and `AGENTS.md`. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template sync-shadcn --title "sync shadcn template smoke"` created the smoke plan. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-template-smoke.md` failed as expected with unresolved sync gates. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Source audit shows the template has objective, flow mode, sync state, decision counts, merge slices, questions, verification evidence, final handoff, and status JSON rows. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper/checker scripts changed. |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: source-rule/template-only repair, no app UI/action parity surface; `agent-native-reviewer` triage read and generated skill source audit covers agent-facing execution path. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check -- ...` passed; `pnpm exec biome check ...` passed for supported files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One early broad file-list command overproduced; recorded in Error attempts and recovered with capped exact reads/audits. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-autogoal-template.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Active goal and repair plan created. | target selection |
| Target selection | complete | Ownership selected: `.agents/rules/sync-shadcn.mdc` and `docs/plans/templates/sync-shadcn.md`; generic autogoal stays unchanged. | patch |
| Patch | complete | Added autogoal dependency to `sync-shadcn`, created dedicated template, updated skill list wording, regenerated generated mirrors. | verification |
| Verification | complete | `pnpm install`, source audits, template smoke, incomplete-plan guard, `git diff --check`, and Biome supported-file check passed. | closeout |
| Closeout | complete | Final response will report repaired owner, files, and verification. | final response |

Findings:
- `.agents/rules/sync-shadcn.mdc` has detailed upstream sync mechanics but no
  autogoal lifecycle section and no project template reference.
- `docs/plans/templates/sync-shadcn.md` does not exist yet.
- `autogoal` explicitly says derived skills should declare lifecycle,
  flow mode, template, packs, gates, evidence, handoff, and delegated
  responsibilities.

Decisions and tradeoffs:
- Repair the derived `sync-shadcn` workflow instead of the generic `autogoal`
  skill. The miss is lane-specific, not a universal lifecycle bug.
- Create a dedicated `sync-shadcn` template instead of reusing `task`; shadcn
  sync has special range accounting, complete inventory, baseline-advance, and
  user-decision gates.

Repair patch notes:
- Added `## Autogoal Dependency` to `.agents/rules/sync-shadcn.mdc`.
- Created `docs/plans/templates/sync-shadcn.md` with shadcn-specific start
  gates, work checklist, completion gates, sync state, decision counts,
  recommended slices, questions, status JSON semantics, and final handoff.
- Updated `.agents/AGENTS.md` skill description to call out autogoal-backed
  tracking.
- Ran `pnpm install` to regenerate `AGENTS.md` and
  `.agents/skills/sync-shadcn/SKILL.md`.

Deliberate non-repairs:
- Do not edit `.agents/skills/sync-shadcn/SKILL.md` by hand; regenerate it.
- Do not change `apps/www` or implement the previously generated upstream sync
  slice in this repair.
- Do not patch generic `autogoal`; its derived-skill contract already covers
  the missing requirement.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Early broad `rg --files docs/plans...` streamed too many filenames | 1 | Use exact file reads and capped audits for the rest of the repair | Recovered; no more broad listings. |

Verification evidence:
- `pnpm install` passed and Skiller completed.
- `rg -n -F '[$autogoal](/Users/zbeyens/git/plate/.agents/skills/autogoal/SKILL.md)' .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md`
  found the dependency in both source and generated skill.
- `rg -n "Autogoal Dependency|--template sync-shadcn|docs/plans/templates/sync-shadcn.md|lastSyncedCommit" ...`
  found the expected autogoal/template/status semantics in source, generated
  skill, and template.
- `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template sync-shadcn --title "sync shadcn template smoke"`
  instantiated the template.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-template-smoke.md`
  failed as expected for an unfinished plan.
- `test ! -e docs/plans/2026-05-28-sync-shadcn-template-smoke.md` passed after
  removing the smoke artifact.
- `git diff --check -- .agents/rules/sync-shadcn.mdc .agents/AGENTS.md AGENTS.md .agents/skills/sync-shadcn/SKILL.md docs/plans/templates/sync-shadcn.md docs/plans/2026-05-28-sync-shadcn-autogoal-template.md`
  passed.
- `pnpm exec biome check .agents/AGENTS.md AGENTS.md docs/plans/templates/sync-shadcn.md docs/plans/2026-05-28-sync-shadcn-autogoal-template.md docs/sync/shadcn/status.json`
  passed for the supported file Biome checked.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-autogoal-template.md`
  passed.

Final repair handoff:
- Expectation: `sync-shadcn` depends on `autogoal` and uses a reusable
  autogoal plan template.
- Repaired owner: `.agents/rules/sync-shadcn.mdc` plus
  `docs/plans/templates/sync-shadcn.md`.
- Files changed: `.agents/rules/sync-shadcn.mdc`, `.agents/AGENTS.md`,
  generated `AGENTS.md`, generated `.agents/skills/sync-shadcn/SKILL.md`,
  `docs/plans/templates/sync-shadcn.md`, and this repair plan.
- Verification: `pnpm install`, source audits, template smoke, incomplete-plan
  guard, `git diff --check`, and Biome supported-file check.
- Caveat: no `apps/www` sync implementation in this repair.

Timeline:
- 2026-05-28T13:44:14.580Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake |
| Where am I going? | Target selection, patch, verification, closeout |
| What is the goal? | Make `sync-shadcn` an autogoal-derived skill with its own reusable template and generated skill sync. |
| What have I learned? | `sync-shadcn` needed a derived-skill autogoal contract and a dedicated range-accounting template. |
| What have I done? | Patched source rule/template, regenerated skill mirrors, smoke-tested the template, and verified source audits. |

Open risks:
- None.
