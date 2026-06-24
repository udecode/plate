---
title: Package typecheck must run public type contracts
date: 2026-05-04
category: docs/solutions/developer-experience
module: plite public api
problem_type: developer_experience
component: tooling
symptoms:
  - a generic public type contract failed only when its dedicated tsconfig ran
  - package typecheck passed while the public contract was not exercised
  - an exported hook option type could drift from the hook generic type
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [plite, typecheck, public-api, typescript, react-runtime]
---

# Package typecheck must run public type contracts

## Problem
A public TypeScript contract can exist in the repo and still be dead if the
package typecheck script never runs its tsconfig. That is especially dangerous
for Plite public API work because type-only drift does not show up in runtime
tests.

## Symptoms
- `bun --filter plite-react typecheck` passed.
- `bunx tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit`
  failed because `EditorSelectorOptions` was not exported from `plite-react`.
- The same contract also exposed that selector option callbacks were not tied
  to `useEditorSelector<T, TEditor>`'s editor value type.

## What Didn't Work
- Relying on the package `src/**/*` typecheck. It proved the implementation,
  but not the public generic usage file under `test/`.
- Treating the dedicated type-contract tsconfig as enough by itself. If the
  script is not wired into a normal package gate, future agents and CI can miss
  the contract.

## Solution
Make the public option type match the hook generic and run the dedicated
contract from the package typecheck.

Representative shape:

```ts
export interface EditorSelectorOptions<
  TEditor extends ReactEditor<any> = ReactEditor<any>,
> {
  shouldUpdate?: (
    operations?: readonly Operation<ValueOf<TEditor>>[],
    change?: SnapshotChange<ValueOf<TEditor>>
  ) => boolean
}
```

```json
{
  "scripts": {
    "typecheck": "tsc --project tsconfig.json --noEmit && tsc --project test/tsconfig.generic-types.json --noEmit"
  }
}
```

Then keep a public contract file that imports from the package root:

```ts
import { type EditorSelectorOptions, useEditorSelector } from 'plite-react'

const selectorOptions: EditorSelectorOptions<typeof reactEditor> = {
  shouldUpdate: (operations, change) => {
    const typedOperations: readonly Operation<CustomValue>[] | undefined =
      operations
    const typedChange: SnapshotChange<CustomValue> | undefined = change

    return Boolean(typedOperations || typedChange)
  },
}
```

## Why This Works
The package typecheck becomes a real public API gate, not just an implementation
gate. Importing from `plite-react` catches missing root exports, while the
generic option type catches drift between callback facts and the editor value
type.

Keeping the internal selector event bus raw is fine. The public hook adapts raw
commit facts into the typed callback shape, so user-facing DX improves without
making the internal fanout context generic.

## Prevention
- Public type contracts should import from the package root, not internal
  source files.
- Dedicated type-contract tsconfigs must be wired into a package script that
  normal verification runs.
- If a hook accepts `TEditor`, its option callbacks should carry the same editor
  value type unless there is a deliberate reason to keep them raw.
- A green package typecheck only means "the package script checked it"; inspect
  the script before trusting it for public API contracts.

## Related Issues
- `docs/solutions/developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md`
