# Editor Spec: Date And Media Expansion

## Goal

Run the editor-spec workflow for the remaining markdown-adjacent deferred
expansion rows:

- richer date MDX payloads beyond the current plain `<date>value</date>` contract
- richer media/embed source-entry or provider-metadata law beyond the current
  url+attribute contract

Decide whether current evidence now supports a stronger deferred contract, a
current-surface promotion, or only sharper deferral wording.

This note is now reopened for a research-first pass aimed at starting the real
expansion work instead of only tightening deferral wording.

## Scope

- current standards/spec/protocol/parity/audit docs
- compiled research relevant to date and media/embed behavior
- current package/docs/test evidence for date and media/embed surfaces
- minimal honest doc updates only

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load current date/media expansion law and evidence | complete | standards/spec/protocol/parity/research |
| Compare repo/runtime evidence vs stronger product law | complete | current support vs thin gaps |
| Decide expansion scope and status | complete | sharpen current-vs-deferred boundaries |
| Patch docs | complete | smallest honest set |
| Verify consistency | complete | standards/spec/protocol/parity alignment |
| Reopen with research-first expansion pass | complete | gathered stronger evidence; media first, date still blocked |

## Findings

- `Date` still does not have evidence for richer MDX payload law.
- The honest current contract for `Date` is:
  - one canonical `YYYY-MM-DD` payload on `node.date`
  - dual-read markdown / MDX input:
    - plain `<date>value</date>` child-text
    - `<date value="YYYY-MM-DD" />` attribute form
  - canonical write output uses `<date value="YYYY-MM-DD" />`
  - non-normalizable legacy child text stays on an explicit raw fallback path
- `Media embed` current behavior is stronger than the old deferred wording
  implied:
  - current provider normalization yields `provider` / `id` / canonical `url`
  - current embed editing may also preserve optional `sourceUrl` when needed
  - current render layer already uses that metadata for provider-specific paths
- Richer `Media/embed` expansion now has enough external evidence to tighten the
  future lane around:
  - image-path-policy family reuse for local media
  - sandbox / allowlist boundaries for script-based embeds
  - explicit non-baseline treatment of PDF iframe support
- that future lane is still too broad for the current markdown roadmap and
  should stay explicitly deferred instead of being treated as the next
  markdown-native follow-up
- The honest deferred gap for media is now narrower:
  - richer provider schemas beyond the current supported normalization set
  - broader source-entry / richer embed chrome beyond the current contract
- `Date` is no longer blocked as a runtime lane; the remaining deferred gap is
  heavier serialized semantics beyond the current canonical node contract and
  canonical attribute writer.
- Richer expansion is now live in `media/embed`:
  - allowlisted Twitter/X sharing snippets normalize into the canonical
    embed path instead of being rejected before transform
  - supported provider input normalizes into explicit metadata with optional
    `sourceUrl` for edit reversibility
- broader embed roadmap work is still intentionally deferred because that lane
  widens too fast into product scope
- No standards winner-map change was justified.
- No audit-history patch was justified.

## Progress Log

- 2026-04-09: Started combined date/media expansion spec pass.
- 2026-04-09: Tightened `Date` to distinguish canonical payload law from render-layer formatting semantics.
- 2026-04-09: Tightened `Media embed` to recognize current supported provider normalization/render-path behavior as part of the current contract.
- 2026-04-09: Narrowed the deferred parity rows so they describe the real remaining gaps instead of the older vaguer wording.
- 2026-04-09: Updated user-facing `date`, `media`, and `markdown` docs so the public docs match the current contract.
- 2026-04-09: Added research artifacts that make `media/embed` the first honest
  richer-expansion target while leaving `date` as an explicit thinner open
  question.
- 2026-04-09: Reopened the lane in research-first mode to start real richer expansion work instead of stopping at sharper deferral wording.
- 2026-04-09: Implemented the first richer media/embed slice by allowing
  Twitter/X sharing snippets through the existing embed URL transform path and
  verified the `@platejs/media` package.
- 2026-04-09: Implemented the canonical date-value lane plus conservative
  markdown dual-read/write behavior and expanded `media_embed` normalization
  into explicit persisted metadata with markdown ownership.
- 2026-04-09: Promoted canonical date write output from legacy child-text to
  explicit `<date value=\"...\" />` attribute form while preserving legacy
  child-text read compatibility and raw fallback behavior.
- 2026-04-09: Re-affirmed that broader embed roadmap work stays explicitly
  deferred; the active markdown follow-up is date serialized semantics, not
  embed product expansion.
