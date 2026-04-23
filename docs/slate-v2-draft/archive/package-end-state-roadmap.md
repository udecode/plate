---
date: 2026-04-06
topic: slate-v2-package-end-state-roadmap
---

# Slate v2 Package End-State Roadmap

> Archive only. Historical/reference doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the historical package roadmap snapshot for Slate v2.

Use it for archaeology, not for current queue ownership.

This doc answers, package by package:

- exact end-state role
- TypeScript API naming posture
- what is done now
- what is next
- what is intentionally later
- what would count as fake progress
- what proof gates must pass before broadening the package

If a proposed slice does not obviously advance one package from **done now** to
**next**, it does not belong on the roadmap.

## Status

Frozen roadmap reference.

The macro queue here is complete enough to freeze.
Do not treat this as the default active queue unless package truth or `Target B`
work reopens.

For current replacement truth, start with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## Historical Ownership Read

This file no longer owns package sequencing or the current queue.

For current roadmap truth, use:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

## Current Status Snapshot

- current program position:
  - the Phase 10 release-readiness stack is coherent enough to stop default
    roadmap work
- Phase 7 already cashed out:
  - reset/load contract publicization
  - compatibility envelope
  - migration story
  - v2-native mentions
  - v2-native links
  - current app-owned HTML paste policy with explicit `strong` / `em` / `code`
    support
- Phase 8 slices already landed:
  - `slate-browser` is now explicitly `ready`-first for maintained callers
  - legacy `waitFor*` option aliases are gone from the Playwright surface
  - `slate-react` now documents the stable editor-facing surface versus the
    advanced runtime surface explicitly
- Phase 9 slices already landed:
  - replacement compatibility matrix now includes legacy and current
    `paste-html` rows
  - replacement compatibility matrix now includes current `highlighted-text`
    coverage beside the legacy highlight/search family
  - replacement compatibility matrix now includes legacy `code-highlighting`
    beside the same decoration/highlight family
  - replacement compatibility matrix now includes current
    `persistent-annotation-anchors` coverage for the anchor/projection family
  - a first replacement family ledger now records preserved / redefined /
    comparison-only / intentionally-later families explicitly
  - replacement compatibility matrix now includes legacy and current
    `plaintext` / `read-only` editorial rows
  - replacement compatibility matrix now includes legacy `custom-placeholder`
    for the placeholder family
  - replacement compatibility matrix now includes legacy `richtext`, which
    sharpens that family to comparison-only instead of vague uncovered status
  - current render-first `richtext` proof now exists too, which promotes that
    family from comparison-only to redefined
  - replacement compatibility matrix now includes current `shadow-dom` and
    `iframe`, which promotes the browser-boundary family from comparison-only
    to preserved
  - replacement compatibility matrix now includes legacy `tables`, `embeds`,
    and `editable-voids`, which sharpens those families to comparison-only
  - replacement compatibility matrix now includes legacy `images`, which
    sharpens that family to comparison-only instead of generic deferral
  - replacement compatibility matrix now includes legacy `forced-layout`,
    `styling`, and `hovering-toolbar`, which sharpens those families to
    comparison-only
  - replacement compatibility matrix now includes legacy `markdown-preview` and
    `markdown-shortcuts`, which sharpens the markdown family to comparison-only
  - `scroll-into-view` now stays intentionally later for an explicit evidence
    reason instead of a vague leftover bucket
- Phase 10 slices already landed:
  - package README/API truth is aligned across all five packages
  - repo-level replacement docs now tell the same package/family truth
  - the final explicit replacement statement is aligned across README,
    replacement-candidate docs, and the scoreboard
  - the default recommendation is now explicit:
    - default
    - advanced
    - comparison-only
  - the stop/go release-readiness decision now lives in one explicit artifact
  - the full-replacement blockers are now explicit:
    - hard blockers
    - optional improvements
  - duplicated claim language is trimmed so each Phase 10 doc has one clear job
  - the public README now owns the short verdict/default recommendation while
    `replacement-candidate.md` stays focused on current package and envelope
    truth
- current truth:
  - `Target A`: `Go`
  - `Target B`: `No-Go`

## Historical Macro Task Queue

This is retained as historical queue context only.

Do not use these as the current planning surface.
Use [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md) for current queue and roadmap truth.

