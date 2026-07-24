import type {
  EditorCommit,
  EditorCommitChangeKind,
  EditorCommitChanged,
  EditorCommitRuntimeChangeKind,
  EditorDocumentValue,
  Editor,
  EditorSnapshot,
  RootKey,
  RuntimeId,
  Selection,
  SnapshotIndex,
  TopLevelRuntimeRange,
  Value,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import {
  type DocumentChange,
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from './change/document-change';
import { getDocumentChangeAfterPaths } from './change/classification';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';
import { getEditorRuntimeOwner } from './editor-runtime';
import { buildSnapshotIndex, pathKey } from './snapshot-index';
import { toInternalRoot, toPublicRoot } from './public-root';
import { cloneFrozenEditorJsonValue } from './value-codec';

type RootChangeDetails = {
  nodeRuntimeIds: ReadonlySet<RuntimeId>;
  paths: readonly Path[];
  pathRuntimeIds: ReadonlySet<RuntimeId>;
  propertiesChanged: boolean;
  structureChanged: boolean;
  textChanged: boolean;
  textRuntimeIds: ReadonlySet<RuntimeId>;
  touchedRuntimeIds: ReadonlySet<RuntimeId>;
  topLevelOrderChanged: boolean;
  topLevelRanges: readonly TopLevelRuntimeRange[];
};

type CommitChangedInput = {
  afterIndex: () => SnapshotIndex;
  after: JsonEditorValue;
  beforeIndex: () => SnapshotIndex;
  before: JsonEditorValue;
  changes: DocumentChange;
  replace: boolean;
  selectionAfter: Selection;
  selectionAfterRoot: RootKey;
  selectionBefore: Selection;
  selectionBeforeRoot: RootKey;
  selectionChanged: boolean;
  stateChanged: boolean;
  editor: Editor;
};

type CommitInput<V extends Value> = Omit<
  EditorCommit<V>,
  | 'changed'
  | 'inverseChanges'
  | 'previousVersion'
  | 'selectionAfterRoot'
  | 'selectionBeforeRoot'
  | 'version'
> & {
  afterValue: EditorDocumentValue<V>;
  beforeValue: EditorDocumentValue<V>;
  editor: Editor<V>;
  replace?: boolean;
  selectionAfterRoot: RootKey;
  selectionBeforeRoot: RootKey;
};

type EditorCommitSnapshotSource = Readonly<{
  editor: Editor;
  value: JsonEditorValue;
}>;

const EDITOR_COMMIT_SNAPSHOT_SOURCES = new WeakMap<
  EditorCommit,
  EditorCommitSnapshotSource
>();
const EDITOR_COMMIT_ROOT_SNAPSHOTS = new WeakMap<
  EditorCommit,
  Map<RootKey, EditorSnapshot>
>();

/** @internal Return the immutable post-commit snapshot for one document root. */
export const getEditorCommitSnapshot = <V extends Value>(
  commit: EditorCommit<V>,
  root: RootKey = 'main'
): EditorSnapshot<V> => {
  if (root === 'main') return commit.after;

  const source = EDITOR_COMMIT_SNAPSHOT_SOURCES.get(commit);

  if (!source) {
    throw new Error('Editor commit snapshot source is unavailable.');
  }
  let snapshots = EDITOR_COMMIT_ROOT_SNAPSHOTS.get(commit);

  if (!snapshots) {
    snapshots = new Map([['main', commit.after]]);
    EDITOR_COMMIT_ROOT_SNAPSHOTS.set(commit, snapshots);
  }
  const cached = snapshots.get(root);

  if (cached) return cached as EditorSnapshot<V>;
  const children = valueRoot(source.value, root) as V;
  let index: SnapshotIndex | undefined;
  const snapshot = {
    children,
    selection:
      toInternalRoot(commit.selectionAfterRoot) === root
        ? commit.selectionAfter
        : null,
    version: commit.version,
  };

  Object.defineProperty(snapshot, 'index', {
    enumerable: true,
    get: () =>
      (index ??= buildOwnedSnapshotIndex(
        children as readonly Descendant[],
        source.editor
      )),
  });
  const frozen = Object.freeze(snapshot) as EditorSnapshot<V>;

  snapshots.set(root, frozen);

  return frozen;
};

const valueRoot = (value: JsonEditorValue, root: RootKey) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const buildOwnedSnapshotIndex = (
  children: readonly Descendant[],
  editor: Editor
): SnapshotIndex => buildSnapshotIndex(getEditorRuntimeOwner(editor), children);

const getSelectionRoot = (selection: Selection, fallback: RootKey): RootKey =>
  selection?.focus.root ?? selection?.anchor.root ?? fallback;

const getSelectionRuntimeIds = (
  selection: Selection,
  root: RootKey,
  index: SnapshotIndex,
  selectionRoot: RootKey
): RuntimeId[] => {
  if (!selection || getSelectionRoot(selection, selectionRoot) !== root) {
    return [];
  }

  const paths: Path[] = [];

  for (const point of [selection.anchor, selection.focus]) {
    for (let depth = point.path.length; depth > 0; depth--) {
      paths.push(point.path.slice(0, depth));
    }
  }

  if (!RangeApi.isCollapsed(selection)) {
    for (const [, path] of index.entries()) {
      if (RangeApi.includes(selection, path)) paths.push(path);
    }
  }

  return [
    ...new Set(
      paths
        .map((path) => index.idAt(path))
        .filter((runtimeId): runtimeId is RuntimeId => Boolean(runtimeId))
    ),
  ];
};

const getTopLevelRanges = (
  paths: Iterable<Path>
): readonly TopLevelRuntimeRange[] => {
  const indexes = [
    ...new Set(
      [...paths]
        .map((path) => path[0])
        .filter((index): index is number => index !== undefined)
    ),
  ].sort((left, right) => left - right);

  if (indexes.length === 0) return Object.freeze([]);

  const ranges: TopLevelRuntimeRange[] = [];
  let start = indexes[0]!;
  let end = start;

  for (const index of indexes.slice(1)) {
    if (index === end + 1) {
      end = index;
    } else {
      ranges.push(Object.freeze([start, end]));
      start = index;
      end = index;
    }
  }

  ranges.push(Object.freeze([start, end]));

  return Object.freeze(ranges);
};

const getChangedTopLevelRange = (
  document: DocumentIndex,
  from: number,
  to: number
): TopLevelRuntimeRange | null => {
  if (document.value.length === 0) return null;

  if (from === to) {
    const point = document.pointAt(from, 1) ?? document.pointAt(from, -1);
    const index = point?.path[0];

    return index === undefined ? null : Object.freeze([index, index]);
  }

  const start =
    document.openContextAt(from)[0]?.path[0] ??
    document.pointAt(from, 1)?.path[0];
  const end =
    document.openContextAt(to - 1)[0]?.path[0] ??
    document.pointAt(to - 1, -1)?.path[0];

  return start === undefined || end === undefined
    ? null
    : Object.freeze([Math.min(start, end), Math.max(start, end)]);
};

const mergeTopLevelRanges = (
  ranges: readonly TopLevelRuntimeRange[]
): readonly TopLevelRuntimeRange[] => {
  if (ranges.length === 0) return Object.freeze([]);

  const ordered = ranges.toSorted(
    (left, right) => left[0] - right[0] || left[1] - right[1]
  );
  const merged: TopLevelRuntimeRange[] = [];
  let [start, end] = ordered[0]!;

  for (const [nextStart, nextEnd] of ordered.slice(1)) {
    if (nextStart <= end + 1) {
      end = Math.max(end, nextEnd);
    } else {
      merged.push(Object.freeze([start, end]));
      start = nextStart;
      end = nextEnd;
    }
  }

  merged.push(Object.freeze([start, end]));

  return Object.freeze(merged);
};

const getStableTopLevelRuntimeIds = (
  before: readonly RuntimeId[],
  after: readonly RuntimeId[]
) => {
  const afterPositions = new Map(
    after.map((runtimeId, index) => [runtimeId, index] as const)
  );
  const common = before.filter((runtimeId) => afterPositions.has(runtimeId));
  const predecessors = new Array<number>(common.length).fill(-1);
  const tails: number[] = [];

  for (let index = 0; index < common.length; index++) {
    const position = afterPositions.get(common[index]!)!;
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >> 1;
      const tailPosition = afterPositions.get(common[tails[middle]!]!)!;

      if (tailPosition < position) low = middle + 1;
      else high = middle;
    }

    if (low > 0) predecessors[index] = tails[low - 1]!;
    tails[low] = index;
  }

  const stable = new Set<RuntimeId>();
  let cursor = tails.at(-1) ?? -1;

  while (cursor >= 0) {
    stable.add(common[cursor]!);
    cursor = predecessors[cursor]!;
  }

  return stable;
};

const samePath = (left: Path | undefined, right: Path | undefined) =>
  left !== undefined && right !== undefined && PathApi.equals(left, right);

const getNodeRuntimeId = (index: SnapshotIndex, path: readonly number[]) =>
  index.idAt(path as Path);

const getDescendantAtPath = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];

    if (!node) return null;

    descendants =
      'children' in node && Array.isArray(node.children)
        ? (node.children as Descendant[])
        : [];
  }

  return node ?? null;
};

const jsonValueEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValueEqual(value, right[index]))
    );
  }

  if (
    typeof left !== 'object' ||
    left === null ||
    typeof right !== 'object' ||
    right === null
  ) {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        jsonValueEqual(leftRecord[key], rightRecord[key])
    )
  );
};

const nodePropertiesEqual = (left: object, right: object) => {
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).filter(
    (key) => key !== 'children' && key !== 'text'
  );
  const rightKeys = Object.keys(rightRecord).filter(
    (key) => key !== 'children' && key !== 'text'
  );

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        jsonValueEqual(leftRecord[key], rightRecord[key])
    )
  );
};

const getPendingSelectionMarks = (selection: Selection) =>
  SelectionApi.isText(selection) && RangeApi.isCollapsed(selection)
    ? (selection.marks ?? null)
    : null;

const createCommitChanged = ({
  afterIndex,
  after,
  beforeIndex,
  before,
  changes,
  replace,
  selectionAfter,
  selectionAfterRoot,
  selectionBefore,
  selectionBeforeRoot,
  selectionChanged,
  stateChanged,
  editor,
}: CommitChangedInput): EditorCommitChanged => {
  const marksChanged = !jsonValueEqual(
    getPendingSelectionMarks(selectionBefore),
    getPendingSelectionMarks(selectionAfter)
  );
  const beforeIndexes = new Map<RootKey, SnapshotIndex>();
  const afterIndexes = new Map<RootKey, SnapshotIndex>();
  const rootDetails = new Map<RootKey, RootChangeDetails>();
  const topLevelRangeCache = new Map<
    RootKey,
    readonly TopLevelRuntimeRange[]
  >();
  const selectionRuntimeIds = new Map<RootKey, ReadonlySet<RuntimeId>>();
  const runtimeIds = new Map<string, readonly RuntimeId[]>();

  const roots = new Set<RootKey>([
    ...[...getInternalDocumentChangeEntries(changes)].map(([root]) => root),
    ...changes.createRoots,
    ...changes.deleteRoots,
  ]);

  const getIndex = (phase: 'after' | 'before', root: RootKey) => {
    const cache = phase === 'before' ? beforeIndexes : afterIndexes;
    const cached = cache.get(root);

    if (cached) return cached;

    const value = phase === 'before' ? before : after;
    const index =
      root === 'main'
        ? phase === 'before'
          ? beforeIndex()
          : afterIndex()
        : buildOwnedSnapshotIndex(
            valueRoot(value, root) as readonly Descendant[],
            editor
          );

    cache.set(root, index);

    return index;
  };

  const getChangedTopLevelRanges = (
    root: RootKey
  ): readonly TopLevelRuntimeRange[] => {
    const cached = topLevelRangeCache.get(root);

    if (cached) return cached;
    const change = getInternalDocumentRootChange(changes, root);

    if (!change) {
      const empty = Object.freeze([]) as readonly TopLevelRuntimeRange[];

      topLevelRangeCache.set(root, empty);

      return empty;
    }

    const beforeDocument = DocumentIndex.fromValue(valueRoot(before, root));
    const afterDocument = DocumentIndex.fromValue(valueRoot(after, root));
    const movedTargetIndex = change.movedNode(beforeDocument)?.targetPath[0];
    const ranges: TopLevelRuntimeRange[] = [];

    change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      const afterRange = getChangedTopLevelRange(
        afterDocument,
        fromAfter,
        toAfter
      );

      if (!afterRange) return;
      let [start, end] = afterRange;

      if (fromAfter === toAfter) {
        const beforeRange = getChangedTopLevelRange(
          beforeDocument,
          fromBefore,
          toBefore
        );
        const survivor = afterDocument.value[start];

        if (beforeRange && survivor) {
          let [removedStart, removedEnd] = beforeRange;

          if (
            removedStart < removedEnd &&
            beforeDocument.value[removedStart] === survivor
          ) {
            removedStart++;
          }
          if (
            removedStart < removedEnd &&
            beforeDocument.value[removedEnd] === survivor
          ) {
            removedEnd--;
          }

          end = Math.min(
            afterDocument.value.length - 1,
            start + removedEnd - removedStart
          );
        }
      }

      if (fromAfter !== toAfter) {
        const beforeRange = getChangedTopLevelRange(
          beforeDocument,
          fromBefore,
          toBefore
        );

        if (beforeRange) {
          const beforeBoundaryNodes = new Set([
            beforeDocument.value[beforeRange[0]],
            beforeDocument.value[beforeRange[1]],
          ]);
          const isStableContext = (index: number) =>
            index !== movedTargetIndex &&
            beforeBoundaryNodes.has(afterDocument.value[index]);

          if (start < end && isStableContext(start)) start++;
          if (start < end && isStableContext(end)) end--;
        }
      }

      ranges.push(Object.freeze([start, end]));
    });

    const result = mergeTopLevelRanges(ranges);

    topLevelRangeCache.set(root, result);

    return result;
  };

  const getRootDetails = (root: RootKey): RootChangeDetails => {
    const cached = rootDetails.get(root);

    if (cached) return cached;

    const beforeIndex = getIndex('before', root);
    const afterIndex = getIndex('after', root);
    const classification = getInternalDocumentChangeClassification(
      changes,
      root
    );

    if (classification && !classification.structure) {
      const afterRoot = valueRoot(after, root) as readonly Descendant[];
      const touchedPaths = new Map<string, Path>();
      const touchedNodeRuntimeIds = new Set<RuntimeId>();
      const nodeRuntimeIds = new Set<RuntimeId>();
      const pathRuntimeIds = new Set<RuntimeId>();
      const textRuntimeIds = new Set<RuntimeId>();
      let runtimeIdentityChanged = false;
      let topLevelIdentityChanged = false;

      for (const changedPath of classification.paths) {
        for (let depth = 1; depth <= changedPath.length; depth++) {
          const path = changedPath.slice(0, depth) as Path;
          const key = path.join('.');
          const beforeRuntimeId = beforeIndex.idAt(path);
          const afterRuntimeId = afterIndex.idAt(path);

          touchedPaths.set(key, path);
          if (beforeRuntimeId !== afterRuntimeId) {
            runtimeIdentityChanged = true;
            if (depth === 1) topLevelIdentityChanged = true;
            if (afterRuntimeId) pathRuntimeIds.add(afterRuntimeId);
          }
          if (beforeRuntimeId) touchedNodeRuntimeIds.add(beforeRuntimeId);
          if (afterRuntimeId) {
            touchedNodeRuntimeIds.add(afterRuntimeId);
            nodeRuntimeIds.add(afterRuntimeId);
          }
        }

        if (classification.text) {
          const path = changedPath as Path;
          const runtimeId = afterIndex.idAt(path);

          if (
            runtimeId &&
            'text' in (getDescendantAtPath(afterRoot, path) ?? {})
          ) {
            textRuntimeIds.add(runtimeId);
          }
        }
      }

      const details = Object.freeze({
        nodeRuntimeIds,
        paths: Object.freeze(
          classification.paths.map((path) => Object.freeze([...path]) as Path)
        ),
        pathRuntimeIds,
        propertiesChanged: classification.properties,
        structureChanged: runtimeIdentityChanged,
        textChanged: classification.text,
        textRuntimeIds,
        touchedRuntimeIds: touchedNodeRuntimeIds,
        topLevelOrderChanged: topLevelIdentityChanged,
        topLevelRanges: getTopLevelRanges(touchedPaths.values()),
      });

      rootDetails.set(root, details);

      return details;
    }

    const beforeTopLevel = beforeIndex
      .entries()
      .filter(([, path]) => path.length === 1)
      .sort(([, left], [, right]) => left[0]! - right[0]!)
      .map(([runtimeId]) => runtimeId);
    const afterTopLevel = afterIndex
      .entries()
      .filter(([, path]) => path.length === 1)
      .sort(([, left], [, right]) => left[0]! - right[0]!)
      .map(([runtimeId]) => runtimeId);
    const topLevelOrderChanged =
      beforeTopLevel.length !== afterTopLevel.length ||
      beforeTopLevel.some(
        (runtimeId, index) => runtimeId !== afterTopLevel[index]
      );

    const beforeDocument = DocumentIndex.fromValue(valueRoot(before, root));
    const afterDocument = DocumentIndex.fromValue(valueRoot(after, root));
    const change = getInternalDocumentRootChange(changes, root);
    const touchedPaths = new Map<string, Path>();
    const topLevelTouchedPaths = new Map<string, Path>();
    const touchedNodeRuntimeIds = new Set<RuntimeId>();
    const pathRuntimeIds = new Set<RuntimeId>();
    const stableTopLevelRuntimeIds = getStableTopLevelRuntimeIds(
      beforeTopLevel,
      afterTopLevel
    );
    const beforeTopLevelPositions = new Map(
      beforeTopLevel.map((runtimeId, index) => [runtimeId, index] as const)
    );
    const afterTopLevelPositions = new Map(
      afterTopLevel.map((runtimeId, index) => [runtimeId, index] as const)
    );

    for (const runtimeId of new Set([...beforeTopLevel, ...afterTopLevel])) {
      const beforePosition = beforeTopLevelPositions.get(runtimeId);
      const afterPosition = afterTopLevelPositions.get(runtimeId);
      const beforePath =
        beforePosition === undefined ? undefined : ([beforePosition] as Path);
      const afterPath =
        afterPosition === undefined ? undefined : ([afterPosition] as Path);
      const contentChanged =
        beforePath !== undefined &&
        afterPath !== undefined &&
        !jsonValueEqual(
          beforeDocument.node(beforePath),
          afterDocument.node(afterPath)
        );

      if (
        beforePath === undefined ||
        afterPath === undefined ||
        contentChanged ||
        !stableTopLevelRuntimeIds.has(runtimeId)
      ) {
        if (beforePath) {
          topLevelTouchedPaths.set(pathKey(beforePath), beforePath);
        }
        if (afterPath) topLevelTouchedPaths.set(pathKey(afterPath), afterPath);
      }
    }

    change?.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      for (const entry of beforeDocument.nodeRangesTouching(
        fromBefore,
        toBefore
      )) {
        const path = [...entry.path] as Path;
        const runtimeId = getNodeRuntimeId(beforeIndex, path);

        touchedPaths.set(pathKey(path), path);
        if (runtimeId) touchedNodeRuntimeIds.add(runtimeId);
      }

      for (const entry of afterDocument.nodeRangesTouching(
        fromAfter,
        toAfter
      )) {
        const path = [...entry.path] as Path;
        const runtimeId = getNodeRuntimeId(afterIndex, path);

        touchedPaths.set(pathKey(path), path);
        if (runtimeId) touchedNodeRuntimeIds.add(runtimeId);
      }
    });

    const allRuntimeIds = new Set<RuntimeId>([
      ...beforeIndex.entries().map(([runtimeId]) => runtimeId),
      ...afterIndex.entries().map(([runtimeId]) => runtimeId),
    ]);

    for (const runtimeId of allRuntimeIds) {
      const beforePath = beforeIndex.pathOf(runtimeId) ?? undefined;
      const afterPath = afterIndex.pathOf(runtimeId) ?? undefined;

      if (afterPath && !samePath(beforePath, afterPath)) {
        pathRuntimeIds.add(runtimeId);
        if (beforePath) touchedPaths.set(pathKey(beforePath), beforePath);
        if (afterPath) touchedPaths.set(pathKey(afterPath), afterPath);
      }
    }

    const beforeRuntimeIds = new Set(
      beforeIndex.entries().map(([runtimeId]) => runtimeId)
    );
    const afterRuntimeIds = new Set(
      afterIndex.entries().map(([runtimeId]) => runtimeId)
    );
    const nodeRuntimeIds = new Set(
      [...touchedNodeRuntimeIds].filter((runtimeId) =>
        afterRuntimeIds.has(runtimeId)
      )
    );

    const runtimeMembershipChanged =
      beforeRuntimeIds.size !== afterRuntimeIds.size ||
      [...beforeRuntimeIds].some(
        (runtimeId) => !afterRuntimeIds.has(runtimeId)
      );
    const structureChanged =
      changes.createRoots.has(root) ||
      changes.deleteRoots.has(root) ||
      runtimeMembershipChanged ||
      pathRuntimeIds.size > 0;
    const textRuntimeIds = new Set<RuntimeId>();
    let propertiesChanged = false;
    let textChanged = false;

    for (const runtimeId of nodeRuntimeIds) {
      const beforePath = beforeIndex.pathOf(runtimeId);
      const afterPath = afterIndex.pathOf(runtimeId);
      const beforeNode = beforePath ? beforeDocument.node(beforePath) : null;
      const afterNode = afterPath ? afterDocument.node(afterPath) : null;
      const beforeText =
        beforeNode && 'text' in beforeNode ? beforeNode.text : null;
      const afterText =
        afterNode && 'text' in afterNode ? afterNode.text : null;

      if (
        (beforeText !== null || afterText !== null) &&
        beforeText !== afterText
      ) {
        textChanged = true;
        textRuntimeIds.add(runtimeId);
      }
      if (
        beforeNode &&
        afterNode &&
        !nodePropertiesEqual(beforeNode, afterNode)
      ) {
        propertiesChanged = true;
      }
    }

    const details = Object.freeze({
      nodeRuntimeIds,
      paths: Object.freeze(
        (change ? getDocumentChangeAfterPaths(change, afterDocument) : []).map(
          (path) => Object.freeze([...path]) as Path
        )
      ),
      pathRuntimeIds,
      propertiesChanged,
      structureChanged,
      textChanged,
      textRuntimeIds,
      touchedRuntimeIds: touchedNodeRuntimeIds,
      topLevelOrderChanged,
      topLevelRanges: getTopLevelRanges(topLevelTouchedPaths.values()),
    });

    rootDetails.set(root, details);

    return details;
  };

  const getSelectionIds = (root: RootKey) => {
    const cached = selectionRuntimeIds.get(root);

    if (cached) return cached;

    const runtimeIds = new Set<RuntimeId>([
      ...getSelectionRuntimeIds(
        selectionBefore,
        root,
        getIndex('before', root),
        selectionBeforeRoot
      ),
      ...getSelectionRuntimeIds(
        selectionAfter,
        root,
        getIndex('after', root),
        selectionAfterRoot
      ),
    ]);

    selectionRuntimeIds.set(root, runtimeIds);

    return runtimeIds;
  };

  const hasInRoot = (kind: EditorCommitChangeKind, root: RootKey): boolean => {
    const classification = getInternalDocumentChangeClassification(
      changes,
      root
    );

    switch (kind) {
      case 'document':
        return (
          !!getInternalDocumentRootChange(changes, root) ||
          changes.createRoots.has(root) ||
          changes.deleteRoots.has(root)
        );
      case 'marks':
        return (
          marksChanged &&
          ((selectionBefore !== null && selectionBeforeRoot === root) ||
            (selectionAfter !== null && selectionAfterRoot === root))
        );
      case 'properties':
        return (
          hasInRoot('document', root) &&
          (classification
            ? classification.properties
            : getRootDetails(root).propertiesChanged)
        );
      case 'replace':
        return replace && hasInRoot('document', root);
      case 'root-order':
        return getRootDetails(root).topLevelOrderChanged;
      case 'selection':
        return (
          selectionChanged &&
          ((selectionBefore !== null && selectionBeforeRoot === root) ||
            (selectionAfter !== null && selectionAfterRoot === root))
        );
      case 'snapshot':
        return (
          hasInRoot('document', root) ||
          hasInRoot('selection', root) ||
          hasInRoot('marks', root) ||
          stateChanged
        );
      case 'state':
        return stateChanged;
      case 'structure':
        return classification
          ? classification.structure || getRootDetails(root).structureChanged
          : getRootDetails(root).structureChanged;
      case 'text':
        return classification?.text ?? getRootDetails(root).textChanged;
    }
  };

  const getRuntimeIds = (
    kind: EditorCommitRuntimeChangeKind,
    root: RootKey
  ): readonly RuntimeId[] => {
    const cacheKey = `${root}\u0000${kind}`;
    const cached = runtimeIds.get(cacheKey);

    if (cached) return cached;

    let result: readonly RuntimeId[];

    switch (kind) {
      case 'decoration': {
        const details = getRootDetails(root);

        result = Object.freeze([
          ...new Set([
            ...details.nodeRuntimeIds,
            ...details.touchedRuntimeIds,
            ...details.pathRuntimeIds,
            ...getSelectionIds(root),
          ]),
        ]);
        break;
      }
      case 'projection': {
        const details = getRootDetails(root);

        result = Object.freeze([
          ...new Set([
            ...details.nodeRuntimeIds,
            ...details.touchedRuntimeIds,
            ...details.pathRuntimeIds,
            ...getSelectionIds(root),
          ]),
        ]);
        break;
      }
      case 'node':
        result = Object.freeze([...getRootDetails(root).nodeRuntimeIds]);
        break;
      case 'path':
        result = Object.freeze([...getRootDetails(root).pathRuntimeIds]);
        break;
      case 'selection':
        result = Object.freeze([...getSelectionIds(root)]);
        break;
      case 'text':
        result = Object.freeze([...getRootDetails(root).textRuntimeIds]);
        break;
    }

    runtimeIds.set(cacheKey, result);

    return result;
  };

  const allKnownRoots = () => {
    const result = new Set<RootKey>(roots);

    if (selectionBefore) {
      result.add(getSelectionRoot(selectionBefore, selectionBeforeRoot));
    }
    if (selectionAfter) {
      result.add(getSelectionRoot(selectionAfter, selectionAfterRoot));
    }
    if (result.size === 0) result.add('main');

    return result;
  };

  return Object.freeze({
    has: (kind, root) => hasInRoot(kind, toInternalRoot(root)),
    hasAny: (kind) =>
      [...allKnownRoots()].some((root) => hasInRoot(kind, root)),
    hasRuntime: (runtimeId, kind) =>
      [...allKnownRoots()].some((root) =>
        getRuntimeIds(kind, root).includes(runtimeId)
      ),
    paths: (root) => getRootDetails(toInternalRoot(root)).paths,
    runtimeIds: (kind, root) => getRuntimeIds(kind, toInternalRoot(root)),
    runtimeIdsAll: (kind) =>
      Object.freeze([
        ...new Set(
          [...allKnownRoots()].flatMap((root) => getRuntimeIds(kind, root))
        ),
      ]),
    topLevelRanges: (root) => getChangedTopLevelRanges(toInternalRoot(root)),
  });
};

