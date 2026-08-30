import { isNominalPluginDescriptor } from './mergePlugins';

export const snapshotApiValue = <T>(
  value: T,
  snapshots = new WeakMap<object, unknown>()
): T => {
  if (!value || typeof value !== 'object') return value;
  if (isNominalPluginDescriptor(value)) return value;

  const existing = snapshots.get(value);

  if (existing !== undefined) return existing as T;
  if (Array.isArray(value)) {
    const snapshot: unknown[] = [];

    snapshots.set(value, snapshot);
    snapshot.push(...value.map((item) => snapshotApiValue(item, snapshots)));

    return Object.freeze(snapshot) as T;
  }
  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;
  const snapshot: Record<PropertyKey, unknown> = Object.create(prototype);

  snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !Object.hasOwn(descriptor, 'value')) continue;
    Object.defineProperty(snapshot, key, {
      enumerable: descriptor.enumerable,
      value: snapshotApiValue(descriptor.value, snapshots),
    });
  }

  return Object.freeze(snapshot) as T;
};
