# Markdown API review

Status: Complete — assessment only; implementation is not adopted.

Request: `$best-api-review audit markdown`.

**Verdict: Pursue.** Delete whole-source HTML-to-JSX rewriting and destructive
inline stripping: both lose meaning before diagnostics can account for it.
Retain serialized block identity, but rebuild it on the single canonical list
serializer: the earlier recommendation to cut `withBlockId` contradicted the
settled persisted-identity law. Cut the unconsumed node-filter policy instead;
its three controls disagree on MDX identity and add a second selector ontology.
Keep parse/serialize naming and feature ownership while shrinking the public
surface and compiled dispatch model.

The job is to import, export, paste and preview Markdown while preserving
representable content, identifying intentional omissions and refusing unsupported
loss by default. Callback input must match its inferred type. Detached conversion
must not need an editing runtime. None of these laws requires a universal codec,
another package, or Markdown in Plite.

Method: Best API Review/history-v3, first-principles comparison, source inspection,
two bounded independent source reviews, and disposable probes. Model: GPT-6 / Codex.

The first pass's **10/10** count covered behavioral buckets rather than the
public API and was therefore overclaimed. This pass reviewed all **31 named
exports** from `platejs/markdown`, all **7 Markdown authoring types** exported
from core, all **15 unique parse/serialize policy fields**, **17 material
production call shapes**, and **18 non-entrypoint helper/legacy units**. They are
grouped into the 10 units below. Excluded 0; unresolved unit dispositions 0.
All 10 are Pursue. These counts do not claim every possible input or model
property.

| Unit | Verdict and next owner |
| --- | --- |
| Public operations, carriers and exact-editor typing | Pursue. Keep document/slice/inline editor methods plus detached document parse/serialize. Cut detached `parseMarkdownSlice` and `parseMarkdownInline`: they have no production consumer. Specialize editor serialization's `document` input to the editor value type; only outputs are exact today. |
| Plugin defaults and per-operation policy | Pursue. Delete `allowedNodes`, `disallowedNodes`, `allowNode`, `AllowNodeConfig` and public `withoutMdx`; no production caller uses them, MDX tags violate filter identity, and MDX negation duplicates plugin selection. Keep `plainMarks` as a separate text-preserving job, but replace the conflated `MarkdownNodeName` selector type during design. Make empty-paragraph policy serialization-only or canonical; its parse field is dead. |
| Parsing, limits, failures and synchronous extensions | Pursue. Unexpected decoder exceptions become source errors or successful recovery. `remarkMention` deletes delimiters; `remarkMdx` eagerly imports an optional dependency. Task: distinguish syntax/content rejection from programmer faults, retain the generic sync boundary, move mention syntax to its feature and use upstream `remark-mdx` directly. |
| Feature mappings, compilation and dependencies | Pursue. 44 mappings at 40 declaration sites in 20 files inspected. Shared MDAST/MDX dispatch violates callback inference, and compilation adapts modern mappings back into legacy `rules`. Task: compile one source/tag/model/mark dispatch and retain colocation. |
| CommonMark/GFM, references and footnotes | Pursue. Reference links are rejected; alignment/titles disappear; complex footnotes get invalid wrappers; labels can collide. Task: resolve references and repair feature mappings. |
| MDX/HTML and incomplete-input recovery | Pursue. Code literals change and recovery loses later paragraphs. Task: remove raw-source rewriting and preserve or diagnose the complete suffix. |
| Serialization, marks, properties and secondary roots | Pursue. Mark merging, list filtering and the alternate block-ID list path corrupt meaning; properties disappear silently. Task: retain durable IDs, remove the alternate list algorithm and account for semantic loss. |
| Clipboard negotiation and open slices | Pursue. Open slices omit secondary-root warnings that closed slices emit. Task: share loss accounting while retaining open-depth handling and native fragment authority. |
| Registry, application and external-text consumers | Pursue. File controls handle results; Copilot needs true inline output; conversion demo silently retains old preview on failure. Task: adopt repaired contracts and expose demo failures. |
| Documentation, authoring types and proof | Pursue. Runtime violates documented inline/error contracts; source doctrine teaches deleted per-operation overrides. Task: repair teaching and targeted proof with adoption. |

The public-surface disposition is explicit:

