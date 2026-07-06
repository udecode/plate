# plate read only context cut

Objective:
Cut Plate read-only context; done when Plite owns the outer read-only provider,
Plate bridge is deleted, audits are clean, and Core/Plite checks pass.

Goal plan:
docs/plans/2026-07-04-plate-read-only-context-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-approved Plate Next boundary cut
- id / link: chat follow-up on `packages/core/src/react/internal/PlateReadOnlyContext.tsx`
- title: Move outer read-only shell ownership to Plite and delete Plate bridge
- acceptance criteria:
  - Plite React exposes the read-only provider/hook needed outside `<Plite>`.
  - Plate consumes the Plite-owned provider/hook.
  - `packages/core/src/react/internal/PlateReadOnlyContext.tsx` is deleted.
  - No `PlateReadOnlyContext` / `usePlateReadOnlyContext` references remain.
  - Focused tests, Core typecheck/lint, and relevant Plite React typecheck pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Done state:
  1. Plite React owns an exported outer read-only provider/hook suitable for
     shell components that render before a nested `<Plite>` provider.
  2. Plate uses that Plite owner in `Plate`, `PlateContainer`, and
     `PlateContent`.
  3. The Plate-only read-only context file is deleted.
  4. Source audit has no `PlateReadOnlyContext` or `usePlateReadOnlyContext`
     references.
  5. Focused Core behavior tests pass.
  6. Core and Plite React type/lint checks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-read-only-context-cut.md` passes.

Verification surface:
- Focused Core tests:
  - `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/Plate.slow.tsx src/react/hooks/useSlateProps.spec.tsx`
- Type/lint checks:
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm turbo typecheck --filter=./packages/plite-react`
  - `pnpm --filter @platejs/core lint`
  - `pnpm exec biome check packages/plite-react/src/hooks/use-editor-read-only.ts packages/plite-react/src/index.ts packages/core/src/react/components/Plate.tsx packages/core/src/react/components/PlateContainer.tsx packages/core/src/react/components/PlateContent.tsx`
  - `pnpm --filter @platejs/plite-react lint` is an observed package-wide
    debt check, not this packet's final closure gate.
- Source audits:
  - `rg -n "PlateReadOnlyContext|usePlateReadOnlyContext" packages/core/src packages/plite-react/src`
  - `rg -n "ReadOnlyContext|useOuterEditorReadOnly|OuterReadOnly" packages/plite-react/src packages/core/src/react`
- Browser proof: N/A; this is a package/runtime ownership cleanup with no
  route or rendered app surface changed directly.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `VISION.md`, `docs/vision/plate.md`,
  `docs/vision/common.md`, `plate-next`, Plite React read-only context source,
  and current Plate consumers.
- Allowed edit scope: `packages/plite-react/src/**`,
  `packages/core/src/react/components/**`, `packages/core/src/react/internal/**`,
  focused tests, and this plan. Touch broader Core/Plite only if type proof
  shows the owner API is wrong.
- Browser surface: N/A; no docs/app route changed.
- Browser strategy: N/A; package tests own this claim.
- Tracker sync: N/A; no issue/PR/tracker target.
- Non-goals: do not redesign Plate read-only API, do not rename public Plate
  components, do not add compatibility aliases, do not run a broad Core sweep.

Output budget strategy:
- Use focused `rg` queries for read-only contexts and narrow `sed` reads for
  relevant files. Cap command output. Avoid broad repo scans unless a focused
  audit reveals another owner.

Blocked condition:
- Block only if Plate shell read-only behavior cannot be represented by Plite
  without introducing a worse public API or breaking focused tests after the
  Plite owner is patched.

Task state:
- task_type: Plate Next / Plite React boundary cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-close

Current verdict:
- verdict: move generic outer read-only context to Plite React, delete Plate
  bridge
