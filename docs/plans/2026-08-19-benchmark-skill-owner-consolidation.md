# benchmark skill owner consolidation

Objective:
Create the Benchmark skill and consolidate benchmark ownership; done when source/mirrors, routing, contract tests, and reviews pass; plan docs/plans/2026-08-19-benchmark-skill-owner-consolidation.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-benchmark-skill-owner-consolidation.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request in this thread
- id / link: N/A: no external tracker item
- title: Create an ordered, diagnosis-first Benchmark skill and cut overlap
- acceptance criteria: all applicable benchmark lanes are selected by default;
  lanes run in cheapest/highest-information order; a conclusive cause pauses
  later lanes; the loop fixes, reruns, and resumes; overlapping execution
  doctrine is removed from other skills.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary source, routing, generation, tests, and review gates apply
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.agents/rules/benchmark.mdc` is the sole benchmark diagnosis/execution loop
  owner and its generated `.agents` and `.claude` mirrors match the source.
- Default invocation discovers every applicable benchmark family, orders them
  for fastest causal information, and records deferred later lanes rather than
  silently dropping them.
- A mechanical contract proves that a conclusive cause pauses later lanes,
  forces fix plus exact-lane rerun, and resumes the first pending lane only
  after the fix is green.
- Plate current-vs-main, Plate-vs-Plite, Plite-vs-pinned-Slate, normal product
  mount/editing, example breadth, and large/stress lanes all have an owner in
  the ordered methodology.
- `performance`, `regression`, `slate-ar`, `auto`, and AGENTS routing retain
  only their non-overlapping responsibilities; stale benchmark execution
  ownership has zero source matches.
- Focused benchmark contract tests, `pnpm install`, source/mirror parity,
  agent-native review, P1 autoreview, final lint, and this plan checker pass.
- Repo-local skill/rule/template defaults use `--max-priority P1`; stale
  `--max-priority P2` workflow defaults have zero source matches.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-skill-owner-consolidation.md` passes.

Verification surface:
- `node --test .agents/rules/benchmark/scripts/*.test.mjs .agents/skills/benchmark/scripts/*.test.mjs`
- `pnpm install` plus `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`
- source audits across `.agents/AGENTS.md` and affected `.agents/rules/*.mdc`
  for one benchmark execution owner and no stale `slate-ar perf` route
- `python3 /Users/zbeyens/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/benchmark`
- agent-native review and P1 autoreview of the final local diff
- `pnpm lint:fix`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not create a second benchmark target registry or duplicate individual
  benchmark commands in the skill; discover current targets from source.
- Early stop is a diagnostic checkpoint, never permission to call the full
  benchmark goal complete.
- Correctness proof outranks metric improvement; a faster broken editor is a
  rejected fix.

Boundaries:
- Source of truth: user request, `.agents/AGENTS.md`, relevant `.agents/rules`
  owners, benchmark target registry, and current benchmark runners.
- Allowed edit scope: `.agents/AGENTS.md`, affected `.agents/rules/**`,
  generated `.agents/skills/**` and `.claude/skills/**` through `pnpm install`,
  affected `docs/plans/templates/**`, root/detail Vision routing, benchmark
  plan template/contract tests, and this goal plan.
- Browser surface: N/A: this task changes agent methodology, not editor runtime.
- Browser strategy: N/A for this implementation. Future Benchmark runs use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/PR requested.
- Non-goals: running the full editor benchmark corpus now; changing product
  runtime; inventing new public instrumentation; committing, pushing, or
  opening a PR.

Output budget strategy:
- Search only `.agents/AGENTS.md`, affected `.agents/rules/**`, plan templates,
  benchmark registry/runners, and package scripts. Exclude generated app data,
  `tmp`, `node_modules`, `.next`, build output, and broad docs corpora. Count
  references before reading exact files; cap command output to focused slices.

Blocked condition:
- Stop only if the source-to-mirror generator cannot create the new skill after
  three distinct repairs, or existing active source rules make a single
  benchmark owner impossible without a user product-policy decision.

Task state:
- task_type: agent workflow and skill ownership change
- task_complexity: major
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: implementing
- confidence: medium
- next owner: benchmark source-rule implementation
- reason: desired owner split is clear; exact stale-reference inventory and
  generated contract still need proof.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-skill-owner-consolidation.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Six explicit behavior/ownership requirements are listed in Completion threshold and Work Checklist. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `skill-creator`, `autogoal`, `best-api`, `agent-native-reviewer`, `performance`, `regression` methodology, and `slate-ar`. |
