# Cut slate legacy bridge

Objective:
Cut Plate's `@platejs/slate-legacy` bridge; done when core and one representative package run on Plite-native dependencies with no legacy references and focused proof passes.

Completion threshold:
Core must use Plite-native runtime/schema/tx surfaces, `packages/slate-legacy` must be absent, audited source and generated package declarations must not mention `@platejs/slate-legacy`, stale `@platejs/slate`, or `createSlatePlugin` / `createSlateEditor`, and focused core plus representative package proof must pass.

Verification surface:
Source audits cover package manifests, lockfile, workspace package source, `apps/www/src`, `content/docs`, and package `dist` declarations while excluding generated registry payloads under `apps/www/public/r/**`. Commands cover core typecheck/test/build, representative package tests/builds, docs source parity, and route smoke for Plite docs pages.

Constraints:
No public compat aliases, no public runtime shims, no docs/examples teaching legacy surfaces, and private bridge code must stay internal with a deletion owner. Plite substrate APIs win over conflicting Plate legacy shapes.

Boundaries:
This run closes the package/dependency bridge and repairs behavior found while proving it. It does not complete the full Plate v2 API migration or delete every private temporary runtime bridge in core.

Blocked condition:
Stop only if a Plite API gap forces a public shim or if focused proof reveals a public Plate API decision that needs human review. This run did not hit that condition.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User requested full plan to cut `packages/slate-legacy`, fully depend on Plite, avoid slate-legacy/core/Plite conflicts, and run autogoal all. |
| Active goal | yes | Active goal tracked this file: cut Plate slate-legacy bridge. |
| Source grounding | yes | Read current core, Plite transaction/schema code, mention plugin, markdown serializer, docs routes, package scripts, and autogoal checker. |
| Execution mode | yes | User said go all, so this is execution closure, not plan-only review. |
| Browser route proof | yes | Direct Browser MCP was not exposed; used dev server HTTP route proof for docs routes. |
| Release artifact | yes | No changeset in this lane: beta/internal bridge and test/proof repairs were not requested as release packaging. |

Work Checklist:
- [x] Captured explicit requirements, boundaries, stop condition, proof surface, and final handoff needs.
- [x] Removed the active legacy package path from the current checkout before closure proof.
- [x] Audited source and generated package declarations for legacy package and stale Slate naming imports.
- [x] Kept public compatibility aliases out of the patch.
- [x] Repaired core Plite schema bridging so Plate plugin node flags install as Plite element specs.
- [x] Repaired inline mention insertion proof without adding a plugin-local hack.
- [x] Repaired markdown serialization so inline-boundary zero-width sentinels do not leak while empty paragraph preservation still works.
- [x] Rebuilt affected package artifacts.
- [x] Ran core package typecheck/test/build.
- [x] Ran representative package tests/builds and docs parity/route proof.
- [x] Recorded remaining private bridge debt and source-entry debt without blocking this lane.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Legacy package absent | yes | `test ! -e packages/slate-legacy` printed `packages/slate-legacy absent`. |
| Legacy refs absent | yes | `rg --files-with-matches "@platejs/slate-legacy\|packages/slate-legacy" ...` returned no matches in audited source scope. |
| Stale Slate refs absent | yes | `rg --files-with-matches "@platejs/slate\|createSlatePlugin\|createSlateEditor\|from ['\"]plite-react['\"]"` returned no matches in audited source/dist scope. |
| Core package proof | yes | `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core test`, and `pnpm --filter @platejs/core build` passed. |
| Representative package proof | yes | `pnpm --filter @platejs/media test/typecheck/build` passed earlier in the lane; `pnpm --filter @platejs/markdown test/typecheck/build` passed after the mention/serializer repair. |
| Behavior regression proof | yes | `pnpm --filter @platejs/mention test` passed and `bun test packages/core/src/lib/editor/withPlite.spec.ts` passed with the new inline insertion regression. |
| Docs proof | yes | `pnpm --filter www check:docs` passed. |
| Route proof | yes | `curl -I http://localhost:3002/docs/migration/plite-to-plate` and `curl -I http://localhost:3002/docs/plite` returned `HTTP/1.1 200 OK`; dev server was stopped after proof. |
| Barrel/export generation | yes | No exported file layout was changed; N/A for `pnpm brl`. |
| Autoreview | yes | Full autoreview was not requested for this checkpoint; concrete proof and audits are recorded here. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Requirements capture | done | Explicit user requirements copied into gates and checklist. |
| Legacy bridge closure | done | Legacy package path absent and legacy-reference audit clean. |
| Core runtime repair | done | Plate plugin node flags now install Plite element specs in `withPlite`; core tests pass. |
| Package behavior repair | done | Mention tx insertion and markdown mention serialization are green. |
| Docs/app route proof | done | Docs parity and HTTP route smoke are green. |
| Final autogoal check | done | This file is ready for `check-complete`. |

Changed list:
- `packages/core/src/lib/editor/withPlite.ts`: installs Plate plugin node flags as Plite element specs for non-React Plite editors.
- `packages/core/src/lib/editor/withPlite.spec.ts`: adds regression for tx-backed inline insertion using plugin node flags.
- `packages/markdown/src/lib/serializer/convertNodesSerialize.ts`: skips only inline-boundary zero-width sentinels during markdown serialization.
- Package build artifacts under affected package `dist` folders were regenerated by package build commands.
- Earlier lane changes in this goal include Plite merge/delete-rule bridge repairs, docs route/import fixes, and `slate-dom` peer install for upstream Slate comparison routes.

Verification evidence:
- `bun test packages/core/src/lib/editor/withPlite.spec.ts` -> 23 pass.
- `pnpm --filter @platejs/core test` -> 952 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core` -> success.
- `pnpm --filter @platejs/core build` -> success.
- `pnpm --filter @platejs/mention test` -> 9 pass.
- `bun test packages/markdown/src/lib/deserializer/paragraphBreaks.spec.ts packages/markdown/src/lib/serializer/serializeMention.spec.ts` -> 11 pass.
- `pnpm --filter @platejs/markdown test` -> 234 pass.
- `pnpm --filter @platejs/markdown typecheck` -> success.
- `pnpm --filter @platejs/markdown build` -> success.
- `pnpm --filter www check:docs` -> success.
- `curl -I` docs route smoke for `/docs/migration/plite-to-plate` and `/docs/plite` -> both 200.
- Final legacy and stale-ref audits returned no matches.

Reboot status:
Current checkout is coherent for this autogoal. Continue from broad Plate v2 package migration only after human review of the core/representative package API shape.

Open risks:
`pnpm --filter @platejs/mention typecheck` exposed broader source-first umbrella-package debt through `platejs` and raw core React runtime source. Mention behavior is proven by tests, but package source-entry typecheck needs its own Plate v2 package-DX lane before claiming all feature package typechecks are clean.

Needs review:
- Review the new `withPlite` element-spec bridge because it is the final non-React schema owner for plugin inline/void/selectable flags.
- Review the markdown zero-width sentinel rule because it intentionally preserves empty paragraph zero-width text while dropping inline-boundary sentinels.
- Review remaining private core bridge files before broad Plate migration: `currentRuntimeBridge`, `legacyRuntimeUpdateBridge`, and any private transform bridge still used only for migration.
