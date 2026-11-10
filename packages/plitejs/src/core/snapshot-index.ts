import type {
  AnyEditor as Editor,
  NodeKey,
  SnapshotIndex,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import {
  assignFreshNodeKey,
  bindNodeKeyOnce,
  getNodeKeyMark,
  getOrCreateNodeKey,
  getNodeKeyForNode,
  setNodeKey,
  wasNodeKeyMintedSince,
} from '../utils/node-keys';
import type { DocumentChangeRuntimeCandidate } from './change/classification';
import { DocumentIndex, type NodeList } from './change/document-index';
import { jsonEqual } from './change/json';
import {
  compareRelocationPaths,
  groupRelocationCandidates,
  hasIndexedPathAncestor,
  type RelocationCandidate,
  type StructuralFingerprint,
} from './change/mapping';
import {
  isRootChangePositionReplaced,
  mapRootChangePositionBackward,
  type RootChange,
} from './change/root-change';
import {
  DOCUMENT_SLICE_DEFERRED_VIEWS,
  PreparedTokenSlice,
  getDocumentSliceNodeKeys,
  getPreparedDocumentSlice,
  getPreparedDocumentNodeKey,
  isDeferredPreparedDocumentSlice,
  type JsonNode,
} from './change/tokens';
import {
  admitRoot,
  type KeyOf,
  ROOT_LIST,
  type Topology,
  TopologyBuilder,
  topologyElements,
  topologyEntries,
  topologyKeyAt,
  topologyPathOf,
  topologyRetained,
} from './identity-owner';
import { profileCoreDuration } from './profiling';
import { countCoreWork } from './work';

const EMPTY_ENTRIES = Object.freeze([]) as ReadonlyArray<
  readonly [NodeKey, Path]
>;
export type InternalEditorRuntimeElementEntry = Readonly<{
  path: Path;
  nodeKey: NodeKey;
  type: string;
}>;

type ElementPathEntry = Readonly<{ path: Path; type: string }>;

const EMPTY_ELEMENT_ENTRIES = Object.freeze(
  []
) as readonly InternalEditorRuntimeElementEntry[];
const SNAPSHOT_ELEMENT_ENTRIES = new WeakMap<
  SnapshotIndex,
  (types: readonly string[]) => readonly InternalEditorRuntimeElementEntry[]
>();
const SNAPSHOT_INDEX_CACHED_PATHS = new WeakMap<
  SnapshotIndex,
  ReadonlyMap<NodeKey, Path | null>
>();
const NODE_KEY_MARKS = new WeakMap<SnapshotIndex, number>();
const KNOWN_LOOKUPS = new WeakMap<
  SnapshotIndex,
  Readonly<{
    keyAt: (path: Path) => NodeKey | null | undefined;
    pathOf: (nodeKey: NodeKey) => Path | null | undefined;
  }>
>();

export const indexSurelyHoldsNodeKey = (
  editor: Editor,
  index: SnapshotIndex,
  nodeKey: NodeKey
) => {
  const cached = SNAPSHOT_INDEX_CACHED_PATHS.get(index)?.get(nodeKey);

  if (cached !== undefined) return cached !== null;
  const mark = NODE_KEY_MARKS.get(index);

  return (
    (mark === undefined || !wasNodeKeyMintedSince(editor, nodeKey, mark)) &&
    !!index.pathOf(nodeKey)
  );
};

export const EMPTY_RUNTIME_INDEX: SnapshotIndex = Object.freeze({
  entries: () => EMPTY_ENTRIES,
  keyAt: () => null,
  pathOf: () => null,
});

SNAPSHOT_ELEMENT_ENTRIES.set(EMPTY_RUNTIME_INDEX, () => EMPTY_ELEMENT_ENTRIES);
KNOWN_LOOKUPS.set(EMPTY_RUNTIME_INDEX, {
  keyAt: () => null,
  pathOf: () => null,
});

/**
 * Query element types through the snapshot index lifecycle.
 *
 * @internal
 */
export const getSnapshotIndexElementEntries = (
  index: SnapshotIndex,
  types: readonly string[]
): readonly InternalEditorRuntimeElementEntry[] =>
  SNAPSHOT_ELEMENT_ENTRIES.get(index)?.(types) ?? EMPTY_ELEMENT_ENTRIES;

const createElementEntryQuery = (
  entriesByType: ReadonlyMap<string, readonly ElementPathEntry[]>,
  keyAt: (path: Path) => NodeKey | null
) => {
  const cache = new Map<string, readonly InternalEditorRuntimeElementEntry[]>();

  return (types: readonly string[]) => {
    const orderedTypes = [...new Set(types)].sort((left, right) =>
      left.localeCompare(right)
    );
    const key = orderedTypes.join('\u0000');
    const known = cache.get(key);

    if (known) return known;
    const entries = orderedTypes
      .flatMap((type) => entriesByType.get(type) ?? [])
      .flatMap(({ path, type }) => {
        const nodeKey = keyAt(path);

        return nodeKey
          ? [Object.freeze({ path, nodeKey, type })]
          : EMPTY_ELEMENT_ENTRIES;
      })
      .sort((left, right) => comparePaths(left.path, right.path));
    const frozen = Object.freeze(entries);

    cache.set(key, frozen);
    return frozen;
  };
};

export const pathKey = (path: Path) => {
  switch (path.length) {
    case 0: {
      return '';
    }
    case 1: {
      return String(path[0]);
    }
    case 2: {
      return `${path[0]}.${path[1]}`;
    }
    default: {
      return path.join('.');
    }
  }
};

export const buildSnapshotIndex = (
  editor: Editor,
  children: readonly Descendant[],
  parentPath: Path = []
): SnapshotIndex => {
  countCoreWork('snapshotIndexes');
  const nodeKeyMark = getNodeKeyMark(editor);
  const idToPathCache = new Map<NodeKey, Path>();
  const pathToIdCache = new Map<string, NodeKey | null>();
  const elementEntriesByType = new Map<string, ElementPathEntry[]>();
  const collectElementPaths = (
    nodes: readonly Descendant[],
    pathPrefix: Path
  ) => {
    nodes.forEach((node, index) => {
      const path = Object.freeze([...pathPrefix, index]);

      if ('children' in node && Array.isArray(node.children)) {
        if (typeof node.type === 'string') {
          const entries = elementEntriesByType.get(node.type) ?? [];

          entries.push(Object.freeze({ path, type: node.type }));
          elementEntriesByType.set(node.type, entries);
        }
        collectElementPaths(node.children, path);
      }
    });
  };

  let materializedEntries: ReadonlyArray<readonly [NodeKey, Path]> | undefined;
  let activeChildren: readonly Descendant[] | null = children;
  let elementPathsCollected = false;
  const ensureElementPaths = () => {
    if (elementPathsCollected) return;

    collectElementPaths(getDefined(activeChildren), parentPath);
    elementPathsCollected = true;
  };
  const cache = (nodeKey: NodeKey, path: Path) => {
    const key = pathKey(path);
    const existingPath = idToPathCache.get(nodeKey);
    const existingNodeKey = pathToIdCache.get(key);

    if (
      (existingPath && pathKey(existingPath) !== key) ||
      (existingNodeKey && existingNodeKey !== nodeKey)
    ) {
      throw new Error(
        `Snapshot index node keys must be injective: ${nodeKey} at [${path}] conflicts with ${
          existingPath ? `[${existingPath}]` : existingNodeKey
        }.`
      );
    }

    const frozenPath = Object.freeze([...path]);

    idToPathCache.set(nodeKey, frozenPath);
    pathToIdCache.set(key, nodeKey);

    return frozenPath;
  };
  const nodeAt = (path: Path): Descendant | null => {
    if (
      path.length <= parentPath.length ||
      !parentPath.every((part, index) => path[index] === part)
    ) {
      return null;
    }

    let nodes = activeChildren;
    let node: Descendant | undefined;

    if (!nodes) return null;

    for (const index of path.slice(parentPath.length)) {
      node = nodes[index];
      if (!node) return null;
      nodes =
        'children' in node && Array.isArray(node.children) ? node.children : [];
    }

    return node ?? null;
  };
  const materialize = () => {
    if (materializedEntries) return materializedEntries;

    return profileCoreDuration('runtime-index-full-build', () => {
      ensureElementPaths();
      const entries: Array<readonly [NodeKey, Path]> = [];

      const visit = (nodes: readonly Descendant[], pathPrefix: Path) => {
        nodes.forEach((node, index) => {
          const path = [...pathPrefix, index] as Path;
          const nodeKey = getOrCreateNodeKey(node, editor);
          const frozenPath = cache(nodeKey, path);

          entries.push(Object.freeze([nodeKey, frozenPath] as const));

          if ('children' in node && Array.isArray(node.children)) {
            visit(node.children, path);
          }
        });
      };

      visit(getDefined(activeChildren), parentPath);
      materializedEntries = Object.freeze(entries);
      activeChildren = null;

      return materializedEntries;
    });
  };
  const keyAt = (path: Path): NodeKey | null => {
    const key = pathKey(path);
    const cached = pathToIdCache.get(key);

    if (cached !== undefined) return cached;
    const node = nodeAt(path);

    if (!node) {
      pathToIdCache.set(key, null);
      return null;
    }

    const nodeKey = getNodeKeyForNode(node, editor);

    if (!nodeKey) {
      materialize();

      return pathToIdCache.get(key) ?? null;
    }

    cache(nodeKey, path);

    return nodeKey;
  };

  const index = Object.freeze({
    entries: materialize,
    keyAt,
    pathOf: (nodeKey: NodeKey) => {
      const cached = idToPathCache.get(nodeKey);

      if (cached) return cached;

      materialize();

      return idToPathCache.get(nodeKey) ?? null;
    },
  });

  SNAPSHOT_INDEX_CACHED_PATHS.set(index, idToPathCache);
  NODE_KEY_MARKS.set(index, nodeKeyMark);
  KNOWN_LOOKUPS.set(index, {
    keyAt: (path) => {
      const cached = pathToIdCache.get(pathKey(path));

      if (cached !== undefined || materializedEntries) return cached ?? null;
      const node = nodeAt(path);

      return node ? (getNodeKeyForNode(node, editor) ?? undefined) : null;
    },
    pathOf: (nodeKey) =>
      idToPathCache.get(nodeKey) ?? (materializedEntries ? null : undefined),
  });

  const queryElements = createElementEntryQuery(elementEntriesByType, keyAt);

  SNAPSHOT_ELEMENT_ENTRIES.set(index, (types) => {
    if (types.length > 0) ensureElementPaths();
    return queryElements(types);
  });
  return index;
};

type MappingSegment = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  change: RootChange;
}>;

