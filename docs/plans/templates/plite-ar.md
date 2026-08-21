# {{TITLE}}

Objective:
TODO: Write the short Plite AR objective, under 240 characters. Put the full
Autoresearch contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

Plite AR source:
- requested mode: pending
- surface / target / slug: pending
- target cwd: Plate repo root
- control cwd: Plate repo root
- minimum runtime / hard stop: pending
- completion threshold summary: pending

First checkpoint:
- Before implementation, packet execution, or broad exploration, copy every
  explicit prompt requirement into this plan as checkable rows: mode, surface,
  scope, non-goals, timing, stop conditions, deliverables, final handoff
  sections, verification surfaces, and success criteria.
- Conditional rows for unused Plite AR modes must be marked `N/A: <reason>`.
- Do not continue into packet execution until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Define the exact done state.
- Closure is legal only when required mode rows, Plite correctness gates,
  Autoresearch packet decisions, keep/revert/quarantine calls, final handoff
  rows, and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  are complete or N/A with evidence.

Verification surface:
- TODO: Name AR state commands, gate commands, benchmark targets, browser proof,
  package tests, source audits, finalization previews, or review commands that
  prove the threshold.

Constraints:
- Target Plite work runs from the Plate repo root against transplanted packages,
  docs, examples, browser specs, and benchmarks. Do not use a donor checkout as
  proof.
- Behavior correctness beats metric movement.
- A packet that breaks selection, input ordering, IME, copy, paste, undo,
  focus, cursor placement, or follow-up typing is `checks_failed` or `discard`,
  not `keep`.
- Performance, pagination, and virtualization benchmarking uses `benchmark`.
- Broad external discovery routes to `plite-research`.
- Architecture/API redesign routes to `plite-plan`.
- Concrete correctness failures or missing oracles route to `patch`.
- Do not create branches, commits, pushes, PRs, or review branches unless the
  user explicitly asks.

Boundaries:
- Allowed edit scope: pending
- Runtime/code scope: pending
- Docs/research scope: pending
- Skill/template scope: pending
- Browser surface: pending
- Non-goals: pending

Output budget strategy:
- TODO: Record how AR state, logs, broad searches, command output, and packet
  artifacts will be scoped, capped, summarized, or saved before broad reads.

Blocked condition:
- TODO: Name the missing target, command, device, browser route, source,
  authority, unsafe API fork, or repeated blocker that stops autonomous work.

Plite AR state:
- mode: pending
- current_phase: checkpoint-zero
- current_phase_status: in_progress
- next_phase: mode-dispatch
- current_packet: pending
- keep / revert / quarantine call: pending
- goal_status: active

Mode matrix:
| Mode | Applies | Owner | Evidence / exit rule |
|------|---------|-------|----------------------|
| status / dashboard | pending | slate-ar | Read-only AR state, operator checklist, and dashboard/export decision recorded. |
| continue / resume | pending | slate-ar | Existing session resumed or stale/missing session routed. |
| next | pending | slate-ar | Exactly one safe next step chosen and result recorded. |
| gate | pending | slate-ar | Existing command repeated/logged; repeated valid failure routes to `patch`. |
| stabilize | pending | slate-ar + patch | Behavior surface narrowed, oracle/gate/fix loop recorded, Benchmark blocked until green. |
| quality | pending | slate-ar | Accepted checklist slug executed or broad discovery routed to `plite-research`. |
| recipe | pending | slate-ar | Read-only recipe/setup-plan result recorded, or packet start explicitly accepted. |
| perfect | pending | slate-ar | Status, research/gap, behavior, oracle, Benchmark handoff when applicable, and final no-regression rows closed. |
| finalize preview | pending | slate-ar | Preview-only finalization/current-tree readiness recorded; no branches. |
| ship readiness | pending | slate-ar + P1 autoreview | Review unit, gates, timing rows, P1 autoreview, and approval boundary recorded. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `slate-ar` source rule read | pending | pending |
| Active goal checked or created | pending | pending |
| Mode selected and unused mode rows marked N/A | pending | pending |
| Target cwd and control cwd recorded | pending | pending |
| AR CLI resolved or unavailable blocker recorded | pending | pending |
| Existing AR session state read when relevant | pending | pending |
| Source of truth and edit scope recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Perf/research/plan/patch routing boundaries recorded | pending | pending |
| Commit/branch/PR boundary recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable rows before packet execution.
- [ ] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Mode matrix is resolved: exactly the active modes are `yes`; unused modes
      are checked as N/A with evidence.
