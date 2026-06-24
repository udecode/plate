# codebase architecture improvement

Objective:
Make `$improve-codebase-architecture` a real repo-local architecture candidate
finder and wire the surrounding supervisors to call it at the right time.

Goal plan:
docs/plans/2026-06-16-codebase-architecture-improvement.md

Template:
docs/plans/templates/major-task.md

Major source:
- type: user routing decision
- id / link: `$improve-codebase-architecture`
- title: Architecture improvement owner topology
- decision to make: Should architecture improvement live inside
  `plite-auto`, `maintainer`, `major-task`, or `plite-ar`, or exist as its own
  candidate-finding pass?
- decision criteria:
  - Do not bloat `plite-auto` into a generic architecture worker.
  - Keep `maintainer` as public queue control plane.
  - Keep `major-task` as decision and implementation-plan owner.
  - Keep `plite-ar` as measured packet/autoresearch owner.
  - Make explicit architecture improvement invocations discoverable.
  - Avoid external lock-managed skills when repo-local routing needs local
    source-rule ownership.

Major lane:
- lane: architecture / agent-skill topology
- output type: local skill source rule plus routing patches
- implementation expected: yes
- affected surfaces: `.agents/rules/**`, `.agents/AGENTS.md`, generated
  `.agents/skills/**`, root `AGENTS.md`, `docs/vision/common.md`,
  `skills-lock.json`
- dominant risk: wrapper skill overlap or generated/lock-managed ownership
  conflict

First checkpoint:
- Explicit prompt requirement: implement the chosen routing.
- Scope: `$improve-codebase-architecture`, `plite-auto`, `maintainer`,
  `major-task`, `plite-ar`.
- Non-goals: no runtime package refactor, no broad architecture audit, no PR,
  no commit.
- Deliverable: local source-owned skill plus routing rules.
- Verification: `pnpm install`, generated mirror audit, lock conflict audit,
  source-route audit, autogoal completion check.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed run requested.
- initial confidence score: N/A.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- `$improve-codebase-architecture` is source-owned by
  `.agents/rules/improve-codebase-architecture.mdc`.
