import type { TMediaElement } from 'platejs';

import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
} from 'platejs/react';

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
