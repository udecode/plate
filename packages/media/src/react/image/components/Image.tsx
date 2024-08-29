import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';

import type { TMediaElement } from '../../../lib/media';

import { openImagePreview } from '../openImagePreview';

export const useImage = () => {
  const element = useElement<TMediaElement>();
  const editor = useEditorRef();

  return {
    props: {
      draggable: true,
      onDoubleClickCapture: () => {
        openImagePreview(editor, element);
      },
      src: element.url,
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
