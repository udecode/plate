# Fix Plite Layout Optional Peers

Objective:
Make Plite Layout React peers optional without splitting the package; done when focused package, install-contract, typecheck, changeset, and P1 review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-fix-plite-layout-optional-peers.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request following the attached architecture review
- id / link: `/Users/zbeyens/.codex/attachments/a518a0e5-1836-4aff-a426-e2a2852dacd9/pasted-text.txt`
- title: Fix Plite Layout React peer isolation without a package split
- acceptance criteria: retain `@platejs/plite-layout` plus `./react`; mark `@platejs/plite-react`, `react`, and `react-dom` optional; add package-manifest and packed root/React consumer proof; preserve the existing required `@platejs/plite` peer; update the existing package changeset; pass package tests, typecheck, install/release-boundary proof, lint, and P1 review.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary verification threshold exists
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `@platejs/plite-layout` keeps its root and `./react` exports; only `@platejs/plite` remains a required peer; three React-specific peers are optional; package-manifest tests and isolated packed consumers prove both headless and React paths; the existing major changeset describes the final user-visible package; focused tests, source-first typecheck, install/release-boundary proof, lint, and P1 autoreview pass with zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-fix-plite-layout-optional-peers.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite-layout test`
- `pnpm turbo typecheck --filter=./packages/plite-layout`
- focused `node --test tooling/scripts/check-plite-release-artifacts.test.mjs`
- `pnpm plite:release:boundaries`
- `pnpm install`
- `pnpm lint:fix`
- P1 `autoreview --mode local --max-priority P1`
- source audit of the manifest, packed-consumer boundary list, root/React specifiers, and existing changeset.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve `@platejs/plite` as a required peer and preserve both public import paths.
- Do not split or rename the package, change runtime behavior, or edit public docs/UI.

Boundaries:
- Source of truth: the accepted review verdict, `packages/plite-layout/package.json`, the Yjs optional-peer precedent, and `tooling/scripts/check-plite-release-artifacts.mjs`.
- Allowed edit scope: `packages/plite-layout/package.json`, package-owned tests, Plite release-artifact tooling/tests, the root boundary-proof script, the existing `@platejs/plite-layout` changeset, and this plan.
- Browser surface: N/A: dependency metadata and packed package contracts only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct request, no tracker item.
- Non-goals: React/layout runtime changes, package split, API rename, docs/content/UI changes, commit, push, or PR.

Output budget strategy:
- Restrict reads/searches to Plite Layout, Yjs manifest precedent, release-artifact tooling, root scripts, and the existing changeset; cap command output and avoid generated trees except packed-artifact proof output.

Blocked condition:
- Stop only if the package cannot express an optional-peer contract across the repo-owned release harness, or the same focused verification/review blocker recurs with no safe in-scope repair.

Task state:
- task_type: package metadata and release-contract fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid: required React peers contradict the documented headless root; optional peers plus isolated packed proof are the accepted durable fix.
- confidence: high from exact-snapshot manifest, build-entry, Yjs precedent, and release-harness inspection.
- next owner: task
- reason: one package owns the cohesive layout feature; optional peer metadata fixes installation pressure without inventing a second owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-fix-plite-layout-optional-peers.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, scope, non-goals, deliverables, proof, and stop condition are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `task` owns implementation; `autogoal` owns measurable closure; `changeset` owns release prose; `autoreview` will own P1 closeout. Architecture cleanup supplied the accepted simplify-not-split decision only. |
| Active goal checked or created | yes | `get_goal` returned null; goal created with this plan path. |
| Source of truth read before edits | yes | Read the attached review, exact-snapshot Plite Layout manifest/source/build entries, Yjs optional-peer precedent/test, release harness, root scripts, and current changeset. |
| Tracker comments and attachments read | no | N/A: no tracker item; the supplied attachment was read fully. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped search found the Plite Layout source-entry/pagination ownership solution and prior plans affirming the cohesive package owner. |
| TDD decision before behavior change or bug fix | yes | Add a package-manifest contract test first and observe failure before changing metadata; runtime behavior is unchanged. |
| Branch decision for code-changing task | no | N/A: direct local fix only; user did not request commit, push, branch, or PR. |
| Release artifact decision | yes | Update existing `.changeset/plite-layout-runtime.md`; package is absent on `main`, so no second changeset is warranted. |
| Browser tool decision for browser surface | no | N/A: no browser-visible surface changes. |
| PR expectation decision | no | N/A: user requested a local fix, not a PR. |
| Tracker sync expectation decision | no | N/A: direct request, no tracker. |
| Output budget strategy recorded | yes | Narrow path-scoped reads and capped proof output are recorded above. |
| Package/API pack selected | yes | `package-api` pack materialized at plan creation. |
| Public surface or package boundary identified | yes | `@platejs/plite-layout` manifest peer contract and root/`./react` export boundary. |
| Release artifact path selected | yes | Existing `.changeset/plite-layout-runtime.md` will describe the final new-package behavior relative to `main`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` and source rule before edits. |
| Barrel/export impact decision recorded | yes | No export or exported file layout changes; `pnpm brl` is N/A. |

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
- [x] Implementation fixes the right ownership boundary: the package manifest
      owns install requirements and the release harness owns packed-consumer proof.
