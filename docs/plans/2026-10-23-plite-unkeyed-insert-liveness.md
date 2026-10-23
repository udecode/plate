---
review_scopes: [model]
verdict: pursue
review_basis: [2026-10-22-plite-draft-discard-keys]
work_kind: implementation
review_commit: 9b773527db261c15d84492d76938d9a76897d064
review_inputs: [VISION.md, docs/vision/plite.md, docs/plans/2026-10-22-plite-draft-discard-keys.md, packages/plitejs/src/transforms-node/insert-nodes.ts, packages/plitejs/src/utils/node-keys.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/snapshot-index.ts, packages/plitejs/src/core/change/tokens.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/test/insert-node-keys-contract.test.ts, packages/plitejs/test/document-change.test.ts, packages/plitejs/test/collab-canonical-reconcile-contract.ts]
---

# Plite: the insert tells whether a node no editor keyed is live

Status: executed: a quiet-host timing rerun waits in a suggested task
Playbook: plan

Verdict: pursue. Every update keys each node it places as the node lands, so a node with no key for this editor is new. A draft or a command frame still waits to key what it places, as today, and an insert that meets a node with no key first finishes every waiting keying. Today a paste leaves its middle blocks unkeyed until a read asks, so the insert cannot tell a live pasted block from a new one.

## Brief

### What will change?

A thrown-away draft that puts back a pasted block now leaves that block's key alone, and a copy of a block gets its own key. A document view, or a plugin command that rebuilds its blocks, still gives a copy its source's key.

### What could go wrong?

The speed check stayed unsettled on a busy machine, so a follow-up task reruns it on a quiet one. Twenty thrown-away pastes ran 3.5% slower. Nothing was tested in a real browser.

## Teach

Every block in a Plite editor has a key, a name that stays with it while people edit it. Today a pasted block gets its key only when something first asks for it. A draft, a change someone can still throw away, also waits before it keys what it pastes.

The insert treats a block with no key as new and gives it a key. So when a thrown-away draft inserts a pasted block nobody has asked about, the block keeps the draft's key after the draft is gone.

After the change, an update keys each block it places as the block lands. A draft still waits, and so does a plugin command that works on a filtered copy of the document. An insert that meets a block with no key first finishes the keying they put off. A block with no key is then really new, and a draft that is kept passes on the keys it handed out.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When an update keys a pasted block | As it lands, so the insert can trust that a block with no key is new | Key lazily and have the insert search the open drafts for the block, the rule the diff panel reverted twice | key lazily | big |
| Which key an update gives a pasted block | A new key of this editor, the kind today's first read gives it | The key the pasted content reserved, which made every later edit carry extra work and moving a pasted block 1.25 times slower | reserve keys | big |
| When a draft keys what it pastes | Only when something needs it, as today: a key read, an insert that meets a block with no key, or the update that keeps the draft | As each step lands, which made a thrown-away 100-block paste 1.33 times slower | key as they land | small |
| How many changes a draft holds back | 32 per root. Then the draft keys them, as reading a key would. An insert after 200 edits then walks 341 slots, about a tenth of today's 3,675 (look) | No limit, as today, which made that insert walk 6,100 | no settle bound | small |
| A kept draft that read its pasted blocks' keys | Each block keeps the key the draft read | New keys when the draft is kept, which let a later copy take a block's key | drop read keys | small |
| A block another editor keyed | Gets this editor's own key, and the other editor keeps its key | Counts as a copy, so asking this editor for that block's key fails | owner copy | small |
| Records of pasted blocks that are gone | Dropped by the change that removes the last of their blocks | Kept until the next rebuild, which made 300 kept 100-block draft pastes, each undone, take 9.7 s instead of 2.0 s | keep dead records | detail |
| A check that a gone block came back in that same change | None, because a block put back that way keeps its key without the record | Keep the check, which no case needs | reinsert check | detail |
| How a draft records a run of pasted blocks | One record covers the run, so a 100-block paste adds no work per block | Record each block, which reads the whole document once per 100-block paste | record each block | detail |
| How the tests prove a draft left keys alone | After a thrown-away draft, every key matches a run without the draft, each run in its own process | Check that the draft's key differs from the block's key, which now fails by design because the block keeps its own key | keep the old check | small |
| Records a kept draft leaves behind | They stay until the next rebuild, and a suggested task drops them. 300 kept drafts that each paste three blocks and replace one took 6.2 s instead of 1.4 s, one run each (look) | Drop them in this plan. A first try, which dropped them once the update landed, broke three cases that copy a kept draft's block | fix records now | small |
| Blocks read through a document view | Still keyed late, as today, a named limit (look) | Key a view's blocks when the view is made, which reads the whole view each time | key views | small |
| Blocks a command's filtered copy rebuilds | Still keyed late, as today, a named limit; the review mode's filtered copy keeps the stored blocks (look) | Key every block a command's filtered copy shows, which reads the whole copy on each command | key frame blocks | small |
| Speed budget | 10% on pastes, copies and moves after a paste, 5% on typing after a paste | One 5% line everywhere | tighten budget | detail |

## Public API

No call changes shape. What changes is the key a pasted block keeps through a thrown-away draft, which a caller sees through `key`. This is the no-write check's ambient case.

