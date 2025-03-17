import type { SlateEditor } from '@udecode/plate';

import type { TMediaElement } from '../../index';

import { BaseImagePlugin } from '../../lib/image/BaseImagePlugin';
import { type PreviewItem, ImagePreviewStore } from './ImagePreviewStore';

const getUrlList = (editor: SlateEditor) => {
  const enties = editor.api.nodes({
    at: [],
    match: (n) => n.type === BaseImagePlugin.key,
  });

  return Array.from(enties, (item) => ({
    id: item[0].id,
    url: item[0].url,
  })) as unknown as PreviewItem[];
};

export const openImagePreview = (
  editor: SlateEditor,
  element: TMediaElement
) => {
  const { id, url } = element;
  const urlList = getUrlList(editor);
  // document.documentElement.style.overflowY = 'hidden';
  ImagePreviewStore.set('openEditorId', editor.id);
  ImagePreviewStore.set('currentPreview', { id, url });
  ImagePreviewStore.set('previewList', urlList);
};
