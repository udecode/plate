# slate automation overnight loop audit

Objective:
Design slate-automation gap audit; done when Slate skills are scanned and overnight-loop gaps plus target skill contract are listed; plan docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md.

Goal plan:
docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: chat request + skill-stack audit
- id / link: current thread request
- title: Slate automation overnight loop
- decision to make: what the missing supervisor skill must own before creating `slate-automation`
- decision criteria: catches behavior/perf/API/testing/visual/workflow regressions; repairs missing tests, metrics, and skills; uses specialists without user micro-routing; asks at most one high-leverage grill question per loop.

Major lane:
- lane: agent workflow architecture
- output type: private gap audit + target skill contract
- implementation expected: not in this audit pass; next pass can create `.agents/rules/slate-automation.mdc`
- affected packages / surfaces: `.agents/rules/slate-ar*.mdc`, `.agents/rules/slate-patch.mdc`, `.agents/rules/slate-plan.mdc`, generated `.agents/skills/**`, benchmark target registry, Browser/Playwright proof policy
- dominant risk: making another wrapper that hides responsibility instead of supervising, repairing, and escalating with evidence.

Completion threshold:
- All current Slate AR/Patch/Plan skill roles are scanned from `.agents/rules/**`.
- The weaknesses of the 8h loop are listed as concrete missing responsibilities.
- The target `slate-automation` contract is described clearly enough to implement next.
- Exactly one unresolved grill question is surfaced when user judgment affects automation authority.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md`
  passes.

Verification surface:
- Source audit of `.agents/rules/slate-ar*.mdc`, `.agents/rules/slate-patch.mdc`, `.agents/rules/slate-plan.mdc`, `.agents/rules/grill-me.mdc`.
- Memory audit for prior Slate AR wrapper boundaries.
- This plan plus final chat handoff.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: `.agents/rules/**`; generated `.agents/skills/**/SKILL.md` are mirrors.
- Allowed edit scope: this plan only during the audit pass.
- External sources: N/A; repo skill policy is sufficient for this design pass.
- Browser surface: N/A for the audit; the target skill must require Browser/Playwright/screenshot proof when a UI/editor surface is in scope.
- Tracker sync: N/A.
- Non-goals: do not create or patch `slate-automation` in this audit pass; do not commit.

Output budget strategy:
- Use `rg --files`, focused `rg -n`, `wc -l`, and short `sed` reads. Avoid full dumps of `slate-plan` except already-pasted user context. Cap command output and summarize.

Blocked condition:
- Block only if the user wants `slate-automation` to mutate skill rules automatically but does not authorize that authority boundary.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: done
- next_phase: create slate-automation skill after user confirms authority boundary
- goal_status: complete

Current verdict:
- verdict: create `slate-automation` as an overnight supervisor, not another one-off AR wrapper
- confidence: high
- next owner: user boundary answer, then agent-native skill patch
- reason: current skills have strong specialists but no loop owner for cadence, missing-proof repair, visual parity, skill repair, and keep/revert discipline.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Used as the audit template through autogoal helper. |
| Active goal checked or created | yes | `get_goal` returned none; created short audit goal. |
| Source of truth read before analysis | yes | Read `.agents/rules/slate-ar*.mdc`, `.agents/rules/slate-patch.mdc`, `.agents/rules/grill-me.mdc`; user pasted `autogoal` and `slate-plan`. |
| Major lane selected | yes | Agent workflow architecture. |
| Decision criteria stated | yes | See Major source. |
| Existing repo patterns / prior decisions checked | yes | Memory `MEMORY.md` Slate AR wrapper boundary notes plus current rule sources. |
| Helper stack selected | yes | Autogoal for lifecycle; Slate skills as scanned owners; grill-me for one question per loop. |
| External research decision recorded | no | N/A: internal skill contract audit only. |
| Implementation expectation recorded | yes | No implementation in this pass; next pass creates source rule and syncs mirrors. |
| Workspace authority selected | yes | `plate-2` `.agents/rules/**` owns skill source; `.tmp/slate-v2` owns runtime proof in future loops. |
| Branch / PR expectation decided | no | N/A: no commit/PR requested. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Agent-native pack selected | yes | Applied `agent-native`. |
| Agent-facing action surface identified | yes | Future `slate-automation` skill entrypoint. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install` to regenerate skills. |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A: no agent rule changed in this audit pass. |

Work Checklist:
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: no rule edit in audit pass.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. N/A: no rule edit in audit pass.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A: no rule edit in audit pass.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. N/A: no rule edit in audit pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Skill source audit completed and final handoff lists gaps/target contract. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Current owner map recorded in Findings. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Criteria closed in Findings and Decisions. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Options recorded in Decisions. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Slate-plan/grill-me pressure applied from pasted skills; no external review needed for audit-only pass. |
| Review findings closure | no | Fix or explicitly reject accepted/actionable findings and record closure proof | N/A: no reviewer findings in audit-only pass. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: internal skill audit only. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no implementation/rule change in audit pass. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final response includes private gap list and one grill question. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: only markdown plan artifact changed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used focused `rg`, `wc`, and `sed` with caps. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md` | Passed after repairing the missing evidence row. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no `.agents/rules/**` edit in audit pass. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Future skill should live at `.agents/rules/slate-automation.mdc` and generate `.agents/skills/slate-automation/SKILL.md`. |
| Agent-native review | no | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | N/A: no agent rule changed yet. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read current Slate skill rules and memory boundary notes | complete |
| Current-state map | complete | mapped specialist ownership and missing supervisor responsibilities | complete |
| Options and recommendation | complete | chose `slate-automation` supervisor over patching existing single-purpose wrappers | complete |
| Review / pressure pass | complete | applied slate-plan/grill-me pressure: one question per loop, not questionnaire upfront | complete |
| Implementation or plan artifact | complete | plan artifact only; no skill created yet | complete |
| Verification | complete | source audit and final handoff prepared | closeout |
| Closeout | complete | final answer pending | final response |

Findings:
- Current skills are specialists, not an overnight supervisor:
  - `slate-ar-perfect` routes broad improvement but lacks a strict packet cadence, keep/revert loop, visual parity policy, and self-repair of missing proof/skills.
  - `slate-ar-next` picks one next step; it explicitly stops after one safe step unless a durable loop is requested.
  - `slate-ar-fast` owns fastest-safe perf, but it is metric-first and does not own visual/human editor parity beyond correctness checks.
  - `slate-ar-stabilize` owns behavior stability through existing gates and `slate-patch`, but does not proactively design "act like a human" screenshot/browser scenarios.
  - `slate-ar-gate` repeats existing gates; it does not design missing oracles, screenshots, or correctness fixes.
  - `slate-ar-quality` finds quality gaps, but accepted findings are routed rather than automatically converted into a closed implementation/test/API loop.
  - `slate-patch` is strong for a reproduced bug and one implementation slice; it is not a multi-day scheduler.
  - `slate-plan` is strong for architecture/API decisions, but its planning/execution boundary is too heavyweight to drive every overnight microdecision.
  - `slate-ar-ship` is end-of-work readiness, not discovery/stabilization/perf.
- Missing perfect-loop responsibilities:
  - run cadence: `status -> gap scan -> behavior gate -> missing oracle repair -> benchmark -> patch one hot lane -> verify -> keep/revert -> log -> reassess`;
  - automated repair: when a loop misses an expected proof, metric, Browser check, or skill behavior, patch the owning source rule/template instead of only fixing the current runtime bug;
  - visual parity: require screenshots, Browser spot checks, or Playwright visual/geometry assertions for layout/selection shifts, blank windows, overlap, and rendered state drift;
  - human editor journeys: click, type, Enter, undo/redo, drag, double-click, copy/paste, scroll away/back, select-all, IME/mobile where relevant;
  - missing metric creation: if a benchmark target or METRIC line is missing, create/update it before optimizing;
  - missing oracle creation: if a behavior claim lacks Playwright/unit/browser proof, route to `slate-patch`/`tdd` before perf;
  - API repair: if repeated bugs point to bad public/internal API shape, route to `slate-plan` or make an allowed architecture change with explicit proof;
  - skill repair: if the automation itself chooses wrong, patch `.agents/rules/<owner>.mdc`, run `pnpm install`, and verify generated mirrors;
  - artifact hygiene: distinguish review-unit code from Autoresearch/session artifacts throughout, not just at ship time;
  - stop/switch rules: two no-gain packets switch bottleneck, two same-signal behavior failures route to patch, unsafe debounce wins are rejected, public API uncertainty triggers a grill question.

Decisions and tradeoffs:
- Recommendation: create `slate-automation` as the overnight supervisor skill.
- Rejected: patch only `slate-ar-perfect`. It is already the broad surface loop, but making it own skill repair, vision proof, and 100h unattended scheduling would bloat a useful operator shortcut.
- Rejected: make `slate-ar-next` long-running. Its value is one safe step and owner choice; overnight automation needs a durable scheduler.
- Rejected: make `slate-ar-fast` smarter. Perf should stay a specialist; otherwise correctness and API cleanup become subordinate to metrics.
- Tradeoff: `slate-automation` must be allowed to mutate skill rules when the loop itself is broken, or it cannot repair missed workflow criteria. That needs a user-approved authority boundary.

Implementation notes:
- Target source file for the next pass: `.agents/rules/slate-automation.mdc`.
- After creating the rule, run `pnpm install` to generate `.agents/skills/slate-automation/SKILL.md`.
- The skill should use `autogoal`, `slate-ar-status`, `slate-ar-quality`, `slate-ar-stabilize`, `slate-ar-gate`, `slate-patch`, `slate-ar-fast`, `slate-plan`, `slate-ar-ship`, `grill-me`, Browser, and Playwright as routed owners.
- It should ask at most one grill question per loop and only when code/source exploration cannot answer the decision.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Goal-plan checker failed because the self-referential `Goal plan complete` row had no evidence. | 1 | Fill the row with the failure/repair evidence and rerun the checker. | Resolved; rerun passed. |

Verification evidence:
- `rg --files .agents/skills | rg '(^|/)slate|(^|/)autogoal|(^|/)grill-me'` listed current Slate/goal/grill skills.
- `rg --files .agents/rules | rg 'slate-ar|slate-plan|slate-patch|slate-automation|autogoal|grill'` identified source rule owners.
- Focused `sed` reads covered `slate-ar`, `slate-ar-perfect`, `slate-ar-next`, `slate-ar-fast`, `slate-ar-stabilize`, `slate-ar-gate`, `slate-ar-perf`, `slate-ar-quality`, `slate-ar-recipe`, `slate-ar-ship`, and `slate-patch`.
- User pasted current `autogoal`, `grill-me`, and `slate-plan` skill bodies.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-overnight-loop-audit.md` passed.

Final handoff contract:
- Recommendation: create `slate-automation` next with explicit authority to supervise, repair, and escalate.
- Confidence: high.
- Evidence: source skill audit plus memory boundary note.
- Tests / commands: source audit only in this pass; next pass needs generated-skill sync proof.
- Browser proof: N/A for audit; required by the target skill when UI/editor behavior is touched.
- PR / tracker: N/A.
- Caveats: one user boundary remains: whether automation may patch skill rules automatically.
- Next owner: answer one grill question, then patch `.agents/rules/slate-automation.mdc`.

Timeline:
- 2026-06-03T10:42:04.671Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response, then optional `slate-automation` implementation |
| What is the goal? | List the weaknesses/gaps before creating the skill |
| What have I learned? | Existing skills need a supervisor that owns cadence, proof repair, visual parity, and skill repair |
| What have I done? | Created goal/plan and audited source skill rules |

Open risks:
- If `slate-automation` cannot patch skill rules, it can still supervise runtime work but cannot repair future workflow misses by itself.
