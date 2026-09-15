import { freezeOwnedJsonValue, isOwnedJsonValue } from '../core/clone';
import { snapshotEditorJsonValue } from '../core/value-codec';
import { getDefined } from '../internal/get-defined';

export type RecordTree<T> = Readonly<{
  count: number;
  first: string;
  height: number;
}> &
  (
    | Readonly<{ entries: ReadonlyArray<readonly [string, T]>; kind: 'leaf' }>
    | Readonly<{ children: ReadonlyArray<RecordTree<T>>; kind: 'branch' }>
  );

const WIDTH = 32;

const leaf = <T>(entries: ReadonlyArray<readonly [string, T]>): RecordTree<T> =>
  snapshotEditorJsonValue(
    {
      count: entries.length,
      entries,
      first: entries[0][0],
      height: 1,
      kind: 'leaf',
    },
    'Authored record page'
  );

const branch = <T>(children: ReadonlyArray<RecordTree<T>>): RecordTree<T> =>
  snapshotEditorJsonValue(
    {
      children,
      count: children.reduce((sum, child) => sum + child.count, 0),
      first: children[0].first,
      height: children[0].height + 1,
      kind: 'branch',
    },
    'Authored record page'
  );

const lowerBound = <T>(
  values: readonly T[],
  key: string,
  getKey: (value: T) => string
) => {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (getKey(values[middle]) < key) low = middle + 1;
    else high = middle;
  }
  return low;
};

const childAt = <T>(children: ReadonlyArray<RecordTree<T>>, key: string) => {
  const index = lowerBound(children, key, (child) => child.first);
  return children[index]?.first === key ? index : Math.max(0, index - 1);
};

export const readRecord = <T>(
  tree: RecordTree<T> | null,
  key: string
): T | null => {
  let node = tree;
  while (node?.kind === 'branch') {
    node = node.children[childAt(node.children, key)];
  }
  if (!node) return null;
  const index = lowerBound(node.entries, key, (entry) => entry[0]);
  return node.entries[index]?.[0] === key ? node.entries[index][1] : null;
};

export const recordAtOrBefore = <T>(
  tree: RecordTree<T> | null,
  key: string
): readonly [string, T] | null => {
  let node = tree;
  if (!node || node.first > key) return null;
  while (node.kind === 'branch') {
    node = node.children[childAt(node.children, key)];
  }
  const index = lowerBound(node.entries, key, (entry) => entry[0]);
  return node.entries[index]?.[0] === key
    ? node.entries[index]
    : (node.entries[index - 1] ?? null);
};

const write = <T>(
  tree: RecordTree<T>,
  key: string,
  value: T
): ReadonlyArray<RecordTree<T>> => {
  if (tree.kind === 'leaf') {
    const index = lowerBound(tree.entries, key, (entry) => entry[0]);
    const entries = [...tree.entries];
    if (entries[index]?.[0] === key) {
      if (Object.is(entries[index][1], value)) return [tree];
      entries[index] = [key, value];
    } else entries.splice(index, 0, [key, value]);
    return entries.length > WIDTH
      ? [leaf(entries.slice(0, WIDTH / 2)), leaf(entries.slice(WIDTH / 2))]
      : [leaf(entries)];
  }
  const index = childAt(tree.children, key);
  const next = write(tree.children[index], key, value);
  if (next.length === 1 && next[0] === tree.children[index]) return [tree];
  const children = [...tree.children];
  children.splice(index, 1, ...next);
  return children.length > WIDTH
    ? [branch(children.slice(0, WIDTH / 2)), branch(children.slice(WIDTH / 2))]
    : [branch(children)];
};

export const writeRecord = <T>(
  tree: RecordTree<T> | null,
  key: string,
  value: T
): RecordTree<T> => {
  if (!tree) return leaf([[key, value]]);
  const next = write(tree, key, value);
  return next.length === 1 ? next[0] : branch(next);
};

const partition = <T>(values: readonly T[]) => {
  const count = Math.ceil(values.length / WIDTH);
  const size = Math.floor(values.length / count);
  const wider = values.length % count;
  const groups: T[][] = [];
  let from = 0;
  for (let index = 0; index < count; index++) {
    const to = from + size + (index < wider ? 1 : 0);
    groups.push(values.slice(from, to));
    from = to;
  }
  return groups;
};

