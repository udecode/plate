# Sound hashes for package test tasks

Page: https://claude.ai/artifact/ECvARyaii3RQLdk8Grgvs4

Status: executed
Playbook: plan

## Brief

### What will change?

A test run now fails unless Turbo's hash covers every module it loaded and every file those modules say they read. So CI can't replay a stale pass. All 69 package test tasks pass with the check on.

### What could go wrong?

Modules that read files, start processes or load computed paths need an entry saying what they touch. The check can't catch a wrong entry or a library reading files for them. An edit can rerun a few more tasks.

## Teach

Turbo skips a test and reuses its last pass when the test's hash still matches. The hash covers the files the test task lists, plus the hashes of the tasks it depends on. Plate builds that file list by reading the imports each test writes out as plain text.

That reading misses anything it can't see. The public package smoke test builds its import paths while it runs, so it loads 288 source files that no hash covers. Tests also read files. A plitejs contract checks every docs page, and no hash covers those pages either.

The fix asks Bun and Vite which modules each test process loaded, and fails the run when the hash misses one. A module that reads files, starts a process or loads code from a path built at run time must also say which files it reaches, and the run fails when it doesn't or when those files aren't hashed. Turbo only saves passing runs.

## Outcome

Every package test task in `packages/platejs`, `packages/plitejs` and `packages/test` passes only when Turbo hashes every repository file its Bun and Vitest processes loaded as a module, the tsconfig files that compile those modules, the Bun and Vitest config the runner handed them, and the inputs declared by each loaded module that reads files, starts a process or worker, loads modules by a computed path or runs the TypeScript compiler. A loaded module that deletes from, assigns into or clears the module registry fails the task.

## Carried from the slow-lane review

The round-3 panel on `docs/plans/2026-10-19-slow-lane.md` left two critical findings open, each with `patch:` naming this plan:

- **Computed specifiers** (opus, astra). The generator walks only string-literal imports, so a test that builds its specifier at run time loads files outside its hash. The public package smoke test loads 884 repository files, and 288 of them are hashed by no task in its closure.
- **Root Bun config** (sol; opus as a warning). The platejs runner passes `--config=<root>/bunfig.toml`, and no test task hashes that file. Bun reads a bunfig only from its cwd or `--config`, so plitejs and `@platejs/test` read none.

The base control reproduces both on the current tree. An edit to `packages/plitejs/src/yjs/index.ts` leaves `platejs#test:partition:root`'s hash unchanged, and an edit to the root `bunfig.toml` leaves `platejs#test:partition:core`'s unchanged. Edits to the test file and to a preload change theirs.

## What other editors do

Read at Lexical dd5c41b13, Tiptap 91c51be53, Slate 945a484df and ProseMirror c7f2f1d, not run. None caches test results, so none needs a guard on what a cached test loaded.

| Editor | Test runners | Test results cached | Guard on cached test inputs |
| --- | --- | --- | --- |
| Lexical | Vitest projects, Playwright | no | none needed |
| Tiptap | Vitest at the root; its Turbo caches only `build` and `lint` | no | none needed |
| Slate | Mocha and Jest under Lerna, Playwright | no | none needed |
| ProseMirror | `pm runtests` per module | no | none needed |
| Plate today | Bun and Vitest in 69 Turbo test partitions | yes | a static import walk, checked by a second static scan |

## Targets compared

| Target | Who knows what a test loads | Guard | Cache value | Cost | Verdict |
| --- | --- | --- | --- | --- | --- |
| No test cache, the control | nobody needs to | sound by construction | none | every run reruns all 69 partitions; plitejs core alone takes 138.8 s, plitejs authored 97 to 160 s and platejs 55 s | rejected on price |
| Hash the whole checkout | Turbo, every file | count of checkout files against Turbo's inputs | any write reruns every partition | 7.56 GB and 15.75 s per Turbo call; 90 GB of agent worktrees in the main checkout | rejected |
| Static walk that refuses unknown loads | the generator's list of load forms | a second static parser | per partition | refusal list, TOML subprocess, 4 s preflight per `plite:test` | rejected |
| Runtime trace check with declared effects | Bun's module registry and Vite's transform hook; each loaded module that reads files or starts processes declares the rest | the trace, on every run | per partition | one registry dump per process, a parse of each loaded module, about 45 declarations | picked |

