import type { Operation, RootKey } from '@platejs/slate';
import { getOperationRoot } from '../root-key';
import {
  readSlateViewSelection,
  readSlateViewSelectionHistoryEntry,
  writeSlateViewSelection,
} from '../view-selection';
import type { Editor } from './runtime-editor-api';

const EDITOR_TO_HISTORY_FOCUS_ROOT = new WeakMap<Editor, RootKey | null>();

const getHistoryBatchSingleOperationRoot = (
  editor: Editor,
  direction: 'redo' | 'undo'
): RootKey | null =>
  editor.read((state) => {
    const history = (state as { history?: unknown }).history as
      | {
          redos?: () => readonly { operations?: readonly Operation[] }[];
          undos?: () => readonly { operations?: readonly Operation[] }[];
        }
      | undefined;
    const stack =
      direction === 'undo' ? history?.undos?.() : history?.redos?.();
    const batch = stack?.at(-1);
    const roots = new Set(
      (batch?.operations ?? [])
        .filter((operation) => operation.type !== 'set_selection')
        .map(getOperationRoot)
    );

    return roots.size === 1 ? (roots.values().next().value ?? null) : null;
  });

export const applyModelOwnedHistoryIntent = ({
  direction,
  editor,
}: {
  direction: 'redo' | 'undo';
  editor: Editor;
}) => {
  const viewSelectionAfterHistory = readSlateViewSelectionHistoryEntry(
    editor,
    direction
  );
  const focusRoot = getHistoryBatchSingleOperationRoot(editor, direction);
  const hasHistory = editor.read((state) => {
    const history = (state as { history?: unknown }).history as
      | { redos?: unknown; undos?: unknown }
      | undefined;

    return (
      typeof history?.redos === 'function' &&
      typeof history?.undos === 'function'
    );
  });

  if (!hasHistory) {
    return false;
  }

  const previousViewSelection = readSlateViewSelection(editor);

  writeSlateViewSelection(editor, viewSelectionAfterHistory ?? null);
  try {
    editor.update(
      (tx) => {
        const history = (
          tx as {
            history?: {
              redo?: () => void;
              undo?: () => void;
            };
          }
        ).history;
        const fn = history?.[direction];

        if (typeof fn !== 'function') {
          throw new Error(`Editor history API does not expose ${direction}.`);
        }

        fn();
      },
      { skipNormalize: true }
    );
  } catch (error) {
    writeSlateViewSelection(editor, previousViewSelection);
    throw error;
  }
  EDITOR_TO_HISTORY_FOCUS_ROOT.set(editor, focusRoot);
  return true;
};

export const consumeModelOwnedHistoryFocusRoot = (
  editor: Editor
): RootKey | null => {
  const root = EDITOR_TO_HISTORY_FOCUS_ROOT.get(editor) ?? null;

  EDITOR_TO_HISTORY_FOCUS_ROOT.delete(editor);

  return root;
};

export const shouldForceRenderAfterModelOwnedHistory = (editor: Editor) => {
  const commit = editor.read((state) => state.value.lastCommit());

  return (
    !commit ||
    commit.operations.some(
      (operation) =>
        operation.type !== 'insert_text' &&
        operation.type !== 'remove_text' &&
        operation.type !== 'set_selection'
    )
  );
};

export const applyModelOwnedNativeHistoryEvent = ({
  editor,
  event,
  readOnly = false,
}: {
  editor: Editor;
  event: InputEvent;
  readOnly?: boolean;
}) => {
  if (readOnly) {
    return false;
  }

  if (
    event.inputType === 'historyUndo' &&
    applyModelOwnedHistoryIntent({ direction: 'undo', editor })
  ) {
    return true;
  }
  if (
    event.inputType === 'historyRedo' &&
    applyModelOwnedHistoryIntent({ direction: 'redo', editor })
  ) {
    return true;
  }
  return false;
};
