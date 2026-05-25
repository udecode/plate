# Interaction INP Matrix

Use this when a plan claims responsiveness from means, startup time, or one
happy-path benchmark.

## Rule

Track interaction-level p50/p75/p95/p99 latency by cohort and mode.

## Editor Interactions

- type
- select
- select then type
- select-all
- copy
- paste
- drag selection
- scroll to far group
- click far group then type
- open menu
- expand/collapse boundary
- materialize hidden content
- remote update

## Lab Proxies

When real INP is unavailable, record event-to-update and event-to-paint timings
with the same interaction names.

## Reject

- average-only tables
- startup-only wins as proof of editor responsiveness
- shell/virtualized wins without copy/paste/selection follow-up rows
