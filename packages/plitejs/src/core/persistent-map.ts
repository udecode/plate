import { getDefined } from '../internal/get-defined';

/**
 * A persistent ordered map from strings to values: an AVL tree whose versions
 * share every node a write does not touch. Nodes stay unfrozen because
 * freezing makes JavaScriptCore allocate a sparse map per node.
 */
export type PersistentMapNode<T> = Readonly<{
  height: number;
  key: string;
  left: PersistentMapNode<T> | null;
  right: PersistentMapNode<T> | null;
  size: number;
  value: T;
}>;

const mapHeight = <T>(node: PersistentMapNode<T> | null) => node?.height ?? 0;

export const persistentMapSize = <T>(node: PersistentMapNode<T> | null) => node?.size ?? 0;

const mapNode = <T>(
  key: string,
  value: T,
  left: PersistentMapNode<T> | null,
  right: PersistentMapNode<T> | null
): PersistentMapNode<T> => ({
  height: Math.max(mapHeight(left), mapHeight(right)) + 1,
  key,
  left,
  right,
  size: persistentMapSize(left) + persistentMapSize(right) + 1,
  value,
});

const rotateMapLeft = <T>(node: PersistentMapNode<T>) => {
  const right = getDefined(node.right);

  return mapNode(
    right.key,
    right.value,
    mapNode(node.key, node.value, node.left, right.left),
    right.right
  );
};

const rotateMapRight = <T>(node: PersistentMapNode<T>) => {
  const left = getDefined(node.left);

  return mapNode(
    left.key,
    left.value,
    left.left,
    mapNode(node.key, node.value, left.right, node.right)
  );
};

const balanceMap = <T>(node: PersistentMapNode<T>) => {
  const balance = mapHeight(node.left) - mapHeight(node.right);

  if (balance > 1) {
    const left = getDefined(node.left);

    return rotateMapRight(
      mapHeight(left.left) < mapHeight(left.right)
        ? mapNode(node.key, node.value, rotateMapLeft(left), node.right)
        : node
    );
  }
  if (balance < -1) {
    const right = getDefined(node.right);

    return rotateMapLeft(
      mapHeight(right.right) < mapHeight(right.left)
        ? mapNode(node.key, node.value, node.left, rotateMapRight(right))
        : node
    );
  }

  return node;
};

export const persistentMapGet = <T>(
  node: PersistentMapNode<T> | null,
  key: string
): T | undefined => {
  let current = node;

  while (current) {
    if (key === current.key) return current.value;
    current = key < current.key ? current.left : current.right;
  }

  return undefined;
};

/** The smallest key at or after `key`, so a prefix probe reads one entry. */
export const persistentMapCeiling = <T>(
  node: PersistentMapNode<T> | null,
  key: string
): readonly [string, T] | undefined => {
  let current = node;
  let found: PersistentMapNode<T> | null = null;

  while (current) {
    if (key === current.key) return [current.key, current.value];
    if (key < current.key) {
      found = current;
      current = current.left;
    } else {
      current = current.right;
    }
  }

  return found ? [found.key, found.value] : undefined;
};

export const persistentMapSet = <T>(
  node: PersistentMapNode<T> | null,
  key: string,
  value: T
): PersistentMapNode<T> => {
  if (!node) return mapNode(key, value, null, null);
  if (key === node.key) {
    return Object.is(value, node.value)
      ? node
      : mapNode(key, value, node.left, node.right);
  }

  return balanceMap(
    key < node.key
      ? mapNode(
          node.key,
          node.value,
          persistentMapSet(node.left, key, value),
          node.right
        )
      : mapNode(
          node.key,
          node.value,
          node.left,
          persistentMapSet(node.right, key, value)
        )
  );
};

const removeSmallestMapNode = <T>(
  node: PersistentMapNode<T>
): readonly [PersistentMapNode<T>, PersistentMapNode<T> | null] => {
  if (!node.left) return [node, node.right];
  const [smallest, nextLeft] = removeSmallestMapNode(node.left);

  return [
    smallest,
    balanceMap(mapNode(node.key, node.value, nextLeft, node.right)),
  ];
};

