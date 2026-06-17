# {{TITLE}}

Objective:
TODO: Write the short autoclosure objective, under 240 characters. Put the full
closure contract below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Closure source:
- type: pending
- prompt / link: pending
- target kind: pending
- target ref / surface: pending
- base / comparison: pending
- PR/range diff artifacts: pending
- current tree scope: pending
- completion threshold summary: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: target, scope, non-goals, stop
  conditions, deliverables, final handoff sections, verification surfaces, and
  success criteria.
- Do not continue into closure work until this extraction is complete or marked
  N/A with reason.

Completion threshold:
- TODO: Define the exact autoclosure clean state.
- Clean is legal only when there are zero accepted actionable review findings,
  required focused proof after the last patch is green or N/A with reason,
  architecture/docs/API/generated-output rows are closed, review-attention and
  residual-risk rows are filled, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- For risky public API, agent-rule, package-boundary, or broad refactor diffs,
  require two consecutive clean closure passes after the last patch.

Verification surface:
- TODO: Name the source audits, focused tests, browser proof, package checks,
  docs/build checks, generated-output sync, `autoreview`, and optional
  `architecture-cleanup` proof that prove closure.

Constraints:
- Closure target is already-landed/current-tree/branch work; do not expand into
  broad quality/perf/research unless a row routes to `auto`.
- Do not create or use git worktrees, detached sibling checkouts, throwaway
  clones of this repo, or branch switching for autoclosure. If the target is a
  PR/range not applied to this checkout, capture the full file list and patch
  under `docs/plans/artifacts/<plan-slug>/` and audit from that artifact.
- Patch safe findings; route public API/runtime/product forks to
  `slate-plan`, `plate-plan`, or `major-task`.
- Do not commit, push, open PRs, merge, release, publish, or mutate public
  GitHub unless explicitly authorized.
- Do not call stale, speculative, or out-of-scope review findings accepted.
- Do not leave dirty speculative half-patches.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Target diff/tree scope: pending
- PR/range artifact scope: pending
- Browser surfaces: pending
- Package/API surfaces: pending
- Agent/skill surfaces: pending
- Docs/generated-output surfaces: pending
- Non-goals: pending

Blocked condition:
- TODO: Name the authority, taste gap, unavailable proof surface, unsafe API
  fork, missing source, repeated blocker, or external credential/device/service
  that stops autonomous closure.

Closure state:
- target_kind: pending
- target_ref: pending
- base_ref: pending
- loop_count: 0
- last_patch_loop: pending
- consecutive_clean_passes: 0
- clean_required_passes: pending
- current_pass: checkpoint-zero
- current_pass_status: in_progress
- next_pass: target-map
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: autoclosure
- clean / patch / reject / route call: pending
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `autoclosure` source rule read | pending | pending |
| `vision` / root `VISION.md` read | pending | pending |
| `.agents/AGENTS.md` routing read | pending | pending |
| Active goal checked or created | pending | pending |
| Target kind resolved | pending | pending |
| Base/comparison resolved or marked N/A | pending | pending |
| PR/range diff captured when target is not current checkout | pending | pending |
| Output budget strategy recorded | pending | pending |
| Public authority boundary recorded | pending | pending |
| Browser proof decision recorded | pending | pending |
| Package/API proof decision recorded | pending | pending |
| Agent/rule/generated-output sync decision recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, target,
      scope boundary, stop condition, deliverable, final handoff section,
      verification surface, and success criterion is copied into this plan.
- [ ] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Target map records changed files, untracked files, generated outputs,
      packages, docs, tests, examples, agent rules, and browser surfaces in
      scope, or N/A with reason.
- [ ] PR/range targets not already applied to this checkout have complete diff
      artifacts recorded: metadata JSON, name-only file list, and full patch.
- [ ] No worktree/shadow-checkout proof is used. Every kept patch is applied
      and verified in this checkout, or the target is handed off as a captured
      diff review with next owner.
- [ ] Coherence audit checks stale dirty fixes, fake aliases, docs/API mismatch,
      orphan tests, stale generated output, weak proof commands, and
      Slate-vs-Plate boundary drift.
- [ ] Focused proof is run for each changed behavior/API/docs/generated surface,
      or marked N/A with reason.
- [ ] `autoreview` target mode is selected from actual target state.
- [ ] Each accepted `autoreview` finding is fixed or rejected with source-backed
      reason.
- [ ] Affected proof is rerun after every accepted finding fix.
- [ ] `autoreview` is rerun after material fixes until zero accepted actionable
      findings remain.
- [ ] `architecture-cleanup` is invoked when review/coherence finds source-shape,
      deslop, over-split, fake-wrapper, or agent-navigation issues, or marked
      N/A with reason.
