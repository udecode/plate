import type {
  EditorMarks,
  EditorSnapshot,
  RuntimeId,
  Selection,
  SnapshotIndex,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Operation } from '../interfaces/operation';
import { cloneFrozen } from './clone';
import { profileCoreDuration } from './profiling';
import { MAIN_ROOT_KEY } from './public-root';
import {
  buildLiveRuntimeIndexFromSnapshotIndex,
  type LiveRuntimeIndex,
  type RuntimeIndexLike,
} from './snapshot-index';

type FullRootReplaceOperation = Extract<
  Operation,
  { type: 'replace_children' }
>;

type OperationRootResolver = (operation: Operation) => string | null;

const FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE = new WeakMap<
  readonly Descendant[],
  SnapshotIndex
>();
const FULL_ROOT_REPLACE_CHILDREN_LIVE_INDEX_CACHE = new WeakMap<
  readonly Descendant[],
  LiveRuntimeIndex
>();
const FULL_ROOT_REPLACE_CHILDREN_SNAPSHOT_CHILDREN_CACHE = new WeakMap<
  readonly Descendant[],
  EditorSnapshot['children']
>();
const FULL_ROOT_REPLACE_CHILDREN_TOP_LEVEL_RUNTIME_IDS_CACHE = new WeakMap<
  readonly Descendant[],
  readonly RuntimeId[]
>();

const isFullRootReplaceOperation = (
  operation: Operation,
  root: string,
  resolveOperationRoot: OperationRootResolver
): operation is FullRootReplaceOperation =>
  operation.type === 'replace_children' &&
  operation.path.length === 0 &&
  operation.index === 0 &&
  resolveOperationRoot(operation) === root;

const getSingleFullRootReplaceOperation = (
  operations: readonly Operation[],
  root: string,
  resolveOperationRoot: OperationRootResolver
): FullRootReplaceOperation | null => {
  const contentOperations = operations.filter(
    (operation) => operation.type !== 'set_selection'
  );

  if (contentOperations.length !== 1) {
    return null;
  }

  const operation = contentOperations[0]!;

  return isFullRootReplaceOperation(operation, root, resolveOperationRoot)
    ? operation
    : null;
};

export const cacheFullRootReplaceSnapshotIndexes = (
  operations: readonly Operation[],
  previousSnapshot: EditorSnapshot,
  previousLiveIndex: LiveRuntimeIndex | null,
  nextSnapshot: EditorSnapshot,
  nextLiveIndex: LiveRuntimeIndex | null,
  root: string,
  resolveOperationRoot: OperationRootResolver
) => {
  const operation = getSingleFullRootReplaceOperation(
    operations,
    root,
    resolveOperationRoot
  );

  if (!operation) {
    return;
  }

  if (operation.children.length === previousSnapshot.children.length) {
    FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE.set(
      operation.children,
      previousSnapshot.index
    );
    FULL_ROOT_REPLACE_CHILDREN_SNAPSHOT_CHILDREN_CACHE.set(
      operation.children,
      previousSnapshot.children
    );

    if (previousLiveIndex) {
      FULL_ROOT_REPLACE_CHILDREN_LIVE_INDEX_CACHE.set(
        operation.children,
        previousLiveIndex
      );
    }
  }

  if (operation.newChildren.length === nextSnapshot.children.length) {
    FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE.set(
      operation.newChildren,
      nextSnapshot.index
    );
    FULL_ROOT_REPLACE_CHILDREN_SNAPSHOT_CHILDREN_CACHE.set(
      operation.newChildren,
      nextSnapshot.children
    );

    if (nextLiveIndex) {
      FULL_ROOT_REPLACE_CHILDREN_LIVE_INDEX_CACHE.set(
        operation.newChildren,
        nextLiveIndex
      );
    }
  }
};

