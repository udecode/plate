import { createStore } from '@udecode/zustood';
import { EditorId } from '../../types/PlateStore';

export type EventEditorKey = 'blur' | 'focus' | 'last';

export type EventEditorState = Record<EventEditorKey, EditorId | null>;

/**
 * Store where the keys are event names and the values are editor ids.
 */
export const eventEditorStore = createStore('event-editor')({
  blur: null,
  focus: null,
  last: null,
} as EventEditorState);

export const eventEditorActions = eventEditorStore.set;
export const eventEditorSelectors = eventEditorStore.get;
export const useEventEditorSelectors = eventEditorStore.use;
