import type {
  EditorDocumentValue,
  EditorUniqueHolder,
  NodeKey,
  SnapshotIndex,
} from '../interfaces/editor';
import type { Path } from '../interfaces/path';
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

type RootPlace = Readonly<{
  path: readonly number[];
  top: (at: number) => JsonNode | undefined;
}>;

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

export const indexedHoldersOf = (
  index: UniqueIndex,
  key: string,
  value: unknown
): Iterable<readonly [NodeKey, string]> =>
  index.holders.get(key)?.get(canonicalJsonKey(value)) ?? [];

export const writtenHoldersOf = (
  change: DocumentChange,
  afterIndexOf: (root: string) => DocumentIndex,
  key: string,
  value: unknown
) => {
  const canonical = canonicalJsonKey(value);
  const written: Place[] = [];

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    if (rootChange.empty || change.deleteRoots.has(root)) continue;
    const after = afterIndexOf(root);

    rootChange.iterChangedRanges((_fromA, _toA, fromB, toB) => {
      for (const range of after.nodeRangesTouching(fromB, toB)) {
        if (range.kind === 'text' || range.from < fromB || range.from >= toB) {
          continue;
        }
        const held = after.node(range.path)[key];

        if (held !== undefined && canonicalJsonKey(held) === canonical) {
          written.push({ path: range.path, root });
        }
      }
    });
  }

  return written;
};

export const uniqueHolderOf = (
  holders: Iterable<readonly [NodeKey, string]>,
  value: unknown,
  locate: (
    root: string,
    nodeKey: NodeKey
  ) => Readonly<{ held: unknown; path: Path }> | null
): EditorUniqueHolder | null => {
  const canonical = canonicalJsonKey(value);

  for (const [nodeKey, root] of holders) {
    const found = locate(root, nodeKey);

    if (
      found &&
      found.held !== undefined &&
      canonicalJsonKey(found.held) === canonical
    ) {
      return Object.freeze({ key: nodeKey, path: found.path, root });
    }
  }

  return null;
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
    let node: JsonNode | undefined = place.top(getDefined(place.path[0]));

    for (const at of place.path.slice(1)) {
      node = node?.children?.[at];
    }
    if (!node || !isElementNode(node)) continue;
    for (const [key, value] of uniqueValuesOf(properties, node)) {
      addHolder(index, nodeKey, root, key, value);
    }
  }
  index.version = version;
};

type Holder = Place & Readonly<{ key: NodeKey }>;

type FreshDraw = (
  key: string,
  property: CompiledSchemaProperty,
  taken: (value: unknown) => boolean
) => unknown;

const drawFresh: FreshDraw = (key, property, taken) => {
  for (let draw = 0; draw < DRAWS; draw += 1) {
    const value = generateElementPropertyValue(property);

    if (value !== undefined && !taken(value)) return value;
  }

  throw new Error(
    `Unique property "${key}" has a generator that repeats values: ${DRAWS} draws each returned a value another element holds.`
  );
};

export const renameChange = (
  renames: ReadonlyArray<
    Readonly<{ from: number; key: string; root: string; value: unknown }>
  >,
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
      values.has(canonicalJsonKey(candidate))
    );

    values.add(canonicalJsonKey(value));

    return { from: indexOf(root).nodeRange(path).from, key, path, root, value };
  });
  const change = renameChange(renames, indexOf);

  return { change, value: change.apply(document) };
};

/**
 * A value's holder when a local update began, and whether its key has left
 * the document since.
 */
export type UniqueIncumbent = Readonly<{
  key: NodeKey;
  left: () => boolean;
  root: string;
}>;

/**
 * `holders` come in document order. An import, a load, a replacement or a
 * commit tagged `collaboration` has no incumbent.
 */
export const keptUniqueHolder = <T extends Holder>(
  holders: readonly T[],
  incumbent: UniqueIncumbent | null
): T | undefined =>
  (incumbent &&
    (holders.find(({ key }) => key === incumbent.key) ??
      (incumbent.left()
        ? holders.find(({ root }) => root === incumbent.root)
        : undefined))) ??
  holders[0];

export const repairUniqueHolders = (
  input: Readonly<{
    held: Iterable<readonly [property: string, value: unknown]>;
    holdersOf: (property: string, value: unknown) => readonly Holder[];
    incumbentOf: (property: string, value: unknown) => UniqueIncumbent | null;
    indexOf: (root: string) => DocumentIndex;
    schema: CompiledEditorSchema;
  }>
): DocumentChange | null => {
  const properties = uniquePropertiesOf(input.schema);
  const claimOf = (key: string, value: unknown) =>
    `${key}\u0000${canonicalJsonKey(value)}`;
  const claimed = new Set<string>();
  const renames: Array<
    Readonly<{ from: number; key: string; root: string; value: unknown }>
  > = [];

  for (const [key, value] of input.held) {
    if (claimed.has(claimOf(key, value))) continue;
    claimed.add(claimOf(key, value));
    const holders = input.holdersOf(key, value);

    if (holders.length < 2) continue;
    const kept = keptUniqueHolder(holders, input.incumbentOf(key, value));
    const property = getDefined(properties.get(key));

    for (const { path, root } of holders.filter((held) => held !== kept)) {
      const fresh = drawFresh(
        key,
        property,
        (candidate) =>
          claimed.has(claimOf(key, candidate)) ||
          input.holdersOf(key, candidate).length > 0
      );

      claimed.add(claimOf(key, fresh));
      renames.push({
        from: input.indexOf(root).nodeRange(path).from,
        key,
        root,
        value: fresh,
      });
    }
  }

  return renames.length === 0 ? null : renameChange(renames, input.indexOf);
};
