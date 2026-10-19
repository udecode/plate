import type { DocumentIndex } from './document-index';

export type Roots<K extends string> = Readonly<
  Partial<Record<K, readonly unknown[]>>
>;

// A root a change left indexed builds its node array on the first read. This
// keeps each such root's index by the object and key that hold it, so core
// can pass the root along and read nodes by path without building the array.
const LAZY_ROOTS = new WeakMap<object, Map<string, DocumentIndex>>();

/** @internal */
export const setLazyRoot = (
  target: object,
  key: string,
  index: DocumentIndex
) => {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: () => index.value,
    set: (value: unknown) => {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
      LAZY_ROOTS.get(target)?.delete(key);
    },
  });

  const keys = LAZY_ROOTS.get(target) ?? new Map<string, DocumentIndex>();

  keys.set(key, index);
  LAZY_ROOTS.set(target, keys);
};

/** @internal */
export const lazyRootOf = (source: object, key: string) =>
  LAZY_ROOTS.get(source)?.get(key);

/**
 * Copy the own enumerable keys of `source` but `omit` onto `target`, keeping
 * lazy roots lazy where a spread would build them.
 *
 * @internal
 */
export const copyFields = (
  target: Record<string, unknown>,
  source: Readonly<Record<string, unknown>>,
  omit: readonly string[] = []
) => {
  const lazy = LAZY_ROOTS.get(source);

  for (const key of Object.keys(source)) {
    if (omit.includes(key)) continue;

    const index = lazy?.get(key);

    if (index) setLazyRoot(target, key, index);
    else target[key] = source[key];
  }

  return target;
};

/** @internal */
export const copyRoot = <K extends string>(
  target: Record<string, unknown>,
  key: string,
  source: Roots<K>,
  sourceKey: K
) => {
  const index = lazyRootOf(source, sourceKey);

  if (index) {
    setLazyRoot(target, key, index);
  } else {
    target[key] = source[sourceKey];
  }
};
