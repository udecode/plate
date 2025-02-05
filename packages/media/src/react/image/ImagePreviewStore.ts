import { createZustandStore } from '@udecode/plate';

export interface PreviewItem {
  url: string;
  id?: string;
}

export const ImagePreviewStore = createZustandStore(
  {
    boundingClientRect: {} as DOMRect,
    currentPreview: null as PreviewItem | null,
    isEditingScale: false,
    openEditorId: null as string | null,
    previewList: [] as PreviewItem[],
    scale: 1 as number,
    translate: { x: 0, y: 0 },
  },
  {
    mutative: true,
    name: 'imagePreview',
  }
)
  .extendActions(({ set }) => ({
    close: () => {
      set('currentPreview', null);
      set('previewList', []);
      set('openEditorId', null);
      set('scale', 1);
      set('translate', { x: 0, y: 0 });
      set('isEditingScale', false);
    },
  }))
  .extendSelectors(({ get }) => ({
    isOpen: (editorId: string) => get('openEditorId') === editorId,
  }));

export const { useValue: useImagePreviewValue } = ImagePreviewStore;
