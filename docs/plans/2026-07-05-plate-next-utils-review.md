# plate-next utils review

Objective:
Review `packages/utils` in `plate-next` package mode. Close only when every current package file scores `100`, package proof passes, old helper deletions are accounted for, and no next package is started.

Completion threshold:
- 44/44 package manifest rows checked at score `100`.
- `packages/utils` typecheck, test, and build pass.
- Deleted `with*` helper files are accounted for with owner recovery and proof.
- Stale Plite API and type-cheat audits have no unaccepted hits.
- No next package is started in this goal.

Verification surface:
- `pnpm turbo typecheck --filter=./packages/utils`
- `pnpm --filter @platejs/utils test`
- `pnpm --filter @platejs/utils build`
- `pnpm --filter @platejs/test-utils build`
- stale Plite API audit over `packages/utils/src`, `packages/utils/README.md`, and `packages/utils/package.json`
- type-cheat audit over `packages/utils/src`, `packages/utils/README.md`, and `packages/utils/package.json`

Constraints:
- Keep Plate as product layer and Plite as editor substrate.
- No public compat aliases, bridge dumps, old `with*` runtime helpers, direct editor mirrors, or fake local test aliases.
- Prefer owner recovery over new wrapper files.
- Use `origin/main` as regression evidence, not as a mandate to keep old APIs.

Boundaries:
- In scope: `packages/utils`, its current package manifest, package tests, package docs/config, and the smallest owner dependency needed for typed fixture proof.
- Out of scope: next package migration, broad Core sweep, rename pass, public API redesign, browser proof.

Blocked condition:
- None. Package review completed with green proof.

Mode:
- skill: `plate-next`
- target: `packages/utils`
- package review mode: yes
- broad Core sweep: no
- allowed edit scope: `packages/utils` plus the smallest proven owner dependency
- dependency owner patch: `packages/test-utils/src/jsx.ts` exports `TestEditor` so package specs can avoid local fake JSX editor aliases

First checkpoint:
- [x] Prompt requirements copied: review `packages/utils` under `plate-next`; one checklist row per package file; score `100` only when no regression, no type regression, no fake casts, no compat sludge, correct Plite/Plate ownership, and proof passes.
- [x] Non-goals copied: no next package, no broad Core redesign, no rename pass, no public API redesign unless a package blocker proves one.
- [x] Stop condition copied: stop after `packages/utils` is clean or a real blocker needs user review.
- [x] Final handoff requirements copied: changed list, proof, owner calls, needs-attention, next owner.

Work Checklist:
- [x] First checkpoint captured prompt requirements and stop condition.
- [x] Package file manifest generated before closeout.
- [x] Every current package file scored.
- [x] Old `with*` deletions mapped to plugin owners.
- [x] Type-cheat audit reviewed and accepted only arbitrary suggestion payloads.
- [x] Focused package proof run.
- [x] Plan check-complete gate run after evidence recorded.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | requirements captured before close |
| Source review | done | 44 package rows scored |
| Runtime recovery | done | normalize/trailing behavior moved into plugin normalizers |
| Type cleanup | done | fake JSX aliases removed; minimal event shapes typed |
| Proof | done | typecheck/test/build pass |

Package manifest:
- command: `rg --files packages/utils -g '!dist/**' -g '!node_modules/**' -g '!coverage/**' | sort`
- expected rows: 44
- actual rows: 44
- checked score-100 rows: 44
- deferred rows: 0
- missing rows: 0
- extra rows: 0

