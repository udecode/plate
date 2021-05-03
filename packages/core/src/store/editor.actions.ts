import { EditorActions, EditorState } from '../types/EditorStore';
import { editorStore } from './editor.store';

const { setState: set } = editorStore;

const setter = <T>(key: keyof EditorState) => (value: T) =>
  set(() => ({
    [key]: value,
  }));

export const editorActions: EditorActions = {
  setBlurredEditorId: setter('blurredEditorId'),
  setFocusedEditorId: setter('focusedEditorId'),
};
