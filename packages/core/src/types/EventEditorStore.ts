import { EditorId } from './PlateStore';

export type EditorEvent = 'blur' | 'focus';

export type EventEditorState = Partial<Record<EditorEvent, EditorId>>;

export type EventEditorActions = {
  setEventEditorId: (event: EditorEvent, value: EditorId) => void;
};
