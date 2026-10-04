---
title: Streaming parsing and consumer lifetime
type: decision
status: accepted
updated: 2026-10-04
source_refs:
  - conversion-boundary.md
  - ../../plans/2026-09-28-conversion-boundary-adoption.md
  - ../../plans/2026-09-30-static-preview-proportional-cost.md
  - ../../plans/2026-09-30-content-root-locations-execution.md
related:
  - markdown-conversion.md
  - ai-preview-ownership.md
  - html-rendering.md
---

# Streaming parsing and consumer lifetime

**Audit of 2026-10-04.** Stop. Markdown parseSlice's partial and previous options already give both streaming consumers neutral incremental parsing, and what they share beyond that is a one-line option choice, so a stream session or helper would add a public noun without removing coordination. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and record `2026-10-04-streaming-audit` hold the evidence.

**Stop adding another streaming owner.** Markdown owns parsing and its
previous-result continuation hint. The consumer owns accumulated source,
cancellation, publication cadence, acceptance and undo. Both the non-AI
streaming demo and AI preview use that division. A public session, controller
or cache service would relocate existing work without removing a current
coordination problem.

The September 10 plan described an AI-dependent demo and an unresolved neutral
contract. It remains historical planning evidence. The
[conversion adoption](../../plans/2026-09-28-conversion-boundary-adoption.md)
already supplies the parsing contract and non-AI consumer. Its amendment
selects converted-segment reuse over the initial syntax-only prototype;
definitions and invalidation can require a whole parse. Reuse must preserve
the result and diagnostics of a fresh partial parse. Finishing or deliberately
stopping uses strict parsing of the original accumulated source.

The demo owns its abort signal, scheduled publication and previous result.
Reset, replacement and unmount cancel outstanding work. Its editable preview
publishes outside history; its static preview renders a document. AI owns
request validity, acceptance and the accepted change's undo. Those product
rules do not belong in the parser.

Static document reads and proportional rendering were adopted by the
subsequent preview plans. The
[content-root closure](../../plans/2026-09-30-content-root-locations-execution.md)
repairs policy-sensitive caption reads and decoration root isolation. These
are retained owner repairs, not reasons to reopen the parser or add a view
manager.

## Evidence and limits

The immutable records cited by the reconciliation preserve their original
scopes, source identity and failed observations. They establish the recorded
conversion and preview adoption; this reconciliation does not rewrite their
scope lists or mint a new implementation outcome for `streaming`. Generated
execution progress for this scope therefore remains unbound to that adopted
work. Review coverage and runtime proof stay separate.

The recorded Chromium contract and lifetime cases cover the non-AI demo.
Current package and demo tests also name prefix parity, strict finalization,
cancellation and draft isolation. No browser, package suite or performance
matrix was rerun for this metadata-only reconciliation.

The latest content-root matrix has six complete no-regression cells. Its two
AI-rich cells pass latency and final-text checks but remain inconclusive under
the unchanged CPU-profile rule. The earlier proportional-cost AI assessment
discloses its attribution-guard adjustment. Neither becomes an unconditional
performance claim here. Full retained-markup interaction, cross-browser and
live-provider coverage remain outside the established proof. The known narrow
AI review/undo browser failure also remains explicit.

Further performance investigation belongs to Benchmark with the recorded
revisit conditions. A directly selected AI lifecycle problem belongs to its
consumer owner. Neither requires another broad Markdown/HTML redesign.
