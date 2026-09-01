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
  getOrCreateNodeKey,
  getNodeKeyForNode,
  setNodeKey,
} from '../utils/node-keys';
import type { DocumentChangeRuntimeCandidate } from './change/classification';
import type { DocumentIndex } from './change/document-index';
import { getRootChangeRelocations } from './change/mapping';
import type { RootChange } from './change/root-change';
import {
  PreparedTokenSlice,
  getDocumentSliceNodeKeys,
  getPreparedDocumentSlice,
  getPreparedDocumentNodeKey,
  getPreparedDocumentRuntimePath,
  isDeferredPreparedDocumentSlice,
  type JsonNode,
} from './change/tokens';
import { profileCoreDuration } from './profiling';

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
  (nodeKey: NodeKey) => Path | null | undefined
>();

export const EMPTY_RUNTIME_INDEX: SnapshotIndex = Object.freeze({
  entries: () => EMPTY_ENTRIES,
  keyAt: () => null,
  pathOf: () => null,
});

SNAPSHOT_ELEMENT_ENTRIES.set(EMPTY_RUNTIME_INDEX, () => EMPTY_ELEMENT_ENTRIES);

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

  SNAPSHOT_INDEX_CACHED_PATHS.set(index, (nodeKey) =>
    idToPathCache.get(nodeKey)
  );

  const queryElements = createElementEntryQuery(elementEntriesByType, keyAt);

  SNAPSHOT_ELEMENT_ENTRIES.set(index, (types) => {
    if (types.length > 0) ensureElementPaths();
    return queryElements(types);
  });
  return index;
};

type StructuralSnapshotIndexMappingSegment = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  change: RootChange;
  span: number;
}>;

type PathStableSnapshotIndexMappingSegment = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  change: null;
  span: number;
}>;

type SnapshotIndexMappingSegment =
  | PathStableSnapshotIndexMappingSegment
  | StructuralSnapshotIndexMappingSegment;

/**
 * Canonical, compacted path history shared by sparse indexes.
 *
 * @internal
 */
export type CanonicalDocumentPathMapping =
  readonly SnapshotIndexMappingSegment[];

/**
 * Empty canonical path history for a newly indexed document.
 *
 * @internal
 */
export const EMPTY_CANONICAL_DOCUMENT_PATH_MAPPING = Object.freeze(
  []
) as CanonicalDocumentPathMapping;

type MappedSnapshotIndexDescriptor = Readonly<{
  base: SnapshotIndex;
  discardedNodeKeys: ReadonlySet<NodeKey>;
  preparedRuntimePlacements: readonly PreparedRuntimePlacement[];
  runtimeAssignments: ReadonlyArray<readonly [NodeKey, Path]>;
  segments: readonly SnapshotIndexMappingSegment[];
}>;

type PreparedRuntimePlacement = Readonly<{
  index: number;
  parentPath: Path;
  segments: readonly SnapshotIndexMappingSegment[];
  slice: PreparedTokenSlice;
}>;

const MAPPED_SNAPSHOT_INDEXES = new WeakMap<
  SnapshotIndex,
  MappedSnapshotIndexDescriptor
>();

type MappedElementIndexDescriptor = Readonly<{
  additions: readonly ElementPathEntry[];
  after: DocumentIndex;
  base: SnapshotIndex;
  segments: readonly SnapshotIndexMappingSegment[];
}>;

const MAPPED_ELEMENT_INDEXES = new WeakMap<
  SnapshotIndex,
  MappedElementIndexDescriptor
>();

/**
 * Capture lazy provenance so an aborted editor draft can restore it.
 *
 * @internal
 */
export const captureSnapshotIndexMapping = (index: SnapshotIndex) => {
  const descriptor = MAPPED_SNAPSHOT_INDEXES.get(index);
  const elementDescriptor = MAPPED_ELEMENT_INDEXES.get(index);

  return () => {
    if (descriptor) MAPPED_SNAPSHOT_INDEXES.set(index, descriptor);
    else MAPPED_SNAPSHOT_INDEXES.delete(index);
    if (elementDescriptor) {
      MAPPED_ELEMENT_INDEXES.set(index, elementDescriptor);
    } else {
      MAPPED_ELEMENT_INDEXES.delete(index);
    }
  };
};
const SEGMENT_MOVES = new WeakMap<
  SnapshotIndexMappingSegment,
  ReturnType<RootChange['movedNode']>
>();
const SEGMENT_RELOCATIONS = new WeakMap<
  SnapshotIndexMappingSegment,
  ReturnType<typeof getRootChangeRelocations>
>();
const SEGMENT_MAY_RELOCATE = new WeakMap<
  SnapshotIndexMappingSegment,
  boolean
