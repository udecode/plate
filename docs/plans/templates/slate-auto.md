# {{TITLE}}

Objective:
TODO: Write the short slate-auto objective, under 240 characters. Put the
full automation contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Automation source:
- type: pending
- prompt / link: pending
- surface / route / package: pending
- invocation mode: pending
- minimum runtime / deadline: pending
- completion threshold summary: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact slate-auto done state.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the focused package tests, Playwright routes/greps, in-app Browser
  proof, source audits, benchmark metrics, mobile/raw-device proof, helper API
  checks, docs audit, skill sync, and final plan check that prove this run.

Constraints:
- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Browser surfaces: pending
- Package/API surfaces: pending
- Agent/skill surfaces: pending
- Docs/research surfaces: pending
- Non-goals: pending

Blocked condition:
- TODO: Name the authority, device, credential, unsafe API/runtime fork, missing
  source, repeated blocker, or taste gap that stops autonomous work.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: pending
- mode: pending
- minimum_runtime: pending
- target_deadline: pending
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: slate-auto
- keep / revert / quarantine call: pending
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

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | in_progress | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | seed |
| status | slate-auto | pending | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | seed |
| gap-scan | slate-auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| behavior-proof | slate-ar stabilize | pending | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | seed |
| oracle-repair | slate-patch / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| slate-browser-promotion | slate-browser | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | slate-auto | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | slate-ar stabilize | pending | P1 | Smoke huge-doc correctness without broad architecture work. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded. | seed |
| perf-packet | slate-ar perf | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| supervision-mode | slate-auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | slate-auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | slate-auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `slate-auto` source rule read | pending | pending |
| `vision` read as checkpoint zero | pending | pending |
| Active goal checked or created | pending | pending |
| Invocation mode and timebox recorded | pending | pending |
| Dynamic checkpoint policy accepted | pending | pending |
| Source of truth and allowed workspaces recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Private-alpha release/PR boundary recorded | pending | pending |
| Browser proof strategy recorded | pending | pending |
| Package/API proof strategy recorded | pending | pending |
| Mobile/raw-device claim-width policy recorded | pending | pending |
| Skill repair authority and source-rule boundary recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
- [ ] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [ ] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [ ] Current-tree/status packet recorded before new runtime patches.
- [ ] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [ ] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [ ] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [ ] Repeated browser proof patterns are promoted to `slate-browser` or queued
      with reason.
- [ ] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [ ] Huge-document correctness smoke is run or deferred with owner and reason.
- [ ] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [ ] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [ ] Docs/vision/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [ ] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [ ] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [ ] Changed list is current and includes only this run.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [ ] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [ ] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands/artifacts named in this plan | pending |
| Dynamic checkpoint reconciliation | pending | Prove the plan was updated from evidence and not frozen to the initial seed | pending |
| Workspace authority proof | pending | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | pending |
| Behavior gates | pending | Run focused stable behavior proof or record scoped defer rows | pending |
| Visual/native selection proof | pending | Record Browser/Playwright/native-selection evidence or scoped blocker | pending |
| Missing oracle repair | pending | Add/verify/revert/quarantine oracle packets or record owner defer | pending |
| `slate-browser` promotion | pending | Add/verify helper/API or record queue/defer reason | pending |
| Mobile/raw-device claim width | pending | Run raw-device proof or record that only scoped viewport/browser proof is available | pending |
| Huge-document correctness smoke | pending | Run focused huge-document behavior smoke or record owner defer | pending |
| Package/API proof | pending | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | pending |
| Skill/rule sync | pending | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from current packet evidence | pending |
| Final lint/check | pending | Run scoped lint/check or record why no code changed | pending |
| Workflow slowdown review | pending | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | Load `agent-native-reviewer` and close accepted findings, or N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | in_progress | created plan | status |
| Status and current-tree closure | pending | | gap scan |
| Gap scan and scenario matrix | pending | | behavior proof |
| Behavior proof | pending | | oracle repair |
| Oracle repair | pending | | visual proof |
| Visual/native proof | pending | | slate-browser promotion |
| slate-browser promotion | pending | | mobile claim width |
| Mobile/raw-device claim width | pending | | huge-document smoke |
| Huge-document correctness smoke | pending | | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | pending | | consolidation |
| Consolidation and review | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| pending | pending | pending | pending | pending | pending | pending | pending |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| pending | pending | pending | pending | pending | pending |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| pending | pending | pending | pending | pending | pending |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| pending | pending | pending | pending | pending |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| pending | pending | pending | pending | pending |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| pending | pending | pending | pending | pending |

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
- Surface and route/package: pending
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: pending
- Behavior gates and visual proof: pending
- Primary metric baseline/latest/best and stop reason: pending
- Bugs fixed and oracles added: pending
- Benchmark/skill/docs repairs: pending
- Workflow slowdowns and repairs: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints to unblock: pending
- Accepted deferrals and residual risks: pending
- Next owner: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Dynamic checkpoint loop through final handoff |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
