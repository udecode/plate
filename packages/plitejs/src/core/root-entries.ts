import type {
  Editor,
  EditorRootEntry,
  EditorRootOwner,
  NamedRootKey,
  RootKey,
  SnapshotIndex,
} from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { type NodeList, rootNodesOf } from './change/document-index';
import { getEditorRuntimeOwner } from './editor-runtime';
import { NO_ROOT_OWNERS, type OwnerPlace } from './identity-owner';
import { getCompiledEditorSchema } from './plugin-registry';
import {
  getEditorDocumentRoots,
  getEditorRootOwnerPlaces,
  getReadProjection,
} from './public-state';
import { contentRootSlotsOf } from './schema-compiler';
import { readRootOwnerPlaces, uniqueTopologyOf } from './snapshot-index';
import { countCoreWork } from './work';

type CompiledSchema = ReturnType<typeof getCompiledEditorSchema>;

type RootList = Readonly<{
  entries: readonly EditorRootEntry[];
  nodes: (root: RootKey) => NodeList<unknown>;
  places: ReadonlyMap<RootKey, readonly OwnerPlace[]>;
  schema: CompiledSchema;
  source: object;
}>;

type RootVersion = Omit<RootList, 'entries' | 'places'> &
  Readonly<{
    places: (root: RootKey) => readonly OwnerPlace[];
    roots: () => readonly RootKey[];
  }>;

const ROOT_LISTS = new WeakMap<Editor, RootList>();
const PROJECTED_ROOT_LISTS = new WeakMap<Editor, RootList>();

const samePlaces = (
  left: readonly OwnerPlace[],
  right: readonly OwnerPlace[]
) =>
  left.length === right.length &&
  left.every(
    (place, index) =>
      place.childRoot === right[index].childRoot &&
      place.slot === right[index].slot &&
      PathApi.equals(place.path, right[index].path)
  );

const orderRoots = (
  places: ReadonlyMap<RootKey, readonly OwnerPlace[]>
): readonly EditorRootEntry[] => {
  countCoreWork('orderedRoots', places.size);
  const owners = new Map<RootKey, EditorRootOwner[]>();
  const tops = new Map<RootKey, Path | null>();
  const visit = (root: RootKey, top: Path | null) => {
    for (const place of places.get(root) ?? NO_ROOT_OWNERS) {
      if (!places.has(place.childRoot)) continue;
      const owner = Object.freeze(
        root === MAIN_ROOT_KEY
          ? { path: place.path, slot: place.slot }
          : { path: place.path, root, slot: place.slot }
      );
      const known = owners.get(place.childRoot);

      if (known) {
        known.push(owner);
        continue;
      }
      const childTop = root === MAIN_ROOT_KEY ? place.path : top;

      owners.set(place.childRoot, [owner]);
      tops.set(place.childRoot, childTop);
      visit(place.childRoot, childTop);
    }
  };

  const start = (root: RootKey) => {
    if (root === MAIN_ROOT_KEY || owners.has(root)) return;
    owners.set(root, []);
    tops.set(root, null);
    visit(root, null);
  };

  visit(MAIN_ROOT_KEY, null);
  const keys = [...places.keys()].sort();
  const owned = new Set(
    [...places.values()].flat().map(({ childRoot }) => childRoot)
  );

  for (const root of keys) {
    if (!owned.has(root)) start(root);
  }
  for (const root of keys) start(root);

  return Object.freeze(
    [...owners].map(([root, rootOwners]) =>
      Object.freeze({
        owners: Object.freeze(rootOwners),
        root,
        top: tops.get(root) ?? null,
      })
    )
  );
};

const rootListOf = (
  { nodes, places: placesOf, roots, schema, source }: RootVersion,
  previous: RootList | undefined
): RootList => {
  const kept = previous?.schema === schema ? previous : undefined;
  const keys = roots();
  let asked: Map<RootKey, readonly OwnerPlace[]> | null = null;
  let moved = kept?.places.size !== keys.length;

  for (const root of keys) {
    if (kept && nodes(root) === kept.nodes(root)) continue;
    const before = kept?.places.get(root);

    countCoreWork('ownerPlaceAsks');
    const now = placesOf(root);

    if (now === before) continue;
    asked ??= new Map();
    asked.set(root, now);
    moved ||= !before || !samePlaces(before, now);
  }
  if (kept && !asked && !moved) return { ...kept, nodes, source };
  const places = new Map(
    keys.map((root) => [
      root,
      asked?.get(root) ?? getDefined(kept?.places.get(root)),
    ])
  );
  const entries = kept && !moved ? kept.entries : orderRoots(places);

  return { entries, nodes, places, schema, source };
};

