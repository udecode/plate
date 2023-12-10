import { createZustandStore } from '@udecode/plate-common';

export type FloatingLinkMode = '' | 'insert' | 'edit';

export const floatingLinkStore = createZustandStore('floatingLink')({
  openEditorId: null as null | string,
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
    show: (mode: FloatingLinkMode, editorId: string) => {
      set.mode(mode);
      set.isEditing(false);
      set.openEditorId(editorId);
    },
    hide: () => {
      set.openEditorId(null);
      set.reset();
    },
  }))
  .extendSelectors((state) => ({
    isOpen: (editorId: string) => state.openEditorId === editorId,
  }));

export const floatingLinkActions = floatingLinkStore.set;
export const floatingLinkSelectors = floatingLinkStore.get;
export const useFloatingLinkSelectors = () => floatingLinkStore.use;
