# rename slate automation to slate auto

Objective:
Rename slate-automation to slate-auto; done when source rules, templates, generated mirrors, and current audits agree.

Goal plan:
docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request / skill topology rename
- id / link: current Codex thread
- title: Rename `slate-automation` skill to `slate-auto`
- acceptance criteria: current source rules, generated skill mirrors, AGENTS
  routing, plan template, and live skill references use `slate-auto`; stale
  `slate-automation` remains only in historical docs/plans if unavoidable.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- `.agents/rules/slate-automation.mdc` is renamed to
  `.agents/rules/slate-auto.mdc`.
- Generated `.agents/skills/slate-auto/SKILL.md` exists with `name:
  slate-auto` and source metadata `.agents/rules/slate-auto.mdc`.
- Current routing surfaces use `slate-auto`, not `slate-automation`.
- The Slate automation plan template is renamed to
  `docs/plans/templates/slate-auto.md` and current references use it.
- `pnpm install` syncs generated mirrors.
- Current-surface stale-name audit, discoverability audit, `git diff --check`,
  agent-native review, and autogoal `check-complete` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md` passes.

Verification surface:
- `pnpm install`.
- Source/mirror audit with `rg` for `slate-automation`, `slate-auto`, and
  generated source metadata.
- `rg --files` audit for old/new rule, skill, and template filenames.
- `git diff --check` on touched rules, generated mirrors, AGENTS files,
  template, and this plan.
- Agent-native review for changed skill/action routing.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`, and
  `docs/plans/templates/*.md`.
- Allowed edit scope: current Slate skill/rule routing, generated mirrors via
  `pnpm install`, AGENTS mirrors, plan template rename, and this goal plan.
- Browser surface: N/A, agent workflow rename only.
- Tracker sync: N/A, no issue/Linear/PR requested.
- Non-goals: no runtime Slate code, no PR/commit, no compatibility alias unless
  audit proves one is required.

Output budget strategy:
- Use focused `rg -l`, `rg --files`, and short `sed` slices. Do not stream
  generated trees or historical plans broadly; current-surface audits exclude
  old `docs/plans/**` history unless the active template is involved.

Blocked condition:
- Block only if Skiller generation cannot create `slate-auto` from the renamed
  source rule or if current rule/template references require a compatibility
  alias that conflicts with the user's rename.

