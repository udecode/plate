import type { NamedRootKey, NodeKey } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import {
  emptyUniqueHashMap,
  hashMapDelete,
  hashMapDiff,
  hashMapForEach,
  hashMapGet,
  hashMapSet,
  type UniqueHashMap,
  uniqueKeyOf,
  uniqueLookupKeyOf,
} from './unique-hash-map';
import { type CoreWork, countCoreWork } from './work';

const WIDTH = 32;
const MIN = 16;
const BITS = 5;

type DirNode = { edit: object | null; size: number; slots: unknown[] };

declare const directoryValue: unique symbol;

type Directory<V> = Readonly<{
  depth: number;
  root: DirNode | null;
  size: number;
  [directoryValue]?: V;
}>;

const EMPTY_DIRECTORY: Directory<never> = Object.freeze({
  depth: 1,
  root: null,
  size: 0,
});

const emptyDirectory = <V>() => EMPTY_DIRECTORY as Directory<V>;

const digit = (address: number, level: number) =>
  Math.floor(address / 2 ** (level * BITS)) % WIDTH;

type SlotCounter = keyof CoreWork;

const ownedNode = (
  node: DirNode | null,
  edit: object,
  copied?: SlotCounter
): DirNode => {
  if (node && node.edit === edit) return node;
  countCoreWork('identityDirectoryNodesCopied');
  if (!node) return { edit, size: 0, slots: [] };
  if (copied) countCoreWork(copied, node.slots.length);

  return { edit, size: node.size, slots: [...node.slots] };
};

const dirGet = <V>(dir: Directory<V>, address: number): V | undefined => {
  if (address < 0 || address >= 2 ** (dir.depth * BITS)) return undefined;
  let node = dir.root;

  for (let level = dir.depth - 1; level > 0; level--) {
    if (!node) return undefined;
    node = node.slots[digit(address, level)] as DirNode | null;
  }

  return node ? (node.slots[digit(address, 0)] as V | undefined) : undefined;
};

const dirSet = <V>(
  dir: Directory<V>,
  address: number,
  value: V,
  edit: object,
  copied?: SlotCounter
): Directory<V> => {
  let { depth, root } = dir;

  while (address >= 2 ** (depth * BITS)) {
    if (root) {
      countCoreWork('identityDirectoryNodesCopied');
      root = { edit, size: 1, slots: [root] };
    }
    depth += 1;
  }
  const top = ownedNode(root, edit, copied);
  let node = top;
  let added = false;

  for (let level = depth - 1; level > 0; level--) {
    const at = digit(address, level);
    const child = node.slots[at] as DirNode | undefined;
    const owned = ownedNode(child ?? null, edit, copied);

    if (!child) node.size += 1;
    node.slots[at] = owned;
    node = owned;
  }
  const at = digit(address, 0);

  if (node.slots[at] === undefined) {
    node.size += 1;
    added = true;
  }
  node.slots[at] = value;

  return { depth, root: top, size: dir.size + (added ? 1 : 0) };
};

const dirDelete = <V>(
  dir: Directory<V>,
  address: number,
  edit: object,
  copied?: SlotCounter
): Directory<V> => {
  if (dirGet(dir, address) === undefined) return dir;
  const path: Array<[DirNode, number]> = [];
  const top = ownedNode(dir.root, edit, copied);
  let node = top;

  for (let level = dir.depth - 1; level > 0; level--) {
    const at = digit(address, level);
    const owned = ownedNode(node.slots[at] as DirNode, edit, copied);

    node.slots[at] = owned;
    path.push([node, at]);
    node = owned;
  }
  node.slots[digit(address, 0)] = undefined;
  node.size -= 1;
  for (let index = path.length - 1; index >= 0 && node.size === 0; index--) {
    const [parent, at] = path[index];

    parent.slots[at] = undefined;
    parent.size -= 1;
    node = parent;
  }

  return {
    depth: dir.depth,
    root: top.size === 0 ? null : top,
    size: dir.size - 1,
  };
};

const dirForEach = <V>(
  dir: Directory<V>,
  visit: (value: V, address: number) => void
) => {
  const walk = (node: DirNode, level: number, base: number) => {
    node.slots.forEach((slot, at) => {
      if (slot === undefined) return;
      const address = base + at * 2 ** (level * BITS);

      if (level === 0) visit(slot as V, address);
      else walk(slot as DirNode, level - 1, address);
    });
  };

  if (dir.root) walk(dir.root, dir.depth - 1, 0);
};

const dirNodeCount = (dir: Directory<unknown>) => {
  let count = 0;
  const walk = (node: DirNode, level: number) => {
    count += 1;
    if (level === 0) return;
    for (const slot of node.slots) {
      if (slot !== undefined) walk(slot as DirNode, level - 1);
    }
  };

  if (dir.root) walk(dir.root, dir.depth - 1);
  return count;
};

const LIVE_KEY = /^(r[0-9a-z]+):n(\d+)$/;

const keyAddress = (
  nodeKey: NodeKey
): Readonly<{ address: number; live: boolean }> | null => {
  const live = LIVE_KEY.exec(nodeKey);

  if (live) return { address: Number(live[2]), live: true };
  if (nodeKey.startsWith('p')) {
    const ordinal = Number(nodeKey.slice(1));

    return Number.isSafeInteger(ordinal) && `p${ordinal}` === nodeKey
      ? { address: ordinal * 2, live: false }
      : null;
  }
  if (nodeKey.startsWith('d')) {
    const ordinal = Number.parseInt(nodeKey.slice(1), 36);

    return Number.isSafeInteger(ordinal)
      ? { address: ordinal * 2 + 1, live: false }
      : null;
  }

  return null;
};