| Surface | Disposition |
| --- | --- |
| `MarkdownPlugin`, four editor operations, detached `parseMarkdown`/`serializeMarkdown`, result/diagnostic/location/options types | Keep. Document, slice, inline, detached-document and installed jobs are current and distinct. Make editor serialization input exact. |
| Detached `parseMarkdownSlice`, `parseMarkdownInline` | Cut. Their only repository consumers are type/proof fixtures; real slice/inline jobs use installed editor methods. |
| `remarkPlugins`, `remarkStringifyOptions`, sync-plugin types | Keep. They are the bounded synchronous unified extension boundary. |
| `remarkMdx` | Cut. Its eager wrapper makes optional `remark-mdx` a load-time dependency and exists mainly for hidden function tagging. Applications should import the upstream extension directly. |
| `remarkMention`, `MentionNode` | Move/delete from the generic runtime. Mention owns its custom syntax; design the smallest feature-owned syntax contribution, repair whitespace preservation, and remove generic MDAST augmentation/tag machinery. |
| `limits`, `lossPolicy`, `recovery`, `projection` | Keep. They own resource admission, explicit loss, incomplete-stream parsing and authored views. |
| `withoutMdx` | Cut from the public policy. It is a special-case negation of one `remarkPlugins` member and has no production caller. Keep any no-MDX fallback private to incomplete-stream recovery. |
| `spread`, `remarkStringifyOptions` | Keep. They select standard Markdown list/string formatting rather than model content. |
| `plainMarks` | Keep the job. The schema-descriptor consumer deliberately preserves text while omitting unsupported mark syntax; its selector typing needs the model-key ontology, not `MarkdownNodeName`. |
| `allowedNodes`, `disallowedNodes`, `allowNode`, `AllowNodeConfig` | Cut. They have no production caller, overlap feature/schema selection, and use incompatible MDAST-kind, MDX-tag and model-property names. |
| `splitLineBreaks` | Cut from Markdown. It reinterprets soft breaks and separator lines as document blocks, has no production caller and is a line-oriented text import mode rather than Markdown semantics. |
| `preserveEmptyParagraphs` | Remove from parse policy because it is unused there. During design, choose one diagnosed serialization rule or keep a serializer-only option if a concrete caller requires nonstandard zero-width preservation. |
| `withBlockId` | Keep the durable identity job. Exact naming can change, but serialized persisted IDs and compatible reads remain required; only the duplicate serializer path is cut. |

Five separate scopes: incremental streaming ownership/performance, generic list
sequence architecture, HTML sanitizer architecture, AI product policy and
external-editor synchronization. Their Markdown boundaries were inspected where
relevant; none is marked completed here.

## Decisive findings

1. **Delete source rewriting before parsing.**
   [`markdownConversion.ts`](../../packages/platejs/src/markdown/lib/internal/markdownConversion.ts)
   sends the whole source through
   [`htmlToJsx`](../../packages/platejs/src/markdown/lib/deserializer/utils/htmlToJsx.ts).
   Inline code containing `<img src=x>` becomes `<img src="x" />`; fenced
   `<!-- note -->` becomes `{/* note */}`. Both succeed without diagnostics,
   even without the MDX parser installed. `withoutMdx: true` preserves them.
   Handle supported HTML/MDX syntax at its parser boundary, not through regexes
   over code and ordinary text. The rewrite also disables source positions for
   the whole document whenever it changes one byte, so an unrelated later
   diagnostic loses its offset and excerpt. Adoption proof must preserve exact
   locations after the preprocessing cut.

2. **Keep inline parsing; cut strip-then-unwrap.**
   `parseInline('Keep\n\n```js\nlost()\n```')` succeeds with only `Keep`.
   A GFM table succeeds with `tableRow` nodes in its purported inline slice.
   [`stripMarkdownBlocks`](../../packages/platejs/src/markdown/lib/deserializer/utils/stripMarkdown.ts)
   deletes fences before validation; `deserializeInlineMdWithRuntime` takes the
   first element's children without checking their role. Copilot inserts this
   result. Parse once, choose an explicit inline projection, and reject or
   diagnose other blocks. Reuse schema role checks rather than another grammar.

3. **Recovery must not hide content loss or callback bugs.**
   `<callout>\n\none\n\ntwo` under incomplete-stream recovery becomes only
   `<callout>`, with a warning claiming preservation. A decoder throwing
   `TypeError` on `<callout />` becomes successful literal-text fallback under
   the same mode. Ordinary decoder errors become `markdown-invalid-source`.
   Some callout/details callbacks deliberately throw for unsupported content,
   so wrapping every exception identically would be wrong. Route those intended
   refusals through content diagnostics; unexpected callback/configuration
   faults must throw with their owner. Restrict recovery to incomplete syntax.
   This repairs the existing mode, not incremental streaming architecture.

