# Slate v2 Absolute Architecture Review Plan

Date: 2026-04-29
Status: done
Review mode: slate-ralplan
Current pass: Pass 8 closure score and final gates complete
Current score: 0.936
Execution status: complete
Execution current phase: Public Editor/static namespace hard cut complete

## 1. Current Verdict

Hard cut the public `Editor` value export.

The current live source already cut primitive writers from the editor instance,
but `export const Editor: EditorInterface` still keeps a second public editor
API alive. That value mixes editor-state reads, writes, extension registration,
snapshot replacement, setup helpers, and type plumbing in one namespace. That
is not absolute architecture. It is legacy Slate gravity with better naming.

Target:

```ts
import { createEditor, isEditor } from "slate";
import type { Editor } from "slate";

editor.read((state) => {
  state.selection.get();
  state.text.string([]);
});

editor.update((tx) => {
  tx.nodes.set(props, { at: target });
});
```

Normal public API:

- `Editor` remains a type only.
- `editor.read((state) => ...)` is the editor-state read path.
- `editor.update((tx) => ...)` is the write and tx-local read path.
- full document replacement is a transaction write, not a static helper:
  `editor.update((tx) => tx.value.replace(input))`.
- pure data namespaces stay: `Node`, `Path`, `Point`, `Range`, `Element`,
  `Text`, and similarly pure helpers.
- `isEditor(value)` is top-level if users need a public predicate.
- extension registration stays explicit through `defineEditorExtension(...)`
  and `editor.extend(...)`.

Hard cut:

- public `export const Editor`
- public `EditorInterface`
- public `getEditorTransformRegistry` / `setEditorTransformRegistry`
- public static `Editor.*` editor-state reads and writes
- public instance `editor.replace` / `editor.reset` as normal app APIs
- docs/examples teaching instance query methods as the normal read path when a
  `state` / `tx` group exists
- first-party docs/examples/tests teaching `Editor.*` as normal app code

Internal code can still have an implementation table, but it must live behind
an internal module boundary. A public static object named `Editor` should not
survive an unpublished hard-cut rewrite.

This plan is complete. The review lane closed, the implementation lane shipped
the hard cut in `.tmp/slate-v2`, and the completion gate is green.

## 2. Intent and Boundaries

Intent:

- Remove the last large parallel public API surface after the instance-method
  hard cut.
- Make reads/writes impossible to explain two ways.
- Keep raw Slate unopinionated and easy to migrate to without copying Plate's
  product command style.

Desired outcome:

- A small public `Editor` type.
- No public static `Editor` value.
- No public static editor-state helper namespace.
- A private write-kernel / transform-registry table used only by core runtime,
  adapters, and test internals.
- Public docs and examples teach `read` / `update`, `state` / `tx`, and pure
  data namespaces.
- Full document replacement is explicit transaction work:
  `editor.update((tx) => tx.value.replace(input))`.
- Remaining instance query methods are treated as implementation/advanced
  bridge surface during migration, not normal app-author docs.

In scope:

- package export shape in `/Users/zbeyens/git/slate-v2/packages/slate/src`
- `EditorInterface` and `Editor` static value usage
- transform-registry export boundary
- public docs/examples/tests that import `Editor` as a value
- type coupling that currently references `typeof Editor.*`
- replacement/setup helper boundary
- remaining instance query boundary
- migration-backbone proof for Plate and slate-yjs substrate needs

Non-goals:

- current-version Plate adapter support
- current-version slate-yjs adapter support
- browser runtime rewrites
- React render contract changes
- `editor.refs` proposal
- removing pure data namespaces such as `Node`, `Path`, `Range`, `Point`,
  `Element`, or `Text`

Decision boundaries:

- Breaking changes are allowed because this rewrite is unpublished.
- Compatibility aliases are not required.
- Test-only helpers are allowed if they are not exported from the public package
  entrypoint.
- Current public app code should not be preserved for its own sake.
- This plan may decide replacement and query-boundary policy without asking the
  user again because both are consequences of the `Editor` value hard cut.

Unresolved user-decision points:

- none. The user explicitly asked why not hard cut the public `Editor` value;
  this plan can decide that without another question.

## 3. Decision Brief

Principles:

- One public lifecycle for editor-state reads and writes.
- Keep Slate's data model, operations, paths, and plain JavaScript values.
- Do not turn raw Slate into Plate or Tiptap.
- Public API must be easy to teach and hard to misuse.
- Internal runtime tables are fine; public escape hatches are not.

Top drivers:

- DX clarity: users should not choose between `Editor.string(editor, [])`,
  `editor.string([])`, and `editor.read((state) => state.text.string([]))`.
- React/runtime performance: React should subscribe to specific runtime facts,
  not broad editor objects or static namespaces.
- Migration backbone: Plate and slate-yjs need deterministic operations,
  commits, snapshots, and extension namespaces, not current adapter shims.

Viable options:

| Option                                                         | Pros                                                                                      | Cons                                                                                                       | Verdict |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| Keep public `Editor` value                                     | closest to legacy Slate; smallest migration delta                                         | preserves a second public read/write path; keeps huge namespace; conflicts with `state` / `tx` doctrine    | reject  |
| Split into `EditorQuery` / `EditorTransform` static namespaces | clearer than one giant `Editor`; partial migration story                                  | still creates parallel static read/write APIs and more names to teach                                      | reject  |
| Cut public `Editor` value; keep internal implementation table  | one public lifecycle; type-only `Editor`; clean docs; internal code can migrate in phases | larger source/test migration; fixture helpers need replacement                                             | choose  |
| Cut every instance query too in the same pass                  | most radical cleanup                                                                      | too much blast radius for the namespace pass; risks conflating lifecycle cleanup with query-surface design | defer   |

Chosen option:

- Cut public `Editor` value.
- Keep `Editor` as a type.
- Route editor-state reads through `state` and `tx`.
- Replace documents through `tx.value.replace(input)`, not `Editor.replace` or
  public `editor.replace`.
- Keep internal runtime/query tables only behind non-public modules.

Rejected alternatives:

- `Editor.*` static reads as "legacy-compatible but documented advanced" is
  rejected. It still teaches the wrong shape.
- `editor.api` / `editor.tf` is rejected for raw Slate. It is Plate-shaped and
  splits read freshness inside updates.
- `editor.commands` is rejected for core Slate. It is product-DX sugar.

Consequences:

- Many tests and fixture runners need seed/read helpers.
- Type aliases using `typeof Editor.*` need per-function or internal type
  sources.
- `editor.replace` / `editor.reset` callsites need either
  `tx.value.replace(input)` or non-public test seeding helpers.
- Public docs become much simpler.
- Downstream users migrate through one mental model: `read` and `update`.

Follow-ups:

- A later query-surface implementation pass can remove instance query methods
  from the public type after source migration. The current public docs target is
  already decided: app authors read through `state` / `tx`.
- Ref/path/range lifecycle helpers need a focused design row if they do not map
  cleanly to existing state/tx groups.

