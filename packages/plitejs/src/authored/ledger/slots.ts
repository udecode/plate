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
  parent: SlotBranch | null;
  size: number;
  sums: number[];
};

export type SlotLeaf = {
  parent: SlotBranch | null;
  size: number;
  slots: Slot[];
  sums: number[];
};

type SlotNode = SlotBranch | SlotLeaf;

const WIDTH = 32;
const MAX = 2 * WIDTH;

const isLeaf = (node: SlotNode): node is SlotLeaf => 'slots' in node;

const entriesOf = (node: SlotNode): readonly (Slot | SlotNode)[] =>
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
 * Top-level blocks in document order, each with numbers the tree sums, so a
 * rank, a block's rank and the sum of a measure before a rank cost the
 * tree's height. It is mutable: the ledger that owns it is the only writer.
 *
 * @internal
 */
export class SlotTree<S extends Slot> {
  private root: SlotNode;

  constructor(
    private readonly measures: number,
    slots: readonly S[] = []
  ) {
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
    const leaf = slot.leaf;

    if (!leaf) throw new Error('A slot outside its tree has no rank.');

    let rank = leaf.slots.indexOf(slot);
    let child: SlotNode = leaf;

    for (let parent = leaf.parent; parent; parent = parent.parent) {
      for (const sibling of parent.children) {
        if (sibling === child) break;
        rank += sibling.size;
      }
      child = parent;
    }

    return rank;
  }

  /** The sum of `measure` over the slots before `rank`. */
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

  /** Visit slots from `from` up to `to`, until `visit` returns false. */
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

  /** Replace `deleteCount` slots at `rank` with `inserted`. */
  splice(rank: number, deleteCount: number, inserted: readonly S[]) {
    if (
      rank < 0 ||
      deleteCount < 0 ||
      rank + deleteCount > this.size
    ) {
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
    if (inserted.length > 0) {
      const { leaf, local } =
        this.size === 0
          ? { leaf: this.firstLeaf(), local: 0 }
          : rank === this.size
            ? this.leafAt(rank - 1, 1)
            : this.leafAt(rank);

      leaf.slots.splice(local, 0, ...inserted);
      for (const slot of inserted) slot.leaf = leaf;
      this.refresh(leaf);
      this.overflow(leaf);
    }
    this.shrink();
  }

  /** Sum a slot's changed measures into its ancestors. */
  update(slot: S) {
    this.refresh(getDefined(slot.leaf));
  }

  private build(slots: readonly S[]): SlotNode {
    let level: SlotNode[] = chunks(slots).map((items) => {
      const leaf: SlotLeaf = {
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
    let size = 0;

    for (const entry of entriesOf(node)) {
      const values = 'measures' in entry ? entry.measures : entry.sums;

      for (let measure = 0; measure < this.measures; measure += 1) {
        sums[measure] += getDefined(values[measure]);
      }
      size += 'measures' in entry ? 1 : entry.size;
    }
    node.sums = sums;
    node.size = size;
  }

  private refresh(node: SlotNode) {
    for (let current: SlotNode | null = node; current; current = current.parent) {
      this.sum(current);
    }
  }

  private firstLeaf() {
    let node = this.root;

    while (!isLeaf(node)) node = getDefined(node.children[0]);

    return node;
  }

  // The leaf holding `rank`; `after` reads the slot's position after it.
  private leafAt(rank: number, after: 0 | 1 = 0) {
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

    return { leaf: node, local: local + after };
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
        parent: null,
        size: 0,
        sums: [],
      };

      for (const child of branch.children) child.parent = branch;
      this.sum(branch);

      return branch;
    });
    const parent = node.parent;

    if (!parent) {
      const root: SlotBranch = {
        children: siblings,
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

  // A root with one child hands the root to it.
  private shrink() {
    while (!isLeaf(this.root) && this.root.children.length === 1) {
      const child = getDefined(this.root.children[0]);

      child.parent = null;
      this.root = child;
    }
    if (!isLeaf(this.root) && this.root.children.length === 0) {
      this.root = { parent: null, size: 0, slots: [], sums: [] };
      this.sum(this.root);
    }
  }
}
