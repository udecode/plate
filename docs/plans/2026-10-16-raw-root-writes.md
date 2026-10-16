---
review_scopes: [transactions, model]
review_basis: []
work_kind: implementation
review_commit: 0a5cb4f411
review_inputs: [packages/plitejs/test/slice-roots-contract.test.ts, packages/plitejs/test/paste-blocks-contract.test.ts, packages/plitejs/test/content-root-lifecycle-contract.test.ts]
review_upstreams: ['../prosemirror-transform@662b7a9', '../lexical@dd5c41b13', '../slate@945a484df', '../tiptap@91c51be53']
---

# Raw writes settle or refuse the roots they break

Status: executed: both lanes landed as a patch on the checkout, uncommitted
Playbook: plan

Verdict: Pursue, and do both. Requested as suggested task t_3ffc7a0c, which follows the limits of [A paste refuses what commit refuses](2026-10-15-whole-block-roots.md). The two throws have different owners. Removing the last owner of a shared root is a structural write that returns nothing, so only commit can answer it, and in a closed schema commit now drops that root as it already drops an exclusive one. A raw slice write returns whether it landed, so it now asks the schema at its own step whenever its content names a content root, as every paste already does. The cross-judge's point d is real and accepted. A raw slice write that is only valid once a later step removes the old owner now returns false. Only the write itself can report that, and the caller can do the removal first. The code review found that commit's cleanup never reached roots owned inside a dropped root, at base too, and that one cached empty index per root name hid them on a later drop (open task t_08e9b718). Both now go with their parent, because this change sends more roots down that path. Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-16-raw-root-writes/`.

## Brief

### What will change?

Deleting the last block showing a shared area no longer crashes a strict schema; the area, and any area inside it, goes too. A raw paste naming an area another block owns returns false instead of crashing the edit.

### What could go wrong?

A raw multi-step edit that pastes a second owner, then removes the first, loses that paste; removing first works. One that pastes over an owner and puts it back later now crashes, as a normal paste already does.

## Teach

Plite blocks can own extra editable areas, called content roots, like a synced block's body. A root is exclusive, owned by one block, or shared, shown by several. A strict schema, one that rejects anything it does not declare, only accepts a root that some block owns.

Before saving an edit, commit cleans up. A root whose last owner left goes away, but only if it was exclusive. A shared root stays, which an open schema allows and a strict one rejects, so deleting the last shared block crashed. Separately, the low-level slice write checked roots only when it carried them, so one that named an owned exclusive root slipped through and crashed at save.

Now a strict schema drops a shared root with its last owner, cleanup repeats until nested roots go too, and every slice write naming a root asks the schema first. An open schema still keeps an unowned shared root, as the roots guide promises.

## Public API

No call or type changes. Three behaviors change; the third, a root nested in a removed root going with it, has no call of its own. In a closed schema, removing the last owner of a shared root removes the root at commit.

```ts before
// packages/plitejs/test/content-root-lifecycle-contract.test.ts, closed schema
editor.update((tx) => {
  tx.selection.set(acrossTheOwner);
  tx.fragment.delete();
});
// throws EditorSchemaValidationError: Undeclared editor root "shared:1"
```

```ts after
// packages/plitejs/test/content-root-lifecycle-contract.test.ts, closed schema
editor.update((tx) => {
  tx.selection.set(acrossTheOwner);
  tx.fragment.delete();
});
// commits; "shared:1" is gone with its last owner
```

A raw slice write whose content names a content root returns false when the schema would reject the result.

```ts before
// packages/plitejs/test/slice-roots-contract.test.ts
editor.update((tx) => {
  tx.slice.replace(ContentSlice.closed([rootOwner('body:1')]), { at });
});
// throws at commit: exclusive root "body:1" must have exactly one owner
```

```ts after
// packages/plitejs/test/slice-roots-contract.test.ts
editor.update((tx) => {
  result = tx.slice.replace(ContentSlice.closed([rootOwner('body:1')]), { at });
});
// result is false and the document is unchanged
```

## What other editors do

Read at prosemirror-transform `662b7a9`, lexical `dd5c41b13`, slate `945a484df` and tiptap `91c51be53`, none run. ProseMirror checks every step when it applies, which is the per-step half of this pick; no editor has shared owned areas.

| Editor | When a write breaks the schema | An owned area whose owner is deleted |
| --- | --- | --- |
| ProseMirror | Each step is checked as it applies; `Transform.step` throws a failed step and `maybeStep` returns it | none; one tree |
| Lexical | No schema; transforms repair afterwards | A nested editor is a node property, such as `ImageNode.__caption`, so it goes with its node |
| Slate | No schema; normalization repairs afterwards | none |
| Tiptap | As ProseMirror | none |
| Plite after this plan | A slice write naming a root is checked at its step and returns false; a structural write is judged at commit, which drops orphaned roots first | Exclusive roots go with their owner; shared roots go too in a closed schema and stay in an open one |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Drop a shared root with its last owner in a closed schema | Plite | `plitejs` (core entrypoint) | Commit's orphan settle owns what happens to an unowned root |
| Check a raw slice write that names a content root | Plite | `plitejs` (core entrypoint) | The slice fit already checks writes that carry roots |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shared root whose last owner a step removes | Kept; a closed schema then throws at commit | Dropped at commit in a closed schema; kept in an open one | `getOrphanedElementOwnedRoots` in `editor-schema.ts` | A closed schema cannot hold an unowned root, before or after a save and load, so throwing makes the last shared block undeletable | Internal; every commit and every paste check settle through it | lifecycle and landing contract tests, two mutants | A shared root another client still names is gone after merge, as an exclusive one already is | rearchitect |
| Raw slice write whose content names a root but carries none | Unchecked; commit throws on an owner conflict or a missing root | The same checked spec carried roots use | `writeSliceAtRange` in `public-state.ts`, `namesContentRoot` in `content-slice-roots.ts` | The write returns a boolean, so it must answer at its step; a throw at commit discards the whole update | Internal; `tx.slice.replace`, `fitSliceChildren` and the block boundary landing; `state.slice.fit` already refused at base | two landing contract tests, one mutant | A write that a later step would make valid refuses (point d); a write over another root's owner drops that root at its step, so a later step that re-owns it throws at commit, as paste already does | rearchitect |
| Roots owned inside a root that goes with its owner | One orphan pass before a validating finalize, so a nested root throws at commit, at base for exclusive roots too | Orphan passes repeat until none drops | `finalizeWithoutOrphanedRoots` in `public-state.ts` | Each pass can orphan the roots one level down | Internal; commit and every checked slice write | lifecycle test, one mutant | none | rearchitect |
| Owner index of a deleted root | One cached empty document for every deleted root, so a later drop of the same name reads stale nested roots and commits an undeclared root (t_08e9b718) | A fresh empty document per deleted root | `emptyIndexedDocument` in `editor-schema.ts` | Owner indexes are cached per document | Internal | lifecycle test, one mutant | none | rearchitect |
| Raw structural writes (`tx.nodes.insert` of a second exclusive owner) | Judged at commit; throws | Unchanged | commit | They return nothing, and a multi-step edit may pass through invalid states | none | none | Programmer error still throws | keep |
| Root-free raw slice writes | Unchecked | Unchanged | `writeSliceAtRange` | They cannot name a root, and the orphans they leave commit settles | none | cost probe | none | keep |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Deleting the last shared block in a strict schema | Its shared area goes with it | Keep throwing, so it cannot be deleted | keep throwing | big |
| Shared areas in an open schema | They stay after their last block goes, as the guide promises | Drop them too, one rule for both | drop always | small |
| A raw paste naming an area another block owns | It returns false and changes nothing | It lands and the whole edit crashes at save, as before | crash at save | small |
| Paste a second owner, then remove the first, in one edit | The paste returns false; doing the removal first works (look) | Judge only at save, which brings back the crash | judge at save | small |
| A raw paste over a block that owns an area, which a later step puts back | The edit crashes at save, as a normal paste already does (look) | Leave dropped areas to save for every checked paste, a design task of its own | defer drop | small |
| The stale empty index that hid nested areas (open task t_08e9b718) | Fixed here, since this change sends shared areas down that path | Leave it to its own task | split out | detail |
| Design exploration | My own comparison with probes, since the parent run's architect and judge already framed this choice | Run architect again | architect | detail |
| Plan review panel | Skip it, since no call or type changes | Run a panel on the plan | panel | detail |
| Where the verdict lives | In this plan, not as the transactions head review | Write it as the transactions verdict | head | detail |
| The cost of the root-name check on raw pastes, after two runs a busy host left inconclusive | Ship it, since the check runs once per raw paste and walks only the pasted blocks (look) | Hold the change until a quiet host measures it | measure first | small |
| Delivery | A patch on your working tree for you to commit | A commit on a branch | commit | detail |
| The transactions page link, which no longer opened here | A new page at claude.ai/artifact/D17heqLZLTZZRkwSZC5aky replaces claude.ai/artifact/1gmj9dkmNiLTMRn1FPiHkR | Restore the old link | old page | detail |

## Evidence

Model: claude-opus-5-5 (lead).

Prior work: [A paste refuses what commit refuses](2026-10-15-whole-block-roots.md) is retained. Its Defaults row "check raw" and its ledger row for raw `tx.slice.replace` deferred this question to t_3ffc7a0c, and its architect record's cross-judge point d named the multi-step cost this plan accepts. No other plan or review decides how a closed schema treats a shared root without owners; the roots guide (`content/docs/(guides)/roots.mdx`) promises that shared roots survive their last owner, with no schema qualifier.

### Requirements

- An update never throws `EditorSchemaValidationError` for a write a user can make through ordinary editing, such as deleting a block.
- A write that returns a boolean reports false instead of letting commit throw.
- What is valid has one owner, the schema's change check, and commit and paste settle orphans the same way.
- An open schema keeps the documented promise that a shared root survives its last owner.
- Raw structural writes may pass through invalid states inside one update.
- Added cost tracks the write, not the document.

### Lanes

- The pick does both. Commit settles the structural case, and the slice write's own check settles the boolean case.
- Per-step check alone is rejected. `tx.nodes.remove` and `tx.fragment.delete` return nothing, so the last-owner throw stays (census N1 and N4).
- Commit settle alone is rejected. Two exclusive owners are not an orphan, and no rule picks which owner loses, so R3 still throws.
- The strongest deletion, one orphan rule for every schema, deletes the ownership branch but breaks the open-schema promise the guide makes (mutant drop-shared-always fails the lifecycle test).
- A schema-level gate, checking every raw slice write when the schema declares roots, is rejected for a root-name walk. A root-free slice cannot name a root, and it would put a spec and a check on every plain raw write.

### Census

Base `0a5cb4f411` (`probes/census-base-a1.log`) against the prototype (`probes/census-proto-a1.log`), `portal` owning root `b1`; N6 is `probes/nested-cold-a1.log` against the final bytes:

| Case | closed shared | closed exclusive | open shared | open exclusive |
| --- | --- | --- | --- | --- |
| R3 raw slice names the owned root | lands → lands | throws → false | lands → lands | throws → false |
| R3d R3, then remove the old owner | lands → lands | lands → false, root dropped | lands → lands | lands → false, root dropped |
| R3r remove the old owner, then R3 | lands → lands | lands → lands | lands → lands | lands → lands |
| R4 raw slice names a missing root | throws → false | throws → false | throws → false | throws → false |
| N1 remove the only owner | throws → root dropped | root dropped | root kept | root dropped |
| N2 remove, then reinsert an owner | lands | lands | lands | lands |
| N4 fragment delete over the only owner | throws → root dropped | root dropped | root kept | root dropped |
| N6 remove the only owner of a root that owns another root | throws ("o1") → both dropped | throws ("e2") → both dropped | | |

The registered example `/examples/plite/schema-reconfiguration` uses a closed schema with a shared-root card, so N4 is reachable there by selecting across the card and deleting.

### Dependents

- `proof`: `packages/test/test/types/scenario-types.ts`, unaffected, since no exported type or call changes.
- `ui`: `apps/www/src/app/(app)/examples/plite/_examples/schema-reconfiguration.tsx`, affected, since its closed schema holds a shared-root card; `synced-blocks.tsx` uses an open schema and keeps its roots.

## Main changes

- `getOrphanedElementOwnedRoots` counts every former owner, not only exclusive ones, when the schema rejects unknown roots (`orphanedWith`), so commit and the paste check drop a shared root with its last owner there. Its `countOwners` takes an explicit `'any' | 'exclusive'` instead of an optional filter.
- `writeSliceAtRange` takes the checked spec path when the slice carries roots or its content names one (`namesContentRoot`), instead of only when it carries them.
- `finalizeWithoutOrphanedRoots` repeats its orphan pass (`dropOrphanedRootsOnce`) until none drops, before and after finalizing, so roots nested in a dropped root go too.
- Each deleted root gets a fresh empty document (`emptyIndexedDocument`), so the owner index cache never hands one deletion another's stale nested roots.

## Steps

- [x] Census the raw root writes at base and prototype the pick. Proof: `probes/census-base-a1.log`, `probes/census-proto-a1.log`.
- [x] Write one public-boundary test per behavior and show each fails at base. Proof: `build/tests-base-rebased-a1.log`, six of six fail at base `93f6e8a6b6`.
- [x] Show each guard's test fails when its fix is reverted. Proof: `build/mutants-rebased-a1.log`, five mutants and a passing control on the final bytes.
- [x] Freeze a cost budget and run the paired probe on the root-name walk. Proof: `probes/raw-slice-cost-budget.md`, `probes/raw-slice-cost-a3.log`; inconclusive, accepted under the Defaults row "measure first".
- [x] Run the touched plitejs partitions and the core typecheck on the final bytes, with a base run for any failure. Proof: `build/partitions/rebased-typecheck-partition-core-a1.log`, `build/partitions/rebased/fails-core-task-a1.log`, `build/partitions/rebased/fails-authored-task-a1.log`, `build/partitions/rebased/fails-yjs-task-a1.log`.
- [x] Drive the deletion in `/examples/plite/schema-reconfiguration` at base and after the fix. Proof: `drive/base-after-delete.jpg`, `drive/task-after-delete.jpg`, `drive/hand-drive-check-a1.log`.
- [x] Update the roots guide's shared-root paragraph in both docs pages through `plate-docs`. Proof: the shared-ownership paragraph of `content/docs/(guides)/roots.mdx` and `content/docs/plite/concepts/13-roots.mdx`.
- [x] Add a changeset through `changeset`. Proof: `.changeset/plite-raw-root-writes.md`.
- [x] Run the writing passes and the `thermos` review on the diff, then fix its findings. Proof: `review/thermo-bugs.md`, `review/thermo-quality.md`, `writing/comment-sicko-round2.md`.
- [x] Run `pnpm lint:fix` on the task's files, save the patch and apply it to the checkout. Proof: `build/lint-fix-a1.log`, `build/lint-check-rebased-a1.log`, `docs/plans/artifacts/chips/t_3ffc7a0c.patch`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Cost probe on the final bytes | inconclusive twice, accepted as "measure first" (`probes/raw-slice-cost-a3.log`) |
| Partitions and typecheck | typecheck passes; every failure on `93f6e8a6b6` also fails at base (`build/partitions/rebased/`) |
| Hand drive | base throws, the fix deletes the card and its root (`drive/`, `drive/hand-drive-check-a1.log`) |
| Docs | one sentence in `content/docs/(guides)/roots.mdx` and `content/docs/plite/concepts/13-roots.mdx` |
| Changeset | `.changeset/plite-raw-root-writes.md` |
| Writing passes (`deslop`, `no-comments`, `unslop`) | two rounds (`writing/comment-sicko-round1.md`, `writing/comment-sicko-round2.md`) |
| `thermos` review | `review/thermo-bugs.md`, `review/thermo-quality.md` |
| `pnpm lint:fix` on the task's files | `build/lint-fix-a1.log`, then a clean check on the rebased bytes (`build/lint-check-rebased-a1.log`) |
| Patch applied to the checkout | `docs/plans/artifacts/chips/t_3ffc7a0c.patch` |

## Close

Reversals:

- The code review widened the build past the brief's two throws. Roots owned inside a dropped root now go with it, and each deleted root gets its own empty owner index. This also fixes open task t_08e9b718; the word "split out" in Defaults reverses that.
- The changeset no longer claims `state.slice.fit`, because it already returned false at base.
- The run was built on `0a5cb4f411`, but the checkout's `next` had moved to `93f6e8a6b6`, so the patch refused two files. The change now sits on `93f6e8a6b6`. The paste test moved to `paste-blocks-contract.test.ts` and the two raw slice tests to `slice-roots-contract.test.ts`, the files that split from `slice-landing-contract.test.ts`. The tests, mutants and partitions reran on the new base. The census, the browser drive and the cost probe ran on `0a5cb4f411`.
- A checked raw slice write over another root's owner drops that root at its own step, so a later step that re-owns it throws at commit, as paste already does. The Defaults row "defer drop" accepts this limit, and suggested task t_2fb99e63 holds the fix.

This run landed the four main changes above, six new or changed contract tests, one docs sentence in each roots page and a patch changeset. They sit uncommitted on the checkout's working tree, applied from `docs/plans/artifacts/chips/t_3ffc7a0c.patch`.

Proof:

- Six of six new or changed tests fail at base `93f6e8a6b6` (`build/tests-base-rebased-a1.log`), and five mutants each fail a named test on the final bytes (`build/mutants-rebased-a1.log`).
- The census shows each base throw, and its outcome after the fix, in closed and open schemas (`probes/census-base-a1.log`, `probes/census-proto-a1.log`, `probes/nested-cold-a1.log`).
- In the browser, base throws "Undeclared editor root" and keeps the document. The fix removes the card and its root, and typing works after it (`drive/`).
- On `93f6e8a6b6`, the core typecheck and the history, dom and diff partitions pass. Run beside base, the task passes core where base fails two timeouts, its four authored failures are among base's five, and yjs fails the same nine tests at base (`build/partitions/rebased/`). The run on `0a5cb4f411` matched base the same way once long-timeout reruns cleared its timeouts.
- The paired cost probe was inconclusive twice, because host load passed its limit of 36 (130 and 154) and same-code noise reached 0.199 (`probes/raw-slice-cost-a2.log`, `probes/raw-slice-cost-a3.log`). The candidate scored 0.786 on the normal cohort and 1.123 on the large one, against a line of 1.10. It ships under the Defaults row "measure first", and a quiet-host rerun is open work.

No collaboration test covers dropping a shared root that another client still shows. The drive ran at desktop width only. The partitions ran on a host whose one-minute load was 96 to 361, so their timeouts say nothing either way. No decision-trail review ran, because the owner started this run from a card and followed it in one session.

All 10 steps are done. The subject's Open work holds what remains: t_2fb99e63, the collaboration risk and the quiet-host cost rerun.

Side findings, each offered as a suggested task:

- Clicking beside the content card throws a view-boundary error at base too (t_9150bc96).
- The owner index cache can alias two documents (t_7453feaa).
- Seven functions repeat one walk over the roots that elements own (t_50d32607).
