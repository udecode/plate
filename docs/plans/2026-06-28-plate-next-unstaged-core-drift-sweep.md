# plate-next unstaged core drift sweep

Objective:
Sweep every unstaged Core file with high drift from `origin/main`, avoid unnecessary refactoring, recover owner-local behavior where drift hid regressions, and keep Plate v2 aligned to Plite without legacy shims.

Completion threshold:
Done when the unstaged Core drift ledger covers every modified/deleted/renamed/untracked `packages/core/**` row, score `>=4` rows have concrete owner verdicts, forbidden bridge/compat audits are clean, fixed rows have focused proof, and `pnpm check:core` passes.

Verification surface:
- Drift ledger: `docs/plans/artifacts/2026-06-28-plate-next-unstaged-core-drift-sweep/core-drift-ledger.tsv`
- Top drift summary: `docs/plans/artifacts/2026-06-28-plate-next-unstaged-core-drift-sweep/top-drift.md`
- Focused tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/ParserPlugin.spec.ts`
- Typecheck: `pnpm turbo typecheck --filter=./packages/core`
- Full Core gate: `pnpm check:core`
- Source audits: old `editor.tf` / `getTransforms` / forbidden runtime bridge names returned no Core matches.

Constraints:
- Keep review mode close to current/main-owned file names; no rename churn.
- No public compat aliases or old Plate/Slate transform wrappers.
- Core must not hide plugin behavior in bridge dumps.
- Move or keep behavior in the owning plugin file unless Plite needs a real substrate change.
- Do not stage, commit, or touch non-Core packages in this packet.

Boundaries:
- Edit scope was `packages/core/**` plus this plan and its drift artifacts.
- Out of scope: migrating non-Core Plate packages, public docs, browser proof, PR creation, release work.
- Accepted hard cuts: old `editor.tf` helper tests and obsolete runtime-compat specs.

Blocked condition:
No blocker. Remaining review attention is about whether the accepted high-drift type files match the desired final public naming, not about test failure.

Work Checklist:
- [x] Copied the explicit request into the plan: sweep every unstaged Core file, fix excessive drift, avoid unnecessary refactoring.
- [x] Classified the mode as broad Core review under `plate-next`.
- [x] Regenerated a 176-row drift ledger covering modified/deleted/renamed/untracked Core rows.
- [x] Audited forbidden bridge and compat patterns: `currentRuntimeBridge`, `runtimeTxExtensions`, `editor.tf`, `getTransforms`, `extendTransforms`, `withNodeId`, `withPlateReact`.
- [x] Recovered the deleted `AffinityPlugin` behavior suite from `origin/main` into current Plite APIs.
- [x] Removed the dirty directional-inline insertion shortcut from `AffinityPlugin`.
- [x] Fixed affinity parity bugs exposed by the recovered suite: outward mark preservation, element delete-backward affinity, hard-edge single-mark direction.
- [x] Ran focused owner tests for affinity, slate-extension, node-id, dom, and parser.
- [x] Ran Core typecheck.
- [x] Ran full `pnpm check:core`.
- [x] Recorded top drift rows, accepted deletes, untracked files, and needs-review rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | Objective and constraints mirror the user request. |
| Skill route | yes | `plate-next` broad Core drift sweep. |
| Autogoal active | yes | Goal created for this plan path. |
| Ledger initialized | yes | 176 rows in linked TSV artifact. |
| Rename freeze | yes | No rename pass performed; existing review-mode names preserved. |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Ledger coverage | yes | 176 rows, 173 tracked diff rows, 3 untracked rows. |
| Score gate | yes | 16 score-4 rows have concrete verdicts; no generic score-4 verdicts remain. |
| Forbidden bridge audit | yes | No Core matches for forbidden bridge/old transform patterns. |
| Focused proof | yes | 60 focused plugin tests pass. |
| Full Core proof | yes | `pnpm check:core` passes. |
| Final plan check | yes | This plan is ready for `check-complete`. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Drift manifest | Complete | `core-drift-ledger.tsv`, 176 rows. |
| High-drift review | Complete | Top 60 rows classified in `top-drift.md`. |
| Affinity recovery | Complete | Recovered suite is 27 pass. |
| Compat audit | Complete | No stale Core compat matches. |
| Core proof | Complete | `pnpm check:core` passes. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | 4 | fixed-restored-owner-suite | AffinityPlugin | 27 tests pass | keep |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` | 4 | fixed-owner-parity-bug | AffinityPlugin | old suite exposed and verified fixes | keep |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` | 3 | fixed-owner-parity-bug | AffinityPlugin | hard-edge tests pass | keep |
| `packages/core/src/lib/plugin/BasePlugin.ts` | 4 | accepted-api-hard-cut | Plugin type surface | transforms removed, tx/api/extensions retained, typecheck passes | review naming later |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | 4 | accepted-api-hard-cut | Plugin type surface | transforms removed, tx/api/extensions retained, typecheck passes | review naming later |
| `packages/core/src/lib/editor/withPlite.ts` | 4 | accepted-plite-route | Base editor runtime | Core typecheck and tests pass | keep |
| `packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts` | 4 | accepted-delete | Plate runtime cleanup | obsolete runtime compat owner gone | keep delete |
| `packages/core/src/static/components/slate-nodes.tsx` | 4 | recover-main-owner | Static components | untracked but origin/main owns the path | keep path, no rename |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx`: 27 pass, 0 fail.
- Focused owner batch: 60 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core`: pass.
- `pnpm check:core`: pass. Core tests 683 pass; Plite tests 1868 pass, 85 skip.
- Drift artifact: 176 rows; 16 score-4 rows; 42 score-3 rows.
- Source audit: no Core matches for old `editor.tf`, `getTransforms`, `extendTransforms`, forbidden runtime bridge files, or dirty inline redirect helper.

Changed list:
- `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts`
- `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`
- `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts`
- `docs/plans/2026-06-28-plate-next-unstaged-core-drift-sweep.md`
- `docs/plans/artifacts/2026-06-28-plate-next-unstaged-core-drift-sweep/core-drift-ledger.tsv`
- `docs/plans/artifacts/2026-06-28-plate-next-unstaged-core-drift-sweep/top-drift.md`

Needs attention:
- `BasePlugin.ts` / `SlatePlugin.ts` still carry large type-surface drift. Tests pass, but the final naming taste is still review-worthy.
- `slate-nodes.tsx` is untracked while `origin/main` owns that path. It should be included when this branch is eventually staged, not renamed during this review packet.
- `SlateExtensionPlugin.spec.tsx` intentionally does not restore deleted `editor.tf` transform-helper tests because those APIs are hard-cut.

Open risks:
- Some accepted score-3 rows are classified by owner and green gates rather than hand-reviewed line by line. The worst score-4 rows were explicitly owned, and the full Core gate is green.

Reboot status:
Resume by reading `top-drift.md`, then inspect remaining score-3 `reviewed-accepted` rows only if the user wants deeper file-by-file review. Do not redo the affinity recovery; it is green and owner-local.
