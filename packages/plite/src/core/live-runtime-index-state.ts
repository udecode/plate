import type { Editor } from '../interfaces/editor';
import type { Operation } from '../interfaces/operation';
import type { LiveRuntimeIndex } from './snapshot-index';

const RUNTIME_INDEX_CACHE = new WeakMap<
  Editor,
  { index: LiveRuntimeIndex; version: number }
>();
const RUNTIME_INDEX_VERSION = new WeakMap<Editor, number>();

export const bumpRuntimeIndexVersion = (editor: Editor) => {
  RUNTIME_INDEX_VERSION.set(
    editor,
    (RUNTIME_INDEX_VERSION.get(editor) ?? 0) + 1
  );
  RUNTIME_INDEX_CACHE.delete(editor);
};

export const clearLiveRuntimeIndexCache = (editor: Editor) => {
  RUNTIME_INDEX_CACHE.delete(editor);
};

export const getCachedLiveRuntimeIndex = (editor: Editor) =>
  RUNTIME_INDEX_CACHE.get(editor);

export const getRuntimeIndexVersion = (editor: Editor) =>
  RUNTIME_INDEX_VERSION.get(editor) ?? 0;

export const initializeRuntimeIndexState = (editor: Editor) => {
  RUNTIME_INDEX_VERSION.set(editor, 0);
  RUNTIME_INDEX_CACHE.delete(editor);
};

export const operationInvalidatesRuntimeIndex = (operation: Operation) => {
  switch (operation.type) {
    case 'insert_node':
    case 'merge_node':
    case 'move_node':
    case 'replace_children':
    case 'remove_node':
    case 'split_node':
      return true;
    default:
      return false;
  }
};

export const setLiveRuntimeIndexCache = (
  editor: Editor,
  index: LiveRuntimeIndex
) => {
  RUNTIME_INDEX_CACHE.set(editor, {
    index,
    version: getRuntimeIndexVersion(editor),
  });
};
