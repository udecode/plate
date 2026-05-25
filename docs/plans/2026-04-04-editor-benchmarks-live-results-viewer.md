# Editor Benchmarks Live Results Viewer

## Goal
Fix live-results composition in the editor-benchmarks viewer, keep fixture naming honest, and verify the browser surface.

## Phases
- [x] Search existing learnings and current viewer/data files
- [x] Fix live/seeding composition and fixture naming
- [x] Rebuild artifacts and verify browser/app shells

## Notes
- Work is primarily in ../editor-benchmarks
- Root app should stay viewer-only
- No new benchmark lanes until live results render cleanly
- Fixed the root viewer so live contract rows and snapshot rows render together instead of blanking the table.
- Renamed the fake `table-heavy-10k` fixture to `table-heavy-480-cells`.
- The contract runner now isolates each benchmark in its own page and has preview-target scripts.
- The contract runner now uses per-lane sample counts and timeout budgets for the heavy 10k lanes.
- Production preview runs are now completing cleanly.
- Current live rich-markdown snapshot:
  - Plate `03_mount-10k`: ~32301 ms
  - Slate `03_mount-10k`: ~438 ms
  - Plate `10_type-middle`: ~25 ms
  - Slate `10_type-middle`: ~26 ms
- So the viewer/runners are healthy now; the remaining problem is the actual Plate 10k mount surface on the richer markdown fixture.