>();
const INVERSE_MAPPING_SEGMENTS = new WeakMap<
  SnapshotIndexMappingSegment,
  SnapshotIndexMappingSegment
>();
let nextDraftNodeKeyOrdinal = 0;

const allocateDraftNodeKey = (): NodeKey => {
  const ordinal = nextDraftNodeKeyOrdinal;

  nextDraftNodeKeyOrdinal += 1;

  return `d${ordinal.toString(36)}` as NodeKey;
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

const createMappingSegment = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  span = 1
): StructuralSnapshotIndexMappingSegment => {
  assertMappingLengths(before, after, change);

  return Object.freeze({ after, before, change, span });
};

const createPathStableMappingSegment = (
  before: DocumentIndex,
  after: DocumentIndex,
  span = 1
): PathStableSnapshotIndexMappingSegment =>
  Object.freeze({ after, before, change: null, span });

const compactMappingSegments = (
  previous: readonly SnapshotIndexMappingSegment[],
  next: SnapshotIndexMappingSegment
) => {
  const segments = [...previous, next];

  if (
    segments.length > 1 &&
    getDefined(segments.at(-1)).change === null &&
    getDefined(segments.at(-2)).change === null
  ) {
    const right = getDefined(segments.pop());
    const left = getDefined(segments.pop());

    segments.push(
      createPathStableMappingSegment(
        left.before,
        right.after,
        left.span + right.span
      )
    );
  }

  // Consecutive path-stable changes share one identity-path segment: composing
  // their document-wide token changes would create periodic O(document) carry
  // costs even though every runtime path stays identical. Structural
  // equal-span carries still form a binary counter, so each structural edit
  // participates in at most O(log edits) compositions. Path-stable segments
  // are barriers because token positions can change across them.
  while (
    segments.length > 1 &&
    getDefined(segments.at(-1)).span === getDefined(segments.at(-2)).span &&
    getDefined(segments.at(-1)).change !== null &&
    getDefined(segments.at(-2)).change !== null
  ) {
    const right = segments.pop() as StructuralSnapshotIndexMappingSegment;
    const left = segments.pop() as StructuralSnapshotIndexMappingSegment;

    if (left.after.length !== right.before.length) {
      throw new Error(
        `Snapshot index mappings are not sequential: previous target length ${left.after.length}, next source length ${right.before.length}.`
      );
    }

    segments.push(
      createMappingSegment(
        left.before,
        right.after,
        left.change.compose(right.change),
        left.span + right.span
      )
    );
  }

  return Object.freeze(segments);
};

const getSegmentMove = (segment: SnapshotIndexMappingSegment) => {
  if (!segment.change) return null;
  if (SEGMENT_MOVES.has(segment)) return SEGMENT_MOVES.get(segment) ?? null;

  const move = segment.change.movedNode(segment.before);

  SEGMENT_MOVES.set(segment, move);

  return move;
};

const getSegmentRelocations = (segment: SnapshotIndexMappingSegment) => {
  if (!segment.change) return Object.freeze([]);
  let relocations = SEGMENT_RELOCATIONS.get(segment);

  if (!relocations) {
    relocations = getRootChangeRelocations(
      segment.change,
      segment.before,
      segment.after
    );
    SEGMENT_RELOCATIONS.set(segment, relocations);
  }

  return relocations;
};

const mapRelocatedPath = (
  segment: SnapshotIndexMappingSegment,
  path: Path,
  direction: 'backward' | 'forward'
): Path | null => {
  if (!segment.change) return null;
  let mayRelocate = SEGMENT_MAY_RELOCATE.get(segment);

  if (mayRelocate === undefined) {
    mayRelocate = segment.change.data.some(
      (data) =>
        data instanceof PreparedTokenSlice &&
        !getPreparedDocumentSlice(data) &&
        !isDeferredPreparedDocumentSlice(data) &&
        data.tokens.some((token) => token.kind === 'open')
    );
    SEGMENT_MAY_RELOCATE.set(segment, mayRelocate);
  }
  if (!mayRelocate) return null;

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

const positionWasReplaced = (
  change: RootChange,
  position: number,
  side: 'after' | 'before'
) => {
  let before = 0;
  let after = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const outputLength = inserted < 0 ? length : inserted;

    if (
      inserted >= 0 &&
      (side === 'before'
        ? before <= position && position < before + length
        : after <= position && position < after + outputLength)
    ) {
      return true;
    }

    before += length;
    after += outputLength;
  }

  return false;
};

