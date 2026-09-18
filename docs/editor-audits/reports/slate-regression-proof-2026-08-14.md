---
summary_version: 1
preserved_at: 2026-09-18
audit_id: slate-regression-proof-2026-08-14
source_artifact: docs/plans/artifacts/slate-regression-proof-audit/audit-report.md
source_sha256: 1dee0158e2218bf84ab059df6fca385e6b1ccbe3c1f7d17ad147373a85c33344
---

# Slate regression-proof audit — preserved conclusion

Historical summary of the locally recovered report. The original artifact may
be absent from another checkout. Its SHA-256 binds this summary to the report
read during preservation, not to current product source or rerun proof.
The [audit registry](../index.json) retains the complete original provenance.

The August 14 audit accepted one material candidate: recursive equality of
nested JSON-array members. It retained the current transaction owner, explicit
property removal, and semantic command APIs. Hyperscript reference helpers stayed
deferred; native insertText and mobile/composition reports required reproduction.

The historical 1,120-file audit belonged to a fork, not upstream main. Its file
set matched two fork commits and could not identify one upstream cursor. The
new registration used upstream main at the pin below without reinterpreting
that older result. Reviving the fork batching implementation was explicitly
rejected unless an equivalent-workload experiment established a current gain.

Reported evidence: 16 atomic concept rows; 1,136 upstream test-tree files with
1,254 derived runnable test identities; 54 changed issue/PR threads with no
unchecked rows. A registered local transaction benchmark reported median and
p95 ratios of 0.714 and 0.828 with one publication. The inventory did not execute
all upstream test identities against Plite.

The audit stopped at a planning candidate. Open PR behavior, raw Android/iOS
composition, and the broad PR #6003 public API shape remained unproved.
Historical covered rows and tracker timestamps do not certify today's source
or live GitHub state. No product or upstream replay ran during preservation.

## Recorded reference pins

| Reference | Audited revision | Observed at |
| --- | --- | --- |
| https://github.com/ianstormtaylor/slate.git | `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` | 2026-08-14T12:34:41Z |