| Active goal checked or created | yes | No prior goal; created the objective naming this plan. |
| Source of truth read before edits | yes | Root AGENTS instructions and relevant owner skills read; exact source-rule inventory is the next bounded read. |
| Tracker comments and attachments read | no | N/A: thread request only. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent workflow design, not an existing product-code defect. |
| TDD decision before behavior change or bug fix | yes | Add a deterministic lane-state contract test before source-rule closeout. |
| Branch decision for code-changing task | no | N/A: user requested local edits, not a branch/commit/PR. |
| Release artifact decision | no | N/A: internal agent workflow; no published package or registry UI delta. |
| Browser tool decision for browser surface | no | N/A: no runtime/browser surface changes. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Output budget strategy recorded | yes | Narrow owner/source searches with generated/build exclusions recorded above. |
| Agent-native pack selected | yes | Applied `agent-native` pack. |
| Agent-facing action surface identified | yes | `$benchmark [scope]` default ordered all-lane loop plus explicit lane/resume narrowing. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; generate `.agents/skills/**` and `.claude/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits; final diff review remains required. |

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
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [ ] Create `benchmark` as the sole ordered benchmark diagnosis/execution owner.
- [ ] Make all applicable lanes the default inventory; explicit arguments may narrow it.
- [ ] Stop opening later lanes only after the conclusive-cause evidence gate passes.
- [ ] After a cause is conclusive, fix one owner, rerun the exact red lane and
      its correctness guard, then resume the first pending lane.
- [ ] Cover current Plate vs `origin/main`, Plate vs Plite, Plite vs pinned
      Slate, normal product mount/editing, example breadth, and large/stress.
- [ ] Cut overlapping benchmark loop/routing doctrine from other source skills
      instead of retaining aliases or two supervisors.
- [ ] Hard-cut repo-local skill/rule/template review defaults from
      `--max-priority P2` to `--max-priority P1`, regenerate mirrors, and prove
      zero stale P2 defaults.
- [ ] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [ ] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [ ] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P2/P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-benchmark-skill-owner-consolidation.md` | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | goal and requirement-complete plan created; governing skills read | bounded source inventory |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- Existing doctrine already proves the overlap risk: `performance` owns review
  criteria, `regression` owns correctness replay, and `slate-ar` currently owns
  a full target-backed perf loop that the new Benchmark owner must absorb/cut.
- The bounded sweep found additional execution overlap in `major-task`, `task`,
  `plite-research`, Auto's plan template, and Plite AR's template. Those routes
  now point to Benchmark or retain only architecture/research/correctness work.

Decisions and tradeoffs:
- One public front door: `$benchmark [scope]`. Keep `performance` as a lens and
  Autoresearch as optional worker machinery, not alternative benchmark owners.
- `best-api` verdict: keep one default call plus explicit `only`; no status,
  resume, perf, compare, audit, engine, or compatibility modes. Root/common/
  Plate/Plite Vision is updated because skill topology changed; `best-api`
  doctrine itself is reaffirmed, not changed.
- Latest user correction changes the repo-local closeout default from P2 to P1;
  generated skill mirrors and templates must teach only P1 by default.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Double-quoted `rg` pattern contained backticks and executed `auto` | 1 | Use single-quoted or fixed-string searches split by literal | Rerun with `rg -F` found the real stale `plite-research` routes; no files changed by the failed command. |

Verification evidence:
- Red contract: `node --test .agents/rules/benchmark/scripts/benchmark-contract.test.mjs`
  -> 4 pass, 1 expected failure because `.agents/rules/benchmark.mdc` does not
  exist yet.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-19T07:26:26.337Z Task goal plan created.
- 2026-08-19 Requirements extracted and goal created before source edits.
- 2026-08-19 Added executable lane-state validator/tests; initial run is red
  only at the missing Benchmark ownership/source gate.
- 2026-08-19 Added Benchmark source/methodology/template, cut Slate AR perf
  mode, and rerouted Auto, Task, Major Task, Regression, Performance,
  Plite Research, Plate/Plite plans, AGENTS, and Vision ownership.
- 2026-08-19 User added a repo skill default change: P1 autoreview replaces P2.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Create one ordered, early-stop, iterative Benchmark owner and cut overlap. |
| What have I learned? | Current performance execution doctrine is split across at least `slate-ar`, `auto`, and benchmark runners. |
| What have I done? | Loaded governing skills, created the goal, and locked all user requirements in this plan. |

Open risks:
- A weak “conclusive” gate could stop too early and misattribute the cause; the
  contract must require causal evidence and an exact post-fix rerun.
