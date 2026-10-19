# Math Delimiter Trigger Roadmap Slice

## Goal

Promote math delimiter triggers into the active editor-behavior roadmap as one
explicit queued item instead of leaving them stranded as a parity-only backlog
bullet.

## Scope

This slice covers the markdown-sensitive math input-trigger family:

- `$` selection-wrap over an existing selection
- `$` pair-on-type at an empty insertion point
- `$$` block trigger / block detection
- boundary decision for `$$` plus `Enter` promotion

This is not a general math rendering or equation-feature lane.

## Why It Deserves A Real Roadmap Item

- the authority split already exists
- the behavior rows are already decomposed in research and spec guidance
- the work crosses more than one local seam:
  - math package
  - neighboring key/input behavior
  - editor-behavior law and protocol truth

That is too real to leave as an unnamed follow-up bullet.

## Inputs

- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [math-delimiter-trigger-audits-must-split-selection-wrap-pair-on-type-and-block-detection.md](docs/solutions/best-practices/math-delimiter-trigger-audits-must-split-selection-wrap-pair-on-type-and-block-detection.md)
- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)

## Proposed Queue Position

Put this immediately after Toggle Rewrite and before the broader date/media
expansion lanes.

Why:

- still a markdown-feature item
- narrower and more grounded than date/media expansion
- already has a clearer authority split than the wider date/media follow-up

## Exit

- the roadmap names math delimiter triggers explicitly
- the roadmap states that package/input ownership is row-split, not one fake
  global math-trigger winner
- parity stops being the only place that names the work

## Progress

- [done] Added the supporting roadmap slice doc.
- [done] Added the full implementation plan:
  [2026-04-10-math-delimiter-trigger-implementation-plan.md](docs/plans/2026-04-10-math-delimiter-trigger-implementation-plan.md)
- [done] Promoted math delimiter triggers into the canonical roadmap.
- [done] Promoted the same item into the active mirror implementation roadmap.
- [done] Updated parity wording so math triggers are no longer only a parity
  backlog bullet.
