---
summary_version: 1
preserved_at: 2026-09-18
audit_id: rendering-api-editor-audit-2026-09-01
source_artifact: docs/plans/artifacts/rendering-api-editor-audit/audit-report.md
source_sha256: 130db045e75c69d7ee87e06daa8c9ebed18cabff8eb4469442491fe6fb4c5686
---

# Rendering API audit — preserved conclusion

Historical summary of the locally recovered report. The original artifact may
be absent from another checkout. Its SHA-256 binds this summary to the report
read during preservation, not to current product source or rerun proof.
The [audit registry](../index.json) retains the complete original provenance.

The September 1 audit recommended source-owned decoration descriptors with keyed,
data-only range attributes and explicit observation/cleanup. It separated range
paint, positioned UI, durable anchors, and application data. CommentsPlugin
retained editor projection ownership; applications retained threads and persistence.

The audit rejected arbitrary transient segment rendering, a public generic
Projection API, raw Plate render/decorate/provider-store props, and a generic
Plite view plugin. It also reversed an earlier proposal to remove CommentsPlugin:
that would make copied UI rebuild editor projection. These are the original
decision's boundaries, not a statement that its proposed spelling is today's API.

Reported coverage: 17 references and 85 atomic rows, including 15 pinned local
repositories and two platform references. Four frozen scale cohorts passed the
audit's budgets; the pathological cohort reduced retained subscriptions from
320,000 to 10,032. Mount p95 increased from 58.256 to 68.065 ms within those
budgets while full reads improved from 12.604 to 2.865 ms. This is a captured
manager experiment, not an end-to-end editing or universal performance claim.

Execution required the applicable package, docs, and browser gates before
Comments adoption. This preservation pass did not execute those gates or
reconcile later API revisions. Use the current feature review for adoption.

## Recorded reference pins

| Reference | Audited revision | Observed at |
| --- | --- | --- |
| prosemirror | `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc` | 2026-09-01T12:29:16Z |
| lexical | `aca121666bf788fa9dcd592973cd089214a10365` | 2026-09-01T12:29:16Z |
| tiptap | `92c6d734dc895a20dd34350bd14feba3862bf31e` | 2026-09-01T12:29:16Z |
| pretext | `ac49b09b7d83ede19581fa94a8b892b07d309baf` | 2026-09-01T12:29:16Z |
| premirror | `29b78634d6496206c84015068eb7d66d9cdc312c` | 2026-09-01T12:29:16Z |
| portable-text | `d17f7289b7063d805c7e39d8620f5e89029d395e` | 2026-09-01T12:29:16Z |
| slate | `72a37c701e5da4bb13a305d416d9c070d19d3a45` | 2026-09-01T12:29:16Z |
| edix | `528ec15113790a977e35614c3a5f56395d46819e` | 2026-09-01T12:29:16Z |
| use-editable | `008a0b51a9bc7c9812fe74633b4117bd74477627` | 2026-09-01T12:29:16Z |
| rich-textarea | `9652cad73dc26f92be3aec1c5127384595b7fb4a` | 2026-09-01T12:29:16Z |
| markdown-editor | `c75679cc361867112339b722e65dd43c52329fc7` | 2026-09-01T12:29:16Z |
| urql | `1eb11fcd68cc13d413f42e34a49c798dd97a7506` | 2026-09-01T12:29:16Z |
| tanstack-db | `68366ecaeef6c12a13402b558bd4a68d7519442f` | 2026-09-01T12:29:16Z |
| vscode | `df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b` | 2026-09-01T12:29:16Z |
| language-server-protocol | `8c26a839f86296448692b414cb35c0a8fbabe0e5` | 2026-09-01T12:29:16Z |
| edit-context | Platform URL/body snapshot; see original index reference | 2026-09-01T12:29:16Z |
| open-ui-richer-text-fields | Platform URL/body snapshot; see original index reference | 2026-09-01T12:29:16Z |

