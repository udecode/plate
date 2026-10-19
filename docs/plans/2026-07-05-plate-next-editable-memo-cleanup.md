# plate next editable memo cleanup

Objective:
Restore editable React cleanup for transient `_memo` metadata while preserving `PlateStatic` `_memo` memoization and correcting docs to element-only metadata.

Goal plan:
docs/plans/2026-07-05-plate-next-editable-memo-cleanup.md

Template:
docs/plans/templates/plate-next.md plus docs pack, collapsed before implementation because the generated plan was oversized for a narrow packet.

First checkpoint:
- Requirement: `_memo` cleanup belongs to Plate editable runtime, not Plite substrate.
- Requirement: static rendering must keep using `_memo`.
- Requirement: docs must say `_memo` is element-only unless leaf support exists.
- Requirement: add focused tests for editable cleanup and static preservation.
- Requirement: run focused Core proof and docs proof.
- Scope: `packages/core`, Plite only if a proven gap appears, docs static guide wording.
- Non-goal: no broad Core sweep, no public API rename, no Plite metadata API.
- Stop condition: focused behavior tests, Core typecheck/lint, docs check, and goal check pass, or a real Plite/Plate gap blocks clean implementation.

Completion threshold:
- Editable `createPlateEditor({ shouldNormalizeEditor: true })` removes `_memo` from value nodes.
- `createStaticEditor` / `PlateStatic` still preserves `_memo` for static rendering.
- Docs describe `_memo` as an element metadata field only.
- No public compatibility alias or bridge file is introduced.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-editable-memo-cleanup.md` passes.

Verification surface:
- Focused tests: Core React editor test plus static editor/static component tests.
- Package proof: `pnpm turbo typecheck --filter=./packages/core` and `pnpm --filter @platejs/core lint`.
- Docs proof: `pnpm --filter www check:docs`.
- Source audits: `_memo` and editable metadata owner search across Core/docs.
- Browser proof: not required for this packet; docs wording and runtime tests are the proof surface.

Constraints:
- Plate owns `_memo` because it is static-render metadata.
- Plite must not learn `_memo`.
- `ViewPlugin` must not strip `_memo` because static editors need it.
- Do not add `any` or explicit inferred callback parameter annotations to hide type problems.
- If `tx.nodes.unset` typing is insufficient, fix the owner instead of adding local casts.

Boundaries:
- Allowed edit scope: `packages/core/src/react/editor`, `packages/core/src/static`, `content/docs/(guides)/static*.mdx`, this plan.
- Package/API surfaces: internal Plate React core plugin list and tests only.
- Docs/browser surfaces: static guide text only.
- Non-goals: full Plate v2 cleanup, Plite metadata support, broad Core drift score.
- Out-of-scope package errors: non-Core package fallout is not blocking unless this packet touches it or proves Core API regression.

Blocked condition:
- Block only if Plite normalizer transactions cannot remove metadata without a source-owned type/API fix, or if static preservation cannot be proven without changing public static APIs.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists all explicit `_memo`, static preservation, docs, tests, and non-goal constraints. |
| `plate-next` skill read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| `docs-creator` skill read | yes | `.agents/skills/docs-creator/SKILL.md` read for docs wording. |
| Active goal created | yes | Goal objective created for editable `_memo` cleanup. |
| Mode classified | yes | Narrow named packet, not broad Core sweep. |
| Public API fork routing checked | yes | No public API fork; internal cleanup only. |

Work Checklist:
- [x] First checkpoint complete before implementation.
- [x] Mode classified as narrow Plate Next packet.
- [x] Best Plate v2 call recorded: keep `_memo` in Plate editable cleanup, not Plite.
- [x] Legacy/backcompat decision recorded: no alias, no old Slate plugin restoration, no bridge.
- [x] Gap policy recorded: patch Plite only if typed normalizer transaction is missing.
- [x] Docs pack recorded: static docs wording must match source.
- [x] Focused package proof planned.
- [x] Changed list, proof, risks, and next owner will be filled before final response.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Plan | done | Concrete requirements and proof gates recorded. |
| Implementation | done | See Verification evidence and Changed list. |
| Proof | done | See Verification evidence. |
| Closeout | done | Goal check passed before completion. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `getPlateCorePlugins` / editable `_memo` cleanup | 1 | keep-in-plate | Plate React editable runtime | `_memo` is consumed by `PlateStatic`, not Plite. | Add internal editable cleanup extension. |
| `PlateStatic` `_memo` memoization | 0 | keep-in-plate | Plate static renderer | Existing static component uses element `_memo`. | Add preservation test. |
| static docs `_memo` wording | 1 | docs-fix | docs-creator | Docs said element or leaf; source only uses elements. | Change to element-only. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `_memo` cleanup | Internal editable metadata extension installed by Plate React core plugins | Moving `_memo` to Plite; stripping in `ViewPlugin`; restoring old `SlateReactExtensionPlugin` | `_memo` is Plate static metadata, but editable values should not retain it. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | No gap after using Plite normalizers and `tx.nodes.unset`. | N/A | Focused Core tests. | No Plite patch. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `_memo` cleanup | `rg -n "_memo|editableMetadata|EditableMetadata" packages/core/src content/docs` | 19 relevant matches after patch | 8 files patched | 0 | Low after focused tests and `check:core`. |
| stale React plugin docs | `rg -n "ReactPlugin|SlateReactExtensionPlugin|editor\\.api\\.redecorate|currentKeyboardEvent|prevSelection|_memo cleanup" content/docs/api content/docs/meta.json packages/core/src` | 0 after patch | 5 docs/nav files patched | 0 | Low; docs source parity passed. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/react/editor/internal/EditableMetadataPlugin.ts` | justify-new-proof-tooling | Old cleanup lived in deleted React extension; current owner is editable core plugin list. | Keep as internal non-exported owner. | Focused tests and no public barrel. |
| `packages/plite/test/public-package-import-smoke.test.ts` | merge-existing-owner | Existing exact-export contract was stale for current `plite-react` exports. | Update expected exports for `EditorReadOnlyProvider` and `useOptionalEditorReadOnly`. | `pnpm check:core` passed. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Internal editable metadata extension plus core plugin install. |
| tests/proof | Editable cleanup test and static preservation test. |
| docs/templates/skills | Static docs wording plus this plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None expected | This is internal cleanup with focused tests. | N/A | Review only if you dislike internal plugin owner name. |

