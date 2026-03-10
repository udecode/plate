import { createZustandStore } from 'platejs/react';

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
} = FloatingMediaStore as any;
