# createTPlatePlugin cut closure

Objective:
Close the `createTPlatePlugin` cut by proving the old explicit-generic use case is supported by `createPlatePlugin<Config>(...)`, migrating stale callers, and avoiding a compatibility alias.

Completion threshold:
Done when source callers use `createPlatePlugin<Config>`, source search finds no `createTPlatePlugin` refs outside history/plans, Core explicit-generic type contracts pass, focused caller proof passes, and broader package failures are classified when they are unrelated to this helper cut.

Verification surface:
- `rg -n "createTPlatePlugin" packages content docs --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!**/dist/**'`
- `pnpm exec biome check packages/ai/src/react/ai-chat/AIChatPlugin.ts packages/ai/src/react/copilot/CopilotPlugin.tsx packages/dnd/src/DndPlugin.tsx packages/selection/src/react/BlockSelectionPlugin.tsx packages/selection/src/react/BlockMenuPlugin.tsx packages/selection/src/react/CursorOverlayPlugin.tsx packages/selection/src/react/BlockMenuPlugin.spec.tsx packages/core/type-tests/plate-plugin-contracts.ts`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm --filter @platejs/core exec tsc --project tsconfig.type-tests.json --noEmit --pretty false`
- `pnpm --filter @platejs/selection exec bun test src/react/BlockMenuPlugin.spec.tsx`
- Package-level `ai`, `dnd`, and `selection` typechecks are classified for helper-related hits.

Constraints:
- Do not restore `createTPlatePlugin`; it is an alias around `createPlatePlugin`.
- Do not broaden into the package-wide Plate-to-Plite migration unless a changed caller is directly broken by the helper cut.
- No changeset: this is branch-local cleanup of an already accepted unreleased API hard cut.

Boundaries:
- Source of truth: `packages/core/src/react/plugin/createPlatePlugin.ts`, `origin/main` helper shape, stale package callers, and Core type tests.
- Edited scope: stale caller imports/usages, one explicit-generic type contract, one focused caller test cleanup, one DnD current-DOM API call exposed by the touched file.
- Browser surface: N/A; no rendered UI changed.

Blocked condition:
Blocked only if `createPlatePlugin<Config>` cannot express the old explicit helper shape without restoring an alias or adding a new public API fork.

Work Checklist:
- [x] Copied explicit user requirement into this plan before closeout: confirm whether removing `createTPlatePlugin` regresses support.
- [x] Compared current `createPlatePlugin` overloads against `origin/main` `createTPlatePlugin`.
- [x] Migrated stale callers from `createTPlatePlugin` to `createPlatePlugin<Config>`.
- [x] Added an explicit factory-config type contract in `packages/core/type-tests/plate-plugin-contracts.ts`.
- [x] Removed the broken `getApi({ key })` call path found by the focused selection spec.
- [x] Repaired the touched DnD file to use `editor.api.dom.resolveDOMNode`.
- [x] Confirmed no source `createTPlatePlugin` refs remain outside excluded history/plans.
- [x] Ran focused lint/type/runtime proof.
- [x] Classified broader package typecheck fallout as old Plate-to-Plite migration debt, not helper-cut fallout.
- [x] Recorded final evidence, reboot status, and open risks.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | User asked if removing `createTPlatePlugin` was regression-free and still supported. |
| Source owner read | yes | Read current `createPlatePlugin.ts` and `origin/main` helper. |
| Timed checkpoint | no | No duration requested. |
| Browser proof | no | Package type/API cleanup only. |
| Release artifact | yes | No changeset because final public API remains the accepted `createPlatePlugin<Config>` hard cut. |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Old symbol audit | yes | `rg -n "createTPlatePlugin" packages content docs --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!**/dist/**'` returned no matches. |
| Core type contract | yes | `pnpm turbo typecheck --filter=./packages/core` passed; it runs Core source, test, and type-test projects. |
| Direct type-test proof | yes | `pnpm --filter @platejs/core exec tsc --project tsconfig.type-tests.json --noEmit --pretty false` passed. |
| Focused caller runtime proof | yes | `pnpm --filter @platejs/selection exec bun test src/react/BlockMenuPlugin.spec.tsx` passed with 1 test and 4 assertions. |
| Focused lint | yes | Biome check passed over all changed caller/type-test files. |
| Package typechecks | yes | `ai` is blocked by unrelated `footnote`/`suggestion` unresolved imports; `dnd` and `selection` are blocked by existing old Slate/Plate API migration debt. No remaining logs mention `createTPlatePlugin`; DnD no longer reports `DndPlugin.tsx`. |
| Changeset | no | No released package delta beyond the already accepted helper hard cut. |
| Barrel/export generation | no | No package exports or exported file layout changed. |
| Browser proof | no | No browser route or visual behavior changed. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | done | helper regression risk found from stale callers |
| Implementation | done | callers migrated and focused test cleaned |
| Verification | done | source audit, Core typecheck, direct type-test, focused selection spec, focused lint |
| Package classification | done | broader package failures classified outside helper cut |
| Closeout | done | this plan records evidence and risks |

Findings:
- Initial removal was not safe by itself: `ai`, `dnd`, and `selection` still imported `createTPlatePlugin`.
- The correct final API is `createPlatePlugin<Config>(...)`; restoring `createTPlatePlugin` would be a fake alias.
- A focused selection spec exposed a bad `getApi({ key })` path; it now uses the installed editor API with a typed dependency shape.

Decisions and tradeoffs:
- Keep one unified factory: `createPlatePlugin` supports inference and explicit generics.
- Do not reintroduce `createTPlatePlugin`; manual-generic callers should use `createPlatePlugin<Config>`.
- Do not chase package-wide Plate-to-Plite debt in this narrow packet.

Implementation notes:
- Migrated stale imports/usages in `packages/ai`, `packages/dnd`, and `packages/selection`.
- Added explicit factory coverage to `packages/core/type-tests/plate-plugin-contracts.ts`.
- Updated DnD DOM access to the current `editor.api.dom.resolveDOMNode` surface.

Review fixes:
- Removed formatter issue in the Core type test.
- Removed the invalid `getApi({ key })` runtime path from `BlockMenuPlugin`.
- Repaired the touched DnD file after package typecheck surfaced `editor.api.toDOMNode`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Added tx proof to explicit factory type test, but `.extendTx<T>()` expects a tx-group shape | 1 | Keep this packet on explicit factory/api proof; leave tx to existing tx contracts | Removed tx overreach |
| `BlockMenuPlugin` direct `editor.api.blockSelection` runtime passed but package type was not visible | 1 | Express optional sibling API as a typed dependency shape | Focused spec and lint passed |

Verification evidence:
- `rg -n "createTPlatePlugin" packages content docs --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!**/dist/**'`: no matches.
- `pnpm exec biome check ...`: passed over 8 files.
- `pnpm turbo typecheck --filter=./packages/core`: passed, 9 tasks successful.
- `pnpm --filter @platejs/core exec tsc --project tsconfig.type-tests.json --noEmit --pretty false`: passed.
- `pnpm --filter @platejs/selection exec bun test src/react/BlockMenuPlugin.spec.tsx`: passed, 1 test, 4 assertions.
- `pnpm turbo typecheck --filter=./packages/ai`: blocked before AI typecheck by unrelated `@platejs/footnote` and `@platejs/suggestion` unresolved imports.
- `pnpm turbo typecheck --filter=./packages/dnd`: blocked by old Slate/Plate API migration debt in non-helper paths; no `DndPlugin.tsx` error remains.
- `pnpm turbo typecheck --filter=./packages/selection`: blocked by old Slate/Plate API migration debt; filtered log has no `BlockMenuPlugin`, `createPlatePlugin`, or `createTPlatePlugin` hits.

Reboot status:
Current state is resumable from this plan. If reopened, start with package-wide Plate-to-Plite migration debt, not with `createTPlatePlugin`; the helper cut itself is closed.

Open risks:
No open risk for explicit typed plugin creation. Broader `ai`, `dnd`, and `selection` package typechecks remain blocked by existing Plate-to-Plite migration debt outside this helper cut.

Final handoff contract:
- Verdict: `createTPlatePlugin` should stay deleted.
- Replacement: `createPlatePlugin<Config>(...)`.
- Confidence: high for explicit generic support; medium for untouched packages because broader package migration debt remains.
- No PR, commit, tracker sync, browser proof, barrel run, or changeset was required.