Package file rows:
- [x] `packages/utils/CHANGELOG.md` — score: 100 — verdict: keep — evidence: package manifest/proof; no runtime API surface.
- [x] `packages/utils/README.md` — score: 100 — verdict: keep — evidence: source audit; no stale Plite API hits.
- [x] `packages/utils/package.json` — score: 100 — verdict: keep — evidence: package typecheck/test/build pass.
- [x] `packages/utils/src/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/lib/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/lib/plate-keys.ts` — score: 100 — verdict: keep — evidence: package typecheck/test/build pass.
- [x] `packages/utils/src/lib/plate-types.ts` — score: 100 — verdict: keep — evidence: package typecheck/build pass; `TUpdateSuggestionData.properties/newProperties` stay `any` because they are arbitrary suggestion payload property bags, not migration escape hatches.
- [x] `packages/utils/src/lib/plugins/ExitBreakPlugin.spec.ts` — score: 100 — verdict: keep — evidence: focused utils tests pass.
- [x] `packages/utils/src/lib/plugins/ExitBreakPlugin.ts` — score: 100 — verdict: keep — evidence: migrated to Plite `editor.read.selection()` / runtime tx and tests pass.
- [x] `packages/utils/src/lib/plugins/__tests__/normalizeRoot.ts` — score: 100 — verdict: keep — evidence: fixture owner; no stale runtime editor API use.
- [x] `packages/utils/src/lib/plugins/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.spec.tsx` — score: 100 — verdict: keep — evidence: old `withNormalizeTypes` coverage recovered; tests pass.
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts` — score: 100 — verdict: merge-existing-owner — evidence: old `withNormalizeTypes` behavior lives in plugin-owned Plite normalizer; runtime specs pass.
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesRuntimePlugin.spec.ts` — score: 100 — verdict: keep-new-proof — evidence: verifies runtime insertion, strict rewrite, and `onError`.
- [x] `packages/utils/src/lib/plugins/normalize-types/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx` — score: 100 — verdict: keep — evidence: JSX fixtures typed with exported `TestEditor`; tests pass.
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts` — score: 100 — verdict: keep — evidence: uses Plite read/update and `extendExtension`; runtime specs pass.
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts` — score: 100 — verdict: keep-new-proof — evidence: verifies Plite runtime merging and break handling.
- [x] `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.spec.tsx` — score: 100 — verdict: keep — evidence: typed fixtures and tests pass.
- [x] `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts` — score: 100 — verdict: keep — evidence: uses Plite read/update and `extendExtension`; runtime specs pass.
- [x] `packages/utils/src/lib/plugins/single-block/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.spec.tsx` — score: 100 — verdict: keep — evidence: old `withTrailingBlock` coverage recovered; tests pass.
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts` — score: 100 — verdict: merge-existing-owner — evidence: old `withTrailingBlock` behavior lives in plugin-owned Plite normalizer; empty root path covered.
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockRuntimePlugin.spec.ts` — score: 100 — verdict: keep-new-proof — evidence: verifies root/depth/query/custom insert runtime behavior.
- [x] `packages/utils/src/lib/plugins/trailing-block/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/react/hooks/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/react/hooks/useEditorString.spec.tsx` — score: 100 — verdict: keep — evidence: tests pass.
- [x] `packages/utils/src/react/hooks/useEditorString.ts` — score: 100 — verdict: keep — evidence: package typecheck/test pass.
- [x] `packages/utils/src/react/hooks/useFormInputProps.spec.tsx` — score: 100 — verdict: keep — evidence: no event casts; tests pass.
- [x] `packages/utils/src/react/hooks/useFormInputProps.ts` — score: 100 — verdict: keep — evidence: event prop accepts exact consumed shape; typecheck/tests pass.
- [x] `packages/utils/src/react/hooks/useMarkToolbarButton.spec.tsx` — score: 100 — verdict: keep — evidence: focus proof uses real Plite extension; no fake editor cast.
- [x] `packages/utils/src/react/hooks/useMarkToolbarButton.ts` — score: 100 — verdict: keep — evidence: uses `editor.read.marks()` and `editor.update`; typecheck/tests pass.
- [x] `packages/utils/src/react/hooks/useRemoveNodeButton.spec.tsx` — score: 100 — verdict: keep — evidence: typed element and minimal mouse event; tests pass.
- [x] `packages/utils/src/react/hooks/useRemoveNodeButton.ts` — score: 100 — verdict: keep — evidence: uses Plite tx remove; typecheck/tests pass.
- [x] `packages/utils/src/react/hooks/useSelection.spec.tsx` — score: 100 — verdict: keep — evidence: typed wrapper and tests pass.
- [x] `packages/utils/src/react/hooks/useSelection.ts` — score: 100 — verdict: keep — evidence: uses `editor.read.selection()` and block reads; typecheck/tests pass.
- [x] `packages/utils/src/react/hooks/useSelectionFragment.spec.tsx` — score: 100 — verdict: keep — evidence: typed wrapper and tests pass.
- [x] `packages/utils/src/react/hooks/useSelectionFragment.ts` — score: 100 — verdict: keep — evidence: uses `editor.read.fragment()` and selection; typecheck/tests pass.
- [x] `packages/utils/src/react/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx` — score: 100 — verdict: keep — evidence: typed `PlateEditor`; tests pass.
- [x] `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` — score: 100 — verdict: keep — evidence: uses Plite read/view and typed Plate plugin context; no direct editor mirrors.
- [x] `packages/utils/src/react/plugins/index.ts` — score: 100 — verdict: keep — evidence: export audit and package build pass.
- [x] `packages/utils/tsconfig.build.json` — score: 100 — verdict: keep — evidence: package build pass.
- [x] `packages/utils/tsconfig.json` — score: 100 — verdict: keep — evidence: package typecheck pass.

