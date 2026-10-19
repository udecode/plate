---
summary_version: 1
preserved_at: 2026-09-18
audit_id: editor-performance-research-iteration-2-2026-09-09
source_artifact: docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/report.md
source_sha256: 8b1ec10db3f199b60b56ecebead7ee51faa6b15824fde652032e4940b0ca8965
---

# Editor performance research, iteration 2 — preserved conclusion

Historical summary of the locally recovered report. The original artifact may
be absent from another checkout. Its SHA-256 binds this summary to the report
read during preservation, not to current product source or rerun proof.
The [audit registry](../index.json) retains the complete original provenance.

The September 9 research prioritized full-DOM mount and structural-edit
attribution, then decoration-manager setup/update cost. It rejected blanket
piece-tree replacement and a universal GPU rich-text renderer. No production
optimization was adopted by this research packet.

The nine-editor common fixture reported 945 cells: 933 passing, six unsupported,
and six failing. At 10,000 equal paragraphs, mount/split p95 were 528.3/95.7 ms
for Plite, 1,018.5/139.9 ms for Plate, and 51.9/11.0 ms for ProseMirror.
These are Chromium measurements for frozen bundles on the recorded M5 Max
host. Interaction clocks ended at a frame opportunity, not verified paint.
Source changes after freezing were accounted for separately.

The stronger final-state oracle excluded three rich-text comparison rows with
different outputs. Wordgard's failed macOS line navigation received no speed
rank; unsupported fixture HTML paths did not establish missing library support.
A piece-tree write-only win reversed when each edit materialized the full
string. Removing unused virtualization key copies matched 1,000 boundary cases
but remained an unadopted microbenchmark, not scroll/paint proof.

Reported breadth: 212 operations in 18 families, with only 34 matched timing
operations and 178 timing gaps. Plite Chromium had 743 passes/nine skips;
www had 110 passes, 18 reproduced correctness/fixture failures, and two skips.
Those www failures were not all confirmed product defects. Event Timing data
was diagnostic, not a benchmark for every case.

Two 100-row reference matrices each retained 96 insufficient-evidence rows.
Sixty-five earlier candidates were reconciled as 25 reaffirmed, 31 superseded,
and nine rejected. The 26 experiment dossiers yielded eight Pursue, 15 Defer,
and three Stop decisions; already adopted gains were not proposed again.

Raw devices, assistive technology, native-service behavior, equal-feature
origin/main comparisons, unrepresented product interactions, and remaining
operation timing stayed open. A passing command, matrix validator, or
deterministic counter did not close failed timing budgets. This preservation
did not re-execute measurements. See the durable
[experiment dossiers](../../plite/research/2026-09-09-editor-performance-iteration-2/experiments.md).

## Recorded reference pins

| Reference | Audited revision | Observed at |
| --- | --- | --- |
| wordgard | `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` | 2026-09-09T20:21:59.363224+00:00 |
| prosekit | `3fbfe7906c3448328e80c1c1333647d08e50907e` | 2026-09-09T20:21:59.363224+00:00 |

