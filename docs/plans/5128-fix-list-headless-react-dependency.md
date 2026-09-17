# Fix list headless React dependency

Objective:
Fix issue #5128 so `@platejs/list` headless imports without React; done when repro, focused checks, review, and PR pass; plan `docs/plans/5128-fix-list-headless-react-dependency.md`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5128-fix-list-headless-react-dependency.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: public GitHub bug issue
- id / link: #5128 / https://github.com/udecode/plate/issues/5128
- title: `[Bug]: @platejs/list headless entry imports React, breaking Node/server-side use`
- acceptance criteria:
  - importing the published headless entry succeeds when React is absent
  - the headless entry graph contains no `react` or `react-compiler-runtime`
  - `@platejs/list/react` rendering behavior stays unchanged
  - no non-spec `.tsx` remains under `packages/list/src/lib/`
- caveats: the issue's proposed source move is a claim to verify, not an implementation instruction
- likely surface: `packages/list/src/lib/BaseListPlugin.tsx`, `packages/list/src/react/`, package exports/build tests, and one package changeset
- root-cause layer: package source ownership and emitted entry graph

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A; normal one-shot completion gates apply
- initial confidence score: N/A; exact binary acceptance checks exist
- improvement loop: reproduce -> test-first owner-boundary fix -> focused/package checks -> autoreview -> PR/check
- final score / loop closure: N/A; close only when the named checks and PR gates pass

