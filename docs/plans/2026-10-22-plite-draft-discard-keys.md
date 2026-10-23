---
review_scopes: [model]
verdict: pursue
review_basis: [2026-10-04-model-audit]
work_kind: implementation
review_commit: 79f710039476196b0d4f35a14b62e5d6affcf80b
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/transforms-node/insert-nodes.ts, packages/plitejs/src/utils/node-keys.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/public-root.ts, packages/plitejs/src/core/snapshot-index.ts, packages/plitejs/src/core/resolved-token-cursor.ts, packages/plitejs/src/core/change/document-index.ts, packages/plitejs/src/core/change/tokens.ts, packages/plitejs/src/core/clone.ts, packages/plitejs/src/transforms-node/wrap-nodes.ts, packages/plitejs/src/transforms-node/unwrap-nodes.ts, packages/plitejs/test/native-transaction-spec-contract.test.ts, packages/plitejs/test/document-change.test.ts, packages/plitejs/test/content-slice.test.ts, packages/plitejs/test/plugin-dispatch.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts, 'apps/www/src/app/(app)/examples/plite/_examples/images.tsx', docs/plans/2026-09-13-clipboard-transfer-policy.md, docs/plans/2026-10-15-plite-draft-keys.md, docs/plans/2026-10-15-transactions-placement-types.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../slate-v2@f0e5ad1ae7caa14027dc57bc38bd457909bd4b97', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Plite: a copy of a live node gets its own key, and a draft never re-keys a live node

Status: executed: a quiet-host timing rerun waits in a suggested task
Playbook: plan

Verdict: pursue. `insertNodes` sorts each node it places before it writes any key. A node never placed is fresh and gets a new key. A node whose key no root holds is a move and keeps that key. A node whose key some root holds is a copy, and only the copy gets a new key. The strongest reason is that today's insert writes a key onto any caller object that has none for this editor. So a spec that removes a live block and inserts it again leaves that block with a prepared key after a discard, and a node taken from another root keeps that root's key.

## Brief

### What will change?

Copying a block that is still in the editor now gives the copy its own key. A thrown-away transaction no longer renames a block it put back, and a nested transaction no longer renames the outer one's blocks.

### What could go wrong?

The first copy out of a 20,000-block root that nothing has read yet takes about 160 ms. The speed check stayed unsettled on a busy machine, and a follow-up task reruns it. Older key bugs remain, each with a task.

## Teach

Every block and piece of text in a Plite editor has a key, a name that stays with it while people edit it. No two places share a key in any root, and a thrown-away draft leaves keys as they were.

Today the insert writes a key onto any object with no key for this editor. So a block a thrown-away draft removed and put back keeps the draft's key, and a block taken from another root keeps that root's key.

After the change the insert sorts each node first. A new node gets a new key, a node whose key no root holds keeps it, and a copy of a held node gets its own. To check, it asks each root's lookup table, which now says no right away for a missing key older than the table. Before, it read the whole root, 52 ms per copy at 20,000 blocks. A newer key costs one read of the root.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a node no editor keyed counts as | New, as before, until the [plan for nodes no editor keyed](2026-10-23-plite-unkeyed-insert-liveness.md) lands in this same change. Two rules for it failed three diff panel rounds and were reverted | Land this plan without that one, so a pasted block no read has keyed, or another editor's block, still gets this editor's key when inserted | land without it | small |
| How a moved block checks other roots | Skip another root when no open draft changed it and the block sat in this root at the last commit; otherwise ask that root's lookup table, as reading a key would | Ask every root's table on every move, which costs 38 ms per move instead of 0.5 ms when a 20,000-block header changed since the last move | check every root | small |
| What a root's lookup table does the first time it is asked about a key it never had | Builds itself once from the root, about 60 ms at 20,000 blocks, then answers every later question from that build | Skip that root's table when another root had the key at the last commit. That saves the one build, but every insert must first find which root has the key | skip the base | small |
| How a root's lookup table knows it never had a key | Keys are numbered in order, and each table remembers the next number when it was built. A missing key older than that is absent, and a newer one costs one read of the root | Make every key lookup for a root go through one shared table per root version, which means changing eight or more call sites | one table per root | small |
| What a spec does with a root nobody has read | It builds that root's table again in every spec, which reads the root once per spec, because a spec can't save a table for later | Let a spec save the table of a root no draft changed, so later specs reuse it. That means writing the shared cache from inside a spec | keep cold tables | small |
| Where a nested transaction finds another root's lookup table | In its parent transaction's table, as it already did for its own root | Build the table from that root's blocks, as today, which loses keys the parent moved and renames blocks the parent changed | rebuild nested tables | small |
| Older key bugs found on the way | Each gets its own task | Fix them in this change | fix them here | small |
| Speed budget | 5% on fresh inserts and typing, 10% on copies, moves and load | One 5% line everywhere | tighten budget | detail |

## Public API

No call changes shape. What changes is the key a copy gets, which a caller sees through `key`. This is the expected-results row that copies header's live block into main.

```ts before
// keys-table.ts in the run directory, row update-other-root-block, at the base commit
const live = header.read.children()[0];
editor.update((tx) => tx.nodes.insert(live, { at: [2] }));
editor.key([2]) === header.key([0]); // true: the copy shares the header block's key
```

