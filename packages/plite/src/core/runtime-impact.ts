import type {
  EditorCommit,
  EditorCommitClass,
  RuntimeId,
  Selection,
  TopLevelRuntimeRange,
} from '../interfaces/editor';
import type { Operation } from '../interfaces/operation';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { pathKey, type RuntimeIndexLike } from './snapshot-index';

type CommitRuntimeDirtiness = Pick<
  EditorCommit,
  | 'affectedNodeRuntimeIds'
  | 'affectedProjectionRuntimeIds'
  | 'affectedSelectionRuntimeIds'
  | 'affectedTextRuntimeIds'
  | 'dirtyElementRuntimeIds'
  | 'dirtyTextRuntimeIds'
  | 'dirtyTopLevelRanges'
  | 'dirtyTopLevelRuntimeIds'
  | 'fullDocumentChanged'
  | 'markDirtyRuntimeIds'
  | 'rootRuntimeIdsChanged'
  | 'structuralDirtyRuntimeIds'
  | 'textDirtyRuntimeIds'
  | 'topLevelOrderChanged'
>;

export const getTopLevelRanges = (
  paths: readonly Path[]
): TopLevelRuntimeRange[] => {
  if (paths.length === 0) {
    return [];
  }

  const ranges: TopLevelRuntimeRange[] = [];
  const sorted = Array.from(
    new Set(
      paths
        .map((path) => path[0])
        .filter((index): index is number => typeof index === 'number')
    )
  ).sort((a, b) => a - b);

  if (sorted.length === 0) {
    return [];
  }

  let start = sorted[0]!;
  let end = start;

  for (const index of sorted.slice(1)) {
    if (index === end + 1) {
      end = index;
      continue;
    }

    ranges.push([start, end]);
    start = index;
    end = index;
  }

  ranges.push([start, end]);

  return ranges;
};

