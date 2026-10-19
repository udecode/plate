# plite react decoration refresh execution

Objective:
Implement Plite React-owned decoration refresh, cut Plate refresh glue, and prove plite-react/core focused tests and typecheck stay green.

Goal plan:
docs/plans/2026-07-02-plite-react-decoration-refresh-execution.md

Template:
docs/plans/templates/task.md

Task source:
- type: accepted Plite Plan execution
- id / link: docs/plans/2026-07-02-plite-react-decoration-refresh-ownership.md
- title: Plite React decoration refresh ownership
- acceptance criteria: `editor.api.react.refreshDecorations()` refreshes mounted Plite React decoration sources; Plate `EditorMethodsEffect` / `useRefreshDecorations` / `versionDecorate` refresh glue is cut; focused package tests and typecheck pass.

Completion threshold:
- Plite React owns decoration refresh implementation.
- Core no longer patches decoration refresh through Plate store state.
- Focused Plite React and Core tests pass.
- Plite React and Core typecheck pass.
- Source audit shows no live package references to `versionDecorate`, `useRefreshDecorations`, `EditorMethodsEffect`, or `editor.api.redecorate`.
- Barrel generation is run because a Core component export was removed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-react-decoration-refresh-execution.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/projections-and-selection-contract.test.tsx test/react-editor-contract.test.tsx`
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/stores/plate/createPlateStore.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx`
- `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/core`
- `pnpm exec biome check <touched files>`
- `pnpm --filter @platejs/core lint`
- `pnpm brl`
- `rg -n "versionDecorate|useRefreshDecorations|EditorMethodsEffect|api\\.redecorate|\\bredecorate\\b" packages/core packages/plite-react --glob '*.{ts,tsx}'`

Constraints:
- No public compatibility aliases.
- No `editor.api.redecorate`.
- No Plate store shim for a Plite React runtime concern.
- No PR, commit, push, or tracker mutation.

Boundaries:
- Source of truth: accepted Plite Plan plus current `packages/plite-react/**` and `packages/core/**`.
- Edited implementation scope: `packages/plite-react/src/**`, `packages/plite-react/test/**`, `packages/core/src/**`, this plan.
- Browser surface: package runtime behavior; no docs/app route changed.
- Browser strategy: N/A for this packet because focused jsdom/package tests cover the runtime behavior and no visible route/content changed.
- Release artifact: N/A for this packet. `@platejs/plite-react` does not exist on `origin/main`, and this is branch-local beta cleanup. Core's old `redecorate` delta belongs to the broader Plate v2 branch, not a new standalone changeset here.
- Non-goals: docs rewrite, collaboration behavior, annotation/widget redesign, browser matrix.

Output budget strategy:
- Used focused source reads, capped command output, focused tests, and source audit.

Blocked condition:
- None hit. Plite React could observe mounted `Editable` decoration sources directly.