The architect arena ran the first four rows' ideas as three runners and an anonymized cross-judge; its synthesis is `docs/plans/artifacts/test-task-hashing/architect/synthesis.md`, a run-directory file. The declared effects came from the plan review, after Bun 1.3.12 proved it cannot record reads: a preload that patches `node:fs` reaches only default-import calls, and named imports keep the original functions.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Guard on test loads | `bun-loaded-files.mjs`, a static scan with the walker's blind spots | the runner checks each process's module registry against the task's hash before it exits 0 | `tooling/scripts/load-trace.mjs`, called by `run-entrypoint-task.mjs` | only the runtime registry is independent of the walker | every test task runs through it | step 1 tests; step 4 forced run | untraced load kinds, listed under Limits | rearchitect |
| Modules that read files, start processes or load by computed paths | unhashed and unchecked | each loaded module that imports `fs`, `fs/promises`, `child_process`, `worker_threads`, `cluster`, `module`, `bun`, `bun:ffi` or `bun:sqlite`, calls `import()` or `require` with a computed path, uses `require` other than in a direct call, uses a `Bun` member other than `env`, `gc`, `main`, `nanoseconds` and `version`, calls `process.binding` or `process.dlopen`, starts a `Worker` or imports the TypeScript compiler has an entry in `testModuleEffects` listing the globs it reaches; the check finds these in the walker's Babel parse of each loaded module, of every module those import for their values and of every module an entry's `runs` names, fails an undeclared module, and fails a declared glob that is missing from the task's inputs or whose matches the task's own exclusions drop | `tooling/entrypoints/test-module-effects.mjs`, read by the generator and the check; `moduleEffects` in `import-graph.mjs` | the trace sees modules, never reads or native children; round 2 showed the text scan missed `Bun.$`, a destructured `Bun`, computed builtins and the TypeScript compiler, and round 3 that the scan missed an aliased `require` and every module the trace does not hold | one entry per module step 2 lists | one step-1 negative control per form; step 3 read probe; step 4 forced run | an entry that names the wrong files | rearchitect |
| Module registry mutation | allowed | a loaded module that reads `require.cache`, `createRequire(…).cache`, a `_cache` property or `Loader.registry` needs an entry; one that deletes from it, assigns into it, calls its `clear`, `delete` or `set`, or hands the registry itself to other code fails the task | `load-trace.mjs` | an evicted module drops out of the final registry dump, and a registry held in a variable hides what its holder does with it (round 3) | 0 evictions today; the tracer preload and `bunTestSetup.ts` read the registry and have entries, and `bunTestSetup.ts` reads it in place instead of holding it | step 1 negative controls | a module that evicts itself and that only a declared computed load reaches is never scanned (Limits) | cut |
| Static oracle and its three tests | 3 tests spawn Bun over the walker's output | deleted; the env test reads the generator's own walk, and the `test/` ownership check reads the hash model | none | the trace check covers the same failure on every run | delete in step 3, after the inventory run | the check's negative tests | none | cut |
| Harness inputs | hand list `testHarnessFiles`, package `bunfig.toml`, plitejs `vitest.config.mjs` | the preload modules stay walk roots, and so does each Vitest config a task runs, whose `testModuleEffects` entry names its setup files; root `bunfig.toml`, the top-level files of `config/` and `tooling/config/`, the runner's import closure, and each package's `bunfig.toml` and `vitest.config.*` | `entrypoint-turbo.mjs`, and the `vitestSuites` table in `tooling/config/test-suites.mjs` that the runner also reads | closes the root bunfig hole; top level only, because Playwright writes git-ignored output under `tooling/config/test-results/`; the full run on the round-2 draft found `vitest-setup.ts` outside `plitejs#test:partition:react-virtualized`'s hash | generator | step 3 hash and config probes; a generator test that each Vitest task hashes the setup files its config names | a config edit reruns every test task | rearchitect |
| Walker load forms | string literals only | plus an `import()` template whose text before `?` is literal, `createRequire(…)(<literal>)` and `import.meta.require(<literal>)` | `import-graph.mjs` | one yjs test imports with a cache-busting query, and a `createRequire` call with a literal names one file | generator | step 3 generator tests | none | keep |
| Smoke test loads | `await import(specifier)` over a computed list | a literal loader table, called per expected specifier, so a missing row throws | `public-package-import-smoke.spec.ts` | the 288 unhashed files; no task typechecks platejs `test/`, so a type check would never run | test edit | step 3 hash probe | none | rearchitect |
| Lint task inputs | `oxlint.config.ts`, one plugin and the runner | the import closure of `oxfmt.config.ts`, `oxlint.config.ts` and its three plugins, `plate-baseline.json`, and the runner | `entrypoint-turbo.mjs` | the plugins and the baseline were unhashed (slow-lane round 3), `plate-plugin.mjs` imports `finalize-plate-declarations.mjs` and `finding-baseline.mjs` from `tooling/scripts/` (round 2), and `ultracite check` runs oxfmt as well as oxlint (round 3) | generator | step 3 lint hash probe | none | keep |
| Compiler config of loaded modules | package and root `tsconfig.json`, through typecheck tasks | each walked file's nearest `tsconfig.json` and the files it extends are test task inputs, the check fails when a loaded module's chain is unhashed, and both fail on a tsconfig that does not parse or extends a package | `tsconfigChain` in `import-graph.mjs`, used by the generator and the check | Bun and Vite compile each file with its nearest `tsconfig.json`; `packages/plitejs/test/react/tsconfig.json` was outside `plitejs#test:partition:react-virtualized`'s hash (round 2) | generator | step 1 negative control; a generator test that each task hashes its test files' chains | a nested tsconfig edit reruns the tasks under it | keep |
| Phase exit when the full run fails | `cache: false` on every test partition | none; a failing task gets an entry or a generator fix, since any read or child can be declared as a glob | this plan | each package's aggregate `test` task requires every partition to be a cache hit, and a `cache: false` task always misses, so the fallback fails `pnpm plite:test` (round 2) | none | step 4 forced run | a failure that needs more than an entry delays the landing | cut |
| `@platejs/test` env and generator cleanups | as today | unchanged | none | plan review: strict env mode hides an undeclared variable from both the test and the hash, so no replay hole exists, and the cleanups change no hash | none | none | none | cut |
| Local `check --affected` routing | runs package tests only for edits under the three packages, `tooling/entrypoints/` and global paths | unchanged here | suggested task t_02d97219 | a routing gap, not a hash gap; CI's full check runs them | none | none | a landing edits `benchmarks/` and skips the tests that load it | defer |