1. `Finish slate Core Surface`
   Status:
   Done enough to freeze the planning surface.
   Done:
   snapshots, runtime identity, reset/replace, current op families, current location helpers, and the stable-vs-secondary public surface call.
   Todo:
   no separate macro-task todo here.
   Remaining semantic growth belongs under Tasks 2 and 3.
   Remaining macro concerns:

   - stable integration surface is:
     - `createEditor`
     - `Editor`
     - `Transforms`
     - core document/location/op/snapshot types
   - secondary public helper surface stays exported but is not the frozen integration surface
   - any further transform/location breadth belongs under Tasks 2 and 3, not under a vague core-surface tail

2. `Finish Structural Families`
   Status:
   Done enough to freeze the planning surface.
   Done:
   exact-path plus top-level supportable `wrapNodes(...)`, `unwrapNodes(...)`, and `liftNodes(...)`.
   Todo:
   no separate macro-task todo here.
   Remaining structural growth is intentionally later unless real migration pressure reopens it.
   Remaining macro concerns:

   - stable structural family freeze boundary is:
     - exact-path `wrapNodes(...)`, `unwrapNodes(...)`, and `liftNodes(...)`
     - top-level block or wrapper-child `Range` / current-selection support
       where the semantics are already proved
   - mixed-inline partial-range structural semantics are intentionally later
   - broader `match` / `mode` / `split` / inline / voids parity is intentionally later
   - reopen this task only when a real migration lane forces one of those semantics

3. `Finish Text/Selection Families`
   Status:
   Done enough to freeze the planning surface.
   Done:
   current `delete(...)`, `move(...)`, `Editor.before(...)`, `Editor.after(...)`, and the narrow selection-helper set through the supportable same-block and adjacent-block seams.
   Todo:
   no separate macro-task todo here.
   Remaining text/selection growth is intentionally later unless real migration pressure reopens it.
   Remaining macro concerns:

   - stable text/selection freeze boundary is:
     - `Editor.before(...)` / `Editor.after(...)` with `Path | Point | Range`
       over supported top-level text blocks
     - `Transforms.move(...)` with `distance` / `reverse` / `edge`
     - `Transforms.delete(...)` for the currently proved same-text,
       mixed-inline, and adjacent supported block-boundary shapes
     - `select`, `collapse`, `setPoint`, `setSelection`, `deselect` in their
       current narrow forms
   - `unit`, `voids`, `hanging`, and unsupported-block parity are intentionally later
   - broader multi-block delete/move/location semantics are intentionally later
   - reopen this task only when a real migration lane forces one of those semantics

4. `Package Freeze And Replacement Truth`
   Status:
   Done enough to freeze the planning surface.
   Done:
   release-readiness docs, replacement statement, blocker ledger, package/public-doc ownership, and the package freeze boundary are coherent.
   Todo:
   no separate macro-task todo here.
   The package-freeze and replacement-truth program is complete enough to freeze.
   Package-freeze macro tasks:
   - `Freeze slate-dom Surface`
     Lock the stable DOM/clipboard boundary and make the naming decision explicit.
     Status:
     Done enough.
   - `Freeze slate-react Surface`
     Lock the stable editor-facing surface versus advanced runtime escape hatches.
     Status:
     Done enough.
   - `Freeze slate-history Surface`
     Lock the boring history contract and mark richer history semantics as later or comparison-only.
     Status:
     Done enough.
   - `Freeze slate-browser Surface`
     Lock the proof-infra contract and keep it out of product-surface creep.
     Status:
     Done enough.
   - `Refresh Replacement Truth`
     Sync matrix, family ledger, blockers, and replacement-candidate docs to the frozen package truth.
     Status:
     Done enough.
   - `Final Stop/Go`
     Re-state the exact honest replacement claim after the package freezes land.
     Status:
     Done enough.

Current read:

- the roadmap stack is now coherent enough to stop default roadmap grooming
- Task 1 is now done enough to stop being its own open macro-task
- Task 2 is now done enough to stop being its own open macro-task
- Task 3 is now done enough to stop being its own open macro-task
- Task 4 is now done enough to stop being its own open macro-task
- the default planning unit is one of the four macro tasks above
- micro-slices are execution notes, not the roadmap surface
- the roadmap macro program is now complete enough to freeze
- use [roadmap-status.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/roadmap-status.md)
  as the maintenance rule for when roadmap work is still justified

