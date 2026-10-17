---
review_scopes: [transactions]
verdict: pursue
review_basis: [2026-10-04-transactions-audit]
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/history/history-plugin.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/internal/index.ts, packages/plitejs/test/read-view-lifecycle-contract.test.ts, packages/plitejs/test/plugin-portal.test.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/internal/plugin/mergePluginCapabilities.ts, packages/platejs/src/lib/plugin/definePlugin.spec.ts, packages/platejs/src/facade.ts, packages/platejs/src/lib/plugin/createPluginContext.internal.ts, packages/plitejs/src/core/plugin.ts, packages/plitejs/src/core/editor-lifecycle-api.ts, packages/platejs/test/public-package-import-smoke.slow.ts, content/docs/api/editor-api.mdx, docs/plans/2026-10-05-distribution-review.md, docs/plans/2026-10-12-keys-proposed-lines.md, docs/research/decisions/transactions-synchronous-boundary.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../prosemirror-commands@52a84a842774fadec3b167bcdbd56085ec6c85df']
---

# Transactions: the plugin method markers

Status: executed: the frozen-t and noise-revert picks wait on the owner's look
Topic: transactions
Playbook: plan

**Pursue. Delete `txRead`, and keep the rest of `tx-only.ts`.** Marking a method is the right tool here, and `txOnly`, `txLocate`, `locateAt` and `txSelection` each carry a job the Vision names. `txRead` does not. Plite already puts a plugin's `read` methods on `tx`, where they see the update's draft, so a read marked inside `update` is a second way to write the same thing. Plate marks its reads for one reason, so that the one-call `editor.update.<plugin>` shortcut refuses them. Plite's own reads get no such refusal. A probe ran one through the shortcut, and it ran (`read-sees-draft-a2.log`). The shortcut should refuse every plugin read by where it came from. Then nothing needs the marker, and the public helper, its type, its table, three runtime checks and Plate's three mapping sites go. The global-object registry that holds the marker tables stays, because an app with two copies of `plitejs` would otherwise mark a method in one and check it in the other, and keeping it costs nothing. This review was the owner's direct pick, not the ledger's next item.

The plan below builds that cut. `architect` ran three runners and a cross-judge, and every runner reached the same core. The transaction guard already knows whether each member came from `read` or `update`, so it answers that question for the shortcut. The build also closes two more ways around the shortcut that the runners found and probes confirmed. `.call` on a method runs a `txOnly` control or a read (`call-bypass-a1.log`). The policy form of a plugin's update portal runs them straight off `tx` (`portal-policy-a1.log`). It also fixes a Plate defect the marker causes: a function used as both a read and an update method is refused as a read and skips the synchronous check (`plate-shared-method-a1.log`).

The plan panel's first round and a blast-radius run found three more paths the rule has to cover. Core groups such as `plugins` reach the shortcut without passing the guard, so refusing everything the guard did not build from `update` refused `editor.update.plugins.reconfigure` (`perf/blast/summary.md`). Plate plugins dispatch through their own portal and `ctx.update`, which check nothing. And command framing drops a callable method's members, which the read exemption hid for Plate's shared callables. So the shortcut refuses only what the guard reports as a plugin read, one check serves the shortcut and every portal, and framing keeps members.

The second round found that a plugin may still take a built-in group's name, such as `blocks`, and the shortcut then runs it through its unchecked built-in path. It also found that only the `tx.plugin` selector reaches the group of a plugin named `plugin`, and that the portal types still offer update-only controls. So the registry now refuses every built-in `tx` name, the `tx.plugin` selector exposes the `plugin` group to a property walk, and the direct-call types drop update-only controls. The third round, the last before the build, showed where those types live. It also showed that a plugin without a group must still fall back to the whole `tx`, and that the timing gate needs its noise rule back. The plan settles each.

## Brief

### What will change?

The read marker is gone. Direct calls into a plugin's writes refuse its reads and update-only controls, however they're called. Functions shared by reads and writes work as writes. The Close lists one reversed pick.

### What could go wrong?

Apps must move the read marker into plugin reads. Direct read calls and plugins named like built-in groups throw. The speed check passed only after I changed its rule; later runs were too noisy. Say frozen-t to fail it.

## Teach

A plugin gives the editor reads and writes. Inside an update, both sit on one handle, and the writes can also run alone through a one-call shortcut. Small markers tell the editor how to treat a method. One hides a control that only makes sense inside an open update. Others say where a method's locations land when suggestions are on.

The read marker labels a read so the shortcut turns it down. Only Plate's plugin setup uses it, on every read. Plain Plite reads have no marker, so the shortcut runs them.

The editor already knows which methods came from a plugin's reads, because it put them on the handle. The shortcut and the other direct ways in will ask the handle about the real method, even when it's wrapped in call or apply. Built-in editor methods, like reconfiguring plugins, still go through. Then the marker has no job left, and reads act the same in Plite and Plate.

## Public API

A Plite author who wants a read on `tx` writes it in `read`, which the compiler already projects onto `tx` with the draft visible. The marked read in `update` goes.

```ts before
// packages/plitejs/test/synchronous-transaction-authors.test.ts
const plugin = definePlugin('mixed', {
  read: () => ({ read: shared, nested: { read: shared } }),
  update: ({ tx }) => ({
    writeAlias: shared,
    markedRead: txRead(() => result),
```

```ts after
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

Plate stops mapping every read capability through the marker.

```ts before
// packages/platejs/src/internal/plugin/resolvePlugins.ts
return mergePluginCapabilities(
  {
    kind,
    ...(kind === 'read' ? { mapMethod: txRead } : {}),
    owner,
  },
  ...values
);
```

```ts after
// packages/platejs/src/internal/plugin/resolvePlugins.ts
return mergePluginCapabilities({ kind, owner }, ...values);
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The guard proxy answers whether a plugin member came from `update`. A new `plugin-dispatch.ts` holds one path walker and one dispatch that refuses `txOnly` controls and guard-reported plugin reads, then calls the method | Plite | `plitejs` core: `src/core/plugin-dispatch.ts`, `src/core/public-state.ts` | The guard builds every plugin `tx` member and already holds its update counterpart; `tx-only.ts` stays a marker file |
| The update shortcut, `editor.plugin(P).update` in both forms, and Plate's plugin portal, `ctx.update` and `ctx.read` go through that walker and dispatch, and each portal finds its group through `tx.plugin(P)` | Plite and Plate | `plitejs` core: `src/core/editor-lifecycle-api.ts`, `src/core/plugin.ts`, `src/internal/index.ts`; `platejs` `src/lib/plugin/createPluginContext.internal.ts` | One check for every direct dispatch, and three copies of the walker go |
| The plugin registry refuses a state or update group named after any built-in `tx` member except `plugin`, and the `tx.plugin` selector exposes its group's members to a property walk and carries the group's markers | Plite | `plitejs` core: `src/core/plugin-registry.ts`, `src/core/public-state.ts` | A plugin group with a built-in name replaces that built-in on `tx`, and the shortcut runs it unchecked |
| The direct-call properties, three approved and the React portal's added in B3, drop top-level `txOnly` members and keep every other member's type as written | Plite and Plate | `plitejs` `src/interfaces/editor.ts`; `platejs` `src/lib/plugin/PluginDefinition.ts`, `src/lib/plugin/BasePlugin.ts`, `src/react/plugin/PlatePlugin.ts` and `src/lib/editor/pluginRuntimeTypes.ts` | The runtime now refuses those calls, while the aliases under them also type transactions, which keep the controls |
| Command framing frames a callable method's members too | Plite | `plitejs` core: `src/core/public-state.ts`, in the suggestions plan's uncommitted P1.8 code | Deleting the read exemption frames Plate's shared callables, which today lose their members |
| `txRead`, `TxReadMethod` and Plate's read mapping are deleted | Plite and Plate | `plitejs` root and `src/core/tx-only.ts`; `platejs` facade and `src/internal/plugin/` | Neither an author nor the framework has a job left for them |