Findings:
- `_memo` is static-render metadata. Editable React should strip it during normalization; static rendering should preserve it.

Decisions and tradeoffs:
- Keep `_memo` out of Plite. Plite should not know Plate static renderer metadata.
- Keep static preservation as source truth; only editable React gets cleanup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First `pnpm check:core` failed on stale exact plugin-order assertions and stale `plite-react` export expectation. | 1 | Repair source-owned tests/contracts, not weaken proof. | Added `editableMetadata` to Core plugin-order expectations and current `plite-react` exports to the exact public import smoke. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/editor/TPlateEditor.spec.ts src/static/editor/withStatic.spec.tsx src/static/components/PlateStatic.spec.tsx`: 39 pass.
- `pnpm turbo typecheck --filter=./packages/core`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- `pnpm --filter www check:docs`: pass.
- `rg -n "ReactPlugin|SlateReactExtensionPlugin|editor\\.api\\.redecorate|currentKeyboardEvent|prevSelection|_memo cleanup" content/docs/api content/docs/meta.json packages/core/src --glob '!**/dist/**'`: no matches.
- `pnpm check:core`: pass; 703 Core tests pass, 1,985 Plite tests pass, 85 skipped, 0 fail.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused editable/static `_memo` tests passed: 39 pass. |
| Package/API proof | yes | `pnpm check:core` passed after test-contract repair. |
| Docs proof | yes | `pnpm --filter www check:docs` passed. |
| Source audit | yes | Stale ReactPlugin/redecorate/currentKeyboardEvent/prevSelection audit has no matches in active API docs/Core source. |
| Broad Core drift ledger coverage | no | Narrow packet; review matrix has only inspected targets. |
| Extracted-file inventory | yes | New internal file classified in Extracted file ledger. |
| Autoreview / review | no | Focused packet; source proof replaces broad review. |
| Goal plan complete | yes | Final `check-complete` run after this edit. |

Final handoff contract:
- Include changed list, commands run, proof result, remaining risk, and whether Plite/Plate gaps remain.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementing narrow Plate Next `_memo` cleanup. |
| Where am I going? | Editable strips `_memo`, static preserves `_memo`, docs say element-only. |
| What is the goal? | Close the behavior/docs gap without moving static metadata to Plite. |
| What have I learned? | Plite normalizers are enough; no Plite gap yet. |
| What have I done? | Created concrete plan and read owning skills. |

Timeline:
- 2026-07-05: Goal plan created and collapsed into a narrow executable checklist before implementation.

Open risks:
- `tx.nodes.unset` generic typing may need a small source-owned adjustment if the internal plugin cannot call it cleanly.
