# Refuse block inserts that do not fit their parent

Status: done
Page: https://claude.ai/artifact/5BapeKdFaY9nCsdGgGvSsK
Playbook: bug-fix

Suggested task `task_60647955` (topic `plite-insert-fit`), started from card `task_019d06d2` in session `local_f1fbe0bf-c00c-4785-9454-94e24bc442ae`. The owner's ask: "Refuse block inserts that do not fit their parent". Its finding: "An insert after a block in a parent that limits its children's count or types throws a schema error, because applyBlockInsertion forwards the anchor without a placement check and Plite's insertAfter stages the insert unchecked". The PR 5170 redo's diff panel found it (`docs/plans/2026-10-14-pr-5170-redo.decisions.tsv`, the `astra-3` row). Run directory: `docs/plans/artifacts/2026-10-15-plite-insert-fit/`. Intake base: `next` at `b1e70bb257` plus the checkout's uncommitted package work, committed in this session's worktree as `d8eb174ca5`; the change lands as a patch on the checkout.

The first plan panel (`panel-plan-r1/`) changed the design in four ways. One checked Plite insert replaces `insertAfter`. Block inserts stop taking a spot inside a block's text. Block insert commands report true or false, so the slash menu keeps its query on a refusal. Table keeps an explicit after literal. The second (`panel-plan-r2/`) kept `tx.nodes.replace` unchanged, treated `after` and `before` as explicit targets in a view, and had slash items turn a refusal into false without widening the completion types. The third (`panel-plan-r3/`) sent AI chat's replace back to `tx.nodes.replace` with a result check, because the checked insert trims a long answer while AI's caret math counts every block. Plans v1 to v3 are `plan-v1.md`, `plan-v2.md` and `plan-v3.md` in the run directory.

## Brief

### What will change?

Inserting a block where it can't go now does nothing and reports false, instead of throwing. It's built, tested and on your checkout, uncommitted.

### What could go wrong?

Code calling the old insert-after method breaks and must switch to the new insert. A block insert can't aim inside a block's text anymore. Code that ignores the new false result carries on as if it inserted.

## Teach

Some blocks limit what goes inside them. A box might hold only one block, or only quotes. Plite checks those limits when an edit finishes, and a broken limit throws an error that undoes the whole edit.

Today every way of inserting a block skips the limits until that final check. So picking Code Block in the slash menu inside a full box throws, and so does inserting before a block or at an exact spot.

Now Plite has one block insert that lands after a block, before one, or at an exact spot, and checks the limits before it writes. A block that doesn't fit changes nothing and reports false, so the slash menu keeps what you typed. Replacing an empty block still works in a full box, because the empty block leaves as the new one arrives.

## Public API

Plite's one checked block insert takes where to land: after a block (the default, from the selection), before one, or at an exact path. It returns the first inserted path, or `undefined` with nothing changed when the blocks do not fit.

```ts before
// packages/plitejs/test/transforms-contract.ts
editor.update.blocks.insertAfter(paragraph('more'), { at: [0, 0] });
```

```ts after
// packages/plitejs/test/transforms-contract.ts
editor.update.blocks.insert(paragraph('more'), { after: [0, 0] });
```

```ts before
// packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts
const target = tx.nodes.get(before);
if (!target) return false;
tx.nodes.insert(elements, { ...insertOptions, at: target[1] });
```

```ts after
// packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts
inserted = tx.blocks.insert(nodes, insertOptions);
if (!inserted) return false;
```

A block insert or upsert command returns whether it inserted or reused a block. A slash item returns that result, and the slash menu turns a false into the combobox's false, so completion keeps the query; the combobox completion type stays `false | void`.

```ts before
// apps/www/src/registry/components/editor/slash.tsx
onSelect: (_editor, tx) => {
  tx.plugin(BaseCodeBlockPlugin).upsert({}, { select: true });
},
```

```ts after
// apps/www/src/registry/components/editor/slash.tsx
onSelect: (_editor, tx) =>
  tx.plugin(BaseCodeBlockPlugin).upsert({}, { select: true }),
```

Block inserts no longer take a point or range `at` or `split`, because a block lands between blocks; a point or range there throws as a caller bug. Inline inserts keep both.

```ts before
// packages/platejs/type-tests/table-plugin-contracts.ts
table.update.insert({ columns: 2, header: true, rows: 3 }, { at: point }),
```

```ts after
// packages/platejs/type-tests/table-plugin-contracts.ts
table.update.insert({ columns: 2, header: true, rows: 3 }, { at: [1] }),
```

## Main changes

