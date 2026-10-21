# Plite tests: the legacy fixture keeps each row a contract file copies

Status: executed: 89 contract copies cut, 27 near-copies kept
Page: https://claude.ai/artifact/Q32W9ydWvRHXcJzGJD2f16
Playbook: verdict

**Pursue. The legacy fixture tree owns every row it shares with a contract file, so the 89 contract rows that copy a fixture exactly are cut.** Each of those rows names the fixture it copies, and the fixture checks at least as much. A transform fixture runs its step through the transaction API and compares the whole document and selection, while the move copies call the static move helper and compare only the selection. Suggested task t_3799c6f4 asked the question. Its premise, that this holds plitejs's largest cut, failed measurement. 116 contract rows name a fixture they copy, about 13% of the 901 fixtures, and the rest of the fixtures hold rows no other test covers.

## Brief

### What will change?

We deleted 89 Plite tests that were exact copies of old Slate tests, 2257 lines in all. The old Slate test stays as the only copy of each. The two suites went from 1807 passing tests to 1718, and none fail. A new rule says where each kind of test belongs, and the script that did the deleting is now in the repo for the next batch. The editor itself does not change.

### What could go wrong?

Each deleted copy set up its editor schema a little differently from the old test it copied. A bug that shows only with that schema could now go unnoticed, because the check compared the document, the steps and the result, not the schema. 27 copies that differ a little from their old test stay for now.

## Teach

Plite inherited about 900 small test files from Slate. Each builds a tiny document, runs one edit or query and compares the result to a stored answer. One runner walks the folders and runs them all.

Later, Plite's own test files added tests for its new features, such as schemas, roots and plugins. Some of those tests copied an old Slate test and said so in their names, so the same check ran twice.

Now the old Slate test keeps each shared check, and the copy is deleted. A script ran both versions and deleted only the copies whose document, steps and result all match. Plite's own test files keep the tests that the old runner cannot express.

## Public API

No public call changes. Here is one deleted copy, the anchor-move test, whose case `transforms/move/anchor/basic.tsx` still checks.

```ts before
// packages/plitejs/test/snapshot-contract.ts
it('mirrors the legacy move/anchor/basic.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'anchor' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 6 },
  });
});
```

```ts after
```

## Main changes

- `tooling/scripts/cut-tests.mjs` deletes test cases and table rows by their full name, then the imports and top-level helpers nothing uses any more, so later cut batches rerun it instead of editing by hand. It refuses a name that matches no case or more than one, and then writes no file.
- The plitejs section of `.agents/rules/verify/references/test-packages.md` says the fixture tree owns each legacy Slate row and a contract file holds only what that runner cannot express. `.agents/rules/verify/references/testing.md` names the cut script where `test-audit`'s cleanup waves look.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which copy keeps a shared test | The old Slate test, which checks the whole result | The copy in Plite's test file | contract owns | big |
| The other 800 or so old Slate tests | Keep them, since no other test covers most of them | Delete all of them | drop corpus | big |
| 27 copies whose document or steps differ from their old test | Keep them until someone checks each one | Delete them as near-copies | cut near-copies | small |
| Where the rule lives | In the Plite part of the test guide | Only on this page | no rule | small |
| Where the deleting script lives | In the repo's scripts, so the next batch reruns it | A throwaway script in this run's folder | no tool | detail |
| Review panel on the change | Skip it, since only tests and a script change | Run a panel first | panel | detail |
| This session's worktree after landing | Keep it, since this session runs the task board | Remove it, as task sessions do | remove worktree | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata. The map of both suites came from one explainer on opus at high effort.

Prior work. No review scope owns the fixture tree or the contract files, as `docs/plans/2026-10-20-legacy-fixture-skips.md` found, so this verdict touches no ledger scope. That plan made all 901 fixtures run as plain tests. In the Slate fork, the 2026-04-09 test-family consensus plan wanted representative contracts instead of the legacy bulk, and the 2026-04-18 parity plan reversed it and kept both corpora. Neither named an owner for a row both hold. The t3code intake, `docs/plans/2026-10-21-t3code-test-cut-intake.md` item 7, left the owner open as this task.

### Requirements

- Every test fails for a named, plausible defect, and duplicate tests are cut instead of ported (`.agents/pstack/rules/tests.md`).
- A duplicate cut needs a script that matches both copies' input and expected result, and it keeps the copy at the owner the project picks (`.agents/skills/test-audit/SKILL.md`, Evidence tiers). An uncertain candidate never becomes a deletion (its Edit shape).
- The fixture runner asserts only children, selection or a return value under one open schema (`packages/plitejs/test/index.spec.ts:87-139`, `config/plite-test-jsx.js`). Keys, roots, commits, plugins, collab, history and named schemas need hand-written contract rows.
- Raw Plite query, transform and interface contracts use `createEditor` from plitejs (`.agents/rules/verify/references/testing.md`, Owner Selection).

