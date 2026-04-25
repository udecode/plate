# Link Automd Autoformat Plan

## Status

Executed.

## Result

The narrow first slice is now shipped.

Closed result:

- `[text](url` converts on the explicit closing `)`
- the runtime host is `AutoformatPlugin.insertTextRules`
- URL validation and node construction stay owned by `@platejs/link`
- the current kits ship the narrow source-entry slice
- richer markdown-link grammar stays out of the shipped contract

## Goal

Implement `EDIT-INTERACT-LINK-AUTOMD-001` as a real typed conversion lane for
Plate:

- user types `[text](url`
- user types the closing `)`
- Plate converts that source entry into a structured inline link span

The user requirement for this plan is explicit:

- host the runtime inside the shared `AutoformatPlugin` lane if that is the
  best architecture
- choose the best long-term performance solution, not the nearest local patch

## Current Law

Current law already says:

- link automd is **not** plain block shorthand autoformat
- link automd is **not** text-substitution autoformat
- link automd belongs to the richer link/source-entry interaction lane
- current default app kits do **not** ship it

Authoritative docs:

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [link-automd-belongs-to-the-link-interaction-lane.md](docs/research/decisions/link-automd-belongs-to-the-link-interaction-lane.md)

That means this plan does **not** need a new law family first. The law already
exists. The work is implementation plus queue promotion.

## Problem Frame

Plate already proves the mechanic is possible in a package test:

- [singleCharTrigger.spec.tsx](packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx)

But that proof is not shippable architecture:

- it treats link automd like a plain `AutoformatRule`
- it reparses the current text in an ad hoc formatter
- it does not clearly route ownership between `@platejs/autoformat` and
  `@platejs/link`
- it does not define the supported markdown-link subset

So the real work is to turn that proof into a durable lane with:

- the right runtime host
- the right feature ownership
- the right first-slice boundary
- the right performance profile

## Architecture Decision

### Best permanent architecture

Use **shared `AutoformatPlugin` input-rule hosting** with **link-owned feature
semantics**.

Concretely:

- `@platejs/autoformat`
  owns the dispatch lane:
  - `insertTextRules`
  - trigger filtering on `)`
  - resolved payload handoff
- `@platejs/link`
  owns the feature semantics:
  - source-entry match parser for `[text](url`
  - URL validation
  - link node creation and/or insertion helpers

### Why this is the best solution

#### 1. Best performance

The runtime can stay on the current hot path:

- only wake up on `)` input
- only inspect the current relevant text before the caret
- no whole-document scan
- no markdown parser run
- no app-level overlay or async edit surface

This is the fastest plausible shape for live typed conversion.

#### 2. Best ownership

The spec already says link automd is a **link interaction lane**, not generic
autoformat.

So:

- the shared input-rule host belongs in `@platejs/autoformat`
- the actual link semantics belong in `@platejs/link`

That keeps URL validation, link node shape, and future link-specific options
from being duplicated in autoformat.

#### 3. Best DX

Future consumers should be able to reason about this as:

- “AutoformatPlugin can host typed conversion rules”
- “Link package provides the link automd rule/helper”

Not:

- “link automd is secretly another plain autoformat block rule”

## Rejected Options

### Option A: Keep the current single-character `AutoformatRule` hack

Reject.

Why:

- wrong family
- wrong ownership
- weak typing
- hides the supported grammar in ad hoc formatter code
- harder to extend for validation and edge cases

### Option B: Implement everything inside `@platejs/autoformat`

Reject.

Why:

- would force `@platejs/autoformat` to know link payload semantics
- would duplicate `@platejs/link` URL validation policy
- would smear feature ownership into the wrong package

### Option C: Implement only in `@platejs/link` with its own editor override

Reject.

Why:

- duplicates the shared typed-input dispatch lane now already available in
  `AutoformatPlugin`
- loses the performance win from the specialized `insertTextRules` host
- makes future typed conversion lanes more fragmented, not less

## First-Slice Scope

### Ship in scope

The first shipped slice should support only:

- collapsed selection
- one paragraph / one inline text flow
- one completed source entry of the form `[text](url`
- conversion only when the user types the closing `)`
- validated URLs only
- creation of one inline non-void link span with the parsed `text` and `url`

### Keep out of scope

Do **not** inflate the first slice to cover:

- nested brackets in link text
- nested parentheses in URLs
- link titles
- multiline source entries
- selection-wrap behavior
- markdown parse/serialize changes
- app-level floating-link editing UI
- auto-opening toolbars or source-preview chrome

If a richer markdown-link grammar is wanted later, that becomes a follow-up,
not an excuse to bloat the first runtime slice.

## Recommended Runtime Shape

### 1. Add a link-owned source-entry matcher

Add a small pure helper under `@platejs/link` that:

- reads only the relevant text before the caret
- looks for the closest valid `[text](url` shape
- returns a resolved payload:
  - source range to replace
  - parsed link text
  - parsed URL

Suggested shape:

```ts
type LinkAutomdMatch = {
  range: TRange;
  text: string;
  url: string;
};

matchLinkAutomdInput(editor): LinkAutomdMatch | undefined
```

The helper should work off the current text flow, not whole-editor markdown.

### 2. Reuse link-owned validation

The automd path must call the existing link URL validation:

