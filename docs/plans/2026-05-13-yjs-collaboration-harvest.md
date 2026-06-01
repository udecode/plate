# Yjs Collaboration Editor-Test Harvest Plan

> Sync note, 2026-05-18: current package planning lives in
> `docs/plans/2026-05-18-slate-yjs-package-readiness-ralplan.md`. This harvest
> remains the evidence inventory, not the current `slate-yjs` API decision.
>
> Sync note, 2026-05-24: keep using the stable harvest artifacts as the test
> corpus, but do not infer current API or package existence from this file.
> Current source truth is in the 2026-05-18 package-readiness ralplan refresh:
> `packages/slate-yjs` still lacks source, and the required execution work is
> package scaffold, full simulation example, package tests, and Playwright
> selection coverage.
>
> Sync note, 2026-05-28: this remains the harvested evidence corpus only. Live
> `../slate-v2` now has `@slate/yjs` package source. Current architecture and
> operation-matrix work lives in
> `docs/plans/2026-05-28-slate-yjs-current-architecture-operation-matrix.md`.

status: done
owner_skill: .agents/skills/editor-test-harvester/SKILL.md
report: docs/editor-test-harvester/yjs-collaboration/report.md
completion: active goal state

## Goal

Run a license-gated harvest of Yjs collaboration tests from `../slate-yjs`, `../lexical/packages/lexical-yjs`, `../y-prosemirror`, and `../yjs`; classify portable behavior, map it to Slate v2 and Plate owners, and leave report-only artifacts.

## Phases

- [x] Skill analysis and goal setup
- [x] Resolve target repos and license modes
- [x] Build exhaustive test inventories
- [x] Extract fixture/test names
- [x] Classify every row
- [x] Map behavior to Slate v2 and Plate owners
- [x] Write report, inventory, test-index, and completion state
- [x] Verify report sections and completion check

## Key Findings

- All four targets are MIT/permissive from local license evidence.
- `../lexical/packages/lexical-yjs` has no runnable test files under the harvester inventory pattern.
- Slate v2 already has strong raw collaboration substrate coverage in `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.
- Plate already has useful Yjs slow fixtures, but it can still profit from a compact adapter-conversion pack for unicode, marks, nested moves, split/merge/set-node, and cursor projection.

## Verification

- `rg -n "License Gate|Confidence Score|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" docs/editor-test-harvester/yjs-collaboration/report.md`
- `test -f docs/editor-test-harvester/yjs-collaboration/inventory.md`
- `test -f docs/editor-test-harvester/yjs-collaboration/test-index.md`
- `bun run completion-check -- --id 019e1c53-3e25-78c0-9083-355925be3817`