const TYPE_ADDRESSES = new Map<string, number>();

const typeAddress = (type: string) => {
  let address = TYPE_ADDRESSES.get(type);

  if (address === undefined) {
    address = TYPE_ADDRESSES.size;
    TYPE_ADDRESSES.set(type, address);
  }

  return address;
};

export type KeyOf = (node: Descendant, path: Path) => NodeKey | null;

const keyCell = (
  topology: Readonly<{ keys: Directory<number>; spareKeys: Directory<number> }>,
  nodeKey: NodeKey
) => {
  const address = keyAddress(nodeKey);

  if (!address) return undefined;
  return dirGet(
    address.live ? topology.keys : topology.spareKeys,
    address.address
  );
};

const TEXT_KIND = -1;
export const ROOT_LIST = -1;
const NO_PARENT_PAGE = -1;
const NO_TREE = -1;

type SoleHolder = number;

type HolderSet = Directory<true>;

type Holders = SoleHolder | HolderSet;

const HOLDER_SLOTS = 'uniqueHolderSlotsCopied';

const addHolder = (
  holders: Holders | undefined,
  cell: number,
  edit: object
): Holders => {
  if (holders === undefined) return cell;
  const set =
    typeof holders === 'number'
      ? dirSet(emptyDirectory<true>(), holders, true, edit, HOLDER_SLOTS)
      : holders;

  return dirSet(set, cell, true, edit, HOLDER_SLOTS);
};

const dropHolder = (
  holders: Holders,
  cell: number,
  edit: object
): Holders | undefined => {
  if (typeof holders === 'number') return undefined;
  const rest = dirDelete(holders, cell, edit, HOLDER_SLOTS);

  if (rest.size > 1) return rest;
  let sole = cell;

  dirForEach(rest, (_, held) => {
    sole = held;
  });
  return sole;
};

const forEachHolder = (holders: Holders, visit: (cell: number) => void) => {
  if (typeof holders === 'number') visit(holders);
  else dirForEach(holders, (_, cell) => visit(cell));
};

export type ContentRootSlots = Readonly<{
  byType: ReadonlyMap<string, readonly string[]>;
  signature: string;
}>;

export type OwnerPlace = Readonly<{
  childRoot: NamedRootKey;
  path: Path;
  slot: string;
}>;

export const NO_ROOT_OWNERS: readonly OwnerPlace[] = Object.freeze([]);

const rootNameAt = (childRoots: unknown, slot: string): NamedRootKey | null => {
  if (typeof childRoots !== 'object' || childRoots === null) return null;
  const root = (childRoots as Readonly<Record<string, unknown>>)[slot];

  return typeof root === 'string' && root.length > 0 ? root : null;
};

export const sameNamedRoots = (
  before: unknown,
  after: unknown,
  slots: readonly string[]
) => {
  if (before === after) return true;
  for (const slot of slots) {
    if (rootNameAt(before, slot) !== rootNameAt(after, slot)) return false;
  }
  return true;
};

const OWNER_KINDS = new WeakMap<ContentRootSlots, ReadonlySet<number>>();

const ownerKindsOf = (contentRoots: ContentRootSlots) => {
  let kinds = OWNER_KINDS.get(contentRoots);

  if (!kinds) {
    kinds = new Set([...contentRoots.byType.keys()].map(typeAddress));
    OWNER_KINDS.set(contentRoots, kinds);
  }
  return kinds;
};

type Cell = Readonly<{
  children: number;
  /** The key of each unique property's value, in the topology's order. */
  held: ReadonlyArray<string | null> | null;
  key: NodeKey | null;
  kind: number;
  page: number;
}>;

type Page = Readonly<{
  items: readonly number[];
  counts: readonly number[];
  leaf: boolean;
  owner: number;
  up: number;
}>;

class OwnerOrderVersion {
  private readonly guards = 'owner order';
}

class PlacementVersion {
  private readonly guards = 'owner paths';
}

export type Topology = Readonly<{
  cells: Directory<Cell>;
  contentRoots: ContentRootSlots;
  elements: Directory<Directory<true>>;
  /** For each unique property, the cells that hold each value's key. */
  holders: ReadonlyArray<UniqueHashMap<Holders>>;
  keys: Directory<number>;
  pages: Directory<Page>;
  ownerOrder: OwnerOrderVersion;
  placement: PlacementVersion;
  spareKeys: Directory<number>;
  top: number;
  uniqueProperties: readonly string[];
}>;

let nextCellAddress = 0;
let nextPageAddress = 0;

const takeCellAddress = () => {
  nextCellAddress += 1;
  return nextCellAddress - 1;
};

const takePageAddress = () => {
  nextPageAddress += 1;
  return nextPageAddress - 1;
};

const isText = (node: Descendant) =>
  typeof (node as { text?: unknown }).text === 'string';

export const childrenOfNode = (
  node: Descendant
): readonly Descendant[] | null =>
  'children' in node && Array.isArray(node.children)
    ? (node.children as readonly Descendant[])
    : null;