const TOPOLOGIES = new WeakMap<SnapshotIndex, Topology>();
const VERSION_ENTRIES = new WeakMap<
  Topology,
  ReadonlyArray<readonly [NodeKey, Path]>
>();
const REGISTERED = new WeakMap<Editor, WeakMap<object, SnapshotIndex>>();

const VERSION_DOCUMENTS = new WeakMap<
  SnapshotIndex,
  Readonly<{
    document: DocumentIndex;
    movedFrom: WeakSet<DocumentIndex> | null;
  }>
>();

const sequenceOf = (index: SnapshotIndex, before: DocumentIndex) => {
  const known = VERSION_DOCUMENTS.get(index);

  if (
    !known ||
    known.document === before ||
    (known.document.length === 0 && before.length === 0)
  ) {
    return 'next';
  }
  if (known.movedFrom?.has(before)) return 'fork';
  throw new Error(
    `Snapshot index mappings are not sequential: previous target length ${known.document.length}, next source length ${before.length}.`
  );
};

const versionOf = (
  topology: Topology,
  editor: Editor,
  document?: DocumentIndex
): SnapshotIndex => {
  const keyAt = (path: Path) => topologyKeyAt(topology, path);
  const pathOf = (nodeKey: NodeKey) => topologyPathOf(topology, nodeKey);
  const index: SnapshotIndex = Object.freeze({
    entries: () => {
      let entries = VERSION_ENTRIES.get(topology);

      if (!entries) {
        entries = topologyEntries(topology);
        VERSION_ENTRIES.set(topology, entries);
      }

      return entries;
    },
    keyAt,
    pathOf,
  });

  TOPOLOGIES.set(index, topology);
  if (document) {
    VERSION_DOCUMENTS.set(index, { document, movedFrom: null });
  }
  NODE_KEY_MARKS.set(index, getNodeKeyMark(editor));
  KNOWN_LOOKUPS.set(index, { keyAt, pathOf });
  SNAPSHOT_ELEMENT_ENTRIES.set(index, (types) =>
    Object.freeze(
      topologyElements(topology, types).map((entry) => Object.freeze(entry))
    )
  );

  return index;
};

/** @internal */
export const readIdentityRetained = (index: SnapshotIndex) => {
  const topology = TOPOLOGIES.get(index);

  return topology ? topologyRetained(topology) : null;
};

const registryOf = (editor: Editor) => {
  let registry = REGISTERED.get(editor);

  if (!registry) {
    registry = new WeakMap();
    REGISTERED.set(editor, registry);
  }

  return registry;
};

type ChildrenList =
  | DocumentIndex
  | NodeList<unknown>
  | readonly Descendant[]
  | readonly unknown[];

const registryKeysOf = (children: ChildrenList): object[] => {
  if (children instanceof DocumentIndex) {
    return [
      children.nodes,
      ...(children.builtValue ? [children.builtValue] : []),
    ];
  }

  const nodes = DocumentIndex.nodesOf(children);

  return nodes === children ? [children] : [children, nodes];
};

const registeredVersion = (editor: Editor, children: ChildrenList) => {
  const registry = registryOf(editor);

  for (const key of registryKeysOf(children)) {
    const known = registry.get(key);

    if (known) return known;
  }

  return undefined;
};

const register = (
  editor: Editor,
  children: ChildrenList,
  index: SnapshotIndex
) => {
  const registry = registryOf(editor);

  for (const key of registryKeysOf(children)) registry.set(key, index);
};

/** @internal */
export const hasRegisteredSnapshotIndex = (
  editor: Editor,
  children: ChildrenList
) => !!registeredVersion(editor, children);

const forEachChild = (
  children: ChildrenList,
  visit: (node: Descendant, index: number) => void
) => {
  if (children instanceof DocumentIndex) {
    children.nodes.forEach((node, index) =>
      visit(node as unknown as Descendant, index)
    );
  } else {
    (children as NodeList<unknown>).forEach((node, index) =>
      visit(node as Descendant, index)
    );
  }
};