Task state:
- task_type: agent workflow / skill rename
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement rename
- confidence: high
- next owner: task
- reason: user explicitly asked to rename `$slate-automation` to `slate-auto`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirement is a current skill rename from `slate-automation` to `slate-auto`; source/mirror/template/audit requirements captured above. |
| Skill analysis before edits | yes | Read `autogoal`, `skill-creator`, and `.agents/rules/slate-auto.mdc`; user also provided generated skill body. |
| Active goal checked or created | yes | `get_goal` returned none; created this active goal. |
| Source of truth read before edits | yes | Read `.agents/rules/slate-auto.mdc`; source rule boundary from `.agents/AGENTS.md` says edit rules and run `pnpm install`. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video/browser artifact. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow rename, no runtime behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/commit. |
| Release artifact decision | no | N/A: private skill/template rename, no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused `rg`/`sed`; exclude historical plans from stale-name closure unless current template. |
| Agent-native pack selected | yes | Agent-facing skill name and routing changed. |
| Agent-facing action surface identified | yes | `$slate-auto` invocation, skill trigger metadata, AGENTS list, and template references. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and `.agents/AGENTS.md`; sync generated `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; review recorded below. |

Work Checklist:
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, stale-name audit, discoverability audit, filename audit, generated mirror read, `git diff --check`, and final autogoal plan check. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill rename, not runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source/mirror audits prove the invocation/routing behavior. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or barrels changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest or dependency graph change was intended; `pnpm install` was for Skiller sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` created `.agents/skills/slate-auto/SKILL.md` with `name: slate-auto` and source `.agents/rules/slate-auto.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran from `/Users/zbeyens/git/plate-2`, the owner of `.agents/**`, templates, and generated mirrors. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `docs/plans/templates/**` is a goal-plan template, not CI-controlled `templates/**`. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental docs/template updates only; verified by source audits and `git diff --check`. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: agents/users keep invoking the dead name. Proof: no current-surface stale matches and generated `slate-auto` exists. Boundary: true rename, no alias. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: CLI/skill action is discoverable via generated skill metadata, AGENTS line, source rules, and template. No accepted findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: narrow skill rename; agent-native review is the relevant review lane. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/rule rename only; whitespace checked with `git diff --check`. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used focused `rg` and `sed`. One backtick-containing `rg` pattern caused shell command substitution and is recorded in error attempts. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md` | Run after this evidence is recorded. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `.agents/skills/slate-auto/SKILL.md` exists and old generated `slate-automation` path is absent from current filename audit. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `slate-auto` appears in generated skill metadata/body, AGENTS, source rules, issue-harvester, north-star, slate-research, and the goal template. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: no action parity gap; rename is discoverable. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read `autogoal`, `skill-creator`, `slate-auto` source, and agent-native reviewer. | implementation |
| Implementation | complete | Renamed source rule/template and updated current routing references. | verification |
| Verification | complete | `pnpm install`, filename audit, stale-name audit, discoverability audit, and `git diff --check` passed. | closeout |
| PR / tracker sync | n/a | No PR or tracker requested. | final response |
| Closeout | complete | Final handoff fields filled; final `check-complete` is the last mechanical gate. | final response |

Findings:
- The old generated skill folder was removed by Skiller after the source rename; current generated path is `.agents/skills/slate-auto/SKILL.md`.
- One durable issue-harvester note still named `slate-automation`; updated it because it describes current supervisor behavior, not old history.

Decisions and tradeoffs:
- Chose a true rename with no compatibility alias. The user asked for `slate-auto`; keeping an alias would preserve the old mental model and weaken the rename.
- Left historical `docs/plans/**` paths alone except this active plan. Old plans are history, not live routing.

Implementation notes:
- Moved `.agents/rules/slate-automation.mdc` to `.agents/rules/slate-auto.mdc`.
- Moved `docs/plans/templates/slate-automation.md` to `docs/plans/templates/slate-auto.md`.
- Updated current references in `slate-auto`, `slate-research`, `vision`, `issue-harvester`, `.agents/AGENTS.md`, generated `AGENTS.md`, and `docs/editor-issue-harvester/lexical/full/supervisor-miss.md`.
- Ran `pnpm install` to regenerate `.agents/skills/slate-auto/SKILL.md`.

Review fixes:
- Agent-native review PASS. No accepted findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Backtick-containing `rg` pattern inside double quotes caused shell command substitution (`zsh: command not found: slate-auto`) | 1 | Use `rg -n -e 'pattern'` with single quotes for backtick or hyphen-heavy patterns | Reran audit with `-e` patterns and no shell noise. |

Verification evidence:
- `pnpm install` passed and Skiller applied rules for Claude Code and Codex.
- `sed -n '1,80p' .agents/skills/slate-auto/SKILL.md` confirmed `name: slate-auto` and source `.agents/rules/slate-auto.mdc`.
- `rg --files .agents/rules .agents/skills docs/plans/templates | rg 'slate-(automation|auto)'` returned only `docs/plans/templates/slate-auto.md`, `.agents/rules/slate-auto.mdc`, and `.agents/skills/slate-auto/SKILL.md`.
- `rg -n -e 'slate-automation' -e 'Slate Automation' -e 'source: .agents/rules/slate-automation' .agents AGENTS.md docs/slate-v2 docs/editor-issue-harvester docs/plans/templates tooling package.json --glob '!**/node_modules/**' --glob '!**/.next/**'` returned no current-surface matches.
- `rg -n -e 'slate-auto' ...` confirmed the new name in generated skill metadata/body, source rules, AGENTS, current docs, and plan template.
- `git diff --check -- .agents/rules .agents/skills .agents/AGENTS.md AGENTS.md docs/plans/templates docs/editor-issue-harvester/lexical/full/supervisor-miss.md docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md` passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-rename-slate-automation-to-slate-auto.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High; current source, generated mirror, AGENTS, template, and durable doc references agree.
- Flow table:
  - Reproduced: N/A, rename request.
  - Verified: source/mirror/template audits passed; browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: `$slate-auto` is the current supervisor skill name; generated mirror exists and old current skill path is gone.
- Caveat: historical plans may still mention `slate-automation`; they were intentionally left as history.
- Design:
  - Chosen boundary: true rename of source rule, generated mirror, template, and current routing.
  - Why not quick patch: editing generated `SKILL.md` would be overwritten and leave source stale.
  - Why not broader change: no runtime/API behavior changed; aliasing old name would dilute the requested rename.
- Verified: `pnpm install`, stale-name audit, discoverability audit, filename audit, generated mirror read, and `git diff --check`.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: historical `docs/plans/**` may contain old invocations; current routing surfaces do not.

Timeline:
- 2026-06-12T09:46:01.984Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Run final autogoal completion check, then hand off. |
| What is the goal? | Rename `slate-automation` to `slate-auto` across source, generated mirrors, templates, and current routing. |
| What have I learned? | The live rename touched source rules, generated mirrors, the automation template, AGENTS routing, and one durable issue-harvester note. |
| What have I done? | Renamed/synced/audited current surfaces and recorded verification. |

Open risks:
- None for current routing. Historical plans may still mention the old name by design.
