import { type SlateEditor, getNodeEntries } from '@udecode/plate-common';

import type { TMediaElement } from '../../index';

import { ImagePlugin } from '../../lib/image/ImagePlugin';
import { imagePreviewActions, type PreviewItem } from './ImagePreviewStore';

const getUrlList = (editor: SlateEditor) => {
  const enties = getNodeEntries(editor, {
    at: [],
    match: (n) => n.type === ImagePlugin.key,
  });

  return Array.from(enties, (item) => ({
    id: item[0].id,
    url: item[0].url,
  })) as unknown as PreviewItem[];
};

export const openImagePreView = (
  editor: SlateEditor,
  element: TMediaElement
) => {
  const { id, url } = element;
  const urlList = getUrlList(editor);
  document.documentElement.style.overflowY = 'hidden';
  imagePreviewActions.openEditorId(editor.id);
  imagePreviewActions.currentPreview({ id, url });
  imagePreviewActions.previewList(urlList);
};