- [ ] Public API/runtime/product forks are routed to `slate-plan`, `plate-plan`,
      `major-task`, or owner, not patched blindly.
- [ ] Generated outputs are synced when source owners require it, or marked N/A.
- [ ] Browser proof is run for browser-visible app/docs/package behavior, or
      marked N/A with reason.
- [ ] Package/API checks and changeset decision are recorded when packages or
      exports changed, or marked N/A.
- [ ] Docs/examples/source-backed claim audit is run when docs/examples changed,
      or marked N/A.
- [ ] Agent-native review is run for `.agents/**`, skills, hooks, commands,
      prompts, or user-action tooling, or marked N/A.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Changed list is current and includes only this closure run.
- [ ] No dirty speculative half-patch remains: every packet is kept, reverted,
      quarantined, or routed.
- [ ] Clean pass count satisfies the required clean pass count.
- [ ] Output budget discipline is followed: broad scans are capped or written to
      artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands/artifacts named in this plan | pending |
| Workspace authority proof | pending | Record cwd/tool for every proof command | pending |
| Target map closure | pending | Record target files/surfaces and comparison basis | pending |
| PR/range diff artifact closure | pending | Record artifact paths for PR/range targets or N/A when target is current checkout | pending |
| No worktree closure | pending | Confirm no `git worktree`, detached sibling checkout, throwaway same-repo clone, or branch switch was used for closure proof | pending |
| Coherence audit closure | pending | Close stale fixes/docs/API/orphan/generated/boundary rows | pending |
| Focused proof after last patch | pending | Run focused proof or record N/A with reason | pending |
| Browser proof | pending | Capture Browser/route proof or record N/A/blocker | pending |
| Package/API proof | pending | Run package/type/export/source audit or record N/A | pending |
| Docs/generated-output proof | pending | Run docs/generated-output/source audit or record N/A | pending |
| Agent/rule/generated sync | pending | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | pending |
| Architecture cleanup | pending | Invoke `architecture-cleanup` for source-shape findings or record N/A | pending |
| Findings ledger closure | pending | Every accepted/rejected/routed finding has evidence | pending |
| Clean pass count | pending | Record consecutive clean passes after the last patch | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from current evidence | pending |
| Agent-native review | pending | Load `agent-native-reviewer` for agent/tooling changes or record N/A | pending |
| Autoreview | pending | Load `autoreview`, run selected target mode, fix/reject accepted findings, rerun after material fixes until clean | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | in_progress | created plan | target map |
| Target map | pending | | coherence audit |
| Coherence audit | pending | | focused proof |
| Focused proof | pending | | autoreview |
| Autoreview and finding verification | pending | | patch/reject/route |
| Patch/reject/route | pending | | rerun proof |
| Architecture/docs/API/generated-output closure | pending | | clean pass |
| Clean pass confirmation | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Target map:
| Surface | Files / refs | Owner | Required proof | Status |
|---------|--------------|-------|----------------|--------|
| pending | pending | pending | pending | pending |

Findings ledger:
| Id | Source | Finding | Decision | Files / owner | Proof after decision |
|----|--------|---------|----------|---------------|----------------------|
| pending | pending | pending | pending | pending | pending |

Proof ledger:
| Surface | Command / audit | Cwd | Result | Follow-up |
|---------|-----------------|-----|--------|-----------|
| pending | pending | pending | pending | pending |

Diff artifact ledger:
| Target | Metadata JSON | Name-only file list | Patch artifact | Current-checkout status |
|--------|---------------|---------------------|----------------|-------------------------|
| pending | pending | pending | pending | pending |

Clean pass ledger:
| Pass | After patch loop | Autoreview result | Proof result | Accepted findings left | Clean? |
|------|------------------|-------------------|--------------|------------------------|--------|
| pending | pending | pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/proof | pending |
| docs/examples | pending |
| generated outputs | pending |
| skills/workflow | pending |
| reverted/quarantined/routed packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Stopping checkpoints:
| Id | Question / decision | Why it matters | Continued work | Recommendation | Anchor |
|----|---------------------|----------------|----------------|----------------|--------|
| pending | pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- Goal plan: pending
- Closure target and comparison basis: pending
- PR/range diff artifacts: pending
- Loop count and clean pass count: pending
- Accepted findings fixed: pending
- Findings rejected/routed: pending
- Commands run with cwd: pending
- Autoreview result and rerun count: pending
- Architecture-cleanup result: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints: pending
- Residual risks and next owner: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Target map, coherence audit, proof, autoreview, clean pass |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
