# skill wrapper cleanup

Objective:
Clean skill wrappers; done when commit-wrapper skills are gone, diagnosing-bugs is installed, sync/audits pass; plan docs/plans/2026-06-18-skill-wrapper-cleanup.md.

Goal plan:
docs/plans/2026-06-18-skill-wrapper-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat request
- title: remove git commit wrapper skills and add diagnosing-bugs
- acceptance criteria:
  - remove stale command-wrapper skills: `git-commit`, `git-commit-push-pr`, and any present CE worktree/commit equivalents;
  - add `diagnosing-bugs` with `npx skills add`;
  - sync generated skill mirrors and lockfiles through the Skills CLI;
  - update repo guidance only if stale command-wrapper routing remains;
  - run each repo's generated-sync command when AGENTS requires it;
  - audit configured repos plus the current repo for removed wrappers and installed `diagnosing-bugs`;
  - do not commit or push downstream repos.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A, no duration requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- In `/Users/zbeyens/git/better-convex`, `/Users/zbeyens/git/plate`,
  `/Users/zbeyens/git/informed-fe-v3`, and `/Users/zbeyens/git/plate-2`,
  installed skill state has no `git-commit`, `git-commit-push-pr`,
  `ce-commit`, `ce-commit-push-pr`, `git-clean-gone-branches`,
  `git-worktree`, `ce-worktree`, or matching generated skill folders when those
  skills were present.
