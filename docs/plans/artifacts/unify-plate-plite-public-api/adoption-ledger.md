# Plate / Plite public API adoption ledger

Status values: `pending`, `implemented`, `kept`, `rejected`.

## P0 — substrate truth

| ID | Accepted target | Status | Evidence |
|---|---|---|---|
| P0.1 | Lower each Plate plugin schema through its native Plite extension; root owns only root grammar and policy | implemented | Core `compilePlateModel`/`withPlite` lowering; schema contracts and 4,205-file adoption audit |
| P0.2 | Make `defineEditorSchema(name, definition)` a witnessed extension product instead of a parallel structural descriptor | implemented | Plite schema definition/compiler owners; named-lineage and public-type contracts |
| P0.3 | Accept nominal extension/plugin descriptors only; reject raw objects and normalized/compiler definitions | implemented | Plite extension brands and Core descriptor contracts; exact negative type/runtime tests |
| P0.4 | Hide compiler/configuration callback graphs and `__*` fields; freeze persistent descriptors | implemented | curated public barrels/declarations; descriptor freezing and publication tests |
| P0.5 | Hide public factory accumulator machinery while preserving inference | implemented | `DefinitionOf` public extraction plus internal compiler carriers; Core public declarations build |
| P0.6 | Generic editors expose core groups only; concrete tuples add exact capabilities; default `Value`, never `any` | implemented | Plite/Core compile-only capability and package-consumer contracts |
| P0.7 | Exact repeated descriptors are idempotent; divergent same-name descriptors reject in types and runtime | implemented | Plite extension and Core plugin duplicate-identity tests |
| P0.8 | Raw Plite React installs DOM and React only; History is explicit; Plate may retain its opinionated default | implemented | React factory contracts; explicit `history()` adoption in Plite browser/examples |
| P0.9 | Plite derives and deduplicates field-owned effects; delete Plate compensation | implemented | Plite state-field compiler/runtime tests and removed Core compensation path |
| P0.10 | Use descriptor `define*` and live `editor.install`; remove `create*Plugin` and live `editor.extend` | implemented | zero live product hits for every removed factory and `editor.extend(...)`; install contracts |

## P1 — public ownership and grammar

| ID | Accepted target | Status | Evidence |
|---|---|---|---|
| P1.1 | Derive React plugin typing from the Base plugin generic foundation | implemented | `definePlatePlugin`/`PlatePlugin` declarations and Core type contracts |
| P1.2 | `PluginReference` carries immutable identity/name only, not serialized type | implemented | Core plugin reference definitions and exact type tests |
| P1.3 | Convert configured factories such as Yjs, trigger combobox, and exclude-diff-fragment to final descriptor grammar with inferred returns | implemented | Yjs, Combobox, and Diff owners; checker stage allowlists and package tests |
| P1.4 | Remove public `extendBaseEditor` / `extendPlateEditor`; constructors accept an optional existing editor | implemented | zero live product hits; constructor and release-consumer contracts |
| P1.5 | Plite extension portal exposes `api`, `read`, and `update` | implemented | Plite editor-extension portal types/runtime tests |
| P1.6 | `editor.extension()` resolves raw extensions only; `editor.plugin()` resolves Plate plugins only | implemented | Plite/Core portal types, negative tests, and package adoption |
| P1.7 | Remove public `EditorRuntime` / `createEditorRuntime`; use `createEditorView(editor, options)` | implemented | zero live `createEditorRuntime` hits; benchmark, docs, browser, and release fixture adoption |
| P1.8 | Plite exports `Editor`; Plate Base exports `BaseEditor`; React exports `PlateEditor`; tuple types use `PlateEditor<Value, typeof Kit>` | implemented | public declaration and packed-consumer type contracts |
| P1.9 | Canonical view state is `editor.read.view`; DOM owns effects; React owns refresh | implemented | DOM/React extension owners and browser/runtime contracts |
| P1.10 | Fold plugin-root `parsers.html` into codecs; preserve distinct injection parsing only if still owned | implemented | Core HTML codec owner, package codec adoption, and HTML tests |
| P1.11 | Node/text lifecycle observations run all callbacks and return void; only DOM events cancel | implemented | lifecycle publication/runtime tests and final listener types |
| P1.12 | Restrict `editOnly.on` to DOM event lifecycle | implemented | Core/Plite lifecycle type contracts and adoption checker |
| P1.13 | Activation receives one `{ editor, ... }` context object | implemented | Plite activation types and runtime adoption |
| P1.14 | Clipboard context property is `tx`, not `transaction` | implemented | clipboard contribution types/tests and docs checker |
| P1.15 | Curate public barrels; hide `Any*`, `Internal*`, compiler, normalized, and callback-graph types | implemented | `pnpm brl` 55/55; packed public-type contracts and Core static-internal curation |
| P1.16 | Canonical schema predicates live under `state.schema`, `tx.schema`, and `editor.read.schema` | implemented | schema state/transaction/read contracts and docs checker |
| P1.17 | Remove sole-property plugin descriptor magic; use typed field handles or semantic APIs | implemented | typed property/state-field handles and schema contracts |
| P1.18 | Use human-readable plugin names; keep serialized element/mark identity in optional `type` | implemented | `KEYS`/`NODES` adoption, plugin/runtime tests, EN/CN docs, and changesets |

