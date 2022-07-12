import { createStore } from '@udecode/plate-core';

export type FloatingLinkMode = '' | 'insert' | 'edit' | 'toolbar';

export const floatingLinkStore = createStore('floatingLink')({
  open: false,
  mouseDown: false,
  updated: false,
  url: '',
  text: '',
  mode: '' as FloatingLinkMode,
})
  .extendActions((set) => ({
    reset: () => {
      set.url('');
      set.text('');
      set.mode('');
    },
  }))
  .extendActions((set) => ({
    show: (mode: FloatingLinkMode) => {
      set.mode(mode);
      set.open(true);
    },
    hide: () => {
      set.open(false);
      set.reset();
    },
  }));

export const floatingLinkActions = floatingLinkStore.set;
export const floatingLinkSelectors = floatingLinkStore.get;
export const useFloatingLinkSelectors = () => floatingLinkStore.use;