export const recordTreeFromSortedEntries = <T>(
  entries: ReadonlyArray<readonly [string, T]>
): RecordTree<T> | null => {
  if (!entries.length) return null;
  for (let index = 0; index < entries.length; index++) {
    if (
      !entries[index][0] ||
      (index > 0 && entries[index - 1][0] >= entries[index][0])
    ) {
      throw new Error('Invalid authored record order.');
    }
  }
  let pages = partition(entries).map(leaf);
  while (pages.length > 1) pages = partition(pages).map(branch);
  return pages[0];
};

/** Build a record tree from already-owned sorted entries. @internal */
export const recordTreeFromSortedOwnedEntries = <T>(
  entries: ReadonlyArray<readonly [string, T]>
): RecordTree<T> | null => {
  if (!entries.length) return null;
  for (let index = 0; index < entries.length; index++) {
    if (
      !entries[index][0] ||
      (index > 0 && entries[index - 1][0] >= entries[index][0])
    ) {
      throw new Error('Invalid authored record order.');
    }
  }
  const ownedLeaf = (
    values: ReadonlyArray<readonly [string, T]>
  ): RecordTree<T> => {
    const pageEntries = freezeOwnedJsonValue(
      values.map(([key, value]) => freezeOwnedJsonValue([key, value] as const))
    );

    return freezeOwnedJsonValue({
      count: pageEntries.length,
      entries: pageEntries,
      first: pageEntries[0][0],
      height: 1,
      kind: 'leaf' as const,
    });
  };
  const ownedBranch = (children: ReadonlyArray<RecordTree<T>>): RecordTree<T> =>
    freezeOwnedJsonValue({
      children: freezeOwnedJsonValue([...children]),
      count: children.reduce((sum, child) => sum + child.count, 0),
      first: children[0].first,
      height: children[0].height + 1,
      kind: 'branch' as const,
    });
  let pages = partition(entries).map(ownedLeaf);
  while (pages.length > 1) pages = partition(pages).map(ownedBranch);

  return pages[0];
};

const pageWidth = <T>(tree: RecordTree<T>) =>
  tree.kind === 'leaf' ? tree.entries.length : tree.children.length;

const combinePages = <T>(
  left: RecordTree<T>,
  right: RecordTree<T>,
  split: boolean
): ReadonlyArray<RecordTree<T>> => {
  if (left.kind === 'leaf' && right.kind === 'leaf') {
    const entries = [...left.entries, ...right.entries];
    const middle = entries.length >>> 1;
    return split
      ? [leaf(entries.slice(0, middle)), leaf(entries.slice(middle))]
      : [leaf(entries)];
  }
  if (left.kind === 'branch' && right.kind === 'branch') {
    const children = [...left.children, ...right.children];
    const middle = children.length >>> 1;
    return split
      ? [branch(children.slice(0, middle)), branch(children.slice(middle))]
      : [branch(children)];
  }
  throw new Error('Authored record pages have inconsistent heights.');
};

const remove = <T>(tree: RecordTree<T>, key: string): RecordTree<T> | null => {
  if (tree.kind === 'leaf') {
    const index = lowerBound(tree.entries, key, (entry) => entry[0]);
    if (tree.entries[index]?.[0] !== key) return tree;
    if (tree.entries.length === 1) return null;
    return leaf([
      ...tree.entries.slice(0, index),
      ...tree.entries.slice(index + 1),
    ]);
  }
  const index = childAt(tree.children, key);
  const next = remove(tree.children[index], key);
  if (next === tree.children[index]) return tree;
  const children = [...tree.children];
  if (next) children[index] = next;
  else children.splice(index, 1);
  if (next && pageWidth(next) < WIDTH / 2 && children.length > 1) {
    const neighbor = index ? index - 1 : 1;
    const first = Math.min(index, neighbor);
    children.splice(
      first,
      2,
      ...combinePages(
        children[first],
        children[first + 1],
        pageWidth(children[neighbor]) > WIDTH / 2
      )
    );
  }
  return children.length ? branch(children) : null;
};

