import type {
  Editor,
  EditorRootEntry,
  EditorRootOwner,
  RootKey,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { rootNodesOf } from './change/document-index';
import { getEditorRuntimeOwner } from './editor-runtime';
import { NO_ROOT_OWNERS, type OwnerPlace } from './identity-owner';
import { getCompiledEditorSchema } from './plugin-registry';
import {
  getEditorDocumentRoots,
  getEditorRootOwnerPlaces,
  getReadProjection,
} from './public-state';
import { countCoreWork } from './work';

type CompiledSchema = ReturnType<typeof getCompiledEditorSchema>;

type RootList = Readonly<{
  entries: readonly EditorRootEntry[];
  places: ReadonlyMap<RootKey, readonly OwnerPlace[]>;
  roots: Readonly<Record<string, readonly Descendant[]>>;
  schema: CompiledSchema;
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

/** @internal */
export const readRootEntries = (
  editor: Parameters<typeof getEditorRuntimeOwner>[0]
): readonly EditorRootEntry[] => {
  const owner = getEditorRuntimeOwner(editor);
  const compiled = getCompiledEditorSchema(owner);
  const roots = getEditorDocumentRoots(owner);
  const lists = getReadProjection(owner) ? PROJECTED_ROOT_LISTS : ROOT_LISTS;
  const cached = lists.get(owner);

  if (cached?.roots === roots && cached.schema === compiled) {
    return cached.entries;
  }
  const kept = cached?.schema === compiled ? cached : undefined;
  const keys = Object.keys(roots);
  let asked: Map<RootKey, readonly OwnerPlace[]> | null = null;
  let moved = kept?.places.size !== keys.length;

  for (const root of keys) {
    if (kept && rootNodesOf(roots, root) === rootNodesOf(kept.roots, root)) {
      continue;
    }
    const before = kept?.places.get(root);

    countCoreWork('ownerPlaceAsks');
    const now = getEditorRootOwnerPlaces(owner, root);

    if (now === before) continue;
    asked ??= new Map();
    asked.set(root, now);
    moved ||= !before || !samePlaces(before, now);
  }
  if (kept && !asked && !moved) {
    lists.set(owner, { ...kept, roots });
    return kept.entries;
  }
  const places = new Map(
    keys.map((root) => [
      root,
      asked?.get(root) ?? getDefined(kept?.places.get(root)),
    ])
  );
  const entries = kept && !moved ? kept.entries : orderRoots(places);

  lists.set(owner, { entries, places, roots, schema: compiled });

  return entries;
};
