# Production RUM Dashboard

Use this when a performance claim matters beyond local benchmarks.

## Rule

Design the dashboard even if production telemetry is not available yet. Mark it
as a proof gap instead of pretending lab benchmarks are enough.

## Required Tags

- interaction name
- cohort
- document size
- visible DOM count
- hidden boundary count
- decoration/comment/annotation count
- custom renderer flags
- mode: off, auto, DOM-present, shell, staged
- mobile/browser/IME
- release/version

## Metrics

- p50/p75/p95/p99 interaction latency
- JS heap
- DOM node count
- mounted group count
- listener count
- cached index sizes
- React scheduler priority
- component render/mount counts where available

## Dashboard

Datadog or equivalent should answer:

- which cohort regressed
- which interaction regressed
- which mode regressed
- which memory bucket grew
- which release introduced it
