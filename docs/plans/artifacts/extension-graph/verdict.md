# Extension graph benchmark

Verdict: **adopt and keep**.

The benchmark compiles and repeatedly installs/removes descriptor DAGs at 10,
100, and 1,000 descriptors. Each repeated descriptor owns one required
predecessor edge and, after the first nodes, one branch edge.

The first stress run exposed repeated recursive expansion of shared
dependencies and exceeded 90 seconds. Expansion now visits each descriptor
once per candidate while retaining every direct owner edge. The same
1,000-descriptor cohort then completed with:

| Operation | p50 | p95 | Budget |
| --- | ---: | ---: | ---: |
| Cold transitive compile | 26.28 ms | 30.33 ms | under 1,000 ms |
| Dynamic root install | 27.11 ms | 30.68 ms | under 1,000 ms |
| Reverse cleanup | 97.94 ms | 98.47 ms | under 1,000 ms |

Across ten stress cycles, all 10,000 expected activations and cleanups ran
exactly once. Extension, descriptor, dependency-order, output, state, and
transaction registry records all returned to zero after every removal.

The machine-readable artifact is
[`benchmark.json`](./benchmark.json). The registered strict target is
`plite-extension-graph`; its primary metric is the worst p95 budget ratio,
measured here at 0.0985.

This is local runtime evidence. It does not claim RUM or user-device latency.
The degradation contract is explicit: configuration may scale with installed
descriptors, but removed roots retain no registry records.
