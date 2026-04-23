# Standalone Benchmark Gap Analysis

## Goal
Find why the richer standalone benchmark shows a Plate mount gap vs Slate and document the likely optimization seams in docs/performance.

## Phases
- [x] Read current benchmark/performance docs and prior learnings
- [x] Compare public harness vs standalone benchmark fixture/surface
- [x] Measure or reason down to the most likely hot seams
- [x] Write docs/performance findings and next optimization roadmap

## Notes
- Public docs harness and standalone lab are not the same benchmark surface
- Need evidence, not vibes
- Added standalone decomposition mount lanes:
  - plain/core
  - plain/basic
  - blockquote/core
  - blockquote/basic
  - code/core
  - code/basic
  - marks/core
  - marks/basic
  - list/markdown
- Current read:
  - plain/core-basic: same class, modest Plate tax
  - code/core-basic: Plate faster
  - blockquote/basic: red
  - heavy marks: very red
  - list markdown: red