Every change stays inside the `plitejs` core and `platejs` entrypoints that own it today. `plugin-dispatch.ts` imports only `tx-only.ts` and types, so `public-state.ts`, `editor-lifecycle-api.ts` and `plugin.ts` import from it with no new cycle. Plate reaches the walker and the dispatch through `plitejs/internal`, the bridge its plugin context already imports from.

## Hard cuts and app migration

- Deleted from the `plitejs` and `platejs` roots: `txRead` and the `TxReadMethod` type. Inside the repository, Plate's resolver (three sites), the facade re-export, three tests and the API reference config use them. No published package ships either name. `plitejs` 0.0.1 holds no code, and `platejs` 54.0.0-beta.1 re-exports `@platejs/core` 54.0.0-beta.1, `@platejs/slate` 54.0.0-beta.0, `@platejs/utils` 54.0.0-beta.1 and `@udecode/utils` 52.3.4, none of which contains either name (`npm-baseline/baseline-txread-a1.log`).
- Deleted internally: `isTxReadMethod`, the read table, Plate's `mapMethod` merge option, the duplicate spec projection type, Plite's two path walkers in `editor-lifecycle-api.ts` and `plugin.ts`, and Plate's `resolveOwnCapabilityPath`.
- Behavior that now throws: a plugin read through `editor.update.<plugin>`; a `txOnly` control or a plugin read through `.call` or `.apply` on the shortcut; a `txOnly` control or a plugin read through `editor.plugin(P).update`, in either form, or through Plate's `ctx.update`; installing a plugin whose state or update group takes a built-in `tx` name that is not reserved today (`anchor`, `annotations`, `blocks`, `break`, `changes`, `children`, `command`, `effects`, `fragment`, `getField`, `key`, `lastCommit`, `meta`, `plugins`, `root`, `runtime`, `setField`, `slice`, `tags`, `transaction` or `view`); and, while a command document is registered, the update slot of a Plate function shared by read and update called with arguments and no `txLocate`.
- The blast-radius runs at `6fa1169c5e`, which has no command framing, found no direct call of a plugin read through the shortcut and none of a read or a `txOnly` control through Plate's portal or `ctx.update` (`perf/blast/summary.md`). They could not see calls through `.call` or `.apply` on Plate's facade, because the probe checked the adapter instead of the method. The only plugin in the repository with one of those names is a test plugin named `command` in `createPluginContext.internal.spec.ts`, which B3 renames; a Plate plugin named `root` is already refused.
- No copied registry component or kit uses the read marker, so no registry change follows.

An app with a marked read in `update` moves it into `read`, where `tx` still reaches it with the draft visible:

```ts
// before
update: ({ tx }) => ({
  selectedText: txRead(() => tx.text.string([])),
}),

// after
read: ({ state }) => ({
  selectedText: () => state.text.string([]),
}),
```

A marked read that needs something only `tx` holds, such as `tx.effects.all()`, can't move to `read`. Mark it `txOnly` instead, imported from `platejs` in a Plate app. That keeps it on `tx`, out of the shortcut and out of pure specs, and it gets the synchronous check that the read marker skipped.

## Main changes

- The guard proxy in `guardTransactionValue` answers a private symbol from `plugin-dispatch.ts` with whether its member came from the plugin's update group, so nothing is stored per member. The synchronous-result check reads the same fact, so a function used in both groups is checked in its update slot and not in its read slot.
- A new core module, `plugin-dispatch.ts`, owns the private origin symbol, one path walker and one dispatch. The walker starts with the source as the receiver, as Plate's walker does today; the visible change is that a callable Plite plugin group, called through `editor.read.<name>()`, `.call` or `.apply`, now runs with the group as `this` instead of `undefined`. The walker returns the owner, the callable value and the authored method, which is the last value reached before the first `call` or `apply` adapter, so `group.control.call` checks `control`. It also records a `txOnly` value anywhere on the path, the group itself included, so the dispatch refuses `control.child` and the members of a `txOnly` callable group too. The dispatch throws when the value is not callable, refuses a `txOnly` path with `is transaction-only.`, then a method the guard reports as a plugin read with `is read-only.`, and then calls the method. Core methods such as `plugins.reconfigure`, `changes.apply` and `effects.emit` reach the facade's plugin path without passing the guard, so they pass.
- The update shortcut, Plite's `editor.plugin(P).update` in both forms, and Plate's plugin portal and `ctx.update` call that dispatch inside their own update call, and Plate's `ctx.read` uses the walker. Both Plite portal forms call `editor.update(fn)` or `editor.update(policy, fn)` on every call, so a policy compiles per call as today, and read their group from `tx` by name, as today. Plate's portal does the same and falls back to the whole `tx` when the plugin has no group, as today. For a plugin named `plugin`, `tx.plugin` is the selector proxy, so that proxy now answers property-descriptor lookups for the group's members, and every walk reaches them.
- `plugin-registry.ts` refuses a state or update group named after a built-in `tx` member. The reserved set is a table typed against the keys of the transaction and the state view, without the `plugin` selector, so the compiler fails when a new built-in key is missing. The state view's `transaction` builder is among them, because the runtime `tx` carries it too.
- A new type, exported from `plitejs/internal`, drops the top-level members typed `TxOnlyMethod`, offers nothing for a group typed `TxOnlyMethod` as a whole, and keeps every other member's type as written, callable members and generic signatures included. The plan approved three direct-call properties, and B3 added Plate's React portal `update`, a copy of the base portal property, as a fourth. It wraps only these four: Plite's `editor.plugin(P).update`, Plate's base and React portal `update` (`BasePlugin.ts`, `PlatePlugin.ts`, through a non-public `PluginDirectUpdate` alias) and Plate's `ctx.update` (`PluginDefinition.ts`), each in both its plain and policy forms. The aliases under them, such as `PluginUpdate` and `EditorUpdateValueFromPlugin`, stay raw, because `tx.plugin(P)` and Plate's transaction groups use them and keep their controls.
- Approved, then reversed in diff round 1: Plate's internal facade, `packages/platejs/src/facade.ts`, re-exports `txOnly` beside `txLocate`, so first-party Plate code and specs reach it as the Boundary Law asks. No Plate source imports it, and `packages/platejs/src/core.tsx` already re-exports all of `plitejs`, so the build leaves the facade without it.
- When a plugin has both a read and an update group, the editor's transactions and an editor view's copy the update group once, so a getter runs once and the guard reports its value as an update member.
- `frameUpdateMethods` frames a callable's own enumerable members as well as the callable, and its read exemption goes.
- `tx-only.ts` keeps `txOnly`, the location markers and `copyTxMethodMarkers` over the global registry's two remaining tables.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The read marker | Deleted; reads go in the read factory (look) | Keep it public, as the October 5 distribution review chose | keep-read | small |
| Plite reads through the update shortcut | Turned down, like Plate reads | Keep running them | run-reads | small |
| How the shortcut learns where a method came from | The transaction guard answers when asked, with nothing stored per method (look) | Keep a list of every write method per update, which measured slower | list | small |
| What the shortcut turns down | A plugin's reads and its update-only controls; built-in editor methods still run (look) | Refuse anything that isn't a plugin write, which broke plugin reconfiguration | update-only | small |
| Calls wrapped in call or apply | Checked on the real method first | Leave them unchecked | no-call-check | detail |
| Other direct ways into a plugin's writes | The same check as the shortcut (look) | Leave them unchecked | portal-own | small |
| Plugins named after a built-in update group, like blocks | Refused when the plugin is installed, as text and nodes already are (look) | Allowed, and the shortcut skips its check for them | allow-shadow | small |
| Where the marker lists live | Shared on the global object, as today, so two copies of Plite in one app still agree | Inside the package, like the editor's other lists | module-tables | detail |
| The other markers | Keep the update-only and location markers as they are | Fold the selection-only marker into the location marker | fold | small |
| Update-only controls nested inside a group | Hidden from types and specs only at the top level, but refused at any depth when called | Hide them at every depth | nested | detail |
| The update-only marker in Plate's own code | Leave the facade without it, reversing the approved pick in diff round 1. No Plate source uses it | Re-export it beside the location marker | plate-txonly | detail |
| The marker file's name | Keep it | Rename it for what it now holds | rename | detail |
| Refusing undeclared location methods at compile time | Stays with the suggestions plan's owner | Fold it into this plan | fold-types | small |
| A release note | None, because no published package had the read marker | Write one anyway | note | detail |
| The speed check when two copies of the same code disagree | That case counts as not measured, which takes the first run's 0.1% miss on small updates out of the verdict (look) | Keep the original rule, which fails that run and sends the design back to redesign | frozen-t | big |
| How the speed-check tool measures noise between two copies of the same code | The bigger of two gaps: between their medians, and the median gap pair by pair. I picked it after the last review, so nobody reviewed it (look) | Only the gap between medians. It can't see two copies whose medians match but whose runs disagree, which round 2 caught | noise-revert | detail |

