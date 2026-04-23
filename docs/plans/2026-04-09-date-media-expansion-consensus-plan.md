# Consensus Plan: Date And Media Expansion Completion

## Status

Historical for the date half.

Current read:

- the **date** half is now effectively closed by the shipped narrow contract
- the **media/embed** half still informs the active lane

Use this file as:

- historical rationale for why the narrow date contract won
- active background context for Lane 4 media/embed follow-up

## Task

Create the real implementation plan for the remaining `date` and
`media/embed` expansion batch described in
[.omx/specs/deep-interview-date-media-expansion-completion.md](.omx/specs/deep-interview-date-media-expansion-completion.md),
grounded in current law, research, and runtime.

## Repo Grounding

- Current law still locks `date` to one plain string payload on `node.date` and
  plain `<date>value</date>` round-trip in
  [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md).
- Current protocol marks richer date payloads as `deferred` and current render
  behavior as only `specified` in
  [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md).
- Current parity marks `Date` and `Media embed` as `locked` only for the narrow
  current contract, with richer expansion still in the feature-gap rows in
  [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md).
- The existing expansion note explicitly says media has stronger footing than
  date in
  [docs/plans/2026-04-09-editor-spec-date-media-expansion.md](docs/plans/2026-04-09-editor-spec-date-media-expansion.md).
- The date open question says the current repo has no justified richer payload
  yet in
  [docs/research/open-questions/date-mdx-payload-contract.md](docs/research/open-questions/date-mdx-payload-contract.md).
- The media decision says richer media should start from authoring/path-policy
  and trust boundaries, not only new provider fields, in
  [docs/research/decisions/media-authoring-follows-the-image-path-policy-family.md](docs/research/decisions/media-authoring-follows-the-image-path-policy-family.md).
- Current runtime still stores date values as `new Date().toDateString()` in
  [packages/date/src/lib/transforms/insertDate.ts](packages/date/src/lib/transforms/insertDate.ts)
  and the demo renderers write `toDateString()` back from the calendar in
  [apps/www/src/registry/ui/date-node.tsx](apps/www/src/registry/ui/date-node.tsx)
  and
  [apps/www/src/registry/ui/date-node-static.tsx](apps/www/src/registry/ui/date-node-static.tsx).
- Current markdown rules still serialize date as a plain child-text `<date>`
  element in
  [packages/markdown/src/lib/rules/defaultRules.ts](packages/markdown/src/lib/rules/defaultRules.ts).
- Current media embed normalization is still split across raw string helpers in
  [packages/media/src/lib/media-embed/parseIframeUrl.ts](packages/media/src/lib/media-embed/parseIframeUrl.ts),
  `parseVideoUrl.ts`, `parseTwitterUrl.ts`, and submit-time mutation in
  [packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts](packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts).
- Current markdown media flow rules preserve attributes for `audio` / `file` /
  `video` in
  [packages/markdown/src/lib/rules/mediaRules.ts](packages/markdown/src/lib/rules/mediaRules.ts),
  but embed-specific richer metadata is still not first-class there.

## Requirements Summary

1. Finish both lanes, not just the easier media one.
2. Keep source truth explicit and round-trippable.
3. Make Plate-owned contract decisions where external evidence is thin.
4. Limit rendered/UI work to behavior that directly follows from the source
   contract.
5. Keep non-goals hard:
   - no arbitrary script embeds
   - no PDF embed support
   - no locale-heavy or timezone-heavy date UX
   - no preview-first product lane
6. Update code, tests, editor-behavior law, and user-facing docs together.

## RALPLAN-DR Short Summary

### Principles

1. Canonical payload beats render convenience.
2. Normalize in shared feature packages, not in app-only demo renderers.
3. Markdown rules should round-trip an intentional schema, not accidental raw
   strings.
4. Trust boundaries for embed input must be explicit and negative-tested.
5. Render behavior may derive from canonical data, but it does not get to
   redefine the schema.

### Top Decision Drivers

1. Current date storage is sloppy: `toDateString()` is not a good long-term wire
   format.
2. Current media/embed behavior is useful but split across parsers, submit-time
   transforms, and spec prose.
