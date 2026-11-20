import { canonicalJsonKey } from './change/transform';
import {
  persistentMapChanges,
  persistentMapDelete,
  persistentMapEntries,
  type PersistentMapNode,
  persistentMapSet,
} from './persistent-map';
import { isEditorJsonValue } from './value-codec';
import { countCoreWork } from './work';

const KEY_ESCAPE = '\u0001';

export const uniqueKeyOf = (value: unknown): string | null => {
  if (value === undefined) return null;
  if (typeof value !== 'string') return KEY_ESCAPE + canonicalJsonKey(value);

  return value.startsWith(KEY_ESCAPE) ? KEY_ESCAPE + value : value;
};

export const uniqueLookupKeyOf = (value: unknown): string | null =>
  isEditorJsonValue(value) ? uniqueKeyOf(value) : null;

const BITS = 5;
const LAST_SHIFT = 30;

type HashNode = { bitmap: number; edit: object; slots: unknown[] };
type CollisionTree = PersistentMapNode<unknown>;
type Visit = (key: string, value: unknown) => void;
type Changed = (key: string, was: unknown, now: unknown) => void;

type DefinedValue = NonNullable<unknown> | null;

declare const hashMapValue: unique symbol;

export type UniqueHashMap<V extends DefinedValue> = Readonly<{
  root: HashNode | null;
  [hashMapValue]?: V;
}>;

const EMPTY: UniqueHashMap<never> = Object.freeze({ root: null });
const BLANK: HashNode = { bitmap: 0, edit: {}, slots: [] };

export const emptyUniqueHashMap = <V extends DefinedValue>() =>
  EMPTY as UniqueHashMap<V>;

const hashOf = (key: string) => {
  let hash = 0x81_1c_9d_c5;

  for (let at = 0; at < key.length; at++) {
    hash = Math.imul(hash ^ key.charCodeAt(at), 0x01_00_01_93);
  }

  return hash >>> 0;
};

const popcount = (bits: number) => {
  let count = bits - ((bits >>> 1) & 0x55_55_55_55);

  count = (count & 0x33_33_33_33) + ((count >>> 2) & 0x33_33_33_33);
  count = (count + (count >>> 4)) & 0x0f_0f_0f_0f;
  return Math.imul(count, 0x01_01_01_01) >>> 24;
};

const bitAt = (hash: number, shift: number) => 1 << ((hash >>> shift) & 31);

const slotAt = (node: HashNode, bit: number) =>
  2 * popcount(node.bitmap & (bit - 1));

const owned = (node: HashNode, edit: object): HashNode => {
  if (node.edit === edit) return node;
  countCoreWork('uniqueMapNodesAllocated');

  return { bitmap: node.bitmap, edit, slots: [...node.slots] };
};

const bucketGet = (bucket: CollisionTree, key: string): unknown => {
  let node: CollisionTree | null = bucket;

  while (node) {
    countCoreWork('uniqueMapSlotsInspected');
    if (key === node.key) return node.value;
    node = key < node.key ? node.left : node.right;
  }

  return undefined;
};

const bucketSet = (
  bucket: CollisionTree,
  key: string,
  value: unknown
): CollisionTree => {
  countCoreWork('uniqueMapNodesVisited');
  if (Object.is(bucketGet(bucket, key), value)) return bucket;

  return persistentMapSet(bucket, key, value);
};

const getIn = (
  from: unknown,
  fromShift: number,
  hash: number,
  key: string
): unknown => {
  let subtree = from;

  for (let shift = fromShift; shift <= LAST_SHIFT; shift += BITS) {
    const node = subtree as HashNode;
    const bit = bitAt(hash, shift);

    countCoreWork('uniqueMapNodesVisited');
    if ((node.bitmap & bit) === 0) return undefined;
    const at = slotAt(node, bit);
    const slotKey = node.slots[at];

    countCoreWork('uniqueMapSlotsInspected');
    if (slotKey !== undefined) {
      return slotKey === key ? node.slots[at + 1] : undefined;
    }
    subtree = node.slots[at + 1];
  }
  countCoreWork('uniqueMapNodesVisited');

  return bucketGet(subtree as CollisionTree, key);
};

