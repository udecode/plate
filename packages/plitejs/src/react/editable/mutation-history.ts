import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableDOMRuntime,
  type EditorHistoryFocusPolicy,
  getMountedEditableDOMRuntime,
} from './editable-dom-runtime';

export const applyModelOwnedHistoryIntent = ({
  direction,
  editor,
  focusPolicy = 'restore-root',
  runtime = getMountedEditableDOMRuntime(editor),
}: {
  direction: 'redo' | 'undo';
  editor: ReactRuntimeEditor;
  focusPolicy?: EditorHistoryFocusPolicy;
  runtime?: EditableDOMRuntime | null;
}) => {
  if (!runtime) return false;

  void runtime.replayHistory(direction, focusPolicy);
  return true;
};

export const shouldForceRenderAfterModelOwnedHistory = (
  editor: ReactRuntimeEditor
) => {
  const commit = editor.read((state) => state.lastCommit());

  return (
    !commit ||
    commit.changed.hasAny('structure') ||
    commit.changed.hasAny('properties') ||
    commit.changed.hasAny('root-order') ||
    commit.changed.hasAny('replace')
  );
};

export const applyModelOwnedNativeHistoryEvent = ({
  editor,
  event,
  readOnly = false,
  runtime,
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  readOnly?: boolean;
  runtime?: EditableDOMRuntime | null;
}) => {
  if (readOnly) return false;

  const direction =
    event.inputType === 'historyUndo'
      ? 'undo'
      : event.inputType === 'historyRedo'
        ? 'redo'
        : null;

  return direction
    ? applyModelOwnedHistoryIntent({ direction, editor, runtime })
    : false;
};
