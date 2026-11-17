import type {
  Editor,
  EditorRootEntry,
  EditorRootOwner,
  NamedRootKey,
  RootKey,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { PathApi } from '../interfaces/path';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { type NodeList, rootNodesOf } from './change/document-index';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { getCompiledEditorSchema } from './plugin-registry';
import {
  getEditorDocumentRoots,
  getEditorRuntimeElementEntries,
  getReadProjection,
} from './public-state';
import { countCoreWork } from './work';

type EditorSchema = ReturnType<typeof getEditorSchema>;
type CompiledSchema = ReturnType<typeof getCompiledEditorSchema>;

type OwnerPlace = Readonly<{
  childRoot: NamedRootKey;
  path: Path;
  slot: string;
}>;

type RootList = Readonly<{
  entries: readonly EditorRootEntry[];
  places: ReadonlyMap<RootKey, readonly OwnerPlace[]>;
  roots: object;
  schema: CompiledSchema;
}>;

const NO_PLACES: readonly OwnerPlace[] = Object.freeze([]);
const OWNER_TYPES = new WeakMap<CompiledSchema, readonly string[]>();
const ROOT_PLACES = new WeakMap<
  NodeList<Descendant>,
  Readonly<{ places: readonly OwnerPlace[]; schema: CompiledSchema }>
>();
const ROOT_LISTS = new WeakMap<Editor, RootList>();
const PROJECTED_ROOT_LISTS = new WeakMap<Editor, RootList>();

const ownerTypesOf = (schema: EditorSchema, compiled: CompiledSchema) => {
  let types = OWNER_TYPES.get(compiled);

  if (!types) {
    types = Object.freeze(
      schema
        .getVocabulary()
        .elementTypes.filter(
          (type) =>
            Object.keys(schema.element(type)?.contentRoots ?? {}).length > 0
        )
    );
    OWNER_TYPES.set(compiled, types);
  }

  return types;
};

const nodeAt = (nodes: NodeList<Descendant>, path: Path) => {
  let node = nodes.at(path[0]);

  for (let depth = 1; node && depth < path.length; depth += 1) {
    node = ElementApi.isElement(node) ? node.children[path[depth]] : undefined;
  }

  return node;
};

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

const readOwnerPlaces = (
  owner: Editor,
  schema: EditorSchema,
  compiled: CompiledSchema,
  root: RootKey,
  nodes: NodeList<Descendant>,
  previous: readonly OwnerPlace[] | undefined
): readonly OwnerPlace[] => {
  const known = ROOT_PLACES.get(nodes);

  if (known?.schema === compiled) return known.places;
  countCoreWork('rootOwnerReads');
  const found: OwnerPlace[] = [];

  for (const { path } of getEditorRuntimeElementEntries(
    owner,
    ownerTypesOf(schema, compiled),
    root
  )) {
    const node = nodeAt(nodes, path);

    if (!ElementApi.isElement(node)) continue;
    for (const [slot, childRoot] of Object.entries(
      schema.getElementContentRoots(node)
    )) {
      found.push(Object.freeze({ childRoot, path, slot }));
    }
  }
  const places =
    previous && samePlaces(previous, found)
      ? previous
      : found.length === 0
        ? NO_PLACES
        : Object.freeze(found);

  ROOT_PLACES.set(nodes, { places, schema: compiled });

  return places;
};

const orderRoots = (
  places: ReadonlyMap<RootKey, readonly OwnerPlace[]>
): readonly EditorRootEntry[] => {
  countCoreWork('orderedRoots', places.size);
  const owners = new Map<RootKey, EditorRootOwner[]>();
  const tops = new Map<RootKey, Path | null>();
  const visit = (root: RootKey, top: Path | null) => {
    for (const place of places.get(root) ?? NO_PLACES) {
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
  const schema = getEditorSchema(owner);
  const compiled = getCompiledEditorSchema(owner);
  const roots = getEditorDocumentRoots(owner);
  const lists = getReadProjection(owner) ? PROJECTED_ROOT_LISTS : ROOT_LISTS;
  const cached = lists.get(owner);

  if (cached?.roots === roots && cached.schema === compiled) {
    return cached.entries;
  }
  const previous = cached?.schema === compiled ? cached.places : undefined;
  const places = new Map<RootKey, readonly OwnerPlace[]>();
  let moved = previous?.size !== Object.keys(roots).length;

  for (const root of Object.keys(roots)) {
    const before = previous?.get(root);
    const rootPlaces = readOwnerPlaces(
      owner,
      schema,
      compiled,
      root,
      rootNodesOf(roots, root),
      before
    );

    places.set(root, rootPlaces);
    moved ||= rootPlaces !== before;
  }
  const entries = cached && !moved ? cached.entries : orderRoots(places);

  lists.set(owner, { entries, places, roots, schema: compiled });

  return entries;
};