const admitList = (editor: Editor, children: ChildrenList, keyOf: KeyOf) =>
  admitRoot({ forEach: (visit) => forEachChild(children, visit) }, keyOf);

/** @internal */
export const snapshotIndexOf = (
  editor: Editor,
  children: ChildrenList
): SnapshotIndex => {
  const known = registeredVersion(editor, children);

  if (known) return known;
  countCoreWork('snapshotIndexes');
  const index = versionOf(
    admitList(editor, children, (node) => getOrCreateNodeKey(node, editor)),
    editor
  );

  register(editor, children, index);
  return index;
};

/** @internal */
export const seedSnapshotIndex = (
  editor: Editor,
  children: readonly Descendant[]
) => {
  const index = versionOf(
    admitList(editor, children, (node) => getOrCreateNodeKey(node, editor)),
    editor
  );

  register(editor, children, index);
  return index;
};

const topologyOf = (
  index: SnapshotIndex,
  document: DocumentIndex,
  editor: Editor
) => {
  const known = TOPOLOGIES.get(index);

  if (known) return known;
  if (index === EMPTY_RUNTIME_INDEX) {
    return admitList(editor, document, () => null);
  }

  return admitList(editor, document, (_node, path) => index.keyAt(path));
};

const assertMappingLengths = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange
) => {
  if (change.length !== before.length) {
    throw new Error(
      `Snapshot index change source length ${change.length} does not match document length ${before.length}.`
    );
  }
  if (change.newLength !== after.length) {
    throw new Error(
      `Snapshot index change target length ${change.newLength} does not match document length ${after.length}.`
    );
  }
};

const SEGMENT_MOVES = new WeakMap<
  MappingSegment,
  ReturnType<RootChange['movedNode']>
>();
const SEGMENT_RELOCATIONS = new WeakMap<
  MappingSegment,
  ReadonlyArray<Readonly<{ path: Path; targetPath: Path }>>
>();
let nextDraftNodeKeyOrdinal = 0;

const allocateDraftNodeKey = (): NodeKey => {
  const ordinal = nextDraftNodeKeyOrdinal;

  nextDraftNodeKeyOrdinal += 1;

  return `d${ordinal.toString(36)}` as NodeKey;
};

const getSegmentMove = (segment: MappingSegment) => {
  if (SEGMENT_MOVES.has(segment)) return SEGMENT_MOVES.get(segment) ?? null;

  const move = segment.change.movedNode(segment.before);

  SEGMENT_MOVES.set(segment, move);

  return move;
};

const segmentMayRelocate = (segment: MappingSegment) =>
  segment.change.data.some(
    (data) =>
      data instanceof PreparedTokenSlice &&
      !getPreparedDocumentSlice(data) &&
      !isDeferredPreparedDocumentSlice(data) &&
      data.tokens.some((token) => token.kind === 'open')
  );

const keepsNodeInPlace = (
  before: DocumentIndex,
  after: DocumentIndex,
  path: readonly number[]
) => {
  const shares = (left: JsonNode, right: JsonNode): boolean => {
    if (left === right) return true;
    if (!left.children || !right.children) return false;
    const rightChildren = right.children;

    return left.children.some(
      (child, index) =>
        index < rightChildren.length && shares(child, rightChildren[index])
    );
  };
  const left = before.find(path);
  const right = after.find(path);

  return !!left && !!right && shares(left, right);
};

const getSegmentRelocations = (segment: MappingSegment) => {
  let relocations = SEGMENT_RELOCATIONS.get(segment);

  if (relocations) return relocations;
  const moved = getSegmentMove(segment);

  if (moved) {
    relocations = Object.freeze([
      Object.freeze({
        path: [...moved.path] as Path,
        targetPath: [...moved.targetPath] as Path,
      }),
    ]);
    SEGMENT_RELOCATIONS.set(segment, relocations);
    return relocations;
  }
  const beforeRanges: Array<readonly [number, number]> = [];
  const afterRanges: Array<readonly [number, number]> = [];

  segment.change.iterChangedRanges((fromA, toA, fromB, toB) => {
    beforeRanges.push([fromA, toA]);
    afterRanges.push([fromB, toB]);
  });
  type Straddler = { length: number; path: readonly number[] };
  const touching = (
    document: DocumentIndex,
    ranges: ReadonlyArray<readonly [number, number]>
  ) => {
    const inside = new Map<string, RelocationCandidate & { length: number }>();
    const straddling = new Map<string, Straddler>();

    for (const [from, to] of ranges) {
      for (const range of document.nodeRangesTouching(from, to)) {
        const key = pathKey(range.path);

        if (range.from >= from && range.to <= to) {
          if (!inside.has(key)) {
            countCoreWork('identityClaimsExamined');
            inside.set(key, {
              length: range.to - range.from,
              node: document.node(range.path),
              path: range.path,
            });
          }
        } else if (!straddling.has(key)) {
          straddling.set(key, {
            length: range.to - range.from,
            path: range.path,
          });
        }
      }
    }

    return { inside, straddling };
  };
  const beforeTouching = touching(segment.before, beforeRanges);
  const afterTouching = touching(segment.after, afterRanges);
  const lengthsOf = (found: ReturnType<typeof touching>) =>
    new Set(
      [...found.inside.values(), ...found.straddling.values()].map(
        ({ length }) => length
      )
    );
  const contained = (
    document: DocumentIndex,
    found: ReturnType<typeof touching>,
    otherLengths: ReadonlySet<number>
  ) => {
    const candidates: RelocationCandidate[] = [...found.inside.values()];

    for (const straddler of found.straddling.values()) {
      if (!otherLengths.has(straddler.length)) continue;
      countCoreWork('identityClaimsExamined');
      candidates.push({
        node: document.node(straddler.path),
        path: straddler.path,
      });
    }

    return candidates;
  };
  const fingerprints = new WeakMap<object, StructuralFingerprint>();
  const beforeBuckets = groupRelocationCandidates(
    contained(segment.before, beforeTouching, lengthsOf(afterTouching)),
    fingerprints
  );
  const afterBuckets = groupRelocationCandidates(
    contained(segment.after, afterTouching, lengthsOf(beforeTouching)),
    fingerprints
  );
  const candidates: Array<{ path: Path; targetPath: Path }> = [];

  for (const [key, sourceGroups] of beforeBuckets) {
    const targetGroups = afterBuckets.get(key);

    if (!targetGroups) continue;
    for (const sourceGroup of sourceGroups) {
      if (sourceGroup.candidates.length !== 1) continue;
      const targetGroup = targetGroups.find((group) =>
        jsonEqual(sourceGroup.node, group.node)
      );

      if (!targetGroup || targetGroup.candidates.length !== 1) continue;
      const source = sourceGroup.candidates[0];
      const target = targetGroup.candidates[0];

      if (pathKey(source.path) === pathKey(target.path)) {
        continue;
      }
      if (
        keepsNodeInPlace(segment.before, segment.after, source.path) ||
        keepsNodeInPlace(segment.before, segment.after, target.path)
      ) {
        continue;
      }
      candidates.push({
        path: [...source.path] as Path,
        targetPath: [...target.path] as Path,
      });
    }
  }
  candidates.sort(
    (left, right) =>
      left.path.length - right.path.length ||
      compareRelocationPaths(left.path, right.path)
  );
  const selected: Array<Readonly<{ path: Path; targetPath: Path }>> = [];
  const selectedSources = new Set<string>();
  const selectedTargets = new Set<string>();

  for (const candidate of candidates) {
    if (
      hasIndexedPathAncestor(selectedSources, candidate.path) ||
      hasIndexedPathAncestor(selectedTargets, candidate.targetPath)
    ) {
      continue;
    }
    selected.push(Object.freeze(candidate));
    selectedSources.add(pathKey(candidate.path));
    selectedTargets.add(pathKey(candidate.targetPath));
  }
  relocations = Object.freeze(selected);
  SEGMENT_RELOCATIONS.set(segment, relocations);

  return relocations;
};