const elementKind = (node: Descendant) =>
  isText(node)
    ? TEXT_KIND
    : typeAddress(
        typeof (node as { type?: unknown }).type === 'string'
          ? (node as { type: string }).type
          : ''
      );

export class TopologyBuilder {
  cells: Directory<Cell>;
  private contentRoots: ContentRootSlots;
  private edit = {};
  elements: Directory<Directory<true>>;
  private firstNewCell = nextCellAddress;
  private holders: ReadonlyArray<UniqueHashMap<Holders>>;
  keys: Directory<number>;
  private ownerOrder: OwnerOrderVersion;
  pages: Directory<Page>;
  private placed = false;
  private placement: PlacementVersion;
  private released: number[] = [];
  private reordered = false;
  spareKeys: Directory<number>;
  top: number;
  uniqueProperties: readonly string[];

  constructor(source: Topology);
  constructor(
    source: null,
    uniqueProperties: readonly string[],
    contentRoots: ContentRootSlots
  );
  constructor(
    source: Topology | null,
    uniqueProperties?: readonly string[],
    contentRoots?: ContentRootSlots
  ) {
    this.cells = source?.cells ?? emptyDirectory();
    this.contentRoots = source?.contentRoots ?? getDefined(contentRoots);
    this.elements = source?.elements ?? emptyDirectory();
    this.uniqueProperties =
      source?.uniqueProperties ?? getDefined(uniqueProperties);
    this.holders =
      source?.holders ??
      this.uniqueProperties.map(() => emptyUniqueHashMap<Holders>());
    this.keys = source?.keys ?? emptyDirectory();
    this.pages = source?.pages ?? emptyDirectory();
    this.ownerOrder = source?.ownerOrder ?? new OwnerOrderVersion();
    this.placement = source?.placement ?? new PlacementVersion();
    this.spareKeys = source?.spareKeys ?? emptyDirectory();
    this.top = source ? source.top : NO_TREE;
  }

  finish(): Topology {
    for (const cell of this.released) {
      const row = this.cell(cell);

      this.removeMember(row.kind, cell);
      this.cells = dirDelete(this.cells, cell, this.edit);
      if (row.children === NO_TREE) continue;
      for (const page of this.pagesOf(row.children)) this.dropPage(page);
    }
    this.released = [];
    if (this.reordered) this.ownerOrder = new OwnerOrderVersion();
    if (this.reordered || this.placed) this.placement = new PlacementVersion();
    this.reordered = false;
    this.placed = false;
    this.firstNewCell = nextCellAddress;
    const topology = Object.freeze({
      cells: this.cells,
      contentRoots: this.contentRoots,
      elements: this.elements,
      holders: this.holders,
      keys: this.keys,
      ownerOrder: this.ownerOrder,
      pages: this.pages,
      placement: this.placement,
      spareKeys: this.spareKeys,
      top: this.top,
      uniqueProperties: this.uniqueProperties,
    });

    // The topology shares every node this edit owns, so later writes copy.
    this.edit = {};
    return topology;
  }

  private reorderOwnersOf(kind: number) {
    if (ownerKindsOf(this.contentRoots).has(kind)) this.reordered = true;
  }

  reorderOwners() {
    this.reordered = true;
  }

  private hold(at: number, key: string, cell: number) {
    countCoreWork('uniqueHolderWrites');
    const map = this.holders[at];
    const holders = addHolder(hashMapGet(map, key), cell, this.edit);

    this.holders = this.holders.with(
      at,
      hashMapSet(map, key, holders, this.edit)
    );
  }

  private holdAll(cell: number, held: Cell['held']) {
    held?.forEach((key, at) => {
      if (key !== null) this.hold(at, key, cell);
    });
  }

  private unhold(at: number, key: string, cell: number) {
    countCoreWork('uniqueHolderWrites');
    const map = this.holders[at];
    const rest = dropHolder(getDefined(hashMapGet(map, key)), cell, this.edit);

    this.holders = this.holders.with(
      at,
      rest === undefined
        ? hashMapDelete(map, key, this.edit)
        : hashMapSet(map, key, rest, this.edit)
    );
  }

  private heldOf(node: Descendant, kind: number) {
    if (kind === TEXT_KIND) return null;
    let held: Array<string | null> | null = null;

    for (let at = 0; at < this.uniqueProperties.length; at++) {
      const key = uniqueKeyOf(node[this.uniqueProperties[at]]);

      if (key === null) continue;
      held ??= this.uniqueProperties.map(() => null);
      held[at] = key;
    }
    return held;
  }

  cell(address: number) {
    const cell = dirGet(this.cells, address);

    if (!cell) throw new Error(`Identity cell ${address} is missing.`);
    return cell;
  }

  page(address: number) {
    countCoreWork('identityPagesExamined');
    const page = dirGet(this.pages, address);

    if (!page) throw new Error(`Identity page ${address} is missing.`);
    return page;
  }

  setCell(address: number, cell: Cell) {
    this.cells = dirSet(this.cells, address, Object.freeze(cell), this.edit);
  }

  setPage(address: number, page: Page) {
    this.pages = dirSet(this.pages, address, Object.freeze(page), this.edit);
  }

  newPage(leaf: boolean, owner: number, up: number, items: number[]) {
    const address = takePageAddress();

    this.setPage(address, { counts: [], items, leaf, owner, up });
    return address;
  }

