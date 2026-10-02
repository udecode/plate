# Performance-evidence design checks

Date: 2026-09-30

This is source and design evidence for
[the plan](../../../plans/2026-09-30-performance-evidence-design.md).
It establishes no implementation, native interaction, benchmark result or
current runtime adoption.

## Source checks performed

A disposable Node check read the target registry and lab catalog and validated
the plan's local Markdown links and named source/test owners. It produced:

```json
{
  "valid": true,
  "localLinks": 5,
  "missingLinks": [],
  "checkedSourceOwners": 12,
  "missingSources": [],
  "census": {
    "targets": 55,
    "artifacts": 22,
    "shared": 17,
    "workloads": 11
  },
  "retired": [
    "core-query-ref-observation",
    "core-refs-projection",
    "issue-6038-transaction-execution",
    "core-transaction-current",
    "history-retained-memory"
  ]
}
```

A second check confirmed that all four distinct related live target IDs exist.
Importing the existing private exports from
`tooling/scripts/bench-targets.mjs` confirmed that
`buildTargetHistory`, `runBenchmarkTarget` and `validateRegistry` are functions
and that importing the module does not execute its guarded CLI. No process
runner or measured workload was called.

Source inspection confirmed the preserved plugin-graph, fit, schema-construction
and structural-comparison budgets. These are policy/source observations,
not measurements of whether the budgets pass.

The five-link count describes the earlier draft. The final plan adds this
evidence link; its final link and completion checks are closure commands.
Checks inspect actual file existence, not generated application behavior.

## Bounded independent review

The first worker hit a model-capacity error before returning review feedback.
A fresh worker with the inherited parent model reviewed the draft and source
read-only. This was one completed separate-context review, not a model panel.

It found one material P2 gap. The draft treated the existing Chromium correctness
spec as a matching oracle producer for the S5 matrix. Inspection of
`apps/www/tests/browser/markdown-streaming-contract.spec.ts` confirms:
- line 1203 skips the functional suite under `S5_BENCH`;
- lines 1246 and 1303 use the rich 6KB fixture for relevant reference checks;
- lines 1390–1399 select rich/CJK 10KB/50KB matrix cells;
- the matrix receipt at lines 1460–1488 stores an input-source hash, not a
  source-bound expected-output receipt.

The lead verified the finding and amended S3 explicitly. The existing producer
must create untimed reference-output evidence for the exact selected fixture,
size, composition and served role/build. The evaluator must reject unrelated
oracle bindings and common wrong hashes. Without matching evidence, correctness
is inconclusive. Existing 6KB/special-fixture test coverage is described at its
actual scope.

The review found no other material gap in its bounded scope. The lead also
made artifact writer ownership and persistence failure explicit. Neither the
worker nor the lead implemented or ran these future proof arrangements.

## Preservation and limits

The first ledger-record attempt was rejected as stale after concurrent edits
to `VISION.md` and `docs/vision/common.md`. The old Task routing reference
`.agents/rules/task/references/best-api-review.md` was also removed during that
maintenance. The current first-principles, acceptance, claim-width and private
scratch-storage laws were reread. They retain the chosen design; scratch/locks
are explicitly kept outside tracked benchmark history. Measurement sources and
feature fingerprints did not change in this comparison.

The original audit remains immutable with its original source fingerprints.
Its freshness can therefore be stale despite unchanged measurement sources.
The design outcome binds the reconciled current inputs. This does not refresh
an old run's source identity or create a new performance verdict.

The original audit report, probe and RESULTS remain the evidence for current
helper defects. Its positive control and counterexamples are reused; no fresh
workload ran. Original evaluator scripts, raw S5 matrices and historical
closure records were not rewritten.

Design completion is distinct from execution. The proposed helpers, oracle
producer, policy/receipt contracts and consumer migrations remain unimplemented.
Loaded-source coverage and Evidence Kit discovery are not certified.
Oxfmt and Oxlint exclude `docs/**`; no lint pass can be inferred for these
documentation files. The final scoped lint invocation checks that selection
boundary, and is not implementation proof.
