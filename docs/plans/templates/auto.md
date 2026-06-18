# {{TITLE}}

Objective:
TODO: Write the short auto objective, under 240 characters. Put the full automation contract below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

Applied packs:
- none

Automation source:
- type: pending
- prompt / link: pending
- lane: pending
- surface / route / package: pending
- invocation mode: pending
- minimum runtime / deadline: pending
- completion threshold summary: pending

Completion threshold:
- TODO: Define the exact checkpoint done state.
- Closure is legal only when this checkpoint's source-of-truth rows, proof
  commands, changed list, review-attention rows, stopping checkpoints, workflow
  slowdowns, and final handoff contract are complete or N/A with evidence, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the commands, source audits, browser proof, package proof, or
  artifacts proving this checkpoint.

Constraints:
- Copy every explicit user requirement into this plan before implementation.
- Keep this checkpoint scoped; do not silently start the next checkpoint.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create PRs, commits, pushes, release claims, compatibility aliases, or
  runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Browser surfaces: pending
- Package/API surfaces: pending
- Agent/skill surfaces: pending
- Docs/research surfaces: pending
- Non-goals: pending

Output budget strategy:
- TODO: Record how command/search output will be scoped, capped, counted, or
  written as artifacts before broad exploration.

Blocked condition:
- TODO: Name the authority, missing source, failed command, unsafe API fork, or
  taste gap that stops autonomous work.

Automation state:
- lane: pending
- surface: pending
- mode: pending
- minimum_runtime: pending
- target_deadline: pending
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: auto
- keep / revert / quarantine call: pending
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule |
|------------|-------|--------|----------|----------------------|
| checkpoint-zero | auto | in_progress | P0 | Requirements copied and source/vision read. |
| status | auto | pending | P0 | Current state recorded. |
| implementation | auto | pending | P0 | Scoped checkpoint change applied. |
| verification | auto | pending | P0 | Named proof commands pass or blocker recorded. |
| final-handoff | auto | pending | P0 | Handoff ledgers complete. |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `auto` source rule read or fallback recorded | pending | pending |
| `vision` read as checkpoint zero | pending | pending |
| Active goal checked or created | pending | pending |
| Lane resolved | pending | pending |
| Invocation mode and timebox recorded | pending | pending |
| Source of truth and allowed workspaces recorded | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint requirement extraction is complete.
- [ ] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Lane and owning workspace/package/app proof are named.
- [ ] Checkpoint supervisor table has been reconciled after the seed.
- [ ] Each loop ends with a checkpoint mutation decision.
- [ ] Packet ledger contains one row per changed/proof packet.
- [ ] Changed list is current and includes only this checkpoint.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Workflow slowdowns are logged or marked none.
- [ ] Output budget discipline is followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run proof commands/artifacts named in this plan | pending |
| Dynamic checkpoint reconciliation | pending | Prove the plan was updated from evidence | pending |
| Workspace authority proof | pending | Record cwd/tool for every proof command | pending |
| Final lint/check | pending | Run scoped or root checks named by the checkpoint | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from current evidence | pending |
| Workflow slowdown review | pending | Log slow steps or N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | in_progress | created plan | status |
| Status and source read | pending | | implementation |
| Implementation | pending | | verification |
| Verification | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------|----------|------|
| pending | pending | pending | pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| pending | pending | pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/oracles/browser proof | pending |
| benchmarks/metrics/targets | pending |
| examples/docs | pending |
| skills/workflow | pending |
| reverted/quarantined packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| pending | pending | pending | pending | pending | pending | pending | pending |

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
- Lane: pending
- Surface and route/package: pending
- Invocation mode and checkpoint count: pending
- Proof: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints to unblock: pending
- Residual risks: pending
- Next owner: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Status, implementation, verification, final handoff |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Auto goal plan created.

Open risks:
- Pending.
