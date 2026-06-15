# beta release ci

Objective:
Implement beta release CI; done when branch/tag logic has tests and plan gates pass; plan docs/plans/2026-06-15-beta-release-ci.md.

Goal plan:
docs/plans/2026-06-15-beta-release-ci.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user prompt
- id / link: chat selection, no tracker
- title: Implement beta versioning / release CI first
- acceptance criteria: `main` remains the latest/stable release lane, `next` becomes the v54 beta release lane, release workflow supports `main -> latest` and `next -> beta`, beta cannot publish as `latest`, and the behavior has source/test proof before beta docs/UI work.

Completion threshold:
- `.github/workflows/release.yml` listens on `main` and `next`, publishes stable releases from `main` with npm `latest`, publishes beta releases from `next` only when `.changeset/pre.json` exists with tag `beta`, and marks prerelease GitHub releases for prerelease versions.
- Stable post-publish registry/template sync remains `main`-only so v54 beta artifacts cannot overwrite v53 latest artifacts.
- `tooling/scripts/release-workflow.test.mjs` covers the branch trigger, release guard, npm tag selection, prerelease GitHub Release flag, and main-only artifact sync.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-beta-release-ci.md` passes.

Verification surface:
- `node --test tooling/scripts/release-workflow.test.mjs` from `/Users/felixfeng/Desktop/repos/plate`.
- Source audit of `.github/workflows/release.yml`, `package.json`, and the release workflow test.
- `pnpm lint:fix` because YAML/JS package tooling changed.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user prompt plus existing Plate release workflow/tests and Better Auth reference inspected earlier in-thread.
- Allowed edit scope: `.github/workflows/release.yml`, release workflow tests/scripts, root package scripts if needed, and this plan.
- Browser surface: N/A, no docs UI or website route is in this slice.
- Tracker sync: N/A, no GitHub/Linear tracker was provided.
- Non-goals: no `beta.platejs.org` deployment, no docs version switcher, no current-branch `.changeset/pre.json`, no PR/commit/push unless explicitly requested.

Output budget strategy:
- Use exact file reads and focused `rg` patterns with output caps. Exclude generated/build/log trees by default. The initial broad `rg` across `docs/plans` overproduced output and is recorded in Error attempts; future research stays file-specific.

Blocked condition:
- Stop if existing release automation depends on undocumented GitHub/Changesets behavior that cannot be represented in a local source/test audit, or if verification cannot run locally due to install corruption that persists after the repo-approved retry policy.

Task state:
- task_type: release CI / tooling feature
- task_complexity: normal, non-trivial, auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete locally
- confidence: high; focused tests, lint, source audit, and autoreview all pass
- next owner: task
- reason: release workflow and package publish wrapper now own the `main -> latest` and `next -> beta` split; docs UI without this release chain would be a fake switch.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-beta-release-ci.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `.agents/skills/autogoal/SKILL.md` and `.agents/skills/task/SKILL.md` completely. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created goal `Implement beta release CI; done when branch/tag logic has tests and plan gates pass; plan docs/plans/2026-06-15-beta-release-ci.md.` |
| Source of truth read before edits | yes | User prompt plus `.github/workflows/release.yml`, `tooling/scripts/release-workflow.test.mjs`, root `package.json`, `.changeset/config.json`, and Better Auth reference files from earlier in-thread. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read relevant release docs and auto-release solution slices; avoid runtime GitHub release docs and preserve managed auto-release behavior. |
| TDD decision before behavior change or bug fix | yes | Use existing `release-workflow.test.mjs` as regression surface; this is workflow config behavior, not app runtime TDD. |
| Branch decision for code-changing task | no | N/A: user explicitly forbids proactive branch/worktree hygiene at task start; no branch action requested. |
| Release artifact decision | yes | N/A: internal CI/tooling behavior, no published package user-visible delta. |
| Browser tool decision for browser surface | no | N/A: no browser/UI surface in this slice. |
| PR expectation decision | no | N/A: user asked to implement locally, not create PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files and capped reads only; accidental broad `rg` recorded in Error attempts. |
| Package/API pack selected | yes | Applied `package-api` pack because release artifacts/npm dist-tags are package-boundary behavior. |
| Public surface or package boundary identified | yes | Public package boundary is npm dist-tag/version lane, but changes are internal release automation only. |
| Release artifact path selected | no | N/A: no `.changeset`; no published package user-visible delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | no | N/A: no package exports or file layout touched. |

Work Checklist:
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `node --test tooling/scripts/release-workflow.test.mjs` passed with 5 tests; `pnpm lint:fix` passed; source audit covered workflow, package scripts, and release wrappers. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Autoreview reproduced a real beta-lane bug: Changesets only-pre packages can publish prereleases to `latest`; fixed with explicit beta publish wrapper. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `release-workflow.test.mjs` covers branch triggers, release guard, explicit beta npm tag, prerelease GitHub Release flag, and main-only artifact sync. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JS tooling and YAML workflow only; no TS graph changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or exported layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Root `package.json` scripts changed only; no dependency or lockfile change, so install graph is unchanged. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents` source edited. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran in `/Users/felixfeng/Desktop/repos/plate`, the owning repo. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no `content/**`, `apps/www/**`, or UI route changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: release CI only. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: internal release automation only; published package runtime/API/types unchanged. |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: no registry component files changed. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no docs/content surface changed except this goal plan. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: beta prereleases published to npm `latest` or beta registry/template output pushed to main; proof: guard tests, explicit beta publish wrapper, main-only artifact sync, autoreview clean. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: release CI tooling changed, not agent action tooling. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure shape occurred. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Loaded autoreview skill; first accepted findings fixed; final local autoreview clean with tests exit 0. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR created. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed, no fixes applied on final run. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad `rg` over docs was recorded; subsequent reads were scoped/capped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-beta-release-ci.md` | This gate is checked after the plan update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Source audit confirms only release workflow/scripts/package scripts changed; no package API/export/runtime changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Internal CI/tooling change with no published package user-visible delta from `main`. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no package user-visible delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | N/A: no registry-only component work. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No artifact: internal-only release CI/tooling change. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `node --test tooling/scripts/release-workflow.test.mjs` is the owning test surface; no package build/typecheck needed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no barrels or package exports changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read release workflow/tests/package scripts, Better Auth reference, and release solution notes | implementation |
| Implementation | complete | added branch guard, beta publish wrapper, package script updates, prerelease release flag, and main-only artifact sync | verification |
| Verification | complete | focused test, lint, source audit, and autoreview clean | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan updated; check-complete is final gate | final response |

Findings:
- Autoreview found a real Changesets edge case: only-pre packages in pre mode can publish prerelease versions to npm `latest`.
- Fixed by routing beta publish through `tooling/scripts/release-packages.mjs`, which validates beta pre mode, hides `.changeset/pre.json` only during publish, and runs `changeset publish --tag beta`.

Decisions and tradeoffs:
- `main` remains the stable lane and fails if `.changeset/pre.json` is present.
- `next` is the beta lane and requires active `.changeset/pre.json` with `mode: "pre"` and `tag: "beta"`.
- Beta package publishing uses an explicit npm `beta` tag instead of relying on Changesets pre-mode tag inference.
- Registry/template sync stays `main`-only; beta artifacts should not rewrite latest-site generated output.

Implementation notes:
- `.github/workflows/release.yml` now triggers on `main` and `next`, sets `PLATE_RELEASE_CHANNEL`, and marks beta/prerelease GitHub Releases as prerelease.
- `tooling/scripts/guard-beta-pre-release.mjs` validates active beta pre mode and rejects `mode: "exit"` or non-beta tags.
- `tooling/scripts/release-packages.mjs` owns branch-aware package publishing.
- Root scripts expose `ci:release`, `g:release:beta`, and `g:release:next` through the wrapper.

Review fixes:
- Accepted P1: guard only checked `tag: beta`, but `mode: "exit"` could publish stable/latest from `next`; fixed by requiring `mode: "pre"`.
- Accepted P2: `changeset publish --tag beta` is forbidden while pre state exists; fixed by hiding pre state only for the publish subprocess.
- Accepted P1 follow-up: Changesets only-pre packages can fall back to npm `latest`; fixed by wrapper forcing explicit `--tag beta`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over `docs/solutions docs/plans` streamed too much output | 1 | Use exact solution files and capped source reads only | Recorded; continued with three specific solution slices. |

Verification evidence:
- `node --test tooling/scripts/release-workflow.test.mjs` passed in `/Users/felixfeng/Desktop/repos/plate`: 5 tests, 5 pass.
- `pnpm lint:fix` passed in `/Users/felixfeng/Desktop/repos/plate`: 3278 files checked, no fixes applied on final run.
- `.agents/skills/autoreview/scripts/autoreview --mode local --codex-bin <fast wrapper> --parallel-tests "node --test tooling/scripts/release-workflow.test.mjs"` passed: clean, no accepted/actionable findings; tests exit 0.
- Source audit confirmed `.github/workflows/release.yml`, `package.json`, `tooling/scripts/guard-beta-pre-release.mjs`, `tooling/scripts/release-packages.mjs`, and `tooling/scripts/release-workflow.test.mjs` match the requested release split.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high after focused tests, lint, source audit, and clean autoreview.
- Flow table:
  - Reproduced: autoreview reproduced beta-to-latest risk; browser N/A.
  - Verified: focused tests pass; browser N/A.
- Browser check: N/A, no browser/UI surface changed.
- Outcome: beta release CI is implemented locally; docs switcher and `beta.platejs.org` remain future work.
- Caveat: no live npm publish was performed; proof is source/test/review level.
- Design:
  - Chosen boundary: release workflow plus package publish wrapper.
  - Why not quick patch: setting a branch trigger alone leaves npm `latest` exposure.
  - Why not broader change: docs UI/domain versioning is intentionally blocked until the real release chain exists.
- Verified: focused test, lint, source audit, autoreview.
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
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker.
- Browser proof: N/A, release CI only.
- Caveats: no live npm publish; local proof only.

Timeline:
- 2026-06-15T09:14:02.390Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Run autogoal `check-complete`, mark goal complete, final response |
| What is the goal? | Implement beta release CI with tested `main -> latest` and `next -> beta` behavior. |
| What have I learned? | Changesets pre mode can publish only-pre package prereleases to `latest`, so beta needs an explicit publish wrapper. |
| What have I done? | Implemented release lane guard, beta publish wrapper, tests, lint, and clean autoreview. |

Open risks:
- No live npm publish was run. CI/runtime secrets and npm permissions remain production-environment proof.
