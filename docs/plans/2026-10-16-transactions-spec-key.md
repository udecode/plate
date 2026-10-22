---
review_scopes: [transactions]
verdict: pursue
review_basis: [2026-10-15-transactions-placement-types]
work_kind: implementation
review_commit: 0a5cb4f411c51a22bd494a908915b9f073fc2734
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/test/native-transaction-spec-contract.test.ts, packages/plitejs/test/generic-command-contract.ts, packages/platejs/src/lib/editor/pluginRuntimeTypes.ts, packages/platejs/src/lib/plugins/input-rules/types.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, docs/plans/2026-10-15-plite-draft-keys.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Transactions: a spec's builder can read node keys

Status: executed: landed in your checkout's working tree; waiting on your commit
Playbook: plan

**Pursue. The transaction spec builder's type should include `key`, the one reader every other transaction already has.** The builder an author gets from `state.transaction(...)` and `state.transaction.extend(...)` is the same runtime object as an update's `tx`, and it already answers `tx.key(...)`. Since [the draft keys fix](2026-10-15-plite-draft-keys.md) landed, that answer is right for nodes the draft just wrote too, and acceptance keeps the draft's keys when it adopts the draft. Only the type still leaves `key` out, so the contract test that proves draft keys needs six calls the compiler rejects, and a command handler that wants a key inside its spec has to cast or reach back to the outer `state`. Plate's input rules and commands already see `tx.key`, typed as an update's `tx`, though they run on the same drafts, so hiding it here protects nothing. This review answers suggested task `t_2d8a3c2b`, which the draft keys fix left for its own design question.

The omission arrived on 2026-08-09, when the Vision said a pure spec builder may "consume existing keys but do not allocate them". The current law lets a pure builder give a fresh node a prepared key that only the draft resolves, and the draft keys fix made the runtime do it, so the reason for the omission is gone. `architect` ran three runners and a cross-judge. All three runners picked this change and kept the builder type separate, because a spec still has no `command`, no `plugins` group and no `txOnly` controls. The judge and the lead picked the Opus runner's design, with a negative type check grafted from the Astra runner and the history from the Sol runner.

The plan panel's one round, with Opus, Astra and Sol seats, found no critical issue. Its challenge delta is `improved`. The plan drops the doc comment graft, because the shared comment feeds other API reference entries and would state the adoption promise without its condition. It drops the `tx.command` negative check, because the existing `txOnly` check already fails on the only change that brings `command` back. The draft keys case reads its nodes through `nodes.get`'s typed form instead of a guard. The risk now says replay is unverified, and Verify adds the API reference check and a Plate changeset.

The diff panel's one round, with the same seats, found no critical issue. Astra and Sol found nothing. Opus showed that the inherited comment's "live node" overstates a prepared key in a draft, and that the builder can carry its own comment without touching the shared one. So the type keeps `key` in its omitted members and adds it back on the builder with a comment that says a prepared key goes live when the editor adopts the draft.

## Brief

### What will change?

Code that builds a change ahead of time can now ask for a block's ID without a type error. The fix sits uncommitted in your checkout for you to commit.

### What could go wrong?

A change the editor replays may not keep the IDs it handed out, and more code can now read them. Another task checks that. The full reference page check never ran; the Close says what did.

## Teach

Every block in the editor has an ID, called its key. Commands often build a change ahead of time, as a spec, and the editor applies it later. While building, code works on a draft copy and can ask the draft for any block's key.

The editor has always answered that question in a spec, but the spec's type left the key reader out. Before the draft keys fix that made some sense, because asking for the key of a block the draft had just changed threw. That fix made the answer right, so only the type still refused it.

Now the type includes the key reader, like every other kind of change. Nothing changes at runtime.

## Public API

A spec builder reads a key the same way an update does. Today the compiler rejects both `tx.key` calls with TS2339. Once `key` is typed, it also rejects passing a plain `nodes.get` entry's node, which can be the editor itself, so the case reads each node through `nodes.get`'s typed form.

```ts before
// packages/plitejs/test/native-transaction-spec-contract.test.ts
const spec = editor.read((state) =>
  state.transaction((tx) => {
    tx.text.insert('!');
    tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] });
    const [quote] = tx.nodes.get([0])!;
    const [paragraph] = tx.nodes.get([0, 0])!;

    drafted = [tx.key(quote), tx.key(paragraph)];
  })
);
```