- Plite's `tx.blocks.insert` checks a landing against the parent's content rules with the schema's existing `canPlaceAtPath`, on the batch the length limit trims, counting a replaced empty source as removed, and writes that same batch. A refusal returns `undefined` and changes nothing. A missing `after` or `before` target changes nothing too; an `at` path past the parent's end or with no parent throws, as a caller bug. `tx.nodes.insert` stays an unchecked structural write, and `tx.nodes.replace` keeps refusing a single misfit node and leaves a several-node replace to the commit check.
- The view adapter treats `after`, `before` and `at` as explicit targets, so an insert through a view lands even while another root holds the selection.
- Plate's block insert callbacks call `tx.blocks.insert` with the command's own placement options, and drive their follow-up work from the returned path, so the seven copies of the after-or-exact dispatch go. `applyBlockInsertion` passes `before` through instead of resolving it to a path.
- Table promotes a caret insert inside a table to after that table, but keeps an explicit `after` literal.
- AI chat checks its two answer inserts and its replace over an empty paragraph before it selects or marks an answer applied, so a refusal keeps the answer; upload checks its inserts before it tags history or prepares uploads.
- Plite's `nodes.block` reads nothing for a target that names no node, checked in the target's own root, so a block insert or upsert after a missing target changes nothing instead of landing beside or reusing an ancestor.
- Plate's generated `insert` keeps inline and block options apart: a block insert takes the block placement and returns a boolean, an inline insert keeps its node options and returns nothing.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The block insert cuts | Clear both: block inserts drop text spots, and insert-after becomes the one block insert (the owner's answer, "Clear both (Recommended)") | Keep text spots with a fit check | keep text spots | big |
| Where the fit check lives | In Plite, for every block insert | A second check in Plate | plate check | small |
| What insert commands return | Block insert and upsert commands return true or false, and slash items pass it on (look) | Leave them returning nothing | no results | small |
| Table's explicit after | Literal, refused when it does not fit | Promoted to after the enclosing table, as today | table promote | small |
| What a feature insert lands after | One block, as before; the core insert also takes a selection of blocks | Take a selection of blocks in feature commands too | node selection after | small |
| A path with no room | Throws as a caller bug | Refused like a misfit | refuse bad paths | detail |
| A parent that takes text or blocks | Refuse a block beside its empty text; no shipped schema has one | Treat the empty text as leaving | count placeholder | detail |

## Steps

