# restore direct suggestion wrapper typing

Objective:
Restore direct descriptor inference for the static Suggestion wrapper and remove leaked definition/name-normalization types without changing runtime behavior.

Goal plan:
docs/plans/2026-08-13-restore-direct-suggestion-wrapper-typing.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api

Task source:
- type: direct user request following best-api review
- id / link: current Codex task
- title: Restore direct Suggestion wrapper typing
- acceptance criteria: the wrapper uses `RenderStaticNodeWrapperProps<typeof BaseSuggestionPlugin>`; redundant imports disappear; focused type/lint/source checks pass; repair Core only if direct inference fails.

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
- initial confidence score: 0.98
- improvement loop: direct consumer repair, focused type proof, Core pivot only on failure
- final score / loop closure: 1.0; exact static/live contracts and consumer proof complete

Completion threshold:
- One consumer type uses the direct descriptor; zero `DefinitionOf`/`WithAnyName` imports remain in suggestion-node-static.tsx; focused formatting and TypeScript proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-restore-direct-suggestion-wrapper-typing.md` passes.

Verification surface:
- Scoped Biome check, exact source audit, registry source check, and apps/www TypeScript diagnostics for the touched file.
- Browser N/A: type-only annotation/import cleanup with identical emitted runtime.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: suggestion-node-static.tsx and Core RenderStaticNodeWrapperProps definition.
- Allowed edit scope: suggestion-node-static.tsx, the owning Core wrapper contract and compile-only test, and this plan.
- Browser surface: none.
- Browser strategy: N/A: type-only. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: runtime suggestion behavior, JSX/CSS, unrelated render contracts, other WithAnyName consumers, skills, docs, and registry metadata.

Output budget strategy:
- Exact-file reads and capped focused commands only.

Blocked condition:
- Block only if direct descriptor typing exposes a broader Core inference redesign that cannot be fixed safely within this narrow task.

Task state:
- task_type: type-only registry refactor
- task_complexity: micro
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: remove redundant `DefinitionOf` and `WithAnyName`; pass the descriptor directly.
- confidence: 0.98
- next owner: task
- reason: the public wrapper prop type already extracts the definition; consumer normalization is redundant and erases exact identity.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-restore-direct-suggestion-wrapper-typing.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact accepted one-line type correction and Core fallback recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | task, autogoal, plate-ui; best-api target already accepted; shadcn N/A because no component API/markup/install change |
| Active goal checked or created | yes | No active goal; create after this plan is materialized |
| Source of truth read before edits | yes | Consumer, Core type owner, configuration caller, type test, Vision, and diff inspected |
| Tracker comments and attachments read | no | N/A |
| Video transcript evidence required | no | N/A |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro task with direct source owner |
| TDD decision before behavior change or bug fix | no | N/A: type-only refactor; focused compile proof is the regression surface |
| Branch decision for code-changing task | no | N/A: no git operation requested |
| Release artifact decision | yes | Existing `.changeset/plugin-portal-scoped-api.md` already promises direct descriptor wrapper contracts relative to main; no duplicate changeset |
| Browser tool decision for browser surface | no | N/A: emitted runtime unchanged |
| PR expectation decision | no | N/A |
| Tracker sync expectation decision | no | N/A |
| Output budget strategy recorded | yes | Exact files and capped commands |
| Package/API pack selected | yes | Added after direct consumer proof exposed the Core contract owner |
| Public surface or package boundary identified | yes | @platejs/core static wrapper callback typing |
| Release artifact path selected | yes | Existing plugin-portal-scoped-api changeset owns this branch-vs-main delta |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded and audited existing owner entry; no new file |
| Barrel/export impact decision recorded | yes | Existing exported symbols unchanged; no barrel generation |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Direct consumer audit, Core type contracts, Core source typecheck, registry check, focused kit test, and Biome pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | apps/www TypeScript produced TS2322 at suggestion-base-kit for the direct descriptor callback before Core repair |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Core compile-only contracts prove exact static/live callbacks configure successfully and unrelated descriptors fail |
| TypeScript or typed config changed | yes | Run relevant typecheck | Core source typecheck and typecheck:contracts pass; app no longer reports suggestion-base-kit |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or file layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Core proof ran in packages/core through workspace commands; registry proof ran in apps/www |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: type-only emitted-runtime-neutral change |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Existing plugin-portal-scoped-api changeset already documents direct descriptor wrapper inference relative to main |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: registry runtime/output is identical; package type contract is the owner |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was widening or cross-plugin acceptance; positive and negative compile contracts prove exact identity at Core owner |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: deterministic source diagnostics |
| P2 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: micro two-line type-owner repair with dedicated positive/negative compile contracts |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome write/check passed 4/4 |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact files and capped commands only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-restore-direct-suggestion-wrapper-typing.md` | Final checker rerun after evidence update |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Static/live belowRootNodes preserve exact C; direct consumer compiles; unrelated descriptors rejected |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Branch API typing already covered by plugin-portal-scoped-api relative to main |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `.changeset/plugin-portal-scoped-api.md` states direct descriptor wrapper inference; no duplicate |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: final fix is part of the published Core type contract and emits no registry runtime change |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: existing package changeset is the artifact |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core source typecheck and typecheck:contracts pass; full aggregate typecheck has two unrelated callout toggle test errors |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or file-layout change |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | exact consumer/Core/caller/diff audit | implementation |
| Implementation | complete | direct consumer plus exact Core static/live contracts | verification |
| Verification | complete | positive/negative type contracts, source typecheck, kit test, registry, Biome, source audit | closeout |
| PR / tracker sync | N/A | not requested | final response |
| Closeout | complete | evidence and risks recorded | final response |