Completion threshold:
- A pre-fix public-entry repro fails because the headless graph loads React, then passes after the fix with React unavailable.
- The built headless entry has no `react` or `react-compiler-runtime` import, while list rendering tests remain green and `packages/list/src/lib/` has no non-spec `.tsx` file.
- The package typecheck/tests, lint, repo `check`, changeset audit, and final structured autoreview pass with zero accepted/actionable findings.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5128-fix-list-headless-react-dependency.md` passes.

Verification surface:
- command: focused public-entry/import-graph regression test in `/Users/zbeyens/git/plate`
- command: owning `@platejs/list` tests and source-first typecheck
- source-audit: `packages/list/src/lib/` has no non-spec `.tsx`; built headless graph has no React imports
- command: `pnpm lint:fix`, repository `check`, and final autoreview
- artifact: one `@platejs/list` patch changeset, task-style PR body, and issue sync-back

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve `@platejs/list/react` element rendering and public exports.
- Do not make React optional for the React entry or redesign the list API.

Boundaries:
- Source of truth: GitHub issue #5128 plus current package source, exports, build config, and tests.
- Allowed edit scope: `packages/list/**`, focused build/test tooling only if required, one `.changeset/*.md`, this plan, and PR/issue metadata.
- Browser surface: N/A; plain Node ESM/package graph behavior with no browser route.
- Tracker sync: open a verified PR that fixes #5128, then post a concise issue comment linking it.
- Non-goals: React/React DOM peer-policy changes across the monorepo, renderer redesign, docs/registry changes, unrelated package cleanup.

Output budget strategy:
- Use exact package files and bounded `rg`/`sed` reads; exclude generated caches and `node_modules` except the temporary/public-package repro; cap command output and inspect filenames/counts before content.

Blocked condition:
- Stop only if the public/package repro cannot be executed after one install-repair attempt, required GitHub push/PR access is unavailable, or the durable fix requires a breaking API decision outside issue scope.

Task state:
- task_type: bug fix in a published package
- task_complexity: normal, non-heavyweight, measurable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high after the published-package repro and local ownership audit
- next owner: task
- reason: published failure reproduced; source ownership fix passes package artifact, test, typecheck, lint, autoreview, and repository checks

Pre-solution issue challenge:
- reporter claim: the headless `@platejs/list` entry loads React at module evaluation and fails when React is absent
- suggested diagnosis or fix: `BaseListPlugin.tsx` under `src/lib` owns JSX/rendering and pulls React into the shared headless chunk; likely move render ownership into `src/react`, subject to source/export verification
- repro ladder:
  - tests / source-level repro: reproduced against `@platejs/list@53.1.3`; importing `@platejs/list` in a fresh npm project with legacy peer installation exits 1 with `ERR_MODULE_NOT_FOUND` for `react` from the shared list chunk
  - Playwright / automated browser: N/A; Node module resolution is the owning surface and no browser harness can add evidence
  - Browser plugin: N/A; issue explicitly has no browser surface
  - screenshot / visual proof: N/A; no layout, selection, dialog, or visual state is involved
- reproduction verdict: reproduced
- validity verdict: valid; the diagnosis is accurate, but only the JSX wrapper should move—not the list mechanics
- best long-term fix boundary: keep the base plugin headless and attach list rendering from the React entry, if current plugin composition/export patterns support it
- harsh honest feedback: the current `src/lib` placement is wrong; a headless export that crashes unless React is installed is not headless
- hard-stop decision: cleared; the exact public-package failure reproduced before implementation

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5128-fix-list-headless-react-dependency.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, `autoreview`, `tdd`, and `changeset`; no heavyweight/browser/docs/registry skill applies |
| Active goal checked or created | yes | Created active issue #5128 goal naming this plan |
| Source of truth read before edits | yes | `gh issue view ... --comments` read issue body and the reporter's follow-up |
| Tracker comments and attachments read | yes | One text comment read; no attachments or video |
| Video transcript evidence required | no | N/A: issue contains no video or screen recording |
| Pre-solution issue challenge required | yes | Public bug and technical diagnosis challenged with published-package repro and source audit |
| Reproduction verdict before implementation | yes | Valid/reproduced: fresh npm install exits 1 on missing `react` |
| Repro escalation ladder selected | yes | Node package import is sufficient; all browser/visual rungs are N/A |
| Suggested fix reviewed against durable boundary | yes | Move only render ownership to `src/react`; retain mechanics and parsing in the base plugin |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read headless PnP proof and package-entry boundary notes; neither contradicts package-owned proof or the split |
| TDD decision before behavior change or bug fix | yes | Add a failing plugin-ownership regression first, then preserve React rendering in a React-owned test |
| Branch decision for code-changing task | yes | Fresh `codex/issue-5128-headless-list` from `origin/main`; unrelated clean branch not reused |
| Release artifact decision | yes | Published package runtime fix requires one `@platejs/list` patch changeset |
| Browser tool decision for browser surface | no | N/A: Node import graph only |
| PR expectation decision | yes | `task` default requires verified code-changing work to ship as a PR |
| Dedicated task plan selected for exact PR | yes | This issue-specific plan owns the single upcoming PR |
| Tracker sync expectation decision | yes | Comment on issue #5128 after the PR exists |
| Output budget strategy recorded | yes | Exact files and bounded searches/reads; generated/cache paths excluded |
| Package/API pack selected | yes | `package-api` materialized because entry graph and published runtime change |
| Public surface or package boundary identified | yes | `@platejs/list` root versus `@platejs/list/react` source/build boundary |
| Release artifact path selected | yes | `.changeset/*.md` for `@platejs/list` patch |
| `changeset` skill loaded when `.changeset` is required | yes | Full skill read before edits |
| Barrel/export impact decision recorded | yes | Source file extension/layout changes under an exported folder; run `pnpm brl` and retain only actual generated updates |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video evidence.
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
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL. PR #5129 owns this plan; final head/body readback follows the plan-record commit.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A so far: no corruption-shaped failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Use dirty local `--mode local` before commit.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: a package changeset is required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Compatible patch: root entry loses an accidental React requirement; React entry behavior remains.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Repro flipped red-to-green; React-free packed import, graph audit, package checks, autoreview, and full `pnpm check` pass |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid/reproduced; move only renderer into React entry |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Published Node package repro complete; browser and visual rungs N/A |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Fresh `@platejs/list@53.1.3` install failed on missing `react`; new ownership test failed with received `belowNodes` callback |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused base/react specs pass; locally packed root entry imports with React absent |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/list` passed in repo root |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl` passed; no barrel content delta required for extension-only rename |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile edit |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent files changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Package build/test/typecheck and pack ran from `/Users/zbeyens/git/plate`; final import ran in a fresh temp npm project |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: Node ESM module graph only |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser/visual behavior |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/quiet-lists-rest.md` adds one `@platejs/list` patch entry |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry files |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: only task plan, source, tests, and changeset |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: bundler could retain React or markup could regress. Proof: inspect built root graph, import packed artifact without React, and render both list kinds. Boundary is right because only renderer is React-owned and static kit already configures its own renderer. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: all owning checks run normally |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Local structured Codex autoreview exited 0 with zero findings |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | PR #5129 created after full `pnpm check` passed |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5129 head matched local `6137dffea1...`; the plan at that head identifies the exact PR and the body contains exactly one plan line |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5129 --json ...` read back the auto-release block, issue/plan/confidence lines, exact table header, and all four required sections; no self-link |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no browser proof or image |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Posted https://github.com/udecode/plate/issues/5128#issuecomment-5705495171 with PR and verification summary |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | PR, issue, confidence, flow, browser N/A, outcome, caveat, design, and verification fields filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; full `pnpm check` lint also passed with one pre-existing warning and zero errors |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One usage audit accidentally matched generated release-index content and was truncated; recorded above, then all searches were narrowed and long check output was captured to temp logs with bounded tails |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5128-fix-list-headless-react-dependency.md` | Final mechanical checker passed from `/Users/zbeyens/git/plate` before goal completion |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Root barrel still exports `BaseListPlugin`; React barrel still exports `ListPlugin`; built root graph contains no React import; `/react` retains both React imports |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/list` runtime/package-entry fix |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | One patch changeset for `@platejs/list`; no core-package minor |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: package source change |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset exists |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Build, 113 package tests, and filtered typecheck passed |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed; no generated diff |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | issue/comment read; published failure reproduced; source and patterns audited | implementation |
| Implementation | complete | renderer moved unchanged to React entry; base file renamed `.ts`; tests split by owner; patch changeset added | verification |
| Verification | complete | focused/package tests, build, typecheck, lint, build-graph audit, packed import, clean autoreview, and full `pnpm check` pass | PR/tracker sync |
| PR / tracker sync | complete | PR #5129 opened, head/body read back, issue #5128 commented | closeout |
| Closeout | complete | all plan gates resolved; final checker passes before goal completion | final response |

Findings:
- Fresh `@platejs/list@53.1.3` import without peers fails exactly with `ERR_MODULE_NOT_FOUND` for `react` from the emitted shared chunk.
- `BaseListPlugin.tsx` is the only production `.tsx` under `packages/list/src/lib/`; its `render.belowNodes` JSX is the only React-owned behavior in that file.
- `ListPlugin` currently delegates entirely to `toPlatePlugin(BaseListPlugin)`, so it is the natural owner for the list wrapper without changing exports.
- Existing package patterns attach React-only handlers/plugin composition in `src/react/*Plugin.tsx` via the second `toPlatePlugin` argument.

Decisions and tradeoffs:
- Move only `render.belowNodes` and the JSX component to `src/react/ListPlugin.tsx` -> preserves base list transforms/parsing while making the root source graph React-free -> static callers of the base plugin will no longer receive a React renderer, which is intentional for a headless contract.
- Keep React peer/dependency metadata unchanged -> the `/react` entry still requires React and compiler runtime -> package manifests need no install-graph change.

Implementation notes:
- Added the headless ownership assertion before implementation and observed the expected red failure.
- Removed React, static renderer types, and JSX from `BaseListPlugin`; the file is now `BaseListPlugin.ts`.
- Configured the identical `belowNodes` renderer on `ListPlugin` and moved the markup regression to `src/react/ListPlugin.spec.tsx`.
- Added one patch changeset; no package manifest or export map change was needed.

Review fixes:
- Structured Codex autoreview (`.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output`) returned no findings and rated the patch correct at 0.86 confidence; no fixes required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Unquoted `test*` glob caused zsh to reject one bounded search | 1 | Use quoted/scoped `rg` paths with explicit globs | Resolved; reran scoped searches successfully |
| React test imported `KEYS` from `platejs/react`, which does not export it | 1 | Split imports: `KEYS` from `platejs`, `createPlateEditor` from `platejs/react` | Resolved; focused tests pass |
| One usage audit matched generated release-index content and produced truncated high-volume output | 1 | Restrict all later searches to exact source owners and small caps | Resolved; follow-up read only the relevant static kit and package test owners |
| First `pnpm check` hit unrelated fast-suite timing threshold: `media-file-node.spec.tsx` 80.97 ms > 75 ms | 1 | Rerun exact `pnpm test:slowest`, then full `pnpm check` | Resolved; exact gate passed at 27.65 ms and full check rerun exited 0 |

Verification evidence:
- `/Users/zbeyens/git/plate`: pre-fix published package import exited 1 with `ERR_MODULE_NOT_FOUND` for `react`.
- `/Users/zbeyens/git/plate`: new headless ownership test failed before the fix and passed after it.
- `/Users/zbeyens/git/plate`: `pnpm --filter @platejs/list test` -> 113 pass, 0 fail.
- `/Users/zbeyens/git/plate`: `pnpm turbo typecheck --filter=./packages/list` -> 9 tasks successful.
- `/Users/zbeyens/git/plate`: `pnpm --filter @platejs/list build`, `pnpm brl`, and `pnpm lint:fix` passed.
- `/Users/zbeyens/git/plate`: built root entry and its only shared chunk contain no `react`/`react-compiler-runtime`; React entry contains both as expected.
- Fresh temp npm project: locally packed `@platejs/list` plus `platejs@53.3.7` imports successfully with React absent.
- `/Users/zbeyens/git/plate`: no non-spec/non-slow `.tsx` remains under `packages/list/src/lib/`.
- `/Users/zbeyens/git/plate`: structured local autoreview exited 0 with no accepted/actionable findings.
- `/Users/zbeyens/git/plate`: `pnpm test:slowest` retry passed after one unrelated timing spike.
- `/Users/zbeyens/git/plate`: full `pnpm check` rerun exited 0; lint, all package builds/typechecks, fast tests, slow tests, and slowest gate passed.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5129
- Issue / tracker line: fixes #5128; concise issue comment after final PR head verification
- Confidence line: 95-100%; public repro, packed artifact, full checks, and clean review agree
- Flow table:
  - Reproduced: fresh published-package import failed on missing React and the ownership regression was red; browser N/A
  - Verified: packed React-free import, 113 package tests, package build/typecheck, full `pnpm check`, clean autoreview; browser N/A
- Browser check: N/A; plain Node ESM/package graph surface
- Outcome: root `@platejs/list` entry no longer reaches React; `/react` keeps unchanged wrapper behavior
- Caveat: the base plugin intentionally has no default React renderer; static callers configure one explicitly, as the existing `BaseListKit` does
- Design:
  - Chosen boundary: move only `render.belowNodes` and JSX into `ListPlugin`
  - Why not quick patch: optional peers or build externals would retain the wrong source ownership
  - Why not broader change: exports, peer policy, list model, and React markup remain correct
- Verified: package artifact/import graph, tests, typecheck, build, barrels, lint, autoreview, and root check
- PR body verified: yes; `gh pr view 5129 --json body` confirmed the exact task-style format and one task-plan line

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
- PR: https://github.com/udecode/plate/pull/5129
- Task plan at exact PR head: confirmed by matching GitHub `headRefOid` to local pushed head and reading this plan from that commit; final plan-only closure commit will be pushed before handoff
- Issue / tracker: https://github.com/udecode/plate/issues/5128#issuecomment-5705495171
- Browser proof: N/A; Node package import surface
- Caveats: headless base plugin has no default renderer; full check emits one pre-existing eslint warning but exits 0

Timeline:
- 2026-09-16T22:16:42.969Z Task goal plan created.
- 2026-09-17 Source issue/comment, package source, related solution notes, and nearby plugin patterns read.
- 2026-09-17 Published-package import reproduced in a fresh npm project; issue verdict set to valid before implementation.
- 2026-09-17 TDD red/green complete; renderer ownership moved to React entry and package behavior tests pass.
- 2026-09-17 Built and packed artifact verified in a fresh React-free npm project; package build/test/typecheck/lint/barrel checks pass.
- 2026-09-17 Structured Codex autoreview completed clean with zero findings.
- 2026-09-17 First root check exposed one unrelated transient timing threshold; exact retry and complete `pnpm check` rerun passed.
- 2026-09-17 PR #5129 opened with required task body; remote head/body and exact plan ownership read back successfully; issue #5128 synced.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final plan commit/push and handoff remain |
| Where am I going? | Push this final plan state, re-read PR head/body, complete the goal, and hand off |
| What is the goal? | Make the `@platejs/list` root entry importable without React while preserving `/react` rendering |
| What have I learned? | The only React edge is the base plugin's JSX wrapper |
| What have I done? | Reproduced, fixed, and proved the headless/React split through source, tests, build graph, and packed install |

Open risks:
- None open. The two identified risks are closed by built-graph/packed-import proof and React-entry wrapper tests.
