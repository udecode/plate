# Autoformat Runtime Alignment And Extension Plan

## Status

Executed.

Closed ownership result:

- shared package-owned:
  - heading shorthand
  - inline mark autoformat
  - text substitution
- explicit app-owned current-kit behavior:
  - blockquote wrap
  - list and condensed todo shorthand
  - code-block gating
  - immediate code-fence promotion
  - immediate HR insertion
- outside the plain autoformat family:
  - link automd
- neighboring input-rule follow-up if revisited later:
  - Enter-owned normalization for code-fence or HR promotion

## Task

Create the real implementation plan for the newly specified autoformat lane:

- block shorthand autoformat
- inline mark autoformat
- text-substitution autoformat
- neighboring trigger surfaces that look like autoformat but are not cleanly
  owned by the current `@platejs/autoformat` engine

This plan assumes the current editor-behavior law and research are the source
of truth and that some runtime support will require extending shared
infrastructure instead of piling more folklore into the app kits.

## Repo Grounding

- Current law now treats autoformat as three profile-adjacent families in
  [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md).
- Current protocol rows now enumerate block shorthand, inline mark autoformat,
  text substitution, undo-on-delete, and code-block gating in
  [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md).
- Current parity keeps those surfaces outside the closed core-major gate as
  optional current-kit behavior in
  [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md).
- Current research now has the needed authority split in:
  - [markdown-shorthand-and-inline-autoformat.md](docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md)
  - [input-autoformat-lanes.md](docs/research/sources/milkdown/input-autoformat-lanes.md)
  - [autoformat-families-are-profile-adjacent-input-assist-surfaces.md](docs/research/decisions/autoformat-families-are-profile-adjacent-input-assist-surfaces.md)
  - [text-substitution-autoformat-authority.md](docs/research/open-questions/text-substitution-autoformat-authority.md)
- Current runtime still centers rule dispatch in
  [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts),
  with one-character `insertText` triggers, first-match-wins ordering, and
  text-only undo-on-delete.
- Current shared transforms still split by mode in:
  - [autoformatBlock.ts](packages/autoformat/src/lib/transforms/autoformatBlock.ts)
  - [autoformatMark.ts](packages/autoformat/src/lib/transforms/autoformatMark.ts)
  - [autoformatText.ts](packages/autoformat/src/lib/transforms/autoformatText.ts)
- Current app kits still encode the real shipped rule ordering and several
  product decisions in:
  - [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)
  - [autoformat-classic-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx)
- The strongest current app-specific learning is still
  [blockquote-autoformat-must-wrap-nested-quotes.md](docs/solutions/ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md):
  wrapper/container rules cannot be treated like flat block retags.

## Problem Frame

The law is finally honest, but the runtime still has three different shapes
mixed together:

1. clean single-keystroke shorthand that `@platejs/autoformat` already models
2. current app-kit quirks that rely on ordering or custom callbacks
3. Typora-like follow-up-key flows that are not really single-keystroke
   autoformat at all

If we try to force all of that into the current package without drawing
boundaries first, we will just re-invent a bigger pile of app-local rules.

## Requirements Summary

1. Align the runtime with the newly written autoformat law.
2. Keep block, mark, and text-substitution families distinct in code and tests.
3. Reduce app-kit folklore where a shared package or helper can own the
   behavior cleanly.
4. Do not pretend every Typora-like trigger belongs in the current
   `insertText`-only autoformat engine.
5. Preserve current invalid-match, escaping, and code-block-gating behavior.
6. Make precedence explicit where triggers overlap.
7. Add enough tests that future rule additions do not silently reorder or break
   existing behavior.

## Non-Goals

- Reopening the whole editor-behavior law from scratch
- Forcing every optional input-assist surface into the core-major release gate
- Solving search / find-replace, toolbar commands, or slash-menu insertion here
- Shipping Typora-perfect behavior everywhere in one pass
- Treating Enter-coupled promotions as if they were just another text trigger

## Key Decision

Not all "autoformat" belongs in `@platejs/autoformat`.

Use this split:

### A. `@platejs/autoformat` owns

- single-keystroke `insertText`-driven block shorthand
- single-keystroke markdown-delimiter mark closure
- single-keystroke text substitution
- reversible text substitution (`enableUndoOnDelete`)
- explicit rule precedence and context gating

### B. Neighboring shared input-rule / key behavior owns

- `$$` then `Enter` promotion
- Typora-style code fence or thematic-break-on-`Enter` behavior, if we decide
  to match it instead of keeping current immediate conversion
- any flow that depends on more than the current inserted character and local
  text match

That may live in shared input-rule infrastructure under `@platejs/autoformat`,
in `@platejs/core` key behavior, or in the owning feature package, but not in
the plain `AutoformatPlugin` dispatch loop itself.

## Recommended Workstreams

### Workstream 1: Runtime Truth Table

Goal: stop arguing abstractly about what is "autoformat" versus what is current
kit behavior.

Implementation units:

