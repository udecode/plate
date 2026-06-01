# sync shadcn status differences

Objective:
Update `sync-shadcn status` instructions so status reports separate landed
partial syncs, reviewable Plate-vs-shadcn differences, and settled differences.
The important behavior is that deferred visual parity gaps, like `/editors`
BlockViewer toolbar parity, are visible enough for the user to re-decide later.

Goal plan:
docs/plans/2026-05-29-sync-shadcn-status-differences.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: `/Users/zbeyens/git/plate/.agents/skills/sync-shadcn/SKILL.md`
- title: Clarify `sync-shadcn status` difference reporting
- acceptance criteria: source rule updated, generated skill mirror regenerated,
  status behavior names reviewable differences, settled exclusions stay out of
  routine status, source/generated text verified.

Completion threshold:
- `.agents/rules/sync-shadcn.mdc` defines scoped status filters and a
  `Reviewable differences` bucket.
- `.agents/skills/sync-shadcn/SKILL.md` is regenerated from the rule source.
- `pnpm install`, source/generated `rg` verification, `git diff --check`, and
  goal completion check pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-status-differences.md` passes.

Verification surface:
- `pnpm install`
- `rg -n "Reviewable differences|Status must distinguish|status scope filter|do not hide reviewable" .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md`
- `git diff --check -- .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md docs/plans/2026-05-29-sync-shadcn-status-differences.md`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-status-differences.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/sync-shadcn.mdc`.
- Allowed edit scope: source rule, generated `sync-shadcn` skill mirror, and
  this goal plan.
- Browser surface: N/A, no app UI changed.
- Tracker sync: N/A, no external tracker.
- Non-goals: no app implementation, no sync status JSON edits, no new command
  beyond clearer `status` semantics.

Output budget strategy:
- Read only the status section and verify with scoped `rg`/`sed`; avoid broad
  diffs or generated output dumps.

Blocked condition:
- Block only if Skiller regeneration via `pnpm install` fails or source and
  generated skill cannot be made consistent.

Task state:
- task_type: agent rule update
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented
- confidence: high
- next owner: user
- reason: source rule and generated skill now require status to show
  reviewable differences separately from landed and settled items

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-status-differences.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `sync-shadcn` source rule status section and generated skill mirror. |
| Active goal checked or created | yes | Active goal created for status difference reporting update. |
| Source of truth read before edits | yes | `.agents/rules/sync-shadcn.mdc` read before edits. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent rule wording update. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug. |
| Branch decision for code-changing task | yes | N/A: no branch or PR requested; edited current checkout. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser-visible app change. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Scoped source/generated reads and `rg` verification only. |
| Agent-native pack selected | yes | Applied because `.agents/rules/**` and generated skill behavior changed. |
| Agent-facing action surface identified | yes | `sync-shadcn status` command semantics. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/sync-shadcn.mdc`; regenerated `.agents/skills/sync-shadcn/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; no actionable parity findings for this command-text change. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
| Named verification threshold | yes | Run named source/generated checks | `pnpm install`, `rg` verification, and `git diff --check` passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: command instruction improvement, not bug. |
| Targeted behavior verification | yes | Verify changed behavior is discoverable in skill text | Source and generated skill both contain `Reviewable differences` and scoped status filter instructions. |
| TypeScript or typed config changed | no | Run relevant typecheck or record N/A | N/A: markdown/rule text only. |
| Package exports or file layout changed | no | Run `pnpm brl` or record N/A | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run install checks or record N/A | `pnpm install` ran only to regenerate skills; no package graph change needed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran Skiller successfully; generated skill contains new status text. |
| Workspace authority proof | yes | Run proof in owning workspace | All commands ran from `/Users/zbeyens/git/plate`. |
| Browser surface changed | no | Capture browser proof or record N/A | N/A: no app UI changed. |
| Browser final proof | no | Attach screenshot/caveat or record N/A | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore output or record N/A | N/A: no templates touched. |
| Package behavior or public API changed | no | Add changeset or record N/A | N/A: agent rule only. |
| Registry-only component work changed | no | Update changelog or record N/A | N/A. |
| Docs or content changed | no | Verify or record N/A | N/A: internal agent rule and generated skill only. |
| High-risk mini gate | yes | Record failure mode and proof | Risk: future status hides undecided visual deltas; proof text now requires reviewable differences bucket. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Reviewer loaded; no actionable findings because the change improves command discoverability and does not add hidden UI-only action. |
| Local install corruption suspected | no | Retry reinstall or record N/A | N/A: no surprising failure. |
| Autoreview for non-trivial implementation changes | no | Run review or record N/A | N/A: narrow instruction-only update with agent-native review gate. |
| PR create or update | no | Run check before PR work or record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body or record N/A | N/A: no PR. |
| PR proof image hosting | no | Host images or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run scoped equivalent | `git diff --check` passed for touched files. |
| Output budget discipline | yes | Verify scoped output | Used targeted source/generated reads and `rg`; no broad output dump. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-status-differences.md` | To run after this fill. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` and `rg` verification passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated `SKILL.md` includes scoped status filter and reviewable-differences output. |
| Agent-native review | yes | Load reviewer and close accepted findings | Loaded; no findings accepted. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source rule status section read. | implementation |
| Implementation | complete | Source rule patched; generated skill regenerated. | verification |
| Verification | complete | `pnpm install`, `rg`, and `git diff --check` passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan filled; final response ready after completion check. | final response |