## Challenge delta

Plan review round 1 (opus, astra, sol) raised four critical findings, each reproduced before the change:

- Files tests read stayed unhashed, and CI restores Turbo's cache, so CI replays those passes. Edits to a doc, a benchmark script, a changeset and `packages/cli/package.json` left `plitejs#test:partition:core`'s hash unchanged. The plan adds declared effects instead of deferring reads.
- A test that evicts a module from `require.cache`, a Node child, and a Vitest `createRequire` each loaded a module the drafted tracer never recorded. The effects check refuses each one until it is declared, and refuses registry mutation outright.

The review also cut phase 2's env change and cleanups, kept the `test/` ownership check and dropped the folder-wide config globs.

Plan review round 2 (opus, astra, sol) raised five critical findings, each reproduced on the reviewed draft:

- The text scan accepted `` Bun.$`ls` ``, `const { file } = Bun`, `import('node:' + 'fs')`, a computed `require`, such as the one Vitest injects, and the TypeScript compiler. The scan now reads the walker's Babel parse and flags every computed load and every `Bun` use beyond five plain members.
- A helper that a test loads by a computed path and that then evicts itself left no evidence. The test now needs an entry for its computed load.
- A computed import inside a Vitest config ran before the tracer existed. The config is a loaded module, so the same rule flags it.
- `packages/plitejs/test/react/tsconfig.json` was outside its task's hash. Each walked file's tsconfig chain is now an input, and the check verifies it.
- The `cache: false` fallback fails the aggregate test task, which requires cache hits. The plan drops the fallback.

