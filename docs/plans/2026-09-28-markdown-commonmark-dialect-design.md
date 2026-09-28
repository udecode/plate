---
review_scopes:
  - markdown
review_basis:
  - 2026-09-28-markdown-dialect-prototype-correction
work_kind: implementation
---

# Markdown CommonMark dialect and conversion contract

Status: Implemented and verified in the working tree; uncommitted; D21 superseded (see Execution record)

Objective:
Choose the durable Markdown conversion target: one canonical CommonMark + GFM +
math dialect with registered Plate tags, diagnosed refusals and a smaller
public surface. Produce a complete adoption and proof plan, then execute it
(authorized 2026-09-28).

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-28-markdown-commonmark-dialect-design.md

Template:
docs/plans/templates/plate-plan.md

Mode:

- `standard`. The dialect question was settled by prototype; this plan designs
  the full contract around it.

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Planning: source reads with citations, the prototype gate runner and scale
  probe (`docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/`), and
  `node tooling/scripts/review-ledger.mjs check`.
- Execution: `packages/platejs` Markdown and package suites, source-first
  package typecheck, the CommonMark corpus test, registry generation, focused
  Chromium AI/streaming scenarios, and the tracked Benchmark receipt below.

Constraints:

- Execution was authorized on 2026-09-28. Keep the work uncommitted.
- No public compatibility aliases or runtime shims. Legacy *data* reads are a
  dialect law (D12), not an API alias.
- Copyright: no vendored third-party corpus. The CommonMark spec examples are
  CC-BY-SA 4.0; consume them through a devDependency with attribution, or keep
  the fetched copy uncommitted.

Boundaries:

- In scope: the `platejs/markdown` runtime, the Markdown mapping authoring
  contract in core (`MarkdownNodeMapping`), every feature `markdown:` mapping,
  Markdown consumers in `packages/platejs/src/ai`, the registry kit, demos,
  docs and agent doctrine that teach Markdown.
- Source owners: `packages/platejs/src/markdown/**`,
  `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`,
  `packages/platejs/src/features/*/lib/Base*Plugin.ts` mappings,
  `packages/platejs/src/ai/react/{AIChatPlugin.ts,CopilotPlugin.tsx}`,
  `apps/www/src/registry/**` Markdown kit and demos, `content/docs/**` Markdown
  pages, `.agents/rules/best-api/rules/{behavior-and-ownership,schema-and-identity}.md`.
- Non-goals: incremental streaming architecture and per-chunk cost (the
  September 10 streaming plan), HTML/DOCX conversion, list topology, AI
  product policy, Markdown in Plite, MDX export.
- Review binding: only `markdown` has a governing review. AI, streaming,
  clipboard, mentions, imports and exports are adoption surfaces listed in the
  consumer inventory; they carry no review that governs this design.
- Direct Plite boundary owners: schema fitting and validation
  (`fitDocumentWithReport`, `assertDocument`, `ContentSlice.closed`) are
  consumed, not changed. N/A for Plite edits.

Output budget strategy:

- Three bounded read-only source inventories (mappings, runtime internals,
  consumers) summarized into this plan; prototype evidence linked, not copied.

Blocked condition:

- None. Two decisions below are flagged for user override but have defaults
  that satisfy the governing review: D13 (MDX input not a Plate dialect) and
  D16b (cut the `withBlockId` writer).

Plate Plan state:

