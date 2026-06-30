# plate-next uncommitted Core sweep

Objective:
Complete Plate Next uncommitted Core sweep; done when every dirty Core file has a drift row, accepted cuts are patched, `check:core` passes, and this plan closes.

Completion threshold:
The run closes only after the current `packages/core/**` diff has a manifest and one ledger row per path, the named `.overrideEditor`, `with*`, helper-wrapper, and affinity drift is cut or owned, focused Core tests pass, `pnpm brl` runs for export/file moves, `pnpm check:core` passes, and this plan passes the autogoal checker.

Verification surface:
- Focused Core tests for plugin API, renamed editor helpers, helper-wrapper cuts, input rules, length, HOC composition, element store, and static editor paths.
- Exact source audits for `overrideEditor`, `AffinityPlugin`, old `with*` symbols, and one-off helper wrappers.
- `pnpm brl` for public barrel updates.
- `pnpm check:core` for Core + Plite typecheck, lint, Core test batches, Plite tests, and Core type contracts.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-uncommitted-core-sweep.md`.

Constraints:
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite APIs under fake Plate names.
- No public compatibility aliases for removed API names.
- Private runtime bridges need an owner and deletion gate.
- Do not use a representative file to close a broad Core sweep.
- Ignore non-Core package failures unless touched by this packet or proving a Core public API regression.

Boundaries:
- Edited scope: `packages/core/**`, this plan, and the linked plan artifacts.
- Non-goals: no commit, no PR, no non-Core package sweep, no full Plate package migration.
- User-named cuts: `.overrideEditor`, old `with*` API/file pattern, boilerplate helper wrappers, and the empty/broken affinity plugin owner.

Blocked condition:
No blocker remains. The only review item is taste-level naming for history methods named `withMerging` and `withNewBatch`; they are not the old editor/plugin wrapper pattern and were left for a focused history API packet.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | `.overrideEditor`, `with*`, helper wrappers, `AffinityPlugin.ts`, and all uncommitted Core files copied into this plan before implementation |
| Skill routing | yes | `plate-next` and `autogoal` were used for the sweep |
| Broad Core ledger | yes | `docs/plans/artifacts/2026-06-27-plate-next-uncommitted-core-sweep/core-drift-ledger.tsv` has one row per manifest path |
| Public API fork check | yes | `.overrideEditor` and old `with*` names were safe hard cuts under the current Plate v2 direction |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Requirements, boundaries, stop condition, proof, and handoff shape recorded |
| Dirty Core manifest | complete | `dirty-core-manifest.txt` has 207 paths |
| Drift ledger | complete | `core-drift-ledger.tsv` has 207 data rows plus header |
| Cleanup packets | complete | Accepted hard cuts patched; runtime bridge items owned as deletion-gated debt |
| Focused proof | complete | 141 tests passed across 13 focused Core files |
| Core proof | complete | `pnpm check:core` passed |
| Plan closure | complete | Autogoal checker run recorded below |

Work Checklist:
- [x] First checkpoint copied every explicit prompt requirement and success condition.
- [x] Broad Core sweep classified and scoped to uncommitted `packages/core/**` paths.
- [x] Dirty Core manifest regenerated from current diff, staged diff, and untracked Core files.
- [x] Drift ledger regenerated with `path`, `drift_score`, `verdict`, `owner`, `evidence`, and `next`.
- [x] Score gate closed: score `>=2` rows have owner/evidence/next, and score `>=4` rows are fixed or deletion-gated.
- [x] `.overrideEditor` public method and stale override branch hard-cut.
- [x] Old editor/plugin `with*` API/file pattern hard-renamed or deleted.
- [x] Boilerplate helper wrappers around `editor.update` in tests cut.
- [x] Empty/broken `AffinityPlugin` owner deleted; live rule-based affinity consumers left intact.
- [x] `pnpm brl` run after export/file moves.
- [x] Focused tests run.
- [x] `pnpm check:core` run.
- [x] Source audits run for removed compatibility names.
- [x] Changed list, high drift rows, needs-attention rows, and next owner recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Ledger coverage | yes | Manifest rows: 207; ledger rows: 207; missing: 0; extra: 0 |
| Score gate | yes | Score counts: 0=1, 1=156, 2=21, 3=3, 4=26; all score-4 rows are fixed or deletion-gated |
| Focused package proof | yes | `pnpm --filter @platejs/core exec bun test ...` passed: 141 pass, 0 fail |
| Barrel proof | yes | `pnpm brl` passed: 57 tasks successful |
| Source audit | yes | Removed-name audit returned no matches; remaining broad `with*` audit only reports history methods `withMerging` and `withNewBatch` |
| Core proof | yes | `pnpm check:core` passed |
| Non-Core failures | yes | None reported by `check:core`; command scoped to Core + Plite |
| Handoff ledger | yes | Review matrix, changed list, needs attention, and next owner recorded below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `.overrideEditor` / `OverrideEditor` | 4 | hard-cut done | plate-next | No source audit hits; plugin tests pass | Keep cut; use `extendEditorApi` |
| `withPlite`, `withPlate`, `withStatic`, `withHOC` | 4 | hard-rename done | plate-next | Old files deleted; replacements tested | Use `extendBaseEditor`, `extendPlateEditor`, `extendStaticEditor`, `composeHOC` |
| helper wrappers `deleteText`, `insertFragment`, `insertText`, `select` | 3 | hard-cut done | plate-next | Wrapper audit has no hits | Keep inline `editor.update.*` calls |
| `AffinityPlugin` | 4 | hard-cut done | plate-next | Old owner was empty/broken; core list/export cleaned | Reintroduce only with real behavior proof |
| `currentRuntimeBridge` / command store | 4 | deletion-gated | plate-next | Still private runtime bridge debt | Next packet: reduce bridge surface after API review |
| `PliteReactExtensionPlugin` | 4 | deletion-gated | plate-next | React/runtime bridge remains | Review in Plate runtime split packet |
| `withMerging` / `withNewBatch` | 2 | taste review | plate-next | Only remaining broad `with*` source hits | Decide in focused history API naming packet |

Core drift ledger:
- Applies: yes.
- Manifest command: `{ git diff --name-only -- packages/core; git diff --cached --name-only -- packages/core; git ls-files --others --exclude-standard packages/core; } | sort -u`.
- Manifest: `docs/plans/artifacts/2026-06-27-plate-next-uncommitted-core-sweep/dirty-core-manifest.txt`.
- Ledger: `docs/plans/artifacts/2026-06-27-plate-next-uncommitted-core-sweep/core-drift-ledger.tsv`.
- Expected row count: 207.
- Actual row count: 207.
- Missing row count: 0.
- Extra row count: 0.
- Top drift rows: runtime bridge, command store, plugin API methods, deleted old `with*` files, deleted affinity files.

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed `.overrideEditor`; removed stale `isOverride` branch; renamed old editor/HOC helpers to `extend*`/`compose*`; removed empty `AffinityPlugin`; removed affinity setup option |
| tests/proof | Replaced `overrideEditor` test with `extendEditorApi`; inlined test helper wrappers; updated focused specs for renamed APIs |
| barrels | Regenerated package barrels with `pnpm brl` |
| plan/artifacts | Refreshed dirty Core manifest and drift ledger |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | History method names `withMerging` / `withNewBatch` | They are the only broad `with*` source hits left; not the old wrapper pattern, but the name may still violate your taste | `packages/core/src/lib/plugins/getCorePlugins.ts` | Decide in a focused history API packet |
| 2 | Runtime bridge deletion | Core still has private command bridge debt, but cutting it blindly would risk behavior | `packages/core/src/internal/currentRuntimeBridge.ts` | Next `plate-next` packet should shrink this with focused behavior proof |
| 3 | Affinity behavior depth | The broken plugin is gone; current rule consumers remain, but old mark-boundary transform behavior is not restored here | `packages/core/src/react/utils/pluginRenderLeaf.tsx` and runtime bridge selection code | Add a real browser/selection proof before claiming full affinity behavior |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/utils/extendEditorApi.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts src/react/plugin/toPlatePlugin.spec.ts src/lib/plugins/length/LengthPlugin.spec.ts src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/react/utils/inputRules.spec.tsx src/react/components/composeHOC.spec.tsx src/react/stores/element/useElementStore.spec.tsx src/lib/editor/extendBaseEditor.spec.ts src/react/editor/PlateEditor.spec.ts src/react/editor/PlateEditorCore.spec.ts src/static/editor/extendStaticEditor.spec.tsx` -> 141 pass, 0 fail.
- `pnpm brl` -> 57 successful tasks.
- Removed-name audit for affinity, `.overrideEditor`, old `with*` symbols, and helper wrappers -> no matches.
- Broad `with*` audit -> only `withMerging` and `withNewBatch`.
- `pnpm check:core` -> passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Core sweep closed after proof |
| Where am I going? | Next owner is a focused Plate runtime bridge deletion packet |
| What is the goal? | Keep Core/Plite boundary clean without old Slate/Plate compatibility sludge |
| What have I learned? | The affinity diff was an orphaned/broken plugin owner, not a working feature |
| What have I done? | Hard-cut API/file drift, refreshed ledger, and passed `check:core` |

Open risks:
- Affinity mark-boundary behavior needs a future behavior/browser proof before any strong claim.
- Private runtime bridge debt remains owned and deletion-gated.
