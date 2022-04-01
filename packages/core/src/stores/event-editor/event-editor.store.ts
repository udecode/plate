import { createStore } from '@udecode/zustood';

export type EventEditorState = {
  /**
   * Last editor id that has been blurred.
   */
  blur: string | null;
  /**
   * Editor id that is currently being focused.
   */
  focus: string | null;
  /**
   * Last editor id.
   */
  last: string | null;
};

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
