# Typecheck plitejs slow suites

Status: executed: waiting on your commit
Topic: correct
Playbook: bug-fix

The owner asked whether leaving `*.slow.ts` out of plitejs's test typecheck is deliberate, whether platejs and other packages share the gap, and, if it is not deliberate, to add the slow files to the test typecheck, fix the type errors that surface, and prove it with `pnpm check typecheck` and `pnpm --filter plitejs typecheck:tests`. During the authored redesign build (`docs/plans/2026-10-11-authored-redesign.md`), `pnpm exec oxlint --type-aware` on an explicit file list was the only typed gate those suites had. The session started at `666f02406e`. The owner committed `c01399d08b` before this run's first edit, so this run's diff is against `c01399d08b`. The run directory is `docs/plans/artifacts/2026-10-11-slow-typecheck/`.

## Brief

### What will change?

The type check now covers plitejs's eight slow test files and the helpers they use. It found 25 type errors in them. All are fixed, and the tests still pass.

### What could go wrong?

Most other plitejs test files, and all platejs test files, still get no type check. Their old configs already show hundreds of errors, so checking them needs a list of known errors first.

## Teach

The plitejs type check is a set of configs that a generator writes, one per part of the package plus one for tests. The tests config is what catches a type error in test code, because the test runner ignores types and runs anyway.

That tests config only looked inside the source folder. All eight slow suites live in the separate test folder, so nothing checked them. The older hand-written test config skipped slow files too, and no script has run it since the packages merged in August.

Now the generator also adds every slow suite in the test folder. The check reads the helpers those suites import too, and a generator test fails if a slow suite ever drops out.

## Main changes

- `tooling/entrypoints/entrypoint-turbo.mjs` adds every `.slow.*` suite under `packages/plitejs/test/` to the generated `packages/plitejs/tsconfig.entrypoints/tests.json`, so `typecheck:tests`, which `pnpm typecheck` runs, checks those suites and the helpers they import. The task's Turbo inputs cover `test/**`. `tooling/scripts/entrypoint-turbo.test.mjs` fails when a plitejs slow suite is missing from that config.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How far the new check reaches | The eight slow suites and the helpers they load, as you asked (look) | Every plitejs test file, once its 705 old errors are fixed or listed as known | check all tests | big |
| platejs slow files | Stay on the existing open work item, since platejs has no tests check to add them to | A platejs tests check now, fixing its 7 slow-file errors | check platejs slow | small |
| The fixture runner's fallback-element branch | Deleted, since no fixture has used it since July | Port it to the current plugin shape | keep fallback | detail |
| The old plitejs test config that nothing runs | Left alone and named in open work | Delete it now | drop old config | detail |
| The subject page | A new page at https://claude.ai/artifact/Bvdfs4Byv9ZWaGGRPTeAyM, because the old page at https://claude.ai/artifact/DaRPywazwSiM5gTxbnDMBT no longer opens | Drop the new page and keep the subject without one | drop the new page | detail |

## Close

### Reversals and deviations

- The ask assumed `typecheck:tests` reads `packages/plitejs/tsconfig.test.json`. It does not: it runs the generated `tsconfig.entrypoints/tests.json` and `test/react/tsconfig.json`, and no script has run `tsconfig.test.json` since `da70467c27` (2026-08-30). The fix went into the generator instead of that file.
- An interim note said `tsconfig.test.json` reports 978 errors in 201 files. The file count was wrong: it is 978 errors in 107 files, 705 of them in 71 files outside `test/react`.

### Is the exclusion deliberate?

No. `tsconfig.test.json`'s include list is unchanged since it was written in `f431866376` (2026-07-01) and only renamed in `da70467c27`; no commit, plan or comment explains leaving out `.slow`. The generator already treats `.slow` as a plitejs test file and lists `src/**/*.slow.*` in the `typecheck:tests` inputs, but it scanned only `src/`, and all eight plitejs slow suites live in `test/`. The repository's own records call the platejs half a gap: `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` and the existing Open work item in `docs/plans/topics/correct.md`.

### Same gap elsewhere

