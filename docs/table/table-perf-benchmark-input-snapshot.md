# dev/table-perf Performance Snapshot

## Environment

- Test time: 2026-03-12 21:46:54 CST
- Page URL: `http://localhost:3000/dev/table-perf`
- App: `apps/www`
- Commit: `98ae3116f`
- Browser: Playwright + Chromium `138.0.7204.15`
- Page accessibility check: confirmed `/dev/table-perf` loads via `agent-browser`

## Sampling

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
