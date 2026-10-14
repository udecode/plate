# Exit block lands the block its container declares

Status: executed: ready for your commit; the API reference manifest waits on other sessions' work
Page: https://claude.ai/artifact/9Lnxj4wmK91TLSVuM7CQP5
Playbook: bug-fix

## Brief

### What will change?

Mod+Enter, and Enter on a callout's empty last line, now add the block the container expects, one level out. Under a required title you get a paragraph, not another title.

### What could go wrong?

A full container, or one with no usual block, makes the key do nothing. Code blocks and callouts in containers still jump out, as before. Speed was unclear, and the Close covers three gaps a log review found.

## Teach

An exit break makes a fresh empty block next to the structure you are in, so you can keep typing outside it. Mod+Enter does it, and so does Enter on an empty last line of a callout. It needs two answers: which level to leave, and which kind of block to make there.

Plate gets both wrong in odd schemas. It always makes the document's first block type, so a document that must open with a heading gets another heading. It picks the level by asking whether that wrong block fits, so it can jump out of a container that holds paragraphs.

After the change, Plite answers both. It walks out from your block and stops at the first container that sits right in the document, or whose parent can hold a paragraph. A table row can't, so the walk leaves the whole table. There it makes that parent's usual block, if it has one and has room.

## Public API

Raw Plite gains one transaction verb beside `tx.break.insert()`; Plate's exit plugin and exit rules call it.

```ts before
// packages/plitejs/src/interfaces/editor.ts
export type EditorTransactionBreakApi = {
  insert: () => void;
  insertSoft: () => void;
};
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
export type EditorTransactionBreakApi = {
  /** Leave the nearest structure around the selected block: insert and select the default its parent declares there. */
  exit: (options?: EditorBreakExitOptions) => boolean;
  insert: () => void;
  insertSoft: () => void;
};
```

The exit plugin's own calls keep their shape and now go through a local `exit` that calls the Plite verb when the caret is collapsed.

```ts before
// packages/platejs/src/utils/plugins/ExitBreakPlugin.ts
insert: txLocate(false, (options: Omit<ExitBreakOptions, 'reverse'> = {}) =>
  insertExitBlock(tx, options)
),
```

```ts after
// packages/platejs/src/utils/plugins/ExitBreakPlugin.ts
insert: txLocate(
  false,
  (options: Omit<EditorBreakExitOptions, 'before'> = {}) => exit(options)
),
```

## Main changes

- `packages/plitejs/src/editor/exit-break.ts` owns exit. It walks the selected block's strict ancestors nearest first and stops at the first one that sits in a root, or whose parent can directly hold the block the root creates by default after the current top-level block (`findWrapping` finds no wrapper). With none, it uses the selected block. `match` filters ancestors only. This is base's level rule with the root's positional default in place of its first slot.
- One private Plite helper builds the parent's positional default (`createDefaultChildAt`) in the active update root, admits it with `canPlaceAt` against that root's live children, inserts it and selects it. `breakAtSelectedBlockVoid` and exit both call it. A parent with no default or no room returns `false` and changes nothing.
- `packages/platejs/src/internal/plugin/insertExitBlock.ts` is deleted. `ExitBreakPlugin` and the `exit`/`deleteExit` rule actions in `OverridePlugin` call `tx.break.exit`. A rule exit with a collapsed caret that cannot land returns `false`, so Enter does nothing and the newline stays; an expanded selection still falls through. The exit shortcuts use up the key whenever the caret is collapsed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Exit with no room where the block lands | Nothing happens, no crash | Keep climbing to the next level that has room | climb | small |
| Enter rule exit that cannot land | Enter does nothing, your text stays | Fall back to a normal Enter | fall through | small |
| Mod+Enter that cannot land | The key does nothing | Let other key handlers and the browser take it | pass on | detail |
| Callout or code block inside a container | Leaves the whole container, as today | Let the selected block be the structure too; then a plain paragraph would only get a sibling and never leave its container | block first | small |
| Container that declares no usual block | Exit does nothing | Make the document's usual block there, as before | root default | small |
| Media caption Enter and plain paste over a picked block | Left for a follow-up task; same bug, different code | Fix both in this run | fix all | small |
| Exit plugin | Kept as the shortcut you opt into | Remove it and bind keys to the new method | cut plugin | detail |
| Option for the side to land on | before, a yes or no | reverse | reverse | detail |
| Where this page lives | Its own page | The basic blocks page, whose plan another session still has open | basic page | detail |
| Speed check came out unclear | Keep the fix (look). The timing test couldn't give a clear answer. In this run it looked a bit faster with normal paragraphs and up to a tenth of a millisecond slower in an unusual deeply nested setup | Hold the fix until a rerun passes | hold for speed | small |
| Tests that fail without this fix too | Don't count them against this fix (look). The same 14 tests fail with the fix taken out | Wait for those sessions to fix them, then rerun | rerun after them | small |
| Exit throws when the document's usual block can't be made | Keep it as before this fix (look). The key hits an error and changes nothing. No setup in this repo runs into it | Rework how exit picks its level before you commit | rework level | small |