4. **Separate MDAST kind from MDX tag selection.**
   [`MarkdownNodeMapping`](../../packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts)
   types `from: 'paragraph'` as an MDAST Paragraph, but a `<paragraph>` tag
   reaches that callback as `mdxJsxFlowElement`. One map indexes both names.
   The closed union also cannot express arbitrary custom tags or reference
   node kinds. Use distinct inferred selectors. Delete the unused
   `DefaultMdastNode` conditional: its sole consumer removes `decode`, the field
   needing that inference. Do not erase every callback's node type. The same
   collision breaks the public filters: `allowedNodes: ['callout']` drops a
   callout, `disallowedNodes: ['callout']` retains it, and `allowNode` receives
   `mdxJsxFlowElement`. Since those filters have no production consumer, delete
   them instead of inventing a fourth universal selector vocabulary.

5. **Give references a conversion-local document owner.**
   `[label][ref]` with a definition fails explicitly as unsupported. That is
   honest but insufficient CommonMark coverage. Footnote definitions wrap
   blockquotes in paragraphs despite accepting block content, causing
   `EditorSchemaValidationError`. Exported refs `A` and `a` normalize to the
   same Remark identifier; an unresolved ref exports as ordinary text syntax.
   Resolve input definitions and allocate or validate output labels per
   conversion. Keep node mappings on their features. No public reference
   registry is justified.

6. **Remove unsafe serializer shortcuts.**
   [`mergeTexts`](../../packages/platejs/src/markdown/lib/serializer/convertTextsSerialize.ts)
   compares only AST type: red `RED` plus blue `BLUE` becomes one red span;
   underline plus keyboard text becomes one underline element. No loss is
   reported. Merge only equivalent formatting containers. Separately,
   filtering the last pending list item prevents flushing the retained item:
   `[KEEP, DROP]` can become an empty string with a warning only for `DROP`.
   Flush retained content independently of the next unfiltered input. Reuse
   the settled list sequence owner without reopening list topology.

7. **Retain persisted block identity; cut its second serializer.**
   `withBlockId: true` currently turns a parent, child and sibling into three
   top-level `<block>` lists. That is a correctness defect in the alternate list
   path, not evidence that serialized identity has no job. Plate's identity
   doctrine and the completed August adoption explicitly make Markdown the one
   legitimate persisted-ID consumer; ordinary and flat-list round trips are
   tested. Reuse the canonical list conversion and wrap its result without
   flattening hierarchy. Preserve compatible reads for already serialized
   wrappers. The first-pass deletion recommendation was wrong because it treated
   repository call-site absence as stronger than a persisted-data law.

8. **Account for actual loss consistently.**
   Table alignment and link titles disappear on parse; centered text and Roman
   list styling disappear on export without diagnostics. Preserve representable
   meaning at the feature owner and diagnose unsupported semantics. This does
   not require encoding every internal property, but the current architecture
   cannot fulfill that rule: compilation admits one encoder per document
   identity, and only that owner can report serialization loss. Text Align, for
   example, cannot contribute to intrinsic paragraph conversion without
   replacing it. Design the smallest composable property contribution/accounting
   hook or explicitly narrow the fidelity promise. Closed clipboard slices warn
   about an omitted declared root; the open path omits the same root and reports
   `lossy: false`. Share root accounting. Projection-defined omissions may warn
   on success: omitted metadata does not automatically need to fail under
   `lossPolicy: 'reject'`.

9. **Delete the public node-filter family.**
   `??` makes an explicit `disallowedNodes: null` inherit a configured denylist,
   MDX tags use the wrong identity, and no production caller uses any of the
   three controls. `allowedNodes`, `disallowedNodes` and `allowNode` overlap
   schema/plugin selection while mixing source kinds, tags, marks and model
   properties. Delete them and `AllowNodeConfig`; do not consolidate them into a
   new filter abstraction. Keep `plainMarks` distinct: the schema-descriptor
   example uses it to retain text without unsupported formatting, but its type
   should name model mark keys rather than the conflated `MarkdownNodeName`.
   Cut public `withoutMdx` too: it is a no-caller special case for subtracting
   one extension from `remarkPlugins`; incomplete recovery can own its private
   parser mode without exposing that knob on every parse call.

