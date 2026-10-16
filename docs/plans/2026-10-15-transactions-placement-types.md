---
review_scopes: [transactions]
verdict: pursue
review_basis: [2026-10-15-transactions-reset-default]
work_kind: implementation
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/insert-limit.ts, packages/plitejs/src/transforms-node/insert-nodes.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/test/transforms-contract.ts, packages/platejs/src/lib/editor/pluginRuntimeTypes.ts, packages/platejs/src/internal/plugin/blockInsertion.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/media/lib/BaseMediaPlugin.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.ts, packages/platejs/src/features/table/lib/types.ts, packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts, content/docs/plite/api/transforms.mdx, content/docs/api/editor-transforms.mdx, content/docs/api/core.mdx, docs/plans/2026-10-15-plite-insert-fit.md]
review_upstreams: ['../slate@945a484df2497e4c448b33f417b0de2a49840032', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Transactions: one placement per block insert, and the keys of what landed

Status: executed: landed in the checkout's working tree, waiting for the owner's commit to next
Playbook: plan

**Pursue. `tx.blocks.insert` should take exactly one placement by type and return the keys of the blocks that landed, and `nodes.block` keeps its root-local entry.** Today the insert's options type lets a caller pass `after`, `before` and `at` together and throws at runtime, and `replaceEmpty` type-checks beside `before` and `at`, where the insert ignores it. The insert returns the first inserted path, which is local to whichever root the blocks landed in, so code in another root that uses it edits the wrong block. None of the twelve Plate call sites, in ten functions, reads the returned path. Most only test it for truthiness, and some then reach the new block through the node they passed. That fallback is broken too. When the editor's length limit trims a batch, every text block lands as a copy, so no passed node identifies anything, and a live node inserted from another root lands with its source's key. So the insert itself should name what landed. A `NodeKey` is the Vision's one live identity, it already resolves in any root, and it stays valid after later edits. `nodes.block` returns an entry whose path is local to the target's root, like every other entry read; a caller in another root acts through the entry's key. This review answers suggested task `t_c1edeaed`, which the [insert-fit plan](2026-10-15-plite-insert-fit.md)'s panels and its round 3 comment review raised.

`architect` ran three runners and a cross-judge. All agreed on the exclusive placement type and on keeping the read's entry. They split on the result: a yes-or-no answer with the limiter repaired to keep identity, the inserted live blocks, or the inserted keys. The judge and the lead picked keys. The judge also found that inserting a live node from another root gives the copy a duplicate key. That is an older bug in every insert, and two plan panel rounds showed its fix reaches key seeding and lazily prepared keys, so it moves to its own task. Plan v1, which returned a yes-or-no answer, is `plan-v1.md` in the run directory.

## Brief

### What will change?

Code that inserts a block can name only one place for it. The insert hands back the IDs of the blocks that landed, which work in any part of the document, even after a length limit cut some.

### What could go wrong?

Code that read the old position must switch to the returned IDs. Copying in a block that lives in another root still reuses its ID, so that ID can reach the original. Passing two places from plain JavaScript still errors.

## Teach

A block insert puts new blocks after a block you name, before one, or at a numbered spot. A document can have several roots, such as a header and a body, and a numbered spot only means something in one root. An editor can also cap the length, and then an insert keeps only what fits.

Today the insert accepts all three places at once and only complains when it runs. It hands back the numbered spot of the first new block, which points at the wrong block from another root. Callers look up the block they passed instead, but a length cap copies the blocks it keeps, so that finds nothing.

After this change the types allow one place, and the insert hands back an ID for each block that landed. An ID finds its block in any root and survives later edits. A block copied in from another root still reuses its source's ID for now.

## Public API

A block insert takes one placement, and `replaceEmpty` only beside `after` or the selection default. Plate narrows `after` to one block through the type parameter.

```ts before
// packages/plitejs/src/interfaces/editor.ts
export type BlockInsertOptions = {
  after?: NodeSelectionTarget;
  at?: Path;
  before?: NodeTarget;
  replaceEmpty?: boolean;
  select?: boolean;
  voids?: boolean;
};
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
export type BlockInsertOptions<
  TAfter extends NodeSelectionTarget = NodeSelectionTarget,
> = (
  | {
      after?: TAfter;
      at?: never;
      before?: never;
      /**
       * Replace the empty editable text block the blocks land after, instead
       * of keeping it.
       */
      replaceEmpty?: boolean;
    }
  | { after?: never; at?: never; before: NodeTarget; replaceEmpty?: never }
  | {
      after?: never;
      /** Insert at this exact path, a slot among its parent's children. */
      at: Path;
      before?: never;
      replaceEmpty?: never;
    }
) & { select?: boolean; voids?: boolean };
```

The insert returns the keys of the top-level blocks that landed, in order, or `undefined` when nothing landed.

```ts before
// packages/plitejs/test/transforms-contract.ts
const path = editor.update.blocks.insert(paragraph('inserted'), {
  replaceEmpty: true,
  select: true,
});

assert.deepEqual(path, [1]);
```

```ts after
// packages/plitejs/test/transforms-contract.ts
const inserted = editor.update.blocks.insert(paragraph('inserted'), {
  replaceEmpty: true,
  select: true,
});

assert.deepEqual(inserted, [editor.key([1])]);
```

A Plate feature acts on the returned key instead of looking up the node it passed.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
if (!tx.blocks.insert(element, options)) return false;

const entry = tx.nodes.get(element, { type: plugin });

if (!entry) return true;

const key = tx.key(entry[0]);
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
const inserted = tx.blocks.insert(element, options);

if (!inserted) return false;

const [key] = inserted;
```

Plate's option types derive from Plite's without `Omit`, which collapsed the union.

```ts before
// packages/platejs/src/lib/editor/pluginRuntimeTypes.ts
export type BlockInsertOptions = Omit<PliteBlockInsertOptions, 'after'> & {
  after?: NodeTarget;
};

export type BlockUpsertOptions = Omit<
  BlockInsertOptions,
  'at' | 'replaceEmpty'
>;
```

```ts after
// packages/platejs/src/lib/editor/pluginRuntimeTypes.ts
export type BlockInsertOptions = PliteBlockInsertOptions<NodeTarget>;

export type BlockUpsertOptions = Exclude<BlockInsertOptions, { at: Path }> & {
  replaceEmpty?: never;
};
```

## What other editors do

This review read the Slate (`945a484df`), Lexical (`dd5c41b13`), ProseMirror (`prosemirror-transform` `662b7a937`) and Tiptap (`91c51be53`) checkouts beside the repository and ran none of them. None takes more than one placement for an insert, and none returns a coordinate that is wrong outside one tree.

| Editor | Where an insert lands | What it returns |
| --- | --- | --- |
| Slate | One optional `at` location in `NodeInsertNodesOptions` (`packages/slate/src/interfaces/transforms/node.ts:20`) | Nothing |
| Lexical | A method per side on the live node, `insertAfter` and `insertBefore` (`packages/lexical/src/LexicalNode.ts:1773`, `1859`) | The inserted live node |
| ProseMirror | One position, `insert(pos, content)` (`src/transform.ts:116`) | The transform, for chaining |
| Tiptap | One `position: number \| Range` argument to `insertContentAt` (`packages/core/src/commands/insertContentAt.ts:46`) | A command's boolean |
| Plite today | `after`, `before` and `at` as optional fields that throw when combined | The first inserted path, local to its root |

Lexical is the closest model. Its insert hands back the inserted node, an identity the caller acts on. Plite's equivalent identity is the `NodeKey`, which, unlike a live element object, stays valid after the block changes.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `BlockInsertOptions` becomes an exclusive union with a type parameter for `after` | Plite | `plitejs`: `src/interfaces/editor.ts` | The placement is Plite's contract; the type should say what the runtime checks |
| `tx.blocks.insert` returns the landed blocks' keys and throws on a misplaced `replaceEmpty` | Plite | `plitejs`: `src/core/public-state.ts` | The insert alone knows the root, the trimmed batch and the empty-source removal |
| Plate's option types derive from Plite's with the type parameter and `Exclude`; table takes `BlockInsertOptions` | Plate | `platejs`: `src/lib/editor/pluginRuntimeTypes.ts`, `src/features/table/lib/types.ts` | `Omit` and the hand-built table union lose the exclusivity |
| `applyBlockInsertion`, table and the generated insert narrow placement before adding `after` | Plate | `platejs`: `blockInsertion.ts`, `BaseTablePlugin.ts`, `resolvePlugins.ts` | A spread that adds `after` must not keep `at` or `before` |
| Details, column, table and AI chat act on the returned keys; `applyBlockInsertion` passes a `before` placement through whole | Plate | `platejs`: those plugins and `blockInsertion.ts` | The passed node does not identify a trimmed copy or a block in another root, and Plite must see a misplaced `replaceEmpty` to refuse it |
| List keeps finding its new item through the node it passed | Plate | `platejs`: `BaseListPlugin.ts`, unchanged | Its join helper walks and writes root-local paths, so a key lookup into another root would write the wrong root; that helper belongs to `task_4ed42f14` |
| `nodes.block` keeps its root-local entry, and the Vision says how to act on it from another root | Plite | `docs/vision/plite.md` | Every entry read is root-local; keys cross roots |

## Hard cuts and app migration

- `tx.blocks.insert`, `editor.update.blocks.insert` and a view's copy return `readonly [NodeKey, ...NodeKey[]] | undefined` instead of `Path | undefined`. A truth test such as `if (!inserted)` keeps working. Code that read the path uses the keys, such as `tx.points.start(inserted[0])` or `tx.selection.setNodes(inserted)`, which resolve in any root. A copy of a node that is live in another root still shares its source's key, so its returned key can resolve to the source until suggested task `t_365a2462` lands.
- Passing more than one of `after`, `before` and `at`, or `replaceEmpty` beside `before` or `at`, is a type error, and both throw at runtime.
- Plate's `BlockInsertOptions` and `BlockUpsertOptions` take the same exclusive placements, and `table.update.insert` takes `BlockInsertOptions`; the unreleased `TableInsertPlacement` name is gone. Plate's block insert and upsert commands keep returning `boolean`.

```ts
// before
const path = editor.update.blocks.insert(block, { after: target });
if (path) editor.update.selection.set(editor.read.points.start(path)!);

// after
const inserted = editor.update.blocks.insert(block, { after: target });
if (inserted) editor.update.selection.setNodes(inserted);
```

## Main changes

- `insertBlocks` reads the key of each landed top-level block from its slot, in the landing root, before it removes an empty source, and returns them. A landing that wrote nothing returns `undefined`, as today.
- AI chat's insert below selects the returned keys instead of resolving each input block, and its insert after a block ends the caret at the last returned key instead of counting input blocks.
- Media's `insertUrl` captures the key of the block it resolves before the URL wait, checks that key is still live, and passes the caller's options through whole, so a target in another root works and a conflicting placement throws once its block resolves.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What the insert answers | The IDs of the blocks that landed (look) | Yes or no, with the length cap keeping block identity; the landed blocks themselves | yes-no result; block result | big |
| A misplaced empty-block replace | An error, like two places | Ignore it, as today | ignore misplaced | small |
| A live block copied from another root | Keeps sharing its source's ID, so its returned ID can reach the original, until a follow-up task fixes every insert (look) | Fix it in this change | fix copy id here | big |
| Live blocks from another root as targets | Left to the root-targeting task, with List's follow-up | Fix the lookup and List here too | fix routing here | small |
| What Plate's insert commands answer | Yes or no, as today | The IDs of what landed or was reused | command ids | small |
| Other inserts that copy blocks | Left to a follow-up task | Return IDs from them in this change too | sibling ids | small |
| A read through an ID from another root | Returns that root's block, as today | Returns nothing, like the path read | foreign read empty | small |
| The subject's page | A new page, because the old link no longer opens | Keep the old link | old page | detail |
| How the types limit places | One option set per place, same call shape | A single place field holding the kind | placement field | detail |
| The block read's position | Stays local to its root, as every read does | Tag it with its root | tag root | small |
| Table's placement type name | Removed, because the linter bans a second name for the same type, and it never shipped | Keep it as an alias | keep table name | small |
| The generated registry copies of the edited docs | Left for the next registry build in the main checkout, because those files also hold other people's unbuilt changes | Ship the regenerated files in this patch | registry here | detail |
| Base failures in the final checks | Accept them, because each already failed the same way before this change, and other tasks own them (look) | Fix them here | fix base checks | small |

## Evidence

Model: claude-opus-5-5 @high.

### Requirements

- A block insert lands in one place: after a block, before one, or at a path slot (Vision, `docs/vision/plite.md` block insert line).
- A refused insert changes nothing and the caller learns it was refused, because the update does not roll back (same line).
- `NodeKey` is the sole live identity, keys are unique across one editor's roots and may target operations across roots, and a `Path` carries no root (Vision, NodeKey line).
- The length limit trims an insert to what fits (`packages/plitejs/src/core/insert-limit.ts`).
- The owner's card asks to decide the placement type and the root-tagged results of `tx.blocks.insert` and `nodes.block`.

### Lanes

- **Keep.** Optional fields, a runtime throw and a root-local path. It loses because the type lies about what runs, the path is wrong from another root, and the insert-fit panels hit that trap three times.
- **Exclusive union, key result** (picked, cand-1). Names exactly what landed, in any root, after a trim, and stays valid after later edits, except for a copy of a node live in another root, which shares its source's key until `t_365a2462` lands.
- **Exclusive union, boolean, limiter keeps identity** (cand-2). Matches the sibling `set`, `reset` and `toggle`, but needs a new identity binding inside the limiter and still gives no handle to a copied live input.
- **Exclusive union, live element result** (cand-3). Names what landed, but a returned element's fields go stale after the next edit to it.
- **Root-tagged path,** such as `{ root, path }`. Adds a second coordinate the Vision rejects; `nodes.block` would then differ from every other entry read.
- **Strongest deletion: drop `at`.** An `at` slot is the only way to address a slot by index, Plate exposes it on every block command, and it is the Slate idiom. It stays.

The caller census is a `git grep` of `blocks.insert(` over `packages` and `apps` at the base tree; content outside this repository is unseen. The probes ran on Plite source in this worktree.

### Probes

- A main-root update inserting before a header key finds the passed node by key, and `tx.points.start` of that key lands in `header` (`premise-a2.log`).
- A `maxLength` of 8 over `abc`, inserting `xy` and `long text`, lands `xy` and `lon`, and both passed nodes then fail `tx.key` (`premise-a2.log`).
- `tx.selection.setNodes([key])` and `tx.points.end(key)` from a main-root update land in `header` (`keys-a1.log`).
- `tx.nodes.insert` of header's live first block at main `[1]` gives both blocks the key `r1:n2` (`keys-a1.log`).
- The Plate option derivation with a type parameter refuses two placements, a misplaced `replaceEmpty`, an upsert `at` and a node-selection `after`, and accepts every legal call (`plate-types-a2.log`, run on the intersection form the judge then replaced; the build reruns it as a type test).

### Dependents

- The review ledger lists no dependent scope for `transactions`. The Plate callers above consume the insert directly and are named in Layer and owner.

### Prior work

- [Insert-fit plan](2026-10-15-plite-insert-fit.md) built the checked insert and left this question as Open work for this task. This review keeps its checked landing and changes the type and the result.
- This review retains 2026-10-15-transactions-reset-default, the scope's head, because it changes only reset's refusal, which a block insert never reaches. Its page is the [reset default review](2026-10-15-transactions-reset-default.md).
- Suggested task `task_4ed42f14` owns root targeting for reads and writes. It now also holds this run's finding that a live element from another root fails as a target, and that List's follow-up walks root-local paths.

## Open work

- An inserted live node, or a fresh block holding one, from any root gets its source's key, so `tx.blocks.insert` returns a key that can resolve to the source, and inside a transaction spec the seeding can rekey the source. owner: the owner, through suggested task `t_365a2462`. stop: that task lands or is dropped.
- `tx.nodes.insert`, `tx.nodes.replace`, `tx.blocks.duplicate` and AI chat's replace path still report no keys for what they copy. owner: the owner, through suggested task `t_bcec338b`. stop: that task lands or is dropped.
- A live element from another root fails as a target, entry reads through a key from another root disagree with `nodes.path`, and List's join walks root-local paths. owner: the owner, through suggested task `task_4ed42f14`. stop: that task lands or is dropped.
- Media's `insertUrl` rejects a conflicting placement only after the URL dialog, and `{ before: deadKey, after: liveKey }` returns `false` before the dialog without throwing, because checking first would copy Plite's placement rules. owner: the owner. stop: Plite exports its placement check.
- The no-placement check repeats in `applyBlockInsertion`, table, Media, code block and the generated insert. owner: the owner. stop: a refactor of `applyBlockInsertion`.
- The registry JSON under `apps/www/public/r/` still shows the old insert docs and `TableInsertPlacement`. owner: the owner. stop: the checkout's next `build:registry` or `pnpm check`.
- The platejs test partitions, the plitejs typecheck and the public types smoke fail at base. owner: the owner, through suggested task `t_54844d26`. stop: that task lands. The package build fails at base on a plitejs JSDoc that names Plite. owner: the owner, through suggested task `t_1436558e`. stop: that task lands.

## Steps

- [x] Run `architect` with three runners and a cross-judge on the target, and synthesize. Proof: `docs/plans/artifacts/2026-10-15-transactions-placement-types/synthesis.md`, the runner answers and `judge/` beside it.
- [x] Panel on the plan (reviews: `api-plan`), three rounds, the cap. Round 1 found the nested duplicate key and the List wrong-root write; round 2 found that fixing the duplicate key reaches key seeding, so the fix moved out; round 3 narrowed the key result's claim for copies of live nodes. Proof: the `panel` rows and `panel-plan-r1/`, `panel-plan-r2/` and `panel-plan-r3/` in the run directory.
- [x] Plite: the union type, the key result and the misplaced `replaceEmpty` throw in the transaction. Contract cases, each red before its change: the result keys of a replace-empty insert, a trimmed batch with a hole, an insert into another root, and a misplaced `replaceEmpty` set to `true` and to `false`. Type cases refuse two placements and a misplaced `replaceEmpty`. Proof: Plite contracts and the plitejs typecheck. Done: `plite-red-a1.log`, with the `false` case proven on its own in `trail/replace-empty-false-base-a1.log`, `plite-green-a4.log`, and the typecheck fails only in a file this task did not touch, as at base.
- [x] Plate: the derived option types and table's alias (cut by the lint, see Defaults), the narrowing in `applyBlockInsertion`, table and the generated insert, and the callers on the returned keys. Cases, each red before its change: a Details inserted into another root opens and selects, AI chat's insert below a block in a length-limited editor selects what landed, and a Plate insert with `before` and `replaceEmpty` throws. Type cases refuse two placements, an upsert `at` and a misplaced `replaceEmpty`, and accept the narrowing in `applyBlockInsertion`. Proof: platejs specs and typecheck with type tests. Done: `plate-red-a1.log`, `plate-typecheck-a3.log`, `plate-contracts-a3.log`.
- [x] Teach it with `plate-docs`: the two transforms pages, `core.mdx` and its Chinese twin, `media.mdx` and its twin, the table page's placement line, the Vision block insert line saying the insert returns the landed blocks' keys and a caller acts through them, and the unreleased changesets. Proof: the diff, the docs checks and a teaching sweep for the old result. Done: `build-source-a1.log`, the sweep finds the old result only in generated registry JSON (Open work).
- [x] Writing passes, then the panel on the diff (reviews: `api-build`). Proof: the `writing` and `panel` rows. Done: three rounds, the cap. Round 1's critical was the public types smoke; round 2's was Media following a key inside its target block; round 3 found nits only.
- [x] Verify: both package suites, typechecks and builds, and `pnpm lint:task` on the task's paths. Proof: the `verify` rows and their logs. Done as accepted partial: `verify-summary.md`; the base failures are a Defaults row.
- [x] Land the patch on the checkout and log `landed`. Proof: the chips patch and the ledger row. Done: `docs/plans/artifacts/chips/t_c1edeaed.patch`, applied to the working tree, with `landing-check-a1.log`.

## Close

Deviations from the plan come first. Lint's `plate(no-second-name)` refused `TableInsertPlacement` as an alias, so the name is cut and `table.update.insert` takes `BlockInsertOptions`. The name never shipped on `main`. Media's `insertUrl` was not in the plan. Every diff panel seat found that it mixed `before` with `after` and dropped a misplaced `replaceEmpty`. It now captures the key of the block it resolves and passes the caller's options to Plite whole. The registry JSON for the edited docs is not in the patch, because its regenerated files also carry other sessions' stale entries.

What landed:

- `tx.blocks.insert` takes one placement by type and throws for two, or for `replaceEmpty` beside `before` or `at`.
- It returns the keys of the top-level blocks that landed, or `undefined`.
- Plate derives its option types from Plite's.
- Details, column, table, AI chat and Media act through the returned or captured keys.
- The docs, the Plite Vision, the API reference manifest and two changesets teach the result.

Proof:

- Five Plite contract cases and three Plate specs failed at base and pass now.
- Three Media specs each failed on the panel round tree before them and pass now.
- The Plite and Plate type cases refuse what the runtime refuses.
- All 877 Plite contracts pass, the platejs typecheck and type contracts pass, and `pnpm lint:task` is clean on the 20 task files.
- The proof stops at failures that reproduce at base: ten platejs cases, the plitejs typecheck in one file, the public types smoke's unused directive and the platejs declaration build. Other tasks own each one, as Open work says. No browser drive ran, because nothing browser-visible changed.

Landing: another session had reworked AI chat's placement in the checkout, so the patch's AI chat change was redone on the checkout's copy. On the checkout's tree plus the patch, the Plite contracts and the touched Plate specs pass, apart from the two base AI suggestion cases. The platejs typecheck there stops at another session's `packages/plitejs/src/authored/tree/resolve.ts` errors, which fail the same way without the patch, so the redone AI chat file has runtime proof only until those clear.

Reviews: a plan panel of three rounds and a diff panel of three rounds, each seated with Opus, Astra and Sol. The plan panel's round 3 critical narrowed the key result's claim for copies of live nodes. Each diff round's critical was applied and reproduced before its fix.

Review inputs: the verdict and the build read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/insert-limit.ts`, `packages/plitejs/src/transforms-node/insert-nodes.ts`, `packages/plitejs/src/editor-runtime-view.ts`, `packages/plitejs/test/transforms-contract.ts`, `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts`, `packages/platejs/src/internal/plugin/blockInsertion.ts`, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts`, `packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts`, `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`, `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, `packages/platejs/src/features/table/lib/types.ts`, `packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts`, `content/docs/plite/api/transforms.mdx`, `content/docs/api/editor-transforms.mdx`, `content/docs/api/core.mdx`, `docs/plans/2026-10-15-plite-insert-fit.md`.

### Attention

Reviewed by gpt-6.1-sol @xhigh, the decision-trail seat, on frozen commit `9d686eda`. Its answer is `trail/seat-sol.md` in the run directory.

- The base-failure acceptance rested on failing test names and a build exit code. A rerun kept full output at base and here (`trail/base-full-a1.log`, `trail/current-full-a1.log`), and the failing cases and error lines match line for line. Both builds fail at the same declaration line; the base line's text is inferred. The summary now says the smoke file changed but not its failing directive.
- The misplaced `replaceEmpty: false` case never ran red, because it sat behind the `true` assertion in one test. A separate probe fails at base and passes here (`trail/replace-empty-false-base-a1.log`).
- The first writing pass rejected comment-sicko's kill of the moved empty-source comment without proof. A rerun showed the comment was false, since `tx.nodes.remove` calls the same `removeNodes`, so the comment is gone and `landAt`'s `source` is now `replacedEmpty`.
- Media's deferral now also names `{ before: deadKey, after: liveKey }`, which returns `false` without throwing, and the Media line says a conflicting placement throws once its block resolves.
- The census now counts twelve Plate call sites in ten functions, and says some, not all, reach the new block through the node they passed.
