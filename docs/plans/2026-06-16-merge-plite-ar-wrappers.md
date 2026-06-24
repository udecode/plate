# merge slate ar wrappers

Objective:
Merge Plite AR wrapper skills into one conditional `plite-ar` flow/template.

Goal plan:
docs/plans/2026-06-16-merge-slate-ar-wrappers.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat instruction
- id / link: current thread
- title: Merge `plite-ar-*` wrappers into `plite-ar`
- acceptance criteria: one public Plite AR entrypoint plus `plite-ar-perf`, a
  conditional `docs/plans/templates/slate-ar.md`, no stale wrapper-source
  routing, generated mirrors synced, and audits passing.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Done when `plite-ar` owns all non-perf Autoresearch modes, wrapper source
  rules are retired, `plite-auto`/`plite-research` route to modes instead of
  deleted skills, `docs/plans/templates/slate-ar.md` can instantiate a
  conditional goal plan, generated skills are synced, and source audits show no
  stale wrapper references outside deliberate historical/generated plan text.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-merge-slate-ar-wrappers.md` passes.

Verification surface:
- Source audit for `.agents/rules/**`, `docs/plans/templates/**`, and generated
  `.agents/skills/**` after sync.
- `pnpm install` to regenerate skills from `.agents/rules/**`.
- Instantiate `docs/plans/templates/slate-ar.md` with
  `create-goal-scratchpad.mjs` or inspect the template directly when a smoke
  plan would create noise.
- `node .agents/skills/autogoal/scripts/check-complete.mjs` for this plan.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/**` plus `docs/plans/templates/**`; generated
  `.agents/skills/**` must come from `pnpm install`.
- Allowed edit scope: Plite AR/Plite Auto/Plite Research rules, the new
  `plite-ar` plan template, this goal plan, and generated mirrors from sync.
- Browser surface: N/A: agent workflow only.
- Tracker sync: N/A.
- Non-goals: no runtime Plite code changes, no package release work, no PR,
  no commit, no broad skill-cleaning beyond the Plite AR wrapper merge.

Output budget strategy:
- Use focused `sed` and `rg` queries scoped to Plite AR/Auto/Research rules,
  templates, and generated skill mirrors. Cap broad output; use counts/file
  lists before printing large matches.

Blocked condition:
- Block only if `pnpm install`/Skiller cannot sync deleted wrapper mirrors or
  if removing wrappers exposes an unavoidable compatibility decision that would
  keep stale public entrypoints alive.

Task state:
- task_type: agent workflow / skill topology cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: in_progress
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: active
- confidence: 0.93
- next owner: slate-ar
- reason: Wrapper behaviors are useful, but discoverable wrapper skills create
  routing noise; preserve behavior as conditional modes and a template.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-merge-slate-ar-wrappers.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies: merge wrappers, add conditional `plite-ar` template, keep clean boundaries. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `skill-cleaner`, `plite-ar`, wrapper rules, `plite-auto`, `plite-research`, and relevant templates. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this plan. |
| Source of truth read before edits | yes | `.agents/rules/*.mdc` are source; generated mirrors are not edited by hand. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no runtime/product code. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior/runtime code. |
| Branch decision for code-changing task | no | N/A: no branch requested. |
| Release artifact decision | no | N/A: no package behavior/release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A. |
| Output budget strategy recorded | yes | Focused `rg`/`sed`, capped output, no repo-wide unbounded dumps. |
| Agent-native pack selected | yes | `.agents/rules/**` and generated skill mirrors are in scope. |
| Agent-facing action surface identified | yes | `plite-ar`, `plite-auto`, `plite-research`, and `docs/plans/templates/slate-ar.md`. |
| Source rule versus generated mirror boundary identified | yes | Edit rules/templates only; run `pnpm install` for mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no agent-action parity gap found for skill routing docs. |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no package behavior.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: stale deleted skill routing; guarded by source and
      generated audits.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Retired-name audit clean; generated AR surface is only `plite-ar` and `plite-ar-perf`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: topology cleanup, not runtime bug. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no editor/runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown/rule/template changes only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/file layout. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` passed; no package manifest or lockfile target changed in scoped diff. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed twice; generated mirrors now include only `plite-ar` and `plite-ar-perf`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran in `/Users/zbeyens/git/plate-2`, the owning control repo for rules/templates. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser route/UI changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `docs/plans/templates/slate-ar.md` is project-owned goal template, not CI-generated output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: agent workflow only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Root/source `AGENTS.md` updated to route research into `plite-ar` modes; source audit passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: orphan skill routing. Proof: retired-name audit clean and generated mirror list has only `plite-ar`/`plite-ar-perf`. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; pass: agent can invoke same capability through `plite-ar` modes; no orphan public action remains in generated skills. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: no runtime implementation diff; agent-native review used. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no TS/JS/runtime code; proof is source/generated audit plus Skiller sync. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One analyzer output was large but bounded by `--no-logs`; subsequent audits were scoped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-merge-slate-ar-wrappers.md` | Final mechanical gate run after plan update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; `rg --files` shows only `plite-ar` and `plite-ar-perf` AR skills/rules. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `plite-ar` skill advertises status/gate/quality/recipe/stabilize/perfect/finalize/ship modes and `--template slate-ar`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read autogoal, skill-cleaner, Plite AR wrapper rules, slate-auto, slate-research, and templates | implementation |
| Implementation | complete | Added `docs/plans/templates/slate-ar.md`, rewrote `plite-ar`, deleted wrapper rules, updated callers, ran `pnpm install` | verification |
| Verification | complete | Source/generated audits passed; only `plite-ar` and `plite-ar-perf` remain | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | This plan records final evidence and handoff | final response |

Findings:
- Wrapper skills were pure routing/shortcut surface. Their useful rules fit
  better as `plite-ar` modes plus the conditional `plite-ar` plan template.
- `plite-ar-perf` remains separate because perf target policy is real domain
  policy, not a shortcut.
- `pnpm install` also synced an existing `dev-browser` rule/mirror diff. That
  is outside this AR cleanup and was not reverted.

Decisions and tradeoffs:
- Deleted the non-perf Plite AR shortcuts instead of keeping redirect wrappers,
  because redirect wrappers would keep the prompt-budget/routing problem alive.
- Preserved old behavior as `plite-ar` modes: status, next, gate, stabilize,
  quality, recipe, perfect, finalize, and ship.
- Kept `plite-ar-perf` as the only separate AR sibling.

Implementation notes:
- Changed source rules only, then synced generated mirrors with `pnpm install`.
- New template is project-owned under `docs/plans/templates/slate-ar.md`; no
  generic `autogoal` changes were needed.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` passed twice and ran Skiller.
- `rg --files .agents/skills .agents/rules | rg 'plite-ar'` shows only
  `.agents/rules/slate-ar.mdc`, `.agents/rules/slate-ar-perf.mdc`,
  `.agents/skills/slate-ar/SKILL.md`, and
  `.agents/skills/slate-ar-perf/SKILL.md`.
- `rg -n "plite-ar-\*|slate-ar-(next|perfect|fast|stabilize|ship|status|finalize|quality|gate|recipe)" .agents/skills .agents/rules docs/plans/templates AGENTS.md .agents/AGENTS.md VISION.md` returned no matches.
- `rg -n 'promotion into \`plite-ar\` modes|slate-ar modes' ...` verified root
  and source `AGENTS.md`, `plite-research` rule, and generated mirror use mode
  routing.
- `skill-cleaner` analyzer on the repo skill root completed; generated AR
  surface is now `plite-ar` plus `plite-ar-perf`.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A
- Confidence line: 0.93
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: source/generated audits passed, browser N/A
- Browser check: N/A: no browser surface
- Outcome: Plite AR shortcut skills collapsed into `plite-ar` modes with a
  conditional plan template.
- Caveat: existing `dev-browser` rule/mirror diffs were present in the scoped
  diff after sync; not part of this change.
- Design:
  - Chosen boundary: source rules/templates plus generated mirrors
  - Why not quick patch: keeping redirect wrappers would preserve routing noise
  - Why not broader change: other skill overlap lanes were not requested here
- Verified: `pnpm install`, generated mirror list, stale wrapper reference audit,
  template structure audit, skill-cleaner analyzer
- PR body verified: N/A

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
- Caveats: existing `dev-browser` source/mirror diff was synced by
  `pnpm install` and left alone.

Timeline:
- 2026-06-16T16:57:33.556Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final mechanical goal-plan check, then final response |
| What is the goal? | Merge Plite AR wrapper skills into one conditional `plite-ar` flow/template |
| What have I learned? | Wrappers were routing aliases; `plite-ar-perf` is the only real separate sibling |
| What have I done? | Rewrote `plite-ar`, added `plite-ar` template, deleted wrapper sources, synced mirrors, audited callers |

Open risks:
- Low: users with muscle memory for deleted shortcut names need to call
  `plite-ar <mode>` instead. This is intentional; redirect skills would keep
  the topology dirty.