3. DX gets better if agents and humans can reason about one obvious canonical
   contract per feature instead of app-specific side effects.

### Viable Options

#### Option A: Richer source-canonical contracts, narrow render follow-through

- Date: introduce a canonical machine-readable node value with legacy
  read-compat and derived render labels, while separating that from any markdown
  wire-shape migration.
- Media/embed: introduce richer normalized embed metadata plus explicit
  allowlist/trust-boundary handling, but only persist provenance that the edit
  surface actually needs.
- Pros:
  - best long-term architecture
  - honest separation between stored contract and rendered label
  - easiest path to future AI/streaming compatibility
  - gives markdown rules something explicit to round-trip
- Cons:
  - touches multiple packages
  - requires careful legacy read compatibility
  - forces a real schema decision now

#### Option B: Keep current node shapes and only patch renderers/parsers

- Leave `date` as one raw string.
- Leave media as mostly `url` plus whatever parsers infer at runtime.
- Pros:
  - smaller immediate diff
  - lower near-term coordination cost
- Cons:
  - locks in the bad `toDateString()` contract
  - keeps media metadata/provenance implicit
  - gives us more behavior without better law

#### Option C: UI-first expansion

- Add richer picker semantics, broader embed chrome, more provider behavior,
  and more preview behavior first.
- Pros:
  - flashy user-visible change
- Cons:
  - wrong order
  - violates the non-goals
  - biggest chance of fake law and schema drift

### Recommendation

Choose **Option A**, but keep the date node migration narrower than a full field
rename.

That means:

- `date` gets a canonical machine-readable value with derived render labels.
- `media/embed` gets explicit normalized metadata plus trust-boundary handling,
  with provenance persisted only where it materially helps editing.
- renderers only express those contracts; they do not invent extra product law.

## Recommended Contract Decisions

### Date

Adopt a richer Plate-owned date node contract in `@platejs/date`:

- keep the existing node field name `date`
- narrow its meaning to a canonical `YYYY-MM-DD` calendar-day string
- inline void node stays otherwise unchanged

Recommended canonical node value:

```ts
{
  date: "2026-03-23";
}
```

Markdown / MDX wire-shape decision for this batch:

- dual-read both forms:
  - legacy child-text `<date>2026-03-23</date>`
  - attribute-bearing `<date value="2026-03-23" />`
- keep the write shape explicit and conservative
- writer stays canonical child-text for this batch
- attribute-bearing form is read-compat only in this batch, not the default
  serialized output

Recommended compatibility behavior:

- read legacy plain-child `<date>...</date>` input
- normalize only these safe legacy shapes into canonical `node.date`:
  - canonical `YYYY-MM-DD`
  - previous Plate-style `Date.prototype.toDateString()` output
- if legacy child text is not safely normalizable, preserve it through an
  explicit markdown fallback path instead of materializing a richer `date` node
- stop writing new `toDateString()` values from inserts or the calendar UI

Limited render behavior in scope:

- derive current relative labels / long-date label from canonical `date`
- parse canonical `YYYY-MM-DD` as a calendar day without timezone drift instead
  of relying on raw `new Date(node.date)`
- if an existing non-canonical `date` node is encountered outside the markdown
  fallback path, render it as literal fallback text instead of inventing a
  parsed day

Out:

- locale/timezone-heavy serialized semantics
- display-vs-value serialized semantics
- separate picker-product law beyond writing the canonical value

### Media / Embed

Adopt a richer normalized embed contract in `@platejs/media`:

- required:
  - `url`: canonical render/embed URL
- optional:
  - `provider`: normalized provider slug
  - `id`: normalized provider resource id
  - `sourceUrl`: canonical user/source-facing URL when the edit surface needs to
    preserve a user-facing URL different from `url`

Normalization-only metadata for this batch:

- `sourceKind` may exist inside shared normalization helpers and tests
- `sourceKind` does not need to become a serialized markdown/document field in
  this batch unless a second durable consumer appears

Recommended boundaries:

- keep allowlisted snippet extraction explicit
- never store arbitrary script markup as the canonical node payload
- do not widen support to PDF iframe or arbitrary script embeds

Limited render behavior in scope:

- renderers may use richer normalized metadata without reparsing the raw input
- edit surfaces should preserve `sourceUrl` when available instead of leaking
  only provider embed URLs back to users