const getFullRootReplaceSnapshotIndex = (
  operation: FullRootReplaceOperation,
  liveChildren: readonly Descendant[]
): SnapshotIndex | null => {
  if (operation.newChildren.length !== liveChildren.length) {
    return null;
  }

  const first = liveChildren[0];
  const last = liveChildren.at(-1);

  if (
    operation.newChildren.length > 0 &&
    (first !== operation.newChildren[0] ||
      last !== operation.newChildren.at(-1))
  ) {
    return null;
  }

  return (
    FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE.get(operation.newChildren) ?? null
  );
};

export const hasCachedFullRootReplaceSnapshotIndex = (
  operation: Operation
): operation is FullRootReplaceOperation =>
  operation.type === 'replace_children' &&
  operation.path.length === 0 &&
  operation.index === 0 &&
  FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE.has(operation.newChildren);

const getTopLevelRuntimeIdsForIndex = (
  index: RuntimeIndexLike
): readonly RuntimeId[] => {
  const pathToId = index.pathToId;
  const runtimeIds: RuntimeId[] = [];

  for (let topLevelIndex = 0; ; topLevelIndex++) {
    const runtimeId =
      pathToId instanceof Map
        ? pathToId.get(String(topLevelIndex))
        : pathToId[String(topLevelIndex)];

    if (!runtimeId) {
      break;
    }

    runtimeIds.push(runtimeId);
  }

  return Object.freeze(runtimeIds);
};

export const getCachedFullRootReplaceTopLevelRuntimeIds = (
  operation: Operation
): readonly RuntimeId[] | null => {
  if (
    operation.type !== 'replace_children' ||
    operation.path.length !== 0 ||
    operation.index !== 0
  ) {
    return null;
  }

  const cachedRuntimeIds =
    FULL_ROOT_REPLACE_CHILDREN_TOP_LEVEL_RUNTIME_IDS_CACHE.get(
      operation.newChildren
    );

  if (cachedRuntimeIds) {
    return cachedRuntimeIds;
  }

  const index =
    FULL_ROOT_REPLACE_CHILDREN_INDEX_CACHE.get(operation.newChildren) ?? null;

  if (!index) {
    return null;
  }

  const runtimeIds = getTopLevelRuntimeIdsForIndex(index);

  FULL_ROOT_REPLACE_CHILDREN_TOP_LEVEL_RUNTIME_IDS_CACHE.set(
    operation.newChildren,
    runtimeIds
  );

  return runtimeIds;
};

export const getFullRootReplaceCachedSnapshot = ({
  liveChildren,
  marks,
  operations,
  resolveOperationRoot,
  root,
  selection,
  setMainRootRuntimeIndex,
  version,
}: {
  liveChildren: readonly Descendant[];
  marks: EditorMarks | null;
  operations: readonly Operation[];
  resolveOperationRoot: OperationRootResolver;
  root: string;
  selection: Selection;
  setMainRootRuntimeIndex: (index: LiveRuntimeIndex) => void;
  version: number;
}): EditorSnapshot | null => {
  const operation = getSingleFullRootReplaceOperation(
    operations,
    root,
    resolveOperationRoot
  );

  if (!operation) {
    return null;
  }

  const index = getFullRootReplaceSnapshotIndex(operation, liveChildren);

  if (!index) {
    return null;
  }

  if (root === MAIN_ROOT_KEY) {
    const cachedLiveIndex = FULL_ROOT_REPLACE_CHILDREN_LIVE_INDEX_CACHE.get(
      operation.newChildren
    );
    const liveIndex =
      cachedLiveIndex ??
      profileCoreDuration('snapshot-reuse-live-runtime-index', () =>
        buildLiveRuntimeIndexFromSnapshotIndex(index)
      );

    setMainRootRuntimeIndex(liveIndex);
  }

  const children =
    FULL_ROOT_REPLACE_CHILDREN_SNAPSHOT_CHILDREN_CACHE.get(
      operation.newChildren
    ) ??
    profileCoreDuration('snapshot-reuse-clone-children', () =>
      cloneFrozen(liveChildren)
    );

  return Object.freeze({
    children,
    index,
    marks,
    selection,
    version,
  }) as unknown as EditorSnapshot;
};
