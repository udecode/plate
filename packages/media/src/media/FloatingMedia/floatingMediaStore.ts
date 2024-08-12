import { createZustandStore } from '@udecode/plate-common';

export const floatingMediaStore = createZustandStore('floatingMedia')({
  isEditing: false,
  url: '',
}).extendActions((set) => ({
  reset: () => {
    set.url('');
    set.isEditing(false);
  },
}));

export const floatingMediaActions = floatingMediaStore.set;

export const floatingMediaSelectors = floatingMediaStore.get;

export const useFloatingMediaSelectors = () => floatingMediaStore.use;
