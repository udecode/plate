# Feature Manifest

The plan owns one table with these exact rows:

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Package | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| React adapter | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Registry UI | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Composition | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Registry metadata/examples | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Docs | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Release artifacts | yes/no | owner | paths or N/A reason | consumer | command/audit or N/A reason | pending/complete/N/A: reason |
| Proof | yes | owner | commands/artifacts | maintainers | commands | pending/complete |
| Plate Next attestation | yes/no | owner | version/evidence plan or N/A reason | maintainers | validation or N/A reason | pending/complete/N/A: reason |
| Review/handoff | yes | owner | review/handoff evidence | user | review and goal checks | pending/complete |

Rules:

- `Applies` is `yes` or `no`, never `maybe`.
- A `yes` row names a real owner, artifact, consumer, and proof.
- A `no` row carries an explicit `N/A:` reason in Artifacts, Proof, and Status.
- Keep one table through every phase. Do not create separate package, UI, docs,
  or release status ledgers that can disagree with it.
- When Plate Next package review applies, the Package and Plate Next rows link
  to one subordinate `Package file evidence` section in the same plan. That
  section carries the required per-file checkboxes, score, verdict, owner,
  evidence, and next action. Its canonical file list and full package
  fingerprint must match `computePackageFingerprint` for the named package,
  with one unique score-100 review row per file. The Feature Manifest remains
  the sole cross-layer status source and becomes complete only after those file
  rows close.
- Status stays `pending` while work remains and becomes `complete` only after
  its proof is recorded.

Flow presets are classification aids, not generated schemas:

| Flow | Normally applies |
| --- | --- |
| new package | all rows |
| existing package plus React/registry | all rows except manual package shell |
| headless package | API, Package, Docs, Release, Proof, Attestation, Review |
| registry-only | Registry UI, Composition, Metadata/examples, Docs, Registry release, Proof, Review |

Choose the mode that matches the structural rows. API, docs, and release rows
may vary in non-new-package flows when their explicit evidence explains why.
