import {
  type EditorCommit,
  RangeApi,
  type RootKey,
  type Selection,
} from '@platejs/plite';
import {
  failInvariant,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRootKeys,
  MAIN_ROOT_KEY,
  toPublicRoot,
} from '@platejs/plite/internal';

import type { Batch } from './history';

type HistoryTarget = Readonly<{
  path: string;
  nodeKey?: string;
}>;

type HistoryPoint = Readonly<{
  offset: number;
  path: readonly number[];
}>;

type ChangedRange = readonly [number, number, number, number];

type TextHistoryGroup = Readonly<{
  afterPoint: HistoryPoint | null;
  beforePoint: HistoryPoint | null;
  fromAfter: number;
  fromBefore: number;
  kind: 'text';
  mode: 'delete' | 'insert' | 'replace' | 'structural-replace';
  replacedSelection: boolean;
  root: RootKey;
  target: HistoryTarget;
  toAfter: number;
  toBefore: number;
}>;

export type HistoryBatchGroup =
  | Readonly<{
      kind: 'document';
      root: RootKey;
    }>
  | Readonly<{
      kind: 'properties';
      root: RootKey;
      target: HistoryTarget;
    }>
  | TextHistoryGroup;

const pathKey = (path: readonly number[]) => path.join('.');

const getChangedRoot = (commit: EditorCommit): RootKey | null => {
  const roots = new Set<RootKey>([
    ...getInternalDocumentChangeRootKeys(commit.changes),
    ...commit.changes.createRoots,
    ...commit.changes.deleteRoots,
  ]);

  return roots.size === 1 ? [...roots][0] : null;
};

const getDeepestChangedPath = (
  paths: ReadonlyArray<readonly number[]> | undefined
): readonly number[] | null => {
  if (!paths || paths.length === 0) return null;

  const deepest = Math.max(...paths.map((path) => path.length));
  const candidates = new Map(
    paths
      .filter((path) => path.length === deepest)
      .map((path) => [pathKey(path), path] as const)
  );

  return candidates.size === 1 ? [...candidates.values()][0] : null;
};

