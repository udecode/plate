import type { TMediaElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { useEditor, useElement } from '@platejs/core/react';

import { ImagePreviewStore } from './ImagePreviewStore';

export const useImage = () => {
  const element = useElement<TMediaElement>();
  const editor = useEditor();

  return {
    props: {
      draggable: true,
      src: element.url,
      onDoubleClickCapture: () => {
        ImagePreviewStore.set('openEditorId', editor.id);
        ImagePreviewStore.set('currentPreview', {
          id: element.id,
          url: element.url,
        });
        ImagePreviewStore.set(
          'previewList',
          Array.from(
            editor.read.nodes.entries<TMediaElement>({
              at: [],
              match: { type: KEYS.img },
            }),
            ([node]) => ({ id: node.id, url: node.url })
          )
        );
      },
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
