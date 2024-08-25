import { createZustandStore } from '@udecode/plate-common';

export const FloatingMediaStore = createZustandStore('floatingMedia')({
  isEditing: false,
  url: '',
}).extendActions((set) => ({
  reset: () => {
    set.url('');
    set.isEditing(false);
  },
}));

export const floatingMediaActions = FloatingMediaStore.set;

export const floatingMediaSelectors = FloatingMediaStore.get;

export const useFloatingMediaSelectors = () => FloatingMediaStore.use;
