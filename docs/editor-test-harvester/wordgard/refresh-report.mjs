#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const harvestRoot = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(harvestRoot, 'report.md');
let report = readFileSync(reportPath, 'utf8');

const replaceSection = (heading, nextHeading, body) => {
  const start = report.indexOf(`${heading}\n`);
  const end = report.indexOf(`\n${nextHeading}\n`, start);
  if (start < 0 || end < 0) throw new Error(`Cannot replace ${heading}`);
  report = `${report.slice(
    0,
    start
  )}${heading}\n\n${body.trim()}\n${report.slice(end)}`;
};

replaceSection(
  '## Verdict',
  '## License Gate',
  `Wordgard's latest diff is worth three narrow Plite proof adaptations, not an
architecture transplant. History-extender, nested-wrapper/inline-void, and
consecutive/trailing soft-break proof are green. The geometry case exposed and
closed a missing physical trailing line in Plite's Chromium rendering.
Reject the new packed PointSet, RangeSet, and MultiSet APIs, the Widget class,
and node-level \`isInline\`/\`isBlock\` getters. Plate's table and flattened-list
owners already cover or deliberately represent the product cases differently.

This incremental harvest advances the independent test cursor from
\`c715d4ded8fc780f52c13206e589ea31e4148dd4\` to
\`b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54\`. All 13 changed test files and
675 current source-declared cases are indexed. Every new invariant is covered,
rejected by representation, proven locally, or routed with an exact failing
fixture and named Plite owner.`
);

replaceSection(
  '## License Gate',
  '## Current Cursor Accounting',
  `| Field | Result |
| --- | --- |
| Target | Local \`../wordgard\` source tree |
| License | MIT |
| Evidence | \`../wordgard/LICENSE\`; \`../wordgard/package.json\` |
| Output mode | Durable under \`docs/editor-test-harvester/wordgard/\` |
| Source revision | \`b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54\` |
| Branch and upstream | \`main\`; \`origin/main\`; \`https://code.haverbeke.berlin/wordgard/wordgard.git\` |
| Checkout state | Clean at inventory and closeout |
| Refresh mode | Incremental from the independent test cursor \`c715d4d\` |`
);

replaceSection(
  '## Current Cursor Accounting',
  '## Confidence Score',
  `- Current source: 29 files, 6,382 lines, 675 \`it(...)\` call sites.
- Exact delta: 13 changed test files, including new
  \`test/test-pointset.ts\` and \`test/test-rangeset.ts\`.
- [inventory.md](./inventory.md) classifies every file; [test-index.md](./test-index.md)
  records every current call site and source line.
- Fresh-current harness proof ran in an isolated archive of frozen HEAD with
  the checkout dependencies hardlinked into the archive:
  - \`node bin/build.ts\`: passed.
  - \`npm test\`: 594 passing.
  - \`node bin/test-headless.ts --binary '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'\`:
    764 tests, 0 failed.
- The older stale-\`dist\` limitation is superseded. These runs built and tested
  current \`b5ad0d0\` source without mutating the reference checkout.
- Wordgard still supplies only one desktop Chromium runner. Its green browser
  result does not establish Plite's WebKit, Firefox, mobile-viewport, or raw-device claims.`
);

replaceSection(
  '## Confidence Score',
  '## Pass-State Ledger',
  `| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| Inventory completeness | 0.20 | 1.00 | 29/29 files, 6,382 lines, zero uncertain |
| Behavior extraction depth | 0.20 | 0.98 | 26 runnable files and 675 call sites indexed; all 13 changed files read |
| Skip precision and negative controls | 0.15 | 1.00 | Three harness files retained as negative controls; no file-level skips |
| Plite/Plate coverage mapping accuracy | 0.20 | 0.96 | Current Plite core/DOM/React/history and Plate table/list owners inspected |
| Actionability | 0.15 | 0.98 | Three exact proof gaps have owners, files, commands, and one Plite plan |
| Provenance and reproducibility | 0.10 | 1.00 | Immutable cursor, clean checkout, fresh build, Node, and Chromium receipts |
| **Weighted total** | **1.00** | **0.99** | **0.985 rounded; no dimension below 0.85** |`
);

replaceSection(
  '## Pass-State Ledger',
  '## Behavior Matrix',
  `| Pass | Status | Evidence |
| --- | --- | --- |
| Intake and boundary | done | Incremental harvest from the registered independent cursor |
| License | done | MIT evidence read before durable output |
| Inventory | done | [inventory.md](./inventory.md): 29/29 classified, zero uncertain |
| Test-name extraction | done | [test-index.md](./test-index.md): 26/26 runnable files, 675 call sites |
| Classification pressure | done | Packed stores, Widget machinery, list representation, and Plate table ownership challenged |
| Behavior extraction | done | 41 invariant families cover every current portable, mixed, and Plate-owned file |
| Current coverage mapping | done | Live Plite/Plate owners cited; old plans are not treated as coverage |
| Action planning | done | All three proof adaptations pass with one bounded Plite runtime repair; no Plate plan is justified |
| Closure review | done | Counts reconcile; current Wordgard source builds and both harnesses pass |`
);

