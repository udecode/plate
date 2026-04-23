# Marks Basic Composition Batch

## Goal

Take a bigger cut at the remaining `48_mount-10k-marks-basic` red lane without
another plugin-by-plugin detour.

## Current hypothesis

The remaining marks tax is broad per-leaf runtime overhead in the shared render
path, especially:

- `Object.keys(leaf)` / `Object.keys(text)` on every render
- `flatMap(...)` allocation on every render
- `sort(...)` on every render

That work happens across tens of thousands of leaf renders in the standalone
marks fixtures, so even "small" per-render overhead is now the bill.

## Batch

1. Remove per-render key enumeration and sorting from the shared leaf/text
   render pipes.
2. Keep plugin order stable by iterating the already ordered plugin arrays.
3. Verify package tests/build/typecheck.
4. Rerun the marks-heavy standalone lanes and keep the cut only if it wins
   cleanly.

## Acceptance

- No behavior regression in `pipeRenderLeaf` / `pipeRenderText` tests.
- Fresh same-turn benchmark evidence on the marks lanes.
- Keep only if the aggregate marks lane improves without a stupid trade.

## Outcome

Kept.

The useful version is the hybrid activation scan:

- first detect whether the current leaf/text node owns any relevant mark keys
- then walk the already ordered simple/complex mark arrays

That avoids per-render `Object.keys(...).flatMap(...).sort(...)` churn on
marked leaves without making plain leaves pay the full simple-mark loop.

Focused reruns on the kept path:

- `48_mount-10k-marks-basic`: `1244.70 ms`
- `86_mount-10k-bold-basic`: `557.20 ms`
- `90_mount-10k-bold-single`: `399.90 ms`
- `91_mount-10k-italic-single`: `388.30 ms`
