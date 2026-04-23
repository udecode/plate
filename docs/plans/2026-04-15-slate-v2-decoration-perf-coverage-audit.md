---
date: 2026-04-15
topic: slate-v2-decoration-perf-coverage-audit
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Answer the blunt perf question for the decoration / annotation lane:

- do we already have heavy benchmark coverage
- if not, add the smallest honest missing perf lane

# Scope

- overlay-specific perf proof only
- current `slate-v2` evidence and commands
- docs truth if the coverage read changes

# Loaded Skills

- `major-task`
- `learnings-researcher`
- `planning-with-files`
- `performance-oracle`
- `task`

# Phases

- [x] Load skills and repo rules
- [x] Audit current overlay perf lanes and owning docs
- [x] Decide whether current coverage is enough
- [x] Add and run missing benchmark coverage if needed
- [x] Summarize the perf read and remaining gaps

# Findings

- `docs/solutions/patterns/critical-patterns.md` is missing in this repo
- overlay-specific lanes already exist in:
  - `pnpm bench:react:rerender-breadth:local`
  - `pnpm bench:replacement:huge-document:overlays:local`
- current docs claim:
  - rerender breadth covers overlay-source toggle locality
  - rerender breadth covers hidden-pane `Activity` resume behavior
  - huge-document overlays covers overlay toggle, sidebar hide/show, and type-after-overlay / type-after-show
- there is no remaining decoration-lane perf debt after this pass; the bogus
  browser huge-document history compare row was later cut because legacy
  huge-document was never a history surface
- current perf coverage was real but not heavy enough before this pass:
  annotation-backed widget churn had correctness proof, but not perf-lane
  ownership
- the smallest honest gap-fill was to extend rerender breadth with one
  annotation-backed widget rebase row instead of inventing a whole new
  benchmark family
- fresh same-turn rerender-breadth result:
  - annotation projection rerenders: `1`
  - annotation sidebar rerenders: `1`
  - annotation widget rerenders: `1`
  - edited left text rerenders: `1`
  - unrelated right text rerenders: `0`
  - edit mean: `0.29ms`
- fresh same-turn huge-document overlay rerun:
  - overlay toggle mean: `98.12ms`
  - hide/show sidebar means: `97.46ms` / `77.45ms`
  - type-after-overlay mean: `15.4ms`
  - type-after-show mean: `14.54ms`
  - overlay count: `2`
- the browser overlay lane flaked once on warmup with a missing `#v2-huge-blocks`
  locator, then passed on immediate warm-cache rerun; that smells like
  benchmark readiness noise, not a broken example

# Progress

## 2026-04-15

- started the overlay perf coverage audit
- loaded the relevant skills
- read the existing overlay perf docs, benchmark scripts, and prior learning
- added an annotation-backed widget breadth row to
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- verified:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm bench:react:rerender-breadth:local`
  - `pnpm bench:replacement:huge-document:overlays:local`
- updated the perf control docs with the new locality row and fresh overlay
  numbers
- compounded the gap as a reusable workflow learning in
  `/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-15-overlay-perf-coverage-must-include-annotation-widget-churn.md`

# Errors

- first same-turn run of `pnpm bench:replacement:huge-document:overlays:local`
  hit a readiness flake: `expect(locator('#v2-huge-blocks')).toHaveValue("1000")`
  failed once during page warmup
