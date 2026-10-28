import type {
  EditorDocumentValue,
  NodeKey,
  SnapshotIndex,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  valueRootIndex,
} from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { RootChange, type RootChangeSection } from './change/root-change';
import { isElementNode, type JsonNode } from './change/tokens';
import { canonicalJsonKey } from './change/transform';
import { generateElementPropertyValue } from './editor-schema';
import {
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  uniquePropertiesOf,
} from './schema-compiler';
import { countCoreWork } from './work';

const DRAWS = 8;

const MAIN = 'main';

type Place = Readonly<{ path: readonly number[]; root: string }>;

type RootPlace = Readonly<{ children: unknown; path: readonly number[] }>;

/**
 * Each unique value the stored document holds, by property key and canonical
 * value, with the node keys of the elements that store it, as of one
 * published version.
 */
export type UniqueIndex = {
  readonly holders: Map<string, Map<string, Map<NodeKey, string>>>;
  readonly of: Map<NodeKey, Map<string, string>>;
  readonly schema: CompiledEditorSchema;
  version: number;
};

export const documentRootsOf = (document: EditorDocumentValue) => [
  MAIN,
  ...Object.keys(document.roots ?? {})
    .filter((root) => root !== MAIN)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)),
];

const rootChildrenOf = (document: EditorDocumentValue, root: string) =>
  (root === MAIN
    ? document.children
    : (document.roots?.[root] ?? [])) as readonly JsonNode[];

const comparePlaces = (order: readonly string[], left: Place, right: Place) => {
  const byRoot = order.indexOf(left.root) - order.indexOf(right.root);

  if (byRoot !== 0) return byRoot;
  for (
    let depth = 0;
    depth < Math.min(left.path.length, right.path.length);
    depth += 1
  ) {
    const byIndex =
      getDefined(left.path[depth]) - getDefined(right.path[depth]);

    if (byIndex !== 0) return byIndex;
  }

  return left.path.length - right.path.length;
};

const visitElements = (
  nodes: readonly JsonNode[],
  visit: (node: JsonNode, path: readonly number[]) => void,
  prefix: readonly number[] = []
) => {
  nodes.forEach((node, index) => {
    if (!isElementNode(node)) return;
    const path = [...prefix, index];

    visit(node, path);
    visitElements(node.children, visit, path);
  });
};

const uniqueValuesOf = (
  properties: ReadonlyMap<string, CompiledSchemaProperty>,
  node: JsonNode
) => {
  const values: Array<readonly [string, string]> = [];

  for (const key of properties.keys()) {
    if (node[key] !== undefined) {
      values.push([key, canonicalJsonKey(node[key])]);
    }
  }

  return values;
};

const addHolder = (
  index: UniqueIndex,
  nodeKey: NodeKey,
  root: string,
  key: string,
  value: string
) => {
  let byValue = index.holders.get(key);

  if (!byValue) {
    byValue = new Map();
    index.holders.set(key, byValue);
  }
  let holders = byValue.get(value);

  if (!holders) {
    holders = new Map();
    byValue.set(value, holders);
  }
  holders.set(nodeKey, root);

  let own = index.of.get(nodeKey);

  if (!own) {
    own = new Map();
    index.of.set(nodeKey, own);
  }
  own.set(key, value);
};

const dropHolder = (index: UniqueIndex, nodeKey: NodeKey) => {
  const own = index.of.get(nodeKey);

  if (!own) return;
  for (const [key, value] of own) {
    const byValue = index.holders.get(key);
    const holders = byValue?.get(value);

    holders?.delete(nodeKey);
    if (holders?.size === 0) byValue?.delete(value);
  }
  index.of.delete(nodeKey);
};

export const buildUniqueIndex = (
  schema: CompiledEditorSchema,
  document: EditorDocumentValue,
  version: number,
  keysOf: (root: string) => SnapshotIndex
): UniqueIndex => {
  const properties = uniquePropertiesOf(schema);
  const index: UniqueIndex = {
    holders: new Map(),
    of: new Map(),
    schema,
    version,
  };

  for (const root of documentRootsOf(document)) {
    let keys: SnapshotIndex | null = null;

    visitElements(rootChildrenOf(document, root), (node, path) => {
      countCoreWork('uniqueIndexedNodes');
      const values = uniqueValuesOf(properties, node);

      if (values.length === 0) return;
      keys ??= keysOf(root);
      const nodeKey = keys.keyAt([...path]);

      if (!nodeKey) return;
      for (const [key, value] of values) {
        addHolder(index, nodeKey, root, key, value);
      }
    });
  }

  return index;
};