```ts after
// packages/plitejs/test/native-transaction-spec-contract.test.ts
const spec = editor.read((state) =>
  state.transaction((tx) => {
    tx.text.insert('!');
    tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] });
    const [quote] = tx.nodes.get([0], { type: 'quote' })!;
    const [paragraph] = tx.nodes.get([0, 0], { type: 'paragraph' })!;

    drafted = [tx.key(quote), tx.key(paragraph)];
  })
);
```

The type adds `key` back with its own doc comment, which says when a prepared key becomes live, and keeps `plugins` out.

```ts before
// packages/plitejs/src/interfaces/editor.ts
> = Omit<EditorCoreUpdateTransaction<V, EditorSelection>, 'plugins' | 'key'> &
  Readonly<{
    plugin: EditorTransactionPluginPortal<
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
> = Omit<EditorCoreUpdateTransaction<V, EditorSelection>, 'plugins' | 'key'> &
  Readonly<{
    /**
     * Return the key for a node or location in this draft. A node the draft
     * created carries a prepared key, which becomes its live key when the
     * editor adopts this draft.
     */
    key: EditorKeyApi;
    plugin: EditorTransactionPluginPortal<
```

## What other editors do

This review read the Lexical (`dd5c41b13`), Slate (`945a484df`), ProseMirror (`prosemirror-state` `ffad5d9`, `prosemirror-transform` `662b7a9`) and Tiptap (`91c51be53`) checkouts beside the repository and ran none of them. None has a pure transaction builder that hands out node identity, because none but Lexical has a live node identity at all.

| Editor | Node identity | Built ahead of time, then applied |
| --- | --- | --- |
| Lexical | `getKey()` on every node, stable across the writable copies an update makes (`packages/lexical/src/LexicalNode.ts:1008`) | No; an update runs against the live state |
| ProseMirror | None; positions, remapped through `tr.mapping` | A `Transaction` is a `Transform` built off a state and dispatched later (`prosemirror-state` `src/transaction.ts:42`) |
| Slate | None; paths | No |
| Tiptap | None; ProseMirror positions | Commands build on ProseMirror's `Transaction` |
| Plite | `NodeKey` through `editor.key`, `state.key` and an update's `tx.key` | A `TransactionSpec`, whose builder answers `tx.key` at runtime but leaves it out of its type |

Lexical is the closest model. Its key reader works wherever its nodes are reachable, inside an update's writable copies too.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `EditorTransactionSpecBuilder` types `key`, with its own doc comment | Plite | `plitejs`: `src/interfaces/editor.ts` | The spec builder is Plite's type, and its runtime is Plite's update view |
| Plate's plugin `transaction` builder gains `key` through derivation, with no edit | Plate | `platejs`: `src/lib/editor/pluginRuntimeTypes.ts` | `PluginEditorTransactionBuilder` derives from the Plite type |

## Main changes

None at runtime. The change is to the type only.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A spec builder reading block IDs | Allowed in the type, as it already is at runtime | Keep it out of the type | keep hidden | small |
| IDs a spec hands out that a replay might change | Left to the replay task, which owns that path (look) | Hold this change until it lands; qualify the Vision's promise here | wait for replay; qualify law | small |
| The editor's read group reading block IDs | Left to its own task, since the editor already has one direct reader | Add it to the read group here | read key | detail |
| The key reader's doc comment | The builder's own comment, saying a new block's ID goes live when the editor adopts the draft | Keep the shared comment, which says live block | shared comment | detail |
| The reference page check | Compare only this type's entry with a fresh build, since a full check here needs every package built and other work's entries rebuilt (look) | Run the full check once those entries are rebuilt | full reference check | small |
| Plate's release note | Its own line for the plugin builder | Only the Plite note | plite note only | detail |
| Where this close is shown | Its own page at https://claude.ai/artifact/JJk1JtaeSi3fA966Jb6Jc3, because the subject's page at https://claude.ai/artifact/1gmj9dkmNiLTMRn1FPiHkR no longer opens, and the reset plan, still at work, leads the subject's newer page | Show it only on the subject's page | subject page only | detail |

## Evidence

Model: claude-opus-5-5 @high.

### Requirements