- `diagnosing-bugs` is installed with `npx skills add` in the same repos.
- Generated mirrors and `skills-lock.json` agree after repo sync commands.
- Any remaining `debug`/bug-diagnosis wording is either a normal word or an
  explicit `diagnosing-bugs` skill reference, not stale `debug` skill routing.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skill-wrapper-cleanup.md` passes.

Verification surface:
- `npx skills remove <wrapper> -y` and `npx skills add <source> --skill diagnosing-bugs --agent '*' -y`
  in each target repo.
- repo generated-sync commands: `bun install` or `pnpm install` per repo.
- lock/generated audits with Node and `find`/`rg`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skill-wrapper-cleanup.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: installed `skills-lock.json`, generated `.agents/skills/**`
  and `.claude/skills/**`, `.agents/AGENTS.md` / `.agents/rules/**` only for
  stale routing text, and the local plan file.
- Allowed edit scope: configured downstream repos from `~/.agents/config.json`
  plus current `/Users/zbeyens/git/plate-2`, Skills CLI lock/generated changes,
  generated sync output, and stale guidance cleanup.
- Browser surface: N/A, no app/browser UI changed.
- Tracker sync: N/A, no issue/PR tracker mutation requested.
- Non-goals: no downstream commits, no PRs, no product-code changes, no
  wholesale CE/Matt skill import beyond `diagnosing-bugs`.

Output budget strategy:
- Scope audits to skill names, lockfiles, generated skill folders, AGENTS/rules,
  and configured repos. Cap command output; avoid full repo dumps and generated
  product trees.

Blocked condition:
- Stop if `diagnosing-bugs` cannot be installed from a real source with the
  Skills CLI, or if a target repo has a repo-local command-wrapper source that
  conflicts with deletion and cannot be safely removed without user choice.

Task state:
- task_type: cross-repo agent skill cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: sync-skills
- reason: requested cleanup is implemented and verified across the configured repos plus current repo.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skill-wrapper-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above list wrapper removals, diagnosing-bugs install, sync/audit, no commits, and non-goals. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `sync-skills`, `autogoal`, current `.agents/AGENTS.md`, global sync config, and initial lock inventory. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this goal. |
| Source of truth read before edits | yes | Read lock inventory for four target repos and found only `git-commit` / `git-commit-push-pr` present. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: installed skill topology, not product-code task. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no downstream commits/PRs requested. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker mutation. |
| Output budget strategy recorded | yes | Audits scoped to skill names, generated folders, lockfiles, and guidance files. |
| Agent-native pack selected | yes | Installed skills and agent guidance are user-action tooling. |
| Agent-facing action surface identified | yes | Generated skills, lockfiles, and `.agents/AGENTS.md` routing are the action surface. |
| Source rule versus generated mirror boundary identified | yes | External installed skills are managed via `npx skills`; local rules are source only if stale guidance needs edits. |
| `agent-native-reviewer` loaded or waiver recorded | no | Waiver: sync-skills methodology plus lock/generated audits are the direct governing review for this topology cleanup. |

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
      N/A with reason. N/A: no package release artifact.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no commits or PRs requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot failure.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `npx skills` remove/add ran; generated sync commands passed; final lock/generated/source audits passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill topology cleanup, not a bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Node audit verifies removed wrappers absent and `diagnosing-bugs` installed in `.agents` and `.claude`. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS source/config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/barrels. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Ran repo sync/install commands: better-convex `bun install`, plate `pnpm install`, informed-fe-v3 `bun install`, plate-2 `pnpm install`. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Source rules patched where stale; generated sync/install commands passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Proof ran against each target repo's own `skills-lock.json`, `.agents/skills`, `.claude/skills`, and generated AGENTS/rules. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package public API change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no product docs/content; only agent guidance. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agents call removed git wrappers. Proof: stale routing text is gone and locks/generated folders have no wrappers. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waiver: this is a sync-skills topology cleanup; lock/generated/source audits are the direct review. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local install corruption. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: no product implementation; sync-skills audits own this cleanup. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: skill lock/generated sync; repo install/sync and audits are the proof. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One over-broad `rg` streamed too much; stopped and replaced with bounded Node/source audits. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skill-wrapper-cleanup.md` | Final closeout command follows this evidence write. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Generated sync/install commands passed in all four repos. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `diagnosing-bugs` has generated `.agents` and `.claude` skill files; stale wrapper names absent from source guidance and lockfiles. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waiver: source/lock/generated audits are sufficient for this topology sync. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read sync-skills/autogoal/current AGENTS/global config/lock inventory | implementation complete |
| Implementation | complete | removed wrapper skills, added diagnosing-bugs, patched stale source guidance, repaired stale lock rows after CLI proof | verification complete |
| Verification | complete | install/sync commands and final lock/generated/source audits passed | closeout |
| PR / tracker sync | n/a | no PR/tracker requested | final response |
| Closeout | complete | plan filled; final checker command follows | final response |

Findings:
- Plain `npx skills add diagnosing-bugs` is invalid because the CLI requires a source; the real source is `mattpocock/skills`.
- Only `git-commit` and `git-commit-push-pr` were still locked in better-convex, plate, and plate-2. `informed-fe-v3` instead had generated `git-clean-gone-branches` and `git-worktree`; those were removed too.
- The Skills CLI again removed generated wrapper skills but left stale `skills-lock.json` rows for `git-commit` / `git-commit-push-pr` in three repos.
- All four repos now have `diagnosing-bugs` from `mattpocock/skills` in both `.agents/skills` and `.claude/skills`.

Decisions and tradeoffs:
- Do not install a replacement `debug` skill. Keep bug diagnosis as `task`/`auto` default behavior, with `diagnosing-bugs` available when explicitly invoked or when the named skill triggers.
- Remove command-wrapper routing from source rules. Git/PR mechanics now live in repo git rules and direct `git`/`gh` commands.
- Add `diagnosing-bugs` to `/Users/zbeyens/.agents/config.json` so future global refreshes keep it managed.

Implementation notes:
- Ran `npx skills remove git-commit -y` and `npx skills remove git-commit-push-pr -y` in better-convex, plate, informed-fe-v3, and plate-2.
- Ran `npx skills add mattpocock/skills --skill diagnosing-bugs --agent '*' -y` in all four repos.
- Removed old generated `git-clean-gone-branches` and `git-worktree` from informed-fe-v3 with `npx skills remove`.
- Patched `.agents/rules/major-task.mdc` and `.agents/rules/task.mdc` in all four repos to remove `git-commit-push-pr` routing.
- Patched plate `.agents/rules/slate-ar-ship.mdc` to use normal repo `git` commands instead of delegating to `git-commit`.
- Removed stale `git-commit` and `git-commit-push-pr` lock rows mechanically only after the CLI reported no matching generated skills left.
- Ran generated sync commands: better-convex `bun install`, plate `pnpm install`, informed-fe-v3 `bun install`, plate-2 `pnpm install`.

Review fixes:
- Replaced stale PR-body wording that referenced `git-commit-push-pr` with generic git-helper wording.
- Added `diagnosing-bugs` to the global sync config after install so the new skill remains part of future syncs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `npx skills add diagnosing-bugs` | 1 | Query the real source package with `npx skills add mattpocock/skills --list` | Installed with `npx skills add mattpocock/skills --skill diagnosing-bugs --agent '*' -y`. |
| Skills CLI removed generated wrapper skills but left stale lock rows | 3 repos | Re-run remove to prove no matching skill remains, then remove only dead lock entries | Final lock audit has no wrapper rows. |
| Over-broad `rg` audit streamed generated/reference noise | 1 | Stop broad output and use bounded Node/source audits | Final audits are scoped and pass. |

Verification evidence:
- `npx skills add mattpocock/skills --list | rg diagnosing-bugs` proved source availability.
- `npx skills remove ...` and `npx skills add mattpocock/skills --skill diagnosing-bugs --agent '*' -y` ran in all four repos.
- Repo sync commands passed: better-convex `bun install`, plate `pnpm install`, informed-fe-v3 `bun install`, plate-2 `pnpm install`.
- Final Node audit passed: no wrapper lock rows, no wrapper generated folders, `diagnosing-bugs` source is `mattpocock/skills`, and `.agents`/`.claude` generated files exist in all four repos.
- Final source audit passed: no `git-commit`, `git-commit-push-pr`, CE commit/worktree wrapper names remain in `.agents/AGENTS.md`, `.agents/rules`, root `AGENTS.md`, or `skills-lock.json` for the four target repos.
- Global config JSON parse passed and now includes `diagnosing-bugs: mattpocock/skills`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high; all requested installs/removals/sync audits passed.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: Skills CLI commands, repo sync commands, lock/generated audits, source audits.
- Browser check: N/A, no browser surface.
- Outcome: command-wrapper skills are gone from installed state and source guidance; `diagnosing-bugs` is installed and tracked.
- Caveat: downstream repos are left dirty with skill/guidance changes; no downstream commits were requested. informed-fe-v3 still reports unrelated unmanaged legacy skill warnings during Skiller apply.
- Design:
  - Chosen boundary: direct `git`/`gh` commands plus repo rules own commit/PR mechanics; `diagnosing-bugs` is a worker skill, not the default task router.
  - Why not quick patch: deleting generated folders alone leaves stale lock/source routing that resurrects bad behavior.
  - Why not broader change: full CE/Matt skill cleanup is larger topology work; this pass only removed command wrappers and added `diagnosing-bugs`.
- Verified: final Node audit and source audit pass in all four repos.
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
- Caveats: downstream repos are dirty by request; no commits/pushes were made.

Timeline:
- 2026-06-18T11:57:24.950Z Task goal plan created.
- 2026-06-18 Installed `diagnosing-bugs` from `mattpocock/skills` in four repos.
- 2026-06-18 Removed generated git command-wrapper skills and stale source routing.
- 2026-06-18 Repaired stale lock rows after CLI no-match proof.
- 2026-06-18 Ran repo sync/install commands and final audits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after passing final audits |
| Where am I going? | Run check-complete, then final response |
| What is the goal? | Remove command-wrapper skills and add diagnosing-bugs across the target repos |
| What have I learned? | The Skills CLI still can leave stale lock rows after generated removal; final lock audits are mandatory |
| What have I done? | See Timeline and Verification evidence |

Open risks:
- None for the requested wrapper removal and `diagnosing-bugs` install. Separate out-of-scope debt: informed-fe-v3 still has many unmanaged legacy skills reported by Skiller.