const mapRelocatedPath = (
  segment: MappingSegment,
  path: Path,
  direction: 'backward' | 'forward'
): Path | null => {
  if (!segmentMayRelocate(segment)) return null;

  for (const relocation of getSegmentRelocations(segment)) {
    const source =
      direction === 'forward' ? relocation.path : relocation.targetPath;
    const target =
      direction === 'forward' ? relocation.targetPath : relocation.path;

    if (
      path.length >= source.length &&
      source.every((part, depth) => path[depth] === part)
    ) {
      return [...target, ...path.slice(source.length)] as Path;
    }
  }

  return null;
};

const mapPathForward = (segment: MappingSegment, path: Path): Path | null => {
  const moved = getSegmentMove(segment);

  if (
    moved &&
    path.length >= moved.path.length &&
    moved.path.every((part, depth) => path[depth] === part)
  ) {
    return [...moved.targetPath, ...path.slice(moved.path.length)] as Path;
  }

  let position: number;

  try {
    position = segment.before.nodeRange(path).from;
  } catch {
    return null;
  }

  if (isRootChangePositionReplaced(segment.change, position, 'before')) {
    return mapRelocatedPath(segment, path, 'forward');
  }

  const mapped = segment.change.mapPos(position, 1, 'after');

  if (mapped === null) return mapRelocatedPath(segment, path, 'forward');
  const entry = segment.after.nodeStartingAt(mapped);

  return entry?.from === mapped
    ? ([...entry.path] as Path)
    : mapRelocatedPath(segment, path, 'forward');
};

// The inverse's move and relocations are this segment's, read the other way,
// so a path maps back through the sections without inverting the change.
const mapPathBackward = (segment: MappingSegment, path: Path): Path | null => {
  const moved = getSegmentMove(segment);

  if (
    moved &&
    path.length >= moved.targetPath.length &&
    moved.targetPath.every((part, depth) => path[depth] === part)
  ) {
    return [...moved.path, ...path.slice(moved.targetPath.length)] as Path;
  }

  let position: number;

  try {
    position = segment.after.nodeRange(path).from;
  } catch {
    return null;
  }

  if (isRootChangePositionReplaced(segment.change, position, 'after')) {
    return mapRelocatedPath(segment, path, 'backward');
  }

  const mapped = mapRootChangePositionBackward(
    segment.change,
    position,
    1,
    'after'
  );

  if (mapped === null) return mapRelocatedPath(segment, path, 'backward');
  const entry = segment.before.nodeStartingAt(mapped);

  return entry?.from === mapped
    ? ([...entry.path] as Path)
    : mapRelocatedPath(segment, path, 'backward');
};

type PreparedRuntimePlacement = Readonly<{
  fromDeferredView: boolean;
  index: number;
  offset: number;
  parentPath: Path;
  rootCount: number;
  slice: PreparedTokenSlice;
}>;

const placementKeysAdopted = (
  placement: PreparedRuntimePlacement,
  editor: Editor
) => {
  const nodes = getPreparedDocumentSlice(placement.slice)?.nodes;

  return [placement.offset, placement.offset + placement.rootCount - 1].some(
    (offset) => {
      const node = nodes?.[offset];

      return (
        node !== undefined &&
        getNodeKeyForNode(node, editor) ===
          getPreparedDocumentNodeKey(placement.slice, [offset])
      );
    }
  );
};

const preparedRuntimePlacementsFromSegment = (
  segment: MappingSegment
): readonly PreparedRuntimePlacement[] => {
  const placements: PreparedRuntimePlacement[] = [];
  let position = 0;

  for (
    let sectionIndex = 0, dataIndex = 0;
    sectionIndex < segment.change.sections.length;
    dataIndex++
  ) {
    const length = segment.change.sections[sectionIndex];

    sectionIndex += 1;
    const inserted = segment.change.sections[sectionIndex];

    sectionIndex += 1;
    const data = segment.change.data[dataIndex];
    const outputLength = inserted < 0 ? length : inserted;
    const slice =
      inserted >= 0 && data instanceof PreparedTokenSlice ? data : null;
    const view = slice && DOCUMENT_SLICE_DEFERRED_VIEWS.get(slice);
    const viewSource = view ? getPreparedDocumentSlice(view.source) : undefined;

    if (slice && view && viewSource && inserted === slice.length) {
      const roots = viewSource.index;
      let first = roots.locate(view.from);

      if (first >= 0 && roots.startOf(first) < view.from) first += 1;
      let count = 0;

      if (first >= 0) {
        while (
          first + count < viewSource.nodes.length &&
          roots.startOf(first + count) +
            getDefined(roots.at(first + count)).length <=
            view.to
        ) {
          count += 1;
        }
      }
      const entry =
        count > 0
          ? segment.after.nodeStartingAt(
              position + roots.startOf(first) - view.from
            )
          : null;

      if (entry) {
        const firstPath = [...entry.path] as Path;
        const parentPath = firstPath.slice(0, -1) as Path;
        const index = getDefined(firstPath.at(-1));

        if (
          segment.after.node(firstPath) === viewSource.nodes[first] &&
          segment.after.node([...parentPath, index + count - 1] as Path) ===
            viewSource.nodes[first + count - 1]
        ) {
          placements.push(
            Object.freeze({
              fromDeferredView: true,
              index,
              offset: first,
              parentPath: Object.freeze(parentPath),
              rootCount: count,
              slice: view.source,
            })
          );
        }
      }
    }

    if (inserted >= 0 && data instanceof PreparedTokenSlice) {
      const prepared = getPreparedDocumentSlice(data);
      const boundary =
        prepared && prepared.nodes.length > 0
          ? segment.after.childBoundaryAt(position)
          : null;

      if (prepared && boundary && inserted === data.length) {
        const firstPath = [...boundary.parentPath, boundary.index] as Path;
        const lastPath = [
          ...boundary.parentPath,
          boundary.index + prepared.nodes.length - 1,
        ] as Path;

        if (
          segment.after.node(firstPath) === prepared.nodes[0] &&
          segment.after.node(lastPath) === prepared.nodes.at(-1)
        ) {
          placements.push(
            Object.freeze({
              fromDeferredView: false,
              index: boundary.index,
              offset: 0,
              parentPath: Object.freeze([...boundary.parentPath]),
              rootCount: prepared.nodes.length,
              slice: data,
            })
          );
        }
      }
    }

    position += outputLength;
  }

  return Object.freeze(placements);
};

const preparedLocalPath = (
  placement: PreparedRuntimePlacement,
  originPath: Path
): Path | null => {
  if (
    originPath.length <= placement.parentPath.length ||
    !placement.parentPath.every((part, depth) => originPath[depth] === part)
  ) {
    return null;
  }
  const rootIndex = originPath[placement.parentPath.length] - placement.index;

  if (rootIndex < 0 || rootIndex >= placement.rootCount) return null;

  return [
    rootIndex + placement.offset,
    ...originPath.slice(placement.parentPath.length + 1),
  ];
};