## 4. Confidence Scorecard

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | -----: | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.90 | The React evidence says React 19.2 helps projection and external-store scheduling but does not replace editor-owned dirty-node/runtime invalidation in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:57`. Cutting the public `Editor` value avoids broad static editor access in hot React code, but this pass does not change render runtime.                                                                                          |
| Slate-close unopinionated DX                             |   0.20 |  0.87 | The accepted naming decision says public lifecycle is `editor.read((state) => ...)` and `editor.update((tx) => ...)` in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`; live source still exports `EditorInterface` and `Editor` value in `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:798` and `:1345`.                                                                                                             |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.86 | Extension namespaces on `state` and `tx` are the accepted migration backbone in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:60`; the current public static value still mixes extension registration and editor-state helpers in `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1215`. Needs next-pass proof rows for plugin and collab substrate impact.                                                                |
| Regression-proof testing strategy                        |   0.20 |  0.86 | Existing hard-cut tests prove instance primitive writers and stale state mirrors are gone in `/Users/zbeyens/git/slate-v2/packages/slate/test/public-field-hard-cut-contract.ts:33` and runtime absence checks at `:120`; state/tx contracts prove grouped reads/writes in `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29` and `:51`. New guards are still needed for no public `Editor` value export and no public transform-registry export. |
| Research evidence completeness                           |   0.15 |  0.88 | Full corpus evidence exists for Lexical, ProseMirror, and Tiptap in `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md:25`, `:59`, and `:95`; this pass corrected stale primitive-method wording in `docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md` and `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`.                                                                                    |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.87 | The plan keeps app-visible API surfaces small and composable: type-only `Editor`, pure data namespaces, `state` / `tx`, and extension groups. Runtime-owned render-shell DX remains governed by `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:19`, but this pass does not execute that render API.                                                                                                                            |

Weighted total after Pass 1: `0.874`.

Completion threshold is not met:

- total score is below `0.92`
- pass schedule is incomplete
- high-risk deliberate pass is not closed
- objection ledger is draft only
- acceptance tests are named but not yet implemented

## 4.1 Pass 2 Intent/Boundary and Decision-Brief Pressure

Status: complete for Pass 2 only. Completion remains `pending`.

Pass 2 pressure-tested the two unresolved boundaries from Pass 1:

1. whole-document replacement/setup
2. remaining instance query methods

Verdict:

- `Editor.replace` and `Editor.reset` die with the public `Editor` value.
- `editor.replace` and `editor.reset` are not normal app-author APIs.
- public document replacement is `editor.update((tx) => tx.value.replace(input))`.
- first-party tests get non-public seed helpers where they need setup-only
  document replacement.
- remaining instance query methods are not the normal public read shape.
  App/docs/examples should use `state` and `tx` groups where those groups exist.
- instance queries can survive temporarily only as internal/advanced bridge
  surface while implementation migrates callsites and types.

Why this is the right boundary:

- Whole-document replacement is a write. Keeping it as `Editor.replace` or
  `editor.replace` repeats the same mistake as primitive mutation helpers:
  mutation outside the transaction vocabulary.
- Tests need a cheap seeding path, but tests are not the public API. A
  `createTestEditor(input)` or internal `seedEditor(editor, input)` helper is
  cleaner than preserving public replacement helpers for fixture convenience.
- Query helpers like `after`, `before`, `range`, `string`, and `above` are real
  Slate vocabulary, but teaching them through static `Editor.*` or instance
  methods keeps too many read paths alive. The final docs target is grouped
  state/tx reads.

Updated score: `0.886`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------- | -----: | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.90 | No React runtime code changes are planned in Pass 2. The boundary still supports narrow reads because app docs route through state/tx rather than static editor namespace.                                                                                                             |
| Slate-close unopinionated DX                             |   0.20 |  0.89 | `BaseEditor` currently exposes `replace`, `reset`, and many query methods at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:271` and `:313`; Pass 2 decides these are not the normal app-doc path.                                                               |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.88 | Full-document replacement maps to transaction metadata already represented by `replaceSnapshot` and `reason: 'replace'` in `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1717`; public collab replay remains `tx.operations.replay(...)`.                       |
| Regression-proof testing strategy                        |   0.20 |  0.88 | Existing tests heavily use `Editor.replace` for seeding, including `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:17`; Pass 2 adds explicit test-helper and tx-value replacement proof requirements instead of leaving fixture convenience implicit. |
| Research evidence completeness                           |   0.15 |  0.88 | No new external research was needed for this boundary pass; the current state/tx decision remains the naming authority. Pass 3 still must re-read the research/live-source layer before closure scoring can rise.                                                                      |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.88 | Pass 2 reduces normal app-facing choices: no static `Editor`, no normal `editor.replace`, no docs-first instance query path when a state/tx group exists.                                                                                                                              |

Weighted total: `0.886`.

Plan delta from Pass 2:

- Added `tx.value.replace(input)` as the public full-document replacement shape.
- Cut public `editor.replace` / `editor.reset` from normal app API target.
- Added non-public test seed helper as the fixture migration answer.
- Reclassified remaining instance query methods as temporary
  internal/advanced bridge surface, not normal docs/examples DX.
- Updated proof matrix, objection ledger, open questions, and continuation
  state.

Next owner:

- Phase 2 implementation prep in `.tmp/slate-v2/packages/slate`: introduce the
  non-public replacement/test-helper substrate and internal transform-registry
  boundary before cutting the public `Editor` value.

## Execution Log

### 2026-04-29 Ralph Activation

- Set `.tmp/<session-id>/completion-check.md` back to `pending`.
- Regenerated `.tmp/continue.md` for execution instead of review.
- Started Phase 1 contract-first tests in
  `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`.
- Added red public contracts for:
  - no public value export named `Editor`
  - no public transform-registry exports
  - no public `editor.replace` / `editor.reset`
  - no `export interface EditorInterface` or `export const Editor` in public
    source
- Ran `bun test ./packages/slate/test/public-surface-contract.ts` from
  `.tmp/slate-v2`.
- Result: red, as intended. New public-surface assertions fail on current
  source. The same focused file also has existing docs-surface failures for
  stale React/void wording, so the next owner is implementation plus later docs
  cleanup, not completion.

### 2026-04-29 Implementation Closure

- Added `tx.value.replace(input)` and state/tx contract coverage.
- Cut the public root `Editor` value export, public `EditorInterface` name,
  public transform-registry exports, and instance `editor.replace` /
  `editor.reset`.
- Moved internal package/static needs behind `slate/internal` and the
  `slate-react` runtime facade.
- Migrated docs and site examples away from public `Editor.*` state/write
  teaching and stale `onValueChange` / `onSelectionChange` docs.
- Verification:
  - `bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/public-surface-contract.ts`
    passed with `163 pass`.
  - `bun check` passed; `bun test` reported `1007 pass`, `95 skip`, `0 fail`;
    `slate-react` vitest reported `19 passed`, `113 tests passed`.
- Status: implementation complete.

### 2026-04-29 Legacy Test Bridge Hard Cut

- Removed the `config/bun-test-setup.ts` compatibility bridge that rewrote
  legacy fixture imports from `slate` to `slate/internal`.
- Deleted dynamic fixture tests that loaded the legacy checkout at
  `/Users/zbeyens/git/slate`.
- Converted local fixtures to explicit JSX runtime imports and explicit
  `slate/internal` imports where they exercise internal `Editor` helpers.
- Updated escape-hatch inventory counts after removing the legacy fixture
  bucket.
- Verification:
  - `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/index.spec.ts ./packages/slate-hyperscript/test/index.spec.ts ./packages/slate-history/test/index.spec.ts ./packages/slate/test/escape-hatch-inventory-contract.ts`
    passed with `1167 pass`, `95 skip`, `0 fail`.
  - `bun check` passed; `bun test` reported `1007 pass`, `95 skip`, `0 fail`;
    `slate-react` vitest reported `19 passed`, `113 tests passed`.

## 4.2 Pass 3 Research and Live-Source Refresh

Status: complete for Pass 3 only. Completion remains `pending`.

What changed:

- refreshed the research decision for `state` / `tx` naming with the public
  `Editor` value hard-cut consequence
- refreshed the read/update runtime decision so whole-document replacement is
  explicitly transaction-owned
- confirmed no new full external corpus pass is needed for this narrow public
  namespace decision; the existing Lexical, ProseMirror, and Tiptap read/update
  corpus is sufficient
- confirmed the live source mismatch is larger than docs wording:
  `tx.value.replace` is a target API and is not implemented yet

Live-source findings:

- `BaseEditor` still exposes overrideable query helpers, `replace`, `reset`,
  `subscribe`, `extend`, and lifecycle methods in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:229`.
- `EditorInterface` starts at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:798`
  and still includes editor-state reads, primitive writes, extension
  registration, replacement, reset, subscribe, and update.
- `export const Editor: EditorInterface` still exists at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1345`.
- `packages/slate/src/core/index.ts` publicly exports
  `./transform-registry`, and that file exports
  `getEditorTransformRegistry` / `setEditorTransformRegistry`.
- `getUpdateView` currently gives `tx.value.get()` but not
  `tx.value.replace(...)` in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:756`
  and `:780`.