## Testable Acceptance Criteria

1. New date writes and safely normalizable legacy date reads store a canonical
   machine-readable `date` value.
2. Date insertion and demo calendar edits write the canonical value, not
   `toDateString()`.
3. Markdown date rules dual-read legacy child-text and attribute-bearing date
   elements, and write canonical child-text for this batch.
4. Canonical date rendering uses timezone-safe calendar-day parsing for
   `YYYY-MM-DD`, non-normalizable legacy markdown date input stays on an
   explicit non-date fallback path, and existing non-canonical `date` nodes use
   a literal renderer fallback instead of being silently reinterpreted.
5. Media embeds normalize supported URL / iframe / allowlisted-snippet input
   into explicit shared metadata fields owned by `@platejs/media`.
6. Arbitrary script snippets remain rejected, and PDF iframe snippets remain
   unsupported.
7. Richer `media_embed` metadata round-trips through explicit markdown/MDX
   rules and tests instead of hidden fallback behavior.
8. Date renderers have explicit coverage for canonical-day display behavior, not
   only package-level transform tests.
9. `markdown-editing-spec.md`, `editor-protocol-matrix.md`,
   `markdown-parity-matrix.md`, the reopened expansion note, and public docs all
   describe the same boundary.

## Implementation Steps

### 1. Lock the date contract in code first

Files:

- [packages/date/src/lib/transforms/insertDate.ts](packages/date/src/lib/transforms/insertDate.ts)
- new helper under `packages/date/src/lib/**` for normalization/serialization
- any exported date types under `packages/date`

Work:

- add shared date normalization helpers owned by `@platejs/date`
- change insert-time default from `toDateString()` to canonical `date`
- keep read compatibility for legacy shapes long enough to avoid breaking old
  documents
- explicitly define the markdown fallback branch for legacy child-text values
  that do not normalize safely
- keep markdown wire-shape migration separate from the node contract decision

### 2. Make the date renderers follow the shared contract

Files:

- [apps/www/src/registry/ui/date-node.tsx](apps/www/src/registry/ui/date-node.tsx)
- [apps/www/src/registry/ui/date-node-static.tsx](apps/www/src/registry/ui/date-node-static.tsx)

Work:

- stop treating `element.date` as a free-form display string
- otherwise derive the current relative/long label from canonical `date`
- calendar selection writes canonical `date`
- route canonical parsing and label derivation through shared package helpers
  instead of raw `new Date(element.date)` logic in app code
- add UI test coverage for the canonical-day rendering path and fallback path

### 3. Make markdown date rules intentional instead of child-text-only

Files:

- [packages/markdown/src/lib/rules/defaultRules.ts](packages/markdown/src/lib/rules/defaultRules.ts)
- [packages/markdown/src/lib/dateElement.spec.ts](packages/markdown/src/lib/dateElement.spec.ts)

Work:

- deserialize both richer attribute-bearing date elements and legacy child-text
  date elements
- keep the writer choice explicit:
  - canonical child-text output is the only write shape in this batch
  - attribute output is read-compat only and stays out of the writer
- add explicit tests for:
  - canonical child-text form
  - attribute-bearing read compatibility
  - legacy read compatibility
  - non-normalizable legacy markdown fallback behavior

### 4. Centralize media/embed normalization and provenance

Files:

- [packages/media/src/lib/media/parseMediaUrl.ts](packages/media/src/lib/media/parseMediaUrl.ts)
- [packages/media/src/lib/media-embed/parseIframeUrl.ts](packages/media/src/lib/media-embed/parseIframeUrl.ts)
- `packages/media/src/lib/media-embed/parseVideoUrl.ts`
- `packages/media/src/lib/media-embed/parseTwitterUrl.ts`
- `packages/media/src/react/media/useMediaState.ts`
- [packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts](packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts)
- `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts`
- [apps/www/src/registry/ui/media-embed-node.tsx](apps/www/src/registry/ui/media-embed-node.tsx) as a consumer, not a schema owner

Work:

- promote embed normalization into one explicit structured contract owned by
  `parseMediaUrl`