report = report.replace(
  /`Covered` means the current checkout contains equivalent or stronger[\s\S]*?route without treating those green counts as current-head proof\./,
  '`Covered` means the current checkout contains equivalent or stronger assertions. `Plan` means the invariant is portable and material but lacks one exact local proof. Current Wordgard source was freshly built before both harnesses ran.'
);

for (const [before, after] of [
  ['test-history.ts:41-303,323-420', 'test-history.ts:41-303,323-428'],
  ['test-selection.ts:42-219', 'test-selection.ts:36-249'],
  ['test-commands.ts:130-649,779-863', 'test-commands.ts:130-662,792-876'],
  ['test-table-correction.ts:21-41', 'test-table-correction.ts:21-45'],
  ['webtest-content.ts:50-258', 'webtest-content.ts:50-274'],
  ['webtest-content.ts:259-611', 'webtest-content.ts:275-664'],
  ['webtest-coords.ts:18-176', 'webtest-coords.ts:18-191'],
  ['webtest-resolve-dom.ts:24-118', 'webtest-resolve-dom.ts:24-193'],
]) {
  report = report.replaceAll(before, after);
}

const deltaRows = `| W34 | \`test-pointset.ts:24-65\`; \`test-rangeset.ts:24-79\` | anchors/changes | Ordered points and ranges preserve endpoint association through inserts/deletes and merge deterministically. | Plite's structural \`Anchor\` maps path/point/range values through canonical \`DocumentChange\`; annotation and decoration sources allow overlaps. \`packages/plitejs/src/core/anchor.ts:38-67\`; \`packages/plitejs/test/anchor-mapping-contract.ts:67-382\` | covered; reject packed stores | \`pnpm --filter plitejs exec bun test --preload ../../config/plite-source-test-setup.ts test/anchor-mapping-contract.ts\`; \`pnpm --filter plitejs test -- test/react/decoration-manager-contract.test.ts\` |
| W35 | \`test-history.ts:410-428\` | history | A transaction extension that adds a document change remains in the correct isolated undo/redo batches. | The composed Plite regression proves extender-added text plus an adjacent explicit batch across two undos and redos. \`packages/plitejs/test/history/integrity-contract.ts:163-222\` | test-written | \`pnpm --filter plitejs exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history/integrity-contract.ts\` — 12/12 passed |
| W36 | \`test-selection.ts:168-186\` | selection | Nearest caret placement avoids surrogate interiors, chooses a stable structural boundary, and stays inside selectable inline content. | Grapheme-aware geometry and text units plus inline-void traversal cover the user-visible law. \`packages/plitejs/test/dom/dom-geometry.test.ts:218-258\`; \`packages/plitejs/test/delete-contract.ts:173-227\`; \`packages/plitejs/test/query-contract.ts:3400-3435\` | covered | \`pnpm --filter plitejs exec bun test --preload ../../config/plite-source-test-setup.ts test/dom/dom-geometry.test.ts test/delete-contract.ts test/query-contract.ts\` |
| W37 | \`webtest-content.ts:275-664\` | decorations | Decorations refresh adjacent/end boundaries, map across preserved changed sections, and compose overlapping feature ranges. | Node-keyed Plite sources map and refresh changed buckets; Plate Comments preserves source order for overlaps. \`packages/plitejs/test/react/decoration-manager-contract.test.ts:24-106\`; \`packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx:249-359\` | covered; reject MultiSet | \`pnpm --filter plitejs test -- test/react/decoration-manager-contract.test.ts test/react/decoration-rendering-contract.test.tsx\` |
| W38 | \`webtest-coords.ts:101-115\` | browser geometry | Consecutive soft breaks and a trailing break keep distinct measurable lines and map clicks back to the correct model offsets. | The Chromium regression maps the consecutive empty line to offset 6 and the physical trailing line to offset 18. Final text projection appends one rendering-only newline while \`data-plite-length\` preserves model offsets. \`apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:968-1071\`; \`packages/plitejs/src/react/components/text-string.tsx:5-35\` | test-written; runtime repaired | [Plite proof plan and green receipt](../../plans/2026-09-02-wordgard-diff-proof-closure.md) |
| W39 | \`webtest-resolve-dom.ts:102-193\` | DOM bridge | DOM/model positions survive nested content wrappers, multiple decoration wrappers, and inline-void zero-width anchors. | The composed React-rendered regression maps the inline-void anchor both ways and maps the nested wrapper edges. \`packages/plitejs/test/react/surface-contract.tsx:2121-2184\` | test-written | \`pnpm --filter plitejs test -- test/react/surface-contract.test.tsx\` — 54/54 passed |
| W40 | \`test-commands.ts:394-401\` | list policy | Forward join from a paragraph into the first block of a multi-block nested list item preserves the remaining list structure. | Plate uses flat list-item properties rather than a nested multi-block list-item container. \`packages/platejs/src/features/list/lib/BaseListPlugin.ts:700-790\` | representation-rejected | Keep Plate's flattened list policy; do not manufacture a nested-container job. |
| W41 | \`test-table-correction.ts:29-45\`; \`test-table-commands.ts:83-145\` | table policy | Repair detects an uncovered interior slot under a rowspan, and row/column deletion leaves selection inside the surviving table. | Plate's grid scans every logical slot, repairs uncovered positions, and asserts surviving row/column selection. \`packages/platejs/src/features/table/lib/internal/grid.ts:236-246\`; \`packages/platejs/src/features/table/lib/BaseTablePlugin.merge.slow.tsx:238-370\` | covered | \`pnpm --filter platejs test -- src/features/table/lib/internal/mutation.spec.ts src/features/table/lib/BaseTablePlugin.merge.slow.tsx\` |`;

