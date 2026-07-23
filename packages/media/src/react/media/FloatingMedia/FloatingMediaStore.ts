import { createZustandStore } from '@platejs/core/react/internal';

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
