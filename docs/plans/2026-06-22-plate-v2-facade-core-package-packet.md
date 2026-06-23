# plate v2 facade core package packet

Objective:
Plate v2 facade/core plus one package packet; done when core/facade and one package gates pass, then pause for review.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-22-plate-v2-facade-core-package-packet.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user instruction in current Codex thread
- id / link: N/A: no external issue or PR
- title: Plate v2 facade/core plus one package packet
- acceptance criteria: execute next items 1, 2, and 3 from the latest roadmap; fix/curate the `platejs` facade instead of bypassing it; keep normal Plate feature imports as `from 'platejs'`; migrate one foundational package from legacy `editor.tf/getTransforms/getPluginApi` patterns toward Plite-style `editor.api` plus `editor.update(tx => ...)`; pause after core plus one package are done for user review.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: concrete package gates are the metric
- improvement loop: N/A: stop after core plus one package checkpoint
- final score / loop closure: N/A

Completion threshold:
- `platejs` facade direction is recorded and not bypassed by touched feature packages.
- Core/facade API work needed for the first package packet is complete or explicitly deferred with source evidence.
- One foundational package is migrated through the accepted Plite-style API path, with no broad package churn.
- Focused package typecheck/test/build gates pass for core/facade and the migrated package, or unavailable tests are marked N/A with reason.
- Stop after core plus one package and hand off for user review before continuing the broader Plate migration.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-facade-core-package-packet.md` passes.

Verification surface:
- Source audit of `packages/plate`, `packages/core`, and the selected package.
- `pnpm --filter platejs build`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm --filter @platejs/core test`
- `pnpm --filter @platejs/core build`
- Focused typecheck/test/build for the selected package.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-facade-core-package-packet.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `docs/plans/2026-06-22-plate-v2-api-conflict-plan.md`, `docs/plans/2026-06-22-plate-v2-api-conflict-execution.md`, `packages/plate`, `packages/core`, and selected foundational package source/tests.
- Allowed edit scope: plan docs, `packages/plate` facade if needed, `packages/core` runtime/API typing if needed, and one selected package plus its tests/package metadata.
- Browser surface: N/A for this checkpoint unless a package change affects rendered app/editor behavior.
- Browser strategy: N/A: package/API typing checkpoint; browser proof is deferred unless behavior changes. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker/PR requested.
- Non-goals: no PR, no commit, no broad docs rewrite, no table/list/selection migration, no direct-import migration for ordinary feature packages, no continuing past one package before user review.

Output budget strategy:
- Use targeted `rg` and short `sed`/`nl` ranges only. Exclude generated output and app build folders. Keep package proof output capped. Do not stream repo-wide match bodies unless narrowed to package owners.

Blocked condition:
- Stop if the first package migration requires a public Plate API design decision beyond the accepted `editor.api` / `editor.update(tx => ...)` direction, or if core/facade gates fail in a way that requires changing Plite substrate APIs.

Task state:
- task_type: package/API migration checkpoint
- task_complexity: normal
- current_phase: pause for review
- current_phase_status: complete
- next_phase: user review
- goal_status: active

Current verdict:
- verdict: proceed with core/facade plus one package only
- confidence: 0.78 before source audit
- next owner: auto / task execution under autogoal
- reason: latest user asked to execute items 1, 2, and 3, but pause after core plus one package for review.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-facade-core-package-packet.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copies scope, non-goals, pause condition, verification surface, and success criteria. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | User explicitly loaded `autogoal`; this plan follows one-shot execution with package-api pack. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this goal. |
| Source of truth read before edits | yes | Read prior API conflict plan/execution excerpts, `packages/plate/src/index.tsx`, core editor tx bridge/tests, and `packages/basic-styles` plugin/tests. |
| Tracker comments and attachments read | N/A | No tracker/attachments. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | This is repo migration/API work; current plan/source files are the owner. |
| TDD decision before behavior change or bug fix | N/A | Package/API migration; add/adjust focused tests when behavior/type surface changes. |
| Branch decision for code-changing task | N/A | User asked for local changes only; no branch/PR. |
| Release artifact decision | yes | N/A for this checkpoint: no changeset requested and broader release/migration is not complete. |
| Browser tool decision for browser surface | N/A | No browser-visible behavior change in this checkpoint unless source audit proves otherwise. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync requested. |
| Output budget strategy recorded | yes | Targeted reads and capped proof output only. |
| Package/API pack selected | yes | `package-api` pack applied. |
| Public surface or package boundary identified | yes | Public Plate facade `platejs`, core runtime API typing, and one selected feature package. |
| Release artifact path selected | N/A | No published release artifact for this review checkpoint. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required for this checkpoint. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if package exports or exported file layout changes. |

