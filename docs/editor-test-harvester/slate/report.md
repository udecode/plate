# Slate editor test harvest

## Verdict

Slate is fully inventoried at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`: 1,136 test-tree files, 1,093 runnable behavior files, 1,254 extracted test identities, and zero unresolved classifications. The harvest does not recommend copying Slate's fixture corpus. Plite already owns the broad model, transform, history, React, DOM, and browser laws; the current upstream delta identifies one material gap in nested-array deep equality, one small hyperscript harness gap, and two browser/device behaviors that require reproduction.

The remembered 1,120-file audit is preserved only as legacy evidence. Its exact file-set hash matches the `6038-batched-set-node-prototype` fork at both `4cb3b740cfa295d8ac6fe38afbe74e87135af68c` and `fd087e3f173f28c823a7170bc88f0301c1eeabe9`; it does not match upstream `main`. This report establishes the first honest upstream cursor.

## License gate

| Field | Result |
| --- | --- |
| Target | Clean local clone `../slate-audit` |
| License | MIT |
| Evidence | `../slate-audit/License.md`; workspace packages declare MIT |
| Source | `https://github.com/ianstormtaylor/slate.git` |
| Branch / upstream | `main` / `origin/main` |
| Source revision | `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` |
| Output | Durable metadata and classifications only; no copied tests or fixtures |

## Inventory receipt

- Full inventory: 1,136 files. Classified: 1,136. Unresolved: 0.
- Categories: 1,062 portable, 31 portable-mixed, 43 harness.
- Runnable behavior files: 1,093. Extracted direct or fixture-derived identities: 1,254. Zero runnable files lack an identity.
- Source areas: 1,048 Slate core test files, 33 hyperscript files, 17 History files, 8 React files, 24 Playwright files, 1 Playwright tsconfig, and 5 Docker harness files.
- Inventory command: `rg --files ../slate-audit | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'`.
- [Full file inventory](./inventory.md) and [portable test-name index](./test-index.md).

## Confidence score

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| Inventory completeness | 0.20 | 1.00 | 1,136/1,136 classified; exact source cursor; zero unresolved |
| Behavior extraction depth | 0.20 | 0.92 | 1,254 direct or fixture-derived identities across 1,093 runnable files; family grouping preserves the source path |
| Skip precision / negative controls | 0.15 | 0.93 | Core, History, hyperscript, React, Playwright, and Docker runners/configs were read as negative controls |
| Plite/Plate mapping accuracy | 0.20 | 0.90 | Source owners were remapped by family; high-risk delta rows have exact local tests or an explicit proof gap |
| Actionability | 0.15 | 0.94 | Every current delta behavior has keep, reject, reproduce, or deferred-owner action |
| Provenance / reproducibility | 0.10 | 0.98 | Clean clone, immutable commit, exact command, generated inventory, and independent issue/PR cursor |
| **Weighted total** | **1.00** | **0.94** | **0.9425; above 0.92, with no dimension below 0.85** |

## Pass-state ledger

| Pass | Status | Evidence |
| --- | --- | --- |
| Intake and boundary | done | Upstream `main` is the source; the fork-specific legacy audit is not promoted |
| License | done | MIT evidence checked before durable output |
| Full inventory | done | [inventory.md](./inventory.md): 1,136 classified, zero unresolved |
| Test-name extraction | done | [test-index.md](./test-index.md): 1,093 files and 1,254 identities |
| Classification pressure | done | 43 harness rows separated; React/browser rows remain portable-mixed |
| Current mapping | done | Broad families and all nine changed test files mapped below |
| Issue/PR correlation | done | [54-row delta ledger](../../editor-issue-harvester/slate/full/issue-closure-ledger.md) has zero unchecked rows |
| Closure review | done | One material implementation gap, one harness defer, and explicit browser/device repro gates |

## Behavior-family matrix

Every inventory row belongs to one of these prefix families. The full inventory retains each exact subfamily and path; this table records the current owner and adoption decision.

