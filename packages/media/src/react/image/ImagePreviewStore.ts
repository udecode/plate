import { createZustandStore } from '@udecode/plate-common';

export interface PreviewItem {
  url: string;
  id?: string;
}

export const ImagePreviewStore = createZustandStore('imagePreview')({
  boundingClientRect: {} as DOMRect,
  currentPreview: null as PreviewItem | null,
  isEditingScale: false,
  openEditorId: null as string | null,
  previewList: [] as PreviewItem[],
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

export const imagePreviewActions = ImagePreviewStore.set;

export const imagePreviewSelectors = ImagePreviewStore.get;

export const useImagePreviewSelectors = () => ImagePreviewStore.use;
