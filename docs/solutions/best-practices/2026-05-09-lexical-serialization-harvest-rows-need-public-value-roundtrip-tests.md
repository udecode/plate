---
title: Lexical serialization harvest rows need public value roundtrip tests
date: 2026-05-09
category: docs/solutions/best-practices
module: plite lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical serialization tests expose huge editor-state JSON snapshots.
  - Directly copying the fixture would lock Plite to Lexical schema details.
root_cause: wrong_api
resolution_type: test_fix
severity: low
tags: [plite, lexical-harvest, serialization, json, testing]
---

# Lexical serialization harvest rows need public value roundtrip tests

## Problem

Lexical serialization unit tests can look portable because they use JSON
round-tripping, but the fixture mostly asserts Lexical's editor-state schema.
For Plite, the useful invariant is narrower: raw document values must be
JSON-portable through the public state API.

## Symptoms

- The source test is a large exact JSON snapshot of Lexical nodes.
- The snapshot includes node versions, node keys, parser shape, table metadata,
  and class-specific fields.
- Porting the whole fixture would make Plite tests verify the wrong framework.

## What Didn't Work

- Treating Lexical editor-state JSON as a generic editor serialization contract.
- Looking for a matching Plite parser API instead of first isolating the raw
  document-value behavior.

## Solution

Add a compact public API test that serializes only Plite document values:

```ts
const serialized = JSON.stringify(value);
const parsed = JSON.parse(serialized) as Descendant[];
const editor = createEditor({ initialValue: parsed });
const exported = editor.read((state) => state.value.get());
const rehydrated = createEditor({
  initialValue: JSON.parse(JSON.stringify(exported)) as Descendant[],
});

assert.deepEqual(exported, value);
assert.deepEqual(
  rehydrated.read((state) => state.value.get()),
  value,
);
```

Keep runtime indexes and framework metadata out of the raw value assertion:

```ts
assert.equal(JSON.stringify(exported).includes("pathToId"), false);
assert.equal(JSON.stringify(exported).includes("idToPath"), false);
```

## Why This Works

Plite's public document value is the portable contract. Runtime IDs, indexes,
commit metadata, parser APIs, and node class schemas belong to other owners or
stay framework-specific. The test proves the behavior applications rely on
without pretending Plite should serialize like Lexical.

## Prevention

- For external editor serialization tests, first separate public document
  values from editor-state/runtime metadata.
- Add package tests for raw value JSON portability only when the current suite
  lacks that behavior.
- Reject exact editor-state snapshots from another framework unless the target
  framework intentionally exposes the same public shape.

## Related Issues

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts`
- `packages/plite/test/state-tx-public-api-contract.ts`
