# remove block placeholder pristine option

Objective:
Remove `BlockPlaceholderPlugin.options.isEmptyBlockPristine`; done when source, tests, docs, and release artifacts no longer expose it and checks pass.

Goal plan:
docs/plans/2026-06-16-remove-block-placeholder-pristine-option.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user follow-up
- id / link: current Codex thread
- title: Cut `BlockPlaceholderPlugin.options.isEmptyBlockPristine`
- acceptance criteria: Remove the placeholder-specific pristine-empty option, make `BlockPlaceholderPlugin` consume `editor.api.isElementStateEmpty` directly, update tests/docs/release artifacts, and verify no stale public references remain.

Completion threshold:
- `BlockPlaceholderPlugin` no longer exposes or reads `isEmptyBlockPristine`.
- Tests assert metadata semantics through `node.isMetadataProp` / `editor.api.isElementStateEmpty`, not a placeholder-local override.
- Public docs no longer document `isEmptyBlockPristine`; docs point users at `node.isMetadataProp` for inert element metadata.
- Release artifacts remain relative to `main`: the real `@platejs/utils` patch
  changeset describes the single empty list-item placeholder fix, and no
  branch-only `isEmptyBlockPristine` removal changeset exists.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-remove-block-placeholder-pristine-option.md` passes.

Verification surface:
- Source audit: `rg -n "isEmptyBlockPristine" packages content apps docs .changeset -g '!apps/www/public/**' -g '!apps/www/src/generated/**'`.
- Focused tests: `pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx`.
- Package typecheck: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`.
- Docs checks: `pnpm --filter www build:source` and `pnpm --filter www check:docs`.
- Final lint/check: `pnpm lint:fix`; broader `pnpm check` if scoped gates do not cover the changed package/API surface.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user follow-up plus local `BlockPlaceholderPlugin`, core `isElementStateEmpty`, docs, and changeset rules.
- Allowed edit scope: `packages/utils`, affected docs under `content/docs`, `.changeset`, and goal-plan evidence. Core edits only if source audit proves necessary.
- Browser surface: N/A: package behavior/docs API cleanup with no rendered interaction change requiring Browser proof.
- Tracker sync: N/A: no issue or PR requested in this turn.
- Non-goals: do not rename `node.isMetadataProp` / `editor.api.isElementStateEmpty`; do not add a replacement placeholder option unless source proves it is needed.

Output budget strategy:
- Use focused `rg` with generated output exclusions; read only owning source/tests/docs slices; cap command output.

Blocked condition:
- Stop only if package checks expose unrelated install corruption that persists after the repo reinstall retry, or if source audit proves the option is used in an external generated surface that requires user release-policy input.

Task state:
- task_type: package API cleanup with supporting docs and release artifact
- task_complexity: non-trivial, auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: The option duplicates core metadata-state semantics and makes `BlockPlaceholderPlugin` a second ownership point for inert props.

Pre-solution issue challenge:
- reporter claim: N/A: user-directed cleanup, no public tracker bug claim.
- suggested diagnosis or fix: Cut the redundant option and rely on core `editor.api.isElementStateEmpty`.
- repro ladder:
  - tests / source-level repro: N/A: no bug claim; focused tests still required after edit.
  - Playwright / automated browser: N/A: no browser-only behavior.
  - Browser plugin: N/A: no browser surface changed.
  - screenshot / visual proof: N/A: no visual proof needed.