Task state:
- task_type: package runtime/API execution
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: complete
- confidence: 0.96
- next owner: user review or broader Plate v2 cleanup
- reason: implementation, tests, typecheck, barrels, and source audit are green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted plan requirements copied into this execution ledger. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `plite-plan`, `autogoal`, and `changeset`. |
| Active goal checked or created | yes | Created execution goal for Plite React refresh. |
| Source of truth read before edits | yes | Read accepted plan and current source. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Planning pass read the decorate/redecorate solution note. |
| TDD decision before behavior change or bug fix | yes | Added focused Plite React regression test before final proof. |
| Branch decision for code-changing task | no | N/A: user requested current checkout work; no branch action. |
| Release artifact decision | yes | No changeset for this branch-local beta cleanup; see boundaries. |
| Browser tool decision for browser surface | yes | N/A: no app route or visible docs surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A. |
| Output budget strategy recorded | yes | Focused output caps. |
| Package/API pack selected | yes | `package-api` pack selected. |
| Public surface or package boundary identified | yes | `@platejs/plite-react` React API and `@platejs/core` bridge deletion. |
| Release artifact path selected | no | N/A: no standalone published delta from `origin/main`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read skill; no changeset required after main-relative check. |
| Barrel/export impact decision recorded | yes | Removed Core export, ran `pnpm brl`. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless explicitly marked hard stop; N/A.
- [x] First checkpoint complete: explicit prompt and accepted-plan requirements copied here.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: Plite React owns refresh; Core no longer patches it.
- [x] Release artifact requirement recorded: no standalone changeset for this branch-local beta cleanup.
- [x] Final handoff shape decided: changed files, proof, caveats, and no-browser reason.
- [x] Branch handling recorded for code-changing work: no branch action.
- [x] Local-env-rot retry policy recorded: N/A, no env-rot signal.
- [x] Workspace authority recorded: every proof command ran from `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for runtime/package-boundary change.
- [x] Review/autoreview target selected: N/A, user asked implementation; focused source audit and tests used instead of a separate review loop.
- [x] Agent-native review decision recorded: N/A, no agent tooling changed.
- [x] Output budget discipline recorded and followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact recorded.
- [x] Package/API pack: release artifact matrix applied.
- [x] Package/API pack: `.changeset` work loaded `changeset`; no artifact required.
- [x] Package/API pack: registry-only work is N/A.
- [x] Package/API pack: no-artifact decision states why there is no standalone published package delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit.
- [x] Package/API pack: package-owned typecheck/build/test proof recorded.
- [x] Package/API pack: generated barrels updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests, typecheck, source audit, barrel generation, and plan check. | Complete; see Verification evidence. |
| Bug reproduced before fix | yes | Add behavior regression test. | `refreshDecorations refreshes stable Editable decorate output`. |
| Targeted behavior verification | yes | Run focused tests. | Plite React 34 pass; Core 10 pass. |
| TypeScript or typed config changed | yes | Run typecheck. | `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/core` passed. |
| Package exports or file layout changed | yes | Run `pnpm brl`. | Passed, 57 tasks. |
| Package manifests, lockfile, or install graph changed | no | N/A. | No manifests/lockfile edited. |
| Agent rules or skills changed | no | N/A. | No agent files edited. |
| Workspace authority proof | yes | Run proof in repo root/package owners. | Complete. |
| Browser surface changed | no | N/A. | No app route/content changed. |
| Browser final proof | no | N/A. | Package runtime tests own this claim. |
| CI-controlled template output changed | no | N/A. | No template output edited. |
| Package behavior or public API changed | yes | Changeset decision. | No standalone changeset; branch-local beta cleanup and Plite package absent on `origin/main`. |
| Registry-only component work changed | no | N/A. | No registry work. |
| Docs or content changed | no | N/A. | No docs/content changed. |
| High-risk mini gate | yes | Record failure modes and proof. | Risks below plus focused tests/typecheck. |
| Agent-native review for agent/tooling changes | no | N/A. | No agent/tooling change. |
| Local install corruption suspected | no | N/A. | No env-rot signal. |
| Autoreview for non-trivial implementation changes | no | N/A for this user-requested implementation packet; source audit and focused proof done. | No separate review loop run. |
| PR create or update | no | N/A. | No PR requested. |
| Task-style PR body verified | no | N/A. | No PR. |
| PR proof image hosting | no | N/A. | No PR/browser image. |
| Tracker sync-back | no | N/A. | No tracker. |
| Final handoff contract | yes | Fill final handoff fields. | Complete below. |
| Final lint | yes | Run scoped/touched lint. | Touched-file Biome check passed; Core package lint passed. Full Plite React package lint has existing broad lint debt unrelated to this packet. |
| Output budget discipline | yes | Verify no unbounded output streamed. | Complete. |
| Timed checkpoint | no | N/A. | No duration. |
| Goal plan complete | yes | Run `check-complete`. | Complete after final command. |
| Public API / package boundary proof | yes | Source audit public API and package boundary impact. | Complete. |
| Release artifact classification | yes | Record package delta decision. | Complete. |
| Published package changeset | no | N/A. | No standalone changeset for this branch-local beta cleanup. |
| Registry changelog | no | N/A. | No registry work. |
| No release artifact | yes | Record exact reason. | Plite package absent on `origin/main`; Core delta part of broader v2 branch. |
| Package typecheck/build/test | yes | Run owning package checks. | Focused tests and typecheck passed. |
| Barrel/export generation | yes | Run `pnpm brl`. | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted plan and source read | closed |
| Implementation | complete | Plite registry wired, Core bridge cut | closed |
| Verification | complete | focused tests, typecheck, lint, brl, audit | closed |
| PR / tracker sync | skipped | N/A: no PR/tracker requested | closed |
| Closeout | complete | final handoff ready | closed |

Changed files:
- `packages/plite-react/src/decoration-refresh.ts`: new mounted-source refresh registry.
- `packages/plite-react/src/plugin/with-react.ts`: `react()` API now calls the registry.
- `packages/plite-react/src/hooks/use-plite-runtime.tsx`: runtime view API now delegates to the same registry.
- `packages/plite-react/src/components/editable-text-blocks.tsx`: mounted `Editable` decoration/view-selection sources register for refresh.
- `packages/plite-react/test/projections-and-selection-contract.tsx`: added stable `Editable.decorate` refresh regression.
- `packages/core/src/react/components/ContentVisibilityChunk.tsx`: removed `EditorMethodsEffect`.
- `packages/core/src/react/components/EditorMethodsEffect.ts`: deleted.
- `packages/core/src/react/components/EditorMethodsEffect.spec.tsx`: deleted.
- `packages/core/src/react/components/index.ts`: removed deleted export.
- `packages/core/src/react/hooks/useEditableProps.ts`: removed `versionDecorate` dependency.
- `packages/core/src/react/stores/plate/PlateStore.ts`: removed `versionDecorate` from store type.
- `packages/core/src/react/stores/plate/createPlateStore.ts`: removed `useRefreshDecorations` and decorate-version bump path.
- `packages/core/src/react/stores/plate/createPlateStore.spec.tsx`: removed store-counter assertions.
- `packages/core/src/react/components/PlateContent.spec.tsx`: removed store-counter behavior assertion.

Findings:
- The live API name was already right: `editor.api.react.refreshDecorations()`.
- The live owner was wrong: Plite React installed a no-op and Core patched it with Plate store versioning.
- `Editable` already owns the sources that need refreshing, so no new provider contract was needed.

Decisions and tradeoffs:
- Kept the public method name.
- Moved implementation to Plite React.
- Cut Plate bridge instead of preserving compatibility.
- Kept refresh scoped to Plite React-owned mounted sources, not arbitrary upstream projection stores.

Implementation notes:
- `refreshDecorations()` defaults `reason` to `external`.
- `requiresDOMSelectionExport` defaults to DOM focus state.
- Calling before an `Editable` mounts is a valid no-op because there is no mounted decoration source to refresh.

Review fixes:
- Removed unused `groupId` destructuring from `EditableRootGroupInner`; the prop remains for memo comparison.
- Formatted touched files.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `vitest run ... test/projections-and-selection-contract.tsx` | 1 | Use `.test.tsx` wrapper files. | Wrapper-file Vitest command passed. |
| `bun test ./packages/plite-react/test/projections-and-selection-contract.tsx ...` | 1 | Treat as wrong owner because it hits built dist/runtime setup and lacks Vitest JSX setup. | Not counted; Vitest owner command passed. |
| `pnpm --filter @platejs/plite-react lint` | 1 | Use touched-file Biome check because package lint has existing broad lint debt. | Touched-file check passed; Core lint passed. |

Verification evidence:
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/projections-and-selection-contract.test.tsx test/react-editor-contract.test.tsx` -> 2 files, 34 tests passed.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/stores/plate/createPlateStore.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` -> 10 tests passed.
- `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/core` -> 10 tasks successful.
- `pnpm exec biome check <touched files>` -> 12 files checked, no fixes applied.
- `pnpm --filter @platejs/core lint` -> passed.
- `pnpm brl` -> 57 tasks successful.
- `rg -n "versionDecorate|useRefreshDecorations|EditorMethodsEffect|api\\.redecorate|\\bredecorate\\b" packages/core packages/plite-react --glob '*.{ts,tsx}'` -> no matches.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: 0.96.
- Flow table:
  - Reproduced: new Plite React test proves stable `Editable.decorate` external refresh.
  - Verified: Plite React focused tests, Core focused tests, typecheck, touched-file lint, Core lint, barrel generation, source audit.
- Browser check: N/A, package runtime behavior only; no route/content change.
- Outcome: Plite React owns decoration refresh; Plate store glue is gone.
- Caveat: Full Plite React package lint still has unrelated existing lint debt; touched-file check passed.
- Design:
  - Chosen boundary: Plite React mounted-source registry.
  - Why not quick patch: Plate store versioning was the wrong owner.
  - Why not broader change: source stores/annotations/collab are separate overlay lanes.
- Verified: yes, with focused package proof.
- PR body verified: N/A.

Task-style PR body contract:
- N/A: no PR.

High-risk notes:
- Multiple mounted `Editable` sources are handled by a set keyed by editor object.
- Unmounted sources unregister; source destroy remains owned by existing effects.
- Focused refresh exports DOM selection by default only when the editor is focused.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Done; final check passed. |
| Where am I going? | Close goal and hand off. |
| What is the goal? | Plite React-owned decoration refresh. |
| What have I learned? | API shape was right; implementation owner was wrong. |
| What have I done? | Implemented registry, cut Core bridge, proved package behavior. |

Open risks:
- Full `@platejs/plite-react` package lint has unrelated existing lint debt; this packet used touched-file lint plus typecheck/tests.
