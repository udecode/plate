# Shrink ClawSweeper Boundary

Objective:
Shrink ClawSweeper to Slate issue-ledger provenance and claim hygiene, and add
ClawSweeper autogoal template coverage so the narrower boundary remains usable.

Goal plan:
docs/plans/2026-06-16-shrink-clawsweeper-boundary.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: `clawsweeper` should only own Slate issue-ledger,
  provenance, and claim hygiene now that `maintainer` exists.
- observed miss: `clawsweeper` still describes small-fix sweeps and work
  candidate routing in a way that can read like general issue orchestration.
- owning skill/template/helper: `.agents/rules/clawsweeper.mdc` and new
  `docs/plans/templates/clawsweeper.md`.
- repair classification: derived skill boundary plus project template repair.

First checkpoint:
- [x] Scope: shrink `clawsweeper`.
- [x] Boundary: `maintainer` owns public issue/PR/security queue orchestration.
- [x] Remaining `clawsweeper` owner: Slate issue-ledger, provenance, duplicate,
  stale, invalid, claim hygiene, fork dossier, and subordinate external issue
  provenance.
- [x] Condition: only acceptable if covered by an autogoal template.
- [x] Deliverables: patched source rule, new `clawsweeper` plan template,
  regenerated skill mirror, routing docs if needed.
- [x] Verification: `pnpm install`, source/generated boundary audits, template
  smoke, `check-complete`.
- [x] Non-goals: no public GitHub orchestration, no generic queue brain, no
  runtime/package/browser changes.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-shrink-clawsweeper-boundary.md` passes.
- Exact repaired behavior: `clawsweeper` is a ledger/provenance/claim-hygiene
  skill, `maintainer` remains the public queue control plane, and future
  ClawSweeper runs can create a dedicated autogoal plan with ledger source,
  claim, proof, and handoff gates.

Verification surface:
- `pnpm install`
- source/generated audit for `queue brain`, `general issue orchestrator`,
  `control plane`, `Small-Fix Sweep`, `Work Candidate Routing`, and
  `--template clawsweeper`
- `test -f docs/plans/templates/clawsweeper.md`
- generated mirror audit in `.agents/skills/clawsweeper/SKILL.md`
- incomplete-template smoke with `create-goal-scratchpad --template clawsweeper`
  and `check-complete` expected failure
- completed current repair plan `check-complete`

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user request and current `maintainer`/`clawsweeper`
  source rules.
- Allowed edit scope: `.agents/rules/clawsweeper.mdc`,
  `docs/plans/templates/clawsweeper.md`, `.agents/AGENTS.md` if routing needs
  sharper wording, generated mirrors from `pnpm install`, and this plan.
- Derived skill scope: `clawsweeper` only owns Slate issue-ledger provenance,
  duplicate/stale/invalid classification, exact claim hygiene, fork dossier
  accounting, gitcrawl archive refresh, and subordinate external issue
  provenance.
- Non-goals: public GitHub queue orchestration, generic issue triage, GitHub
  mutation, runtime fixes, package changes, commits, PRs.

Output budget strategy:
- Use scoped `sed` and `rg` over `.agents/rules`, `.agents/skills`, and
  `docs/plans/templates`; cap command output; avoid repo-wide unbounded dumps.

Blocked condition:
- Block only if the autogoal helper cannot use a `clawsweeper` template or
  Skiller cannot regenerate the deleted/changed skill mirror.

Repair state:
- repair_type: derived-skill-boundary-and-template
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: 0.96
- next owner: none; user review only if wording should change
- reason: ClawSweeper source is narrowed, dedicated template exists, generated mirror is synced, and boundary audits passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-shrink-clawsweeper-boundary.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint section records scope, boundary, condition, deliverables, verification, and non-goals |
| Timed checkpoint parsed | N/A | No duration requested |
| Expectation restated | yes | Expectation section states shrink and observed miss |
| Active goal checked | yes | `get_goal` returned no active goal before `create_goal` |
| Named plan or skill read | yes | Read `autogoal`, `clawsweeper`, `maintainer`, source rules, and maintainer template |
| Owning source selected | yes | `.agents/rules/clawsweeper.mdc` plus `docs/plans/templates/clawsweeper.md` |
| Repair classification selected | yes | Derived skill boundary plus project template repair |
| Safety conflict checked | yes | No safety conflict; this narrows authority and preserves evidence gates |
| Output budget strategy recorded | yes | Scoped reads/searches with capped output |
| Agent-native pack selected | yes | Skill/rule/tooling surface changes |
| Agent-facing action surface identified | yes | Future agent invokes `clawsweeper` for ledger/provenance, not queue orchestration |
| Source rule versus generated mirror boundary identified | yes | Source rule/template patched; generated mirror synced by `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer and applied action/context/discoverability checks to changed skill surface |

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
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/clawsweeper.mdc` narrowed to ledger/provenance/claim hygiene |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` completed; `.agents/skills/clawsweeper/SKILL.md` contains the new boundary |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Created `docs/plans/2026-06-16-clawsweeper-template-smoke.md` from `--template clawsweeper` |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Smoke plan failed `check-complete` with required ClawSweeper-specific gate failures |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | This repair plan records the expectation and closes without editing checker/helper scripts |
| Helper/checker tests | N/A | If scripts changed, run focused script tests; otherwise N/A | No helper or checker scripts changed |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Agent-native review applied; no findings. Full autoreview N/A: source-rule/template-only repair, no runtime implementation |
| Final lint | N/A | Run scoped formatter/lint or record ignored-path/N/A reason | Markdown/rule/template only; `pnpm install`/Skiller sync is the owner gate |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands were scoped to named files and capped |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-shrink-clawsweeper-boundary.md` | Passed |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; source/generated `--template clawsweeper` and boundary audits passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found boundary and template instructions in source and generated skill |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded reviewer; no action parity/discoverability findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | created repair plan and captured first checkpoint | target selection |
| Target selection | complete | selected `clawsweeper` rule plus new `clawsweeper` template | patch |
| Patch | complete | source rule/template/AGENTS patched; generated mirror synced | verification |
| Verification | complete | `pnpm install`, audits, smoke expected failure, agent-native review | closeout |
| Closeout | complete | plan updated with final evidence | final response |

Findings:
- `clawsweeper` had enough useful provenance and claim policy to keep, but the
  old small-fix/work-candidate wording overlapped with `maintainer`.
- There was no `docs/plans/templates/clawsweeper.md`; that made the shrink
  unsafe because future runs lacked a dedicated ledger/provenance goal shell.

Decisions and tradeoffs:
- Keep `maintainer` as the public queue control plane.
- Keep `clawsweeper` as the Slate issue-ledger/provenance/claim-hygiene owner.
- Do not move ClawSweeper evidence bars into generic `autogoal`; they are
  lane-specific.

Repair patch notes:
- Added ClawSweeper goal contract with `--template clawsweeper`.
- Reworded ClawSweeper intro and core rules away from queue orchestration.
- Replaced `Small-Fix Sweep Loop` with `Issue Ledger Processing Loop`.
- Replaced `Work Candidate Routing` with `Owner Handoff Routing`.
- Added dedicated `docs/plans/templates/clawsweeper.md`.
- Updated AGENTS routing to remove small high-confidence issue processing from
  ClawSweeper.

Deliberate non-repairs:
- Did not edit `maintainer`; it already states public queue ownership and lists
  ClawSweeper as a subordinate ledger/provenance owner.
- Did not add helper/checker scripts; template and source audits are enough.
- Did not run runtime tests or browser proof; no runtime/browser behavior
  changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` pattern beginning with `--template` parsed as an option | 1 | Reran with `rg -n -- "<pattern>" ...` | Passed |

