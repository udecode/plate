import { useEditorRef, useElement } from '@platejs/core/react';
import type { TCaptionElement } from '@platejs/utils';

import { BaseCaptionPlugin } from '../../lib';

export const useCaptionButtonState = () => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  return { editor, element };
};

export const useCaptionButton = ({
  editor,
  element,
}: ReturnType<typeof useCaptionButtonState>) => ({
  props: {
    onClick: () => {
      const path = editor.read.nodes.path(element);

      const caption = editor.plugin(BaseCaptionPlugin);

      caption.setOption('visibleId', element.id as string);
      setTimeout(() => {
        if (path) {
          caption.setOption('focusEndPath', path);
        }
      }, 0);
    },
  },
});
