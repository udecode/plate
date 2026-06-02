---
title: Portable Text schema, behavior, and portability evidence
type: source
status: partial
updated: 2026-05-28
related:
  - docs/analysis/editor-architecture-candidates.md
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
---

# Portable Text Schema, Behavior, And Portability Evidence

## Scope

This page records the first local source read of `../portabletext` for Slate v2
architecture planning. It is not a full Portable Text audit. It answers one
question: what should Slate v2 steal, reject, or deliberately keep in Plate.

## Source Read

- `../portabletext/README.md`: monorepo and package map.
- `../portabletext/apps/docs/src/content/docs/specification.mdx`: data
  specification, block/span/mark shape, `_key` purpose, renderer ecosystem.
- `../portabletext/packages/schema/src/define-schema.ts` and
  `compile-schema.ts`: schema declaration and compile-time normalization.
- `../portabletext/packages/editor/src/behaviors/*`: behavior event/action
  model, core behaviors, priority, and event dispatch.
- `../portabletext/packages/editor/src/editor/*`: XState actor runtime,
  selectors, snapshot shape, node registration, mutation and sync machines.
- `../portabletext/packages/editor/src/selectors/*` and
  `../portabletext/packages/toolbar/src/*`: selector and toolbar split.
- `../portabletext/packages/editor/src/internal-utils/operation-to-patches.ts`
  and `../portabletext/packages/patches/src/patches.ts`: operation-to-patch
  bridge and Sanity-style patch helpers.
- `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx`:
  browser behavior testing lane.

## Strong Mechanisms

### 1. Public Content Spec Discipline

Portable Text treats rich content as a portable JSON format. The docs describe a
document as an array of blocks; text blocks contain `children`, `style`,
`markDefs`, and optional list metadata; spans contain `text` and `marks`; custom
blocks can be any `_type`.

Evidence:

- `../portabletext/apps/docs/src/content/docs/specification.mdx:16-33`
- `../portabletext/apps/docs/src/content/docs/specification.mdx:56-69`
- `../portabletext/apps/docs/src/content/docs/specification.mdx:85-93`

Slate takeaway:

- Steal the standards posture: publish clear structural profiles, portability
  expectations, and render/serialize rules for common rich-text shapes.
- Reject the value format as Slate core law. Slate should stay value-shape
  agnostic; Portable Text belongs as a profile/adapter or Plate interop lane.

### 2. Schema Applicability Is A First-Class Query

Portable Text separates declaration from compiled runtime schema. `defineSchema`
preserves a typed declaration for styles, lists, decorators, annotations, block
objects, and inline objects. `compileSchema` adds defaults, rejects reserved
block fields, and propagates root block schema into nested `of` members when
needed.

The editor then resolves registered containers and exposes applicable schema
selectors. A test proves a selection spanning root text and a nested callout
returns the union of text-only schema entries, while insertion options come from
the focus sub-schema.

Evidence:

- `../portabletext/packages/schema/src/define-schema.ts:6-17`
- `../portabletext/packages/schema/src/compile-schema.ts:125-220`
- `../portabletext/packages/editor/src/editor/editor-snapshot.ts:18-36`
- `../portabletext/packages/editor/src/selectors/selector.get-applicable-schema.test.ts:129-168`
- `../portabletext/packages/toolbar/src/use-toolbar-schema.ts:60-73`

Slate takeaway:

- Steal the idea that schema applicability is a queryable runtime contract.
  Slate v2 already has element specs and `state.schema`; it should make
  examples/docs show "what is allowed here?" selectors as normal DX.
- Reject Portable Text's fixed CMS-ish categories as raw Slate core categories.
  Plate can map them; Slate should keep open element specs.

### 3. Behavior Events Are Cleaner Than Handler Soup

Portable Text's `defineBehavior` gives behavior authors three simple parts:
`on`, `guard`, and `actions`. Actions have four explicit propagation semantics:
`execute` bypasses behavior matching, `forward` continues through the remaining
chain, `raise` starts a fresh lookup, and `effect` runs side effects with an
async `send` escape.

Dispatch builds a snapshot once for guard/action evaluation, matches exact and
namespace event names, falls through to default synthetic operations, and groups
multi-action writes into undo steps.

Evidence:

- `../portabletext/packages/editor/src/behaviors/behavior.types.behavior.ts:13-40`
- `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts:14-54`
- `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts:56-159`
- `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts:76-150`
- `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts:181-252`
- `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts:291-344`
- `../portabletext/apps/docs/src/content/docs/editor/guides/create-behavior.mdx:24-47`

Slate takeaway:

- Strong steal: the action vocabulary. Slate v2 transform/input middleware would
  be easier to reason about if behavior-like overrides can say `continue`,
  `execute default`, `raise semantic event`, or `effect` instead of encoding
  propagation by returning booleans or mutating DOM events.