- Generated mirror exists and points to that source rule.
- Lock-managed external skill conflict is removed.
- `major-task`, `plite-auto`, `maintainer`, and `plite-ar` have clear routing.
- `.agents/AGENTS.md`, root `AGENTS.md`, and `docs/vision/common.md` mention
  the durable owner.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-codebase-architecture-improvement.md`
  passes.

Verification surface:
- `/Users/zbeyens/git/plate-2`: `pnpm install`
- `/Users/zbeyens/git/plate-2`: generated mirror source audit
- `/Users/zbeyens/git/plate-2`: route reference audit
- `/Users/zbeyens/git/plate-2`: conflict-word audit for the imported external
  skill assumptions
- `/Users/zbeyens/git/plate-2`: autogoal completion check

Constraints:
- Edit source rules, not generated skill mirrors.
- Use the repo's `VISION.md` and `docs/vision/**` doctrine instead of the
  pasted external skill's `CONTEXT.md` / ADR assumptions.
- Keep the new skill a candidate finder, not a broad refactor executor.
- Do not keep the external skill's temp-HTML-first flow as default.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`,
  `docs/vision/common.md`.
- Allowed edit scope: agent rules/guidance and this plan.
- External sources: N/A.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: package/runtime code, docs-site content, branch/PR/commit.

Output budget strategy:
- Read only source-rule slices and route audits. Do not stream broad repo
  architecture scans because this pass is topology repair, not the actual
  architecture audit.

Blocked condition:
- Block only if Skiller cannot make the local rule source-owned.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: implemented
- confidence: high
- next owner: `improve-codebase-architecture` for future architecture candidate
  finding
- reason: The skill has distinct ownership: source-backed candidate discovery
  before `major-task` / `plite-plan` / `plate-plan` implementation planning.

Completion rule:
- Do not call `update_goal(status: complete)` until
  `check-complete.mjs` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured in First checkpoint. |
| Timed checkpoint parsed | yes | N/A: no timed run requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` and source rule slices. |
| Active goal checked or created | yes | Existing autogoal reused for this topology repair. |
| Source of truth read before analysis | yes | Read `.agents/rules/*` owners, `.agents/AGENTS.md`, `VISION.md`, and `docs/vision/common.md`. |
| Major lane selected | yes | Architecture / agent-skill topology. |
| Decision criteria stated | yes | See Major source. |
| Existing repo patterns / prior decisions checked | yes | Followed source-rule-only and `pnpm install` mirror workflow. |
| Helper stack selected | yes | `major-task`, `architecture-strategist`, `skill-creator`, `autogoal`, agent-native review lens. |
| External research decision recorded | yes | N/A: local repo evidence settled ownership. |
| Implementation expectation recorded | yes | Source-rule routing patch. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | yes | N/A: no PR/commit requested. |
| Output budget strategy recorded | yes | Capped source-rule reads and route audits. |
| Agent-native pack selected | yes | `.agents/**` changed. |
| Agent-facing action surface identified | yes | Skill discovery and supervisor routing. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`; generated mirrors synced by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read agent-native reviewer; used its discoverability/action-parity lens for route audit. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run sync and route audits | `pnpm install`; route audits below. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Found external lock-managed conflict; resolved to local source rule. |
| Decision criteria closure | yes | Mark each criterion satisfied | Routing preserves each owner boundary. |
| Options / tradeoffs / rejection record | yes | Record viable options and why alternatives lose | See Decisions. |
| Review / pressure pass | yes | Agent-native/source-rule lens | Generated mirror and route discoverability audited. |
| Review findings closure | yes | Fix accepted findings | Lock-managed conflict removed through Skiller. |
| External-source audit | yes | Record N/A | N/A: local source and pasted skill text were enough. |
| Implementation gates | yes | Close source/generated sync | `pnpm install` passed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | See final handoff. |
| Final lint | yes | Scoped equivalent for docs/rules | `pnpm install` plus source audits; no code lint needed. |
| Output budget discipline | yes | Verify no broad architecture scan was streamed | Used capped rule and route audits. |
| Timed checkpoint | yes | N/A | No duration requested. |
| Goal plan complete | yes | Run `check-complete.mjs` | To be run after this edit. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Passed. |
| Agent action discoverability | yes | Source-audit skill/rule path an agent will read | `rg -n "improve-codebase-architecture" ...` found source/generated routes. |
| Agent-native review | yes | Load reviewer and close findings | Loaded reviewer; route discoverability and source/generator parity passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read owner skill/rule context | topology patch |
| Current-state map | complete | External lock conflict found | remove lock owner |
| Options and recommendation | complete | Standalone candidate finder wins | patch routes |
| Review / pressure pass | complete | Agent-native route audit | verification |
| Implementation or plan artifact | complete | Source rule plus routing patches | closeout |
| Verification | complete | `pnpm install`; audits | final response |
| Closeout | complete | plan updated | final response |

Findings:
- Fact: `improve-codebase-architecture` existed as a lock-managed external
  skill, not a local source rule.
- Inference: keeping that copy would make repo-specific routing unmaintainable
  and conflict with source-rule generation.
- Recommendation: remove the external lock-managed skill and replace it with a
  repo-local source rule.

Decisions and tradeoffs:
- Accepted: standalone `improve-codebase-architecture` skill.
- Rejected: merge into `plite-auto`; it would bloat the Plite quality
  supervisor.
- Rejected: merge into `maintainer`; it would turn public queue routing into
  generic architecture execution.
- Rejected: merge into `plite-ar`; AR owns measured packet state, not
  architecture candidate discovery.
- Accepted: `major-task` owns accepted decision/implementation planning after
  this candidate-finding pass.

Implementation notes:
- Added `.agents/rules/improve-codebase-architecture.mdc`.
- Patched `.agents/rules/major-task.mdc` to invoke it before broad architecture
  refactor planning.
- Patched `.agents/rules/slate-auto.mdc` to invoke it opportunistically when
  repeated Plite loops prove broader architecture friction.
- Patched `.agents/rules/maintainer.mdc` to route public cross-package
  architecture/testability candidates to it.
- Patched `.agents/rules/slate-ar.mdc` to explicitly not own the pass.
- Patched `.agents/AGENTS.md`, generated root `AGENTS.md`, and
  `docs/vision/common.md`.
- Removed the lock-managed external copy with
  `bun x skiller@latest remove improve-codebase-architecture -y`.

Review fixes:
- First `pnpm install` failed because the new local rule conflicted with
  `skills-lock.json`. Fixed by removing the external lock-managed skill via
  Skiller, then reran `pnpm install`.
- The new local skill deliberately drops external assumptions: no required
  `CONTEXT.md`, no docs/ADR dependency, and no temp HTML as default output.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` failed on local rule versus lock-managed skill conflict | 1 | Remove lock-managed external skill through Skiller | Resolved; second `pnpm install` passed. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `bun x skiller@latest remove improve-codebase-architecture -y`
- `/Users/zbeyens/git/plate-2`: `pnpm install`
- `/Users/zbeyens/git/plate-2`: `sed -n '1,260p' .agents/skills/improve-codebase-architecture/SKILL.md`
- `/Users/zbeyens/git/plate-2`: `rg -n "improve-codebase-architecture" .agents/rules .agents/skills .agents/AGENTS.md AGENTS.md docs/vision/common.md skills-lock.json skiller-lock.json`
- `/Users/zbeyens/git/plate-2`: `find .agents/skills/improve-codebase-architecture -maxdepth 2 -type f -print`
- `/Users/zbeyens/git/plate-2`: external-assumption audit over the local source
  rule and generated mirror.

Final handoff contract:
- Recommendation: use `$improve-codebase-architecture` as the standalone
  architecture candidate finder.
- Confidence: high.
- Evidence: source rule exists, generated mirror points to it, route references
  exist in the four named owners and repo AGENTS files, lock conflict removed.
- Tests / commands: see Verification evidence.
- Browser proof: N/A.
- PR / tracker: N/A.
- Caveats: this installs the workflow owner; it does not run a full architecture
  candidate review yet.
- Next owner: invoke `$improve-codebase-architecture <surface>` directly, or let
  `plite-auto` / `maintainer` call it when they detect the right signal.

Timeline:
- 2026-06-16T21:28:40.365Z Original major-task goal plan created.
- 2026-06-16T21:43Z User clarified topology target.
- 2026-06-16T21:44Z Local source rule and routing patches added.
- 2026-06-16T21:45Z First `pnpm install` exposed lock-managed conflict.
- 2026-06-16T21:46Z External lock-managed skill removed through Skiller.
- 2026-06-16T21:47Z `pnpm install` passed and generated mirrors synced.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Make `$improve-codebase-architecture` source-owned and routed correctly. |
| What have I learned? | External copy conflicted with local source ownership; standalone candidate finder is the clean topology. |
| What have I done? | Added source rule, routed owners, removed lock-managed copy, synced mirrors. |

Open risks:
- None blocking. Future improvement: run the new skill on a real surface and
  refine the candidate table from that first validation run.