## P2 — cleanup and precise language

| ID | Accepted target | Status | Evidence |
|---|---|---|---|
| P2.1 | Remove Slate-style editor-bound standalone helpers; keep pure `NodeApi`, `PathApi`, and `isEditor` | implemented | public barrel/type-contract audit and migrated consumers |
| P2.2 | Expose stable capability handles as readonly | implemented | final public declarations and readonly negative type tests |
| P2.3 | Rename traversal APIs to `previousNode`, `previousText`, and `previousPath` | implemented | Plite query owners, callers, tests, and docs |
| P2.4 | Rename lifecycle diagnostics to `extensionName` and `afterPublish` | implemented | lifecycle diagnostic types/runtime tests and docs |
| P2.5 | Clean type names: `ResolvedPlatePlugin`, internal `PluginBase`, no duplicate definition aliases, `PluginName` | implemented | public/internal type owners and declaration audits |
| P2.6 | Rename schema callback argument to `targetElementTypes` | implemented | Core schema callback types, checker contract, and migrated callbacks |
| P2.7 | Make all docs/examples/tests/releases describe only the final current API | implemented | 363-doc contract audit, Plite docs audit, release checker, and zero-use codemod |

## Explicitly retained contracts

| ID | Retained target | Status | Evidence |
|---|---|---|---|
| K1 | Plite extensions and Plate plugins remain distinct layers | kept | Accepted architecture |
| K2 | `initialValue` remains document input; `initialState`, stores, and state fields remain runtime/plugin state | kept | Accepted architecture |
| K3 | Plate-only rendering, state, and rules stay above Plite | kept | Accepted architecture |
| K4 | Descriptor `name` and serialized `type` remain distinct concepts | kept | Accepted architecture |
| K5 | `.extend` widens descriptor capabilities; `.configure` is terminal configuration | kept | Accepted architecture |
| K6 | `override.plugins` remains bounded | kept | Accepted architecture |
| K7 | `schemaIdentity` remains internal schema publication identity | kept | Accepted architecture |
| K8 | `schema.element.textBlock` remains explicit rather than a hidden default | kept | Accepted architecture |
| K9 | `getField` and plugin store access remain distinct state owners | kept | Accepted architecture |
| K10 | Static/RSC Base descriptor components remain direct; no `toPlatePlugin` conversion solely for rendering | kept | Accepted architecture |

## Cross-cutting closure

| ID | Required closure | Status | Evidence |
|---|---|---|---|
| C1 | Sole positional factories: `defineExtension(name, definition)`, `defineBasePlugin(name, definition)`, `definePlatePlugin(name, definition)`, `defineEditorSchema(name, definition)` | implemented | source/doc AST checkers, public declarations, and zero-use codemod |
| C2 | Zero old call shapes, aliases, overloads, exports, docs, tests, fixtures, or tooling consumers | implemented | zero product hits for eight removed symbols/forms; historical/change-migration prose and marked negative fixtures only |
| C3 | Exact inference and negative compile tests pass without callback annotations, casts, or migration `any` | implemented | Plite/Core/Yjs/List compile-only contracts; public package builds |
| C4 | One changeset per changed published package and current generated barrels | implemented | all 47 changed published packages are covered by the 80-file changeset set; `pnpm brl` 55/55 |
| C5 | Source agent rules, Vision, and generated skills teach the same final grammar | implemented | `pnpm install`; generated metadata-only diffs; `agent-native-review.md` |
| C6 | Focused, strict Plite, Core/features/www/docs/lint/browser/autoreview/agent-native proof passes | implemented | strict Plite 698 pass/6 intentional skips; source-first 62/62; focused runtime/type/docs; scoped Biome; Browser console/network clean; autoreview zero findings; root Biome retains 229 unrelated audit-script diagnostics recorded in the plan |
