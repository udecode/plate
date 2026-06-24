import type { Selection } from '@platejs/plite';
import {
  type Editor,
  getEditorLiveSelection,
  getSelection as editorGetSelection,
} from './runtime-editor-api';

export const readLiveSelection = (editor: Editor): Selection =>
  getEditorLiveSelection(editor);

export const readRuntimeSelection = (editor: Editor): Selection =>
  readLiveSelection(editor) ?? editorGetSelection(editor);
