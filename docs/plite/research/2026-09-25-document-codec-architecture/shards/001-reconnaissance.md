# Shard 001: reconnaissance

## Scope

Seed the candidate taxonomy and locate Plate's existing schema/codec owners
before the Ultra run performs source-level comparison.

## Sources sampled

- Zod codecs, Effect Schema, io-ts, TypeBox and Standard Schema documentation.
- Unified, VFile, Recast, YAML and PostCSS documentation/repository overviews.
- Current Plite `EditorValueCodec`, compiled schema validation, `HostCodec`,
  Plate feature codec declarations, and the accepted import/export decisions.

## Top leads

- Reserve `codec` for a truly bidirectional typed mapping with explicit laws;
  lossy document formats may need reader/writer or parse/serialize ownership.
- Keep encoded-source diagnostics and canonical schema diagnostics composable
  without making either one own the other.
- Plite already has structured path-aware validation; a Zod-shaped safe API
  must prove a caller rather than win by familiarity.
- Source-retaining printers support exact reuse plus explicit fallback, but the
  retained artifact remains format-owned.
- Plate already has three different codec concepts; adding a fourth before a
  bounded ontology audit would make the API worse.

## Rejected leads

- Replacing the editor schema with Zod from documentation alone.
- Creating a universal document codec because import and export are inverse
  words.

## Duplicates

- Zod, Effect, io-ts, TypeBox and ts-codec currently support one shared lead:
  typed encoded/canonical directions. They are not five architecture proposals.

## Next query

Run the complete source-inspected comparison and API/plan workflow in
`ULTRA-PROMPT.md`.
