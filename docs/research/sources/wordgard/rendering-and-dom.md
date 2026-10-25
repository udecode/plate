# Wordgard: rendering and DOM

## Bidi and tile rendering

- **Bidi and tiles.** Wordgard has its own bidi engine, which the 2026-07-27 audit kept as a tradeoff rather than a proven win. Its tile rendering had no benchmark shared with Plite and no local non-React consumer, so the audit makes no claim either way. Tile performance and universal bidi superiority were left unknown (wordgard-full-strict.md:24-25, 38-40).

Wordgard's code block is line-shaped state, not bounded rendering of one canonical text. At `wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:src/types/schema.ts:46-54` and `src/doc/parse.ts:338-365`, Text and LineBreak leaves represent source lines. `src/editor/tile.ts:668-708,1259-1270` permits adjacent text to merge without a fixed length cap; `src/state/textblock.ts:18-90` caches flattened block offsets. The 2026-09-02 10,000-line fixture counted 20,000 model nodes and 20,006 DOM descendants, yet Wordgard outperformed historical Plite CodeLines in that run. Source: `docs/plans/2026-09-02-wordgard-huge-code-block-benchmark.md:260-264,294-307,362-369`. Line count alone therefore did not isolate the cause of that comparison's rendering cost.

## Incremental rendering

- **Incremental equals fresh.** `test/webtest-content.ts` lines 50-274 at b5ad0d0 pin that incremental rendering matches a fresh render after arbitrary edit sequences, keeps the DOM identity of unaffected nodes and keeps empty-block placeholders valid. Plite's `packages/plitejs/test/react/rendered-dom-shape-contract.tsx` proves sibling DOM identity, placeholder shape, schema-shape reconfiguration and incremental versus fresh equivalence over deterministic edit traces (report.md:109).

## View runtime

- **View runtime.** `test/webtest-editor.ts` lines 11-113 at b5ad0d0 pin the view runtime. Extensions observe committed state, DOM corruption is repaired, nested dispatch is controlled, DOM reads flush pending work, appenders settle, and widgets connect and disconnect exactly once. The report credited Plite's extension lifecycle, after-commit, runtime repair, mutation observer, widget and transaction-extension contracts, with React owning widget mounting (report.md:112). The widget-layer and transaction-extension contracts were deleted in e0c1500b95 (2026-09-15). Current owners by test title: `packages/plitejs/test/update-after-commit-contract.ts` (post-commit effects and commit snapshots during nested updates), `packages/plitejs/test/react/mutation-observer-lifecycle-contract.test.tsx` (hostile DOM mutations repaired across React commits) and `packages/plitejs/test/plugin-change-events-contract.test.ts` (lifecycle listeners). Limit: matched by title on 2026-10-08, not run; this check found no owner for DOM reads flushing pending work or for appenders settling.

## DOM position bias

- **Biased positions.** `test/webtest-resolve-dom.ts` lines 24-193 at b5ad0d0 pin that biased model positions resolve to the correct side of the DOM around text, mark boundaries, widgets, wrappers and non-content structure. Plite's `packages/plitejs/test/dom/bridge.ts` and `packages/plitejs/test/dom/dom-coverage.ts` cover edge recovery, decorated slices, wrappers, runtime IDs, hidden boundaries, nested editors, RTL and strict and null results (report.md:113).

## Widgets and inline/block getters

- **Widgets and getters.** Plite rejects Wordgard's `Widget` class and its node-level `isInline` and `isBlock` getters. React components own widget rendering and the compiled schema owns inline and block classification. Importing the Widget class would also add a second DOM lifecycle (report.md:146; wordgard-latest-diff-2026-09-02.md:23-24).
