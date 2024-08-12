import { createZustandStore } from '@udecode/plate-common';

export interface previewItem {
  url: string;
  id?: string;
}

export const imagePreviewStore = createZustandStore('imagePreview')({
  boundingClientRect: {} as DOMRect,
  currentPreview: null as null | previewItem,
  isEditingScale: false,
  openEditorId: null as null | string,
  previewList: [] as previewItem[],
  scale: 1 as number,
  translate: { x: 0, y: 0 },
})
  .extendActions((set) => ({
    close: () => {
      set.currentPreview(null);
      set.previewList([]);
      set.openEditorId(null);
      set.scale(1);
      set.translate({ x: 0, y: 0 });
      set.isEditingScale(false);
    },
  }))
  .extendSelectors((state) => ({
    isOpen: (editorId: string) => state.openEditorId === editorId,
  }));

export const imagePreviewActions = imagePreviewStore.set;

export const imagePreviewSelectors = imagePreviewStore.get;

export const useImagePreviewSelectors = () => imagePreviewStore.use;
