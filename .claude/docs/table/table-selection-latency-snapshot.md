# dev/table-perf Performance Snapshot

## Environment

- Page route: `/dev/table-perf`
- App: `apps/www`
- Metric group: `Table Selection Latency`
- Table size: `40 x 40` (`1600` cells)
- Selected cells: `9`
- Injected delay: `0 ms`

## Results

### Baseline

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 425.00 ms |
| Table Selection Latency | Median | 424.60 ms |
| Table Selection Latency | P95 | 477.90 ms |
| Table Selection Latency | Min | 368.90 ms |
| Table Selection Latency | Max | 489.50 ms |

### Current

| Category | Metric | Value |
| --- | --- | ---: |
| Table Selection Latency | Selected cells | 9 |
| Table Selection Latency | Injected delay | 0.00 ms |
| Table Selection Latency | Mean | 174.62 ms |
| Table Selection Latency | Median | 174.00 ms |
| Table Selection Latency | P95 | 187.10 ms |
| Table Selection Latency | Min | 140.20 ms |
| Table Selection Latency | Max | 214.10 ms |

## Comparison

- Mean: `425.00 -> 174.62 ms` (`-250.38 ms`, `-58.9%`)
- Median: `424.60 -> 174.00 ms` (`-250.60 ms`, `-59.0%`)
- P95: `477.90 -> 187.10 ms` (`-290.80 ms`, `-60.8%`)
- Min: `368.90 -> 140.20 ms` (`-228.70 ms`, `-62.0%`)
- Max: `489.50 -> 214.10 ms` (`-275.40 ms`, `-56.3%`)
