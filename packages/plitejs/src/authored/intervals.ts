import { snapshotEditorJsonValue } from '../core/value-codec';

export type AuthoredInterval<T> = Readonly<{
  value: T;
  from: number;
  id: string;
  insertion: boolean;
  to: number;
}>;

export type AuthoredIntervals<T> = Readonly<{
  height: number;
  interval: AuthoredInterval<T>;
  left: AuthoredIntervals<T>;
  max: number;
  right: AuthoredIntervals<T>;
}> | null;

const node = <T>(
  interval: AuthoredInterval<T>,
  left: AuthoredIntervals<T>,
  right: AuthoredIntervals<T>
): NonNullable<AuthoredIntervals<T>> =>
  snapshotEditorJsonValue(
    {
      height: 1 + Math.max(left?.height ?? 0, right?.height ?? 0),
      interval,
      left,
      max: Math.max(interval.to, left?.max ?? 0, right?.max ?? 0),
      right,
    },
    'Authored interval'
  );

const balance = <T>(
  interval: AuthoredInterval<T>,
  left: AuthoredIntervals<T>,
  right: AuthoredIntervals<T>
): NonNullable<AuthoredIntervals<T>> => {
  if (left && left.height > (right?.height ?? 0) + 1) {
    if (left.right && left.right.height > (left.left?.height ?? 0)) {
      const pivot = left.right;
      return node(
        pivot.interval,
        node(left.interval, left.left, pivot.left),
        node(interval, pivot.right, right)
      );
    }
    return node(left.interval, left.left, node(interval, left.right, right));
  }
  if (right && right.height > (left?.height ?? 0) + 1) {
    if (right.left && right.left.height > (right.right?.height ?? 0)) {
      const pivot = right.left;
      return node(
        pivot.interval,
        node(interval, left, pivot.left),
        node(right.interval, pivot.right, right.right)
      );
    }
    return node(right.interval, node(interval, left, right.left), right.right);
  }
  return node(interval, left, right);
};

const compare = <T>(a: AuthoredInterval<T>, b: AuthoredInterval<T>) =>
  a.from - b.from || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export const authoredIntervalsFrom = <T>(
  intervals: ReadonlyArray<AuthoredInterval<T>>
): AuthoredIntervals<T> => {
  const ordered = [...intervals].sort(compare);
  const build = (from: number, to: number): AuthoredIntervals<T> => {
    if (from === to) return null;
    const middle = (from + to) >>> 1;
    return node(ordered[middle], build(from, middle), build(middle + 1, to));
  };

  return build(0, ordered.length);
};

export const writeAuthoredInterval = <T>(
  tree: AuthoredIntervals<T>,
  interval: AuthoredInterval<T>
): NonNullable<AuthoredIntervals<T>> => {
  if (!tree) return node(interval, null, null);
  const order = compare(interval, tree.interval);
  if (order === 0) return node(interval, tree.left, tree.right);
  return order < 0
    ? balance(
        tree.interval,
        writeAuthoredInterval(tree.left, interval),
        tree.right
      )
    : balance(
        tree.interval,
        tree.left,
        writeAuthoredInterval(tree.right, interval)
      );
};

export const removeAuthoredInterval = <T>(
  tree: AuthoredIntervals<T>,
  interval: AuthoredInterval<T>
): AuthoredIntervals<T> => {
  if (!tree) return null;
  const order = compare(interval, tree.interval);
  if (order < 0) {
    return balance(
      tree.interval,
      removeAuthoredInterval(tree.left, interval),
      tree.right
    );
  }
  if (order > 0) {
    return balance(
      tree.interval,
      tree.left,
      removeAuthoredInterval(tree.right, interval)
    );
  }
  if (!tree.left) return tree.right;
  if (!tree.right) return tree.left;
  let successor = tree.right;
  while (successor.left) successor = successor.left;
  return balance(
    successor.interval,
    tree.left,
    removeAuthoredInterval(tree.right, successor.interval)
  );
};

export function* matchingAuthoredIntervals<T>(
  tree: AuthoredIntervals<T>,
  from: number,
  to: number
): Generator<AuthoredInterval<T>> {
  if (!tree || tree.max < from) return;
  yield* matchingAuthoredIntervals(tree.left, from, to);
  const { interval } = tree;
  if (interval.from > to) return;
  if (
    from === to
      ? interval.insertion && interval.from <= from && from <= interval.to
      : interval.from === interval.to
        ? from <= interval.from && interval.from <= to
        : interval.from < to && from < interval.to
  ) {
    yield interval;
  }
  yield* matchingAuthoredIntervals(tree.right, from, to);
}
