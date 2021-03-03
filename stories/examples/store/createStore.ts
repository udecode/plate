import pipe from 'ramda/es/pipe';
import create from 'zustand';
import { immer } from './immer.middleware';

export const createStore = (storeName: string) => pipe(immer, create);

// export const action = (type: string) =>

export const action = <T>(
  draft: T & { actionType?: string },
  actionType: string
) => {
  draft.actionType = actionType;
};

/**
 * Set a value in the store.
 */
export const setStoreValue = <T>(
  set: (
    fn: (draft: T & { actionType?: string; noDiff?: boolean }) => void
  ) => void,
  storeKey: keyof T,
  actionType: string,
  merge?: boolean
) => (value: any) => {
  set((state) => {
    state.noDiff = true;
    if (state[storeKey] !== value) {
      state.noDiff = false;
      state.actionType = actionType;
      if (!merge) {
        state[storeKey] = value;
      } else {
        state[storeKey] = { ...state[storeKey], ...value };
      }
    }
  });
};
