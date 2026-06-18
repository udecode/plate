# Huge Document Auto DOM Budget

## Objective

Make `domStrategy="auto"` bounded for huge documents. Explicit `staged` may
eventually mount the full native DOM, but `auto` must not silently background
mount tens of thousands of nodes.

## Completion

- `auto` on a large document uses a bounded effective strategy.
- explicit `staged` keeps staged DOM-present behavior.
- huge-document browser trace shows bounded DOM and responsive typing for
  `strategy=auto`.
- behavior gates for huge-document virtualized selection still pass.

## Evidence

- Baseline `strategy=auto` at 10k blocks fully mounted `40,626` status DOM
  nodes in about `1.39s`.
- Baseline 5k browser trace:
  - `auto`: 254 DOM nodes, 37ms type-to-paint while sampled before full
    background mount.
  - `staged`: 20,510 DOM nodes, 248ms burst-to-paint.
  - `../slate`: 20,136 DOM nodes, ~2s type-to-paint.

## Result

- `Editable` maps large `domStrategy="auto"` documents to bounded partial-DOM
  rendering instead of staged background materialization.
- Explicit `domStrategy="staged"` still owns eventual DOM-present coverage.
- The huge-document trace reports bounded native surface readiness separately
  from full native DOM completion, and prints per-surface metrics for `auto`,
  `staged`, and `virtualized`.
- Slate React docs describe `auto` as the bounded production default and
  `staged` as the explicit full-native-DOM tradeoff.

## Final Evidence

- Focused unit gate:
  `bun run test:vitest -- test/dom-strategy-and-scroll.test.tsx -t "auto keeps large documents DOM-bounded|staged DOM-present surfaces"`
  passed `2` tests.
- Focused browser gate:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "auto DOM strategy bounded|virtualized middle-block fast typing|downward drag selection autoscroll|blank-gap drag selection"`
  passed `4` tests.
- 5k/20-char browser trace:
  - `auto`: bounded `3/3`, timed out `0`, observed blocks p95 `50`, DOM nodes
    p95 `794`, heap p95 `17.36MB`, type-to-paint p95 `18.7ms`, burst per op p95
    `4.95ms`, long task p95 `0ms`.
  - explicit `staged`: complete `3/3`, DOM nodes p95 `20,510`, heap p95
    `77.63MB`, burst per op p95 `11.16ms`.
- 10k/20-char browser trace:
  - `auto`: bounded `3/3`, timed out `0`, observed blocks p95 `50`, DOM nodes
    p95 `1,193`, heap p95 `26.32MB`, type-to-paint p95 `26.1ms`, burst per op
    p95 `8.28ms`, long task p95 `0ms`.
- `bun run build` passed in `packages/slate-react`.
- `bun check` passed. It still reports the existing pagination hook dependency
  warning in `site/examples/ts/pagination.tsx`.

## Boundary

Do not make `virtualized` the public default. It remains explicit and
experimental. Do not break explicit `staged` semantics.