- [ ] Target cwd/control cwd authority is recorded for every command.
- [ ] Read-only status commands are used before mutating packets when session
      state could be stale.
- [ ] Existing gates are repeated only when the command exists or is obvious.
- [ ] Missing oracles and repeated correctness failures are routed to
      `patch` or `tdd`, not spun in AR forever.
- [ ] Quality-gap execution starts from an accepted checklist; broad discovery
      is routed to `plite-research`.
- [ ] Recipe mode stays read-only unless packet execution was explicitly
      requested.
- [ ] Performance work is routed to `benchmark` and has correctness proof before
      a keep call.
- [ ] Finalization is preview-only unless review branches are explicitly
      requested in the current turn.
- [ ] Ship readiness records review unit, slow steps, gates, P1 autoreview, and
      mutation approval boundary.
- [ ] Every packet has a keep/revert/quarantine/checks-failed decision with
      evidence.
- [ ] Final handoff lists changed files, commands, packet decisions, metrics,
      residual risks, and next owner.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run or record the proof named in this plan | pending |
| AR state/status proof | pending | Run read-only state/operator-checklist commands or N/A | pending |
| Gate repeatability proof | pending | Run focused gate command(s), log pass/fail, or route failure | pending |
| Behavior correctness proof | pending | Record native/editor behavior proof or `patch` route | pending |
| Quality-gap proof | pending | Run quality-gap commands for accepted checklist or N/A | pending |
| Recipe/setup proof | pending | Record read-only recipe/setup-plan result or N/A | pending |
| Benchmark routing proof | pending | Route performance work to `benchmark` with scope and correctness contract or N/A | pending |
| Finalization/readiness proof | pending | Run preview/readiness/P1 autoreview proof or N/A | pending |
| Packet decision ledger | pending | Record keep/revert/quarantine/checks-failed rows | pending |
| Workspace authority proof | pending | Record cwd/tool for each command | pending |
| Skill/rule sync | pending | Run `pnpm install` when `.agents/rules/**` changed, otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | Load `agent-native-reviewer` and close accepted findings, or N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `autoreview`, pass `--max-priority P1`, and close accepted findings; use P2 or P3 only when explicitly requested, or N/A | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish current loop cleanly; otherwise N/A | pending |
| Final handoff contract | pending | Fill final handoff rows from current evidence | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | in_progress | created plan | mode dispatch |
| Mode dispatch | pending | | status |
| Status/session read | pending | | active mode |
| Active mode packet(s) | pending | | verification |
| Verification and packet decisions | pending | | review |
| Review / sync / finalization as needed | pending | | closeout |
| Closeout | pending | | final response |

Packet ledger:
| Packet | Mode | Hypothesis / command | Baseline / latest / best | Correctness proof | Decision | Next |
|--------|------|----------------------|--------------------------|-------------------|----------|------|
| pending | pending | pending | pending | pending | pending | pending |

Mode dispatch notes:
| Signal | Decision | Reason |
|--------|----------|--------|
| pending | pending | pending |

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
- Mode and surface: pending
- Target cwd/control cwd: pending
- AR state/dashboard: pending
- Packets/gates/quality/Benchmark/readiness actions: pending
- Metrics baseline/latest/best: pending
- Keep/revert/quarantine decisions: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints: pending
- Residual risks: pending
- Next owner: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Mode dispatch, packet work, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
