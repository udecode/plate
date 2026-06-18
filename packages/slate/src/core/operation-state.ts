import type { Editor } from '../interfaces/editor';
import type { Operation } from '../interfaces/operation';
import { cloneValue } from './clone';

const BASE_APPLY = new WeakMap<Editor, (operation: Operation) => void>();
const OPERATIONS = new WeakMap<Editor, Operation[]>();
const PUBLIC_OPERATIONS = new WeakMap<Editor, readonly Operation[]>();

export const getLiveOperations = (editor: Editor): Operation[] => {
  const existing = OPERATIONS.get(editor);

  if (existing) {
    return existing;
  }

  const operations: Operation[] = [];
  OPERATIONS.set(editor, operations);

  return operations;
};

export const getOperationStateOperations = (
  editor: Editor,
  options: { inTransaction: boolean; startIndex?: number }
): readonly Operation[] => {
  if (options.inTransaction) {
    return Object.freeze(
      cloneValue(getLiveOperations(editor).slice(options.startIndex ?? 0))
    );
  }

  if (options.startIndex != null && options.startIndex > 0) {
    return Object.freeze(
      cloneValue(getLiveOperations(editor).slice(options.startIndex))
    );
  }

  const cached = PUBLIC_OPERATIONS.get(editor);

  if (cached) {
    return cached;
  }

  const operations = Object.freeze(cloneValue(getLiveOperations(editor)));
  PUBLIC_OPERATIONS.set(editor, operations);

  return operations;
};

export const setOperationStateOperations = (
  editor: Editor,
  operations: Operation[]
) => {
  OPERATIONS.set(editor, cloneValue(operations));
  PUBLIC_OPERATIONS.delete(editor);
};

export const appendOperationStateOperation = (
  editor: Editor,
  operation: Operation
) => {
  getLiveOperations(editor).push(operation);
};

export const clearPublicOperationStateCache = (editor: Editor) => {
  PUBLIC_OPERATIONS.delete(editor);
};

export const hasOperationState = (editor: Editor) => OPERATIONS.has(editor);

export const setBaseApplyState = (
  editor: Editor,
  apply: (operation: Operation) => void
) => {
  BASE_APPLY.set(editor, apply);
};

export const getBaseApplyState = (editor: Editor) => BASE_APPLY.get(editor);