That is the point of this roadmap:

- move the owning package
- do not wander

## Current Package Matrix

This is the fast scan.
The package sections below are the durable contract.

| Package         | End-state role                  | Done now                                                       | Next                    |
| :-------------- | :------------------------------ | :------------------------------------------------------------- | :---------------------- |
| `slate`         | transaction-first document core | snapshots, selection, refs, reset/replacement seams            | Macro Tasks 1, 2, and 3 |
| `slate-dom`     | browser boundary owner          | DOM mapping, selection bridge, clipboard boundary              | Macro Task 4            |
| `slate-react`   | React 19.2+ runtime             | selector-first anchor runtime                                  | Macro Task 4            |
| `slate-history` | transaction-aware history       | undo/redo, merge/save boundaries, explicit reset/load boundary | Macro Task 4            |
| `slate-browser` | proof infrastructure            | editor-first harness + ready-first Playwright surface          | Macro Task 4            |

## Slice Gate

Before any new package work starts, answer these in this doc:

1. which package owns the work?
2. which exact public TS API entrypoint moves?
3. which proof lane upgrades from red/unknown to green?
4. which line under `Next` becomes partially or fully complete?

And force one sentence:

- “This slice advances `<package>` by delivering `<public API or proof gate>`.”

If you cannot answer all four, or that sentence sounds fake, the slice is
drifting.

## Global Naming Rule

Stay as close as possible to Slate’s established package and API names when the
semantics are still honestly the same.

That means:

1. keep package names:
   - `slate`
   - `slate-dom`
   - `slate-react`
   - `slate-history`
2. prefer legacy namespace shapes when semantics line up:
   - `Editor.*`
   - `Transforms.*`
   - `HistoryEditor.*`
3. do **not** invent cute replacement names when the old Slate name still fits
4. do **not** keep a legacy name when the semantics have materially changed and
   the old name would lie
5. when v2 keeps a new name on purpose, document why in the owning package
   section before shipping more work

Bluntly:

- rename only for truth
- not for style

## Regression Rule

Regression prevention here means two different things:

1. **semantic regression**
   - do not silently drop a legacy behavior that the package roadmap still
     claims to preserve
2. **naming regression**
   - do not drift away from Slate naming conventions unless the semantics forced
     it and the roadmap explicitly records that choice

Every package slice should answer:

- are we preserving a legacy name?
- are we preserving a legacy behavior?
- if not, is that an intentional redefinition?

## Reference Inputs

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [cohesive-program-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md)
- [final-synthesis.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md)
- current replacement-candidate repo:
  `/Users/zbeyens/git/slate-v2`
- legacy Slate repo:
  `/Users/zbeyens/git/slate`

## `slate`

### End-State Role

Own:

- document semantics
- operation model
- transaction execution
- immutable committed snapshots
- runtime identity
- explicit external replacement/reset entrypoints

Do not own:

- DOM translation
- browser event semantics
- React runtime policy
- product-layer inline/HTML behavior

### TypeScript API Posture

Stay closest to legacy Slate names for the core:

- `createEditor`
- `Editor`
- `Transforms`
- `Descendant`
- `Element`
- `Text`
- `Path`
- `Point`
- `Range`
- `Operation`

Current v2 public surface already does that well.

Current exported surface in `/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts`:

- `createEditor`
- `Editor`
- `Transforms`
- `insertFragment`
- `insertNodes`
- `insertText`
- `liftNodes`
- `mergeNodes`
- `removeText`
- `moveNodes`
- `removeNodes`
- `setNodes`
- `splitNodes`
- `unsetNodes`
- `collapse`
- `move`
- `setPoint`
- `setSelection`
- `deselect`
- `select`
- types:
  - `Descendant`
  - `EditorSnapshot`
  - `InsertNodeOperation`
  - `InsertNodesOptions`
  - `MergeNodeOperation`
  - `MergeNodesOptions`
  - `RemoveTextOperation`
  - `RemoveTextOptions`
  - `RemoveNodeOperation`
  - `RemoveNodesOptions`
  - `SetNodeOperation`
  - `SetNodesOptions`
  - `SplitNodeOperation`
  - `SplitNodesOptions`
  - `SnapshotIndex`
  - `SnapshotInput`
  - `RuntimeId`
  - `UnsetNodesOptions`
  - `RangeRef`
  - `ProjectedRangeSegment`
  - standard location/op types

