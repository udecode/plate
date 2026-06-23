import type { Selection } from '@platejs/plite';
import { Editor, getEditorLiveSelection } from './runtime-editor-api';

export const readLiveSelection = (editor: Editor): Selection =>
  getEditorLiveSelection(editor);

export const readRuntimeSelection = (editor: Editor): Selection =>
  readLiveSelection(editor) ?? Editor.getSelection(editor);
