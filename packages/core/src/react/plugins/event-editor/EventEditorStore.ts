import { createZustandStore } from '../../../lib';

export type EventEditorState = {
  /** Last editor id that has been blurred. */
  blur: null | string;
  /** Editor id that is currently being focused. */
  focus: null | string;
  /** Last editor id. */
  last: null | string;
};

/** Store where the keys are event names and the values are editor ids. */
export const EventEditorStore = createZustandStore('event-editor')({
  blur: null,
  focus: null,
  last: null,
} as EventEditorState);

export const eventEditorActions = EventEditorStore.set;

export const eventEditorSelectors = EventEditorStore.get;

export const useEventEditorSelectors = EventEditorStore.use;
