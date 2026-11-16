import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableDOMRuntime,
  type EditorHistoryFocusPolicy,
  getMountedEditableDOMRuntime,
  getMountedEditableDOMRuntimes,
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
  // Among several `Editable`s of one view, none is the last active one before
  // the user acts in one or once that one unmounts, and a control's history
  // then runs through the first.
  const historyRuntime =
    runtime ??
    getMountedEditableDOMRuntimes(editor).find((mounted) =>
      Object.is(mounted.editor, editor)
    );

  if (!historyRuntime || editor.read.view.isReadOnly()) return false;

  historyRuntime.dispatchHistory(direction, focusPolicy);
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