export const sameUniqueIndex = (left: UniqueIndex, right: UniqueIndex) => {
  const entriesOf = (index: UniqueIndex) =>
    [...index.holders]
      .flatMap(([key, byValue]) =>
        [...byValue].flatMap(([value, holders]) =>
          [...holders].map(([nodeKey, root]) =>
            JSON.stringify([key, value, nodeKey, root])
          )
        )
      )
      .sort();

  return JSON.stringify(entriesOf(left)) === JSON.stringify(entriesOf(right));
};

export const advanceUniqueIndex = (
  index: UniqueIndex,
  changed: ReadonlyMap<string, ReadonlySet<NodeKey>>,
  placeOf: (root: string, nodeKey: NodeKey) => RootPlace | null,
  version: number,
  deletedRoots: readonly string[]
) => {
  const properties = uniquePropertiesOf(index.schema);

  if (deletedRoots.length > 0) {
    for (const byValue of index.holders.values()) {
      for (const holders of byValue.values()) {
        for (const [nodeKey, root] of holders) {
          if (deletedRoots.includes(root)) dropHolder(index, nodeKey);
        }
      }
    }
  }
  const landed = new Map<NodeKey, readonly [string, RootPlace] | null>();

  for (const [root, keys] of changed) {
    for (const nodeKey of keys) {
      countCoreWork('uniqueHolderReads');
      const place = placeOf(root, nodeKey);

      if (place) landed.set(nodeKey, [root, place]);
      else if (!landed.has(nodeKey)) landed.set(nodeKey, null);
    }
  }
  for (const [nodeKey, landing] of landed) {
    dropHolder(index, nodeKey);
    if (!landing) continue;

    const [root, place] = landing;
    let node: JsonNode | undefined;

    for (const at of place.path) {
      node = (
        (node ? node.children : place.children) as
          | readonly JsonNode[]
          | undefined
      )?.[at];
    }
    if (!node || !isElementNode(node)) continue;
    for (const [key, value] of uniqueValuesOf(properties, node)) {
      addHolder(index, nodeKey, root, key, value);
    }
  }
  index.version = version;
};

type Holder = Place & Readonly<{ from: number }>;

type FreshDraw = (
  key: string,
  property: CompiledSchemaProperty,
  taken: (value: string) => boolean
) => unknown;

const drawFresh: FreshDraw = (key, property, taken) => {
  for (let draw = 0; draw < DRAWS; draw += 1) {
    const value = generateElementPropertyValue(property);

    if (value !== undefined && !taken(canonicalJsonKey(value))) return value;
  }

  throw new Error(
    `Unique property "${key}" has a generator that repeats values: ${DRAWS} draws each returned a value another element holds.`
  );
};

const renameChange = (
  renames: ReadonlyArray<Holder & Readonly<{ key: string; value: unknown }>>,
  indexOf: (root: string) => DocumentIndex
) => {
  const byRoot = Map.groupBy(renames, ({ root }) => root);
  const changes = new Map<string, RootChange>();

  for (const [root, held] of byRoot) {
    const sections: RootChangeSection[] = [
      ...Map.groupBy(held, ({ from }) => from),
    ].map(([from, writes]) => ({
      from,
      properties: {
        set: Object.fromEntries(writes.map(({ key, value }) => [key, value])),
      },
    }));

    changes.set(root, RootChange.create(indexOf(root), sections));
  }

  return createInternalDocumentChange(changes);
};

/**
 * A loaded document's repair: each value two elements store stays on the
 * first in document order, and every later holder takes a fresh value.
 */
export const repairLoadedUniqueValues = (
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
): Readonly<{ change: DocumentChange; value: EditorDocumentValue }> | null => {
  const properties = uniquePropertiesOf(schema);

  if (properties.size === 0) return null;

  const held = new Map<string, Set<string>>(
    [...properties.keys()].map((key) => [key, new Set()])
  );
  const repeats: Array<Place & Readonly<{ key: string }>> = [];

  for (const root of documentRootsOf(document)) {
    visitElements(rootChildrenOf(document, root), (node, path) => {
      for (const [key, value] of uniqueValuesOf(properties, node)) {
        const values = getDefined(held.get(key));

        if (values.has(value)) repeats.push({ key, path, root });
        else values.add(value);
      }
    });
  }
  if (repeats.length === 0) return null;

  const indexOf = (root: string) => valueRootIndex(document, root);
  const renames = repeats.map(({ key, path, root }) => {
    const property = getDefined(properties.get(key));
    const values = getDefined(held.get(key));
    const value = drawFresh(key, property, (candidate) =>
      values.has(candidate)
    );

    values.add(canonicalJsonKey(value));

    return { from: indexOf(root).nodeRange(path).from, key, path, root, value };
  });
  const change = renameChange(renames, indexOf);

  return { change, value: change.apply(document) };
};

