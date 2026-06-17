# auto router to maintainer

Objective:
Patch `auto` routing so natural public queue prompts route to `maintainer` while internal Plate/Slate prompts stay in `auto`.

Goal plan:
docs/plans/2026-06-17-auto-router-to-maintainer.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user routing doctrine repair
- id / link: current thread
- title: Make `auto` the ergonomic router to `maintainer` when public queue intent is present.
- acceptance criteria:
  - `auto PR #123`, PR URLs, issue URLs, `auto all PRs`, `auto all issues`, `auto queue`, and security/advisory wording route to `maintainer`.
  - `auto slate`, `auto plate packages`, internal behavior/perf/docs/API loops stay in `auto`.
  - `auto current tree`, `auto post-merge`, teammate/external branch, ready-to-commit, and until-clean prompts route to `autoclosure`.
  - `maintainer` remains the public GitHub control-plane owner; `auto` does not absorb queue logic.
  - Source rules are edited, generated skill mirrors are synced, and routing text is discoverable from `auto`, `maintainer`, `.agents/AGENTS.md`, and vision/common doctrine.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Extracted requirements:
  - user wants to say `auto PR #123`, `auto slate`, `auto plate packages`, `auto all PRs, issues`;
  - harsh decision is `auto` should be the ergonomic router;
  - `maintainer` should keep public GitHub issue/PR/security queue ownership;
  - do not merge `auto` and `maintainer`;
  - patch durable local rules, not generated `SKILL.md` by hand;
  - run sync/verification after edits.

Timed checkpoint:
- requested duration: N/A, no duration requested
- semantics: N/A, one bounded routing-doctrine repair
- initial confidence score: 0.72 before source/generator audit
- improvement loop: source rules patched, generated mirrors synced, routing text audited
- final score / loop closure: 0.97 after source/generator audit and agent-native review