const comparePaths = (left: Path, right: Path) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

const orderPaths = (paths: Iterable<Path>) => {
  const ordered = [...paths];

  for (let index = 1; index < ordered.length; index++) {
    if (comparePaths(ordered[index - 1], ordered[index]) > 0) {
      return ordered.sort(comparePaths);
    }
  }

  return ordered;
};

type KeyAvailability = (nodeKey: NodeKey, targetPath: Path) => boolean;

const mapChangedNodeKeys = (
  segment: MappingSegment,
  index: SnapshotIndex,
  editor: Editor,
  discarded: ReadonlySet<NodeKey>,
  preparedRuntimePlacements: readonly PreparedRuntimePlacement[],
  binding: NodeKeyBinding,
  available: KeyAvailability,
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[]
) => {
  const publishNodeKeys = binding === 'publish';
  const sourcePaths = new Map<string, Path>();
  const targetPaths = new Map<string, Path>();
  const addTouching = (
    document: DocumentIndex,
    paths: Map<string, Path>,
    from: number,
    to: number,
    boundaries = false
  ) => {
    if (!boundaries) {
      for (const { path } of document.nodeRangesTouching(from, to)) {
        const candidate = [...path] as Path;

        paths.set(pathKey(candidate), candidate);
      }
    }
    for (const position of [from, to]) {
      for (const { path } of document.nodeRangesTouching(position)) {
        const candidate = [...path] as Path;

        paths.set(pathKey(candidate), candidate);
      }
    }
  };

  // A node wholly inside a section that deletes and inserts nothing is gone,
  // and only a relocation, added below, carries its key on, so such a section
  // reads only the nodes at its ends.
  for (
    let section = 0, position = 0;
    section < segment.change.sections.length;
    section += 2
  ) {
    const length = segment.change.sections[section];
    const inserted = segment.change.sections[section + 1];

    if (inserted !== -1) {
      addTouching(
        segment.before,
        sourcePaths,
        position,
        position + length,
        inserted === 0
      );
    }
    position += length;
  }
  const placedSpans = preparedRuntimePlacements
    .map(
      ({ index: first, parentPath, rootCount }) =>
        [
          segment.after.childPosition(parentPath, first),
          segment.after.childPosition(parentPath, first + rootCount),
        ] as const
    )
    .sort(([a], [b]) => a - b);
  const addUnplacedTargets = (from: number, to: number) => {
    let start = from;

    for (const [placedFrom, placedTo] of placedSpans) {
      if (placedTo <= start || placedFrom >= to) continue;
      if (placedFrom > start) {
        addTouching(segment.after, targetPaths, start, placedFrom);
      }
      start = placedTo;
    }
    if (start < to || start === from) {
      addTouching(segment.after, targetPaths, start, to);
    }
  };

  segment.change.iterChangedRanges(
    (_fromBefore, _toBefore, fromAfter, toAfter) => {
      if (!runtimeCandidates || runtimeCandidates.length === 0) {
        addUnplacedTargets(fromAfter, toAfter);
      }
    }
  );

  for (const candidate of runtimeCandidates ?? []) {
    const path = [...candidate.path] as Path;

    if (segment.after.node(path) !== candidate.node) {
      throw new Error(
        `Node key candidate at [${path}] does not belong to the published document.`
      );
    }
    targetPaths.set(pathKey(path), path);
  }

  const hasReservedKey = (path: Path) =>
    preparedRuntimePlacements.some((placement) =>
      preparedLocalPath(placement, path)
    );
  const relocations = segmentMayRelocate(segment)
    ? getSegmentRelocations(segment)
    : [];

  for (const relocation of relocations) {
    sourcePaths.set(pathKey(relocation.path), [...relocation.path]);
    targetPaths.set(pathKey(relocation.targetPath), [...relocation.targetPath]);
  }

  const orderedSources = orderPaths(sourcePaths.values());
  const orderedTargets = orderPaths(targetPaths.values());
  const usedNodeKeys = new Set<NodeKey>();
  const usedTargetPaths = new Set<string>();
  const assignments = new Map<string, NodeKey>();
  const claim = (nodeKey: NodeKey, targetPath: Path) => {
    countCoreWork('identityClaimsExamined');
    const targetKey = pathKey(targetPath);

    if (
      discarded.has(nodeKey) ||
      usedNodeKeys.has(nodeKey) ||
      usedTargetPaths.has(targetKey) ||
      !available(nodeKey, targetPath)
    ) {
      return false;
    }

    if (!bindNodeKeyOnce(segment.after.node(targetPath), editor, nodeKey)) {
      return false;
    }
    usedNodeKeys.add(nodeKey);
    usedTargetPaths.add(targetKey);
    assignments.set(targetKey, nodeKey);

    return true;
  };

  // Runtime identities attached to an inserted slice move with that slice
  // through compose/transform. Claim them before positional heuristics.
  let outputPosition = 0;

  for (
    let sectionIndex = 0, dataIndex = 0;
    sectionIndex < segment.change.sections.length;
    dataIndex++
  ) {
    const length = segment.change.sections[sectionIndex];

    sectionIndex += 1;
    const inserted = segment.change.sections[sectionIndex];

    sectionIndex += 1;
    const outputLength = inserted < 0 ? length : inserted;
    const data = segment.change.data[dataIndex];

    if (inserted >= 0 && data instanceof PreparedTokenSlice) {
      for (const [offset, nodeKey] of getDocumentSliceNodeKeys(data)) {
        const position = outputPosition + offset;
        const entry = segment.after.nodeStartingAt(position);

        if (entry?.from === position) {
          const targetPath = [...entry.path] as Path;
          const sourcePath = index.pathOf(nodeKey);
          const survivingPath = sourcePath
            ? mapPathForward(segment, sourcePath)
            : null;
          const survivingNode = survivingPath
            ? segment.after.node(survivingPath)
            : null;

          if (
            survivingPath &&
            pathKey(survivingPath) !== pathKey(targetPath) &&
            survivingNode &&
            getNodeKeyForNode(survivingNode, editor) === nodeKey
          ) {
            // A skipped edit can revive the deleted object before its inverse
            // insertion is replayed. The live continuation owns the old key;
            // the duplicate restored by history receives a fresh identity.
            claim(nodeKey, survivingPath);
            if (publishNodeKeys) {
              claim(
                assignFreshNodeKey(segment.after.node(targetPath), editor),
                targetPath
              );
            }
          } else {
            claim(nodeKey, targetPath);
          }
        }
      }
    }

    outputPosition += outputLength;
  }

  // A live target's own key outranks relocations and positional
  // continuation: a view that shares the node object with the editor already
  // holds that key in the editor's slot.
  for (const targetPath of orderedTargets) {
    const nodeKey = getNodeKeyForNode(segment.after.node(targetPath), editor);

    if (nodeKey) claim(nodeKey, targetPath);
  }

  // Exact subtree relocations own their source identities before positional
  // survivors compete for the same target paths.
  for (const relocation of relocations) {
    for (const targetPath of orderedTargets) {
      if (
        targetPath.length < relocation.targetPath.length ||
        !relocation.targetPath.every(
          (part, depth) => targetPath[depth] === part
        )
      ) {
        continue;
      }

      const sourcePath = [
        ...relocation.path,
        ...targetPath.slice(relocation.targetPath.length),
      ] as Path;
      const nodeKey = index.keyAt(sourcePath);

      if (nodeKey) claim(nodeKey, targetPath);
    }
  }

  for (const sourcePath of orderedSources) {
    const targetPath = mapPathForward(segment, sourcePath);
    const nodeKey = index.keyAt(sourcePath);

    if (targetPath && nodeKey) claim(nodeKey, targetPath);
  }

  for (const targetPath of orderedTargets) {
    const targetKey = pathKey(targetPath);

    if (usedTargetPaths.has(targetKey)) continue;
    if (hasReservedKey(targetPath)) continue;
    const targetNode = segment.after.node(targetPath);
    const currentNodeKey = getNodeKeyForNode(targetNode, editor);

    if (
      currentNodeKey &&
      !discarded.has(currentNodeKey) &&
      !usedNodeKeys.has(currentNodeKey) &&
      claim(currentNodeKey, targetPath)
    ) {
      continue;
    }

    claim(
      publishNodeKeys
        ? assignFreshNodeKey(targetNode, editor)
        : allocateDraftNodeKey(),
      targetPath
    );
  }

  return { assignments, usedNodeKeys };
};

