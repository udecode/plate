# release lanes autogoal workflow

Objective:
Repair beta/latest release lanes; done when main is merged, agent-owned
release-lanes workflow is implemented, generated skills synced, and focused
release tests pass.

Goal plan:
docs/plans/2026-06-16-release-lanes-autogoal-workflow.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request + PR follow-up
- id / link: https://github.com/udecode/plate/pull/5030
- title: Replace PR-only main-to-next sync with agent-owned release lanes
- acceptance criteria:
  - work on `codex/upstream-beta-release-workflows`
  - merge current `origin/main` into the branch
  - keep CI release channel guards for `main`/`next`
  - remove or demote automatic `main -> next` sync PR automation
  - add a robust derived autogoal skill/template for direct beta/latest lane maintenance
  - support mostly automated sync, conflict repair, release watching, and verification
  - sync generated agent skill output
  - verify focused release workflow tests

Completion threshold:
- `origin/main` is merged into the branch.
- Release CI no longer owns routine `main -> next` sync PR creation.
- A `release-lanes` derived skill and `docs/plans/templates/release-lanes.md`
  define the fully automated direct-sync lane.
- Existing `promote-beta` entrypoints are replaced or routed to the release-lanes
  workflow.
- Generated `.agents/skills/**` output is synced from `.agents/rules/**`.
- Focused release workflow/script tests, `pnpm install`, and lint pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-release-lanes-autogoal-workflow.md` passes.

Verification surface:
- `git merge origin/main`
- `pnpm install`
- focused release tests, expected:
  `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs tooling/scripts/prepare-release-changesets.test.mjs`
- `pnpm lint:fix`
- source audit for `sync-main-to-next`, `promote-beta`, `release-lanes`, and generated skill mirrors
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-release-lanes-autogoal-workflow.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request, PR #5030 diff, Better Auth release-lane reference as supporting pattern, current repo release scripts.
- Allowed edit scope: `.agents/rules/**`, generated `.agents/skills/**`, `.claude/skills/**`, `.github/workflows/**`, `tooling/scripts/**`, `package.json`, `docs/plans/templates/**`, focused tests.
- Browser surface: N/A, release workflow/tooling only.
- Tracker sync: update PR #5030 if verification passes.
- Non-goals: do not publish npm packages, do not run real promote/release workflows, do not mutate `main` or `next` remotely during implementation.

Output budget strategy:
- Use targeted `git show`, `git diff`, `rg`, and focused `sed` ranges. Avoid
  dumping full generated docs, package changelogs, or workflow logs.

Blocked condition:
- Stop only if merging `origin/main` produces real source conflicts outside
  known release/workflow files, focused tests expose a release safety hole that
  needs a product decision, or GitHub/npm credentials are required for a live
  release action.

Task state:
- task_type: release workflow / agent skill refactor
- task_complexity: non-trivial auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_completion

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: PR #5030 has useful channel guards, but PR-only sync is the wrong
  ownership boundary for frequent release metadata conflicts; direct agent-owned
  lane maintenance should own that repair loop.

Pre-solution issue challenge:
- reporter claim: PR-only `main -> next` sync will create too many conflict-review loops.
- suggested diagnosis or fix: robust autogoal-backed skill/template should sync directly and automate the lane.
- repro ladder:
  - tests / source-level repro: N/A: release workflow architecture change, not a bug repro
  - Playwright / automated browser: N/A: no browser surface
  - Browser plugin: N/A: no browser surface
  - screenshot / visual proof: N/A: no visual surface
- reproduction verdict: N/A: design correction, not a reported runtime bug
- validity verdict: valid
- best long-term fix boundary: derived `release-lanes` skill/template plus focused scripts/tests; CI keeps publish guards only
- harsh honest feedback: PR-only sync is review theater for deterministic release metadata churn.
- hard-stop decision: no hard stop; implement the pivot.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-release-lanes-autogoal-workflow.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used autogoal; re-read `.agents/skills/autogoal/SKILL.md` before closeout. |
| Active goal checked or created | yes | `get_goal` showed active goal for this plan and objective. |
| Source of truth read before edits | yes | User request, PR #5030, release workflows, release scripts, and generated agent skill/rule boundary read. |
| Tracker comments and attachments read | yes | PR #5030 inspected with `gh pr view 5030`; no visual attachments needed for release tooling. |
| Video transcript evidence required | N/A: no video source | Release workflow/tooling task has no video or screen recording input. |
| Pre-solution issue challenge required | yes | Recorded as design correction: PR-only sync is validly rejected for deterministic release metadata conflicts. |
| Reproduction verdict before implementation | N/A: architecture correction | No runtime bug claim; source-level workflow audit was the honest proof surface. |
| Repro escalation ladder selected | yes | Tests/source audit only; Playwright, Browser, and screenshot are N/A because no browser surface changed. |
| Suggested fix reviewed against durable boundary | yes | Accepted direct agent-owned release-lanes workflow; rejected routine CI-created sync PR. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: release lane workflow | Existing release scripts/workflows were the owning source of truth. |
| TDD decision before behavior change or bug fix | yes | Release workflow tests were updated around direct sync, beta pre mode, versioning, and verifier behavior. |
| Branch decision for code-changing task | yes | Continued on `codex/upstream-beta-release-workflows`, PR #5030 branch. |
| Release artifact decision | yes | No changeset: CI/workflow/agent tooling only, no package runtime/API release. |
| Browser tool decision for browser surface | N/A: no browser surface | No route, UI, console, network, or visual behavior changed. |
| PR expectation decision | yes | PR #5030 is open; PR body sync required after passing `pnpm check`. |
| Tracker sync expectation decision | yes | PR body sync only; no separate issue/Linear tracker. |
| Output budget strategy recorded | yes | Plan records targeted `git`, `rg`, and focused file reads; broad output avoided except required `pnpm check`. |
| Agent-native pack selected | yes | `agent-native` pack applied because `.agents/**`, `.claude/**`, AGENTS, and skill text changed. |
| Agent-facing action surface identified | yes | `release-lanes` skill/rule owns promote, direct sync, beta pre-mode, and release verification. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/*.mdc` and `docs/plans/templates/*.md` are source; `.agents/skills/**` generated by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Agent-native review performed in the review loop; accepted findings fixed. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check`; focused release tests; direct-sync dry run; source audit; `pnpm install`; `pnpm lint:fix`. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Verdict valid: PR-only sync is wrong for frequent release metadata conflicts; durable boundary is `release-lanes`. |
| Repro escalation ladder | N/A: architecture correction | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | No bug repro; source audit and release tests are owning proof. |
| Bug reproduced before fix | N/A: no runtime bug | Record failing test/repro or N/A with reason | Workflow ownership correction, not a user-visible runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs tooling/scripts/prepare-release-changesets.test.mjs` passed 38 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm check` ran package build/typecheck: 54 successful build tasks and 54 successful typecheck tasks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or barrel-owned layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; lockfile already up to date; Skiller and MDX postinstall completed. `pnpm check` passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated/synced skills; `git status --short` clean after install. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | Release workflows/scripts/skills only. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No route or UI changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | No `templates/**` output changed in this task. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | No package runtime/API release; no changeset needed. |
| User-visible registry output changed | N/A: no registry output | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | No registry docs/output changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Agent/release workflow docs only; source-backed by release scripts/workflows and generated skills. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: direct sync could publish wrong beta metadata or sweep dirty files; tests cover beta pre mode, versioning before commit, verifier safety, and clean-worktree guard. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Review loop accepted/fixed direct-sync release safety and agent action discoverability findings. |
| Local install corruption suspected | N/A: no install corruption | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local-env-rot failure shape remained after normal checks. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final autoreview passed clean with focused release tests. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed before PR body update. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5030 --json body` shows `🐛 Fixes ➖ N/A`, `🟢 95-100% confidence`, the required phase table, bold emoji sections, no current-PR self-link, and no auto-release block needed. |
| PR proof image hosting | N/A: no browser proof | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No screenshots required. |
| Tracker sync-back | N/A: PR only | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No separate issue/Linear tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad reads were scoped; required `pnpm check` output was capped and polled. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-release-lanes-autogoal-workflow.md` | Passed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `.agents/skills/release-lanes/SKILL.md` and `promote-beta` mirror source rules. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` shows release-lanes in `.agents/AGENTS.md`, `AGENTS.md`, `.agents/rules/release-lanes.mdc`, generated skills, workflows, and tests. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Accepted findings fixed; final review clean. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #5030 and release workflow/script/agent-skill boundaries read. | done |
| Implementation | complete | `release-lanes` source rule/template added, `promote-beta` shimmed, CI sync PR job removed, direct sync script hardened. | done |
| Verification | complete | `pnpm install`, focused tests, dry run, lint, `pnpm check`, and source audit passed. | done |
| PR / tracker sync | complete | PR body update/verification recorded below; no separate tracker. | final response |
| Closeout | complete | Goal plan check passed; final response remains. | final response |

Findings:
- PR-only `main -> next` sync is the wrong ownership boundary because the
  high-friction part is deterministic release metadata repair, not PR review.
- Direct sync must not just merge: it has to restore beta pre mode, generate
  beta changesets for public package changes, run `pnpm ci:version`, and verify
  release metadata before push.
- A direct sync without a clean-worktree guard could sweep unrelated local files
  into `next`; the real `--push` path now refuses dirty checkouts.
- Generated skill output must stay derived from `.agents/rules/**`; `pnpm
  install` is the sync step.

Decisions and tradeoffs:
- Use `release-lanes` as the durable owner for latest/beta maintenance; keep
  `promote-beta` only as a compatibility shim.
- Remove routine CI sync PR creation; keep CI focused on publish guards and
  verification.
- Keep direct sync script-driven, not prompt-only, because merge/version/pre-mode
  safety must be testable.
- Do not run real `sync-main-to-next --push`; dry run plus unit tests prove the
  behavior without mutating `next`.

Implementation notes:
- `.agents/rules/release-lanes.mdc` and `docs/plans/templates/release-lanes.md`
  define the agent-owned release lane.
- `.agents/rules/promote-beta.mdc` routes old prompts into `release-lanes`.
- `.github/workflows/release.yml` no longer opens routine main-to-next sync PRs.
- `.github/workflows/promote.yml` tells maintainers to run release-lanes after
  latest publish.
- `tooling/scripts/release-branch-prs.mjs` direct sync owns beta pre-state,
  generated changesets, versioning, dirty-worktree guard, and verifier safety.
- `tooling/scripts/release-workflow.test.mjs` covers the release-lane contract.

Review fixes:
- Accepted autoreview P1: `[skip release]` on versioned sync commits would block
  beta publishing. Fixed with dynamic commit message: skip only when no beta
  changesets are generated.
- Accepted autoreview P1: sync after promote could fail because beta pre mode
  was absent. Fixed by creating/restoring `.changeset/pre.json` in the sync
  commit.
- Accepted autoreview P2: generated changesets alone would create a Version
  Packages PR instead of publishing. Fixed by running `pnpm ci:version` before
  committing direct sync metadata.
- Accepted autoreview P1/P2: verifier was too loose for prerelease manifest and
  changelog differences. Fixed with stricter package/changelog validation.
- Accepted autoreview P1: real direct sync could sweep dirty local checkout
  changes. Fixed with clean-worktree guard before mutating `next`.
- Final autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Release-skip logic was too broad | 1 | Make commit message depend on whether beta changesets were generated | Fixed and covered by tests. |
| Beta pre-mode assumption was too weak | 1 | Restore pre-state in script instead of relying on repo state | Fixed and covered by tests. |
| Generated changesets were not enough to publish beta | 1 | Version before commit in direct sync | Fixed and covered by tests. |

Verification evidence:
- `git log --oneline --decorate -5` shows merge commit `8c2998f2a9` from
  `origin/main` and head `5faed37f9d` on `codex/upstream-beta-release-workflows`.
- `pnpm install` passed in `/Users/zbeyens/git/plate`; lockfile up to date,
  Skiller apply completed, MDX postinstall completed.
- `pnpm lint:fix` passed in `/Users/zbeyens/git/plate`; no fixes applied.
- `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs tooling/scripts/prepare-release-changesets.test.mjs`
  passed 38 tests in `/Users/zbeyens/git/plate`.
- `node tooling/scripts/release-branch-prs.mjs sync-main-to-next --dry-run`
  passed in `/Users/zbeyens/git/plate`; dry run would restore beta pre mode,
  run `pnpm ci:version`, commit `chore: sync main to next`, and avoid pushing.
- `pnpm check` passed in `/Users/zbeyens/git/plate`; lint emitted one
  pre-existing sidebar hook warning, build/typecheck succeeded for 54 tasks,
  fast/slow/slowest test suites passed.
- Source audit with `rg -n "sync-main-to-next|mainToNextSyncBranch|main-to-next-sync|release-lanes|promote-beta" .agents AGENTS.md .github tooling/scripts docs/plans/templates/release-lanes.md`
  shows `release-lanes` discoverability, `promote-beta` compatibility, no old
  sync PR branch builder, and only negative test references for the removed CI job.
- `git status --short` was clean after `pnpm install` and verification.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-release-lanes-autogoal-workflow.md`
  passed.

Final handoff contract:
- PR line: PR #5030, branch `codex/upstream-beta-release-workflows`.
- Issue / tracker line: N/A, PR-only workflow task.
- Confidence line: 95-100% confidence.
- Flow table:
  - Reproduced: source/review proved PR-only sync would create conflict churn; browser N/A.
  - Verified: focused release tests, dry run, `pnpm install`, `pnpm lint:fix`,
    `pnpm check`, source audit; browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: release maintenance is agent-owned through `release-lanes`; CI no
  longer opens routine main-to-next sync PRs.
- Caveat: real `sync-main-to-next --push` refuses dirty checkouts before
  mutating `next`.
- Design:
  - Chosen boundary: derived `release-lanes` skill/template plus tested release scripts.
  - Why not quick patch: caller-by-caller sync instructions would still miss
    beta pre-state, versioning, and verifier safety.
  - Why not broader change: publishing remains CI-owned; the agent owns only
    deterministic lane maintenance.
- Verified: `pnpm check`; focused release tests; direct sync dry run; source audit; autoreview clean.
- PR body verified: `gh pr view 5030 --json body` confirmed task-style body, no self-link, and no auto-release block needed.

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
- PR: #5030 body updated to task-style format after `pnpm check`.
- Issue / tracker: N/A.
- Browser proof: N/A, no browser surface.
- Caveats: Dirty checkout guard is intentional for real direct sync pushes.

Timeline:
- 2026-06-16T14:44:42.519Z Task goal plan created.
- 2026-06-16 Merged `origin/main` into `codex/upstream-beta-release-workflows`.
- 2026-06-16 Added `release-lanes` source rule/template and generated skill mirrors.
- 2026-06-16 Removed CI-owned routine `main -> next` sync PR automation.
- 2026-06-16 Hardened direct sync with beta pre-state restoration, generated
  beta changesets, versioning before commit, verifier safety, and dirty guard.
- 2026-06-16 `pnpm install`, focused release tests, dry run, `pnpm lint:fix`,
  `pnpm check`, and source audit passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Commit/push plan update, mark goal complete, final response. |
| What is the goal? | Repair beta/latest release lanes with agent-owned `release-lanes`, merged main, synced generated skills, and passing release tests. |
| What have I learned? | Direct sync must own beta metadata repair and safety checks; CI should not create routine sync PR churn. |
| What have I done? | Implemented release-lanes workflow, removed sync PR automation, verified scripts/tests/checks, and recorded evidence. |

Open risks:
- None blocking. Residual operational risk is intentional: live `sync-main-to-next --push`
  is not run by this PR and must be run by the `release-lanes` workflow when a
  real sync is needed.
