# Shard 004: editors and cross-language controls

## Scope

Challenge the proposed call shapes against editor candidates and mature
serialization systems.

## Fixed sources

- ProseMirror model `6264de069d8439131e88f8ba06973551916184e4`
- ProseMirror Markdown `221ec60e26bc72005cacdbfc4f0ee43fda143489`
- Tiptap `91c51be53c4655ef07e29ec489471524debfa0ca`
- Lexical `dd5c41b13193efa9ab1574234d8593d2c9e4f988`
- Portable Text `ad2a52d13d9ffb06b994e5866a37605c840eb72c`
- Serde `6693a89cca77e0151437da1c7f890090b9ebf04c`
- Circe `4e8d5262f0f2c49589739edbcd0d80b8a6392a0a`

## Findings

ProseMirror's strongest precedent is not a common codec. Its DOM parser exposes
whole-document `parse` and open `parseSlice` as distinct operations. Its
Markdown parser and serializer remain at the format owner. That maps directly
to `EditorDocumentValue` versus `ContentSlice`.

Tiptap proves detached HTML and Markdown conversion from extension
configuration is practical. It does not provide the loss diagnostics Plate
needs, and its server HTML path's happy-dom choice does not satisfy Plate's
stress memory budget. Lexical is the counterexample: HTML and Markdown helpers
still require editor/global DOM context, and headless conversion constructs an
editor. Plate should remove that dependency. Portable Text supports detached,
schema-aware conversion, but unknown-node fallback paths strengthen the case
for mandatory diagnostics.

Serde keeps Serializer and Deserializer independent over a shared data model.
Circe's Decoder is partial, Encoder is independently useful, and Codec is only
the lawful pairing. These controls reject a public `DocumentFormat` object
whose only value would be visual symmetry.

## Corrections to the earlier import review

- DOCX's result shape is sound, but an editor-first primary import signature is
  not. The detached target must be captured before asynchronous work.
- Inline Markdown remains a distinct operation, but it returns `ContentSlice`;
  raw `Descendant[]` is not a third carrier.
- Malformed input does not always mean failure. A tolerant parser can return
  `ok: true` with diagnostics when it produced the requested schema-valid
  result. `ok: false` means no valid requested result exists.
- Reader/writer and codec nouns remain unnecessary. Direct `parse*` and
  `serialize*` functions are clearer.

## Accepted API direction

- `parseHtmlDocument`, `parseHtmlSlice`, `serializeHtml`
- `parseMarkdownDocument`, `parseMarkdownSlice`, `parseMarkdownInline`,
  `serializeMarkdown`
- matching editor convenience methods that delegate to the same code
- `ContentSlice` for slice and inline results
- format-specific discriminated parse results and diagnostics
- sync HTML/Markdown; async and cancellable DOCX

## Rejected leads

- Public Reader, Writer, Codec, DocumentFormat, or conversion-session objects.
- Editor construction as the detached conversion mechanism.
- Raw descendant arrays for insertion.
- Async/cancellation ceremony for synchronous HTML and Markdown.
- A detached DOCX export merely to mirror detached import.

## Next query

Close the local API ontology, move each surviving job to one owner, and test the
only unresolved environment question: a correct, bounded Node HTML path.
