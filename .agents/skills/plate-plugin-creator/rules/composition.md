# Composition

## Contents

- Base and wrapper ownership
- Descriptor relationships
- Options and extensions
- Scoped APIs and update groups
- Active transactions
- Plite reads, targets, and ranges
- Normalization
- React subscriptions and node props

## Base First, Wrapper Second

If a semantic base exists, wrap it:

```ts
export const MentionPlugin = toPlatePlugin(BaseMentionPlugin);
```

Do not re-declare the same semantics in `createPlatePlugin`. Keep the wrapper
limited to its real React/Plate job.

## Descriptor Relationships

Apply [best-api](../../best-api/SKILL.md) before changing reusable composition
identity:

- `dependencies` owns required collaborators. Removing one makes the owner
  incomplete.
- optional capabilities are ordinary consumer-array entries. Omission is the
  optionality model.
- pure grouping belongs in an app or registry kit, not a fake parent plugin or
  package preset export.

```ts
export const BaseCodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
  dependencies: [BaseCodeLinePlugin],
});

// apps/www registry source, not a package export
export const CodeBlockKit = [CodeBlockPlugin, CodeHighlightPlugin];
```

Do not add a descriptor `plugins` field, optional-child wrapper, or package kit
export. When an enhancement requires its host, put the host in the
enhancement's `dependencies`; do not make the host install the enhancement.

### Optional peers

Import access does not establish membership ownership. An independently
optional plugin must not install another optional capability merely to adapt
it.

Put weak-peer adaptation in `override.plugins[KEY]` on the adapting plugin and
prove:

1. adapting capability only;
2. target capability only;
3. both capabilities;
4. both with explicit target configuration, which wins.

When the final app/registry composition owns membership, configure the child
beside the parent:

```ts
export const PlainCodeBlockKit = [
  CodeBlockPlugin,
];
```

Omit an optional capability to disable it. When keeping it with custom options,
configure that exact descriptor beside the parent; do not add parent-to-child
reach-through helpers or disabled tombstones.

## Options

Plate plugin values live in `options`:

```ts
export const BaseFooPlugin = createBasePlugin({
  key: KEYS.foo,
  options: {
    enabled: true,
  },
});

const CustomFooPlugin = BaseFooPlugin.configure({
  options: {
    enabled: false,
  },
});
```

- Never add top-level plugin `config`.
- Schema factories and parser contexts destructure `options`.
- API, tx, and extension callbacks read through inferred `getOptions`.
- Use scoped `setOption` / `setOptions` only for values that may change at
  runtime.
- Configure schema-affecting options before editor construction; option
  mutation does not rebuild compiled schema.
- Do not invent immutable option tokens, versioned config wrappers, host-policy
  resources, or frozen snapshots.
- Plite editor-extension `config` and unrelated library/build/provider configs
  are not Plate plugin descriptors and keep their own contracts.

Root `editor.getOption(s)` / `setOption(s)` helpers are forbidden. Use the typed
plugin portal. When importing the descriptor would create a real self-cycle or
cross-layer violation, use a typed key portal and record why; plugin-owned
callbacks should capture builder context instead of looking themselves up.

## Extensions

Use `extendExtension` when behavior belongs to generic editor substrate:

- commands;
- normalizers;
- operation middleware;
- extension state;
- other Plite-owned runtime primitives.

Pass a built extension or raw extension options. Raw options without `name`
inherit the plugin key:

```ts
BaseFooPlugin.extendExtension(() => ({
  commands: {
    // ...
  },
}));
```

Do not wrap plugin-owned raw options in
`defineEditorExtension({ name: KEYS.foo, ... })`. Use an explicit name only for
a genuinely separate secondary or standalone extension identity.

Do not mutate the root editor to install plugin state or services. Choose the
owner by lifecycle:

- plugin reads/services: scoped API;
- mutations: scoped tx group;
- persisted editor behavior: Plite extension state;
- plugin values: options;
- React state: component/store/provider;
- algorithm-local state: returned controller/session;
- private editor-associated ephemeral state: module-local `WeakMap`.

## Scoped APIs

`extendApi` owns plugin-specific reads and services:

```ts
export const BaseMarkdownPlugin = createBasePlugin({
  key: KEYS.markdown,
}).extendApi(({ editor }) => ({
  serialize: () => {
    // ...
  },
}));
```

Canonical discovery:

```ts
editor.api.markdown.serialize();
editor.plugin(MarkdownPlugin).api.serialize();
```

Use the concrete root path when the editor's installed plugin tree is inferred.
Use the portal in generic package code or when exact descriptor ownership is
the point. Copied registry UI and reusable package components are generic even
when one current host has a complete inferred kit. They must not import that
host's editor type or use its root plugin namespaces.

When the descriptor is optional, check availability before any other portal
access:

```ts
const markdown = editor.plugin(MarkdownPlugin);

if (markdown.installed) {
  markdown.api.serialize();
}
```

Disabled plugins count as absent. Do not probe root API, node/schema/cache
internals, or caught portal errors. Required descriptor ownership can access
the portal directly. Both discovery paths expose one implementation.

Use `extendEditorApi` only for a genuinely unkeyed root editor capability.
Never publish the same plugin service through both builders.