- reproduction verdict: N/A: cleanup, not bug reproduction.
- validity verdict: valid.
- best long-term fix boundary: core/plugin metadata API owns empty-state semantics; `BlockPlaceholderPlugin` only consumes it.
- harsh honest feedback: Keeping the option is API clutter and encourages callers to redefine metadata ownership in the wrong package.
- hard-stop decision: continue.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-remove-block-placeholder-pristine-option.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `docs-creator`, `changeset`, and `autogoal`. |
| Active goal checked or created | yes | `get_goal` returned no active goal; goal creation follows this filled plan. |
| Source of truth read before edits | yes | User follow-up and owning source/tests/docs from focused trace. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video. |
| Pre-solution issue challenge required | no | N/A: user-directed cleanup, no public issue bug claim. |
| Reproduction verdict before implementation | no | N/A: cleanup, not bug reproduction. |
| Repro escalation ladder selected | no | N/A: no bug or visual claim. |
| Suggested fix reviewed against durable boundary | yes | Boundary is core/plugin metadata ownership; placeholder consumes `editor.api.isElementStateEmpty`. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current source/tests/docs plus prior plan evidence identify the owner; no solution lookup needed. |
| TDD decision before behavior change or bug fix | yes | No new red test needed for cleanup; update focused specs to remove obsolete customization path and keep behavior coverage. |
| Branch decision for code-changing task | yes | No PR requested; use current checkout without branch hygiene. |
| Release artifact decision | yes | Public option removal needs `.changeset` unless source audit proves no published user-visible delta. |
| Browser tool decision for browser surface | no | N/A: no browser/UI interaction surface changed. |
| PR expectation decision | no | N/A: user asked to implement, not commit/push/PR. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Output budget strategy recorded | yes | Focused reads/searches with generated output excluded and capped output. |
| Docs pack selected | yes | Supporting docs are touched under normal task. |
| `docs-creator` loaded | yes | Loaded before docs edits. |
| Docs lane selected | yes | Plugin/API reference docs cleanup, supporting surface. |
| Target docs and nearest sibling docs read | yes | Read the English and Chinese block placeholder plugin docs before editing their API/feature text. |
| Docs style doctrine read | yes | Loaded `docs-creator` voice, plugin/API, anti-slop, and verification rules. |
| Documented source owner identified | yes | `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx`; metadata ownership in core/plugin API. |
| Package/API pack selected | yes | Public package config type changes. |
| Public surface or package boundary identified | yes | `@platejs/utils/react` and aggregate `platejs/react` expose `BlockPlaceholderPlugin`. |
| Release artifact path selected | yes | `.changeset` for published package delta. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded. |
| Barrel/export impact decision recorded | yes | No new exported files expected; run `pnpm brl` only if export/file layout changes. |

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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, focused tests, typecheck, docs checks, lint, broader check, and autoreview named in this plan | `rg -n "isEmptyBlockPristine" packages content apps .changeset ...` returned no matches; focused tests, package typecheck, docs checks, lint, `pnpm check`, and autoreview passed. |
| Pre-solution issue challenge verdict | no | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | N/A: user-directed cleanup, not a public bug report; durable boundary still recorded as core/plugin metadata ownership. |
| Repro escalation ladder | no | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | N/A: cleanup, no bug/visual claim. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: cleanup, not a bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/slate build && pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx` passed: 30 pass, 0 fail. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed: 7 successful, 7 total; `pnpm check` also passed full package typecheck. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported files, package export maps, or barrel-owned file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for package install graph: no package manifests or lockfiles changed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran after editing `.agents/rules/changeset.mdc`; generated `.agents/skills/changeset/SKILL.md` contains the same main-relative rule. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`, the owning repo. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no interactive browser route or rendered behavior changed; docs/source and package tests cover the cleanup. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser proof applies. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` changes. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/utils-block-placeholder-list.md` remains a patch changeset for the main-relative single empty list-item fix; no branch-only option-removal changeset exists. |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry output files changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | Loaded `docs-creator`; English and Chinese block placeholder docs now document current `editor.api.isElementStateEmpty` / `node.isMetadataProp` behavior only. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was stale branch-only API docs/changeset or list placeholder regression; proved by stale-symbol audit, focused tests, typecheck, docs checks, `pnpm check`, and autoreview. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Proportional agent-tooling proof used: `pnpm install` regenerated skill output and `rg` verified the new changeset rule in both source rule and generated skill. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no persistent install-corruption failure. A first focused test run raced a concurrent dependency build; rerun after builds passed. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local ...` passed clean: no accepted/actionable findings, overall 0.86. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested in this turn. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR created or updated. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR and no browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled final handoff fields below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed: 3280 files checked, no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad parallel read before compaction exceeded output budget; recovery used scoped `sed`/`rg` and capped outputs. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-remove-block-placeholder-pristine-option.md` | To run after this evidence update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Docs claim `editor.api.isElementStateEmpty` and `node.isMetadataProp`; source/tests verify both. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No links/routes/previews changed; docs parser still passed. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Block placeholder plugin API docs no longer list the branch-only option and use current-state reference voice. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `BlockPlaceholderConfig` no longer has `isEmptyBlockPristine`; `rg` found no source/docs/changeset references. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/utils` behavior fix from main gets patch changeset; branch-only option removal gets no release artifact. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/utils-block-placeholder-list.md` is patch-only for `@platejs/utils`; stale major/option-removal changeset absent. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No release artifact for `isEmptyBlockPristine` removal because it never existed on `main`; changeset rule now forbids branch-only API claims. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused tests and `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed; `pnpm check` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or file layout changes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read owning source/tests/docs and user correction about main-relative changesets. | implementation |
| Implementation | complete | Removed `isEmptyBlockPristine`, wired direct `editor.api.isElementStateEmpty`, updated docs/specs, and repaired changeset rule. | verification |
| Verification | complete | Source audit, focused tests, typecheck, docs checks, lint, `pnpm check`, and autoreview passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker item requested. | final response |
| Closeout | complete | Plan evidence filled; autogoal completion check ready. | final response |

Findings:
- `isEmptyBlockPristine` was branch-only API, not a `main` API, so a removal
  changeset would have been wrong.
- The durable boundary is `node.isMetadataProp` plus
  `editor.api.isElementStateEmpty`; `BlockPlaceholderPlugin` should consume
  that boundary directly.

Decisions and tradeoffs:
- Kept `.changeset/utils-block-placeholder-list.md` as a patch for the actual
  `main`-relative list placeholder fix.
- Do not add a new changeset for deleting `isEmptyBlockPristine`; that would
  document a phantom release delta.

Implementation notes:
- Removed `BlockPlaceholderConfig.options.isEmptyBlockPristine` and its default
  implementation.
- Updated tests to express custom metadata through a plugin-owned
  `node.isMetadataProp` rule.
- Updated English and Chinese block placeholder docs to point at
  `editor.api.isElementStateEmpty` / `node.isMetadataProp`.
- Repaired `.agents/rules/changeset.mdc` so changesets are always written
  relative to `main`, never the last commit or branch-local diff, then synced
  generated skill output with `pnpm install`.

Review fixes:
- User caught the wrong branch-local removal changeset. Fixed by deleting that
  release story and hardening the changeset rule against this exact mistake.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First focused test run failed while a parallel typecheck was building `@platejs/slate` dist | 1 | Rerun after dependency build settled | Rerun passed: 30 tests, 0 fail |
| Initial broad parallel read exceeded output budget before compaction | 1 | Resume with narrow `rg`/`sed` commands | Completed audits with capped output |

Verification evidence:
- `rg -n "isEmptyBlockPristine" packages content apps .changeset -g '!apps/www/public/**' -g '!apps/www/src/generated/**' -g '!apps/www/src/__registry__/**' -g '!**/CHANGELOG.md'` returned no matches.
- `rg -n 'Always relative to `main`, never last commit|NEVER write a changeset relative to the last commit|branch-only API|exists on `main`' .agents/rules/changeset.mdc .agents/skills/changeset/SKILL.md` found the rule in both source and generated skill.
- `pnpm --filter @platejs/slate build && pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx` passed: 30 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed: 7 successful, 7 total.
- `pnpm --filter www build:source && pnpm --filter www check:docs` passed.
- `pnpm lint:fix` passed: 3280 files checked, no fixes applied.
- `git diff --check` passed.
- `pnpm check` passed. It still printed the existing sidebar hook warning and existing `Detected multiple @platejs/core instances!` notice, but exit code was 0.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` passed clean: no accepted/actionable findings, overall 0.86.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker item.
- Confidence line: high, 95%+.
- Flow table:
  - Reproduced: N/A cleanup, browser N/A
  - Verified: tests green, browser N/A