Work Checklist:
- [x] Duration handling recorded: N/A, no duration requested.
- [x] First checkpoint complete: explicit requirements copied before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified: current-thread user instruction, local package/API migration checkpoint, no tracker.
- [x] Video evidence N/A: no video or screen recording in scope.
- [x] Source patterns read before edits: prior API conflict plans, `platejs` facade, core update bridge/tests, and `basic-styles` plugins/tests.
- [x] Implementation fixes the right ownership boundary: ordinary Plate feature packages keep `platejs`; `basic-styles` removes transform wrappers and uses tx groups.
- [x] Release artifact requirement recorded: N/A for review checkpoint; no commit/release requested.
- [x] Final handoff shape decided: changed list, commands, proof, caveats, and review pause.
- [x] Branch handling N/A: no branch/PR requested.
- [x] Local-env-rot retry policy N/A: no surprising repo-wide/env failure.
- [x] Workspace authority recorded: proof commands ran in `/Users/zbeyens/git/plate-2` with package filters.
- [x] High-risk note recorded: public API/package boundary changes are scoped to core tx proof and one package, with review pause before broader migration.
- [x] Autoreview deferred by explicit user pause after core plus one package; run before commit.
- [x] Agent-native review N/A: no `.agents/**`, hooks, skills, prompts, or user-action tooling changed.
- [x] Output budget discipline followed: targeted source reads and capped proof output only.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact recorded.
- [x] Package/API pack: release artifact matrix applied: no artifact for this review checkpoint.
- [x] Package/API pack: changeset N/A for this checkpoint.
- [x] Package/API pack: registry-only N/A.
- [x] Package/API pack: no-artifact decision recorded: review checkpoint before release packaging.
- [x] Package/API pack: compatibility/hard-cut decision explicit: remove `basic-styles` transform facade wrappers; keep `platejs` imports.
- [x] Package/API pack: package-owned typecheck/build/test proof recorded below.
- [x] Package/API pack: generated barrels/release notes N/A: no exported file layout change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audit and package proof | Core/facade plus `@platejs/basic-styles` proof recorded below. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | N/A: migration/API packet, not bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Core update test and `basic-styles` update-path tests pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Core and `basic-styles` typecheck pass. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported file layout or barrel change. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | N/A: no package manifest or install graph changed in this packet. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | N/A: no agent rules/skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: package/API test surface only. |
| Browser final proof | N/A | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser-visible route changed. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | N/A: no template output touched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Changeset deferred/N/A for review checkpoint; no release requested. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | N/A: not registry work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Plan docs only, source-backed; no public docs route changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: removing transform wrappers could break package call sites; source audit shows no `basic-styles` legacy transform usage remains and tests prove tx path. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no env-rot signal. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Deferred by explicit user pause after core plus one package; run before commit. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | N/A | Verify PR body when PR exists | N/A: no PR. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/core lint:fix` no fixes; `pnpm --filter @platejs/basic-styles lint:fix` fixed 7 files; package gates reran. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used targeted reads/searches only. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-facade-core-package-packet.md` | Run after ledger fill. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `basic-styles` keeps `platejs` imports and has no legacy transform/getter matches. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Package API behavior checkpoint; changeset intentionally deferred until reviewed. |
| Published package changeset | N/A | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A for review checkpoint; no release packaging requested. |
| Registry changelog | N/A | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry work. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Review checkpoint only; broader changeset/release decision waits for migration acceptance. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core and `basic-styles` typecheck/test/build pass. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prior API conflict plans, `platejs` facade, core update bridge/tests, and `basic-styles` source/tests read. | implementation |
| Implementation | complete | Core direct tx test added; `basic-styles` transform facade wrappers removed; update-path tests added. | verification |
| Verification | complete | Core/facade and `basic-styles` gates pass. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Stop at review pause after core plus one package. | final response |