export const persistentMapDelete = <T>(
  node: PersistentMapNode<T> | null,
  key: string
): PersistentMapNode<T> | null => {
  if (!node) return null;
  if (key < node.key) {
    const left = persistentMapDelete(node.left, key);

    return left === node.left
      ? node
      : balanceMap(mapNode(node.key, node.value, left, node.right));
  }
  if (key > node.key) {
    const right = persistentMapDelete(node.right, key);

    return right === node.right
      ? node
      : balanceMap(mapNode(node.key, node.value, node.left, right));
  }
  if (!node.left) return node.right;
  if (!node.right) return node.left;
  const [successor, right] = removeSmallestMapNode(node.right);

  return balanceMap(mapNode(successor.key, successor.value, node.left, right));
};

/** Build a balanced map from entries already sorted by key, in linear time. */
export const persistentMapFromSorted = <T>(
  entries: readonly (readonly [string, T])[],
  from = 0,
  to = entries.length
): PersistentMapNode<T> | null => {
  if (from >= to) return null;
  const middle = (from + to) >>> 1;
  const [key, value] = entries[middle];

  return mapNode(
    key,
    value,
    persistentMapFromSorted(entries, from, middle),
    persistentMapFromSorted(entries, middle + 1, to)
  );
};

export function* persistentMapEntries<T>(
  node: PersistentMapNode<T> | null
): Generator<readonly [string, T]> {
  if (!node) return;
  yield* persistentMapEntries(node.left);
  yield [node.key, node.value];
  yield* persistentMapEntries(node.right);
}

type MapEntry<T> = readonly [string, T];

const isMapEntry = <T>(
  unit: PersistentMapNode<T> | MapEntry<T>
): unit is MapEntry<T> => Array.isArray(unit);

const expandMapUnit = <T>(stack: (PersistentMapNode<T> | MapEntry<T>)[]) => {
  const node = stack.pop() as PersistentMapNode<T>;

  if (node.right) stack.push(node.right);
  stack.push([node.key, node.value]);
  if (node.left) stack.push(node.left);
};

/**
 * The keys whose value differs between two versions of a map, added and
 * removed ones included, in key order. Both versions are walked in key
 * order a subtree at a time, and a subtree they share is skipped whole, so a
 * diff of versions a few writes apart reads those writes' paths.
 */
export const persistentMapChanges = <T>(
  before: PersistentMapNode<T> | null,
  after: PersistentMapNode<T> | null
): string[] => {
  const changed: string[] = [];

  if (before === after) return changed;

  const left: (PersistentMapNode<T> | MapEntry<T>)[] = before ? [before] : [];
  const right: (PersistentMapNode<T> | MapEntry<T>)[] = after ? [after] : [];

  while (left.length > 0 && right.length > 0) {
    const a = getDefined(left.at(-1));
    const b = getDefined(right.at(-1));

    if (a === b) {
      left.pop();
      right.pop();
    } else if (!isMapEntry(a)) {
      expandMapUnit(isMapEntry(b) || a.size >= b.size ? left : right);
    } else if (!isMapEntry(b)) {
      expandMapUnit(right);
    } else if (a[0] === b[0]) {
      if (a[1] !== b[1]) changed.push(a[0]);
      left.pop();
      right.pop();
    } else if (a[0] < b[0]) {
      changed.push(a[0]);
      left.pop();
    } else {
      changed.push(b[0]);
      right.pop();
    }
  }
  for (const rest of [left, right]) {
    while (rest.length > 0) {
      const unit = getDefined(rest.at(-1));

      if (isMapEntry(unit)) {
        changed.push(unit[0]);
        rest.pop();
      } else {
        expandMapUnit(rest);
      }
    }
  }

  return changed;
};
