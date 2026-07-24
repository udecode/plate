---
description: Build or refactor Plate plugins with semantic base-first architecture, owner-first colocation, inferred types, options-only configuration, scoped APIs and transactions, and honest React boundaries. Use when choosing createBasePlugin vs createPlatePlugin, shaping plugin packages, merging helpers/components/hooks/tests into durable owners, or defining plugin APIs, update groups, options, dependencies, parsers, normalizers, and Plite extensions.
name: plate-plugin-creator
metadata:
  skiller:
    source: .agents/rules/plate-plugin-creator.mdc
---

# Plate Plugin Creator

Build Plate plugins that do not need a later `plate-next` cleanup.

This skill owns plugin authoring mechanics: semantic layer, durable source
owners, file topology, contextual typing, options, scoped APIs and
transactions, React families, and package-local proof.

Before changing reusable API shape, naming, builder/factory patterns,
composition identity, or runtime/perf law, read [vision](../vision/SKILL.md)
and route the target call shape to [best-api](../best-api/SKILL.md). Use
`plate-plan` or `plite-plan` only when adoption, runtime law, or layer ownership
needs a plan. Use [docs-creator](../docs-creator/SKILL.md) for public docs.

## Required Reads

Before authoring or refactoring a plugin, read:

1. [creation-flow.md](./rules/creation-flow.md) for semantic and file ownership;
2. [typing.md](./rules/typing.md) for inference and public contracts;
3. [composition.md](./rules/composition.md) for options, APIs, transactions,
   dependencies, Plite primitives, and React behavior.

Use [plugin-authoring-audit.md](./references/plugin-authoring-audit.md) only
for current repo examples. Core builders and type tests outrank precedent.

## Routing Gate

| Owner                       | Scope                                                    |
| --------------------------- | -------------------------------------------------------- |
| `vision`                    | durable doctrine, Plate/Plite ownership, perf law        |
| `best-api`                  | reusable call shape, naming, composition identity, DX/AX |
| `plate-plan` / `plite-plan` | runtime/adoption boundary and proof plan                 |
| `plate-plugin-creator`      | implementation mechanics and owner-first topology        |

Continue here when the public target is already clear. Stop for `best-api` when
the work invents or materially changes a reusable public shape.

## Semantic Layer

**Semantic base first, Plate second.**

- If behavior matters without React, author it in `src/lib` with
  `createBasePlugin`.
- Lift an existing semantic base with `toPlatePlugin`; do not re-author it with
  `createPlatePlugin`.
- Use `createPlatePlugin` directly only for a real React/Plate-native plugin.
- Pure grouping of complete plugins belongs in an app or registry kit array,
  never a package bundle plugin.
- Keep a plugin base-only when no React layer has an independent job.
- Use shared `KEYS` for shipped plugins and cross-plugin references.
- Plite owns generic editor substrate: nodes, ranges, selection, reads,
  updates, transactions, schema, history, DOM/runtime primitives, and editor
  extensions.
- Plate owns product composition: plugins, React integration, UI, app/registry
  kits, product commands, defaults, and docs/examples.
- Do not wrap Plite APIs under second Plate names. If clean authoring needs
  missing substrate, name the exact Plite or Plate gap and patch the owner
  instead of inventing a local bridge.

Named direct-Plate exceptions:

1. hook- or `useHooks`-driven plugins;
2. DOM/editor-surface plugins with no useful semantic base;
3. React node-prop or component behavior that has no non-React meaning.

## Owner-First Topology

Colocation is the default.

- Put behavior with exactly one production owner inline in that plugin's
  `create*Plugin` / `.extend*` chain. This includes one-use `with*`,
  `decorate*`, normalizers, parsers, commands, corrections, matchers, options,
  APIs, and tx callbacks.
- A separate helper needs multiple production consumers that cannot reuse the
  owning scoped API, a real cross-plugin/cross-layer/transaction-composition
  algorithm, a standalone public owner, or dedicated proof tooling.
- Tests, barrels, exports, docs, app wrappers, historical filenames, and
  hypothetical reuse do not count as additional production owners.
- There is no line-count ceiling. A large coherent owner is cheaper than a
  graph of one-use files.
- Do not create `internal/`, `helpers/`, `utils/`, `transforms/`, `queries/`,
  `components/`, or `hooks/` merely to classify implementation kinds.
- An `internal/` subsystem is justified only when it has several files and a
  durable independent boundary. Privacy alone is not file ownership.
- Keep feature-package React roots flat by default: plugin files, component
  family files, hook-family files, and one generated public root barrel.
- One durable component family owns one `<Family>.tsx` file. Keep family-only
  subcomponents, hooks, stores, controllers, lifecycle, constants, variants,
  and render helpers in that file.
- A standalone `use<Family>.ts` file requires use by multiple durable component
  families or a public lifecycle/controller job meaningful without the
  component family.
