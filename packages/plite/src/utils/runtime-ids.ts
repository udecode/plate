import type { Descendant, RuntimeId, SnapshotIndex } from '../interfaces';
import type { Editor } from '../interfaces/editor';
import type { Path } from '../interfaces/path';

const NODE_OWNERS = new WeakMap<object, Editor>();
const NODE_RUNTIME_IDS = new WeakMap<object, WeakMap<Editor, RuntimeId>>();
const NEXT_RUNTIME_ID = new WeakMap<Editor, number>();

const pathKey = (path: Path) => path.join('.');

const allocateRuntimeId = (editor: Editor): RuntimeId => {
  const next = NEXT_RUNTIME_ID.get(editor) ?? 0;
  NEXT_RUNTIME_ID.set(editor, next + 1);
  return `n${next}` as RuntimeId;
};

const getRuntimeIds = (node: object) => {
  let runtimeIds = NODE_RUNTIME_IDS.get(node);

  if (!runtimeIds) {
    runtimeIds = new WeakMap();
    NODE_RUNTIME_IDS.set(node, runtimeIds);
  }

  return runtimeIds;
};

const advanceNextRuntimeId = (editor: Editor, runtimeId: RuntimeId) => {
  const numericPart = Number.parseInt(runtimeId.slice(1), 10);
  const next = NEXT_RUNTIME_ID.get(editor) ?? 0;

  if (Number.isFinite(numericPart) && numericPart >= next) {
    NEXT_RUNTIME_ID.set(editor, numericPart + 1);
  }
};

export const getOrCreateRuntimeId = (
  node: object,
  owner?: Editor
): RuntimeId => {
  const editor = owner ?? NODE_OWNERS.get(node);

  if (!editor) {
    throw new Error('Missing runtime-id owner for node');
  }

  const runtimeIds = getRuntimeIds(node);
  const existing = runtimeIds.get(editor);

  if (existing) {
    NODE_OWNERS.set(node, editor);
    return existing;
  }

  const runtimeId = allocateRuntimeId(editor);
  NODE_OWNERS.set(node, editor);
  runtimeIds.set(editor, runtimeId);
  return runtimeId;
};

export const setRuntimeId = (
  node: object,
  editor: Editor,
  runtimeId: RuntimeId
) => {
  NODE_OWNERS.set(node, editor);
  getRuntimeIds(node).set(editor, runtimeId);
  advanceNextRuntimeId(editor, runtimeId);
};

export const inheritRuntimeId = (
  nextNode: object,
  previousNode: object,
  owner?: Editor
) => {
  const editor = owner ?? NODE_OWNERS.get(previousNode);
  const runtimeId = editor
    ? NODE_RUNTIME_IDS.get(previousNode)?.get(editor)
    : null;

  if (!runtimeId || !editor) {
    return;
  }

  setRuntimeId(nextNode, editor, runtimeId);
};

export const seedRuntimeIds = (
  children: readonly Descendant[],
  editor: Editor
) => {
  for (const child of children) {
    getOrCreateRuntimeId(child, editor);

    if ('children' in child && Array.isArray(child.children)) {
      seedRuntimeIds(child.children, editor);
    }
  }
};

export const seedRuntimeIdsFromIndex = (
  children: readonly Descendant[],
  editor: Editor,
  existingIndex: SnapshotIndex,
  parentPath: Path = []
) => {
  children.forEach((child, index) => {
    const path = [...parentPath, index] as Path;
    const runtimeId = existingIndex.pathToId[pathKey(path)];

    if (runtimeId) {
      setRuntimeId(child, editor, runtimeId);
    } else {
      getOrCreateRuntimeId(child, editor);
    }

    if ('children' in child && Array.isArray(child.children)) {
      seedRuntimeIdsFromIndex(child.children, editor, existingIndex, path);
    }
  });
};
