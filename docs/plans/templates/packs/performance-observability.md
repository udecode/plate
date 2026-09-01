# performance-observability pack

Use this pack when work can change latency, payload size, query count, database
access, cache/index behavior, runtime pooling, repeated-unit work, subscription
fan-out, background throughput, or scaling with data/document/DOM size.

For scale-sensitive API or architecture work, this pack starts before the
target is accepted. A proposed path that does not exist yet needs the smallest
disposable executable prototype able to falsify its scaling law. Paper
complexity, review scores, a future benchmark plan, and "measure during
implementation" do not count as proof.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | pending | pending |
| User-facing operation and runtime owner identified | pending | Name the route, procedure, job, query, command, editor action, or repeated unit and its current owner |
| Scale variables and cohorts fixed | pending | Record the independent size/fan-out/concurrency variables and normal, large, stress, and pathological cohorts that apply |
| Budget frozen before target measurement | pending | Use the owning budget or predeclare absolute and relative thresholds from baseline noise; do not loosen them after measuring |
| Baseline and target probe selected | pending | Name a comparable current-owner baseline and the executable target path or smallest disposable prototype |
| Correctness guard selected | pending | Name the behavior/native/data-integrity proof that must stay green |
| Production detector decision recorded | pending | Name the owning detector and privacy boundary, or record N/A |

Work Checklist:
- [ ] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [ ] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [ ] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [ ] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [ ] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [ ] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [ ] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [ ] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [ ] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [ ] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [ ] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [ ] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Pre-acceptance scale proof | pending | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | pending |
| Warm latency budget | pending | Prove the changed operation stays within its warm percentile budget using the owning harness | pending |
| Large/stress scaling | pending | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | pending |
| Cold and failure paths | pending | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | pending |
| Payload and fan-out | pending | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | pending |
| Production-path rerun | pending | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | pending |
| Correctness guard | pending | Run the selected behavior/native/data-integrity guard on the measured final path | pending |
| Before/after receipt | pending | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | pending |
| Detector and privacy | pending | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | pending |
| Performance regression check | pending | Run the deterministic performance harness and relevant checks in the owning workspace | pending |
