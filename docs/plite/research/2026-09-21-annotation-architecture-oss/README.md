---
title: Annotation architecture OSS final pass
type: research
status: complete
updated: 2026-09-21
review_scope: annotations
review_basis:
  - 2026-09-21-annotations-final-pass
---

# Annotation architecture OSS final pass

## Question

Does current editor source support the proposed Plite architecture: one document
model with independent mounted views, one retained target per annotation, one
exact-view annotation index, separate decoration paint, terminal `drop`, and
explicit React resource ownership? Is there a cleaner or faster architecture to
adopt before detailed design?

## Scope

- ProseMirror mapped decorations and bookmarks.
- Lexical comments, marks, and dirty-node reconciliation.
- CKEditor live positions/ranges and markers.
- CodeMirror range sets and view decorations.
- Monaco tracked decorations.
- Yjs relative positions and Automerge cursors.
- Current Plite anchors, annotation store, decoration source, mounted views, and
  Plate Comments consumption.

## Stop rule

Stop when each independent architecture family has current local source evidence,
the strongest replacement and deletion alternatives have verdicts, and each
material finding has a Plite owner and proof route. Repeated implementations do
not add another lead unless they supply a different semantic or performance law.

## Current evidence gap

The September 21 review has strong local source evidence and prior ProseMirror /
Lexical summaries. It lacks a current source-backed comparison with marker-first,
range-set, tracked-decoration, and CRDT-relative-position architectures. No
matched performance benchmark currently proves the proposed runtime shape.

## Expected promotion owner

Best API Review for the value verdict, then Task design plan with Plite Plan and
Benchmark for accepted substrate, adoption, and scale proof.

## Exclusions

- Product implementation.
- Full editor replacement or global editor superiority claims.
- Exhaustive upstream issue queues.
- Browser/device claims not executed in this run.
- Performance claims without a matched benchmark.

## Status

Research complete. The source comparison reaffirms the public architecture and
adds two private proof gates: benchmark batched native resolution before adding
another mapping structure, and scope terminal `drop` to locally observed anchor
lifetime rather than promising collaborative convergence. See [REPORT.md](REPORT.md).
