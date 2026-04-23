---
date: 2026-04-18
topic: slate-v2-slate-query-first-wave
status: active
---

# Goal

Execute the first tranche-3 `slate` recovery wave against the highest-leverage
query/location seams:

- `Editor.before(...)`
- `Editor.after(...)`
- `Editor.positions(...)`

This wave is intentionally narrow.

It exists to recover maximum non-breaking legacy-facing contract width without
starting a broad `slate` rewrite.

# Source Of Truth

Primary truth, in order:

1. legacy same-path source and fixtures in `../slate/packages/slate/**`
2. live shipped `../slate-v2/packages/slate/**`
3. supporting tranche-3 classification in
   [2026-04-18-slate-v2-slate-claim-width-classification.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-claim-width-classification.md)
4. draft package files in `../slate-v2-draft/packages/slate/**` only as
   secondary implementation evidence

Hard rule:

- do not treat the draft rewrite as the target shape
- do not treat the currently narrowed v2 behavior as correct by default
- legacy width wins unless we explicitly decide a narrower cut is no longer
  relevant to keep

# Problem Frame

The tranche-3 classification already froze the topology:

- deleted-family archaeology is mostly banked
- the active problem is same-path exported drift in `editor/**`,
  `interfaces/**`, and supporting core files

The first honest wave is the query/location family because it is where hidden
contract narrowing is most likely to leak into every later recovery wave:

- transforms reuse location semantics
- selection/delete/move behavior depends on `before` / `after` / `positions`
- docs already expose these helpers as public API

# Non-Goals

This wave does **not** attempt to close:

- `Editor.nodes(...)`
- `Editor.levels(...)`
- `Editor.unhangRange(...)`
- transform option-bag breadth outside what directly depends on the query
  family
- draft-only bookmark/projection/ref helper modules
- broad docs or example cleanup outside the touched API rows

# Execution Posture

Characterization-first.

Use the existing same-path legacy fixture corpus as the first oracle.
Add new tests only when a real hole is exposed that the same-path fixtures do
not cover clearly enough.

# Existing Patterns To Follow

- live `slate` fixture harness:
  [index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts)
- current API docs owner:
  [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md)
- tranche-3 ledger owners:
  [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md),
  [slate-interfaces-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-interfaces-api.md),
  [slate-transforms-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-transforms-api.md)
- supporting historical slice that is now narrower than the current target:
  [2026-04-07-slate-v2-op-family-nineteenth-slice.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-op-family-nineteenth-slice.md)

The old slice is useful as implementation history, but **not** as the current
claim boundary. This wave is broader because legacy width is the default.

# Implementation Units

## Unit 1. Audit Contract Width In `interfaces/editor.ts`

### Files

- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts)
- [legacy editor.ts](/Users/zbeyens/git/slate/packages/slate/src/interfaces/editor.ts)
- [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md)

### Work

1. Diff the public types for:
   - `EditorBeforeOptions`
   - `EditorAfterOptions`
   - `EditorPositionsOptions`
   - `BaseEditor.before`
   - `BaseEditor.after`
   - `BaseEditor.positions`
2. Record any narrowing in:
   - accepted `Location` kinds
   - supported `unit` values
   - `voids`
   - `nonSelectable` traversal behavior
   - reverse and boundary behavior
3. Update the live docs if the shipped docs are narrower or broader than the
   recovered code path.

### Required Test/Proof Surfaces

- [before/path.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/path.tsx)
- [before/point.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/point.tsx)
- [before/range.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/range.tsx)
- [after/path.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/path.tsx)
- [after/point.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/point.tsx)
- [after/range.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/range.tsx)

## Unit 2. Recover `before(...)` / `after(...)` Runtime Width

### Files

- [before.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor/before.ts)
- [after.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor/after.ts)
- [legacy before.ts](/Users/zbeyens/git/slate/packages/slate/src/editor/before.ts)
- [legacy after.ts](/Users/zbeyens/git/slate/packages/slate/src/editor/after.ts)
- supporting type owner:
  [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts)

### Work