Findings:
- `platejs` already acts as the Plate product facade; normal feature packages should keep importing from it.
- `packages/basic-styles` already had `extendTx` groups, so the clean migration packet was deleting redundant `extendTransforms` wrappers.
- Static/editor tests needed real `editor.update` proof, not only private `__txExtensions` unit calls.
- Core still has broader legacy `tf/transforms/getTransforms/getPluginApi` debt; this packet intentionally does not claim the whole core is clean.

Decisions and tradeoffs:
- Keep `platejs` imports for `basic-styles`; do not direct-import `@platejs/core` or `@platejs/utils`.
- Remove only `basic-styles` feature transform wrappers in this packet; leave larger core/default-route cleanup for the next review-approved packet.
- Add direct tx proof in core and package tests before migrating harder packages.

Implementation notes:
- Added `withPlate` core spec proving tx-backed plugin commands execute through `editor.update`.
- Removed `.extendTransforms` wrappers from font size, color, family, background color, weight, line height, and text align plugins.
- Added `editor.update` tests for font size and text align; changed text indent node updates from `editor.tf` to `editor.update`.

Review fixes:
- N/A: no autoreview run in this pause checkpoint.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg -n "extendTransforms|getTransforms|getPluginApi|\\.tf\\b|\\.transforms\\b" packages/basic-styles/src -g '*.ts' -g '*.tsx'` -> no matches.
- `rg -n "from ['\"]@platejs/(core|utils)['\"]" packages/basic-styles/src packages/basic-styles/package.json` -> no matches.
- `rg -n "executes tx-backed plugin commands|applies font size through the editor update transaction|applies text alignment through the editor update transaction|applies and clears text indent through node updates" packages/core/src/lib/editor/withPlite.spec.ts packages/basic-styles/src/lib/*.spec.ts` -> found expected proof rows.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core test` -> pass, 953 tests.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm turbo typecheck --filter=./packages/basic-styles` -> pass after lint.
- `pnpm --filter @platejs/basic-styles test` -> pass, 24 tests.
- `pnpm --filter @platejs/basic-styles build` -> pass.
- `pnpm --filter platejs build` -> pass.
- `pnpm --filter @platejs/core lint:fix` -> pass, no fixes.
- `pnpm --filter @platejs/basic-styles lint:fix` -> pass, fixed 7 files; package gates reran after fixes.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no external tracker.
- Confidence line: 0.88; core plus one package are green, but broader core legacy API debt remains.
- Flow table:
  - Reproduced: N/A: not bug fix.
  - Verified: core tests/typecheck/build, `platejs` build, `basic-styles` typecheck/test/build, source audits.
- Browser check: N/A: no browser-visible route changed.
- Outcome: core tx proof added and `basic-styles` migrated off feature transform wrappers while keeping `platejs` imports.
- Caveat: this does not remove global core `tf/transforms/getTransforms/getPluginApi` debt; it proves the next migration shape.
- Design:
  - Chosen boundary: `platejs` facade stays; package feature mutations move to Plite tx groups.
  - Why not quick patch: keeping transform wrappers would preserve the conflict the Plate v2 plan is trying to remove.
  - Why not broader change: user explicitly asked to pause after core plus one package for review.
- Verified: commands and source audits listed above.
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
- Browser proof: N/A, no browser route changed.
- Caveats: broader core and package migration remains; autoreview still needed before commit.

Timeline:
- 2026-06-22T12:11:18.068Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Pause checkpoint after core plus one package. |
| Where am I going? | Wait for user review before migrating the next package. |
| What is the goal? | Execute items 1, 2, and 3 narrowly: facade/core proof plus one package migration. |
| What have I learned? | `basic-styles` was a good first package because tx groups already existed and transform wrappers were redundant. |
| What have I done? | Added core direct tx proof, migrated `basic-styles` off feature transform wrappers, and verified package gates. |

Open risks:
- Broader core/default-route public legacy API remains.
- `createPliteEditor` naming and `platejs` facade curation remain separate review-approved packets.
- Autoreview has not run because this checkpoint intentionally pauses for user review first.
