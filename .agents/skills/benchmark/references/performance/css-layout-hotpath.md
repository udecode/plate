# CSS And Layout Hot Path

Use this when interaction latency may come from selectors, layout reads, drag,
resize, overlays, selection geometry, or scroll.

## Rule

Hot editor surfaces should avoid expensive selectors and forced layout loops.

## Check

- broad descendant selectors in repeated units
- `:has(...)` in hot surfaces
- layout reads mixed with writes
- scroll/selection geometry reads during typing
- drag/resize state updated through React render loops
- overlays moved by layout-changing properties instead of transforms

## Preferred Shape

- data attributes/classes for hot state
- batched class/style writes
- GPU transforms for drag/resize/overlay movement
- measured layout read/write boundaries

Use Vercel `js-batch-dom-css` and `rendering-content-visibility` for micro
rules. This rule owns layout-hotpath proof.
