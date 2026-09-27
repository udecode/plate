# Shard 002: typed codecs and validation

## Scope

Test whether Zod-style codecs should become the public model for Plate document
conversion, and whether Plite needs another validation surface.

## Fixed sources

- Zod `2bf7b0630d5378033e90bcee82cb32b0fe04628e`
- Effect `1f760401be854f8e50c414902be6eeea1d479682`
- io-ts `864a3a2f03c5d7b974afeb1da0faf46c21758779`
- TypeBox `e0ac8cefade0f91e03c1ccf28cda77a0df0d81e6`
- Standard Schema `6fafde5d4e8372937793c92092322a15b6e711cd`
- Valibot `d4da61a0ac696f8421f97328f329a560b67143a9`
- ArkType `5606ae855d58b21312402ad1ac587a6ccb14de25`
- ts-codec `25fb4083b4d913aa7275a1f6184ba1df23a2b246`
- Ajv `f177fe323420ccb23e1a79445fd470cbf80aee7c`

## Findings

`codec` is useful only when both directions have typed domains and the owner
states what round trip it promises. It does not imply byte, syntax, or semantic
losslessness by itself. Zod admits normalization and one-way transforms;
`safeParse` does not convert every user transform throw into an issue. Effect
explicitly marks some transforms as non-roundtrippable. io-ts examples can
strip fields and violate a naïve law. TypeBox demonstrates how reverse union
selection and missing directions become runtime failures. The type shape alone
does not supply the law.

Standard Schema is one-way validation interoperability. Valibot fallback can
return a replacement without preserving the original issues. ArkType's refusal
of ambiguous morph unions is the better precedent: ambiguity should fail
rather than silently choose a reverse path. Ajv's coercive/mutating options are
conversion policy, while its JTD parser and serializer remain separate.

The local compiled editor schema already owns canonical grammar, root policy,
property lifecycle, defaults, and immutable path-aware diagnostics through
`assertDocument` and `assertFragment`. A generic schema dependency or a
`safeParse` wrapper would duplicate the shape of an answer without owning an
unserved job.

`EditorValueCodec` is the one local noun that earns `codec`: it maps one typed
live value to one current canonical JSON representation. Version history is a
different job. `EditorValuePersistence` wraps the current codec, owns the
positive envelope version, and carries decode-only legacy decoders. Tighten
the encoded generic, runtime strict-JSON admission, and laws rather than
generalizing the pair to external formats.

## Accepted leads

- Reserve `codec` for a typed pair with explicit direction laws.
- Add reusable live round-trip, encoded canonical fixed-point, strict JSON,
  and detachment law tests for `EditorValueCodec`; test every legacy fixture
  through `EditorValuePersistence`.
- Keep canonical validation throwing. Format parse results wrap schema failure
  as format diagnostics rather than introducing a second schema API.
- Keep coercive fitting distinct from validation and make every
  framework-owned repair visible to a format parser.

## Rejected leads

- `DocumentCodec<Encoded, Document>` for HTML, Markdown, or DOCX.
- Replacing the editor schema with Zod or Standard Schema.
- Adding `safeParseDocument` without a named branching caller.
- Treating successful normalization as proof of a codec round trip.

## Duplicate leads

The nine libraries support two decisions rather than nine abstractions: the
codec noun needs a law, and validation/recovery must not erase diagnostics.

## Next query

Inspect systems that retain source, locations, warnings, and format-specific
extras without pretending their semantic model is the original document.