- [x] Release artifact requirement recorded: update the existing Plite Layout
      major changeset; registry changelog is N/A.
- [x] Final handoff shape decided: outcome, files, verification, design choice,
      and caveat; PR/tracker/browser fields are N/A.
- [x] Branch handling recorded for code-changing work: N/A because no branch,
      commit, push, or PR was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command runs from
      `/Users/zbeyens/git/plate-2`, the package/release-tool owner.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Root dependency leakage and accidentally optional Plite
      runtime ownership are recorded under Open risks with matching proof.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work: dirty local mode, P1 maximum, after implementation.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none of those surfaces will change.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded. Root and `./react` exports stay unchanged; only install requirements change.
- [x] Package/API pack: release artifact matrix is applied: the existing package changeset applies; registry changelog and no-artifact paths are N/A.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. The existing major entry is updated because the package is absent on `main`.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry files changed.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: there is a published install-contract delta and a changeset.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. No call shape changes; this relaxes React installation requirements while preserving both import paths.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded below.
- [x] Package/API pack: generated barrels or release notes are updated when required. Exports and file layout are unchanged, so barrels are N/A; the existing changeset is updated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | All named commands passed; exact evidence is below. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | New manifest contract failed with `peerDependenciesMeta` received as `undefined`. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Package suite passed 57 tests; release tooling passed 12 tests; packed root and React consumers passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite-layout` passed 6 tasks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: exports and exported files are unchanged. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; lockfile remained current. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Every command ran in `/Users/zbeyens/git/plate-2`; package and release-harness owners passed. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: dependency metadata only. The wider dev gate incidentally passed 3 Chromium smoke tests. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser behavior changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Existing `.changeset/plite-layout-runtime.md` updated for the package's final install contract. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only internal goal plan and changeset prose changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Root React leakage and accidentally optional Plite runtime were identified; manifest and packed-consumer proof close both at their owners. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tool action surface changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal appeared. |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Invocation 1: `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`; clean, no accepted/actionable findings. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request a PR. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: direct request without tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | `check:plite:dev` expanded to the full affected graph and exceeded output caps; final status was recovered from its bounded `PLITE_CHECK_SUMMARY`, with focused results recorded separately. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-fix-plite-layout-optional-peers.md` | Passed: `[autogoal] complete`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Root and `./react` exports remain; only React-specific peers are optional; packed root forbids React and adapter resolves React. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package install-contract metadata change. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `@platejs/plite-layout: major` changeset updated; no forbidden minor entry exists. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry work. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: a package changeset is required and present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Package 57-test suite, source-first typecheck, package build, release boundary pack, and wider dev gate passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export/file-layout change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Exact snapshot, manifest, Yjs precedent, release harness, and changeset read. | implementation |
| Implementation | completed | Optional peers, manifest test, packed consumers, boundary script, and changeset applied. | verification |
| Verification | completed | Focused, package, type, install, packed release, lint, dev, and P1 review gates passed. | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested. | final response |
| Closeout | completed | Plan evidence and handoff are complete. | final response |