- `replaceSnapshot` already has the right internal replacement substrate:
  transaction authority `replace`, runtime-id reseeding, selection reset, and
  marks reset in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1717`.
- docs and examples still teach public `Editor.*` in user paths, including
  saving, collaboration subscription, markdown shortcuts, hovering toolbar,
  forced layout, review comments, and generated example state setup.

Research findings:

- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`
  remains the naming authority: public reads are `state`, public writes are
  `tx`, and extension namespaces attach to `state.<plugin>` and `tx.<plugin>`.
- That page now records the `Editor` value hard-cut target and says
  `tx.value.replace` is required implementation work, not current capability.
- `docs/research/decisions/slate-v2-read-update-runtime-architecture.md` now
  includes transaction-owned value replacement in the public API target.
- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
  still covers the needed external systems: Lexical for read/update lifecycle,
  ProseMirror for transaction-owned state/selection/metadata, and Tiptap for
  extension/product-DX pressure.

Updated score: `0.899`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                                              |
| -------------------------------------------------------- | -----: | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.90 | No React runtime changes enter this pass. The source refresh still supports narrow lifecycle access instead of static editor reads in render paths.                                                                   |
| Slate-close unopinionated DX                             |   0.20 |  0.90 | Research now says type-only `Editor`, `state` / `tx`, pure data namespaces, and `tx.value.replace`; live docs/examples still need migration away from `Editor.*`.                                                     |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.90 | Existing migration-backbone tests prove extension namespaces and operation replay, but still use `Editor` for fixture reads/seeding. The plan now calls that out as migration debt rather than acceptable public API. |
| Regression-proof testing strategy                        |   0.20 |  0.89 | The live grep shows broad `Editor.*` use in tests/docs/examples, so guard coverage must include export tests, docs/example grep guards, and seed helper migration.                                                    |
| Research evidence completeness                           |   0.15 |  0.91 | The compiled state/tx and read/update decisions were refreshed, and the existing full corpus ledger remains sufficient for this specific namespace cut.                                                               |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.89 | Pass 3 narrows author-facing choices further but does not touch render components or hooks.                                                                                                                           |

Weighted total: `0.899`.

Plan delta from Pass 3:

- updated research to include `tx.value.replace(input)` as target API
- recorded that live `tx.value.replace` is not yet implemented
- added docs/examples `Editor.*` migration as an explicit closure blocker
- strengthened transform-registry public export proof requirements
- kept the external research corpus unchanged because the narrow question is a
  Slate public namespace decision backed by existing read/update evidence

## 4.3 Pass 4 Performance/DX/Migration/Regression/Simplicity Pressure

Status: complete for Pass 4 only. Completion remains `pending`.

Hard pressure verdict:

- Cutting the public `Editor` value is a DX and architecture win, not a direct
  runtime speed win. Do not sell it as perf magic.
- The runtime performance win comes only if implementation keeps hot writes on
  the existing tx/registry path and avoids adding broad React subscriptions,
  wrapper commits, or extra deep clones around every operation.
- The DX win is real only if first-party docs/examples stop teaching
  `Editor.*` and instance replacement helpers. A hidden public escape hatch
  would make the cleanup mostly branding.
- The migration burden is big enough to plan explicitly: live docs/examples had
  176 queried `Editor.*` / value-import hits, and the queried test paths had
  930 hits for `Editor.replace`, `Editor.getSnapshot`, `Editor.string`,
  runtime-id reads, and transform-registry access.
- Tests should not keep the public API alive. Add non-public test helpers and
  migrate tests through them before cutting the export.

Performance pressure:

- `tx.value.replace(input)` should delegate to the existing `replaceSnapshot`
  substrate or a shared internal replacement helper. It must not route through a
  public `Editor.replace` shim.
- `tx.value.replace(input)` should preserve the current replacement behavior:
  clone input children, reseed runtime ids from the previous index, set
  selection and marks, and publish a replacement commit.
- `getStateView` / `getUpdateView` currently allocate and freeze grouped API
  objects per read/update. This is acceptable for the namespace plan only if the
  implementation does not add per-node/per-operation wrapper allocation on top.
  If a later benchmark shows this view construction is hot, cache stable group
  wrappers by editor/version in the runtime, not in React components.
- React 19.2 does not change the answer. The plan should keep React as a
  projection layer and avoid `Editor.*` reads inside render paths, but the
  public namespace cut does not require React code edits.

DX pressure:

- Final public docs should have one editor lifecycle:
  `editor.read((state) => ...)` and `editor.update((tx) => ...)`.
- Keep `editor.subscribe(...)` as an advanced runtime/collab bridge, but use
  the instance method directly. Do not keep `Editor.subscribe(editor, ...)`.
- Keep `editor.extend(...)` and `defineEditorExtension(...)` for extension
  registration. Do not move extension registration into a static `Editor`
  namespace.
- Keep pure data namespaces. Cutting `Node`, `Path`, `Point`, `Range`,
  `Element`, or `Text` would be fake consistency and worse DX.
- Instance query methods remain a score cap until the execution plan either
  removes them from the public type where state/tx equivalents exist or records
  a narrow advanced bridge policy with docs guards. Leaving them as normal docs
  API is not acceptable.

Migration pressure:

- First migrate tests through helpers:
  `createTestEditor(input)`, `seedEditor(editor, input)`, and
  `snapshotOf(editor)` or equivalent non-public test utilities.
- Then add `tx.value.replace(input)` contract tests.
- Then migrate docs/examples from:
  `Editor.replace`, `editor.replace`, `Editor.getSnapshot`, `Editor.string`,
  `Editor.subscribe`, `Editor.bookmark`, and predicate reads to `state` / `tx`,
  pure data helpers, or direct advanced instance bridge calls.
- Then cut the public root exports and public static value.
- Do not add `EditorRuntime`, `EditorStatic`, `EditorQuery`, or
  compatibility aliases. That is the same public shape in a fake mustache.

Regression pressure:

- Add a public export contract that proves the root package has no value export
  named `Editor`, while `import type { Editor }` remains valid.
- Add a public transaction replacement contract:
  `editor.update((tx) => tx.value.replace(input))` updates children, selection,
  marks, runtime ids, commit reason/classes/tags, and subscriber output.
- Add a write-boundary contract that proves `editor.replace` and `editor.reset`
  are not public app-author methods.
- Add a transform-registry export guard proving
  `getEditorTransformRegistry` / `setEditorTransformRegistry` are unavailable
  from public package entrypoints.
- Add docs/examples grep guards with allowlists only for type-only imports,
  pure data namespaces, and internal test utilities.
- Browser proof is not required for the export cut itself. If example files are
  migrated, run focused example smoke plus relevant `slate-browser` generated
  rows; keep `bun test:integration-local` as closure/release proof, not the
  first iteration gate.

Simplicity pressure:

- The simplest architecture is one public lifecycle and one internal kernel
  table. Anything that creates a second public editor-state namespace should be
  cut.
- Do not introduce chain/command sugar in raw Slate while doing this cleanup.
  Plate can build product commands above the substrate.
- Do not preserve public replacement helpers for fixture convenience. Fixture
  convenience belongs in test utilities.
- Do not invent adapter promises for current Plate or slate-yjs. The plan
  promises migration backbone only: extension namespaces, deterministic
  operations, snapshot/commit metadata, and transaction replay.

Updated score: `0.910`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                   |
| -------------------------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |   0.20 |  0.91 | React 19.2 research says external-store subscriptions and background UI help projection, but core invalidation remains Slate-owned. Pass 4 keeps the namespace cut out of React hot paths. |
| Slate-close unopinionated DX                             |   0.20 |  0.91 | The plan keeps Slate data helpers and read/update lifecycle while rejecting static editor-state helpers, product command sugar, and compatibility namespaces.                              |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.91 | The plan keeps extension namespaces, commit metadata, deterministic operations, and `tx.operations.replay(...)`, and explicitly rejects current-version adapter promises.                  |
| Regression-proof testing strategy                        |   0.20 |  0.91 | Pass 4 names export, tx replacement, write boundary, transform-registry, docs/example grep, and focused browser proof gates.                                                               |
| Research evidence completeness                           |   0.15 |  0.91 | Pass 4 relies on refreshed state/tx and React 19.2 research plus live source/test/docs grep evidence; no new corpus gap was found.                                                         |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.90 | Public author choices are reduced to lifecycle, pure data helpers, extension registration, and advanced runtime subscription. Render/component DX remains out of scope.                    |

