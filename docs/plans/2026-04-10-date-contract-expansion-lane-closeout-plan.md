# Date Contract Expansion Lane Closeout Plan

## Status

Executed.

## Result

The audit confirmed that Lane 3 was already effectively closed in code and most
docs.

Outcome:

- canonical `YYYY-MM-DD` date node values stay locked
- markdown write shape stays `<date value="YYYY-MM-DD" />`
- legacy child-text dates stay read-compatible
- richer serialized date semantics stay deferred
- roadmap and research docs now treat this as closed truth instead of active
  queue work

## Goal

Decide whether Lane 3 is still a real implementation lane or whether the repo
already shipped the narrow date contract and now only needs roadmap / docs
closure.

Current hypothesis: **most of Lane 3 is already done**. The remaining work is
likely truth cleanup, not another date-schema expansion batch.

## Why This Plan Exists

The current roadmap still says:

- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
  keeps `Lane 3: Date Contract Expansion` in the active todo queue.

But the current repo and parity docs already say:

- canonical `YYYY-MM-DD` date node values are locked
- markdown writes canonical dates as `<date value="...\" />`
- legacy child-text dates are dual-read for compatibility
- richer serialized date semantics remain deferred

That smells like a lane that is already closed in code but not closed in the
roadmap.

## Current Repo Read

### Code already proves the narrow contract

- insertion writes canonical dates through
  [insertDate.ts](packages/date/src/lib/transforms/insertDate.ts)
- canonical parsing / formatting / fallback labels already live in
  [dateValue.ts](packages/date/src/lib/utils/dateValue.ts)
- markdown date round-trip is already covered in
  [dateElement.spec.ts](packages/markdown/src/lib/dateElement.spec.ts)
- app renderers already treat `date` as canonical and `rawDate` as fallback in
  [date-node.tsx](apps/www/src/registry/ui/date-node.tsx)
  and
  [date-node-static.tsx](apps/www/src/registry/ui/date-node-static.tsx)

### Docs already mostly describe the narrow contract

- [date.mdx](<content/(plugins)/(elements)/date.mdx>)
  already documents canonical `YYYY-MM-DD`
- [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
  marks `Date` as `locked`
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
  treats richer serialized date semantics as deferred

### Stale or contradictory sources likely remain

- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
  still treats Lane 3 as active
- [date-mdx-payload-contract.md](docs/research/open-questions/date-mdx-payload-contract.md)
  still says `status: open`
- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)
  predates the current locked date contract and mixes date with media in one
  batch

## Decision To Make

Choose one of these two outcomes:

### Option A: Close Lane 3

Use this if the audit confirms the current narrow date contract is already the
intended shipped answer.

What this means:

- close Lane 3 in the roadmap
- mark the date payload open question as answered
- keep richer date payloads, locale/timezone semantics, and display-vs-value
  serialization out of the current contract
- treat future richer date work as a new lane only if new product evidence
  appears

### Option B: Keep Lane 3 Open

Use this only if the audit finds a **real unresolved widening decision**, such
as:

- a still-supported richer serialized payload that current docs understate
- a missing compatibility path for existing content
- a required display/value split that is already implicit in product behavior

Current repo grounding does **not** point this way yet.

## Recommendation

Pick **Option A** unless the audit turns up a concrete missing contract edge.

The current code, tests, and public docs already align around one narrow date
contract. Keeping Lane 3 open without a real widening delta just creates fake
queue pressure.

## Implementation Units

### Unit 1: Date Contract Audit

Goal:

- confirm whether any real widening work is still missing

Files to inspect:

- [insertDate.ts](packages/date/src/lib/transforms/insertDate.ts)
- [dateValue.ts](packages/date/src/lib/utils/dateValue.ts)
- [dateElement.spec.ts](packages/markdown/src/lib/dateElement.spec.ts)
- [date-node.tsx](apps/www/src/registry/ui/date-node.tsx)
- [date-node-static.tsx](apps/www/src/registry/ui/date-node-static.tsx)
- [date.mdx](<content/(plugins)/(elements)/date.mdx>)
- [markdown.mdx](<content/(plugins)/(serializing)/markdown.mdx>)

Questions to answer:

1. Is canonical `YYYY-MM-DD` the only shipped node value?
2. Is attribute-form markdown write already the canonical output?
3. Are legacy child-text dates handled only as compatibility input?
4. Do renderers invent any extra serialized semantics not reflected in law?

Expected result:

- no new code changes needed, or a tiny follow-up fix if one contradiction is
  found

### Unit 2: Roadmap And Research Closure

Goal:

- make the written truth match the shipped date contract

Files:

- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [date-mdx-payload-contract.md](docs/research/open-questions/date-mdx-payload-contract.md)
- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)

Work:

1. Close Lane 3 in the roadmap if Unit 1 confirms no real widening gap
2. Mark the date payload question answered with the current product answer
3. Reframe the old consensus doc as historical context, or add a status block
   explaining that the date half is closed while media remains separate

### Unit 3: Public Docs Consistency

Goal:

- ensure user-facing docs say the same thing as the code and roadmap

Files:

- [date.mdx](<content/(plugins)/(elements)/date.mdx>)
- [markdown.mdx](<content/(plugins)/(serializing)/markdown.mdx>)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)

Work:

1. Confirm all four artifacts use the same narrow contract language
2. Remove any stale wording that implies a still-pending richer payload in the
   active lane
3. Keep richer date payloads explicitly deferred rather than vaguely “later”

## Verification

If Unit 1 finds no code delta, verification is docs-only.

If a date runtime/doc contradiction is found and code changes are needed, run:

- `pnpm install`
- `bun test packages/markdown/src/lib/dateElement.spec.ts`
- `bun test packages/date/src/lib/**/*.spec.ts`
- `bun test apps/www/src/registry/ui/date-node.spec.tsx apps/www/src/registry/ui/date-node-static.spec.tsx`
- `pnpm turbo build --filter=./packages/date --filter=./packages/markdown --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/date --filter=./packages/markdown --filter=./apps/www`
- `pnpm lint:fix`

## Exit Criteria

Lane 3 is ready to close when:

1. the audit confirms the narrow date contract is already the shipped product
   answer
2. roadmap, parity, protocol, research, and public docs all agree on that
   answer
3. any richer serialized date semantics are clearly deferred instead of vaguely
   implied

## Next Lane

If Lane 3 closes under this plan, the next real queue item becomes:

- `Lane 4: Media / Embed Expansion`
