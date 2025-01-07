import { createZustandStore } from '@udecode/plate';

export const FloatingMediaStore = createZustandStore(
  {
    isEditing: false,
    url: '',
  },
  {
    mutative: true,
    name: 'floatingMedia',
  }
).extendActions((set) => ({
  reset: () => {
    set.url('');
    set.isEditing(false);
  },
}));

export const floatingMediaActions = FloatingMediaStore.set;

export const floatingMediaSelectors = FloatingMediaStore.get;

export const useFloatingMediaSelectors = () => FloatingMediaStore.use;
