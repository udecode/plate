import type {
  EditorCommit,
  EditorCommitChangeKind,
  EditorCommitChanged,
  EditorCommitRuntimeChangeKind,
  EditorDocumentValue,
  AnyEditor as Editor,
  EditorSnapshot,
  NamedRootKey,
  RootKey,
  NodeKey,
  Selection,
  SnapshotIndex,
  TopLevelRuntimeRange,
  Value,
} from '../interfaces/editor';
import { NodeApi, type Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { failInvariant } from '../internal/fail-invariant';
import type { CompletedTextDeletion } from './change/builder';
import type { CarriedRun } from './change/carried-run';
import { getDocumentChangeAfterPaths } from './change/classification';
import {
  bindDocumentChangeNodeKeys,
  type DocumentChange,
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  valueRootIndex,
  valueRootNodes,
} from './change/document-change';
import type { DocumentIndex, NodeList } from './change/document-index';
import { lazyRootOf, setLazyRoot } from './change/lazy-root';
import type { JsonEditorValue } from './change/tokens';
import { getEditorRuntimeOwner } from './editor-runtime';
import { toInternalRoot, toPublicRoot } from './public-root';
import { pathKey, snapshotIndexOf } from './snapshot-index';
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
};

type TouchedKeys = Readonly<{
  after: ReadonlyMap<NodeKey, Path>;
  before: ReadonlyMap<NodeKey, Path>;
  rootCreatedOrDeleted: boolean;
}>;

type CommitChangedInput = {
  afterIndex: () => SnapshotIndex;
  afterIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
  beforeIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
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
  afterIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
  afterValue: EditorDocumentValue<V>;
  beforeIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
  beforeValue: EditorDocumentValue<V>;
  completedTextDeletion?: CompletedTextDeletion | null;
  carried?: readonly CarriedRun[];
  editor: Editor<V>;
  replace?: boolean;
  admission?: EditorCommitAdmission | null;
  settlement?: EditorCommitSettlement;
  split?: EditorCommitSplit | null;
  selectionAfterRoot: RootKey;
  selectionBeforeRoot: RootKey;
};

type EditorCommitSnapshotSource = Readonly<{
  afterIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
  beforeIndexAt?: (root: RootKey) => SnapshotIndex | undefined;
  beforeValue: EditorDocumentValue;
  editor: Editor;
  value: EditorDocumentValue;
}>;

const EDITOR_COMMIT_SNAPSHOT_SOURCES = new WeakMap<
  EditorCommit,
  EditorCommitSnapshotSource
>();
const EDITOR_COMMIT_STARTED_AT = new WeakMap<EditorCommit, number>();
const EDITOR_COMMIT_COMPLETED_TEXT_DELETIONS = new WeakMap<
  EditorCommit,
  CompletedTextDeletion
>();

export type EditorCommitSettlement = Readonly<{
  admitted: EditorDocumentValue;
  change: DocumentChange;
}>;

/**
 * A commit that settled a decision's text, split into what takes the
 * settlement back and what undoes the rest.
 */
export type EditorCommitSplit = Readonly<{
  rest: DocumentChange;
  takeBack: DocumentChange;
}>;

/** What the commit's document admission repaired, from the value it saw. */
export type EditorCommitAdmission = Readonly<{
  base: EditorDocumentValue;
  repair: DocumentChange;
}>;

const EDITOR_COMMIT_UNSETTLES = new WeakMap<
  EditorCommit,
  () => DocumentChange
>();
const EDITOR_COMMIT_RESTS = new WeakMap<EditorCommit, DocumentChange>();
const EDITOR_COMMIT_CARRIED = new WeakMap<
  EditorCommit,
  readonly CarriedRun[]
>();
const EDITOR_COMMIT_ADMISSIONS = new WeakMap<
  EditorCommit,
  EditorCommitAdmission
>();
const EDITOR_COMMIT_ROOT_SNAPSHOTS = new WeakMap<
  EditorCommit,
  { after: Map<RootKey, EditorSnapshot>; before: Map<RootKey, EditorSnapshot> }
>();