A plugin portal already owns its noun. Keep methods flat and task-shaped:

```ts
const table = editor.plugin(TablePlugin);

table.api.createTable({ colCount: 3, rowCount: 2 });
table.update.insertTable({ colCount: 3, rowCount: 2 });
table.update.insertTableColumn();
table.update.removeTableRow();
table.update.merge();
```

Avoid redundant shapes such as `table.update.insert.table()` or
`table.update.table.insertTable()`. Route a disputed public verb/grouping to
`best-api`; do not preserve rejected aliases.

## Update Groups

- `extendTx` owns the plugin-keyed one-shot update surface.
- `extendTxGroup` owns another explicitly named group only when that grouping is
  meaningful to consumers.
- Repeated callers call the scoped method; they do not import a parallel raw
  helper.
- A one-use implementation stays inline in the builder even when long.

Prefer a direct one-shot method for one operation:

```ts
editor.update.normalize({ force: true });
editor.read.children();
```

Use callback form for multiple operations, shared intermediate state,
branching/loops, or behavior with no direct method:

```ts
editor.update((tx) => {
  tx.insertNodes(...);
  tx.selection.set(...);
});
```

## Active Transactions

Transform middleware, input rules, corrections, commands, update callbacks, and
`withoutNormalizing` callbacks mutate through their active `tx`.

Forbidden:

```ts
editor.update((tx) => {
  editor.update.selection.set(...);
});

editor.update.withoutNormalizing(() => {
  editor.update.insertNodes(...);
});
```

Use the callback contract that exposes `tx` and keep mutations on it.

Do not create:

```ts
function insertFoo(editor: BaseEditor, tx: EditorUpdateTransaction, ...) {}
function insertFooWithTx(...) {}
```

when one plugin owns the behavior. Inline the body where `tx`, `api`, options,
editor, and type are inferred.

A transaction-accepting function survives only for a real cross-plugin or
transaction-composition algorithm that a scoped method cannot own. Record its
consumer graph; require `tx`; never open a nested update; do not also pass the
plugin's resolved type.

Multiple consecutive `editor.update.*` calls implementing one action belong in
one transaction. Use an existing `tx`; otherwise use one update callback.

## Parser Injection

Use `inject.parsers` for fixed parser overlays. Use `targetParserToInject` only
when the target depends on context.

Parser injection cannot change membership, options, rendering, APIs, or
relationship topology.

Keep a one-owner parser inline in its plugin. A separate parser needs an
independent codec/public owner or multiple consumers that cannot call the
plugin API.

## Reads, Targets, And Ranges

- Pass a live node directly to `at` or another `NodeTarget` parameter.
- Resolve `editor.read.nodes.path(node)` only when a `Path` is the desired
  result.
- Never rediscover a live node through a type/ID tree scan.
- Treat unresolved public reads as optional in package source. Return or no-op
  instead of asserting `{ required: true }` or `!`.
- Use `match: { type }`, `match: { id }`, or array-valued one-of matchers for
  shallow exact metadata.
- Keep predicates for content/structure, computed policy, path-dependent logic,
  truthiness, or static narrowing consumed by the caller.
- Use `editor.read.nodes.some(options)` when the result is only a boolean.
  Keep entry queries when the node/path or distinct traversal semantics matter.
- Do not replace `above`, `block`, `parent`, `previous`, or `next` mechanically
  with `some`; their traversal law differs.
- Use `editor.read.ranges.fromEntries(entries)` for entry ranges and
  `editor.read.ranges.get(location)` for ordinary locations.
- Do not hand-roll ranges or add Plate wrappers around current Plite reads.
- Do not add structural guards around typed Plite APIs. Repair the owner type.

### Reactive path choice

Do not replace event-only path resolution mechanically with `usePath()`:

- use an incoming renderer `path` when render output depends on it;
- use `usePath()` when a descendant must react to path changes;
- resolve inside the handler when only the event needs the path.

## Normalization

Explicit normalization is semantic, not transaction punctuation.

Keep it only for:

- intentional full-document/import repair;
- an initialization option promising full normalization;
- direct tests of an installed normalizer against invalid input;
- a deliberate dirty-path pass whose focused proof explains why the normal
  transaction lifecycle is insufficient.

Do not normalize to coalesce equivalent text leaves, preserve an old fixture
shape, or “make sure” a transform settled. Repair the smallest
transform/normalizer owner when an operation should preserve an invariant.

Tests should assert user-visible text, selection, node semantics, and feature
behavior instead of incidental leaf grouping.

## React Composition

Prefer `inject.nodeProps.transformProps` for React-only prop augmentation of an
already-rendered node when hooks are needed and the component is not being
replaced.

Do not treat it as a replacement for `node.component`, render behavior,
wrappers, or `useHooks`.

Subscribe only to render state. If a value is consumed solely by `onClick`,
`onMouseDown`, `onKeyDown`, a toolbar action, command, or delayed callback, read
it inside that callback from `editor.read.*` / `editor.api.*`. A render
subscription used only to feed a future callback is a performance bug.

Keep family-only React behavior in the component-family owner. A separate hook,
store, provider, or controller needs an independently consumed lifecycle
beyond that family.
