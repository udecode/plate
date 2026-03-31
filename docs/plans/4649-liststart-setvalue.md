# 4649 listStart setValue

## Goal

Keep ordered-list `start` values from markdown deserialization intact after `editor.tf.setValue(...)` so list rendering and markdown export can use the real numbering.

## Source Of Truth

- GitHub issue: `udecode/plate#4649`
- Title: `Editor SetValue stripping out listStart from deserialized Markdown breaking list rendering.`
- Type: bug
- Expected outcome:
  - deserialized ordered lists keep `listStart`
  - `setValue` does not strip that field
  - list UI and markdown export can read the preserved value

## Likely Seams

- `packages/list/src/**`
- `packages/core/src/**` if normalization strips unknown element props
- `packages/markdown/src/**` if deserializer shape is mismatched

## Plan

1. Inspect current list element types, normalization, and markdown deserializer output shape.
2. Reproduce with the smallest behavior test around `setValue`.
3. Fix the ownership seam that drops `listStart`.
4. Verify with targeted tests, then package build/typecheck/lint for touched packages.
5. Decide whether a changeset is needed.

## Findings

- Issue report says markdown deserialization already emits the correct `listStart`.
- The field disappears after `editor.tf.setValue(...)`, so the likely bug is not parsing; it is normalization or node copying.
- Existing solution docs mention markdown list serializer bugs, but nothing yet on `listStart` loss through editor value setting.
- The real ownership seam is the list normalizer: a first item with `listStart > 1` is only preserved when the node also carries `listRestart` or `listRestartPolite`.
- Markdown deserialization emitted `listStart` but not the restart metadata, so normalization stripped the first item of a restarted ordered list and renumbered following siblings incorrectly.

## Progress

- Read issue `#4649`
- Read repo instructions
- Loaded planning + TDD guidance
- Checked existing `docs/solutions` for related prior fixes
- Added a regression spec covering `deserializeMd(...)` + `editor.tf.setValue(...)`
- Fixed ordered-list deserialization to add `listRestartPolite` on the first item of ordered lists that start above `1`
- Verified with package tests, build, typecheck, and lint

## Verification Targets

- Regression test that fails before the fix
- Targeted package test sweep for touched specs
- `pnpm install`
- `pnpm turbo build --filter=...`
- `pnpm turbo typecheck --filter=...`
- `pnpm lint:fix`
