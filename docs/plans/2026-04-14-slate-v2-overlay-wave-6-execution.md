---
topic: slate-v2-overlay-wave-6-execution
date: 2026-04-14
---

# Goal

Close the next honest Wave 6 gap in the locked decorations / annotations plan
without pretending the whole wave is blank if the code already covers part of
it.

# Scope

- Wave 6 only
- Huge-document and React 19.2 scheduling posture
- Benchmark and example truth before architecture churn

# Loaded Skills

- `ralph`
- `major-task`
- `planning-with-files`
- `learnings-researcher`
- `performance-oracle`
- `react`

# Constraints

- Use the locked plan as execution authority
- Prefer the smallest durable fix over benchmark theater
- Keep visible editor state urgent
- No transitions around live input, caret, selection, or immediate visible
  overlay truth
- `Activity` is only for hidden panes or offscreen surfaces

# Phases

- [x] Load skills and execution rules
- [x] Create Ralph context snapshot
- [x] Audit current Wave 6 benchmark/example reality
- [x] Implement the smallest honest Wave 6 slice
- [x] Verify, architect-review, deslop, rerun, and clean state

# Findings

- Wave 6 in the plan is about scale proof, not new public nouns
- Prior learnings already say rerender breadth is mostly local and `useSlate()`
  is the last intentionally broad hook
- Large-document shell work already split local DOM truth from whole-doc
  model-driven ops
- The likely remaining gap is policy and proof around overlays under
  huge-document pressure, not a blank runtime
- Audit result: the kept huge-document and rerender-breadth lanes existed, but
  they did not prove overlay toggles, hidden-pane `Activity`, or large-doc
  sidebar behavior
- Smallest honest closure is:
  - add one minimal overlay harness to `site/examples/ts/huge-document.tsx`
  - extend `scripts/benchmarks/browser/react/rerender-breadth.tsx`
  - add one new browser lane:
    `scripts/benchmarks/browser/replacement/huge-document-overlays.mjs`

# Progress

## 2026-04-14

- Started Wave 6 under Ralph
- Loaded the relevant skills and repo rules
- Read the Wave 6 section of the locked plan
- Read the key large-document and rerender-breadth learnings
- Created the Wave 6 Ralph snapshot in `.omx/context/`
- Implemented the huge-document overlay harness, the rerender-breadth overlay
  locality rows, the new browser overlay lane, and the benchmark command/docs
- Verified:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate-react`
  - `pnpm typecheck:site`
  - `pnpm lint:fix`
  - `pnpm bench:react:rerender-breadth:local`
  - `pnpm bench:replacement:huge-document:local`
  - `pnpm bench:replacement:huge-document:islands:local`
  - `pnpm bench:replacement:huge-document:overlays:local`
- Architect review: `APPROVED`
- Deslop result:
  - removed unnecessary bookmark state in `huge-document.tsx`
  - reran the huge-document benchmark package after the cleanup

# Errors

- The learnings skill expects `docs/solutions/patterns/critical-patterns.md`,
  but that file does not exist in this repo
- `pnpm bench:replacement:huge-document:history:local` is still blocked by a
  legacy-example mismatch: `/Users/zbeyens/git/slate/site/examples/ts/huge-document.tsx`
  does not expose the current-only history controls that the compare lane
  expects; this is non-blocking benchmark-infra debt, not Wave 6
  architecture debt
