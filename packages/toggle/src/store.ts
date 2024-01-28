import { createZustandStore } from '@udecode/plate-common';

import { ELEMENT_TOGGLE } from './types';

export const createToggleStore = () => {
  return createZustandStore(ELEMENT_TOGGLE)({
    openIds: new Set() as Set<string>,
  });
};

export type ToggleStore = ReturnType<typeof createToggleStore>;

export const someToggleClosed = (
  store: ToggleStore,
  toggleIds: string[]
): boolean => {
  const openIds = store.get.openIds();
  return toggleIds.some((id) => !openIds.has(id));
};

export const triggerStoreUpdate = (store: ToggleStore) => {
  store.set.openIds(new Set(store.get.openIds().values()));
};

export const toggleToggleId = (state: {
  toggleId: string;
  open: boolean; // current open state
  openIds: Set<string>;
}): Set<string> => {
  const newOpenIds = new Set<string>(state.openIds.values());
  if (state.open) {
    newOpenIds.delete(state.toggleId);
  } else {
    newOpenIds.add(state.toggleId);
  }
  return newOpenIds;
};