/** @internal */
export const readRootEntries = (
  editor: Parameters<typeof getEditorRuntimeOwner>[0]
): readonly EditorRootEntry[] => {
  const owner = getEditorRuntimeOwner(editor);
  const roots = getEditorDocumentRoots(owner);
  const schema = getCompiledEditorSchema(owner);
  const lists = getReadProjection(owner) ? PROJECTED_ROOT_LISTS : ROOT_LISTS;
  const cached = lists.get(owner);

  if (cached?.source === roots && cached.schema === schema) {
    return cached.entries;
  }
  const list = rootListOf(
    {
      nodes: (root) => rootNodesOf(roots, root),
      places: (root) => getEditorRootOwnerPlaces(owner, root),
      roots: () => Object.keys(roots),
      schema,
      source: roots,
    },
    cached
  );

  lists.set(owner, list);

  return list.entries;
};

export type RootPlacementSide = Omit<RootVersion, 'places'> &
  Readonly<{ index: (root: RootKey) => SnapshotIndex | null }>;

const NO_ROOTS: readonly NamedRootKey[] = Object.freeze([]);

/** @internal */
export const readRootPlacementChanges = (
  owner: Editor,
  before: RootPlacementSide,
  after: RootPlacementSide
): readonly NamedRootKey[] => {
  const sameSlots =
    contentRootSlotsOf(before.schema).signature ===
    contentRootSlotsOf(after.schema).signature;

  if (sameSlots && before.source === after.source) return NO_ROOTS;
  const kept = new Map<RootKey, boolean>();
  const untouched = (root: RootKey) => {
    let same = kept.get(root);

    if (same === undefined) {
      countCoreWork('rootListCompares');
      same = sameSlots && before.nodes(root) === after.nodes(root);
      kept.set(root, same);
    }

    return same;
  };
  const sideOf = (
    { nodes, schema }: RootPlacementSide,
    index: RootPlacementSide['index']
  ) => ({
    keyAt: (root: RootKey, path: Path) => index(root)?.keyAt(path) ?? null,
    order: (root: RootKey) => {
      const at = index(root);

      return at
        ? (uniqueTopologyOf(owner, at, nodes(root), schema)?.ownerOrder ?? null)
        : null;
    },
    places: (root: RootKey) => {
      const at = index(root);

      return at
        ? readRootOwnerPlaces(owner, at, nodes(root), schema)
        : NO_ROOT_OWNERS;
    },
  });
  const now = sideOf(after, after.index);
  const was = sideOf(before, (root) =>
    untouched(root) ? after.index(root) : before.index(root)
  );
  const keptOrder = (root: RootKey) => {
    const order = was.order(root);

    return order !== null && order === now.order(root);
  };
  const sameNode = (root: RootKey, left: Path, right: Path) =>
    untouched(root)
      ? PathApi.equals(left, right)
      : was.keyAt(root, left) === now.keyAt(root, right);
  const sameBlock = (left: Path, right: Path) =>
    sameNode(MAIN_ROOT_KEY, left.slice(0, 1), right.slice(0, 1));
  const samePlace = (root: RootKey, left: OwnerPlace, right: OwnerPlace) => {
    countCoreWork('rootPlacementChecks');

    return (
      left.childRoot === right.childRoot &&
      left.slot === right.slot &&
      sameNode(root, left.path, right.path) &&
      (root !== MAIN_ROOT_KEY ||
        (left.path.length === 1 && right.path.length === 1) ||
        sameBlock(left.path, right.path))
    );
  };
  const moved =
    !sameSlots ||
    [...new Set([...before.roots(), ...after.roots()])].some((root) => {
      if (untouched(root) || keptOrder(root)) return false;
      const left = was.places(root);
      const right = now.places(root);

      return (
        left.length !== right.length ||
        left.some((place, at) => !samePlace(root, place, right[at]))
      );
    });

  if (!moved) return NO_ROOTS;
  const beforeList = rootListOf({ ...before, places: was.places }, undefined);
  const afterList = rootListOf({ ...after, places: now.places }, beforeList);
  const [beforeEntries, afterEntries] = [beforeList, afterList].map(
    (list) => new Map(list.entries.map((entry) => [entry.root, entry]))
  );
  const samePlacement = (root: NamedRootKey) => {
    countCoreWork('rootPlacementChecks');
    const left = beforeEntries.get(root);
    const right = afterEntries.get(root);

    if (!left || !right) return false;
    return (
      left.owners.length === right.owners.length &&
      left.owners.every(
        (ownerBefore, at) =>
          ownerBefore.slot === right.owners[at].slot &&
          ownerBefore.root === right.owners[at].root &&
          sameNode(
            ownerBefore.root ?? MAIN_ROOT_KEY,
            ownerBefore.path,
            right.owners[at].path
          )
      ) &&
      (left.top === null || right.top === null
        ? left.top === right.top
        : sameBlock(left.top, right.top))
    );
  };

  return Object.freeze(
    [...new Set([...afterEntries.keys(), ...beforeEntries.keys()])].filter(
      (root) => !samePlacement(root)
    )
  );
};
