# Fix the www typecheck's test type errors

Status: done, waiting on your commit on next
Page: https://claude.ai/artifact/BqDagxZFe2VWbTniEngxvF
Playbook: verdict

Verdict: Pursue a small fix at each error's owner. Suggested task `task_b7aaefbb` in `docs/plans/suggested-tasks.decisions.tsv` carried the findings. The www typecheck fails on fourteen type errors in test code and on a stale generated schema, and each has its own owner. The two drive tests import Bun's test helpers from `bun:test`, as most www tests already do, because www's configs type test globals as Jest's. The DOCX test reads fields a warning may lack, so the test narrows them. The API contract still expects a list API that a redesign removed, so the contract drops it. `editor:generate` rewrites the plugin schema, which predates the details block's summary prefix. The testing reference told www tests to do something www's configs cannot support, so this run scopes that line. Two more failures in the same script, the CodeMirror type error and the API reference check, belong to the package-suites task `t_54844d26`.

## Brief

### What will change?

The www typecheck no longer fails on test code or on a stale schema. Two drive tests import Bun's helpers, a DOCX test checks a warning's kind, a contract drops a removed list API, and the site regenerates its schema.

### What could go wrong?

Only tests, the site's own generated schema and one rule line change, so Plate users see nothing different. The typecheck still fails on the CodeMirror error and the API reference check until the package-suites task lands.

## Teach

The www app's typecheck runs a schema check, then TypeScript over the site and over the package integration tests. All three failed. The failures this task fixes are in test code and a generated schema.

Each type error is a test using something its types don't have. www's configs describe the test helpers with Jest's types, so a www test that wants Bun's helpers imports them from Bun's test module, as most www tests do. Two drive tests skipped that import. A DOCX list test reads a warning's feature and path, which only some warnings have. A type contract still expects a list API that October's list redesign removed.

The schema check failed because the details block changed after the site last generated its plugin schema. The fix is two imports, a feature check, a dropped list key and a regenerated schema.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where www tests get Bun's test helper types | Import them from Bun's test module in each test, as most www tests do | Load Bun's test types for the whole site, then fix the 30 test files that breaks | globals | small |
| What the testing reference tells www tests | Limit its Bun globals line to package tests, and say www tests import from Bun's test module | Keep the line, which www's configs cannot follow | keep rule | detail |
| What the DOCX warning type promises | Keep it, and make the test check a warning's kind first | Give every DOCX warning a feature and a path | widen warnings | small |
| The list entry in the editor API contract | Drop it, because the list plugin now uses list reads and updates | Give the list plugin an API again | list api | detail |
| The CodeMirror type error and the API reference check in the same script | Leave them to the package-suites task, which lists both | Fix them here too | fix them here | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort.

### Requirements

- `pnpm --filter www typecheck` passes its `editor:check` link, and its two `tsc` links report no error outside the CodeMirror one that `t_54844d26` owns. The task owns these checks as `cmd:www-typecheck` and `cmd:www-editor-check`.
- No gate weakens. The API contract still refuses a missing or phantom key, and each test keeps the behavior it asserted.
- Test types follow `.agents/rules/verify/references/testing.md`. At the base it said "Bun globals come from `tooling/config/global.d.ts`" and forbade `bun:test` imports, which www's configs cannot follow, as the drive lane below shows.

### Errors at the base

`d0209b439a`, run in this worktree after an offline install, with every link of the typecheck script run in turn (`docs/plans/artifacts/2026-10-17-www-typecheck/www-links-head-a1.log`).

- `tsc -p tsconfig.json`: seven errors in `src/components/drive-beacon.spec.tsx` and `src/lib/drive-reporter.spec.tsx`. Both call the globals `mock`, `spyOn(...).mockReturnValue` and `toStartWith`, and www's configs load only the root `tsconfig.json`'s `types`, whose Jest globals give `spyOn` a Jasmine `Spy`.
- `tsc -p tsconfig.package-integration.json`: one error in `core-runtime/editor-api-inference.contract.ts`, whose expected keys still list `list`, and six in `docx/list-roundtrip.spec.tsx`, which destructure `feature` and `path` from every `DocxDiagnostic` arm and read `listStart` from a fixture type that lacks it.
- Both configs also report TS2532 at `packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts:300`. Suggested task `t_54844d26` names this error in its findings and lists the file in its writes.
- With the CLI built, `editor:check` reports `apps/www/src/registry/components/editor/plugins.schema.json` stale (`docs/plans/artifacts/2026-10-17-www-typecheck/editor-check-a1.log`).
- `api-reference:check` stops on "symbol EditorDirectCommandDispatch must be included or excluded exactly once", which `t_54844d26` names in its findings and owns as `cmd:www-api-reference`.

The platejs build that the CLI loads emits its JavaScript but fails its declaration step on the Plite JSDoc at `packages/plitejs/src/react/external-text.ts:79` and `:83`, which `t_54844d26` also names (`docs/plans/artifacts/2026-10-17-www-typecheck/build-cli-deps-a1.log`). `editor:check` needs only that JavaScript.

### Prior work

- `node tooling/scripts/review-ledger.mjs lookup` finds heads for `docx` (`docs/plans/2026-10-06-documents-review.md`) and `list` (`docs/plans/2026-10-14-list-paste-type-adoption.md`). Neither sets the shape of the DOCX warning union or a list API for these tests. The documents review lists the `native-data-ignored` warning, one of the arms with no feature. `drive` and `www-typecheck` match no scope.