- `NodeKey` is the sole live descendant identity, read through `editor.key`, coherent `state.key` or active `tx.key` (Vision, `docs/vision/plite.md` NodeKey line).
- A pure spec builder may consume existing keys and give a fresh node a spec-local prepared key that only the draft resolves, continuation preserves and acceptance adopts (same line).
- A control that only means something inside an open update is wrapped with `txOnly` and left out of pure spec builders (transactions subject, tx-markers plan).
- Exported types promise exactly what the runtime accepts (`.agents/skills/best-api/SKILL.md` review questions).
- The owner's card asks whether the spec builder's public type exposes `key`, which task_5699b1c2 made correct at runtime.

### Lanes

- **Keep the type as it is.** The control that adds nothing. It loses because the type hides a reader the runtime answers, so a spec author casts or reaches back to the outer `state`, and the draft keys contract needs six calls the compiler rejects. Plate's commands and input rules already see `tx.key` on the same drafts, so hiding it protects nothing.
- **Type `key` on the builder** (picked, all three runners). One type edit and a doc comment, no runtime work, and each member the builder still leaves out matches a runtime refusal: `plugins` throws at finalize, `command` exists only in an update, and `txOnly` controls are stripped in a spec.
- **Strongest deletion: type spec builders as `EditorUpdateTransaction`.** It deletes a public type name but promises `command`, plugin reconfiguration and `txOnly` controls that a spec withholds or refuses.
- **Strip `key` at runtime in a spec.** It breaks Plate's Details, List, code block, AI chat, Table and Upload commands that call `tx.key` on spec drafts, and undoes the draft keys fix.
- **A separate draft-key type.** The Vision forbids a second identity namespace.

The caller census is a `git grep` of `tx.key(` over `packages/platejs/src` and of `EditorTransactionSpecBuilder` over the repository at the base tree. The spike and probes ran on Plite and Plate source in detached worktrees at the base.

Proof limits. The change also types `tx.key` on a view's spec builder, which `withViewSpecTransaction` builds and whose key reader resolves in the view's root (`packages/plitejs/src/editor-runtime-view.ts`). The draft keys fix proved draft keys on the primary root only. The diff panel's Sol seat reports scratch probes that kept draft keys through extension and acceptance on base, main-view and named-root builders; the lead did not rerun them. One path never keeps keys a spec reads: the internal `initialize` builder of `createEditor`, whose result the editor clones and re-keys (`adoptEditorSchemaDocument` in `packages/plitejs/src/core/public-state.ts`). Only `plitejs/internal` exports it, and Plate's one caller ignores its `tx`. The Vision says acceptance adopts a prepared key as that exact key, but the runtime does so only when it adopts the draft. A spec that falls back to replay re-derives keys, and whether a supported path reaches that fallback is unverified, because a spec built before another commit is refused, not replayed. Suggested task `t_3041aa10` owns both questions.

### Probes

- Dropping `key` from the omitted members at the base keeps the gated contracts at zero errors, clears the six `key` errors in the draft keys contract, adds two errors on its line 159, and leaves the platejs typecheck at 718 errors, compared by count (`spike/spike-drop-key-a1.log` in the run directory).
- Those two errors come from the test itself: `tx.nodes.get` returns a `Node`, which includes the editor, and `key(node)` takes a `Descendant`. The same calls fail on a live update's `tx` at the base (`probes/live-key-node-base-a1.log`).
- The new case in `generic-command-contract.ts` fails the gated typecheck on base source with only the test applied, on `Property 'key' does not exist`, and its two negative checks hold there (`proof/generic-types-red-a1.log`).
- A Plate plugin command's `state.transaction` builder rejects `tx.key` at the base too (`probes/plate-spec-key-base-a2.log`).

### Dependents

- The review ledger lists no dependent scope for `transactions`. Plate's `PluginEditorTransactionBuilder` derives from the changed type and is named in Layer and owner.

### Prior work

- This review retains 2026-10-15-transactions-placement-types, the scope's head, because it settles the block insert's placement and result, which this type change does not touch. Its page is the [placement review](2026-10-15-transactions-placement-types.md).
- The [draft keys fix](2026-10-15-plite-draft-keys.md) made `tx.key` correct in spec drafts and deferred the type to this task in its Defaults row "Draft key in the public types".
- Suggested task `t_3041aa10` owns whether a replayed spec keeps the keys its draft handed out.

## Open work

