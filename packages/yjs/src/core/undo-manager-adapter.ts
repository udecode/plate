import type * as Y from 'yjs';

import { isRecord } from './record';

export const SUPPORTED_YJS_UNDO_MANAGER_VERSION = '13.6.30';

export type YjsUndoManagerStackItem = {
  readonly meta: Map<unknown, unknown>;
};

export type YjsUndoManagerAdapter = {
  readonly moveRedoToUndo: (item: YjsUndoManagerStackItem) => void;
  readonly moveUndoToRedo: (item: YjsUndoManagerStackItem) => void;
  readonly peekRedo: () => YjsUndoManagerStackItem | null;
  readonly peekUndo: () => YjsUndoManagerStackItem | null;
  readonly redoDepth: () => number;
  readonly storeUndoMeta: (key: unknown, value: unknown) => void;
};

const isStackItem = (value: unknown): value is YjsUndoManagerStackItem =>
  isRecord(value) && value.meta instanceof Map;

const assertStack = (
  value: unknown,
  name: string
): YjsUndoManagerStackItem[] => {
  if (!Array.isArray(value)) {
    throw new Error(
      `Unsupported Yjs UndoManager ${name} contract. @platejs/yjs pins yjs@${SUPPORTED_YJS_UNDO_MANAGER_VERSION}.`
    );
  }

  let index = 0;

  while (index < value.length) {
    const item = value[index];

    if (!isStackItem(item)) {
      throw new Error(
        `Unsupported Yjs UndoManager ${name} contract. @platejs/yjs pins yjs@${SUPPORTED_YJS_UNDO_MANAGER_VERSION}.`
      );
    }
    index++;
  }

  return value;
};

const peekStackItem = (
  stack: readonly YjsUndoManagerStackItem[]
): YjsUndoManagerStackItem | null => {
  const lastIndex = stack.length - 1;

  return lastIndex < 0 ? null : (stack[lastIndex] ?? null);
};

const readUndoManagerStack = (
  undoManager: Y.UndoManager,
  name: 'redo' | 'undo'
): YjsUndoManagerStackItem[] => {
  const stack = isRecord(undoManager)
    ? name === 'undo'
      ? undoManager.undoStack
      : undoManager.redoStack
    : undefined;

  return assertStack(stack, name);
};

const popExpectedStackItem = (
  stack: YjsUndoManagerStackItem[],
  item: YjsUndoManagerStackItem,
  message: string
): void => {
  const lastIndex = stack.length - 1;

  if (lastIndex < 0 || stack[lastIndex] !== item) {
    throw new Error(message);
  }

  stack.pop();
};

export const createYjsUndoManagerAdapter = (
  undoManager: Y.UndoManager
): YjsUndoManagerAdapter => {
  const undo = (): YjsUndoManagerStackItem[] =>
    readUndoManagerStack(undoManager, 'undo');
  const redo = (): YjsUndoManagerStackItem[] =>
    readUndoManagerStack(undoManager, 'redo');

  return {
    moveRedoToUndo(item: YjsUndoManagerStackItem) {
      const stack = redo();

      popExpectedStackItem(stack, item, 'Cannot move a non-top redo item.');
      undo().push(item);
    },
    moveUndoToRedo(item: YjsUndoManagerStackItem) {
      const stack = undo();

      popExpectedStackItem(stack, item, 'Cannot move a non-top undo item.');
      redo().push(item);
    },
    peekRedo() {
      return peekStackItem(redo());
    },
    peekUndo() {
      return peekStackItem(undo());
    },
    redoDepth() {
      return redo().length;
    },
    storeUndoMeta(key: unknown, value: unknown) {
      peekStackItem(undo())?.meta.set(key, value);
    },
  };
};
