import { createStore } from '@udecode/plate-core';

export type FloatingLinkMode = '' | 'insert' | 'edit';

export const floatingLinkStore = createStore('floatingLink')({
  open: false,
  mouseDown: false,
  updated: false,
  url: '',
  text: '',
  newTab: false,
  mode: '' as FloatingLinkMode,
  isEditing: false,
})
  .extendActions((set) => ({
    reset: () => {
      set.url('');
      set.text('');
      set.newTab(false);
      set.mode('');
      set.isEditing(false);
    },
  }))
  .extendActions((set) => ({
    show: (mode: FloatingLinkMode) => {
      set.mode(mode);
      set.isEditing(false);
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
