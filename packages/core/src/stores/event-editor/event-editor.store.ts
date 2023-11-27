import {createAtomStore} from '../../jotai-factory';
import { PlateId } from '../plate/index';

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
export const {
  eventEditorStore,
  useEventEditorStore,
} = createAtomStore({
  blur: null,
  focus: null,
  last: null,
} satisfies EventEditorState as EventEditorState, {
  name: 'eventEditor',
});

export const eventEditorActions = () => useEventEditorStore().set;
export const eventEditorSelectors = () => useEventEditorStore().get;
export const useEventEditorSelectors = () => useEventEditorStore().use;
