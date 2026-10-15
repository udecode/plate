import type * as Y from 'yjs';

import type { YjsNode } from './attributes';
import { YJS_NODE_ID_KEY, YJS_VIRTUAL_CHILD_ID_KEY } from './keys';

type RootSlot = {
  left: RootSlot | null;
  parent: RootSlot | null;
  priority: number;
  raw: YjsNode;
  ref: string | null;
  right: RootSlot | null;
  shown: YjsNode | null;
  size: number;
  visible: number;
};

/**
 * A raw child of a Yjs root and the node it shows there: itself, the node a
 * virtual placeholder refers to, or null when it shows none. `ref` is the id a
 * placeholder refers to.
 */
export type RootSlotEntry = Readonly<{
  raw: YjsNode;
  ref: string | null;
  shown: YjsNode | null;
}>;

export type RootVisibleSlot = Readonly<{ node: YjsNode; rawIndex: number }>;

/** A root tree's nodes by `yjs:id`, and each element that shows an id. */
export type YjsTreeRefs = Readonly<{
  ids: ReadonlyMap<string, YjsNode>;
  referrers: ReadonlyArray<readonly [id: string, referrer: Y.XmlElement]>;
}>;

let prioritySeed = 0x25_45_f4_91;

const nextPriority = (): number => {
  prioritySeed ^= prioritySeed << 13;
  prioritySeed ^= prioritySeed >>> 17;
  prioritySeed ^= prioritySeed << 5;

  return prioritySeed >>> 0;
};

const sizeOf = (slot: RootSlot | null): number => slot?.size ?? 0;

const visibleOf = (slot: RootSlot | null): number => slot?.visible ?? 0;

const shownCount = (slot: RootSlot): number => (slot.shown === null ? 0 : 1);

const update = (slot: RootSlot): RootSlot => {
  slot.size = sizeOf(slot.left) + sizeOf(slot.right) + 1;
  slot.visible =
    visibleOf(slot.left) + visibleOf(slot.right) + shownCount(slot);
  if (slot.left) slot.left.parent = slot;
  if (slot.right) slot.right.parent = slot;

  return slot;
};

const merge = (
  left: RootSlot | null,
  right: RootSlot | null
): RootSlot | null => {
  if (left === null) return right;
  if (right === null) return left;

  if (left.priority <= right.priority) {
    left.right = merge(left.right, right);

    return update(left);
  }

  right.left = merge(left, right.left);

  return update(right);
};

const split = (
  root: RootSlot | null,
  count: number
): readonly [RootSlot | null, RootSlot | null] => {
  if (root === null) return [null, null];

  const leftSize = sizeOf(root.left);

  if (count <= leftSize) {
    const [left, right] = split(root.left, count);

    root.left = right;
    update(root).parent = null;
    if (left) left.parent = null;

    return [left, root];
  }

  const [left, right] = split(root.right, count - leftSize - 1);

  root.right = left;
  update(root).parent = null;
  if (right) right.parent = null;

  return [root, right];
};

const isDeleted = (node: YjsNode): boolean => node._item?.deleted === true;

/**
 * The raw children of one Yjs root, each with the node it shows, and the root
 * tree's nodes by `yjs:id`. It maps a visible index to its raw slot, a shown
 * node to its visible index and a virtual reference to its node without
 * enumerating the root. It also keeps the elements that show each id as a
 * virtual child, so a change under a hidden node finds the block that shows
 * it. An index or length named raw counts raw children; any other counts
 * visible ones.
 *
 * The bridge builds it on reset. While the bridge lowers a local change, it
 * lends the index to the document helpers, whose root writes keep it current.
 * Between lowerings it holds the root the mirror last matched, which a remote
 * batch is read against.
 */
export class RootProjectionIndex {
  private readonly ids = new Map<string, YjsNode>();
  /** Slots that show something other than their raw child. */
  private projected = 0;
  private readonly raws = new Map<YjsNode, RootSlot>();
  /** The elements noted as showing each id, live or not. */
  private readonly referrers = new Map<string, Set<Y.XmlElement>>();
  /** How many root placeholders refer to each id. */
  private readonly refs = new Map<string, number>();
  private root: RootSlot | null = null;
  private readonly shown = new Map<YjsNode, RootSlot>();

