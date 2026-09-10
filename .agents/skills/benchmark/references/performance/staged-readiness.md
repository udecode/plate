# Staged Readiness

Use this when startup, hydration, full-doc replace, or staged DOM-present
mounting is part of the plan.

## Rule

Separate `interactiveReady` from `nativeSurfaceComplete`.

Definitions:

- `interactiveReady`: active/corridor content is fresh and editable.
- `nativeSurfaceComplete`: all intended DOM is fresh for browser find, native
  selection, copy, and screen-reader traversal.

## Hard Rule

Missing far DOM during warmup may be acceptable. Stale old DOM exposed as current
content is not.

## Gate

- visible commit timing
- background completion timing
- max-latency budget
- stale DOM count
- pending group count
- materialization cost for far interaction
