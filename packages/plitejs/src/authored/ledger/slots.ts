import { getDefined } from '../../internal/get-defined';

/**
 * An entry of a `SlotTree`. The tree sums `measures` per subtree and keeps
 * `leaf` pointing at the leaf that holds the slot.
 */
export type Slot = {
  leaf: SlotLeaf | null;
  measures: number[];
};

type SlotBranch = {
  children: SlotNode[];
  least: Slot | null;
  parent: SlotBranch | null;
  size: number;
  sums: number[];
};

export type SlotLeaf = {
  least: Slot | null;
  parent: SlotBranch | null;
  size: number;
  slots: Slot[];
  sums: number[];
};

/**
 * A key each slot may hold, such as its oldest entry, whose least the tree
 * keeps per subtree beside the sums.
 */
export type SlotKey<S, K> = Readonly<{
  before: (left: K, right: K) => boolean;
  of: (slot: S) => K | null;
}>;

type SlotNode = SlotBranch | SlotLeaf;

const WIDTH = 32;
const MAX = 2 * WIDTH;

const isLeaf = (node: SlotNode): node is SlotLeaf => 'slots' in node;

const entriesOf = (node: SlotNode): ReadonlyArray<Slot | SlotNode> =>
  isLeaf(node) ? node.slots : node.children;

const chunks = <V>(items: readonly V[]): V[][] => {
  const count = Math.max(1, Math.ceil(items.length / WIDTH));
  const result: V[][] = [];
  let from = 0;

  for (let chunk = 1; chunk <= count; chunk += 1) {
    const to = Math.round((chunk * items.length) / count);

    result.push(items.slice(from, to));
    from = to;
  }

  return result;
};

/**
 * Slots in order, each with numbers the tree sums, so finding the slot at a
 * rank, a slot's rank and the sum of a measure before a rank cost the tree's
 * height. It is mutable: the ledger that owns it is the only writer.
 *
 * @internal
 */
export class SlotTree<S extends Slot, K = never> {
  private root: SlotNode;
  private readonly key: SlotKey<S, K> | null;
  private readonly measures: number;

  constructor(
    measures: number,
    slots: readonly S[] = [],
    key: SlotKey<S, K> | null = null
  ) {
    this.measures = measures;
    this.key = key;
    this.root = this.build(slots);
  }

  get size() {
    return this.root.size;
  }

  total(measure: number) {
    return getDefined(this.root.sums[measure]);
  }

  at(rank: number): S {
    if (rank < 0 || rank >= this.size) {
      throw new RangeError(`Invalid slot rank ${rank}.`);
    }
    let node = this.root;
    let local = rank;

    while (!isLeaf(node)) {
      for (const child of node.children) {
        if (local < child.size) {
          node = child;
          break;
        }
        local -= child.size;
      }
    }

    return node.slots[local] as S;
  }

  rankOf(slot: S) {
    const { leaf } = slot;

    if (!leaf) throw new Error('A slot outside its tree has no rank.');

    let rank = leaf.slots.indexOf(slot);

    for (let child: SlotNode = leaf; child.parent; child = child.parent) {
      for (const sibling of child.parent.children) {
        if (sibling === child) break;
        rank += sibling.size;
      }
    }

    return rank;
  }

  /** Sum again above `slot`, whose measures or key changed in place. */
  update(slot: S) {
    this.refresh(getDefined(slot.leaf));
  }

  /** The slot holding the least key from rank `from` to `to`. */
  leastIn(from: number, to: number): S | null {
    let best: S | null = null;
    const take = (slot: Slot | null) => {
      if (slot && (!best || this.before(slot as S, best))) best = slot as S;
    };
    const walk = (node: SlotNode, start: number) => {
      const end = start + node.size;

      if (end <= from || start >= to) return;
      if (from <= start && end <= to) {
        take(node.least);
        return;
      }
      if (isLeaf(node)) {
        for (
          let local = Math.max(0, from - start);
          local < node.size && start + local < to;
          local += 1
        ) {
          take(this.ownKey(node.slots[local] as S));
        }
        return;
      }

      let at = start;

      for (const child of node.children) {
        walk(child, at);
        at += child.size;
      }
    };

    walk(this.root, 0);

    return best;
  }