/** @internal */
export const keyMovedAt = (
  changed: EditorCommitChanged,
  nodeKey: NodeKey,
  root: NamedRootKey | undefined
) =>
  changed.hasNodeKey(nodeKey, 'path', root) ||
  changed.hasNodeKey(nodeKey, 'presence', root);

/**
 * Return an immutable commit snapshot for one document root.
 *
 * @internal
 */
export const getEditorCommitSnapshot = <V extends Value>(
  commit: EditorCommit<V>,
  root: RootKey = 'main',
  phase: 'after' | 'before' = 'after'
): EditorSnapshot<V> => {
  if (root === 'main') return commit[phase];

  const source = EDITOR_COMMIT_SNAPSHOT_SOURCES.get(commit);

  if (!source) {
    throw new Error('Editor commit snapshot source is unavailable.');
  }
  let snapshots = EDITOR_COMMIT_ROOT_SNAPSHOTS.get(commit);

  if (!snapshots) {
    snapshots = { after: new Map(), before: new Map() };
    EDITOR_COMMIT_ROOT_SNAPSHOTS.set(commit, snapshots);
  }
  const cache = snapshots[phase];
  const cached = cache.get(root);

  if (cached) return cached as EditorSnapshot<V>;
  const value = phase === 'before' ? source.beforeValue : source.value;
  let children: V | undefined;
  const childrenOfRoot = () => (children ??= valueRoot(value, root) as V);
  const selectionRoot =
    phase === 'before' ? commit.selectionBeforeRoot : commit.selectionAfterRoot;
  let index: SnapshotIndex | undefined;
  const snapshot = {
    selection:
      toInternalRoot(selectionRoot) === root
        ? phase === 'before'
          ? commit.selectionBefore
          : commit.selectionAfter
        : null,
    version: phase === 'before' ? commit.previousVersion : commit.version,
  };

  const lazy = lazyRootOf(value.roots, root);

  if (lazy) {
    setLazyRoot(snapshot, 'children', lazy);
  } else {
    Object.defineProperty(snapshot, 'children', {
      enumerable: true,
      get: childrenOfRoot,
    });
  }
  Object.defineProperty(snapshot, 'index', {
    enumerable: true,
    get: () =>
      (index ??=
        (phase === 'before' ? source.beforeIndexAt : source.afterIndexAt)?.(
          root
        ) ??
        buildOwnedSnapshotIndex(
          childrenOfRoot() as readonly Descendant[],
          source.editor
        )),
  });
  const frozen = Object.freeze(snapshot) as EditorSnapshot<V>;

  cache.set(root, frozen);

  return frozen;
};

/**
 * Return a commit's whole document value, its named roots included.
 *
 * @internal
 */
export const getEditorCommitValue = (
  commit: EditorCommit,
  phase: 'after' | 'before' = 'after'
): EditorDocumentValue => {
  const source = EDITOR_COMMIT_SNAPSHOT_SOURCES.get(commit);

  if (!source) {
    throw new Error('Editor commit snapshot source is unavailable.');
  }

  return phase === 'before' ? source.beforeValue : source.value;
};

/** @internal */
export const getEditorCommitUnsettle = (
  commit: EditorCommit
): DocumentChange | null => EDITOR_COMMIT_UNSETTLES.get(commit)?.() ?? null;

/**
 * The undo of everything but the settlement, from the document the commit's
 * unsettle gives, on a commit that settled a decision's text.
 *
 * @internal
 */
export const getEditorCommitRest = (
  commit: EditorCommit
): DocumentChange | null => EDITOR_COMMIT_RESTS.get(commit) ?? null;

/**
 * The runs the commit's change carried into an earlier sibling across closing
 * tokens, each from its source in the commit's base to where it landed.
 *
 * @internal
 */
export const getEditorCommitCarriedRuns = (
  commit: EditorCommit
): readonly CarriedRun[] => EDITOR_COMMIT_CARRIED.get(commit) ?? [];

/** @internal */
export const getEditorCommitAdmission = (
  commit: EditorCommit
): EditorCommitAdmission | null => EDITOR_COMMIT_ADMISSIONS.get(commit) ?? null;

