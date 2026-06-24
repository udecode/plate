import type { BasePlateEditor, TMediaElement } from 'platejs';

import { KEYS } from 'platejs';

import { type PreviewItem, ImagePreviewStore } from './ImagePreviewStore';

const getUrlList = (editor: BasePlateEditor) => {
  const enties = editor.api.nodes({
    at: [],
    match: (n: unknown) =>
      typeof n === 'object' && n !== null && 'type' in n && n.type === KEYS.img,
  });

  return Array.from(enties, ([node]) => {
    const item = node as TMediaElement;

    return {
      id: item.id,
      url: item.url,
    };
  }) as PreviewItem[];
};

export const openImagePreview = (
  editor: BasePlateEditor,
  element: TMediaElement
) => {
  const { id, url } = element;
  const urlList = getUrlList(editor);
  // document.documentElement.style.overflowY = 'hidden';
  ImagePreviewStore.set('openEditorId', editor.id);
  ImagePreviewStore.set('currentPreview', { id, url });
  ImagePreviewStore.set('previewList', urlList);
};