- Browser check: N/A: no browser/UI interaction surface changed.
- Outcome: stale branch-only `isEmptyBlockPristine` API removed from package/docs/changesets; changeset rule now forbids branch-local release stories.
- Caveat: `pnpm check` emitted existing warnings/notices but passed.
- Design:
  - Chosen boundary: plugins own metadata classification with `node.isMetadataProp`; consumers call `editor.api.isElementStateEmpty`.
  - Why not quick patch: a placeholder-local predicate duplicates core metadata semantics and invites dirty branch-only release docs.
  - Why not broader change: `node.isMetadataProp` / `isElementStateEmpty` already express the right model; no rename or new API needed.
- Verified: source audit, focused tests, typecheck, docs parser, lint, full `pnpm check`, autoreview.
- PR body verified: N/A: no PR requested.

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A: no browser surface changed.
- Caveats: Existing repo warnings/notices in `pnpm check`; no failing gates.

Timeline:
- 2026-06-16T10:38:41.643Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Remove branch-only `BlockPlaceholderPlugin.options.isEmptyBlockPristine`, keep release artifacts relative to `main`, and pass checks |
| What have I learned? | `isEmptyBlockPristine` never existed on `main`; release notes must not describe branch-local APIs |
| What have I done? | Removed the option, repaired docs/tests/changeset rule, synced generated skill output, and passed verification |

Open risks:
- None.