  cellOfKey(nodeKey: NodeKey) {
    const cell = keyCell(this, nodeKey);

    return cell !== undefined && this.cell(cell).key === nodeKey
      ? cell
      : undefined;
  }

  setKey(nodeKey: NodeKey, cell: number) {
    const address = keyAddress(nodeKey);

    if (address === null) {
      throw new Error(`Identity owner cannot address node key ${nodeKey}.`);
    }
    const held = keyCell(this, nodeKey);

    if (held !== undefined && held !== cell && dirGet(this.cells, held)) {
      throw new Error(
        `Identity owner already places ${
          this.cell(held).key
        } where ${nodeKey} goes.`
      );
    }
    if (address.live) {
      this.keys = dirSet(this.keys, address.address, cell, this.edit);
    } else {
      this.spareKeys = dirSet(this.spareKeys, address.address, cell, this.edit);
    }
  }

  deleteKey(nodeKey: NodeKey) {
    const address = keyAddress(nodeKey);

    if (!address) return;
    if (address.live) {
      this.keys = dirDelete(this.keys, address.address, this.edit);
    } else {
      this.spareKeys = dirDelete(this.spareKeys, address.address, this.edit);
    }
  }

  addMember(kind: number, cell: number) {
    if (kind === TEXT_KIND) return;
    countCoreWork('identityMembershipsTouched');
    const bucket = dirGet(this.elements, kind) ?? emptyDirectory<true>();

    this.elements = dirSet(
      this.elements,
      kind,
      dirSet(bucket, cell, true, this.edit),
      this.edit
    );
  }

  removeMember(kind: number, cell: number) {
    if (kind === TEXT_KIND) return;
    countCoreWork('identityMembershipsTouched');
    const bucket = dirGet(this.elements, kind);

    if (!bucket) return;
    const next = dirDelete(bucket, cell, this.edit);

    this.elements =
      next.size === 0
        ? dirDelete(this.elements, kind, this.edit)
        : dirSet(this.elements, kind, next, this.edit);
  }

  count(page: number): number {
    const row = this.page(page);

    return row.leaf
      ? row.items.length
      : row.counts.reduce((sum, count) => sum + count, 0);
  }

  at(tree: number, index: number): number | undefined {
    let row = this.page(tree);
    let rest = index;

    while (!row.leaf) {
      let child = 0;

      while (child < row.counts.length && rest >= row.counts[child]) {
        rest -= row.counts[child];
        child += 1;
      }
      if (child === row.counts.length) return undefined;
      row = this.page(row.items[child]);
    }

    return row.items[rest];
  }

  locate(cell: number) {
    let pageAddress = this.cell(cell).page;
    let row = this.page(pageAddress);
    let index = row.items.indexOf(cell);

    if (index < 0) throw new Error(`Identity cell ${cell} is not in its page.`);
    while (row.up !== NO_PARENT_PAGE) {
      const parent = this.page(row.up);
      const at = parent.items.indexOf(pageAddress);

      for (let child = 0; child < at; child++) index += parent.counts[child];
      pageAddress = row.up;
      row = parent;
    }

    return { index, owner: row.owner };
  }

  pathOfCell(cell: number): Path {
    const path: number[] = [];
    let current = cell;

    while (true) {
      const { index, owner } = this.locate(current);

      path.push(index);
      if (owner === ROOT_LIST) break;
      current = owner;
    }

    return Object.freeze(path.reverse());
  }

  private setUp(page: number, up: number) {
    countCoreWork('identityLocationsRepaired');
    this.setPage(page, { ...this.page(page), up });
  }

  private setCellPage(cell: number, page: number) {
    const row = this.cell(cell);

    if (row.page === page) return;
    countCoreWork('identityLocationsRepaired');
    this.setCell(cell, { ...row, page });
  }

  private rootOf(tree: number) {
    let row = this.page(tree);
    let address = tree;

    while (row.up !== NO_PARENT_PAGE) {
      address = row.up;
      row = this.page(address);
    }

    return address;
  }

  private setTreeRoot(owner: number, root: number) {
    if (owner === ROOT_LIST) {
      this.top = root;
      return;
    }
    countCoreWork('identityLocationsRepaired');
    this.setCell(owner, { ...this.cell(owner), children: root });
  }

  private descend(tree: number, index: number, inserting: boolean) {
    const trail: Array<{ page: number; slot: number }> = [];
    let address = tree;
    let row = this.page(address);
    let rest = index;

    while (!row.leaf) {
      let child = 0;

      while (
        child < row.counts.length - 1 &&
        (inserting ? rest > row.counts[child] : rest >= row.counts[child])
      ) {
        rest -= row.counts[child];
        child += 1;
      }
      trail.push({ page: address, slot: child });
      address = row.items[child];
      row = this.page(address);
    }

    return { leaf: address, offset: rest, trail };
  }

  insertAt(tree: number, index: number, cell: number) {
    const { leaf, offset, trail } = this.descend(tree, index, true);
    const row = this.page(leaf);
    const items = [...row.items];

    this.placed = true;
    if (cell < this.firstNewCell) this.reordered = true;
    items.splice(offset, 0, cell);
    this.setPage(leaf, { ...row, items });
    this.setCellPage(cell, leaf);
    for (const { page, slot } of trail) {
      const branch = this.page(page);
      const counts = [...branch.counts];

      counts[slot] += 1;
      this.setPage(page, { ...branch, counts });
    }
    this.splitIfFull(leaf, trail, offset);
  }