const mapPathForward = (
  segment: SnapshotIndexMappingSegment,
  path: Path
): Path | null => {
  if (!segment.change) {
    try {
      segment.after.node(path);

      return [...path] as Path;
    } catch {
      return null;
    }
  }
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

  if (positionWasReplaced(segment.change, position, 'before')) {
    return mapRelocatedPath(segment, path, 'forward');
  }

  const mapped = segment.change.mapPos(position, 1, 'after');

  if (mapped === null) return mapRelocatedPath(segment, path, 'forward');
  const entry = segment.after.nodeStartingAt(mapped);

  return entry?.from === mapped
    ? ([...entry.path] as Path)
    : mapRelocatedPath(segment, path, 'forward');
};

const mapPathBackward = (
  segment: SnapshotIndexMappingSegment,
  path: Path
): Path | null => {
  if (!segment.change) {
    try {
      segment.before.node(path);

      return [...path] as Path;
    } catch {
      return null;
    }
  }
  let inverse = INVERSE_MAPPING_SEGMENTS.get(segment);

  if (!inverse) {
    inverse = createMappingSegment(
      segment.after,
      segment.before,
      segment.change.invert(segment.before),
      segment.span
    );
    INVERSE_MAPPING_SEGMENTS.set(segment, inverse);
  }

  return mapPathForward(inverse, path);
};

/**
 * Append one root change using the snapshot index's binary compaction.
 *
 * @internal
 */
export const appendCanonicalDocumentPathMapping = (
  mapping: CanonicalDocumentPathMapping,
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange
): CanonicalDocumentPathMapping =>
  compactMappingSegments(mapping, createMappingSegment(before, after, change));

/**
 * Map one stable node path through a compacted canonical history.
 *
 * @internal
 */
export const mapCanonicalDocumentPath = (
  mapping: CanonicalDocumentPathMapping,
  source: readonly number[],
  acceptsPathStableReplacement?: (before: JsonNode, after: JsonNode) => boolean
): Path | null => {
  let path: Path | null = [...source] as Path;

  for (const segment of mapping) {
    const mapped = mapPathForward(segment, path);

    if (mapped) {
      path = mapped;
      continue;
    }
    if (acceptsPathStableReplacement) {
      try {
        if (
          acceptsPathStableReplacement(
            segment.before.node(path),
            segment.after.node(path)
          )
        ) {
          continue;
        }
      } catch {
        // Missing source or target paths cannot be a stable replacement.
      }
    }

    return null;
  }

  return path;
};

/**
 * Test-only structural bound for shared canonical path histories.
 *
 * @internal
 */
export const getCanonicalDocumentPathMappingStats = (
  mapping: CanonicalDocumentPathMapping
) => {
  const documents = new Set<DocumentIndex>();

  for (const segment of mapping) {
    documents.add(segment.before);
    documents.add(segment.after);
  }

  return Object.freeze({
    mappedChanges: mapping.reduce((count, segment) => count + segment.span, 0),
    retainedDocuments: documents.size,
    segments: mapping.length,
  });
};

