import {
  type Range,
  RangeApi,
  SelectionApi,
  type Selection,
} from '@platejs/plite';

import {
  type Editor,
  getEditorLiveSelection,
  getSelection as editorGetSelection,
} from './runtime-editor-api';

export const readLiveSelection = (editor: Editor): Selection =>
  getEditorLiveSelection(editor);

export const readRuntimeSelection = (editor: Editor): Selection =>
  readLiveSelection(editor) ?? editorGetSelection(editor);

export const readCommittedSelectionRange = (editor: Editor): Range | null => {
  const selection = editorGetSelection(editor);

  return RangeApi.isRange(selection) ? selection : null;
};

export const readRuntimeSelectionRange = (editor: Editor): Range | null => {
  const liveSelection = readLiveSelection(editor);

  if (SelectionApi.isText(liveSelection)) {
    return liveSelection;
  }

  return readCommittedSelectionRange(editor);
};