End-state stable public surface should be:

- `createEditor()`
- `Editor.after(...)`
- `Editor.before(...)`
- `Editor.getSnapshot(...)`
- `Editor.getFragment(...)`
- `Editor.projectRange(...)`
- `Editor.rangeRef(...)`
- `Editor.reset(...)`
- `Editor.replace(...)`
- `Editor.subscribe(...)`
- `Editor.withTransaction(...)`
- `Transforms.*`
- standard document/location/op types

Stable-vs-secondary freeze decision:

- stable integration surface:
  - `createEditor`
  - `Editor`
  - `Transforms`
  - core document/location/op/snapshot types
- secondary public helper surface:
  - standalone transform helpers
  - helper-level snapshot/runtime types
- do not sell the secondary helper surface as the primary frozen integration surface

Possible later additions, only if proved:

- broader `Transforms.*` families
- better transaction naming if `withTransaction` turns out to be the wrong final
  public label

Do **not** invent a second cute public namespace for transactions or snapshots.

### Done Now

- committed snapshot contract is real
- runtime identity is real
- transaction-owned selection/marks/refs are real
- explicit reset/load naming exists
- path-based `insert_node` / `remove_node` operations are real
- matching `Transforms.insertNodes(...)` / `Transforms.removeNodes(...)`
  wrappers are real
- path-based `set_node` is real
- matching `Transforms.setNodes(...)` wrapper is real
- exact `split_node` is real
- matching narrow `Transforms.splitNodes(...)` helper is real
- exact `merge_node` is real
- matching path-based `Transforms.mergeNodes(...)` helper is real
- path-based property removal through `set_node` is real
- matching `Transforms.unsetNodes(...)` wrapper is real
- narrow exact-path `Transforms.wrapNodes(...)` helper is real
- it now also wraps top-level block `Range` / current-selection spans
- narrow exact-path `Transforms.unwrapNodes(...)` helper is real
- it now also unwraps top-level wrapper block `Range` / current-selection spans
- narrow exact-path `Transforms.liftNodes(...)` helper is real
- it now also lifts top-level wrapper-child `Range` / current-selection spans
- exact `remove_text` is real
- narrow exact `Transforms.delete(...)` helper is real:
  `Path`, same-text `Point | Range`, plus collapsed reverse/distance same-text
  deletion, including mixed-inline sibling-leaf crossings inside one supported
  top-level block
- explicit non-empty `Range` deletion now also spans adjacent mixed-inline
  sibling-leaf crossings inside one supported top-level block
- explicit non-empty `Range` deletion now also removes fully covered interior
  descendants inside one supported top-level block
- explicit non-empty `Range` deletion now also crosses adjacent supported
  top-level block boundaries when the blocks can merge
- collapsed reverse/distance deletion now also crosses adjacent supported
  top-level block boundaries when the blocks can merge
- matching `Transforms.removeText(...)` helper is real
- narrow `Transforms.collapse(...)` helper is real
- narrow `Transforms.move(...)` helper is real
- it now walks across mixed-inline text leaves inside one supported top-level
  text block
- it now also crosses supported top-level block boundaries
- narrow `Editor.before(...)` helper is real
- narrow `Editor.after(...)` helper is real
- both now accept `Path | Point | Range`
- both now walk across mixed-inline text leaves inside one supported top-level
  text block
- both now also cross supported top-level block boundaries
- narrow `Transforms.select(...)` helper now accepts `Path | Point | Range | null`
- narrow `Transforms.setPoint(...)` helper is real
- narrow `Transforms.setSelection(...)` helper is real
- narrow `Transforms.deselect(...)` helper is real

### Next

1. `Finish slate Core Surface`
   Execution notes:

   - freeze the exact public `Editor` / `Transforms` / type surface honestly
   - decide which current v2-era helpers remain public versus internal
   - close only the remaining supportable core gaps

2. `Finish Structural Families`
   Execution notes:

   - broaden `wrapNodes(...)`, `unwrapNodes(...)`, and `liftNodes(...)` only
     where the semantics are supportable and migration-forced

