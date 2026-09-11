---
title: Code text ownership
type: decision
status: accepted
updated: 2026-09-11
review_scope: code
current_review: 2026-09-04-code-external-text
review_history:
  - ../review-records/2026-09-04-code-external-text.json
  - ../review-records/2026-09-05-code-native-plateau.json
source_refs:
  - ../../plans/2026-09-04-code-block-external-text-architecture-audit.md
  - ../../plans/2026-09-05-native-code-full-dom-investigation.md
related:
  - ../reviews.md#code
---

# Code text ownership

The retained design uses one newline-bearing Text for code content and
separate native and external renderers. The September 4 audit kept the narrow
external-text protocol and recommended removing whole-block Lowlight transport
from CodeMirror. Native highlighting, neutral annotations and native editing
retain independent jobs.

Current source has the [code-block owner](../../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts)
and [CodeMirror adapter](../../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts).
Their existence does not certify every recommendation or performance claim.

The full-native investigation stopped at its authorized plateau without a
certified timing gain. It retained event-only subscription repairs and
rejected speculative CSS/kernel changes. Do not combine those measurements
with external-renderer, minimal-engine or later full-product cohorts.

For another review, reconsider renderer ownership from the current native
editing jobs and reuse only matching source observations. A proposed speedup
needs an exact-source baseline and its actual token/rendering oracle.
[The ledger](../reviews.md#code) preserves both successful observations and
failed optimization attempts.