A run of all 69 test tasks on the round-2 draft failed 3 of them, on four problems. Three were modules that needed entries: the mobile proof script, the benchmark stats writer and a test that runs the TypeScript compiler. The fourth was a generator gap. No walk started from the Vitest config, so `plitejs#test:partition:react-virtualized` did not hash `vitest-setup.ts`.

Plan review round 3 (opus, astra, sol) raised two critical findings, each confirmed by a fixture that the round-2 draft accepts:

- The scan accepted `const load = require; load(path)`, and also `names.map(require)`, `require.call` and a `module.require` value. Each now needs an entry.
- The scan read only modules the trace held. It missed a module Vitest loads without its transform hook, a module that evicts itself and a helper that only a declared `runs` entry reaches. The check now also reads every module the loaded ones import for their values and every module their entries' `runs` name, repeating until no new module turns up.

The round also found that a registry held in a variable passed the eviction rule, so handing the registry to other code now fails the task. The lint tasks now hash `oxfmt.config.ts`, because `ultracite check` runs oxfmt too. `tsconfigChain` now fails on a tsconfig that does not parse or extends a package, instead of skipping it. The `vitestSuites` table moved to `tooling/config/test-suites.mjs`, which already owns suite routing, so the runner no longer reads runner policy from the generator.

A run of all 69 test tasks on the round-3 fixes failed 9 platejs tasks on one false positive. The scan read an object method named `require` in `packages/platejs/src/react/plugin/pluginFactory.internal.ts` as a loader. It now skips any property key that is not computed.

## Main changes

- The test runner sets `BUN_OPTIONS=--preload=<root>/tooling/config/load-trace-preload.ts` and a fresh trace directory for every process it starts, so every Bun child inherits the tracer. The preload writes a start marker named by pid and a random suffix, and dumps `Object.keys(require.cache)` from a global `afterAll` and from `process.on('exit')`.
- Both Vitest configs add a Vite plugin whose `transform` hook records each module id, whose `configResolved` hook records the config's own imports and fails when `experimental.fsModuleCache` is on or `experimental.viteModuleRunner` is false, and which writes its ids when the Vitest process exits.
- Before a passing task exits 0, `runTraced` unions the traces, adds the bunfig and Vitest config the runner handed over, and fails when any loaded repository file is outside the task's hash. The hash model globs the `turbo.json` files on disk over the task and every task its `dependsOn` reaches, without following symlinks, and adds each task's `package.json` and `turbo.json`. It also fails when a start marker has no dump, when a process the runner spawned left no marker, or when a test file the runner passed appears in no trace.
- The same check reads the Babel parse of each loaded repository module, of every module those import for their values, and of every module an entry's `runs` names, until no new module turns up. A module that reads files, starts a process or worker, loads a module by a computed path, uses `require` other than in a direct call or runs the TypeScript compiler needs a `testModuleEffects` entry. Each glob in that entry must be an input of a task in the closure, and every file it matches must survive that task's exclusions. A module that evicts a module from the registry, or hands the registry itself to other code, fails the task. The generator adds each entry's globs to the test tasks that walk to the module, and to the typecheck task that owns it when the module is package source.
- The generator adds each walked file's nearest `tsconfig.json` and the files it extends to the test task's inputs, and the check fails when a loaded module's chain is outside the hash. Both fail on a tsconfig that does not parse or extends a package.
- The runner and the generator read one `vitestSuites` table in `tooling/config/test-suites.mjs` that says which test files Vitest runs and with which config. The generator starts a walk from each config a task runs, and the config's `testModuleEffects` entry lists its setup files under `runs`.
- `bun-loaded-files.mjs`, `testHarnessFiles` and the three oracle tests go. The generator hashes the root bunfig, the top-level config files, and the import closures of the oxfmt and oxlint configs and oxlint's plugins.