- The Vision's promise that acceptance adopts a prepared key holds only when the draft is adopted, and replay may re-derive keys; this change lets every Plite spec author read those keys. Keys read inside `createEditor`'s internal `initialize` builder never survive, because the editor re-keys that document; only `plitejs/internal` exports it, and Plate's one caller ignores its `tx`. owner: the owner, through suggested task `t_3041aa10`, which this run folds the finding into. stop: that task lands or is dropped.
- Plate types the `tx` of its commands and input rules as an update transaction, though they run on spec drafts, so those types promise `command` and `txOnly` controls the runtime withholds. owner: the owner, through suggested task `t_b75959c5`. stop: that task lands or is dropped.
- `replaceBlocksAtSite` in `packages/plitejs/src/core/public-state.ts` receives the spec builder but reads keys through `getStateView(editor).key`, which `tx.key` can now replace. Suggested task `t_b78aada2`, started in another session, is moving that paste resolver code. owner: the owner. stop: `t_b78aada2` lands, then the next change to `replaceBlocksAtSite`.
- Six `editor.read.key(...)` calls in Plite's contract tests fail the test typecheck, because `editor.read` leaves out `key` and `editor.key` is the direct reader. owner: the owner, through suggested task `t_d4703034`. stop: that task lands or is dropped.

## Close

The build made one deviation from the approved plan. The Plite step said to drop `key` from the spec builder's omitted members. After the diff panel, the type keeps `key` in that list and adds it back on the builder with its own doc comment. The shared comment calls the result a live node, which a prepared key in a draft is not until the editor adopts the draft. The runtime is the same either way.

What landed, as a patch on the checkout's working tree that the owner commits:

- `EditorTransactionSpecBuilder` in `packages/plitejs/src/interfaces/editor.ts` types `key` as `EditorKeyApi`, so `tx.key` type-checks in `state.transaction` and `state.transaction.extend`, and Plate's `PluginEditorTransactionBuilder` gets it through the same type.
- `packages/plitejs/test/generic-command-contract.ts` holds a gated case: `tx.key([0])` types as `NodeKey | null`, and `tx.plugins` stays a type error.
- `packages/plitejs/test/native-transaction-spec-contract.test.ts` reads its drafted nodes through `nodes.get`'s typed form.
- A bullet in the unreleased `plitejs` draft keys changeset, a new `platejs` changeset, and the one regenerated `apps/www` API reference entry.

Proof, each on the final bytes in this worktree:

- The gated generic-types typecheck fails at the base with only the new case applied, on `Property 'key' does not exist`, and passes on the change. Scope: `check:core`'s `test/tsconfig.generic-types.json`.
- The native transaction spec contract passes 9 of 9 under `bun test`.
- A Plate plugin's `state.transaction` builder rejects `tx.key` at the base and accepts it after. `pnpm --filter platejs typecheck` exits 0 on the base and the final tree.
- The plitejs test config, a diagnostic no gate runs, goes from 1237 errors to 1231. The six `key` errors leave, and no new error appears.
- `pnpm lint:task` on the three code files and two changesets reports no warnings or errors.

Where the proof stops:

- The full `pnpm --filter www api-reference:check` did not run. Only this type's entry was compared byte for byte with a fresh regeneration, which the Defaults row "The reference page check" accepts; "full reference check" reopens it.
- `pnpm --filter plitejs typecheck` fails two TS2349 errors in `test/react/create-editor-options.test.tsx`, the same at the base. Suggested task `t_54844d26` owns them.
- Whether a replayed spec keeps the keys its draft handed out, and draft keys in a view's own root, are unproven here. Keys read in `createEditor`'s internal `initialize` builder are known not to survive, since the editor re-keys that document, but nothing public reaches it. Suggested task `t_3041aa10` owns all three.
- The manifest regeneration copied two files from the main checkout to get past a declaration build error. Those copies held suggested task `t_1436558e`'s fix plus other uncommitted edits, and the run did not freeze them; their hashes are in `docs/plans/artifacts/2026-10-16-transactions-spec-key/trail/borrowed-inputs.log`. Neither file holds this type's text, and the change takes only this type's signature line from that build.

Attention, reviewed by gpt-6.1-sol on Codex:

- Warning: the manifest regeneration borrowed two uncommitted files from the main checkout without freezing them. The proof limits above now name what they held and their hashes.
- Warning: the internal `initialize` builder's known key loss appeared only in Evidence. The proof limits and the `t_3041aa10` item in Open work now name it.
- Nit: the Close said what landed before the landing. The landing ran right after the review.
- Nit: the plan file was written before its path was logged on the ledger. A log row records it.

