import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { EventEditorState } from '../../types/EventEditorStore';

/**
 * Store where the keys are event names and the values are editor ids.
 */
export const eventEditorStore = createVanillaStore<EventEditorState>(
  () => ({})
);

/**
 * Store where the keys are event names and the values are editor ids.
 * @see zustand store
 */
export const useEventEditorStore = create(eventEditorStore);