  sumBefore(rank: number, measure: number) {
    let node = this.root;
    let local = rank;
    let sum = 0;

    while (local > 0) {
      if (local >= node.size) return sum + getDefined(node.sums[measure]);
      if (isLeaf(node)) {
        for (let index = 0; index < local; index += 1) {
          sum += getDefined(getDefined(node.slots[index]).measures[measure]);
        }

        return sum;
      }
      for (const child of node.children) {
        if (local < child.size) {
          node = child;
          break;
        }
        local -= child.size;
        sum += getDefined(child.sums[measure]);
      }
    }

    return sum;
  }

  /**
   * The first rank whose sum of `measure` through itself exceeds `value`, or
   * reaches it when `reach` is set; the size when none does.
   */
  search(measure: number, value: number, reach: boolean) {
    const passes = (sum: number) => (reach ? sum >= value : sum > value);
    let node = this.root;
    let rank = 0;
    let sum = 0;

    if (!passes(getDefined(node.sums[measure]))) return this.size;
    while (!isLeaf(node)) {
      for (const child of node.children) {
        const next = sum + getDefined(child.sums[measure]);

        if (passes(next)) {
          node = child;
          break;
        }
        sum = next;
        rank += child.size;
      }
    }
    for (const slot of node.slots) {
      sum += getDefined(slot.measures[measure]);
      if (passes(sum)) return rank;
      rank += 1;
    }

    return this.size;
  }

  forEach(
    from: number,
    to: number,
    visit: (slot: S, rank: number) => boolean | void
  ) {
    let rank = from;
    const walk = (node: SlotNode, skip: number): boolean => {
      if (isLeaf(node)) {
        for (let local = skip; local < node.size && rank < to; local += 1) {
          if (visit(node.slots[local] as S, rank) === false) return false;
          rank += 1;
        }

        return rank < to;
      }
      let local = skip;

      for (const child of node.children) {
        if (local >= child.size) {
          local -= child.size;
          continue;
        }
        if (!walk(child, local)) return false;
        local = 0;
      }

      return true;
    };

    if (from < to && from < this.size) walk(this.root, from);
  }

  splice(rank: number, deleteCount: number, inserted: readonly S[]) {
    if (rank < 0 || deleteCount < 0 || rank + deleteCount > this.size) {
      throw new RangeError(`Invalid slot splice of ${deleteCount} at ${rank}.`);
    }
    for (let left = deleteCount; left > 0;) {
      const { leaf, local } = this.leafAt(rank);
      const removed = Math.min(left, leaf.size - local);

      for (const slot of leaf.slots.splice(local, removed)) slot.leaf = null;
      left -= removed;
      this.refresh(leaf);
      if (leaf.size === 0 && leaf !== this.root) this.detach(leaf);
    }
    // Emptied branches hold no leaf to insert into.
    if (this.size === 0) this.root = this.build([]);
    if (inserted.length > 0) {
      const { leaf, local } =
        rank === this.size ? this.afterLast() : this.leafAt(rank);

      leaf.slots.splice(local, 0, ...inserted);
      for (const slot of inserted) slot.leaf = leaf;
      this.refresh(leaf);
      this.overflow(leaf);
    }
    this.shrink();
  }

