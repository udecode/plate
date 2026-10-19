import assert from 'node:assert/strict';

import type { EditorJsonValue, EditorValuePersistence } from 'plitejs';
import { defineStateField } from 'plitejs';

type ValuePersistenceLawOptions<
  TValue,
  TEncoded extends EditorJsonValue,
> = Readonly<{
  encoded: readonly TEncoded[];
  equals?: (left: unknown, right: unknown) => void;
  live: readonly TValue[];
  persistence: EditorValuePersistence<TValue, TEncoded>;
}>;

const assertDeeplyFrozen = (value: EditorJsonValue): void => {
  if (value === null || typeof value !== 'object') return;

  assert.equal(Object.isFrozen(value), true);
  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    assertDeeplyFrozen(item);
  }
};

export const assertEditorValuePersistenceLaws = <
  TValue,
  TEncoded extends EditorJsonValue,
>({
  encoded,
  equals = assert.deepEqual,
  live,
  persistence,
}: ValuePersistenceLawOptions<TValue, TEncoded>): void => {
  const field = defineStateField<TValue, TEncoded>({
    key: 'test.value-persistence-laws',
    persist: persistence,
  });

  for (const value of live) {
    const encodedValue = persistence.encode(value);
    const serialized = field.serialize(value);

    equals(field.deserialize(serialized), value);
    equals(serialized.value, encodedValue);
    equals(JSON.parse(JSON.stringify(encodedValue)), encodedValue);
    assertDeeplyFrozen(serialized.value);
  }

  for (const value of encoded) {
    const canonical = field.serialize(
      field.deserialize({
        value: structuredClone(value),
        version: persistence.version,
      })
    ).value;
    const fixedPoint = field.serialize(
      field.deserialize({
        value: structuredClone(canonical),
        version: persistence.version,
      })
    ).value;

    equals(fixedPoint, canonical);
    assertDeeplyFrozen(canonical);
  }
};
