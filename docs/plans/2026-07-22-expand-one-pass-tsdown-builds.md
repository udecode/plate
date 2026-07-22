# expand one-pass tsdown builds

Objective:
Expand one-pass tsdown builds; done when zero package build scripts use the shared staging runner and all package/artifact gates pass; plan docs/plans/2026-07-22-expand-one-pass-tsdown-builds.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-expand-one-pass-tsdown-builds.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct continuation request
- id / link: N/A: no external ticket
- title: Expand the proven Plite one-pass tsdown POC
- acceptance criteria:
  - Migrate every remaining package whose build script uses `build-plite-package.mjs`.
  - Preserve each package's public entrypoints, runtime format, external dependencies, sourcemap policy, and declaration contract.
  - Use one tsdown invocation per package for JavaScript and bundled declarations.
  - Create no `.plite-types` or temporary declaration-staging directories and never rewrite package manifests.
  - Delete the shared staging runner/config/tests only when source audit proves no consumer remains.
  - Prove every migrated package builds and typechecks, packed release artifacts resolve in NodeNext and Bundler, and zero stale runner references remain.
  - Stop only after full verified expansion or a real package-specific direct-DTS blocker.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: binary completion threshold
- initial confidence score: N/A: package/reference counts and command gates are stronger
- improvement loop: migrate and prove one package family at a time; fix declaration failures at their owning public type
- final score / loop closure: N/A: close only at zero runner consumers plus green package/artifact gates

