# Rerun the bounded safety review

Verdict: **Pursue a shared private, role-aware Plate safety policy.** No universal URL ban. DOCX file import shares HTML mappings and an element guard, not the public HTML parser's whole-tree sanitizer.

From the repository root:

```sh
cd .
bun test ./docs/research/probes/2026-09-28-conversion-boundary/safety/probe.test.ts > docs/research/probes/2026-09-28-conversion-boundary/safety/probe.log 2>&1
```

Uses the existing root Bun source aliases, test tsconfig and Happy DOM preload. No build or install is required in the current checkout. JSZip resolves from its owning platejs package. The probe writes only `results.json`; the command writes `probe.log`, both here. Rerunning overwrites those two receipts.

Expected recorded baseline: **56 observations, 1 pass, 0 fail, 10 assertions**. Seven HTML safety exceptions are deliberately captured; the unsafe-image clipboard encoder also logs its expected error. Passing reproduces the observed defects—it does not certify safe conversion.

- [review.md](review.md): verdict, exact source paths/lines, ingress/egress and loss-policy findings, ownership alternatives and proof limits.
- [probe.test.ts](probe.test.ts): runnable fixtures and focused assertions, including real DOCX/Mammoth and retained-source export.
- [results.json](results.json): all named inputs' outcomes, documents, diagnostics, exported strings and relationships.
- Final command output recorded 56 observations, 1 pass, 0 fail and 10 assertions, including the expected clipboard encoding error.
- [source-identity.json](source-identity.json): bounded source and runner fingerprints captured after verification.
- Earlier setup/comparator receipts remain in ignored local storage, including four attempt logs and an initial 50-observation log; they are not required to reproduce the final probe.

Exact custom-path distinction: a DOCX parent paragraph mapping can read a descendant's unsafe href before the decoder reaches and drops that descendant. Public HTML removes the ordinary script href before the same mapping runs. HTML itself has a separate control-character gap: the AST pass misses a tab-obfuscated scheme and the real video figure mapping reads its child URL before the child guard. These are input-preparation/ordering gaps, not proof that arbitrary trusted plugin code is sandboxed. DOCX custom rendering and exact retained-source export also bypass semantic HTML's outgoing URL checks.

Only source/model/Happy DOM package behavior is proven; no native browser, Word, OS clipboard or script execution claim. No further investigation is needed for this bounded verdict.

## After adoption

The conversion boundary adoption closed every defect this probe reproduced. Its
assertions now pin the closed state: no path admits, keeps or writes a
script-capable URL, and each removal keeps its label, alt text or caption and
reports it. Rerun it without touching the baseline receipts:

```sh
PROBE_OUTPUT=results-after.json bun test ./docs/research/probes/2026-09-28-conversion-boundary/safety/probe.test.ts > docs/research/probes/2026-09-28-conversion-boundary/safety/probe-after.log 2>&1
```

Recorded on 2026-09-29: **56 observations, 1 pass, 0 fail, 27 assertions**
([results-after.json](results-after.json), with command output confirming 56 observations, 1 pass, 0 fail and 27 assertions).
`results.json` and `probe.log` stay the pre-adoption baseline; the unsafe-image
clipboard encoder still logs its expected error.