- keep `parseIframeUrl` as a trust-boundary helper, not the whole contract
- make submit/edit/render paths consume the richer metadata instead of reparsing
  raw input in app code
- keep negative behavior explicit for non-allowlisted script markup and PDF
- freeze the persisted schema to `url`, `provider`, `id`, plus `sourceUrl` only
  if the edit path truly needs it
- keep `sourceKind` as normalization/debug metadata unless a real serialized
  consumer emerges

### 5. Implement explicit markdown ownership for richer `media_embed` metadata

Files:

- [packages/markdown/src/lib/rules/mediaRules.ts](packages/markdown/src/lib/rules/mediaRules.ts)
- a dedicated `media_embed` markdown rule beside it

Work:

- stop relying on implicit behavior for richer embed metadata
- add a dedicated markdown rule for `media_embed` instead of leaving ownership
  optional or hidden behind fallback behavior
- preserve only the metadata that belongs to the canonical contract
- do not serialize unsupported raw snippet/script payloads

### 6. Extend tests before final doc promotion

Date tests:

- `packages/date/src/lib/transforms/insertDate.spec.tsx`
- `packages/date/src/lib/BaseDatePlugin.spec.tsx`
- `packages/markdown/src/lib/dateElement.spec.ts`
- add package-owned date helper specs
- add app renderer specs:
  - `apps/www/src/registry/ui/date-node.spec.tsx`
  - `apps/www/src/registry/ui/date-node-static.spec.tsx`

Media tests:

- `packages/media/src/lib/media/parseMediaUrl.spec.ts`
- `packages/media/src/lib/media-embed/parseIframeUrl.spec.ts`
- `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.spec.ts`
- `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.spec.ts`
- `packages/media/src/react/media/useMediaState.spec.ts`
- add tests around the structured embed metadata normalizer
- add explicit markdown round-trip specs for `media_embed`, preferably beside
  `packages/markdown/src/lib/mediaSurface.spec.ts`
- add renderer coverage where the richer metadata affects the chosen preview or
  edit path

### 7. Patch law/docs only after code shape is proven

Files:

- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [docs/plans/2026-04-09-editor-spec-date-media-expansion.md](docs/plans/2026-04-09-editor-spec-date-media-expansion.md)
- public docs under `content/(plugins)/(elements)/date.mdx`,
  `content/(plugins)/(elements)/media.mdx`, and
  `content/(plugins)/(serializing)/markdown.mdx`

Work:

- update law from “deferred richer contract” to the chosen batch contract
- keep non-goals explicit
- document the new canonical serialized forms
- keep audit discipline honest; no fake external authority claims

### 8. Add changesets for package work

Packages likely touched:

- `@platejs/date`
- `@platejs/media`
- `@platejs/markdown`

## Risks And Mitigations

### Risk: date migration corrupts old content

Mitigation:

- dual-read legacy and canonical forms
- only auto-serialize canonical form when normalization is safe
- add explicit legacy-round-trip tests

### Risk: richer media data gets split across parsers and UI again

Mitigation:

- make one shared normalized embed helper the single owner
- keep UI submit/render code as consumers, not ad-hoc normalizers

### Risk: provenance fields become permanent baggage too early

Mitigation:

- treat `sourceUrl` as opt-in and justified by edit-flow reversibility
- keep `sourceKind` out of the serialized contract unless a second durable
  consumer appears

### Risk: embed support quietly widens back into unsafe script handling

Mitigation:

- preserve a narrow allowlist
- keep negative tests for arbitrary script markup and PDF
- state the trust boundary in spec, protocol, and docs

### Risk: render behavior smuggles extra product law into the schema

Mitigation:

- render directly from canonical `date`
- do not let app renderers invent extra serialized fields or display attributes

## Verification Steps

Targeted tests:

```bash
bun test packages/date/src/lib/transforms/insertDate.spec.tsx \
  packages/date/src/lib/BaseDatePlugin.spec.tsx \
  packages/markdown/src/lib/dateElement.spec.ts \
  packages/media/src/lib/media/parseMediaUrl.spec.ts \
  packages/media/src/lib/media-embed/parseIframeUrl.spec.ts \
  packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.spec.ts \
  packages/media/src/react/media/FloatingMedia/submitFloatingMedia.spec.ts \
  packages/media/src/react/media/useMediaState.spec.ts \
  packages/markdown/src/lib/mediaSurface.spec.ts \
  apps/www/src/registry/ui/media-video-node.spec.tsx
```