const coverageHeading = '\n\n## Coverage Search Evidence';
const coverageIndex = report.indexOf(coverageHeading);
if (coverageIndex < 0) throw new Error('Coverage heading missing');
let matrix = report
  .slice(0, coverageIndex)
  .replace(/^\| W(?:3[4-9]|4[01]) .*(?:\n|$)/gm, '');
report = `${matrix}\n${deltaRows}${report.slice(coverageIndex)}`;

replaceSection(
  '## Coverage Search Evidence',
  '## Skips and Negative Controls',
  `Current ownership was re-read from live source. The decisive searches covered
anchors and change mapping, transaction extension plus history, grapheme and
inline-void selection, decoration refresh and overlap, DOM bridge/anchor
mapping, browser soft-break geometry, and Plate table/list policy. Each new row
names its exact owner and focused execution route. No old plan is used as
current coverage evidence.`
);

replaceSection(
  '## Skips and Negative Controls',
  '## Next Slice',
  `| Source/family | Decision | Evidence |
| --- | --- | --- |
| \`generate.ts\`, \`schema.ts\`, \`tempview.ts\` | harness | Fixtures and runners assert no independent behavior. |
| Central-authority OT protocol | behavior skip | Plate collaboration is Yjs-backed; a second default protocol has no current job. |
| Ordered class-backed mark sets | mixed-row exclusion | Plite stores formatting as JSON leaf properties. |
| PointSet / RangeSet packed containers | mechanism rejection | Structural anchors already map paths, points, and overlapping ranges through canonical document changes. |
| MultiSet | hard rejection | It has no consumer or test, and \`MultiIterator.goto\` advances without comparing the requested position at \`../wordgard/src/editor/decoration.ts:1119-1125\`. |
| Widget class and node \`isInline\`/\`isBlock\` getters | mechanism rejection | React components and compiled schema own those local jobs. |

No complete test file is skipped, no product-shell file exists in the test tree,
and no uncertain classification remains.`
);

replaceSection(
  '## Next Slice',
  '## Harvest Closure Ledger',
  `Execution of [the Plite proof closure plan](../../plans/2026-09-02-wordgard-diff-proof-closure.md)
added all three tests and closed the one defect they exposed. History,
DOM/React, focused Chromium, live Browser, affected proof, and strict Chromium
are green. A Plate plan is not justified: table behavior is covered and the
list case assumes a model Plate does not use.`
);

replaceSection(
  '## Harvest Closure Ledger',
  '## Slice 11 Donor Closure',
  `| ID | Owner | Closure |
| --- | --- | --- |
| W34 | Plite anchors | Keep structural Anchor; reject packed linear stores. |
| W35 | Plite History | Exact transaction-extension undo/redo integration proof passes 12/12. |
| W36 | Plite DOM/core | Current grapheme, structural-boundary, and inline-void proof is stronger. |
| W37 | Plite React / Plate Comments | Current mapped sources and overlapping comment ranges cover the changed law; reject MultiSet. |
| W38 | Plite browser | Final-newline projection repaired; exact row passes five forced runs and strict Chromium. |
| W39 | Plite DOM/React | Composed nested-wrapper and inline-void anchor round trip passes 54/54. |
| W40 | Plate List | Reject donor nested-container semantics; retain flattened list ownership. |
| W41 | Plate Table | Current all-slot grid repair and post-delete selection proof cover it. |

The current harvest has no unowned invariant. All three proof adaptations pass,
and W38's bounded runtime repair passes focused, affected, and strict proof. All
donor mechanisms are either covered or explicitly rejected.`
);