Extracted/deleted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.ts` | merge-existing-owner | old normalizer helper in `origin/main` | delete; behavior moved into `NormalizeTypesPlugin.ts` Plite normalizer | typecheck, 57 tests, runtime specs |
| `packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.spec.tsx` | merge-existing-owner | old helper spec in `origin/main` | delete; assertions covered by plugin and runtime specs | typecheck, 57 tests |
| `packages/utils/src/lib/plugins/trailing-block/withTrailingBlock.ts` | merge-existing-owner | old normalizer helper in `origin/main` | delete; behavior moved into `TrailingBlockPlugin.ts` Plite normalizer | typecheck, 57 tests, runtime specs |
| `packages/utils/src/lib/plugins/trailing-block/withTrailingBlock.spec.tsx` | merge-existing-owner | old helper spec in `origin/main` | delete; assertions covered by plugin and runtime specs | typecheck, 57 tests |

Best Plate v2 recommendations:
| Target | Recommended shape | Rejected alternatives | Reason |
|--------|-------------------|----------------------|--------|
| NormalizeTypes | plugin-owned Plite editor normalizer via `extendExtension` | resurrect `withNormalizeTypes`, bridge file, or Plate wrapper | normalizer is the plugin owner; Plite owns runtime normalize hook |
| TrailingBlock | plugin-owned Plite editor normalizer via `extendExtension` | resurrect `withTrailingBlock`, bridge file, or command fallback | behavior belongs with the plugin and has runtime proof |
| SingleBlock / SingleLine | Plite read/update plus plugin extension install | direct mirrors, old Slate helpers, custom local tx aliases | keeps runtime behavior explicit and typed |
| React hooks | Plite `editor.read.*` and `editor.update.*`; minimal event shapes | fake full React events, `any`, direct editor mirrors | preserves type inference and removes test casts |
| Test fixtures | export `TestEditor` from `@platejs/test-utils` | local `JsxEditor` aliases in each package | one owner for JSX fixture editor typing |

Plite / Plate gaps:
- none blocking `packages/utils`.

Related Core sweep:
- not applicable; no `packages/core` files were edited in this package packet.

Changed list:
- `packages/utils`: migrated stale Plite reads, recovered normalize/trailing runtime behavior in plugin owners, tightened React hook event shapes, removed local fake JSX editor aliases, added runtime proof specs.
- `packages/test-utils/src/jsx.ts`: exported `TestEditor` and typed JSX overloads for editor/fragment/selection fixtures.
- `docs/plans/2026-07-05-plate-next-utils-review.md`: completed package review ledger.

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/utils` — pass.
- `pnpm --filter @platejs/utils test` — pass, 57 tests, 84 expects.
- `pnpm --filter @platejs/utils build` — pass.
- `pnpm --filter @platejs/test-utils build` — pass.
- `rg -n "withNormalizeTypes|withTrailingBlock|OverrideEditor|extendTransforms|editor\\.tf|getTransforms|getPluginApi|value\\.root\\(|marks\\.get\\(|fragment\\.get\\(|editor\\.selection|editor\\.children|editor\\.dom|dom\\.readOnly|dom\\.composing|read\\.end\\(|read\\.start\\(" packages/utils/src packages/utils/README.md packages/utils/package.json` — no matches.
- `rg -n "as any|\\bany\\b|as unknown|Parameters<|type JsxEditor|type EditorFixture|EditorUpdateTransaction" packages/utils/src packages/utils/package.json packages/utils/README.md` — only `TUpdateSuggestionData.properties/newProperties`, accepted arbitrary payload surface.

Error attempts:
| Error | Resolution |
|-------|------------|
| Parallel typecheck/test produced transient `Cannot find module '@platejs/plite' from packages/test-utils/dist/index.js` | reran proof sequentially; tests pass |
| `Pick<React.KeyboardEvent, 'key' | 'keyCode' | 'preventDefault'>` required both key fields | replaced with exact minimal event shape where `key`/`keyCode` are optional |

Needs your attention:
- none. The only loose `any` in `packages/utils` is the suggestion update arbitrary property payload and should stay broad unless the suggestion model gets a typed schema.

Final verdict:
- `packages/utils` is clean for this `plate-next` package review.
- keep/revert/quarantine: keep.
- next owner: user review or next explicitly named package; this run did not start another package.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | `packages/utils` package review complete |
| Where am I going? | Stop and hand off; no next package started |
| What is the goal? | Clean Plate Next package review with every file score `100` |
| What have I learned? | Normalize/trailing old `with*` behavior belongs in plugin-owned Plite normalizers; JSX fixture editor typing belongs in `@platejs/test-utils` |
| What have I done? | Repaired stale Plite API usage, restored lost runtime behavior, typed tests, and ran focused proof |

Open risks:
- None.

Final gate:
- [x] Every explicit requirement copied into the plan.
- [x] 44/44 package file rows checked at score `100`.
- [x] Deleted `with*` files accounted for.
- [x] No stale Plite API audit hits remain.
- [x] Focused package typecheck/test/build pass.
- [x] No next package started.