1. Recover same-path runtime semantics for all still-kept legacy cases.
2. Prefer direct same-path recovery over importing draft helper modules.
3. Add the smallest internal support only if the same-path code truly needs it.
4. If one legacy row is no longer worth keeping, classify it explicitly in the
   tranche-3 ledgers instead of silently narrowing the helper.

### Required Test/Proof Surfaces

- [before/start.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/start.tsx)
- [before/path-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/path-void.tsx)
- [before/point-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/point-void.tsx)
- [before/range-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/range-void.tsx)
- [before/non-selectable-block.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/non-selectable-block.tsx)
- [before/non-selectable-inline.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/before/non-selectable-inline.tsx)
- [after/end.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/end.tsx)
- [after/path-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/path-void.tsx)
- [after/point-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/point-void.tsx)
- [after/range-void.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/range-void.tsx)
- [after/non-selectable-block.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/non-selectable-block.tsx)
- [after/non-selectable-inline.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/after/non-selectable-inline.tsx)

## Unit 3. Recover `positions(...)` Runtime Width

### Files

- [positions.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor/positions.ts)
- [legacy positions.ts](/Users/zbeyens/git/slate/packages/slate/src/editor/positions.ts)
- supporting type owner:
  [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts)
- likely supporting helpers if forced:
  [string.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/utils/string.ts),
  [node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/node.ts),
  [range.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range.ts)

### Work

1. Recover same-path iteration semantics before introducing new helper layers.
2. Preserve legacy behavior for:
   - `unit`
   - `reverse`
   - inline fragmentation
   - block stepping
   - `voids`
   - `nonSelectable` skip handling
3. Keep any current engine-forced deviation small and documented.

### Required Test/Proof Surfaces

- [all/unit-character.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/unit-character.tsx)
- [all/unit-word.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/unit-word.tsx)
- [all/unit-line.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/unit-line.tsx)
- [all/unit-block.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/unit-block.tsx)
- [all/inline-fragmentation.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation.tsx)
- [all/inline-fragmentation-reverse.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation-reverse.tsx)
- [path/inline.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/path/inline.tsx)
- [range/inline.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/range/inline.tsx)
- [voids-true/block-all.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/voids-true/block-all.tsx)
- [voids-true/inline-all.tsx](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/positions/voids-true/inline-all.tsx)

## Unit 4. Sync Docs And Ledgers In The Same Turn

### Files

- [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md)
- [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- [slate-interfaces-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-interfaces-api.md)
- [slate-transforms-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-transforms-api.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
  only if claim width changes materially

### Work

1. Record recovered rows vs explicit cuts.
2. Call out any narrower row as an intentional cut, not an accidental miss.
3. Keep the live claim narrower only where the cut is justified explicitly.

# Sequencing

1. `interfaces/editor.ts` contract diff
2. `before.ts` and `after.ts`
3. `positions.ts`
4. docs + ledger sync
5. only after this wave, decide whether `next` / `previous` / `nodes` /
   `levels` / `unhangRange` still need dedicated follow-on waves

# Verification

Build-first package verification for the implementation turn:

1. `bun install`
2. `bunx turbo build --filter=./packages/slate`
3. `bunx turbo typecheck --filter=./packages/slate`
4. `bun run lint:fix`
5. `bun test ./packages/slate/test/index.spec.ts`

If the fixture harness needs narrower reruns during iteration, run the exact
fixture files above through the current `index.spec.ts` tree or targeted Bun
test filters before the full fixture suite rerun.

# Risks

- silently preserving the currently narrowed v2 behavior because it already
  passes some fixtures
- over-importing draft helper modules and smuggling rewrite-era design into the
  live package
- letting docs keep a narrower contract than recovered code
- widening transforms incidentally while only trying to recover query/location
  seams

# Success Condition

This wave is done when:

- `before` / `after` / `positions` are legacy-first and same-path honest
- any non-kept row is explicitly cut with rationale
- the touched docs and ledgers describe the same claim
- later recovery waves can reuse the recovered location semantics instead of
  re-solving them piecemeal
