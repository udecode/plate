import { useEditor, useElement } from '@platejs/core/react';
import type { TCaptionElement } from '@platejs/utils';

import { BaseCaptionPlugin } from '../../lib';

export const useCaptionButtonState = () => {
  const editor = useEditor();
  const element = useElement<TCaptionElement>();

  return { editor, element };
};

export const useCaptionButton = ({
  editor,
  element,
}: ReturnType<typeof useCaptionButtonState>) => ({
  props: {
    onClick: () => {
      if (typeof element.id !== 'string') return;

      const caption = editor.plugin(BaseCaptionPlugin);

      caption.setOption('visibleId', element.id);
      setTimeout(() => {
        const path = editor.read.nodes.path(element);

        if (!path) return;

        caption.setOption('focusEndPath', path);
      }, 0);
    },
  },
});