  private splitIfFull(
    address: number,
    trail: Array<{ page: number; slot: number }>,
    insertedAt: number
  ) {
    let current = address;
    let inserted = insertedAt;

    for (let depth = trail.length; depth >= 0; depth--) {
      const row = this.page(current);

      if (row.items.length <= WIDTH) return;
      const half =
        inserted === row.items.length - 1
          ? WIDTH
          : Math.min(
              Math.max(inserted + 1, WIDTH / 4),
              row.items.length - WIDTH / 4
            );
      const right = this.newPage(
        row.leaf,
        row.owner,
        row.up,
        row.items.slice(half)
      );

      this.setPage(current, {
        ...row,
        counts: row.leaf ? [] : row.counts.slice(0, half),
        items: row.items.slice(0, half),
      });
      if (!row.leaf) {
        this.setPage(right, {
          ...this.page(right),
          counts: row.counts.slice(half),
        });
      }
      for (const item of row.items.slice(half)) {
        if (row.leaf) this.setCellPage(item, right);
        else this.setUp(item, right);
      }
      const leftCount = this.count(current);
      const rightCount = this.count(right);

      if (depth === 0) {
        const root = this.newPage(false, row.owner, NO_PARENT_PAGE, [
          current,
          right,
        ]);

        this.setPage(root, {
          ...this.page(root),
          counts: [leftCount, rightCount],
        });
        this.setUp(current, root);
        this.setUp(right, root);
        this.setTreeRoot(row.owner, root);
        return;
      }
      const { page: parentAddress, slot } = trail[depth - 1];
      const parent = this.page(parentAddress);
      const items = [...parent.items];
      const counts = [...parent.counts];

      items.splice(slot + 1, 0, right);
      counts.splice(slot, 1, leftCount, rightCount);
      this.setPage(parentAddress, { ...parent, counts, items });
      this.setUp(right, parentAddress);
      current = parentAddress;
      inserted = slot + 1;
    }
  }

  replaceAt(tree: number, index: number, cell: number) {
    const { leaf, offset } = this.descend(tree, index, false);
    const row = this.page(leaf);
    const items = [...row.items];
    const [previous] = items.splice(offset, 1, cell);

    if (previous !== cell && cell < this.firstNewCell) this.reordered = true;
    this.setPage(leaf, { ...row, items });
    this.setCellPage(cell, leaf);

    return previous;
  }

  deleteAt(tree: number, index: number) {
    const { leaf, offset, trail } = this.descend(tree, index, false);
    const row = this.page(leaf);
    const items = [...row.items];
    const [cell] = items.splice(offset, 1);

    this.placed = true;
    this.setPage(leaf, { ...row, items });
    for (const { page, slot } of trail) {
      const branch = this.page(page);
      const counts = [...branch.counts];

      counts[slot] -= 1;
      this.setPage(page, { ...branch, counts });
    }
    this.rebalance(leaf, trail);

    return cell;
  }

  private rebalance(
    address: number,
    trail: Array<{ page: number; slot: number }>
  ) {
    let current = address;

    for (let depth = trail.length; depth > 0; depth--) {
      const row = this.page(current);

      if (row.items.length >= MIN) return;
      const { page: parentAddress, slot } = trail[depth - 1];
      const parent = this.page(parentAddress);
      const siblingSlot = slot > 0 ? slot - 1 : slot + 1;

      if (siblingSlot >= parent.items.length) return;
      const siblingAddress = parent.items[siblingSlot];
      const sibling = this.page(siblingAddress);
      const [leftAddress, rightAddress] =
        siblingSlot < slot
          ? [siblingAddress, current]
          : [current, siblingAddress];
      const [left, right] =
        siblingSlot < slot ? [sibling, row] : [row, sibling];
      const leftSlot = Math.min(slot, siblingSlot);

      if (left.items.length + right.items.length <= WIDTH) {
        for (const item of right.items) {
          if (row.leaf) this.setCellPage(item, leftAddress);
          else this.setUp(item, leftAddress);
        }
        this.setPage(leftAddress, {
          ...left,
          counts: row.leaf ? [] : [...left.counts, ...right.counts],
          items: [...left.items, ...right.items],
        });
        this.dropPage(rightAddress);
        const items = [...parent.items];
        const counts = [...parent.counts];

        items.splice(leftSlot + 1, 1);
        counts.splice(leftSlot, 2, counts[leftSlot] + counts[leftSlot + 1]);
        this.setPage(parentAddress, { ...parent, counts, items });
      } else {
        const all = [...left.items, ...right.items];
        const allCounts = row.leaf ? [] : [...left.counts, ...right.counts];
        const half = Math.floor(all.length / 2);

        this.setPage(leftAddress, {
          ...left,
          counts: allCounts.slice(0, half),
          items: all.slice(0, half),
        });
        this.setPage(rightAddress, {
          ...right,
          counts: allCounts.slice(half),
          items: all.slice(half),
        });
        all.forEach((item, at) => {
          const target = at < half ? leftAddress : rightAddress;

          if (row.leaf) this.setCellPage(item, target);
          else if (this.page(item).up !== target) this.setUp(item, target);
        });
        const counts = [...parent.counts];

        counts[leftSlot] = this.count(leftAddress);
        counts[leftSlot + 1] = this.count(rightAddress);
        this.setPage(parentAddress, { ...this.page(parentAddress), counts });
        return;
      }
      current = parentAddress;
    }
    const root = this.page(current);

    if (!root.leaf && root.items.length === 1) {
      const child = root.items[0];

      this.dropPage(current);
      this.setUp(child, NO_PARENT_PAGE);
      this.setTreeRoot(root.owner, child);
    }
  }

