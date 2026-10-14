# Atomic updates and document changes

Page: https://claude.ai/artifact/HcWE7ANEonTn1Jbdn8WEGU

The ledger asks what becomes observable when updates commit, nest, fail or repair content, and which overlapping mutation authorities can disappear. An update publishes once. Updates never nest, a failed author throws its draft away, and every update author must return synchronously. One guard in `public-state.ts` enforces that, and `synchronous-transaction-authors.test.ts` covers 14 entry forms. A plugin's update methods run inside that update, and small markers in `tx-only.ts` tell the runtime how to treat a method: usable only inside an open update, or where its location arguments land when a command runs on another document. Every direct call refuses a plugin's reads, because the transaction guard knows where each member came from.

## Public API

A plugin method runs inside an update, either through the one-call shortcut or on `tx`.

```ts
// content/docs/api/editor-api.mdx
editor.update.links.toggle({ href });

editor.update((tx) => {
  tx.links.toggle({ href });
});
```

A plugin's reads go in `read`. They appear on `tx`, where they see the update's draft, and every direct call refuses them.

```ts
// packages/plitejs/test/synchronous-transaction-authors.test.ts
const plugin = definePlugin('mixed', {
  read: () => ({
    read: shared,
    nested: { read: shared },
    markedRead: () => result,
  }),
  update: ({ tx }) => ({
    writeAlias: shared,
```

Plate merges each plugin's read capabilities as they are, with no marker.

```ts
// packages/platejs/src/internal/plugin/resolvePlugins.ts
return mergePluginCapabilities({ kind, owner }, ...values);
```

A control that only means something inside an open update is wrapped with `txOnly`. It stays on `tx`, the direct-call types leave it out, and a direct call throws on it.

```ts
// packages/plitejs/src/history/history-plugin.ts
const createHistoryControl = <V extends Value>(
  tx: HistoryTransaction<V>,
  mode: HistoryMode
): HistoryControlTx =>
  txOnly(() => {
    tx.tags.add(
      mode === 'push'
        ? 'history-push'
        : mode === 'merge'
          ? 'history-merge'
          : 'history-skip'
    );
  });
```

## Main changes

- `packages/plitejs/src/core/public-state.ts` owns the update: one publish, the synchronous-author guard, the guarded `tx` groups and the command frame. The guard answers whether each plugin member came from the update group, and the command frame keeps a callable method's members.
- `packages/plitejs/src/core/plugin-dispatch.ts` holds one path walker and one dispatch. The update shortcut, both forms of `editor.plugin(P).update`, and Plate's plugin portal and `ctx.update` call them. The dispatch refuses a `txOnly` value anywhere on the path, then a member the guard reports as a plugin read, and checks the method itself even through `.call` or `.apply`. Built-in groups such as `plugins` never pass the guard, so they still run.
- `packages/plitejs/src/core/plugin-registry.ts` refuses a plugin group named after a built-in `tx` member other than `plugin`, from a table typed against the transaction's keys.
- `packages/plitejs/src/core/tx-only.ts` keeps `txOnly` and the location markers in side tables on the global object, keyed by the method, so the callable tree holds no extra keys and two copies of `plitejs` in one app agree.
- Plate's plugin resolver, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, merges read capabilities without marking them. Plate's portal and `ctx.update` reach the shared dispatch through `plitejs/internal`.

## What other editors do

This page's 2026-10-13 review read the Lexical (`dd5c41b13`), Slate (`945a484df`), Tiptap (`91c51be53`), `prosemirror-transform` (`662b7a937`) and `prosemirror-commands` (`52a84a842`) checkouts beside the repository and ran none of them. None marks a method as usable only inside an open update in its types, and none remaps a command's location arguments onto another document for it.