export const createEditorCommit = <V extends Value>(
  input: CommitInput<V>,
  versions: { previousVersion: number; version: number }
): EditorCommit<V> => {
  const { afterValue, beforeValue, editor, replace = false, ...body } = input;
  const commit = {
    ...body,
    annotations: Object.freeze({ ...body.annotations }),
    dirtyStateKeys: Object.freeze([...body.dirtyStateKeys]),
    effects: Object.freeze([...body.effects]),
    previousVersion: versions.previousVersion,
    selectionAfter: cloneFrozenEditorJsonValue(body.selectionAfter),
    selectionAfterRoot: toPublicRoot(body.selectionAfterRoot),
    selectionBefore: cloneFrozenEditorJsonValue(body.selectionBefore),
    selectionBeforeRoot: toPublicRoot(body.selectionBeforeRoot),
    tags: Object.freeze([...body.tags]),
    version: versions.version,
  } as EditorCommit<V>;

  Object.defineProperty(commit, 'changed', {
    configurable: false,
    enumerable: true,
    value: createCommitChanged({
      afterIndex: () => body.after.index,
      after: afterValue as JsonEditorValue,
      beforeIndex: () => body.before.index,
      before: beforeValue as JsonEditorValue,
      changes: body.changes,
      replace,
      selectionAfter: body.selectionAfter,
      selectionAfterRoot: body.selectionAfterRoot,
      selectionBefore: body.selectionBefore,
      selectionBeforeRoot: body.selectionBeforeRoot,
      selectionChanged: body.selectionChanged,
      stateChanged: body.dirtyStateKeys.length > 0,
      editor,
    }),
  });
  let inverseChanges: DocumentChange | undefined;

  Object.defineProperty(commit, 'inverseChanges', {
    configurable: false,
    enumerable: true,
    get: () =>
      (inverseChanges ??= body.changes.invert(beforeValue as JsonEditorValue)),
  });

  EDITOR_COMMIT_SNAPSHOT_SOURCES.set(commit, {
    editor,
    value: afterValue as JsonEditorValue,
  });

  return Object.freeze(commit);
};
