import { getDefined } from '../internal/get-defined';
import { coreWork as work } from './work';

/** An item whose `length` the sequence sums, such as a node's token length. */
export type Measured = { readonly length: number };

const WIDTH = 32;
// Every list longer than WIDTH has exactly HEIGHT levels and every node of it
// is WIDTH slots wide, so replacing one item copies the same slots at every
// length. HEIGHT covers any list a document can hold in memory.
const HEIGHT = 5;
const CAPACITY = WIDTH ** HEIGHT;
const MERGE_BELOW = WIDTH / 4;

type Leaf<T> = Readonly<{
  ends: readonly number[];
  items: ReadonlyArray<T | undefined>;
  size: number;
}>;

type Branch<T> = Readonly<{
  children: ReadonlyArray<SequenceNode<T> | undefined>;
  counts: readonly number[];
  ends: readonly number[];
  size: number;
}>;

type SequenceNode<T> = Branch<T> | Leaf<T>;

const isBranch = <T>(node: SequenceNode<T>): node is Branch<T> =>
  'children' in node;

const measureOf = <T>(node: SequenceNode<T>) =>
  node.size === 0 ? 0 : getDefined(node.ends[node.size - 1]);

const countOf = <T>(node: SequenceNode<T>) =>
  isBranch(node) && node.size > 0
    ? getDefined(node.counts[node.size - 1])
    : node.size;