const getCollapsedPoint = (
  selection: Selection,
  fallbackRoot: RootKey,
  root: RootKey
): HistoryPoint | null => {
  if (!selection || !RangeApi.isRange(selection) || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const point = selection.anchor;
  const pointRoot = point.root ?? fallbackRoot;

  return pointRoot === root
    ? Object.freeze({
        offset: point.offset,
        path: Object.freeze([...point.path]),
      })
    : null;
};

const selectionIsExpandedInRoot = (
  selection: Selection,
  fallbackRoot: RootKey,
  root: RootKey
) =>
  Boolean(
    selection &&
    RangeApi.isRange(selection) &&
    !RangeApi.isCollapsed(selection) &&
    (selection.anchor.root ?? fallbackRoot) === root &&
    (selection.focus.root ?? fallbackRoot) === root
  );

const getTarget = (
  commit: EditorCommit,
  root: RootKey,
  path: readonly number[] | null,
  kind: 'node' | 'text'
): HistoryTarget | null => {
  const nodeKeys = commit.changed.nodeKeys(kind, toPublicRoot(root));

  if (!path && nodeKeys.length !== 1) return null;

  return Object.freeze({
    path: path ? pathKey(path) : '',
    ...(nodeKeys.length === 1 ? { nodeKey: nodeKeys[0] } : {}),
  });
};

const sameTarget = (left: HistoryTarget, right: HistoryTarget) =>
  left.nodeKey && right.nodeKey
    ? left.nodeKey === right.nodeKey
    : left.path === right.path;

export const isSameHistoryPath = (
  left: readonly number[],
  right: readonly number[]
) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const samePoint = (left: HistoryPoint | null, right: HistoryPoint | null) =>
  Boolean(
    left &&
    right &&
    left.offset === right.offset &&
    isSameHistoryPath(left.path, right.path)
  );

const getChangedSpan = (
  ranges: readonly ChangedRange[]
): ChangedRange | null => {
  if (ranges.length === 0) return null;

  return Object.freeze([
    Math.min(...ranges.map((range) => range[0])),
    Math.max(...ranges.map((range) => range[1])),
    Math.min(...ranges.map((range) => range[2])),
    Math.max(...ranges.map((range) => range[3])),
  ]);
};

export const createHistoryBatchGroup = (
  commit: EditorCommit
): HistoryBatchGroup | null => {
  const root = getChangedRoot(commit);

  if (!root) return null;

  const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;
  const ranges: readonly ChangedRange[] = getInternalDocumentChangeRanges(
    commit.changes,
    root
  );

  const range = ranges.length === 1 ? ranges[0] : null;
  const changedSpan = getChangedSpan(ranges);
  const changedPath = getDeepestChangedPath(commit.changed.paths(publicRoot));
  const replacedSelection = selectionIsExpandedInRoot(
    commit.selectionBefore,
    commit.selectionBeforeRoot ?? MAIN_ROOT_KEY,
    root
  );
  const afterPoint = getCollapsedPoint(
    commit.selectionAfter,
    commit.selectionAfterRoot ?? MAIN_ROOT_KEY,
    root
  );
  const beforePoint = getCollapsedPoint(
    commit.selectionBefore,
    commit.selectionBeforeRoot ?? MAIN_ROOT_KEY,
    root
  );
  const selectionStart = RangeApi.isRange(commit.selectionBefore)
    ? RangeApi.edges(commit.selectionBefore)[0]
    : null;
  const structuralReplacementInsertedText = Boolean(
    selectionStart &&
    afterPoint &&
    (selectionStart.root ?? commit.selectionBeforeRoot ?? MAIN_ROOT_KEY) ===
      root &&
    isSameHistoryPath(selectionStart.path, afterPoint.path) &&
    afterPoint.offset > selectionStart.offset
  );
  const textChanged = commit.changed.has('text', publicRoot);
  const structureChanged = commit.changed.has('structure', publicRoot);
  const propertiesChanged = commit.changed.has('properties', publicRoot);
  const textTarget = getTarget(
    commit,
    root,
    changedPath ?? afterPoint?.path ?? beforePoint?.path ?? null,
    'text'
  );
  const propertyTarget = getTarget(commit, root, changedPath, 'node');

  if (
    changedSpan &&
    replacedSelection &&
    structuralReplacementInsertedText &&
    afterPoint &&
    structureChanged
  ) {
    return Object.freeze({
      afterPoint,
      beforePoint,
      fromAfter: changedSpan[2],
      fromBefore: changedSpan[0],
      kind: 'text',
      mode: 'structural-replace',
      replacedSelection: true,
      root,
      target:
        getTarget(commit, root, afterPoint.path, 'text') ??
        failInvariant('Expected value to be defined'),
      toAfter: changedSpan[3],
      toBefore: changedSpan[1],
    });
  }

  if (
    range &&
    textTarget &&
    textChanged &&
    !structureChanged &&
    !propertiesChanged
  ) {
    const beforeLength = range[1] - range[0];
    const afterLength = range[3] - range[2];
    const mode =
      beforeLength === 0 && afterLength > 0
        ? 'insert'
        : beforeLength > 0 && afterLength === 0
          ? 'delete'
          : 'replace';

    return Object.freeze({
      afterPoint,
      beforePoint,
      fromAfter: range[2],
      fromBefore: range[0],
      kind: 'text',
      mode,
      replacedSelection,
      root,
      target: textTarget,
      toAfter: range[3],
      toBefore: range[1],
    });
  }

  if (
    range &&
    propertyTarget &&
    propertiesChanged &&
    !structureChanged &&
    !textChanged
  ) {
    return Object.freeze({
      kind: 'properties',
      root,
      target: propertyTarget,
    });
  }

  return Object.freeze({ kind: 'document', root });
};

const shouldMergeText = (
  current: TextHistoryGroup,
  previous: TextHistoryGroup
) => {
  if (
    current.root !== previous.root ||
    !sameTarget(current.target, previous.target)
  ) {
    return false;
  }

  if (
    current.mode === 'insert' &&
    previous.replacedSelection &&
    (previous.mode === 'replace' || previous.mode === 'structural-replace') &&
    (samePoint(previous.afterPoint, current.beforePoint) ||
      current.fromBefore === previous.toAfter)
  ) {
    return true;
  }

  if (current.mode === 'insert' && previous.mode === 'insert') {
    return current.fromBefore === previous.toAfter;
  }

  if (current.mode === 'delete' && previous.mode === 'delete') {
    return current.toBefore === previous.fromAfter;
  }

  return false;
};

export const shouldMergeBatch = (
  currentBatch: Batch,
  current: HistoryBatchGroup | null,
  previousBatch: Batch,
  previous: HistoryBatchGroup | null
): boolean => {
  if (currentBatch.effects.length > 0 || previousBatch.effects.length > 0) {
    return false;
  }

  if (!current || !previous || current.root !== previous.root) return false;

  if (current.kind === 'text' && previous.kind === 'text') {
    return shouldMergeText(current, previous);
  }

  return (
    current.kind === 'properties' &&
    previous.kind === 'properties' &&
    sameTarget(current.target, previous.target)
  );
};

export const shouldMergeExplicitBatch = (
  currentBatch: Batch,
  current: HistoryBatchGroup | null,
  previousBatch: Batch,
  previous: HistoryBatchGroup | null,
  isNativeTextInput: boolean
): boolean => {
  if (shouldMergeBatch(currentBatch, current, previousBatch, previous)) {
    return true;
  }

  if (!current || !previous || current.root !== previous.root) return false;
  if (!isNativeTextInput) return true;

  return (
    current.kind === 'text' &&
    previous.kind === 'text' &&
    shouldMergeText(current, previous)
  );
};

export const mergeHistoryBatchGroups = (
  previous: HistoryBatchGroup | null,
  current: HistoryBatchGroup | null
): HistoryBatchGroup | null =>
  current?.kind === 'text' && previous?.kind === 'text'
    ? Object.freeze({
        ...current,
        replacedSelection:
          previous.replacedSelection || current.replacedSelection,
      })
    : current;
