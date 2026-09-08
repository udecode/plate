# republish dependents without nested jotai-x

Objective:
Republish `@lofcz/platejs-utils`, `@lofcz/platejs`, and `@lofcz/platejs-code-drawing` against bundled core so Sciobot installs no public `jotai-x`.

Goal plan:
docs/plans/2026-09-08-republish-dependents-without-nested-jotai-x.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user prompt
- id / link: local chat
- title: Fix Sciobot Plate deps; publish new core if needed
- acceptance criteria: npm dependents pin `@lofcz/platejs-core` without public `jotai-x`; Sciobot lock can install that graph

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 90
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `prepare-release-changesets` resolves `workspace:@lofcz/*@*` aliases and auto-bumps runtime dependents.
- Patch changesets exist for `@lofcz/platejs-utils`, `@lofcz/platejs`, and `@lofcz/platejs-code-drawing`.
- Linked release publishes those packages (and core if the linked set bumps) without a nested public `jotai-x` runtime dep.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-08-republish-dependents-without-nested-jotai-x.md` passes.

Verification surface:
- `node --test tooling/scripts/prepare-release-changesets.test.mjs`
- `pnpm lint:fix`
- npm view of published dependents after Version Packages merge
- Sciobot lock refresh after those versions exist

Constraints:
- Preserve existing user-facing editor behavior outside the install graph.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not hand-edit `templates/**` or run `build:registry` locally.

Boundaries:
- Source of truth: user request plus current npm nest (`@lofcz/platejs-utils@53.4.2` still pins `@lofcz/platejs-core@53.3.4` with public `jotai-x`).
- Allowed edit scope: `tooling/scripts/prepare-release-changesets.*`, `.changeset/*`, `packages/udecode/jotai-x/package.json`, this plan.
- Browser surface: none. Install-graph / npm publish only.
- Tracker sync: N/A. Local user request, no GitHub issue.
- Non-goals: new editor features, template regen, publishing `@lofcz/jotai-x` again.

Output budget strategy:
- Scope searches to `prepare-release-changesets`, package manifests, and Sciobot `package.json`. Cap npm view to the three dependents plus core.

Blocked condition:
- npm publish is blocked if GitHub Actions `release.yml` fails after merge, or if Version Packages PR cannot merge.

Task state:
- task_type: bug
- task_complexity: non-trivial
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: 90
- next owner: task
- reason: Durable bug is alias-blind auto-changeset collection. Seed changesets plus script fix unblock the linked republish.

Pre-solution issue challenge:
- reporter claim: Sciobot still installs public `jotai-x` because nested cores are stale.
- suggested diagnosis or fix: publish a new core and/or republish dependents that still declare public `jotai-x`.
- repro ladder:
  - tests / source-level repro: `getWorkspacePackages` only matched dep keys, so `workspace:@lofcz/platejs-core@*` never counted as in-workspace. npm shows utils 53.4.2 / platejs 53.4.7 / code-drawing 53.0.0 still nest old cores.
  - Playwright / automated browser: N/A. No UI surface.
  - Browser plugin: N/A.
  - screenshot / visual proof: N/A.
- reproduction verdict: reproduced
- validity verdict: valid
- best long-term fix boundary: resolve workspace aliases in `prepare-release-changesets.mjs`, then patch-republish dependents.
- harsh honest feedback: a new core alone does not fix Sciobot. Nested `@lofcz/platejs-core@53.3.4` / `53.4.5` / `53.0.0` still declare public `jotai-x`.
- hard-stop decision: implement

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-08-republish-dependents-without-nested-jotai-x.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | No duration requested |
| Skill analysis before edits | yes | Loaded task, changeset, autogoal check-complete |
| Active goal checked or created | no | CreateGoal is explicit-only; this plan is durable state |
| Source of truth read before edits | yes | User prompt plus npm nest of utils/platejs/code-drawing |
| Tracker comments and attachments read | no | No tracker item |
| Video transcript evidence required | no | No video |
| Pre-solution issue challenge required | yes | Claim valid: nest, not Sciobot adding jotai-x |
| Reproduction verdict before implementation | yes | Reproduced via npm view and script key-vs-alias bug |
| Repro escalation ladder selected | yes | Source/npm graph; browser N/A |
| Suggested fix reviewed against durable boundary | yes | New core alone is insufficient; dependents must republish |
| `docs/solutions` checked for non-trivial existing-code work | yes | No existing solution for fork workspace-alias changesets |
| TDD decision before behavior change or bug fix | yes | Added unit tests first for alias resolve + auto-release |
| Branch decision for code-changing task | yes | `codex/republish-dependents-jotai-x` from `origin/main` |
| Release artifact decision | yes | Three patch changesets; no registry changelog |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | yes | Task skill requires PR; user authorized merge/publish |
| Dedicated task plan selected for exact PR | yes | This file |
| Tracker sync expectation decision | no | N/A: no issue |
| Output budget strategy recorded | yes | Scoped to release script, manifests, Sciobot pins |
| Package/API pack selected | yes | package-api |
| Public surface or package boundary identified | yes | npm install graph of `@lofcz/platejs*` |
| Release artifact path selected | yes | `.changeset` |
| `changeset` skill loaded when `.changeset` is required | yes | One package per file, patch, `@lofcz/*` names |
| Barrel/export impact decision recorded | no | N/A: no export/file-layout change |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: source/npm
      graph reproduced; Playwright/Browser/screenshot N/A.
- [x] Hard-stop rule followed for bug/behavior claims: issue is valid and
      reproduced.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL. Pending until PR
      exists; updated in the follow-up commit after `gh pr create`.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no install-corruption failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent-tooling files.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
      N/A: not registry-only.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
      N/A: changesets are required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
      N/A: no public API shape change; install graph only.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no barrel change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `node --test tooling/scripts/prepare-release-changesets.test.mjs` 7/7 |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | valid / reproduced / dependents must republish |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | source/npm yes; Playwright/Browser/screenshot N/A |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Alias key miss plus npm nest of 53.3.4/53.4.5/53.0.0 |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | New alias + auto-release tests pass |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JS script + markdown + package.json flags |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: jotai-x publishConfig only; no lock change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | cwd `/run/media/lofcz/ssd_external/GitHub/plate` |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Three `@lofcz` patch changesets |
| User-visible registry output changed | no | Use the registry-changelog pack | N/A |
| Docs or content changed | no | For docs-heavy work, use `--template docs` | N/A: plan only |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure: dependents stay on old cores. Proof: npm view after publish. Boundary: auto-changeset alias resolve. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Pending until after commit |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | Focused tests + lint; full `pnpm check` is repo-wide and disproportionate for this release-script slice |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | Updated after `gh pr create` |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body` | Updated after PR exists |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no issue |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled; PR URL after create |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | biome 3337 files, no fixes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Scoped commands only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-08-republish-dependents-without-nested-jotai-x.md` | After closeout |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Install graph only; no export change |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published install-graph delta |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | Three patch files; no minor |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changesets required |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Script unit tests; no package src change |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | npm nest + alias-blind script | implementation |
| Implementation | done | alias resolve, tests, three changesets, jotai-x public | verification |
| Verification | in_progress | unit tests 7/7 | PR / tracker sync |
| PR / tracker sync | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- `@lofcz/platejs-core@53.4.8` already bundles jotai-x and has no runtime `jotai-x` dep.
- Sciobot still gets public `jotai-x@2.3.x` from nested `@lofcz/platejs-core@53.3.4` (via utils 53.4.2), `53.4.5` (via platejs nest), and `53.0.0` (via code-drawing → utils).
- `getWorkspacePackages()` treated only dep keys as workspace names, so `workspace:@lofcz/platejs-core@*` never auto-released dependents.

Decisions and tradeoffs:
- Do not require a new core solely for jotai-x; 53.4.8 is already clean. Linked set may still bump core to 53.4.9 with dependents.
- Keep `@lofcz/jotai-x` changeset-ignored; it stays 2.4.0 and is bundled, not a runtime dep of new core.
- Mark jotai-x `private: false` + `publishConfig.access: public` so future `release.yml` does not skip a public package the user already published.

Implementation notes:
- `resolveWorkspaceDependencyName` reads `workspace:@lofcz/...@*` from the version string.
- Seed changesets: utils, platejs, code-drawing. CI `prepare-release-changesets` then auto-adds remaining runtime dependents.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| One-shot jotai-x workflow E404 | 1 | User published `@lofcz/jotai-x@2.4.0` manually via OIDC | Done; not this PR |

Verification evidence:
- `node --test tooling/scripts/prepare-release-changesets.test.mjs` in `/run/media/lofcz/ssd_external/GitHub/plate`: 7 pass, including alias resolve and fork auto-release.
- `pnpm lint:fix` in the same cwd: biome checked 3337 files, no fixes.

Final handoff contract:
- PR line: pending until `gh pr create`
- Issue / tracker line: N/A
- Confidence line: 🟢 95-100% confidence
- Flow table:
  - Reproduced: tests 🟢 source/npm graph, browser ➖ N/A
  - Verified: tests 🟢 unit tests, browser ➖ N/A
- Browser check: N/A
- Outcome: Release script sees fork workspace aliases; dependents get patch changesets so the next linked publish drops nested public jotai-x.
- Caveat: Sciobot must refresh its lock after npm publish. Old nested cores stay on npm forever; only new installs change.
- Design:
  - Chosen boundary: auto-changeset workspace-alias resolution plus dependent republish.
  - Why not quick patch: Sciobot overrides cannot erase nested package.json deps of already-published packages.
  - Why not broader change: no editor API change; do not un-ignore jotai-x into the 53.4 linked set.
- Verified: unit tests for alias resolve and auto-release; lint clean.
- PR body verified: pending

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- Task plan at exact PR head: pending
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: Sciobot lock refresh is a follow-up after npm publish.

Timeline:
- 2026-09-08T22:05:23.850Z Task goal plan created.
- 2026-09-09 Implemented alias resolve, tests, three changesets, jotai-x public flag.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation done; verification in progress |
| Where am I going? | PR, merge, Version Packages, npm proof, Sciobot lock refresh |
| What is the goal? | Republish dependents so Sciobot installs no public jotai-x |
| What have I learned? | New core alone is not enough; nest is stale dependents |
| What have I done? | Script fix, tests, changesets, plan |

Open risks:
- Version Packages / release.yml can fail after merge. If so, stop and repair CI before touching Sciobot.
