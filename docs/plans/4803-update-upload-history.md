# Issue 4803: updateUploadHistory throws when undos is empty

## Source Of Truth

- GitHub issue: https://github.com/udecode/plate/issues/4803
- Title: `updateUploadHistory throws an error when undos is empty`
- Type: bug
- Expected outcome: avoid the crash when no matching undo batch exists, preserve intended upload history behavior, and verify with targeted coverage.

## Scope

- Investigate `updateUploadHistory` in the media placeholder flow.
- Confirm current intent from nearby code and existing comments.
- Add the smallest sane regression test.
- Implement the minimal fix.
- Run targeted verification plus required repo checks for touched typed files.

## Findings

- Issue description is concrete: `findLastIndex` can return `-1`, which makes `editor.history.undos[index]` undefined and `batch.operations` crash.
- Maintainer comment says the function exists so undo removes successfully uploaded images together instead of stepping back through placeholders.
- No obviously relevant prior solution doc surfaced from `docs/solutions/`.
- `updateUploadHistory` is exported from `@platejs/media/react` but consumed by the docs/template placeholder component layer, so the right regression seam is the utility spec, not the demo component.

## Progress

- [x] Fetch issue and comments
- [x] Load task workflow skills
- [x] Start persistent plan doc
- [x] Read affected implementation and tests
- [x] Add failing regression test
- [x] Implement fix
- [x] Verify

## Verification Plan

- Targeted test for `updateUploadHistory`
- Build-first typecheck flow for affected package(s)
- `pnpm lint:fix`

## Verification Results

- `bun test src/react/placeholder/utils/history.spec.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/media`
- `pnpm turbo typecheck --filter=./packages/media`
- `pnpm lint:fix`
- `pnpm check`

## ce-compound Evaluation

- Skip. This was a small defensive guard with an obvious regression seam, not reusable enough to justify a solution doc.
