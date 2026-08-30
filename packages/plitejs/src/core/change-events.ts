import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorNodeChangeKind,
  EditorTextChangeContext,
  RootKey,
  NodeKey,
  SnapshotIndex,
  ValueOf,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import { getInternalDocumentChangeEntries } from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { RootChange } from './change/root-change';
import { getEditorRuntimeOwner } from './editor-runtime';
import { getExtensionRegistry } from './extension-registry';
import { toPublicRoot } from './public-root';
import { buildSnapshotIndex } from './snapshot-index';

const rootChildren = (
  value: EditorDocumentValue,
  root: RootKey
): readonly Descendant[] =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const nodeAt = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return null;
    descendants =
      'children' in node && Array.isArray(node.children) ? node.children : [];
  }

  return node ?? null;
};

const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
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
        jsonEqual(leftRecord[key], rightRecord[key])
    )
  );
};

const nodeProperties = (node: Descendant | null) =>
  node
    ? Object.fromEntries(
        Object.entries(node).filter(
          ([key]) => key !== 'children' && key !== 'text'
        )
      )
    : null;

/** @internal */
export const hasChangedRuntimeAncestor = (
  nodeKeys: ReadonlySet<NodeKey>,
  index: SnapshotIndex,
  path: Path
) => {
  for (let depth = 1; depth < path.length; depth++) {
    const nodeKey = index.keyAt(path.slice(0, depth));

    if (nodeKey !== null && nodeKeys.has(nodeKey)) return true;
  }

  return false;
};

const comparePaths = (left: Path, right: Path) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

type SparseNodeCandidate = {
  afterPath?: Path;
  beforePath?: Path;
};

const getChangedRangePaths = (
  change: RootChange,
  document: DocumentIndex,
  phase: 'after' | 'before'
) => {
  const paths = new Map<string, Path>();

  change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
    const from = phase === 'before' ? fromBefore : fromAfter;
    const to = phase === 'before' ? toBefore : toAfter;

    if (from === to) return;

    for (const entry of document.nodeRangesTouching(from, to)) {
      if (entry.from >= to || entry.to <= from) continue;

      const path = [...entry.path] as Path;

      paths.set(path.join('.'), path);
    }
  });

  return paths.values();
};

const getSparseNodeCandidates = (
  change: RootChange,
  beforeDocument: DocumentIndex,
  afterDocument: DocumentIndex,
  beforeIndex: SnapshotIndex,
  afterIndex: SnapshotIndex
) => {
  const candidates = new Map<NodeKey, SparseNodeCandidate>();
  const add = (nodeKey: NodeKey, phase: 'after' | 'before', path: Path) => {
    const candidate = candidates.get(nodeKey) ?? {};

    candidate[phase === 'before' ? 'beforePath' : 'afterPath'] = path;
    candidates.set(nodeKey, candidate);
  };
  const addAt = (phase: 'after' | 'before', path: Path) => {
    const index = phase === 'before' ? beforeIndex : afterIndex;
    const otherIndex = phase === 'before' ? afterIndex : beforeIndex;
    const nodeKey = index.keyAt(path);

    if (!nodeKey) return;

    add(nodeKey, phase, path);
    if (otherIndex.keyAt(path) === nodeKey) {
      add(nodeKey, phase === 'before' ? 'after' : 'before', path);
    }
  };

  for (const path of getChangedRangePaths(change, beforeDocument, 'before')) {
    addAt('before', path);
  }
  for (const path of getChangedRangePaths(change, afterDocument, 'after')) {
    addAt('after', path);
  }

  const relocated = new Set<NodeKey>();
  const relocation = change.movedNode(beforeDocument);

  if (relocation) {
    const beforePath = [...relocation.path] as Path;
    const afterPath = [...relocation.targetPath] as Path;
    const nodeKey = beforeIndex.keyAt(beforePath);

    if (nodeKey && afterIndex.keyAt(afterPath) === nodeKey) {
      add(nodeKey, 'before', beforePath);
      add(nodeKey, 'after', afterPath);
      relocated.add(nodeKey);
    }
  }

  return { candidates, relocated };
};

const getParentNodeKey = (index: SnapshotIndex, path: Path) =>
  path.length === 1 ? null : index.keyAt(path.slice(0, -1));

const getStableNodeKeys = (
  before: readonly NodeKey[],
  after: readonly NodeKey[]
) => {
  const afterPositions = new Map(
    after.map((nodeKey, index) => [nodeKey, index] as const)
  );
  const common = before.filter((nodeKey) => afterPositions.has(nodeKey));
  const predecessors = Array.from({ length: common.length }, () => -1);
  const tails: number[] = [];

  for (let index = 0; index < common.length; index++) {
    const position = getDefined(afterPositions.get(common[index]));
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >> 1;
      const tailPosition = getDefined(
        afterPositions.get(common[tails[middle]])
      );

      if (tailPosition < position) low = middle + 1;
      else high = middle;
    }

    if (low > 0) predecessors[index] = getDefined(tails[low - 1]);
    tails[low] = index;
  }

  const stable = new Set<NodeKey>();
  let cursor = tails.at(-1) ?? -1;

  while (cursor >= 0) {
    stable.add(common[cursor]);
    cursor = getDefined(predecessors[cursor]);
  }

  return stable;
};

