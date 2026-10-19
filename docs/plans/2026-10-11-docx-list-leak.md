# DOCX list round trip fails in a combined www run

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/8aLdXHLEk92Mq2hw2ETgvb
Playbook: bug-fix

Five DOCX list round-trip cases failed, and `list.spec.tsx` failed to load, when several www specs ran in one `bun test` process. Each passed alone. The cause was `import-toolbar-button.spec.tsx`, whose module mocks stayed in place for every file that ran after it.

## Main changes

- `apps/www/src/registry/components/editor/import-toolbar-button.spec.tsx` no longer calls `mock.module`. It spies on `useFilePicker`, `importDocx` and `toast.error`, and `mock.restore()` undoes the spies after each test. It renders the real dropdown menu and toolbar inside `TooltipProvider` and `Toolbar`, as `comment-toolbar-button.spec.tsx` does.
- `tooling/oxlint/plate-baseline.json` drops the spec's `plate/mock-spreads-module` entry, because the finding is gone and the baseline check fails on an entry the tree no longer holds.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the import button test fakes a Word import | Fakes that clean up after each test, with the real menu and toolbar | Keep the old fakes and swap the real code back when the file ends | re-mock | small |
| Old count in the cleanup list | Leave it and flag it here, since another session is editing that file | Change 35 to 34 now | fix count | detail |

## Close

**What was broken.** The reported command printed 97 pass, 6 fail and 1 error. Five `DOCX list round trip` cases failed because the import returned no lists. Four got `[]` back, and one threw a `TypeError` on the missing list content. `list.spec.tsx` stopped at `SyntaxError: Export named 'ToolbarMenuGroup' not found in module '.../site-registry/toolbar.tsx'`, so none of its tests ran.

**Root cause.** Bun's `mock.module` replaces a module for the rest of the process, and the spec's `afterAll(() => mock.restore())` did not put it back. The spec replaced `platejs/docx/import` with a fake whose `importDocx` always returns one paragraph reading `after`, so the round trip imported no lists. It also replaced `@/registry/components/editor/toolbar` with a module that exports only `ToolbarButton`, so `list-toolbar-button.tsx`, which imports `ToolbarMenuGroup` from it, failed to link. `pnpm test` never showed this, because `tooling/scripts/test-suite.mjs` runs each file that contains `mock.module(` in its own process. A raw `bun test <paths>` run has no such isolation.

**How it was found.** Pairing the spec with `list-roundtrip.spec.tsx` failed the same five cases. Pairing it with `list.spec.tsx` printed the same error. Pairing `list.spec.tsx` with `list-roundtrip.spec.tsx` passed. A probe showed that Bun's `spyOn` patches an ESM module's export, that a later dynamic import sees the patch, and that `mock.restore()` puts the original back.

**Proof.** Each run used a detached worktree at `5fc246c291`, made by `tooling/scripts/proof-worktree.mjs`, so other sessions' uncommitted work could not affect it.

- At `HEAD`, the reported command fails the reported way: 97 pass, 6 fail, 1 error, with both expected failure texts. Log: `docs/plans/artifacts/docx-list-leak/head-control-a1.log`.
- With the new spec at `HEAD`, the same command gives 113 pass, 0 fail, and `list.spec.tsx` loads. Log: `docs/plans/artifacts/docx-list-leak/candidate-a1.log`.
- With the component's `result.source?.dispose()` call removed, the new spec fails "keeps the document and comments when imported comment preparation fails", so the spies reach the component. Log: `docs/plans/artifacts/docx-list-leak/mutant-no-dispose-a1.log`.
- `pnpm test` adds no failure. The spec now runs in the shared batch with the specs that do not mock modules, which grows from 423 tests in 99 files to 425 tests in 100 files. Both runs fail the same three ways, so those failures predate this change. One is `keeps platejs/migrations runtime exports exact`, one is `DOCX revision import keeps heavy work constant and sparse`, and seven docs tests cannot find `collections/server`, which a fresh worktree lacks. Logs: `docs/plans/artifacts/docx-list-leak/candidate-fast-lane-a1.log` and `docs/plans/artifacts/docx-list-leak/head-fast-lane-a1.log`.
- `pnpm lint:task` on the spec exits 0, tsc over the spec through `docs/plans/artifacts/docx-list-leak/tsconfig.spec-check.json` reports 0 errors, and `node tooling/oxlint/plate-baseline.mjs --check` exits 0. Logs: `docs/plans/artifacts/docx-list-leak/lint-task-a1.log`, `docs/plans/artifacts/docx-list-leak/tsc-spec-a1.log` and `docs/plans/artifacts/docx-list-leak/lint-baseline-check.log`.

**Limits.** The fix covers this one spec. Other www specs still replace modules with partial fakes. `plate/mock-spreads-module` requires a fake to spread the real module, which keeps every export present. It does not bring back a function the fake replaced. A later file in a shared `bun test` run still gets that fake function.

## Open work

- The other 34 baselined partial module fakes can leak into later specs the same way in a raw `bun test` run. owner: zbeyens; tracked: the "Spread the real module in the 35 baselined partial mocks" item in `docs/plans/topics/correct.md`; stop: that item closes, or the runner's per-file isolation becomes the only supported way to run www specs together.
