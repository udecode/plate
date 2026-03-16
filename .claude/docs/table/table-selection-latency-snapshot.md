# dev/table-perf Performance Snapshot

## Environment

- Test date: 2026-03-15
- Page route: `/dev/table-perf`
- App: `apps/www`
- Sources:
  - User-provided Metrics panel values
  - Local browser verification after selection-state optimization
  - Additional user-provided measurement after selection-state optimization
  - Local browser verification after table-root DOM selection sync
  - Local browser verification after selection-query caching and store-backed selected-cell ids
  - User-provided measurement before DOM cell lookup caching
  - Local browser verification after DOM cell lookup caching and lower-cost selection simulator tracking
  - Local browser verification after table-grid lookup reuse and selection-edge cache cleanup
  - Local browser verification after deferring expanded selection toolbar mount
  - Local browser verification repeat run after deferring expanded selection toolbar mount

## Sampling Method

- Table size: `40 x 40` (`1600` cells)
- Metric group: `Table Selection Latency`
- Selected cells: `9`
- Injected delay: `0 ms`
- Result sources:
  - Left-side Metrics panel after running the selection latency flow
  - Local browser rerun on the same page and config
  - User rerun on the same page and config after the optimization

## Results

### User-provided reference measurement

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 425.00 ms |
| Table Selection Latency | Median | 424.60 ms |
| Table Selection Latency | P95 | 477.90 ms |
| Table Selection Latency | Min | 368.90 ms |
| Table Selection Latency | Max | 489.50 ms |

### Local verification measurement

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 139.95 ms |
| Table Selection Latency | Median | 137.90 ms |
| Table Selection Latency | P95 | 148.70 ms |
| Table Selection Latency | Min | 133.50 ms |
| Table Selection Latency | Max | 154.40 ms |

### User-provided post-optimization measurement

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 160.72 ms |
| Table Selection Latency | Median | 170.60 ms |
| Table Selection Latency | P95 | 196.30 ms |
| Table Selection Latency | Min | 122.00 ms |
| Table Selection Latency | Max | 204.60 ms |

### Local verification measurement after table-root DOM selection sync

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 143.54 ms |
| Table Selection Latency | Median | 146.00 ms |
| Table Selection Latency | P95 | 150.30 ms |
| Table Selection Latency | Min | 134.30 ms |
| Table Selection Latency | Max | 155.80 ms |

### Local verification measurement after selection-query caching

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 136.07 ms |
| Table Selection Latency | Median | 133.70 ms |
| Table Selection Latency | P95 | 144.80 ms |
| Table Selection Latency | Min | 129.50 ms |
| Table Selection Latency | Max | 150.20 ms |

### User-provided measurement before DOM cell lookup caching

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 157.29 ms |
| Table Selection Latency | Median | 171.70 ms |
| Table Selection Latency | P95 | 190.50 ms |
| Table Selection Latency | Min | 119.70 ms |
| Table Selection Latency | Max | 226.30 ms |

### Local verification measurement after DOM cell lookup caching

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 131.47 ms |
| Table Selection Latency | Median | 130.70 ms |
| Table Selection Latency | P95 | 142.50 ms |
| Table Selection Latency | Min | 115.50 ms |
| Table Selection Latency | Max | 142.60 ms |

### Local verification measurement after table-grid lookup reuse

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 135.57 ms |
| Table Selection Latency | Median | 134.30 ms |
| Table Selection Latency | P95 | 144.50 ms |
| Table Selection Latency | Min | 127.30 ms |
| Table Selection Latency | Max | 145.00 ms |

### Local verification measurement after deferring expanded selection toolbar mount

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 118.50 ms |
| Table Selection Latency | Median | 118.20 ms |
| Table Selection Latency | P95 | 119.70 ms |
| Table Selection Latency | Min | 116.20 ms |
| Table Selection Latency | Max | 130.30 ms |

### Local verification repeat run after deferring expanded selection toolbar mount

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 117.53 ms |
| Table Selection Latency | Median | 117.50 ms |
| Table Selection Latency | P95 | 119.20 ms |
| Table Selection Latency | Min | 116.30 ms |
| Table Selection Latency | Max | 119.90 ms |

## Conclusion

- The optimized `40 x 40` selection-latency verification on `/dev/table-perf` is currently landing in roughly the `117 ms` to `119 ms` mean range with `0 ms` injected delay after deferring expanded selection toolbar mount.
- The user-provided reference run on the same config was `425.00 ms` mean and `477.90 ms` p95.
- The latest user-provided run before DOM cell lookup caching measured `157.29 ms` mean and `190.50 ms` p95.
- The latest local verification after DOM cell lookup caching measured `131.47 ms` mean and `142.50 ms` p95.
- The latest local verification after table-grid lookup reuse measured `135.57 ms` mean and `144.50 ms` p95.
- The latest local verification after deferring expanded selection toolbar mount measured `118.50 ms` mean and `119.70 ms` p95, with a repeat run at `117.53 ms` mean and `119.20 ms` p95.
- This snapshot should be compared only against `Table Selection Latency` runs using the same page and selection config.

## Interpretation Notes

- `Selected cells` and `Injected delay` describe the selection simulation config used for the run.
- `Table Selection Latency` is wall time for the selection flow measured by the page's selection latency test.
- This snapshot records only the selection-latency path. It does not include remount benchmark or input latency numbers.
- The local verification measurement was taken after reducing full-array `selectedCells` subscriptions to selector-based lookups.
- The latest local verification measurement was taken after moving selected-cell highlighting to table-root DOM sync with id-diff updates.
- The most recent local verification measurement was taken after caching repeated selection queries and routing DOM sync and the dev harness through store-backed selected-cell ids.
- The latest local verification measurement was taken after caching table cell DOM lookups and removing extra selection-signature serialization from the dev harness.
- The latest local verification measurement was taken after reusing table grid lookups for merged selection range expansion and replacing string-based selection cache keys with direct selection references.
- The latest local verification measurement was taken after keeping the table anchor mounted but deferring expanded multi-cell toolbar content and merge-state work until the selection remains stable.
