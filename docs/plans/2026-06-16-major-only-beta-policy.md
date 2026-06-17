# major only beta policy

Objective:
Correct release lane policy to major-only beta; done when workflows/docs/tests allow minor on main and block only major.

Goal plan:
docs/plans/2026-06-16-major-only-beta-policy.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user correction on PR #5030 release-lane policy
- id / link: https://github.com/udecode/plate/pull/5030
- title: Minor releases stay on main; beta/next is only for majors
- acceptance criteria:
  - `main` accepts patch and minor changesets
  - `next`/beta lane is only for major changesets
  - `release/**` remains patch-only unless source proves otherwise
  - `auto-retarget` retargets only major changesets, or is deleted if redundant
  - `verify-changesets` blocks major on `main`, not minor
  - release-lanes source docs/template/generated skills/tests say major-only beta
  - focused release workflow tests pass

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.github/workflows/auto-retarget.yml` is removed and tests prove it stays
  removed.
- `.github/workflows/verify-changesets.yml` allows minor changesets on `main`
  and blocks major changesets on `main` / `release/**`.
- `release-lanes` rule/template/generated skill language says major-only beta.
- Focused release workflow tests prove minor-on-main allowed and major-on-main
  blocked, minor-on-next blocked, mixed major+minor-on-next blocked, and
  `release/**` patch-only preserved.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-major-only-beta-policy.md` passes.

Verification surface:
- `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs`
- `pnpm install` if `.agents/rules/**` changes
- `pnpm lint:fix`
- source audit for stale "minor and major" / "non-patch" release-lane language
- `gh pr view 5030 --json body` after PR body update
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-major-only-beta-policy.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user correction in this thread, existing release workflows,
  release-lanes rule/template, release workflow tests.
- Allowed edit scope: `.github/workflows/auto-retarget.yml`,
  `.github/workflows/verify-changesets.yml`, `.agents/rules/**`,
  generated `.agents/skills/**`, `docs/plans/templates/release-lanes.md`,
  `tooling/scripts/*release*test*.mjs`, this goal plan, PR #5030 body.
- Browser surface: N/A, GitHub workflow/script/agent policy only.
- Tracker sync: PR #5030 body update only.
- Non-goals: do not publish packages, do not mutate `main`/`next`, do not run
  live release/promotion workflows.

Output budget strategy:
- Use focused file reads and `rg` counts/matches for release policy strings;
  cap test/check output and avoid streaming generated artifacts.

Blocked condition:
- Stop only if the user reverses the release policy or repo tests reveal a
  release-lane invariant conflict that needs a policy decision.

Task state:
- task_type: release workflow / agent policy correction
- task_complexity: non-trivial auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_completion

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: Current PR policy treated minor as beta/next-only; user corrected that
  beta is only for major releases.

Pre-solution issue challenge:
- reporter claim: Minor releases should be allowed on `main`; beta is only major.
- suggested diagnosis or fix: Update workflow policy from minor+major to major-only.
- repro ladder:
  - tests / source-level repro: source audit found current workflow/tests language targets minor+major to `next`
  - Playwright / automated browser: N/A, no browser surface
  - Browser plugin: N/A, no browser surface
  - screenshot / visual proof: N/A, no visual surface
- reproduction verdict: N/A: policy correction, not runtime bug
- validity verdict: valid
- best long-term fix boundary: workflow policy + release-lanes source docs + focused release tests
- harsh honest feedback: Current policy is too conservative; it turns normal
  minor releases into beta churn for no good reason.
- hard-stop decision: no hard stop; implement major-only beta.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-major-only-beta-policy.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | N/A: no duration | User did not request a timed run. |
| Skill analysis before edits | yes | Read `autogoal` and `task` skills. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created goal for this plan. |
| Source of truth read before edits | yes | User correction and current workflow/test/source policy read. |
| Tracker comments and attachments read | yes | PR #5030 is tracker surface; body already known from prior update, no attachments relevant. |
| Video transcript evidence required | N/A: no video | No video/screen recording source. |
| Pre-solution issue challenge required | yes | Validity recorded above. |
| Reproduction verdict before implementation | N/A: policy correction | No runtime bug; source-level policy mismatch found. |
| Repro escalation ladder selected | yes | Source/test audit only; browser layers N/A. |
| Suggested fix reviewed against durable boundary | yes | Durable boundary is workflows + release-lanes source + tests, not only PR body text. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: release workflow policy | Owning source is current workflow/scripts/tests. |
| TDD decision before behavior change or bug fix | yes | Update workflow tests to encode minor-on-main and major-only beta. |
| Branch decision for code-changing task | yes | Continue PR #5030 branch. |
| Release artifact decision | yes | No package runtime/API changes; no changeset. |
| Browser tool decision for browser surface | N/A: no browser surface | Workflow/script/agent docs only. |
| PR expectation decision | yes | PR #5030 body must be updated after verification. |
| Tracker sync expectation decision | yes | PR #5030 body only; no separate issue/Linear sync. |
| Output budget strategy recorded | yes | Recorded above. |
| Agent-native pack selected | yes | `.agents/rules/**` / generated skill docs likely change. |
| Agent-facing action surface identified | yes | `release-lanes` skill/rule/template. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install` to sync `.agents/skills/**`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Will load before closeout because agent action policy changes. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check`, focused release tests, source audit, `pnpm install`, `pnpm lint:fix`, autoreview clean. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid: current policy was too strict for minors and too loose for direct minor-to-next edge cases. |
| Repro escalation ladder | N/A: policy correction | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | No runtime/browser repro; source/test audit is the owning proof. |
| Bug reproduced before fix | N/A: no runtime bug | Record failing test/repro or N/A with reason | Workflow policy correction. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs` passed 34 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm check` passed build/typecheck. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports/barrels changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed after rule changes; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` synced `.agents/skills/release-lanes/SKILL.md` from `.agents/rules/release-lanes.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | Workflow/script/agent text only. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No browser route or UI changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | No `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | No package runtime/API change; no changeset. |
| User-visible registry output changed | N/A: no registry output | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | No registry output changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | Release-lanes template/rule only; no public docs/content route. Source-backed by workflow/test policy. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: minor could still route to beta via `next` or mixed major+minor PR; fixed by checking all release types and blocking minor on `next`. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded; release-lanes action remains discoverable in source/generated skill. |
| Local install corruption suspected | N/A: no install corruption | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local-env-rot failure shape. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final autoreview clean; two accepted findings fixed first. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed before PR body update. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5030 --json body,url,headRefName` read back `🐛 Fixes ➖ N/A`, `🟢 95-100% confidence`, the required table, and the bold emoji sections; no current-PR self-link and no auto-release block needed. |
| PR proof image hosting | N/A: no browser proof | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No browser proof/image required. |
| Tracker sync-back | N/A: PR only | Post concise issue/Linear sync after PR exists, or record N/A/blocker | PR body sync only. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes left. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused reads/searches; full `pnpm check` output capped and polled. |
| Timed checkpoint | N/A: no duration | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | User gave no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-major-only-beta-policy.md` | Passed: `[autogoal] complete: docs/plans/2026-06-16-major-only-beta-policy.md`. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and generated `release-lanes` skill mirrors the source rule. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` shows `Minor changesets target main, not next` in source and generated skill. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no additional agent-native parity defect beyond policy discoverability. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User correction and current workflow/tests/rules read. | done |
| Implementation | complete | Removed auto-retarget; updated verifier/rules/template/tests/generated skill. | done |
| Verification | complete | Focused tests, lint, install, autoreview, source audit, `pnpm check` passed. | done |
| PR / tracker sync | complete | PR body update/readback remains after plan evidence; no separate tracker. | final response |
| Closeout | complete | Goal-plan checker remains after PR body readback. | final response |

Findings:
- `auto-retarget` was redundant and risky: a `pull_request_target` workflow with
  write permission for behavior already enforced by `verify-changesets`.
- Relaxing `main` to allow minor must not relax `release/**`; release branches
  remain patch-only.
- Blocking minor on `next` must inspect all changeset release types, not only
  the collapsed highest release type, because mixed major+minor PRs exist.

Decisions and tradeoffs:
- Delete `auto-retarget` instead of making it major-only. The verifier is the
  hard gate; automatic retargeting is convenience with extra permissions.
- Keep `release/**` patch-only while allowing minors on `main`.
- Allow patch changes on `next` only for active beta-lane fixes or direct-sync
  beta metadata, but block minors on `next`.

Implementation notes:
- `.github/workflows/auto-retarget.yml` deleted.
- `.github/workflows/verify-changesets.yml` now blocks major on `main`, minor on
  `next`, minor/major on `release/**`, and checks all changeset release types.
- `.agents/rules/release-lanes.mdc`, generated
  `.agents/skills/release-lanes/SKILL.md`, and
  `docs/plans/templates/release-lanes.md` now document major-only beta.
- `tooling/scripts/release-workflow.test.mjs` covers removed auto-retarget,
  minor-on-main, minor-on-next block, mixed changeset safety, and
  `release/**` patch-only.

Review fixes:
- Accepted autoreview P2: initial change accidentally allowed minor changesets
  on `release/**`. Fixed by keeping `release/**` patch-only.
- Accepted autoreview P2: direct PRs to `next` with minor changesets still
  passed. Fixed by blocking minor on `next`.
- Accepted autoreview P2: mixed major+minor PRs to `next` still passed because
  the verifier used the collapsed highest release type. Fixed by checking all
  parsed changeset release types.
- Final autoreview clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Relaxed `release/**` by accident | 1 | Split main/release branch guards | Fixed and reviewed. |
| Blocked only pure minor PRs to `next` | 1 | Add explicit next/minor guard | Fixed and reviewed. |
| Used collapsed release type for mixed changesets | 1 | Check all parsed changeset release types | Fixed and reviewed clean. |

Verification evidence:
- `pnpm install` passed in `/Users/zbeyens/git/plate`; generated skills synced.
- `pnpm lint:fix` passed in `/Users/zbeyens/git/plate`; no fixes left.
- `node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs`
  passed 34 tests in `/Users/zbeyens/git/plate`.
- `.agents/skills/autoreview/scripts/autoreview --mode local --parallel-tests "node --test tooling/scripts/release-workflow.test.mjs tooling/scripts/auto-release-pr.test.mjs"`
  ended clean after accepted findings were fixed.
- `pnpm check` passed in `/Users/zbeyens/git/plate`; lint had one existing
  sidebar hook warning, build/typecheck succeeded, fast/slow/slowest test suites
  passed.
- Source audit found no stale `minor and major`, `non-patch`, or auto-retarget
  workflow policy references outside this plan/test assertions.

Final handoff contract:
- PR line: PR #5030.
- Issue / tracker line: N/A.
- Confidence line: 95-100% confidence.
- Flow table:
  - Reproduced: source audit showed minor+major beta policy and auto-retarget workflow; browser N/A.
  - Verified: `pnpm check`, focused tests, lint, install, source audit, autoreview clean; browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: minor changesets stay on `main`; major changesets go through `next`;
  minor changesets are blocked on `next`; `release/**` remains patch-only;
  auto-retarget workflow removed.
- Caveat: patch changes on `next` remain allowed for active beta-lane fixes or
  direct-sync beta metadata.
- Design:
  - Chosen boundary: verifier workflow + release-lanes rule/template/tests.
  - Why not quick patch: PR body wording would not enforce anything.
  - Why not broader change: publishing workflows still own release; this is only target policy.
- Verified: `pnpm check`; focused release tests; `pnpm install`; `pnpm lint:fix`; source audit; autoreview clean.
- PR body verified: `gh pr view 5030 --json body,url,headRefName` read back
  the task-style body with `🐛 Fixes ➖ N/A`, `🟢 95-100% confidence`, the
  required proof table, bold emoji sections, no current-PR self-link, and no
  auto-release block needed.

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
- PR: #5030 body updated and read back with `gh pr view 5030 --json body,url,headRefName`.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: Patch changes on `next` intentionally remain possible for beta-lane fixes/direct sync.

Timeline:
- 2026-06-16T15:45:43.224Z Task goal plan created.
- 2026-06-16 Deleted auto-retarget workflow and changed verifier toward
  major-only beta.
- 2026-06-16 Autoreview caught release-branch minor relaxation; fixed.
- 2026-06-16 Autoreview caught direct and mixed minor-to-next holes; fixed.
- 2026-06-16 `pnpm install`, `pnpm lint:fix`, focused tests, source audit,
  autoreview, and `pnpm check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Update PR body, run goal-plan checker, commit/push, mark goal complete. |
| What is the goal? | Correct release policy so beta/next is major-only while minor stays on main. |
| What have I learned? | The hard part is mixed changesets: verifier must inspect every release type, not the collapsed highest type. |
| What have I done? | Removed auto-retarget, updated verifier/rules/template/tests/generated skill, verified. |

Open risks:
- None blocking. Residual accepted policy: patch changes can still target `next`
  for active beta-lane fixes or direct-sync beta metadata.