Verification evidence:
- `pnpm install` completed and Skiller apply succeeded.
- Source/generated audit found `--template clawsweeper`, `Goal Contract`,
  `Issue Ledger Processing Loop`, `Owner Handoff Routing`, and the maintainer
  boundary in `.agents/rules/clawsweeper.mdc` and generated
  `.agents/skills/clawsweeper/SKILL.md`.
- Template audit found `Maintainer boundary`, `Issue decision matrix`,
  `Claim sync`, `Owner handoff`, `Autoreview`, and `Goal plan complete`.
- Stale broad-owner audit found no live `small-fix`, `fix locally`,
  `Classify before patching`, or `Fix the root cause` wording in ClawSweeper.
- Smoke plan from `--template clawsweeper` failed `check-complete` as expected,
  proving unfinished ClawSweeper plans cannot close.
- Smoke artifact was deleted.
- Agent-native review loaded and found no action parity or discoverability gap.
- Final `check-complete` passed for this repair plan.

Final repair handoff:
- Expectation: ClawSweeper only owns Slate issue-ledger/provenance/claim hygiene
  now that `maintainer` exists.
- Repaired owner: `.agents/rules/clawsweeper.mdc` plus
  `docs/plans/templates/clawsweeper.md`.
- Files changed: source rule, generated skill mirror, new ClawSweeper template,
  AGENTS routing, and this repair plan.
- Verification: sync, boundary audits, template audit, smoke expected failure,
  and agent-native review.
- Caveat: unrelated pre-existing AGENTS changes remain in the checkout; this
  repair did not revert them.

Timeline:
- 2026-06-16T17:16:17.159Z Goal repair plan created.
- 2026-06-16: Read autogoal, ClawSweeper, maintainer, source rules, and
  maintainer template.
- 2026-06-16: Patched ClawSweeper boundary and added ClawSweeper template.
- 2026-06-16: Ran `pnpm install`, audits, template smoke, and agent-native
  review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Shrink ClawSweeper and add ClawSweeper autogoal template coverage |
| What have I learned? | Maintainer already owns the queue brain; ClawSweeper needed template-backed narrowing |
| What have I done? | Patched source, generated mirrors, added template, verified audits |

Open risks:
- Current session skill list may still show older descriptions until a fresh
  session reloads, but repo source and generated files are updated.