  cellsOf(tree: number): number[] {
    const row = this.page(tree);

    return row.leaf
      ? [...row.items]
      : row.items.flatMap((page) => this.cellsOf(page));
  }

  pagesOf(tree: number): number[] {
    const row = this.page(tree);

    return row.leaf
      ? [tree]
      : [tree, ...row.items.flatMap((page) => this.pagesOf(page))];
  }

  release(cell: number, kept: ReadonlySet<number>) {
    const row = this.cell(cell);

    if (row.key) this.deleteKey(row.key);
    row.held?.forEach((key, at) => {
      if (key !== null) this.unhold(at, key, cell);
    });
    this.reorderOwnersOf(row.kind);
    this.released.push(cell);
    if (row.children === NO_TREE) return;
    for (const child of this.cellsOf(row.children)) {
      if (!kept.has(child)) this.release(child, kept);
    }
  }

  dropPage(page: number) {
    this.pages = dirDelete(this.pages, page, this.edit);
  }

  admit(node: Descendant, path: Path, keyOf: KeyOf, page = -1): number {
    const kind = elementKind(node);
    const cell = takeCellAddress();
    const nodeKey = keyOf(node, path);
    const children =
      kind === TEXT_KIND
        ? NO_TREE
        : this.admitList(childrenOfNode(node) ?? [], cell, path, keyOf);
    const held = this.heldOf(node, kind);

    this.setCell(cell, { children, held, key: nodeKey, kind, page });
    if (nodeKey) this.setKey(nodeKey, cell);
    this.addMember(kind, cell);
    this.reorderOwnersOf(kind);
    this.holdAll(cell, held);
    return cell;
  }

  admitList(
    nodes: readonly Descendant[],
    owner: number,
    prefix: Path,
    keyOf: KeyOf
  ): number {
    const levels: number[][] = [];
    let width = Math.max(1, Math.ceil(nodes.length / WIDTH));

    while (true) {
      levels.push(Array.from({ length: width }, takePageAddress));
      if (width === 1) break;
      width = Math.ceil(width / WIDTH);
    }
    const counts = levels.map((pages) => pages.map(() => 0));
    const leafItems: number[][] = levels[0].map(() => []);

    nodes.forEach((node, index) => {
      const leaf = Math.floor(index / WIDTH);

      leafItems[leaf].push(
        this.admit(node, [...prefix, index], keyOf, levels[0][leaf])
      );
      counts[0][leaf] += 1;
    });
    levels.forEach((pages, level) => {
      const up = levels[level + 1];

      pages.forEach((address, at) => {
        const children =
          level === 0
            ? []
            : levels[level - 1].slice(at * WIDTH, (at + 1) * WIDTH);
        const childCounts =
          level === 0
            ? []
            : counts[level - 1].slice(at * WIDTH, (at + 1) * WIDTH);

        if (level > 0) {
          counts[level][at] = childCounts.reduce(
            (sum, count) => sum + count,
            0
          );
        }
        this.setPage(address, {
          counts: childCounts,
          items: level === 0 ? leafItems[at] : children,
          leaf: level === 0,
          owner,
          up: up ? up[Math.floor(at / WIDTH)] : NO_PARENT_PAGE,
        });
      });
    });

    return getDefined(levels.at(-1))[0];
  }

  stamp(cell: number, node: Descendant) {
    const row = this.cell(cell);
    const kind = elementKind(node);
    const held = this.heldOf(node, kind);
    let changed = false;

    this.reorderOwnersOf(row.kind);
    this.reorderOwnersOf(kind);

    for (let at = 0; at < this.uniqueProperties.length; at++) {
      const was = row.held?.[at] ?? null;
      const now = held?.[at] ?? null;

      if (was === now) continue;
      changed = true;
      if (was !== null) this.unhold(at, was, cell);
      if (now !== null) this.hold(at, now, cell);
    }
    if (row.kind === kind && !changed) return;
    if (row.kind !== kind) {
      this.removeMember(row.kind, cell);
      this.addMember(kind, cell);
    }
    this.setCell(cell, { ...row, held, kind });
  }

  reindex(
    uniqueProperties: readonly string[],
    contentRoots: ContentRootSlots,
    nodes: readonly Descendant[]
  ) {
    if (contentRoots.signature !== this.contentRoots.signature) {
      this.reordered = true;
    }
    this.uniqueProperties = uniqueProperties;
    this.contentRoots = contentRoots;
    this.holders = uniqueProperties.map(() => emptyUniqueHashMap<Holders>());
    const visit = (tree: number, list: readonly Descendant[]) => {
      this.cellsOf(tree).forEach((cell, at) => {
        const node = getDefined(list[at]);
        const row = this.cell(cell);
        const held = this.heldOf(node, row.kind);

        if (held || row.held) this.setCell(cell, { ...row, held });
        this.holdAll(cell, held);
        if (row.children !== NO_TREE) {
          visit(row.children, childrenOfNode(node) ?? []);
        }
      });
    };

    countCoreWork('wholeListPasses');
    if (this.top !== NO_TREE) visit(this.top, nodes);
  }