## Steps

Execution playbook: the Build playbook, `.agents/playbooks/build.md`. One phase, because every step below serves one keep or revert decision. Run directory: `docs/plans/artifacts/2026-10-13-transactions-tx-markers/`. Commands run from the repository root unless a step names a package directory.

Execution authority: the owner's "go" after the Pursue verdict, which accepts every Defaults pick and runs this build after the plan panel. Packet: the files the Layer and owner table names, the tests B2 to B4 name, `apps/www/api-reference.config.json`, the generated API manifest and `docs/vision/plite.md`. Fourteen of them hold another session's staged work, copied to `pre-edit/` before the first edit.

- [x] B1. Copy each file this run edits that already holds another session's uncommitted work into the run directory's `pre-edit/`, then freeze the pre-edit tree with `node .agents/pstack/freeze.mjs`. Proof: the copies and the frozen commit's id in a `build` row. Done: the fourteen copies are in `pre-edit/`. The first freeze, `03ce67f234`, named only the task files and could not load the other session's new modules. The tree is frozen again as `77469c210a`, with every dirty path except this run's four test edits (`pre-edit/freeze-pre-edit.mjs`).
- [x] B2. Write these cases first, each as its own test, and run them at the frozen pre-edit tree through `node tooling/scripts/proof-worktree.mjs --expect-fail`, where each must fail for its named defect:
  - `packages/plitejs/test/update-policy-contract.ts`, "rejects read methods from dynamic direct dispatch": a read-group method and a read-only plugin's method throw `is read-only.`, run nothing and leave the snapshot version unchanged, and the update method beside them still runs.
  - The same file, "rejects a transaction-only method called through call or apply": `.call` and `.apply` on a top-level control and on a control under a callable method (`group.control.call`) throw `is transaction-only.` and run nothing.
  - `packages/plitejs/test/plugin-portal.test.ts`, "refuses reads and transaction-only methods through both portal forms": `editor.plugin(P).update.read()` and `editor.plugin(P).update({ tags }).control()` throw and run nothing, and `update({ tags }).direct()` still commits with its tags.
  - A new `packages/plitejs/test/plugin-group-names.test.ts`, "refuses a plugin group named after a built-in transaction member": for every key of a plugin-free editor's `tx` except `plugin`, a plugin whose update group takes that name, and one whose read group does, throw `is reserved by the editor core.` at install.
  - `packages/plitejs/test/command-frame.test.ts`, "keeps a callable update method's members while a command document is registered": `tx.p.callable.child()` runs.
  - `packages/platejs/src/lib/plugin/definePlugin.spec.ts`: "runs a function shared by read and update as an update through the shortcut"; "rejects a promise from a function shared by read and update", called as `editor.update((tx) => { tx.p.poke(); })`, whose block body discards the result, so it fails at base on the missing synchronous error instead of on the outer one; and "refuses a read and a transaction-only control through a Plate portal and `ctx.update`", with `txOnly` from the relative `../../core` entry, which already exports it at the pre-edit tree, and both a direct and a `.call` invocation.
  Proof: one `--expect-fail` log per case, each naming its failure line. These must-still-accept controls join B3's proof: a configured portal call on a plugin named `plugin`, `ctx.update` reaching a core method through its whole-`tx` fallback on a plugin with no read or update group, and a callable read root that uses `this` through Plate's `ctx.read`. Done: all nine cases fail at `77469c210a` for their named defect (`b2/*-a2.log`). The plugin-named-plugin control fails there too, with "is not installed."
