import { useEditorRef, useElement } from 'platejs/react';

import { BaseCaptionPlugin } from '../../lib';

export const useCaptionButtonState = () => {
  const editor = useEditorRef();
  const element = useElement();

  return { editor, element };
};

export const useCaptionButton = ({
  editor,
  element,
}: ReturnType<typeof useCaptionButtonState>) => ({
  props: {
    onClick: () => {
      const path = editor.api.findPath(element);
      editor.setOption(BaseCaptionPlugin, 'visibleId', element.id as string);
      setTimeout(() => {
        if (path) {
          editor.setOption(BaseCaptionPlugin, 'focusEndPath', path);
        }
      }, 0);
    },
  },
});
