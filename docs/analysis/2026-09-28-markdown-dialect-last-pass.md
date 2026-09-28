# Markdown dialect last-pass review

Status: Complete — assessment only; implementation is not adopted.

Request: harsh final review of the proposed Markdown redesign after the
`$best-api-review audit markdown` passes.

**Verdict: Pursue, with a material correction.** The official registry kit
must stop treating full MDX as ordinary Markdown. Use CommonMark + GFM + math
as the default language and keep full MDX as an explicit input dialect. The
previous audit optimized the mapping and recovery machinery around the wrong
default grammar and its proposed immediate deletion of `htmlToJsx` would
regress currently accepted `<br>` and `<img>` input while MDX remained active.

The package primitive itself does not install MDX. The defect belongs to the
official `MarkdownKit` and the test editor, which install `remarkMdx` and then
exercise that policy throughout the registry. This distinction changes the
owner, but not the user-facing failure.

## Decisive evidence

Focused probes against the official kit established:

- `Array<string> is a type`, `x<y and 3<4`, and
  `<https://example.com>` fail in document and slice parsing with
  `markdown-invalid-source`.
- `Hello {name}` fails under the default reject policy as an unsupported MDX
  expression; under an allow policy the expression is silently dropped.
- Four-space indented code succeeds as paragraph text rather than a code block,
  with no diagnostic.
- `<!-- note -->` is rewritten into an MDX expression and then rejected even
  under incomplete-stream recovery.
- `a <callout>b</callout> c` escapes `parse()` as an
  `EditorSchemaValidationError`; `parseSlice()` returns a diagnostic instead.
- A final AI slice containing `Map<string, number>` fails and invalidates the
  preview, so valid completed model output can disappear.
- Removing `remark-mdx` from the current serializer makes feature mappings such
  as callout and underline fail because their canonical intermediate nodes are
  `mdxJsx*`.
- `parseAttributes` applies `JSON.parse` to every string attribute. Values such
  as `"1"`, `"true"`, and `"null"` therefore change type before the owning
  schema sees them.
- The current CommonMark corpus omits the exact boundaries that reveal these
  failures: indented code, autolinks, raw HTML, bare `<`, and `{`.

The critique is directionally right, but some wording is too broad. Plate does
get useful work from MDX today: nested tag structure, attribute tokenization,
flow-versus-inline nodes, locations, and serialization. Replacing it is not a
plugin deletion. CommonMark emits registered extension syntax as raw `html`
nodes, sometimes as separate opening/body/closing siblings and sometimes as
one complete raw block. A replacement must recover structure without becoming
a general HTML parser.

The exact diagnostic codes in the critique are also imprecise. Braces and
comments commonly reach conversion and fail as unsupported nodes rather than
as parser errors. That does not weaken the verdict: ordinary Markdown still
fails or loses meaning because the official kit selected a stricter language.

## Target and open mechanism

The durable target is:

```text
CommonMark + GFM + math
  -> bounded Plate-extension recognition
  -> neutral extension nodes
  -> feature-owned mappings
  -> Plate document
```

Serialization reverses that flow through one canonical extension writer. An
explicit MDX adapter may normalize `mdxJsx*` input into the same neutral
extension nodes. Feature mappings should not require full MDX as their
canonical contract.

The strongest implementation candidate is a bounded pass that pairs only
registered Plate tags in CommonMark `html` nodes and leaves unknown HTML under
the caller's loss policy. It must never execute HTML or load resources. A
selective micromark extension that claims only registered tags is the fallback
if local MDAST pairing cannot preserve nested structure, source offsets, or
streaming prefixes. Using MDX's JSX-only extension is not sufficient: it still
claims angle-bracket syntax and rejects ordinary text and autolinks.

Do not select the raw-HTML pass by assertion. A disposable prototype must prove
callout, nested details/summary, inline marks/date, columns, lists, blockquotes,
GFM tables, malformed or unfinished registered tags, unknown HTML, source
offsets, legacy reads, and every streaming prefix. Reject it if it needs a
general DOM parser or cannot pair within MDAST containers. Compare complete and
accumulated streaming cost with the current path.

Until that prototype wins, retain `htmlToJsx`, MDX recovery, and the table
fallback as compatibility machinery. They are symptoms, but deleting symptoms
before replacing their owner is a regression. If the CommonMark path wins,
then remove whole-source rewriting, the public and private `withoutMdx`
protocol, the tagged `remarkMdx` wrapper, MDX-specific fallback/reparse logic,
and document-wide location invalidation. Incomplete extension tags may still
need a small tolerant streaming policy; plain CommonMark parsing does not prove
that all recovery can disappear.

## Corrections to the previous audit

- Keep the previous cuts to unused filters, detached fragment functions,
  `splitLineBreaks`, duplicate legacy dispatch, dead helpers, and generic
  ownership of mention syntax. Keep parse/serialize naming, exact editor types,
  feature-owned mappings, references, mark correctness, and root diagnostics.
- Separate loss accounting from preservation. Generic conversion can report a
  non-default persisted property that no mapping claims, but feature/schema
  owners must still classify properties as semantic, defaulted,
  presentation-only, or intentionally omitted. Do not build preservation hooks
  for properties with no current job. Settle how honest property loss interacts
  with the default `lossPolicy: 'reject'` before adoption.
- Reopen the `withBlockId` writer. A serialized boundary is not itself a user.
  Preserve compatible reads, but remove the writer unless a current persistence
  consumer is named. If a consumer exists, identity must annotate canonical
  blocks rather than invoke a second list serializer or flatten hierarchy.
- Expected source and schema refusals must return diagnosed results. The public
  document parser may throw for programmer/configuration faults, but not for an
  inline placement error caused by user input.
- Attribute decoding belongs to the property/schema owner. Blanket JSON
  coercion of HTML attribute strings is invalid.

## Proof limit and next step

This review proves that the official MDX default is the wrong language and that
the previous implementation sequence was unsafe. It does not prove the final
extension parser, canonical custom-tag spelling, compatibility cost, streaming
performance, or full CommonMark conformance. No product code changed.

Next:
`$prototype markdown-commonmark-plate-tags: compare a bounded registered-tag MDAST pairer with a selective micromark extension; prove CommonMark corpus acceptance, Plate extension roundtrips, source offsets, legacy reads, streaming prefixes and cost before selecting the Markdown plan`.
