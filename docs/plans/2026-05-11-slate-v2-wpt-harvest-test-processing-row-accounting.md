# Slate v2 WPT Harvest Row Accounting

status: done
lane: slate-v2
source_harvest: `.tmp/editor-test-harvester/wpt/report.md`
source_inventory: `.tmp/editor-test-harvester/wpt/inventory.md`
source_test_index: `.tmp/editor-test-harvester/wpt/test-index.md`
target_revision: `../wpt@dd54691426`

## Accounting Rule

The versioned plan accounts for the five promoted harvest matrix rows. The full 1,139-file WPT focused inventory stays in scratch output and is routed here by category, action, and owner class so the execution plan does not pretend every browser-platform file is a Slate test.

## Promoted Matrix Rows

| Row | Lane status | Slate v2 owner | Action |
| --- | --- | --- | --- |
| WPT-1 beforeinput/input | in-lane | `slate-react` input runtime, `slate-browser` browser harness | refactor existing first; create gap rows only for cancellation/DataTransfer/native ownership gaps |
| WPT-2 DOM Selection/Range | in-lane | `slate-browser` selection helpers, `slate-react` selection controller and DOM coverage | refactor existing browser/package rows first |
| WPT-3 clipboard/DataTransfer | in-lane | `slate-dom` clipboard boundary, `slate` clipboard contract, `slate-react` clipboard bridge | refactor existing; add app-owned/model-owned gap rows only |
| WPT-4 contenteditable structural edits | in-lane | `slate` transforms/delete/insertFragment, `slate-react` DOM coverage and browser stress | refactor existing; create narrow crash-regression rows only after dedupe |
| WPT-5 focus/Shadow DOM | in-lane | `slate-react` focus/runtime, `slate-browser` harness, Shadow DOM browser proof | refactor existing; add detached/shadow-host fail-closed rows only |

## Inventory Category Routing

| Category | Count | Route | Completion decision |
| --- | ---: | --- | --- |
| `portable` | 518 | Raw Slate substrate candidate pool. Folded into WPT-1 through WPT-5 by tag. | in-lane, grouped |
| `portable-mixed` | 198 | Split rows. Browser substrate pressure stays in WPT-1 through WPT-5; product/plugin behavior is excluded. | split, grouped |
| `defer` | 7 | Future or low-signal browser API rows from `editing/**`. | explicit defer |
| `harness` | 172 | Support, manual, reference, and no-assertion harness files. | skip |
| `skip` | 182 | Browser policy/layout/platform rows without editor substrate behavior. | out-of-lane |
| `uncertain` | 62 | Scratch-only editing rows that the harvester did not promote to the matrix. They remain harvester inventory debt, not Slate v2 execution rows. | out-of-plan until a harvester rerun promotes them |

## Category By Action

| Category/action | Count | Route |
| --- | ---: | --- |
| `portable / refactor-existing` | 326 | Deduped inside WPT-1 through WPT-5 before any new test |
| `portable / create-new` | 190 | Gap-only rows after current coverage search |
| `portable / defer` | 2 | Future API or harness-limited rows |
| `portable-mixed / refactor-existing` | 133 | Substrate slice only |
| `portable-mixed / create-new` | 46 | Substrate slice only, only after proof owner is named |
| `portable-mixed / defer` | 19 | Low-signal crash/designMode rows until a direct editor invariant is written |
| `defer / refactor-existing` | 3 | Explicit defer with target owner |
| `defer / create-new` | 4 | Explicit defer with target owner |
| `harness / skip` | 172 | Excluded |
| `skip / skip` | 182 | Excluded |
| `uncertain / defer` | 62 | Excluded from this plan; not counted as unresolved Slate v2 rows |

## Directory Pressure

| Directory | Routed pressure |
| --- | --- |
| `clipboard-apis` | WPT-3 only, excluding permissions and policy rows |
| `input-events` | WPT-1 |
| `selection` | WPT-2 |
| `dom/ranges` | WPT-2, with tentative OpaqueRange rows treated as defer unless reduced to current DOM Range behavior |
| `contenteditable` | WPT-4 |
| `editing` | WPT-1, WPT-4, and selected WPT-5 crash/focus rows |
| `focus` | WPT-5, excluding harness-only files |
| `shadow-dom` | WPT-5 only when selection, focus, caret, input, or editing host behavior is present |

## No Unresolved Lane Rows

No promoted WPT matrix row is unresolved. The only non-closed inventory class is `uncertain`, and those files were not promoted by the source harvest into Slate v2 behavior rows. A later WPT harvester deepening can promote some of them, but this lane plan has no autonomous routing left.
