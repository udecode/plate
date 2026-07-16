import type { TMediaElement } from '@platejs/utils';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { useEditorRef, useElement } from '@platejs/core/react';

import { openImagePreview } from '../openImagePreview';

export const useImage = () => {
  const element = useElement<TMediaElement>();
  const editor = useEditorRef();

  return {
    props: {
      draggable: true,
      src: element.url,
      onDoubleClickCapture: () => {
        openImagePreview(editor, element);
      },
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
