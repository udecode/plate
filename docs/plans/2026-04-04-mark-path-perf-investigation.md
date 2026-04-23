# Mark Path Perf Investigation

## Goal

Find the exact cause of the standalone rich-markdown mark mount gap versus Slate, with measured evidence strong enough to justify the next optimization cut.

## Scope

- Standalone benchmark lab under `benchmarks/editor`
- Plate mark-heavy mount lanes
- Shared marked-leaf render/mount path
- `BasicMarksPlugin` fan-out versus single-mark cost

## Current Facts

- Generic core mount is not the main red lane.
- Code-heavy mount is fine.
- List-heavy and mark-heavy lanes are red.
- `BasicMarksPlugin` bundle adds real extra tax.
- Single-mark rows are still red, so bundle tax is not the whole story.
- Earlier speculative fast-path edits were reverted because they did not produce a clean measured win.
- The bold leaf DOM shape is already basically the same between Plate and Slate.
- The remaining mark gap is runtime work, not extra leaf DOM.
- The kept cuts key `pipeRenderLeaf(...)` and `pipeRenderText(...)` by active mark.

## Phases

1. Re-read prior perf learnings and current standalone gap docs. Completed.
2. Inspect current mark render path and benchmark harness state. Completed.
3. Add the next benchmark seam that isolates shared marked-leaf mount cost more directly. Completed.
4. Run focused benchmarks and targeted tests. Completed.
5. Write the exact finding and the next optimization target. Completed.

## Errors / Dead Ends

- Earlier `pipeRenderLeaf` fast-path tweaks were noisy or regressive.
- Changing simple marks to `isDecoration: false` regressed mark lanes.

## Deliverable

- Exact cause statement grounded in benchmark rows and trace counters.
- Updated docs under `docs/performance/`.

## Final Finding

- `BasicMarksPlugin` was still paying inactive bundle fan-out on both the leaf and text paths.
- After removing that wasted work, the remaining bold gap is the shared active mark runtime in `pipeRenderLeaf(...)` / `pluginRenderLeaf(...)`.
- The direct lower-bound row proves the raw marked-leaf DOM mount floor is already fine.
