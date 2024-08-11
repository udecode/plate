import { createZustandStore } from '../../libs';

export type EventEditorState = {
  /** Last editor id that has been blurred. */
  blur: null | string;
  /** Editor id that is currently being focused. */
  focus: null | string;
  /** Last editor id. */
  last: null | string;
};

/** Store where the keys are event names and the values are editor ids. */
export const eventEditorStore = createZustandStore('event-editor')({
  blur: null,
  focus: null,
  last: null,
} as EventEditorState);

export const eventEditorActions = eventEditorStore.set;

export const eventEditorSelectors = eventEditorStore.get;

export const useEventEditorSelectors = eventEditorStore.use;
