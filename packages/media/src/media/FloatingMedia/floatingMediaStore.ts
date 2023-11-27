import { createZustoodStore } from '@udecode/plate-common';

export const floatingMediaStore = createZustoodStore('floatingMedia')({
  url: '',
  isEditing: false,
}).extendActions((set) => ({
  reset: () => {
    set.url('');
    set.isEditing(false);
  },
}));

export const floatingMediaActions = floatingMediaStore.set;
export const floatingMediaSelectors = floatingMediaStore.get;
export const useFloatingMediaSelectors = () => floatingMediaStore.use;
