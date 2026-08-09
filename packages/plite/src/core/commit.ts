import type {
  EditorCommit,
  EditorCommitChangeKind,
  EditorCommitChanged,
  EditorCommitRuntimeChangeKind,
  EditorDocumentValue,
  AnyEditor as Editor,
  EditorSnapshot,
  RootKey,
  NodeKey,
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
  bindDocumentChangeNodeKeys,
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
  changedNodeKeys: ReadonlySet<NodeKey>;
  paths: readonly Path[];
  pathNodeKeys: ReadonlySet<NodeKey>;
  propertiesChanged: boolean;
  structureChanged: boolean;
  textChanged: boolean;
  textNodeKeys: ReadonlySet<NodeKey>;
  touchedNodeKeys: ReadonlySet<NodeKey>;
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
  beforeIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
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

const bindInverseNodeKeys = (
  inverse: DocumentChange,
  before: JsonEditorValue,
  editor: Editor,
  beforeIndexAt?: (root: RootKey) => SnapshotIndex | undefined
) => {
  const indexes = new Map<RootKey, SnapshotIndex>();
  const keyAt = (root: RootKey, path: readonly number[]) => {
    let index = indexes.get(root);

    if (!index) {
      index =
        beforeIndexAt?.(root) ??
        buildOwnedSnapshotIndex(
          valueRoot(before, root) as readonly Descendant[],
          editor
        );
      indexes.set(root, index);
    }

    return index.keyAt(path as Path);
  };

  return bindDocumentChangeNodeKeys(inverse, before, keyAt);
};

const getSelectionRoot = (selection: Selection, fallback: RootKey): RootKey =>
  selection?.focus.root ?? selection?.anchor.root ?? fallback;

const getSelectionNodeKeys = (
  selection: Selection,
  root: RootKey,
  index: SnapshotIndex,
  selectionRoot: RootKey
): NodeKey[] => {
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
        .map((path) => index.keyAt(path))
        .filter((nodeKey): nodeKey is NodeKey => Boolean(nodeKey))
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

const getStableTopLevelNodeKeys = (
  before: readonly NodeKey[],
  after: readonly NodeKey[]
) => {
  const afterPositions = new Map(
    after.map((nodeKey, index) => [nodeKey, index] as const)
  );
  const common = before.filter((nodeKey) => afterPositions.has(nodeKey));
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

  const stable = new Set<NodeKey>();
  let cursor = tails.at(-1) ?? -1;

  while (cursor >= 0) {
    stable.add(common[cursor]!);
    cursor = predecessors[cursor]!;
  }

  return stable;
};

const samePath = (left: Path | undefined, right: Path | undefined) =>
  left !== undefined && right !== undefined && PathApi.equals(left, right);

const getNodeKeyAtPath = (index: SnapshotIndex, path: readonly number[]) =>
  index.keyAt(path as Path);

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
  const selectionNodeKeys = new Map<RootKey, ReadonlySet<NodeKey>>();
  const nodeKeys = new Map<string, readonly NodeKey[]>();

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
      const touchedChangedNodeKeys = new Set<NodeKey>();
      const changedNodeKeys = new Set<NodeKey>();
      const pathNodeKeys = new Set<NodeKey>();
      const textNodeKeys = new Set<NodeKey>();
      let nodeKeyChanged = false;
      let topLevelIdentityChanged = false;

      for (const changedPath of classification.paths) {
        for (let depth = 1; depth <= changedPath.length; depth++) {
          const path = changedPath.slice(0, depth) as Path;
          const key = path.join('.');
          const beforeNodeKey = beforeIndex.keyAt(path);
          const afterNodeKey = afterIndex.keyAt(path);

          touchedPaths.set(key, path);
          if (beforeNodeKey !== afterNodeKey) {
            nodeKeyChanged = true;
            if (depth === 1) topLevelIdentityChanged = true;
            if (afterNodeKey) pathNodeKeys.add(afterNodeKey);
          }
          if (beforeNodeKey) touchedChangedNodeKeys.add(beforeNodeKey);
          if (afterNodeKey) {
            touchedChangedNodeKeys.add(afterNodeKey);
            changedNodeKeys.add(afterNodeKey);
          }
        }

        if (classification.text) {
          const path = changedPath as Path;
          const nodeKey = afterIndex.keyAt(path);

          if (
            nodeKey &&
            'text' in (getDescendantAtPath(afterRoot, path) ?? {})
          ) {
            textNodeKeys.add(nodeKey);
          }
        }
      }

      const details = Object.freeze({
        changedNodeKeys,
        paths: Object.freeze(
          classification.paths.map((path) => Object.freeze([...path]) as Path)
        ),
        pathNodeKeys,
        propertiesChanged: classification.properties,
        structureChanged: nodeKeyChanged,
        textChanged: classification.text,
        textNodeKeys,
        touchedNodeKeys: touchedChangedNodeKeys,
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
      .map(([nodeKey]) => nodeKey);
    const afterTopLevel = afterIndex
      .entries()
      .filter(([, path]) => path.length === 1)
      .sort(([, left], [, right]) => left[0]! - right[0]!)
      .map(([nodeKey]) => nodeKey);
    const topLevelOrderChanged =
      beforeTopLevel.length !== afterTopLevel.length ||
      beforeTopLevel.some((nodeKey, index) => nodeKey !== afterTopLevel[index]);

    const beforeDocument = DocumentIndex.fromValue(valueRoot(before, root));
    const afterDocument = DocumentIndex.fromValue(valueRoot(after, root));
    const change = getInternalDocumentRootChange(changes, root);
    const touchedPaths = new Map<string, Path>();
    const topLevelTouchedPaths = new Map<string, Path>();
    const touchedChangedNodeKeys = new Set<NodeKey>();
    const pathNodeKeys = new Set<NodeKey>();
    const stableTopLevelNodeKeys = getStableTopLevelNodeKeys(
      beforeTopLevel,
      afterTopLevel
    );
    const beforeTopLevelPositions = new Map(
      beforeTopLevel.map((nodeKey, index) => [nodeKey, index] as const)
    );
    const afterTopLevelPositions = new Map(
      afterTopLevel.map((nodeKey, index) => [nodeKey, index] as const)
    );

    for (const nodeKey of new Set([...beforeTopLevel, ...afterTopLevel])) {
      const beforePosition = beforeTopLevelPositions.get(nodeKey);
      const afterPosition = afterTopLevelPositions.get(nodeKey);
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
        !stableTopLevelNodeKeys.has(nodeKey)
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
        const nodeKey = getNodeKeyAtPath(beforeIndex, path);

        touchedPaths.set(pathKey(path), path);
        if (nodeKey) touchedChangedNodeKeys.add(nodeKey);
      }

      for (const entry of afterDocument.nodeRangesTouching(
        fromAfter,
        toAfter
      )) {
        const path = [...entry.path] as Path;
        const nodeKey = getNodeKeyAtPath(afterIndex, path);

        touchedPaths.set(pathKey(path), path);
        if (nodeKey) touchedChangedNodeKeys.add(nodeKey);
      }
    });

    const allNodeKeys = new Set<NodeKey>([
      ...beforeIndex.entries().map(([nodeKey]) => nodeKey),
      ...afterIndex.entries().map(([nodeKey]) => nodeKey),
    ]);

    for (const nodeKey of allNodeKeys) {
      const beforePath = beforeIndex.pathOf(nodeKey) ?? undefined;
      const afterPath = afterIndex.pathOf(nodeKey) ?? undefined;

      if (afterPath && !samePath(beforePath, afterPath)) {
        pathNodeKeys.add(nodeKey);
        if (beforePath) touchedPaths.set(pathKey(beforePath), beforePath);
        if (afterPath) touchedPaths.set(pathKey(afterPath), afterPath);
      }
    }

    const beforeNodeKeys = new Set(
      beforeIndex.entries().map(([nodeKey]) => nodeKey)
    );
    const afterNodeKeys = new Set(
      afterIndex.entries().map(([nodeKey]) => nodeKey)
    );
    const changedNodeKeys = new Set(
      [...touchedChangedNodeKeys].filter((nodeKey) =>
        afterNodeKeys.has(nodeKey)
      )
    );

    const runtimeMembershipChanged =
      beforeNodeKeys.size !== afterNodeKeys.size ||
      [...beforeNodeKeys].some((nodeKey) => !afterNodeKeys.has(nodeKey));
    const structureChanged =
      changes.createRoots.has(root) ||
      changes.deleteRoots.has(root) ||
      runtimeMembershipChanged ||
      pathNodeKeys.size > 0;
    const textNodeKeys = new Set<NodeKey>();
    let propertiesChanged = false;
    let textChanged = false;

    for (const nodeKey of changedNodeKeys) {
      const beforePath = beforeIndex.pathOf(nodeKey);
      const afterPath = afterIndex.pathOf(nodeKey);
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
        textNodeKeys.add(nodeKey);
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
      changedNodeKeys,
      paths: Object.freeze(
        (change ? getDocumentChangeAfterPaths(change, afterDocument) : []).map(
          (path) => Object.freeze([...path]) as Path
        )
      ),
      pathNodeKeys,
      propertiesChanged,
      structureChanged,
      textChanged,
      textNodeKeys,
      touchedNodeKeys: touchedChangedNodeKeys,
      topLevelOrderChanged,
      topLevelRanges: getTopLevelRanges(topLevelTouchedPaths.values()),
    });

    rootDetails.set(root, details);

    return details;
  };

  const getSelectionIds = (root: RootKey) => {
    const cached = selectionNodeKeys.get(root);

    if (cached) return cached;

    const nodeKeys = new Set<NodeKey>([
      ...getSelectionNodeKeys(
        selectionBefore,
        root,
        getIndex('before', root),
        selectionBeforeRoot
      ),
      ...getSelectionNodeKeys(
        selectionAfter,
        root,
        getIndex('after', root),
        selectionAfterRoot
      ),
    ]);

    selectionNodeKeys.set(root, nodeKeys);

    return nodeKeys;
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

  const getNodeKeys = (
    kind: EditorCommitRuntimeChangeKind,
    root: RootKey
  ): readonly NodeKey[] => {
    const cacheKey = `${root}\u0000${kind}`;
    const cached = nodeKeys.get(cacheKey);

    if (cached) return cached;

    let result: readonly NodeKey[];

    switch (kind) {
      case 'decoration': {
        const details = getRootDetails(root);

        result = Object.freeze([
          ...new Set([
            ...details.changedNodeKeys,
            ...details.touchedNodeKeys,
            ...details.pathNodeKeys,
            ...getSelectionIds(root),
          ]),
        ]);
        break;
      }
      case 'projection': {
        const details = getRootDetails(root);

        result = Object.freeze([
          ...new Set([
            ...details.changedNodeKeys,
            ...details.touchedNodeKeys,
            ...details.pathNodeKeys,
            ...getSelectionIds(root),
          ]),
        ]);
        break;
      }
      case 'node':
        result = Object.freeze([...getRootDetails(root).changedNodeKeys]);
        break;
      case 'path':
        result = Object.freeze([...getRootDetails(root).pathNodeKeys]);
        break;
      case 'selection':
        result = Object.freeze([...getSelectionIds(root)]);
        break;
      case 'text':
        result = Object.freeze([...getRootDetails(root).textNodeKeys]);
        break;
    }

    nodeKeys.set(cacheKey, result);

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
    hasNodeKey: (nodeKey, kind) =>
      [...allKnownRoots()].some((root) =>
        getNodeKeys(kind, root).includes(nodeKey)
      ),
    paths: (root) => getRootDetails(toInternalRoot(root)).paths,
    nodeKeys: (kind, root) => getNodeKeys(kind, toInternalRoot(root)),
    nodeKeysAll: (kind) =>
      Object.freeze([
        ...new Set(
          [...allKnownRoots()].flatMap((root) => getNodeKeys(kind, root))
        ),
      ]),
    topLevelRanges: (root) => getChangedTopLevelRanges(toInternalRoot(root)),
  });
};

export const createEditorCommit = <V extends Value>(
  input: CommitInput<V>,
  versions: { previousVersion: number; version: number }
): EditorCommit<V> => {
  const {
    afterValue,
    beforeIndexAt,
    beforeValue,
    editor,
    replace = false,
    ...body
  } = input;
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
      (inverseChanges ??= bindInverseNodeKeys(
        body.changes.invert(beforeValue as JsonEditorValue),
        beforeValue as JsonEditorValue,
        editor,
        beforeIndexAt
      )),
  });

  EDITOR_COMMIT_SNAPSHOT_SOURCES.set(commit, {
    editor,
    value: afterValue as JsonEditorValue,
  });

  return Object.freeze(commit);
};
