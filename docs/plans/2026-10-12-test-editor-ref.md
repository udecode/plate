# Test harness: find the editable through a ref

Status: executed: left uncommitted on next for your commit
Topic: editor-public-naming
Playbook: bug-fix

## Brief

### What will change?

The test helper now finds its own editor when another editor is on the page, or when a test sets its own test id. Two new tests prove it, and the change is uncommitted on next.

### What could go wrong?

A test that looked the editor up by the helper's old built-in test id would now find nothing. No test in the repo does that, and the test package has never shipped.

## Teach

The test helper puts an editor on the page and gives back actions like type and paste. Each action sends browser events to the part of the editor you type into, so the helper has to find that part first.

Until now it stamped that part with a fixed test id and searched the whole page for it. With two helpers on one page, it found two and threw. When a test set its own test id, that overwrote the stamp, and the search found nothing.

Now the helper hands the editor a ref and gets back the exact element it drew, so it never grabs another editor by mistake. A test's own ref still gets that element, and the fixed test id is gone.

## Public API

A test can now give the editable its own test id and ref through the helper's editable props.

```ts before
```

```ts after
// packages/test/test/react/createTestEditor.test.tsx
const result = await createTestEditor(
  { initialValue: [paragraph('one')] },
  {
    componentProps: {
      editableProps: { 'data-testid': 'caller', ref: callerRef },
    },
  }
);
```

## Hard cuts and app migration

The test id bullet now reads:

- `createPlateTestEditor` loses its `testID` option, and `PlateTest` no longer marks its editable with a default test id; the harness finds the editable it rendered through a ref. Tests select the editable by role, as Public API shows, and a caller's own `data-testid` or `ref` in `editableProps` reaches the editable.

## Main changes

- `createTestEditor` finds its editable through the ref that `EditorContent` passes to the editable element, composed with any `editableProps.ref`, instead of querying the whole document for a test id. `EditorTestProps.editableProps` accepts `data-*` keys.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Test ids in the helper's editor props | The helper's editor props take test ids and other data attributes | Keep the old type, so a test id only gets through a loose object | narrow editable props | small |
| Release note | None, because the test package has never shipped | Add a release note for the test package | add changeset | detail |
| Element left over after unmount | Leave it, since the helper reads the element once, right after mount | Clear it on unmount when a test's own ref returns a cleanup | clear on unmount | detail |

## Close

**Deviation.** The ask named one change, a ref in `EditorTest` or the harness. The build also widens `EditorTestProps.editableProps` to accept `data-*` keys. TypeScript refused a `data-testid` key in an `editableProps` object literal (TS2353), so the test for a caller's own test id could not typecheck without it. The Defaults row "narrow editable props" reverses it.

**What landed.** `packages/test/src/react/createPlateTestEditor.ts` gives `EditorContent` a ref callback that keeps the editable element and forwards it to any `editableProps.ref`, then reads that element after mount instead of calling `getByTestId`. `packages/test/src/react/PlateTest.tsx` drops `data-testid="editor-test-editable"` and types the data keys. `packages/test/test/react/createTestEditor.test.tsx` adds one test per limit. The subject file now describes the ref lookup, and its Open work drops the closed chip.

**Proof.**

- Red before the fix, in `docs/plans/artifacts/2026-10-12-test-editor-ref/red-before-fix.log`. The two-harness test threw "Found multiple elements by: [data-testid="editor-test-editable"]". The caller test threw "Unable to find an element by: [data-testid="editor-test-editable"]". The run passed 2 and failed 2.
- Green after the fix. `docs/plans/artifacts/2026-10-12-test-editor-ref/react-partition-a1.log` passes 6 of 6 across the three `test/react` files. That includes the nested `beforeEditable` editor test and the `role: 'document'` test.
- Mutants, from `mutate.mjs` on frozen commit `351477c9c7`. Dropping the caller-ref forward fails the caller test with `Received: null`. A document-wide `[data-editor="true"]` lookup fails the two-harness and nested-editor tests.
- The requested gate, `TURBO_FORCE=true pnpm --filter @platejs/test test`, passes in this checkout with 39 of 39 tasks and none cached (`docs/plans/artifacts/2026-10-12-test-editor-ref/test-pkg-a2.log`). Its first run, `test-pkg-a1.log`, failed one source-text test on `playwright/BROWSER_HANDLE_KEY`. Another session changed that file at 18:54 and its test at 19:02. Paired worktree runs from one frozen tree failed that test the same way with and without this patch. With that one file set back, the gate passed 39 of 39 with this patch.
- `TURBO_FORCE=true pnpm --filter @platejs/test typecheck` passes 36 of 36 tasks, none cached. `tsc -p packages/test/tsconfig.test.json` reports no error in this task's files, and its 20 other errors are unchanged.
- `pnpm lint:task` on the three files exits 0. Its only edit joined the `EditorContent` JSX onto one line.

**Limits.** The proof runs in Bun with happy-dom, which is the harness's own runtime. No browser run applies. The probe at `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/two-harness.probe.test.tsx` was not rerun, because the new two-harness test covers its case and also types into the second editor.

**Counts.** 19 items: 17 done, 0 partial, 2 skipped, 0 blocked, 0 open. The skips are binary search, because the owner named the cause and the red run confirmed it, and opening a PR, which nobody asked for.

**Open work.** None from this iteration.
