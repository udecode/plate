# Slate audit material dossiers

## P1 recursive JSON-array equality

Matrix concept: `SLATE-DEEP-ARRAY-001`.

Source thread: merged Slate PR #6092.

### Decision

Make Plite's internal equality owner recurse through array members. Keep the
public `TextApi.equals` call unchanged and port the behavior law, not Slate's
fixture harness.

This is the audit's only accepted material implementation candidate.

### Current and proposed public shape

No public API change.

```ts
import { TextApi } from '@platejs/plite';

TextApi.equals(
  { text: 'same', metadata: ['x', { active: true }] },
  { text: 'same', metadata: ['x', { active: true }] }
);
```

The call should return `true` because Plite node properties are JSON-native
values. Today it returns `false` when nested object/array members do not share
object identity.

### Current internal representation and owner

- `packages/plite/src/utils/deep-equal.ts:13-48` owns Plite node equality.
- Its array branch at lines 23-27 checks each member with `!==`.
- `packages/plite/src/interfaces/text.ts:137-149` exposes the behavior through
  `TextApi.equals`.
- Existing local fixtures prove primitives, flat arrays, nested objects,
  array/object distinction, and missing-versus-undefined normalization under
  `packages/plite/test/utils/deep-equal/`.

### Proposed internal representation and owner

Keep the same private utility and public owner. Change the private comparison to
one recursive JSON-value relation:

```ts
const isDeepEqual = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, i) =>
      isDeepEqual(value, b[i])
    );
  }

  if (isObject(a) && isObject(b)) {
    // Keep Plite's missing-key-is-undefined object law.
  }

  return a === b;
};
```

The implementation may use a loop instead of `every`; the invariant matters,
not the spelling. Do not import a generic deep-equality dependency.

### Material value and current job

Plite documents node values as plain serializable values, arrays, and nested
objects. Identity comparison inside arrays contradicts that model and makes
equal cloned text properties look changed. The fix restores truthful equality
for current node data and avoids redundant leaf/property work driven by false
inequality.

### Hide, delete, merge, or move

- Delete the comment claiming complex values inside arrays are unsupported.
- Replace the array-member identity loop with recursive comparison.
- Keep the utility private and colocated with `TextApi.equals` behavior.
- Keep missing object keys equivalent to explicit `undefined`.
- Do not add a second public equality helper, compatibility mode, option flag,
  dependency, or copied Slate fixture runner.

### Adoption and dependency order

1. `plite-plan` confirms the exact JSON-value domain and hot-path budget.
2. The Plite package owner applies the utility and focused test change through
   `patch`/`tdd` after user acceptance of that layer plan.
3. Existing `TextApi.equals` consumers adopt the behavior automatically; no
   call-site migration is allowed or needed.
4. Package proof runs before any broader browser or release claim.

Blast radius: Plite text/property equality and any caller that observes cloned
nested array metadata. Public types, serialized documents, collaboration wire
format, history format, Plate plugin APIs, and imports stay unchanged.

### Required proof

| Proof kind | Requirement |
| --- | --- |
| Correctness | Positive nested object/array equality; negative nested property, length, order, array/object, and primitive cases; retain every current fixture |
| Type/API | `TextApi.equals` and its `@platejs/plite` export stay unchanged; no public `isDeepEqual` export |
| Property/fuzz | Bounded JSON-value generator checks reflexivity, symmetry, cloned-value equality, and one-leaf mutation inequality while preserving missing-versus-undefined object law |
| Browser | N/A: private model comparison with no independent DOM behavior; browser proof is required only if a real consumer regression is identified |
| Benchmark | Compare current and candidate shallow text equality plus representative nested arrays; no meaningful shallow p95 regression and finite nested scaling |
| Package | Focused deep-equal fixtures, Plite source-first typecheck, and `pnpm check:plite:dev` for the affected graph |

### Planning route

- Primary planning owner after acceptance: `plite-plan`.
- Dependent planning owner: N/A; no Plate boundary changes.
- Execution owner selected by that plan: `patch` with `tdd` for the Plite
  equality owner.
- `best-api`: completed as N/A for shape change; the public call stays exactly
  the same.

### Exit gate

The implementation packet closes only when all nested JSON-value laws pass,
the public export/type surface is unchanged, shallow hot-path proof stays
healthy, and the Plite development check passes.