| Package | Slow files | Typechecked before | Now |
| --- | --- | --- | --- |
| plitejs | 8 under `test/` | 0 | 8, plus 6 helper files they import |
| platejs | 30 under `src/` | 0; 7 type errors in 5 files | unchanged, existing open work |
| apps/www | 46 | 46, through its two gated configs | unchanged |
| @platejs/test, cli | none | not applicable | unchanged |

Beyond slow files, plitejs has 1,200 source files under `test/` outside `test/react`; the gates check only the 8 slow suites, their helpers and the contract files three configs list. platejs's 276 spec and test files are in no typecheck, and `tsconfig.test.json` reports 262 errors in 62 of them. 19 of `@platejs/test`'s 20 test files are in no typecheck. cli's 6 are covered by its own typecheck.

### Proof

- Red at base: `docs/plans/artifacts/2026-10-11-slow-typecheck/base-typecheck-tests-a1.log` exits 0 while `docs/plans/artifacts/2026-10-11-slow-typecheck/base-tests-json-files-a1.log` lists no file under `test/`. The new generator test fails listing all eight suites: `docs/plans/artifacts/2026-10-11-slow-typecheck/red-generator-test-a1.log`. With the generator change and no fixes, the forced package typecheck fails on 25 errors in four suites and two yjs helpers: `docs/plans/artifacts/2026-10-11-slow-typecheck/red-plitejs-typecheck-a1.log`.
- Green on the final bytes, after the lint fix: `TURBO_FORCE=true pnpm check typecheck` ran 102 of 102 tasks with none cached (`docs/plans/artifacts/2026-10-11-slow-typecheck/final-check-typecheck-forced-a1.log`). `TURBO_FORCE=true pnpm --filter plitejs typecheck` ran 13 of 13 (`docs/plans/artifacts/2026-10-11-slow-typecheck/final-plitejs-typecheck-forced-a1.log`), and `pnpm --filter plitejs typecheck:tests` exits 0 (`docs/plans/artifacts/2026-10-11-slow-typecheck/final-typecheck-tests-a1.log`). The generator tests pass 18 of 18 and `pnpm check entrypoint-graph` passes (`docs/plans/artifacts/2026-10-11-slow-typecheck/final-generator-test-a1.log`, `docs/plans/artifacts/2026-10-11-slow-typecheck/final-entrypoint-graph-a1.log`). `pnpm lint:task` is clean on the 7 lintable files of the 9 (`docs/plans/artifacts/2026-10-11-slow-typecheck/lint-task-a2.log`).
- The type fixes change no runtime result. The eight suites ran 990 tests, 930 pass, 60 skip and 0 fail, both before (`docs/plans/artifacts/2026-10-11-slow-typecheck/base-slow-runtime-a1.log`) and on the final bytes (`docs/plans/artifacts/2026-10-11-slow-typecheck/final-slow-runtime-a1.log`).
- The first `createEditor` error comes from TypeScript 7.0.2, not Plite: two conditional spreads in an inline array under a `const` type parameter fail with a bare generic, and a conditional element passes (`docs/plans/artifacts/2026-10-11-slow-typecheck/probe/ts-quirk.ts`). The suite now uses a conditional element.
- The gate follows only static imports, so the fixture modules that `test/index.slow.ts` loads with a dynamic import stay unchecked.

### Counts

19 todos: 15 done, 4 skipped, 0 partial, 0 blocked, 0 open. The commit and a PR wait on the owner. No panel or decision-trail review runs, because this is an attended single-session change that touches no shared script.

### Open work

- The existing `correct` item for a baselined platejs spec and slow-file step now also covers plitejs's unchecked `test/` files and `@platejs/test`'s tests, in `docs/plans/topics/correct.md`. owner: zbeyens. stop: the step lands or `check.mjs` lists it as manual.
- No script has run `packages/plitejs/tsconfig.test.json` since `da70467c27`, and it reports 978 errors. owner: zbeyens. stop: the baselined step above replaces or deletes it.
- comment-sicko reproduced that unwrapping a root paragraph drops its text, which `test/authored-tree-recording-laws.slow.ts` works around. owner: zbeyens, through the suggested follow-up session. stop: that session decides the contract.