Completion threshold:
- Done when durable routing doctrine and generated mirrors make `auto` redirect public queue/post-merge prompts to the correct owner while preserving `auto` for internal Plate/Slate quality loops.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-router-to-maintainer.md` passes.

Verification surface:
- `pnpm install` to regenerate skill mirrors after `.agents/rules/**` edits.
- Source audit of `.agents/rules/auto.mdc`, `.agents/skills/auto/SKILL.md`, `.agents/AGENTS.md`, `VISION.md`, and `docs/vision/common.md` for the natural prompt routes.
- Generated mirror audit: source/generator output contains updated routing; no hand-edited `SKILL.md`.
- Agent-native review or explicit source-backed waiver.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/auto.mdc`, `.agents/rules/maintainer.mdc` if needed, `.agents/AGENTS.md`, root `VISION.md`, `docs/vision/common.md`.
- Allowed edit scope: routing doctrine, generated mirrors via `pnpm install`, this plan.
- Browser surface: N/A, no app/browser behavior.
- Tracker sync: N/A, no issue/PR mutation.
- Non-goals: do not add a new wrapper skill; do not move public queue logic into `auto`; do not rename `maintainer`; do not commit/push/PR.

Output budget strategy:
- Use targeted `sed`/`rg` on source rules and generated mirrors. Avoid broad repository scans. Cap command output.

Blocked condition:
- Stop if generated skill sync fails in a way unrelated to these edits, or if routing doctrine conflicts with `VISION.md` in a way that requires a taste decision. No such blocker currently known.

Task state:
- task_type: agent routing doctrine repair
- task_complexity: small but high-leverage, because it changes agent entrypoint behavior
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until check-complete passes

Current verdict:
- verdict: implemented
- confidence: 0.97
- next owner: task
- reason: source rules, generated mirrors, repo guidance, and vision doctrine all agree that `auto` is the ergonomic front door while `maintainer` and `autoclosure` keep ownership.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-router-to-maintainer.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | extracted above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | read `auto`, `maintainer`, `.agents/AGENTS.md`, root `VISION.md`, `docs/vision/common.md` |
| Active goal checked or created | yes | created goal for `docs/plans/2026-06-17-auto-router-to-maintainer.md` |
| Source of truth read before edits | yes | source rule and doctrine files read |
| Tracker comments and attachments read | no | N/A: no tracker item |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent routing doctrine, no runtime code |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior |
| Branch decision for code-changing task | no | N/A: no branch/commit requested |
| Release artifact decision | no | N/A: no package/runtime release artifact |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker sync |
| Output budget strategy recorded | yes | targeted source audits only |
| Agent-native pack selected | yes | applied `agent-native` pack |
| Agent-facing action surface identified | yes | `auto` skill routing and repo default routing |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/*.mdc`; sync generated `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no accepted findings |

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
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run `pnpm install`, source audit, generated mirror audit, and autogoal completion check | `pnpm install` passed; `rg` audits found routes in source and generated mirrors; check-complete to run after this table |
| Bug reproduced before fix | no | Record N/A with reason | N/A: routing doctrine repair, not a runtime bug |
| Targeted behavior verification | yes | Verify changed agent routing text is present in owner files | `rg` found front-door routes in `.agents/rules/auto.mdc`, `.agents/skills/auto/SKILL.md`, `.agents/rules/maintainer.mdc`, `.agents/skills/maintainer/SKILL.md`, `.agents/AGENTS.md`, `AGENTS.md`, `VISION.md`, and `docs/vision/common.md` |
| TypeScript or typed config changed | no | Record N/A with reason | N/A: no TS or typed config changed |
| Package exports or file layout changed | no | Record N/A with reason | N/A: no package exports or file layout changed |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason | N/A: `pnpm install` was run only to regenerate skills; no package install policy change intended |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `auto` and `maintainer` mirrors contain the routing text |
| Workspace authority proof | yes | Run proof in `/Users/zbeyens/git/plate-2` | All verification commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Record explicit waiver | N/A: no app/browser route or UI changed |
| Browser final proof | no | Record explicit waiver | N/A: no browser surface |
| CI-controlled template output changed | no | Record N/A with reason | N/A: no `templates/**` output touched |
| Package behavior or public API changed | no | Record N/A with reason | N/A: agent routing docs only; no package API |
| Registry-only component work changed | no | Record N/A with reason | N/A: no registry component work |
| Docs or content changed | yes | Verify source-backed claims and current-state wording | `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, and root `AGENTS.md` now state the same routing ownership |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary choice | Risk: `auto` could silently absorb maintainer work. Boundary: table routes queue/security to `maintainer` and closure to `autoclosure`; proof: source/generated audits |
| Agent-native review for agent/tooling changes | yes | Load reviewer skill and close accepted findings | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; review found no accepted actionable issue |
| Local install corruption suspected | no | Record N/A with reason | N/A: no surprising repo-wide failure |
| Autoreview for non-trivial implementation changes | no | Record N/A with reason | N/A: docs/rules-only routing repair; agent-native review is the relevant closeout gate |
| PR create or update | no | Record N/A with reason | N/A: no PR requested |
| Task-style PR body verified | no | Record N/A with reason | N/A: no PR |
| PR proof image hosting | no | Record N/A with reason | N/A: no PR and no browser proof image |
| Tracker sync-back | no | Record N/A with reason | N/A: no tracker/issue mutation |
| Final handoff contract | yes | Fill final handoff fields | Filled below with changed list, confidence, verification, caveat, and no PR/tracker/browser |
| Final lint | no | Record N/A with reason | N/A: Markdown/rule routing text only; no lintable code path changed |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed | Used targeted `sed` and `rg`; one quoted `rg` attempt failed before output and was corrected |
| Timed checkpoint | no | Record N/A with reason | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-router-to-maintainer.md` | To run after final plan update |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` passed; mirror audit found front-door routes in generated `auto` and `maintainer` skills |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `auto` generated skill now has a `Front-Door Routing` table and natural prompt examples |
| Agent-native review | yes | Load reviewer skill and close accepted findings | No accepted findings; action surface is discoverable and owner boundaries are explicit |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | `auto`, `maintainer`, AGENTS, VISION, and common vision doctrine read | implementation done |
| Implementation | complete | source rules and doctrine patched; `pnpm install` regenerated mirrors | verification done |
| Verification | complete | `rg` source/generated audits passed; agent-native review passed | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | final plan evidence recorded; check-complete gate next | final response |

Findings:
- `auto` was the right ergonomic front door, but only if ownership stays explicit. The patch makes `auto PR #123`/queue/security a handoff to `maintainer`, and current-tree/post-merge a handoff to `autoclosure`.

Decisions and tradeoffs:
- Keep one user-facing word, `auto`, for recall.
- Do not merge `auto` and `maintainer`; public queue control-plane work needs its own owner.
- Do not create another wrapper skill; the routing table in `auto` is enough.

Implementation notes:
- Patched `.agents/rules/auto.mdc`, `.agents/rules/maintainer.mdc`, `.agents/AGENTS.md`, `VISION.md`, and `docs/vision/common.md`.
- Ran `pnpm install` to regenerate `.agents/skills/auto/SKILL.md`, `.agents/skills/maintainer/SKILL.md`, and root generated guidance.

Review fixes:
- Agent-native review: no accepted findings. The changed action is discoverable in the generated `auto` skill, the source/generation boundary is respected, and public queue ownership remains with `maintainer`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` audit with unescaped backticks in a double-quoted shell string | 1 | rerun with single-quoted patterns | corrected; targeted audits passed |

Verification evidence:
- `pnpm install` passed and regenerated skill mirrors.
- `rg -n 'Front-Door Routing|auto PR|auto issue|auto all PRs|auto current tree|auto slate|auto plate packages|front-door|ergonomic' .agents/rules/auto.mdc .agents/skills/auto/SKILL.md .agents/rules/maintainer.mdc .agents/skills/maintainer/SKILL.md .agents/AGENTS.md AGENTS.md VISION.md docs/vision/common.md` found the routes in source and generated files.
- `rg -n 'If the prompt starts with `auto`|public queue prompts|routing convenience|post-merge/current-tree closure' .agents/AGENTS.md AGENTS.md VISION.md docs/vision/common.md .agents/rules/auto.mdc .agents/skills/auto/SKILL.md .agents/rules/maintainer.mdc .agents/skills/maintainer/SKILL.md` found the ownership boundary text.
- Agent-native review loaded and passed with no accepted findings.

Final handoff contract:
- PR line: N/A, no PR requested
- Issue / tracker line: N/A, no issue or tracker mutation
- Confidence line: 0.97
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: `pnpm install` plus source/generated routing audits
- Browser check: N/A, no browser surface
- Outcome: `auto` is now the recall-friendly front door while `maintainer` and `autoclosure` keep their domains.
- Caveat: This changes agent routing doctrine, not runtime behavior.
- Design:
  - Chosen boundary: `auto` routes, `maintainer` owns public queue, `autoclosure` owns already-applied closure.
  - Why not quick patch: changing only one natural prompt would rot immediately.
  - Why not broader change: merging owners would make the control plane muddy and harder to automate.
- Verified: `pnpm install`, targeted `rg` audits, agent-native review
- PR body verified: N/A, no PR

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: no runtime/browser behavior changed

Timeline:
- 2026-06-17T12:10:11.499Z Task goal plan created.
- 2026-06-17T12:12Z Source rules and vision doctrine patched.
- 2026-06-17T12:13Z `pnpm install` regenerated skill mirrors.
- 2026-06-17T12:14Z Source/generated audits and agent-native review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after `check-complete` and goal close |
| What is the goal? | Make `auto` the ergonomic router while preserving `maintainer` and `autoclosure` ownership |
| What have I learned? | Routing convenience is good; ownership merge would be bad |
| What have I done? | Patched source doctrine, regenerated mirrors, audited discoverability |

Open risks:
- None known.