Findings:
- `sync-shadcn status` previously exposed deferred entries but did not force a
  clear Plate-vs-shadcn difference bucket.
- That made a visual gap like BlockViewer toolbar parity too easy to bury under
  generic "deferred" text.

Decisions and tradeoffs:
- Added `Reviewable differences` instead of listing every exclusion again.
  Settled exclusions stay quiet by default; undecided or deferred visual deltas
  are surfaced for user decisions.

Implementation notes:
- Source rule now supports scoped status tails such as `status our /editors vs
  shadcn /blocks`.
- Status output shape now includes `Partial syncs`, `Reviewable differences`,
  and `Deferred decisions`.
- Example explicitly covers BlockViewer toolbar parity.

Review fixes:
- Agent-native review gate loaded; no actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |

Verification evidence:
- `pnpm install` passed and Skiller regenerated the Codex skill mirror.
- `rg -n "Reviewable differences|Status must distinguish|status scope filter|do not hide reviewable" .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md` found the new text in both source and generated skill.
- `git diff --check -- .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md docs/plans/2026-05-29-sync-shadcn-status-differences.md` passed.

Reboot status:
- Current and complete as of 2026-05-29: source rule updated, generated skill
  synced, verification passed, final handoff remains.

Open risks:
- None for this instruction update.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; source and generated skill verified.
- Flow table:
  - Reproduced: N/A for bug repro.
  - Verified: `pnpm install`, source/generated `rg`, and `git diff --check`.
- Browser check: N/A, no app UI changed.
- Outcome: `sync-shadcn status` now has explicit reviewable-differences semantics.
- Caveat: This changes agent instructions, not a parser or standalone CLI.
- Design:
  - Chosen boundary: source rule plus generated skill mirror.
  - Why not quick patch: editing generated `SKILL.md` directly would be overwritten.
  - Why not broader change: no need to alter app sync status artifacts or implementation code.
- Verified: `pnpm install`, `rg`, `git diff --check`.
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
- Caveats: instruction-only change; status still requires an agent to read the
  plan/status artifacts.

Timeline:
- 2026-05-29T20:28:00.091Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make `sync-shadcn status` show reviewable differences for re-decisions |
| What have I learned? | Status needed a distinct bucket beyond landed/deferred |
| What have I done? | Patched source rule, regenerated skill, verified text |

Open risks:
- None.
