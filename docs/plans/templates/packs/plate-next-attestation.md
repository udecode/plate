# plate-next-attestation pack

Use this pack when a Plate feature changes or creates a package that needs a
current Plate Next review. Reuse the plan's Feature Manifest; do not create a
second package ledger.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Package review applies | pending | pending |
| Starting doctrine/package version recorded | pending | pending |
| Feature Manifest reused | pending | pending |
| No mass-attestation acknowledged | yes | pending |

Work Checklist:
- [ ] Link the Feature Manifest's Package and Plate Next rows to one subordinate
      `Package file evidence` section in this plan.
- [ ] Record one checkbox per package file with score, verdict, owner, evidence,
      and next action; check only score-100 rows.
- [ ] Record the package slug, exact unique source manifest, file count, and
      full fingerprint from `computePackageFingerprint`.
- [ ] Run the full current package review and focused package proof.
- [ ] Close P1 package review findings.
- [ ] Update `check-core` enrollment only for a genuinely completed new package.
- [ ] Advance only the reviewed package after all evidence exists.
- [ ] Point the package registry entry to this exact plan, latest doctrine
      version, and authoritative fingerprint before the feature checker runs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package review | pending | Complete current Plate Next package review | pending |
| Source fingerprint | pending | Record final package fingerprint | pending |
| Version validation | pending | Run Plate Next validate/status/check | pending |
| Attestation | pending | Advance only the proven package or record N/A reason | pending |