export type NodeKeyBinding = 'inherited' | 'publish';

type Window = Readonly<{
  hiAfter: number;
  hiBefore: number;
  loAfter: number;
  loBefore: number;
  parentAfter: Path;
  parentBefore: Path;
}>;

type Retyped = Readonly<{ after: Path; before: Path }>;

const WINDOW_PAGE = 32;

const startsWith = (path: readonly number[], prefix: readonly number[]) =>
  path.length >= prefix.length &&
  prefix.every((part, depth) => path[depth] === part);

const containerOf = (document: DocumentIndex, from: number, to: number) => {
  let deepest: readonly number[] = [];

  for (const range of document.nodeRangesTouching(from, to)) {
    if (
      range.kind === 'element' &&
      range.contentFrom <= from &&
      to <= range.contentTo &&
      range.path.length > deepest.length
    ) {
      deepest = range.path;
    }
  }

  return deepest;
};

const tokenOwnerOf = (document: DocumentIndex, from: number, to: number) => {
  if (from >= to) return null;
  for (const range of document.nodeRangesTouching(from, to)) {
    if (range.from <= from && to <= range.contentFrom) {
      return [...range.path] as Path;
    }
  }

  return null;
};

const childWindowOf = (
  document: DocumentIndex,
  from: number,
  to: number,
  parent: readonly number[],
  container: readonly number[]
): readonly [number, number] => {
  if (container.length > parent.length) {
    const index = container[parent.length];

    return [index, index];
  }
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  let boundary: number | null = null;

  for (const range of document.nodeRangesTouching(from, to)) {
    if (
      range.path.length !== parent.length + 1 ||
      !startsWith(range.path, parent)
    ) {
      continue;
    }
    const index = range.path[parent.length];
    const overlaps =
      from === to
        ? range.from < from && from < range.to
        : range.from < to && range.to > from;

    if (overlaps) {
      lo = Math.min(lo, index);
      hi = Math.max(hi, index);
    } else if (range.to <= from) {
      boundary = Math.max(boundary ?? 0, index + 1);
    } else if (range.from >= to && boundary === null) {
      boundary = index;
    }
  }
  if (lo <= hi) return [lo, hi];
  const at = boundary ?? 0;

  return [at, at - 1];
};

const childCountAt = (document: DocumentIndex, parent: Path) => {
  if (parent.length === 0) return document.nodes.length;
  const node = document.node(parent);

  return 'children' in node && Array.isArray(node.children)
    ? node.children.length
    : 0;
};

const holdsSlotOf = (
  window: Window,
  path: readonly number[],
  side: 'after' | 'before'
) => {
  const parent = side === 'before' ? window.parentBefore : window.parentAfter;
  const lo = side === 'before' ? window.loBefore : window.loAfter;
  const hi = side === 'before' ? window.hiBefore : window.hiAfter;

  return (
    path.length > parent.length &&
    startsWith(path, parent) &&
    path[parent.length] >= lo &&
    path[parent.length] <= hi
  );
};

const changedWindowsOf = (
  segment: MappingSegment,
  countBefore: (parent: Path) => number
) => {
  const raw: Window[] = [];
  const retyped: Retyped[] = [];

  segment.change.iterChangedRanges(
    (fromBefore, toBefore, fromAfter, toAfter) => {
      const ownerBefore = tokenOwnerOf(segment.before, fromBefore, toBefore);
      const ownerAfter =
        ownerBefore && tokenOwnerOf(segment.after, fromAfter, toAfter);

      if (ownerBefore && ownerAfter?.length === ownerBefore.length) {
        retyped.push({ after: ownerAfter, before: ownerBefore });
        return;
      }
      const containerBefore = containerOf(segment.before, fromBefore, toBefore);
      const containerAfter = containerOf(segment.after, fromAfter, toAfter);
      let parentBefore: Path = [];
      let parentAfter: Path = [];

      for (let length = 1; length <= containerBefore.length; length++) {
        const prefix = containerBefore.slice(0, length) as Path;
        const mapped = mapPathForward(segment, prefix);

        if (
          !mapped ||
          mapped.length !== length ||
          !startsWith(containerAfter, mapped)
        ) {
          break;
        }
        parentBefore = prefix;
        parentAfter = mapped;
      }
      const [loBefore, hiBefore] = childWindowOf(
        segment.before,
        fromBefore,
        toBefore,
        parentBefore,
        containerBefore
      );
      const [loAfter, hiAfter] = childWindowOf(
        segment.after,
        fromAfter,
        toAfter,
        parentAfter,
        containerAfter
      );

      raw.push({
        hiAfter,
        hiBefore,
        loAfter,
        loBefore,
        parentAfter,
        parentBefore,
      });
    }
  );

  const groups = new Map<string, Window[]>();

  for (const window of raw) {
    const key = pathKey(window.parentBefore);
    const group = groups.get(key) ?? [];

    group.push(window);
    groups.set(key, group);
  }
  const merged: Window[] = [];

  for (const group of groups.values()) {
    group.sort((left, right) => left.loBefore - right.loBefore);
    const joined: Window[] = [];

    for (const window of group) {
      const last = joined.at(-1);

      if (
        last &&
        (window.loBefore <= last.hiBefore + 1 ||
          window.loAfter <= last.hiAfter + 1)
      ) {
        joined[joined.length - 1] = {
          ...last,
          hiAfter: Math.max(last.hiAfter, window.hiAfter),
          hiBefore: Math.max(last.hiBefore, window.hiBefore),
          loAfter: Math.min(last.loAfter, window.loAfter),
          loBefore: Math.min(last.loBefore, window.loBefore),
        };
      } else {
        joined.push(window);
      }
    }
    const { parentAfter, parentBefore } = joined[0];
    const oldCount = countBefore(parentBefore);
    const newCount = childCountAt(segment.after, parentAfter);
    let shift = 0;
    let aligned = true;

    for (const window of joined) {
      if (window.loAfter !== window.loBefore + shift) aligned = false;
      shift +=
        window.hiAfter - window.loAfter - (window.hiBefore - window.loBefore);
    }
    if (aligned && oldCount + shift === newCount) {
      merged.push(...joined);
      continue;
    }
    const first = joined[0];
    const last = getDefined(joined.at(-1));
    const lo = Math.min(first.loBefore, first.loAfter);
    const suffix = Math.min(
      oldCount - 1 - last.hiBefore,
      newCount - 1 - last.hiAfter
    );

    merged.push({
      hiAfter: newCount - 1 - suffix,
      hiBefore: oldCount - 1 - suffix,
      loAfter: lo,
      loBefore: lo,
      parentAfter,
      parentBefore,
    });
  }
  const covered = (path: readonly number[], except?: Window) =>
    merged.some(
      (window) => window !== except && holdsSlotOf(window, path, 'before')
    );
  const windows = merged
    .filter((window) => !covered(window.parentBefore, window))
    .map((window) => ({
      position: segment.before.childPosition(
        window.parentBefore,
        window.loBefore
      ),
      window,
    }))
    .sort((left, right) => right.position - left.position)
    .map(({ window }) => window);

  return {
    retyped: retyped.filter(({ before }) => !covered(before)),
    windows,
  };
};

