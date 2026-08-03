import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorNodeChangeKind,
  EditorTextChangeContext,
  RootKey,
  RuntimeId,
  SnapshotIndex,
  ValueOf,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { getEditorRuntimeOwner } from './editor-runtime';
import { getExtensionRegistry } from './extension-registry';
import { buildSnapshotIndex } from './snapshot-index';
import type { RootChange } from './change/root-change';
import { getInternalDocumentChangeEntries } from './change/document-change';
import { DocumentIndex } from './change/document-index';
import { toPublicRoot } from './public-root';

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
  runtimeIds: ReadonlySet<RuntimeId>,
  index: SnapshotIndex,
  path: Path
) => {
  for (let depth = 1; depth < path.length; depth++) {
    const runtimeId = index.idAt(path.slice(0, depth));

    if (runtimeId !== null && runtimeIds.has(runtimeId)) return true;
  }

  return false;
};

const comparePaths = (left: Path, right: Path) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index]! - right[index]!;

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
  const candidates = new Map<RuntimeId, SparseNodeCandidate>();
  const add = (runtimeId: RuntimeId, phase: 'after' | 'before', path: Path) => {
    const candidate = candidates.get(runtimeId) ?? {};

    candidate[phase === 'before' ? 'beforePath' : 'afterPath'] = path;
    candidates.set(runtimeId, candidate);
  };
  const addAt = (phase: 'after' | 'before', path: Path) => {
    const index = phase === 'before' ? beforeIndex : afterIndex;
    const otherIndex = phase === 'before' ? afterIndex : beforeIndex;
    const runtimeId = index.idAt(path);

    if (!runtimeId) return;

    add(runtimeId, phase, path);
    if (otherIndex.idAt(path) === runtimeId) {
      add(runtimeId, phase === 'before' ? 'after' : 'before', path);
    }
  };

  for (const path of getChangedRangePaths(change, beforeDocument, 'before')) {
    addAt('before', path);
  }
  for (const path of getChangedRangePaths(change, afterDocument, 'after')) {
    addAt('after', path);
  }

  const relocated = new Set<RuntimeId>();
  const relocation = change.movedNode(beforeDocument);

  if (relocation) {
    const beforePath = [...relocation.path] as Path;
    const afterPath = [...relocation.targetPath] as Path;
    const runtimeId = beforeIndex.idAt(beforePath);

    if (runtimeId && afterIndex.idAt(afterPath) === runtimeId) {
      add(runtimeId, 'before', beforePath);
      add(runtimeId, 'after', afterPath);
      relocated.add(runtimeId);
    }
  }

  return { candidates, relocated };
};

const getParentRuntimeId = (index: SnapshotIndex, path: Path) =>
  path.length === 1 ? null : index.idAt(path.slice(0, -1));

const getStableRuntimeIds = (
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

const getMovedRuntimeIds = (
  beforeIndex: SnapshotIndex,
  afterIndex: SnapshotIndex,
  beforeEntries: readonly (readonly [RuntimeId, Path])[],
  afterEntries: readonly (readonly [RuntimeId, Path])[],
  exactMovedRuntimeIds: ReadonlySet<RuntimeId>
) => {
  const orderEntries = (entries: readonly (readonly [RuntimeId, Path])[]) => {
    for (let index = 1; index < entries.length; index++) {
      if (comparePaths(entries[index - 1]![1], entries[index]![1]) > 0) {
        return [...entries].sort(([, left], [, right]) =>
          comparePaths(left, right)
        );
      }
    }

    return entries;
  };
  const orderedBeforeEntries = orderEntries(beforeEntries);
  const orderedAfterEntries = orderEntries(afterEntries);
  const beforeParents = new Map<RuntimeId, RuntimeId | null>();
  const afterParents = new Map<RuntimeId, RuntimeId | null>();
  const beforeChildren = new Map<RuntimeId | null, RuntimeId[]>();
  const afterChildren = new Map<RuntimeId | null, RuntimeId[]>();

  const collect = (
    entries: readonly (readonly [RuntimeId, Path])[],
    index: SnapshotIndex,
    parents: Map<RuntimeId, RuntimeId | null>,
    children: Map<RuntimeId | null, RuntimeId[]>
  ) => {
    for (const [runtimeId, path] of entries) {
      const parent = getParentRuntimeId(index, path);
      const siblings = children.get(parent);

      parents.set(runtimeId, parent);
      if (siblings) siblings.push(runtimeId);
      else children.set(parent, [runtimeId]);
    }
  };

  collect(orderedBeforeEntries, beforeIndex, beforeParents, beforeChildren);
  collect(orderedAfterEntries, afterIndex, afterParents, afterChildren);

  const moved = new Set(exactMovedRuntimeIds);
  const sameParentRuntimeIds = new Set<RuntimeId>();

  for (const [runtimeId, beforeParent] of beforeParents) {
    if (!afterParents.has(runtimeId)) continue;

    if (afterParents.get(runtimeId) !== beforeParent) moved.add(runtimeId);
    else sameParentRuntimeIds.add(runtimeId);
  }

  for (const [parent, beforeRuntimeIds] of beforeChildren) {
    const candidatesBefore = beforeRuntimeIds.filter(
      (runtimeId) =>
        sameParentRuntimeIds.has(runtimeId) &&
        !exactMovedRuntimeIds.has(runtimeId)
    );
    const candidatesAfter = (afterChildren.get(parent) ?? []).filter(
      (runtimeId) =>
        sameParentRuntimeIds.has(runtimeId) &&
        !exactMovedRuntimeIds.has(runtimeId)
    );
    const stable = getStableRuntimeIds(candidatesBefore, candidatesAfter);

    for (const runtimeId of candidatesBefore) {
      if (!stable.has(runtimeId)) moved.add(runtimeId);
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
    const beforeEntries: Array<readonly [RuntimeId, Path]> = [];
    const afterEntries: Array<readonly [RuntimeId, Path]> = [];

    for (const [runtimeId, { afterPath, beforePath }] of candidates) {
      if (beforePath) beforeEntries.push([runtimeId, beforePath]);
      if (afterPath) afterEntries.push([runtimeId, afterPath]);
    }
    const inserted = new Set(
      [...candidates]
        .filter(([, candidate]) => !candidate.beforePath)
        .map(([runtimeId]) => runtimeId)
    );
    const removed = new Set(
      [...candidates]
        .filter(([, candidate]) => !candidate.afterPath)
        .map(([runtimeId]) => runtimeId)
    );
    const moved = getMovedRuntimeIds(
      beforeIndex,
      afterIndex,
      beforeEntries,
      afterEntries,
      relocated
    );

    for (const [runtimeId, { afterPath, beforePath }] of candidates) {
      if (
        (!beforePath &&
          afterPath &&
          hasChangedRuntimeAncestor(inserted, afterIndex, afterPath)) ||
        (!afterPath &&
          beforePath &&
          hasChangedRuntimeAncestor(removed, beforeIndex, beforePath)) ||
        (moved.has(runtimeId) &&
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
        moved.has(runtimeId)
      );

      if (!kind) continue;

      listener({
        commit,
        editor,
        kind,
        node: afterNode,
        path: [...(afterPath ?? beforePath!)] as Path,
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
