# openclaw slate loop analysis

Objective:
Analyze OpenClaw workflow for Slate skill topology; done when source-backed setup recommendation is delivered; plan docs/plans/2026-06-16-openclaw-slate-loop-analysis.md.

Goal plan:
docs/plans/2026-06-16-openclaw-slate-loop-analysis.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: local source audit plus user-provided OpenClaw workflow notes
- id / link: /Users/zbeyens/git/openclaw/* and author tweets pasted in prompt
- title: OpenClaw-style repository maintenance loops for Slate v2 skills
- decision to make: improve `slate-auto` or create a new skill stack that matches OpenClaw workflow without cloud automation
- decision criteria: closest useful match to OpenClaw, no infinite compute assumption, one-skill automation ready later, clear maintenance/self-improvement boundaries, no crabbox overkill

Major lane:
- lane: agent workflow architecture
- output type: recommendation, topology, lane boundaries, first patch target
- implementation expected: no source patch in this pass; propose patch set only
- affected packages / surfaces: `.agents/rules/slate-auto.mdc`, possible new `.agents/rules/slate-maintainer.mdc`, `docs/plans/templates/*`, OpenClaw skill sync workflow
- dominant risk: copying OpenClaw ceremony without preserving Slate-specific proof quality

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Deliver a source-backed recommendation that names: OpenClaw patterns to copy,
  patterns to reject, whether to patch `slate-auto` or create a new skill,
  final skill topology, lane routing, sync process, first implementation step,
  and residual risks.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-slate-loop-analysis.md`
  passes.

Verification surface:
- Local audit of cloned OpenClaw repos with root `VISION.md`, especially
  `.agents/skills/**/SKILL.md`, plus current `autogoal` and `slate-auto`
  source. Final answer separates facts, inference, and recommendation.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: local clones under `/Users/zbeyens/git/openclaw` and current
  Slate skills under `/Users/zbeyens/git/plate-2/.agents/skills`.
- Allowed edit scope: this plan file only.
- External sources: user-pasted tweets and local cloned repos; no live web
  browsing needed unless local clones are insufficient.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: do not patch Slate skills yet; do not set up cloud automation;
  do not copy crabbox wholesale; do not claim infinite compute.

Output budget strategy:
- Use `rg --files` / targeted `sed` slices for OpenClaw skill files. Avoid
  streaming large repo diffs or generated output. Read only workflow-relevant
  skill docs and scripts.

Blocked condition:
- Block only if local OpenClaw skills are missing or unreadable. Otherwise
  recommend from source evidence and clearly mark inference.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: in_progress
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: create a new `slate-maintainer` control-plane skill; keep `slate-auto` as internal quality executor
- confidence: high
- next owner: user decision to patch skills
- reason: OpenClaw separates queue orchestration from implementation/proof workers; `slate-auto` is already the implementation/proof supervisor

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-slate-loop-analysis.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied into this plan before OpenClaw source audit. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned no goal; `create_goal` created active goal. |
| Source of truth read before analysis | yes | Current `autogoal` and `slate-auto` read from prompt and local file; OpenClaw skill audit next. |
| Major lane selected | yes | Agent workflow architecture. |
| Decision criteria stated | yes | Closest useful OpenClaw match, finite compute, one-skill future automation, clean lane boundaries. |
| Existing repo patterns / prior decisions checked | yes | Current `slate-auto` source and user prompt boundaries captured. |
| Helper stack selected | yes | Local `rg`, `sed`, targeted OpenClaw skill reads; no broad diff streaming. |
| External research decision recorded | yes | Use local cloned OpenClaw repos and pasted tweet notes; no live web unless insufficient. |
| Implementation expectation recorded | yes | No skill/source patch in this pass; recommendation only. |
| Workspace authority selected | yes | `/Users/zbeyens/git/openclaw` for OpenClaw; `/Users/zbeyens/git/plate-2` for Slate skills. |
| Branch / PR expectation decided | no | N/A: no commit, branch, push, or PR requested. |
| Output budget strategy recorded | yes | Targeted skill reads only; cap outputs. |
| Agent-native pack selected | yes | Applied because recommendation affects skills/agent action surfaces. |
| Agent-facing action surface identified | yes | `slate-auto` plus likely new maintenance skill. |
| Source rule versus generated mirror boundary identified | yes | Future edits should target `.agents/rules/*.mdc`, not generated `SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A: no agent source changed in this pass; use if patching follows. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Explicit requirements captured: analyze OpenClaw workflow, improve
      `slate-auto` or create new skill, closest possible workflow match, finite
      compute only, no cloud/automation runtime yet, future one-skill
      automation-compatible, crabbox likely overkill, lanes include maintenance
      and self-improving repo work, regular OpenClaw pulls as main reference,
      clone more dependencies only if needed, suggest ultimate setup synced with
      OpenClaw, no skill/source patch in this pass.
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A this pass: no source edits.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. N/A this pass: no source edits.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A this pass: no source edits.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. N/A this pass: no source edits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Source audit complete; recommendation recorded in Findings/Decisions. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Audited `slate-auto`, `vision`, `resolve-slate-issue`, `clawsweeper`, `issue-harvester`, `orchestrator`. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Criteria closed in Decisions and tradeoffs. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Options recorded below. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Self pressure pass: OpenClaw fit, finite compute, future one-skill automation, Slate proof quality. |
| Review findings closure | no | Fix or explicitly reject accepted/actionable findings and record closure proof | N/A: no code/source review findings because no source patch. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Used local clones `/Users/zbeyens/git/openclaw` and `/Users/zbeyens/git/agent-scripts`; no live web needed. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no skill/runtime source patch in this pass. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final answer will include recommendation, evidence, caveats, next patch target. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: only goal plan changed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used targeted `sed`/`rg`; one skill-summary grep was broad but capped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-slate-loop-analysis.md` | First run found only closeout bookkeeping gaps; rerun after this update. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no `.agents/rules/**` source changed. |
| Agent action discoverability | no | Source-audit the skill/rule path an agent will read | N/A: proposed action only. |
| Agent-native review | no | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | N/A: no agent source changed; required for the follow-up patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read current Slate skills, OpenClaw VISION, OpenClaw taskflow/coding-agent, agent-scripts maintainer/triage/review skills. | current-state map |
| Current-state map | complete | Slate has internal quality/execution owners but no OpenClaw-style maintainer queue control plane. | options |
| Options and recommendation | complete | Recommend new `slate-maintainer` plus small `slate-auto` routing patch later. | review |
| Review / pressure pass | complete | Pressure-tested against finite compute, future single-skill automation, crabbox rejection, lane boundaries. | implementation decision |
| Implementation or plan artifact | complete | Analysis plan plus final recommendation only; no source implementation. | verification |
| Verification | complete | Local source audit is the verification surface. | closeout |
| Closeout | complete | Final handoff contract recorded; final response next. | final response |

Findings:
- Fact: OpenClaw `maintainer-orchestrator` is a control-plane skill. It maps queues, classifies autonomous vs owner-needed work, delegates repository work, monitors workers every five minutes, and asks only decision-ready owner questions.
- Fact: OpenClaw `github-project-triage` reads `VISION.md` before judging autonomous fit, outputs URL-first item cards, and separates autonomous candidates, owner decisions, and defer/close work.
- Fact: OpenClaw `openclaw-pr-maintainer` uses archive-first discovery, author trust/activity, small high-confidence candidate gates, exact repro/root-cause/proof requirements, and autoreview before landing.
- Fact: OpenClaw `taskflow` and `coding-agent` assume background workers and durable flow state; this is useful architecture, but not directly available in current Slate skill-only setup.
- Fact: Current `slate-auto` owns internal Slate v2 quality loops: behavior, visual proof, perf, API cleanup, issue-harvest delegation, skill repair, and handoff ledgers.
- Fact: Current `clawsweeper` already imports ClawSweeper-style issue provenance and small-fix discipline, but it intentionally drops bot/app/automerge/dashboard machinery.
- Inference: The missing Slate layer is not another runtime/proof executor. It is a maintainer queue control plane around issues/PRs, VISION/north-star fit, author trust, permissions, and decision-ready PR/issue handoff.
- Inference: `vision` is close to `VISION.md` for internal taste, but a public/open-source maintainer workflow should eventually have a plain `VISION.md` or a skill rule that treats `vision` as the temporary equivalent.

Decisions and tradeoffs:
- Keep `slate-auto` focused on self-improving Slate v2 repo quality. Do not stuff GitHub public queue orchestration into it.
- Create a new `slate-maintainer` skill for OpenClaw-style issue/PR maintenance once patching is approved.
- Patch `slate-auto` later only to route maintainer/queue/PR prompts to `slate-maintainer`, and to call `slate-maintainer` when an internal loop produces a public issue/PR maintenance need.
- Reject `crabbox` as a copied dependency for now. Slate needs deterministic editor proof through `slate-browser`, Playwright, benchmarks, and package tests; crabbox-style live service automation is overkill until a real cloud/worker automation lane exists.
- Use OpenClaw as a reference sync source, but import patterns selectively: queue control, VISION fit, decision-ready briefs, proof gates, status ledgers, worker contracts. Do not import OpenClaw app labels, automerge, release bots, dashboard, or service-signup machinery.
- For a future one-skill automation, make the entrypoint `slate-maintainer heartbeat`, not `slate-auto`. The heartbeat can choose queue work first, then delegate to `slate-auto` when no maintainer queue item is safe.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Command: `sed -n` reads of current `autogoal`, `slate-auto`, `vision`, `resolve-slate-issue`, `clawsweeper`, `issue-harvester`, `orchestrator`, `major-task`.
- Command: cloned `/Users/zbeyens/git/agent-scripts` because the tweets named `maintainer-orchestrator` and `github-project-triage`.
- Command: `sed -n` reads of `/Users/zbeyens/git/agent-scripts/skills/maintainer-orchestrator/SKILL.md`, `github-project-triage/SKILL.md`, `github-deep-review/SKILL.md`, `github-author-context/SKILL.md`, `clawsweeper-status/SKILL.md`, `skill-cleaner/SKILL.md`.
- Command: `sed -n` reads of `/Users/zbeyens/git/openclaw/openclaw/VISION.md`, OpenClaw `taskflow`, `coding-agent`, `openclaw-pr-maintainer`, `autoreview`, and `openclaw-qa-testing` skills.

Final handoff contract:
- Recommendation: create `slate-maintainer`; keep `slate-auto` as internal quality executor.
- Confidence: high.
- Evidence: local source audit of OpenClaw and current Slate skill stack.
- Tests / commands: source audit only; no runtime tests needed for analysis.
- Browser proof: N/A.
- PR / tracker: N/A.
- Caveats: current runtime lacks cloud automation and durable background workers; future thread automation can emulate parts later.
- Next owner: patch `.agents/rules/slate-maintainer.mdc` plus routing updates after user approval.

Timeline:
- 2026-06-16T08:32:39.494Z Major-task goal plan created.
- 2026-06-16T08:35Z Requirement extraction completed before OpenClaw source audit.
- 2026-06-16T08:38Z Cloned `/Users/zbeyens/git/agent-scripts` as the tweet-referenced skill dependency.
- 2026-06-16T08:43Z Completed OpenClaw/current Slate skill source audit and topology recommendation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Final response |
| What is the goal? | Recommend the closest useful OpenClaw-style setup for Slate skills without patching sources yet |
| What have I learned? | Slate lacks a maintainer queue control plane; `slate-auto` should not absorb it |
| What have I done? | See Timeline |

Open risks:
- Need user approval before patching skills.
- Need decide whether to add a public `VISION.md` later or use `vision` as the internal fit gate until Slate v2 is split/public.