/** @internal */
export const getEditorCommitCompletedTextDeletion = (
  commit: EditorCommit
): CompletedTextDeletion | null =>
  EDITOR_COMMIT_COMPLETED_TEXT_DELETIONS.get(commit) ?? null;

/** @internal */
export const getEditorCommitStartedAt = (commit: EditorCommit): number =>
  EDITOR_COMMIT_STARTED_AT.get(commit) ??
  globalThis.performance?.now?.() ??
  Date.now();

/**
 * The top-level index of the node a changed range starts in, `side` 1, or
 * ends in, `side` -1.
 */
const topLevelIndexAt = (
  document: DocumentIndex,
  position: number,
  side: -1 | 1
) => {
  const [outer] = document.openContextAt(position);

  if (outer) return outer.path[0];

  const index = document.childBoundaryAt(position)?.index ?? 0;

  return side === 1 ? index : index - 1;
};

const valueRoot = (value: JsonEditorValue, root: RootKey) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const buildOwnedSnapshotIndex = (
  children: readonly Descendant[],
  editor: Editor
): SnapshotIndex => snapshotIndexOf(getEditorRuntimeOwner(editor), children);

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

    return index.keyAt(path);
  };

  return bindDocumentChangeNodeKeys(inverse, before, keyAt);
};

const getSelectionNodeKeys = (
  selection: Selection,
  root: RootKey,
  index: () => SnapshotIndex,
  selectionRoot: RootKey,
  children: () => NodeList<Descendant>
): NodeKey[] => {
  if (!selection || (SelectionApi.root(selection) ?? selectionRoot) !== root) {
    return [];
  }

  const paths = new Map<string, Path>();
  const addPath = (path: Path) => paths.set(pathKey(path), path);

  if (SelectionApi.isNode(selection)) {
    for (const path of selection.paths) {
      for (let depth = path.length; depth > 0; depth--) {
        addPath(path.slice(0, depth));
      }
    }
  } else if (RangeApi.isRange(selection)) {
    for (const point of [selection.anchor, selection.focus]) {
      for (let depth = point.path.length; depth > 0; depth--) {
        addPath(point.path.slice(0, depth));
      }
    }

    if (!RangeApi.isCollapsed(selection)) {
      const [start, end] = RangeApi.edges(selection);
      const [first = 0, ...startRest] = start.path;
      const [last = 0, ...endRest] = end.path;
      const spanned = children().slice(first, last + 1);

      for (const [, path] of NodeApi.nodes(
        { children: spanned, type: '' },
        {
          from: [0, ...startRest],
          to: [last - first, ...endRest],
        }
      )) {
        const [top = 0, ...rest] = path;

        if (path.length > 0) addPath([top + first, ...rest]);
      }
    }
  }

  return [
    ...new Set(
      [...paths.values()]
        .map((path) => index().keyAt(path))
        .filter((nodeKey): nodeKey is NodeKey => Boolean(nodeKey))
    ),
  ];
};