/**
 * A commit's repair: every unique value an element the commit inserted or set
 * stores, when another element of `after` stores it too. A commit that keeps
 * the first holder, such as a collaboration import or a load, keeps the value
 * on the first holder in document order; any other commit keeps it on each
 * holder it did not write and gives each holder it wrote a fresh value, or,
 * when it wrote every holder, keeps the first.
 */
export const repairCommittedUniqueValues = (
  input: Readonly<{
    after: EditorDocumentValue;
    afterIndexOf: (root: string) => DocumentIndex;
    afterKeysOf: (root: string) => SnapshotIndex;
    change: DocumentChange;
    index: () => UniqueIndex;
    keepFirst: boolean;
    schema: CompiledEditorSchema;
    stored: EditorDocumentValue;
  }>
): DocumentChange | null => {
  const properties = uniquePropertiesOf(input.schema);

  if (properties.size === 0) return null;

  const written = new Map<string, Map<string, Holder[]>>();

  for (const [root, rootChange] of getInternalDocumentChangeEntries(
    input.change
  )) {
    if (rootChange.empty) continue;
    const after = input.afterIndexOf(root);
    const before =
      root === MAIN || Object.hasOwn(input.stored.roots ?? {}, root)
        ? valueRootIndex(input.stored, root)
        : null;

    rootChange.iterChangedRanges((fromA, toA, fromB, toB) => {
      const kept = new Map<number, JsonNode>();

      for (const range of before?.nodeRangesTouching(fromA, toA) ?? []) {
        if (range.kind === 'text' || range.from < fromA || range.from >= toA) {
          continue;
        }
        const at = rootChange.mapPos(range.from, 1, 'after');

        if (at !== null) kept.set(at, getDefined(before).node(range.path));
      }
      for (const range of after.nodeRangesTouching(fromB, toB)) {
        if (range.kind === 'text' || range.from < fromB || range.from >= toB) {
          continue;
        }
        const node = after.node(range.path);
        const previous = kept.get(range.from);

        for (const [key, value] of uniqueValuesOf(properties, node)) {
          if (
            previous?.[key] !== undefined &&
            canonicalJsonKey(previous[key]) === value
          ) {
            continue;
          }
          let byValue = written.get(key);

          if (!byValue) {
            byValue = new Map();
            written.set(key, byValue);
          }
          byValue.set(value, [
            ...(byValue.get(value) ?? []),
            { from: range.from, path: range.path, root },
          ]);
        }
      }
    });
  }
  if (written.size === 0) return null;

  const index = input.index();
  const order = documentRootsOf(input.after);
  const writtenAt = new Map(
    [...written].map(([key, byValue]) => [
      key,
      new Set(
        [...byValue.values()].flatMap((holders) =>
          holders.map(({ from, root }) => `${root}\u0000${from}`)
        )
      ),
    ])
  );
  const untouched = (key: string, value: string): Holder[] =>
    [...(index.holders.get(key)?.get(value) ?? [])].flatMap(
      ([nodeKey, root]) => {
        if (root !== MAIN && !Object.hasOwn(input.after.roots ?? {}, root)) {
          return [];
        }
        const path = input.afterKeysOf(root).pathOf(nodeKey);

        if (!path) return [];
        const after = input.afterIndexOf(root);
        const node = after.node(path);

        if (node[key] === undefined || canonicalJsonKey(node[key]) !== value) {
          return [];
        }
        const { from } = after.nodeRange(path);

        return writtenAt.get(key)?.has(`${root}\u0000${from}`)
          ? []
          : [{ from, path, root }];
      }
    );
  const assigned = new Map<string, Set<string>>();
  const renames: Array<Holder & Readonly<{ key: string; value: unknown }>> = [];

  for (const [key, byValue] of written) {
    const property = getDefined(properties.get(key));
    const taken = (value: string) =>
      byValue.has(value) ||
      !!assigned.get(key)?.has(value) ||
      untouched(key, value).length > 0;

    for (const [value, holders] of byValue) {
      const kept = untouched(key, value);

      if (kept.length + holders.length < 2) continue;
      const renamed =
        !input.keepFirst && kept.length > 0
          ? holders
          : [...kept, ...holders]
              .sort((left, right) => comparePlaces(order, left, right))
              .slice(1);

      for (const holder of renamed) {
        const fresh = drawFresh(key, property, taken);
        const values = assigned.get(key) ?? new Set();

        values.add(canonicalJsonKey(fresh));
        assigned.set(key, values);
        renames.push({ ...holder, key, value: fresh });
      }
    }
  }

  return renames.length === 0
    ? null
    : renameChange(renames, input.afterIndexOf);
};