Plan delta from Pass 4:

- added performance constraints for `tx.value.replace` and state/tx view
  allocation
- clarified `editor.subscribe` as an advanced instance bridge, not a static
  namespace survivor
- added migration order based on docs/example/test hit counts
- expanded regression proof into export, replacement, write-boundary,
  transform-registry, grep, and focused browser rows
- rejected compatibility namespaces and command/chain sugar for this cleanup

## 4.4 Pass 5 Slate Maintainer and Steelman Ledger

Status: complete for Pass 5 only. Completion remains `pending`.

Ledger verdict:

- Keep the public `Editor` value cut.
- Keep the public `EditorInterface` cut.
- Keep the public transform-registry export cut.
- Keep pure data namespaces.
- Keep the `tx.value.replace(input)` replacement target.
- Revise the instance-query story: do not let it stay vague. Closure requires
  either removal from public docs/types where state/tx equivalents exist, or a
  deliberately tiny advanced bridge policy with grep guards.
- Keep `editor.subscribe(...)` as an advanced instance bridge for adapters.
  Static `Editor.subscribe(editor, ...)` dies.
- Keep test-helper-first migration. Fixture churn is real, but preserving a bad
  public API for fixtures is worse.

Accepted steelman rows:

1. Cut public `Editor` value.

   - Strongest objection: `Editor.*` is the most Slate-looking API in the repo.
     Cutting it makes migration feel less like Slate and more like a new editor.
   - Antithesis: Familiarity is valuable; legacy examples, tests, and mental
     models already know `Editor.string(editor, range)`.
   - Tradeoff: docs churn, fixture churn, and less copy/paste compatibility
     with legacy Slate.
   - Rejected alternative: keep `Editor` as read-only. That still leaves two
     read paths and keeps static editor-state access alive.
   - Why chosen wins: v2 already chose transaction freshness. Keeping static
     reads makes `state` / `tx` optional theater.
   - Migration answer: `Editor.string(editor, at)` becomes
     `editor.read((state) => state.text.string(at))`; writes become
     `editor.update((tx) => ...)`; pure data namespaces remain.
   - Proof: root export contract, docs/examples grep guard, and state/tx
     behavior tests.
   - Verdict: keep.

2. Cut public `EditorInterface`.

   - Strongest objection: plugin authors need a stable augmentable interface.
   - Antithesis: Type augmentation is a real Slate strength.
   - Tradeoff: extensions must learn `EditorStateView` and
     `EditorUpdateTransaction` augmentation instead of dumping methods on the
     editor/static namespace.
   - Rejected alternative: keep the interface but hide the value. That leaves a
     misleading public contract shaped around a dead static object.
   - Why chosen wins: the extension backbone is stronger when plugins extend
     `state.<plugin>` and `tx.<plugin>`, not a global editor bag.
   - Migration answer: publish type-only `Editor` plus state/tx extension group
     augmentation types.
   - Proof: extension namespace type tests and migration-backbone contract with
     no `Editor` value import.
   - Verdict: keep.

3. Hide transform registry.

   - Strongest objection: core helpers and tests need transform access, and a
     registry is the obvious way to share it.
   - Antithesis: the registry is a practical internal service locator.
   - Tradeoff: internal imports and test helpers need cleanup.
   - Rejected alternative: document it as advanced public API. That exposes the
     write kernel and invites bypassing `tx`.
   - Why chosen wins: raw app/plugin code should write through `tx`; core can
     still import an internal registry.
   - Migration answer: move test fixtures to non-public helpers and internal
     source to internal imports.
   - Proof: package export audit and a failing public import test for
     `getEditorTransformRegistry` / `setEditorTransformRegistry`.
   - Verdict: keep.

4. Keep pure data namespaces.

   - Strongest objection: killing `Editor` but keeping `Node` / `Range` /
     `Path` is inconsistent.
   - Antithesis: one style of helper namespace is easier to explain.
   - Tradeoff: users need to understand the difference between pure data helpers
     and editor lifecycle helpers.
   - Rejected alternative: move every helper under `state` / `tx`. That makes
     pure data utilities harder to use and couples them to editor runtime.
   - Why chosen wins: pure helpers do not observe editor runtime state and do
     not create stale read/write ambiguity.
   - Migration answer: docs explicitly split data helpers from editor
     lifecycle.
   - Proof: import/type tests keep pure namespaces while export tests remove
     only the editor-state value namespace.
   - Verdict: keep.

5. Cut public replacement helpers.

   - Strongest objection: replacing a document should be one obvious method;
     `editor.update((tx) => tx.value.replace(input))` is longer.
   - Antithesis: `editor.replace(input)` is great fixture and load-state DX.
   - Tradeoff: replacement becomes more ceremony-heavy in simple setup code.
   - Rejected alternative: keep `editor.replace` as advanced. That preserves a
     write outside the write vocabulary.
   - Why chosen wins: replacement affects runtime ids, selection, marks, commit
     metadata, and subscribers; it is transaction work.
   - Migration answer: app code uses `tx.value.replace`; tests use non-public
     seed helpers.
   - Proof: tx replacement contract for children, selection, marks, runtime ids,
     commit reason/classes/tags, and subscriber output.
   - Verdict: keep.

6. Instance query methods.

   - Strongest objection: `editor.string([])` is shorter and more Slate-like
     than `editor.read((state) => state.text.string([]))`.
   - Antithesis: compact reads matter; forcing callbacks for every read can
     feel heavy.
   - Tradeoff: stricter lifecycle DX is more verbose for trivial reads.
   - Rejected alternative: keep instance queries as normal public docs API.
     That keeps multiple read paths and stale-read ambiguity.
   - Why chosen wins: the entire v2 story is committed snapshot vs tx-local
     draft. Reads need to say which world they observe.
   - Migration answer: docs/examples use `state` / `tx`; any remaining direct
     instance queries must be explicitly advanced/internal until a focused
     query-surface pass removes or groups them.
   - Proof: docs/examples grep guard plus state/tx group coverage for text,
     nodes, points, ranges, selection, marks, schema, and value.
   - Verdict: revise, with closure blocker recorded.

7. Keep `editor.subscribe(...)` as an advanced bridge.

   - Strongest objection: if static `Editor.subscribe` dies, why keep instance
     subscription at all?
   - Antithesis: a pure `onChange` React prop is nicer for app authors.
   - Tradeoff: one advanced instance bridge remains on the editor object.
   - Rejected alternative: force every adapter through React props. That breaks
     headless collaboration and persistence adapters.
   - Why chosen wins: subscription is runtime observation, not a read helper or
     write helper. It belongs on the editor instance as an adapter bridge.
   - Migration answer: docs say app UI uses React callbacks/hooks; adapters may
     use `editor.subscribe`.
   - Proof: collaboration/persistence contract using `editor.subscribe` without
     `Editor` value import.
   - Verdict: keep.

8. No compatibility namespace.
   - Strongest objection: a temporary `EditorStatic` or `EditorCompat` would
     make migration safer.
   - Antithesis: staged migration often reduces blast radius.
   - Tradeoff: hard cut causes more short-term failures.
   - Rejected alternative: ship a deprecated alias before publish. That turns
     unpublished debt into published debt.
   - Why chosen wins: the package is not published in this shape; compatibility
     aliases would only preserve confusion.
   - Migration answer: internal test helpers and docs/examples migrations, not
     public shims.
   - Proof: export guard bans replacement namespaces, not just `Editor`.
   - Verdict: keep.

Updated score: `0.920`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                                  |
| -------------------------------------------------------- | -----: | ----: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.91 | Ledger keeps React out of the editor engine and treats namespace cleanup as architecture/DX, not a render-speed claim.                    |
| Slate-close unopinionated DX                             |   0.20 |  0.93 | Ledger keeps Slate model/data helpers while cutting only editor-state static value and wrong write paths.                                 |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.93 | Ledger preserves extension namespaces, `editor.subscribe` for adapters, deterministic operations, and no current-version adapter promise. |
| Regression-proof testing strategy                        |   0.20 |  0.92 | Ledger ties each hard cut to export/type/behavior/grep contracts and fixture-helper migration.                                            |
| Research evidence completeness                           |   0.15 |  0.91 | No new research gap; ledger is grounded in refreshed state/tx decisions and live source/test/docs evidence.                               |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.92 | Ledger rejects compatibility namespaces and command/chain sugar, keeping the public surface small.                                        |

