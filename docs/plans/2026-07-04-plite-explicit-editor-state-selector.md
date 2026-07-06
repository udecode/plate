# Plite Explicit Editor State Selector

Objective:
Add an explicit-editor Plite React state selector hook so UI outside a `Plite`
provider can subscribe to committed editor state without Plate store mirrors.

Completion threshold:
`useEditorRuntimeState(editor, selector, options?)` is exported from
`@platejs/plite-react` and `platejs/react`, documented, covered by runtime
tests, included in public export smoke, and verified with focused package
typecheck/build commands. Browser proof is attempted for docs and any blocker is
recorded.

Verification surface:
- Plite React runtime tests.
- Plite public export smoke.
- Plite React and Core typecheck.
- `platejs` facade build.
- Docs source parity check.
- Browser route proof for the edited docs page, or concrete blocker.

Constraints:
- No compat aliases.
- No Plate store mirror expansion.
- Public hook must keep type inference and use existing selector primitives.
- Direct Plite internal imports in public hooks must stay behind the Plite
  React runtime facade.

Boundaries:
- Edited only Plite React hook/export/test/docs surfaces, Plite public export
  smoke, and Core `platejs/react` re-export.
- Did not migrate Plate version counters in this packet.
- Did not touch unrelated app compile errors.

Blocked condition:
Only blocked if the hook cannot be implemented without a broader Plite runtime
API change, or if the docs route cannot be browser-verified because the app
fails before the edited route renders.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `plite-plan` and `autogoal` before implementation. |
| Active goal checked or created | yes | Created active goal for this plan. |
| Source of truth read before edits | yes | Read current Plite React selector hooks, export surfaces, public smoke, docs hook page, and package test config. |
| Browser proof expected for docs edit | yes | Started `apps/www` Plite docs dev server and attempted Browser route proof. |

Work Checklist:
- [x] Copied explicit requirements into this plan: explicit editor selector, proof, docs, exports, no Plate mirror expansion.
- [x] Added `useEditorRuntimeState(editor, selector, options?)`.
- [x] Kept `deps`, `equalityFn`, and `shouldUpdate(change, operations)` for parity with `useEditorState`.
- [x] Exported from `@platejs/plite-react`.
- [x] Re-exported from `platejs/react`.
- [x] Added runtime tests proving explicit-editor subscription outside `<Plite>` and `shouldUpdate` filtering.
- [x] Updated exact public export smoke.
- [x] Updated Plite React hook docs.
- [x] Repaired `useEditorViewState` JSDoc and internal import boundary exposed by the full package test.
- [x] Routed remaining Plite React direct core-internal imports through `runtime-editor-api` so the package surface contract passes.
- [x] Ran focused and package-level verification.
- [x] Attempted Browser proof and recorded the unrelated compile blocker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused package tests/typechecks/build/export smoke | Commands listed in Verification evidence. |
| Plite public API claim | yes | Export smoke and package test | `@platejs/plite-react` export smoke passed; Plite React test suite passed. |
| Docs route browser proof | yes | Start docs server and verify edited route | Blocked by unrelated `@platejs/basic-styles` missing `./transforms`; docs source parity passed. |
| Autoreview for uncommitted implementation changes | no | N/A: narrow implementation packet, user did not request review, and focused proof passed | N/A. |
| Final user-review handoff | yes | Summarize changes, proof, blocker, next packet | Final response. |
| Goal plan complete | yes | Run check-complete | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source read | complete | Read selector hooks, exports, tests, docs | Implement |
| Implementation | complete | Added hook/export/docs/tests/facade cleanup | Verify |
| Verification | complete | Focused tests, package tests, export smoke, typechecks, build, docs source parity | Handoff |
| Browser proof | complete | Attempted route proof; app compile blocker recorded | Fix unrelated app compile in separate lane |

Verification evidence:
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/use-editor-runtime-state.test.tsx` passed, 2 tests.
- `pnpm --filter @platejs/plite-react test` passed, 61 files / 838 tests.
- `pnpm --filter @platejs/plite-react typecheck` passed.
- `pnpm --filter @platejs/plite exec bun test test/public-package-import-smoke.test.ts` passed, 18 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter platejs build` passed.
- `pnpm exec biome check packages/plite-react/src/hooks/use-editor-runtime-state.ts packages/plite-react/src/hooks/use-editor-view-state.ts packages/plite-react/src/editable/runtime-editor-api.ts packages/plite-react/test/use-editor-runtime-state.test.tsx` passed.
- `pnpm --filter www check:docs` passed.
- Browser route proof attempted at
  `http://127.0.0.1:3002/docs/plite/libraries/plite-react/hooks`; blocked by
  unrelated `apps/www` compile error:
  `packages/basic-styles/src/lib/BaseLineHeightPlugin.ts` cannot resolve
  `./transforms`.

Reboot status:
Done. Next packet can migrate Plate version counters to
`useEditorRuntimeState` and keep Plate store state limited to shell/product
facts.

Open risks:
The edited docs page was not browser-rendered because `apps/www` currently fails
before the route renders due an unrelated `@platejs/basic-styles` import
blocker. The MDX source/parity check passed.