1. Add or refresh a runtime truth table in tests for the currently shipped app
   kits:
   - headings
   - blockquote including nested quote entry
   - unordered / ordered list shorthand
   - condensed todo shorthand
   - code fence trigger
   - HR trigger
   - mark closure
   - invalid mark cases
   - smart quotes / punctuation / symbols
   - code-block gating
2. Make the test names line up with the spec IDs added in
   [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md).

Primary files:

- [AutoformatPlugin.spec.tsx](packages/autoformat/src/lib/AutoformatPlugin.spec.tsx)
- [withAutoformat/\*\*](packages/autoformat/src/lib/__tests__/withAutoformat)
- [apps/www/src/**tests**/package-integration/autoformat/blockquote.slow.tsx](apps/www/src/__tests__/package-integration/autoformat/blockquote.slow.tsx)
- [apps/www/src/**tests**/package-integration/autoformat/list.slow.tsx](apps/www/src/__tests__/package-integration/autoformat/list.slow.tsx)

Why first:

- it locks the current behavior before we move ownership around
- it makes future normalization explicit instead of accidental

### Workstream 2: Shared Package Boundaries

Goal: move obviously shared behavior out of app folklore, but only where the
shared package API can own it cleanly.

Implementation units:

1. Decide which current app-kit rules should remain app-level for now versus
   move into `@platejs/autoformat` exported helpers or presets.
2. Promote the clearly shared rule families:
   - headings
   - list shorthand
   - common mark closure
   - smart quotes / punctuation / legal / arrow / math symbol tables
3. Keep container- or product-sensitive rules explicit:
   - blockquote wrap semantics
   - condensed todo shorthand
   - immediate code-fence promotion
   - immediate HR insertion

Primary files:

- [packages/autoformat/src/lib/rules/\*\*](packages/autoformat/src/lib/rules)
- [apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)
- [apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx)

Deliverable:

- a cleaner split between package-owned rule tables and app-owned product
  choices

### Workstream 3: Autoformat Engine Extensions

Goal: extend `@platejs/autoformat` only where the current engine shape is the
real blocker.

Likely extensions:

1. **Explicit rule-family metadata**
   - block shorthand
   - mark autoformat
   - text substitution
   - optional product-specific families
2. **Explicit precedence / priority**
   - stop relying on silent array order for conflicts like `==`
3. **Richer context passed to `query` / format callbacks**
   - current block owner
   - nearest containers
   - whether the block start match is being used
   - maybe active feature flags/profile options
4. **Shared helper paths for block shorthand**
   - retag block
   - wrap container
   - build list item / restart number
   - insert new owned block
5. **Better current-contract docs in package surface**
   - what the package guarantees
   - what it deliberately does not model

Primary files:

