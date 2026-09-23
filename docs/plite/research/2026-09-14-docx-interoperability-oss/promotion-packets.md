# Documents promotion packets

Status: Research handoff only. The review verdict is Pursue; implementation,
library adoption and a replacement runtime have not been accepted.

One next owner: `$task design plan documents: make DOCX fidelity explicit and
replace competing conversion owners`.

| Packet          | Kind / baseline                                                                                                           | Decision and proof gate                                                                                                                                                                                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOCX-AUTHORITY  | Plan + targeted oracle. Current source silently trusts a sidecar and can export mixed snapshots; both locally reproduced. | Eliminate competing authority and derive every part from one snapshot. Define native metadata correspondence/conflict policy across relevant package parts. The historical probes must cease observing the bugs; independent current-behavior tests must assert chosen fallback/failure semantics.                                                                                    |
| DOCX-CONVERSION | Plan. Current ordinary and review serializers interpret schema differently; HTML import drops selected Word facts.        | Compare shared configured HTML conversion with direct OOXML adapters. Set one truthful file result/projection contract. Preserve canonical authored properties and installed schema; complete callers, diagnostics, package graph and current docs. No blanket package-preservation promise.                                                                                          |
| DOCX-SCALE      | Benchmark packet. Baseline plus one cumulative conversion per revision.                                                   | Freeze independent document sizes and revision counts with realistic mixed content; compare whole import/export including parse, ZIP, conversion, mapping, diagnostics and first usable result. Correctness first; measure time, memory, output size and blocking. Benchmark freezes targets and runner after bounded candidate selection; no speedup threshold invented by research. |
| DOCX-BOUNDARIES | No-code decision. Semantic converters, template patchers and preview packages solve different jobs.                       | Keep detached import, snapshot export and clipboard lifecycle distinct. Preserve the canonical Plate/Plite model. Reopen package retention only for a proven independent current job.                                                                                                                                                                                                 |

Current reproducible controls, from the repository root:

```sh
pnpm --filter platejs test:partition:docx-import
pnpm --filter platejs test:partition:docx-export
pnpm --filter platejs test:partition:docx
pnpm --filter platejs test:partition:docx-html
bun test ./docs/plite/research/2026-09-14-docx-interoperability-oss/reproductions/sidecar-authority.spec.ts
```

The last command is a dated observation of bad behavior, not a future product
acceptance test. A successful repair should invalidate its current assertions.
Native Word and browser proof require their matching environments. New public
API adoption must repair affected source rules/teaching and versioned doctrine
through Task's existing owners; this read-only assessment makes no such edits.
