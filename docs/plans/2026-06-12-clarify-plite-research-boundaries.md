# clarify slate research boundaries

Objective:
Clarify Plite research boundaries; done when slate-research source/mirrors replace slate-autoresearch ambiguity and audits pass.

Goal plan:
docs/plans/2026-06-12-clarify-slate-research-boundaries.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user correction / skill topology repair
- id / link: current Codex thread
- title: Rename/reframe Plite research so it does not conflict with Plite AR
- acceptance criteria: explicit requirements below are captured, source rules
  are patched, generated mirrors are synced, stale references are audited, and
  agent-native review has no accepted actionable findings.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Source-owned `plite-autoresearch` is renamed/reframed as `plite-research`.
- `plite-research` clearly says it does not run Codex Autoresearch packets; it
  discovers, dedupes, synthesizes, and promotes research into owners.
- `plite-ar` remains the Plite measured-loop wrapper around
  `codex-autoresearch`.
- `plite-ar-quality` is clarified as executor for accepted quality-gap
  checklists, not broad OSS discovery.
- `plite-automation`, AGENTS routing, generated mirrors, and stale references
  agree on the boundary.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-clarify-slate-research-boundaries.md` passes.

Verification surface:
- `pnpm install` after `.agents/rules/**` / `.agents/AGENTS.md` edits.
- Source audit with `rg` for `plite-autoresearch`, `plite-research`,
  `plite-ar-quality`, generated mirror source metadata, and stale artifact
  paths.
- `git diff --check` for touched rules, generated mirrors, AGENTS files, and
  this plan.
- Agent-native review for changed skill/rule surfaces.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc` and `.agents/AGENTS.md`.
- Allowed edit scope: Plite research/AR skill rules, generated mirrors via
  `pnpm install`, and this goal plan.
- Browser surface: N/A, agent workflow only.
- Tracker sync: N/A.
- Non-goals: no runtime Plite code, no benchmark changes, no PR/commit, no
  broad rewrite of all `plite-ar-*` shortcuts.

Output budget strategy:
- Use narrow `sed` slices and focused `rg`; cap large outputs; do not stream
  generated trees except specific skill mirrors needed for audit.

Blocked condition:
- Block only if source/mirror sync fails repeatedly or the skiller generator
  cannot produce a renamed `plite-research` mirror from source rules.

Task state:
- task_type: agent workflow / skill topology repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement rename/reframe
- confidence: high
- next owner: task
- reason: user accepted the proposed boundary cleanup.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-clarify-slate-research-boundaries.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements captured in this plan: rename/reframe, keep `plite-ar` as measured-loop wrapper, route research promotions into owners, clean `plite-ar-quality` overlap, sync mirrors, audit stale refs. |
| Skill analysis before edits | yes | Read `skill-creator`, `autogoal`, `plite-ar`, `plite-autoresearch`, `plite-ar-quality`, and memory boundary notes. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this boundary repair. |
| Source of truth read before edits | yes | `.agents/rules/slate-autoresearch.mdc`, `.agents/rules/slate-ar.mdc`, `.agents/rules/slate-ar-quality.mdc`. |
| Tracker comments and attachments read | no | N/A: no tracker issue. |
| Video transcript evidence required | no | N/A: no video/browser artifact. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: skill topology repair, no runtime code behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/commit; source edits only. |
| Release artifact decision | no | N/A: private skill/rule change, no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused `sed` and `rg`; cap generated mirror reads. |
| Agent-native pack selected | yes | Agent-native pack applies because skill/rule prompts change. |
| Agent-facing action surface identified | yes | Skill trigger names/descriptions and `plite-ar` / `plite-automation` routing text. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and `.agents/AGENTS.md`; run `pnpm install`; never hand-edit generated mirrors. |
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, `node --check tooling/scripts/slate-research.mjs`, stale-name audit, discoverability audit, `git diff --check`, and autogoal completion check are the named proof set. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: this repairs skill topology ambiguity, not a runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source/mirror audits verify the agent-routing behavior. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or barrel files changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` was run for Skiller sync, not dependency graph changes. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` generated `.agents/skills/slate-research/SKILL.md` and removed the stale generated `plite-autoresearch` mirror. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands run from `/Users/zbeyens/git/plate-2`, the owning repo for these rules and mirrors. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no UI/browser surface changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: agent workflow text only. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: private skill/rule change, no package API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: the only docs file is this goal plan. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: agents keep routing research to measured AR execution. Proof: stale-name/discoverability audits plus generated mirror sync. Boundary: research discovers/promotes; AR executes measured packets. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer skill. Verdict PASS: no UI action parity issue; capability routing is explicit in source rules and generated mirror. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no suspicious install corruption. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: focused skill topology text change; agent-native review is the relevant review lane. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not ask for PR. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below with changed list, proof, caveat, and boundary decision. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/rule text and one JS rename; `node --check` covers script syntax. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used focused `sed` and `rg`; one broad diff was avoided after truncated output. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-clarify-slate-research-boundaries.md` | This plan has no open checklist/gate placeholders before the final completion command. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` completed and current-surface stale-name audit passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` shows `plite-research` in `.agents/AGENTS.md`, generated `AGENTS.md`, `plite-automation`, `plite-ar`, `plite-ar-quality`, and `plite-research`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: capability map is discoverable; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read relevant skills/rules and captured acceptance criteria in this plan. | implementation |
| Implementation | complete | Renamed/reframed source rule and updated routing in automation/AR owners. | verification |
| Verification | complete | `pnpm install`, syntax check, stale-name audit, discoverability audit, and diff whitespace check completed. | closeout |
| PR / tracker sync | n/a | No PR or tracker requested. | final response |
| Closeout | complete | Final handoff fields filled; final autogoal check is the last command. | final response |

Findings:
- `plite-autoresearch` and `plite-ar` overlapped semantically. The clean split is `plite-research` for discovery/synthesis/promotion and `plite-ar` for measured execution.
- `plite-ar-quality` needed to stop sounding like broad discovery. It now consumes accepted checklists and executes them through AR.

Decisions and tradeoffs:
- Rename the source skill to `plite-research` instead of keeping `plite-autoresearch`. Keeping the old name would keep implying it owns Codex Autoresearch execution.
- Leave old historical `docs/plans/**` mentions alone. Rewriting history would add noise and not improve routing.
- Keep `plite-research` command helpers light for now. Existing helper behavior was renamed; deeper helper-backed `setup/doctor/next/log/state/promote-preview` can be added when the workflow needs it.

Implementation notes:
- Moved `.agents/rules/slate-autoresearch.mdc` to `.agents/rules/slate-research.mdc`.
- Renamed `tooling/scripts/slate-autoresearch.mjs` to `tooling/scripts/slate-research.mjs` and updated usage strings.
- Updated `plite-automation`, `plite-ar`, `plite-ar-quality`, `plite-ar-perfect`, `plite-ar-next`, `plite-ar-recipe`, `vision`, `plite-patch`, `.agents/AGENTS.md`, and generated mirrors through `pnpm install`.

Review fixes:
- Agent-native review PASS. No accepted findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` completed after `.agents/rules/**` and `.agents/AGENTS.md` edits.
- `node --check tooling/scripts/slate-research.mjs` passed.
- `rg -n "plite-autoresearch|Plite Autoresearch|source: .agents/rules/slate-autoresearch" .agents/skills .agents/rules .agents/AGENTS.md AGENTS.md tooling/scripts/slate-research.mjs` returned no current-surface matches.
- `rg --files .agents/skills .agents/rules tooling/scripts | rg 'plite-(auto)?research'` returned only `.agents/rules/slate-research.mdc`, `.agents/skills/slate-research/SKILL.md`, and `tooling/scripts/slate-research.mjs`.
- `rg -n "plite-research|slate-ar-quality|slate-ar" ...` confirmed discoverability in source rules, generated AGENTS, and script usage.
- `git diff --check -- .agents/rules .agents/skills .claude/skills .agents/AGENTS.md AGENTS.md tooling/scripts/slate-research.mjs tooling/scripts/slate-autoresearch.mjs docs/plans/2026-06-12-clarify-slate-research-boundaries.md` passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-clarify-slate-research-boundaries.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High for skill routing/source sync; medium for future helper command ergonomics because `setup/doctor/next/log/state/promote-preview` is documented as a contract but not fully helper-backed yet.
- Flow table:
  - Reproduced: N/A, topology ambiguity rather than runtime bug.
  - Verified: source/mirror/script audits passed; browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: `plite-research` owns external research/discovery; `plite-ar` owns measured Codex Autoresearch execution; `plite-ar-quality` owns accepted checklist execution.
- Caveat: old historical plans still mention `plite-autoresearch`; current surfaces do not.
- Design:
  - Chosen boundary: research discovers/promotes, AR executes measured loops.
  - Why not quick patch: caller-by-caller wording would keep duplicate ownership alive.
  - Why not broader change: most `plite-ar-*` shortcuts still have clear execution roles; deleting them would remove useful entrypoints.
- Verified: `pnpm install`, syntax check, stale-name audit, discoverability audit, whitespace check, and agent-native review.
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
- Caveats: historical docs/plans retain old-name mentions as history; future helper-backed research commands remain a follow-up.

Timeline:
- 2026-06-12T09:34:33.400Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Run final autogoal completion check, then hand off. |
| What is the goal? | Clarify Plite research boundaries so `plite-research` handles discovery and `plite-ar` handles measured execution. |
| What have I learned? | The old `plite-autoresearch` name caused real routing ambiguity with `plite-ar`. |
| What have I done? | Renamed/reframed source, synced generated mirrors, updated routing, and audited current surfaces. |

Open risks:
- None for current routing. Follow-up risk: helper-backed `plite-research setup/doctor/next/log/state/promote-preview` is conceptual until implemented beyond the existing renamed helper commands.