- [validateUrl.ts](packages/link/src/lib/utils/validateUrl.ts)

Do not create a second URL-policy branch in autoformat.

### 3. Reuse link-owned node construction

The insertion path should reuse link package helpers where possible:

- [createLinkNode.ts](packages/link/src/lib/utils/createLinkNode.ts)
- [insertLink.ts](packages/link/src/lib/transforms/insertLink.ts)

If `insertLink(..., { at: range })` is sufficient and covered, use it.
If range replacement semantics are too implicit, add one tiny link-owned helper
for replacing the markdown source range with the link node in one obvious call.

### 4. Host the rule in AutoformatPlugin input rules

Use `insertTextRules` with:

- `trigger: ')'`
- `resolve` returning `LinkAutomdMatch | undefined`
- `format` replacing the source range with the link node

This should **not** go through the plain `rules` table.

## File Plan

### Link package

Likely files:

- [packages/link/src/lib/utils/validateUrl.ts](packages/link/src/lib/utils/validateUrl.ts)
- [packages/link/src/lib/utils/createLinkNode.ts](packages/link/src/lib/utils/createLinkNode.ts)
- new helper under `packages/link/src/lib/automd/` or `packages/link/src/lib/utils/`
- possibly a tiny transform helper under `packages/link/src/lib/transforms/`

### Autoformat package

Likely files:

- [packages/autoformat/src/lib/AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
  only if the current `insertTextRules` contract needs a small extension
- [packages/autoformat/src/lib/types.ts](packages/autoformat/src/lib/types.ts)
  only if the current payload contract still has a gap
- new link automd rule file under `packages/autoformat/src/lib/rules/link/`
  **only if** we decide the rule artifact itself belongs in autoformat rather
  than being provided by `@platejs/link`

### App kit wiring

Likely files:

- [apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)
- [apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx)

Decision to encode:

- whether link automd ships in the default current kits immediately
- or lands as opt-in kit wiring first

Recommendation:

- ship it in the default current kit if the first-slice grammar stays narrow and
  the tests prove no regressions in normal link UI/editing

## Test Plan

### Package tests

Add focused tests for:

1. Happy path
   - `[Example](https://example.com` + `)` converts to one link node
2. Invalid URL stays literal
   - e.g. `javascript:` or invalid heading-like `# heading`
3. Internal URLs honor current link validation options
4. Hash links honor current validation behavior
5. Inside code block stays literal
6. Expanded selection stays literal
7. Existing link context does not nest or corrupt links
8. Trigger only wakes on `)`
9. Match parser only uses the relevant current text flow, not unrelated earlier
   document content

Primary files:

- new link-focused spec near `@platejs/link`
- [singleCharTrigger.spec.tsx](packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx)
  should either be replaced or rewritten into the new lane shape

### App integration tests

Add package-integration coverage for the shipped kit surface:

- typing `[Example](https://example.com)` in the current editor kit converts
  into a link
- malformed `[Example](not a url)` stays literal
- typing inside a code block stays literal

Likely path:

- `apps/www/src/__tests__/package-integration/link/link-automd.slow.tsx`

### Browser verification

If the rule ships in the current app kits, verify in the real editor:

- go to `/blocks/playground`
- type one valid markdown link source entry and confirm it converts
- type one invalid source entry and confirm it stays literal

## Risks

### Risk 1: Wrong package ownership

If the rule logic fully lives in `@platejs/autoformat`, link semantics will
drift from `@platejs/link`.

Mitigation:

- keep parsing/validation/node creation in link-owned helpers

### Risk 2: Over-broad grammar in the first slice

Trying to support nested markdown-link grammar immediately will slow the path
down and create edge-case debt.

Mitigation:

- lock the first slice to one narrow, explicit grammar
- defer richer markdown-link parsing

### Risk 3: Regressing normal link UI flows

Automd could fight with floating-link edit / insert behavior.

Mitigation:

- add package + app integration tests covering both typed conversion and
  existing link edit flows

### Risk 4: Wrong default shipping decision

Even a correct runtime can be too aggressive for the default kit.

Mitigation:

- make the app-kit wiring an explicit step with browser proof
- if it feels noisy, keep the rule opt-in first and document that honestly

## Verification

- `pnpm install`
- focused `bun test` for the new link automd package specs
- existing link specs still pass:
  - URL validation
  - link transforms
- existing autoformat specs still pass
- app integration test for the shipped kit surface
- `pnpm turbo build --filter=./packages/link --filter=./packages/autoformat --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/link --filter=./packages/autoformat --filter=./apps/www`
- `pnpm lint:fix`
- browser verification if kit wiring changes

## Acceptance Criteria

1. `EDIT-INTERACT-LINK-AUTOMD-001` has an explicit implementation plan with a
   clear permanent architecture.
2. The chosen design uses `AutoformatPlugin` as the typed-input host, not the
   plain `rules` table.
3. Link URL validation stays owned by `@platejs/link`.
4. The first shipped slice has a narrow supported grammar and explicit
   non-goals.
5. The roadmap now tracks this as a real remaining implementation lane instead
   of leaving it stranded as a deferred row only.

## Next After Plan

If this plan is approved, the next execution move is:

1. implement the link-owned matcher/helper
2. wire the `insertTextRules` host path
3. add package + app integration coverage
4. decide default-kit shipping based on the browser proof
