---
'platejs': patch
---

Add the `multiple` field kind with optional `min` (`>= 2`) and `max` (`>= 1`) count bounds, `includes` and `not-includes` condition tests, order-insensitive comparison across name groups, `answer-conflict` and `startFieldValues`, comma-joined option labels in plain text and Word export, `data-field-min` and `data-field-max` HTML attributes (mapping imported `min=1` on `multiple` fields to `required: true`), and `{ kind: 'multiple', value?: readonly string[] }` in `readFieldAnswers`. Remove the unused `defaultValue` field property and `data-field-default-value` HTML attribute.

**Migration:**

- **Removed `defaultValue`:** Delete the `defaultValue` key (do not leave `defaultValue: undefined`) from every `field` node before loading documents under the closed schema or passing them to the field helpers. `applyFieldValues` and `startFieldValues` refuse a field carrying `defaultValue` as `malformed`, and `readFieldAnswers` and `fieldSubmission` silently skip malformed fields. Remove `defaultValue` from any `insert` or `update` call. Apps that store application defaults keep them outside the field schema or prefill with `startFieldValues`.
- **TypeScript callers:** `FieldValue` now includes `readonly string[]`, `FieldKind` includes `'multiple'`, `FieldTest` includes `'includes'` and `'not-includes'`, and `FieldAnswer` includes `{ kind: 'multiple'; value?: readonly string[] }`. Note that `Array.isArray(value)` does not exclude `readonly string[]` from the false branch in TypeScript; narrow with `typeof value === 'object'` or a `value is readonly string[]` predicate where a scalar value is expected.
- **Schema fingerprint:** Adding `'multiple'`, `min`, `max`, widening `value` (`validationVersion: 2`) and `condition` (`validationVersion: 3`), and removing `defaultValue` change the derived schema fingerprint for editors using `BaseFieldPlugin` or `FieldPlugin`:
  - Apps with a named schema: bump `schema.version`, register the previous schema fingerprint, and delete `defaultValue` from each `field` node in the migration step.
  - Apps storing `{ document, schema }` envelopes on the default derived identity: verify the previous fingerprint, delete `defaultValue` from each `field` node in `envelope.document`, open with `createEditor({ initialValue: migratedDocument, initialSelection: envelope.selection, plugins })`, and save a fresh envelope.
  - Apps storing bare document JSON: delete `defaultValue` from each `field` node before calling `createEditor`, `applyFieldValues`, `startFieldValues`, `fieldSubmission`, or `readFieldAnswers`.
  - Populated Yjs rooms: start a new room seeded with the migrated document.
