import { type EditorCommit, RangeApi, type RootKey, type Selection } from '..';
import {
  documentChangePropertyOnlyWrites,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRootKeys,
  mapInternalDocumentChangePosition,
} from '../core/change/document-change';
import {
  getEditorCommitCompletedTextDeletion,
  getEditorCommitSnapshot,
  getEditorCommitValue,
} from '../core/commit';
import type { NativeGroupingInput } from '../core/native-grouping-input';
import { MAIN_ROOT_KEY, toPublicRoot } from '../core/public-root';
import type { Batch } from './history';

const failInvariant = (message: string): never => {
  throw new Error(message);
};

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

export type HistoryBatchGroup = Readonly<{
  /** No later commit merges into the entry. */
  closed?: true;
  native?: NativeGroupingInput;
  scope?: object;
}> &
  (
    | Readonly<{
        kind: 'effects';
      }>
    | Readonly<{
        kind: 'document';
        roots: readonly RootKey[];
      }>
    | Readonly<{
        kind: 'properties';
        roots: readonly RootKey[];
        targets: readonly string[];
      }>
    | TextHistoryGroup
  );

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
  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
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
  path: readonly number[] | null
): HistoryTarget | null => {
  const nodeKeys = commit.changed.nodeKeys('text', toPublicRoot(root));

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

const getPropertyGroup = (commit: EditorCommit): HistoryBatchGroup | null => {
  const writes = documentChangePropertyOnlyWrites(
    commit.changes,
    getEditorCommitValue(commit, 'before')
  );

  if (!writes || writes.length === 0) return null;

  const nodes = new Map<
    string,
    { keys: Set<string>; nodeKey: string; root: RootKey }
  >();

  for (const { keys, path, root } of writes) {
    const nodeKey = getEditorCommitSnapshot(commit, root, 'before').index.keyAt(
      path
    );

    if (!nodeKey) return null;

    const targetKey = JSON.stringify([root, nodeKey]);
    let entry = nodes.get(targetKey);

    if (!entry) {
      entry = { keys: new Set<string>(), nodeKey, root };
      nodes.set(targetKey, entry);
    }
    for (const key of keys) entry.keys.add(key);
  }

  const includeKeys = nodes.size > 1;
  const targets = [...nodes.values()]
    .map(({ keys, nodeKey, root }) =>
      JSON.stringify(
        includeKeys ? [root, nodeKey, [...keys].sort()] : [root, nodeKey]
      )
    )
    .sort();
  const roots = [...new Set(writes.map(({ root }) => root))].sort();

  return Object.freeze({
    kind: 'properties',
    roots: Object.freeze(roots),
    targets: Object.freeze(targets),
  });
};

const sameStrings = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

export const groupRoots = (group: HistoryBatchGroup): readonly RootKey[] =>
  group.kind === 'effects'
    ? []
    : group.kind === 'text'
      ? [group.root]
      : group.roots;

const sameGroupRoots = (left: HistoryBatchGroup, right: HistoryBatchGroup) =>
  sameStrings(groupRoots(left), groupRoots(right));

export const createHistoryBatchGroup = (
  commit: EditorCommit
): HistoryBatchGroup | null => {
  const propertyGroup = getPropertyGroup(commit);

  if (propertyGroup) return propertyGroup;

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
    changedPath ?? afterPoint?.path ?? beforePoint?.path ?? null
  );

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
        getTarget(commit, root, afterPoint.path) ??
        failInvariant('Expected value to be defined'),
      toAfter: changedSpan[3],
      toBefore: changedSpan[1],
    });
  }

  // Typing a suggested letter opens a text leaf of its own and splits the
  // text it lands in; adding only new text leaves still reads as typing.
  const opened = structureChanged
    ? commit.changed.nodeKeys('presence', publicRoot)
    : [];
  const opensLeaf =
    !replacedSelection &&
    opened.length > 0 &&
    opened.every((key) =>
      commit.changed.nodeKeys('text', publicRoot).includes(key)
    );

  if (
    range &&
    textTarget &&
    (opensLeaf || (textChanged && !structureChanged)) &&
    !propertiesChanged
  ) {
    const beforeLength = range[1] - range[0];
    const afterLength = range[3] - range[2];
    const mode =
      opensLeaf || (beforeLength === 0 && afterLength > 0)
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

  const deletion = getEditorCommitCompletedTextDeletion(commit);

  if (deletion?.root === root) {
    const fromAfter =
      mapInternalDocumentChangePosition(
        commit.changes,
        root,
        deletion.fromBefore
      ) ?? failInvariant('Expected the deleted text to map into the commit');
    const nodeKey = getEditorCommitSnapshot(commit, root, 'before').index.keyAt(
      deletion.pathBefore
    );

    return Object.freeze({
      afterPoint,
      beforePoint,
      fromAfter,
      fromBefore: deletion.fromBefore,
      kind: 'text',
      mode: 'delete',
      replacedSelection,
      root,
      target: Object.freeze({
        path: pathKey(deletion.pathBefore),
        ...(nodeKey ? { nodeKey } : {}),
      }),
      toAfter: fromAfter,
      toBefore: deletion.toBefore,
    });
  }

  return Object.freeze({ kind: 'document', roots: Object.freeze([root]) });
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
    // A letter typed into the leaf the previous insert opened lands inside
    // that insert, before the leaf's closing edge.
    return (
      current.fromBefore === previous.toAfter ||
      (samePoint(previous.afterPoint, current.beforePoint) &&
        current.fromBefore > previous.fromAfter &&
        current.fromBefore < previous.toAfter)
    );
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
  previous: HistoryBatchGroup | null,
  effectsCompatible = false
): boolean => {
  if (
    !effectsCompatible &&
    (currentBatch.effects.length > 0 || previousBatch.effects.length > 0)
  ) {
    return false;
  }

  if (
    !current ||
    !previous ||
    !sameGroupRoots(current, previous) ||
    current.scope !== previous.scope
  ) {
    return false;
  }

  if (current.kind === 'text' && previous.kind === 'text') {
    return shouldMergeText(current, previous);
  }

  return (
    current.kind === 'properties' &&
    previous.kind === 'properties' &&
    sameStrings(current.targets, previous.targets)
  );
};