Then run the new test files added in this batch for:

- package-owned date normalization / formatting helpers
- `apps/www/src/registry/ui/date-node.spec.tsx`
- `apps/www/src/registry/ui/date-node-static.spec.tsx`
- explicit `media_embed` markdown round-trip coverage

Build:

```bash
pnpm install
pnpm brl
pnpm turbo build --filter=./packages/date --filter=./packages/media --filter=./packages/markdown --filter=./apps/www
```

Typecheck:

```bash
pnpm turbo typecheck --filter=./packages/date --filter=./packages/media --filter=./packages/markdown --filter=./apps/www
```

Fallback if filtered typecheck still hits unresolved workspace-package imports:

```bash
pnpm build
pnpm turbo typecheck --filter=./packages/date --filter=./packages/media --filter=./packages/markdown --filter=./apps/www
```

Lint:

```bash
pnpm lint:fix
```

Browser verification:

```bash
dev-browser --connect http://127.0.0.1:9222
```

Verify the date demo path still shows:

- canonical-day rendering with no timezone drift
- calendar edits writing the canonical date value

Keep non-normalizable legacy markdown fallback and existing non-canonical
`date` node renderer fallback under explicit unit/spec coverage instead of
pretending browser demos cover them automatically.

## ADR

### Decision

Implement the remaining date/media expansion batch as a source-canonical
contract upgrade, not as a UI-first product pass.

### Drivers

- current date storage is weak
- current media/embed normalization is split and under-modeled
- the repo already has enough footing to make Plate-owned decisions

### Alternatives Considered

- keep current node shapes and only patch behavior
- jump straight to richer UI/product surfaces

### Why Chosen

This is the smallest batch that actually fixes the architecture instead of
adding more behavior on top of fuzzy data.

### Consequences

- more package-level changes now
- cleaner long-term DX
- easier future AI/streaming work because source truth is explicit
- date node semantics may improve before the markdown wire shape changes
- provenance stays narrower unless the edit surface proves it needs more

### Follow-ups

- after this batch, revisit whether richer date locale/timezone semantics are
  still worth adding
- after this batch, revisit whether local media path-policy should move from
  specified to fully implemented

## Available Agent Types Roster

Relevant roles for the follow-up execution:

- `planner`
- `architect`
- `critic`
- `explorer`
- `executor`
- `test-engineer`
- `verifier`
- `writer`
- `code-reviewer`

## Follow-up Staffing Guidance

### If executed via `ralph`

Suggested lane order:

1. contract decisions and file ownership confirmation
2. date implementation
3. media/embed implementation
4. markdown round-trip updates
5. docs/spec parity sync
6. verification

Suggested reasoning levels:

- contract choice / markdown schema / trust boundary: `xhigh`
- code and tests: `high`
- docs/spec sync: `high`
- final verification review: `high`

### If executed via `team`

Suggested staff split:

1. Date owner
   - `packages/date/**`
   - `apps/www/src/registry/ui/date-node.tsx`
   - `apps/www/src/registry/ui/date-node-static.tsx`
   - date tests
2. Media owner
   - `packages/media/**`
   - media embed tests
3. Markdown + docs owner
   - `packages/markdown/**`
   - editor-behavior docs
   - public docs
   - changesets

Suggested reasoning levels:

- architect/critic preflight: `xhigh`
- each implementation lane: `high`
- final verifier/code-reviewer pass: `high`

Launch hints:

```text
$team "Execute docs/plans/2026-04-09-date-media-expansion-consensus-plan.md"
omx team run docs/plans/2026-04-09-date-media-expansion-consensus-plan.md
```

## Team Verification Path

1. Each owner runs targeted tests for their write scope before handoff.
2. Markdown/docs owner runs the cross-package markdown/date/media tests after
   merges.
3. Final verifier runs build -> typecheck -> lint in the required repo order.
4. Final reviewer checks that spec/protocol/parity/public docs all say the same
   thing and that non-goals stayed out.