## Steps

- [x] 1. A private helper `insertDefaultChild(editor, at, { voids })` resolves the parent at `at`, builds its positional default in the active update root, admits it with `canPlaceAt` against that root's live children, inserts it with `select: true` and returns whether it landed. `breakAtSelectedBlockVoid` calls it with `voids: true` and keeps its handled `true`. Proof: the plitejs tests that cover block-void Enter pass after the change, as they did before it.
- [x] 2. Plite `exitBreak(editor, { before, match })`, `EditorTransactionBreakApi.exit` and exported `EditorBreakExitOptions`, wired in `public-state.ts` beside `break.insert` as a selection mutation in the active root. Proof: step 4's specs.
- [x] 3. Plate: delete `insertExitBlock.ts`. `ExitBreakPlugin.update.insert`/`insertBefore` return `false` without a collapsed caret, else call `tx.break.exit` and return `true`. `OverridePlugin` runs `exit`/`deleteExit` only with a collapsed caret, else falls through; when exit refuses, it returns `false` and drops its draft. Proof: step 4's specs.
- [x] 4. Specs, written first: the two `ExitBreakPlugin.spec.ts` cases already red at base (`spec-red-base-a1.log`); a full-container case that leaves the document unchanged and reports the key handled; an `OverridePlugin.spec.tsx` case where a refused `deleteExit` keeps `foo\n`. Proof: each new case red at `HEAD` through `proof-worktree.mjs --expect-fail`, then green; the existing table, section, code-block, callout and named-root cases stay green.
  The container case first used a root whose default is a title. After diff round 1 changed the level rule, that case lands a title after the box again, as at `HEAD`. So the spec moved to the user's root, which requires a leading heading (deviation, logged). Its red run at `HEAD` is `docs/plans/artifacts/2026-10-14-exit-block/spec-red-head-r2-a1.log`.
- [x] 5. Docs through `plate-docs`: `content/docs/api/editor-transforms.mdx` teaches `tx.break.exit`. The approved step said "and its Chinese twin", but that twin has no break section to put it in (deviation, logged); `exit-break.mdx`, its twin and the demo values `exit-break-value.tsx` (both locales) say which level exit leaves, which block lands and that a full landing parent refuses. Proof: the docs source parity check and `pnpm check knowledge`.
  Done: `docs/plans/artifacts/2026-10-14-exit-block/www-docs-parity-a2.log` passes, and the knowledge check on `HEAD` plus this run's docs reports only `HEAD`'s own finding (`docs/plans/artifacts/2026-10-14-exit-block/check-knowledge-patched-a1.log`).
- [x] 6. `best-api repair`: the Vision owner of block landing names exit as a reader of the positional default; `teaching-sweep.mjs` for `insertExitBlock` and the paragraph-sibling wording. Proof: the sweep log.
  Done: `docs/vision/plite.md` names exit; `docs/plans/artifacts/2026-10-14-exit-block/teaching-sweep-insertExitBlock-a2.log` finds no live doc, demo or package that names the deleted helper, and `docs/plans/artifacts/2026-10-14-exit-block/sweep-paragraph-sibling-a1.log` finds only the two demo bullets, which still match the rule.