All 8 of the plan's steps are done. Two of the done steps closed under the accepted narrower reference check. Open work lists four items, each owned by a suggested task.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `VISION.md`
- `docs/vision/common.md`
- `docs/vision/plite.md`
- `packages/plitejs/src/core/public-state.ts`
- `packages/plitejs/src/core/command-frame.ts`
- `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts`
- `packages/platejs/src/lib/plugins/input-rules/types.ts`
- `packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts`
- `docs/plans/2026-10-15-plite-draft-keys.md`

## Steps

- [x] Run `architect` with three runners and a cross-judge, and synthesize. Proof: `docs/plans/artifacts/2026-10-16-transactions-spec-key/architect/synthesis.md`, the runner answers and `judge/` beside it.
- [x] Panel on the plan (reviews: `api-plan`). Proof: the `panel` rows and `docs/plans/artifacts/2026-10-16-transactions-spec-key/panel-plan-r1/`. One round, no critical finding.
- [x] Plite: drop `key` from the spec builder's omitted members. Add a case to `packages/plitejs/test/generic-command-contract.ts`, which `check:core` compiles through `test/tsconfig.generic-types.json`: inside a command's `state.transaction`, `tx.key([0])` types as `NodeKey | null`, and `tx.plugins` is still a type error. In `packages/plitejs/test/native-transaction-spec-contract.test.ts`, read the drafted nodes through `nodes.get`'s typed form so the node overload type-checks. Proof: the generic-types typecheck fails at the base with only the new case applied, on `Property 'key' does not exist`, and passes on the change; the native contract file passes under `bun test`; as a diagnostic outside any gate, the plitejs test config loses its six `key` errors and gains none, compared line by line.
  Done, with a deviation: the type keeps `key` omitted and adds it back on the builder with its own doc comment, after the diff panel. Red at base: `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/generic-types-red-a2.log`. Green: `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/generic-types-green-a2.log`, `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/native-contract-green-a2.log`. Diagnostic: `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/plitejs-test-config-final-a2.log` against `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/plitejs-test-config-base-a1.log`.
- [x] Plate: a type probe calls `tx.key` inside a Plate plugin's `state.transaction` builder, failing at the base and passing on the change; the platejs typecheck reports the same errors as at the base. Proof: the probe logs and the typecheck logs in the run directory.
  Done: `docs/plans/artifacts/2026-10-16-transactions-spec-key/probes/plate-spec-key-base-a2.log` red, `docs/plans/artifacts/2026-10-16-transactions-spec-key/probes/plate-spec-key-green-a2.log` green, `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/package-typechecks-final-a2.log` against `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/package-typechecks-base-a1.log`.
- [x] Teach it: add the type change to the unreleased `plitejs` draft keys changeset as a capability, add a `platejs` changeset for the plugin builder, and regenerate the API reference manifest, keeping only this change's hunks. Proof: the diff and `pnpm --filter www api-reference:check`.
  Done, accepted under the Defaults row "The reference page check": `.changeset/plite-draft-keys.md`, `.changeset/plate-spec-key-type.md`, and the manifest entry taken from `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/api-reference-regen-a3.log`; the full `api-reference:check` did not run.
- [x] Writing passes, then the panel on the diff (reviews: `api-build`). Proof: the `writing` and `panel` rows.
  Done: one diff round, no critical finding, `docs/plans/artifacts/2026-10-16-transactions-spec-key/panel-diff-r1/`; writing passes in `docs/plans/artifacts/2026-10-16-transactions-spec-key/comment-sicko/reply.md` and `docs/plans/artifacts/2026-10-16-transactions-spec-key/comment-sicko/reply-r2.md`.
- [x] Verify: `pnpm --filter plitejs typecheck`, `check:core`'s generic-types config, `pnpm --filter platejs typecheck`, `pnpm --filter www api-reference:check`, and `pnpm lint:task` on the task's paths, each compared with the base. Proof: the `verify` rows and their logs.
  Done, accepted for the reference check as above: `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/package-typechecks-final-a2.log`, `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/generic-types-green-a2.log`, `docs/plans/artifacts/2026-10-16-transactions-spec-key/proof/lint-task-a2.log`. The plitejs typecheck fails two errors in a file this task does not touch, the same at base.
- [x] Land the patch on the checkout and log `landed`. Proof: `docs/plans/artifacts/chips/t_2d8a3c2b.patch` and the ledger row.