  private build(slots: readonly S[]): SlotNode {
    let level: SlotNode[] = chunks(slots).map((items) => {
      const leaf: SlotLeaf = {
        least: null,
        parent: null,
        size: 0,
        slots: [...items],
        sums: [],
      };

      for (const slot of items) slot.leaf = leaf;
      this.sum(leaf);

      return leaf;
    });

    while (level.length > 1) {
      level = chunks(level).map((children) => {
        const branch: SlotBranch = {
          children,
          least: null,
          parent: null,
          size: 0,
          sums: [],
        };

        for (const child of children) child.parent = branch;
        this.sum(branch);

        return branch;
      });
    }

    return getDefined(level[0]);
  }

  private sum(node: SlotNode) {
    const sums = new Array<number>(this.measures).fill(0);
    let least: Slot | null = null;
    let size = 0;

    for (const entry of entriesOf(node)) {
      const values = 'measures' in entry ? entry.measures : entry.sums;
      const candidate =
        'measures' in entry ? this.ownKey(entry as S) : entry.least;

      for (let measure = 0; measure < this.measures; measure += 1) {
        sums[measure] += getDefined(values[measure]);
      }
      if (candidate && (!least || this.before(candidate as S, least as S))) {
        least = candidate;
      }
      size += 'measures' in entry ? 1 : entry.size;
    }
    node.least = least;
    node.sums = sums;
    node.size = size;
  }

  private ownKey(slot: S): S | null {
    return this.key?.of(slot) == null ? null : slot;
  }

  private before(left: S, right: S) {
    const key = getDefined(this.key);

    return key.before(getDefined(key.of(left)), getDefined(key.of(right)));
  }

  private refresh(node: SlotNode) {
    for (
      let current: SlotNode | null = node;
      current;
      current = current.parent
    ) {
      this.sum(current);
    }
  }

  private afterLast() {
    let node = this.root;

    while (!isLeaf(node)) node = getDefined(node.children.at(-1));

    return { leaf: node, local: node.slots.length };
  }

  private leafAt(rank: number) {
    let node = this.root;
    let local = rank;

    while (!isLeaf(node)) {
      for (const child of node.children) {
        if (local < child.size) {
          node = child;
          break;
        }
        local -= child.size;
      }
    }

    return { leaf: node, local };
  }

  private detach(node: SlotNode) {
    const parent = getDefined(node.parent);

    parent.children.splice(parent.children.indexOf(node), 1);
    node.parent = null;
    this.refresh(parent);
    if (parent.children.length === 0 && parent !== this.root) {
      this.detach(parent);
    }
  }

  private overflow(node: SlotNode) {
    const entries = entriesOf(node);

    if (entries.length <= MAX) return;

    const parts = chunks(entries);
    const siblings: SlotNode[] = parts.map((part) => {
      if (isLeaf(node)) {
        const leaf: SlotLeaf = {
          least: null,
          parent: null,
          size: 0,
          slots: part as Slot[],
          sums: [],
        };

        for (const slot of leaf.slots) slot.leaf = leaf;
        this.sum(leaf);

        return leaf;
      }

      const branch: SlotBranch = {
        children: part as SlotNode[],
        least: null,
        parent: null,
        size: 0,
        sums: [],
      };

      for (const child of branch.children) child.parent = branch;
      this.sum(branch);

      return branch;
    });
    const { parent } = node;

    if (!parent) {
      const root: SlotBranch = {
        children: siblings,
        least: null,
        parent: null,
        size: 0,
        sums: [],
      };

      for (const child of siblings) child.parent = root;
      this.sum(root);
      this.root = root;
      return;
    }

    parent.children.splice(parent.children.indexOf(node), 1, ...siblings);
    for (const child of siblings) child.parent = parent;
    this.refresh(parent);
    this.overflow(parent);
  }

  private shrink() {
    while (!isLeaf(this.root) && this.root.children.length === 1) {
      const child = getDefined(this.root.children[0]);

      child.parent = null;
      this.root = child;
    }
    if (!isLeaf(this.root) && this.root.children.length === 0) {
      this.root = { least: null, parent: null, size: 0, slots: [], sums: [] };
      this.sum(this.root);
    }
  }
}
