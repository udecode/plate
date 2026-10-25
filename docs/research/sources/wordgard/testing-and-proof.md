# Wordgard: testing and proof

## Running Wordgard's suites

- **Rebuild dist first.** Wordgard's Node package imports and browser test imports resolve the git-ignored `dist` build, not `src`, so a test run exercises whatever was last built. On 2026-08-01 the recorded 572 unit and 733 browser results ran `dist` from `01eb2b5`, seven commits behind the checked-out head `c715d4d` (docs/editor-issue-harvester/wordgard/full/issue-refresh.md:12-19). Run `node bin/build.ts` before trusting a run; the 2026-09-02 harvest did (docs/editor-test-harvester/wordgard/report.md:40-47). Limit: the probe file the refresh cites is under docs/plans/artifacts and absent from a fresh checkout.

- **Fresh-build run.** At `b5ad0d0`, in an isolated archive of frozen HEAD with hardlinked dependencies, `node bin/build.ts` passed, `npm test` passed 594 tests, and `node bin/test-headless.ts` with desktop Google Chrome ran 764 tests with 0 failures (2026-09-02). Wordgard has only one desktop Chromium browser runner, so a green Wordgard run says nothing about Plite on WebKit, Firefox, mobile viewports or real devices. The harvest's `covered` rows mean the live Plite and Plate owners and assertions were read in source, not rerun; only the affected and strict Plite gates ran (docs/editor-test-harvester/wordgard/report.md:40-49, 198-206).

- **Pass the browser executable explicitly on macOS.** The 2026-07-27 Wordgard audit at `01eb2b5eae509509677345fd603acad001827dff` found that the upstream headless runner's default executable discovery expected a Linux-style Chromium name. Its supported override, `npm run test-headless -- --binary '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`, ran the unchanged harness with 733 passing tests. Evidence: `c70bacbd4a:docs/plans/2026-07-27-wordgard-full-strict-editor-audit.md:304-307,355,385-386`. This is a historical desktop Chrome run; the plan does not establish that a fresh build preceded it, and it proves no mobile-device behavior.

At Wordgard's frozen unreleased head `c715d4ded8fc780f52c13206e589ea31e4148dd4`, the August 2026 audit recorded five TypeScript diagnostics in `src/schema/code.ts` and `src/schema/index.ts`. `npm run prepare` printed the failures but exited zero, and a clean pack also exited zero while containing only LICENSE, README and package metadata, with all 22 runtime/declaration targets missing. Source: `docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md:130-132`, reproduced there by `probe-wordgard-public-contracts.mjs`. Limit: this is a frozen unreleased-head finding, not a claim about current Wordgard or its published release; successful command exit alone did not prove a usable artifact.

The August 2026 audit independently checked the published `wordgard@0.3.1` package: its tarball contained 30 files and 11 runtime/declaration entrypoints, and every import succeeded after installing production dependencies. Source: `docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md:135`, with the separate `probe-wordgard-published-package.mjs` receipt at line 211. Limit: published-package validity and the broken clean build of unreleased head `c715d4d` were separate findings; neither result could substitute for the other.

## Harvest preconditions

- **License and upstream.** Wordgard is MIT-licensed (`LICENSE` and `package.json` at `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`). Upstream is https://code.haverbeke.berlin/wordgard/wordgard.git, branch main. Its tests live under `test/`: unit files are `test-*.ts` and browser files are `webtest-*.ts` (docs/editor-test-harvester/wordgard/report.md:20-31; inventory.md).

## Test tree

- **Harness files.** `test/generate.ts` (random document and change generators), `test/schema.ts` (shared schema, builders and tagged-position fixtures) and `test/tempview.ts` (browser mount and focus fixture) are harness files. They assert no behavior of their own (report.md:141; inventory.md).