const getChangedTopLevelRange = (
  document: DocumentIndex,
  from: number,
  to: number
): TopLevelRuntimeRange | null => {
  if (document.size === 0) return null;

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
  let [start, end] = ordered[0];

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

const samePath = (left: Path | undefined, right: Path | undefined) =>
  left !== undefined && right !== undefined && PathApi.equals(left, right);

const getDescendantAtPath = (
  children: NodeList<Descendant>,
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants.at(index);

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
  afterIndexAt,
  after,
  beforeIndex,
  beforeIndexAt,
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
  const recordsChanged = getInternalDocumentChangeRecords(changes).size > 0;
  const beforeIndexes = new Map<RootKey, SnapshotIndex>();
  const afterIndexes = new Map<RootKey, SnapshotIndex>();
  const rootDetails = new Map<RootKey, RootChangeDetails>();
  const topLevelRangeCache = new Map<
    RootKey,
    readonly TopLevelRuntimeRange[]
  >();
  const selectionNodeKeys = new Map<RootKey, ReadonlySet<NodeKey>>();
  const nodeKeys = new Map<string, readonly NodeKey[]>();
  const touchedKeys = new Map<RootKey, TouchedKeys>();
  const pathMembership = new Map<RootKey, Map<NodeKey, boolean>>();
  const kindMembership = new Map<string, ReadonlySet<NodeKey>>();
  const aggregateNodeKeys = new Map<
    EditorCommitRuntimeChangeKind,
    readonly NodeKey[]
  >();

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
        : ((phase === 'before' ? beforeIndexAt : afterIndexAt)?.(root) ??
          buildOwnedSnapshotIndex(
            valueRoot(value, root) as readonly Descendant[],
            editor
          ));

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

    const beforeDocument = valueRootIndex(before, root);
    const afterDocument = valueRootIndex(after, root);
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
        const survivor = afterDocument.child(start);

        if (beforeRange && survivor) {
          let [removedStart, removedEnd] = beforeRange;

          if (
            removedStart < removedEnd &&
            beforeDocument.child(removedStart) === survivor
          ) {
            removedStart += 1;
          }
          if (
            removedStart < removedEnd &&
            beforeDocument.child(removedEnd) === survivor
          ) {
            removedEnd -= 1;
          }

          end = Math.min(
            afterDocument.size - 1,
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
            beforeDocument.child(beforeRange[0]),
            beforeDocument.child(beforeRange[1]),
          ]);
          const isStableContext = (index: number) =>
            index !== movedTargetIndex &&
            beforeBoundaryNodes.has(afterDocument.child(index));

          if (start < end && isStableContext(start)) start += 1;
          if (start < end && isStableContext(end)) end -= 1;
        }
      }

      ranges.push(Object.freeze([start, end]));
    });

    const result = mergeTopLevelRanges(ranges);

    topLevelRangeCache.set(root, result);

    return result;
  };

  const childrenUnchanged = (root: RootKey) =>
    !hasInRoot('document', root) &&
    (!replace ||
      (root === 'main'
        ? before.children === after.children
        : before.roots?.[root] === after.roots?.[root]));

  const getRootDetails = (root: RootKey): RootChangeDetails => {
    const cached = rootDetails.get(root);

    if (cached) return cached;

    if (childrenUnchanged(root)) {
      const emptyKeys = new Set<NodeKey>();
      const details: RootChangeDetails = Object.freeze({
        changedNodeKeys: emptyKeys,
        paths: Object.freeze([]),
        pathNodeKeys: emptyKeys,
        propertiesChanged: false,
        structureChanged: false,
        textChanged: false,
        textNodeKeys: emptyKeys,
        touchedNodeKeys: emptyKeys,
        topLevelOrderChanged: false,
      });
      rootDetails.set(root, details);
      return details;
    }

    const innerBeforeIndex = getIndex('before', root);
    const innerAfterIndex = getIndex('after', root);
    const classification = getInternalDocumentChangeClassification(
      changes,
      root
    );

    if (classification && !classification.structure) {
      const afterRoot = valueRootNodes(after, root) as NodeList<Descendant>;
      const touchedChangedNodeKeys = new Set<NodeKey>();
      const changedNodeKeys = new Set<NodeKey>();
      const pathNodeKeys = new Set<NodeKey>();
      const textNodeKeys = new Set<NodeKey>();
      let nodeKeyChanged = false;
      let topLevelIdentityChanged = false;

      for (const changedPath of classification.paths) {
        for (let depth = 1; depth <= changedPath.length; depth++) {
          const path = changedPath.slice(0, depth) as Path;
          const beforeNodeKey = innerBeforeIndex.keyAt(path);
          const afterNodeKey = innerAfterIndex.keyAt(path);

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
          const path = changedPath;
          const nodeKey = innerAfterIndex.keyAt(path);

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
          classification.paths.map((path) => Object.freeze([...path]))
        ),
        pathNodeKeys,
        propertiesChanged: classification.properties,
        structureChanged: nodeKeyChanged,
        textChanged: classification.text,
        textNodeKeys,
        touchedNodeKeys: touchedChangedNodeKeys,
        topLevelOrderChanged: topLevelIdentityChanged,
      });

      rootDetails.set(root, details);

      return details;
    }

    // The indexed roots, so a change reads only the top-level nodes it spans.
    const beforeDocument = valueRootIndex(before, root);
    const afterDocument = valueRootIndex(after, root);
    const beforeRoot = beforeDocument.nodes as NodeList<Descendant>;
    const afterRoot = afterDocument.nodes as NodeList<Descendant>;
    const change = getInternalDocumentRootChange(changes, root);
    const changedTopLevel = () => {
      if (!change) return { from: 0, to: afterRoot.length - 1 };
      let from = afterRoot.length;
      let to = -1;

      change.iterChangedRanges((_fromBefore, _toBefore, fromAfter, toAfter) => {
        from = Math.min(from, topLevelIndexAt(afterDocument, fromAfter, 1));
        to = Math.max(to, topLevelIndexAt(afterDocument, toAfter, -1));
      });
      // A change of the top-level count moves every node after it.
      if (beforeRoot.length !== afterRoot.length) to = afterRoot.length - 1;

      return {
        from: Math.max(0, from),
        to: Math.min(to, afterRoot.length - 1),
      };
    };
    const touched = getTouched(root);
    const touchedChangedNodeKeys = new Set<NodeKey>([
      ...touched.before.keys(),
      ...touched.after.keys(),
    ]);
    const presenceNodeKeys = getPresenceNodeKeys(root);
    let pathNodeKeys: Set<NodeKey> | undefined;
    let topLevelOrderChanged: boolean | undefined;
    const getPathNodeKeys = () => {
      if (pathNodeKeys) return pathNodeKeys;

      const keys = new Set<NodeKey>();
      const collectChangedPaths = (
        beforeNode: Descendant | undefined,
        afterNode: Descendant,
        path: Path
      ) => {
        if (beforeNode === afterNode) return;
        const nodeKey = innerAfterIndex.keyAt(path);
        const beforePath =
          nodeKey && !presenceNodeKeys.has(nodeKey)
            ? (innerBeforeIndex.pathOf(nodeKey) ?? undefined)
            : undefined;
        if (nodeKey && !samePath(beforePath, path)) keys.add(nodeKey);
        if (NodeApi.isElement(afterNode)) {
          const beforeChildren = NodeApi.isElement(beforeNode)
            ? beforeNode.children
            : [];
          afterNode.children.forEach((child, index) => {
            if (beforeChildren[index] !== child) {
              collectChangedPaths(beforeChildren[index], child, [
                ...path,
                index,
              ]);
            }
          });
        }
      };
      const collectShifted = (node: Descendant, path: Path) => {
        const nodeKey = innerAfterIndex.keyAt(path);

        if (nodeKey) keys.add(nodeKey);
        if (NodeApi.isElement(node)) {
          node.children.forEach((child, index) =>
            collectShifted(child, [...path, index])
          );
        }
      };
      const { from, to } = changedTopLevel();
      const shift = afterRoot.length - beforeRoot.length;

      for (let index = from; index <= to; index++) {
        const node = afterRoot.at(index) as Descendant;
        const beforeNode = beforeRoot.at(index);

        if (beforeNode === node) continue;
        if (
          shift !== 0 &&
          beforeRoot.at(index - shift) === node &&
          innerBeforeIndex.keyAt([index - shift]) ===
            innerAfterIndex.keyAt([index])
        ) {
          collectShifted(node, [index]);
        } else {
          collectChangedPaths(beforeNode, node, [index]);
        }
      }
      pathNodeKeys = keys;

      return keys;
    };

    const changedNodeKeys = new Set(
      [...touchedChangedNodeKeys].filter(
        (nodeKey) => innerAfterIndex.pathOf(nodeKey) !== null
      )
    );

    const textNodeKeys = new Set<NodeKey>();
    let propertiesChanged = false;
    let textChanged = false;

    for (const nodeKey of changedNodeKeys) {
      const beforePath = presenceNodeKeys.has(nodeKey)
        ? null
        : innerBeforeIndex.pathOf(nodeKey);
      const afterPath = innerAfterIndex.pathOf(nodeKey);
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
          (path) => Object.freeze([...path])
        )
      ),
      get pathNodeKeys() {
        return getPathNodeKeys();
      },
      propertiesChanged,
      get structureChanged() {
        return (
          changes.createRoots.has(root) ||
          changes.deleteRoots.has(root) ||
          presenceNodeKeys.size > 0 ||
          getPathNodeKeys().size > 0
        );
      },
      textChanged,
      textNodeKeys,
      touchedNodeKeys: touchedChangedNodeKeys,
      get topLevelOrderChanged() {
        if (topLevelOrderChanged !== undefined) return topLevelOrderChanged;
        if (beforeRoot.length !== afterRoot.length) {
          return (topLevelOrderChanged = true);
        }

        const { from, to } = changedTopLevel();

        topLevelOrderChanged = false;
        for (let index = from; index <= to; index++) {
          if (
            beforeRoot.at(index) !== afterRoot.at(index) &&
            innerBeforeIndex.keyAt([index]) !== innerAfterIndex.keyAt([index])
          ) {
            topLevelOrderChanged = true;
            break;
          }
        }

        return topLevelOrderChanged;
      },
    });

    rootDetails.set(root, details);

    return details;
  };

  const getSelectionIds = (root: RootKey) => {
    const cached = selectionNodeKeys.get(root);

    if (cached) return cached;

    const innerNodeKeys = new Set<NodeKey>([
      ...getSelectionNodeKeys(
        selectionBefore,
        root,
        () => getIndex('before', root),
        selectionBeforeRoot,
        () => valueRootNodes(before, root) as NodeList<Descendant>
      ),
      ...getSelectionNodeKeys(
        selectionAfter,
        root,
        () => getIndex('after', root),
        selectionAfterRoot,
        () => valueRootNodes(after, root) as NodeList<Descendant>
      ),
    ]);

    selectionNodeKeys.set(root, innerNodeKeys);

    return innerNodeKeys;
  };

  const hasInRoot = (kind: EditorCommitChangeKind, root: RootKey): boolean => {
    const classification = getInternalDocumentChangeClassification(
      changes,
      root
    );

    switch (kind) {
      case 'document': {
        return (
          !!getInternalDocumentRootChange(changes, root) ||
          changes.createRoots.has(root) ||
          changes.deleteRoots.has(root)
        );
      }
      case 'marks': {
        return (
          marksChanged &&
          ((selectionBefore !== null && selectionBeforeRoot === root) ||
            (selectionAfter !== null && selectionAfterRoot === root))
        );
      }
      case 'properties': {
        return (
          hasInRoot('document', root) &&
          (classification
            ? classification.properties
            : getRootDetails(root).propertiesChanged)
        );
      }
      case 'replace': {
        return replace && hasInRoot('document', root);
      }
      case 'root-order': {
        return getRootDetails(root).topLevelOrderChanged;
      }
      case 'selection': {
        return (
          selectionChanged &&
          ((selectionBefore !== null && selectionBeforeRoot === root) ||
            (selectionAfter !== null && selectionAfterRoot === root))
        );
      }
      case 'snapshot': {
        return (
          hasInRoot('document', root) ||
          hasInRoot('selection', root) ||
          hasInRoot('marks', root) ||
          stateChanged
        );
      }
      case 'state': {
        return stateChanged;
      }
      case 'structure': {
        return classification
          ? classification.structure || getRootDetails(root).structureChanged
          : getRootDetails(root).structureChanged;
      }
      case 'text': {
        return classification?.text ?? getRootDetails(root).textChanged;
      }
    }

    return failInvariant('Unexpected commit change kind');
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
      case 'presence': {
        const { after: afterKeys, before: beforeKeys } = getPresenceSides(root);

        result = Object.freeze([
          ...[...beforeKeys].filter((key) => !afterKeys.has(key)),
          ...[...afterKeys].filter((key) => !beforeKeys.has(key)),
        ]);
        break;
      }
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
      case 'node': {
        result = Object.freeze([...getRootDetails(root).changedNodeKeys]);
        break;
      }
      case 'path': {
        result = Object.freeze([...getRootDetails(root).pathNodeKeys]);
        break;
      }
      case 'selection': {
        result = Object.freeze([...getSelectionIds(root)]);
        break;
      }
      case 'text': {
        result = Object.freeze([...getRootDetails(root).textNodeKeys]);
        break;
      }
    }

    nodeKeys.set(cacheKey, result);

    return result;
  };

  const getTouched = (root: RootKey): TouchedKeys => {
    const cached = touchedKeys.get(root);

    if (cached) return cached;
    const beforeKeys = new Map<NodeKey, Path>();
    const afterKeys = new Map<NodeKey, Path>();
    const change = getInternalDocumentRootChange(changes, root);

    if (change) {
      const beforeRootIndex = getIndex('before', root);
      const afterRootIndex = getIndex('after', root);
      const beforeDocument = valueRootIndex(before, root);
      const afterDocument = valueRootIndex(after, root);

      change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
        for (const { path } of beforeDocument.nodeRangesTouching(
          fromBefore,
          toBefore
        )) {
          const key = beforeRootIndex.keyAt(path);
          if (key) beforeKeys.set(key, [...path]);
        }
        for (const { path } of afterDocument.nodeRangesTouching(
          fromAfter,
          toAfter
        )) {
          const key = afterRootIndex.keyAt(path);
          if (key) afterKeys.set(key, [...path]);
        }
      });
    } else if (changes.createRoots.has(root) || changes.deleteRoots.has(root)) {
      for (const [phase, keys] of [
        ['before', beforeKeys],
        ['after', afterKeys],
      ] as const) {
        if (
          Object.hasOwn((phase === 'before' ? before : after).roots ?? {}, root)
        ) {
          for (const [key, path] of getIndex(phase, root).entries()) {
            keys.set(key, [...path]);
          }
        }
      }
    }
    const result: TouchedKeys = Object.freeze({
      after: afterKeys,
      before: beforeKeys,
      rootCreatedOrDeleted:
        changes.createRoots.has(root) || changes.deleteRoots.has(root),
    });

    touchedKeys.set(root, result);

    return result;
  };

  const getPresenceSides = (root: RootKey) => {
    if (!replace || childrenUnchanged(root)) {
      const touched = getTouched(root);

      return {
        after: new Set(touched.after.keys()),
        before: new Set(touched.before.keys()),
      };
    }

    return {
      after: new Set(
        getIndex('after', root)
          .entries()
          .map(([key]) => key)
      ),
      before: new Set(
        getIndex('before', root)
          .entries()
          .map(([key]) => key)
      ),
    };
  };

  const getPresenceNodeKeys = (root: RootKey) =>
    getMembership('presence', root);

  const getMembership = (
    kind: Exclude<EditorCommitRuntimeChangeKind, 'path'>,
    root: RootKey
  ) => {
    const cacheKey = `${root}\u0000${kind}`;
    let keys = kindMembership.get(cacheKey);

    if (!keys) {
      keys = new Set(getNodeKeys(kind, root));
      kindMembership.set(cacheKey, keys);
    }

    return keys;
  };

  const readPathChanged = (root: RootKey, nodeKey: NodeKey) => {
    if (childrenUnchanged(root)) return false;
    if (replace) {
      const beforePath = getIndex('before', root).pathOf(nodeKey);

      if (getPresenceNodeKeys(root).has(nodeKey)) return beforePath === null;

      return (
        beforePath !== null &&
        getIndex('after', root).keyAt(beforePath) !== nodeKey
      );
    }
    const {
      after: afterKeys,
      before: beforeKeys,
      rootCreatedOrDeleted,
    } = getTouched(root);
    const afterPath = afterKeys.get(nodeKey);

    if (afterPath) {
      const beforePath = beforeKeys.get(nodeKey);

      return !beforePath || !samePath(beforePath, afterPath);
    }
    if (rootCreatedOrDeleted || beforeKeys.has(nodeKey)) return false;
    const beforePath = getIndex('before', root).pathOf(nodeKey);

    return (
      beforePath !== null &&
      getIndex('after', root).keyAt(beforePath) !== nodeKey
    );
  };

  const pathChangedIn = (root: RootKey, nodeKey: NodeKey) => {
    let answers = pathMembership.get(root);

    if (!answers) {
      answers = new Map();
      pathMembership.set(root, answers);
    }
    const cached = answers.get(nodeKey);

    if (cached !== undefined) return cached;
    const changed = readPathChanged(root, nodeKey);

    answers.set(nodeKey, changed);

    return changed;
  };

  const allKnownRoots = () => {
    const result = new Set<RootKey>(roots);

    if (selectionBefore) {
      result.add(SelectionApi.root(selectionBefore) ?? selectionBeforeRoot);
    }
    if (selectionAfter) {
      result.add(SelectionApi.root(selectionAfter) ?? selectionAfterRoot);
    }
    if (result.size === 0) result.add('main');

    return result;
  };
  const knownRoots = [...allKnownRoots()];

  const getAggregateNodeKeys = (kind: EditorCommitRuntimeChangeKind) => {
    const cached = aggregateNodeKeys.get(kind);

    if (cached) return cached;
    const membership = new Set<NodeKey>();

    for (const root of knownRoots) {
      for (const nodeKey of getNodeKeys(kind, root)) membership.add(nodeKey);
    }
    const result = Object.freeze([...membership]);

    aggregateNodeKeys.set(kind, result);
    return result;
  };

  return Object.freeze({
    has: (kind, root) => hasInRoot(kind, toInternalRoot(root)),
    hasAny: (kind) =>
      (recordsChanged && (kind === 'document' || kind === 'snapshot')) ||
      knownRoots.some((root) => hasInRoot(kind, root)),
    hasNodeKey: (nodeKey, kind, root) => {
      const innerRoot = toInternalRoot(root);

      return kind === 'path'
        ? pathChangedIn(innerRoot, nodeKey)
        : getMembership(kind, innerRoot).has(nodeKey);
    },
    paths: (root) => getRootDetails(toInternalRoot(root)).paths,
    nodeKeys: (kind, root) => getNodeKeys(kind, toInternalRoot(root)),
    nodeKeysAll: (kind) => getAggregateNodeKeys(kind),
    topLevelRanges: (root) => getChangedTopLevelRanges(toInternalRoot(root)),
  });
};

