import { createZustandStore } from '@udecode/plate-common/server';

export type FloatingLinkMode = '' | 'edit' | 'insert';

export const floatingLinkStore = createZustandStore('floatingLink')({
  isEditing: false,
  mode: '' as FloatingLinkMode,
  mouseDown: false,
  newTab: false,
  openEditorId: null as null | string,
  text: '',
  updated: false,
  url: '',
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
    hide: () => {
      set.openEditorId(null);
      set.reset();
    },
    show: (mode: FloatingLinkMode, editorId: string) => {
      set.mode(mode);
      set.isEditing(false);
      set.openEditorId(editorId);
    },
  }))
  .extendSelectors((state) => ({
    isOpen: (editorId: string) => state.openEditorId === editorId,
  }));

export const floatingLinkActions = floatingLinkStore.set;

export const floatingLinkSelectors = floatingLinkStore.get;

export const useFloatingLinkSelectors = () => floatingLinkStore.use;
