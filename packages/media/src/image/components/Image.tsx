import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';

import type { TMediaElement } from '../../media';

import { openImagePreView } from '../utils';

export const useImage = () => {
  const element = useElement<TMediaElement>();
  const editor = useEditorRef();

  return {
    props: {
      draggable: true,
      onDoubleClickCapture: () => {
        openImagePreView(editor, element);
      },
      src: element.url,
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
