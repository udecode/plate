---
title: DOCX conversion and preservation in six source families
type: source
status: partial
updated: 2026-09-14
source_refs:
  - ../../plite/research/2026-09-14-docx-interoperability-oss/source-manifest.json
  - ../../plite/research/2026-09-14-docx-interoperability-oss/read-log.tsv
related:
  - ../decisions/documents-conversion-fidelity.md
  - ../open-questions/documents-conversion-proof.md
---

# DOCX conversion and preservation

Six current upstream source families distinguish **semantic import, Word
generation, package retention, preview, and editable package preservation**.
One capability does not establish another. This is a bounded source comparison,
not a ranking of all DOCX software or a claim that upstream tests pass.

The [corpus ledger](../../plite/research/2026-09-14-docx-interoperability-oss/corpus-ledger.tsv)
closes all six retained source families. The
[manifest](../../plite/research/2026-09-14-docx-interoperability-oss/source-manifest.json)
pins 47 selected current files, including licenses and metadata. Source reads
use the exact revisions below. Existing clones with older checkouts were read
with `git show <commit>:<path>`; a local file link can otherwise show older code.

| Corpus / inspected revision                                                         | Strongest source evidence                                                                                                                                                                | Relevance and limit                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Mammoth](https://github.com/mwilliamson/mammoth.js), `71fe5daa50f8`                | `lib/docx/body-reader.js:446,721-723` unwraps insertions and ignores deletions and comment range boundaries. Unknown-element warnings exclude known ignored elements.                    | A semantic HTML adapter. A warning-free result is not a lossless document. Comments become reference points, not preserved ranges.                                           |
| [TurboDocx html-to-docx](https://github.com/TurboDocx/html-to-docx), `571d2e471f00` | `src/helpers/xml-builder.js:728-734` maps HTML `ins` to underline and `del` to strike. `src/html-to-docx.js` generates package parts. Image generation can log and return null.          | HTML generation does not inherently retain revision identity or an original package. Plate's fork has additional review handling and must be assessed separately.            |
| [docx](https://github.com/dolanmiu/docx), `fda088d1da37`                            | Explicit OOXML comment start/end markers, threaded comment metadata, insertion/deletion identity and text runs. `src/patcher/from-docx.ts` has a separate template replacement contract. | A direct generator candidate. Template patching retains binary entries and reserializes XML; neither that nor the generator supplies a general editor import contract.       |
| [docx-preview](https://github.com/VolodymyrBaydalka/docxjs), `191d3e0db009`         | `WordDocument` retains the ZIP; save regenerates that package. Parsed model and HTML rendering are separate. No inspected save path serializes editor-model edits.                       | Useful preview/retention reference. Not evidence of editable DOCX preservation, byte-identical ZIPs, or Word layout equivalence.                                             |
| [SuperDoc](https://github.com/superdoc/docx-editor), `3bad86724392`                 | Public export types distinguish review-preserving/final/original and structured warnings; validation happens before adapter work. Current v2 integration imports a separate engine.      | **Engine evidence gap:** its current DOCX engine is proprietary and absent from the public tree. Public contracts and mocked export tests do not prove serializer retention. |
| [Pandoc](https://github.com/jgm/pandoc), `bde8c297ee68`                             | Reader branches for accept/reject/all; writer regenerates parts from the AST and selected reference-document data. Comments and revisions have explicit but partial mappings.            | A semantic oracle candidate. Moves normalize to insert/delete, IDs can change, and comment structures flatten. Inspected tip differs from release 3.11.                      |

The strongest transferable practices are explicit projection intent, direct
encoding of format facts, feature-aware paste normalization, and proof at the
actual destination. None requires introducing another canonical editor model.

## What the tests actually establish

Mammoth's inspected assertions cover selected readers and warnings. The docx
assertions cover exact XML for comment markers and insertion metadata.
TurboDocx's run-property ordering assertion is a useful artifact oracle.
These source reads do not establish native Word rendering or test execution.

Pandoc's reader and writer goldens exercise chosen semantic projections, not
arbitrary package retention. A reader test named for insertion uses a deletion
fixture, so test labels alone overstate distinct coverage. docx-preview's
inspected harness compares normalized HTML with tracked-change rendering
enabled; it does not prove comment behavior, edits, export or screenshots.

See the [Pandoc/preview report](../../plite/research/2026-09-14-docx-interoperability-oss/shards/pandoc-preview.md)
and [SuperDoc report](../../plite/research/2026-09-14-docx-interoperability-oss/shards/superdoc.md)
for exact spans, negative findings and test limitations.

## Source and adoption boundaries

The inspected declarations are BSD-2-Clause for Mammoth, MIT for TurboDocx
and docx, Apache-2.0 for docx-preview, GPL-2.0-or-later for Pandoc, and
AGPL-3.0 for SuperDoc's public shell. SuperDoc's engine has a separate
proprietary license. These are source license observations, not clearance of
every dependency or fixture.

No third-party source or fixture was copied into Plate, and no converter was
adopted. Zero upstream tests, issue bodies or PR bodies were executed/read in
this pass. Official discovery and exact local source settle the bounded
comparison; performance, native fidelity and proprietary internals remain
outside its proof. The [open questions](../open-questions/documents-conversion-proof.md)
keep those limits attached to the design handoff.