- A provider/store file requires independently owned state or lifecycle
  consumed beyond one component family.
- Public exports and external imports prove access, not independent source
  ownership.
- When colocation makes a helper obsolete, delete its file and generated barrel
  export. Do not preserve aliases, forwarding wrappers, or old filenames by
  default.
- Never replace a deleted raw helper with a wrapper around the scoped plugin
  API. Call the scoped API directly.

Colocation controls source ownership, not public composition identity. A real
independently substitutable capability may remain colocated; route its public
identity to `best-api`.

## Inference Law

Let builders and initializers own contextual typing.

- Infer plugin exports from `createBasePlugin`, `createPlatePlugin`,
  `toPlatePlugin`, and chained `.extend*` methods.
- Never annotate or cast an inferred plugin export to `BasePlugin`,
  `PlatePlugin`, or a config type.
- Do not create `PluginConfig<'foo'>` aliases with no real options, API, tx,
  selectors, or state.
- Keep an explicit config/API/tx type only for a real exported contract,
  recursive shape, reused contract, or external boundary.
- Prefer inline one-use constants, config fragments, callback types, and test
  setup. Do not create ferry types to move an inferred callback into another
  file.
- Do not annotate local variables, callbacks, examples, or test fixtures whose
  initializer/context should infer them.
- For an existing API/tx contract, pass the method object type to
  `.extendApi<ApiContract>(...)` or `.extendTx<TxContract>(...)`. Do not append
  `satisfies`, cast the callback, or annotate every parameter.
- An `extendTx` generic describes the returned command object, not the
  transaction-factory function.
- If contextual inference fails, repair the owning Core builder/generic or
  source API. A new config alias or explicit `editor`/`tx` annotation is not an
  inference fix.
- Forbid `any` in production source. A deliberate local non-type test escape is
  the only exception.

## Options And Extension Law

Plate plugin descriptors have one value bag: `options`.

- Put defaults in `options` and override descriptor values with
  `.configure({ options })`.
- Read live values with builder `getOptions` or the scoped plugin portal.
- Mutate valid runtime values with scoped `setOption` / `setOptions`.
- Never add a second top-level `config` channel for immutable, compile-time,
  parser, codec, schema, or host-policy values.
- Schema factories and parser contexts receive `options`; API, tx, and
  extension callbacks use inferred `getOptions`.
- Live option updates do not rebuild compiled schema. Configure schema-affecting
  values before editor construction.
