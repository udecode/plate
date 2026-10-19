# Editor Test Harvest: Yjs Collaboration

status: done
score: 0.93
license_mode: permissive
license_evidence: `../slate-yjs/LICENSE.md`, `../lexical/LICENSE`, `../lexical/packages/lexical-yjs/package.json`, `../y-prosemirror/LICENSE`, `../y-prosemirror/package.json`, `../yjs/LICENSE`, `../yjs/package.json`
output_mode: durable
versioned_copy_policy: normal

## Inventory

- target: `../slate-yjs`, `../lexical/packages/lexical-yjs`, `../y-prosemirror`, `../yjs`
- test files found: 85
- portable: 63
- portable-mixed: 9
- plate-owned: 0
- skipped: 5
- harness/product/uncertain: 8
- full inventory: `docs/editor-test-harvester/yjs-collaboration/inventory.md`
- test-name index: `docs/editor-test-harvester/yjs-collaboration/test-index.md`

## License Gate

| Field | Value |
| --- | --- |
| License mode | `permissive` for all four targets |
| Evidence files | `../slate-yjs/LICENSE.md`; `../lexical/LICENSE`; `../lexical/packages/lexical-yjs/package.json`; `../y-prosemirror/LICENSE`; `../y-prosemirror/package.json`; `../yjs/LICENSE`; `../yjs/package.json` |
| Output directory | `docs/editor-test-harvester/yjs-collaboration/` |
| Output mode | `durable` |
| Versioned copy policy | `normal`; still extract behavior invariants rather than copying upstream fixtures |

## Search Commands

- `rg --files ../slate-yjs | rg ... | rg -v ... | sort`
- `rg --files ../lexical/packages/lexical-yjs | rg ... | rg -v ... | sort`
- `rg --files ../y-prosemirror | rg ... | rg -v ... | sort`
- `rg --files ../yjs | rg ... | rg -v ... | sort`
- `rg -n "^export (const|function) test" ../y-prosemirror/tests ../yjs/tests -g "*.js"`
- `rg -n "(yjs|Yjs|collab|collaboration|remote|concurrent|sync|relative position|awareness|UndoManager|snapshot|delta)" ../plite packages apps/www/src/registry docs`

## Confidence Score

| Dimension | Score | Evidence | Cap hit |
| --- | ---: | --- | --- |
| Inventory completeness | 0.96 | Four target inventories recorded, total/classified count is 85/85, full inventory linked. | none |
| Behavior extraction depth | 0.92 | 54 slate-yjs fixtures indexed, 116 y-prosemirror exports indexed, 237 yjs exports indexed, lexical-yjs recorded as no-test source. | none |
| Skip precision and negative controls | 0.90 | Harness/support/internal storage rows are separated with concrete reasons; negative controls include `slate.d.ts`, y-prosemirror runner/schema helpers, and Yjs IdMap/IdSet/encoding files. | none |
| Plite/Plate coverage mapping accuracy | 0.91 | Current Plite collab-history/runtime tests and Plate `packages/yjs` tests were searched and mapped. | none |
| Actionability of copy/refactor/create plan | 0.92 | Every non-covered family below names a Plite, Plate package, registry UI, or explicit defer owner. | none |
| Provenance and reproducibility | 0.95 | Local license evidence, exact source paths, inventory command, test-index file, and coverage search commands are recorded. | none |

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Intake and boundary | complete | All four target paths exist; all are MIT/permissive from local evidence. | Durable aggregate report selected. | none | none |
| Inventory | complete | 57 slate-yjs rows, 0 lexical-yjs rows, 11 y-prosemirror rows, 17 yjs rows. | Inventory file written. | none | none |
| Test-name extraction | complete | Fixture runner and exported test functions indexed. | Test-index file written. | none | none |
| Classification pressure | complete | Harness/internal rows split from portable and portable-mixed rows. | Counts and skip reasons updated. | none | none |
| Behavior extraction | complete | Matrix families below map operation replay, relative positions, undo, deltas, snapshots, suggestions, and provider convergence. | Matrix written. | none | none |
| Plite/Plate mapping | complete | Searched `../plite` collab-history/runtime contracts and Plate `packages/yjs`, registry cursor/suggestion owners. | Owner coverage written. | none | none |
| Action planning | complete | Create/refactor/plate-owned rows name concrete targets and verification commands. | Next Slice written. | none | none |
| Ecosystem synthesis | complete | Raw Plite stays operation/history substrate; Plate owns adapters, providers, awareness, cursors, and suggestion/review UX. | Synthesis written. | none | none |
| Closure review | complete | Score 0.93, no dimension below 0.85, 85/85 classified, no uncertain rows. | Completion set done. | none | none |