- confidence: 0.9 before patch
- next owner: plate-next
- reason: read-only is editor substrate/view state; Plate only needs to consume
  it early for product shell filtering.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-read-only-context-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User selected "Plite owns read-only state and a public outer provider/hook... Plate consumes that" and said "go... cut it from plate if that works. test properly." |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `plate-next` and `autogoal`. |
| Active goal checked or created | yes | `get_goal` returned null; created this goal. |
| Source of truth read before edits | yes | Read root/detail vision and read-only source/callers. |
| Tracker comments and attachments read | no | N/A: no tracker/attachment target. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no matching solution owner known; source owner is live package code. |
| TDD decision before behavior change or bug fix | yes | Use existing Core read-only/component tests plus add/adjust focused tests only if behavior gap appears. |
| Branch decision for code-changing task | no | N/A: local patch only, no PR requested. |
| Release artifact decision | yes | No changeset expected unless public Plite React export is considered user-visible package API; decide after implementation. |
| Browser tool decision for browser surface | no | N/A: no route/UI surface changed directly. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused reads/searches only. |
| Package/API pack selected | yes | Package boundary/API owner changes touch Plite React and Core. |
| Public surface or package boundary identified | yes | Plite React read-only provider/hook export and Plate bridge deletion. |
| Release artifact path selected | yes | Public Plite React exports added; changeset added at `.changeset/plite-react-read-only-provider.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` before adding the changeset. |
| Barrel/export impact decision recorded | yes | Core `brl` passed; `@platejs/plite-react` reports `No barrels to generate`. |

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
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry-only.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: public package delta has a changeset.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused Core tests, Plite React surface test, Core/Plite typechecks, Core lint, focused source lint, source audits, and `brl` completed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: ownership/API cleanup, not a bug reproduction lane. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/Plate.slow.tsx src/react/hooks/useSlateProps.spec.tsx` -> 8 pass; `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx` -> 54 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core` and `pnpm turbo typecheck --filter=./packages/plite-react` passed. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm --filter @platejs/core brl && pnpm --filter @platejs/plite-react brl` passed; Plite React has no barrels to generate. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` change. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran from `/Users/zbeyens/git/plate-2` against `@platejs/core` and `@platejs/plite-react`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: package/runtime provider ownership only; no route changed. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Added `.changeset/plite-react-read-only-provider.md`. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: not registry work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: plan-only docs artifact, no product docs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: Plate shell consumers could lose read-only state before nested `<Plite>` mounts. Proof: Plite surface provider test and Core read-only tests. Boundary: read-only is editor view state, so Plite React owns the provider; Plate consumes. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local env rot signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: narrow provider move with focused tests and typechecks; user did not ask for review. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/core lint` passed; focused Biome check on changed Core/Plite source passed. Full `@platejs/plite-react lint` remains red from unrelated existing 114 diagnostics. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad `rg` across docs/plans was accidentally noisy and truncated; recovered with direct `.changeset` reads and scoped audits. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-read-only-context-cut.md` | Run after this update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Root export list includes `EditorReadOnlyProvider` and `useOptionalEditorReadOnly`; bridge deletion audit has no old Plate context refs. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/plite-react` API/type addition. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `.changeset/plite-react-read-only-provider.md` uses `major` for `@platejs/plite-react`; no forbidden `minor`. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core focused tests, Plite React surface test, Core typecheck, Plite React typecheck all passed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm --filter @platejs/core brl && pnpm --filter @platejs/plite-react brl` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Plite read-only owner and Plate callers. | implementation |
| Implementation | complete | Added Plite provider/optional hook, rewired Plate callers, deleted Plate bridge. | verification |
| Verification | complete | Focused tests/typechecks/lints/audits passed; package-wide Plite React lint caveat recorded. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan updated; check-complete is the final command. | final response |

Findings:
- Plate's read-only bridge duplicated generic editor view state ownership.
- `@platejs/plite-react` package-wide lint is already red from unrelated debt;
  this packet used focused changed-source lint plus typecheck/tests instead.