10. **Remove generic ownership of feature syntax.**
    [`remarkMention`](../../packages/platejs/src/markdown/lib/plugins/remarkMention.ts)
    consumes any whitespace in `(?:^|\s)` but restores only a literal space.
    `hello\n@bob` and `hello\t@bob` therefore become `hello` plus a mention, with
    no lossy diagnostic. Mention owns this custom syntax and already consumes the
    resulting dialect in `BaseMentionPlugin`; move the syntax contribution to
    that feature, preserve delimiters and delete the generic public
    `MentionNode`/MDAST augmentation. Task must choose the smallest feature-owned
    parser contribution rather than forcing Mention to replace intrinsic text.

11. **Delete optional-extension wrapper/tag coupling.**
    `remarkMdx` statically imports optional `remark-mdx`, and the built Markdown
    entrypoint eagerly imports that wrapper. Loading `platejs/markdown` therefore
    depends on an extension advertised as optional. Applications already import
    GFM, math and emoji remark plugins directly; import `remark-mdx` directly
    too. Deleting public `remarkMdx` and `withoutMdx` also deletes the hidden
    WeakMap identity protocol. Incomplete recovery owns its private fallback
    parser. A direct probe confirmed the existing identity filter works; the cut
    is ownership and package hygiene, not a claim that it currently misfilters.

12. **Compile one dispatch model, not a modern map plus legacy rules.**
    Compilation stores modern mappings in `decodeBySource`, adapts encoders back
    into `MdNodeParser`, and stores them again in `rules`; intrinsic handlers use
    that legacy map. Replace both with one compiled model containing AST-kind
    decoders, MDX-tag decoders, model-identity encoders and mark encoders. Delete
    `MdRules`, `MdNodeParser`, `mdastToRule`, `createRule` and
    `compiledMappings.rules`. This directly removes the selector collision
    instead of teaching two dispatch systems to agree.

13. **Cut unearned detached fragments and finish exact editor typing.**
    No production caller uses standalone `parseMarkdownSlice` or
    `parseMarkdownInline`; Copilot and AI insertion use installed editor methods.
    Cut the detached helpers and their public exports. Conversely,
    `MarkdownApi<V>` specializes parsed outputs but its serialize input still
    accepts broad `EditorDocumentValue`, so a typed editor can serialize an
    incompatible document. Specialize `document` to `EditorDocumentValue<V>`;
    standalone conversion remains broad `Value`.

## Target and alternatives

The normal calls remain:

```ts
const result = editor.api.markdown.parse(source);
if (result.ok) editor.update.value.replace(result.document);

const exported = serializeMarkdown(document, { plugins: BaseEditorKit });
```

Proposed flow: unchanged source → configured syntax parser → conversion-local
reference resolution → one compiled typed dispatch model → schema admission and
diagnosed result. Serialization uses one primary mapping plus composable
feature-property contributions, one list path and explicit loss accounting.
Feature-owned syntax contributions feed the same parser boundary. This is an
ownership direction; Task must settle the smallest contribution contract and
measure any material runtime cost.

| Alternative | Decision |
| --- | --- |
| Keep public `withoutMdx` | Reject: plugin configuration owns language extensions; recovery can use a private fallback grammar. |
| Keep `remarkMdx` as a tagged Plate wrapper | Reject: it turns an optional extension into an eager entrypoint dependency and supports the special-case negation protocol. |
| Keep mention syntax in generic Markdown | Reject: the feature owns the dialect; generic ownership adds a public AST node and parser dependency. |
| Patch source regexes and retain both list serializers | Reject: source regexes lack syntax context, and durable identity does not justify a second list algorithm. |
| Delete `parseInline` | Reject: Copilot has a real inline insertion job. Enforce the promised carrier. |
| Keep all standalone functions | Reject: detached document parse/serialize have current jobs; detached slice/inline helpers do not. |
| Keep only editor APIs | Reject: server document conversion is a distinct current job. |
| Universal codec/compiler/session or Markdown in Plite | Reject: no additional cross-format or substrate law needs one. Reuse documents, slices and schema roles. |
| Centralize feature mappings in Markdown | Reject: recreates optional-feature dependencies and reverses supported colocation. |
| Repair all three public node filters | Reject: no production job pays for their overlapping selector ontology. Cut them. |
| Cut serialized block identity | Reject: violates the settled persisted-data law and would strand compatible reads. |
| Retain unused processor/stripping helpers | Reject: `markdownToAstProcessorWithRuntime`, `stripMarkdownInline` and aggregate `stripMarkdown` have no production caller; delete the family once inline parsing no longer uses `stripMarkdownBlocks`. |
| Retain modern mappings plus legacy `rules` | Reject: duplicate dispatch is the source of selector inconsistency and blocks composable ownership. |
| Keep format ownership; cut unsafe preprocessing, unearned API and duplicate dispatch; compose diagnosed conversion | Pursue: removes corruption and duplicated paths without a universal codec or new package. |

