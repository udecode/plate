---
title: Code text ownership
type: decision
status: accepted
updated: 2026-09-22
review_scope: code
current_review: 2026-09-22-code-last-pass-ownership-gates
reconciled_executions:
  - 2026-09-18-recovered-2026-09-05-native-code-full-dom-investigation
  - 2026-09-22-code-design-ownership-plan
  - 2026-09-22-code-commands-and-highlighter-implementation
  - 2026-09-22-code-demo-browser-closure
review_history:
  - ../review-records/2026-09-04-code-external-text.json
  - ../review-records/2026-09-05-code-native-plateau.json
  - ../review-records/2026-09-22-code-commands-and-highlighter-ownership.json
  - ../review-records/2026-09-22-code-last-pass-ownership-gates.json
source_refs:
  - ../../plans/2026-09-04-code-block-external-text-architecture-audit.md
  - ../../plans/2026-09-05-native-code-full-dom-investigation.md
  - ../../plans/2026-09-04-code-block-external-text-execution.md
  - ../../plans/2026-09-06-code-block-plate-plite-tiptap-perf-audit.md
  - ../../plans/2026-09-15-external-text-ordered-feedback.md
  - ../../plans/artifacts/2026-09-22-code-api-audit/review.md
  - ../../plans/artifacts/2026-09-22-code-api-audit/last-pass.md
  - ../../plans/2026-09-22-code-commands-and-highlighter-ownership.md
  - ../../plans/artifacts/2026-09-22-code-demo-final-proof.md
related:
  - ../reviews.md#code
---

# Code text ownership

**Keep one newline-bearing Text, native/static rendering and optional
CodeMirror. The bounded code-command and native-highlighter cleanup is
implemented.**

The [complete audit](../../plans/artifacts/2026-09-22-code-api-audit/review.md)
covers all 13 code source groups and eight semantic units. Its
[last pass](../../plans/artifacts/2026-09-22-code-api-audit/last-pass.md)
narrows two adoption claims. Remove hidden grammar-registry mutation from
syntax reads; design schema-owned construction only after proving parity with
the custom code insertion options; move JSON-only formatting policy to copied
UI while preserving canonical selection/history; and repair the native
selected-line endpoint. A copied backend split is conditional on changing the
whole CodeMirror composition and proving its runtime or bundle value. Moving
shared controls alone would leave imports that initialize Lowlight.

Status: The [execution plan](../../plans/2026-09-22-code-commands-and-highlighter-ownership.md)
is complete. Its [final proof](../../plans/artifacts/2026-09-22-code-demo-final-proof.md)
records all six source-matched code-block browser rows passing together. Code
insertion constructs the final schema node, JSON formatting is a copied button
action with one canonical granular update, native indentation excludes an
untouched endpoint line, and the package syntax reader leaves the supplied
highlighter unchanged. The copied native/static kits register browser-safe
Python at resource construction. Plite's canonical anchor mapping was
repaired for disjoint edits that retain text and annotations. No compatibility
alias remains for the removed package JSON command or `defaultType` input.

The small and huge full-EditorKit demos now supply a user identity required
by authored writes. The earlier failed Enter and large-block editing rows
pass, along with Python hydration, mixed native/CodeMirror and copied JSON.
This result makes no large-JSON timing or new bundle/performance claim.

Current source has the [code-block owner](../../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts)
and [CodeMirror adapter](../../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts).
September 4 execution adopted CodeMirror-owned incremental parsing and removed
native syntax transport from external-only composition. Mixed views still need
native syntax; neutral annotations survive in both. The shared code-text recipe
proposal was rejected during execution. September 15 external-text execution
adopted synchronous dispatch-boundary feedback and monotonic recovery while
retaining the narrow public slot. Do not reopen those owners without new
contradictory evidence. Their recovered execution records remain historical-
unbound, rather than current runtime certificates.

The September 5 full-native investigation stopped without a certified timing
gain, retaining subscription repairs and rejecting speculative CSS/kernel
changes. The later September 6 plan's final R4 execution records adoption of
one Plite source coordinator, retained compiled paint, existing DOM-owner
certificates and a Plate parser memo, with measured completed-key gains and
explicit mount/competitive limits. Preserve both histories. Those source-bound
measurements do not certify September 22 performance and must not be combined
with external-renderer or minimal-engine cohorts.

The original audit ran no browser, physical-device/IME, assistive-technology,
package distribution or new performance comparison. The execution added
focused source-matched browser coverage but did not reopen those remaining
proof gaps. An incremental native parser replacement remains an unaccepted
alternative requiring a matched benchmark and full language/rendering oracles.
Backend separation remains deferred pending complete composition and measured
value.