- Plite editor extensions may retain their own unrelated `config` contract.
- `extendExtension` accepts a built extension or raw extension options. Raw
  options without `name` default to the plugin key; do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })`.
- Use an explicit extension name only for an independently identified secondary
  or standalone extension.

Root plugin option helpers are forbidden. Use
`editor.plugin(FooPlugin).getOptions()` / `getOption` / `setOption` /
`setOptions`. A key-only portal needs a concrete cycle, layer, or decoupling
reason; plugin-owned callbacks should capture the typed builder context.
When `FooPlugin` is a valid optional peer, keep the typed portal and check
`editor.plugin(FooPlugin).installed` before reading its API, updates, options,
or installed descriptor. Disabled plugins count as absent. Do not probe root
`editor.api`, node types, schema properties, caches, or caught access errors.

## API And Transaction Law

- `extendApi` owns plugin-specific reads/services. On a concrete inferred
  editor, consumers discover them through `editor.api.<pluginKey>`; generic
  package code and exact ownership use `editor.plugin(FooPlugin).api`.
- Generic code integrating an optional descriptor first checks
  `editor.plugin(FooPlugin).installed`; required descriptor ownership may
  access the portal directly.
- Both discovery paths expose the same plugin-owned API. Do not duplicate the
  implementation with `extendEditorApi`.
- Use `extendEditorApi` only for a genuinely unkeyed root editor capability.
- A scoped portal already owns the plugin noun. Prefer flat, direct verbs such
  as `table.update.insertTable()` over taxonomy like
  `table.update.insert.table()`. Route disputed public spelling to `best-api`.
- `extendTx` owns the plugin's one-shot update group. Use `extendTxGroup` only
  when an additional named group is itself meaningful.
- Repeated callers use the scoped API/tx method. They do not justify a parallel
  exported helper.
- Transform-backed callbacks receive and mutate through the active `tx`. Do not
  call `editor.update.*` from inside transform middleware, input rules,
  corrections, `editor.update(...)`, or `withoutNormalizing`.
- Do not extract one-owner behavior merely to create
  `foo(editor, tx, ...)` or paired one-shot/tx wrappers. Inline it where `tx`,
  `api`, options, editor, and type remain contextually inferred.
- A surviving transaction helper must own a real cross-plugin or
  transaction-composition algorithm, require `tx`, and never open a nested
  update.
- Group consecutive synchronous mutations that form one user action in the
  existing transaction, or one `editor.update((tx) => ...)` when no `tx`
  exists.
- Never add arbitrary plugin/product fields to the editor root. Use scoped
  API/options/state, extension state, a React store, a local controller, or a
  module-local `WeakMap` according to lifecycle.

## Plite Primitive Law

- Prefer direct one-shot reads and writes over one-operation callback wrappers.
  Use callback form only for shared snapshot/transaction state, branching,
  loops, or multiple operations.
- Pass a live node directly to `NodeTarget`/`at` when available. Resolve a path
  only when the path is the result.
- Do not rediscover a live node by scanning for its `type` and `id`.
- Use shallow property matchers for exact metadata. Keep predicates for
  computed policy, path-dependent logic, content/structure, truthiness, or
  narrowing consumed by the caller.
- Use boolean queries for boolean questions; do not materialize entries merely
  to test existence.
- Treat unresolved public reads as optional in package source. Do not add
  `{ required: true }` or non-null assertions without an internal invariant
  owner.
- Use current Plite ranges, reads, and updates directly. Do not add compatibility
  aliases or Plate wrappers around them.
- Do not replace event-only path resolution with a render subscription.
  `usePath()` is for reactive render dependence; use renderer `path` or resolve
  inside the event when appropriate.
- Explicit normalization must name a real full-root or dirty-path invariant.
  Do not normalize merely to coalesce leaves, settle a transform, or preserve
  an old fixture shape. Repair the smallest transform/normalizer owner instead.

## React And Test Ownership

- Hooks/selectors subscribe only to values that affect render. Read
  callback-only values inside click/key/command/delayed handlers from
  `editor.read.*` or `editor.api.*`.
- Keep one colocated `<PluginName>.<family>.spec.tsx` per plugin behavior
  family. Do not mirror each API method, helper, or deleted filename into a
  separate spec.
- React tests live beside the component or standalone hook family owner.
- Split one `<PluginName>.<family>.slow.tsx` only when profiling proves the
  repository threshold or the case has an independent blocking proof boundary.
  Never use `.slow.spec.tsx`.
- Merge old helper specs into the surviving behavior-family spec when
  production helpers are merged.
- Keep editor/plugin construction inline in tests when inference should support
  it. Do not add local fixture-shape aliases, casts, or setup constants to hide
  weak source typing; repair the test-utils or builder owner.
- Assert current behavior, not deleted compatibility paths or incidental text
  leaf grouping.

## Package And Barrel Law

- Never hand-edit generated `index.ts` / `index.tsx` barrels.
- After adding, moving, renaming, or deleting exported files, run `pnpm brl`
  and fix source placement or generator configuration if output is wrong.
- Package source imports its direct runtime owner (`@platejs/core`,
  `@platejs/plite`, `@platejs/utils`, and so on), never the `platejs` umbrella.
- Keep React as a peer when the package exposes React surfaces. Keep only
  dependencies proven by source/runtime imports or repo tooling convention.

## Workflow

1. Read the three required rule files.
2. Decide the semantic layer and durable production, React-family, and test
   owners before creating files.
3. Search current Core builders/type tests and the closest clean package
   analog. Do not copy a stale file graph.
4. Route reusable public forks to `best-api`; otherwise keep the inferred
   plugin chain inline.
5. Define options, scoped API/tx methods, relationships, Plite extensions, and
   React behavior in their durable owners.
6. Delete superseded helper/component/hook/spec files and regenerate barrels.
7. Prove the smallest honest surface:
   - package typecheck and behavior tests;
   - Core type tests when builder/public inference changes;
   - React tests when React behavior changes;
   - `pnpm brl` when exports or public files change.
8. Audit for stale helper names, root option helpers, nested updates, explicit
   plugin annotations, empty config aliases, top-level plugin `config`, and
   one-use file taxonomies.

## Do Not Copy

- One-use helper files, `internal/` dumping grounds, or folders by implementation
  kind.
- Plugin export annotations, empty config aliases, callback ferry types,
  `satisfies` patches, or `any` casts.
- Root editor pollution, root option helpers, duplicate Plate wrappers, or
  local structural guards around typed Plite APIs.
- Redundant portal nouns or taxonomy-only method nesting.
- `editor.update.*` inside an active transaction.
- Broad explicit normalization without a named invariant.
- Render subscriptions used only to feed later callbacks.
- Compatibility aliases, forwarding wrappers, or old filenames kept without
  an accepted API reason.

## References

- [creation-flow.md](./rules/creation-flow.md) — semantic and file ownership
- [typing.md](./rules/typing.md) — contextual inference and contracts
- [composition.md](./rules/composition.md) — options, APIs, tx, relationships,
  Plite primitives, and React behavior
- [plugin-authoring-audit.md](./references/plugin-authoring-audit.md) — current
  examples and rejected precedent