const MAPPED = new WeakMap<
  SnapshotIndex,
  WeakMap<
    RootChange,
    Readonly<{
      after: DocumentIndex;
      before: DocumentIndex;
      binding: NodeKeyBinding;
      result: SnapshotIndex;
    }>
  >
>();

export const mapSnapshotIndexThroughChange = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  index: SnapshotIndex,
  editor: Editor,
  discardedNodeKeys: ReadonlySet<NodeKey> = new Set(),
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[],
  binding: NodeKeyBinding = 'publish'
): SnapshotIndex => {
  assertMappingLengths(before, after, change);
  const repeatable =
    discardedNodeKeys.size === 0 && (runtimeCandidates?.length ?? 0) === 0;
  const known = repeatable ? MAPPED.get(index)?.get(change) : undefined;

  if (
    known &&
    known.before === before &&
    known.after === after &&
    known.binding === binding
  ) {
    return known.result;
  }
  sequenceOf(index, before);
  countCoreWork('identityTransitions');
  const publishNodeKeys = binding === 'publish';
  const bindNodeKey = publishNodeKeys ? setNodeKey : bindNodeKeyOnce;
  const sourceTopology = topologyOf(index, before, editor);
  const source = TOPOLOGIES.has(index)
    ? index
    : versionOf(sourceTopology, editor);
  const segment: MappingSegment = Object.freeze({ after, before, change });
  const builder = new TopologyBuilder(sourceTopology);
  const treeAt = (parent: Path) => {
    if (parent.length === 0) return builder.top;
    const cell = builder.cellAt(parent);

    if (cell === undefined) {
      throw new Error(`Identity owner holds no node at [${parent}].`);
    }
    return builder.treeOf(cell);
  };
  const ancestors = new Map<string, Path>();
  const retyped = new Map<string, Path>();
  const keepAbove = (path: readonly number[]) => {
    for (let length = 1; length < path.length; length++) {
      const prefix = path.slice(0, length) as Path;

      ancestors.set(pathKey(prefix), prefix);
    }
  };
  const moved = getSegmentMove(segment);
  const movedCell = moved && builder.cellAt(moved.path);
  const movesWhole =
    !!moved &&
    movedCell !== undefined &&
    discardedNodeKeys.size === 0 &&
    (runtimeCandidates?.length ?? 0) === 0 &&
    after.node(moved.targetPath) === before.node(moved.path) &&
    preparedRuntimePlacementsFromSegment(segment).length === 0;
  let windows: readonly Window[] = [];
  const assignments = new Map<string, NodeKey>();

  if (moved && movesWhole) {
    const sourceParent = moved.path.slice(0, -1) as Path;
    const targetParent = moved.targetPath.slice(0, -1) as Path;
    const mappedSourceParent =
      sourceParent.length === 0 ? [] : mapPathForward(segment, sourceParent);

    builder.deleteAt(treeAt(sourceParent), getDefined(moved.path.at(-1)));
    builder.insertAt(
      treeAt(targetParent),
      getDefined(moved.targetPath.at(-1)),
      getDefined(movedCell)
    );
    if (mappedSourceParent) keepAbove([...mappedSourceParent, 0]);
    keepAbove(moved.targetPath);
  } else {
    const found = changedWindowsOf(segment, (parent) =>
      builder.count(treeAt(parent))
    );

    ({ windows } = found);
    for (const window of windows) keepAbove([...window.parentAfter, 0]);
    for (const { after: path } of found.retyped) {
      keepAbove(path);
      retyped.set(pathKey(path), path);
    }
  }
  const inBefore = (path: readonly number[]) =>
    windows.some((window) => holdsSlotOf(window, path, 'before'));
  const inAfter = (path: readonly number[]) =>
    windows.some((window) => holdsSlotOf(window, path, 'after'));
  const available: KeyAvailability = (nodeKey, targetPath) => {
    const held = source.pathOf(nodeKey);

    if (!held || inBefore(held)) return true;
    if (inAfter(targetPath)) return false;
    const target = mapPathForward(segment, held);

    return !target || pathKey(target) === pathKey(targetPath);
  };

  if (!movesWhole) {
    const placements = preparedRuntimePlacementsFromSegment(segment);
    const retainedPlacements = publishNodeKeys
      ? placements.filter(
          (placement) =>
            !placement.fromDeferredView ||
            placementKeysAdopted(placement, editor)
        )
      : placements;
    const claimed = profileCoreDuration(
      publishNodeKeys
        ? 'runtime-index-publish-changed'
        : 'runtime-index-map-changed',
      () =>
        mapChangedNodeKeys(
          segment,
          source,
          editor,
          discardedNodeKeys,
          placements,
          binding,
          available,
          runtimeCandidates
        )
    );
    const { usedNodeKeys } = claimed;

    for (const [path, nodeKey] of claimed.assignments) {
      assignments.set(path, nodeKey);
    }
    const claimedInside = new Set<string>();

    for (const targetKey of assignments.keys()) {
      const path = targetKey === '' ? [] : targetKey.split('.');

      for (let length = 1; length < path.length; length++) {
        claimedInside.add(path.slice(0, length).join('.'));
      }
    }
    const usable = (nodeKey: NodeKey | null | undefined): nodeKey is NodeKey =>
      !!nodeKey &&
      !discardedNodeKeys.has(nodeKey) &&
      builder.cellOfKey(nodeKey) === undefined;
    const keyOf: KeyOf = (node, path) => {
      countCoreWork('identityClaimsExamined');
      const claim = assignments.get(pathKey(path));
      let nodeKey: NodeKey | null = null;

      if (claim && builder.cellOfKey(claim) === undefined) {
        nodeKey = claim;
      } else {
        const own = getNodeKeyForNode(node, editor);

        if (usable(own) && !(usedNodeKeys.has(own) && own !== claim)) {
          nodeKey = own;
        }
        if (!nodeKey) {
          for (const placement of retainedPlacements) {
            const local = preparedLocalPath(placement, path);
            const prepared = local
              ? getPreparedDocumentNodeKey(placement.slice, local)
              : null;

            if (prepared && usable(prepared) && !usedNodeKeys.has(prepared)) {
              nodeKey = prepared;
              break;
            }
          }
        }
        if (!nodeKey) {
          const sourcePath = mapPathBackward(segment, path);
          const inherited = sourcePath ? source.keyAt(sourcePath) : null;

          if (usable(inherited) && !usedNodeKeys.has(inherited)) {
            nodeKey = inherited;
          }
        }
        nodeKey ??= publishNodeKeys
          ? assignFreshNodeKey(node, editor)
          : allocateDraftNodeKey();
      }
      if (getNodeKeyForNode(node, editor) !== nodeKey) {
        bindNodeKey(node, editor, nodeKey);
      }

      return nodeKey;
    };

    const parents = windows.map((window) =>
      window.parentBefore.length === 0
        ? ROOT_LIST
        : getDefined(builder.cellAt(window.parentBefore))
    );
    const listOf = (parent: number) =>
      parent === ROOT_LIST ? builder.top : builder.treeOf(parent);
    const removed: Array<readonly [number, Descendant]> = [];

    windows.forEach((window, at) => {
      const oldSpan = window.hiBefore - window.loBefore + 1;
      const newSpan = window.hiAfter - window.loAfter + 1;
      const shared = Math.min(oldSpan, newSpan);

      if (oldSpan > WINDOW_PAGE && newSpan > WINDOW_PAGE) {
        countCoreWork('wholeListPasses');
      }
      const oldNode = (offset: number) =>
        before.node([
          ...window.parentBefore,
          window.loBefore + offset,
        ]) as unknown as Descendant;

      for (let offset = oldSpan - 1; offset >= shared; offset--) {
        removed.push([
          builder.deleteAt(listOf(parents[at]), window.loBefore + offset),
          oldNode(offset),
        ]);
      }
      for (let offset = 0; offset < shared; offset++) {
        removed.push([
          getDefined(builder.at(listOf(parents[at]), window.loBefore + offset)),
          oldNode(offset),
        ]);
      }
    });
    const survivors = new Map<object, number>();

    for (const [cell, node] of removed) survivors.set(node, cell);
    const reused = windows.map(() => new Map<number, number>());
    const reusedCells = new Set<number>();

    windows.forEach((window, at) => {
      const newSpan = window.hiAfter - window.loAfter + 1;

      for (let offset = 0; offset < newSpan; offset++) {
        const path = [...window.parentAfter, window.loAfter + offset] as Path;
        const node = after.node(path) as unknown as Descendant;
        const cell = survivors.get(node);

        if (cell === undefined) continue;
        const nodeKey = builder.cell(cell).key;
        const claim = assignments.get(pathKey(path));

        if (
          nodeKey &&
          !discardedNodeKeys.has(nodeKey) &&
          getNodeKeyForNode(node, editor) === nodeKey &&
          (claim === undefined
            ? !usedNodeKeys.has(nodeKey)
            : claim === nodeKey) &&
          !claimedInside.has(pathKey(path))
        ) {
          reused[at].set(offset, cell);
          reusedCells.add(cell);
          survivors.delete(node);
        }
      }
    });
    for (const [cell] of removed) {
      if (!reusedCells.has(cell)) builder.release(cell, reusedCells);
    }
    for (let at = windows.length - 1; at >= 0; at--) {
      const window = windows[at];
      const oldSpan = window.hiBefore - window.loBefore + 1;
      const newSpan = window.hiAfter - window.loAfter + 1;
      const shared = Math.min(oldSpan, newSpan);

      for (let offset = 0; offset < newSpan; offset++) {
        const path = [...window.parentAfter, window.loAfter + offset] as Path;
        const cell =
          reused[at].get(offset) ??
          builder.admit(after.node(path) as unknown as Descendant, path, keyOf);
        const list = listOf(parents[at]);

        if (offset < shared) {
          builder.replaceAt(list, window.loAfter + offset, cell);
        } else {
          builder.insertAt(list, window.loAfter + offset, cell);
        }
      }
    }
  }

  for (const [targetKey, nodeKey] of assignments) {
    if (targetKey === '' || ancestors.has(targetKey)) continue;
    const path = targetKey.split('.').map(Number);

    if (inAfter(path)) continue;
    const cell = builder.cellAt(path);

    if (
      cell !== undefined &&
      builder.cell(cell).key !== nodeKey &&
      builder.cellOfKey(nodeKey) === undefined
    ) {
      builder.rekey(cell, nodeKey);
    }
  }
  for (const path of [...ancestors.values(), ...retyped.values()]) {
    const cell = getDefined(builder.cellAt(path));
    const node = after.node(path) as unknown as Descendant;

    builder.retype(cell, node);
    const nodeKey = builder.cell(cell).key;

    if (nodeKey && getNodeKeyForNode(node, editor) !== nodeKey) {
      bindNodeKey(node, editor, nodeKey);
    }
  }

  const mapped = versionOf(builder.finish(), editor, after);

  if (repeatable) {
    let byChange = MAPPED.get(index);

    if (!byChange) {
      byChange = new WeakMap();
      MAPPED.set(index, byChange);
    }
    byChange.set(change, { after, before, binding, result: mapped });
  }

  return mapped;
};

