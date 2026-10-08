---
title: Code text ownership
type: decision
status: accepted
updated: 2026-10-04
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
  - ../review-scopes/code.json
---

# Code text ownership

**Audit of 2026-10-04.** Stop. The adopted target holds in live source (schema-built code nodes, caller-owned Lowlight read without mutation, JSON formatting in copied UI, corrected selected-line endpoint), and no remaining deletion or replacement lane beats one Text plus native/static syntax plus optional CodeMirror. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and record `2026-10-04-code-audit` hold the evidence.

**Keep one newline-bearing Text, native/static rendering and optional
CodeMirror. The bounded code-command and native-highlighter cleanup is
implemented.**

The September 22 complete code audit, recommending bounded command/highlighter cleanup while retaining the canonical model, CodeMirror adapter and external-text protocol,
covers all 13 code source groups and eight semantic units. Its
last pass, which requires insertion-option parity and complete composition proof before claiming a backend-free demo,
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

Syntax highlighting reads each code block once, the granularity the live
decoration contract re-reads when a block's text changes. Rendered documents
reuse an unchanged block's highlighting by identity, without resolving runtime
keys ([execution](../review-records/2026-09-30-static-preview-proportional-cost-execution.json)).

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