export const shouldMergeCompositionBatch = (
  current: HistoryBatchGroup | null,
  previous: HistoryBatchGroup | null
): boolean =>
  Boolean(
    current &&
    previous &&
    (current.kind === 'effects' ||
      previous.kind === 'effects' ||
      sameGroupRoots(current, previous)) &&
    current.scope === previous.scope
  );

const changesNoRoot = ({ change }: Batch) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  getInternalDocumentChangeRootKeys(change).length === 0;

export const shouldMergeExplicitBatch = (
  currentBatch: Batch,
  current: HistoryBatchGroup | null,
  previousBatch: Batch,
  previous: HistoryBatchGroup | null,
  isNativeTextInput: boolean,
  effectsCompatible = false
): boolean => {
  if (
    shouldMergeBatch(
      currentBatch,
      current,
      previousBatch,
      previous,
      effectsCompatible
    )
  ) {
    return true;
  }

  if (effectsCompatible && !isNativeTextInput) return true;

  if (!current && !previous) {
    return changesNoRoot(currentBatch) && changesNoRoot(previousBatch);
  }
  if (
    !current ||
    !previous ||
    !sameGroupRoots(current, previous) ||
    current.scope !== previous.scope
  ) {
    return false;
  }
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
  current?.kind === 'effects' && previous
    ? previous
    : current?.kind === 'text' && previous?.kind === 'text'
      ? Object.freeze({
          ...current,
          replacedSelection:
            previous.replacedSelection || current.replacedSelection,
        })
      : current;