/** @internal */
export const publishSnapshotIndex = (
  editor: Editor,
  children: ChildrenList,
  index: SnapshotIndex
) => {
  if (registeredVersion(editor, children) !== index) {
    register(editor, children, index);
  }
};

export const advancePathStableSnapshotIndex = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  index: SnapshotIndex,
  editor: Editor,
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[],
  binding: NodeKeyBinding = 'publish'
): SnapshotIndex => {
  assertMappingLengths(before, after, change);
  const forks = sequenceOf(index, before) === 'fork';
  const topology = topologyOf(index, before, editor);
  const source =
    TOPOLOGIES.has(index) && !forks ? index : versionOf(topology, editor);
  const keyed = (runtimeCandidates ?? []).map((candidate) => {
    const path = [...candidate.path] as Path;

    if (after.node(path) !== candidate.node) {
      throw new Error(
        `Node key candidate at [${path}] does not belong to the published document.`
      );
    }

    return { node: candidate.node, nodeKey: source.keyAt(path) };
  });

  if (
    keyed.some(({ node, nodeKey }) => {
      const currentNodeKey = getNodeKeyForNode(node, editor);

      return currentNodeKey !== null && currentNodeKey !== nodeKey;
    })
  ) {
    return mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      source,
      editor,
      new Set(),
      runtimeCandidates,
      binding
    );
  }
  const bindNodeKey = binding === 'publish' ? setNodeKey : bindNodeKeyOnce;

  for (const { node, nodeKey } of keyed) {
    if (nodeKey) bindNodeKey(node, editor, nodeKey);
  }
  const sealed = new Set<string>();

  change.iterChangedRanges((_fromBefore, _toBefore, fromAfter, toAfter) => {
    for (const { path } of after.nodeRangesTouching(fromAfter, toAfter)) {
      for (let length = 1; length <= path.length; length++) {
        const prefix = path.slice(0, length) as Path;
        const key = pathKey(prefix);

        if (sealed.has(key)) continue;
        sealed.add(key);
        countCoreWork('identityClaimsExamined');
        const node = after.node(prefix) as unknown as Descendant;
        const nodeKey = source.keyAt(prefix);

        if (nodeKey && getNodeKeyForNode(node, editor) !== nodeKey) {
          bindNodeKey(node, editor, nodeKey);
        }
      }
    }
  });

  const advanced = binding === 'publish' ? source : versionOf(topology, editor);
  const movedFrom =
    (advanced === index ? VERSION_DOCUMENTS.get(index)?.movedFrom : null) ??
    new WeakSet<DocumentIndex>();

  movedFrom.add(before);
  VERSION_DOCUMENTS.set(advanced, { document: after, movedFrom });
  return advanced;
};