## Limits

- The scan reads syntax. Code that reaches a capability by reflection, such as `globalThis['Bun']`, passes unseen. The repository has no such use today.
- A dependency that reads files for its caller, such as `JSDOM.fromFile`, passes unseen. The TypeScript compiler is the one the scan names. The repository calls no other such reader today.
- A module that evicts itself from the module registry is gone from the trace before the check runs. The scan still reads it when a loaded module imports it by a literal path or an entry's `runs` names it, but not when only a declared computed load reaches it. The repository evicts no module today.
- An entry can name only repository files. A module that reads outside the checkout, such as git metadata or a global `~/.bunfig.toml`, depends on files no hash holds. The mobile proof script's `git rev-parse HEAD` is one such read, and no test's result depends on that commit. The raw path fails first on its missing artifact, and the other path rejects an empty receipt matrix for any commit.
- The check trusts each entry. It proves the entry's globs are hashed, not that they name what the module reads. A child that a declared module starts with a stripped environment, or that is not Bun, loads modules only its entry accounts for.
- Imports made inside a global `afterAll` that another preload registers after the tracer run after the dump. No preload imports in a hook today.
- Bun loads `.env`, `.env.test` and `.env.local` from its working directory, outside strict env mode. None exists today.
- A missed load fails its task at run time, never at generate time. The failure names each file and the fix.
- No task hashes the Bun version. That predates this plan, and CI pins 1.3.12.

## Steps

The Build playbook builds these steps in one phase.

### Phase 1: the trace check

- [x] 1. Add the tracer and the check: `tooling/config/load-trace-preload.ts`, `tooling/config/vitest-load-trace.mjs` in both Vitest configs, `tooling/entrypoints/test-module-effects.mjs`, and `tooling/scripts/load-trace.mjs` with `runTraced`, which `run-entrypoint-task.mjs` calls. Proof, in `tooling/scripts/load-trace.test.mjs`:
  - A registry probe runs `bun test` with the preload on a committed fixture. The traces hold a computed import, a `?query` import, a `createRequire` file, a JSON import, a `bun run` child, an `--eval` child and a child that calls `process.exit`. One run uses the platejs runner's command line, `--config=<root>/bunfig.toml --cwd=<root>`.
  - A Vitest fixture with a computed import shows the imported file in the trace and fails as undeclared. One with `createRequire` fails as undeclared.
  - A Vitest fixture that calls the `require` Vitest injects with a computed path fails, and so does a Vitest config that imports by a computed path.
  - One fixture per scan form fails as undeclared: `Bun.$`, a destructured `Bun`, an import from `bun`, `import('node:' + 'fs')`, a template ``import(`node:fs`)``, a computed `require`, `process.binding` and the TypeScript compiler. Eviction through `createRequire(…).cache` fails even with an entry. Plain `Bun` members, type-only imports and an `.import()` method call pass.
  - An aliased `require`, `names.map(require)`, `require.call` and a `module.require` value fail as undeclared, while `typeof require`, `require.resolve` and a direct `module.require` call pass. A module that holds the registry in a variable fails even with an entry, and one that lists `Object.keys(require.cache)` passes with one.
  - A Bun test that loads a self-evicting helper by a computed path fails through the test's own computed load.
  - A declared module whose value import and whose `runs` helper are both missing from the trace still gets both read: each fails as undeclared, a self-evicting module its entry runs fails even with an entry, and its type-only import is not read.
  - A loaded module whose `tsconfig.json` extends a package fails the check.
  - A fixture that evicts a module fails, an undeclared reader fails, an undeclared spawner fails, a declared reader whose glob is not hashed fails, and one whose matches the task's exclusions drop fails.
  - A loaded module whose nested `tsconfig.json`, or the file it extends, is outside the hash fails, and passes once both are hashed.
  - A start marker with no dump fails, and so does a passed test file that no trace holds.
  - `runTraced` returns nonzero for a complete trace that loaded an unhashed file.
  - The model equals one `turbo run test --filter=platejs --filter=plitejs --filter=@platejs/test --dry=json` for every package test task, inputs and dependencies both.
  - Each new case fails on its named mutant: the preload without its `afterAll` dump, the model without `package.json` and `turbo.json`, `runTraced` ignoring start markers, `runTraced` returning 0 after it reports, the scan without its eviction rule, and the check without its tsconfig rule. The round-3 cases fail on the round-2 draft's scan and check.