Findings:
- The defect was entirely in package metadata: the headless root did not import React, but required React peers still imposed installation pressure.
- One package remains the correct owner because `./react` shares the layout runtime and public import paths are already isolated.
- P1 autoreview found no accepted or actionable defect.

Decisions and tradeoffs:
- Keep `@platejs/plite` required and mark only `@platejs/plite-react`, `react`, and `react-dom` optional.
- Prove the packed root with React packages physically forbidden and prove `./react` with the explicit React dependency set.
- Reject a package split: it adds ownership and release overhead without fixing a runtime coupling, because no root runtime coupling exists.

Implementation notes:
- Added `peerDependenciesMeta` to `packages/plite-layout/package.json`.
- Added a package-owned manifest contract test.
- Added Plite Layout to focused packed-boundary ownership and to the root boundary build.
- Added isolated packed root and React-adapter consumers.
- Updated the existing major changeset.

Review fixes:
- None: the first P1 autoreview invocation was clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Red: `bun test --preload ./config/plite-source-test-setup.ts packages/plite-layout/test/package-config-contract.test.ts` failed because optional metadata was `undefined`.
- Green: `pnpm --filter @platejs/plite-layout test` passed 57 tests twice, including after format.
- Green: `node --test tooling/scripts/check-plite-release-artifacts.test.mjs` passed 12 tests twice.
- Green: `pnpm install` passed; the lockfile was already current.
- Green: `pnpm turbo typecheck --filter=./packages/plite-layout` passed 6 tasks.
- Green: `pnpm plite:release:boundaries` built 12 tasks and verified four isolated packed consumers, including root-without-React and the React adapter.
- Green: `pnpm lint:fix` and `git diff --check` passed.
- Green: `pnpm check:plite:dev` passed in 104065 ms, including the wider affected typecheck/test/contracts/public-types graph and 3 Chromium smoke tests.
- Green: `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1` exited clean on invocation 1.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct request without tracker.
- Confidence line: 99%: exact manifest, packed consumer, source-first type, broad dev, and P1 review proof all passed.
- Flow table:
  - Reproduced: manifest contract red; browser N/A.
  - Verified: all named tests and packed proof green; browser N/A, with incidental Chromium smoke green.
- Browser check: N/A: no browser-facing change.
- Outcome: React-specific peers are optional, the headless runtime peer remains required, and both packed public entrypoints are proven.
- Caveat: No commit, push, or PR was requested or performed.
- Design:
  - Chosen boundary: package manifest for install policy; release harness for published-artifact proof.
  - Why not quick patch: caller changes cannot remove package-manager peer requirements.
  - Why not broader change: a second package would duplicate ownership for already-isolated exports.
- Verified: package tests, release tests, install, typecheck, packed boundaries, lint, broader Plite dev gate, and P1 autoreview.
- PR body verified: N/A: no PR.

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
- PR: N/A: not requested.
- Issue / tracker: N/A: none supplied.
- Browser proof: N/A: metadata-only; incidental Chromium smoke passed 3 tests.
- Caveats: local changes only; no commit or push.

Timeline:
- 2026-08-22T20:54:40.856Z Task goal plan created.
- 2026-08-22 Package manifest contract test added and observed red: optional peer metadata was `undefined`.
- 2026-08-22 Optional peers and both isolated packed consumers implemented.
- 2026-08-22 Install, tests, typecheck, packed release, lint, wider Plite dev gate, and P1 review passed.
- 2026-08-22 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final checker, goal completion, final response |
| What is the goal? | Make Plite Layout React peers optional while preserving one cohesive package and proving both packed import paths. |
| What have I learned? | The defect was manifest-only; one package remains the durable owner. |
| What have I done? | Implemented optional peers and packed proof; all verification and review gates passed. |

Open risks:
- Closed: the manifest contract proves `@platejs/plite` remains required, and the isolated packed root rejects any React dependency reachability. No in-scope risk remains.
