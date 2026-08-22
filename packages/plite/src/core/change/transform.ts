import { assertEditorJsonValue } from '../value-codec';
import { cloneFrozen, isRecord, jsonEqual } from './tokens';

export type PropertyModification =
  | Readonly<{ key: string; type: 'add'; values: readonly unknown[] }>
  | Readonly<{ key: string; type: 'remove'; values: readonly unknown[] }>
  | Readonly<{ key: string; type: 'set'; value: unknown }>
  | Readonly<{ key: string; type: 'unset' }>;

export type PropertyModificationJson =
  | { key: string; type: 'add' | 'remove'; values: readonly unknown[] }
  | { key: string; type: 'set'; value: unknown }
  | { key: string; type: 'unset' };

export type PropertyDeltaJson = {
  operations: readonly PropertyModificationJson[];
  version: 1;
};

export const unsafeNodePropertyKeys = new Set([
  '__proto__',
  'children',
  'text',
]);

export const assertNodePropertyKey: (key: unknown) => asserts key is string = (
  key
) => {
  if (
    typeof key !== 'string' ||
    key.length === 0 ||
    unsafeNodePropertyKeys.has(key)
  ) {
    throw new Error(`Invalid node property key ${String(key)}.`);
  }
};

export const canonicalJsonKey = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJsonKey(item)).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJsonKey(value[key])}`)
      .join(',')}}`;
  }

  return `${typeof value}:${JSON.stringify(value)}`;
};

export const normalizeSetValues = (values: readonly unknown[]) => {
  assertEditorJsonValue(values, 'Set-valued node property');
  const unique: unknown[] = [];

  for (const value of values) {
    if (!unique.some((item) => jsonEqual(item, value))) {
      unique.push(cloneFrozen(value));
    }
  }

  return Object.freeze(
    unique.sort((left, right) => {
      const leftKey = canonicalJsonKey(left);
      const rightKey = canonicalJsonKey(right);

      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    })
  );
};

export const clonePropertyModification = (
  modification: PropertyModification
): PropertyModification => {
  assertNodePropertyKey(modification.key);

  if (modification.type === 'set') {
    assertEditorJsonValue(modification.value, 'Node property value');

    return Object.freeze({
      key: modification.key,
      type: modification.type,
      value: cloneFrozen(modification.value),
    });
  }
  if (modification.type === 'unset') {
    return Object.freeze({ key: modification.key, type: modification.type });
  }

  return Object.freeze({
    key: modification.key,
    type: modification.type,
    values: normalizeSetValues(modification.values),
  });
};

export const subtractSetValues = (
  values: readonly unknown[],
  removed: readonly unknown[]
) =>
  normalizeSetValues(
    values.filter(
      (value) => !removed.some((removedValue) => jsonEqual(value, removedValue))
    )
  );

export const transformEarlierPropertyModification = (
  earlier: PropertyModification,
  later: PropertyModification
): PropertyModification | null => {
  if (earlier.key !== later.key) return earlier;

  if (later.type === 'set' || later.type === 'unset') return null;

  if (earlier.type === 'add' || earlier.type === 'remove') {
    if (earlier.type === later.type) return earlier;

    const values = subtractSetValues(earlier.values, later.values);

    return values.length === 0 ? null : Object.freeze({ ...earlier, values });
  }

  if (earlier.type === 'unset') {
    return later.type === 'add'
      ? clonePropertyModification({
          key: earlier.key,
          type: 'set',
          value: later.values,
        })
      : earlier;
  }

  if (!Array.isArray(earlier.value)) {
    throw new Error(
      `Cannot apply set-valued node property ${later.type} to non-array ${earlier.key}.`
    );
  }

  const value =
    later.type === 'add'
      ? normalizeSetValues([...earlier.value, ...later.values])
      : subtractSetValues(earlier.value, later.values);

  return value.length === 0
    ? Object.freeze({ key: earlier.key, type: 'unset' })
    : clonePropertyModification({ key: earlier.key, type: 'set', value });
};

export const transformEarlierPropertyModifications = (
  earlier: readonly PropertyModification[],
  later: readonly PropertyModification[]
) => {
  let transformed = [...earlier];

  for (const laterModification of later) {
    transformed = transformed.flatMap((earlierModification) => {
      const next = transformEarlierPropertyModification(
        earlierModification,
        laterModification
      );

      return next ? [next] : [];
    });
  }

  return Object.freeze(transformed);
};

export const transformPathAfterRemove = (
  path: readonly number[],
  removedPath: readonly number[]
) => {
  const removedParent = removedPath.slice(0, -1);
  const removedIndex = removedPath.at(-1);

  if (removedIndex === undefined) {
    throw new Error('Cannot transform a path through root removal.');
  }

  if (
    removedPath.every((part, index) => path[index] === part) &&
    path.length >= removedPath.length
  ) {
    return null;
  }

  if (
    path.length >= removedPath.length &&
    removedParent.every((part, index) => path[index] === part) &&
    path[removedPath.length - 1] > removedIndex
  ) {
    const transformed = [...path];

    transformed[removedPath.length - 1] -= 1;

    return transformed;
  }

  return [...path];
};
