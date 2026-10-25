# Wordgard: testing and proof

## Running Wordgard's suites

- **Rebuild dist first.** Wordgard's Node package imports and browser test imports resolve the git-ignored `dist` build, not `src`, so a test run exercises whatever was last built. On 2026-08-01 the recorded 572 unit and 733 browser results ran `dist` from `01eb2b5`, seven commits behind the checked-out head `c715d4d` (docs/editor-issue-harvester/wordgard/full/issue-refresh.md:12-19). Run `node bin/build.ts` before trusting a run; the 2026-09-02 harvest did (docs/editor-test-harvester/wordgard/report.md:40-47). Limit: the probe file the refresh cites is under docs/plans/artifacts and absent from a fresh checkout.

- **Fresh-build run.** At `b5ad0d0`, in an isolated archive of frozen HEAD with hardlinked dependencies, `node bin/build.ts` passed, `npm test` passed 594 tests, and `node bin/test-headless.ts` with desktop Google Chrome ran 764 tests with 0 failures (2026-09-02). Wordgard has only one desktop Chromium browser runner, so a green Wordgard run says nothing about Plite on WebKit, Firefox, mobile viewports or real devices. The harvest's `covered` rows mean the live Plite and Plate owners and assertions were read in source, not rerun; only the affected and strict Plite gates ran (docs/editor-test-harvester/wordgard/report.md:40-49, 198-206).

- **Pass the browser executable explicitly on macOS.** The 2026-07-27 Wordgard audit at `01eb2b5eae509509677345fd603acad001827dff` found that the upstream headless runner's default executable discovery expected a Linux-style Chromium name. Its supported override, `npm run test-headless -- --binary '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`, ran the unchanged harness with 733 passing tests. Evidence: `c70bacbd4a:docs/plans/2026-07-27-wordgard-full-strict-editor-audit.md:304-307,355,385-386`. This is a historical desktop Chrome run; the plan does not establish that a fresh build preceded it, and it proves no mobile-device behavior.

## Harvest preconditions

- **License and upstream.** Wordgard is MIT-licensed (`LICENSE` and `package.json` at `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`). Upstream is https://code.haverbeke.berlin/wordgard/wordgard.git, branch main. Its tests live under `test/`: unit files are `test-*.ts` and browser files are `webtest-*.ts` (docs/editor-test-harvester/wordgard/report.md:20-31; inventory.md).

## Test tree

- **Harness files.** `test/generate.ts` (random document and change generators), `test/schema.ts` (shared schema, builders and tagged-position fixtures) and `test/tempview.ts` (browser mount and focus fixture) are harness files. They assert no behavior of their own (report.md:141; inventory.md).