### Lanes

1. **The fixture owns a shared row, and a contract row that copies it exactly is cut. Wins.** 89 rows: 26 in `query-contract.ts` and 63 in `snapshot-contract.ts`. Each copy names its fixture, and the transform fixtures check the whole document and selection through the transaction API.
2. **The contract file owns it, and the matching fixtures are cut. Loses.** The move copies compare only the selection and call the static helpers, so cutting the fixture would drop the document check. It would also delete single fixtures out of families that otherwise run whole.
3. **Strongest deletion: delete the fixture corpus. Loses.** About 146 fixtures test PathApi, PointApi, RangeApi, LocationApi, TextApi and Node calls that no other test calls, and the insertFragment and normalization fixtures match no contract row. Nothing shows those rows are duplicates or low-signal.
4. **Strongest merger: move every row into one format. Loses.** It ports tests instead of cutting them, which the Tests rule forbids, and it adds no coverage.
5. **The rule is wrong: the test-harvest rule forbids keeping upstream fixture shape in versioned output. Not a lane.** That rule, in `.agents/rules/research/references/test-harvest.md`, governs tests harvested from other editors. This tree is the inherited suite of the Slate fork Plite descends from, which the rule's job does not touch.
6. **Also cut the 27 near-copies. Loses for now.** Their document or steps differ, such as other text, an extra link url or a second operation, so they fall outside the duplicate tier and need both edits one test at a time.

Proof limits. The match maps each element type to its role, such as block, inline or inline void, before comparing. It proves both copies observe the same input, steps and result, not that the two schemas fail the same mutants.

### Dependents

None. The fixture files and contract files are test modules, and no code outside `packages/plitejs/test` imports them.

### Rows

| Contract file | Exact copies cut | Kept, with why |
| --- | --- | --- |
| `query-contract.ts` | 26: above 6, after 4, before 3, next 3, previous 3 and unhangRange 7 | 16: the edges, string, mark-read and predicate blocks, which hold calls no fixture matches, five levels rows that compare only paths, two positions rows whose result differs, and one before and four unhangRange rows whose document or range differs |
| `snapshot-contract.ts` | 63: move 39, delete 8, lift 5, unwrap 4, select 3, wrap 2, deselect 1 and setPoint 1 | 11: five delete, three unwrap and two wrap rows whose text, link props or steps differ, and the split_node row, whose fixture was deleted in 266ba029a1 |

## Close

The run reversed no pick. After the cut, the deslop pass fixed one path of the cut script that this cut never used, an import whose namespace binding goes unused. It also dropped a loop guard that could never fire. The comment pass kept the script's three comments and had two spots reshaped so the code says what the comments meant. The final script, rerun on the saved pre-edit files, writes the committed bytes.

89 contract rows are gone, 26 from `query-contract.ts` and 63 from `snapshot-contract.ts`, together with the 10 snapshot helpers that only those rows used. The two files lost 2257 lines and gained none. `tooling/scripts/cut-tests.mjs` and its test are new, and the two verify references each gained one rule line.

Proof:

- `bun test` of `test/runtime-contracts.test.ts` and `test/index.spec.ts` from `packages/plitejs` passes 1807 tests at base and 1718 after, exactly 89 fewer, with none failing. Its scope is every contract module the runtime-contracts suite imports and the whole fixture tree.
- `pnpm typecheck:tests` in `packages/plitejs` exits 0, and `pnpm lint:task` on the two contract files and the two script files reports no error.
- The cut script's two tests fail against each of three mutants, one that keeps a case's leading comment, one that drops the describe prefix from a name and one that skips the helper sweep.
- `pnpm run prepare` regenerated the verify skill's copies of both references, and `sync-resources.mjs --check` reports them exact.

Limits. The match maps each element type to its role before comparing, so it proves that both copies use the same input, steps and result, not that the two schemas fail the same mutants. The cut script finds `it()` and `test()` calls with a literal title, and rows of a top-level table that a for-of loop passes to `it(row.name, ...)`. It lists a case built any other way without a name and refuses to cut it.

Counts. The run had one ask, the owner's "go start here the xhigh" for t_3799c6f4, and it is done. The proof, writing-pass, last-check and delivery gates ran. The run skipped the review panel under the Defaults word "panel".

Open work: none. The 27 near-copies stay under the Defaults word "cut near-copies".