Plan delta from Pass 5:

- accepted the public `Editor` value, `EditorInterface`, transform registry,
  replacement-helper, pure-data-namespace, subscribe-bridge, and no-compat
  decisions
- revised the instance-query row into a closure blocker instead of a vague
  temporary compromise
- strengthened migration answers for raw Slate users, plugin authors, test
  authors, Plate-like product layers, and collab adapters
- tied every accepted hard cut to proof rows that must exist before execution
  can be called complete

## 4.5 Pass 6 High-Risk Deliberate Mode

Status: complete for Pass 6 only. Completion remains `pending`.

High-risk trigger:

- public API and package export hard cut
- type-level public surface change
- test fixture migration across many current `Editor.*` callsites
- docs/examples migration
- extension/plugin substrate
- collaboration/persistence subscription and operation replay
- release gates and grep/export guards

Blast radius:

- packages:
  - `/Users/zbeyens/git/slate-v2/packages/slate/src`
  - `/Users/zbeyens/git/slate-v2/packages/slate/test`
  - `/Users/zbeyens/git/slate-v2/packages/slate-dom/test`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test`
  - `/Users/zbeyens/git/slate-v2/site/examples/ts`
  - `/Users/zbeyens/git/slate-v2/docs`
- public consumers:
  - raw Slate app authors
  - plugin authors
  - Plate-style product layers
  - collaboration/persistence adapters
  - test authors using fixture files
- affected behavior:
  - import/export shape
  - full-value replacement
  - committed reads vs tx-local reads
  - operation replay
  - commit/subscription observation
  - schema/spec reads
  - docs/example initialization and external-value loading

Pre-mortem:

1. Export/type churn becomes chaotic.

   - Failure: removing `Editor` value breaks hundreds of tests, and the fix is
     a rushed `EditorCompat` namespace.
   - Prevention: add non-public test helpers first, then cut public exports,
     then guard against compatibility namespace exports.

2. `tx.value.replace` corrupts runtime identity or commit metadata.

   - Failure: replacement changes children but loses runtime-id reseeding,
     selection/marks reset, listener notification, or replacement commit
     classification.
   - Prevention: implement replacement through the same internal substrate as
     `replaceSnapshot` and prove children, selection, marks, runtime ids,
     reason/classes/tags, and subscriber output.

3. Collaboration/adapters lose a clean observation path.
   - Failure: killing static `Editor.subscribe` gets conflated with killing
     subscription entirely, so persistence/collab examples move into React-only
     props.
   - Prevention: keep `editor.subscribe` as the advanced headless adapter
     bridge and prove operation replay plus subscriber metadata without any
     public `Editor` value import.

Expanded proof plan:

- unit/type:
  - no root value export named `Editor`
  - `import type { Editor }` works
  - no public `EditorInterface`
  - no public transform-registry exports
  - no public `editor.replace` / `editor.reset`
  - no compatibility namespace exports such as `EditorRuntime`,
    `EditorStatic`, `EditorQuery`, or `EditorCompat`
- behavior:
  - `editor.read((state) => ...)` covers value, selection, marks, text, nodes,
    points, ranges, and schema
  - `editor.update((tx) => ...)` covers tx-local reads and writes
  - `tx.value.replace(input)` preserves replacement semantics and commit
    metadata
  - `editor.subscribe` observes commits without static `Editor`
  - `tx.operations.replay(...)` remains deterministic for collab import
- migration:
  - non-public seed/snapshot helpers replace fixture `Editor.replace` /
    `Editor.getSnapshot`
  - docs/examples use `state` / `tx`, pure data helpers, or explicit advanced
    instance bridges
  - instance query closure is resolved by removal/grouping or a fenced advanced
    bridge policy
- docs/examples:
  - grep guard blocks user-facing `Editor.*` editor-state reads/writes
  - saving/loading docs show `tx.value.replace`
  - collaboration docs show `editor.subscribe`
  - transform docs show `editor.update((tx) => ...)`
- browser:
  - no browser run is required for root export-only changes
  - if example files change, run focused example smoke and affected
    `slate-browser` contract rows
  - keep `bun test:integration-local` as closure/release gate only
- performance:
  - no per-operation wrapper allocation around transforms
  - no broad React subscription introduced
  - no extra deep clone beyond replacement input cloning and operation replay
    cloning already required for isolation

Rollback/hard-cut answer:

- Do not rollback to a public `Editor` value.
- If implementation is too large, split execution into:
  1. test-helper and `tx.value.replace` substrate
  2. public export/type cut
  3. source/test migration
  4. docs/examples migration
  5. guards and closure
- Do not ship compatibility aliases before publish. The remediation for churn is
  smaller implementation slices, not a second public API.

High-risk verdict:

- keep the plan
- split implementation into the phases above
- do not mark execution done until export/type, behavior, migration,
  docs/example, and guard proof all exist
- keep completion pending because the instance-query closure blocker still
  needs a revision pass

Updated score: `0.928`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                          |
| -------------------------------------------------------- | -----: | ----: | --------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.92 | Proof plan explicitly forbids broad React subscriptions and new hot-path wrapper allocation.                                      |
| Slate-close unopinionated DX                             |   0.20 |  0.93 | High-risk pass preserves type-only `Editor`, pure data helpers, `state` / `tx`, `editor.subscribe`, and no product command sugar. |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.94 | Proof plan requires extension namespace, deterministic operation replay, commit metadata, and headless subscription proof.        |
| Regression-proof testing strategy                        |   0.20 |  0.94 | Proof plan now names unit/type, behavior, migration, docs/example, browser, and performance gates.                                |
| Research evidence completeness                           |   0.15 |  0.91 | No new research gap; deliberate pass uses refreshed research and live-source evidence.                                            |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.92 | Plan stays minimal and refuses compatibility/product-command surfaces.                                                            |

Plan delta from Pass 6:

- expanded blast radius and consumer impact
- added three concrete failure scenarios with prevention strategy
- added unit/type, behavior, migration, docs/example, browser, and performance
  proof requirements
- added rollback/split plan that preserves hard-cut target without aliases
- kept instance-query closure as the only known revision blocker

## 4.6 Pass 7 Revision Pass

Status: complete for Pass 7 only. Completion remains `pending` until the
closure pass runs.

Revision decisions:

1. Instance query methods are no longer a vague bridge.

   - Final app-author docs target: state/tx only.
   - Final public type target for this hard-cut execution: remove public
     state-equivalent query methods from `BaseEditor` where state/tx groups
     cover the same read.
   - Allowed instance bridge methods: lifecycle and adapter/substrate methods
     such as `read`, `update`, `subscribe`, `extend`, and schema definition.
   - Any remaining direct instance read must be explicitly classified as
     internal/advanced with a named reason and a guard that prevents first-party
     docs/examples from teaching it as normal app code.

2. Ref lifecycle helpers are deferred out of this plan.

   - `pathRef`, `pointRef`, `rangeRef`, and ref-set ownership need their own
     focused design because they are live handles, not simple committed reads.
   - This plan must not invent `editor.refs` or another namespace while solving
     the public `Editor` value cut.
   - The namespace hard cut can execute without resolving refs as long as docs
     do not present ref helpers as a replacement for state/tx reads.

3. Initial value ergonomics are deferred out of this plan.

   - `createEditor({ initialValue })` is not required to cut the public
     `Editor` value.
   - Public full-value replacement remains `tx.value.replace(input)`.
   - Test setup uses non-public seed helpers.

4. `editor.subscribe` policy is final for this plan.

   - It is an advanced headless adapter bridge.
   - It is not a normal render subscription API.
   - React users should use React adapter callbacks/hooks; collab/persistence
     adapters may use `editor.subscribe`.

5. Completion gates now match the accepted proof plan.
   - The closure pass must not require current-version Plate/slate-yjs adapters.
   - The closure pass must require substrate proof: extension namespaces,
     deterministic operation replay, commit metadata, and headless subscription.

Updated score: `0.936`.

| Dimension                                                | Weight | Score | Evidence                                                                                                                       |
| -------------------------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |   0.20 |  0.93 | Revision keeps React subscriptions out of scope and forbids render-path `Editor.*` reads.                                      |
| Slate-close unopinionated DX                             |   0.20 |  0.95 | Instance-query policy is now explicit: state/tx is normal DX, pure data helpers stay, refs/initialValue are deferred.          |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.94 | Revision preserves substrate-only migration proof and rejects adapter promises.                                                |
| Regression-proof testing strategy                        |   0.20 |  0.95 | Closure gates now require export/type, replacement, write-boundary, registry, grep, extension, replay, and subscription proof. |
| Research evidence completeness                           |   0.15 |  0.92 | No contradiction remains in the research layer for this namespace decision.                                                    |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.93 | Revision avoids extra namespaces and keeps raw Slate minimal.                                                                  |

Plan delta from Pass 7:

- resolved the instance-query closure blocker
- deferred ref lifecycle and initial-value ergonomics out of scope with explicit
  reasons
- finalized `editor.subscribe` as an advanced adapter bridge
- aligned closure gates with substrate migration proof instead of current
  Plate/slate-yjs adapter support

## 4.7 Pass 8 Closure Score and Final Gates

Status: complete. This Ralplan is ready for user review.

Closure verdict:

- The public `Editor` value should be hard cut.
- `Editor` remains type-only.
- Public app reads/writes go through `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`.
- Whole-document replacement is `tx.value.replace(input)`.
- Pure data namespaces stay.
- Public transform-registry exports die.
- Public `EditorInterface` dies.
- Public replacement helpers die.
- Docs/examples stop teaching `Editor.*` editor-state reads/writes.
- Tests migrate through non-public seed/snapshot helpers.
- Plate/slate-yjs support means migration backbone only, not current adapter
  compatibility.

Closure gate check:

| Gate                                                | Result        |
| --------------------------------------------------- | ------------- |
| score at least `0.92`                               | pass: `0.936` |
| no dimension below `0.85`                           | pass          |
| pass-state ledger complete                          | pass          |
| high-risk deliberate pass complete                  | pass          |
| objection ledger rows accepted or revised into plan | pass          |
| no public API maybe language                        | pass          |
| Plate/slate-yjs migration-backbone answers          | pass          |
| public export/test/doc acceptance criteria named    | pass          |
| deferred scope explicit                             | pass          |
| completion files synchronized                       | pass          |

Final score: `0.936`.

| Dimension                                                | Weight | Final Score | Reason                                                                                                                          |
| -------------------------------------------------------- | -----: | ----------: | ------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |        0.93 | Plan avoids React hot-path churn and treats this cut as lifecycle/API cleanup, not runtime magic.                               |
| Slate-close unopinionated DX                             |   0.20 |        0.95 | One lifecycle, type-only `Editor`, pure data helpers, no product commands, no compatibility namespace.                          |
| Plate and slate-yjs migration-backbone shape             |   0.15 |        0.94 | Extension namespaces, deterministic operations, commit metadata, replay, and subscription bridge are preserved.                 |
| Regression-proof testing strategy                        |   0.20 |        0.95 | Export/type, replacement, write-boundary, registry, grep, extension, replay, subscription, and focused browser gates are named. |
| Research evidence completeness                           |   0.15 |        0.92 | Research layer is refreshed and no contradiction remains for this namespace decision.                                           |
| shadcn-style composability and hook/component minimalism |   0.10 |        0.93 | Public surface stays minimal and composable without UI/product leakage.                                                         |

Plan delta from Pass 8:

- closed the pass ledger
- confirmed final score and dimensions
- fixed stale open-issue rows
- converted completion state target from `pending` to ready-for-review

## 5. Source-Backed Architecture North Star

Keep:

- Slate model as document truth
- operations as collaboration and replay truth
- paths/ranges/points as public data model
- `editor.read` / `editor.update` as lifecycle
- `state` / `tx` as grouped editor-state access
- `EditorCommit` as local runtime fact
- React as projection/subscription layer

Cut:

- static editor-state API
- public transform registry API
- public mutation helpers outside `tx`
- compatibility aliases before publish

External evidence:

- Lexical supports read/update lifecycle and dirty reconciliation.
- ProseMirror supports transaction ownership of document, selection, marks,
  and metadata.
- Tiptap supports extension packaging and selector-conscious React DX, but its
  command-heavy product API should stay above raw Slate.

## 6. Public API Target

```ts
const editor = createEditor();