3. `Finish Text/Selection Families`
   Execution notes:

   - broaden `delete(...)`, `move(...)`, `Editor.before(...)`, and
     `Editor.after(...)` only where the semantics are supportable and
     migration-forced

4. `Package Freeze And Replacement Truth`
   Execution notes:
   - freeze the core TS API only after the runtime/browser packages stop
     forcing changes

### Intentionally Later

- middleware/plugin phase pipeline
- broader collaboration surface
- any greenfield engine ideal from `engine.md` that is not needed for the
  replacement candidate

### Proof Gates

- core unit contract tests
- replacement matrix rows that depend on the core behavior
- runtime packages consume the API without effect-mirroring or browser leakage

### Fake Progress

- adding new core nouns without proving a user-facing seam
- renaming `Editor`/`Transforms` APIs just because the new names feel cleaner
- widening core to absorb app-owned HTML or autocomplete policy

## `slate-dom`

### End-State Role

Own:

- DOM point/path translation
- DOM selection bridge
- clipboard browser boundary
- nested editor and shadow/iframe boundary rules
- composition and input transport that truly belongs at the browser layer

Do not own:

- React hooks
- runtime subscriptions
- editor semantics

### TypeScript API Posture

Stay close to legacy naming where it still fits.

Legacy `slate-dom` exported a broad `DOMEditor` namespace.
Current v2 exports:

- `DOMBridge`
- `ClipboardBridge`
- DOM/clipboard bridge types

Roadmap rule:

- keep the current explicit v2 names until the final browser-boundary surface is
  stable
- if the final public shape converges on the old `DOMEditor` mental model,
  rename deliberately later
- do **not** rename `DOMBridge` to `DOMEditor` early just for nostalgia

End-state stable public TS API should likely be:

- one DOM-facing helper namespace
- one explicit clipboard boundary namespace or equivalent clearly-scoped
  methods
- typed DOM conversion inputs/outputs

The exact names can still pivot.
The ownership cannot.

### Done Now

- DOM identity mapping
- selection bridge
- clipboard boundary
- cross-root containment proofs
- stable surface freeze boundary is explicit:
  - `DOMBridge`
  - `ClipboardBridge`

### Next

1. no separate macro-task todo here
2. reopen only when a real migration row forces more browser-boundary truth

### Intentionally Later

- speculative DOM helper bundles
- generic compatibility glue for every old `slate-react` assumption
- future `EditContext` work until browser support and proof justify it
- renaming to `DOMEditor` without a real package-truth change

### Proof Gates

- `packages/slate-dom/test/bridge.ts`
- `packages/slate-dom/test/clipboard-boundary.ts`
- browser lanes:
  - shadow DOM
  - iframe
  - current clipboard/type/paste rows

### Fake Progress

- renaming APIs to sound more Slate-like without changing truth
- moving app-owned paste policy into `slate-dom`
- adding generic helpers that no proved browser lane actually needs

## `slate-react`

### End-State Role

Own:

- snapshot-driven runtime wiring
- selector subscriptions
- stable editor instance semantics
- explicit replacement/reset consumption in React
- React lifecycle ownership around the DOM bridge
- the stable editor-facing component surface

Do not own:

- DOM translation
- browser event semantics that belong in `slate-dom`
- app-owned inline policy

### TypeScript API Posture

Stay close to legacy where semantics still match:

- `Slate`
- `Editable`
- `useSlateStatic`
- `useSlateSelector`

Current v2 public surface is broader than the stable end-state and includes both
anchor-surface exports and low-level primitives.