- phase: closure
- next: immutable execution record and user handoff
- handoff: verified

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Next step recorded in `2026-09-28-markdown-dialect-prototype-correction`, plus the user's "go" |
| Task plan and execution authority verified | yes | Design plan only; no execution authority |
| Current owners read | yes | Mapping, runtime and consumer inventories (Findings) |
| Best API target resolved | yes | Best API design applied in "Target call sites" and the decision ledger |
| Runtime scale applicability resolved | yes | Parse cost scales with source size, tag count, nesting depth and streamed prefix count; see Scale contract |
| Pre-acceptance Benchmark probe selected | yes | `bench.ts` and `bench-b4-followup.ts` against the disposable prototype; see Scale contract |
| Mode and execution boundary resolved | yes | Standard; execution authorized and completed uncommitted |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: N/A, no view state changes.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | D1–D22 implemented or explicitly superseded; S1–S6 complete |
| Fresh source evidence | yes | Recheck decision-changing current claims | Three source inventories and the prototype gates rerun today |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Target call sites; D4, D5, D10, D16, D22 |
| Pre-acceptance scale proof | yes | Matched baseline/target result | Scale contract: no gross regression; B4 attributed to the shared tokenizer |
| Production scale rerun contract | yes | Exact final production-path rerun | S6, Benchmark owner, same cohorts and budgets |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work | Consumer inventory, S3 browser proof, S5 docs/doctrine, Open risks |
| Verification recorded | yes | Record planning proof and exact execution gates | Verification evidence; Proof matrix |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, execution order | Final handoff prepared |
| P1 autoreview | no | N/A: planning-only on `next`; branch policy forbids Autoreview here | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-28-markdown-commonmark-dialect-design.md` | See Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Source inventories; prototype record | Decide |
| Decide | complete | Decision ledger D1–D22 | Execute and prove |
| Execute and prove | complete | Package, slow-fixture, browser and benchmark evidence below | Record closure |
| Record closure | complete | Immutable execution outcome and generated ledger | User handoff |

## Execution record

Authorized by the user's "go" on 2026-09-28. Nothing is committed.

| Decision | State | Evidence |
| --- | --- | --- |
| D1–D3, D9–D12 grammar, registry, writer, partial, legacy reads | Landed | `markdown/lib/internal/markdownTags.ts` + `markdownTags.spec.ts` (CommonMark 0.31.2 corpus identity, totality fuzz, nesting, repairs, offsets, legacy re-read, writer escaping) |
| D4 selectors | Landed | `MarkdownNodeMapping.ts` `node`/`tag`/`nestedTags`; 20 feature files migrated; compile rules in `markdownMappings.ts` |
| D5 attribute codec | Landed | `internal/markdownAttributes.ts`; `readTagAttributes` / `encodeAttributes`; the schema property descriptor owns primitive, enum, set and custom validation; JSON-looking string values round-trip as strings |
| D6 refuse | Landed | callout, summary, media captions, table cell/row/table cascade |
| D7 boundaries | Landed | fitting inside the schema boundary; other throws propagate; `markdown-invalid-source` removed |
| D8 raw HTML | Landed | built-in `html` decoder reports unsupported HTML, drops comments with a warning, reads `<br>` variants |
| D13, D14, D16, D17, D19, D22 cuts and typing | Landed | `remark-mdx` dropped from `package.json` and the entrypoint DAG; mention reads `mention:` links; exact `MarkdownApi<V>.serialize` |
| D18 loss accounting | Landed | `serializer/reportOmittedProperties.ts` (read-tracking claims; schema role `metadata` skipped); `mergeTexts` compares tag name and attributes |
| D20 references and footnotes | Landed | `internal/markdownReferences.ts`; footnotes decode from `label` |
| D15 one dispatch | Landed | `CompiledMarkdownMappings` = `decodeByNode`, `decodeByTag`, `encodeByType`, `encodeByMark`, `tags`. Built-in paragraph/text/break/html decoders (`internal/markdownIntrinsics.ts`) run last on their selector. Mark mappings return exact schema values that the runtime composes under their target keys; inherited persisted text properties are `marks`, and the children decode once. `rules`, `MdRules`, `MdNodeParser`, `mdastToRule`, `MarkdownNodeName`, `createRule`, `convertTextsDeserialize` and `decodeTexts` deleted. A read-only custom mark reports on export instead of vanishing. One test per dispatch rule in `markdownMappings.spec.ts`, plus negative type contracts |
| D21 open-slice roots | Superseded | Data-transfer encode now returns `string \| null` without diagnostics (`MarkdownPlugin.ts`). Roots only feed `markdown-unsupported-root` warnings, so open and closed slices already write the same Markdown |
| S3 consumers | Landed | kit, demos, AI chat `partial` + `lossPolicy: 'allow'` previews, prompt wording, joiner rename, `build:registry`, registry changelog entry `2026-09-28-markdown-registered-tags` |
| S6 benchmark | Adoption gate passed; absolute B4 budget failed | Tracked runner `benchmarks/editor/benchmarks/plate-markdown-dialect-benchmark.ts` and receipt `benchmarks/editor/benchmarks/results/plate-markdown-dialect-latest.json`. Correctness guards pass and B1–B3 have no clear failure. Regenerated on the final tree (2026-09-28T15:52Z): B1 0.93–0.97×, B2 prose 1.00× and streaming 0.96×, supplemental serialize 0.97×. Inline-tag doubling exceeds the frozen 2.5× absolute budget at all three measured doublings (2.77×, 3.12×, 3.32×); paired plain CommonMark has the same or worse growth and the Plate extension is faster at every measured size, so the extension-attribution adoption gate passes without erasing the absolute failure |
| S6 production-path rerun | Serialize regression found and fixed | `bench-s6.ts` against the `e33ad94aea` worktree, ABBA order, frozen tree (`s6.log`, `s6-rerun-*.json`). Before the fix serialize was 1.12×/1.10× in both orders: `encodeMarkdownParagraph` spread the conversion options per paragraph, missing the per-operation format-context cache, and the parse-only tag transformer ran on serialize. The conversion context now carries a stable `operation` key and serialize installs `remarkMarkdownTagWriter` only; serialize is 0.99×/0.93× and the CPU profile's context rebuild share fell from 4.3% to 0.5% (baseline 0.6%). Parse, prose and streaming timings are mixed across orders on a shared host (load 4.6–9.6) and stay inconclusive; the legacy-document correctness guard is identical in every run |
| S5 docs, doctrine, changeset | Landed | changeset `markdown-plite-runtime.md` against `main` (including the mark-mapping shape); `markdown.mdx`/`.cn.mdx` and 15 related pages; Plate Next v248 with rule mirrors regenerated (`version.mjs validate` passes); Vision `plate.md`; schema-adoption checker restored (it had been silently inert since `kind` was removed) |

Test state:

- Markdown partition: 162/162.
- Full `platejs` package: 141/141 test tasks and 90/90 typecheck partitions.
- Markdown slow fixtures: 41/41. The stale spacer, fitter, schema and list-image expectations were repaired against the adopted contract.
- `apps/www` Markdown deserializer and AI streaming fixtures: 39/39.
- `apps/www` Markdown package-integration suites: 54/54. Fixtures were
  repaired against the adopted contract: merged hard-break text, the callout
  schema-default `icon`, inline-void spacers, blockquote text inside a
  paragraph, and a `testValue` without the removed `toggle` type or
  properties the test editor does not install; the serialize snapshot now
  records the canonical writer form.
- Markdown and standard-list partitions, their typechecks, and public type contracts pass. Type contracts prove exact schema-valued mark callbacks, the `marks` decode context and childless `wrap` results.
- Chromium browser proof: 5/5. It covers split registered tags, table-cell Markdown before and after acceptance, generated comments, and editable/static streaming.
- `check-plate-schema-adoption`: no Markdown findings (37 remaining belong to other work); its tests pass 61/61.
- `www` typecheck passes, including API reference, docs/source parity, fresh
  registry output, app types and package-integration types.
- `check:docs` and the registry changelog check pass; both mapping examples in
  `markdown.mdx` typecheck against source.
- Benchmark artifact contract test and the tracked runner build pass. The
  receipt's correctness and attribution gates pass while its absolute B4
  verdict remains failed.
- Root `lint:fix`, package barrel generation, Plate Next v248 validation and
  `git diff --check` pass.

## Decision brief

- outcome: The built-in grammar accepts every string. Every recognized
  source-dependent failure (unsupported nodes, refusals, schema violations,
  tag repairs, limits) becomes a diagnostic. Configured `remarkPlugins` and
  invariant violations may still throw. Plate extension elements round-trip as
  registered tags. The public surface shrinks.
- chosen shape: a selective registered-tag micromark grammar inside the
  Markdown runtime, with its tag registry compiled from feature mappings.
  Mapping selectors split into `node` (standard MDAST kinds) and `tag`
  (registered Plate tags). Tag attributes are decoded by the schema. Expected
  refusals go through `refuse()`. There is one compiled dispatch, a canonical
  writer, and a `partial` preview parse.
- strongest rejected alternative: keep full MDX as the default and repair its
  recovery. That keeps the root cause: valid CommonMark fails, and completed AI
  output disappears. Second: pairing CommonMark `html` nodes, which failed
  silently (9/13 legacy documents, 1/8 fixtures).
- consequence: public breaks listed in D4, D10, D13, D14 and D16. Legacy MDX
  output keeps reading through the D12 dialect law. MDX input is no longer a
  Plate dialect.

## Target call sites

Normal path, unchanged:

```ts
import { MarkdownPlugin } from 'platejs/markdown';