```ts before
// no-write.ts in the run directory, mode ambient-update, at the base commit
editor.update((tx) => {
  tx.fragment.replace([P('a'), P('b'), P('c')]);
  const block = tx.children()[2];
  editor.read((state) => state.transaction((inner) => inner.nodes.insert(block, { at: [0] })));
  // block now carries the thrown-away draft's key: "b": null -> p33
});
```

```ts after
// no-write.ts in the run directory, mode ambient-update
editor.update((tx) => {
  tx.fragment.replace([P('a'), P('b'), P('c')]);
  const block = tx.children()[2];
  editor.read((state) => state.transaction((inner) => inner.nodes.insert(block, { at: [0] })));
  // block keeps the key it got when the paste landed; the draft wrote none
});
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Identities | Runtime `NodeKey` is opaque and never serialized; persisted element IDs are optional and stay with `ElementIdPlugin`, whose `read.id` is the persistence-boundary conversion; the schema fingerprint identifies document semantics, with application lineage kept apart. `insertNodes` sorts each placed node as fresh, moved or copied before it writes any key. Only a fresh caller object takes a key, a moved node keeps its own and a copy gets a new one. An update keys each node it places as the node lands, and `insertNodes` first settles every deferred key mapping an open draft or command frame registered, so a node with no key for this editor is fresh. |

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Key each node an update places as it lands, and let one placement cover a deferred view's whole pasted blocks, kept only by a draft or by an update that adopts its keys | Plite | `plitejs`, `src/core/snapshot-index.ts` | The snapshot index owns which key sits at which path and reads the reserved keys a pasted slice carries |
| Register a draft's latest deferred key mapping of each root under the draft, and drop it when the draft closes | Plite | `plitejs`, `src/core/public-state.ts` and `src/utils/node-keys.ts` | The transaction contexts live in public state, and the key allocator holds what each editor keyed |
| Register a command frame's deferred mapping of its projected roots the same way | Plite | `plitejs`, `src/core/command-frame.ts` | The frame installs its projection's lazy mapping and disposes it with the frame |
| Settle every registered deferred mapping before sorting a node with no key | Plite | `plitejs`, `src/transforms-node/insert-nodes.ts` | The insert sorts placed nodes |

## Main changes

- A key mapping keys every node it places before it returns. After it builds the mapped index, it reads the key at each node touching a changed range. In a draft that binds a placed node to its reserved prepared key; in an update it keeps a node's own key or mints a live one. `CoreWork.landedNodeBinds` counts these reads. Before, a paste's nodes stayed unkeyed until a read asked for each one.
- A prepared placement can cover a run of whole root nodes inside pasted content, not only a complete prepared forest. Every mapping uses it, so a paste's middle blocks need no entry each. A draft's index keeps it, and each middle block resolves to the key the slice reserved for it. An update's index keeps it only when the run's first or last root already carries its reserved key. That happens when the draft's mapping ran before acceptance, through a key read, an insert, or a later step of the draft that mapped at once. Otherwise the update mints live keys at landing and keeps no record, so later edits carry none of the paste's element additions. A mapping still keys every changed node outside a placement, such as the blocks a paste merged into.
- A draft keeps today's deferral of its key mapping and registers it under itself until it closes. Each root keeps only its latest mapping, because each mapping runs the one before it. A command frame registers its projection's deferred mapping the same way, and relies on its projection handing back the stored node for every node it leaves alone. When `insertNodes` meets a node with no key for this editor, it runs every registered mapping, suspended drafts' included, then reads the keys again. Settling runs each waiting mapping once, the work an update does at landing. A root with 32 waiting mappings runs them right away, as a key read in the draft would, so an insert replays at most 31 of them, where base replays every one.
- A placement tracks the paths of its first and last surviving roots, with every other surviving root between them. Each structural change maps their token span, then reads the new end paths from the child boundaries the span lands on. It keeps them only when both land under one parent. Otherwise it gives the ends up, as it does when a change maps an end into text, and the placement stays until the next rebase. A change that keeps every path leaves them alone. A change that empties the span drops the placement, so undoing a paste leaves no record for later edits to carry, unless a merge at either end of the paste gave the ends up first. A root that a change moves or carries, as a wrap does, takes its key from that change, so the ends only need to bound the roots no change touched.
- When the insert asks whether the committed document held a key, it answers from that index's cached paths first, and a key minted after the index gets no without a lookup. Moving a block an earlier update pasted then walks no other root, and splitting a block and moving its new half walks the index once, not twice. Inserting a node this update keyed, such as a split's new half, still asks every other root, which walks a root that changed structurally since its last walk.
- `insertNodes` counts a node with no key for this editor as a copy only when this change placed it earlier or another root holds it. Another editor's key no longer makes it a copy.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Keying at landing | A mapping binds a placed node's key only when a read asks | A mapping reads the key at every node touching a changed range before it returns | `snapshot-index.ts` | An unkeyed live node looks fresh to the insert, which then writes a draft's key onto it | None | The discard case, the contract test, the mutants that drop the binding and that bind only when the update ends | Binding work proportional to the placed nodes on every paste | rearchitect, gated on the paste timing probe |
| Deferred views of pasted content | No placement covers a paste's middle blocks | One placement covers a run of whole roots in a deferred view; an update keeps it only when acceptance adopts its keys | `snapshot-index.ts` | A draft needs the reserved keys without one entry per block; an update that kept every placement made each later edit carry the paste's element additions | None | The cold copy after acceptance, move work against an editor that never pasted, the no-adoption and keep-in-updates mutants | An accepted draft that read its keys keeps the placement, so its later moves cost about what stage 7's did | rearchitect |
| Draft key deferral | A draft with an explicit selection defers its mapping into a closure that only the update taking it runs | The same deferral, registered under the draft as one latest mapping per root, which the first insert that meets an unkeyed node settles, and which a root runs at once when 32 wait | `public-state.ts`, `node-keys.ts` | A nested draft's insert met the outer draft's pasted blocks before they had keys | None | The ambient-spec discard case, the frame-copy case, the settle-bound case, and the skip-settle, never-defer, keep-on-dispose, settle-active-only, drop-on-suspend and no-settle-bound mutants | A spec pays the binds of its own steps, which made a spec of 200 edits walk 12,936 slots against 10,511 on base, and a spec of many pastes scans every placement at each landing bind | rearchitect |
| Command frame key deferral | A frame installs its projection's lazy mapping and registers nothing, so an insert inside the frame meets unkeyed live blocks | The frame registers that mapping under itself like a draft | `command-frame.ts` | A plugin command that copied a visible block gave the copy its source's key and re-keyed the source | None | The frame-copy case, the authored frame case, whose review frame hands back the stored nodes it leaves alone, and the frame-unregistered and frame-clone mutants | A projection that rebuilds the nodes it keeps leaves them unkeyed, as on base; open, owned by suggested task `t_4e37894a` | rearchitect |
| Another editor's node | Copy, the draft-keys plan's rule, so this editor's key lookup fails | Takes this editor's key; the other editor keeps its own | `insert-nodes.ts`, `node-keys.ts` | Keys sit in one slot per editor, so a second editor's key never touches the first's | None | The foreign-editor case and the keys table's foreign row with its new oracle | None found | cut |
| Liveness test for an unkeyed node | Fresh, with two reverted rules, an index mark and a draft search for the object | No search: no key means fresh, because an update keyed every node it placed and the insert settled every waiting draft and command frame | `insert-nodes.ts` | The search missed drafts an ambient read hides and documents it never read | None | The no-write check, the table rows the old plan's revert left failing | A write path that places nodes without a mapping | cut |
| Dead placements | Carried until the next rebuild | Dropped by a change that empties the span between the first and last surviving roots, which each change maps; ends that leave one parent or cross give the ends up | `snapshot-index.ts` | An accepted draft whose mapping ran keeps its paste's placement, and undoing that paste left a dead placement that every later edit carried | None | The relocate, document-diff wrap and remove-first cases; the empty-span-kept, span-lost-on-delete and ends-cross-parent mutants | A change that maps an end into text or under another parent keeps the placement until the next rebase, and a placement an accepted draft adopted stays until then too | rearchitect |
| Registry of suspended drafts | None | None | none | Its reason, a spec applied inside the update it hid, cannot happen: the base refuses that apply | None | The ambient-apply runs | None | keep |
| The draft's "different key" checks | Five probes and one contract case expect a discarded draft's key to differ from the block's | Replaced by the discard case, which compares every key with a run that skips the spec, and by the no-write and no-leak probes for the other modes | `insert-node-keys-contract.test.ts` | Under keying at landing the draft's insert plans a move that keeps the block's own key | None | The case and both probes fail on base in every mode and pass on the prototype | None | rearchitect |

## What other editors do

The how explorer and the lead read Lexical (`dd5c41b13`), Slate (`945a484df`), the slate-v2 fork (`f0e5ad1ae`), Tiptap (`91c51be53`) and prosemirror-model (`6264de0`) from the checkouts beside the repository and ran none of them. Lexical and Tiptap name a node no later than the transaction that places it, and Slate and the slate-v2 fork name it on first lookup, which is the lazy rule this plan replaces for updates.

| Editor | When a placed node gets its identity | Can a later draft write identity onto a live node? |
| --- | --- | --- |
| Lexical | At construction: the node constructor sets its key (`LexicalNode.ts:906`) | No; a draft works on its own clone and node map |
| ProseMirror | Never; nodes are values, and an id is an application attribute | No |
| Slate | On first lookup: `findKey` creates and caches a key for an unseen object (`dom-editor.ts:379`) | Yes; whoever looks first keys the object |
| slate-v2 fork | On first lookup, through `getOrCreateRuntimeId` in the snapshot index (`snapshot-index.ts:4`) | Yes, the same way |
| Tiptap | After each transaction: the UniqueID plugin's `appendTransaction` gives new nodes ids (`unique-id.ts:208`) | Only through a duplicate that plugin misses |

Plite takes Lexical's timing for updates, so a node has its key once the update that places it returns. A draft keeps Slate's lazy keying until an insert or a read needs the keys, and it keeps Slate's object cache, so the cache must hold every live node's key by the time a later draft inserts one.

## Expected results

Each row runs on a main root of two paragraphs and a header root of one, except where the row names its document and the work rows, which run on the paste probe's 20,000-block document. The Check column says how the build proves the row. A `case` row gets a contract case. The lead drafted and cut a `replay` row's case, because every planted bug that fails it also fails a kept case, and Step 2 replays it once. A `probe` row runs a probe from the run directory. The discard case runs each arm in its own process and compares keys exactly. The old plan's table rows also apply. On the prototype the old table fails only its four named limits, which also fail on base, once its foreign-editor row takes the foreign-editor oracle below.

| Row | Rank | Operations | Must result | Base | Prototype | Check |
| --- | --- | --- | --- | --- | --- | --- |
| no-write-ambient-update | P0 | An update pastes three blocks, then an ambient read's spec inserts a pasted block | The spec writes no key onto any object it did not create | fails | passes | replay |
| no-write-view | P0 | A spec in a view of the old value inserts a block an update pasted, discards | The same | fails | passes | replay |
| no-write-change | P0 | A spec that removes a pasted block by document change and reinserts it, discards | The same | fails | passes | replay |
| no-write-remove | P0 | A spec that removes a pasted block and reinserts it, discards | The same | fails | passes | replay |
| no-leak-ambient-spec | P0 | A spec pastes, an ambient read's spec inserts a pasted block, discards; the outer spec is accepted | The outer's keys and the applied keys are those the outer reads for itself at that point | fails | passes | case |
| no-leak-nested | P0 | A spec pastes, a nested spec moves a pasted block, discards | The outer's keys are those the outer reads for itself at that point | fails | passes | replay |
| accepted-read-then-copy | P0 | A spec pastes, reads a pasted block's key and is accepted; an update inserts an unrelated block, then copies the pasted block without reading it | The block keeps the key the spec read, and the copy gets its own | fails | passes | replay |
| accepted-read-then-discard | P0 | The same, but a thrown-away spec reinserts the block | Inside that spec and after it the block keeps the key the first spec read | fails | passes | replay |
| relocate-then-remove | P0 | On 20 blocks, a spec pastes nine, reads a pasted block's key and is accepted; an update moves a later pasted block to the top, then another removes a block before the paste | The read key finds its block, the block keeps it by path and by object, and a copy gets its own key | fails | passes | case |
| diff-wrap-then-insert | P0 | The same paste and read, then a document diff wraps the first pasted block into a quote and drops the next one, then an update inserts a block at the top | The edit does not throw, and the block keeps the key the spec read, by path and by object | fails | passes | case |
| frame-copy | P0 | A plugin command whose filtered view hides a block copies the first visible block, marks the source and removes the copy | Copy and source get different keys, and the marked source stays | fails | passes | case |
| authored-frame-copy | P1 | Under the review plugin, with a block a pending deletion hides, a plugin method copies the last visible block and removes the copy | Copy and source get different keys, and the source keeps its key | passes | passes | case |
| wrap-then-remove | P1 | The same paste and read, then a wrap that starts before the paste carries the read block into a quote, and one change removes the rest of the pasted run | The same as relocate-then-remove | fails | passes | replay |
| reorder-accepted | P1 | On 20 blocks, a spec pastes nine, reads the keys of seven and is accepted; a second spec removes those seven and inserts them back in reverse order and is accepted | Each block keeps the key the first spec read, at its new path, and a copy of one gets its own key | fails | passes | replay |
| nested-draft-own-paste | P1 | A spec inside a spec pastes, then inserts its own pasted block | Keys stay unique inside the nested spec, by path and by object | fails | passes | replay |
| collab-replace-keeps-keys | P1 | A remote whole-document replace rewrites two blocks' text | Each block keeps its key and the root order is unchanged | passes | passes | probe |
| raw-keys-after-paste | P1 | An update pastes three blocks | Every pasted block and text carries its key before any read | fails | passes | probe |
| foreign-editor-node | P1 | Editor B inserts a block editor A keyed | B finds its own key for the block by object and by path, and A keeps its different key | passes | passes | case |
| move-work-after-paste | P1 | An update pastes 100 blocks, then moves a pasted block 40 times | Each move after the first walks as many slots as the same move in an editor that never pasted | passes | passes | case |
| move-walk-after-paste | P1 | Beside a 2,000-block header or none, an update pastes three blocks into 2,000 and the next moves a pasted block to the top | The move walks the index as often with the header as without it | no counter | passes | case |
| discarded-paste-work | P1 | On 2,000 blocks, three specs each paste 100 blocks and are thrown away, then an update inserts a block | No key binds, and the insert does the work it does in a clean editor | passes | passes | replay |
| accepted-paste-cycles | P1 | On 2,000 blocks, 20 specs each paste three blocks, read a pasted block's key and are accepted, and each paste is undone | No paste or undo walks the root | no counter | passes | replay |
| undo-after-removing-first | P1 | Four times, a spec pastes 100 blocks into 2,000, reads one key and is accepted, an update removes the first pasted block, and a document diff restores the original | No acceptance or restore walks the root | no counter | passes | case |
| split-reinsert-work | P1 | An update splits a block, removes its new half and inserts that half at the top | One index walk, as for the same move of a block that was not split | no counter | passes | case |
| settle-bound | P1 | On 20 blocks, a spec pastes three, makes 320 one-character edits and inserts a fresh block | The insert binds no more nodes than after 30 edits | no counter | passes | case |

## Steps

- [x] 1. Write the failing tests. Add a contract case for each `case` row above, following the project's test rules: the frame-copy and authored frame cases to `packages/plitejs/test/command-frame.test.ts` and the rest to `packages/plitejs/test/insert-node-keys-contract.test.ts`, whose discard case runs each arm from `test/support/discard-arms.ts` in its own process. Drop the nested "different key" case they replace. In `packages/plitejs/test/document-change.test.ts`, the token-free publication case expects the reserved key where it expected none, and keeps its token-free assertions. Proof: each new case fails on base, on the checkout's current tree or on a mutant, and each mutant fails at least one case: no-landing-bind, skip-settle, no-spans, no-adoption, keep-spans-in-updates, empty-span-kept, span-lost-on-delete, owner-copy, mint-for-move-sources, never-defer, keep-on-dispose, frame-unregistered, no-minted-since, no-cached-held, ends-cross-parent, ends-dropped, prepared-private, settle-active-only, bind-at-commit, drafts-only-bind, drop-on-suspend, no-settle-bound and frame-clone.
- [x] 2. Port the prototype. Move the changed source files, `snapshot-index.ts`, `public-state.ts`, `command-frame.ts`, `node-keys.ts`, `insert-nodes.ts` and `work.ts`, from the prototype tree into this checkout. Proof: the contract test passes; `pnpm --filter plitejs test:bun`, the core typecheck and the platejs list, upload and media specs pass; the old plan's table fails only its four named limits; the `replay` rows pass once from the test file as drafted before the cut; the no-write, no-leak, raw-keys, collaboration, end-boundary and merge-boundary probes pass; the frame-rebuild probe that Open work names fails on the checkout as it does on base.
- [x] 3. Time the final tree. Proof: `paired-timing.mjs` passes every frozen line of the paste probe with the checkout as the candidate arm, and `cost.ts` shows no root walk for a 3- or 100-block paste or a keystroke after it. Twenty thrown-away specs that each paste 100 blocks and insert a fresh block stay within 1.10 of base over seven alternating runs per side; the fixed prototype ran at 1.02, with overlapping ranges. The old plan's Step 3 receipt runs on the same tree. A conclusive miss sends the design back to `architect`. The step is narrowed. The paired paste timing ran three times and the receipt twice, each inconclusive under load, so suggested task `t_9caf9c36` reruns both on a quiet host. The work counts, the spec series, the cost probe and the copy probe ran here.

The old plan's Step 4 closes both plans' books in one change.

## Close

The diff panel's round 1 found that a placement made a key mapping skip every changed node, not only the blocks it covers, so the mapping now keys every changed node outside a placement. Round 2 found no critical. Its one warning, that the mapping scans every placement for each changed range, went to a suggested task, because a cursor over the placements gave no reliable gain. Its nit about a stale comment removed the comment and renamed the check it explained. Step 3 is narrowed. The paired paste timing ran three times and the old plan's receipt twice, under load up to 103. Each run was inconclusive, because the same code timed against itself varied by about the margin to the budget on almost every line. Suggested task `t_9caf9c36` reruns both on a quiet host, and that hand-off counts as the owner's word for the narrower step.

This plan landed in one commit with the [draft-keys plan](2026-10-22-plite-draft-discard-keys.md). An update keys each node it places as the node lands. A draft and a command frame register the key mappings they put off, and the insert runs those before it treats a node with no key as new. A pasted run of whole blocks shares one placement, a change that empties it drops it, and another editor's block gets this editor's own key.

Proof, from each row's scope:

- Step 1's cases fail on base or on a mutant, and each of the 24 mutants, planted in a copy of the built checkout, fails at least one kept case (`b1` matrix).
- Step 2 passed on the checkout: the contract test, the plitejs suite, the core typecheck, the platejs list, media and upload specs, the old plan's table with only its four named limits failing, the replay file and every probe.
- The round-1 fix's case fails on the reviewed tree and with the fix alone reverted, and passes on the fix. On the final source, the no-write probe records no key write in any of its four modes, and the no-leak probe passes in all three.
- The plitejs suite on the final source passed 5,880 cases, and 11 timed out under load. Run file by file on base and on the checkout, 9 of those pass on both, and the other 2, in the authored collaboration file, time out on both, so suggested task `t_0a13d914` owns them.
- For Step 3, `cost.ts` shows no root walk for a 3- or 100-block paste or a keystroke after it, and the copy-other-root probe gives both copies their own keys. Twenty thrown-away specs that each paste 100 blocks run a median 3.5% slower than base over seven alternating runs, inside the 1.10 budget. The paired paste timing stayed inconclusive, with no candidate median over its budget on the final tree.

The proof stops at headless Bun, not a browser. Authored projections are covered only by the plitejs suite, document views stay a named limit, and the first move after a paste is timed only in fresh processes.

Of the plan's review inputs, the change edits `packages/plitejs/src/transforms-node/insert-nodes.ts`, `packages/plitejs/src/utils/node-keys.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/snapshot-index.ts`, `packages/plitejs/test/insert-node-keys-contract.test.ts` and `packages/plitejs/test/document-change.test.ts`, and closes `docs/plans/2026-10-22-plite-draft-discard-keys.md` with this plan. It leaves `VISION.md`, `docs/vision/plite.md`, `packages/plitejs/src/core/change/tokens.ts`, `packages/plitejs/src/core/change/root-change.ts` and `packages/plitejs/test/collab-canonical-reconcile-contract.ts` as they were, and the collaboration probe built on that contract keeps every key.

The run had one owner message, "continue", and carried it to this close. The plan had three review rounds and the diff two.

Open work below names an owner and a stop for each item.

## Open work

- A document view's nodes are read through a projection that keys them lazily, so the insert treats them as caller literals, as on base. A command frame whose projection rebuilds the nodes it keeps leaves them unkeyed the same way, so a method that copies one gives the copy its source's key, as on base; the authored frame keeps the stored nodes, and no other code can register a projection. A frame's projection can also hide a stored node, such as a block with a pending deletion in suggestion mode. A method that inserts that block gives the copy its source's key inside the frame, and the copy gets its own key at commit. Base re-keys the hidden source instead, and a later lookup throws. owner: the owner, through suggested task `t_4e37894a`. stop: that task lands or is dropped.
- An authored projection that places nodes without a key mapping would leave a live node unkeyed. The plitejs suite and the census found none, and command frames now register theirs. owner: the owner. stop: a case that shows one.
- An accepted draft whose mapping ran before acceptance keeps its paste's placement until the next rebuild, and every placement a draft holds is scanned at each key lookup. Later moves of those blocks keep about 99 element additions alive, as stage 7 did for every paste. 300 accepted replacement cycles take 6.2 s against 1.4 s on base, and one spec of 200 three-block pastes takes 945 ms against 259 ms, one run each. Inserting a node this update keyed, such as a split's new half, walks each other root that changed shape since its last walk. Beside a 20,000-block header with one header insert before each update, four updates that split a block and move its new half took 127, 78, 55 and 55 ms against 6 to 20 ms on base, one run each, as the Opus seat measured them. The 32-mapping bound limits how many mappings an insert runs, not the edits each one carries. After 510 edits in a spec, a fresh insert in a spec nested inside it took 54 ms against 3 ms on base, one run each. In the outer draft itself the same insert took 82 ms against base's 1,632 ms, because base pays for the whole history at its first key read. No frozen cohort covers these paths. Dropping a placement once its roots carry their keys, finding placements by path, or skipping another root for a key minted after that root's last commit could remove them. owner: the owner, through suggested task `t_1a1b60f6`. stop: that task lands or is dropped.
- A caller that keeps a block object from a thrown-away draft and inserts it in a later update gives the block that draft's prepared key, which stays unique but outlives the draft. Base does this for a block the draft created; this plan extends it to a pasted block whose key the draft read. owner: the owner, through suggested task `t_7ae57e2e`. stop: that task lands or is dropped.
- The paired paste timing and the timing receipt stayed inconclusive under load up to 103, because the same code's own spread reached the margin to the budget on almost every line. On the final tree no paste line's median went over its budget. One receipt run called a spec that moves a block beside a 20,000-block header a miss at 1.98 times base, and five runs of that case alone read 0.80 to 1.13, a median of 1.05. owner: the owner, through suggested task `t_9caf9c36`. stop: that task lands or is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort, as the lead.

### Requirements

- A discarded draft never re-keys a block it reinserts (the card).
- The insert decides per node, before it writes any key, whether that node's source is live in any root, and stays out of the key transfer that wrap, unwrap and `replaceChildren` share (the card).
- A transaction spec may consume existing keys and may give a fresh detached node a private prepared key that only the draft resolves; discard leaves no live allocation, and acceptance adopts the exact key (`docs/vision/plite.md`, the `NodeKey` paragraph).
- A collaborator's whole-document replace keeps each block's key where the change is path-stable (`collab-canonical-reconcile-contract.ts`).
- No paste or insert adds work that grows with the document, or with the edits its spec made before it, on its common path.

### Lanes

- A third `architect` run asked how the insert can tell a live node no editor keyed from a fresh one. Three runners at xhigh, gpt-6-astra (cand-1), Opus (cand-2) and gpt-6.1-sol (cand-3), all converged on keying nodes as they land. The lead scored them 18, 12 and 17 and an Opus cross-judge 13, 11 and 16. The lead picked cand-1 and the judge cand-3, and the prototype settled it for cand-3's compressed spans, because cand-1's claim for every landed node read the whole document once per 100-block paste.
- Grafts: from cand-1, removing the spec deferral and the foreign-owner copy rule; from cand-2, the no-write check and the mutant that drops binding at landing. cand-2's registry of suspended drafts was declined, because its reason, a spec applied inside the update it hid, is refused on base ("Cannot apply a stale transaction spec."), which the judge confirmed independently.
- The prototype then went through four stages. Removing the deferral broke a collaborator's whole-document replace, so stage 4 deferred only directly inside an update. Stage 5's paste timing missed on a 3-block paste, which undone pastes' dead placements caused, and on a thrown-away spec paste, which the narrowed deferral caused. Stage 6 drops dead placements, and stage 7 restores today's deferral and settles it late, when an insert meets an unkeyed node.
- Stage 7 kept every check green but moved a pasted block at 1.25 times base against a 1.10 budget, which sent the design to a fourth `architect` run. Three runners at xhigh, gpt-6.1-sol (cand-1), gpt-6-astra (cand-2) and Opus (cand-3), all kept stage 7's mechanisms and differed on when an update keeps a pasted run's placement. The lead scored them 8, 15 and 13 and an Opus cross-judge 8, 15 and 14. Both picked cand-3's rule, kept only when acceptance adopts the run's reserved keys, because cand-2's split adds machinery no case needs. A cold copy after acceptance broke cand-1's rule, which never keeps the placement. The copy took the accepted key.
- Grafts from that run: cand-2's cost attribution, which puts the move cost on the element additions a kept placement leaves alive rather than on the placement itself, and cand-1's mutant that mints keys for move sources. The lead also cut stage 7's check that a dead placement's objects came back in the same change, because a block put back that way keeps its key without the record.
- Plan panel round 1 ran Opus, gpt-6-astra and gpt-6.1-sol at xhigh. Astra found that a move could leave a placement's end paths out of order, so an unrelated delete dropped a live placement and re-keyed a read block. Astra and Sol found that a command frame never registered its deferred mapping, so a plugin command's copy took its source's key. Astra also found that the registry kept one mapping per draft step, and that document views still key late, which stays open. The first repair tracked a token span, which went stale across a text edit and broke the history soak and the authored-tree laws, so the placement keeps its end paths and maps their span per change.
- Plan panel round 2 ran the same seats at xhigh. Opus and Astra found that a placement end could land on a child-list boundary or under another parent after a document diff, so the next structural edit threw; the placement now keeps its ends only under one parent and in order. Astra and Sol found that a settle maps the draft's whole history, so the deferred-mapping counter measured nothing, and it is cut. Sol found that a projection that rebuilds the nodes it keeps leaves them unkeyed. The seat's case fails the same way on base, and the authored frame keeps the stored nodes, so it stays open with an owner. Opus found that the round-1 walk fix moved a walk to the other root, which the cached-path answer removes. A suggested task owns the placement costs Opus and Astra measured. Twelve drafted cases went, because every planted bug that failed them failed a kept case.
- Plan panel round 3 ran the same seats at xhigh. Astra and Sol found that settling replayed every mapping a draft had deferred, so an insert after 200 edits in a spec walked 6,100 slots where base walks 3,675. A root now runs its mappings once 32 wait, and that insert walks 341. Opus and Sol found that round 2 had cut the only case that caught two settle mutants, so the ambient-spec arm came back. Opus found that the authored-frame, raw-keys and collaboration probes could not fail; the authored frame is now a case and the other two exit 1 on a miss. Astra found that the diff-wrap case keyed the block by path before by object, which repaired the cache before the check, so it now finds the block from its key first. Opus measured the other-root walk that Open work names. The mutant matrix now reads the test runner's JUnit report. Two restored cases and the discard case's remove arm went, because a kept case catches every mutant they catch. The relocate case stays, because it is the only case the round-1 tree fails for the placement it dropped.
- Diff panel round 1 ran the same seats at xhigh on the built checkout. Opus answered on a rerun after its first run timed out. Astra found that a placement made the mapping skip every changed node, not only the blocks it covers. So inside a continued spec, the blocks a paste merged into stayed unkeyed, a copy of one shared the source's key, and removing the source by object removed the copy. The mapping now keys every changed node outside a placement, and a new case fails without that. Opus found that 8 of the 23 mutants no longer matched the built code, so the kill claim rested on the prototype. On the checkout's code, each of the 24 mutants, the new one included, now fails at least one kept case. Opus also found two stray type-probe files in the package, now moved to the run folder. Astra's cost of the edits a deferred mapping carries, and Opus's frame that hides a stored node, went to Open work. Sol found nothing.
- Diff panel round 2 ran the same seats at xhigh on the fixed checkout, and no seat found a critical. Astra found that the fix scans every placement for each changed range. Opus measured that a cursor over the placements gained nothing reliable, because most of the added time is keying the merged blocks each paste leaves outside its placement, so that cost went to Open work. Opus also showed that the prepared-path check, not the cut, keeps placement roots from new keys, and found a comment that still said prepared forests key late. The writing pass deleted that comment and renamed the check it explained, so the check's name now says why a reserved root gets no new key. Sol found nothing.
- The proof stops in four places. Timing runs on headless Bun, not in a browser. Authored projections are covered only by the plitejs suite. Document views stay a named limit. The first move after a paste is timed only in fresh processes, outside the frozen probe.

### Risk

- Blast radius. The design rests on four facts, each run on the prototype. First, an update maps the change of a draft it runs, so a deferred draft inside an update loses nothing. The collab replace keeps its keys, and an update's paste is keyed right after it lands. Second, a deferred view's whole roots are the pasted slice's own node objects, which the placement checks before it records the run, and the raw keys after a paste show their keys. Third, every key a landing binds is recorded where a later index finds it: in a draft's placement, in an update's placement when acceptance adopts its keys, in the claimed assignments or as a live key newer than the index. The cold copy after acceptance fails on the mutant that never keeps the placement in an update. Fourth, an ambient spec cannot apply inside its update (`ambient-apply-update-base-a1`). Fifth, a root that a change moves or carries out of a placement keeps its key through that change, so the placement needs no guard for either. The relocate and wrap cases pass without one.
- First failure. An accepted draft whose mapping ran keeps its paste's placement, so later moves of its blocks cost about what stage 7's did, and hundreds of such pastes, or one spec of many pastes, slow each key lookup. Open work names it.
- Second failure. A future write path that places nodes without a key mapping, or defers one without registering it as command frames did, leaves them unkeyed, and the insert counts them as fresh. So does a command frame whose projection rebuilds the nodes it keeps. A method's copy of such a node takes its source's key, as on base. The authored frame, the one projection the editor registers, hands back the stored nodes, and Open work owns the rest. The discard case and the frame-copy case cover the known paths, and a new path needs its own row.
- Third failure. Tests or callers that expect a pasted block to have no key until read, or a live key prefix. `document-change.test.ts` had one; no caller reads a key's prefix.
- The first move after an update paste walks the index twice, where stage 7 walked it once, and the frozen probe's warmup hides that. In 10 alternating fresh processes per side it took 132 ms against base's 128 ms, ranges 119 to 159 and 117 to 278, so base already pays for that move and the second walk adds nothing measurable.
- Splitting a block and moving its new half in one update walks each other root once, because the new half's key is newer than the committed index. Beside a 20,000-block header, three such moves in one editor took 70, 6 and 1 ms, against base's 20, 2 and 1 ms, one run each, because later moves reuse the header's index. That holds only while the header keeps its shape; a header insert before each update makes every such move walk the header again, as Open work says.
- A draft that makes 32 edits to one root runs their key mappings, as a key read would. A thrown-away spec of 200 edits on 2,000 blocks then walked 11,839 slots against 9,432 on base, in 163 ms against 184 ms, one run each.
- Rollback is one revert, because no stored shape or public call changes.

### Dependents

- Collaboration's canonical reconcile replaces whole documents inside an update, and its path-stable mapping keeps each block's key, because a draft still defers its mapping to the update that takes it (`collab-canonical-reconcile-contract.ts`).
- Every caller that reads `editor.key` of a block an update pasted gets a live key minted when the block landed, where base minted it at the first read. Keys are opaque, and committed prepared keys already come from whole-forest pastes.
- `accessibility`, `annotations`, `authored`, `clipboard`, `code`, `collaboration`, `comments`, `compiler`, `distribution`, `dnd`, `editing`, `external-text`, `html`, `large-documents`, `lint`, `list`, `markdown`, `media`, `mentions`, `native`, `pagination`, `plate-api`, `proof`, `react`, `runtime`, `schema`, `search`, `state`, `styles`, `table` and `ui` are unaffected, because their files read a node's key only through `key` or find a node by object, and both return the key the block landed with where they returned one minted at the read; no file reads a key's prefix. The plitejs suite and the platejs list, upload and media specs in Step 2 check it.

### Prior work

- 2026-10-04-model-audit: reopens. That review settled the document's shape and its three identities; this plan reopens the model scope only for when a placed node gets its key, and keeps the rest of that review's conclusions.
- 2026-10-22-plite-draft-discard-keys: retains. The [draft-keys plan](2026-10-22-plite-draft-discard-keys.md) sorts placed nodes before keying, and its diff panel's third round left this rule to this plan, which keeps that sort and changes only when a placed node gets its key.

### Performance gates

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | This plan adds binding work to every paste and changes when a draft maps its keys |
| User-facing operation and runtime owner identified | yes | Paste, typing after a paste, copy and move of a pasted block, and a spec's paste; owner `snapshot-index.ts` and `public-state.ts` |
| Scale variables and cohorts fixed | yes | Document size 20,000 blocks and pasted block count 3, 100 and 500 |
| Budget frozen before target measurement | yes | `perf/paste/budgets.md`, hashed in `perf/paste/frozen.sha256` before any candidate run |
| Baseline and target probe selected | yes | `perf/paste/paste-keys.ts` on the base worktree against the prototype, then the checkout |
| Correctness guard selected | yes | Each cohort checks its document state; the contract test, the no-write check and the no-leak check |
| Production detector decision recorded | N/A | No production detector covers editor key mapping |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Pre-acceptance scale proof | yes | Paired timing of the prototype against base across the seven cohorts | Stage 7 missed on move at 1.25. The final prototype's first run missed paste-3 at 1.18, and a rerun of the same bytes passed it at 0.88 along with paste-100, paste-500, copy and move. Typing after a paste (1.04 against 1.05) and a discarded spec paste (1.06 against 1.10) stayed inconclusive, so Step 3 gates them |
| Production-path rerun | yes | Step 3 on the checkout | pending |
| Correctness guard | yes | Step 2's proof | pending |
| Performance regression check | yes | `cost.ts` walk counts and the contract test's walk cases | pending |