Completion threshold:
- `rg` finds zero package build scripts or tooling callers for `build-plite-package.mjs` and zero declaration-staging path references outside historical plans.
- Every former consumer uses one package-owned tsdown invocation that emits runtime and declarations together.
- Every migrated package builds under the supported Node 22 runtime without mutating its manifest or leaving staging residue.
- Migrated package typechecks, focused runner/config contracts, `pnpm plite:packages:build`, `pnpm check:plite:dev`, and `node tooling/scripts/check-plite-release-artifacts.mjs` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-expand-one-pass-tsdown-builds.md` passes.

Verification surface:
- Source audit of package build scripts, tsdown configs, public exports, and obsolete shared tooling references.
- Per-package CI-mode builds under Node 22.22.1 with pre/post manifest hashes and staging-residue checks.
- Source-first typecheck for every migrated package.
- Focused tooling/config contract tests and scoped Biome lint.
- `pnpm plite:packages:build`, `pnpm check:plite:dev`, and packed release-artifact consumer proof.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live package manifests/exports/tsdown configs, the successful `packages/plite` POC, shared build runner/config, and release-artifact checker.
- Allowed edit scope: former shared-runner package manifests/configs; declaration-safe source types only when direct DTS exposes a real public-type defect; shared runner/config/contracts and this plan.
- Browser surface: N/A: package build tooling only.
- Browser strategy: N/A: no app or browser-visible behavior changes.
- Tracker sync: N/A: no ticket or PR requested.
- Non-goals: no runtime/editor behavior or public API redesign, no unrelated package migration, no compatibility bridge, no commit/push/PR, and no `isolatedDeclarations` annotation campaign.

Output budget strategy:
- Count and list exact runner consumers first; inspect only their manifests/configs/exports. Cap build logs to failures and summaries; exclude `node_modules`, `dist`, generated apps, `.next`, `.turbo`, and unrelated dirty files.

Blocked condition:
- Stop only when a package cannot emit valid direct declarations after three distinct owning-type/config attempts and the remaining choice requires a public API decision outside this migration.

Task state:
- task_type: package build-system batch migration
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: expand the proven package-local one-pass pattern and hard-delete staging machinery when the final consumer leaves
- confidence: high for the pattern; package-specific declaration inference remains the main risk
- next owner: task
- reason: explicit user continuation after successful POC

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-expand-one-pass-tsdown-builds.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expansion means every remaining shared-runner package, zero staging references, package/artifact proof, then stop. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `task` and `autogoal`; task template plus package-api pack owns the migration. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is prepared before goal creation. |
| Source of truth read before edits | yes | Prior POC read official tsdown 0.22.13 docs/source plus live Plite config, shared runner, and artifact contracts; consumer enumeration follows after goal creation. |
| Tracker comments and attachments read | no | N/A: direct request. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Prior POC consulted Plite ESM/declaration and release-artifact incident guidance; live source remains authoritative. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving build migration; contract and artifact proof replace fake TDD. |
| Branch decision for code-changing task | no | N/A: local execution only; do not inspect or change branch. |
| Release artifact decision | yes | Published artifacts require parity proof; no changeset unless runtime/types/public API actually changes. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact consumer counts/files first; capped package build/test output; generated trees excluded. |
| Package/API pack selected | yes | Package manifests, declaration artifacts, exports, and release consumers are the protected boundary. |
| Public surface or package boundary identified | yes | Preserve every package's existing export map and packed runtime/type behavior. |
| Release artifact path selected | no | N/A: build implementation only when artifact parity holds; add a changeset only if a public delta becomes necessary. |
| `changeset` skill loaded when `.changeset` is required | no | N/A at intake: no public delta intended. |
| Barrel/export impact decision recorded | yes | No exported source/file layout change intended; run `pnpm brl` only if direct-DTS repairs alter public exported files. |

Work Checklist:
- [x] N/A: no duration requested; package/reference counts and pass gates define completion.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording exists.
- [x] Nearby repo instructions and the proven POC pattern were read before edits.
- [x] Implementation fixes the right ownership boundary: one shared config helper owns direct tsdown policy, while a pure artifact helper owns post-build validation.
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A; emitted runtime, declarations, and export maps are equivalent, so package users see no API/runtime/type delta.
- [x] Final handoff shape decided: local batch migration with exact build, artifact, typecheck, contract, and smoke evidence; no PR/tracker work requested.
- [x] Branch handling recorded: N/A; user requested local execution and branch inspection/change is forbidden for this task.
- [x] Local-env-rot retry policy recorded: N/A; failures were deterministic config/runtime selection issues, not install corruption.
- [x] Workspace authority recorded: every proof ran in `/Users/zbeyens/git/plate-2` through package/root-owned scripts.
- [x] High-risk note recorded: build-command/declaration publication changed; realistic failures were missing declarations, mutated manifests, broken NodeNext imports, or bundled dependencies, all covered by direct builds and packed consumers.
- [x] Review target selected: exact direct-build helper/config/package/reference files; unrelated concurrent schema and DOM work excluded.
- [x] Agent-native review decision recorded: N/A; no `.agents/**`, `.claude/**`, `.codex/**`, skill, hook, prompt, or user-action tooling changed.
- [x] Output budget discipline recorded and followed: searches were scoped; build logs were capped; the first broad affected test output was truncated, then rerun through a failure-only filter.
- [x] Package/API pack: public export maps stayed unchanged; only package build ownership and artifact validation changed.
- [x] Package/API pack: release artifact matrix applied; explicit no-artifact result because packed public behavior/types/runtime are unchanged.
- [x] Package/API pack: N/A; no `.changeset` required, so `changeset` was not loaded.
- [x] Package/API pack: N/A; no registry work.
- [x] Package/API pack: no package user-visible delta from `main`; this is internal build tooling and artifact-parity enforcement.
- [x] Package/API pack: hard-cut is explicit—no runner, staging config, test, compatibility alias, or fallback path remains.
- [x] Package/API pack: 10 direct builds, 20/20 source-first typechecks, 53 focused contracts, aggregate build, affected check, and packed proof recorded.
- [x] Package/API pack: N/A; no public barrel or exported source layout changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Run the command, proof, source audit, or artifact check named in this plan | Zero runner/staging refs; aggregate, affected, and packed gates pass. |
| Bug reproduced before fix | pass | Record failing test/repro or N/A with reason | Release proof reproduced extensionless Core DTS chunk imports; generic tsdown 0.22 build reproduced export-generation failure. |
| Targeted behavior verification | pass | Run focused test/proof for changed behavior or record N/A | 53/53 focused tooling contracts plus 10 package artifact assertions pass. |
| TypeScript or typed config changed | pass | Run relevant typecheck | Turbo source-first graph: 20/20 successful. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: source exports and file layout unchanged. |
| Package manifests, lockfile, or install graph changed | pass | Run `pnpm install` and relevant package checks | POC installed tsdown 0.22.13 and produced the current lockfile; all package/build/artifact checks resolve it. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A. |
| Workspace authority proof | pass | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: package build tooling only. |
| Browser final proof | pass | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Conservative affected check required smoke; Chromium 3/3 passed on isolated port under Node 22.22.1. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | No runtime/type/export delta; no changeset. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | pass | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Only this execution ledger changed; every claim is backed by recorded commands. |
| High-risk mini gate | pass | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Direct declaration/public artifact failures are covered by hook, packed consumers, and immutable manifest hashes. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A; no corruption signal. |
| Autoreview for non-trivial implementation changes | caveat | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Helper refused unrelated untracked sensitive files; exact scoped manual review found and fixed plural conditional artifacts plus config option preservation, with no remaining actionable finding. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | pass | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | pass | Run `pnpm lint:fix` or scoped equivalent | Biome checked 20 scoped files; no fixes. |
| Output budget discipline | pass | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | First broad package-test output was truncated; later gates used failure-only filtering. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-expand-one-pass-tsdown-builds.md` | Run after this ledger update. |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | 10 packed packages and 31 public subpaths pass NodeNext/Bundler/runtime/DCE proof. |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Internal build ownership only; public artifacts are equivalent. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no published user-visible delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A. |
| No release artifact | pass | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal build tooling; no user-visible runtime/API/type delta. |
| Package typecheck/build/test | pass | Run owning package checks or record N/A with reason | 10 direct builds, 20/20 typechecks, aggregate build, affected check, 53 contracts. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no source exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Enumerated nine remaining consumers and shared runner responsibilities. | done |
| Implementation | completed | Ten packages use direct tsdown; staging runner/config/tests deleted. | done |
| Verification | completed | Builds, typechecks, contracts, packed artifacts, affected check, and smoke pass. | done |
| PR / tracker sync | completed | N/A: neither requested nor backed by a ticket. | done |
| Closeout | completed | Scoped lint/review/source audit complete; completion checker is the last command. | final response |

Findings:
- Nine packages still invoke `build-plite-package.mjs`: browser, core, plite-dom, plite-history, plite-hyperscript, plite-layout, plite-react, udecode/utils, and yjs.
- Seven own simple tsdown configs; core and udecode/utils delegate to the generic React-Compiler-aware config and need a named factory rather than copied configuration.
- The shared runner owns three concerns: declaration staging, a same-package build lock, and post-build artifact/private-brand assertions. Direct tsdown deletes staging and the lock; assertions remain useful as a small reusable hook.
- Stale ownership references also exist in the Plite affected-check router, the DOM package surface contract, and a schema-adoption ignored-directory list.
- `tsdown@0.22.13` emits NodeNext-correct `.js` specifiers for declaration chunks; the legacy `fixBrokenDtsChunkImports` plugin corrupted them by removing the extension.
- The upgraded generic tsdown config cannot keep `exports: true`: it crashes on existing string-form package bins. Existing manifests already own exports, so `exports: false` is the correct boundary.
- Direct builds for all ten release packages totalled 6,277 ms serially; the Turbo aggregate completed 13 build tasks in 6.613 s.

Decisions and tradeoffs:
- Replace the process runner with a pure package-config helper plus a post-build artifact assertion; do not keep a fallback runner.
- Derive expected artifacts from each package export map so multi-entry packages cannot drift from their manifest.

Implementation notes:
- Added `withDirectPackageConfig` / `defineDirectPackageConfig` for one-pass ESM, declarations, external dependencies, warning policy, and post-build artifact validation.
- Added export-map-derived artifact validation that covers every conditional runtime and types target plus the existing private declaration-brand audit.
- Migrated browser, core, plite, plite-dom, plite-history, plite-hyperscript, plite-layout, plite-react, udecode/utils, and yjs to one direct tsdown invocation.
- Deleted `build-plite-package.mjs`, its test, and `plite-dts.config.mts`; removed every live staging reference.
- Removed the obsolete declaration import postprocessor and narrowed release consumers for the live named/derived schema identity union.

Review fixes:
- Artifact discovery initially selected only one conditional runtime target; manual review changed it to validate all conditional runtime/type artifacts.
- Direct config initially overwrote caller DTS and warning options; manual review now preserves DTS options and composes custom warning suppression while enforcing the required defaults.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic tsdown 0.22 config with `exports: true` crashed on `@udecode/react-hotkeys` string-form `bin` | 1 | Keep manifest ownership explicit and disable tsdown export generation globally | Resolved; dependency package build and 20/20 graph typecheck pass. |
| Packed Core declarations had extensionless declaration-chunk imports | 1 | Remove the legacy postprocessor instead of adding another rewrite | Resolved; NodeNext and Bundler packed consumers pass. |
| First `check:plite:dev` package phase failed once while Yjs ran in the broad parallel set | 1 | Rerun the Yjs owner, then the composite gate | Yjs 217/217 and final composite gate pass. |
| Browser smoke inherited Node 24 because an assumed Homebrew Node 22 path was absent | 1 | Use the repo's actual `fnm exec --using 22` runtime | Resolved under Node 22.22.1. |
| Port 3102 was owned by another process | 1 | Start the Plite proof server on isolated port 3103 and pass its explicit base URL | Resolved without killing or reusing the other process. |
| Autoreview refused unrelated untracked sensitive files | 1 | Preserve user files; perform exact-scope manual review plus all owning proof | No actionable scoped finding remains; helper limitation recorded. |

Verification evidence:
- Focused tooling contracts: 53/53 pass in 555 ms.
- Direct CI-mode builds: 10/10 pass, 6,277 ms total, unchanged manifest hashes, no staging residue.
- Source-first Turbo typecheck: 20/20 tasks pass in 9.292 s.
- Aggregate `pnpm plite:packages:build`: 13/13 tasks pass in 6.613 s.
- Packed release proof: 10 packages, 31 public subpaths, NodeNext, Bundler, Node runtime, package direction, and bare/named DCE pass.
- Final `check:plite:dev`: pass in 87.742 s; typecheck 36.937 s, www 2.818 s, tests 37.042 s, contracts 8.634 s, browser 2.071 s.
- Chromium smoke: 3/3 pass in 1.4 s under Node 22.22.1.
- Source audit: zero package runner consumers, zero live staging references, zero staging directories.
- Scoped Biome: 20 files checked, no fixes.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct local request.
- Confidence line: 98%; every owning build/artifact/typecheck/test gate passes, with autoreview helper refusal as the only process caveat.
- Flow table:
  - Reproduced: generic export-generation crash and Core NodeNext DTS failure captured; browser N/A to product behavior.
  - Verified: all package/tooling/artifact gates pass; Chromium smoke 3/3.
- Browser check: conservative affected smoke passed under Node 22.22.1 on isolated port 3103.
- Outcome: all ten Plite release packages build runtime and declarations in one tsdown process; staging machinery is deleted.
- Caveat: structured autoreview could not bundle the dirty checkout because of unrelated user-owned sensitive files; exact-scope manual review and proof closed the task.
- Design:
  - Chosen boundary: package config owns build policy; a pure export-map helper owns artifact assertions.
  - Why not quick patch: retaining a staging runner would preserve the slow second compiler and manifest-rewrite risk.
  - Why not broader change: only the ten Plite release packages need bundled direct declarations; generic packages keep their established build lane.
- Verified: exact commands and timings recorded above.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: Chromium smoke 3/3; product browser surface unchanged.
- Caveats: autoreview bundle refusal only; no implementation blocker.

Timeline:
- 2026-07-22T09:17:31.089Z Task goal plan created.
- 2026-07-22T09:38:51Z Migration, hard deletion, artifact/typecheck/aggregate/affected proof, scoped lint, and review closure completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verified handoff |
| Where am I going? | Close the active goal and report results |
| What is the goal? | Replace every Plite-family staging build with one direct tsdown invocation and prove artifact parity. |
| What have I learned? | See Findings |
| What have I done? | Migrated ten packages, deleted staging machinery, and passed all owning gates. |

Open risks:
- None in scope. Structured autoreview remains unavailable until unrelated sensitive untracked files are staged, ignored, removed, or redacted by their owner.
