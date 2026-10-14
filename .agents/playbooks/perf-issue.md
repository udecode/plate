---
extends: perf-issue, hillclimb
when: Use it to benchmark, profile or compare Plate or Slate speed, to find, explain or repair a performance regression or a lying benchmark, or for `benchmark [scope]` and `benchmark only <lane-or-target>`.
---

# perf issue

- **Before** "Capture a baseline trace via the matching driver skill": load `benchmark` and `verify`, record the exact workload, source/build identity, cohorts, frozen budget and correctness guard.
- **In** "Plan the fix from the trace": distinguish a red metric from a proven cause. Isolate one variable at the real owner before editing product code. The lead implements the accepted repair.
- **In** "Parse and compare the artifacts": replay matched baseline/candidate cohorts, native correctness and final production bytes. A noisy or inconclusive result stays open.
- **Before** "Ground the workload and architecture before choosing the metric": load `benchmark`; use the same workload, budget and correctness law for Hillclimb.
- **In** "Loop, one hypothesis per iteration": record every keep, revert or inconclusive attempt. A local win does not complete unrun applicable lanes.
- **Replace** "Run **Opening a PR**": close through project Delivery after writing, applicable review and final proof.
