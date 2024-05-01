import { createZustandStore } from '../../libs';

import type { PlateId } from '../../../client/stores/plate';

export type EventEditorState = {
  /**
   * Last editor id that has been blurred.
   */
  blur: PlateId | null;
  /**
   * Editor id that is currently being focused.
   */
  focus: PlateId | null;
  /**
   * Last editor id.
   */
  last: PlateId | null;
};

/**
 * Store where the keys are event names and the values are editor ids.
 */
export const eventEditorStore = createZustandStore('event-editor')({
  blur: null,
  focus: null,
  last: null,
} as EventEditorState);

export const eventEditorActions = eventEditorStore.set;
export const eventEditorSelectors = eventEditorStore.get;
export const useEventEditorSelectors = eventEditorStore.use;
