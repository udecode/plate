# DOCX post-implementation OSS reassessment

Question: Does current OSS evidence justify replacing or materially changing
Plate's adopted canonical DOCX import/export contract after its implementation?

Scope: retained-package editing, unknown-part preservation, tracked revisions,
comment ranges, package resource limits, detached versus editor-bound APIs, and
proof methods that can change the `documents` Best API Review verdict.

Stop rule: stop after one mature OOXML SDK and at least two current browser or
headless DOCX engines have been inspected locally, and every new design lead is
promoted, merged into an existing lead, or rejected with a reopening condition.

Expected promotion owner: `best-api-review` for the `documents` scope, followed
by Task for any accepted design work.

Exclusions: DOCX layout/UI parity, Word paste media and table policy, math,
emoji, generic comments storage, implementation changes, benchmarks, releases,
and Microsoft Word certification.

Status: complete on 2026-09-15.

## Conclusion

The research changes one material conclusion from the prior review. Source
retention is an earned part of Plate's existing import, edit, then export job.
It should be explicit and optional, and it must remain separate from
`EditorDocumentValue`.

Keep the adopted semantic conversion API as the default. Pursue a design for an
opaque retained-source artifact returned by an opted-in successful import and
passed explicitly to export. The artifact must bind the admitted package,
imported semantic baseline, installed schema, comments and review projection.
Export may return original bytes only when correspondence proves no change. An
edited export may preserve source parts or XML spans only where provenance and
invalidation prove that the edit did not make them stale, with every fallback
or omission reported.

Do not replace Plate's model with an OOXML tree, hide package state in editor
metadata, or add a second editor-like `DocxSession`. Those designs are justified
for DOCX-native editors because OOXML is their canonical document. They would
duplicate Plate's schema, commands, persistence and feature owners.

## Harsh correction

The earlier statement that retained-package editing was an unearned separate
job was too absolute. Plate's own UI exposes Word import and Word export in the
same editor, so preserving unrelated source content is already part of a real
workflow. Diagnostics make loss honest; they do not preserve user data.

The opposite overcorrection would be worse. Keeping source bytes alone does not
make round-trip editing safe. Scriptor's through-model corpus still loses XML
inside `document.xml` for most sampled files after whole-part passthrough, and
Folio needed later repairs for opaque package parts and formatting provenance.
The source artifact earns design only together with explicit invalidation,
compatibility reporting and package/semantic fidelity oracles.

## Closeout

- Repositories searched: 14.
- Repositories deep-read at pinned local revisions: 8.
- GitHub issue and pull-request search hits screened: 70 raw hits, including
  duplicates across queries.
- GitHub issue and pull-request bodies deep-read: 8.
- Leads kept: 9; 4 promoted into one design packet, 3 merged into already
  adopted Plate laws, and 2 rejected as Plate architecture.
- Rejected or deferred alternatives with reopening conditions: 6.
- Promoted packet: `DOCX-RETAINED-SOURCE-DESIGN`.

Top leads are the explicit retained-source artifact, source-bound
exact-if-unchanged and preserve-when-safe behavior, provenance-driven
invalidation, and package-part plus semantic round-trip oracles.

The changed list is intentionally narrow: the current import result, export
snapshot law, diagnostics, resource limits, Word paste boundary and package
entrypoints survive. Only the blanket deferral of source retention changes.

Evidence density slowed after OpenDoc, Scriptor, Folio, EigenPal, docx-cli,
docx-redline-js, Open XML SDK and python-docx. Further repositories were sibling
projects, lower-signal wrappers, mature packaging substrates, or full office
suites that repeated the same ownership choices without improving the Plate
decision.

Needs attention: the retained-source target is reviewed but not designed,
implemented or proved in Plate. The adopted semantic conversion baseline
remains verified for its existing claims.

Stopping checkpoint: the stop rule is satisfied by two mature SDK/package
comparators and six current browser, headless or agent-facing engines. Every
lead has a promoted, merged or rejected disposition.