  get length(): number {
    return visibleOf(this.root);
  }

  get rawLength(): number {
    return sizeOf(this.root);
  }

  /** Whether every raw child shows itself, so its raw index is its visible one. */
  get simple(): boolean {
    return this.projected === 0;
  }

  at(index: number): YjsNode | undefined {
    return this.slotAt(index)?.node;
  }

  has(node: YjsNode): boolean {
    return this.shown.has(node);
  }

  holdsRaw(raw: YjsNode): boolean {
    return this.raws.has(raw);
  }

  indexOf(node: YjsNode): number {
    const slot = this.shown.get(node);

    if (!slot) return -1;

    let index = visibleOf(slot.left);

    for (let current = slot; current.parent !== null;) {
      const parent: RootSlot = current.parent;

      if (current === parent.right) {
        index += visibleOf(parent.left) + shownCount(parent);
      }
      current = parent;
    }

    return index;
  }

  rawAt(rawIndex: number): YjsNode | undefined {
    let current = this.root;
    let target = rawIndex;

    while (current !== null) {
      const leftSize = sizeOf(current.left);

      if (target < leftSize) {
        current = current.left;
      } else if (target > leftSize) {
        target -= leftSize + 1;
        current = current.right;
      } else {
        return current.raw;
      }
    }

    return undefined;
  }

  slotAt(index: number): RootVisibleSlot | undefined {
    if (!Number.isInteger(index) || index < 0) return undefined;

    let current = this.root;
    let target = index;
    let rawIndex = 0;

    while (current !== null) {
      const leftVisible = visibleOf(current.left);

      if (target < leftVisible) {
        current = current.left;
        continue;
      }
      target -= leftVisible;
      rawIndex += sizeOf(current.left);
      if (current.shown !== null) {
        if (target === 0) return { node: current.shown, rawIndex };
        target -= 1;
      }
      rawIndex += 1;
      current = current.right;
    }

    return undefined;
  }

  slice(from: number, to = this.length): YjsNode[] {
    const nodes: YjsNode[] = [];
    const visit = (slot: RootSlot | null, offset: number): void => {
      if (slot === null || offset >= to || offset + slot.visible <= from) {
        return;
      }

      const index = offset + visibleOf(slot.left);

      visit(slot.left, offset);
      if (slot.shown !== null && from <= index && index < to) {
        nodes.push(slot.shown);
      }
      visit(slot.right, index + shownCount(slot));
    };

    visit(this.root, 0);

    return nodes;
  }

  /** The live node with `id`, or null when none is known. */
  resolve(id: string): YjsNode | null {
    const node = this.ids.get(id);

    return node !== undefined &&
      node.getAttribute(YJS_NODE_ID_KEY) === id &&
      !isDeleted(node)
      ? node
      : null;
  }

  noteId(id: string, node: YjsNode): void {
    this.ids.set(id, node);
  }

  noteReferrer(id: string, referrer: Y.XmlElement): void {
    const known = this.referrers.get(id);

    if (known) known.add(referrer);
    else this.referrers.set(id, new Set([referrer]));
  }

  /** The live elements that still show the node with `id`. */
  referrersOf(id: string): Y.XmlElement[] {
    const known = this.referrers.get(id);
    const live: Y.XmlElement[] = [];

    for (const referrer of known ?? []) {
      if (
        referrer.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === id &&
        !isDeleted(referrer)
      ) {
        live.push(referrer);
      } else {
        known?.delete(referrer);
      }
    }
    if (known?.size === 0) this.referrers.delete(id);

    return live;
  }

  /** Whether a placeholder among the root's children refers to `id`. */
  references(id: string): boolean {
    return this.refs.has(id);
  }