editor.read((state) => {
  const text = state.text.string([]);
  const selection = state.selection.get();
  const isVoid = state.schema.isVoid(element);
});

editor.update((tx) => {
  tx.value.replace({
    children,
    selection: null,
    marks: null,
  });
  tx.text.insert("x");
  tx.nodes.set({ type: "heading" }, { at: target });
  tx.operations.replay(operations, { tag: "remote" });
});
```

Top-level exports:

- `createEditor`
- `isEditor`
- `defineEditorExtension`
- pure data namespaces and pure helpers
- type-only `Editor`, `EditorStateView`, `EditorUpdateTransaction`, and related
  public types

Non-public or internal exports:

- `Editor` value
- `EditorInterface`
- `getEditorTransformRegistry`
- `setEditorTransformRegistry`
- transform registry mutation helpers
- `editor.replace` / `editor.reset` as public app-author methods
- snapshot seed helpers used only by tests/fixtures

## 7. Internal Runtime Target

Internal runtime may keep:

- a frozen transform/write registry built by `createEditor`
- a WeakMap keyed by editor instance
- internal query helper tables for source reuse
- test-only seed helpers
- an internal `replaceSnapshot` implementation used by `tx.value.replace` and
  test seeding helpers

Internal runtime must not leak:

- `getEditorTransformRegistry` through `packages/slate/src/core/index.ts`
- `Editor` value through `packages/slate/src/interfaces` or root index barrels
- direct bridge helpers through first-party docs/examples

Preferred implementation shape:

```txt
src/internal/editor-kernel.ts
src/internal/transform-registry.ts
src/test-utils/seed-editor.ts
```

The exact paths can change, but the public/private boundary cannot.

## 8. Hook, Component, and Render DX Target

This lane does not change React render contracts directly.

Carry-forward law:

- rendered document nodes use target-scoped hooks
- shell UI uses explicit editor selectors
- void/atom shell ownership stays runtime-owned in the separate render-DX lane
- public React code should not need the static `Editor` value to read state

Any docs or examples touched by this lane must use:

```ts
const selected = useEditorState((state) => state.selection.get());
```

or a target-scoped hook, not a static `Editor.*` read.

## 9. Plate Migration-Backbone Target

Plate does not need current-version adapter support from this plan.

Plate needs:

- `state.<plugin>` and `tx.<plugin>` extension groups
- stable document value and operation stream
- commit metadata for history, selection, and product UI
- schema/spec policy for node behavior
- plugin-owned product commands above raw Slate

The `Editor` static value cut helps Plate by removing another place plugins
could dump methods. Product commands should live in Plate extension layers, not
raw `Editor.*`.

## 10. slate-yjs Migration-Backbone Target

slate-yjs does not need a current adapter fixture from this plan.

It needs:

- deterministic operations
- deterministic snapshot/commit metadata
- explicit remote replay through `tx.operations.replay(...)`
- local-only runtime ids and DOM selection policy
- no public mutable editor fields

The public `Editor` value cut is acceptable if collaboration code can replay
through transaction APIs and use public type/data helpers without importing a
static editor-state namespace.

## 11. Legacy Regression Proof Matrix

| Surface                 | Contract                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public export surface   | Type test proves `import { Editor } from 'slate'` is not a value export while `import type { Editor }` works.                                                                                              |
| Public static namespace | Runtime/module test proves no public `Editor.*` static object exists from root package exports.                                                                                                            |
| Transform registry      | Export audit proves `getEditorTransformRegistry` and `setEditorTransformRegistry` are not public root exports.                                                                                             |
| Normal reads            | Public behavior tests use `editor.read((state) => state.*)` for selection, text, nodes, schema.                                                                                                            |
| Normal writes           | Public behavior tests use `editor.update((tx) => tx.*)` for text, nodes, marks, selection, operations.                                                                                                     |
| Document replacement    | Public behavior test uses `editor.update((tx) => tx.value.replace(input))`; export/type tests prove `Editor.replace`, `Editor.reset`, `editor.replace`, and `editor.reset` are not normal public app APIs. |
| Tests/fixtures          | Test helpers seed and inspect editors without public `Editor.replace` / `Editor.getSnapshot` dependence where possible.                                                                                    |
| Docs/examples           | Grep guard blocks first-party user-facing docs/examples from teaching `Editor.*` editor-state reads or writes.                                                                                             |

## 12. Browser Stress and Parity Strategy

No browser behavior should change from cutting a static namespace.

Browser proof is required only if implementation touches:

- examples that ship in the site
- React render code
- DOM selection import/export
- void/atom shell behavior
- event runtime

If examples are migrated, run focused example smoke plus the existing generated
stress family for any affected example. Full `bun test:integration-local`
remains a closure/release gate, not the first iteration gate.

## 13. Applicable Implementation-Skill Review Matrix

| Lens                        | Applicability | Result                                                                                                                                                                               |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vercel React best practices | applied       | React 19.2 supports external stores and scheduling, but this API cut is mainly about keeping public access paths narrow. No new React work until implementation touches React files. |
| performance-oracle          | applied       | Static namespace removal reduces broad API surface but does not prove runtime speed. Implementation must avoid wrapper allocations on hot tx paths.                                  |
| tdd                         | applied       | First implementation slice should start with public export and public API contract tests before code changes.                                                                        |
| build-web-apps:shadcn       | skipped       | No UI/editor chrome is being designed in this lane.                                                                                                                                  |
| react-useeffect             | skipped       | No effects or browser subscriptions are changed by the plan itself.                                                                                                                  |

## 14. High-Risk Deliberate Mode

Trigger:

- public API and package export surface
- extension/plugin substrate
- collaboration replay access
- tests/docs/examples migration

Blast radius:

- `/Users/zbeyens/git/slate-v2/packages/slate/src`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src`
- `/Users/zbeyens/git/slate-v2/site/examples/ts`
- `/Users/zbeyens/git/slate-v2/docs`
- Slate fixture tests that currently import `Editor` value