- [x] 7. Changesets for `plitejs` (new `tx.break.exit`) and `platejs` (exit lands the container's default; a full landing parent refuses). Proof: the changeset files.
  Done: `.changeset/plite-break-exit.md`, `.changeset/platejs-exit-break-default.md` and the registry entry `apps/www/src/registry/changelog/entries/2026-10-14-exit-break-demo-copy.mdx`.
- [x] 8. Benchmark pre-acceptance probe through `benchmark`: base against candidate on Mod+Enter at nesting depth 1, 8 and 32, with a cheap and a deep required default. The budget was frozen before any candidate result. In every cohort, the median wall time of one Mod+Enter on the candidate is at most 1.10 times base. `paired-timing.mjs` judges it with a same-code copy of the candidate, a planted copy that adds 30% busy work to `exitBreak`, and a one-minute load limit of 9 on 18 cores. Mod+Enter runs once per gesture, so a 10% margin is enough. Proof: `bench/paired-config.json` and its measurements in the run directory.
  Inconclusive on the final bytes (`docs/plans/artifacts/2026-10-14-exit-block/bench-paired-a3-analyze-a1.log`, judged from `docs/plans/artifacts/2026-10-14-exit-block/bench/measurements-a3.json`), accepted on the Defaults row "Speed check came out unclear". The candidate tracks its same-code copy in every cohort. The planted arm slows only `exitBreak`, a third to a half of one Mod+Enter, so it cannot clear the budget plus noise. The Open work item for the build-free level read runs the rerun.
- [x] 9. Proof on the final bytes: the touched `platejs` and `plitejs` partitions' tests and typechecks, `pnpm lint:task` on the task's files, `pnpm brl` if barrels move, the API reference manifest when its check needs it, and a hand drive of the exit-break docs demo. Proof: `proof.mjs` logs and the hand-drive log in the run directory. The manifest moved to Open work, because other sessions' unfinished work blocks the build it reads (deviation, logged).
  Done: the partition logs `docs/plans/artifacts/2026-10-14-exit-block/final-plitejs-test-core-a1.log` through `docs/plans/artifacts/2026-10-14-exit-block/final-platejs-typecheck-core-a1.log` and `docs/plans/artifacts/2026-10-14-exit-block/final-plitejs-test-authored-a3.log` pass; `docs/plans/artifacts/2026-10-14-exit-block/final-platejs-test-standard-basic-nodes-a1.log` fails only tests that also fail without this fix (Defaults row "Tests that fail without this fix too"); `docs/plans/artifacts/2026-10-14-exit-block/lint-task-a2.log` is clean; no barrel names this run's files; the hand drive `docs/plans/artifacts/2026-10-14-exit-block/hand-drive-check-a2.log` covers every scoped cell.

## Close

Reversals and deviations come first.

- Step 5 said the Chinese twin of the transforms reference would teach `tx.break.exit`. That twin has no break section at all, so it doesn't.
- Step 9 said this run regenerates the API reference manifest. Other sessions' unfinished work blocks the build the manifest reads, so it moved to Open work.
- The level rule changed under review. The first build stopped where an ancestor's type differed from its parent's default. Diff panel round 1 showed that this exits a table's row from a header cell and skips a box's required leading section. Exit now uses base's rule, with the root's positional default in place of the root's first slot.
- A container that declares no default block first made exit climb one more level. Round 1 showed base kept the block inside, so exit now changes nothing there.
- Two reasons logged earlier were wrong, and the log corrects both. Base did not climb past the quote, and trying the selected block first did not land a second summary.
- Round 2's demo copy edits went back to `HEAD`'s wording, except the line that now mentions columns.
- The container spec moved from a title-default root to the user's heading-first root after round 1. In a title-default root, exit from a quote inside a box still lands a title after the box, as at `HEAD`. The claim narrows to roots whose default a container can hold, and the case moved to Open work.
- The decision-trail review found three critical gaps in the log. This run reran each seat's case at the intake commit instead of against current Plite (`docs/plans/artifacts/2026-10-14-exit-block/trail-parity-head-a1.log`, `docs/plans/artifacts/2026-10-14-exit-block/trail-parity-tree-a1.log`). It also counted the trigger in the repository's shipped schemas and restored the Open work item that the plan panel's dismissal had promised.
- This run first accepted `check:docs` as another session's failure. Its first link checks the API reference manifest, which this run leaves stale, so it now waits with the manifest instead.
- Diff panel round 2 had one critical, from Astra and Sol. The level check builds the root's default before it walks, so exit throws where that block cannot be built. This run now dismisses it as rare and recoverable. Every seat case throws the same way at the intake commit and leaves the document unchanged, and none of the 10 root schemas the repository ships outside tests has a default with a required property (Defaults row "Exit throws when the document's usual block can't be made"). The build-free level read in Open work removes the throw.

What landed:

- Plite `tx.break.exit({ before?, match? })` and the exported `EditorBreakExitOptions`, wired in `public-state.ts` beside `break.insert`.
- One private Plite helper, `insertDefaultChild`, shared by exit and `breakAtSelectedBlockVoid`. It builds the landing parent's positional default in the active root, admits it with `canPlaceAt` against that root's children, inserts and selects it, and changes nothing when refused.
- `insertExitBlock.ts` is gone. `ExitBreakPlugin` and the `exit` and `deleteExit` rules in `OverridePlugin` call `tx.break.exit`.
- Specs in `ExitBreakPlugin.spec.ts`, `OverridePlugin.spec.tsx` and `packages/plitejs/test/break-exit.test.ts`; the exit docs and their Chinese twin, the transforms reference, Vision, both demo values, two changesets and a registry changelog entry.

Proof and its limits:

- The four step 4 specs failed at `HEAD` and pass on the build (`docs/plans/artifacts/2026-10-14-exit-block/spec-red-base4-a1.log`, `docs/plans/artifacts/2026-10-14-exit-block/spec-green-a2.log`).
- Each of 13 mutants of the final guards fails its named test, on a tree whose package files match the final ones (`docs/plans/artifacts/2026-10-14-exit-block/mutate-run-3.log`, `docs/plans/artifacts/2026-10-14-exit-block/mutate-run-4.log`). `match` and the shortcut's expanded-selection gate have no mutant.
- The plitejs core, dom, react and history tests pass, along with its core, dom, react, authored and test typechecks. The platejs core, callout, details, layout and table tests pass, along with its core typecheck. All ran on the checkout at 00:25Z, whose task files hash-match the reviewed tree.
- platejs standard-basic-nodes fails 14 tests, and all 14 also fail with this fix taken out (accepted, word "rerun after them").
- The plitejs authored partition timed out on two property tests at 5 seconds under a load of 40 to 116. It passes on the checkout once the load dropped to about 8 (`docs/plans/artifacts/2026-10-14-exit-block/final-plitejs-test-authored-a3.log`).
- The docs registry build, its freshness check, the source build and the docs parity check pass. `check:docs` is blocked. Its first link fails on another session's export, and this run's stale manifest would fail it too. The knowledge check finds nothing new over `HEAD`.
- The hand drive covered all 27 scoped cells after the last doc edit. Lint is clean on 15 of the 16 files; lint ignores the API reference config. The exit specs pass again after lint.
- The speed probe is inconclusive (accepted, word "hold for speed"). Base takes 0.3 to 1.65 ms per Mod+Enter. The candidate stays within noise of its same-code copy. Against base, it measured 5 to 12 percent faster with a paragraph default and 2 to 10 percent slower with an 8-level required default. The planted control could not fail the line, so neither number is a verdict.
- Only the hand drive covers native Mod+Enter in a browser. This run did not regenerate the manifest. The prefix-root case, the title-default root case, the code block or callout inside a container, and the throw where the root's default cannot be built all remain, as at base.

Counts, over 9 steps and 6 open work items: 8 done, 1 partial (step 8, accepted), 0 skipped, 1 blocked (the API reference manifest) and 5 open (the other open work items).

Attention, from the decision-trail review (`docs/plans/artifacts/2026-10-14-exit-block/trail-review/answer.md`), each with what this run did:

reviewed by gpt-6.1-sol

- The original title-root container acceptance case was replaced after it failed; that goal remains unmet. Logged as a deviation, the claim narrows, and the case is in Open work.
- Round 2’s critical requires the mechanism’s revert/replanning path. Not taken. This run dismissed the critical as rare and recoverable instead, on the seats' cases at the intake commit and a count of none in 10 shipped root schemas. The Defaults word "rework level" takes the revert path.
- The two initial critical dismissals remain unsupported after their rationale was corrected. They now rest on runtime parity at the intake commit and on the ask's scope, and the Open work item they promised is back.
- Step 9 remains open pending the authored partition proof. The authored partition now passes on the checkout.
- Speed is inconclusive; repair its acceptance record and remove definite performance claims. A `proof.mjs` re-judge of the same measurements is now the record, and the speed wording says what was measured, not a verdict.
- The docs blocker is source-attributed, not backed by an unpatched comparison; the manifest remains stale. `check:docs` moved from accepted to blocked, with the manifest.
- Suggested-task offers do not establish autonomous follow-through or adequate stops. Each stop now waits for its task to land or for you to dismiss it, and the prefix-root item names its trigger check.
- Record the omitted writing-order slip before committing. Logged.

## Open work

- Media caption Enter builds the root's slot-zero default for a nested position (`packages/platejs/src/features/media/lib/BaseMediaPlugin.ts:289`; `docs/plans/artifacts/2026-10-14-exit-block/probe-audit-base-a2.log`). A follow-up decides whether it routes through `tx.break.exit` or needs a positional insert. owner: zbeyens. stop: the suggested task "Land nested-position defaults for caption Enter and paste" lands on `next`, or the owner dismisses it. Tracked here and in that task.
- In a root whose prefix puts a non-body slot after a container, exit measures that container against the slot instead of the body default, so it can leave two levels (`docs/plans/artifacts/2026-10-14-exit-block/panel-diff-2/opus/answer.md` finding 1). No shipped root has such a prefix. A root-wide body default read would fix it. A level read that builds no block would also stop exit from throwing where the root's default cannot be built; base throws there too (`docs/plans/artifacts/2026-10-14-exit-block/seat-probe-r2-base-parity-a1.log`). It would also drop the second build of the root's default, the inferred cause of the deep-default cohorts running 2 to 10 percent over base. That follow-up reruns the paired probe in `docs/plans/artifacts/2026-10-14-exit-block/bench/paired-config-a3.json` with a planted arm sized to the whole Mod+Enter and three times the samples, against the same frozen budget: in every cohort the candidate's median Mod+Enter is at most 1.10 times base. A conclusive miss sends exit's level read back to `architect`. owner: zbeyens. stop: the suggested task "Make exit's level read build-free and root-wide" lands on `next`, or the owner dismisses it. Trigger check: `git grep -n "schema.content.prefix(" -- packages apps templates` finds a shipped root whose prefix puts another slot after a container. Tracked here and in that task, which `docs/plans/2026-10-14-exit-level-read.md` runs; this item closes when the owner commits that plan's build.
- Plain-text paste over a node-selected block builds the root's default for a nested position (`packages/plitejs/src/dom/plugin/data-transfer-format.ts:328`; `docs/plans/artifacts/2026-10-14-exit-block/probe-paste-base-a2.log`). owner: zbeyens. stop: the suggested task "Land nested-position defaults for caption Enter and paste" lands on `next`, or the owner dismisses it. Tracked here and in that task.
- The API reference manifest still lacks `tx.break.exit` and `EditorBreakExitOptions`. This run lists `EditorBreakExitOptions` in `apps/www/api-reference.config.json`, but regenerating the manifest waits on two other sessions' uncommitted work. plitejs fails to build on a missing `AuthoredReview` export (`docs/plans/artifacts/2026-10-14-exit-block/apiref/build-plitejs-a1.log`), and `check:docs` stops on an unconfigured `SchemaRoot` (`docs/plans/artifacts/2026-10-14-exit-block/www-check-docs-a2.log`). Once both land, run `pnpm --filter www api-reference`. Until then `check:docs`, whose first link is that check, fails too. owner: zbeyens. stop: `pnpm --filter www api-reference --check` passes on `next`. Tracked here.
- A code block or callout inside a container still leaves the whole container, and a callout in an application section leaves the section. That breaks the locked rules `EDIT-GLOBAL-001` and `EDIT-GLOBAL-003` in `docs/editor-behavior/markdown-editing-spec.md`, as base does (`docs/plans/artifacts/2026-10-14-exit-block/trail-parity-head-a1.log`, `docs/plans/artifacts/2026-10-14-exit-block/trail-parity-tree-a1.log`). In a root whose default is a title, exit from a quote inside a box lands a title after the box, also as base does (`docs/plans/artifacts/2026-10-14-exit-block/spec-green-a5.log`). Both need exit to tell a plain text block from a structure at each level, which the level rule cannot do today. owner: zbeyens. stop: the suggested task "Make exit leave only the nearest structure" lands on `next`, or the owner dismisses it. Tracked here and in that task.
- `docs/plans/topics/basic.md` still lists the slot-zero exit defect under its Open work, with the stop "the suggested task lands". This run is that task, so the item closes when the owner commits it. The file belongs to the basic subject's open plan, so this run leaves it alone. owner: zbeyens. stop: the basic subject's next fold. Tracked in that file.
