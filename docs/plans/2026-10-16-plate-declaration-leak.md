# Catch a plitejs JSDoc that Plate's declarations bundle

Status: executed: the fix is in the working tree, waiting on your commit
Page: https://claude.ai/artifact/DbL1VUqfZQhLypYqHLpeC5
Playbook: verdict

Pursue, with a different catch than the task asked for. The platejs build already refuses a plitejs JSDoc that leaks into Plate's types, and only that build knows which plitejs declarations Plate reaches. None of the lint designs checked here can own the check, and the run infers that none can. The fix makes the build's refusal name the plitejs source line instead of a hashed chunk line, and rewords the one live leak, which made the platejs build fail on `next`.

## Brief

### What will change?

The platejs build now points at the exact plitejs line that leaks the word Plite, so the fix takes a minute. The one live leak is reworded, and the platejs build passes again.

### What could go wrong?

A leak still shows up only when you build, not when you lint. If plitejs changes how it builds its types, the error goes back to naming a generated file.

## Teach

Plate publishes its types as one bundle, and that bundle copies in the plitejs types Plate uses, comments included. Plate's types must never mention Plite, so the last build step scans the bundle and refuses any mention.

Before, that refusal named a line in a generated file with a random name. You had to search plitejs by hand to find the comment that caused it. A lint can't catch this earlier, because plitejs is its own public package. Most of its comments name Plite on purpose, and only the bundler knows which ones end up in Plate.

Now the build reads the markers the bundler leaves around each copied file and follows them back to the source. The refusal names the plitejs file and line to edit.

## Main changes

- `tooling/scripts/finalize-plate-declarations.mjs` reads the bundle's region markers before it strips them, and names the source file and line of every Plite mention, not only the first per chunk. A nested plitejs region, relative to plitejs, sits inside the region platejs opens, so it takes the latest region whose source file holds the line.
- `packages/plitejs/src/core/editor-reads.ts` no longer names Plite in the `transfer.adopt` JSDoc, which platejs bundles.
- The `CODING_STANDARDS.md` rule row now says the build names the source line, and why plitejs has no lint for this.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where a plitejs leak is caught | The build, pointing at the source line | A lint fed by a saved list of what Plate reaches; banning Plite in every plitejs comment | lint list | big |
| What the build reports | Every mention, each with its source line | Only the first mention per bundle file, as before | first only | small |
| Panel review | Skipped, since no public API changes and the fix is one script | Run a panel on the diff | panel | detail |

## Evidence

Model: claude-opus-5-5 at high effort.

### Requirements

- Plate's published declarations never name Plite, enforced by `finalize-plate-declarations.mjs` at `pnpm build`.
- plitejs is a public distribution with its own docs, so its JSDoc may name Plite where Plate never reaches.
- A leak is found and fixed before it lands on `next`. The live case broke the platejs build at `0a5cb4f411`.

### Lanes

- **Ban Plite in every plitejs JSDoc.** Rejected. At `0a5cb4f411`, 50 of 1,917 plitejs JSDoc blocks name Plite, across 24 files, and nearly all describe plitejs itself, such as "a Plite point" or "an exact Plite clipboard envelope". Only one reaches Plate's bundle.
- **A lint fed by a reach list.** Rejected. The bundle reaches 138 plitejs files, and 9 of them hold 25 of the 50 blocks, so a file-level list would refuse about 24 correct plitejs docs. At declaration level, the list is a second, stale copy of what the bundler already computes, refreshed only by the build that already refuses the leak.
- **Strip or rewrite plitejs comments in the bundle.** Rejected. Stripping drops Plate users' docs on re-exported plitejs types, and rewriting "Plite" produces wrong prose.
- **A separate early bundle check.** Rejected. It needs plitejs built first, about 4 s plus 9.5 s for the platejs declarations, and `pnpm check` already runs it through the `www` step's turbo build.
- **Keep the build as the one owner and name the source line.** Picked. It costs about 40 lines, adds no second copy of reachability, and turns a hashed chunk line into the line to edit.

### Proof limits

- The source mapping assumes a bundled package ships one declaration file per source file under `dist`, as plitejs does. When no region's source holds the line, the refusal falls back to the chunk line.
- A leak still fails only at `pnpm build` or `pnpm check`, not at `pnpm lint:fix`.

## Close

Reversals and deviations come first. The run built the fix before it wrote this plan. The verdict playbook sends a Pursue into the Plan playbook first, so nobody read a plan before the code existed. It also wrote the finalize change before its test; the test still fails at `0a5cb4f411` for the named defect, so the red-first proof holds, but the order did not. The task asked for `xhigh` effort, and this session ran at `high`.

The finalize change, its test, the reworded `editor-reads.ts` JSDoc and the `CODING_STANDARDS.md` row land in the checkout's working tree for your commit through the patch `docs/plans/artifacts/chips/t_1436558e.patch`.

The proof covers these runs. The finalize test, with its final nested-region fixture, fails at `0a5cb4f411` because the old refusal names only `index.d.ts:3`, and passes on the change, 20 of 20. A real platejs build with the leak's HEAD text and the final finalize refuses with `../plitejs/src/core/editor-reads.ts:51 (index-DLjSOo3O.d.ts:6189)`, where the base build named only `index-DLjSOo3O.d.ts:6189`. The plitejs and platejs builds on the final source exit 0, and a scan of that build's declarations finds no Plite mention. The proof shows one mention named per run; the change reports every mention, but no run had more than one. One rerun in a detached worktree passed for the wrong reason. The proof worktree symlinks `packages/platejs/node_modules` to this worktree's copy, whose `plitejs` entry is the relative link `../../plitejs`, so it bundled this worktree's fixed plitejs. The log marks that run a gap, and the in-worktree rerun replaced it.

The change touches 4 files. The writing passes ran `deslop` on the three code files, `no-comments` on the two files with comment changes, with two accepted reshapes, and `unslop` on this page and the rule row. No panel ran, as Defaults says.

### Attention

reviewed by gpt-6.1-sol @xhigh

- Critical, applied as a reported deviation. The fix was built before the plan was written. The deviation paragraph above states it; the change is not rebuilt.
- Critical, applied. The final test fixture had no base control. It now fails at base in its own run.
- Warning, applied. The Plite count first ran on the checkout's uncommitted tree. It now reads 50 of 1,917 blocks at `0a5cb4f411`.
- Warning, applied. "No lint can own the check" is now an inference, and the logged fix claim is narrowed to what the runs show.
- Warning, applied. The log now holds the rejected stripping and early-check lanes, the skipped panel and the deviation, and the writing row names the files each pass covered.
- Warning, dismissed. The write boundary covers task paths the patch delivers. `node_modules`, build output and the run directory are ignored files no patch carries.
- Warning, applied. The landing sentence now names the patch, and the landed row follows its apply.