Pre-mortem:

1. Type coupling explodes because `BaseEditor` and tx types reference
   `typeof Editor.*` everywhere.
2. Tests get "fixed" by importing a new public `EditorInternal`, recreating the
   same bad API under a worse name.
3. Collaboration or fixture seed code loses a clean snapshot setup path and
   falls back to direct internal state mutation.

Proof plan:

- unit: public export contract, state/tx public API, write boundary, extension
  namespace, migration backbone
- type: `import type { Editor }` works, value import fails in type tests or
  export inventory
- docs: user-facing docs/examples grep clean of `Editor.*` editor-state use
- browser: focused examples only if implementation touches site examples
- migration: operation replay and extension namespace tests stay green

Rollback/hard-cut answer:

- Do not add a compatibility shim. If execution becomes too large, split the
  implementation into export boundary, source migration, docs/examples, and
  test helper phases while keeping the target unchanged.

## 15. Hard Cuts and Rejected Alternatives

Hard cuts:

- `export const Editor`
- `export interface EditorInterface` as public API
- public root export of `core/transform-registry`
- public `editor.replace` / `editor.reset` as app-author APIs
- docs/examples showing static `Editor.*` as app author API
- docs/examples showing instance query methods as the preferred read path when
  state/tx groups exist
- any new compatibility namespace such as `EditorRuntime`, `EditorQuery`, or
  `EditorStatic`

Rejected alternatives:

- Keep `Editor` but remove write methods. Rejected because static reads still
  split the mental model.
- Rename `Editor` to `EditorApi`. Rejected because it preserves the shape with
  worse legacy recognition.
- Keep `getEditorTransformRegistry` public as an advanced escape hatch.
  Rejected because it exposes the write kernel directly.
- Move everything to top-level functions. Rejected because it recreates the
  static namespace with more imports.
- Keep `replace/reset` as direct editor methods. Rejected because replacement is
  a write and belongs to the update transaction.

## 16. Slate Maintainer Objection Ledger

