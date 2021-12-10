import { createStore } from '@udecode/zustood';
import { PlatesStoreState } from '../../types/PlateStore';
import { eventEditorActions } from '../event-editor/event-editor.store';
import { createPlateStore } from './createPlateStore';
import { getPlateStore, usePlateStore } from './usePlateStore';

/**
 * Plates store.
 */
export const platesStore = createStore('plate')({} as PlatesStoreState)
  .extendActions((set) => ({
    /**
     * Set state by id. Called by `Plate` on mount.
     */
    set: (id: string) => {
      set.state((draft) => {
        if (!id || draft[id]) return;

        draft[id] = createPlateStore({ id });

        eventEditorActions.last(id);
      });
    },
    /**
     * Remove state by id. Called by `Plate` on unmount.
     */
    unset: (id: string) => {
      set.state((draft) => {
        delete draft[id];
      });
    },
  }))
  .extendSelectors((state) => ({
    get(id: string) {
      return state[id];
    },
  }));

export const platesActions = platesStore.set;

export const getPlateActions = (id?: string) => getPlateStore(id).set;
export const getPlateSelectors = (id?: string) => getPlateStore(id).get;
export const usePlateSelectors = (id?: string) => usePlateStore(id).use;