- [x] Reproduce in Plite and in every Plate placement. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/probe-plite-base-a1.log` and `probe-plate-base-a1.log`.
- [x] Run `architect` with three runners and a cross-judge, and synthesize. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/synthesis.md`, the runner answers and `judge/` beside it.
- [x] Panel round 1 on the plan (reviews: `api-plan`). Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/panel-plan-r1/` and the `panel` rows in `docs/plans/2026-10-15-plite-insert-fit.decisions.tsv`.
- [x] Panel round 2 on what plan v2 changed. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/panel-plan-r2/` and its `panel` rows.
- [x] Panel round 3 on what plan v3 changed, the last plan round the cap allows. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/panel-plan-r3/` and its `panel` rows.
- [x] Plite contract cases, each red before its fix and green after, in `packages/plitejs/test/transforms-contract.ts`: a parent at its `max` refuses after, before and a path, and the first of two inserts in one update stays while the second is refused; a parent that refuses the type refuses it; a replace-empty insert over the only empty child of a full parent still lands; a key target in a named root still lands; a refused insert does not undo an earlier edit in the update; `after` and `before` through a view land while another root holds the selection; `before` with a named-root key lands in that root; a point `at` throws. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/plite-red-a1.log` (4 fail at base) and `plite-green-a1.log` (17 pass).
- [x] Plite: `tx.blocks.insert` replaces `insertAfter` in the types, the transaction, the view adapter, Plate's option map and every caller and test. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/teaching-sweep-a1.log` shows no live hit in source, tests or docs pages. Three dated records keep the old name: the 2026-09-21 media research probe, the slash-command ownership decision and the 2026-10-13 media upload plan.
- [x] Plate cases, red then green, in `packages/platejs/src/lib/plugin/block-insertion.spec.ts`: a generated block insert in a full parent returns false and changes nothing from the caret, after, before and a path; a generated inline insert still lands at the caret; the generated, code block and list upserts return true when they reuse a matching empty block; an upsert from an empty paragraph in a full parent replaces it and returns true; an upload before a block lands, and one in a full parent returns false; table returns false and keeps an explicit after literal; a closed Details title's caret insert still lands after the Details; slash completion keeps its query on a refused insert; AI chat's accept below a non-empty block in a full parent keeps the answer. Type tests: a block insert takes a path `at` and returns a boolean, a block insert or upsert given a point `at`, a range `at` or `split` is a type error, and an inline insert keeps a point `at`. The upload, AI and slash cases sit in their own specs, and the closed Details landing and the upload before a block were already covered by `BaseDetailsLanding.spec.ts` and `BaseUploadPlugin.lifecycle.spec.ts`. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/plate-red-a1.log` (17 fail at base) and `slash-red-a1.log` (1 fail), then `plate-alone-a1.log` and the platejs typecheck in `typecheck-plate-a7.log`.
- [x] Plate: block insert commands return booleans, the callbacks call `tx.blocks.insert`, block inserts take a path `at`, table, media, AI chat and upload check their results, and the slash items return false on a refusal. Proof: the diff and the Plate cases.
- [x] Teach it: the two transforms pages, the Plate API page's insertion lines, the Plite and Plate Vision insertion lines with the caller's duty to check the result, one changeset per package and a registry changelog entry for the slash menu. Deviation: the two unreleased changesets that already describe these APIs were amended instead, because the changeset rules forbid a duplicate for an unreleased change. The registry JSON under `apps/www/public/r` is left to CI. Proof: the diff and `docs/plans/artifacts/2026-10-15-plite-insert-fit/teaching-sweep-a1.log`.
- [x] Writing passes: `deslop`, `no-comments`, `unslop`, on the build and on each diff round's fixes. Proof: the four `writing` rows and `docs/plans/artifacts/2026-10-15-plite-insert-fit/lint-task-a7.log`.
- [x] Panel on the diff (reviews: `api-build`), three rounds, the cap. Every critical was applied with a case that fails on that round's frozen tree. Proof: `docs/plans/artifacts/2026-10-15-plite-insert-fit/panel-diff-r1/`, `panel-diff-r2/` and `panel-diff-r3/`, the red logs `r1-red-frozen-a1.log`, `r2-red-frozen-a1.log` and `r3-red-frozen-a1.log`, and the `panel` rows.
- [x] Verify: the full platejs and plitejs suites, both package typechecks with their type tests, both package builds, the www typecheck and `pnpm lint:task` on the task's files. Deviation: the registry build was not run, because it rewrites tracked registry output; the www typecheck and the slash spec cover the changed component, and CI regenerates `apps/www/public/r`. Proof: the `verify` rows and their logs.
- [x] Land the patch on the checkout, log `landed` and offer the follow-up tasks, once the owner clears the block insert cuts. Proof: `docs/plans/artifacts/chips/task_60647955.patch` and the ledger rows.

## Close

**Landed.** The patch applies the work to the checkout's working tree, uncommitted. The decision-trail review stopped it once, because nobody had cleared the two removals. The owner then answered "Clear both (Recommended)", so it landed as built.

**Built.** Plite's checked `tx.blocks.insert` replaces `insertAfter`. A block that does not fit changes nothing and returns `undefined`. Plite's `nodes.block` now reads nothing for a target that names no node, checked in that target's root. Plate's block `insert` and `upsert` return a boolean. Table, media, upload and AI chat check that result, and the slash menu keeps its query on a refusal.

**Proof.** Every new case fails at base, or on the frozen tree of the panel round that found it, and passes now (`plate-red-a1.log`, `slash-red-a1.log`, `r1-red-frozen-a1.log`, `r2-red-frozen-a1.log`, `r3-red-frozen-a1.log`). The final run on the patch's bytes passes 850 Plite contracts, 859 Plate specs and 13 slash cases. The platejs typecheck, both package builds and lint:task exit 0 (`plite-contracts-a8.log`, `plate-specs-a8.log`, `slash-spec-a6.log`, `typecheck-plate-a15.log`, `build-a5.log`, `lint-task-a9.log`). The full platejs and plitejs suites (`packages-test-a3.log`) fail only 13 cases, each attributed to base or to load in the log. The plitejs and www typechecks fail only on base errors.

**Limits.** The full suites ran before the last edits, which removed a dead fallback and rewrote JSDoc. The registry build did not run. Every proof ran in this worktree, not on the checkout with the patch applied.

**Deviations.** The two unreleased changesets were amended rather than duplicated. Plate's `after` takes one block, not a node selection. Feature commands select and reuse a block through its key, which resolves in any root. The checkout moved under seven task files, so the patch was redone on the checkout's copies (`docs/plans/artifacts/2026-10-15-plite-insert-fit/remerge/`). A round 1 JSDoc that named Plite broke the platejs declaration check, which only the build runs; the JSDoc no longer names it.

**Decision-trail review**, reviewed by gpt-6.1-sol. Its critical finding, the uncleared hard cuts, went to the owner, who cleared both. Its three warnings are settled. The late writes are now declared in the ledger. A base control corrects the authored card timeout's attribution, since that case passes alone at base and at this tree. The trail freeze left out two generated files, which the patch carries. Its two nits, the no-comments skill and lint exit markers, are fixed.

**Counts.** 14 steps, all done. The diff panel ran three rounds and applied all 11 criticals. The trail review raised 1 critical, which the owner settled, and 3 warnings and 2 nits, all settled.

## Open work

- Block inserts take after, before and at as optional fields, and their results carry a path local to one root. owner: the owner, through suggested task `t_c1edeaed`. stop: that task lands or is dropped.
- Only the build catches a Plite mention in Plate JSDoc. owner: the owner, through suggested task `t_fff74a53`. stop: that task lands or is dropped.

- AI output landing checks a parent's content rules by hand instead of asking the schema. owner: the owner, through suggested task `t_b30d6b6c`. stop: that task lands or is dropped.
- AI chat's replace of a block selection, and its replace of an empty paragraph by several blocks, still use unchecked writes, so a misfit there throws at commit. owner: the owner, through suggested task `task_bb870590` or one it spawns. stop: that task lands or is dropped.
- A refused upload returns false without telling the user why. owner: the owner, through suggested task `t_5b70fae3`. stop: that task lands or is dropped.
- A generated insert of an inline element whose schema is a function is typed as a block insert. owner: the owner, through suggested task `t_d89d73a0`. stop: that task lands or is dropped.
