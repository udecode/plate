# Browser Trace And Core Web Vitals Proof

Use this when load, hydration, network, layout, or page-shell startup is in the
claim.

## Rule

Separate page-load metrics from editor interaction metrics.

Page-load:

- TTFB
- FCP
- LCP
- TBT
- CLS
- Speed Index

Editor interaction:

- INP
- event-to-update
- event-to-paint
- selection repair
- follow-up typing
- paste/copy latency

## Trace Checks

- LCP breakdown
- render-blocking resources
- network dependency chains
- layout-shift culprits
- long tasks
- accessibility snapshot when native behavior is in scope

Do not prioritize a trace finding with zero estimated impact over a failing
editor interaction lane. Retrieve current web.dev / Chrome docs when exact
thresholds matter.
