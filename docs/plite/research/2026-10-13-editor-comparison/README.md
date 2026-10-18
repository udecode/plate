# Current GitHub editor comparison

Question: Which current open-source editors deserve a place in Plate and Plite's "What other editors do" comparisons, and for which decisions?

Scope: a full discovery and compilation pass over rich-text engines, editor frameworks, collaborative block/document editors, Markdown editors, code editors and alternative input/layout approaches. This is source research, not a full architecture audit of every repository.

Stop rule: close each declared corpus with official repository, docs and release entrypoints; inspect local implementation and test evidence for the strongest candidates; record every screened repository and explicit exclusions; compile a decision-specific comparison set and a verdict with remaining evidence gaps.

Current gap: the existing candidates page makes broad winner claims and mixes engines, frameworks and layout experiments. It does not establish a current, broad GitHub discovery set.

Expected promotion owners: the compiled editor-architecture source home and an editor-comparison research decision. Product API adoption remains outside this request.

Exclusions: private paid implementations, a feature-by-feature audit of every source file, product changes, copied third-party code, measured performance rankings and browser/device correctness claims.

Throughput checkpoint: n/a, source investigation with tracked research outputs.

Verdict: Stop a universal editor ranking or a runtime replacement inferred from repository age. Keep Plate and Plite's current owners. The requested research refresh is complete, with a comparison set for each question.

## Read the result

- [Current comparison and source findings](../../../research/sources/editor-architecture/current-comparison.md).
- [Which editors to compare for each decision](../../../research/sources/editor-architecture/candidates.md).
- Accepted research decision (`2e865a0bc4:docs/research/decisions/editor-comparison-set.md`).
- [Review and its limits](../../../plans/2026-10-13-editor-comparison-review.md).

The strongest additions are Wordgard for independent runtime evidence; ProseKit and current Lexical Extensions for composition; BlockSuite and Blok for shared blocks; Portable Text for schema and behavior contracts; Meowdown, MDXEditor and Milkdown for Markdown; and OpenDoc for experimental document layout. Canvas-editor, Lexxy and Proof SDK contribute narrower rendering, focus and agent scenarios.

BlockNote remains active. ProseMirror moved its canonical source from GitHub. SuperDoc v2's complete current engine is proprietary. Premirror's older Pretext integration needs a freshness qualification. These findings matter more than an editor's age.

## Coverage and evidence

| Measure | Recorded result |
| --- | ---: |
| Repository hits from the eight broad GitHub searches | 220 |
| Discovered source-host identities after targeted additions | 274 |
| Targeted repository metadata screens | 82 |
| Identities with recorded local file reads | 41 |
| Identities with implementation or test reads | 35 |
| Distinct recorded source files | 161 |
| Primary read-log rows | 173 |
| Downloaded Markdown snapshots explicitly not read | 6 |
| Issue bodies read | 4 |
| PR bodies read | 3 |
| Comments read | 0 |
| Invariant leads kept | 27 |
| Leads merged | 0 |
| Rejected inferences with reopening conditions | 10 |
| Documentation packets promoted | 27 |
| Runtime or benchmark packets promoted | 0 |
| External tests, benchmarks or device scenarios executed | 0 |

Counts come from [counts.json](counts.json) and the corresponding TSVs. A repository identity includes its source host. Archived GitHub ProseMirror mirrors and canonical-host components are separate. The renamed edix repository is normalized to editate. File counts deduplicate repository, revision and path. Read rows retain distinct inspected spans. Documentation and manifest reads do not count as implementation reads.

This is a bounded full discovery and compilation pass across the declared corpora. It is not a claim to enumerate all GitHub projects, audit every file, reproduce every upstream issue or establish a speed ranking. Each broad query records its returned count, sampled count and filters. Repositories outside the source sample remain discovery-only or metadata-screened.

## Corpus closure

[corpus-ledger.tsv](corpus-ledger.tsv) closes all six corpora. Engines, frameworks, shared blocks and Markdown have source evidence. Document processors retain a source gap for the proprietary SuperDoc engine and uninspected office engines. Input/layout retains a freshness gap for Premirror's older Pretext integration. The ledger names official repository, documentation and release entrypoints, fallback sources and remaining limits.

The [engine shard](shards/001-engines-and-frameworks.md), [block/document shard](shards/002-blocks-and-documents.md) and [Markdown/input/layout shard](shards/003-markdown-input-and-layout.md) summarize bounded reads. The root added Wordgard, Portable Text, Lexxy, canvas-editor and Proof SDK evidence, and checked decision-changing extractions directly.

Private raw evidence is stored under `../raw/editor-comparison-2026-10-13/`, with exact revisions, file hashes and selected snapshots. The public repository holds paraphrased conclusions and provenance ledgers, not copied third-party source.

## Promotions and rejections

The [lead ledger](lead-ledger.tsv) records all 27 native-owner invariants, their source grades, investigation scores and prospective proof commands. The [promotion ledger](promoted-ledger.tsv) promotes them only as documentation evidence. The commands are prospective and were not run. An existing suite would need a focused new case before it could prove a newly proposed invariant.

Useful starting findings include descriptor identity and disposal, shared text preservation during schema admission, structural moves that retain concurrent content, hidden-syntax caret affinity, nested code-editor lifecycle, complete page equivalence and provider/persistence agreement after agent edits. Each keeps its exact lead key and source in the ledger.

The [rejection ledger](rejected-ledger.tsv) prevents repeating unsupported global rankings, age-based exclusions, double-counted engine wrappers, all-open-source SuperDoc claims, unproved layout winners, device claims from emulation, and speed claims from bounded paint. The [issue read log](issue-read-log.tsv) keeps upstream reports separate from reproduced defects.

## Maintenance and next action

The initial maintenance pass reconciled the old candidate page with current source identities and prior research. The final pass removed its unsupported winner ranking, retained five pinned historical specialist findings, indexed the current comparison and recorded unresolved source/proof gaps. No editor behavior or runtime change was accepted, so the editor-behavior specification and coverage records gain no new proof claim.

Next shard: none. Every declared corpus has an explicit disposition. A feature-specific comparison lead owns any deeper source audit, native proof or measurement that could change that feature's decision. This broad discovery does not authorize product adoption.
