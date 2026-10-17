# Performance evidence

A stored success label does not prove correct output, complete observations, current source or acceptance. Each target has one latest receipt of what ran, whatever the outcome; the lab admits each artifact once as current, stale or unknown from the inputs its producer recorded; and one S5 evaluator applies frozen no-regression and 1.20 work-gain policies. The 2026-10-04 audit found this live and stopped; every remaining gap is a calibration or coverage follow-up the execution plan owns ([triage audit](../2026-10-04-ledger-triage-audit.md), [design](../2026-09-30-performance-evidence-design.md), [execution](../2026-09-30-performance-evidence-execution.md), [review report](../../research/probes/2026-09-30-performance-review/REPORT.md)). `node tooling/scripts/review-ledger.mjs show performance` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Targets | One target authority, one recipe per command; recipes keep inline environment assignments, the receipt records each verbatim, and the runner strips every recipe-named variable from the inherited environment. |
| Receipts | A latest receipt for every run, failures included; a failed latest run shows its failure stage, not older values. Original receipts and archived verdicts stay. |
| Admission | At the existing loader, from `sourceIdentity.measuredInputs` plus served-build identity for browser producers. Only current rows read `ok` or count as coverage. A producer that records nothing stays unknown. |
| Producers | Write measurements before validating. |
| Evaluator | One S5 evaluator; both arms share one preflight reference, so a candidate that renders different text fails correctness. Threshold rows use the comparison operator the producer records. |
| Research reuse | Read the candidate dossier and receipt from `node tooling/scripts/review-ledger.mjs research <term>` before a new investigation. Budget failures stay failures, incomparable hosts stay incomparable, and distinct profile policies, 1.20 and 1.25, stay distinct evidence. |
| Benchmark law | The Benchmark skill keeps receipt, paired comparison and adoption laws. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A universal benchmark platform or public profiling API | No demonstrated job. |
| Immutable attempt history and two policies kept only to regrade archives | No reproduced defect needed them. |
| A complete loaded-source protocol and reference production inside the timed producer | Same; the cuts review removed them. |
| One shared target environment map | One correctness recipe smoke-runs its producer with values its benchmark must not inherit. |

## What other editors do

Not compared; this scope is the repository's own measurement owners.

## Main changes

- False-positive S5 verdicts and mixed-source aggregation are gone; the `core-node-transforms` guard exposed a `tx.nodes.wrap` root-path regression, fixed.

## Open work

- 17 of 20 lab artifacts come from producers that record no inputs and stay unknown. owner: the execution plan. stop: those producers record inputs.
- The native code-block renderer exceeded its absolute input and navigation budgets on a shared host without a matched baseline. owner: the execution plan. stop: a matched run.
- The 1.20 attribution guard sits within the noise of identical builds (1.1991). owner: the execution plan. stop: a recalibrated guard.
- A variable a producer reads but no recipe names can still come from the caller's shell. owner: the execution plan. stop: producers declare what they read.