Findings:
- The current diff replaced the previously correct direct-descriptor annotation with redundant `DefinitionOf` plus `WithAnyName` plumbing.
- RenderStaticNodeWrapperProps already accepts descriptors and extracts DefinitionOf internally.
- WithAnyName widens the exact plugin name and belongs to generic builder machinery, not registry consumer code.
- Direct apps/www TypeScript proof fails at suggestion-base-kit because BasePlugin `belowRootNodes` alone widens its callback props through `WithAnyName<C>`; the consumer workaround was masking this Core owner bug.

Decisions and tradeoffs:
- Restore the direct descriptor at the consumer first; touch Core only if focused TypeScript proof exposes an owner-level inference bug.
- Core pivot accepted: preserve exact `C` for both static and live `belowRootNodes`, because both public callback families promise direct descriptor inference; leave unrelated render fields untouched.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct consumer form fails assignment in suggestion-base-kit | 1 | Repair Core `belowRootNodes` exact descriptor contract | Fixed; app diagnostic disappeared |
| Full Core aggregate typecheck fails in compilePlateModel.spec.ts | 1 | Separate owner proof from unrelated test debt | Core source and contract typechecks pass; two unrelated callout toggle diagnostics remain |

Implementation notes:
- Removed consumer `DefinitionOf` and `WithAnyName`; the direct descriptor form matches the prior correct registry source.
- Core static and live `belowRootNodes` callbacks now preserve exact definition `C` instead of widening the plugin name.
- Compile-only contracts prove exact schema/plugin capabilities and reject cross-plugin callback reuse.

Review fixes:
- Added the live mirror after reviewing the shared public contract; leaving it widened would preserve the same leak for Plate renderers.
- Added negative static/live assignments so the fix cannot silently widen callbacks to unrelated descriptors.

Verification evidence:
- `pnpm --filter @platejs/core typecheck:contracts` -> passed after positive and negative static/live root callback coverage.
- `pnpm --filter @platejs/core exec plate-pkg p:typecheck` -> passed.
- `bun test apps/www/src/registry/components/editor/plugins/suggestion-base-kit.spec.ts` -> 1/1 passed.
- apps/www `tsc --noEmit` -> previous suggestion-base-kit TS2322 is gone; unrelated List/Media/Table/Suggestion-package/test-global failures remain.
- `pnpm exec biome check <4 files>` -> 4/4 passed.
- Registry source checker -> passed.
- Exact source audit -> direct consumer and exact static/live Core contracts passed.
- `git diff --check` -> passed.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: 99%
- Flow table:
  - Reproduced: TS2322 at suggestion-base-kit with direct descriptor before Core fix; browser N/A
  - Verified: exact type contracts, source typecheck, focused kit test, registry and formatting pass; browser N/A
- Browser check: N/A: emitted runtime unchanged
- Outcome: consumer compiler plumbing removed and Core exact callback inference repaired
- Caveat: full aggregate checks retain unrelated current-tree errors listed above
- Design:
  - Chosen boundary: Core static/live belowRootNodes callback typing
  - Why not quick patch: the consumer annotation was masking the Core widening bug
  - Why not broader change: other render fields were not implicated by this direct callback failure
- Verified: commands listed above
- PR body verified: N/A

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
- Browser proof: N/A: type-only
- Caveats: unrelated aggregate typecheck failures only

Timeline:
- 2026-08-13T19:15:13.806Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Restore direct Suggestion wrapper typing and repair its Core inference owner |
| What have I learned? | See Findings |
| What have I done? | Removed consumer plumbing, repaired exact static/live Core contracts, and added positive/negative compile proof |

Open risks:
- Full Core and apps/www aggregate typechecks remain red from unrelated current-tree Callout/List/Media/Table/Suggestion/test-global work; all owning checks for this change pass.