export const uniqPaths = (paths: Path[]) => {
  const seen = new Set<string>();
  return paths.filter((path) => {
    const key = pathKey(path);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const getIndexedPaths = (index: RuntimeIndexLike): Path[] =>
  index.idToPath instanceof Map
    ? Array.from(index.idToPath.values())
    : Object.values(index.idToPath);

const getIndexedRuntimeId = (
  index: RuntimeIndexLike,
  path: Path
): RuntimeId | undefined => {
  const key = pathKey(path);

  return index.pathToId instanceof Map
    ? index.pathToId.get(key)
    : index.pathToId[key];
};

const SMALL_SELECTION_TOP_LEVEL_FAST_PATH_LIMIT = 128;

const getSimpleTopLevelSelectionShellPaths = (
  selection: Selection,
  index: RuntimeIndexLike
): Path[] | null => {
  if (!selection || RangeApi.isCollapsed(selection)) {
    return null;
  }

  const [start, end] = RangeApi.edges(selection);
  const startIndex = start.path[0];
  const endIndex = end.path[0];

  if (
    typeof startIndex !== 'number' ||
    typeof endIndex !== 'number' ||
    Math.abs(endIndex - startIndex) >=
      SMALL_SELECTION_TOP_LEVEL_FAST_PATH_LIMIT ||
    start.path.length !== 2 ||
    end.path.length !== 2 ||
    start.path[1] !== 0 ||
    end.path[1] !== 0
  ) {
    return null;
  }

  const paths: Path[] = [];

  for (
    let topLevelIndex = startIndex;
    topLevelIndex <= endIndex;
    topLevelIndex++
  ) {
    const blockPath = [topLevelIndex];
    const textPath = [topLevelIndex, 0];

    if (
      !getIndexedRuntimeId(index, blockPath) ||
      !getIndexedRuntimeId(index, textPath) ||
      getIndexedRuntimeId(index, [topLevelIndex, 1]) ||
      getIndexedRuntimeId(index, [topLevelIndex, 0, 0])
    ) {
      return null;
    }

    if (RangeApi.includes(selection, blockPath)) {
      paths.push(blockPath);
    }

    if (RangeApi.includes(selection, textPath)) {
      paths.push(textPath);
    }
  }

  return paths;
};

export const uniqRuntimeIds = (
  runtimeIds: readonly (RuntimeId | null | undefined)[]
): RuntimeId[] => {
  const seen = new Set<RuntimeId>();
  const result: RuntimeId[] = [];

  for (const runtimeId of runtimeIds) {
    if (!runtimeId || seen.has(runtimeId)) {
      continue;
    }

    seen.add(runtimeId);
    result.push(runtimeId);
  }

  return result;
};

const getRuntimeIdsForPaths = (
  paths: readonly Path[],
  previousIndex: RuntimeIndexLike,
  nextIndex: RuntimeIndexLike
): RuntimeId[] =>
  uniqRuntimeIds(
    paths.flatMap((path) => [
      getIndexedRuntimeId(previousIndex, path),
      getIndexedRuntimeId(nextIndex, path),
    ])
  );

const getRuntimeIdsForIndex = (index: RuntimeIndexLike): RuntimeId[] =>
  uniqRuntimeIds(
    getIndexedPaths(index).map((path) => getIndexedRuntimeId(index, path))
  );

const getRuntimeIdsForIndexedSubtree = (
  index: RuntimeIndexLike,
  path: Path
): RuntimeId[] =>
  uniqRuntimeIds(
    getIndexedPaths(index)
      .filter(
        (indexedPath) =>
          PathApi.equals(path, indexedPath) ||
          PathApi.isAncestor(path, indexedPath)
      )
      .map((indexedPath) => getIndexedRuntimeId(index, indexedPath))
  );

const getRuntimeIdsForIndexedTopLevelSubtree = (
  index: RuntimeIndexLike,
  path: Path
): RuntimeId[] =>
  path.length > 1 && typeof path[0] === 'number'
    ? getRuntimeIdsForIndexedSubtree(index, [path[0]])
    : [];

const getRuntimeIdsForIndexedPathImpact = (
  index: RuntimeIndexLike,
  path: Path
): RuntimeId[] =>
  uniqRuntimeIds(
    getIndexedPaths(index)
      .filter(
        (indexedPath) =>
          PathApi.equals(path, indexedPath) ||
          PathApi.isAncestor(path, indexedPath) ||
          PathApi.isAncestor(indexedPath, path)
      )
      .map((indexedPath) => getIndexedRuntimeId(index, indexedPath))
  );

export const operationChangesTopLevelOrder = (
  operation: Operation
): boolean => {
  switch (operation.type) {
    case 'replace_children':
      return operation.path.length === 0;
    case 'insert_node':
    case 'merge_node':
    case 'remove_node':
    case 'split_node':
      return operation.path.length === 1;
    case 'move_node':
      return operation.path.length === 1 || operation.newPath.length === 1;
    default:
      return false;
  }
};

export function operationChangesTextContent(
  operation: Operation
): operation is Extract<Operation, { type: 'split_node' }> {
  return operation.type === 'split_node' && operation.path.length > 1;
}

export const getOperationScopePaths = (
  operations: readonly Operation[]
): Path[] =>
  operations.flatMap((operation) => {
    if (!('path' in operation) || !Array.isArray(operation.path)) {
      return [];
    }

    return operation.type === 'move_node'
      ? [operation.path, operation.newPath]
      : [operation.path];
  });

export const operationTouchesOnlyTopLevelPaths = (
  operation: Operation
): boolean => {
  switch (operation.type) {
    case 'insert_node':
    case 'merge_node':
    case 'remove_node':
    case 'set_node':
    case 'split_node':
      return operation.path.length === 1;
    case 'move_node':
      return operation.path.length === 1 && operation.newPath.length === 1;
    case 'replace_children':
      return operation.path.length === 0;
    default:
      return false;
  }
};

export const getTextOperationPaths = (
  operations: readonly Operation[]
): Path[] =>
  operations.flatMap((operation) =>
    operation.type === 'insert_text' || operation.type === 'remove_text'
      ? [operation.path]
      : []
  );

const getStructuralTextOperationPaths = (
  operations: readonly Operation[]
): Path[] =>
  operations.flatMap((operation) =>
    operationChangesTextContent(operation) ? [operation.path] : []
  );

const getTextElementPaths = (operations: readonly Operation[]): Path[] =>
  uniqPaths(
    getTextOperationPaths(operations).flatMap((path) =>
      PathApi.ancestors(path).filter((ancestor) => ancestor.length > 0)
    )
  );

const getTopLevelRuntimeIdsForPaths = (
  paths: readonly Path[],
  previousIndex: RuntimeIndexLike,
  nextIndex: RuntimeIndexLike
): RuntimeId[] =>
  getRuntimeIdsForPaths(
    Array.from(
      new Set(paths.filter((path) => path.length > 0).map((path) => path[0]!))
    ).map((index) => [index]),
    previousIndex,
    nextIndex
  );

const getRuntimeIdsForIndexedSubtreeTopLevelRange = (
  index: RuntimeIndexLike,
  startIndex: number,
  endIndexExclusive = Number.POSITIVE_INFINITY
): RuntimeId[] =>
  uniqRuntimeIds(
    getIndexedPaths(index)
      .filter((indexedPath) => {
        const topLevelIndex = indexedPath[0];

        return (
          typeof topLevelIndex === 'number' &&
          topLevelIndex >= startIndex &&
          topLevelIndex < endIndexExclusive
        );
      })
      .map((indexedPath) => getIndexedRuntimeId(index, indexedPath))
  );

const getIndexedTopLevelCount = (index: RuntimeIndexLike): number => {
  let count = 0;

  for (const path of getIndexedPaths(index)) {
    if (path.length === 1 && typeof path[0] === 'number') {
      count = Math.max(count, path[0] + 1);
    }
  }

  return count;
};

const getRuntimeIdsForIndexedTopLevelRange = (
  index: RuntimeIndexLike,
  startIndex: number,
  endIndexExclusive = getIndexedTopLevelCount(index)
): RuntimeId[] => {
  const runtimeIds: RuntimeId[] = [];
  const endIndex = Math.min(endIndexExclusive, getIndexedTopLevelCount(index));

  for (
    let topLevelIndex = startIndex;
    topLevelIndex < endIndex;
    topLevelIndex++
  ) {
    const runtimeId = getIndexedRuntimeId(index, [topLevelIndex]);

    if (runtimeId) {
      runtimeIds.push(runtimeId);
    }
  }

  return uniqRuntimeIds(runtimeIds);
};

const getTopLevelOrderNodeImpactRuntimeIds = (
  operations: readonly Operation[],
  previousIndex: RuntimeIndexLike,
  nextIndex: RuntimeIndexLike
): RuntimeId[] =>
  uniqRuntimeIds(
    operations.flatMap((operation) => {
      switch (operation.type) {
        case 'insert_node':
          return operation.path.length === 1
            ? getRuntimeIdsForIndexedTopLevelRange(
                previousIndex,
                operation.path[0]!
              )
            : getRuntimeIdsForIndexedPathImpact(previousIndex, operation.path);
        case 'remove_node':
          return operation.path.length === 1
            ? getRuntimeIdsForIndexedTopLevelRange(
                previousIndex,
                operation.path[0]!
              )
            : getRuntimeIdsForIndexedPathImpact(previousIndex, operation.path);
        case 'move_node':
          if (operation.path.length === 1 && operation.newPath.length === 1) {
            return getRuntimeIdsForIndexedTopLevelRange(
              previousIndex,
              Math.min(operation.path[0]!, operation.newPath[0]!),
              Math.max(operation.path[0]!, operation.newPath[0]!) + 1
            );
          }

          return [
            ...getRuntimeIdsForIndexedSubtree(previousIndex, operation.path),
            ...getRuntimeIdsForIndexedTopLevelSubtree(
              previousIndex,
              operation.path
            ),
            ...(operation.path.length === 1
              ? getRuntimeIdsForIndexedSubtreeTopLevelRange(
                  previousIndex,
                  operation.path[0]!
                )
              : []),
            ...(operation.newPath.length === 1
              ? getRuntimeIdsForIndexedSubtreeTopLevelRange(
                  previousIndex,
                  operation.newPath[0]!
                )
              : getRuntimeIdsForIndexedTopLevelSubtree(
                  previousIndex,
                  operation.newPath
                )),
          ];
        case 'replace_children':
          return operation.path.length === 0
            ? getRuntimeIdsForIndex(previousIndex)
            : getRuntimeIdsForIndexedPathImpact(previousIndex, operation.path);
        case 'split_node':
          return operation.path.length === 1
            ? getRuntimeIdsForIndexedTopLevelRange(
                previousIndex,
                operation.path[0]!
              )
            : getRuntimeIdsForIndexedPathImpact(previousIndex, operation.path);
        case 'merge_node':
          if (operation.path.length === 1 && operation.path[0] > 0) {
            return getRuntimeIdsForIndexedTopLevelRange(
              previousIndex,
              PathApi.previous(operation.path)[0]!
            );
          }

          return operation.path.length > 1
            ? [
                ...getRuntimeIdsForIndexedPathImpact(
                  previousIndex,
                  operation.path
                ),
                ...getRuntimeIdsForIndexedPathImpact(
                  previousIndex,
                  PathApi.previous(operation.path)
                ),
              ]
            : [];
        default:
          return [];
      }
    })
  );

export const buildCommitRuntimeDirtiness = ({
  classes,
  decorationImpactRuntimeIds,
  dirtyPaths,
  dirtyScope,
  nextIndex,
  nodeImpactRuntimeIds,
  operations,
  previousIndex,
  selectionImpactRuntimeIds,
  touchedRuntimeIds,
}: {
  classes: readonly EditorCommitClass[];
  decorationImpactRuntimeIds: readonly RuntimeId[] | null;
  dirtyPaths: readonly Path[];
  dirtyScope: 'none' | 'paths' | 'all';
  nextIndex: RuntimeIndexLike;
  nodeImpactRuntimeIds: readonly RuntimeId[] | null;
  operations: readonly Operation[];
  previousIndex: RuntimeIndexLike;
  selectionImpactRuntimeIds: readonly RuntimeId[] | null;
  touchedRuntimeIds: readonly RuntimeId[] | null;
}): CommitRuntimeDirtiness => {
  const changeClass = classes[0];
  const fullDocumentChanged = dirtyScope === 'all' || changeClass === 'replace';
  const topLevelOrderChanged =
    fullDocumentChanged || operations.some(operationChangesTopLevelOrder);
  const rootRuntimeIdsChanged = topLevelOrderChanged;
  const scopePaths =
    dirtyPaths.length > 0 ? dirtyPaths : getOperationScopePaths(operations);

  if (fullDocumentChanged) {
    const nextRuntimeIds = getRuntimeIdsForIndex(nextIndex);

    return {
      affectedNodeRuntimeIds: nextRuntimeIds,
      affectedProjectionRuntimeIds: nextRuntimeIds,
      affectedSelectionRuntimeIds: selectionImpactRuntimeIds,
      affectedTextRuntimeIds: nextRuntimeIds,
      dirtyElementRuntimeIds: null,
      dirtyTextRuntimeIds: null,
      dirtyTopLevelRanges: null,
      dirtyTopLevelRuntimeIds: null,
      fullDocumentChanged,
      markDirtyRuntimeIds: [],
      rootRuntimeIdsChanged,
      structuralDirtyRuntimeIds: null,
      textDirtyRuntimeIds: null,
      topLevelOrderChanged,
    };
  }

  const structuralTextRuntimeIds =
    changeClass === 'structural'
      ? getRuntimeIdsForPaths(
          getStructuralTextOperationPaths(operations),
          previousIndex,
          nextIndex
        )
      : [];
  const dirtyTextRuntimeIds =
    changeClass === 'text'
      ? getRuntimeIdsForPaths(
          getTextOperationPaths(operations),
          previousIndex,
          nextIndex
        )
      : structuralTextRuntimeIds;
  const dirtyElementRuntimeIds =
    changeClass === 'structural'
      ? null
      : changeClass === 'text'
        ? getRuntimeIdsForPaths(
            getTextElementPaths(operations),
            previousIndex,
            nextIndex
          )
        : [];

  return {
    affectedNodeRuntimeIds: nodeImpactRuntimeIds,
    affectedProjectionRuntimeIds: decorationImpactRuntimeIds,
    affectedSelectionRuntimeIds: selectionImpactRuntimeIds,
    affectedTextRuntimeIds:
      changeClass === 'text' || structuralTextRuntimeIds.length > 0
        ? dirtyTextRuntimeIds
        : ([] as RuntimeId[]),
    dirtyElementRuntimeIds,
    dirtyTextRuntimeIds,
    dirtyTopLevelRanges: getTopLevelRanges(scopePaths),
    dirtyTopLevelRuntimeIds: topLevelOrderChanged
      ? null
      : changeClass === 'structural' &&
          operations.every(operationTouchesOnlyTopLevelPaths)
        ? uniqRuntimeIds([...(touchedRuntimeIds ?? [])])
        : getTopLevelRuntimeIdsForPaths(scopePaths, previousIndex, nextIndex),
    fullDocumentChanged,
    markDirtyRuntimeIds: [],
    rootRuntimeIdsChanged,
    structuralDirtyRuntimeIds:
      changeClass === 'structural' ? null : ([] as RuntimeId[]),
    textDirtyRuntimeIds:
      changeClass === 'text' || structuralTextRuntimeIds.length > 0
        ? dirtyTextRuntimeIds
        : ([] as RuntimeId[]),
    topLevelOrderChanged,
  };
};

const getSelectionShellPaths = (
  selection: Selection,
  index: RuntimeIndexLike
): Path[] => {
  if (!selection) {
    return [];
  }

  const paths: Path[] = [];

  for (const point of [selection.anchor, selection.focus]) {
    for (let depth = point.path.length; depth > 0; depth--) {
      paths.push(point.path.slice(0, depth));
    }
  }

  if (RangeApi.isCollapsed(selection)) {
    return uniqPaths(paths);
  }

  const simpleTopLevelPaths = getSimpleTopLevelSelectionShellPaths(
    selection,
    index
  );

  if (simpleTopLevelPaths) {
    paths.push(...simpleTopLevelPaths);

    return uniqPaths(paths);
  }

  for (const path of getIndexedPaths(index)) {
    if (RangeApi.includes(selection, path)) {
      paths.push(path);
    }
  }

  return uniqPaths(paths);
};

const getSelectionRuntimeIds = (
  selection: Selection,
  index: RuntimeIndexLike
): RuntimeId[] =>
  getSelectionShellPaths(selection, index)
    .map((path) => getIndexedRuntimeId(index, path))
    .filter((runtimeId): runtimeId is RuntimeId => Boolean(runtimeId));

const isBroadTopLevelSelection = (selection: Selection) => {
  if (!selection || RangeApi.isCollapsed(selection)) {
    return false;
  }

  const [start, end] = RangeApi.edges(selection);
  const startTopLevelIndex = start.path[0];
  const endTopLevelIndex = end.path[0];

  return (
    startTopLevelIndex != null &&
    endTopLevelIndex != null &&
    Math.abs(endTopLevelIndex - startTopLevelIndex) >= 128
  );
};

export const getSelectionImpactRuntimeIds = ({
  nextIndex,
  previousIndex,
  selectionAfter,
  selectionBefore,
}: {
  nextIndex: RuntimeIndexLike;
  previousIndex: RuntimeIndexLike;
  selectionAfter: Selection;
  selectionBefore: Selection;
}): RuntimeId[] | null => {
  if (
    isBroadTopLevelSelection(selectionBefore) ||
    isBroadTopLevelSelection(selectionAfter)
  ) {
    return null;
  }

  return Array.from(
    new Set([
      ...getSelectionRuntimeIds(selectionBefore, previousIndex),
      ...getSelectionRuntimeIds(selectionAfter, nextIndex),
    ])
  );
};

export const getDecorationImpactRuntimeIds = ({
  classes,
  dirtyPaths,
  nextIndex,
  previousIndex,
  selectionImpactRuntimeIds,
  touchedRuntimeIds,
}: {
  classes: readonly EditorCommitClass[];
  dirtyPaths: readonly Path[];
  nextIndex: RuntimeIndexLike;
  previousIndex: RuntimeIndexLike;
  selectionImpactRuntimeIds: readonly RuntimeId[] | null;
  touchedRuntimeIds: readonly RuntimeId[] | null;
}): readonly RuntimeId[] | null => {
  const changeClass = classes[0];

  if (changeClass === 'replace' || changeClass === 'structural') {
    return null;
  }

  if (changeClass === 'selection') {
    return selectionImpactRuntimeIds;
  }

  if (changeClass === 'mark') {
    return [];
  }

  const dirtyRuntimeIds = getRuntimeIdsForPaths(
    dirtyPaths,
    previousIndex,
    nextIndex
  );

  return dirtyRuntimeIds.length > 0
    ? dirtyRuntimeIds
    : [...(touchedRuntimeIds ?? [])];
};

export const getNodeImpactRuntimeIds = ({
  classes,
  dirtyPaths,
  nextIndex,
  operations,
  previousIndex,
  touchedRuntimeIds,
}: {
  classes: readonly EditorCommitClass[];
  dirtyPaths: readonly Path[];
  nextIndex: RuntimeIndexLike;
  operations: readonly Operation[];
  previousIndex: RuntimeIndexLike;
  touchedRuntimeIds: readonly RuntimeId[] | null;
}): readonly RuntimeId[] | null => {
  const changeClass = classes[0];

  if (changeClass === 'replace') {
    return null;
  }

  if (
    changeClass === 'structural' &&
    operations.some(
      (operation) =>
        operation.type === 'replace_children' && operation.path.length === 0
    )
  ) {
    return null;
  }

  if (
    changeClass === 'structural' &&
    operations.some(operationChangesTopLevelOrder)
  ) {
    return getTopLevelOrderNodeImpactRuntimeIds(
      operations,
      previousIndex,
      nextIndex
    );
  }

  if (changeClass === 'structural') {
    return null;
  }

  if (changeClass === 'selection' || changeClass === 'mark') {
    return [];
  }

  const dirtyRuntimeIds = getRuntimeIdsForPaths(
    dirtyPaths,
    previousIndex,
    nextIndex
  );

  return dirtyRuntimeIds.length > 0
    ? dirtyRuntimeIds
    : [...(touchedRuntimeIds ?? [])];
};