export const createEditorCommit = <V extends Value>(
  input: CommitInput<V>,
  versions: {
    previousVersion: number;
    startedAt?: number;
    version: number;
  }
): EditorCommit<V> => {
  const {
    admission,
    afterIndexAt,
    afterValue,
    beforeIndexAt,
    beforeValue,
    carried,
    completedTextDeletion,
    editor,
    replace = false,
    settlement,
    split,
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
      afterIndexAt,
      after: afterValue,
      beforeIndex: () => body.before.index,
      beforeIndexAt,
      before: beforeValue,
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
    afterIndexAt,
    beforeIndexAt,
    beforeValue,
    editor,
    value: afterValue,
  });
  EDITOR_COMMIT_STARTED_AT.set(
    commit,
    versions.startedAt ?? globalThis.performance?.now?.() ?? Date.now()
  );
  if (completedTextDeletion) {
    EDITOR_COMMIT_COMPLETED_TEXT_DELETIONS.set(commit, completedTextDeletion);
  }
  if (admission) EDITOR_COMMIT_ADMISSIONS.set(commit, admission);
  if (carried?.length) EDITOR_COMMIT_CARRIED.set(commit, carried);
  if (split) {
    EDITOR_COMMIT_UNSETTLES.set(commit, () => split.takeBack);
    EDITOR_COMMIT_RESTS.set(commit, split.rest);
  } else if (settlement) {
    let unsettle: DocumentChange | undefined;

    EDITOR_COMMIT_UNSETTLES.set(
      commit,
      () => (unsettle ??= settlement.change.invert(settlement.admitted))
    );
  }

  return Object.freeze(commit);
};
