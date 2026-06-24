# Browser Long-Task And Selection Oracle Research

Question: how should Plite improve browser long-task attribution and
selection/visual proof after the huge-document timer tail was fixed but one
fresh trace still showed a browser long task without Plite profiler ownership?

Scope:
- browser long-task attribution and benchmark honesty;
- reusable editor selection oracles: native selection, projected selection,
  no-double-highlight, drag/keyboard selection, DOM endpoint proof;
- prior art from official browser docs and editor OSS source/tests.

Exclusions:
- no runtime patch directly from web snippets;
- no raw mobile-device claim;
- no broad pagination architecture;
- no external issue-by-issue ledger.

Stop rule:
- stop this shard after at least one promoted Plite-native proof/benchmark
  packet or a clean negative result with next search angle.

Current local evidence gap:
- `model-owned-repair-selectionchange-skip-200k` fixed the stale selectionchange
  timer tail, but its first fresh trace had staged `typeAfterDelete` at
  139.8ms with one 119ms browser long task and no Plite profiler/timer duration.
- Repeats and Playwright route proof were green, so this is not a runtime revert
  signal yet. It is a benchmark-attribution gap if it repeats.

Expected promotion owner:
- benchmark harness repair -> `plite-ar-perf` / benchmark scripts;
- reusable browser proof helper -> `plite-browser`;
- local oracle addition -> `plite-patch` / `tdd`;
- architecture decision -> `plite-plan`.

Current verdict:
- kept `benchmark-longtask-claim-width`.
- `huge-document-browser-trace.mjs` now reports long-task attributed duration,
  unattributed duration, and attribution claim width for phase traces.
- Focused proof:
  `bun test ./packages/plite/test/core-benchmark-scripts-contract.ts`,
  `bun --filter ./packages/plite typecheck`, 200-block fresh trace smoke, and
  200k staged+virtualized trace.
- Latest 200k post-delete phase:
  staged `typeAfterDelete` 19.9ms, `undoType` 20.4ms, `undoDelete` 46.5ms;
  virtualized `typeAfterDelete` 19.9ms, `undoType` 21.1ms, `undoDelete` 54.7ms.
  Both post-delete type phases had `longTaskClaim=none`,
  `longTaskAttributedMs=0`, and `longTaskUnattributedMs=0`.
- Follow-up lane-level packet kept the same claim-width split for ordinary
  click/select/type lanes. Latest 200k lane trace reported global long-task p95:
  total 835ms, attributed 0ms, unattributed 835ms. That is a benchmark/browser
  claim-width warning, not proof of Plite-owned runtime work.
- Selection screenshot helper promotion kept:
  `attachPliteBrowserSelectionScreenshot(editor, testInfo, name)` now owns the
  repeated non-full-page visual selection screenshot pattern used by visual
  native selection and huge-document projected-selection rows.
