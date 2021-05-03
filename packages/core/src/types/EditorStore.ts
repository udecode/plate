import { EditorId } from './SlatePluginsStore';
import { SPEditor } from './SPEditor';

export type EditorState<T extends SPEditor = SPEditor> = {
  /**
   * Blurred editor id.
   */
  blurredEditorId?: EditorId;

  /**
   * Focused editor id.
   */
  focusedEditorId?: EditorId;
};

export type EditorActions<T extends SPEditor = SPEditor> = {
  setBlurredEditorId: (value: EditorState<T>['focusedEditorId']) => void;
  setFocusedEditorId: (value: EditorState<T>['blurredEditorId']) => void;
};