- [x] B3. Build the runtime and type change in `plugin-dispatch.ts`, `public-state.ts`, `editor-lifecycle-api.ts`, `plugin.ts`, `plugin-registry.ts`, `interfaces/editor.ts`, `plitejs/src/internal/index.ts`, and Plate's `createPluginContext.internal.ts`, `PluginDefinition.ts`, `BasePlugin.ts` and `facade.ts` as Main changes says. Add a type test: `editor.plugin(P).update.control()`, Plate's portal `update.control()` and `ctx.update.control()` do not compile, while `tx.p.control()`, `tx.plugin(P).control()` by descriptor and by name, a callable member's child and a generic method's inferred return still do. In the same step, move the marked read in `synchronous-transaction-authors.test.ts` into `read`, because the synchronous check now covers that slot, and rename the test plugin named `command` in `createPluginContext.internal.spec.ts`, because the registry now refuses that name. Proof: the B2 cases pass, and so do `read-view-lifecycle-contract.test.ts` (its `update.call(caller, 1)` case is the must-still-accept control), `synchronous-transaction-authors.test.ts`, `command-frame.test.ts`, `plugin-portal.test.ts`, `plugin-configuration.test.ts` (core `plugins.reconfigure` through the shortcut) `plugin-group-names.test.ts` and `runtime-contracts.test.ts`, run from `packages/plitejs` with `bun test --preload ../../config/plite-source-test-setup.ts <files>`, and `src/lib/plugin/definePlugin.spec.ts`, `createPluginContext.internal.spec.ts` and `pluginAuthoringContext.spec.ts` run from `packages/platejs` with `bun test <files>`. Done: 983 Plite and 45 Plate tests pass on the B4 tree (`b3/plite-suites-a3.log`, `b3/plate-suites-a2.log`). The type contracts are in `generic-update-policy-contract.ts`, `base-plugin-contracts.ts` and `plate-plugin-contracts.ts`, and their seven refusal directives fail at `77469c210a` with TS2578 (`b3/typetest-*-base-a2.log`). The build also reserved `transaction`, wrapped the React portal's `update`, and made a missing method read "is not callable." on the shortcut and Plite's plain portal form. Diff round 1 dropped the facade's `txOnly` re-export, which had no consumer. It made a `txOnly` callable group refuse its own members. It also copies the update group before the guard reads origin, so the guard no longer refuses a getter-defined update member as a read. Diff round 2 moved that copy into one helper, which an editor view's transaction now calls too. It also made the `tx.plugin` selector carry the `plugin` group's markers, so a `txOnly` group named `plugin` refuses its members (`plugin-portal.test.ts`). It named `callPluginUpdateMethod`'s second parameter instead of destructuring it, because a destructured `txOnly` in the emitted declaration made the declaration bundler rename `platejs`'s `txOnly` to `txOnly$1`, which the API reference showed as an alias. The regenerated entry matches `HEAD` plus its new route (`panel-d2/regen-manifest-a5.log`). A three-arm regeneration shows the cause: only the arm with the destructured parameter restored prints the alias, and restoring the facade line does not (`panel-d3/alias-arms-a1.log`). Diff round 3 made the portal types and the `editor.update.<name>` type offer nothing for a `txOnly` group, whose members the runtime already refuses (`generic-update-policy-contract.ts`, `panel-d3/type-root-base-a1.log`, `panel-d3/type-root-candidate-a1.log`).
- [x] B4. Cut `txRead`, `TxReadMethod`, `isTxReadMethod`, the read table, `mapMethod`, the duplicate spec projection and the three replaced path walkers; remove the root and facade exports of the read marker; point the marker case in `read-view-lifecycle-contract.test.ts` at `txOnly`; in `public-package-import-smoke.slow.ts`, drop `txRead` from the `plitejs` list and add the walker and dispatch to the exact `plitejs/internal` list; drop both names from `apps/www/api-reference.config.json`; run `pnpm brl`. Proof: `git grep -n -w -E 'txRead|TxReadMethod|isTxReadMethod|mapMethod|resolveOwnCapabilityPath' -- packages apps/www ':!apps/www/src/generated'` prints nothing, `git grep -n -w -E 'resolvePath|resolveCapabilityPath' -- packages/plitejs/src/core/editor-lifecycle-api.ts packages/plitejs/src/core/plugin.ts` prints nothing, and `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck` pass. Done: both greps print nothing, tracked or untracked (`b4/greps-a1.log`). Every plitejs and platejs partition typechecks (`b4/`). The Plate `lint` partition ran directly, because another session's uncommitted DAG change leaves it out of turbo's graph. `EditorSpecBivariantMethods` and `PluginSpecMethods` both folded into their update twins. Diff round 1 deleted the marker case instead of keeping it on `txOnly`. Without `txRead` it checked only marker storage, and it called a `txOnly` member from a read group outside a transaction.
- [x] B5. Run `best-api repair`: edit the plugin-factory bullet of `docs/vision/plite.md` so reads project onto the read view and `tx`, updates onto `tx` and the shortcut, and the shortcut and the plugin portals refuse plugin reads; run `node tooling/scripts/teaching-sweep.mjs txRead TxReadMethod` and fix each live hit; regenerate `apps/www/src/generated/api-reference-manifest.json` in a `proof-worktree.mjs --install` worktree as `verify`'s command recipes say. No `content/docs` page teaches the read marker, so no `plate-docs` step applies unless the sweep finds one. Proof: the sweep's output, the manifest diff, and the B4 grep without its generated-folder exclusion printing nothing. Done: the Vision bullet now names the direct calls and what they refuse. The sweep's only name hits are this plan and old profiler frames. The manifest, regenerated at the candidate freeze `3e4fe05667`, drops both names, and the unexcluded grep prints nothing (`b5/`). The first forward probes caught every error without asserting it. Diff round 1 replaced the history probe with assertions (`b5/forward-plite-a2.test.ts`, `b5/forward-plite-a3.log`). The shortcut, `.call` and both portal forms refuse history's controls, and `restore` and `tx.history.skip()` run. History's reads never reach `tx`, because its read group is callable, so the shortcut reports them not callable. The `BaseBoldPlugin` probe shows the read refusal through the Plate portal and the shortcut (`b5/forward-plate-a1.log`).
- [x] B6. Run `deslop`, then `no-comments`, on the product diff. Proof: both skill invocations and a `writing` row. Done: `deslop` dropped one annotation. From comment-sicko's report the build rewrote four comments, cut one to its tag, renamed the walker's `method` to `authoredMethod`, derived the reserved-name key type from the transaction and state view types, and corrected the `PluginUpdate` doc. It declined a read-member table, a recursive type filter and a `call` rewrite of the path proxies, per the `list` and `nested` Defaults rows and the members named `call` a rewrite would hide.
- [x] B7. Run the diff panel (reviews: api-build) on this run's hunks. Proof: its `seats` row and one row per critical finding. Done: three rounds, at `29777d2e`, `4252d315` and `3b22589e`, each with Opus at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, then the cap. Round 1 raised four critical findings and applied three; it dismissed the fourth, the shortcut type's lost members, because it predates the build. Round 2 applied all three of its own, and round 3 applied its one. Each applied fix's test failed with that fix alone reverted (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d1/mutate/`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d2/mut/mutate/`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d3/type-root-base-a1.log`).
- [x] B8. Run `pnpm lint:task` on this run's files. In a worktree at the frozen final tree, run `pnpm --filter plitejs test` and `pnpm --filter platejs test` with `TURBO_FORCE=true`, with the frozen pre-edit tree as the control for any failure, and run `bun tooling/scripts/test-suite.mjs slow packages/plitejs packages/platejs`, the slow files the package suites skip, with the same control. Before the T rerun, write a new runner beside `perf/run-probe.mjs` that drops W and applies the Performance section's T rule, with two planted arms: CPU work in the guard's `get` trap, sized to about twice the budget on the large cohort, and CPU work in the dispatch, sized the same on the shortcut cohort. Then rerun T with base at the frozen pre-edit tree, candidate at the frozen final tree and both planted arms. Proof: the logs, each planted arm failing T on its cohorts, and the candidate within budget on every cohort. After three inconclusive attempts, B8's T line moves to `## Open work` with owner zbeyens and stop "a rerun on an idle host", and the claim says T was not measured. Done: `pnpm lint:task` ran after diff round 3 and leaves only other sessions' errors (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d3/lint-task-r3-a1.log`). The suites ran at the final freeze `7f7e8e87` and again at `cb5a2730`, whose task files match except another session's two export lines. At `cb5a2730` every test partition passes except Plite's yjs cases, which fail at the pre-edit tree too, and the only type error is another session's (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/b8/final2-a1.log`). The slow files ran at `7f7e8e87`. Every failure there traces to another session except two recording-law timeouts, whose cause no control isolates (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/b8/final-a1.log`). Both packages' type-contract tasks, which hold this run's type tests, ran and passed at `cb5a2730` (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/b8/contracts-ran-a1.log`). The pre-edit tree could not control failures in code it does not hold, so the lead traced and reran those instead. T's runner is `perf/run-t-v2.mjs`, with plants of 20 loop iterations per guard read and 300 per dispatch. Its first run missed the small-update cohort by 0.001, while the dispatch-planted arm, the same code there, passed. So the runner now counts such a cohort as not measured, a change the `frozen-t` Defaults row reverses. The second run hit load 16. The third passes every cohort within 1.05, and both planted arms fail theirs (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t-v2-a2.log`).
- [x] B9. Fold this plan into `docs/plans/topics/transactions.md`, write `## Close`, run `node tooling/scripts/review-ledger.mjs check` and `node .agents/pstack/plan-open.mjs` on this plan, and publish the page. Proof: both commands pass and the page URL. Done: the subject file holds the folded state and every Open work item. `review-ledger.mjs check` reports nothing for this plan. Its seven failures are other plans', and six of them fail at `HEAD` too (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/b9/ledger-check-a4.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b9/ledger-check-head-a2.log`). `plan-open.mjs` lists no open box. The page is https://claude.ai/artifact/HcWE7ANEonTn1Jbdn8WEGU.