replaceSection(
  '## Proof Honesty',
  '## Full Inventory Appendix',
  `- Fresh current Wordgard source passed its build, 594 Node tests, and 764
  Chromium tests in an isolated archive.
- The harvest did not rerun every Plate suite. \`Covered\` means exact live
  owners and assertions were verified in source; the affected and strict Plite
  gates passed.
- W38 is repaired and covered by package, Chromium, and live Browser proof. W39
  is covered by the new passing React contract.
- Wordgard's Chromium-only runner does not upgrade Plite cross-browser or
  physical-device claims.`
);

const appendixStart = report.indexOf('## Full Inventory Appendix\n');
if (appendixStart < 0) throw new Error('Appendix heading missing');
report = `${report.slice(0, appendixStart)}## Full Inventory Appendix

- [Full file inventory and classification](./inventory.md)
- [Complete source-declared test-name index](./test-index.md)
- Files found/classified: 29/29
- Portable: 15
- Portable-mixed: 8
- Plate-owned: 3
- Harness: 3
- Skip files / product-shell / uncertain: 0 / 0 / 0
- Runnable files read/indexed: 26/26
- Declared \`it(...)\` call sites indexed: 675
`;

for (const [before, after] of [
  ['packages/plite-react/test', 'packages/plitejs/test/react'],
  ['packages/plite-react/src', 'packages/plitejs/src/react'],
  ['packages/plite-history/test', 'packages/plitejs/test/history'],
  ['packages/plite-dom/test', 'packages/plitejs/test/dom'],
  ['packages/plite/test', 'packages/plitejs/test'],
  ['packages/plite/src', 'packages/plitejs/src'],
  ['packages/table/src', 'packages/platejs/src/features/table'],
  ['packages/list/src', 'packages/platejs/src/features/list'],
  ['packages/core/src', 'packages/platejs/src'],
  ['packages/yjs/test', 'packages/platejs/test/yjs'],
  ['@platejs/plite-history', 'plitejs'],
  ['@platejs/plite-react', 'plitejs'],
  ['@platejs/plite-dom', 'plitejs'],
  ['@platejs/plite', 'plitejs'],
  ['@platejs/table', 'platejs'],
  ['@platejs/list', 'platejs'],
  ['@platejs/core', 'platejs'],
  ['@platejs/yjs', 'platejs'],
]) {
  report = report.replaceAll(before, after);
}

for (const [before, after] of [
  [
    'test/history-contract.ts test/integrity-contract.ts',
    'test/history/history-contract.ts test/history/integrity-contract.ts',
  ],
  [
    'test/history-soak-contract.slow.ts',
    'test/history/history-soak-contract.slow.ts',
  ],
  [
    'test/history-persistence-contract.spec.ts',
    'test/history/history-persistence-contract.spec.ts',
  ],
  ['test/bridge.test.ts', 'test/dom/bridge.test.ts'],
  ['test/dom-coverage.test.ts', 'test/dom/dom-coverage.test.ts'],
  [
    'pnpm --filter plitejs test -- plite-string-coordinate-placement.test.ts',
    'pnpm --filter plitejs test -- test/react/plite-string-coordinate-placement.test.ts',
  ],
  [
    'pnpm --filter plitejs test -- rendered-dom-shape-contract.tsx',
    'pnpm --filter plitejs test -- test/react/rendered-dom-shape-contract.test.tsx',
  ],
  [
    'pnpm --filter plitejs test -- input-router-contract.test.tsx selection-reconciler-contract.test.tsx',
    'pnpm --filter plitejs test -- test/react/input-router-contract.test.tsx test/react/selection-reconciler-contract.test.tsx',
  ],
  [
    "`pnpm --filter plite test:plite-browser:chromium donor/examples/richtext.test.ts --grep 'syncs browser text mutations | generated mixed editing'`",
    "`pnpm --filter plite test:plite-browser:chromium donor/examples/richtext.test.ts --grep 'syncs browser text mutations'`; `pnpm --filter plite test:plite-browser:chromium donor/examples/richtext.test.ts --grep 'generated mixed editing'`",
  ],
  [
    '`pnpm --filter plitejs test`; `pnpm --filter plitejs test`',
    '`pnpm --filter plitejs test`',
  ],
]) {
  report = report.replaceAll(before, after);
}

report = report.replaceAll(
  'exec bun test --preload ../../config/plite-source-test-setup.ts test/',
  'exec bun test --preload ../../config/plite-source-test-setup.ts ./test/'
);

writeFileSync(reportPath, report);