- [x] 2. Run every package test task once with the check on the current generator, and save what it lists. Proof: the saved list, which must include the two carried findings and the read case.
- [x] 3. Move the generator: the harness inputs, the Vitest config walk, the effects entries for every module step 2 listed, the walker forms, the tsconfig chains and the lint closure. Give the smoke test its loader table, and delete `bun-loaded-files.mjs`, `testHarnessFiles` and the three oracle tests. Proof:
  - `pnpm entrypoint:turbo:generate` runs, then `pnpm entrypoint:turbo:check` and the generator tests pass. One generator test imports each Vitest config and fails when a task that runs it does not hash a setup file it names. It fails on the generator without the config walk.
  - The round-3 hash probe shows that the `packages/plitejs/src/yjs/index.ts` edit and the root `bunfig.toml` edit now change their task hashes, and both controls still change theirs.
  - The read probe shows that edits to a doc under `content/docs`, a script under `benchmarks/slate-v2/donor/core/current/`, `.changeset/README.md` and `packages/cli/package.json` now change `plitejs#test:partition:core`'s hash, and an edit to the root `package.json` changes `@platejs/test#test:partition:proof`'s.
  - A tsconfig probe shows that an edit to `packages/plitejs/test/react/tsconfig.json` changes `plitejs#test:partition:react-virtualized`'s hash.
  - A config probe shows that edits to `packages/plitejs/vitest.config.mjs`, `packages/plitejs/test/react/vitest-setup.ts`, `packages/test/vitest.config.ts` and `config/plite-source-aliases.ts` each change the hashes of the test tasks that load them.
  - A lint probe shows that edits to `oxfmt.config.ts`, `tooling/oxlint/plate-plugin.mjs`, `tooling/oxlint/plate-baseline.json` and `tooling/scripts/finding-baseline.mjs` each change a platejs lint task's hash.
  - A cost probe lists, for a trailing edit to one leaf source file in each package, the test tasks whose hash changes before and after the move. Each added task names the input that pulls it in.
- [x] 4. Run every package test task in CI mode under the check. Proof:
  - `CI=true TURBO_FORCE=true pnpm plite:test` passes with the check on and prints no problem.
  - A negative control in a scratch worktree adds to one spec a computed import of a file outside its task's hash. The task fails and names that file, and a rerun misses the cache.

Phase 1 ends when step 4 passes. A task that fails step 4 gets an entry or a generator fix in this phase.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How tests prove their hash | Each test run checks what it loaded (look) | Hash every file in the repo; stop caching tests | whole checkout; no test cache | big |
| Files tests read and processes they start | Each module that does it declares what it reaches (look) | Leave them to a later task | defer reads | big |
| Tests that evict modules | The run fails | Allowed, with the eviction unseen | allow eviction | small |
| Local landings that skip package tests | Handled in a separate task | Fix it in this plan | route affected | small |
| Fixture imports | Caught by each run's check | Read every fixture when building the task list | walk fixtures | detail |
| Checking our file list against Turbo | Once per check, for every task | Ask Turbo on every test run | dry run per task | detail |
| Config files | Hash the top-level config files | Keep a hand-written list of setup files | list harness files | detail |

## Open work