  rekey(cell: number, nodeKey: NodeKey) {
    const row = this.cell(cell);

    if (row.key === nodeKey) return;
    if (row.key) this.deleteKey(row.key);
    this.setCell(cell, { ...row, key: nodeKey });
    this.setKey(nodeKey, cell);
  }

  cellAt(path: Path): number | undefined {
    let tree = this.top;
    let cell: number | undefined;

    for (const index of path) {
      if (tree === NO_TREE) return undefined;
      cell = this.at(tree, index);
      if (cell === undefined) return undefined;
      tree = this.cell(cell).children;
    }

    return cell;
  }

  treeOf(cell: number) {
    return this.rootOf(this.cell(cell).children);
  }
}

const readTopology = (topology: Topology) => new TopologyBuilder(topology);

export const topologyKeyAt = (
  topology: Topology,
  path: Path
): NodeKey | null => {
  if (path.length === 0) return null;
  const reader = readTopology(topology);
  const cell = reader.cellAt(path);

  return cell === undefined ? null : reader.cell(cell).key;
};

export const topologyPathOf = (
  topology: Topology,
  nodeKey: NodeKey
): Path | null => {
  const reader = readTopology(topology);
  const cell = reader.cellOfKey(nodeKey);

  return cell === undefined ? null : reader.pathOfCell(cell);
};

export const topologyEntries = (topology: Topology) => {
  countCoreWork('wholeListPasses');
  const reader = readTopology(topology);
  const entries: Array<readonly [NodeKey, Path]> = [];
  const visit = (tree: number, prefix: readonly number[]) => {
    reader.cellsOf(tree).forEach((cell, index) => {
      const row = reader.cell(cell);
      const path = Object.freeze([...prefix, index]);

      if (row.key) entries.push(Object.freeze([row.key, path] as const));
      if (row.children !== NO_TREE) visit(row.children, path);
    });
  };

  visit(topology.top, []);
  return Object.freeze(entries);
};

export const topologyElements = (
  topology: Topology,
  types: readonly string[]
) => {
  const reader = readTopology(topology);
  const found: Array<{ path: Path; nodeKey: NodeKey; type: string }> = [];
  const requested = [...new Set(types)];

  for (const type of requested) {
    const bucket = dirGet(topology.elements, typeAddress(type));

    if (!bucket) continue;
    dirForEach(bucket, (_, cell) => {
      countCoreWork('identityMembersExamined');
      const row = reader.cell(cell);

      if (row.key) {
        found.push({ path: reader.pathOfCell(cell), nodeKey: row.key, type });
      }
    });
  }

  return found.sort((left, right) => {
    for (
      let index = 0;
      index < Math.min(left.path.length, right.path.length);
      index++
    ) {
      const difference = left.path[index] - right.path[index];

      if (difference !== 0) return difference;
    }
    return left.path.length - right.path.length;
  });
};

type OwnerList = Readonly<{
  cellOfPlace: readonly number[];
  places: readonly OwnerPlace[];
}>;

const OWNER_ORDERS = new WeakMap<OwnerOrderVersion, OwnerList>();
const OWNER_PLACES = new WeakMap<PlacementVersion, readonly OwnerPlace[]>();

type TopAt = (index: number) => Descendant;

const nodeAtPath = (topAt: TopAt, path: Path) => {
  let node = topAt(path[0]);

  for (let depth = 1; depth < path.length; depth++) {
    node = getDefined(childrenOfNode(node)?.[path[depth]]);
  }
  return node;
};

const orderOwners = (topology: Topology, topAt: TopAt): OwnerList => {
  const reader = readTopology(topology);
  const owners: Array<{
    cell: number;
    childRoots: unknown;
    path: Path;
    slots: readonly string[];
  }> = [];

  for (const [type, slots] of topology.contentRoots.byType) {
    const members = dirGet(topology.elements, typeAddress(type));

    if (!members) continue;
    dirForEach(members, (_, cell) => {
      countCoreWork('identityMembersExamined');
      countCoreWork('ownerPathsResolved');
      const path = reader.pathOfCell(cell);
      const { childRoots } = nodeAtPath(topAt, path);

      if (slots.some((slot) => rootNameAt(childRoots, slot))) {
        owners.push({ cell, childRoots, path, slots });
      }
    });
  }
  if (owners.length === 0) return { cellOfPlace: [], places: NO_ROOT_OWNERS };
  countCoreWork('ownerOrderBuilds');
  owners.sort(
    (left, right) =>
      PathApi.compare(left.path, right.path) ||
      left.path.length - right.path.length
  );
  const cellOfPlace: number[] = [];
  const places: OwnerPlace[] = [];

  for (const { cell, childRoots, path, slots } of owners) {
    for (const slot of slots) {
      const childRoot = rootNameAt(childRoots, slot);

      if (childRoot === null) continue;
      cellOfPlace.push(cell);
      places.push(Object.freeze({ childRoot, path, slot }));
    }
  }

  return { cellOfPlace, places: Object.freeze(places) };
};