```ts after
// keys-table.ts in the run directory, row update-other-root-block
const live = header.read.children()[0];
editor.update((tx) => tx.nodes.insert(live, { at: [2] }));
editor.key([2]) === header.key([0]); // false: the copy has its own key
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Identities | Runtime `NodeKey` is opaque and never serialized; persisted element IDs are optional and stay with `ElementIdPlugin`, whose `read.id` is the persistence-boundary conversion; the schema fingerprint identifies document semantics, with application lineage kept apart. `insertNodes` sorts each placed node as fresh, moved or copied before it writes any key. Only a fresh caller object takes a key, a moved node keeps its own and a copy gets a new one. An update keys each node it places as the node lands, and `insertNodes` first settles every deferred key mapping an open draft or command frame registered, so a node with no key for this editor is fresh. |

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Sort placed nodes before keying | Plite | `plitejs`, `src/transforms-node/insert-nodes.ts` | The insert is the one write that takes caller objects, so it is the one place that knows which objects are new |
| Ask every root whether a key is live, and start a nested draft from its parent's indexes | Plite | `plitejs`, `src/core/public-state.ts` | The open drafts, their indexes and the committed snapshots live there |
| Answer that a key is absent without reading the whole root, and count each whole-root read | Plite | `plitejs`, `src/core/snapshot-index.ts`, `src/core/work.ts` and `src/utils/node-keys.ts` | The snapshot index owns which keys a root holds, and the key allocator owns the counter that dates each key |

## Main changes

- `insertNodes` plans every node it places before it writes any key. Fresh nodes get keys minted onto the caller's object, live keys in an update and prepared keys in a spec. Moved nodes carry their key to the copy. A copy is a node whose object or key the call already placed, or a node whose key some root holds. A node with no key for this editor is fresh, as before; the [plan for nodes no editor keyed](2026-10-23-plite-unkeyed-insert-liveness.md) decides how the insert tells whether such a node is live. So when one call places an old and a new object of one removed block, the first keeps the key and the second is a copy. It reads every node's key before it asks any root, because finding one key can key the rest of that root, and a key minted then belongs to no placed node. A copy's object never gets a key. When a subtree holds a copy, each node above it goes to the builder as a private stand-in, and a fresh node keeps its key on the caller's object too, so that object still finds the placed node. The key transfer that wrap, unwrap and `replaceChildren` share is untouched.
- `findLiveNodeKeys` answers which of a set of keys some root of the current draft holds. It asks each root for the index a key read gets. A changed root can hold a key in that index before any of its nodes carries it, as after a paste inside a spec. A key sits in one root at commit, so it skips a root no open draft changed for a key the current root held at commit. It compares a root with its committed version by the node list an index reads, so a root a view holds as a plain array still matches its committed lazy root. A block moved within its own root therefore reads no other root. An insert whose nodes hold no key asks no root.
- A nested spec's draft starts from its parent's index for every root, not only its current one. Before, a key read in the nested draft built another root's index from that root's nodes. That index lost keys the parent had moved or mapped, and the build minted new live keys for that root's blocks. A top-level spec also starts from each root index a read has cached, but only when that cached snapshot holds the same node list the spec starts from, whether a value holds that root lazily or as an array, so a spec inside a document view builds its other roots' indexes from the view.
- A mapped snapshot index answers that a key is absent when its base never held that key and the key is older than the base. Each index records the live key counter when it is built or mapped. A key is written onto its node when it is minted, so an older key the base lacks is on none of its nodes. A newer key may sit on a base node that another reader keyed later, such as a read from another root or a document view, so the index reads the root for it. Before, each such answer walked the whole root, and every write makes a new mapped index, so a copy into a 20,000-block main walked main on every copy. `CoreWork.snapshotIndexWalks` counts each whole-root walk either index kind makes.
- `mintNodeKeys` replaces `seedPreparedNodeKeys` and mints either live or prepared keys for the insert. Loading still seeds through `seedNodeKeys`.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Insert keying | Seeds keys onto every caller object with no key for this editor, before any liveness check | Sorts each node as fresh, moved or copied, then keys only fresh ones | `insert-nodes.ts` | A removed block and a block in another root both look new to today's insert | No public call changes | `keys-table.ts`, the new contract test, the plitejs and platejs suites | A caller object that reads as fresh but is live somewhere | rearchitect |
| Cross-root liveness | None; a copy from another root keeps that root's key | Ask each root the index a key read gets; skip a root no open draft changed for a key the current root held at commit | `public-state.ts` | Keys must be unique across roots, and a changed root's index can hold a key its nodes do not carry yet | None | Rooted-point and header-paste rows, a mutant per guard, the paired timing probe | Building a large root's index once, on the first query after nobody has read it | keep, gated on the timing receipt |
| Absence lookup | A mapped index that misses its base walks the whole root | A base miss is absent for a key older than the base's counter mark | `snapshot-index.ts`, `node-keys.ts` | Every write makes a new mapped index, so each liveness query walked a large root | None | The walk-count and cross-root read cases, three mutants | A key minted after the mark costs one walk when an insert asks about it | rearchitect |
| Nested draft indexes | A nested spec's draft knows only its current root's index and builds the others from their nodes | It reads its parent's index for every root | `public-state.ts` | A built index loses keys the parent moved or mapped, and a key read alone renames a block the parent changed | None | The nested header-paste rows, a mutant | A nested draft now shares its parent's index objects until it changes a root | rearchitect |
| Nodes no editor keyed | Fresh | Fresh, as before; the plan for nodes no editor keyed owns the rule | `insert-nodes.ts` | Two rules, an index mark and a search of the drafts for the object, each failed a diff panel round, and the panel rule reverts a mechanism after its one replacement | None | The contract test's four cases that now fail, owned by that plan | A pasted block no read has keyed gets its source's key when copied, as before | revert |
| Key minting helper | `seedPreparedNodeKeys` for prepared keys only | `mintNodeKeys` for live or prepared keys | `node-keys.ts` | The insert mints both kinds through one helper; loading keeps `seedNodeKeys` | None | Suites | None | merge |
| Shared key transfer | Wrap, unwrap and `replaceChildren` share it | Unchanged | `public-state.ts` | The card keeps it out of scope | None | Suites | None | keep |

## What other editors do

A Codex explorer read Lexical (`dd5c41b13`), prosemirror-model (`6264de0`) and prosemirror-transform (`662b7a9`), Slate (`945a484df`), the slate-v2 fork (`f0e5ad1ae`) and Tiptap (`91c51be53`) from the checkouts beside the repository and ran none of them. Only Lexical keeps one live identity per node and stops a copy from sharing it. Slate and the slate-v2 fork, which Plite's key cache comes from, let the same object stand at two places with one key, which is the bug this plan fixes.

| Editor | Where identity lives | Inserting a node that is already live | What a copy gets | Can a discarded update change committed identity? |
| --- | --- | --- | --- | --- |
| Lexical | A `__key` on the node and a key map per editor state (`LexicalUtils.ts:377`) | Moves it and keeps its key; a fresh parent also takes live children by moving them (`LexicalElementNode.ts:724`) | `$copyNode` allocates a new key; a writable clone keeps the key as a new version (`LexicalUtils.ts:1829`) | No; the pending state and its node map are dropped (`LexicalUpdates.ts:1223`) |
| ProseMirror | Nowhere; nodes are values, and an id is an application attribute (`node.ts:22`) | Reuses the value, and the original stays (`fragment.ts:248`) | The same attributes, so an id attribute repeats unless a plugin repairs it | No; a discarded transform leaves the persistent nodes as they were |
| Slate | Paths in core; a global object-to-key WeakMap in the DOM layer (`dom-editor.ts:379`) | Places the same object again with the same rendering key | A fresh object gets a new lazy key; shared descendants keep theirs (`with-dom.ts:222`) | Slate has no discard; operations apply at once |
| slate-v2 fork | An object-to-editor-to-id WeakMap (`runtime-ids.ts:5`) | Places the same object with the same id, also in another root (`general.ts:171`) | A fresh object gets a new id; inherited ids carry through rewrites | Ids are restored, but counters and abandoned WeakMap entries are not rewound (`public-state.ts:3498`) |
| Tiptap | ProseMirror's, plus the optional UniqueID attribute (`unique-id.ts:96`) | As ProseMirror; UniqueID regenerates a duplicate id in the changed range, and programmatic duplicates can escape it (`unique-id.ts:263`) | Paste clears ids and makes new ones (`unique-id.ts:395`) | No |

Plite takes Lexical's rule for copies: a node placed while its source is still live is a copy and gets a new key, and a node placed while its source is gone carries the source's key. It keeps Slate's object cache, so the fix has to stop the insert from writing that cache onto objects that may be live, since a draft shares the cache with the committed document. Lexical avoids that by keeping a draft's key map apart from the committed one.

## Expected results

Each row builds an editor, mostly with a main root of two paragraphs and a `header` root of one, runs the operations in order and must leave every live node in every root with one key by path, the same key by object, and no key shared across roots. A discard row also requires that no key changed, and a draft row checks the keys inside the spec draft. `keys-table.ts` in the run directory runs every row. On `next` at the base commit 32 of 72 fail; the prototype fails 4, the named limits under Lanes, which also fail on base. The round-2 prototype failed four of the six rows added after the plan panel's second round. After the diff panel's third round reverted the rule for nodes no editor keyed, the checkout fails 9: the four limits and `update-other-root-unbound-block`, `spec-other-root-unbound-block-accept`, `spec-nested-paste-unclaimed-block-draft`, `spec-paste-into-quote-unclaimed-quote-draft` and `update-foreign-editor-node`, which the plan for nodes no editor keyed owns.

| Row | Rank | Operations | Must result | Base | Prototype |
| --- | --- | --- | --- | --- | --- |
| spec-reinsert-discard | P0 | Spec removes a live block, inserts the same object, discards | No key changes, and the block keeps its key | fails | passes |
| spec-reinsert-accept | P1 | Spec removes a live block, inserts the same object, accepts | The block keeps its key | fails | passes |
| update-reinsert | P1 | Update removes a live block and inserts the same object | The block keeps its key | passes | passes |
| update-other-root-block | P0 | Update inserts header's live block into main | The copy gets its own key | fails | passes |
| update-other-root-text-in-fresh-block | P0 | Update inserts a fresh paragraph holding header's live text | The text copy gets its own key | fails | passes |
| update-same-root-text-in-fresh-block | P0 | Update inserts a fresh paragraph holding main's own live text | The text copy gets its own key | fails | passes |
| spec-other-root-block-discard | P0 | Spec inserts header's live block into main, discards | No key changes | fails | passes |
| spec-other-root-block-accept | P0 | Spec inserts header's live block into main, accepts | The copy gets its own key | fails | passes |
| spec-other-root-text-discard | P0 | Spec inserts a fresh paragraph holding header's live text, discards | No key changes | fails | passes |
| spec-other-root-text-accept | P0 | Spec inserts a fresh paragraph holding header's live text, accepts | The text copy gets its own key | fails | passes |
| spec-same-root-text-discard | P0 | Spec inserts a fresh paragraph holding main's own live text, discards | No key changes | fails | passes |
| spec-duplicate-discard | P1 | Spec inserts a second copy of a live main block, discards | No key changes | passes | passes |
| spec-duplicate-accept | P1 | Spec inserts a second copy of a live main block, accepts | The copy gets its own key | passes | passes |
| update-fresh-literal-passed | P1 | Update inserts a fresh literal | The passed object resolves to the copy in the update and after | passes | passes |
| spec-fresh-literal-passed | P1 | Spec inserts a fresh literal | The passed object resolves to a prepared key that acceptance keeps | passes | passes |
| update-schema-create-passed | P1 | Update inserts a frozen tx.schema.create node | Tx.nodes.get(passed) finds the copy (List) | passes | passes |
| spec-schema-create-passed | P1 | Spec inserts a frozen tx.schema.create node | Tx.nodes.get(passed) finds the copy | passes | passes |
| update-edited-block-copy | P1 | Update edits a block, then inserts its new live object elsewhere | The source keeps its key | passes | passes |
| spec-edited-block-copy-discard | P1 | Spec edits a block, then inserts its new object elsewhere, discards | No key changes | passes | passes |
| update-fragment-block-copy | P1 | Update pastes blocks, then inserts a landed block that no key read has bound | Keys stay unique | passes | passes |
| spec-fragment-block-copy-accept | P1 | Spec pastes blocks, then inserts a landed block that no key read has bound, accepts | Keys stay unique | passes | passes |
| spec-fragment-text-in-fresh-block-accept | P1 | Spec pastes blocks, then wraps a landed text no key read has bound in a fresh paragraph, accepts | Keys stay unique | passes | passes |
| spec-committed-unbound-copy-discard | P0 | A pasted block no key read has bound since its commit is copied by a spec that discards | Keys stay consistent | passes | passes |
| spec-committed-unbound-copy-accept | P0 | A pasted block no key read has bound since its commit is copied by a spec that accepts | Keys stay unique | passes | passes |
| update-committed-unbound-copy | P0 | A pasted block no key read has bound since its commit is copied by a later update | Keys stay unique | passes | passes |
| update-other-root-unbound-block | P0 | A block pasted into header that no key read has bound is copied into main by an update | Keys stay unique | fails | passes |
| spec-other-root-unbound-block-accept | P0 | A block pasted into header that no key read has bound is copied into main by a spec that accepts | Keys stay unique | fails | passes |
| spec-nested-paste-copy-accept | P0 | Spec pastes into a quote, then inserts the rewritten quote elsewhere, accepts | Keys stay unique | passes | passes |
| spec-nested-paste-copy-discard | P0 | Spec pastes into a quote, then inserts the rewritten quote elsewhere, discards | No key changes | passes | passes |
| spec-nested-paste-text-in-fresh-block-accept | P0 | Spec pastes into a quote, then wraps a rewritten text in a fresh paragraph, accepts | Keys stay unique | passes | passes |
| update-nested-paste-copy | P1 | Update pastes into a quote, then inserts the rewritten quote elsewhere | Keys stay unique | passes | passes |
| update-paste-unbound-copy | P1 | Update pastes three blocks, then inserts a pasted block read from the draft children elsewhere | Keys stay unique | passes | passes |
| update-paste-unbound-text-in-fresh-block | P1 | Update pastes three blocks, then wraps a pasted text read from the draft children in a fresh paragraph | Keys stay unique | passes | passes |
| spec-paste-unbound-copy-accept | P0 | Spec pastes three blocks, then inserts a pasted block read from the draft children elsewhere, accepts | Keys stay unique | passes | passes |
| spec-paste-unbound-copy-discard | P0 | Spec pastes three blocks, then inserts a pasted block read from the draft children elsewhere, discards | No key changes | passes | passes |
| spec-paste-merged-block-copy-accept | P0 | Spec pastes three blocks, then inserts the merged first block read from the draft children elsewhere, accepts | Keys stay unique | passes | passes |
| spec-paste-merged-block-copy-discard | P0 | Spec pastes three blocks, then inserts the merged first block read from the draft children elsewhere, discards | No key changes | passes | passes |
| spec-paste-merged-block-twice-accept | P1 | Spec pastes three blocks, then inserts the merged first and last blocks read from the draft children elsewhere, accepts | Keys stay unique | passes | passes |
| spec-nested-paste-unclaimed-block-accept | P0 | Spec with history pastes a nested quote, then inserts the rewritten block read from the draft children elsewhere, accepts | Keys stay unique | passes | passes |
| spec-nested-paste-unclaimed-block-discard | P0 | Spec with history pastes a nested quote, then inserts the rewritten block read from the draft children elsewhere, discards | No key changes | passes | passes |
| spec-paste-into-quote-unclaimed-quote-accept | P0 | Spec with history pastes into a quote, then inserts the rewritten quote read from the draft children elsewhere, accepts | Keys stay unique | passes | passes |
| spec-paste-into-quote-unclaimed-text-in-fresh-block-discard | P0 | Spec with history pastes into a quote, then wraps a rewritten text read from the draft children in a fresh paragraph, discards | No key changes | passes | passes |
| spec-nested-paste-unclaimed-block-draft | P1 | Spec with history pastes a nested quote, then inserts the rewritten block read from the draft children elsewhere | Draft keys stay unique | fails | passes |
| spec-paste-into-quote-unclaimed-quote-draft | P1 | Spec with history pastes into a quote, then inserts the rewritten quote read from the draft children elsewhere | Draft keys stay unique | fails | passes |
| update-move-into-header-by-point-then-reinsert | P1 | Update removes main's block, inserts it into header through a point that names the root, then inserts the same object in main again | Keys stay unique | fails | passes |
| spec-move-into-header-by-point-then-reinsert-accept | P1 | Spec removes main's block, inserts it into header through a point that names the root, then inserts the same object in main again, accepts | Keys stay unique | fails | passes |
| spec-move-into-header-by-point-then-reinsert-discard | P0 | Spec removes main's block, inserts it into header through a point that names the root, then inserts the same object in main again, discards | No key changes | fails | passes |
| spec-header-paste-then-insert-accept | P0 | Spec pastes into header through a rooted point, inserts header's original block into main, accepts | Keys stay unique | fails | passes |
| update-header-paste-then-insert | P1 | Update pastes into header through a rooted point, then inserts header's original block into main | Keys stay unique | fails | passes |
| spec-insert-after-committed-header-paste-accept | P1 | Update pastes into header through a rooted point, then a spec inserts header's original block into main, accepts | Keys stay unique | passes | passes |
| spec-nested-insert-after-header-paste-accept | P1 | Spec pastes into header, a nested spec inserts header's original block into main, accepts | Keys stay unique | fails | passes |
| spec-nested-reinsert-after-rooted-move-accept | P1 | Spec moves main's block into header through a rooted point, a nested spec reinserts the same object in main, accepts | Keys stay unique | fails | passes |
| spec-nested-reinsert-after-rooted-move-and-paste-accept | P1 | Spec moves main's block into header through a rooted point and pastes into it, a nested spec reinserts the same object in main, accepts | Keys stay unique | fails | passes |
| spec-view-document-node-discard | P1 | Spec inserts a document view's node into main, discards | No key changes and the view node holds no prepared key | fails | fails |
| update-view-document-node | P2 | Update inserts a document view's node into main | Keys stay unique across main, header and the view | fails | fails |
| spec-replace-other-root-then-insert-accept | P1 | Spec replaces header's children, then inserts the old and the new header block into main, accepts | Keys stay unique | fails | fails |
| spec-replace-other-root-then-insert-discard | P1 | Spec replaces header's children, then inserts the old and the new header block into main, discards | No key changes | fails | passes |
| update-replace-other-root-then-insert | P1 | Update replaces header's children, then inserts the old and the new header block into main | Keys stay unique | fails | passes |
| update-replace-other-root-with-main-block-then-reinsert | P1 | Update moves main's block into header through replaceChildren, then reinserts the same object in main | Keys stay unique | passes | passes |
| spec-replace-other-root-with-main-block-then-reinsert-accept | P1 | Spec moves main's block into header through replaceChildren, then reinserts the same object in main, accepts | Keys stay unique | fails | fails |
| update-stale-object | P2 | Update inserts an older object of a block edited since | The copy gets its own key | passes | passes |
| update-two-objects-of-one-removed-block | P1 | Update edits a block, removes it, and inserts its old and new object in one call | Keys stay unique | passes | passes |
| spec-two-objects-of-one-removed-block-accept | P1 | Update edits a block, then a spec removes it and inserts its old and new object in one call, accepts | Keys stay unique | passes | passes |
| update-same-fresh-twice | P2 | Update inserts one fresh object twice | The passed object resolves to the first copy | passes | passes |
| update-fresh-in-fresh-holding-other-root-text | P2 | Update inserts a fresh quote holding a fresh paragraph holding header's live text | Keys stay unique | fails | passes |
| update-foreign-editor-node | P2 | Update inserts another editor's live block | Both editors keep unique keys, and the passed object fails closed in the inserting editor | fails | passes |
| spec-two-objects-of-one-removed-block-draft | P1 | Update edits a block, then a spec removes it and inserts its old and new object in one call | Inside the draft each placed block has its own key, by path and by object | passes | passes |
| spec-two-objects-of-one-removed-block-remove-second-accept | P1 | The same spec then removes the second placed block by object, accepts | The first block stays | passes | passes |
| update-two-objects-of-one-removed-block-abort | P1 | Update removes an edited block, inserts its old and new object in one call, then throws | No key changes | passes | passes |
| spec-nested-key-read-then-insert-after-header-paste-accept | P1 | Spec pastes into header, a nested spec reads the key of header's original block and inserts it into main, accepts | Header's block keeps its key, and the copy gets its own | fails | passes |
| spec-nested-key-read-after-header-paste-accept | P1 | Spec pastes into header, a nested spec only reads the key of header's original block, accepts | Header's block keeps its key | fails | passes |
| spec-nested-rooted-insert-after-header-paste-accept | P1 | Spec removes main's second block and pastes into header, a nested spec inserts that block into header through a rooted point, accepts | Keys stay unique | passes | passes |

## Steps

- [x] 1. Write the failing tests. Add the table's rows that the prototype passes and base fails, the move, copy and fresh-literal rows that guard today's behavior, and the rows that guard the per-call key check and the committed-root skip, as one contract test in `packages/plitejs/test/insert-node-keys-contract.test.ts`, following the project's test rules. Each case checks every live node's key by path, by object and back to its path. Add the round-3 cases: a removed block put back inside a fresh quote keeps its key, copies of two blocks get their own keys after an insert keyed their root, and a main-root read that keys a pasted header block finds it again by that key. Add the diff panel's case: a spec inside a document view that reorders another root removes the block it finds by object. Add the walk cases for the absence proof. They count walks, so a 2,000-block root is enough. A copy into a large main after each paste whose blocks a by-path read keyed, and a move after each edit to a large header, walk no root after the first update. A spec that edits a large header a key read has cached and moves a main block walks none after the first spec, and so does a spec in a header view built after an update to a large main. Add the diff panel's second-round cases: a new block a document diff read is found at its inserted path, and a discarded nested spec leaves no prepared key on a block it put back in the outer draft. Then cut every case whose failing runs another case's failing runs contain. Proof: the file has 20 cases, and at base 13 fail, the four walk cases because base counts no walks and nine key cases. Each of the 33 mutants in `build/contract-8` but one fails at least one case, every case fails on some mutant or at base, and no case's failing runs sit inside another's. The one survivor compares a root with its committed version by storage instead of by node list, which changes no answer, because the spec's table for that root is the same cached one. The file passes on no named limit. After the diff panel's third round reverted the rule for nodes no editor keyed, four of the 20 fail on the checkout, and the plan for nodes no editor keyed owns them.
- [x] 2. Port the prototype. This step's proof ran with that plan's build. Move the seven changed source files from the prototype worktree into this checkout. Proof: the contract test passes; `pnpm --filter plitejs test:bun`, the core typecheck and the platejs list, upload and media specs pass; the full table run on the checkout matches `table-proto-a19`.
- [x] 3. Rerun the timing receipt on the final tree. Before any run, add six cohorts with a 1.10 budget, none of which reads the large root before its timed calls unless it says so: an update that moves a main block 20 times beside a 20,000-block header, an update that inserts a header block and then moves a main block, a spec that removes a main block and reinserts it beside that header, 20 copies of a header block into a 20,000-block main, each removed again, 20 specs that each copy a block out of a 20,000-block header a key read has cached, and 20 accepted specs, each undone, that edit that header and move a main block, because a discarded one throws on base from the bug this plan fixes. A cohort's first update may build a root's table once, and the receipt times that update apart from the rest. Proof: `paired-timing.mjs` passes every frozen line with the checkout as the candidate arm, and `copy-other-root.ts`, which times the first copy out of an unread header apart from the rest and checks the copy's keys after timing, fails on base (`copy-other-root-base-a2`) and passes on the checkout; a conclusive miss sends the design back to `architect`. The step is narrowed. The receipt ran twice under load and stayed inconclusive, and its one failing line did not reproduce in five runs of that cohort alone, so suggested task `t_9caf9c36` reruns it on a quiet host. The copy probe and the receipt's work counts ran here.
- [x] 4. Close the books. Remove the transactions subject's open item about inserted live nodes, add a `plitejs` patch changeset, fold the Layer and owner delta and Main changes into the model subject, and write the Close. Proof: `review-ledger.mjs check`, `plan-page.mjs --folded` and `pnpm check --affected` through `land.mjs`.

## Close

The diff panel's round 3 reverted the rule for nodes no editor keyed to base behavior. That rule was first an index mark and then a search of the drafts for the object. The round sent the problem to the [plan for nodes no editor keyed](2026-10-23-plite-unkeyed-insert-liveness.md), which landed in the same commit, so Step 2 ported both prototypes together. The round's two open critical findings now pass on the final source. Step 3 is narrowed. Its timing receipt stayed inconclusive under load, so the same suggested task, `t_9caf9c36`, reruns it on a quiet host. That hand-off counts as the owner's word for the narrower step. Step 4 kept the transactions subject's open item on inserted live nodes instead of removing it, narrowed to document views and command frames that rebuild their nodes, because those still give a copy its source's key.

The insert now sorts each node it places as fresh, moved or copied before it writes any key. So a copy of a block another root holds gets its own key, and a thrown-away draft no longer renames a block it removed and put back. Each root's lookup table answers whether a key is live, a key older than the table is absent without reading the root, a nested transaction starts from its parent's tables, and one helper mints live and prepared keys.

Proof, from each row's scope:

- Step 1's 20 cases include 13 that fail at base, and each of the 33 planted bugs but one fails at least one case. The survivor changes no answer.
- Step 2 passed on the checkout through the other plan's build: the contract test, the plitejs suite, the core typecheck, the platejs list, upload and media specs, and the 72-row keys table, which matches the prototype's run once key counters are normalized.
- The round-3 critical cases rerun on the final source. Where base leaves the thrown-away draft's key on the block, the block keeps its own key, and the no-write and no-leak probes pass in every mode.
- Inside a spec draft right after a paste, the middle pasted block now has a key by path, where base has none, so that open item is closed.
- For Step 3, the copy-other-root probe gives both copies their own keys, where base fails it. After each cohort's first update, the checkout walks every root as often as base. The paired receipt stayed inconclusive. One run called a spec that moves a block beside a 20,000-block header 1.98 times base, and five runs of that case alone read 0.80 to 1.13, a median of 1.05.

The proof stops at headless Bun, not a browser. The table and probes cover updates, accepted specs and discarded specs, not collaboration, and history only through the census.

Of the plan's review inputs, the change edits `packages/plitejs/src/transforms-node/insert-nodes.ts`, `packages/plitejs/src/utils/node-keys.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/snapshot-index.ts` and `packages/plitejs/test/document-change.test.ts`. It leaves `packages/plitejs/src/transforms-node/wrap-nodes.ts` and `packages/plitejs/src/transforms-node/unwrap-nodes.ts` as they were, because the insert stays out of the key transfer they share. It also leaves `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `packages/plitejs/src/core/public-root.ts`, `packages/plitejs/src/core/resolved-token-cursor.ts`, `packages/plitejs/src/core/change/document-index.ts`, `packages/plitejs/src/core/change/tokens.ts`, `packages/plitejs/src/core/clone.ts`, `packages/plitejs/test/native-transaction-spec-contract.test.ts`, `packages/plitejs/test/content-slice.test.ts`, `packages/plitejs/test/plugin-dispatch.test.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts`, `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`, `docs/plans/2026-09-13-clipboard-transfer-policy.md`, `docs/plans/2026-10-15-plite-draft-keys.md` and `docs/plans/2026-10-15-transactions-placement-types.md` as they were, and the platejs list, upload and media specs pass on the checkout.