export const hashMapGet = <V extends DefinedValue>(
  map: UniqueHashMap<V>,
  key: string
) => getIn(map.root ?? BLANK, 0, hashOf(key), key) as V | undefined;

const setIn = (
  node: HashNode,
  shift: number,
  hash: number,
  key: string,
  value: unknown,
  edit: object
): HashNode => {
  countCoreWork('uniqueMapNodesVisited');
  const bit = bitAt(hash, shift);
  const at = slotAt(node, bit);

  if ((node.bitmap & bit) === 0) {
    const next = owned(node, edit);

    next.slots.splice(at, 0, key, value);
    next.bitmap |= bit;
    return next;
  }
  const slotKey = node.slots[at] as string | undefined;
  const held = node.slots[at + 1];
  const below = shift + BITS;
  let now = value;

  countCoreWork('uniqueMapSlotsInspected');
  if (below > LAST_SHIFT) {
    if (slotKey === undefined) {
      now = bucketSet(held as CollisionTree, key, value);
    } else if (slotKey !== key) {
      now = bucketSet(persistentMapSet(null, slotKey, held), key, value);
    }
  } else if (slotKey === undefined) {
    now = setIn(held as HashNode, below, hash, key, value, edit);
  } else if (slotKey !== key) {
    const pushed = setIn(BLANK, below, hashOf(slotKey), slotKey, held, edit);

    now = setIn(pushed, below, hash, key, value, edit);
  }
  if (Object.is(now, held)) return node;
  const next = owned(node, edit);

  if (slotKey !== key) next.slots[at] = undefined;
  next.slots[at + 1] = now;
  return next;
};

export const hashMapSet = <V extends DefinedValue>(
  map: UniqueHashMap<V>,
  key: string,
  value: V,
  edit: object
): UniqueHashMap<V> => {
  const root = setIn(map.root ?? BLANK, 0, hashOf(key), key, value, edit);

  return root === map.root ? map : { root };
};

const deleteIn = (
  node: HashNode,
  shift: number,
  hash: number,
  key: string,
  edit: object
): HashNode | null => {
  countCoreWork('uniqueMapNodesVisited');
  const bit = bitAt(hash, shift);

  if ((node.bitmap & bit) === 0) return node;
  const at = slotAt(node, bit);
  const slotKey = node.slots[at];
  const held = node.slots[at + 1];

  countCoreWork('uniqueMapSlotsInspected');
  if (slotKey === undefined && shift === LAST_SHIFT) {
    countCoreWork('uniqueMapNodesVisited');
    if (bucketGet(held as CollisionTree, key) === undefined) return node;
    const rest = persistentMapDelete(
      held as CollisionTree,
      key
    ) as CollisionTree;
    const next = owned(node, edit);
    const folds = rest.size === 1;

    next.slots[at] = folds ? rest.key : undefined;
    next.slots[at + 1] = folds ? rest.value : rest;
    return next;
  }
  if (slotKey === undefined) {
    const kept = deleteIn(held as HashNode, shift + BITS, hash, key, edit);

    if (kept) {
      const folds = kept.slots.length === 2 && kept.slots[0] !== undefined;

      if (kept === held && !folds) return node;
      const next = owned(node, edit);

      if (folds) [next.slots[at], next.slots[at + 1]] = kept.slots;
      else next.slots[at + 1] = kept;
      return next;
    }
  } else if (slotKey !== key) {
    return node;
  }
  if (node.slots.length === 2) return null;
  const next = owned(node, edit);

  next.slots.splice(at, 2);
  next.bitmap &= ~bit;
  return next;
};

export const hashMapDelete = <V extends DefinedValue>(
  map: UniqueHashMap<V>,
  key: string,
  edit: object
): UniqueHashMap<V> => {
  const root = map.root && deleteIn(map.root, 0, hashOf(key), key, edit);

  if (root === map.root) return map;
  return root ? { root } : emptyUniqueHashMap();
};