const result = editor.api.markdown.parse(source);
if (result.ok) editor.update.value.replace(result.document);

const exported = editor.api.markdown.serialize();
```

Streaming preview (AI chat, streaming demo). The only difference from a final
parse is the unfinished tail:

```ts
const parsed = editor.api.markdown.parseSlice(content, { partial: !final });
```

Feature mapping for a registered tag. Tag name = schema type; attributes are
decoded and encoded by the schema:

```ts
markdown: {
  tag: type,
  decode: ({ decode, node, properties, refuse }) => {
    const content = decode(node.children);
    if (content.some(isBlockElement)) {
      return refuse('Callout children must be inline Markdown content.');
    }
    return { ...properties, children: content, type };
  },
  encode: ({ encodePhrasing, node }) => ({
    children: [{ children: encodePhrasing(node.children), type: 'paragraph' }],
  }),
},
```

Feature mapping for a standard MDAST kind, typed by the selector:

```ts
markdown: {
  node: 'blockquote',            // decode receives mdast Blockquote
  decode: ({ decode, node }) => ({ children: decode(node.children), type }),
  encode: ({ encodeFlow, node }) => ({ children: encodeFlow(node.children), type: 'blockquote' }),
},
```

Escape path: `MarkdownPlugin.configure({ initialState: { remarkPlugins } })`
stays the synchronous unified extension boundary.

## Decision ledger

| # | Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Default grammar | Registry kit installs `remarkMdx`; valid CommonMark fails (`Array<string>`, autolinks, `{`), indented code silently becomes paragraphs | CommonMark + GFM + math + a registered-tag construct. Unregistered `<` falls through to CommonMark. The built-in grammar is total; configured remark plugins are outside that promise | Markdown runtime | Ordinary Markdown must never fail or change meaning because extensions exist | Runtime installs the tag grammar itself; kit drops `remarkMdx` | CommonMark corpus identity test; 20k-string totality fuzz; G8 regression cases | Registered HTML names (`del`, `u`, `mark`, `details`…) intentionally differ from raw-HTML CommonMark (4/652 spec examples) | Adopt |
| D2 | Tag registry | Implicit: `decodeBySource` keys mixing MDAST kinds and tag names (`markdownMappings.ts:351-369`) | Compiled from `tag` selectors, plus each mapping's declared `nestedTags` (e.g. Image: `figcaption`). Kind comes from the schema role of the decoded node or mark. HTML-void names come from a grammar constant | Markdown runtime; features declare their tags | Grammar must know exactly which names are Plate syntax; configured `schema.type` stays the persisted identity | Derive at `compileMarkdownMappings` | Registry covers every installed tag, including media captions | A mapping that emits an undeclared nested tag breaks round trip; covered by the writer round-trip test | Adopt |
| D3 | Tag node in MDAST | `mdxJsxFlowElement` / `mdxJsxTextElement` from remark-mdx | Same node shapes, produced by the Plate grammar. `mdast-util-mdx-jsx` is the established MDAST representation of JSX-like tags. Mapping authors see it as `MarkdownTagNode` | Markdown runtime | Prior art; zero stringify/handler churn; no neutral-node layer earns its keep | Type alias in `MarkdownNodeMapping.ts` | Existing tag mappings decode unchanged in the prototype (G3 13/13) | The MDX name leaks through structure, not through public nouns | Adopt |
| D4 | Mapping selector | `from: string`, with MDAST kinds and tag names in one map; closed `SourceNodeMap` (51 keys, 13 unused); dead `DefaultMdastNode` (`MarkdownNodeMapping.ts:48-172`) | `node: MdastKind` (typed MDAST node) or `tag: string` (`MarkdownTagNode`); exactly one per decode mapping. Delete `SourceNodeMap`, `DefaultMdastNode`, `MarkdownNodeName` | Core authoring contract | Fixes the kind/tag collision and callback inference; opens tags to custom features | Rewrite 36 mapping sites mechanically | Type tests: `node: 'paragraph'` infers `Paragraph`; `tag` infers `MarkdownTagNode`; a mapping with both or neither is rejected | Wide mechanical diff; doctrine repair required | Adopt |
| D5 | Tag attributes | `parseAttributes` JSON-parses every string (`"123"` becomes a number; the hostile-literal probe shows a callout with `icon="123"` or a JSON-looking icon reading back as the default icon); `propsToAttributes` writes arbitrary props (`parseAttributes.ts:18-61`) | The Markdown runtime owns a wire codec keyed by the schema property's runtime kind (`plitejs/src/core/schema-definition.ts:700`); the schema still validates the decoded value. Rules in "Attribute codec" below. Decode gets `properties`; encode writes persisted, non-default properties. Mark tags (style `span`) read entity-decoded `node.attributes` directly | Markdown runtime (wire format), schema (value validity) | The schema validates values but defines no Markdown wire form; blanket coercion is wrong | Delete `parseAttributes` / `propsToAttributes` from the contexts | Codec table cases; `icon="123"` stays a string; malformed JSON is omitted and diagnosed | Style marks keep custom CSS parsing | Adopt |
| D6 | Expected refusals | Decode/encode `throw new Error` (callout, summary, media captions, table spans), which becomes `markdown-invalid-source` or escapes serialize | `return refuse(message)`: the runtime reports `markdown-unsupported-node` (`replaced`, source text kept on parse; `dropped` on serialize) under `lossPolicy`. Any other throw is a bug and propagates. Missing-dependency checks move to compile-time validation | Runtime; features call `refuse` | Expected input problems are results, programmer faults are throws | Convert 5 decode and 4 encode throw sites | Each refusal returns a diagnostic with a source location | Features must not swallow real bugs with `refuse` | Adopt |
| D7 | Schema error boundary | `fitDocumentWithReport`, `ContentSlice.closed` and serialize `assertDocument` sit outside any catch (`markdownConversion.ts:881, 909, 983, 998`) | Every parse and serialize entry reports `EditorSchemaValidationError` from source-dependent content as `markdown-schema-invalid`. `parseInline` also asserts the fragment. A plain `Error` from JSON validation or a caller-supplied invalid document stays an invariant failure and throws | Runtime | A result API must not throw on untrusted input | One boundary helper per entry | `a <callout>b</callout> c`, `<toc>` with children, and a callout inside a list return `ok: false` | Plain `Error` from JSON validation stays a programmer fault | Adopt |
| D8 | Raw HTML | `html` nodes become text silently (`intrinsicRules.ts:55-59`) | `<br>`/`<br/>`/`<br />` becomes a break. A comment is dropped with a `markdown-unsupported-node` warning (not rendered content). Any other HTML stays literal text with `markdown-unsupported-node` (`replaced`) under `lossPolicy` | Runtime intrinsic mapping | Under CommonMark, raw HTML is ordinary input and must be accounted for | Replace the intrinsic html rule | `<div>`, `<!-- x -->` and table `<br>` cases | Default `reject` fails a paste containing unknown HTML (same as today under MDX) | Adopt |
| D9 | Tag repairs | MDX throws on unclosed, unmatched or misplaced tags | Unclosed: auto-closed at container end. Stray closer: literal. Block tag in phrasing: literal unless it is alone on its own line. One new code, `markdown-tag-repair` (`reason: unclosed \| unmatched \| misplaced`), as a warning | Grammar pairing pass | Content is preserved; the repair is visible | New diagnostic code | Fixtures for each reason, with exact tag offsets | None beyond diagnostic volume | Adopt |
| D10 | Streaming | `recovery: 'incomplete-stream'` plus `splitIncompleteMdx` and an MDX fallback; truncates 60 blocks to 2 while reporting preservation | `partial?: boolean` on `parse` / `parseSlice` / `parseInline`. It trims a trailing incomplete registered tag and suppresses `unclosed` repairs at EOF; everything else is identical to a final parse. Delete `recovery`, `markdown-fallback`, `splitIncompleteMdx` and the table reparse | Runtime | With a total grammar, only the unfinished tail differs | AIChat, streaming demo | Every prefix of the corpus: no throws, no partial-tag text; the final parse stays strict | Per-chunk O(n) reparse unchanged (out of scope) | Adopt |
| D11 | Writer | MDX stringify indents children 2 spaces per level (depth 2 reaches CommonMark's code threshold) | Block tags with blank lines around children, no indentation, fenced code, quoted attributes; a tag without children self-closes | Runtime toMarkdown handlers | Output must be CommonMark-safe and readable by other tools | New handlers | Round trip equals the MDX round trip (prototype 13/13); no line indented ≥4 outside fences; the MDX kit also reads the output | MDX consumers need `{` escaping (no named job) | Adopt |
| D12 | Legacy reads | MDX parses stored Plate output | Dialect law: the body of a registered block element admits fenced code only; an indented code block directly inside one is Markdown. Keep the `media_embed` alias migration. Read `<block id>` wrappers when `ElementIdPlugin` is installed; otherwise report a diagnostic instead of throwing | Grammar and runtime | Existing content carries no version marker | None for callers | Legacy corpus identity; intentional indented code inside a tag becomes paragraphs (documented casualty) | Tab-indented legacy content unhandled | Adopt |
| D13 | MDX | `remarkMdx` wrapper (eager optional import), WeakMap tag protocol, `withoutMdx`, `htmlToJsx` | Delete all four. MDX input is not a Plate dialect: no current consumer is named. `remarkPlugins` stays the generic boundary, with no MDX compatibility promise | Markdown runtime | MDX's partial grammar was the root cause; its only job was tag tokenizing | Kit and demos drop `remarkMdx`; docs stop teaching MDX | Package loads without `remark-mdx`; no import of it remains | **User override:** name an MDX-source consumer to keep an explicit adapter | Adopt (overridable) |
| D14 | Mention | `remarkMention` (parse-only) turns `@user` text and `mention:` links into a custom `mention` MDAST node; exported `MentionNode` | Mention maps `node: 'link'` at higher priority than Link, claims `mention:` URLs and declines others. Delete `remarkMention`, `MentionNode`, the parse-only tag and bare-`@user` parsing | Mention feature | The writer only emits links; bare `@` has no round-trip job and misfires on `@types/node` | Kit drops `remarkMention` | `[Bob](mention:bob)` round trip; `@bob` stays text | Apps that relied on bare-`@` import add their own remark plugin | Adopt |
| D15 | Dispatch | `decodeBySource` plus legacy `rules`, `MdRules`, `mdastToRule`, `createRule`; intrinsic rules override-able; a quirk where an unclaimed source runs another feature's rule (`markdownMappings.ts:289-381`, `convertNodesDeserialize.ts:105-128`); marks compose implicitly by re-decoding the same children (`markdownMappings.ts:421-487`) | One compiled model: `decodeByNode`, `decodeByTag`, `encodeByType`, `encodeByMark`. Intrinsic paragraph, text, break and html are built-in mappings in the same model. Delete the legacy rules. Semantics in "Dispatch semantics" below | Markdown runtime | Two dispatch systems caused the selector collision and the fallback quirk; claim/decline and cumulative marks are different jobs | Internal | All suites; one test per rule in "Dispatch semantics" | None public | Adopt |
| D16 | Public surface cuts | See Findings §Surface | Delete the detached `parseMarkdownSlice` and `parseMarkdownInline` exports; the editor methods `editor.api.markdown.parseSlice` and `parseInline` stay. Cut `allowedNodes`, `disallowedNodes`, `allowNode`, `AllowNodeConfig`, `splitLineBreaks`, parse-side `preserveEmptyParagraphs`, `withoutMdx`, `recovery`, `remarkMdx`, `remarkMention`, `MentionNode`, `MarkdownNodeName`, `markdown-filtered-node`, `markdown-fallback`, `markdown-invalid-source`. **D16b:** cut the `withBlockId` writer and `wrapWithBlockId` (reads stay, per D12) | Markdown runtime | No production consumer, or replaced by D1–D15 | See consumer inventory | Export snapshot; type tests; `rg` for zero references | D16b **user override**: name a persistence consumer to keep the writer, emitted as an attribute rather than a wrapper | Adopt (D16b overridable) |
| D17 | Inline parse | `stripMarkdownBlocks` deletes fences, then unwraps the first element (`markdownConversion.ts:360-409`) | Parse once. Exactly one paragraph-like block yields its inline children; anything else is `markdown-inline-blocks`. Delete the strip helpers | Runtime | Copilot inserts the result; content must not vanish | Copilot unchanged | ```` ```js ```` input is diagnosed, not emptied; a table is rejected | None | Adopt |
| D18 | Loss accounting | Properties dropped silently; `mergeTexts` merges by type only (`convertTextsSerialize.ts:250-270`) | `lossPolicy` governs content (nodes, text, marks without a mapping). Persisted properties nobody encodes produce a `markdown-property-omitted` warning: `node` mappings declare `properties` they encode, tag mappings encode all persisted properties. `mergeTexts` merges only equal containers (name and attributes) | Runtime with schema property declarations | Honest accounting without failing every styled export | `lossPolicy` default stays `reject` | Centered paragraph serializes with a warning; red+blue spans stay distinct | Warning volume on styled docs | Adopt |
| D19 | Typing | Editor `serialize({ document })` accepts broad `EditorDocumentValue` | `MarkdownApi<V>.serialize` takes `EditorDocumentValue<V>`; standalone stays `Value` | Markdown types | Exact editor contracts | Type-only | Type tests | None | Adopt |
| D20 | References and footnotes | `[x][ref]` rejected; footnote definitions wrap blocks in paragraphs; labels `A`/`a` collide | Resolve definitions per conversion; footnote definitions decode block content; allocate unique output labels | Link and Footnote features, plus a runtime definition table | CommonMark coverage | Features | Fixtures from the first audit | None | Adopt |
| D21 | Open slices | Closed slices warn about omitted roots; open slices do not (`MarkdownPlugin.ts:118-214`) | Shared root and metadata accounting for both | Markdown plugin | Consistent loss reporting | Internal | Clipboard slice test | None | Adopt |
| D22 | Remaining options | `plainMarks` typed `MarkdownNodeName`; `spread`; `remarkStringifyOptions`; per-call `remarkPlugins` replaces the configured list | `plainMarks` typed as model mark keys. Keep `spread` and `remarkStringifyOptions`. Cut per-call `remarkPlugins`: its only caller (`markdown-to-editor-demo.tsx:121`) repeats the kit's own plugins; `MarkdownPlugin` configuration owns the list | Markdown types | Smallest truthful surface; one plugin-list owner | Demo reads the kit configuration | Type tests | None | Adopt |

## Dispatch semantics

Decode:

- **Selectors.** `node` and `tag` mappings live in separate maps, so an MDAST
  kind and a tag name never collide.
- **Tag names** must match the grammar name `[A-Za-z][A-Za-z0-9_-]*`. `block`
  is reserved for the identity wrapper. Every mapping on one tag must agree on
  kind (block or inline). Any violation is a compile error.
- **Claim mappings** (elements) on one selector run in descending `priority`.
  Two claim mappings with equal priority on the same selector are a compile
  error, whichever plugins own them.
  - A mapping claims by returning a node or nodes.
  - `undefined` declines and dispatch tries the next mapping. Mention on
    `link` claims `mention:` URLs and declines the rest, so Link handles them.
  - `refuse(message)` stops dispatch and reports `markdown-unsupported-node`;
    later mappings do not run.
  - When every mapping declines, the node is unsupported: a `node` selector
    drops the node, a `tag` selector keeps its source text.
- **Mark mappings** (`mark: true`) on one selector are cumulative, not
  first-match.
  - Each returns its exact schema mark value or `undefined`; the runtime owns the target key.
  - The runtime merges every contribution, then decodes the children once.
    The five style marks on `span` compose this way, replacing today's
    re-decode chain.
  - A selector holds either claim mappings or mark mappings, never both
    (compile error).
- **Several selectors per type.** One Plate type may be decoded from several
  selectors (Image: `node: 'image'`, `tag: 'img'`, `tag: 'figure'`).

Encode:

- **One encoder per key.** Exactly one encoder per Plate element type and per
  mark key; a duplicate is a compile error.
- **Mark encoders** return a standard container (`strong`, `emphasis`,
  `delete`, `inlineCode`) or a tag with attributes.
- **Merging.** Adjacent text merges only when its container list is equal,
  including tag names and attributes.

## Attribute codec

The Markdown runtime owns the wire form. The schema property kind selects the
rule, and the schema validates the decoded value.

| Property kind | Decode (attribute → value) | Encode (value → attribute) |
| --- | --- | --- |
| `string` | Entity-decoded text as-is; no trimming or coercion | Escaped text |
| `number` | `^-?(\d+(\.\d*)?\|\.\d+)([eE][+-]?\d+)?$`, finite | Shortest round-trip decimal |
| `boolean` | Bare attribute or `"true"` → `true`; `"false"` → `false` | `true` → bare attribute; `false` → `"false"` |
| `enum` | String that is one of the declared values | The value |
| `json` | `JSON.parse` of the entity-decoded text, then schema validation | `JSON.stringify`, escaped |
| `set` | JSON array of strings | JSON array of strings, sorted |

- **Escaping.** Encode `&` → `&amp;`, `"` → `&quot;`, and line endings →
  `&#10;` / `&#13;`, because the grammar rejects line endings inside
  attributes; the hostile-literal probe shows a raw newline breaking the tag.
  Decode `&quot; &amp; &lt; &gt; &apos;` and numeric references.
- **Defaults.** Omitted on encode unless the property sets
  `omitDefault: false`. A missing attribute on decode takes the schema default
  through fitting.
- **Required properties.** A missing required property makes the mapping
  `refuse`, so the tag keeps its source text.
- **Not encoded.** Runtime-only and generated properties (for example
  runtime keys) are never encoded.
- **Unknown or invalid.** An undeclared attribute, or a malformed value
  (number, boolean, enum, JSON or set), is omitted with
  `markdown-property-omitted` (`phase: 'parse'`), and the rest of the element
  still decodes.

## Execution slices

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| S1 Grammar and writer | Markdown runtime | D1, D2, D3, D9, D10 (grammar side), D11, D12: move `plateTags.ts` into `markdown/lib/internal/`; add the micromark packages as direct dependencies; compile the registry; the runtime installs the grammar; canonical writer | Plan accepted | Package suites green with the kit still on MDX (grammar dormant behind the registry) | CommonMark corpus test (devDependency corpus); totality fuzz; legacy corpus identity including media/figure/figcaption and codeDrawing; writer round trip; offset test |
| S2 Contract and boundaries | Core authoring contract + runtime + features | D4, D5, D6, D7, D8, D15, D17: `node`/`tag` selectors, schema attributes, `refuse`, error boundaries, raw-HTML policy, one dispatch, inline parse | S1 | All 36 mapping sites migrated; no `throw` for content in mappings; `parse*` never throws on input | Type tests; the G8 cases; refusal and schema-boundary fixtures; `rg` gates for `parseAttributes`, `propsToAttributes`, `from:` |
| S3 Default switch and cuts | Markdown runtime + kit + AI + registry + demos | D10 (`partial`), D13, D14, D16, D19, D22: flip the kit to the Plate grammar, remove MDX machinery and cut options, migrate AIChat (`AIChatPlugin.ts:1609-1610`) and the streaming demo to `partial`, move the mention mapping. Registry: `markdown.tsx`, `markdown-to-editor-demo.tsx` (sample source and per-call plugins), `markdown-streaming-demo.tsx`, `markdown-joiner-transform.ts` (MDX tag buffering becomes registered-tag buffering or goes), server-side example page. Prompt wording only: `common.ts:19`, `getGeneratePrompt.ts:136` and `getCommentPrompt.ts:229,241` say "Markdown tags" instead of "MDX"; AI product policy is unchanged. Package: drop `remark-mdx` from `package.json` and `entrypoint-dag.mjs:394` | S2 | No `remark-mdx`, `htmlToJsx`, `recovery`, filter, `withBlockId` writer or `remarkMention` references outside history | Export snapshot; consumer rerun; AI chat table edit (each returned cell `content` value parsed as Markdown) and comment flows; streaming demo and AI chat browser proof (Verify Plate); `pnpm --filter www build:registry` |
| S4 Fidelity repairs | Runtime + Link/Footnote | D18, D20, D21 | S2 | Property accounting, `mergeTexts`, references, footnotes, open-slice roots | Fixtures from the first audit probes, rewritten as package tests |
| S5 Docs, doctrine, release (after S6) | Plate Docs, Best API repair, Sync Vision, Plate Next | Docs (each with `.cn.mdx`): `(serializing)/markdown`, `(ai)/ai`, `(ai)/copilot`, `(elements)/{footnote,date,details,media,mention}`, `installation/{rsc,node}`, `(guides)/{serializing,authored-changes}`, `api/editor-api`, `examples/export`. Vision: `docs/vision/plate.md:370-372` (block-ID writer) and `:515-538` (custom MDX tag identity → registered Markdown tag identity). Rules: `best-api/rules/behavior-and-ownership.md:423-441`, `best-api/rules/schema-and-identity.md:221`, `plate-plugin-creator/rules/{creation-flow.md:132-143,typing.md:210-237}`, `plate-next/rules/review-law.md:426-443`; append a Plate Next doctrine version; one Skiller apply for mirrors. Tooling: `check-plate-schema-adoption.mjs:6499` if `plainMarks` typing changes. Changeset | S3 | No docs, rules or Vision teach MDX, `recovery`, filters, per-call plugins or the `withBlockId` writer | Docs build; mirrors regenerated and proved; doctrine version appended |
| S6 Benchmark rerun (before S5) | Benchmark | Production path vs `origin/next` baseline | S3 and S4 | Correctness and Plate-extension attribution gate pass; every absolute miss remains explicit | Tracked runner and receipt below |

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Grammar is total | Prototype G2: 0 throws on 20k strings | Package fuzz test (seeded) | verified |
| No change for tag-free CommonMark | Prototype G1: 648/652 spec examples identical; the 4 others use `<del>` | Corpus test with an allowlist of registered-tag examples | verified |
| Legacy MDX output reads | G3 13/13, via the D12 re-read | Corpus extended with media, figure, codeDrawing, footnotes | verified |
| Hand-written nesting | G4 7/8 read; list+callout fails (flat-list model, D7 turns it into a diagnostic) | Fixture suite | verified |
| Tag-boundary offsets exact | G6 38 elements | Offset and split-remainder tests | verified |
| Writer round trip | G7 13/13; MDX kit reads output 13/13 | Round-trip suite | verified |
| Writer escapes hostile literals | `hostile-literals.log`: 8/11 round trip. Literal `<callout>`, `</callout>`, `<del>`, `<u>`, `<img>` text, tags inside inline and fenced code, quotes/`&`/`<` in attributes, entities and braces, and nested identical `details` all pass. Fails: a newline in an attribute (fixed by the codec escaping), and numeric- or JSON-looking string attributes (fixed by D5) | Suite covers codec escaping, numeric- and JSON-looking strings, malformed values, sets, booleans and registered tags in nested surfaces | verified |
| Refusals diagnosed | Sources in Findings | Fixtures per D6, D7, D8, D9 | verified |
| Plate extension causes no attributable regression | Scale contract below | Tracked S6 receipt; semantic guards pass; B1–B3 have no clear failures; paired plain tokenizer has equal or worse B4 growth | verified; absolute B4 budget remains failed |

## Scale contract

- Applicability and source evidence: parse cost grows with source size, tag
  count, nesting depth and, when streaming, with the number of accumulated
  prefixes (`AIChatPlugin.ts:1608-1611` reparses the whole content per chunk).
- User operation, current owner, proposed owner: document/slice parse and
  streaming preview; current = MDX grammar + `htmlToJsx` + recovery; proposed =
  CommonMark + registered-tag construct + pairing pass.
- Cohorts: normal 5 KB, large 92 KB, stress 366 KB (legacy MDX-writer corpus);
  angle-bracket prose 41 KB; streaming 157 accumulated prefixes of 10 KB;
  grammar scaling at 500 → 4000 inline tags and 500 → 1000 nested tags.
- Frozen budgets (written in `bench.ts` before the first run): B1 ≤ 1.10×
  current on legacy; B2 ≤ 1.25× plain CommonMark on prose and streaming; B3
  mdast ≤ 1.5× plain and per-KB growth ≤ 1.5×; B4 doubling ≤ 2.5×. A ratio
  within 10% of its bound is inconclusive.
- Current baseline and target: the tracked runner records exact source hashes,
  frozen cohorts and separate baseline/candidate artifacts; the tracked receipt
  was produced with Bun 1.3.12 on darwin/arm64.
- Final results: B1 legacy large and normal are inconclusive (1.04× and 1.06×),
  stress passes (0.95×); B2 prose and streaming pass (0.84× and 0.87×); B3
  mdast large is inconclusive (1.39×), prose and per-KB growth pass (1.13× and
  1.29×); serialization passes (0.97×). B4 nested passes (2.14×). B4 inline is
  inconclusive at 500→1000 (2.63×) and fails at 1000→2000 and 2000→4000
  (3.38× and 3.37×). The paired plain tokenizer fails with 3.09×, 3.32× and
  3.55× growth while remaining slower at every size. Therefore
  `absoluteBudget` is `fail` and `plateExtensionAdoption` is `pass`.
- Deterministic work indicators: element counts per cohort (500/1000 elements
  at 500/1000 tags); correctness guard identical documents on B1 and prose.
- Correctness guard: candidate document equals the current kit's on legacy
  cohorts and plain CommonMark's on prose.
- Final production-path rerun: Benchmark owns S6. The exact baseline,
  candidate and compare command templates are embedded in
  `benchmarks/editor/benchmarks/results/plate-markdown-dialect-latest.json`.

## Findings

- **Mappings** (36 sites, all in `packages/platejs/src`):
  - Flow tags: callout, summary, details, toc, column, columnGroup,
    codeDrawing, audio, file, video, mediaEmbed, img (HTML-void), and
    figure/figcaption owned by Image.
  - Text tags: mark, kbd, u, del, sub, sup, date, and `span` shared by 5 style
    marks.
  - `block` is the core ID wrapper.
  - Decode throws: `BaseCalloutPlugin.ts:36`, `BaseDetailsPlugin.ts:56, 106`,
    `BaseListPlugin.ts:959`, `BaseTablePlugin.ts:904`, `markdownDocument.ts:154`.
  - Encode throws: `BaseTablePlugin.ts:365, 380, 439, 957`.
- **Contract**:
  - `MarkdownNodeMapping.ts` imports four MDX types (:29-34).
  - `SourceNodeMap` has 51 keys, 13 of them unused.
  - `DefaultMdastNode` is dead.
  - Decode-context members `report`, `decodeTexts`, `serializeUnknown` and
    `splitLineBreaks` are used by no feature.
- **Runtime**:
  - Dispatch flow-vs-text is ignored (`convertNodesDeserialize.ts:57`).
  - An unclaimed source can run another feature's legacy rule
    (`convertNodesDeserialize.ts:105-128`).
  - The block-ID wrapper throws `MarkdownBlockIdError` on input (:70-103).
  - Per-call `remarkPlugins` replaces the plugin list; the default list is
    empty (`MarkdownPlugin.ts:292`).
- **Surface**: `platejs/markdown` exports 7 values and 24 types
  (`markdown/lib/index.ts:1-33`).
- **Consumers**: see "Consumer inventory".

## Consumer inventory

Counts are non-generated occurrences from the consumer sweep. Generated registry
files (`apps/www/public/r/**`, `__registry__`, `generated/`) and `templates/**`
regenerate; never hand-edit them.

| Item | Runtime | Registry/apps | Docs | Agent rules | Tests |
| --- | --- | --- | --- | --- | --- |
| `remarkMdx` / `remark-mdx` / `withoutMdx` | ~25 | 4 | 14 | 5 files + mirrors | ~25 |
| `recovery` / `markdown-fallback` | 10 (only product caller `AIChatPlugin.ts:1609-1610`) | 2 | 2 | 0 | ~15 |
| Node filters | ~35 | 0 | 3 | 0 | ~35 |
| `splitLineBreaks` / `preserveEmptyParagraphs` / `plainMarks` / `spread` | ~30 | 4 + tooling lint | 6 | 0 | ~20 |
| `withBlockId` writer | ~20 | 0 (the comment prompt's `<block ref>` is its own protocol) | 5 | 0 | ~30 |
| Standalone vs editor API | 17 callers | 10 | ~45 | 0 | ~40 |
| `remarkMention` / `MentionNode` | 12 | 4 | 5 (`mention.mdx` documents bare `@name`) | 0 | 6 |
| `lossPolicy` (Markdown) | 16 | 0 | 7 | 0 | 1 |
| AI prompts naming MDX | 3 wrappers in `platejs/ai` | 12 | 4 | 0 | — |

The MDX-only suites are deleted with their owners: `htmlToJsx.spec.ts`,
`splitIncompleteMdx.spec.ts`, `markdownToSlateNodesSafely.spec.tsx`,
`mdx.spec.tsx`, `mdxMarks.spec.tsx`, `getRemarkPluginsWithoutMdx.spec.ts`,
`splitLineBreaks.spec.tsx`, `wrapWithBlockId.slow.tsx`. Their
still-meaningful cases (marks, nesting, streaming prefixes) move to the new
fixture suites.

## Decisions and tradeoffs

- One canonical dialect beats a canonical + legacy pair. Existing content
  carries no marker, and the dialect law reads it.
- Keep the MDX-shaped MDAST node (D3) instead of inventing a neutral node:
  prior art, and zero handler churn.
- Property omission warns and content loss follows `lossPolicy` (D18). This
  keeps `reject` meaningful without failing every styled export.
- Raw HTML inside Markdown is not routed to the HTML format owner. That would
  need a DOM and cross-node pairing, and no job names it. Rejected for now.

Review fixes:

- Independent plan review, eight points; all amended:
  1. Dispatch semantics are now specified.
  2. D5 now specifies a runtime-owned wire codec.
  3. Totality restated as an honest contract.
  4. Hostile-literal writer proof added; it found two real defects.
  5. D16 names the detached exports.
  6. Draft duplicates removed from the evidence folder; force-add
     instruction added.
  7. AI table risk corrected.
  8. S6 now runs before S5.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Benchmark seeded from `testValue` (not schema-valid) | 1 | Seed from the 13 schema-valid legacy sources | Resolved; gate runner now reports skipped serializations |
| B4 inline scaling FAIL under frozen rule | 1 | Isolate against plain CommonMark with warmup | Attributed to the shared tokenizer; recorded |

Verification evidence:

- Prototype gates rerun after the corpus fix (`gates.log`): G0–G3 and G5–G8
  pass. G4 fails honestly at 7/8: a callout inside a list throws in both
  parsers, and D7 turns that into a diagnostic.
- Scale probe `bench.log`, plus the B4 follow-up `bench-b4-followup.log`.
- Hostile-literal writer probe `hostile-literals.log`: 8/11 round trip; the
  3 failures are routed to the attribute codec and D5.
- Three read-only source inventories (mappings, runtime internals, consumers);
  citations are inline above.
- `node tooling/scripts/review-ledger.mjs check`: see closure below.

Final handoff prepared:

- Ownership and target API:
  - Markdown runtime owns the grammar, registry, dispatch, writer, boundaries
    and the `partial` preview.
  - Core owns the `node`/`tag` mapping contract.
  - Features own their mappings, declared nested tags and `refuse` decisions.
  - The schema owns attribute typing.
  - Target call sites are above.
- Public breaks and adoption:
  - Grammar and dispatch: D1, D4, D13, D15.
  - Attributes, refusals and streaming: D5, D6, D10.
  - Mention and cuts: D14, D16, D22.
  - Every consumer is listed in the consumer inventory; adoption happens in
    S2 and S3; no aliases.
- Runtime/package/docs/browser proof:
  - Chromium proves AI chat streaming, AI table edit, generated comments and
    editable/static streaming.
  - Registry output is regenerated from source.
  - Docs, Vision, doctrine, Plate Next v248 and the changeset match the final
    public contract.
- Scale:
  - Pre-acceptance receipt: no gross regression; B4 was attributed to the
    shared tokenizer.
  - S6 reruns on the production path with the same cohorts and budgets.
- Proof and execution risks: see Open risks.
- Execution order: S1 → S2 → S3 → S4 → S6 → S5 completed. D13 (MDX input)
  and D16b (`withBlockId` writer) were cut because no current consumer earned
  either surface.

Timeline:

- 2026-09-28 Plate Plan created from the prototype correction record.
- 2026-09-28 Mapping, runtime and consumer inventories consumed. Scale probe
  run, the `testValue` seed fixed, and B4 isolated.
- 2026-09-28 Decisions D1–D22 settled; handoff prepared.
- 2026-09-28 Review amendments: dispatch semantics, attribute codec, honest
  totality contract, hostile-literal proof (8/11, two defects routed to D5 and
  codec escaping), D16 wording, evidence folder trimmed, AI risk corrected,
  S6 moved before S5.
- 2026-09-28 Closure repairs: mark mappings return exact schema values and use
  childless `wrap`; inherited persisted text properties are named `marks`;
  schema attributes preserve JSON-looking strings; valid image-list content
  and list correction are covered; stale fixtures were repaired; deterministic
  Chromium AI/streaming proof passed; the production benchmark was committed
  to a tracked runner and receipt with its absolute B4 failure explicit.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implemented and verified in the working tree |
| Where am I going? | Final ledger receipt and user handoff |
| What is the goal? | Durable Markdown dialect and conversion contract with complete adoption proof |
| What have I learned? | The registered-tag grammar is sound; the remaining scaling limit belongs to the shared CommonMark tokenizer |
| What have I done? | See Execution record and Test state |

Open risks:

- Registered HTML-named tags (`del`, `u`, `mark`, `sub`, `sup`, `kbd`,
  `details`, `summary`, `figure`, `img`, `span`) intentionally decode as
  Plate elements when their mappings are installed.
- Browser proof is Chromium-only.
- Streaming still reparses the accumulated Markdown for each chunk; incremental
  parsing remains separate performance work.
- The absolute B4 inline-tag scaling budget remains red, but the control shows
  plain CommonMark is slower at every measured size with the same superlinear
  shape. The tracked benchmark receipt keeps that limit explicit and does not
  attribute it to the Plate tag extension.