  reset(entries: readonly RootSlotEntry[], tree: YjsTreeRefs): void {
    this.root = null;
    this.raws.clear();
    this.shown.clear();
    this.refs.clear();
    this.projected = 0;
    this.ids.clear();
    this.referrers.clear();
    for (const [id, node] of tree.ids) this.ids.set(id, node);
    for (const [id, referrer] of tree.referrers) {
      this.noteReferrer(id, referrer);
    }
    this.root = this.build(entries);
  }

  /**
   * Returns false when an entry shows a node another slot already shows,
   * which only a rebuild in raw order settles.
   */
  insert(rawIndex: number, entries: readonly RootSlotEntry[]): boolean {
    const [left, right] = split(this.root, rawIndex);
    const consistent = entries.every(
      ({ shown }) => shown === null || !this.shown.has(shown)
    );

    this.root = merge(merge(left, this.build(entries)), right);
    if (this.root) this.root.parent = null;

    return consistent;
  }

  remove(raw: YjsNode): void {
    const slot = this.raws.get(raw);

    if (!slot) return;

    let rawIndex = sizeOf(slot.left);

    for (let current = slot; current.parent !== null;) {
      const parent: RootSlot = current.parent;

      if (current === parent.right) rawIndex += sizeOf(parent.left) + 1;
      current = parent;
    }
    this.delete(rawIndex, 1);
  }

  delete(rawIndex: number, count: number): void {
    const [left, rest] = split(this.root, rawIndex);
    const [removed, right] = split(rest, count);
    const forget = (slot: RootSlot | null): void => {
      if (slot === null) return;
      forget(slot.left);
      this.raws.delete(slot.raw);
      this.unshow(slot);
      this.refer(slot, null);
      forget(slot.right);
    };

    forget(removed);
    this.root = merge(left, right);
    if (this.root) this.root.parent = null;
  }

  /**
   * Records what `raw` now shows and refers to. Returns false when another
   * slot already shows that node, which only a rebuild in raw order settles.
   */
  show({ raw, ref, shown }: RootSlotEntry): boolean {
    const slot = this.raws.get(raw);

    if (!slot) return true;

    this.refer(slot, ref);
    if (slot.shown === shown) return true;
    if (shown !== null && this.shown.has(shown)) return false;

    this.unshow(slot);
    this.showAt(slot, shown);
    for (
      let current: RootSlot | null = slot;
      current;
      current = current.parent
    ) {
      update(current);
    }
    if (this.root) this.root.parent = null;

    return true;
  }

  private build(entries: readonly RootSlotEntry[]): RootSlot | null {
    let built: RootSlot | null = null;

    for (const { raw, ref, shown } of entries) {
      const slot: RootSlot = {
        left: null,
        parent: null,
        priority: nextPriority(),
        raw,
        ref: null,
        right: null,
        shown: null,
        size: 1,
        visible: 0,
      };

      this.raws.set(raw, slot);
      this.refer(slot, ref);
      this.showAt(slot, shown !== null && this.shown.has(shown) ? null : shown);
      built = merge(built, update(slot));
    }
    if (built) built.parent = null;

    return built;
  }

  private refer(slot: RootSlot, ref: string | null): void {
    if (slot.ref === ref) return;
    if (slot.ref !== null) {
      const count = (this.refs.get(slot.ref) ?? 1) - 1;

      if (count === 0) this.refs.delete(slot.ref);
      else this.refs.set(slot.ref, count);
    }
    if (ref !== null) this.refs.set(ref, (this.refs.get(ref) ?? 0) + 1);
    slot.ref = ref;
  }

  private showAt(slot: RootSlot, shown: YjsNode | null): void {
    slot.shown = shown;
    if (shown !== null) this.shown.set(shown, slot);
    if (shown !== slot.raw) this.projected += 1;
  }

  private unshow(slot: RootSlot): void {
    if (slot.shown !== null && this.shown.get(slot.shown) === slot) {
      this.shown.delete(slot.shown);
    }
    if (slot.shown !== slot.raw) this.projected -= 1;
    slot.shown = null;
  }
}