const forEachIn = (subtree: unknown, shift: number, visit: Visit) => {
  countCoreWork('uniqueMapNodesVisited');
  if (shift > LAST_SHIFT) {
    for (const [key, value] of persistentMapEntries(subtree as CollisionTree)) {
      countCoreWork('uniqueMapSlotsInspected');
      visit(key, value);
    }
    return;
  }
  const { slots } = subtree as HashNode;

  countCoreWork('uniqueMapSlotsInspected', slots.length / 2);
  for (let at = 0; at < slots.length; at += 2) {
    const slotKey = slots[at] as string | undefined;

    if (slotKey === undefined) forEachIn(slots[at + 1], shift + BITS, visit);
    else visit(slotKey, slots[at + 1]);
  }
};

export const hashMapForEach = <V extends DefinedValue>(
  map: UniqueHashMap<V>,
  visit: (key: string, value: V) => void
) => {
  if (map.root) forEachIn(map.root, 0, visit as Visit);
};

type Side = readonly [key: string | undefined, held: unknown] | null;

const sideAt = (node: HashNode, bit: number): Side => {
  if ((node.bitmap & bit) === 0) return null;
  const at = slotAt(node, bit);

  return [node.slots[at] as string | undefined, node.slots[at + 1]];
};

const forEachOn = (side: Side, shift: number, visit: Visit) => {
  if (!side) return;
  if (side[0] === undefined) forEachIn(side[1], shift, visit);
  else visit(side[0], side[1]);
};

const findOn = (side: Side, shift: number, key: string) => {
  if (!side) return undefined;
  if (side[0] === undefined) return getIn(side[1], shift, hashOf(key), key);

  return side[0] === key ? side[1] : undefined;
};

const diffEntriesBelow = (
  left: Side,
  right: Side,
  shift: number,
  changed: Changed
) => {
  forEachOn(left, shift, (key, was) => {
    countCoreWork('uniqueMapEntriesExamined');
    const now = findOn(right, shift, key);

    if (!Object.is(now, was)) changed(key, was, now);
  });
  forEachOn(right, shift, (key, now) => {
    countCoreWork('uniqueMapEntriesExamined');
    if (findOn(left, shift, key) === undefined) changed(key, undefined, now);
  });
};

const diffBuckets = (
  from: CollisionTree,
  to: CollisionTree,
  changed: Changed
) => {
  let paired = 0;
  let equal = 0;
  const keys = persistentMapChanges(from, to, (was, now) => {
    paired += 1;
    if (!Object.is(was, now)) return false;
    equal += 1;
    return true;
  });

  const entriesRead = keys.length + paired + equal;

  countCoreWork('uniqueMapEntriesExamined', entriesRead);
  for (const key of keys) {
    changed(key, bucketGet(from, key), bucketGet(to, key));
  }
};

export const hashMapDiff = <V extends DefinedValue>(
  before: UniqueHashMap<V>,
  after: UniqueHashMap<V>,
  visit: (key: string, was: V | undefined, now: V | undefined) => void
) => {
  const changed = visit as Changed;
  const diff = (left: Side, right: Side, shift: number) => {
    if (!left || !right || left[0] !== undefined || right[0] !== undefined) {
      diffEntriesBelow(left, right, shift, changed);
      return;
    }
    countCoreWork('uniqueMapNodesVisited', 2);
    if (shift > LAST_SHIFT) {
      diffBuckets(left[1] as CollisionTree, right[1] as CollisionTree, changed);
      return;
    }
    const from = left[1] as HashNode;
    const to = right[1] as HashNode;

    for (let rest = from.bitmap | to.bitmap; rest !== 0; rest &= rest - 1) {
      const bit = rest & -rest;
      const fromAt = slotAt(from, bit);
      const toAt = slotAt(to, bit);

      countCoreWork('uniqueMapSlotsInspected');
      if (
        (from.bitmap & to.bitmap & bit) === 0 ||
        from.slots[fromAt] !== to.slots[toAt] ||
        !Object.is(from.slots[fromAt + 1], to.slots[toAt + 1])
      ) {
        diff(sideAt(from, bit), sideAt(to, bit), shift + BITS);
      }
    }
  };

  const from = before.root ?? BLANK;
  const to = after.root ?? BLANK;

  if (from !== to) diff([undefined, from], [undefined, to], 0);
};