Current exported surface in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`:

- anchor/editor-facing:
  - `Slate`
  - `EditableBlocks`
  - `Editable`
- lower-level building blocks:
  - `EditableText`
  - `EditableTextBlocks`
  - `EditableElement`
  - `VoidElement`
  - `SlateElement`
  - `SlateLeaf`
  - `SlatePlaceholder`
  - `SlateSpacer`
  - `SlateText`
  - `TextString`
  - `ZeroWidthString`
- hooks/runtime helpers:
  - `useSlateSelector`
  - `useSlateStatic`
  - `useSlateReplace`
  - `useSlateRootRef`
  - `useSlateNodeRef`
  - `useSlateProjections`
  - `useSlateRangeRefProjectionStore`
  - `createSlateProjectionStore`

End-state stable public TS API should be split mentally into:

1. **stable editor-facing surface**
   - `Slate`
   - `EditableBlocks`
   - `Editable`
   - `useSlateSelector`
   - `useSlateStatic`
2. **advanced runtime escape hatches**
   - low-level primitives
   - projection-store helpers
   - DOM-binding hooks

Roadmap rule:

- do not let every proof-era primitive masquerade as equally stable public API
- but do not delete low-level primitives just to make the package look cleaner

### Done Now

- selector-first runtime
- current anchor surface
- explicit reset/load consumption
- keyboard and paste event forwarding for app-owned behavior
- mentions, links, and the explicit `strong` / `em` / `code` HTML paste slice
  all run on the current seam
- stable-vs-advanced surface split is now published explicitly in docs
- stable editor-facing freeze boundary is explicit:
  - `Slate`
  - `EditableBlocks`
  - `Editable`
  - `useSlateSelector`
  - `useSlateStatic`

### Next

1. no separate macro-task todo here
2. reopen only when a real product lane forces broader runtime truth

### Intentionally Later

- broad legacy hook parity
- full toolbar/floating-UI parity
- large-doc product-layer work beyond the stable runtime posture

### Proof Gates

- `packages/slate-react/test/runtime.tsx`
- current release-shaped browser lanes
- app-owned inline-family migration slices on top of the runtime seam

### Fake Progress

- turning app-owned behaviors into runtime features just to make demos look more
  magical
- adding legacy-named hooks that are only thin wrappers over the new model
- keeping everything “experimental” forever instead of classifying stable vs
  advanced

## `slate-history`

### End-State Role

Own:

- transaction-aware undo units
- redo units
- merge/save boundaries
- explicit reset/load boundary for history-backed editors

Do not own:

- DOM behavior
- React lifecycle
- app-owned migration policy beyond the history contract

### TypeScript API Posture

Stay very close to legacy:

- `withHistory`
- `HistoryEditor`

Current v2 adds one justified extra:

- `HistoryEditor.reset(...)`

That name is good.
Keep it.

End-state stable public TS API:

- `withHistory(...)`
- `HistoryEditor.undo(...)`
- `HistoryEditor.redo(...)`
- `HistoryEditor.withoutSaving(...)`
- `HistoryEditor.withMerging(...)`
- `HistoryEditor.reset(...)`

### Done Now

- transaction-aware undo/redo
- merge/save boundaries
- explicit reset/load history boundary
- stable history freeze boundary is explicit:
  - `withHistory(...)`
  - `HistoryEditor.undo(...)`
  - `HistoryEditor.redo(...)`
  - `HistoryEditor.reset(...)`
  - `HistoryEditor.withoutSaving(...)`
  - `HistoryEditor.withMerging(...)`

### Next

1. no separate macro-task todo here
2. reopen only when migration rows force broader history semantics

### Intentionally Later

- richer bookmark/tag semantics borrowed from ProseMirror or Lexical
- collaboration-specific history variants

### Proof Gates

- `packages/slate-history/test/history-contract.ts`
- runtime/browser rows that depend on reset/undo/redo correctness

### Fake Progress

- inventing new history nouns without real migration pressure
- broadening history policy because a single demo wants custom behavior

## `slate-browser`

### End-State Role

`slate-browser` is proof infrastructure.

Own:

- browser test harness
- editor-first Playwright helpers
- lane ownership for browser-facing proof

Do not own:

- product editor API
- generic driver abstraction
- framework-neutral testing fantasy

### TypeScript API Posture

There is no legacy Slate package equivalent here.

Current subpath surface:

- `slate-browser`
- `slate-browser/core`
- `slate-browser/browser`
- `slate-browser/playwright`

This is fine.

End-state rule:

- keep the package explicit and editor-shaped
- keep `ready` as the canonical setup contract
- do not create a generic multi-backend driver until a second real backend
  exists

### Done Now

- current browser helper surface
- current proof-lane coverage
- ready-first Playwright surface
- clipboard helpers
- bookmark helpers
- scoped surface support
- stable proof-infra freeze boundary is explicit:
  - `slate-browser/core`
  - `slate-browser/browser`
  - `slate-browser/playwright`
  - `ready` as the maintained setup contract

### Next

1. no separate macro-task todo here
2. reopen only when a proof lane forces another helper or ownership clarification

### Intentionally Later

- cross-backend generic driver layer
- product-facing API promises
- broad release positioning beyond proof infrastructure

### Proof Gates

- package tests
- local e2e suite
- replacement compatibility matrix

### Fake Progress

- adding helpers because they feel nice instead of because a proof lane needs
  them
- pretending `slate-browser` is a user-facing product package
- widening setup abstractions before a second backend exists

## Appendix: Fresh ProseMirror + Lexical Scan

Use this appendix to pressure package decisions.
Do not let it outrank the queue above.

This appendix comes from a fresh focused code scan of:

- `/Users/zbeyens/git/prosemirror`
- `/Users/zbeyens/git/lexical`

specifically for:

- transaction/update model
- history/bookmark semantics
- clipboard boundary
- extension/plugin composition
- React/runtime subscription model

Scanned files:

### ProseMirror

- `state/src/state.ts`
- `state/src/transaction.ts`
- `state/src/plugin.ts`
- `history/src/history.ts`
- `view/src/clipboard.ts`

### Lexical

- `packages/lexical/src/LexicalEditorState.ts`
- `packages/lexical/src/LexicalUpdates.ts`
- `packages/lexical/src/LexicalEditor.ts`
- `packages/lexical/src/LexicalReconciler.ts`
- `packages/lexical-history/src/index.ts`
- `packages/lexical-clipboard/src/clipboard.ts`
- `packages/lexical-selection/src/index.ts`
- `packages/lexical-extension/src/LexicalBuilder.ts`
- `packages/lexical-react/src/LexicalComposer.tsx`
- `packages/lexical-react/src/useLexicalSubscription.tsx`
- `packages/lexical-react/src/LexicalOnChangePlugin.ts`

## Comparative Guidance By Package

### `slate`

#### Borrow Now

- **ProseMirror transaction shape discipline**
  from
  [`state.ts`](/Users/zbeyens/git/prosemirror/state/src/state.ts)
  and
  [`transaction.ts`](/Users/zbeyens/git/prosemirror/state/src/transaction.ts):
  keep one persistent editor state, one explicit transaction object, and one
  apply path.
- **Lexical immutable editor-state pressure**
  from
  [`LexicalEditorState.ts`](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditorState.ts)
  and
  [`LexicalUpdates.ts`](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts):
  keep committed state immutable and treat updates as a distinct staged unit.

#### Reject

- **ProseMirror plugin-defined state in core**
  from
  [`plugin.ts`](/Users/zbeyens/git/prosemirror/state/src/plugin.ts).
  Good architecture, wrong timing. V2 core should not reopen the plugin model
  before the replacement candidate is stable.
- **Lexical bespoke reconciler model**
  from
  [`LexicalReconciler.ts`](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalReconciler.ts).
  That is too far from Slate’s data-model and public-op constraints.

#### Later

- **Lexical update-tag vocabulary**
  from
  [`packages/lexical-history/src/index.ts`](/Users/zbeyens/git/lexical/packages/lexical-history/src/index.ts)
  and
  [`LexicalUpdates.ts`](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts)
  as a refinement to transaction metadata.
- **ProseMirror plugin transaction hooks**
  from
  [`plugin.ts`](/Users/zbeyens/git/prosemirror/state/src/plugin.ts)
  if the middleware/end-state direction in `engine.md` is revived later.

### `slate-dom`

#### Borrow Now

- **ProseMirror’s explicit clipboard boundary**
  from
  [`view/src/clipboard.ts`](/Users/zbeyens/git/prosemirror/view/src/clipboard.ts):
  serialization, parsing, and internal metadata live at the DOM boundary, not
  smeared through React.
- **Lexical’s split clipboard + selection ownership**
  from
  [`packages/lexical-clipboard/src/clipboard.ts`](/Users/zbeyens/git/lexical/packages/lexical-clipboard/src/clipboard.ts)
  and
  [`packages/lexical-selection/src/index.ts`](/Users/zbeyens/git/lexical/packages/lexical-selection/src/index.ts):
  selection and clipboard are serious browser subsystems, not afterthoughts.

#### Reject

- **ProseMirror-style DOM authority over state**
  in the broader `view` stack.
  Slate v2 already chose committed core snapshots plus explicit DOM bridging.
- **Lexical’s full browser ownership stack**
  as a direct import.
  Useful shape, but too coupled to Lexical’s node/reconciler model.

#### Later

- **ProseMirror-style richer clipboard context metadata**
  from `data-pm-slice` handling in
  [`clipboard.ts`](/Users/zbeyens/git/prosemirror/view/src/clipboard.ts)
  if current fragment metadata proves too weak.
- **Lexical selection subsystem ideas**
  from
  [`packages/lexical-selection/src/index.ts`](/Users/zbeyens/git/lexical/packages/lexical-selection/src/index.ts)
  when current DOM selection pressure exposes a real gap.

### `slate-react`

#### Borrow Now

- **Lexical’s package split between core and React**
  from
  [`LexicalComposer.tsx`](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx):
  keep React ownership explicit and separate from editor core.
- **ProseMirror’s hard line that React is not in the core**
  by absence. This reinforces the current v2 split and should stay.

#### Reject

- **Lexical’s `useState` + `useLayoutEffect` subscription model**
  from
  [`useLexicalSubscription.tsx`](/Users/zbeyens/git/lexical/packages/lexical-react/src/useLexicalSubscription.tsx).
  Current v2 is right to stay with `useSyncExternalStore` semantics instead.
- **ProseMirror’s lack of a React runtime story**
  as a reason to under-specify `slate-react`.
  V2 should keep being more explicit than ProseMirror here.

#### Later

- **Lexical’s explicit on-change filtering by tags/dirty sets**
  from
  [`LexicalOnChangePlugin.ts`](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalOnChangePlugin.ts)
  as a later refinement for derived non-urgent UI.
- **Sharper stable-vs-advanced surface split**
  informed by the contrast between Lexical’s React package and current v2
  proof-era exports.

### `slate-history`

#### Borrow Now

- **ProseMirror selection-bookmark seriousness**
  from
  [`history/src/history.ts`](/Users/zbeyens/git/prosemirror/history/src/history.ts):
  history should treat selection restore as a first-class concern, not a tack-on.
- **Lexical’s history awareness of change categories**
  from
  [`packages/lexical-history/src/index.ts`](/Users/zbeyens/git/lexical/packages/lexical-history/src/index.ts):
  keep history semantics tied to update meaning, not only elapsed time.

#### Reject

- **ProseMirror’s full branch/item compression machinery**
  from
  [`history.ts`](/Users/zbeyens/git/prosemirror/history/src/history.ts).
  Great system, too heavy for the current replacement-candidate stage.
- **Lexical’s tag-heavy history contract**
  as an immediate must-have. Good refinement, wrong timing.

#### Later

- **ProseMirror bookmarks**
  as the strongest later refinement target for undo/redo selection behavior.
- **Lexical-style update tags**
  if current reset/undo/redo semantics start needing finer grouping rules.

### `slate-browser`

#### Borrow Now

- **Nothing broad from ProseMirror**
  on test infra directly.
  Its value here is architecture pressure, not browser-test helpers.
- **Use Lexical only as a reminder**
  that browser-facing proof should exercise real update flows, not synthetic
  hand-wave tests.

#### Reject

- **Generic multi-backend test abstraction**
  There is still only one real backend here. Do not imitate broader framework
  harness layers before a second backend exists.
- **Turning `slate-browser` into product API**
  ProseMirror and Lexical both reinforce that this package is support
  infrastructure, not editor runtime surface.

#### Later

- **Potential richer lane filtering / event tagging**
  inspired indirectly by Lexical’s update tagging, but only if current browser
  lanes become noisy enough to justify it.

## Appendix Bottom Line

Fresh scan verdict:

- ProseMirror still sharpens:
  - transaction discipline
  - clipboard boundary ownership
  - selection-bookmark seriousness
- Lexical still sharpens:
  - immutable committed update model
  - package split discipline
  - later transaction/history metadata ideas
  - what to reject in React subscription design

What changes now:

- the roadmap should explicitly treat ProseMirror as the stronger source for
  `slate-dom` and `slate-history` refinements
- the roadmap should explicitly treat Lexical as the stronger source for
  `slate` transaction/update pressure and for later `slate-react`/history
  refinement ideas

What does **not** change:

- do not pivot the core ontology to ProseMirror or Lexical
- do not reopen package ownership
- do not genericize `slate-browser`
