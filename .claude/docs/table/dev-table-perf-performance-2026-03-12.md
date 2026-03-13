# dev/table-perf Performance Snapshot

## Environment

- Test time: 2026-03-12 21:46:54 CST
- Page URL: `http://localhost:3000/dev/table-perf`
- App: `apps/www`
- Commit: `98ae3116f`
- Browser: Playwright + Chromium `138.0.7204.15`
- Page accessibility check: confirmed `/dev/table-perf` loads via `agent-browser`

## Sampling Method

- Read `apps/www/src/app/dev/table-perf/page.tsx`, confirmed the page has two built-in tests:
  - Benchmark: `5` warmup + `20` measured remount iterations
  - Input latency: `10` warmup + `50` measured inserts
- Used `Large (1600)` preset, corresponding to `40 x 40`
- Click sequence:
  - `Generate Table`
  - `Run Benchmark (20 iter)`
  - `Test Input Latency (50 samples)`
- Metrics read from the page Metrics panel

## Results

### 40 x 40 (1600 cells)

| Category | Metric | Value |
| --- | --- | ---: |
| Metrics | Initial render | 1002.00 ms |
| Metrics | Re-render count | 3 |
| Metrics | Last render | 0.40 ms |
| Metrics | Avg render | 351.27 ms |
| Metrics | Render median | 51.40 ms |
| Metrics | Render p95 | 1002.00 ms |
| Benchmark Results | Mean | 841.44 ms |
| Benchmark Results | Median | 827.10 ms |
| Benchmark Results | P95 | 959.30 ms |
| Benchmark Results | P99 | 959.30 ms |
| Benchmark Results | Min | 804.00 ms |
| Benchmark Results | Max | 959.30 ms |
| Benchmark Results | Std Dev | 31.64 ms |
| Input Latency | Mean | 40.74 ms |
| Input Latency | Median | 38.70 ms |
| Input Latency | P95 | 52.70 ms |
| Input Latency | Min | 28.00 ms |
| Input Latency | Max | 61.60 ms |

## Conclusion

- The `40 x 40` remount benchmark is still in the high-cost range, with a mean of ~`841 ms`.
- The `40 x 40` input latency mean is ~`41 ms`, median ~`39 ms`, well below the `100+ ms` threshold where noticeable lag occurs.
- This snapshot is better suited for tracking large-table input performance; if the focus shifts to resize/hover interactions, a separate drag/hover profiling session is recommended.

## Interpretation Notes

- `Initial render`, `Re-render count`, `Last render`, and `Avg render / Median / P95` come from the left-side Metrics panel.
- `Benchmark Results` are the remount benchmark statistics.
- `Input Latency` results do not auto-clear when switching presets or clicking `Generate Table`; re-run after changing configuration.