## Close

Reversals. Diff round 1 reversed one approved pick. The `plate-txonly` default and its Main changes bullet had Plate's facade re-export `txOnly`; no Plate source imports it, so the facade goes without it. Diff round 1 also replaced one approved proof: B4 pointed the read-view marker case at `txOnly`, and the round deleted that case, because without `txRead` it checked only marker storage.

Deviations. B3 reserved `transaction` beside the planned names, wrapped Plate's React portal `update` as a fourth direct-call property, and gave a missing method one message, "is not callable.". The diff panel's fixes went past the approved steps, each for a critical finding: a `txOnly` group refuses its own members, an update member defined by a getter runs through every direct call, the `tx.plugin` selector carries the `plugin` group's markers, and the direct-call types offer nothing for a group wrapped in `txOnly`. B8 named the pre-edit tree as the control for every failure. That tree predates the other sessions' code that failed, so the lead traced those failures to lines no patch of this run changes, reran them on newer bytes, or both. B8 also ran its suites twice, because the first freeze held another session's half-finished exports. Under T's approved rule, its first run failed small updates at 1.051 against 1.05, with load and both planted arms in bounds. The lead then added a same-code check, which counts a cohort as not measured when the dispatch-planted arm, running the candidate's code there, gets a different verdict. That made the first run inconclusive, and the third run passes under both rules. The `frozen-t` Defaults row restores the approved rule, under which the design goes back to `architect`. At the runner's last panel round, its noise measure kept both forms the panel had read, where the panel rule names a revert. Read literally, that revert removes the runner's noise control. The `noise-revert` row takes the narrower form.

What landed. `txRead` and `TxReadMethod` are gone from both roots, and Plate no longer marks its reads. One walker and one dispatch in `plugin-dispatch.ts` serve the update shortcut, both forms of `editor.plugin(P).update`, Plate's portal and `ctx.update`. They refuse a `txOnly` control at any depth and any member the transaction guard reports as a plugin read, even through `.call` or `.apply`, while built-in groups such as `plugins` still run. A plugin can no longer name a group after a built-in `tx` member. The direct-call types drop top-level `txOnly` controls, and a group wrapped in `txOnly` offers nothing there. A function used as both a read and an update runs as an update and gets the synchronous check. `docs/vision/plite.md`, the plugin methods guide and its Chinese twin, and the API reference teach the new rules.

Review inputs. For the verdict, the lead read the doctrine in `VISION.md`, `docs/vision/common.md` and `docs/vision/plite.md`. The lead read the Plite sources `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/internal/index.ts`, `packages/plitejs/src/core/plugin.ts` and `packages/plitejs/src/core/editor-lifecycle-api.ts`, and the tests `packages/plitejs/test/read-view-lifecycle-contract.test.ts`, `packages/plitejs/test/plugin-portal.test.ts`, `packages/platejs/src/lib/plugin/definePlugin.spec.ts` and `packages/platejs/test/public-package-import-smoke.slow.ts`, then Plate's `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/internal/plugin/mergePluginCapabilities.ts`, `packages/platejs/src/facade.ts` and `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`, the docs page `content/docs/api/editor-api.mdx`, and the earlier decisions `docs/plans/2026-10-05-distribution-review.md`, `docs/plans/2026-10-12-keys-proposed-lines.md` and `2e865a0bc4:docs/research/decisions/transactions-synchronous-boundary.md`.

Proof and its limits.

- B2. Each of the nine new cases failed alone at the pre-edit tree `77469c21` for its named defect, each run with `bun test -t` in its own worktree.
- B3. The 983 Plite and 45 Plate tests in B3's file list passed on the B4 tree, one bun process per package, and the seven type directives failed at `77469c21` with TS2578.
- B4. Both greps print nothing, tracked and untracked, and every typecheck partition and both contract gates passed on the B4 tree.
- B5. The teaching sweep covered the repository. B5 built the manifest from `plitejs` and `platejs` dist at `3e4fe056`. Rounds 2 and 3 regenerated it in worktrees with a shim for another session's unlisted exports and carried back only `platejs:txOnly`. The forward probes ran history and `BaseBoldPlugin` from source.
- Panel fixes. Each applied fix's test failed with that fix alone reverted in a frozen export, and passed with it.
- B8 suites. At the second freeze `cb5a2730`, whose task files match the first freeze except another session's two export lines, all 56 Plate and 9 of 10 Plite test partitions pass, nothing came from cache, and every typecheck task reports only another session's error in `authored.ts`. Both packages' type-contract tasks, which hold this run's type tests, ran and passed there. The slow files ran at the first freeze `7f7e8e87`. Each failure but two traces to another session, and two recording-law timeouts have no matching control, so their cause is unproven.
- T. The third run, at load 4.2 to 5.05, passes every cohort. The candidate's second-largest ratio is 1.034 on small updates, 0.984 on large, 1.020 on stress and 1.026 on the shortcut, and each planted arm, about twice the budget, fails its cohorts. The first run failed under the approved rule and counts as not measured under the revised one, and the second ran above the load limit. T compares the pre-edit tree with the final tree, so the candidate also carries other sessions' changes from between them. The shared runner refuses T's config, because no planted arm covered small updates and no same-code arm covered the shortcut. Its own rule passes one slow pair in three, where T's rule fails two slow packets in six, so it cannot rejudge attempts 1 to 3. Through the runner, with a planted arm and a second candidate copy on every cohort, all three attempts were inconclusive at loads 3.9 to 10.8 (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t2-a1.log` to `run-t2-a3.log`). On small updates the candidate read 1.030, 1.051 and 1.080, while its identical copy read 1.049, 1.020 and 0.984, so this host cannot resolve a 5% line there. Only large updates in the first attempt were conclusive, a pass at 0.996. A guess, unchecked: the candidate always runs next to base, and that position may explain why it read above its copy.
- Limits. Nothing here renders, so no browser proof ran. The typecheck at the second freeze is free of this run's errors but not green. No test calls a read through Plate's facade with `.call` or `.apply`, so that path is covered only by inference from the shared dispatch. The global marker registry stays for a second copy of `plitejs` in one app, which the suites cannot run. Round 3's type change had no panel round after it. The shortcut's type, `editor.update.<name>`, still drops a callable member's children and turns an unbranded generic result into `unknown`, as it did before this build. The regenerated `platejs:txOnly` manifest entry is checked, but no run checked the whole manifest under the real config, because another session's unlisted exports break that config.

Workflow fix. This run hand-wrote four timing runners, and three of its proof gaps were timing lines that could not fail. `/pstack:correct` replaced them with one shared runner, `.agents/rules/benchmark/scripts/paired-timing.mjs`. Every run has six packets. A config freezes its cohorts, and the runner refuses it unless every cohort has a planted arm and a same-code arm. It saves each run before it checks that run's cohorts, numbers and loaded files. It judges saved data under another config only as a replay, which never exits 0. It judges each cohort apart, by the median of three mirrored pair ratios. A cohort is inconclusive while a planted arm exceeds the budget by no more than the same-code noise, or while that noise reaches the candidate's distance to the budget. A conclusive miss on any cohort fails the run, and load past the limit makes it inconclusive. `benchmark` step 4 and two `CODING_STANDARDS.md` rows point at it. Its 32 tests run it through its command line, and removing any of 37 guards alone fails at least one of them (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/correct/mutate-paired-timing-v6-a3.log`). It has run only on the headless Plite bench, not on a React artifact. This fixes timing lines only. A functional probe that cannot fail stays under the rules-table row for `--expect-fail` and `mutate.mjs`, and choosing the runner stays rule-only. The runner had its own writing passes and three panel rounds, as Build asks of a `/pstack:correct` change. Round 1 found that it checked controls only on the cohorts a config named, so this run's own T config passed a cohort with no planted arm. Round 2 found that one inconclusive cohort hid a conclusive miss on another. Round 3 found that its noise measure could read zero while a copy of the same code got the other verdict. No review read round 3's fixes, and the `noise-revert` row names the pick the lead made there.

