# performance-observability pack

This is a project-owned plan template. Copy it to `docs/plans/<date>-<slug>.md` and fill its `{{…}}` placeholders. The pstack block in `AGENTS.md` governs timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

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

- [ ] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [ ] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
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