| Editor | A helper usable only inside an open update | A command's location arguments when the document it decides on changes |
| --- | --- | --- |
| ProseMirror | No marker; a command is `(state, dispatch?)` and runs anywhere | The caller maps positions through `Mapping.map` (`prosemirror-transform` `src/map.ts:252`) |
| Lexical | `$` helpers and node methods throw outside `editor.update` or `read` (`packages/lexical/src/LexicalUpdates.ts:103`), a naming rule with no type | No remapping; commands read the selection from the active state |
| Slate | No marker; transforms take `at` and run anywhere | `PathRef` and `PointRef` follow operations (`packages/slate/src/interfaces/path-ref.ts:24`) |
| Tiptap | No marker; a command runs directly, in `chain()` or as `can()` (`packages/core/src/CommandManager.ts:51`) | The caller's job |
| Plite | `txOnly` brands the type, and every direct call refuses it at runtime | Each command or method declares where its locations land on the review tree's proposed document |

## Open work

- The shortcut's type, `editor.update.<name>`, rebuilds each plugin method from its parameters and return, so a callable member's children vanish and an unbranded generic result becomes `unknown`. This predates the tx-markers build. owner: zbeyens. stop: the next change to `EditorBivariantMethods`, or a report of a plugin method that types wrong through the shortcut.
- Diff round 3's type change, which makes the direct-call types offer nothing for a group wrapped in `txOnly`, had no panel round after it. owner: zbeyens. stop: a review of the next change to the direct-call types in `packages/plitejs/src/interfaces/editor.ts`.
- Plate's shortcut keys accept `txOnly` names, so a shortcut naming a control compiles and throws when pressed. owner: zbeyens. stop: the next change to `PluginShortcutUpdateKey` or `inspectPluginUpdateMethods`.
- Plate's `ctx.update` falls back to the whole `tx`, untyped, when a plugin has no group. owner: zbeyens. stop: an API decision to type or cut it.
- Plite and Plate each build the same portal proxy. owner: zbeyens. stop: the `ctx.update` fallback decision above.
- The guard reads a member's origin from a second object, and an update member defined by a getter shows on `tx` only when the plugin also has a read group. owner: zbeyens. stop: the next change to `guardTransactionValue`'s origin rule.
- History's read group is callable, so its reads never reach `tx`, and the shortcut reports them not callable. owner: zbeyens. stop: the next change to history's read factory.
- History's update factory wraps three fresh closures in `txOnly` on every update. owner: zbeyens. stop: the next history performance review.
- The API reference generator publishes the declaration bundler's `$N` renames as aliases, as `schema$1` shows. owner: zbeyens. stop: the next change to `apps/www/scripts/build-api-reference.mts`.
- The command frame keeps its own path walker in `frameUpdateMethods`, which is the suggestions plan's P1.8 code. owner: zbeyens. stop: the P1.8 iteration closes.
- Two authored recording-law slow cases timed out at the final freeze, and no control isolates their cause. owner: zbeyens. stop: the next slow run on a host under load 6, which either passes them or names their cause.
- T has no verdict under the shared runner. Its three attempts on this shared host were inconclusive, with noise between two copies of the same code up to 0.096 on small updates. owner: zbeyens. stop: a run of `perf/t2-config.json` on an idle host, after `perf/setup-t2.sh` recreates its worktrees; a conclusive miss sends the design back to `architect`.
- A same-code arm cannot see noise in base, which moves every arm in a packet together. owner: zbeyens. stop: the owner adds a second base arm to the runner or declines it.
- The runner has run only on the headless Plite bench. The `benchmark` rule's Harness Repair asks a shared stats helper to prove itself on a current React artifact too. owner: zbeyens. stop: the first React line that uses the runner, which runs that proof first.
- No review read the runner's round 3 fixes, its noise pick among them. owner: zbeyens. stop: the owner's look at the `noise-revert` row, or the runner's next panel.
- The runner's load limit has no bound against the core count, and its arms have no timeout. owner: zbeyens. stop: the runner's next change.
- The paired-timing runner lives in this repository's `benchmark` rule, though nothing in it is Plate-specific. owner: zbeyens. stop: the owner moves it to the shared dotai source or keeps it here.
- No run checked the whole API reference manifest under the real config, because another session's `SchemaRoot` and `SchemaRootInput` exports are missing from `apps/www/api-reference.config.json`. owner: zbeyens. stop: those exports are listed, then `api-reference:check` runs clean.