export const removeRecord = <T>(
  tree: RecordTree<T> | null,
  key: string
): RecordTree<T> | null => {
  let next = tree ? remove(tree, key) : null;
  while (next?.kind === 'branch' && next.children.length === 1) {
    next = next.children[0];
  }
  return next;
};

export function* records<T>(
  tree: RecordTree<T> | null,
  options: { after?: string; prefix?: string } = {}
): Generator<readonly [string, T]> {
  if (!tree) return;
  const lower = options.after ?? options.prefix ?? '';
  if (tree.kind === 'branch') {
    for (
      let index = childAt(tree.children, lower);
      index < tree.children.length;
      index++
    ) {
      const child = tree.children[index];
      if (
        options.prefix &&
        child.first > options.prefix &&
        !child.first.startsWith(options.prefix)
      ) {
        break;
      }
      yield* records(child, options);
    }
    return;
  }
  for (
    let index = lowerBound(tree.entries, lower, (entry) => entry[0]);
    index < tree.entries.length;
    index++
  ) {
    const entry = tree.entries[index];
    if (options.after && entry[0] <= options.after) continue;
    if (options.prefix && !entry[0].startsWith(options.prefix)) break;
    yield entry;
  }
}

export const decodeRecordTree = <T>(
  input: unknown,
  decode: (value: unknown) => T,
  parentHeight = 16
): RecordTree<T> | null => {
  if (input === null) return null;
  if (typeof input !== 'object' || Array.isArray(input) || !input) {
    throw new Error('Invalid authored record page.');
  }
  const data = input as Record<string, unknown>;
  if (
    typeof data.first !== 'string' ||
    !data.first ||
    typeof data.height !== 'number' ||
    !Number.isSafeInteger(data.height) ||
    data.height < 1 ||
    data.height >= parentHeight ||
    typeof data.count !== 'number' ||
    !Number.isSafeInteger(data.count) ||
    data.count < 1 ||
    Object.keys(data).length !== 5
  ) {
    throw new Error('Invalid authored record page.');
  }
  let result: RecordTree<T>;
  if (data.kind === 'leaf') {
    if (
      !Array.isArray(data.entries) ||
      data.entries.length < 1 ||
      data.entries.length > WIDTH
    ) {
      throw new Error('Invalid authored record leaf.');
    }
    let previous: string | null = null;
    const entries = data.entries.map((entry: unknown): readonly [string, T] => {
      if (
        !Array.isArray(entry) ||
        entry.length !== 2 ||
        typeof entry[0] !== 'string' ||
        !entry[0] ||
        (previous !== null && entry[0] <= previous)
      ) {
        throw new Error('Invalid authored record order.');
      }
      previous = entry[0];
      return [entry[0], decode(entry[1])];
    });
    result = leaf(entries);
  } else if (data.kind === 'branch') {
    if (
      !Array.isArray(data.children) ||
      data.children.length < 2 ||
      data.children.length > WIDTH
    ) {
      throw new Error('Invalid authored record branch.');
    }
    let previous: string | null = null;
    const children = data.children.map((child: unknown) => {
      const next = decodeRecordTree(child, decode, data.height as number);
      if (
        !next ||
        next.height !== (data.height as number) - 1 ||
        (previous !== null && next.first <= previous)
      ) {
        throw new Error('Invalid authored record branch order.');
      }
      let last = next;
      while (last.kind === 'branch') {
        last = getDefined(last.children.at(-1));
      }
      previous = getDefined(last.entries.at(-1))[0];
      return next;
    });
    result = branch(children);
  } else throw new Error('Invalid authored record page kind.');
  if (
    result.first !== data.first ||
    result.height !== data.height ||
    result.count !== data.count
  ) {
    throw new Error('Invalid authored record page summary.');
  }
  if (isOwnedJsonValue(input)) {
    const source = input as RecordTree<T>;
    if (source.kind === 'leaf' && result.kind === 'leaf') {
      const { entries } = result;
      if (
        source.entries.every((entry, index) =>
          Object.is(entry[1], entries[index][1])
        )
      ) {
        return source;
      }
    }
    if (source.kind === 'branch' && result.kind === 'branch') {
      const { children } = result;
      if (source.children.every((child, index) => child === children[index])) {
        return source;
      }
    }
  }
  return result;
};