const firstAboveOrLast = (
  bounds: readonly number[],
  size: number,
  value: number
) => {
  let low = 0;
  let high = size - 1;

  while (low < high) {
    const middle = (low + high) >>> 1;

    if (getDefined(bounds[middle]) > value) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return low;
};

const leaf = <T extends Measured>(
  items: readonly T[],
  padded: boolean
): Leaf<T> => {
  const width = padded ? WIDTH : items.length;
  const slots: Array<T | undefined> = [];
  const ends: number[] = [];
  let total = 0;

  for (let index = 0; index < width; index += 1) {
    const item = items[index];

    if (item !== undefined) total += item.length;
    slots.push(item);
    ends.push(total);
  }
  work.allocatedNodes += 1;
  work.copiedSlots += 2 * width;

  return { ends, items: slots, size: items.length };
};

const branch = <T>(children: ReadonlyArray<SequenceNode<T>>): Branch<T> => {
  const slots: Array<SequenceNode<T> | undefined> = [];
  const counts: number[] = [];
  const ends: number[] = [];
  let count = 0;
  let total = 0;

  for (let index = 0; index < WIDTH; index += 1) {
    const child = children[index];

    if (child !== undefined) {
      count += countOf(child);
      total += measureOf(child);
    }
    slots.push(child);
    counts.push(count);
    ends.push(total);
  }
  work.allocatedNodes += 1;
  work.copiedSlots += 3 * WIDTH;

  return { children: slots, counts, ends, size: children.length };
};

const used = <V>(values: ReadonlyArray<V | undefined>, size: number): V[] => {
  const result: V[] = [];

  for (let index = 0; index < size; index += 1) {
    result.push(getDefined(values[index]));
  }
  // Count WIDTH, the padded size of the node built from these values, so a
  // key's count follows its path and not how full that path's nodes are.
  work.copiedSlots += WIDTH;

  return result;
};

const copied = <V>(slots: readonly V[]): V[] => {
  work.copiedSlots += slots.length;

  return slots.slice();
};

const shifted = (ends: readonly number[], from: number, delta: number) => {
  if (delta === 0) return ends;
  const next = copied(ends);

  for (let index = from; index < next.length; index += 1) {
    next[index] = getDefined(next[index]) + delta;
  }

  return next;
};

// Balanced runs of at most WIDTH, so no node starts nearly empty.
const runs = <V>(values: readonly V[]): V[][] => {
  const count = Math.ceil(values.length / WIDTH);
  const result: V[][] = [];
  let from = 0;

  for (let run = 1; run <= count; run += 1) {
    const to = Math.round((run * values.length) / count);

    result.push(values.slice(from, to));
    from = to;
  }
  work.copiedSlots += count * WIDTH;

  return result;
};

const leavesOf = <T extends Measured>(items: readonly T[]) =>
  runs(items).map((run) => leaf(run, true));

const branchesOf = <T>(children: ReadonlyArray<SequenceNode<T>>) =>
  runs(children).map((run) => branch(run));

const merge = <T extends Measured>(
  left: SequenceNode<T>,
  right: SequenceNode<T>
): Array<SequenceNode<T>> => {
  if (isBranch(left) && isBranch(right)) {
    return branchesOf([
      ...used(left.children, left.size),
      ...used(right.children, right.size),
    ]);
  }
  if (!isBranch(left) && !isBranch(right)) {
    return leavesOf([
      ...used(left.items, left.size),
      ...used(right.items, right.size),
    ]);
  }

  throw new Error('Sequence siblings must sit at one level.');
};

const mergeSmall = <T extends Measured>(
  nodes: Array<SequenceNode<T>>,
  from: number,
  to: number
) => {
  let index = from;
  let end = to;

  while (index < end && nodes.length > 1) {
    if (getDefined(nodes[index]).size >= MERGE_BELOW) {
      index += 1;
      continue;
    }
    const left = index + 1 < nodes.length ? index : index - 1;
    const merged = merge(getDefined(nodes[left]), getDefined(nodes[left + 1]));

    nodes.splice(left, 2, ...merged);
    end += merged.length - 2;
    index = left + merged.length;
  }
};

const spliceNode = <T extends Measured>(
  node: SequenceNode<T>,
  index: number,
  deleteCount: number,
  inserted: readonly T[]
): Array<SequenceNode<T>> => {
  if (!isBranch(node)) {
    const items = used(node.items, node.size);

    items.splice(index, deleteCount, ...inserted);
    work.copiedSlots += inserted.length;

    return items.length === 0 ? [] : leavesOf(items);
  }
  const last = index + deleteCount;
  const first = firstAboveOrLast(node.counts, node.size, index);
  const end =
    deleteCount === 0
      ? first
      : firstAboveOrLast(node.counts, node.size, last - 1);
  const before = (child: number) =>
    child === 0 ? 0 : getDefined(node.counts[child - 1]);
  const firstChild = getDefined(node.children[first]);
  const start = index - before(first);
  const replaced =
    first === end
      ? spliceNode(firstChild, start, deleteCount, inserted)
      : [
          ...spliceNode(
            firstChild,
            start,
            countOf(firstChild) - start,
            inserted
          ),
          ...spliceNode(
            getDefined(node.children[end]),
            0,
            last - before(end),
            []
          ),
        ];
  const children = used(node.children, node.size);

  children.splice(first, end - first + 1, ...replaced);
  mergeSmall(children, first, first + replaced.length);

  return children.length === 0 ? [] : branchesOf(children);
};

/** `[from, to)` in one list and `[from, to)` in another that hold different items. */
export type ChangedRange = [number, number, number, number];

const itemsOf = <T>(node: SequenceNode<T>, into: T[]) => {
  if (!isBranch(node)) {
    for (let local = 0; local < node.size; local += 1) {
      into.push(getDefined(node.items[local]));
    }

    return into;
  }
  for (let child = 0; child < node.size; child += 1) {
    itemsOf(getDefined(node.children[child]), into);
  }

  return into;
};

const countBefore = <T>(node: Branch<T>, child: number) =>
  child === 0 ? 0 : getDefined(node.counts[child - 1]);

const differ = <T>(same: (left: T, right: T) => boolean) => {
  const ranges: ChangedRange[] = [];
  const push = (fromA: number, toA: number, fromB: number, toB: number) => {
    if (fromA === toA && fromB === toB) return;

    const last = ranges.at(-1);

    if (last && last[1] === fromA && last[3] === fromB) {
      last[1] = toA;
      last[3] = toB;
    } else {
      ranges.push([fromA, toA, fromB, toB]);
    }
  };
  const flat = (
    left: readonly T[],
    right: readonly T[],
    atA: number,
    atB: number
  ) => {
    let head = 0;

    while (
      head < left.length &&
      head < right.length &&
      same(getDefined(left[head]), getDefined(right[head]))
    ) {
      head += 1;
    }

    let tail = 0;

    while (
      tail < left.length - head &&
      tail < right.length - head &&
      same(
        getDefined(left[left.length - 1 - tail]),
        getDefined(right[right.length - 1 - tail])
      )
    ) {
      tail += 1;
    }
    push(
      atA + head,
      atA + left.length - tail,
      atB + head,
      atB + right.length - tail
    );
  };
  const gap = (
    left: Branch<T>,
    right: Branch<T>,
    [fromA, toA, fromB, toB]: ChangedRange,
    atA: number,
    atB: number
  ) => {
    if (toA - fromA === toB - fromB) {
      for (let offset = 0; offset < toA - fromA; offset += 1) {
        node(
          getDefined(left.children[fromA + offset]),
          getDefined(right.children[fromB + offset]),
          atA + countBefore(left, fromA + offset),
          atB + countBefore(right, fromB + offset)
        );
      }

      return;
    }

    const collect = (parent: Branch<T>, from: number, to: number) => {
      const items: T[] = [];

      for (let child = from; child < to; child += 1) {
        itemsOf(getDefined(parent.children[child]), items);
      }

      return items;
    };

    flat(
      collect(left, fromA, toA),
      collect(right, fromB, toB),
      atA + countBefore(left, fromA),
      atB + countBefore(right, fromB)
    );
  };
  // Children both branches share anchor the walk; each gap between anchors
  // pairs its children when both sides hold as many, else compares items.
  const node = (
    left: SequenceNode<T>,
    right: SequenceNode<T>,
    atA: number,
    atB: number
  ) => {
    if (left === right) return;
    if (!isBranch(left) || !isBranch(right)) {
      flat(itemsOf(left, []), itemsOf(right, []), atA, atB);
      return;
    }

    const positions = new Map<SequenceNode<T>, number>();

    for (let child = 0; child < right.size; child += 1) {
      positions.set(getDefined(right.children[child]), child);
    }

    let fromA = 0;
    let fromB = 0;

    for (let child = 0; child < left.size; child += 1) {
      const match = positions.get(getDefined(left.children[child]));

      if (match === undefined || match < fromB) continue;
      gap(left, right, [fromA, child, fromB, match], atA, atB);
      fromA = child + 1;
      fromB = match + 1;
    }
    gap(left, right, [fromA, left.size, fromB, right.size], atA, atB);
  };

  return { flat, node, ranges };
};

const refuseOver = (size: number) => {
  if (size > CAPACITY) {
    throw new RangeError(
      `A sibling list holds at most ${CAPACITY} nodes; this one would hold ${size}.`
    );
  }
};

/**
 * A persistent list of measured items.
 *
 * @internal
 */
export class MeasuredSequence<T extends Measured> {
  readonly totalLength: number;
  readonly size: number;

  private readonly height: number;
  private readonly root: SequenceNode<T>;

  private constructor(root: SequenceNode<T>, height: number) {
    this.height = height;
    this.totalLength = measureOf(root);
    this.root = root;
    this.size = countOf(root);
  }

  static from<T extends Measured>(items: readonly T[]) {
    refuseOver(items.length);
    if (items.length <= WIDTH) {
      return new MeasuredSequence(leaf(items, false), 1);
    }

    let level: Array<SequenceNode<T>> = leavesOf(items);

    for (let height = 1; height < HEIGHT; height += 1) {
      level = branchesOf(level);
    }

    return new MeasuredSequence(getDefined(level[0]), HEIGHT);
  }

  at(index: number): T | undefined {
    if (!Number.isInteger(index) || index < 0 || index >= this.size) {
      return undefined;
    }
    let node = this.root;
    let local = index;

    while (isBranch(node)) {
      const child = firstAboveOrLast(node.counts, node.size, local);

      if (child > 0) local -= getDefined(node.counts[child - 1]);
      node = getDefined(node.children[child]);
    }

    return node.items[local];
  }

  startOf(index: number) {
    if (index >= this.size) return this.totalLength;
    let node = this.root;
    let local = index;
    let start = 0;

    while (isBranch(node)) {
      const child = firstAboveOrLast(node.counts, node.size, local);

      if (child > 0) {
        local -= getDefined(node.counts[child - 1]);
        start += getDefined(node.ends[child - 1]);
      }
      node = getDefined(node.children[child]);
    }

    return local === 0 ? start : start + getDefined(node.ends[local - 1]);
  }

  /** The last item that starts at or before `offset`, or -1 for none. */
  locate(offset: number) {
    if (offset < 0 || this.size === 0) return -1;
    let node = this.root;
    let local = offset;
    let index = 0;

    while (isBranch(node)) {
      const child = firstAboveOrLast(node.ends, node.size, local);

      if (child > 0) {
        local -= getDefined(node.ends[child - 1]);
        index += getDefined(node.counts[child - 1]);
      }
      node = getDefined(node.children[child]);
    }

    return index + firstAboveOrLast(node.ends, node.size, local);
  }

  set(index: number, item: T): MeasuredSequence<T> {
    if (!Number.isInteger(index) || index < 0 || index >= this.size) {
      throw new RangeError(`Invalid sequence index ${index}.`);
    }
    const replace = (node: SequenceNode<T>, local: number): SequenceNode<T> => {
      work.allocatedNodes += 1;
      if (!isBranch(node)) {
        const items = copied(node.items);

        items[local] = item;

        return {
          ends: shifted(
            node.ends,
            local,
            item.length - getDefined(node.items[local]).length
          ),
          items,
          size: node.size,
        };
      }
      const child = firstAboveOrLast(node.counts, node.size, local);
      const before = getDefined(node.children[child]);
      const after = replace(
        before,
        child === 0 ? local : local - getDefined(node.counts[child - 1])
      );
      const children = copied(node.children);

      children[child] = after;

      return {
        children,
        counts: node.counts,
        ends: shifted(node.ends, child, measureOf(after) - measureOf(before)),
        size: node.size,
      };
    };

    return new MeasuredSequence(replace(this.root, index), this.height);
  }

  setAll(updated: ReadonlyMap<number, T>): MeasuredSequence<T> {
    // Each set copies one path; past a path per leaf, one rebuild copies less.
    if (updated.size * WIDTH > this.size) {
      return MeasuredSequence.from(
        this.toArray().map((item, index) => updated.get(index) ?? item)
      );
    }

    return [...updated].reduce<MeasuredSequence<T>>(
      (next, [index, item]) => next.set(index, item),
      this
    );
  }

  /**
   * Where this list and `other` hold different items, in order. Subtrees the
   * two share are skipped, so two versions of one list cost the paths to
   * their changes; lists that share nothing compare every item.
   */
  changedRanges(
    other: MeasuredSequence<T>,
    same: (left: T, right: T) => boolean = Object.is
  ): readonly ChangedRange[] {
    const diff = differ(same);

    if (this.height === other.height) {
      diff.node(this.root, other.root, 0, 0);
    } else {
      diff.flat(this.toArray(), other.toArray(), 0, 0);
    }

    return diff.ranges;
  }

  splice(
    index: number,
    deleteCount: number,
    inserted: readonly T[]
  ): MeasuredSequence<T> {
    if (
      !Number.isInteger(index) ||
      !Number.isInteger(deleteCount) ||
      index < 0 ||
      deleteCount < 0 ||
      index + deleteCount > this.size
    ) {
      throw new RangeError(
        `Invalid sequence splice of ${deleteCount} at ${index}.`
      );
    }
    const size = this.size - deleteCount + inserted.length;

    refuseOver(size);
    if (this.height === 1 || size <= WIDTH) {
      const items = this.toArray();

      items.splice(index, deleteCount, ...inserted);

      return MeasuredSequence.from(items);
    }
    const nodes = spliceNode(this.root, index, deleteCount, inserted);

    if (nodes.length === 1) {
      return new MeasuredSequence(getDefined(nodes[0]), this.height);
    }

    // The root split. Rebuilding the whole list packed is rare and costs no
    // more than the list.
    return MeasuredSequence.from(
      nodes.flatMap((node) => new MeasuredSequence(node, this.height).toArray())
    );
  }

  /**
   * Visit the items from `from` on, in order, with each one's index and start,
   * until `visit` returns false.
   */
  forEach(
    from: number,
    visit: (item: T, index: number, start: number) => boolean | void
  ) {
    let index = from;
    let start = this.startOf(from);
    const walk = (node: SequenceNode<T>, skip: number): boolean => {
      if (!isBranch(node)) {
        for (let local = skip; local < node.size; local += 1) {
          const item = getDefined(node.items[local]);

          work.walkedSlots += 1;
          if (visit(item, index, start) === false) return false;
          index += 1;
          start += item.length;
        }

        return true;
      }
      let child = firstAboveOrLast(node.counts, node.size, skip);
      let local =
        child === 0 ? skip : skip - getDefined(node.counts[child - 1]);

      for (; child < node.size; child += 1) {
        if (!walk(getDefined(node.children[child]), local)) return false;
        local = 0;
      }

      return true;
    };

    if (from >= 0 && from < this.size) walk(this.root, from);
  }

  map<U>(transform: (item: T) => U) {
    const result = new Array<U>(this.size);
    let index = 0;
    const collect = (node: SequenceNode<T>) => {
      if (!isBranch(node)) {
        for (let local = 0; local < node.size; local += 1) {
          result[index] = transform(getDefined(node.items[local]));
          index += 1;
        }

        return;
      }
      for (let child = 0; child < node.size; child += 1) {
        collect(getDefined(node.children[child]));
      }
    };

    collect(this.root);
    work.copiedSlots += result.length;

    return result;
  }

  slice(from = 0, to = this.size) {
    const items: T[] = [];

    if (from < to) {
      this.forEach(from, (item, index) => {
        items.push(item);

        return index + 1 < to;
      });
    }
    work.copiedSlots += items.length;

    return items;
  }

  toArray() {
    return this.map((item) => item);
  }
}