The run had one owner message, "continue", and carried it to this close. The plan had three review rounds and the diff three.

Each Open work item below names its owner, its suggested task and its stop.

## Open work

- A document view's nodes are read through a projection that keys them lazily, so the insert treats them as caller literals. An update shares the view node's key with the copy, and a discarded spec leaves a prepared key on the view node. Base does the same. owner: the owner, through suggested task `t_4e37894a`. stop: that task lands or is dropped.
- Spec acceptance can give a block that `replaceChildren` replaced in another root its old key while the draft gave it a draft key, so a spec that also moves the old block into main duplicates the key at acceptance. Base fails both rows too; in one of them base duplicates a prepared key where the prototype duplicates header's old live key. owner: the owner, through suggested task `t_e10a3715`. stop: that task lands or is dropped.
- An insert that asks about a key minted after a root's index was built walks that root once, because the absence check cannot rule out a key newer than the index. So each copy of a newly made header block walks main once, where base walks nothing but gives the copy its source's key (`astra-rotating-copy-cand-a2`, `astra-rotating-copy-base-a2`). A spec that pastes into a 20,000-block main and then moves the merged block the paste rewrote walks main too, about 90 ms where base takes 10 ms (`put-back-cost-cand-a2`, `put-back-walks-cand-a1`, `put-back-cost-base-a1`). owner: the owner, through suggested task `t_1a1b60f6`. stop: that task lands or is dropped.
- A spec that copies from or edits a root no read has cached builds that root's index in every spec, because a spec cannot write the snapshot cache. Base reads that root only in the first spec. owner: the owner, through suggested task `t_aa68ddfd`. stop: that task lands or is dropped.
- The timing receipt stayed inconclusive under load up to 95. One run called a spec that moves a block beside a 20,000-block header a miss at 1.98 times base, and five runs of that case alone read 0.80 to 1.13, a median of 1.05. owner: the owner, through suggested task `t_9caf9c36`. stop: that task lands or is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort, as the lead.