- Local `pnpm check --affected` skips package tests for edits under `benchmarks/`, `tooling/scripts/` or `tooling/plite/`. owner: suggested task t_02d97219. stop: none; CI's full check runs them.
- `tooling/entrypoints/entrypoint-turbo.mjs` grows from 948 lines on the slow-lane tree to 1,010. Moving the test task hash graph into its own module would bring it back under 1,000 (round 3; opus, astra and sol). owner: suggested task t_5f7db663. stop: none.
- Recording the files a test reads at run time, by patching `node:fs` in Node and Vitest workers and reaching Node children through `NODE_OPTIONS`, would check each entry instead of trusting it (round-2 warning). owner: suggested task t_78848d85. stop: its probe shows whether Bun 1.3.12 honors `syncBuiltinESMExports`.

## Close

What lands, in one commit with `docs/plans/2026-10-19-slow-lane.md`:

- The tracer and the check. `tooling/config/load-trace-preload.ts` and `tooling/config/vitest-load-trace.mjs` record what each Bun and Vitest process loads. `tooling/scripts/load-trace.mjs` checks it, and `run-entrypoint-task.mjs` calls its `runTraced` for every package test task. `moduleEffects` and `tsconfigChain` live in `tooling/scripts/import-graph.mjs`, and the entries in `tooling/entrypoints/test-module-effects.mjs`. `tooling/scripts/load-trace.test.mjs` and its fixtures test them, and `check:plite:contracts` runs it.
- The generator move in `tooling/entrypoints/entrypoint-turbo.mjs`, the regenerated `turbo.json` files of platejs, plitejs and `@platejs/test`, and the `vitestSuites` table in `tooling/config/test-suites.mjs`.
- The literal loader table in `packages/platejs/test/public-package-import-smoke.spec.ts`. Its imports of each published Plite entrypoint make it a raw Plite proof, so `oxlint.config.ts` lets it import `plitejs`, and `tooling/scripts/entrypoint-dag-plugin.test.mjs` now audits `test/` files against that list as well as `src/` files.
- `bun-loaded-files.mjs`, `testHarnessFiles` and the three oracle tests are gone.

Deviations and reversals:

- Three plan review rounds changed the design before the build, and Challenge delta lists each one. Round 1 reversed the deferral of files tests read. Round 2 dropped the `cache: false` fallback.
- The full run on round 3's fixes failed 9 platejs tasks on an object method named `require`. The scan now skips property keys that are not computed.
- The first root `pnpm test` run failed the raw Plite allowlist test, because the smoke test's new literal imports name `plitejs` and the allowlist did not list the file. The lint exclusion and the test above fix it.
- The owner said "fast" after round 3. No diff panel, decision-trail review or reflect ran on the build, and `no-comments` was skipped. The commit body says "Shipped fast, no review."

Proof and its limits, from the decision log's `scope:` rows:

- Step 1. 55 of 55 trace tests pass on the scratch worktree, and each of six single mutants fails the test the plan names for it. The round-3 cases fail on the round-2 draft.
- Step 2. With the old generator all 69 test tasks listed problems. They include the smoke test loading `packages/plitejs/src/yjs/index.ts` outside its hash, the root `bunfig.toml` in all 55 platejs tasks, and the benchmark scripts plitejs core reads.
- Step 3. Generate and check pass, 103 of 103 generator and trace tests pass, and each of 18 hash probes moves its expected hash. A trailing edit to one footnote source file now reruns 10 test tasks instead of 7, one plitejs history file 65 instead of 64, and the device guard 1 as before. Each added task loads the file through a real import chain.
- Step 4. The forced CI-mode `pnpm plite:test` ran 9 then 153 Turbo tasks, none cached, and all passed with no problem printed. The 153 are the 69 test partitions, the 3 aggregate test tasks and the 81 typecheck partitions they depend on. A planted computed import of a file outside the hash fails its task twice, names the file and misses the cache.
- Every run was on this host, not CI. The check proves each entry's globs are hashed, not that they name what the module reads, and the Limits above still hold.