- [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
- [types.ts](packages/autoformat/src/lib/types.ts)
- [autoformatBlock.ts](packages/autoformat/src/lib/transforms/autoformatBlock.ts)
- [autoformatMark.ts](packages/autoformat/src/lib/transforms/autoformatMark.ts)
- [autoformatText.ts](packages/autoformat/src/lib/transforms/autoformatText.ts)

Important constraint:

- do **not** inflate this into a full profile engine rewrite in one pass
- land the smallest extension set that makes ownership and precedence explicit

### Workstream 4: Neighboring Input-Rule Lane

Goal: handle the cases that are not honestly single-keystroke autoformat.

Candidate surfaces:

- `$$` then `Enter` block-math promotion
- maybe ` ``` ` then `Enter` code-fence promotion if we choose Typora-style
  behavior later
- maybe thematic-break-on-`Enter` if we choose that shape later

Recommended approach:

1. Keep these out of the first `@platejs/autoformat` package extension unless a
   very small shared seam makes them trivial.
2. Spec and implement them as neighboring key/input rules in the owning lane:
   - shared input-rule runtime in `@platejs/autoformat`
   - core key behavior
   - code-block package
   - math package
3. Reuse the same spec IDs and family naming, but do not lie about package
   ownership.

Why:

- current `AutoformatPlugin` is built around one inserted character and local
  text matching
- `Enter`-coupled promotions are a different class of interaction

### Workstream 5: Public Docs And User-Facing Contract

Goal: sync the public `/docs/autoformat` story with the new law/runtime.

Implementation units:

1. Update
   [content/(plugins)/(functionality)/autoformat.mdx](<content/(plugins)/(functionality)/autoformat.mdx>)
   so it explains:
   - the three families
   - optional profile-adjacent nature
   - current app-kit behaviors that are package-level versus app-level
2. Add overlap warnings where the current behavior is a Plate-owned shorthand,
   not universal markdown convention.
3. If package APIs change, sync package docs and examples.

## Immediate Backlog Slices

These are the next implementation slices in order, not just loose follow-ups.

### Slice 1: Runtime Truth Table Lock

Own:

- truth-table tests for all currently specified block / mark / text rows
- precedence tests for overlapping triggers like `==`
- code-block gating proof

Why first:

- no normalization or package extraction should happen before current behavior
  is locked in tests

### Slice 2: Shared Autoformat Boundary Cleanup

Own:

- move the clearly shared rule tables/helpers into stable package-owned exports
- keep app-only quirks explicit where they still differ from stronger authority

Target rows:

- block shorthand headings / lists
- common mark closure
- smart quotes / punctuation / symbol tables

### Slice 3: Text-Substitution Authority Completion

Own:

- keep smart quotes, em dash, ellipsis, and angle quotes on the stronger
  mainstream-typing-norms + current-tests footing
- keep arrows, legal symbols, fractions, operator replacements, and unicode
  super/sub shorthand explicit as thinner local contract unless stronger
  external authority appears
- tighten docs/tests around that split so package defaults are not oversold

Target rows:

- `EDIT-PROFILE-AUTOFMT-TEXT-001`
- `EDIT-PROFILE-AUTOFMT-TEXT-002`
- `EDIT-PROFILE-AUTOFMT-TEXT-003`
- `EDIT-PROFILE-AUTOFMT-TEXT-004`

### Slice 4: Link Automd Lane

Own:

- keep `[text](url)` out of the plain autoformat families
- decide whether it should ship as a current productized
  link/source-entry surface or stay deferred
- if it ships, keep it in the link/source-entry lane instead of flattening it
  into generic autoformat
- if it stays deferred, keep the package seam and docs boundary honest without
  letting it masquerade as current autoformat support

Target row:

- `EDIT-INTERACT-LINK-AUTOMD-001`

### Slice 5: Current-Kit Normalization

Own:

- keep `[] ` / `[x] ` explicit as Plate-owned condensed todo convenience unless
  product deliberately wants to narrow it later
- treat immediate code-fence promotion as a current-kit deviation that should
  normalize toward an Enter-owned neighboring input-rule lane
- treat immediate HR insertion as a current-kit deviation that should normalize
  toward a stronger input-rule / command-aligned lane

Target rows:

- `EDIT-PROFILE-AUTOFMT-BLOCK-004`
- `EDIT-PROFILE-AUTOFMT-BLOCK-005`
- `EDIT-PROFILE-AUTOFMT-BLOCK-006`

## Acceptance Criteria

1. The runtime can be described as one of:
   - shared package-owned current contract
   - explicit app-owned product choice
   - neighboring input-rule lane
     for every currently specified autoformat row.
2. Overlapping trigger precedence is explicit in code and tests.
3. Invalid-match guardrails remain covered.
4. Code-block gating remains covered.
5. Public autoformat docs no longer imply that all shorthand behavior is one
   generic package feature.
6. If we keep current deviations like condensed todo shorthand or immediate
   code-fence promotion, the plan/result says so explicitly instead of treating
   them as markdown standards.

## Test Plan

### Package tests

- `packages/autoformat/src/lib/AutoformatPlugin.spec.tsx`
- `packages/autoformat/src/lib/transforms/*.spec.ts`
- `packages/autoformat/src/lib/__tests__/withAutoformat/**/*.spec.tsx`

Add or extend:

- precedence conflict tests
- family-metadata or priority tests if introduced
- richer query/context tests if introduced
- undo-on-delete tests for representative text substitutions

### App integration tests

- `apps/www/src/__tests__/package-integration/autoformat/blockquote.slow.tsx`
- `apps/www/src/__tests__/package-integration/autoformat/list.slow.tsx`

Add:

- one integration test for current-kit code-fence behavior
- one integration test for current-kit HR behavior
- one integration test for current-kit code-block gating

### Docs verification

- reread standards/spec/protocol/parity/audit after code shape is finalized
- reread `/docs/autoformat` and examples against actual current runtime

## Risks And Mitigations

### Risk 1: Over-designing the package

The architecture doc already wants a profile-aware rewrite, but doing the whole
thing now would balloon scope.

Mitigation:

- treat profile-aware rewrite as direction, not immediate scope
- only land the minimum extension set needed for current-family ownership and
  precedence

### Risk 2: Breaking current app-kit behavior while "normalizing"

The app kits already ship real behavior, even when it is quirky.

Mitigation:

- lock current truth-table tests first
- normalize only with explicit row-by-row decisions

### Risk 3: Mixing autoformat with Enter-owned promotions

This is the easiest conceptual bug.

Mitigation:

- keep `insertText`-driven behavior and `Enter`-driven promotion in separate
  workstreams
- require ownership to be explicit per row

### Risk 4: Thin authority on symbol substitution

Some symbol tables are mostly local current contract right now.

Mitigation:

- keep them explicit as thinner authority
- do not oversell them as universal markdown/editor truth

## Recommended Sequencing

1. Lock the runtime truth-table tests.
2. Move the obvious shared rule tables / helpers out of app folklore.
3. Add explicit precedence and richer query/context support in
   `@platejs/autoformat` if the tests show it is actually needed.
4. Keep Enter-coupled promotion as a follow-up lane unless a tiny shared seam
   falls out naturally.
5. Sync public docs last, once the runtime boundary is real.

## Suggested Next Commands

If you want a consensus pass on this plan:

```text
$ralplan --consensus --direct docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md
```

If you want to start execution directly:

```text
$ralph "Execute docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md"
```
