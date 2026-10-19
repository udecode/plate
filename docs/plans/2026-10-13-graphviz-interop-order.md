# Graphviz spec fails only in the full platejs lane

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/Rk2FL6qXLWwLbT9B4e7N9M
Playbook: bug-fix

The spec case "uses the CommonJS engine from a browser module import" passed alone and failed inside `bun test ./packages/platejs/src`, at HEAD 6fa1169c5e too. Three earlier runs logged it as a known red. This fix makes the full lane green.

## Brief

### What will change?

The graphviz test now passes in the full platejs test run, because one test file owns every graphviz mock. Only test files changed, and the extra test file is gone.

### What could go wrong?

Nothing for users, since no shipped code changed. The proof covers the platejs test run. Other test runs can still hit the same trap when two test files mock one library, and no lint catches that yet.

## Teach

Bun runs all test files of a run in one process, so they share one module cache. A module mock replaces that module for every file that runs after it. Clearing mocks at the end of a file does not undo it.

The renderer loads the Graphviz engine file and hands its default export to the Graphviz class. The main renderers test mocked that same file under a second spelling, with no default export. The interop test then mocked it again with one. Bun patches the module that is already loaded, and it cannot add a name the first mock left out. So the default never showed up, the renderer passed the whole module, and the test failed. Run alone, the interop test had the module to itself and passed.

Now one test file owns the engine mock. It uses the name the renderer loads, with a default export. No other package test mocks that file.

## Demo

1. From the repository root, run `bun test ./packages/platejs/src/code-drawing/lib`. Before the fix this run failed the graphviz case. Now it reports 0 fail.
2. Run `bun test ./packages/platejs/src`. It reports 0 fail across the whole platejs lane.

## Main changes

- The graphviz interop case now lives in `packages/platejs/src/code-drawing/lib/renderers.spec.ts`, the one spec that mocks `viz.js` and its engine file. `renderers-graphviz-interop.spec.ts` is deleted.
- The engine mock uses the specifier `renderers.ts` loads first, `viz.js/full.render.js`, and holds only a default export, the shape a browser bundler gives a CommonJS import. The extensionless `viz.js/full.render` mock is gone, and so is the case named after the extensionless fallback. That case never reached the fallback, because both specifiers resolve to the same file.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What the fix touches | Only the tests | Also remove a dead import in the renderer | drop fallback | small |
| Where the missing lint check is noted | On this page | On the repo's list of lint gaps | track in correct | detail |
| Old notes about this failure | Left as written | Add a note to each of the three old plans | annotate records | detail |

## Close

**What landed.** `renderers.spec.ts` owns the `viz.js` and `viz.js/full.render.js` mocks, mocks the engine file as `{ default: graphvizEngine }`, and asserts `Viz` receives that engine. `renderers-graphviz-interop.spec.ts` is deleted. No product file changed, so no changeset applies.

**Root cause.** Bun shares one module registry across the spec files of a run, and `mock.restore()` does not undo `mock.module`. `renderers.spec.ts` ran first and mocked `viz.js/full.render`, which resolves to the same file as `viz.js/full.render.js`, with only `Module` and `render`. The interop spec's later `mock.module` patched that namespace in place and could not add `default`, so `renderGraphviz` passed the namespace to `Viz`. `docs/plans/artifacts/2026-10-13-graphviz-interop-order/probe-head-after-renderers-a1.log` shows the keys stay `Module` and `render` after the second mock, against `docs/plans/artifacts/2026-10-13-graphviz-interop-order/probe-head-alone-a1.log`, where the probe's mock lands on `default`.

**Proof.** Each log below is in `docs/plans/artifacts/2026-10-13-graphviz-interop-order/`.

- Red before the edit. `pair-explicit-a1.log` fails the case with the two code-drawing specs in one run. `platejs-src-pre-a1.log` shows 3078 pass and 1 fail on this checkout, and the fail is this case.
- The moved case still catches its own defect. On the frozen tree 089aed6e11, `mutate/pass-namespace-not-commonjs-default-a1.log` fails `renderCodeDrawing > uses the CommonJS engine from a browser module import` when `renderers.ts` passes the namespace instead of its default.
- Green on the final bytes. `platejs-src-post-a1.log` shows 3078 pass and 0 fail across 278 files. `platejs-src-post-junit.xml` lists the case in `renderers.spec.ts` with 3 assertions and no failure. In a detached worktree at HEAD plus only this patch, `wt-candidate-platejs-src-a1.log` shows 2983 pass and 0 fail across 276 files, against 2983 pass and 1 fail at HEAD in `docs/plans/artifacts/2026-10-13-indent-fraction-margin/head-platejs-src-a1.log`.
- `lint-task-a1.log` is clean and left the file's bytes unchanged. `tsc-test-a1.log` and `wt-head-tsc-test-a1.log` each report the same 11 type errors in `renderers.spec.ts`, on lines this change did not touch (`toStartWith`, `fetch.preconnect`, `mockImplementationOnce`).

**Limits.** My census of third-party `mock.module` calls covers the package lanes only (`packages/platejs/src`, `packages/plitejs`, `packages/test` and `packages/cli`, 12 rows). In those lanes only these two files mocked one module. I did not enumerate the `apps/www` lanes, where 16 `mock.module` rows there mock `@/lib/utils`.

**Deviation.** The autostage hook staged a temporary probe spec I wrote in `packages/platejs/src/code-drawing/lib/`. I removed the file, and the index no longer holds it. The saved probe lives in the run directory.

**Earlier records.** These records of the failure stay as written: `docs/plans/2026-10-11-tabbable-list-tab.md` line 203, `docs/plans/2026-10-09-authored-structural.decisions.tsv` row 12, `docs/plans/2026-10-03-model-document-admission.decisions.tsv` row 29 and the logs under `docs/plans/artifacts/2026-10-13-indent-fraction-margin/`.

## Open work

- `renderers.ts` keeps a `catch` that retries `viz.js/full.render` after `viz.js/full.render.js`, and `packages/platejs/src/code-drawing/viz.d.ts` exists only to type it. Both names resolve to one file, since `viz.js` has no `exports` map, so the retry looks unreachable. That is inferred and no bundler run checked it. This page and a session chip track it. owner: zbeyens. stop: the fallback and `viz.d.ts` are removed, or a bundler shows only the extensionless name resolving. Closed by [2026-10-13-graphviz-fallback-removal](2026-10-13-graphviz-fallback-removal.md), which checked both www bundlers, then removed the fallback and `viz.d.ts`.
- `plate/mock-spreads-module` checks only `platejs` and `@platejs/*` specifiers, while the testing reference says every `mock.module` replacement spreads the real module. That gap let this leak through. The repository has 105 `mock.module` rows with other specifiers, mostly in `apps/www`. This page and a session chip track it. owner: zbeyens. stop: the lint covers third-party specifiers, or the testing reference narrows its rule to Plate modules.
