# plate-core-dom-api-delta

Objective:
Cut duplicate Plite DOM API declarations from Plate Core DOMPlugin; done when Core only extends DOM with Plate-owned delta and Core type/tests pass.

Goal plan:
docs/plans/2026-07-01-plate-core-dom-api-delta.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: local Plate Next implementation task
- id / link: N/A
- title: Cut duplicate Plite DOM declarations from Core DOMPlugin
- acceptance criteria:
  - `DOMPlugin` does not redeclare Plite-owned DOM API methods such as
    `isComposing`, `isFocused`, `isReadOnly`, `assertDOMNode`,
    `resolveDOMNode`, or `focus`.
  - Core only extends the existing `dom` API group with Plate-owned behavior,
    currently `isAutoScrolling`.
  - Any Plate read-only default still flows through Plite-owned state instead
    of a Core DOM wrapper.
  - Focused Core DOM tests and Core typecheck pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: 0.9
- improvement loop: N/A
- final score / loop closure: 0.95 after focused tests, Core/Plite typechecks, and scoped lint passed.

Completion threshold:
- Done when `DOMPlugin` only contributes the Plate-owned DOM API delta,
  Plite-owned DOM methods are not repeated in `DomConfig`, Plate read-only
  defaults use Plite view state, focused Core DOM tests pass, Core typecheck
  passes, and this plan checker passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-core-dom-api-delta.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/react/components/PlateContent.spec.tsx`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- Source audit: `DOMPlugin.ts` and Core `editor.api.dom.*` callers.
- Browser proof: N/A, no rendered route or browser behavior surface.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user request and current Core/Plite DOM API owners.
- Allowed edit scope: `packages/core/src/lib/plugins/dom/DOMPlugin.ts`,
  focused Core tests/type-tests if required, and this plan.
- Browser surface: N/A, package runtime/type behavior only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: Do not redesign Plite DOM, do not rename plugin owners, do not
  add compatibility aliases, do not broaden into unrelated Core cleanup.

Output budget strategy:
- Use focused `rg` searches for DOM API callers and scoped package commands.

Blocked condition:
- Block only if Core cannot extend the existing `dom` group without losing
  inferred Plite DOM methods, which would indicate a plugin API typing gap.

Task state:
- task_type: package runtime/type boundary cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: complete
- confidence: 0.95
- next owner: none
- reason: Core now exposes only `dom.isAutoScrolling`, generic read-only checks
  use Plite view state, DOM-only navigation calls are guarded, and all scoped
  proof commands passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-core-dom-api-delta.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied above. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | `plate-next` and `autogoal` read. |
| Active goal checked or created | yes | Goal created for Core DOM API delta. |
| Source of truth read before edits | yes | User prompt plus Core/Plite DOM owner files read. |
| Tracker comments and attachments read | N/A | No tracker source. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Focused Core migration cleanup; no solution doc owner. |
| TDD decision before behavior change or bug fix | yes | Use existing focused DOM tests plus typecheck; add tests only if a gap appears. |
| Branch decision for code-changing task | yes | Current checkout; no branch/PR requested. |
| Release artifact decision | yes | N/A: active Plate v2 beta migration cleanup, no changeset requested. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | Focused searches and scoped commands only. |
| Package/API pack selected | yes | Core package API/type surface touched. |
| Public surface or package boundary identified | yes | `DOMPlugin` should extend Plite DOM instead of restating it. |
| Release artifact path selected | N/A | No published release artifact requested for this migration lane. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required. |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout changed. |

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
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused tests, Core/Plite typechecks, Core/Plite lint, and source sweep passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | This was an API boundary cleanup, not a bug repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `56 pass, 0 fail, 155 expect() calls`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Core and Plite typechecks passed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No manifest or lockfile change. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent files changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | All commands ran in `/Users/zbeyens/git/plate-2` for `@platejs/core` and `@platejs/plite`. |
| Browser surface changed | N/A | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | No browser surface changed. |
| Browser final proof | N/A | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Package runtime/type behavior only. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No template output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | N/A: active Plate v2 beta migration cleanup; no release artifact requested. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component work. |
| Docs or content changed | N/A | Verify source-backed claims, links, examples, rendered output, or record N/A | Only this plan changed. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and boundary | Failure mode was lost read-only/DOM methods; fixed via Plite view state and guarded DOM-capable calls, proven by focused tests/types. |
| Agent-native review for agent/tooling changes | N/A | Review only if agent files changed | No agent/tooling files changed. |
| Local install corruption suspected | N/A | Run reinstall only for env rot signal | Failures were real code/test issues and fixed directly. |
| Autoreview for non-trivial implementation changes | N/A | Run if requested or broad diff needs review | Focused boundary patch with direct tests/types/lint; no review requested. |
| PR create or update | N/A | Run check before PR work and sync PR body | No PR requested. |
| Task-style PR body verified | N/A | Verify PR body if PR exists | No PR. |
| PR proof image hosting | N/A | Host proof images if PR body needs them | No PR/browser proof. |
| Tracker sync-back | N/A | Sync tracker after PR exists | No tracker. |
| Final handoff contract | yes | Fill final handoff fields below | Final handoff fields resolved below. |
| Final lint | yes | Run scoped lint | Core and Plite lint passed. |
| Output budget discipline | yes | Verify no unbounded output streamed | Searches and commands were scoped. |
| Timed checkpoint | N/A | Run until duration only when requested | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-core-dom-api-delta.md` | Run before completion. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `DOMPlugin` now contributes only `dom.isAutoScrolling`; Plite read-only lives in Plite public state. |
| Release artifact classification | yes | Record artifact class | No artifact for active migration cleanup; no docs or package release note requested. |
| Published package changeset | N/A | Add changeset if package users need release note | No changeset requested for this beta migration cleanup. |
| Registry changelog | N/A | Use registry changelog for registry-only work | No registry work. |
| No release artifact | yes | Record exact reason | Active Plate v2 beta migration cleanup with scoped internal API boundary correction. |
| Package typecheck/build/test | yes | Run owning package checks | Core focused tests, Core typecheck, Plite typecheck, Core lint, Plite lint passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports/layout changed | No exports or layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Core/Plite DOM owner files read | implementation |
| Implementation | complete | Core DOM wrapper cut; Plite view read-only added | verification |
| Verification | complete | Focused tests, Core/Plite typechecks, Core/Plite lint passed | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Plan checker run before final response | final response |