## Matrix

| Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action |
| --- | --- | --- | --- | --- | --- | --- |
| `../slate-yjs/packages/core/test/collaboration/**` | 54 fixtures loaded by `index.test.ts:63` | `collaboration-remote` | Local Plite operations should normalize into the same document as a remote Yjs peer after update exchange. Families: add/remove marks, insert/remove text, insert/remove/set/split/merge/move nodes, unicode text, nested blocks. | unit adapter mirror | Raw Plite is covered by `../plite/packages/plite/test/collab-history-runtime-contract.ts` for text, mark, delete, move, replace, remote metadata, history skip, bookmark/runtime target rebasing. Plate adapter coverage exists in `packages/yjs/src/lib/__tests__/collaboration/index.slow.ts`, but it is provider/init heavy. | `refactor-existing`: add one Plate Yjs slow fixture pack for unicode text, mark split, nested move, split/merge/set-node adapter conversion. |
| `../slate-yjs/packages/core/test/collaboration/insertText/withUnicode.tsx`; `../yjs/tests/y-text.tests.js:1779` | unicode fixtures and `testSplitSurrogateCharacter` | `collaboration-remote` | Collaboration adapters must preserve non-ASCII text, zero-width characters, and surrogate pairs across local edits, encoded updates, and delayed peer sync. | unit plus slow collaboration | Plite has local emoji movement tests and operation replay; Plate Yjs slow tests do not currently call out unicode/surrogate adapter conversion. | `create-new`: `packages/yjs/src/lib/__tests__/collaboration/index.slow.ts`, verification `pnpm test:slow -- packages/yjs/src`. |
| `../y-prosemirror/tests/positions.test.js:90`, `:429`, `:456`, `:490`, `:511`, `:539`; `../yjs/tests/relativePositions.tests.js:25`, `:111`, `:128` | position round-trip and association exports | `selection-dom-mapping` / `collaboration-remote` | Shared cursor/bookmark positions need stable round-trips across nested blocks, hard breaks, list-like structures, remote edits, and undo. Association/follow behavior must be explicit. | unit adapter/model | Raw Plite covers bookmarks and remote operation rebasing in `collab-history-runtime-contract.ts:496` and runtime targets in `:530`. Plate remote cursor UI exists in `apps/www/src/registry/ui/remote-cursor-overlay.tsx` and cursor overlay kits. | `plate-owned`: add Yjs remote cursor mapping tests in `packages/yjs` or registry cursor overlay when cursor projection is changed; raw Plite is covered for local bookmarks. |
| `../y-prosemirror/tests/undo.test.js:70`, `:831`, `:859`, `:922`; `../yjs/tests/undo-redo.tests.js:52`, `:240`, `:398`, `:740` | undo/redo exports | `history-undo-redo` / `collaboration-remote` | Local undo should skip remote-origin changes, rebase across concurrent remote inserts/deletes, restore selection near the undone edit, and avoid undo-manager lifecycle leaks. | unit model | Raw Plite covers remote history skip, local undo rebase across remote text, remote replace replay, and runtime target rebasing in `../plite/packages/plite/test/collab-history-runtime-contract.ts`. Plate provider lifecycle specs cover connect/disconnect/destroy, not deep undo-manager drift. | `covered` for raw Plite; `refactor-existing` only if Plate Yjs exposes undo manager lifecycle as product API. |
| `../y-prosemirror/tests/suggestions.test.js:124`, `:544`, `:1012`, `:1144`; `../y-prosemirror/tests/suggestion-simulation.test.js:203`, `:232` | suggestion/review exports | `collaboration-remote` / `decorations-overlays` | Suggestion/review edits should converge across peers after split/delete/format interleaves, and inserted/deleted suggestion marks should remain attributable. | unit product-model | This is not raw Plite substrate. Plate owns suggestion/review UX via `apps/www/src/registry/components/editor/plugins/suggestion-*.tsx`, `apps/www/src/registry/ui/suggestion-*.tsx`, and future collaboration examples. | `plate-owned`: backlog owner Plate suggestion/review plugin plus Yjs integration; do not force into `../plite`. |
| `../y-prosemirror/tests/delta.test.js:104`; `../yjs/tests/delta.tests.js:37`; `../yjs/tests/y-text.tests.js:1233`, `:1291`, `:1399`, `:1588` | delta/format exports | `serialization-parsing` / `marks-inline` | Rich-text deltas should preserve inline attributes through concurrent formatting, deletion, snapshots, embed conversion, and no-op attribute updates. | unit model | Raw Plite owns mark and operation behavior; Plate owns HTML/markdown/docx/Yjs serialization policy. Existing Plate Yjs deterministic state tests cover initial seeding, not rich-text delta edge families. | `plate-owned` plus `create-new` in `packages/yjs` if adapter serialization changes. |
| `../yjs/tests/updates.tests.js:105`, `:298`; `../yjs/tests/snapshot.tests.js:9`, `:36`, `:164`; Plate `packages/yjs/src/lib/__tests__/collaboration/fixtures.ts:288`, `:338`, `:400`, `:457` | update/snapshot and current Plate slow fixtures | `collaboration-remote` | Late sync, out-of-order updates, pending updates, and snapshots must converge without reseeding local content. | slow collaboration | Plate already covers reconnect, disconnected concurrent edits, reverse-order update flush, and late sync no-reseed in `packages/yjs/src/lib/__tests__/collaboration/index.slow.ts`. | `covered`; keep opt-in slow lane, do not move to default test. |
| `../lexical/packages/lexical-yjs` | no test files | `collaboration-remote` | Source exposes Yjs binding, awareness, cursor sync, snapshot rendering, and experimental v2 sync, but the named package path has no tests to harvest. | source-only | No upstream runnable test evidence. Plate and Plite should not infer a test gap from source without a behavior oracle. | `skip`: no test to add from this target; run code-review/architecture pass separately if desired. |

