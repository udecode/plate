---
title: Slate v2 shouldNormalize must be pass-level and fallback-safe
date: 2026-04-08
category: developer-experience
module: slate-v2 core normalization
problem_type: developer_experience
component: tooling
symptoms:
  - partial shouldNormalize wiring crashed broader Slate tests with TypeError editor.shouldNormalize is not a function
  - the hook was called once per normalize entry instead of once per normalization pass
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, normalization, should-normalize, extension-model, snapshot-contract]
---

# Slate v2 shouldNormalize must be pass-level and fallback-safe

## Problem

A partially-wired `shouldNormalize` hook looked fine on the narrow editor seam,
but it widened core assumptions too early. The result was an incoherent hook
contract and breakage in broader Slate test families.

## Symptoms

- `yarn test:custom` failed across range-ref coverage with
  `TypeError: editor.shouldNormalize is not a function`
- the new snapshot-contract row showed `shouldNormalize` firing twice with the
  same `{ iteration, operation }` payload during one pass

## What Didn't Work

- Adding the hook to `createEditor()` and the editor types without a core
  fallback. Wrapped or older editor-shaped instances then crashed as soon as
  normalization ran.
- Calling `shouldNormalize` inside the per-entry loop. That gave the same
  options to multiple calls and made the API shape vague.

## Solution

Keep `shouldNormalize` as a narrow gate over the custom normalization pass, and
evaluate it once per pass with a safe fallback:

```ts
const normalizeOptions: NormalizeNodeOptions = {
  operation: transaction.operations[transaction.operations.length - 1],
}
const shouldNormalize =
  (editor as Partial<Editor>).shouldNormalize?.({
    iteration,
    operation: normalizeOptions.operation,
  }) ?? true

if (!shouldNormalize) {
  return
}

for (const entry of entries) {
  const beforeMutationCount = transaction.mutationCount
  editor.normalizeNode(entry, normalizeOptions)

  if (transaction.mutationCount !== beforeMutationCount) {
    changed = true
    break
  }
}
```

Then prove the contract in `snapshot-contract.ts`:

- `createEditor()` exposes `shouldNormalize`
- `Editor.shouldNormalize(...)` delegates through the instance seam
- `shouldNormalize` runs once per custom normalization pass
- returning `false` skips the custom pass for that transaction

## Why This Works

`shouldNormalize` now has one job: decide whether the current custom
normalization pass should run. It no longer masquerades as an entry-level hook,
and core no longer explodes when an older editor instance has not grown the new
method yet.

## Prevention

- When adding an overrideable editor hook, prove call cadence, not just method
  existence.
- New hooks in core need a compatibility fallback unless every editor entry
  point is already guaranteed to provide them.
- Use one red test for the narrow contract and one red test against a broader
  family so a half-hook cannot sneak through.

## Related Issues

- [true-slate-rc-proof-ledger.md](../../slate-v2/true-slate-rc-proof-ledger.md)
- [2026-04-08-slate-v2-normalization-policy-recovery.md](../../plans/2026-04-08-slate-v2-normalization-policy-recovery.md)