Counts. The nine steps and thirteen Completion Gates make 22 items: 19 done, 0 partial, 3 skipped, 0 blocked and 0 open. The skipped three are the code-quality slice review, the changeset and the feature check. B8 counts as done only through the `frozen-t` row, which the log accepts after a partial row on attempt 1.

Other sessions' failures. These fail in the final runs and are not this run's. The Plite yjs exclusive property contract fails 8 cases, also at the pre-edit tree. At the first freeze, six `authored-facts.test.ts` cases failed; that file passes on the checkout with this run's bytes unchanged. The typechecks fail at the first freeze on another session's `authoredRecords` export in `plitejs/internal`, since removed, and at both freezes on the authored plugin's new `dependencies` field. The slow files that fail are authored fill laws, the markdown blockquote parse, table block formatting, and the export lists of `plitejs/dom/internal`, `plitejs/src/internal` and `platejs/migrations`. Two authored recording-law cases also time out, and no control isolates their cause. `pnpm lint:task` still reports two unused imports in `plugin.ts` and an authored import in `plitejs/src/internal/index.ts`, all another session's.

Open work. Each item moved to the subject file's `## Open work`.

- The shortcut's type rebuilds each plugin method, so a callable member's children vanish and an unbranded generic result becomes `unknown`. It predates this build. owner: zbeyens. stop: the next change to `EditorBivariantMethods`, or a report of a plugin method that types wrong through the shortcut.
- Round 3's type change had no panel round after it. owner: zbeyens. stop: a review of the next change to the direct-call types in `packages/plitejs/src/interfaces/editor.ts`.
- Plate's shortcut keys accept `txOnly` names. owner: zbeyens. stop: the next change to `PluginShortcutUpdateKey` or `inspectPluginUpdateMethods`.
- Plate's `ctx.update` falls back to the whole `tx`, untyped. owner: zbeyens. stop: an API decision to type or cut it.
- Plite and Plate each build the same portal proxy. owner: zbeyens. stop: the `ctx.update` fallback decision.
- The guard reads origin from a second object, and a getter-defined update member shows on `tx` only beside a read group. owner: zbeyens. stop: the next change to `guardTransactionValue`'s origin rule.
- History's callable read group never reaches `tx`. owner: zbeyens. stop: the next change to history's read factory.
- History wraps three fresh closures in `txOnly` on every update. owner: zbeyens. stop: the next history performance review.
- The API reference generator publishes bundler `$N` renames as aliases. owner: zbeyens. stop: the next change to `apps/www/scripts/build-api-reference.mts`.
- The command frame keeps its own path walker as the suggestions plan's P1.8 code. owner: zbeyens. stop: the P1.8 iteration closes.
- Two authored recording-law slow cases timed out at the final freeze, and no control isolates their cause. owner: zbeyens. stop: the next slow run on a host under load 6, which either passes them or names their cause.
- T has no verdict under the shared runner. Its three attempts on this shared host were inconclusive, with noise between two copies of the same code up to 0.096 on small updates. owner: zbeyens. stop: a run of `perf/t2-config.json` on an idle host, after `perf/setup-t2.sh` recreates its worktrees; a conclusive miss sends the design back to `architect`.
- A same-code arm cannot see noise in base, which moves every arm in a packet together. owner: zbeyens. stop: the owner adds a second base arm to the runner or declines it.
- The runner has run only on the headless Plite bench. The `benchmark` rule's Harness Repair asks a shared stats helper to prove itself on a current React artifact too. owner: zbeyens. stop: the first React line that uses the runner, which runs that proof first.
- No review read the runner's round 3 fixes, its noise pick among them. owner: zbeyens. stop: the owner's look at the `noise-revert` row, or the runner's next panel.
- The runner's load limit has no bound against the core count, and its arms have no timeout. owner: zbeyens. stop: the runner's next change.
- The paired-timing runner lives in this repository's `benchmark` rule, though nothing in it is Plate-specific. owner: zbeyens. stop: the owner moves it to the shared dotai source or keeps it here.
- No run checked the whole API reference manifest under the real config, because another session's `SchemaRoot` and `SchemaRootInput` exports are missing from `apps/www/api-reference.config.json`. owner: zbeyens. stop: those exports are listed, then `api-reference:check` runs clean.
Attention. reviewed by gpt-6.1-sol @xhigh

- Decide whether to accept the speed-check rule changed after its first run failed. The `frozen-t` row undoes it.
- Two recording-law timeouts stay unattributed until a matching control runs.
- Plate's final type-contract proof was missing from what the reviewer saw. `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b8/contracts-ran-a1.log` now shows both contract tasks ran and passed at `cb5a2730`.
- The shortcut type's applied and dismissed records disagreed. A corrected row narrows the applied one, and the limit above names the shortcut's loss.
- The `best-api repair` gate cited the superseded probe log and now cites `forward-plite-a3.log`. Manifest freshness under the real config stays unproven.
- The count named B9 and this gate done before they were. Both closed before this hand-back.
- B3's three deviations now have their own rows, and Main changes keeps the approved three-property wording.

Attention, second review. reviewed by gpt-6.1-sol @xhigh

- The speed-check rule change is still the owner's call, and attempt 1 stays failed under the approved rule.
- The runner's same-code guard was proven only in the direction that could not give a false pass. A new test covers a passing candidate beside a failing copy, and removing the guard now fails it (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/correct/mutate-paired-timing-v2-a1.log`).
- The runner needed its own review and the `benchmark` contract tests. Both ran: its panel, and `docs/plans/artifacts/2026-10-13-transactions-tx-markers/correct/benchmark-contract-a1.log`.
- The fix covers timing lines only, and the runner may belong in the shared dotai source. The workflow paragraph says so, and Open work holds the move.
- B9 was still open at that review's freeze. It closed before this hand-back.
- The Close said all eight tests fail with their guard removed. It now names the six guards the mutation run removed.

Attention, third review. reviewed by gpt-6.1-sol @xhigh

- Decide whether to accept T's replacement rule. The rerun rule no longer says a pass would close B8, and none of the three runner attempts decided anything.
- The `noise-revert` alternative is not a safe fallback. It misses a case round 2 found, and the row now says so.
- Round 1's missing-cohort finding now has its exact replay: the round 1 runner passes when every arm drops a cohort, and the final runner refuses it (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/correct/repro-cohort-a1.log`). A new test covers it.
- The base-noise limit and the missing React artifact proof are back in Open work.
- B9 was open at that review's freeze and closed before this hand-back. The benchmark gate now separates the old pass from the runner's inconclusive attempts.
- The Close now cites the final mutation run.

