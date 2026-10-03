# performance-observability

Work Checklist:
- [ ] Measure the complete operation at baseline and the settled candidate with its owning latency budget, warm p95, cold duration, payload and query/fan-out evidence. During edits use affected checks; repeat full sampling only when implementation, workload, environment, instrumentation or a failed/noisy result invalidates it, or the explicit experiment requires more.
- [ ] Preserve the project's privacy and telemetry contracts; distinguish observed workload failures from synthetic instrumentation checks.
- [ ] Record comparable baseline/candidate inputs and artifacts, measurement noise, correctness checks, and the decision supported by the result.
- [ ] Add caches, pooling, indexes, or pagination only for a demonstrated bottleneck. Scheduling and tracker publication require their own authority.
