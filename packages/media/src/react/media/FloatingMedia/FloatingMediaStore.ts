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
).extendActions(({ set }) => ({
  reset: () => {
    set('url', '');
    set('isEditing', false);
  },
}));

export const {
  useState: useFloatingMediaState,
  useValue: useFloatingMediaValue,
} = FloatingMediaStore;