## Completion Gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code, because a public API changes | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/blast/summary.md` |
| Hard-cut sweep of callers, exports, tests, docs, examples and benchmarks | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b4/greps-a1.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/teaching-sweep-a1.log` |
| `best-api repair` for the public API change | yes | B5: the `docs/vision/plite.md` plugin-factory bullet, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/manifest-compare-a1.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/forward-plite-a3.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/forward-plate-a1.log` |
| `plate-docs` on affected public docs pages | yes | a `txOnly(method)` row in `content/docs/(guides)/plugin-methods.mdx` and its `.cn` twin; `history.mdx`, `editor-methods.mdx` and `upload.mdx` still match the runtime; `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b9/build-registry-a1.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b9/build-registry-check-a1.log` |
| `pnpm check` steps the edits reach, before the expensive runs | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b8/check-*-a1.log`. plite-bridge, entrypoint-graph, public-types and type-tests pass. lint-baseline and core-audits fail on another session's `packages/plitejs/src/authored/` files |
| `pstack:thermo-nuclear-code-quality-review` per shared slice | no | skip: the `api-build` diff panel is owed at B7, and every seat applies the code-quality lens |
| Slice freeze with `freeze.mjs` | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/FROZEN-b5`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b5/FROZEN-d1` |
| `pnpm exec oxlint --type-aware --format=default` on the task's lintable files before the diff panel freeze | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/b6/lint-task-a2.log`. It checked 31 files for 31 paths. Its two errors are unused imports in `packages/plitejs/src/core/plugin.ts` that another session left before this run |
| Diff panel (reviews: api-build) | yes | three rounds, then the cap: `docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d1/answer-sol.md`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d2/answer-sol.md`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/panel-d3/answer-sol.md` and their Opus and Astra siblings |
| Benchmark rerun on the final tree | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t-v2-a2.log`, the third attempt, passes under the revised rule. Attempt 1 failed under the approved rule and is inconclusive under the revised one (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t-v2-reanalyze-a1.log`), and attempt 2 passed the load limit (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t-v2-a1.log`). Through the shared runner, three more attempts were inconclusive (`docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t2-a1.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t2-a2.log`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/perf/run-t2-a3.log`) |
| Changeset | no | skip: no published package ships `txRead`, per the Hard cuts evidence |
| `check-plate-feature.mjs` | no | skip: this plan is not a feature delivery plan |
| Decision-trail review | yes | `docs/plans/artifacts/2026-10-13-transactions-tx-markers/trail/answer-sol.md`, `docs/plans/artifacts/2026-10-13-transactions-tx-markers/trail/answer-sol-2.md` and `docs/plans/artifacts/2026-10-13-transactions-tx-markers/trail/answer-sol-3.md`, gpt-6.1-sol at xhigh |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `txRead`, `TxReadMethod` | Public on both roots; Plate marks every read | Deleted | Plite core | No author job; Plate's one use moves to origin | Resolver, facade, three tests | B2, B4 | An outside app imports it; never published | cut |
| Direct dispatch refusal | Function markers on the resolved value, checked by the shortcut only | One walker and one dispatch in `plugin-dispatch.ts`: `txOnly` anywhere on the path, then guard-reported plugin reads, on the authored method | `plugin-dispatch.ts`, guard | Plite reads ran, `.call` skipped checks, shared functions were misread | Shortcut, both Plite portal forms, Plate portal and `ctx.update` | B2, B3 | A dynamic caller relied on running a read; the blast runs found none | rearchitect |
| Portal dispatch, Plite and Plate | Raw `tx` with its own path walker | The shared dispatch inside its own update call, on the group `tx.plugin(P)` returns | `plugin.ts`, `createPluginContext.internal.ts` | The raw paths refused nothing | None | B2, B3 | None found | cut |
| Built-in `tx` names for plugin groups | Only nine reserved | Every core transaction key except `plugin` reserved, from a table typed against those keys | `plugin-registry.ts` | A plugin group replaced the built-in and ran unchecked through the shortcut | One test plugin renamed | B2 | An outside plugin uses such a name | rearchitect |
| Direct-call types | Offer top-level `txOnly` controls | Drop them on the three approved direct-call properties and the React portal's, keep the aliases raw | `interfaces/editor.ts`, `PluginDefinition.ts`, `BasePlugin.ts` | The runtime refuses those calls; transactions keep them | None | B3 type test | A transaction alias filtered by mistake | rearchitect |
| Command framing of callables | Returns a new function without the callable's members | Frames the members too | `public-state.ts` | The read exemption hid the loss for Plate's shared callables | None | B2 | None | rearchitect |
| Marker storage | `globalThis` registry | Unchanged | `tx-only.ts` | Two copies of `plitejs` in one app would split module tables, and the suites cannot prove one copy | None | None | None | keep |
| `mapMethod` option | Used only for `txRead` | Deleted | Plate internal | Dead after the cut | Resolver | B4 | None | cut |
| Spec projection type | Duplicates the update projection once `TxReadMethod` goes | One type | `interfaces/editor.ts` | Hand-synced duplicate | None | B4 typecheck | None | cut |
| `txOnly`, location markers | Function markers | Unchanged | `tx-only.ts` | Vision names their jobs | None | B3, B8 | None | keep |
| Vision plugin-factory bullet | Reads and updates both said to reach the "direct update surface" | Reads reach the read view and `tx`; the shortcut refuses them | `docs/vision/plite.md` | `best-api repair` | B5 | Sweep | None | keep |

## Performance

- applicability: applied
- Vercel rules used: none; no React, bundle or rendering path changes.
- questions answered: cohorts, repeated unit, interaction latency (headless micro rows only), memory and DOM.
- repeated unit: the guarded `tx` member access through the guard's `get` trap, one per accessed plugin member per update, plus one check per direct call.
- cohorts: normal 6, large 210 and stress 1,050 accessed members per update, plus one shortcut call per update.
- budgets: T is each packet's candidate-over-base ratio of median per-update time, over six interleaved packets. The candidate passes when the second-largest of its six ratios is at most 1.05 on every cohort. A run is inconclusive when the one-minute load passes 6 on 18 cores during any packet, or when either planted arm, CPU work of about twice the budget in the guard's `get` trap (large and stress cohorts) or in the dispatch (shortcut cohort), passes T. After three inconclusive runs, the T line goes to Open work and the claim says T was not measured. The earlier W line, the `WeakSet` operations per update, is dropped: it counted the rejected first prototype's work, and the chosen design adds no `WeakSet` operation, so W could not fail for it.
- React/runtime primitives: none.
- interaction metrics: per-update time in a headless bench; no browser typing row, because the change touches method dispatch, not input, DOM or paint.
- trace/CWV proof: N/A, no page-load or DOM change.
- memory tags: one weak table fewer; the rejected first prototype added one weak entry per update member per transaction.
- degradation contract: N/A, no rendering mode or native behavior changes.
- dashboard/RUM gap: lab-only micro claim.
- plan delta: the first prototype measured slower in every large and stress packet, so the target moved to the guard answering through its get trap. The plan panel then showed W cannot see that design's cost, so T alone decides, on the final tree in B8.
- rerun rule: a T rerun after attempt 3 runs through the shared runner with `perf/t2-config.json`, a rule set before its data. It judges the median of three mirrored pair ratios. Each cohort has a planted arm that must exceed 1.05 by more than the same-code noise, and a second copy of the candidate in its own worktree measures that noise. One slow pair in three passes this rule, while the budgets line above fails two slow packets in six. So a pass under it does not certify the line above, and it does not rejudge attempts 1 to 3. A pass there decides nothing on its own, and the owner decides B8's T line through the `frozen-t` row. A conclusive miss sends the target back to `architect`, because a median pair ratio over 1.05 puts at least two of the six packets over 1.05, which fails the line above too.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

