# Editor Spec: Date MDX And Media/Embed Gaps

## Goal

Run the editor-spec workflow for the markdown-adjacent feature gaps currently
listed in `docs/editor-behavior/markdown-parity-matrix.md`:

- date MDX expansion beyond current behavior
- media/embed expansion beyond current behavior

Decide whether current evidence is already sufficient to tighten law/protocol
for these deferred rows, or whether they should stay deferred with sharper
boundaries.

## Scope

- current editor-behavior law
- compiled research relevant to date, media, embed, and markdown-adjacent
  authoring
- current package/demo/test surfaces for date and media/embed
- minimal honest doc updates across standards/spec/protocol/parity/audit

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load required editor-spec stack | in_progress | README, standards, spec, protocol, parity, audit, research, solutions |
| Inspect current date/media/embed repo surfaces | pending | package/test/demo grounding |
| Decide authority + node model + permanent home | pending | evidence vs gap |
| Patch docs if evidence is sufficient | pending | smallest honest stack changes |
| Verify cross-doc consistency | pending | terminology, links, contradictions |

## Findings

- Current `Date`, `Media embed`, and `Image / file / audio / video blocks`
  are already locked current contracts in the parity matrix; the vague gap row
  was about expansion beyond those contracts, not missing baseline law.
- `Date` already has real current evidence for:
  - inline void atom model
  - insert/delete boundary behavior
  - plain `<date>value</date>` MDX round-trip
- `Date` does not have strong enough evidence to lock richer MDX payloads,
  attribute-bearing date tags, display-vs-value splits, or calendar/localized
  UI semantics as editor-behavior law.
- `Media` already has real current evidence for:
  - url-centric MDX round-trip for file/audio/video/embed nodes
  - supported MDX attribute preservation
  - embed-url / iframe normalization
  - placeholder-to-media replacement with upload-history rewriting
- `Media` does not yet have strong enough cross-reference evidence to lock
  richer provider metadata, richer source-entry behavior, or broader embed
  chrome as stable editor-behavior law.
- No standards winner-map change was justified.
- No audit-history patch was justified; this was a law/protocol/parity cleanup,
  not a new external-reference disagreement.

## Progress Log

- 2026-04-09: Started editor-spec pass for the two markdown-adjacent deferred feature gaps.
- 2026-04-09: Read the required editor-spec stack, research command docs, and the current date/media/embed package and docs surfaces.
- 2026-04-09: Tightened readable law for current-vs-deferred date MDX and media/embed behavior.
- 2026-04-09: Added missing protocol coverage for current date MDX round-trip and current media embed/upload flows, plus explicit deferred rows for richer expansion.
- 2026-04-09: Narrowed the parity-matrix feature-gap wording so it names the actual remaining deferred contracts instead of one vague bucket.