const getMovedNodeKeys = (
  beforeIndex: SnapshotIndex,
  afterIndex: SnapshotIndex,
  beforeEntries: ReadonlyArray<readonly [NodeKey, Path]>,
  afterEntries: ReadonlyArray<readonly [NodeKey, Path]>,
  exactMovedNodeKeys: ReadonlySet<NodeKey>
) => {
  const orderEntries = (entries: ReadonlyArray<readonly [NodeKey, Path]>) => {
    for (let index = 1; index < entries.length; index++) {
      if (comparePaths(entries[index - 1][1], entries[index][1]) > 0) {
        return [...entries].sort(([, left], [, right]) =>
          comparePaths(left, right)
        );
      }
    }

    return entries;
  };
  const orderedBeforeEntries = orderEntries(beforeEntries);
  const orderedAfterEntries = orderEntries(afterEntries);
  const beforeParents = new Map<NodeKey, NodeKey | null>();
  const afterParents = new Map<NodeKey, NodeKey | null>();
  const beforeChildren = new Map<NodeKey | null, NodeKey[]>();
  const afterChildren = new Map<NodeKey | null, NodeKey[]>();

  const collect = (
    entries: ReadonlyArray<readonly [NodeKey, Path]>,
    index: SnapshotIndex,
    parents: Map<NodeKey, NodeKey | null>,
    children: Map<NodeKey | null, NodeKey[]>
  ) => {
    for (const [nodeKey, path] of entries) {
      const parent = getParentNodeKey(index, path);
      const siblings = children.get(parent);

      parents.set(nodeKey, parent);
      if (siblings) siblings.push(nodeKey);
      else children.set(parent, [nodeKey]);
    }
  };

  collect(orderedBeforeEntries, beforeIndex, beforeParents, beforeChildren);
  collect(orderedAfterEntries, afterIndex, afterParents, afterChildren);

  const moved = new Set(exactMovedNodeKeys);
  const sameParentNodeKeys = new Set<NodeKey>();

  for (const [nodeKey, beforeParent] of beforeParents) {
    if (!afterParents.has(nodeKey)) continue;

    if (afterParents.get(nodeKey) !== beforeParent) moved.add(nodeKey);
    else sameParentNodeKeys.add(nodeKey);
  }

  for (const [parent, beforeNodeKeys] of beforeChildren) {
    const candidatesBefore = beforeNodeKeys.filter(
      (nodeKey) =>
        sameParentNodeKeys.has(nodeKey) && !exactMovedNodeKeys.has(nodeKey)
    );
    const candidatesAfter = (afterChildren.get(parent) ?? []).filter(
      (nodeKey) =>
        sameParentNodeKeys.has(nodeKey) && !exactMovedNodeKeys.has(nodeKey)
    );
    const stable = getStableNodeKeys(candidatesBefore, candidatesAfter);

    for (const nodeKey of candidatesBefore) {
      if (!stable.has(nodeKey)) moved.add(nodeKey);
    }
  }

  return moved;
};

const getNodeChangeKind = (
  beforePath: Path | undefined,
  afterPath: Path | undefined,
  beforeNode: Descendant | null,
  afterNode: Descendant | null,
  moved: boolean
): EditorNodeChangeKind | null => {
  if (!beforePath) return 'insert';
  if (!afterPath) return 'remove';
  if (moved) return 'move';

  return jsonEqual(nodeProperties(beforeNode), nodeProperties(afterNode))
    ? null
    : 'update';
};

