---
title: test-slow must isolate helper-driven Bun module mocks too
problem_type: test_failure
component: testing_framework
root_cause: test_isolation
module: testing
severity: medium
symptoms:
  - "a `.slow.ts[x]` spec passes alone but fails when batched with other slow specs"
  - "`mock.module(...)` leaks across slow-lane files and breaks unrelated imports"
tags:
  - bun
  - test-slow
  - mock.module
  - slow-lane
  - test-isolation
---

# Summary

The slow lane was batching every `*.slow.ts[x]` file together even when some of
those specs, or their local helpers, used Bun `mock.module(...)`.

That made `pnpm test:slow` flaky in a stupid way: one slow spec could partially
replace a shared module surface and poison the next spec in the batch.

# What Happened

`packages/callout/src/react/hooks/useCalloutEmojiPicker.slow.tsx` passed when
run alone:

```bash
bun test ./packages/callout/src/react/hooks/useCalloutEmojiPicker.slow.tsx
```

But it failed when run together with other slow specs because another slow file
mocked `platejs/react` with `mock.module(...)`, and `tooling/scripts/test-slow.mjs`
was still doing one shared Bun run for the whole batch.

# Fix

Teach `tooling/scripts/test-slow.mjs` the same local-import-graph isolation
logic already used by `tooling/scripts/test-fast.mjs`.

The runner now:

1. walks local imports for each slow spec
2. marks a spec as isolated if any file in that local graph contains
   `mock.module(`
3. runs non-mocking slow specs in a shared batch
4. runs the isolated ones one-by-one

# Rule

If `test-fast` needs helper-graph isolation for Bun module mocks, `test-slow`
needs it too. Slow specs are still specs. They do not get a free pass on suite
pollution just because they live in the slow lane.