| Change                         | Pain                           | Strong objection                                                                       | Steelman antithesis                                                    | Tradeoff tension                                                      | Why keep                                                                                                     | Evidence                                                                                                                                                                                | Rejected alternative                        | Migration answer                                                                              | Docs/example answer                                 | Regression proof                                 | Ecosystem answer                                                                         | Verdict |
| ------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------- |
| Cut public `Editor` value      | legacy Slate user, test author | "`Editor.*` is familiar Slate. Why delete the name people know?"                       | Familiarity lowers migration friction and preserves old docs examples. | More code churn and test helper work.                                 | The rewrite already chose `state` / `tx`; keeping `Editor.*` makes that choice optional theater.             | `Editor` value mixes reads/writes at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:798` and `:1345`.                                                             | Keep static reads only.                     | Use `editor.read` / `editor.update`; pure data namespaces stay.                               | Transform and editor docs teach the lifecycle once. | export contract plus docs/examples grep.         | Plate/Yjs use substrate APIs, not static editor helpers.                                 | keep    |
| Cut public `EditorInterface`   | plugin author                  | "I need a stable interface to augment."                                                | Interface augmentation can be convenient.                              | Extensions need new typed registration patterns.                      | Public `EditorInterface` currently exists to type the static value and leaks its mixed shape.                | `EditorInterface` includes writes, reads, extension registration, replace/reset at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:798`.                           | Keep interface but hide value.              | Use `Editor`, `EditorStateView`, `EditorUpdateTransaction`, and extension group augmentation. | Extension docs show `state` / `tx` groups.          | type tests for extension namespaces.             | Plate gets namespace augmentation without monkeypatching editor methods.                 | keep    |
| Hide transform registry        | core/runtime maintainer        | "Core needs easy access to transform methods."                                         | A public registry is a simple escape hatch.                            | Internal imports need cleanup.                                        | Public write-kernel access bypasses the whole transaction/public API story.                                  | Root `core` barrel exports `transform-registry` at `/Users/zbeyens/git/slate-v2/packages/slate/src/core/index.ts:10`.                                                                   | Document as internal advanced.              | Core imports from internal path; apps use `tx`.                                               | No public docs.                                     | export audit prevents root access.               | Collab replays through `tx.operations.replay`.                                           | keep    |
| Keep pure data namespaces      | raw Slate user                 | "If `Editor` dies, should `Node` and `Range` die too?"                                 | Consistency might suggest cutting every namespace.                     | Too much churn if pure helpers move.                                  | Pure data namespaces are not editor-state access paths and do not split read/write lifecycle.                | Root exports `editor` implementation and `interfaces`, but pure data helpers are separate concepts.                                                                                     | Move all helpers under editor state.        | Keep pure helpers; move editor-state helpers into `state`/`tx`.                               | Docs explain data helpers vs editor lifecycle.      | type/import tests.                               | Plate/Yjs keep path/range/node utilities.                                                | keep    |
| Cut public replacement helpers | app author, test author        | "Replacing the whole document should be easy."                                         | `editor.replace(input)` is short and test-friendly.                    | Public replacement through tx is more verbose; fixtures need helpers. | Replacement is a write and must share transaction tags, commit metadata, runtime ids, and listener behavior. | `replaceSnapshot` already runs with replace authority in `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1717`; tests use `Editor.replace` mostly as seed setup.   | Keep `editor.replace` as advanced.          | Use `tx.value.replace(input)` in app code and non-public seed helpers in tests.               | Saving/loading docs show `tx.value.replace`.        | state/tx replacement contract plus export guard. | Plate/Yjs can map remote/full reloads to transaction replacement without static helpers. | keep    |
| Reclassify instance queries    | app author                     | "`editor.string([])` is shorter than `editor.read((state) => state.text.string([]))`." | Legacy Slate query helpers are familiar and compact.                   | More callback ceremony for simple reads.                              | One read lifecycle is the only way to stop stale reads and teach tx-local freshness.                         | `BaseEditor` currently exposes query helpers at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:271`; state groups already expose text/nodes/points/ranges/schema. | Keep instance queries as normal public API. | Docs use state/tx; internal code can keep bridge helpers until migration.                     | Concepts explain state/tx reads once.               | docs/examples grep plus state group tests.       | Plate can build command sugar above state/tx without relying on instance query methods.  | keep    |

## 17. Pass Schedule and State Ledger

| Pass                                                       | Status   | Evidence added                                                                                                                                                             | Plan delta                                                                                  | Open issues                   | Next owner |
| ---------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- | ---------- |
| 1. Current-state read and initial score                    | complete | live `Editor` export, transform registry export, state/tx tests, research corrections                                                                                      | created this plan and corrected stale research wording                                      | closure score below threshold | Pass 2     |
| 2. Intent/boundary and decision brief pressure             | complete | live `BaseEditor` replace/reset/query surface; `replaceSnapshot` transaction authority; docs/examples `Editor.replace` usage                                               | decided `tx.value.replace`, test seed helper boundary, and non-normal instance query status | closure score below threshold | Pass 3     |
| 3. Research and live-source refresh                        | complete | refreshed state/tx and read/update research; live source still lacks `tx.value.replace`; docs/examples still teach `Editor.*`                                              | recorded target-vs-current gap and docs/example migration blocker                           | closure score below threshold | Pass 4     |
| 4. Performance/DX/migration/regression/simplicity pressure | complete | React 19.2 perf research; live docs/examples/test hit counts; `getStateView` / `getUpdateView` allocation shape; `slate-browser` gate scripts                              | tightened performance constraints, migration order, proof rows, and simplicity cuts         | closure score below threshold | Pass 5     |
| 5. Slate maintainer and steelman ledger                    | complete | expanded steelman rows for public `Editor`, `EditorInterface`, transform registry, data namespaces, replacement, instance queries, subscribe bridge, and no-compat aliases | accepted seven decisions and revised instance queries into a closure blocker                | none                          | Pass 6     |
| 6. High-risk deliberate pass                               | complete | public API/export/type blast radius; fixture/docs/example/collab failure scenarios; expanded proof plan                                                                    | added proof matrix and split-execution remediation answer                                   | none                          | Pass 7     |
| 7. Revision pass                                           | complete | instance-query blocker resolution; ref and initial-value deferrals; subscribe bridge policy; substrate-only migration proof                                                | removed maybe language and aligned closure gates                                            | none                          | Pass 8     |
| 8. Closure score and final gates                           | complete | final scorecard, gate check, synchronized completion files                                                                                                                 | marked Ralplan ready for user review                                                        | none                          | none       |

## 18. Plan Deltas From Review

Added:

- new active Ralplan for public `Editor` value hard cut
- explicit verdict to cut public `Editor` value and public `EditorInterface`
- explicit verdict to hide transform registry exports
- explicit verdict to cut public replacement helpers from normal app API
- public API target for type-only `Editor`, `isEditor`, `state` / `tx`, and
  pure data namespaces
- first-pass objection ledger
- high-risk pre-mortem and proof plan

Revised:

- research decision wording that still described primitive editor methods as
  the public power API inside `editor.update`
- research public-target examples that still used flat editor methods inside
  lifecycle callbacks
- replacement/setup boundary changed from open question to
  `tx.value.replace(input)` plus non-public test seed helpers
- remaining instance query boundary changed from open question to
  not-normal public docs/API path where state/tx groups exist
- research target clarified that `tx.value.replace(input)` is required
  implementation work, not a live capability yet
- docs/examples `Editor.*` usage reclassified as a closure blocker, not just
  cleanup
- performance/DX pressure clarified this cut is not direct runtime magic and
  must avoid new wrapper allocation on hot write paths
- migration pressure added test-helper-first ordering and docs/example/test hit
  count evidence
- regression pressure added specific export, tx replacement, write-boundary,
  transform-registry, grep, and focused browser gates

Dropped:

- compatibility framing for static `Editor.*`
- public transform registry escape hatch
- public `editor.replace` / `editor.reset` as normal app APIs
- any `EditorRuntime` / `EditorStatic` / `EditorQuery` compatibility namespace
- command or chain sugar inside raw Slate for this cleanup

Strengthened:

- maintainer objection answers for raw Slate users, plugin authors, test
  authors, product-layer maintainers, and collaboration adapters
- instance query cleanup from "temporary bridge" into a closure blocker that
  must be resolved or explicitly fenced before publish
- high-risk pre-mortem, blast radius, proof plan, and split-execution
  remediation without compatibility aliases
- instance query policy resolved; ref lifecycle and initial value ergonomics
  explicitly deferred out of this namespace hard-cut plan

Deferred:

- ref lifecycle helper design
- public initial-value creation ergonomics

## 19. Open Questions and What Would Change the Decision

Deferred out of this plan:

- Ref lifecycle helpers (`pathRef`, `pointRef`, `rangeRef`, and ref sets).
  They are live handles and need a focused design. This plan does not introduce
  `editor.refs` or another namespace.
- Public `createEditor({ initialValue })` ergonomics. Initialization sugar is
  not required for the public `Editor` value hard cut.
- Current-version Plate and slate-yjs adapters. This plan proves migration
  backbone, not adapter compatibility.

Open plan questions:

- none for the public `Editor` value hard cut.

What would change the decision:

- proof that removing public `Editor` value breaks the operation/collaboration
  substrate in a way `state` / `tx` cannot solve
- proof that TypeScript cannot express extension namespaces without a public
  editor interface
- proof that docs become materially worse without a static namespace

Current expectation: none of those will hold.

## 20. Implementation Phases

1. Contract-first export tests.
   - Add or update public export/type tests for no value `Editor`, type-only
     `Editor`, and no transform-registry root export.
2. Internal boundary split.
   - Move transform registry and any static implementation table behind
     internal modules.
3. Type untangling.
   - Replace `typeof Editor.*` type references with per-function/internal types.
4. Source migration.
   - Replace internal `Editor.*` usages with instance reads, state/tx, pure
     helpers, or internal helpers.
5. Test/fixture migration.
   - Introduce non-public test helpers for seed/snapshot needs.
6. Value replacement migration.
   - Add `tx.value.replace(input)` and migrate app-facing replacement examples
     away from `Editor.replace` / `editor.replace`.
7. Query surface migration.
   - Move docs/examples to `state` / `tx` group reads where available; leave
     internal bridge methods only where source migration requires a separate
     phase.
8. Docs/examples migration.
   - Remove user-facing `Editor.*` editor-state reads/writes.
9. Guard rails.
   - Add grep/export guards so public `Editor` value and transform registry do
     not return.
10. Verification.

- Run focused tests, `bun check`, and completion-check.

## 21. Fast Driver Gates

From `/Users/zbeyens/git/slate-v2`:

```sh
bun test ./packages/slate/test/public-field-hard-cut-contract.ts
bun test ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/write-boundary-contract.ts
bun check
```

From `/Users/zbeyens/git/plate-2`:

```sh
bun run completion-check
```

Additional planned guards:

```sh
rg -n "export const Editor|interface EditorInterface|getEditorTransformRegistry|setEditorTransformRegistry" packages/slate/src
rg -n "import \\{[^}]*Editor|Editor\\." docs site/examples/ts packages/slate/test packages/slate-react/test
```

The second grep needs allowlists for type-only imports, pure legacy fixture
snapshots during migration, and internal test helpers.

## 22. Final User-Review Handoff Outline

When this Ralplan reaches `done`, the handoff must list:

- public API decisions
- `Editor` value and `EditorInterface` cuts
- transform registry export cut
- state/tx read/write target
- data namespace keep decision
- extension namespace migration backbone
- Plate and slate-yjs substrate answers
- high-risk pre-mortem summary
- proof matrix and verification commands
- implementation phase order
- unresolved deferred items, if any

## 23. Final Completion Gates

Do not set `done` until:

- score is at least `0.92`
- no dimension is below `0.85`
- pass-state ledger is complete
- high-risk deliberate pass is complete
- objection ledger rows are all accepted or revised into the plan
- no public API surface is in "maybe" language
- migration-backbone answers exist for Plate and slate-yjs
- public export/test/doc acceptance criteria are named
- `.tmp/continue.md` is synchronized
- `bun run completion-check` passes after status is set appropriately