export const forEachEditorNodeChange = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  beforeValue: EditorDocumentValue<ValueOf<TEditor>>,
  afterValue: EditorDocumentValue<ValueOf<TEditor>>,
  listener: (context: EditorNodeChangeContext<TEditor>) => void
) => {
  const owner = getEditorRuntimeOwner(editor);

  for (const [root, change] of getInternalDocumentChangeEntries(
    commit.changes
  )) {
    const beforeChildren = rootChildren(beforeValue, root);
    const afterChildren = rootChildren(afterValue, root);
    const publicRoot = toPublicRoot(root);
    const beforeIndex =
      root === 'main'
        ? commit.before.index
        : buildSnapshotIndex(owner, beforeChildren);
    const afterIndex =
      root === 'main'
        ? commit.after.index
        : buildSnapshotIndex(owner, afterChildren);
    const beforeDocument = DocumentIndex.fromValue(beforeChildren);
    const afterDocument = DocumentIndex.fromValue(afterChildren);
    const { candidates, relocated } = getSparseNodeCandidates(
      change,
      beforeDocument,
      afterDocument,
      beforeIndex,
      afterIndex
    );
    const beforeEntries: Array<readonly [NodeKey, Path]> = [];
    const afterEntries: Array<readonly [NodeKey, Path]> = [];

    for (const [nodeKey, { afterPath, beforePath }] of candidates) {
      if (beforePath) beforeEntries.push([nodeKey, beforePath]);
      if (afterPath) afterEntries.push([nodeKey, afterPath]);
    }
    const inserted = new Set(
      [...candidates]
        .filter(([, candidate]) => !candidate.beforePath)
        .map(([nodeKey]) => nodeKey)
    );
    const removed = new Set(
      [...candidates]
        .filter(([, candidate]) => !candidate.afterPath)
        .map(([nodeKey]) => nodeKey)
    );
    const moved = getMovedNodeKeys(
      beforeIndex,
      afterIndex,
      beforeEntries,
      afterEntries,
      relocated
    );

    for (const [nodeKey, { afterPath, beforePath }] of candidates) {
      if (
        (!beforePath &&
          afterPath &&
          hasChangedRuntimeAncestor(inserted, afterIndex, afterPath)) ||
        (!afterPath &&
          beforePath &&
          hasChangedRuntimeAncestor(removed, beforeIndex, beforePath)) ||
        (moved.has(nodeKey) &&
          ((beforePath &&
            hasChangedRuntimeAncestor(moved, beforeIndex, beforePath)) ||
            (afterPath &&
              hasChangedRuntimeAncestor(moved, afterIndex, afterPath))))
      ) {
        continue;
      }

      const beforeNode = beforePath ? nodeAt(beforeChildren, beforePath) : null;
      const afterNode = afterPath ? nodeAt(afterChildren, afterPath) : null;
      const kind = getNodeChangeKind(
        beforePath,
        afterPath,
        beforeNode,
        afterNode,
        moved.has(nodeKey)
      );

      if (!kind) continue;

      listener({
        commit,
        editor,
        kind,
        node: afterNode,
        path: [...(afterPath ?? getDefined(beforePath))] as Path,
        previousPath: beforePath ? ([...beforePath] as Path) : null,
        previousNode: beforeNode,
        root: publicRoot,
      } as EditorNodeChangeContext<TEditor>);
    }
  }
};

export const forEachEditorTextChange = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  beforeValue: EditorDocumentValue<ValueOf<TEditor>>,
  afterValue: EditorDocumentValue<ValueOf<TEditor>>,
  listener: (context: EditorTextChangeContext<TEditor>) => void
) => {
  const owner = getEditorRuntimeOwner(editor);

  for (const [root, change] of getInternalDocumentChangeEntries(
    commit.changes
  )) {
    const beforeChildren = rootChildren(beforeValue, root);
    const afterChildren = rootChildren(afterValue, root);
    const publicRoot = toPublicRoot(root);
    const beforeIndex =
      root === 'main'
        ? commit.before.index
        : buildSnapshotIndex(owner, beforeChildren);
    const afterIndex =
      root === 'main'
        ? commit.after.index
        : buildSnapshotIndex(owner, afterChildren);
    const { candidates } = getSparseNodeCandidates(
      change,
      DocumentIndex.fromValue(beforeChildren),
      DocumentIndex.fromValue(afterChildren),
      beforeIndex,
      afterIndex
    );

    for (const { afterPath, beforePath } of candidates.values()) {
      if (!beforePath || !afterPath) continue;

      const beforeNode = nodeAt(beforeChildren, beforePath);
      const afterNode = nodeAt(afterChildren, afterPath);

      if (
        !beforeNode ||
        !afterNode ||
        !('text' in beforeNode) ||
        !('text' in afterNode) ||
        beforeNode.text === afterNode.text
      ) {
        continue;
      }

      listener({
        commit,
        editor,
        node:
          nodeAt(afterChildren, afterPath.slice(0, -1)) ??
          nodeAt(beforeChildren, beforePath.slice(0, -1)),
        path: [...afterPath],
        previousPath: [...beforePath],
        previousText: beforeNode.text,
        root: publicRoot,
        text: afterNode.text,
      } as EditorTextChangeContext<TEditor>);
    }
  }
};

export const notifyEditorChangeListeners = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  beforeValue: EditorDocumentValue<ValueOf<TEditor>>,
  afterValue: EditorDocumentValue<ValueOf<TEditor>>
) => {
  const registry = getExtensionRegistry(editor);

  if (registry.nodeChangeListeners.size > 0) {
    forEachEditorNodeChange(
      editor,
      commit,
      beforeValue,
      afterValue,
      (context) => {
        for (const listener of registry.nodeChangeListeners) listener(context);
      }
    );
  }

  if (registry.textChangeListeners.size > 0) {
    forEachEditorTextChange(
      editor,
      commit,
      beforeValue,
      afterValue,
      (context) => {
        for (const listener of registry.textChangeListeners) listener(context);
      }
    );
  }
};
