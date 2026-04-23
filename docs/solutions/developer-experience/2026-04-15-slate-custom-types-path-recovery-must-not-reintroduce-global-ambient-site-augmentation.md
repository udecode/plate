---
title: Slate custom types path recovery must not reintroduce global ambient site augmentation
date: 2026-04-15
category: developer-experience
module: slate-v2 slate-react site examples
problem_type: developer_experience
component: tooling
symptoms:
  - restoring `site/examples/ts/custom-types.d.ts` by copying the legacy ambient module block caused unrelated example type explosions across the whole site program
  - fixing `slate-react` source types alone did not change site typecheck results because the site consumed built declaration output from `packages/slate-react/dist/src`
  - same-path examples like `check-lists` needed the legacy declaration file path back without poisoning unrelated examples
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, custom-types, declaration-files, dist-types, site-typecheck, render-element]
---

# Slate custom types path recovery must not reintroduce global ambient site augmentation

## Problem

`site/examples/ts/custom-types.d.ts` had drifted into a fake replacement file at
`custom-types.ts`.

The naive recovery path was to restore the legacy `.d.ts` file exactly,
including its ambient `declare module 'slate'` block.
That turned out to be wrong for the current repo shape.

## Symptoms

- `site/tsconfig.json` exploded across many unrelated examples as soon as the
  ambient `CustomTypes` block came back.
- `check-lists.tsx` still could not see a repaired `RenderElementProps` surface
  when only the `slate-react` source file changed.
- Example imports were still pointed at `./custom-types` instead of the legacy
  same-path declaration file.

## What Didn't Work

- Restoring the full legacy ambient augmentation wholesale.
- Assuming the site would read `packages/slate-react/src/**` types directly.
- Treating the package fix as complete without checking the declaration output
  the site actually consumed.

## Solution

Recover the path first, then keep the declaration file non-ambient unless the
whole site program can support the old augmentation again.

1. Restore `site/examples/ts/custom-types.d.ts` as the real same-path file.
2. Delete the fake `site/examples/ts/custom-types.ts` replacement.
3. Repoint example imports back to `./custom-types.d`.
4. Keep the local helper types and editor aliases in the declaration file, but
   do not reintroduce the global `declare module 'slate'` block yet.
5. Patch the `slate-react` declaration surface where the site really reads it:
   `packages/slate-react/dist/src/components/editable-text-blocks.d.ts`.
6. Mirror the same contract repair in
   `packages/slate-react/src/components/editable-text-blocks.tsx`.

Relevant files:

- [custom-types.d.ts](/Users/zbeyens/git/slate-v2/site/examples/ts/custom-types.d.ts)
- [check-lists.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx)
- [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- [editable-text-blocks.d.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/dist/src/components/editable-text-blocks.d.ts)

## Why This Works

There were really two separate contracts:

1. the contributor-facing same-path file contract for `custom-types.d.ts`
2. the built declaration contract the site program resolves from `slate-react`

Restoring only the path fixed neither if the ambient augmentation was too wide
for the current site, and repairing only the source package types fixed nothing
if the site still resolved stale built declarations.

By restoring the declaration file path while keeping it local, then repairing
the built `slate-react` declaration surface, the site can typecheck again
without lying about what the current global type model still supports.

## Prevention

- For declaration drift, recover the same-path declaration file before inventing
  a `.ts` replacement.
- Do not restore a legacy ambient module block blindly; prove the current whole
  program still supports it.
- When a consumer program typechecks against workspace packages, confirm whether
  it resolves source types or built `dist/*.d.ts` files before declaring the
  package fix complete.
- If the consumer reads built declarations, patch or rebuild the declaration
  output in the same recovery pass.

## Related Issues

- [Slate package declaration merging recovery must start from base aliases not example casts](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-15-slate-package-declaration-merging-recovery-must-start-from-base-aliases-not-example-casts.md)
- [Repair Drift](/Users/zbeyens/git/plate-2/.agents/rules/repair-drift.mdc)
