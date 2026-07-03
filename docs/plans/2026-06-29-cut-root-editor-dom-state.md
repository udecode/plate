# cut root editor dom state

Objective:
Cut mutable root editor.dom state; done when Core uses Plite DOM APIs/internal plugin state and checks pass.

Goal plan:
docs/plans/2026-06-29-cut-root-editor-dom-state.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-accepted Plate/Plite boundary hard cut
- id / link: chat continuation
- title: Cut root `editor.dom` mutable state
- acceptance criteria: stable DOM reads move to Plite API; `currentKeyboardEvent` and `prevSelection` do not become public mutable API; Core no longer relies on root `editor.dom`; focused Core/Plite checks pass.

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
- initial confidence score: N/A: binary API/source audit plus checks
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `packages/core` no longer exposes or uses mutable root `editor.dom`.
- Stable DOM state reads are owned by Plite/DOM/React APIs.
- Event-scoped keyboard state and previous selection are internal owner state, not public root editor fields.
- Source audit for root `editor.dom` mutable fields has zero Core matches except deliberate Plite capability API usage.
- Focused package checks for touched Plite/Core owners pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-root-editor-dom-state.md` passes.

Verification surface:
- Source audit: `rg` for `editor.dom.(composing|currentKeyboardEvent|focused|prevSelection|readOnly)` in Core.
- Package checks: Core typecheck/test/lint, plus touched Plite package checks.
- Browser proof: N/A unless rendered docs/app routes are changed.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current checkout; Plite owns editor DOM/read substrate; Plate owns product plugin composition.
- Allowed edit scope: `packages/plite*`, `packages/core`, tests/docs only if touched by this API cut.
- Browser surface: N/A unless docs/app UI changes.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/PR tracker target.
- Non-goals: no rename pass, no broad Plate package migration, no public API compat aliases.

Output budget strategy:
- Use exact files and focused `rg` patterns; cap source reads; avoid repo-wide noisy output.

Blocked condition:
- Stop only if a clean Core migration requires a missing Plite primitive whose public shape needs user/API review.

Task state:
- task_type: package-boundary/runtime API hard cut
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: execute accepted boundary cut
- confidence: initial 0.78
- next owner: Plite DOM/React + Core plugin state
- reason: root mutable `editor.dom` conflicts with Plite DOM capability ownership.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-root-editor-dom-state.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Stable DOM reads to Plite API; no public `currentKeyboardEvent`/`prevSelection`; kill Plate root mutable `editor.dom`; verify Core/Plite. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`; prior turn loaded `plite-plan` for accepted boundary. |
| Active goal checked or created | yes | `create_goal` objective points to this plan. |
| Source of truth read before edits | yes | Read `SlateEditor.ts`, `withPlite.ts`, Plite DOM/React API owners in prior review and this run. |
| Tracker comments and attachments read | no | N/A: no tracker target. |
| Video transcript evidence required | no | N/A: no media input. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is active migration code, source owners are live files. |
| TDD decision before behavior change or bug fix | yes | Use focused existing tests plus add/repair tests only if API semantics need coverage. |
| Branch decision for code-changing task | no | N/A: user did not ask branch work. |
| Release artifact decision | yes | No changeset during in-progress Plate/Plite migration unless release lane asks. |
| Browser tool decision for browser surface | no | N/A: no browser route/UI change expected. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker target. |
| Output budget strategy recorded | yes | Exact file reads and focused `rg`; no broad logs. |
| Package/API pack selected | yes | Package API pack applies: public/runtime API shape changes. |
| Public surface or package boundary identified | yes | Plite owns DOM state reads; Plate Core must not expose competing root mutable DOM state. |
| Release artifact path selected | no | N/A: no release artifact during this local migration checkpoint. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported files/barrels change. |

