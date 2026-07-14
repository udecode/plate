import type { BaseEditor } from '@platejs/core';
import type { TMediaElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { type PreviewItem, ImagePreviewStore } from './ImagePreviewStore';

const getUrlList = (editor: BaseEditor): PreviewItem[] => {
  const entries = editor.read.nodes.entries<TMediaElement>({
    at: [],
    match: { type: KEYS.img },
  });

  return Array.from(entries, ([node]) => ({
    id: node.id,
    url: node.url,
  }));
};

export const openImagePreview = (
  editor: BaseEditor,
  element: TMediaElement
) => {
  const { id, url } = element;
  const urlList = getUrlList(editor);
  // document.documentElement.style.overflowY = 'hidden';
  ImagePreviewStore.set('openEditorId', editor.id);
  ImagePreviewStore.set('currentPreview', { id, url });
  ImagePreviewStore.set('previewList', urlList);
};