## History and consumers

Retain July feature colocation and the type-only codec package cut. Recovered
receipts remain historical and unbound; their old proof was not replayed.
Retain September format ownership, parse/serialize naming, closed rootless
direct slices, explicit authored projections and broad standalone `Value`.
Retain August's serialized persisted-identity job and September's document-first
preservation decision; the first pass reopened those conclusions without
accounting for the hard data law. Current exact-editor contracts were inspected;
no fresh typecheck ran. Reopen Markdown correctness, selector policy and the
duplicate ID/list implementation only. HTML/DOCX repairs and native slice
fitting conclusions are unaffected. Retain the list audit's owner direction.
September 10 streaming plans remain separate history.

Import/export controls branch on diagnosed results. Copilot depends on inline
admission; AIChat uses explicit recovery for unfinished output and strict final
parsing. The streaming demo exercises recovery. The conversion demo silently
keeps its old result on failure and needs visible error state during adoption.
Prism preview examples do not call the converter and cannot prove it. Plite
external-text transport does not call this Markdown runtime. Registry policy
stays copied; AI policy and streaming performance stay outside this review.

## Proof and limits

The [parser probe](../plans/artifacts/2026-09-28-markdown-api-audit/parse-probe.test.ts)
has **1 passing control and 7 failing assertions** in
[the final log](../plans/artifacts/2026-09-28-markdown-api-audit/parse-probe-final.log).
Those failures reproduce defects; they are not implementation verification.

Bounded existing runs passed: MarkdownPlugin **30/30**; sync/GFM **8/8**;
mapping/features **30/30** across six files; serializers **59/59** across five.
GFM overlaps two runs, so these are not a unique-test total. The serializer
[observation probe](../plans/artifacts/2026-09-28-markdown-api-audit/serializer/serializer-probes.test.ts)
captured [22 outcomes](../plans/artifacts/2026-09-28-markdown-api-audit/serializer/serializer-results.json).
Its passing assertion counts observations, not correctness. Earlier setup
failures are not supporting evidence. The independent
[mapping receipt](../plans/artifacts/2026-09-28-markdown-api-audit/mapping-proof.md)
records commands and observations.

The [last-pass probe](../plans/artifacts/2026-09-28-markdown-api-audit/last-pass-probe.test.ts)
has **0 passing and 5 failing assertions**. It reproduces all three MDX filter
identity failures and newline/tab loss in `remarkMention`; the
[observation receipt](../plans/artifacts/2026-09-28-markdown-api-audit/last-pass-observations.md)
also records the rejected raw-`remark-mdx` suspicion.

Round-trip tests that compare the second parsed document with the first cannot
detect meaning lost on the first parse. Adoption proof must compare source
meaning and diagnostics for code literals, MDX tag dispatch, references,
persisted nested-list identity, property contributions, source locations and
open roots. Focused product tests were run as listed above; no product test was
added, and no full package/type suite, browser/native clipboard, external
viewer, performance benchmark or exhaustive property corpus ran. Byte limits
precede parsing; node/depth limits remain post-parse with the documented parser
limitation.

Adoption must also repair stale per-operation override teaching in
`.agents/rules/best-api/rules/behavior-and-ownership.md`, affected public docs,
mapping types and doctrine mirrors. This audit changes none of those sources.

Next: `$task design plan markdown: preserve syntax, references and persisted
identity; cut unsafe preprocessing, legacy dispatch and unearned API; compose
feature-owned syntax/property diagnostics; make editor types exact`. Settle the
compiled dispatch, property contributions, inline/recovery behavior and loss
classification together, then order adoption and matching correctness/scale
proof. No product implementation, downstream execution plan, commit or
publication was created.