const preparedRuntimePlacementsFromSegment = (
  segment: StructuralSnapshotIndexMappingSegment
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
              index: boundary.index,
              parentPath: Object.freeze([...boundary.parentPath]),
              segments: Object.freeze([]),
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

const advancePreparedRuntimePlacements = (
  placements: readonly PreparedRuntimePlacement[],
  segment: SnapshotIndexMappingSegment
) =>
  placements.map((placement) =>
    Object.freeze({
      ...placement,
      segments: compactMappingSegments(placement.segments, segment),
    })
  );

const preparedOriginPath = (
  placement: PreparedRuntimePlacement,
  localPath: readonly number[]
): Path | null => {
  const rootIndex = localPath[0];

  if (rootIndex === undefined) return null;

  return [
    ...placement.parentPath,
    placement.index + rootIndex,
    ...localPath.slice(1),
  ] as Path;
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
  const prepared = getPreparedDocumentSlice(placement.slice);

  if (!prepared || rootIndex < 0 || rootIndex >= prepared.nodes.length) {
    return null;
  }

  return [rootIndex, ...originPath.slice(placement.parentPath.length + 1)];
};

const mapPreparedPathForward = (
  placement: PreparedRuntimePlacement,
  path: Path
) => {
  let current: Path | null = path;

  for (const segment of placement.segments) {
    current = mapPathForward(segment, current);
    if (!current) return null;
  }

  return current;
};

const mapPreparedPathBackward = (
  placement: PreparedRuntimePlacement,
  path: Path
) => {
  let current: Path | null = path;

  for (let index = placement.segments.length - 1; index >= 0; index--) {
    current = mapPathBackward(placement.segments[index], current);
    if (!current) return null;
  }

  return current;
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

const collectChangedElementPaths = (
  segment: StructuralSnapshotIndexMappingSegment
) => {
  const paths = new Map<string, ElementPathEntry>();
  const addRange = (from: number, to: number) => {
    for (const { path } of segment.after.nodeRangesTouching(from, to)) {
      try {
        const node = segment.after.node(path);

        if (
          'children' in node &&
          Array.isArray(node.children) &&
          typeof node.type === 'string'
        ) {
          const frozenPath = Object.freeze([...path]);

          paths.set(
            pathKey(frozenPath),
            Object.freeze({ path: frozenPath, type: node.type })
          );
        }
      } catch {
        // A touching boundary may no longer address a node after replacement.
      }
    }
  };

  segment.change.iterChangedRanges(
    (_fromBefore, _toBefore, fromAfter, toAfter) => {
      addRange(fromAfter, toAfter);
      addRange(fromAfter, fromAfter);
      addRange(toAfter, toAfter);
    }
  );

  return [...paths.values()];
};

const mapChangedNodeKeys = (
  segment: StructuralSnapshotIndexMappingSegment,
  index: SnapshotIndex,
  editor: Editor,
  discarded: ReadonlySet<NodeKey>,
  preparedRuntimePlacements: readonly PreparedRuntimePlacement[],
  publishNodeKeys: boolean,
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[]
) => {
  const sourceHasPreparedRuntimePlacements =
    (MAPPED_SNAPSHOT_INDEXES.get(index)?.preparedRuntimePlacements.length ??
      0) > 0;
  const sourcePaths = new Map<string, Path>();
  const targetPaths = new Map<string, Path>();
  const addTouching = (
    document: DocumentIndex,
    paths: Map<string, Path>,
    from: number,
    to: number
  ) => {
    for (const { path } of document.nodeRangesTouching(from, to)) {
      const candidate = [...path] as Path;

      paths.set(pathKey(candidate), candidate);
    }
    for (const position of [from, to]) {
      for (const { path } of document.nodeRangesTouching(position)) {
        const candidate = [...path] as Path;

        paths.set(pathKey(candidate), candidate);
      }
    }
  };

  segment.change.iterChangedRanges(
    (fromBefore, toBefore, fromAfter, toAfter) => {
      addTouching(segment.before, sourcePaths, fromBefore, toBefore);
      if (
        sourceHasPreparedRuntimePlacements ||
        ((!runtimeCandidates || runtimeCandidates.length === 0) &&
          preparedRuntimePlacements.length === 0)
      ) {
        addTouching(segment.after, targetPaths, fromAfter, toAfter);
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

  const isPreparedTargetPath = (path: Path) =>
    preparedRuntimePlacements.some((placement) =>
      preparedLocalPath(placement, path)
    );

  const relocations = segment.change.data.some(
    (data) =>
      data instanceof PreparedTokenSlice &&
      !getPreparedDocumentSlice(data) &&
      !isDeferredPreparedDocumentSlice(data) &&
      data.tokens.some((token) => token.kind === 'open')
  )
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
  const assignments: Array<readonly [NodeKey, Path]> = [];
  const claim = (nodeKey: NodeKey, targetPath: Path) => {
    const targetKey = pathKey(targetPath);

    if (
      discarded.has(nodeKey) ||
      usedNodeKeys.has(nodeKey) ||
      usedTargetPaths.has(targetKey)
    ) {
      return false;
    }

    const targetNode = segment.after.node(targetPath);

    if (publishNodeKeys && getNodeKeyForNode(targetNode, editor) !== nodeKey) {
      setNodeKey(targetNode, editor, nodeKey);
    }
    usedNodeKeys.add(nodeKey);
    usedTargetPaths.add(targetKey);
    assignments.push(Object.freeze([nodeKey, targetPath] as const));

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
          const sourcePath = SNAPSHOT_INDEX_CACHED_PATHS.get(index)?.(nodeKey);
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

  // A live target's explicit identity outranks positional continuation.
  for (const targetPath of orderedTargets) {
    const nodeKey = getNodeKeyForNode(segment.after.node(targetPath), editor);

    if (nodeKey) claim(nodeKey, targetPath);
  }

  for (const sourcePath of orderedSources) {
    const targetPath = mapPathForward(segment, sourcePath);
    const nodeKey = index.keyAt(sourcePath);

    if (targetPath && nodeKey) claim(nodeKey, targetPath);
  }

  // Non-prepared inserted or cloned nodes receive identities before
  // publication. Prepared forests instead reserve deterministic ranges and
  // bind each node only when its snapshot path or identity is queried.
  for (const targetPath of orderedTargets) {
    const targetKey = pathKey(targetPath);

    if (usedTargetPaths.has(targetKey)) continue;
    if (isPreparedTargetPath(targetPath)) continue;
    const targetNode = segment.after.node(targetPath);
    const currentNodeKey = getNodeKeyForNode(targetNode, editor);

    if (
      currentNodeKey &&
      !discarded.has(currentNodeKey) &&
      !usedNodeKeys.has(currentNodeKey)
    ) {
      claim(currentNodeKey, targetPath);
      continue;
    }

    claim(
      publishNodeKeys
        ? assignFreshNodeKey(targetNode, editor)
        : allocateDraftNodeKey(),
      targetPath
    );
  }

  return Object.freeze(assignments);
};

/**
 * Test-only visibility into retained lazy mapping state.
 *
 * @internal
 */
export const getSnapshotIndexMappingStats = (index: SnapshotIndex) => {
  const descriptor = MAPPED_SNAPSHOT_INDEXES.get(index);

  if (!descriptor) {
    return Object.freeze({
      mappedChanges: 0,
      retainedDocuments: 0,
      retainedTokenUnits: 0,
      retainedTopLevelReferenceBytes: 0,
      segments: 0,
    });
  }

  const documents = new Set<DocumentIndex>();

  for (const segment of descriptor.segments) {
    documents.add(segment.before);
    documents.add(segment.after);
  }

  return Object.freeze({
    mappedChanges: descriptor.segments.reduce(
      (count, segment) => count + segment.span,
      0
    ),
    retainedDocuments: documents.size,
    retainedTokenUnits: [...documents].reduce(
      (count, document) => count + document.length,
      0
    ),
    retainedTopLevelReferenceBytes: [...documents].reduce(
      (bytes, document) => bytes + document.value.length * 8,
      0
    ),
    segments: descriptor.segments.length,
  });
};

const queryMappedElementEntries = (
  index: SnapshotIndex,
  types: readonly string[]
): readonly InternalEditorRuntimeElementEntry[] => {
  const descriptor = MAPPED_ELEMENT_INDEXES.get(index);

  if (!descriptor) return EMPTY_ELEMENT_ENTRIES;
  const requested = new Set(types);

  if (requested.size === 0) return EMPTY_ELEMENT_ENTRIES;
  const paths = new Map<string, ElementPathEntry>();
  const addCurrent = (path: Path) => {
    try {
      const node = descriptor.after.node(path);

      if (
        'children' in node &&
        Array.isArray(node.children) &&
        typeof node.type === 'string' &&
        requested.has(node.type)
      ) {
        const frozenPath = Object.freeze([...path]);

        paths.set(
          pathKey(frozenPath),
          Object.freeze({ path: frozenPath, type: node.type })
        );
      }
    } catch {
      // Replaced source entries do not survive in this snapshot.
    }
  };

  for (const entry of getSnapshotIndexElementEntries(descriptor.base, [
    ...requested,
  ])) {
    let path: Path | null = entry.path;

    for (const segment of descriptor.segments) {
      path = mapPathForward(segment, path);
      if (!path) break;
    }
    if (path) addCurrent(path);
  }
  for (const entry of descriptor.additions) {
    if (requested.has(entry.type)) addCurrent(entry.path);
  }

  return Object.freeze(
    [...paths.values()]
      .flatMap(({ path, type }) => {
        const nodeKey = index.keyAt(path);

        return nodeKey
          ? [Object.freeze({ path, nodeKey, type })]
          : EMPTY_ELEMENT_ENTRIES;
      })
      .sort((left, right) => comparePaths(left.path, right.path))
  );
};

/** Map stable node identities through one canonical root change. */
export const mapSnapshotIndexThroughChange = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  index: SnapshotIndex,
  editor: Editor,
  discardedNodeKeys: ReadonlySet<NodeKey> = new Set(),
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[],
  publishNodeKeys = true
): SnapshotIndex => {
  assertMappingLengths(before, after, change);

  const previous = MAPPED_SNAPSHOT_INDEXES.get(index);
  const previousAfter = previous?.segments.at(-1)?.after;

  if (previousAfter && previousAfter.length !== before.length) {
    throw new Error(
      `Snapshot index mappings are not sequential: previous target length ${previousAfter.length}, next source length ${before.length}.`
    );
  }

  const segment = createMappingSegment(before, after, change);
  const newPreparedRuntimePlacements =
    preparedRuntimePlacementsFromSegment(segment);

  // Detached transaction specs still need a sparse identity overlay for draft
  // selection mapping. Publication remains the only authority allowed to
  // allocate or attach node keys to nodes.
  const runtimeAssignments = profileCoreDuration(
    publishNodeKeys
      ? 'runtime-index-publish-changed'
      : 'runtime-index-map-changed',
    () =>
      mapChangedNodeKeys(
        segment,
        index,
        editor,
        discardedNodeKeys,
        newPreparedRuntimePlacements,
        publishNodeKeys,
        runtimeCandidates
      )
  );
  const retainedRuntimeAssignments = (
    previous?.runtimeAssignments ?? []
  ).flatMap(([nodeKey, path]) => {
    if (discardedNodeKeys.has(nodeKey)) return [];
    const targetPath = mapPathForward(segment, path);

    return targetPath ? [Object.freeze([nodeKey, targetPath] as const)] : [];
  });
  const assignedNodeKeys = new Set(
    runtimeAssignments.map(([nodeKey]) => nodeKey)
  );
  const assignedPaths = new Set(
    runtimeAssignments.map(([, path]) => pathKey(path))
  );
  const allRuntimeAssignments = Object.freeze([
    ...retainedRuntimeAssignments.filter(
      ([nodeKey, path]) =>
        !assignedNodeKeys.has(nodeKey) && !assignedPaths.has(pathKey(path))
    ),
    ...runtimeAssignments,
  ]);
  const { descriptor, segments } = profileCoreDuration(
    'runtime-index-map-descriptor',
    () => {
      const innerSegments = compactMappingSegments(
        previous?.segments ?? [],
        segment
      );
      const innerDescriptor: MappedSnapshotIndexDescriptor = Object.freeze({
        base: previous?.base ?? index,
        discardedNodeKeys: new Set([
          ...(previous?.discardedNodeKeys ?? []),
          ...discardedNodeKeys,
        ]),
        preparedRuntimePlacements: Object.freeze([
          ...advancePreparedRuntimePlacements(
            previous?.preparedRuntimePlacements ?? [],
            segment
          ),
          ...newPreparedRuntimePlacements,
        ]),
        runtimeAssignments: allRuntimeAssignments,
        segments: innerSegments,
      });

      return { descriptor: innerDescriptor, segments: innerSegments };
    }
  );
  const previousElementDescriptor = MAPPED_ELEMENT_INDEXES.get(index);
  const elementSegments = compactMappingSegments(
    previousElementDescriptor?.segments ?? [],
    segment
  );
  const additions = new Map<string, ElementPathEntry>();
  const retainAddition = (entry: ElementPathEntry) => {
    const path = mapPathForward(segment, entry.path);

    if (!path) return;
    try {
      const node = after.node(path);

      if (
        'children' in node &&
        Array.isArray(node.children) &&
        typeof node.type === 'string'
      ) {
        const frozenPath = Object.freeze([...path]);

        additions.set(
          pathKey(frozenPath),
          Object.freeze({ path: frozenPath, type: node.type })
        );
      }
    } catch {
      // Removed additions have no target entry.
    }
  };

  for (const entry of previousElementDescriptor?.additions ?? []) {
    retainAddition(entry);
  }
  for (const entry of collectChangedElementPaths(segment)) {
    additions.set(pathKey(entry.path), entry);
  }
  const elementDescriptor: MappedElementIndexDescriptor = Object.freeze({
    additions: Object.freeze([...additions.values()]),
    after,
    base: previousElementDescriptor?.base ?? index,
    segments: elementSegments,
  });
  const discarded = descriptor.discardedNodeKeys;
  const idToPathCache = new Map<NodeKey, Path | null>();
  const pathToIdCache = new Map<string, NodeKey | null>();
  const materializedElementPathsByType = new Map<string, ElementPathEntry[]>();
  let activeDescriptor: MappedSnapshotIndexDescriptor | null = descriptor;
  let activeSegments: readonly SnapshotIndexMappingSegment[] | null = segments;
  let currentDocument: DocumentIndex | null = getDefined(segments.at(-1)).after;
  let materializedEntries: ReadonlyArray<readonly [NodeKey, Path]> | undefined;
  let mappedIndex: SnapshotIndex;

  const nodeAt = (path: Path) => {
    try {
      return currentDocument?.node(path) ?? null;
    } catch {
      return null;
    }
  };
  const cache = (nodeKey: NodeKey, path: Path) => {
    const frozenPath = Object.freeze([...path]);
    const existingPath = idToPathCache.get(nodeKey);
    const existingNodeKey = pathToIdCache.get(pathKey(frozenPath));

    if (
      (existingPath && pathKey(existingPath) !== pathKey(frozenPath)) ||
      (existingNodeKey && existingNodeKey !== nodeKey)
    ) {
      throw new Error(
        `Snapshot index node keys must be injective: ${nodeKey} at [${frozenPath}] conflicts with ${
          existingPath
            ? `[${existingPath}]${
                nodeAt(existingPath) === nodeAt(frozenPath)
                  ? ' (same node)'
                  : ''
              }`
            : existingNodeKey
        }.`
      );
    }

    idToPathCache.set(nodeKey, frozenPath);
    pathToIdCache.set(pathKey(frozenPath), nodeKey);

    return frozenPath;
  };

  for (const [nodeKey, path] of descriptor.runtimeAssignments) {
    cache(nodeKey, path);
  }
  const targetPathFor = (path: Path) => {
    let targetPath: Path | null = path;

    for (const innerSegment of getDefined(activeSegments)) {
      targetPath = mapPathForward(innerSegment, targetPath);

      if (!targetPath) return null;
    }

    return targetPath;
  };
  const sourcePathFor = (path: Path) => {
    let sourcePath: Path | null = path;

    for (
      let innerIndex = getDefined(activeSegments).length - 1;
      innerIndex >= 0;
      innerIndex--
    ) {
      sourcePath = mapPathBackward(
        getDefined(activeSegments)[innerIndex],
        sourcePath
      );

      if (!sourcePath) return null;
    }

    return sourcePath;
  };
  const preparedNodeKeyAtPath = (path: Path, node: Descendant) => {
    for (const placement of getDefined(activeDescriptor)
      .preparedRuntimePlacements) {
      const originPath = mapPreparedPathBackward(placement, path);
      const localPath = originPath
        ? preparedLocalPath(placement, originPath)
        : null;
      const nodeKey = localPath
        ? getPreparedDocumentNodeKey(placement.slice, localPath)
        : null;

      if (!nodeKey) continue;
      if (discarded.has(nodeKey)) return null;

      if (publishNodeKeys) setNodeKey(node, editor, nodeKey);

      return nodeKey;
    }

    return null;
  };
  const preparedPathForNodeKey = (nodeKey: NodeKey) => {
    if (!nodeKey.startsWith('p')) return null;

    for (const placement of getDefined(activeDescriptor)
      .preparedRuntimePlacements) {
      const localPath = getPreparedDocumentRuntimePath(
        placement.slice,
        nodeKey
      );
      const originPath = localPath
        ? preparedOriginPath(placement, localPath)
        : null;
      const targetPath = originPath
        ? mapPreparedPathForward(placement, originPath)
        : null;

      if (!targetPath) continue;
      const node = nodeAt(targetPath);

      if (!node) return null;
      const claimedNodeKey = pathToIdCache.get(pathKey(targetPath));

      if (claimedNodeKey && claimedNodeKey !== nodeKey) return null;
      const existing = getNodeKeyForNode(node, editor);

      if (existing && existing !== nodeKey) return null;
      if (publishNodeKeys) setNodeKey(node, editor, nodeKey);

      return targetPath;
    }

    return null;
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

    const availableAtPath = (nodeKey: NodeKey | null) => {
      if (!nodeKey) return null;

      const claimedPath = idToPathCache.get(nodeKey);

      return claimedPath === undefined ||
        (claimedPath !== null && pathKey(claimedPath) === key)
        ? nodeKey
        : null;
    };
    const existingNodeKey = getNodeKeyForNode(node, editor);
    const existing = availableAtPath(
      existingNodeKey && !discarded.has(existingNodeKey)
        ? existingNodeKey
        : null
    );
    const preparedNodeKey = existing
      ? null
      : availableAtPath(preparedNodeKeyAtPath(path, node as Descendant));
    const sourcePath = existing || preparedNodeKey ? null : sourcePathFor(path);
    const inheritedNodeKey = availableAtPath(
      sourcePath ? getDefined(activeDescriptor).base.keyAt(sourcePath) : null
    );
    const nodeKey =
      existing ??
      preparedNodeKey ??
      inheritedNodeKey ??
      (publishNodeKeys ? assignFreshNodeKey(node, editor) : null);

    if (!nodeKey) {
      pathToIdCache.set(key, null);
      return null;
    }
    if (publishNodeKeys && !existing && !preparedNodeKey) {
      setNodeKey(node, editor, nodeKey);
    }
    cache(nodeKey, path);

    return nodeKey;
  };
  const materialize = () => {
    if (materializedEntries) return materializedEntries;
    const entries: Array<readonly [NodeKey, Path]> = [];

    const visit = (nodes: readonly Descendant[], parentPath: Path) => {
      nodes.forEach((node, childIndex) => {
        const path = [...parentPath, childIndex] as Path;
        const nodeKey = keyAt(path);

        if (!nodeKey && publishNodeKeys) {
          throw new Error(
            `Snapshot index cannot materialize a node key at [${path}].`
          );
        }
        const frozenPath = nodeKey ? idToPathCache.get(nodeKey) : undefined;

        if (nodeKey && !frozenPath) {
          throw new Error(
            `Snapshot index lost the cached path for node key ${nodeKey}.`
          );
        }

        if (nodeKey && frozenPath) {
          entries.push(Object.freeze([nodeKey, frozenPath] as const));
        }

        if ('children' in node && Array.isArray(node.children)) {
          if (frozenPath && typeof node.type === 'string') {
            const elementEntries =
              materializedElementPathsByType.get(node.type) ?? [];

            elementEntries.push(
              Object.freeze({ path: frozenPath, type: node.type })
            );
            materializedElementPathsByType.set(node.type, elementEntries);
          }
          visit(node.children, path);
        }
      });
    };

    visit(getDefined(currentDocument).value as readonly Descendant[], []);
    materializedEntries = Object.freeze(entries);
    SNAPSHOT_ELEMENT_ENTRIES.set(
      mappedIndex,
      createElementEntryQuery(materializedElementPathsByType, keyAt)
    );
    MAPPED_SNAPSHOT_INDEXES.delete(mappedIndex);
    MAPPED_ELEMENT_INDEXES.delete(mappedIndex);
    activeDescriptor = null;
    activeSegments = null;
    currentDocument = null;

    return materializedEntries;
  };
  const pathOf = (nodeKey: NodeKey): Path | null => {
    const cached = idToPathCache.get(nodeKey);

    if (cached !== undefined) return cached;
    if (discarded.has(nodeKey)) {
      idToPathCache.set(nodeKey, null);
      return null;
    }
    if (!activeDescriptor) return null;

    const preparedPath = preparedPathForNodeKey(nodeKey);

    if (preparedPath) return cache(nodeKey, preparedPath);

    const sourcePath = activeDescriptor.base.pathOf(nodeKey);

    if (sourcePath) {
      const targetPath = targetPathFor(sourcePath);

      if (!targetPath) {
        // Explicit assignments and prepared placements were checked above.
        // A deleted canonical path cannot reappear during materialization.
        idToPathCache.set(nodeKey, null);
        return null;
      }
      const node = nodeAt(targetPath);

      if (
        node &&
        getNodeKeyForNode(node, editor) === nodeKey &&
        !discarded.has(nodeKey)
      ) {
        return cache(nodeKey, getDefined(targetPath));
      }
    }

    materialize();

    return idToPathCache.get(nodeKey) ?? null;
  };

  mappedIndex = Object.freeze({
    entries: materialize,
    keyAt,
    pathOf,
  });
  SNAPSHOT_INDEX_CACHED_PATHS.set(mappedIndex, (nodeKey) =>
    idToPathCache.get(nodeKey)
  );
  MAPPED_SNAPSHOT_INDEXES.set(mappedIndex, descriptor);
  MAPPED_ELEMENT_INDEXES.set(mappedIndex, elementDescriptor);
  const elementQueryCache = new Map<
    string,
    readonly InternalEditorRuntimeElementEntry[]
  >();

  SNAPSHOT_ELEMENT_ENTRIES.set(mappedIndex, (types) => {
    const key = [...new Set(types)].sort().join('\u0000');
    const known = elementQueryCache.get(key);

    if (known) return known;
    const entries = queryMappedElementEntries(mappedIndex, types);

    elementQueryCache.set(key, entries);
    return entries;
  });

  return mappedIndex;
};

/**
 * Advance lazy mapping provenance for a change that cannot move node paths.
 * The public index remains path-identical, while a later structural mapping
 * still starts from the exact current token document.
 */
export const advancePathStableSnapshotIndex = (
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  index: SnapshotIndex,
  editor: Editor,
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[]
): SnapshotIndex => {
  assertMappingLengths(before, after, change);

  for (const candidate of runtimeCandidates ?? []) {
    const path = [...candidate.path] as Path;

    if (after.node(path) !== candidate.node) {
      throw new Error(
        `Node key candidate at [${path}] does not belong to the published document.`
      );
    }

    const nodeKey = index.keyAt(path);

    if (nodeKey) setNodeKey(candidate.node, editor, nodeKey);
  }

  const previous = MAPPED_SNAPSHOT_INDEXES.get(index);

  if (!previous) return index;
  const previousAfter = previous.segments.at(-1)?.after;

  if (previousAfter && previousAfter.length !== before.length) {
    throw new Error(
      `Snapshot index mappings are not sequential: previous target length ${previousAfter.length}, next source length ${before.length}.`
    );
  }

  const segment = createPathStableMappingSegment(before, after);
  const segments = compactMappingSegments(previous.segments, segment);

  MAPPED_SNAPSHOT_INDEXES.set(
    index,
    Object.freeze({
      ...previous,
      preparedRuntimePlacements: Object.freeze(
        advancePreparedRuntimePlacements(
          previous.preparedRuntimePlacements,
          segment
        )
      ),
      segments,
    })
  );
  const previousElement = MAPPED_ELEMENT_INDEXES.get(index);

  if (previousElement) {
    MAPPED_ELEMENT_INDEXES.set(
      index,
      Object.freeze({
        ...previousElement,
        after,
        segments: compactMappingSegments(previousElement.segments, segment),
      })
    );
  }

  return index;
};