- Keep the core unopinionated: this belongs as a behavior/command layer over
  `editor.update`, not as a replacement for Slate transforms.

### 4. Behavior Ordering Is Explicit

Portable Text gives behaviors priority objects that can reference another
priority with `higher` or `lower`; sorting builds a graph and core behaviors are
chained to preserve declaration order.

Evidence:

- `../portabletext/packages/editor/src/priority/priority.types.ts:3-24`
- `../portabletext/packages/editor/src/priority/priority.sort.ts:25-83`
- `../portabletext/packages/editor/src/behaviors/behavior.core.ts:47-66`

Slate takeaway:

- Partial steal: behavior/event middleware needs stable ordering and conflict
  rules. Numeric priorities are not enough when plugins need "before X" or
  "after Y".
- Reject the exact priority object API for now. Slate v2 extension ordering
  should stay smaller unless behavior middleware becomes a public package.

### 5. Selector And Toolbar Boundaries Are Good Product DX

Portable Text exposes pure selectors from snapshots and makes toolbar packages
consume editor selectors rather than reaching into editor internals. The toolbar
schema hook resolves the union of schema entries for stable button sets, while
applicable schema determines enabled state at the current selection.

Evidence:

- `../portabletext/packages/editor/src/editor/editor-selector.ts:12-55`
- `../portabletext/packages/editor/src/selectors/index.ts:1-60`
- `../portabletext/packages/toolbar/src/use-toolbar-schema.ts:60-88`

Slate takeaway:

- Steal for Plate and examples: toolbar logic should be selector-first and
  schema-derived.
- Reject for raw Slate core: shipping a toolbar schema package in Slate would
  push product UI policy into the engine.

### 6. Browser Behavior Tests Are A Real Standard

Portable Text documents direct Vitest Browser Mode tests and Gherkin/Racejar
feature specs. Its guide makes editor behavior assertions against a real browser
editor and compact content snapshots.

Evidence:

- `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx:11-17`
- `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx:54-101`
- `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx:103-229`

Slate takeaway:

- Strong steal: public behavior contracts should be scenario-shaped and
  replayable. This directly supports the Slate v2 browser-regression lane for
  navigation, selection, hidden content, void roots, synced roots, clipboard,
  undo, and IME.
- Reject a mandatory Gherkin dependency in core. The useful part is the scenario
  layer and reusable step vocabulary, not the exact runner.

### 7. Patch Bridge Is Useful, But Not Canonical

Portable Text converts engine operations into Sanity-style patches and emits
local patches with operation ids. Remote patches are buffered, applied without
history, then normalized.

Evidence:

- `../portabletext/packages/editor/src/internal-utils/operation-to-patches.ts:17-53`
- `../portabletext/packages/patches/src/patches.ts:13-66`
- `../portabletext/packages/editor/src/engine-plugins/engine-plugin.patches.ts:51-87`
- `../portabletext/packages/editor/src/engine-plugins/engine-plugin.patches.ts:108-190`

Slate takeaway:

- Partial steal: adapters should be able to translate Slate commits into
  product/store patch formats with operation ids and origin metadata.
- Reject patch strings as Slate's collaboration truth. Current Slate v2 commits
  and operations are stronger for deterministic replay and history.

## Harsh Verdict

Portable Text is truly superior to the current Slate v2 planning layer on four
standards surfaces:

- public content-spec discipline;
- behavior authoring vocabulary;
- schema applicability as product DX;
- browser behavior test ergonomics.

It is not superior to current Slate v2 as a runtime engine. The local Slate v2
source already has a stronger read/update boundary, commit metadata, runtime id
dirty summaries, multi-root operations, collaboration replay, state fields, and
React projection/runtime separation.

Concrete Slate direction:

- Add Portable Text as a required evidence source whenever Slate Plan touches
  behavior customization, schema/spec policy, portability, editor examples, or
  regression proof.
- Do not turn raw Slate into Portable Text. Build profile/adapters, behavior
  middleware, and tests that let Portable Text ideas compose over Slate's value
  and operation model.

## Ecosystem Strategy Row

| System | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| ------ | --------- | ------ | ----- | ------ | ------------ | ------- |
| Portable Text | Spec-first JSON content, compiled schema, behavior event/action chain, selector-first toolbar, browser behavior specs | Private runtime shape as interchange format; ad hoc DOM/input handler chains; untested behavior plugins | Spec/profile discipline; schema applicability selectors; `execute`/`forward`/`raise`/`effect` vocabulary; scenario tests; patch adapter pattern | Portable Text value format as Slate core; CMS categories as raw element law; XState actor runtime; diff-match-patch as collab truth | Keep Slate's read/update/operation/runtime-id core; add a behavior/profile/test evidence lane and optional adapters | partial |