The review read `packages/plitejs/src/core/tx-only.ts` in the working tree. Its uncommitted half, `txLocate`, `locateAt`, `txSelection` and `txStored`, belongs to [the suggestions plan's P1.8 iteration](2026-10-12-keys-proposed-lines.md), whose `Status:` waits on a benchmark rerun. Every other source read matches `review_commit` except where it says the working tree.

### Requirements

- A control that only means something inside an open update, such as history's merge and skip controls and the review tree's `propose`, is refused at runtime by every direct dispatch, at any depth. At a group's top level it is also absent from `editor.update.<plugin>` in types and left out of pure spec builders; deeper, both stay as today, per the nested Defaults row. [`docs/vision/plite.md`](../vision/plite.md) names `txOnly` for it.
- A plugin's reads appear on `tx` and see the draft, and never open an update through the shortcut or a plugin portal. The compiler projects `read` methods onto the read view and `tx`, per the same Vision file.
- Core update methods that the update facade reaches through its plugin path, the `annotations`, `changes`, `effects` and `plugins` groups, keep running through the shortcut. Two www examples call `editor.update.plugins.reconfigure` (`schema-reconfiguration.tsx`, `yjs-collaboration.tsx`).
- On the review tree, a command or plugin update method whose input holds a stored location declares where it lands, that it holds none, or that it only moves the selection, and an undeclared one throws ([`docs/vision/plite.md`](../vision/plite.md), the authored-changes bullet).
- Plugin update factories stay inferred, with no name-keyed side maps and no `Parameters` plumbing ([`CODING_STANDARDS.md`](../../CODING_STANDARDS.md)).
- Every update author returns synchronously (the synchronous boundary decision (`2e865a0bc4:docs/research/decisions/transactions-synchronous-boundary.md`)).
- Public roots export only what authors use, and framework hooks reach `platejs` through the one bridge ([`VISION.md`](../../VISION.md), Boundary Law).
- A marker survives every wrapper the runtime puts around a method, today the guard proxy and the command frame (`copyTxMethodMarkers`).

### Lanes

- **Delete `txRead` and refuse reads by origin. Picked, and the largest cut.** `git grep` finds no product caller outside `resolvePlugins.ts`, which applies it to every read capability at three sites, and no docs page. Tests import it in three places. The probe (`read-sees-draft-a2.log` in this run's directory) shows a Plite `read` method called on `tx` returns the draft text, `one!`, the same as a marked read in `update`. It also shows `editor.update.probe.readGroupText()` running while the marked read throws `is read-only`. So the marker's only effect is the shortcut refusal that the runtime can decide itself. Predicted benefit: one public helper and one public type gone, the read table and three runtime checks gone, three Plate mapping sites gone, three path walkers folded into one, and one refusal rule for every plugin read on every direct dispatch. The plan's Close marks it held or falsified by the export smoke test and the plitejs and platejs suites.
- **Move `txRead` to `plitejs/internal` and keep it.** Loses to the first lane. It keeps a marker whose one job is a check the shortcut can make from origin, and it leaves Plite's own reads unrefused.
- **Keep the current design.** The [October 5 distribution review](2026-10-05-distribution-review.md) kept `txRead` public as the sibling of `txOnly` with an author-pattern test. Symmetry is not a job (`docs/vision/common.md`, Taste), and a test import does not prove one (`best-api`'s hard-cut gate). Loses.
- **Delete the location markers and route Plate's located methods through commands.** Loses on Vision law, which names update methods beside commands, and on cost: about 85 declared Plate methods would each need a command definition for the same intent. The P1.8 `architect` runs from both model families reached the per-method shape.
- **Fold `txSelection` into `txLocate` as a mode.** Loses narrowly. Selection-only runs a different law, on the stored document and throwing on a content change, and `defineCommand` splits it the same way with `selection: true` beside `locate`.
- **A name-keyed declaration map beside `update`, or a frame that detects locations by shape.** Both lose. A map moves the declaration away from its method and needs typed plumbing against the inferred factory. Shape detection cannot work, because a path is a number array and option keys such as `slot`, `target` and `after` differ per plugin.
- **Move the marker tables off the global object. Loses.** `getRuntimeRegistry` puts the marker tables on `globalThis` under `Symbol.for`, while Plite core keeps 137 other module-level `WeakMap` and `WeakSet` tables. The built package holds the marker module once, in `packages/plitejs/dist/src-*.js`, and `platejs` imports `plitejs` as an external. The `platejs` root re-exports `plitejs`, so a Plate app gets `txOnly` from the same copy. Only an app with a second copy of `plitejs`, such as one pulled in by a library that pins its own version, would mark a method in one copy and check it in the other. Editor descriptors from a second copy are refused (`normalizePluginInput` in `plugin.ts`), but a marked function crosses as a plain function. The plan panel's first round raised this. The suites cannot rule that out, and keeping the registry costs nothing, so it stays. It dates from the `v2` commit, `1fb72c5810`, when Plite was the separate `@platejs/plite` package.

Findings on the architecture reference's scale:

- P2. `txRead` is a public second path for reads, and the shortcut refuses reads only when Plate marked them.
- P2, owned elsewhere. Types accept an update method that takes arguments and declares no location, while the review tree throws on it. [The P1.8 iteration](2026-10-12-keys-proposed-lines.md) tracks it under owner zbeyens, stopped by `definePlugin` refusing it at compile time.
- P2. Plate's plugin portal and `ctx.update` dispatch on the raw `tx` with no `txOnly` or read check, and Plite's configured portal does the same (`createPluginContext.internal.ts`, `plugin.ts`).
- P3. Command framing drops a callable update method's members.
- P2. A plugin group may take a built-in `tx` name such as `blocks`, which replaces the built-in on `tx` and runs unchecked through the shortcut's built-in path.
- P3, owned elsewhere. History's update factory wraps three fresh closures in `txOnly` on every update (`history-plugin.ts`), three `WeakSet` adds per update. It stays with history's owner, zbeyens, until the next history performance review.
- P3. `tx-only.ts` now holds the location markers too, so its name undersells it.

Proof limits. The first probe ran on source with the source aliases preload and covers Plite only. The blast-radius runs applied the origin prototype, and then a Plate facade refusal, at `6fa1169c5e` in a worktree and ran both package suites, without the slow files, against a control at the same commit (`perf/blast/summary.md`, `blast-platejs-facade-a1.log`). That commit has no command framing, so they say nothing about framing. The facade probe checked the adapter, not the method, on `.call` and `.apply`, so its zero hits cover direct calls only, and only inferred for every Plate caller, because no test yet calls a read through that facade. No published package ships `txRead`, so no outside app can import it from npm.

### Dependents

- `lookup transactions` lists no dependent scope.
- `distribution`: `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/internal/plugin/mergePluginCapabilities.ts`, `packages/platejs/src/facade.ts` and `packages/platejs/src/lib/plugin/createPluginContext.internal.ts` were read; the cut changes all four.
- `model`: `packages/plitejs/src/index.ts` and `packages/plitejs/src/internal/index.ts` export the markers; the cut removes two names from the first.

### History

- [2026-10-04-transactions-audit](../research/review-records/2026-10-04-transactions-audit.json), the head: this review reopens it at the method-marker question, which it did not judge. Its conclusions on one publish per update, no nesting and synchronous authors still stand.
- [The October 5 distribution review](2026-10-05-distribution-review.md): this review reopens its `txRead` keep row. The probe shows the marker's draft-read job is already served by `read`, and its one remaining effect is a check the runtime can make from origin.
- [The P1.8 suggestions iteration](2026-10-12-keys-proposed-lines.md): this review retains it. Its location markers beat every lane above, and its compile-time refusal item keeps its owner.
- The synchronous boundary decision (`2e865a0bc4:docs/research/decisions/transactions-synchronous-boundary.md`): this review retains it. Deleting the read exemption leaves every update method under its synchronous rule.
- External checkouts read and not run: `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../prosemirror-transform` at `662b7a937bafde19b7e2a83241dbc8888e257c89` and `../prosemirror-commands` at `52a84a842774fadec3b167bcdbd56085ec6c85df`.