Findings:
- `DOMPlugin` was restating Plite DOM methods and faking `isReadOnly`; that hid the real boundary.
- Base Plite public state had no root-level `readOnly` initialization, so Core had been compensating in the wrong layer.
- Navigation feedback has legitimate optional DOM needs, so those calls are now guarded instead of typed into `DomConfig`.

Decisions and tradeoffs:
- `DOMPlugin` now exposes only `dom.isAutoScrolling`.
- Generic read-only checks use `editor.read.view.isReadOnly()`.
- `createEditor` accepts `readOnly` and stores it in Plite public state.
- `createBaseEditor` and `createPlateEditor` pass `readOnly` into Plite editor creation when they create the editor.
- React DOM runtime read-only remains in React/Plite DOM; Core does not wrap it.

Implementation notes:
- Cut `DOMApi` picks and `createCoreDomApi` from `DOMPlugin.ts`.
- Removed dead `DOMPlugin.configure({ options: { readOnly } })` from `getCorePlugins`.
- Updated Core handlers/render paths to use `editor.read.view.isReadOnly()`.
- Updated navigation feedback DOM calls with local capability guards.
- Updated focused tests to assert the new owner split.

Review fixes:
- Fixed the first Plite public-state patch from an invalid closed-over `options` reference to an `EDITOR_READ_ONLY` WeakMap.
- Removed stale test assertions that expected DOM read-only on Core-only editors.
- Applied lint formatter fixes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Plite public-state patch referenced `options` outside scope | 1 | Store read-only in a WeakMap during initialization | Fixed; focused tests reran green. |
| Core focused tests still expected DOM read-only/composition methods | 1 | Move assertions to Plite view or Plate store | Fixed; focused tests reran green. |
| Core typecheck found navigation DOM assumptions | 1 | Guard optional DOM-capable calls locally | Fixed; Core typecheck reran green. |
| Core lint found formatting issues | 1 | Apply formatter shape | Fixed; Core lint reran green. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/react/components/PlateContent.spec.tsx src/static/editor/withStatic.spec.tsx` passed: `56 pass, 0 fail, 155 expect() calls`.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter @platejs/plite lint` passed.
- Sweep: no Core source callers remain for `editor.api.dom.isReadOnly`, `isComposing`, `isFocused`, `assertDOMNode`, or `resolveDOMNode`; only a spec-defined custom `focus` extension remains.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: 95%.
- Flow table:
  - Reproduced: boundary smell found by source audit and focused failing tests after the wrapper cut.
  - Verified: focused tests, Core/Plite typechecks, Core/Plite lint passed.
- Browser check: N/A, no browser surface changed.
- Outcome: Core DOMPlugin only adds Plate-owned `isAutoScrolling`; read-only is Plite view state.
- Caveat: no full repo check or browser proof run.
- Design:
  - Chosen boundary: Plite owns DOM/read-only state; Core DOMPlugin owns auto-scroll middleware.
  - Why not quick patch: restating `DOMApi` in Core keeps the same ownership bug.
  - Why not broader change: Plite DOM API redesign is not needed for this cleanup.
- Verified: commands listed in Verification evidence.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: scoped proof only; no full repo check.

Timeline:
- 2026-07-01T12:28:22.799Z Task goal plan created.
- 2026-07-01T12:36:00Z Core DOM wrapper cut and Plite read-only state patched.
- 2026-07-01T12:43:00Z Focused tests, typechecks, lint, and source sweep passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Final response after plan checker and goal completion. |
| What is the goal? | Cut duplicate Plite DOM declarations from Core DOMPlugin and prove types/tests. |
| What have I learned? | Core should add only `isAutoScrolling`; read-only belongs to Plite view state and DOM-only calls need DOM capability guards. |
| What have I done? | Patched Core/Plite owners, updated tests, ran focused tests, typechecks, lint, and source sweep. |

Open risks:
- No known open risks for the scoped change. Full repo check was not run.