const placeOwners = (topology: Topology, list: OwnerList): OwnerList => {
  const reader = readTopology(topology);
  let moved: OwnerPlace[] | null = null;
  let cell = -1;
  let path: Path = [];

  list.places.forEach((place, at) => {
    if (list.cellOfPlace[at] !== cell) {
      cell = list.cellOfPlace[at];
      countCoreWork('ownerPathsResolved');
      path = reader.pathOfCell(cell);
    }
    if (moved) moved.push(Object.freeze({ ...place, path }));
    else if (!PathApi.equals(path, place.path)) {
      moved = list.places.slice(0, at);
      moved.push(Object.freeze({ ...place, path }));
    }
  });

  return moved
    ? { cellOfPlace: list.cellOfPlace, places: Object.freeze(moved) }
    : list;
};

/** `topAt` reads the top-level nodes of the list `topology` indexes. */
export const topologyRootOwners = (
  topology: Topology,
  topAt: TopAt
): readonly OwnerPlace[] => {
  const placed = OWNER_PLACES.get(topology.placement);

  if (placed) return placed;
  const kept = OWNER_ORDERS.get(topology.ownerOrder);
  const list = kept
    ? placeOwners(topology, kept)
    : orderOwners(topology, topAt);

  OWNER_ORDERS.set(topology.ownerOrder, list);
  OWNER_PLACES.set(topology.placement, list.places);
  return list.places;
};

export const reorderRootOwners = (topology: Topology): Topology => {
  const builder = new TopologyBuilder(topology);

  builder.reorderOwners();
  return builder.finish();
};

export const topologyRetained = (topology: Topology) => {
  let memberships = 0;

  dirForEach(topology.elements, (bucket) => {
    memberships += bucket.size;
  });
  let directoryNodes =
    dirNodeCount(topology.keys) +
    dirNodeCount(topology.spareKeys) +
    dirNodeCount(topology.cells) +
    dirNodeCount(topology.pages) +
    dirNodeCount(topology.elements);

  dirForEach(topology.elements, (bucket) => {
    directoryNodes += dirNodeCount(bucket);
  });
  let depth = 0;

  dirForEach(topology.pages, (page) => {
    let levels = 1;
    let { up } = page;

    while (up !== NO_PARENT_PAGE) {
      levels += 1;
      ({ up } = getDefined(dirGet(topology.pages, up)));
    }
    depth = Math.max(depth, levels);
  });

  return {
    cells: topology.cells.size,
    depth,
    directoryNodes,
    keys: topology.keys.size + topology.spareKeys.size,
    memberships,
    pages: topology.pages.size,
  };
};

export const admitRoot = (
  children: Readonly<{
    forEach: (visit: (node: Descendant, index: number) => void) => void;
  }>,
  keyOf: KeyOf,
  uniqueProperties: readonly string[],
  contentRoots: ContentRootSlots
): Topology => {
  countCoreWork('wholeListPasses');
  const builder = new TopologyBuilder(null, uniqueProperties, contentRoots);
  const nodes: Descendant[] = [];

  children.forEach((child) => nodes.push(child));
  builder.top = builder.admitList(nodes, ROOT_LIST, [], keyOf);
  return builder.finish();
};

export const topologyUniqueHolders = (
  topology: Topology,
  property: string,
  value: unknown
) => {
  const at = topology.uniqueProperties.indexOf(property);
  const key = uniqueLookupKeyOf(value);
  const holders =
    at === -1 || key === null
      ? undefined
      : hashMapGet(topology.holders[at], key);
  const reader = readTopology(topology);
  const paths: Path[] = [];

  if (holders !== undefined) {
    forEachHolder(holders, (cell) => paths.push(reader.pathOfCell(cell)));
  }
  return paths;
};

export const topologyUniqueEntries = (topology: Topology) => {
  const reader = readTopology(topology);
  const entries: Array<
    Readonly<{ key: string; path: Path | null; property: string }>
  > = [];

  topology.holders.forEach((map, at) => {
    const property = topology.uniqueProperties[at];

    hashMapForEach(map, (key, holders) => {
      forEachHolder(holders, (cell) => {
        const path = dirGet(topology.cells, cell)
          ? reader.pathOfCell(cell)
          : null;

        entries.push({ key, path, property });
      });
    });
  });
  return entries;
};

/**
 * Calls `changed` for each value that one of two versions of a root's maps
 * holds and the other does not, with whether the later version holds it. It
 * reads only the parts of the maps the versions do not share.
 */
export const topologyUniqueDiff = (
  before: Topology | null,
  after: Topology | null,
  changed: (at: number, key: string, held: boolean) => void
) => {
  const empty = emptyUniqueHashMap<Holders>();

  (after ?? before)?.uniqueProperties.forEach((_, at) => {
    hashMapDiff(
      before?.holders[at] ?? empty,
      after?.holders[at] ?? empty,
      (key, was, now) => {
        if ((was === undefined) !== (now === undefined)) {
          changed(at, key, now !== undefined);
        }
      }
    );
  });
};

export const topologyChangedHolders = (
  before: Topology | null,
  after: Topology,
  held: (property: string, path: Path) => void
) => {
  const reader = readTopology(after);

  after.uniqueProperties.forEach((property, at) => {
    hashMapDiff(
      before?.holders[at] ?? emptyUniqueHashMap<Holders>(),
      after.holders[at],
      (_, __, now) => {
        if (now === undefined) return;
        let cell: number | undefined;

        forEachHolder(now, (holder) => {
          cell ??= holder;
        });
        held(property, reader.pathOfCell(getDefined(cell)));
      }
    );
  });
};
