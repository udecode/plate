# Streaming parsing

Markdown owns parsing and its previous-result continuation hint through `parseSlice`'s `partial` and `previous` options. The consumer owns accumulated source, cancellation, publication cadence, acceptance and undo. The 2026-10-04 audit stopped: what the two consumers share beyond that is a one-line option choice, so a stream session or helper would add a public noun without removing coordination ([triage audit](../2026-10-04-ledger-triage-audit.md), [conversion adoption](../2026-09-28-conversion-boundary-adoption.md)). `node tooling/scripts/review-ledger.mjs show streaming` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Parser | Converted-segment reuse that preserves the result and diagnostics of a fresh partial parse; definitions and invalidation can force a whole parse. Finishing or stopping parses the original accumulated source strictly. |
| Non-AI demo | Owns its abort signal, scheduled publication and previous result; reset, replacement and unmount cancel outstanding work. The editable preview publishes outside history, and the static preview renders a document. |
| AI preview | Owns request validity, acceptance and the accepted change's undo. |
| Static reads and paint | Content-root locations own caption reads and decoration root isolation ([closure](../2026-09-30-content-root-locations-execution.md)). |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A public stream session, controller or cache service | Relocates existing work without removing a coordination problem. |
| Syntax-only reuse | Superseded by converted-segment reuse. |

## What other editors do

Not compared in this scope's reviews.

## Main changes

- None since the audit.

## Open work

- The two AI-rich content-root cells are inconclusive under the CPU-profile rule, and the narrow AI review and undo browser failure stays. owner: Benchmark for the cells, the `ai` subject for the failure. stop: a conclusive run or the fix.
