# Source inventory

This inventory classifies the complete runtime source surface used by the
Wordgard-versus-Plite rewrite decision. Counts exclude generated output,
`node_modules`, caches, images, and lockfiles. Test trees and planning/proof
owners are counted separately from production source.

## Wordgard

Wordgard has 74 production TypeScript files and 22,611 lines under `src/`.
Every directory is assigned to one comparison responsibility below.

| Owner | Files | Lines | Responsibility | Comparison rows |
| --- | ---: | ---: | --- | --- |
| `../wordgard/src/doc` | 13 | 4,863 | Immutable node model, schema, token positions, slices, `ChangeSet`, HTML shapes/codecs | Model, schema, changes, positions, serialization |
| `../wordgard/src/state` | 7 | 2,926 | Persistent state, transactions, selections, facets, fields, corrections, bidi/textblock maps | State, transactions, selection, normalization |
| `../wordgard/src/editor` | 23 | 8,502 | Imperative view, tile projection, DOM mapping/observer, input/IME, decorations, panels/dialogs/tooltips | DOM, input, view, UI, failure isolation |
| `../wordgard/src/command` | 5 | 1,904 | Pure and imperative commands, handler precedence, menu definitions | Commands and product UI |
| `../wordgard/src/history` | 2 | 384 | Inverse-change history, grouping, mapped non-history transactions, serialization | History |
| `../wordgard/src/collab` | 2 | 182 | Central-authority OT versioning and unconfirmed-update rebase | Collaboration |
| `../wordgard/src/table` | 8 | 1,471 | Table schema, map, correction, cell selection, paste, commands, menu | Selection/schema extension pressure |
| `../wordgard/src/schema` | 9 | 1,703 | Opinionated rich-text schema bundles, image/link/list UI | Product/plugin boundary |
| `../wordgard/src/types` | 2 | 481 | Built-in semantic node/mark types and schema vocabulary | Schema examples |
| `../wordgard/src/phrases` | 3 | 195 | Phrase sets and localized UI labels | Product/i18n boundary |

Additional Wordgard surfaces are fully classified:

| Owner | Inventory | Classification |
| --- | --- | --- |
| `../wordgard/package.json` | 10 public entrypoints plus root namespace entry; 3 runtime dependencies | Packaging, dependency, and public API comparison |
| `../wordgard/bin` | 9 scripts plus one tsconfig | Build, release, dead-code, server, and Chromium-only headless proof tooling |
| `../wordgard/test` | 26 TypeScript files, 5,708 lines | Core, command, table, history, collab, composition, DOM, coords, and serialization proof |
| `../wordgard/demo` | 3 files | One browser demo and sample asset |
| `../wordgard/README.md` | One minimal install/create example | Public teaching surface |
| `../wordgard/CHANGELOG.md` | Historical release notes | Explicitly not architecture truth |
| Benchmarks | No benchmark files or benchmark script | Performance is unmeasured, not inferred from code size |

The package exports `doc`, `types`, `schema`, `table`, `state`, `editor`,
`command`, `history`, `collab`, and `phrases` from one npm package
(`../wordgard/package.json:7-18`). The generated root entry only namespaces
those modules (`../wordgard/bin/build.ts:276-279`).

## Plite

The scoped Plite family has 459 production TypeScript/TSX files and 115,140
lines. Every package is assigned to one comparison responsibility.

| Owner | Files | Lines | Responsibility | Comparison rows |
| --- | ---: | ---: | --- | --- |
| `packages/plite/src` | 179 | 35,942 | JSON model, path operations, transaction runtime, snapshots, schema behavior, normalization, extensions, queries/transforms | Model, changes, state, transactions, schema |
| `packages/plite-dom/src` | 21 | 7,125 | DOM translation, selection, coverage, clipboard, hotkeys, browser utilities | DOM and clipboard |
| `packages/plite-react/src` | 166 | 46,897 | React provider/editable, selectors, runtime IDs, input/IME, DOM repair, selection, virtual/hidden coverage, projections | React, input, view, selection |
| `packages/plite-history/src` | 7 | 1,609 | Operation/state-patch history, replay, merging, root-aware selection | History |
| `packages/plite-hyperscript/src` | 4 | 576 | JSX fixture construction | Test construction |
| `packages/plite-layout/src` | 3 | 4,451 | Page geometry, projections, mount planning, React paged editable | Layout/pagination |
| `packages/browser/src` | 52 | 11,983 | Browser scenario contracts, replay, shrinking, Playwright/Appium transports, selection/IME/materialization proof | Browser proof |
| `packages/yjs/src` | 27 | 6,557 | Yjs document/operation adapter, awareness, providers, relative selection, split history and undo manager | Collaboration |