| Slate family | Files | Portable law | Current owner | Decision |
| --- | ---: | --- | --- | --- |
| `interface/*` | 576 | Editor, Node, Path, Point, Range, Text, Element, Location, Operation, custom-type, and scrubber contracts | `packages/plite/test/**`, public-state accessors, node/path/selection contracts | keep local; donor fixtures are representation-specific pressure, not copy targets |
| `transform/*` | 408 | Insert, delete, move, merge, split, wrap, unwrap, set, unset, select, and normalization transforms | `packages/plite/src/transforms-*`, command/snapshot/slice/transaction tests | keep local; compare individual regressions when upstream changes |
| `operation/*` | 31 | Operation application and inverse behavior | Plite transactions, change laws, snapshot contracts, and History | keep transaction-owned laws |
| `normalization/*` | 20 | Editor, block, inline, text, and void repair | Plite schema and normalization contracts | keep local structural policy |
| `history-undo-redo` | 17 | Undo/redo grouping, cursor restoration, and branch behavior | `packages/plite-history/test/history-contract.ts` | keep local; PR #6063 maps to rollback proof |
| `utility/*` | 11 | Deep equality and string behavior | `packages/plite/src/utils/deep-equal.ts` and text-unit contracts | rearchitect nested-array comparison from PR #6092; keep string behavior |
| `react-runtime/*` | 8 | React selection, decoration, editor, chunking, and selector behavior | `packages/plite-react/test/**` | keep local; exact `useSelected` removal proof exists |
| `browser-example/*` | 24 | Browser input, selection, decoration, iframe, shadow DOM, void, table, paste, and large-document behavior | `apps/plite/tests/plite-browser/**` plus package contracts | keep current harness; add focused repros for #6084 and raw-device rows only |
| `test-harness/*` | 41 | Fixture runners, DSL declarations, config, and Docker infrastructure | Local Node/Vitest/Playwright proof runners | reject wholesale transplant; defer PointRef/RangeRef hyperscript helpers until demanded |

## Current upstream test delta

The source diff from upstream `945a484df2497e4c448b33f417b0de2a49840032` to `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` changes 46 files and nine test-tree files.

| Upstream behavior | Provenance | Current Plite owner | Decision |
| --- | --- | --- | --- |
| PointRef / RangeRef hyperscript values | `packages/slate-hyperscript/test/fixtures/{point,range}-ref.tsx` | No equivalent under Plite hyperscript | defer with Plite hyperscript owner; harness ergonomics, not runtime behavior |
| Async decoration caret | Playwright code-highlighting update for #6033 | `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts` | covered by existing browser proof |
| Selected element removes itself | `packages/slate-react/test/use-selected.spec.tsx` for #6073 | `packages/plite-react/test/use-element-selected.test.tsx` | covered by exact unmount and watched-path removal contracts |
| Indic conjunct deletion | core deletion fixture for #6074 | `packages/plite/test/text-units-contract.ts` | covered by Tamil and Devanagari grapheme cases |
| Nested array equality | two deep-equality fixtures for #6092 | `packages/plite/src/utils/deep-equal.ts` | material gap; recursive nested arrays need a focused test-and-fix slice |
| Async decorations example | new `decorations-async.test.ts` | same Plite browser owner | covered |

## Issue and PR pressure

The independent tracker audit found 54 threads changed after `2026-05-23T09:18:40Z`: 7 issues and 47 PRs. Of these, 33 were created after the baseline and 21 are older threads with new material activity. All 54 are checked in the [closure ledger](../../editor-issue-harvester/slate/full/issue-closure-ledger.md).

High-value outcomes:

- #6092 is the one confirmed Plite implementation gap.
- #6065 is a small test-harness defer.
- #6084 needs a focused browser reproduction for semantic no-op native insertion.
- #5130, #5974, and #6096 remain raw-device or environment reproduction gates.
- #6039 is the fork-specific batching branch behind the remembered audit; it is not upstream law.
- #6083's null-as-unset API is rejected in favor of Plite's explicit `unsetNodes` owner unless a future `best-api` review changes that decision.

## Skips and negative controls

| Source | Decision | Reason |
| --- | --- | --- |
| Core, History, and hyperscript `test/index.js` runners | harness | Dynamic fixture discovery and execution; assertions belong to the indexed fixtures |
| Hyperscript fixtures and `jsx.d.ts` | harness | Fixture DSL values; PointRef/RangeRef remain an explicit small defer |
| React and Playwright `tsconfig.json` | harness | Compiler configuration, not an editor invariant |
| Playwright Docker config and scripts | harness | Browser infrastructure; no independent behavior assertion |
| Dependency, release, formatting, build, and docs PRs | issue-harvest skip | Individually checked in the 54-row ledger; no portable editor behavior |

No test-tree path remains unresolved. Harness classification does not erase supported behavior: runnable fixtures and browser rows retain their own indexed identity.

## Next slice

The next executable slice is narrow: add nested-array regression cases around `packages/plite/src/utils/deep-equal.ts`, then make array comparison recursive without changing primitive semantics. Do not bundle the hyperscript helper or mobile/browser repros into that fix.

The next research slice is #6084's two browser scenarios. Android and Firefox mobile claims remain outside synthetic proof and require `bun test:mobile-device-proof:raw` on a capable device lane.

## Proof honesty

- This harvest inventories upstream source and maps current local owners. It does not claim that all 1,254 upstream cases were rerun against Plite.
- `covered` in the delta matrix requires an exact current assertion and a focused local command; those commands are recorded in the issue/PR ledger.
- An open upstream PR is evidence, not authority. #6084 and #6096 remain repro gates.
- Synthetic mobile events do not satisfy raw-device claims.
- No upstream test or fixture was copied into versioned Plate output.
