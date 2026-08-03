import type {
  AnyEditor as Editor,
  RuntimeId,
  SnapshotIndex,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import {
  assignFreshRuntimeId,
  getOrCreateRuntimeId,
  getRuntimeIdForNode,
  setRuntimeId,
} from '../utils/runtime-ids';
import type { DocumentChangeRuntimeCandidate } from './change/classification';
import {
  PreparedTokenSlice,
  getPreparedDocumentSlice,
  getPreparedDocumentRuntimeId,
  getPreparedDocumentRuntimePath,
  isDeferredPreparedDocumentSlice,
  type JsonNode,
} from './change/tokens';
import { getRootChangeRelocations } from './change/mapping';
import type { RootChange } from './change/root-change';
import type { DocumentIndex } from './change/document-index';
import { profileCoreDuration } from './profiling';

const EMPTY_ENTRIES = Object.freeze([]) as readonly (readonly [
  RuntimeId,
  Path,
])[];
export type InternalEditorRuntimeElementEntry = Readonly<{
  path: Path;
  runtimeId: RuntimeId;
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

export const EMPTY_RUNTIME_INDEX: SnapshotIndex = Object.freeze({
  entries: () => EMPTY_ENTRIES,
  idAt: () => null,
  pathOf: () => null,
});

SNAPSHOT_ELEMENT_ENTRIES.set(EMPTY_RUNTIME_INDEX, () => EMPTY_ELEMENT_ENTRIES);

/** @internal Query element types through the snapshot index lifecycle. */
export const getSnapshotIndexElementEntries = (
  index: SnapshotIndex,
  types: readonly string[]
): readonly InternalEditorRuntimeElementEntry[] =>
  SNAPSHOT_ELEMENT_ENTRIES.get(index)?.(types) ?? EMPTY_ELEMENT_ENTRIES;

const createElementEntryQuery = (
  entriesByType: ReadonlyMap<string, readonly ElementPathEntry[]>,
  idAt: (path: Path) => RuntimeId | null
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
        const runtimeId = idAt(path);

        return runtimeId
          ? [Object.freeze({ path, runtimeId, type })]
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
    case 0:
      return '';
    case 1:
      return String(path[0]);
    case 2:
      return `${path[0]}.${path[1]}`;
    default:
      return path.join('.');
  }
};

export const buildSnapshotIndex = (
  editor: Editor,
  children: readonly Descendant[],
  parentPath: Path = []
): SnapshotIndex => {
  const idToPathCache = new Map<RuntimeId, Path>();
  const pathToIdCache = new Map<string, RuntimeId | null>();
  const elementEntriesByType = new Map<string, ElementPathEntry[]>();
  const collectElementPaths = (
    nodes: readonly Descendant[],
    pathPrefix: Path
  ) => {
    nodes.forEach((node, index) => {
      const path = Object.freeze([...pathPrefix, index]) as Path;

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

  collectElementPaths(children, parentPath);
  let materializedEntries: readonly (readonly [RuntimeId, Path])[] | undefined;
  let activeChildren: readonly Descendant[] | null = children;
  const cache = (runtimeId: RuntimeId, path: Path) => {
    const key = pathKey(path);
    const existingPath = idToPathCache.get(runtimeId);
    const existingRuntimeId = pathToIdCache.get(key);

    if (
      (existingPath && pathKey(existingPath) !== key) ||
      (existingRuntimeId && existingRuntimeId !== runtimeId)
    ) {
      throw new Error(
        `Snapshot index runtime identities must be injective: ${runtimeId} at [${path}] conflicts with ${
          existingPath ? `[${existingPath}]` : existingRuntimeId
        }.`
      );
    }

    const frozenPath = Object.freeze([...path]) as Path;

    idToPathCache.set(runtimeId, frozenPath);
    pathToIdCache.set(key, runtimeId);

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
      const entries: Array<readonly [RuntimeId, Path]> = [];

      const visit = (nodes: readonly Descendant[], pathPrefix: Path) => {
        nodes.forEach((node, index) => {
          const path = [...pathPrefix, index] as Path;
          const runtimeId = getOrCreateRuntimeId(node, editor);
          const frozenPath = cache(runtimeId, path);

          entries.push(Object.freeze([runtimeId, frozenPath] as const));

          if ('children' in node && Array.isArray(node.children)) {
            visit(node.children, path);
          }
        });
      };

      visit(activeChildren!, parentPath);
      materializedEntries = Object.freeze(entries);
      activeChildren = null;

      return materializedEntries;
    });
  };
  const idAt = (path: Path): RuntimeId | null => {
    const key = pathKey(path);
    const cached = pathToIdCache.get(key);

    if (cached !== undefined) return cached;
    const node = nodeAt(path);

    if (!node) {
      pathToIdCache.set(key, null);
      return null;
    }

    const runtimeId = getRuntimeIdForNode(node, editor);

    if (!runtimeId) {
      materialize();

      return pathToIdCache.get(key) ?? null;
    }

    cache(runtimeId, path);

    return runtimeId;
  };

  const index = Object.freeze({
    entries: materialize,
    idAt,
    pathOf: (runtimeId: RuntimeId) => {
      const cached = idToPathCache.get(runtimeId);

      if (cached) return cached;

      materialize();

      return idToPathCache.get(runtimeId) ?? null;
    },
  });

  SNAPSHOT_ELEMENT_ENTRIES.set(
    index,
    createElementEntryQuery(elementEntriesByType, idAt)
  );
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

/** @internal Canonical, compacted path history shared by sparse indexes. */
export type CanonicalDocumentPathMapping =
  readonly SnapshotIndexMappingSegment[];

/** @internal Empty canonical path history for a newly indexed document. */
export const EMPTY_CANONICAL_DOCUMENT_PATH_MAPPING = Object.freeze(
  []
) as CanonicalDocumentPathMapping;

type MappedSnapshotIndexDescriptor = Readonly<{
  base: SnapshotIndex;
  discardedRuntimeIds: ReadonlySet<RuntimeId>;
  preparedRuntimePlacements: readonly PreparedRuntimePlacement[];
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

/** @internal Capture lazy provenance so an aborted editor draft can restore it. */
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
    segments.at(-1)!.change === null &&
    segments.at(-2)!.change === null
  ) {
    const right = segments.pop()!;
    const left = segments.pop()!;

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
    segments.at(-1)!.span === segments.at(-2)!.span &&
    segments.at(-1)!.change !== null &&
    segments.at(-2)!.change !== null
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
    const length = change.sections[index]!;
    const inserted = change.sections[index + 1]!;
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

/** @internal Append one root change using the snapshot index's binary compaction. */
export const appendCanonicalDocumentPathMapping = (
  mapping: CanonicalDocumentPathMapping,
  before: DocumentIndex,
  after: DocumentIndex,
  change: RootChange
): CanonicalDocumentPathMapping =>
  compactMappingSegments(mapping, createMappingSegment(before, after, change));

/** @internal Map one stable node path through a compacted canonical history. */
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

/** @internal Test-only structural bound for shared canonical path histories. */
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
    const length = segment.change.sections[sectionIndex++]!;
    const inserted = segment.change.sections[sectionIndex++]!;
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
              parentPath: Object.freeze([...boundary.parentPath]) as Path,
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
  const rootIndex = originPath[placement.parentPath.length]! - placement.index;
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
    current = mapPathBackward(placement.segments[index]!, current);
    if (!current) return null;
  }

  return current;
};

const comparePaths = (left: Path, right: Path) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index]! - right[index]!;

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

const orderPaths = (paths: Iterable<Path>) => {
  const ordered = [...paths];

  for (let index = 1; index < ordered.length; index++) {
    if (comparePaths(ordered[index - 1]!, ordered[index]!) > 0) {
      return ordered.sort(comparePaths);
    }
  }

  return ordered;
};

const pathContains = (ancestor: readonly number[], path: readonly number[]) =>
  ancestor.length <= path.length &&
  ancestor.every((part, depth) => path[depth] === part);

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
          const frozenPath = Object.freeze([...path]) as Path;

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

const mapChangedRuntimeIds = (
  segment: StructuralSnapshotIndexMappingSegment,
  index: SnapshotIndex,
  editor: Editor,
  discarded: ReadonlySet<RuntimeId>,
  preparedRuntimePlacements: readonly PreparedRuntimePlacement[],
  publishRuntimeIds: boolean,
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
        `Runtime identity candidate at [${path}] does not belong to the published document.`
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
    sourcePaths.set(pathKey(relocation.path as Path), [...relocation.path]);
    targetPaths.set(pathKey(relocation.targetPath as Path), [
      ...relocation.targetPath,
    ]);
  }

  const orderedSources = orderPaths(sourcePaths.values());
  const orderedTargets = orderPaths(targetPaths.values());
  const usedRuntimeIds = new Set<RuntimeId>();
  const usedTargetPaths = new Set<string>();
  const assignments: Array<readonly [RuntimeId, Path]> = [];
  const claim = (runtimeId: RuntimeId, targetPath: Path) => {
    const targetKey = pathKey(targetPath);

    if (
      discarded.has(runtimeId) ||
      usedRuntimeIds.has(runtimeId) ||
      usedTargetPaths.has(targetKey)
    ) {
      return false;
    }

    const targetNode = segment.after.node(targetPath);

    if (
      publishRuntimeIds &&
      getRuntimeIdForNode(targetNode, editor) !== runtimeId
    ) {
      setRuntimeId(targetNode, editor, runtimeId);
    }
    usedRuntimeIds.add(runtimeId);
    usedTargetPaths.add(targetKey);
    assignments.push(Object.freeze([runtimeId, targetPath] as const));

    return true;
  };

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
      const runtimeId = index.idAt(sourcePath);

      if (runtimeId) claim(runtimeId, targetPath);
    }
  }

  const nodeText = (path: Path, document: DocumentIndex): string => {
    const node = document.node(path);

    if ('text' in node && typeof node.text === 'string') return node.text;
    if (!('children' in node) || !Array.isArray(node.children)) return '';

    const read = (value: Descendant): string =>
      'text' in value && typeof value.text === 'string'
        ? value.text
        : 'children' in value && Array.isArray(value.children)
          ? value.children.map(read).join('')
          : '';

    return (node.children as readonly Descendant[]).map(read).join('');
  };
  const sameNodeKind = (sourcePath: Path, targetPath: Path) => {
    const source = segment.before.node(sourcePath);
    const target = segment.after.node(targetPath);
    const sourceIsText = 'text' in source;
    const targetIsText = 'text' in target;

    if (sourceIsText || targetIsText) return sourceIsText === targetIsText;

    return source.type === target.type;
  };

  // Splits and merges can preserve one node's complete text while replacing
  // its opening token. Claim that unique semantic continuation before the
  // positional opening-token survivor. A source ancestor emptied by moving
  // one of its descendants is not a continuation; the destination ancestor
  // can still continue its own identity around that moved descendant.
  for (const sourcePath of orderedSources) {
    if (
      relocations.some((relocation) =>
        pathContains(sourcePath, relocation.path)
      )
    ) {
      continue;
    }

    const sourceText = nodeText(sourcePath, segment.before);

    if (sourceText.length === 0) continue;
    const continuations = orderedTargets.filter((targetPath) => {
      // Split and merge continuations stay at the source depth. Text
      // containment alone must never let an ancestor donate its identity to a
      // touched descendant.
      if (sourcePath.length !== targetPath.length) return false;
      if (!sameNodeKind(sourcePath, targetPath)) return false;
      const targetText = nodeText(targetPath, segment.after);

      return (
        targetText.length > 0 &&
        (targetText.includes(sourceText) || sourceText.includes(targetText))
      );
    });

    if (continuations.length !== 1) continue;
    const runtimeId = index.idAt(sourcePath);

    if (runtimeId) claim(runtimeId, continuations[0]!);
  }

  // Transforms can explicitly transfer a runtime identity to the semantic
  // continuation of a split/merge. Reserve those claims before positional
  // opening-token inheritance.
  for (const targetPath of orderedTargets) {
    const runtimeId = getRuntimeIdForNode(
      segment.after.node(targetPath),
      editor
    );

    if (runtimeId) claim(runtimeId, targetPath);
  }

  for (const sourcePath of orderedSources) {
    const targetPath = mapPathForward(segment, sourcePath);
    const runtimeId = index.idAt(sourcePath);

    if (targetPath && runtimeId) claim(runtimeId, targetPath);
  }

  // Non-prepared inserted or cloned nodes receive identities before
  // publication. Prepared forests instead reserve deterministic ranges and
  // bind each node only when its snapshot path or identity is queried.
  for (const targetPath of orderedTargets) {
    const targetKey = pathKey(targetPath);

    if (usedTargetPaths.has(targetKey)) continue;
    if (isPreparedTargetPath(targetPath)) continue;
    const targetNode = segment.after.node(targetPath);
    const currentRuntimeId = getRuntimeIdForNode(targetNode, editor);

    if (
      currentRuntimeId &&
      !discarded.has(currentRuntimeId) &&
      !usedRuntimeIds.has(currentRuntimeId)
    ) {
      claim(currentRuntimeId, targetPath);
      continue;
    }

    if (publishRuntimeIds) {
      claim(assignFreshRuntimeId(targetNode, editor), targetPath);
    }
  }

  return Object.freeze(assignments);
};

