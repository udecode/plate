# DOCX interoperability OSS research

Status: Research and final adversarial reassessment complete; canonical records and validation receipt are linked below.

Question: Which laws should DOCX import, export and Word paste share, and which fidelity boundaries must be explicit?

Scope: `documents`; current Plate source and seven bounded source families: Mammoth, html-to-docx, docx, docx-preview, CKEditor 5, SuperDoc, and Pandoc. Compare semantic conversion, direct OOXML mapping, document preservation, Word HTML paste, comments/revisions, external resources, and diagnostics. Other feature reviews stay separate.

Stop rule: finish official discovery and strongest relevant source reads for each corpus, reconcile current owners and prior decisions, then record one evidence-backed Stop/Pursue/Defer assessment. No exhaustive repository audit, universal state-of-the-art ranking, native Word certification or downstream implementation is claimed.

Verdict: **Pursue** Task design/planning. Use one canonical import result and
one projection-aware snapshot export; delete competing sidecar authority,
parallel review serialization, file-import RTF, and the duplicate authored
exporter. Rename the clipboard-only plugin for Word paste, add structured
diagnostics and bounded input policy, and compare direct OOXML with the
repaired HTML path before selecting a runtime. Keep Word paste and file I/O as
distinct jobs.

Local evidence gap: prior September 8 work settled dependency and plugin boundaries while preserving algorithms. It did not compare the information retained by semantic HTML and native OOXML pipelines against current document-editor prior art.

Artifact: `docs/plite/research/2026-09-14-docx-interoperability-oss/`. Ledgers retain exact revisions, reads, deduplication and corpus dispositions. External clones live beside Plate; no third-party source is copied into the compiled wiki.

## Results and evidence

- Seven repository families discovered and inspected at exact current default-branch revisions; 67 selected current external files including licenses/metadata, plus 10 main current Plate/runner read receipts and the broader Plate sidecar. This is bounded strongest-source investigation, not exhaustive source coverage.
- Six corpus dispositions are evidenced for their scoped jobs; SuperDoc retains an evidence gap for its proprietary current engine. CKEditor's proprietary file converters are also outside its evidenced OSS paste lane.
- Ten semantic leads; eight promoted for design/proof, one no-code boundary decision, one deferred. Six explicit rejection/deduplication rows; nine promotion rows across five packets. The earlier no-universal-rich-AST rejection was reused with current support.
- Zero upstream issue bodies, PR bodies or comments read; zero upstream tests or benchmarks executed. Eight web queries plus official repository/commit/release metadata supplied discovery, not unverified implementation conclusions.
- Main replayed 123 existing package tests and two historical bug probes. A worker observed 12 additional fixture/demo tests. Do not count its duplicate 123-test run as extra coverage.
- All ten documents census units are mapped. Other feature reviews, including skipped `diff`, remain independent. Inventory refresh only reconciles current fingerprint observations; it does not refresh unrelated reviews or proof.

Start with the [current decision](../../../research/decisions/documents-conversion-fidelity.md),
[compiled OSS comparison](../../../research/sources/docx-interoperability-oss.md),
[open questions](../../../research/open-questions/documents-conversion-proof.md),
and the [final review record](../../../research/review-records/2026-09-14-documents-final-reassessment.json).

Detailed receipts:

- [Corpus dispositions](corpus-ledger.tsv), [repositories](repo-registry.tsv),
  [queries](query-ledger.tsv), [actual reads](read-log.tsv), and
  [exact source manifest](source-manifest.json).
- [Leads](lead-ledger.tsv), [rejections/deduplication](rejected-ledger.tsv),
  [promotions](promoted-ledger.tsv), and [owner packets](promotion-packets.md).
- [Current Plate audit](shards/plate-audit.md),
  [final adversarial reassessment](shards/final-reassessment.md),
  [CKEditor/SuperDoc](shards/ckeditor-superdoc.md), and
  [Pandoc/docx-preview](shards/pandoc-preview.md).
- [Proof receipt](proof/receipt.json) and
  [historical bug observations](reproductions/sidecar-authority.spec.ts).
- [Artifact validation](validation.json): selected-file hashes, TSV structure,
  corpus dispositions and local links.

To recover an external read whose checkout remains older:
`git -C <manifest-local-path> show <full-commit>:<repo-relative-file>`.
Hashes describe full original file bytes; listed spans describe actual reading.
The raw evidence owner also records these clones at
`../raw/docx-interoperability/sources-2026-09-14.json` and `../raw/log.md`.

Next: `$task design plan documents: one canonical DOCX result, one snapshot export, explicit fidelity, and bounded input`.
That downstream lifecycle was not started. Product, skills, doctrine and public
docs were not changed. Native Word/browser interoperability, complete slow-suite,
current packed dependencies and performance remain unproved.

Closing freshness: concurrent authored-guide and Plate-doctrine edits made the
initial immutable review stale after recording. Relevant guidance was reread;
the final superseding review captures the current local source and is matching.
[Exact earlier changed inputs and disposition](post-record-freshness.json)
preserve that distinction.