### Requirements

- `NodeKey` is the one live identity, keys are unique across one editor's roots, and `editor.key(liveNode)` resolves a live node from any root (`docs/vision/plite.md`, the `NodeKey` paragraph).
- A transaction spec may consume existing keys and may give a fresh detached node a private prepared key that only the draft resolves, continuation keeps, acceptance adopts as that exact live key and discard leaves with no live allocation or index entry (same paragraph).
- A discarded draft never re-keys a block it reinserts (the card).
- Inserting a node live in another root, or a fresh block holding one, never gives the copy its source's key and never re-keys the source (the card).
- The insert decides per node, before it writes any key, whether that node's source is live in any root, and stays out of the key transfer that wrap, unwrap and `replaceChildren` share (the card).
- A fresh node a caller passes keeps resolving to its inserted copy, inside the transaction and after it, whether it is a plain literal (the Plite images example and the upload plugin, `tx.key(element)`) or a frozen `tx.schema.create` node (the List plugin, `tx.nodes.get(element)`).
- A node removed and inserted again keeps its key, in an update and in an accepted spec.
- No insert adds work that grows with the document on its common path.

### Lanes

- The picked lane sorts each placed node before keying (the arena's cand-2, opus). It adds one set of placed nodes per call and one liveness query and leaves the shared key transfer as it is. The lead scored it 18 of 20 and the cross-judge 14, and both picked it as the base. The judge scored it lower because it trusted the paste claim set alone, which two later rules replaced and the diff panel's third round reverted.
- The alias registry lane lost (cand-1, gpt-6.1-sol, and cand-3, gpt-6-astra). It records which caller object became which placed node and carries that across draft, continuation and acceptance. It makes provenance structural, but it changes four or more object-to-key lookups and scans retained versions on the rare path. Both scored 13 from the lead and 15 from the judge.
- Graft G3, asking a root's index rather than its nodes whether a key is live, first lost because no row needed it. The plan panel's first round found the case it covers, a paste into another root that leaves that root's key mapping deferred, and it became the design. The second round found two more problems. A nested draft built other roots' indexes from their nodes, which lost that mapping. Reading every root on every move cost up to 76 ms per update. So a nested draft now starts from its parent's indexes, liveness asks each root the index a key read gets, and a root no draft changed is skipped for a key the current root held at commit.
- A second `architect` run worked on the cost of proving a key absent, after the check before round 3 found that each copy into a 20,000-block main took 52 ms. Three runners proposed a persistent key catalogue (cand-1, gpt-6.1-sol), a reverse map seeded at load (cand-2, gpt-6-astra) and a base miss that means absent (cand-3, opus). The lead scored them 13, 15 and 19 and the cross-judge 12, 15 and 15, and both picked cand-3, the only one with run evidence. Its proof plan came from cand-2, with a counter in both materializers and walk cases that skip any warm-up. The build found that a yes-or-no mark per base let one late mint bring the walk back for every key, so it recorded each late key per base. The plan panel's third round found that this record missed keys other readers mint, such as a main-root read of a header block or a document view, so a mapped index said absent for a live key. Each index now records the key counter instead, which no reader can bypass, and a late key costs one walk while older keys cost none. Opus proposed sending every reader through one index per root version, which the lead turned down because it changes eight or more call sites and the counter covers every minting path.
- The diff panel's first round found that a top-level spec inside a document view filled its other roots' indexes from the stored document's cached ones, so a lookup by object could find another block and a removal could delete it. A cached index now fills a spec's root only when its snapshot holds the children the spec starts from. Four probes pass on base, fail on the reviewed tree and pass on the fix, and the document view case fails on the mutant that drops the check.
- The diff panel's second round found that the cache check compared how a root was stored, not which root it was. After an update, main is a lazy root, and a document view holds it as a plain array. So under a header view the check dropped main's cached index, and a keyed insert walked main in every spec. Roots now compare by the node list an index reads, in that check and in the check for a root unchanged since commit. All three seats also raised the index mark again, because a block an index saw but no root holds counted as a copy. The insert now asks the roots of the current and outer drafts for that exact object, and only for a marked object no editor keyed. A block a spec pasted, removed and put back keeps its key, and so does a new block a document diff read. A nested spec that puts back a block its outer spec pasted, and is then discarded, no longer leaves its prepared key on that block, which base does. Asking the committed roots too changed no result a caller can read, so the walk skips them. The seats also asked that a case go when another case fails on every planted bug it fails on. The lead added two mutants that break only specs, and cut the 14 cases that still had a covering case.
- The diff panel's third round found that searching the drafts for the object misses a draft that an ambient `editor.read` hides, and the documents the search never read, the stored roots and each spec's base snapshot. So a spec could still leave its key on a live pasted block, and base does the same. The rule for nodes no editor keyed had already had its one replacement, so the panel rule reverted it to base behavior and sent it to a new plan, the [plan for nodes no editor keyed](2026-10-23-plite-unkeyed-insert-liveness.md).
- The strongest deletion is `seedPreparedNodeKeys` and the up-front seeding. Minting becomes one helper for both key kinds, called only for fresh nodes.
- The proof stops in three places. The timing receipt runs on headless Bun, not in a browser. The table and probes cover updates, accepted specs and discarded specs, but not collaboration, and history only through the census. Document views, spec acceptance of `replaceChildren` in another root, a spec over a root no read has cached and the walk of main for each copy of a newly made block stay named limits.

### Risk

- Blast radius. The design depends on three facts. First, a copied node reaches the builder only as a private stand-in that is not frozen, so the builder clones it and the copy never shares an object with its source, even an owned live one (`opus-owned-proto-a2.log`). Second, the index a key read gets for a root holds every key that root holds. A committed update binds the keys it keeps at commit (`committed-binding-base-a1.log`), an open draft keeps the indexes of the roots it changed, deferred mappings included, and a nested spec now starts from its parent's indexes. Only a spec defers a mapping; an update writes each key onto its node, so a command frame, which runs only directly under an update, reads correct keys from nodes. Nested updates throw, so no update starts inside another's draft. Third, a key sits in one root at commit, so a root no open draft changed cannot hold a key the current root held then; the two skip mutants each fail rows of their own. Fourth, a mapped index holds only its base's keys, the keys its mapping claimed or placed, and keys minted after its base was built. A key is written onto its node when it is minted, so an older key outside the first two is absent. The deleted-key branch already relies on the same claim rule. The round-3 case in which a main-root read keys a pasted header block fails on the per-key record and on a mutant that drops the counter, and passes on the counter (`contract-late-design-a3`).
- First failure. A node no editor keyed counts as fresh while it may be live, such as a pasted block no read has keyed, so the insert writes a key onto it. The plan for nodes no editor keyed owns this. Beyond it, a future write path that places an uncloned object would do the same. The contract test's in-draft rows and the census of write kinds cover the known paths, and a new path needs its own row.
- Second failure. A copy, or a move after a draft changed another root, asks other roots' indexes. When no read has built one, the first such insert builds it, 99 to 145 ms at 20,000 blocks under load (`copy-other-root-rebased-a1`, `copy-other-root-final-a1`), and later answers come from that build. A copy into a 20,000-block main took 1.1 to 1.3 ms against 52 ms before the second `architect` run, and a move after each edit to a 20,000-block header added no root walk. A key minted after a root's index was built costs one walk of that root each time an insert asks about it, so each copy of a newly made header block walks main once (`astra-rotating-copy-cand-a2`). A move within one root reads no other root, unless a draft keyed that block after the root's index was built, as the Open work item on late keys says. A spec that copies from or edits a root no read has cached builds that root's index and walks once in every spec, where base reads that root only in the first (`cold-root-cost-lead-probe-a2`, `cold-root-cost-base-a2`). Step 3's six cohorts gate this on the final tree.
- Third failure. A caller relied on a copy sharing its source's key, such as code that reads the copy's key to find the source. No dependent does this, as Dependents below shows.
- Rollback is one revert, because no stored shape or public call changes.

### Dependents

- Cross-editor transfer in `packages/plitejs/src/core/transfer.ts` inserts another editor's nodes and reads the landed key by path, as `tx.key(shellPath)`, never through the passed object. Inserting another editor's node still writes this editor's key onto that object, as before, until the plan for nodes no editor keyed lands.
- `media` reads the key of a fresh image literal right after inserting it, in `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`; a fresh literal still takes its key, which rows update-fresh-literal-passed and spec-fresh-literal-passed hold. The upload plugin does the same with `tx.key(element)` in `packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts`.
- A spec built while another draft is open now reads that draft's index for every root. A key read there of a root the outer draft changed returns the outer draft's key instead of building a new index and minting new live keys. Rows spec-nested-key-read-after-header-paste-accept and spec-nested-key-read-then-insert-after-header-paste-accept check it, and the plitejs suite passes unchanged (`plitejs-bun-proto-a10`). Its run on the final bytes, `plitejs-bun-proto-a11`, failed one test on a 20-second timeout at a load average near 70, and that file times out on base under the same load.
- `list` finds the frozen `tx.schema.create` node it inserted through `tx.nodes.get(element)`, in `packages/platejs/src/features/list/lib/BaseListPlugin.ts`; rows update-schema-create-passed and spec-schema-create-passed hold it.
- `accessibility`, `annotations`, `authored`, `clipboard`, `code`, `collaboration`, `comments`, `compiler`, `distribution`, `dnd`, `editing`, `external-text`, `html`, `large-documents`, `lint`, `markdown`, `mentions`, `native`, `pagination`, `plate-api`, `proof`, `react`, `runtime`, `schema`, `search`, `state`, `styles`, `table` and `ui` are unaffected, because the 47 files they import from insert only fresh literals built at the call, or no nodes at all, and insert keys a fresh literal as before.

### Prior work

- 2026-10-04-model-audit: reopens. That review stopped with the document's shape and its three identities settled; this plan reopens the model scope only for how the insert keys the nodes it places, and keeps the rest of that review's conclusions.
- The [draft keys plan](2026-10-15-plite-draft-keys.md) made a spec draft write the keys it knows onto the nodes it rewrites and made a mapping bind only onto objects that have none. It did not touch how `insertNodes` seeds the nodes a caller passes.
- The [placement-types plan](2026-10-15-transactions-placement-types.md)'s panel found the cross-root duplicate key in rounds 1 and 2. A subtree liveness check was tried and reverted in round 2 because seeding writes keys before any check runs, and the fix moved to this task.
- `pstack:recall` over this owner found no other attempt.