Additional Plite surfaces are fully classified:

| Owner | Inventory | Classification |
| --- | --- | --- |
| `packages/plite/test` | 1,049 TS/TSX files, 64,268 lines | Core behavior corpus and imported fixtures |
| `packages/plite-dom/test` | 21 files, 6,021 lines | DOM package behavior |
| `packages/plite-react/test` | 84 files, 42,534 lines | React, input, selection, projection, and rendering behavior |
| `packages/plite-history/test` | 17 files, 3,417 lines | History semantics |
| `packages/plite-hyperscript/test` | 34 files, 957 lines | Fixture DSL semantics |
| `packages/plite-layout/test` | 3 files, 2,922 lines | Pagination/layout semantics |
| `packages/yjs/test` | 29 files, 8,538 lines | Yjs adapters, awareness, history, and package contracts |
| `apps/plite/tests` | 42 TS files, 40,966 lines | Browser conformance and regression matrix |
| `apps/plite/src` | 5 TS/TSX files | Browser proof host; examples are imported from `apps/www` |
| `docs/plite` | 120 Markdown files | Public teaching, migration, proof, and architecture owners |
| `apps/www` Plite surfaces | 54 TS/TSX files with `plite` in their path | Live examples and direct adoption pressure |
| `benchmarks/slate-v2` and `scripts/benchmarks` | Current core, history, normalization, selection, React, huge-document, layout, and Yjs runners | Performance proof owner |
| `packages/core` | Direct Plate editor/plugin composition caller | Plate adoption owner only; not re-audited as substrate |

`@platejs/plite` itself has no runtime or peer dependencies. DOM, React,
history, layout, browser proof, and Yjs are separate packages. This boundary is
part of the target, not migration baggage.

## Source anchors

The decision-changing owners were read directly:

- Wordgard model and schema: `../wordgard/src/doc/node.ts`,
  `../wordgard/src/doc/schema.ts`, `../wordgard/src/doc/mark.ts`, and
  `../wordgard/src/doc/slice.ts`.
- Wordgard change algebra: `../wordgard/src/doc/change.ts:109-446` and
  `../wordgard/src/doc/change.ts:500-669`.
- Wordgard state/configuration: `../wordgard/src/state/state.ts:49-1059`.
- Wordgard transaction/effects: `../wordgard/src/state/transaction.ts:12-409`.
- Wordgard selection and tables: `../wordgard/src/state/selection.ts` and
  `../wordgard/src/table/cellselection.ts`.
- Wordgard correction: `../wordgard/src/state/correction.ts` and
  `../wordgard/src/table/correct.ts`.
- Wordgard view/input: `../wordgard/src/editor/editor.ts`,
  `../wordgard/src/editor/tile.ts`, `../wordgard/src/editor/input.ts`,
  `../wordgard/src/editor/domobserver.ts`, and
  `../wordgard/src/editor/decoration.ts`.
- Wordgard history/collab: `../wordgard/src/history/history.ts` and
  `../wordgard/src/collab/collab.ts`.
- Plite model/API: `packages/plite/src/interfaces/*`,
  `packages/plite/src/core/editor-schema.ts`, and
  `packages/plite/src/editor-runtime-view.ts`.
- Plite mutation/runtime: `packages/plite/src/core/apply.ts`,
  `packages/plite/src/core/public-state.ts`,
  `packages/plite/src/core/normalize-node.ts`, and
  `packages/plite/src/core/runtime-impact.ts`.
- Plite extension/state: `packages/plite/src/core/editor-extension.ts`,
  `packages/plite/src/core/command-registry.ts`, and
  `packages/plite/src/core/state-field.ts`.
- Plite DOM/React: `packages/plite-dom/src`, `packages/plite-react/src`, and
  the package READMEs.
- Plite history/collab/layout/proof: `packages/plite-history/src`,
  `packages/yjs/src`, `packages/plite-layout/src`, `packages/browser/src`,
  and `apps/plite`.
- Current doctrine: `VISION.md`, `docs/vision/plite.md`,
  `docs/vision/common.md`, `docs/plite/agent-start.md`, and
  `docs/plite/references/architecture-contract.md`.

## Completeness result

- Wordgard production classification: **74 of 74 files; zero unclassified**.
- Plite production classification: **459 of 459 files; zero unclassified**.
- Wordgard tests/tooling/docs/demo/benchmarks: **all top-level owners
  classified; zero unclassified**.
- Plite package tests/browser host/docs/examples/benchmarks/direct adoption:
  **all named owners classified; zero unclassified**.
- Exclusions are only generated output, dependencies, caches, lockfiles,
  images, and historical changelog content. None owns runtime behavior.
