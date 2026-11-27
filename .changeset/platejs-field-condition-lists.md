---
'platejs': patch
---

Support multi-test field conditions (`{ all: FieldConditionTest[] }` and `{ any: FieldConditionTest[] }`) with three-valued evaluation shared by the fill view and `applyFieldValues`. Export `FieldConditionTest`, include other roles waited on by optional fields in `pending`, name the first waiting role in UTF-16 code-unit order in `waiting` refusals, map every test `ref` on paste, duplicate and table fill, compare condition lists in any order across named field groups, and allow `update` to repair broken rules one at a time while refusing newly introduced problems or loops.

**Migration:**

- **TypeScript callers:** `FieldCondition` is now a union of `FieldConditionTest`, `{ all: readonly FieldConditionTest[] }`, and `{ any: readonly FieldConditionTest[] }`. Narrow a condition (`'ref' in condition`, `'all' in condition`, or `'any' in condition`) before reading `ref`, `test`, or `value`.
- **`pending` on optional fields:** `applyFieldValues` and `startFieldValues` now include any other role waited on by an unsubmitted role's optional field in `pending`, so existing templates where an optional field waits on another role return that role in `pending` until it submits.
- **Reserved keys on legacy single-test conditions:** `all` and `any` are now reserved discriminators on `FieldCondition`. If a saved single-test document attached a custom extra key named `all` or `any`, rename that key before loading.
- **Schema fingerprint (`validationVersion: 2`):** Widening the `condition` validator changes the derived schema fingerprint for editors using `BaseFieldPlugin` or `FieldPlugin`:
  - Apps with a named schema: bump `schema.version`, register the previous schema fingerprint, and return each document unchanged (after renaming any custom `all`/`any` key on legacy single tests).
  - Apps storing `{ document, schema }` envelopes on the default derived identity: reopen each document through `createEditor` and save it again.
  - Apps storing bare document JSON: no migration required unless a single test holds a custom `all`/`any` key.
  - Populated Yjs rooms: start a new room seeded with the converted document.