## Skips

| Source | Reason |
| --- | --- |
| `../slate-yjs/packages/core/test/slate.d.ts` | Ambient test typing only. |
| `../slate-yjs/packages/core/test/withTestingElements.ts` | Harness for fixture editor/shared-root setup. |
| `../y-prosemirror/tests/index.js`, `../y-prosemirror/tests/index.node.js` | Runner entrypoints. |
| `../y-prosemirror/tests/cohort.js`, `../y-prosemirror/tests/complexSchema.js` | Simulation/schema helpers for suggestion and position rows. |
| `../yjs/tests/index.js`, `../yjs/tests/testHelper.js` | Runner and randomized multi-peer helper. Technique is useful, but not a standalone editor behavior. |
| `../yjs/tests/IdMap.tests.js`, `../yjs/tests/IdSet.tests.js`, `../yjs/tests/encoding.tests.js`, `../yjs/tests/compatibility.tests.js` | Internal CRDT storage/encoding compatibility; no direct Plite/Plate editor target. |

## Ecosystem Synthesis

- Raw Plite should keep its collaboration law at the operation, commit, metadata, history, bookmark, and runtime-target layers. That is already the right architecture. Do not add Yjs objects, awareness state, or provider lifecycle to raw Plite.
- Plate owns the Yjs product layer: provider setup, deterministic seeding, shared-type bootstrapping, cursor/awareness UI, suggestion/review policy, and package examples.
- The biggest useful harvest still open is not a rewrite. It is a small Plate Yjs slow fixture pack that stresses unicode, mark boundaries, nested moves, split/merge/set-node adapter conversion, and remote cursor mapping when cursor projection is touched.
- `lexical-yjs` contributes architecture clues, not tests. Treat it as source-review input, not a harvested-test backlog.

## Next Slice

1. Add Plate Yjs slow fixtures for unicode/surrogate text, mark split/delete, nested move, split/merge/set-node conversion, using local Plate fixtures and `packages/yjs/src/lib/__tests__/collaboration/index.slow.ts`. Verification: `pnpm test:slow -- packages/yjs/src`.
2. If remote cursors/awareness are touched, add a Plate-owned cursor projection test from Yjs relative-position invariants. Owner: `packages/yjs` plus registry `remote-cursor-overlay`.
3. Do not add raw Plite Yjs adapter tests. Raw coverage is already the operation/history substrate; adapter/provider policy belongs in Plate.

## Full Inventory Appendix

See `docs/editor-test-harvester/yjs-collaboration/inventory.md`.