Work Checklist:
- [x] No duration requested; timed checkpoint N/A.
- [x] First checkpoint complete: accepted cut captured before edits.
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified as user-accepted Plate/Plite boundary hard cut.
- [x] Video/screen recording N/A: no media input.
- [x] Source owners read: Core editor type, `withPlite`, DOM plugin, Plite DOM/React API.
- [x] Implementation fixes ownership boundary: stable reads through `editor.api.dom`, root mutable `editor.dom` removed from Core.
- [x] Release artifact N/A: local migration checkpoint, no release/changelog requested.
- [x] Final handoff shape: changed files, proof, caveat, next packet.
- [x] Branch handling N/A: no branch/PR requested.
- [x] Local-env-rot retry N/A: no install-corruption signal.
- [x] Workspace authority recorded: all proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note: public/runtime API boundary changed; proof is Core/Plite source audit plus `pnpm check:core`.
- [x] Autoreview N/A for this tight interactive packet; user asked implementation, not commit-ready review.
- [x] Agent-native review N/A: no `.agents`, `.codex`, hooks, or skill sources changed.
- [x] Output budget discipline mostly followed; `pnpm check:core` streamed verbose Plite test output despite passing, recorded in Error attempts.
- [x] Package/API pack: public/runtime API boundary recorded.
- [x] Package/API pack: no changeset because this branch is an in-progress migration checkpoint.
- [x] Package/API pack: changeset skill N/A.
- [x] Package/API pack: registry changelog N/A.
- [x] Package/API pack: no release artifact reason recorded.
- [x] Package/API pack: hard-cut decision explicit: no public root mutable `editor.dom`.
- [x] Package/API pack: package-owned typecheck/build/test proof recorded.
- [x] Package/API pack: barrels N/A because no exported barrel/layout changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named checks and source audit | `pnpm check:core` passed; focused Core specs passed; root `editor.dom` source audit returned no matches. |
| Bug reproduced before fix | no | Record N/A | N/A: architecture hard cut, not bug repro. |
| Targeted behavior verification | yes | Run focused test/proof | `pnpm --filter @platejs/core exec bun test ...` passed 68 tests across 8 touched specs. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter @platejs/core typecheck` passed; `pnpm check:core` typecheck phase passed. |
| Package exports or file layout changed | no | Record N/A | N/A: added internal non-exported helper; no public barrel path changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A | N/A: no package manifest or lockfile touched. |
| Agent rules or skills changed | no | Record N/A | N/A: no agent files touched. |
| Workspace authority proof | yes | Run proof in owning repo/package | Commands ran from `/Users/zbeyens/git/plate-2`; package owner `@platejs/core`; `check:core` includes Plite. |
| Browser surface changed | no | Record N/A | N/A: no content/app route/UI changed. |
| Browser final proof | no | Record N/A | N/A: no browser surface changed. |
| CI-controlled template output changed | no | Record N/A | N/A: no templates/registry output touched. |
| Package behavior or public API changed | yes | Record artifact decision | Runtime API boundary changed locally; no changeset because branch is mid-migration checkpoint. |
| Registry-only component work changed | no | Record N/A | N/A: no registry component work. |
| Docs or content changed | no | Record N/A | N/A: no docs/content changed. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: read-only/composition gating could desync; proof: focused specs plus `check:core` and zero root-state audit. |
| Agent-native review for agent/tooling changes | no | Record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Record N/A | N/A: failures were source/test/lint issues and were fixed directly. |
| Autoreview for non-trivial implementation changes | no | Record N/A | N/A: not commit-ready review; interactive API packet only. |
| PR create or update | no | Record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Record N/A | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | Record N/A | N/A: no tracker target. |
| Final handoff contract | yes | Fill fields below | Final handoff fields filled with changes/proof/caveat. |
| Final lint | yes | Run scoped lint | `pnpm --filter @platejs/core lint` passed. |
| Output budget discipline | yes | Record miss/recovery | Source reads were scoped; `pnpm check:core` produced excessive Plite test output despite passing; recorded under Error attempts. |
| Timed checkpoint | no | Record N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run check-complete | Passed. |
| Public API / package boundary proof | yes | Source-audit boundary | Root mutable `editor.dom` audit returned no matches; stable DOM reads appear as `editor.api.dom.*`. |
| Release artifact classification | yes | Record classification | In-progress migration/runtime API checkpoint; no release artifact requested. |
| Published package changeset | no | Record N/A | N/A: no changeset during this local migration checkpoint. |
| Registry changelog | no | Record N/A | N/A: no registry work. |
| No release artifact | yes | Record reason | No release artifact: local mid-migration API cleanup, not release lane. |
| Package typecheck/build/test | yes | Run package checks | Focused specs, Core typecheck/test/lint/build, and `pnpm check:core` passed. |
| Barrel/export generation | no | Record N/A | N/A: no exported barrel/file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Core editor/DOM call sites and Plite DOM/React ownership. | implementation |
| Implementation | complete | Removed Core root mutable `editor.dom`, added internal read-only fallback, moved reads to `editor.api.dom`. | verification |
| Verification | complete | Focused specs, Core typecheck/test/lint/build, source audits, `pnpm check:core`. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Ledger updated; final mechanical gate passed. | final response |

Findings:
- Plite-DOM already owns `api.dom.isComposing/isFocused/isReadOnly`; Core root mutable `editor.dom` was redundant and conflicting.
- `currentKeyboardEvent` and `prevSelection` had no real consumers outside their own tests, so they were dead state rather than useful private state.

Decisions and tradeoffs:
- Public stable reads stay on `editor.api.dom`.
- `currentKeyboardEvent` and `prevSelection` are cut, not moved.
- Core keeps only an internal read-only fallback WeakMap so first-render/static Core plugin gating does not depend on root mutation.

Implementation notes:
- Added `packages/core/src/internal/plugin/domRuntimeState.ts`.
- Removed `dom` from Core `BaseEditor` type.
- `DOMPlugin` now merges stable DOM read methods into `editor.api.dom`.
- Core call sites read `editor.api.dom.isReadOnly()` / `isComposing()`.

Review fixes:
- Fixed stale specs and lint after typecheck/lint surfaced old root-state assumptions.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined patch missed actual import shape | 1 | Split patches by file owner | Fixed with smaller `apply_patch` chunks. |
| Core typecheck found stale `editor.dom` spec | 1 | Patch spec to current API proof | `withStatic.spec.tsx` now asserts `editor.api.dom.isReadOnly()`. |
| Core lint found formatting/unused import | 1 | Format helper and remove unused import | Core lint passed. |
| `pnpm check:core` streamed verbose Plite test output | 1 | Use narrow audits after broad gate | Command passed; output-budget miss recorded. |

Verification evidence:
- `rg -n "editor\\.dom\\.(composing|currentKeyboardEvent|focused|prevSelection|readOnly)|\\bdom:\\s*\\{\\s*readOnly\\b|PlateDomState|currentKeyboardEvent|prevSelection" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/react/components/PlateContent.spec.tsx src/react/utils/pipeOnChange.spec.ts src/react/utils/pipeRenderElement.spec.tsx src/lib/utils/pipeOnNodeChange.spec.ts src/lib/utils/pipeOnTextChange.spec.ts src/internal/plugin/pipeNormalizeInitialValue.spec.tsx src/lib/editor/withPlite.spec.ts` -> 68 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core test` -> 689 pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm check:core` -> pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-root-editor-dom-state.md` -> pass.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker target.
- Confidence line: high for this packet; root mutable DOM state is source-audit clean and Core/Plite gate passed.
- Flow table:
  - Reproduced: N/A: architecture hard cut.
  - Verified: focused specs, Core typecheck/test/lint/build, `pnpm check:core`; browser N/A.
- Browser check: N/A: no app/content UI changed.
- Outcome: Core no longer exposes/uses root mutable `editor.dom` state; stable DOM reads live on `editor.api.dom`.
- Caveat: `setDomRuntimeReadOnly` remains as a private Core first-render/static fallback; it is not public API.
- Design:
  - Chosen boundary: Plite DOM/React owns stable DOM reads; Core plugin gating consumes `editor.api.dom`.
  - Why not quick patch: keeping `editor.dom.readOnly` would preserve the collision.
  - Why not broader change: no docs/browser/package sweep needed for this internal Core API packet.
- Verified: source audit plus focused and broad Core/Plite checks.
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
- Browser proof: N/A: no browser surface changed.
- Caveats: private Core read-only fallback remains by design.

Timeline:
- 2026-06-29T18:27:32.639Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final goal-plan check and hand off |
| What is the goal? | Cut mutable root `editor.dom` state from Core |
| What have I learned? | Plite already owns stable DOM state reads; Core only needed a private read-only fallback |
| What have I done? | Implemented the cut and verified Core/Plite checks |

Open risks:
- None for this packet. Next risk is broader Plate package migration still depending on older APIs outside Core scope.