/** @internal Test-only visibility into retained lazy mapping state. */
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
        const frozenPath = Object.freeze([...path]) as Path;

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
        const runtimeId = index.idAt(path);

        return runtimeId
          ? [Object.freeze({ path, runtimeId, type })]
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
  discardedRuntimeIds: ReadonlySet<RuntimeId> = new Set(),
  runtimeCandidates?: readonly DocumentChangeRuntimeCandidate[],
  publishRuntimeIds = true
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
  // allocate or attach runtime identities to nodes.
  const runtimeAssignments = profileCoreDuration(
    publishRuntimeIds
      ? 'runtime-index-publish-changed'
      : 'runtime-index-map-changed',
    () =>
      mapChangedRuntimeIds(
        segment,
        index,
        editor,
        discardedRuntimeIds,
        newPreparedRuntimePlacements,
        publishRuntimeIds,
        runtimeCandidates
      )
  );
  const { descriptor, segments } = profileCoreDuration(
    'runtime-index-map-descriptor',
    () => {
      const segments = compactMappingSegments(
        previous?.segments ?? [],
        segment
      );
      const descriptor: MappedSnapshotIndexDescriptor = Object.freeze({
        base: previous?.base ?? index,
        discardedRuntimeIds: new Set([
          ...(previous?.discardedRuntimeIds ?? []),
          ...discardedRuntimeIds,
        ]),
        preparedRuntimePlacements: Object.freeze([
          ...advancePreparedRuntimePlacements(
            previous?.preparedRuntimePlacements ?? [],
            segment
          ),
          ...newPreparedRuntimePlacements,
        ]),
        segments,
      });

      return { descriptor, segments };
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
        const frozenPath = Object.freeze([...path]) as Path;

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
  const discarded = descriptor.discardedRuntimeIds;
  const idToPathCache = new Map<RuntimeId, Path | null>();
  const pathToIdCache = new Map<string, RuntimeId | null>();
  const materializedElementPathsByType = new Map<string, ElementPathEntry[]>();
  let activeDescriptor: MappedSnapshotIndexDescriptor | null = descriptor;
  let activeSegments: readonly SnapshotIndexMappingSegment[] | null = segments;
  let currentDocument: DocumentIndex | null = segments.at(-1)!.after;
  let materializedEntries: readonly (readonly [RuntimeId, Path])[] | undefined;
  let mappedIndex: SnapshotIndex;

  const nodeAt = (path: Path) => {
    try {
      return currentDocument?.node(path) ?? null;
    } catch {
      return null;
    }
  };
  const cache = (runtimeId: RuntimeId, path: Path) => {
    const frozenPath = Object.freeze([...path]) as Path;
    const existingPath = idToPathCache.get(runtimeId);
    const existingRuntimeId = pathToIdCache.get(pathKey(frozenPath));

    if (
      (existingPath && pathKey(existingPath) !== pathKey(frozenPath)) ||
      (existingRuntimeId && existingRuntimeId !== runtimeId)
    ) {
      throw new Error(
        `Snapshot index runtime identities must be injective: ${runtimeId} at [${frozenPath}] conflicts with ${
          existingPath
            ? `[${existingPath}]${
                nodeAt(existingPath) === nodeAt(frozenPath)
                  ? ' (same node)'
                  : ''
              }`
            : existingRuntimeId
        }.`
      );
    }

    idToPathCache.set(runtimeId, frozenPath);
    pathToIdCache.set(pathKey(frozenPath), runtimeId);

    return frozenPath;
  };

  for (const [runtimeId, path] of runtimeAssignments) {
    cache(runtimeId, path);
  }
  const targetPathFor = (path: Path) => {
    let targetPath: Path | null = path;

    for (const segment of activeSegments!) {
      targetPath = mapPathForward(segment, targetPath);

      if (!targetPath) return null;
    }

    return targetPath;
  };
  const sourcePathFor = (path: Path) => {
    let sourcePath: Path | null = path;

    for (let index = activeSegments!.length - 1; index >= 0; index--) {
      sourcePath = mapPathBackward(activeSegments![index]!, sourcePath);

      if (!sourcePath) return null;
    }

    return sourcePath;
  };
  const preparedRuntimeIdAtPath = (path: Path, node: Descendant) => {
    for (const placement of activeDescriptor!.preparedRuntimePlacements) {
      const originPath = mapPreparedPathBackward(placement, path);
      const localPath = originPath
        ? preparedLocalPath(placement, originPath)
        : null;
      const runtimeId = localPath
        ? getPreparedDocumentRuntimeId(placement.slice, localPath)
        : null;

      if (!runtimeId) continue;
      if (discarded.has(runtimeId)) return null;

      if (publishRuntimeIds) setRuntimeId(node, editor, runtimeId);

      return runtimeId;
    }

    return null;
  };
  const preparedPathForRuntimeId = (runtimeId: RuntimeId) => {
    if (!runtimeId.startsWith('p')) return null;

    for (const placement of activeDescriptor!.preparedRuntimePlacements) {
      const localPath = getPreparedDocumentRuntimePath(
        placement.slice,
        runtimeId
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
      const claimedRuntimeId = pathToIdCache.get(pathKey(targetPath));

      if (claimedRuntimeId && claimedRuntimeId !== runtimeId) return null;
      const existing = getRuntimeIdForNode(node, editor);

      if (existing && existing !== runtimeId) return null;
      if (publishRuntimeIds) setRuntimeId(node, editor, runtimeId);

      return targetPath;
    }

    return null;
  };
  const idAt = (path: Path): RuntimeId | null => {
    const key = pathKey(path);
    const cached = pathToIdCache.get(key);

    if (cached !== undefined) return cached;
    const node = nodeAt(path);

    if (!node) {
      pathToIdCache.set(key, null);
      return null;
    }

    const availableAtPath = (runtimeId: RuntimeId | null) => {
      if (!runtimeId) return null;

      const claimedPath = idToPathCache.get(runtimeId);

      return claimedPath === undefined ||
        (claimedPath !== null && pathKey(claimedPath) === key)
        ? runtimeId
        : null;
    };
    const nodeRuntimeId = getRuntimeIdForNode(node, editor);
    const existing = availableAtPath(
      nodeRuntimeId && !discarded.has(nodeRuntimeId) ? nodeRuntimeId : null
    );
    const preparedRuntimeId = existing
      ? null
      : availableAtPath(preparedRuntimeIdAtPath(path, node as Descendant));
    const sourcePath =
      existing || preparedRuntimeId ? null : sourcePathFor(path);
    const inheritedRuntimeId = availableAtPath(
      sourcePath ? activeDescriptor!.base.idAt(sourcePath) : null
    );
    const runtimeId =
      existing ??
      preparedRuntimeId ??
      inheritedRuntimeId ??
      (publishRuntimeIds ? assignFreshRuntimeId(node, editor) : null);

    if (!runtimeId) {
      pathToIdCache.set(key, null);
      return null;
    }
    if (publishRuntimeIds && !existing && !preparedRuntimeId) {
      setRuntimeId(node, editor, runtimeId);
    }
    cache(runtimeId, path);

    return runtimeId;
  };
  const materialize = () => {
    if (materializedEntries) return materializedEntries;
    const entries: Array<readonly [RuntimeId, Path]> = [];

    const visit = (nodes: readonly Descendant[], parentPath: Path) => {
      nodes.forEach((node, childIndex) => {
        const path = [...parentPath, childIndex] as Path;
        const runtimeId = idAt(path);

        if (!runtimeId && publishRuntimeIds) {
          throw new Error(
            `Snapshot index cannot materialize a runtime identity at [${path}].`
          );
        }
        const frozenPath = runtimeId ? idToPathCache.get(runtimeId) : undefined;

        if (runtimeId && !frozenPath) {
          throw new Error(
            `Snapshot index lost the cached path for runtime identity ${runtimeId}.`
          );
        }

        if (runtimeId && frozenPath) {
          entries.push(Object.freeze([runtimeId, frozenPath] as const));
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

    visit(currentDocument!.value as readonly Descendant[], []);
    materializedEntries = Object.freeze(entries);
    SNAPSHOT_ELEMENT_ENTRIES.set(
      mappedIndex,
      createElementEntryQuery(materializedElementPathsByType, idAt)
    );
    MAPPED_SNAPSHOT_INDEXES.delete(mappedIndex);
    MAPPED_ELEMENT_INDEXES.delete(mappedIndex);
    activeDescriptor = null;
    activeSegments = null;
    currentDocument = null;

    return materializedEntries;
  };
  const pathOf = (runtimeId: RuntimeId): Path | null => {
    const cached = idToPathCache.get(runtimeId);

    if (cached !== undefined) return cached;
    if (discarded.has(runtimeId)) {
      idToPathCache.set(runtimeId, null);
      return null;
    }
    if (!activeDescriptor) return null;

    const preparedPath = preparedPathForRuntimeId(runtimeId);

    if (preparedPath) return cache(runtimeId, preparedPath);

    const sourcePath = activeDescriptor.base.pathOf(runtimeId);

    if (sourcePath) {
      const targetPath = targetPathFor(sourcePath);
      const node = targetPath ? nodeAt(targetPath) : null;

      if (
        node &&
        getRuntimeIdForNode(node, editor) === runtimeId &&
        !discarded.has(runtimeId)
      ) {
        return cache(runtimeId, targetPath!);
      }
    }

    materialize();

    return idToPathCache.get(runtimeId) ?? null;
  };

  mappedIndex = Object.freeze({
    entries: materialize,
    idAt,
    pathOf,
  });
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
        `Runtime identity candidate at [${path}] does not belong to the published document.`
      );
    }

    const runtimeId = index.idAt(path);

    if (runtimeId) setRuntimeId(candidate.node, editor, runtimeId);
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
