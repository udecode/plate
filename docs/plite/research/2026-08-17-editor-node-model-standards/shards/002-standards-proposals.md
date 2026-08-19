# Shard 002: standards and proposals

Status: complete

Question:
Was there a Slate proposal, or another real standard, for a universal editor
node/block protocol beyond MDAST/UNIST?

Stop rule:
- Slate issues, PRs, discussions, source history, and old schema/docs searched.
- At least twelve candidate protocol/format families classified.
- Likely remembered proposal identified or ambiguity narrowed explicitly.
- Prior Plate recommendation reaffirmed, superseded, or changed.

## Slate history

Slate did contain the remembered proposal. There were several related but
distinct attempts:

| Source | Proposal | Outcome |
|---|---|---|
| [Issue #4378](https://github.com/ianstormtaylor/slate/issues/4378), “Modify Text interface to be compatible with universal syntax tree (unist)” | Rename `{ text }` to `{ value }`, add `type: "text"`, and potentially configure the text key so unified utilities can run directly | Open since 2021; no PR landed. Comments discovered the proposal was not one rename: UNIST requires every node to have `type`, and configuring the key would infect every read/transform or add editor-global policy |
| [Issue #1486](https://github.com/ianstormtaylor/slate/issues/1486), Text JSON serialization | Consider split ranges, offset ranges, mark dictionaries, and MDAST-style nested mark nodes | Maintainer explicitly retained self-contained split text leaves because marks are unordered formatting while inlines have structural identity |
| [Issue #3482](https://github.com/ianstormtaylor/slate/issues/3482), native Portable Text | Replace Slate marks with Portable Text spans/marks and use Portable Text objects directly | Text blocks worked, but void/inline nodes conflicted with Slate's required text children and text-point selection model. Issue remains open |
| [Issue #5253](https://github.com/ianstormtaylor/slate/issues/5253) | Load Portable Text templates into Slate | Open parser/import request, not a canonical-model proposal |
| [Issue #1024](https://github.com/ianstormtaylor/slate/issues/1024), MIME-typing document fragments | Add editor `contentType` so clipboard fragments from incompatible schemas can be rejected | Useful schema-identity idea; open and unimplemented |
| [Issue #1959](https://github.com/ianstormtaylor/slate/issues/1959), compact JSON storage | Add a versioned compact array encoding beginning with `slt1` | Rejected from core because readable direct JSON is easier to query, render, and migrate |
| [Issue #3272](https://github.com/ianstormtaylor/slate/issues/3272), migrations | Add document version and a migration chain | Rejected from Slate core as application/domain-owned; one-way app/database migration recommended |
| [PR #3093](https://github.com/ianstormtaylor/slate/pull/3093), 0.50 rewrite | Plain JSON, flat custom fields, fewer node concepts, interface-based API, temporary `slate-schema` package | Established today's Slate-family base model |
| [Issue #3273](https://github.com/ianstormtaylor/slate/issues/3273) / [PR #3291](https://github.com/ianstormtaylor/slate/pull/3291) | Declarative `slate-schema` validation/normalization | Removed five days after the rewrite because imperative normalization was clearer and more expressive for arbitrary domains |
| [Issue #269](https://github.com/ianstormtaylor/slate/issues/269) | Compare Slate with Mobiledoc | Slate rejected Mobiledoc's indexed JSON terminology and flat structural limits |

The full official Slate history was fetched. Current Slate source contains no
UNIST, MDAST, Portable Text, Mobiledoc, or content-type integration. A keyword
scan of 100 recent discussions out of 155 found no later standards proposal.

## Candidate taxonomy

There is no single category called “universal editor AST.” Existing candidates
solve different jobs:

| Candidate | Actual category | Standard/proposal strength | Why it is not Plate's canonical AST |
|---|---|---|---|
| UNIST | Generic syntax-tree interface | Real open specification and ecosystem | Requires typed literals with `value`; says nothing about editor grammar, marks, schema, transactions, or collaboration |
| MDAST | Markdown syntax AST | Real released UNIST-based specification | Markdown-only content semantics and wrapper marks |
| MyST AST | Technical-document conversion/render AST | Maintained MDAST-superset specification | Scientific publishing/render pipeline, not live rich-text state |
| Pandoc AST | Universal document conversion IR | Mature multi-format intermediate representation | Haskell-oriented conversion model, not editor transactions or schema extensions |
| Portable Text | Portable rich-text/block JSON | Closest real open rich-text specification; still labeled working draft | Flat block/span ontology, `markDefs`, required keys, limited structural editing model |
| Mobiledoc | Versioned portable article JSON | Real published format with cross-platform renderers | Compact index tables and flat sections sacrifice readability and complex nesting |
| Atlassian Document Format | Vendor rich-text JSON schema | Maintained versioned schema used by Atlassian products | Closed vendor vocabulary and ProseMirror-shaped content/marks |
| Contentful Rich Text | Vendor rich-text AST | Maintained typed JSON and multi-language renderers | Closed node/mark set; custom nodes are forbidden |
| ProseMirror/Tiptap JSON | Editor schema serialization | Strong de facto editor model, not independent standard | App schema owns vocabulary; `attrs/content/marks` reflects ProseMirror runtime |
| Draft.js Raw Content | Editor storage format | Documented framework format | Flat blocks plus offset ranges/entity map; archived editor lineage |
| Quill Delta / `ottypes/rich-text` | Linear document and OT operation format | Implemented in several languages; formal OT-type behavior | Sequence operations/attributes, not recursive block AST |
| Block Protocol | Block component/embedder interoperability | Real draft open standard with RFC governance | It explicitly delegates rich-text representation to the embedding app through hooks |
| Gutenberg block grammar | Block persistence grammar | Formal PEG with massive WordPress adoption | Serializes blocks into HTML/comments; inline rich text remains HTML |
| W3C Web Annotation | Annotation interchange | Actual W3C Recommendation | Standardizes bodies, targets, and selectors, not document structure |
| Peritext | Collaborative rich-text CRDT model | Strong research proposal and implementation evidence | Specifies concurrent text/mark intent, not block vocabulary |
| Slate UNIST proposal | Editor-to-syntax-tree compatibility proposal | Exact issue and fork, never landed | Permanent text-leaf cost for access to generic visitors; still not MDAST-compatible |
| Slate Portable Text experiment | Native external storage experiment | Working fork/user evidence, never landed | Violated required child/selection invariants |

GitHub repository discovery for “rich text specification” returned Portable
Text as the only material open rich-text specification. Broader searches mostly
returned Quill/OT Delta implementations or product-specific serializers.

## Likely remembered proposal

If the memory is specifically “a proposal in Slate,” it is almost certainly
[Slate #4378](https://github.com/ianstormtaylor/slate/issues/4378): its exact
title says compatibility with **Universal Syntax Tree (UNIST)**.

Two nearby memories can easily blend into it:

1. [Slate #1486](https://github.com/ianstormtaylor/slate/issues/1486) explicitly
   considered MDAST-style nested mark nodes before rejecting them.
2. [Slate #3482](https://github.com/ianstormtaylor/slate/issues/3482) describes a
   real attempt to use Portable Text as Slate's native value.

If the remembered phrase was instead “universal block protocol,” that is
[HASH Block Protocol](https://github.com/blockprotocol/blockprotocol). It is an
embedding protocol for reusable interactive components, not a document AST.
Its rich-text Hook RFC says the host's data may be bespoke and impossible for
the block to parse.

## Effect on Plate verdict

The prior Plate verdict is reaffirmed and strengthened.

- Do not rename `text` to `value` or add `type: "text"` merely for UNIST.
  Plate would pay the cost on every leaf while still needing conversion for
  MDAST wrapper marks and format grammar.
- Do not add configurable `textKey`; Slate #4378 already exposed the bad DX:
  every helper needs the option or the editor owns global hidden policy.
- Keep actual MDAST at the Markdown boundary. Unified utilities operate there
  without compromising live editor state.
- Keep Plate's app schema ID/version/fingerprint. It is the completed,
  fail-closed version of Slate #1024's MIME/content-type insight and #3272's
  app-owned migration direction.
- Treat Portable Text, ADF, Contentful, Pandoc/MyST, Mobiledoc, and vendor
  formats as explicit codecs/adapters when a product needs them.
- Block Protocol is relevant to copied/embeddable UI components, not schema
  node identity.

No new Plate or Plite API is justified by this shard. A generic `toUnist` API
would be meaningless without choosing a content specification; `toMdast`/
`fromMdast` is the honest format-specific boundary already owned by Markdown.

## Sources read

- Slate: 7 issue/PR search families, 100 of 155 recent discussions, full git
  history/tags, 12 exact issues, and 2 exact PRs.
- New clean clones: Block Protocol, Mobiledoc Kit, Contentful Rich Text, and
  `ottypes/rich-text`.
- Official specifications/docs: UNIST, MDAST, Portable Text, ADF, Contentful,
  MyST, Pandoc, W3C Web Annotation, Peritext, Draft.js, Gutenberg, and Block
  Protocol.
- Existing local source: ProseMirror, Lexical, Slate, BlockNote, Quill, and
  Plate/Plite.

## Closeout counts

- Candidate protocol/format families classified: 17.
- Slate GitHub query families: 7 issues/PRs plus discussions and full history.
- Exact Slate threads read: 14 (12 issues, 2 PRs).
- Recent Slate discussions keyword-scanned: 100 of 155.
- New external repositories deeply read: 4.
- New proposal leads: 10.
- New rejected canonical models: 7.
- New code/API promotions: 0.
- Existing Plate verdict: reaffirmed.
- Likely remembered proposal: Slate #4378; alternate memories #1486, #3482,
  and Block Protocol.
- Next shard: none. More repositories would add product formats, not a missing
  universal editor-tree standard.
