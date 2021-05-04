import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { EventEditorState } from '../../types/EventEditorStore';

/**
 * Vanilla store where the keys are event names and the values are editor ids..
 * @see zustand vanilla store
 */
export const eventEditorStore = createVanillaStore<EventEditorState>(
  () => ({})
);

/**
 * Store where the keys are event names and the values are editor ids.
 * @see zustand store
 */
export const useEventEditorStore = create(eventEditorStore);