Decisions and tradeoffs:
- Keep `useEditorReadOnly()` as the ergonomic boolean hook.
- Add `useOptionalEditorReadOnly()` for shell components that need to detect
  absence of an outer provider.
- Add `EditorReadOnlyProvider` in Plite React and consume it from Plate.
- Add a changeset because `@platejs/plite-react` gets new public exports.

Implementation notes:
- `packages/plite-react/src/hooks/use-editor-read-only.ts` now owns the public
  provider, optional hook, and boolean hook.
- `packages/core/src/react/components/Plate.tsx` provides read-only state via
  `EditorReadOnlyProvider`.
- `PlateContainer` and `PlateContent` consume `useOptionalEditorReadOnly()`.
- `packages/core/src/react/internal/PlateReadOnlyContext.tsx` is deleted.

Review fixes:
- Added immediate JSDoc for new public Plite React type/hook after the surface
  contract flagged missing docs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx` initially failed missing JSDoc for new public exports | 1 | Add source JSDoc, rerun focused surface test | Passed after JSDoc. |
| `pnpm --filter @platejs/plite-react lint` failed with 114 existing package diagnostics | 1 | Use focused changed-source Biome check and record package-wide lint debt | Focused source lint passed; package debt left out of this packet. |
| Broad `rg` across `.changeset docs/plans` produced huge truncated output | 1 | Read exact changeset files and scope later searches | Recovered; no data loss. |

Verification evidence:
- `rg -n "PlateReadOnlyContext|usePlateReadOnlyContext" packages/core/src packages/plite-react/src packages/plite-react/test --hidden` -> no matches.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/Plate.slow.tsx src/react/hooks/useSlateProps.spec.tsx` -> 8 pass.
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx` -> 54 pass.
- `pnpm turbo typecheck --filter=./packages/plite-react` -> pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm exec biome check packages/plite-react/src/hooks/use-editor-read-only.ts packages/plite-react/src/index.ts packages/core/src/react/components/Plate.tsx packages/core/src/react/components/PlateContainer.tsx packages/core/src/react/components/PlateContent.tsx` -> pass.
- `pnpm --filter @platejs/core brl && pnpm --filter @platejs/plite-react brl` -> pass.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker.
- Confidence line: 95% confidence. Remaining caveat is unrelated package-wide
  Plite React lint debt.
- Flow table:
  - Reproduced: N/A; ownership cleanup.
  - Verified: focused tests/typechecks/lints/audits passed; browser N/A.
- Browser check: N/A; no route/UI surface changed.
- Outcome: Plite React owns the outer read-only provider/hook and Plate no
  longer has a private read-only context.
- Caveat: full `@platejs/plite-react lint` remains red from unrelated existing
  diagnostics; changed source files lint clean.
- Design:
  - Chosen boundary: read-only is editor view state, so Plite React owns it.
  - Why not quick patch: keeping a Plate-only context preserves duplicate
    ownership and leaks substrate state into Plate shell code.
  - Why not broader change: this packet only needed read-only shell state; no
    reason to redesign all Plate view hooks.
- Verified: see evidence above.
- PR body verified: N/A; no PR.

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
- Browser proof: N/A; package/runtime ownership cleanup only.
- Caveats: full Plite React package lint is pre-existing red; focused lint and
  package typechecks/tests passed.

Timeline:
- 2026-07-04T20:52:09.155Z Task goal plan created.
- 2026-07-04T21:03:00Z Plite React provider/hook added, Plate bridge deleted,
  focused proof passed, changeset added.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Cut Plate read-only context and move generic provider ownership to Plite React. |
| What have I learned? | The Plate bridge was duplicate substrate state; Plite React can own it cleanly. |
| What have I done? | See Timeline and Verification evidence. |

Open risks:
- Full `@platejs/plite-react lint` still has unrelated existing diagnostics.