### Lanes

- Drive tests. The pick imports `mock`, `spyOn` and `expect` from `bun:test` in each spec, as 111 of www's 184 test files do. A scratch config over the two specs reports no error with those imports (`probe/drive-imports-a1.log`). The other lane adds `../../tooling/config/global.d.ts` to the `include` of both www configs, as `packages/platejs/tsconfig.json` does and the testing reference asked. It retypes every www test's `mock` as Bun's, so the full typecheck reported 85 new errors in 30 other www test files (`www-links-cand-a1.log`). One is a `Mock<() => void>` that no longer fits an `(open: boolean) => void` prop. The same run still left `toStartWith` untyped on Jest's `expect`.
- DOCX warnings. The pick narrows with `'feature' in diagnostic` through one `pathsOf` helper, which replaces the spec's five copies of the same filter, and types the fixture as the `Value` it already is, which types its `listStart` read and drops two casts. Widening every `DocxDiagnostic` arm with `feature` and `path` would make a public union lie about warnings that have no feature, to suit one test. Typing `feature` as a literal union is the separate DOCX diagnostics typing question that `docs/plans/2026-10-10-list-review.decisions.tsv` deferred, and it would not fix these errors alone, because destructuring still fails on arms without the field.
- API contract. Commit `c01399d08b` removed the list plugin's `api` factory, and its changeset `.changeset/list-scoped-api.md` moved list queries to `editor.read.list` and mutations to `editor.update.list`. Dropping `list` keeps the contract's rule, every installed API key and no phantom key. Restoring a list API would undo that redesign.
- Plugin schema. `pnpm editor:generate` rewrites only `plugins.schema.json`, which gains the details block's `summary` prefix and the remainder after it. `plugins.generated.ts` stays byte-identical (`editor-generate-a1.log`). The 2026-08-24 registry changelog entry makes these files app-owned, so no installed editor receives them.

## Steps

- [x] Reproduce every error at the base. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/www-links-head-a1.log`.
- [x] Import Bun's test helpers from `bun:test` in both drive specs. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/probe/drive-imports-a1.log` reports no error, and the specs pass under Bun (`drive-beacon-final-a1.log`, `drive-reporter-final-a1.log`).
- [x] Narrow the DOCX warning reads, type the fixture, and drop `list` from the API contract. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/list-roundtrip-final-a1.log` passes 22 tests with the 27 `expect()` calls of `list-roundtrip-base-a1.log`.
- [x] Regenerate the stale plugin schema. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/editor-generate-a1.log`.
- [x] Scope the testing reference's Bun globals line to package tests. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/sync-resources-a1.log`.
- [x] Rerun every link of the typecheck script on the final bytes. Proof: `docs/plans/artifacts/2026-10-17-www-typecheck/www-links-final-a2.log` shows `editor:check` exiting 0 and both `tsc` links reporting only the CodeMirror TS2532 that `t_54844d26` owns.

## Close

Reversal. The plan first picked loading `tooling/config/global.d.ts` in both www configs, as the testing reference said. The full typecheck with that include reported 85 new errors in 30 other www test files, so the drive specs import from `bun:test` instead, both configs stay unchanged, and the testing reference's line now says what a www test does.

What lands. The patch puts these on next's working tree, uncommitted, for the owner's commit: the drive specs' `bun:test` imports, the DOCX spec's `pathsOf` helper and `Value` fixture type, the contract without its `list` key, the regenerated `plugins.schema.json`, the scoped testing reference line with its generated copy, and this plan with its decision log.

Proof. `www-links-final-a2.log` ran every link of the typecheck script on the final bytes, after lint. `editor:check` exits 0. Both `tsc` links report only TS2532 at `createCodeMirrorAdapter.ts:300`, and `api-reference:check` stops on `EditorDirectCommandDispatch`. The three changed specs pass under Bun, and the DOCX spec keeps the base's 22 tests and 27 `expect()` calls.

Limits. The typecheck script as a whole still exits 1 until `t_54844d26` lands. The run checked types and the changed specs only. It ran no browser and no www build, because no runtime code changed.

Attention, reviewed by gpt-6.1-sol @xhigh. The decision-trail review found no critical issue, three warnings and one nit, and this run applied each.

- The verdict playbook's history check and its `how` step did not run before the plan. The review-ledger lookups under Prior work now cover the history check, and they change no pick. The `how` step stays skipped, because each error's owner came from its failing line, `git log` and the ledger.
- No started row named this run's directory before the run wrote into it. A started row now names it, after those writes.
- Two rows said the CLI's package dependencies built. The platejs declaration step failed, so a corrected row and the Errors at the base section now say only the CLI and platejs's JavaScript built.
- Teach said none of the failures were in product code, though the CodeMirror error is. It now names only the failures this task fixes.

## Open work

- The CodeMirror TS2532 and the `api-reference:check` failure keep `pnpm --filter www typecheck` red. owner: the owner, through suggested task `t_54844d26` in `docs/plans/suggested-tasks.decisions.tsv`, which owns `cmd:www-typecheck` from this task's landing. stop: `t_54844d26` lands.
