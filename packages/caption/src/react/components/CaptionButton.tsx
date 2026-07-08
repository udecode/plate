import { useEditorRef, useElement } from 'platejs/react';

import { BaseCaptionPlugin } from '../../lib';

export const useCaptionButtonState = (): any => {
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
      editor.plugin(BaseCaptionPlugin).setOption('visibleId', element.id as string);
      setTimeout(() => {
        if (path) {
          editor.plugin(BaseCaptionPlugin).setOption('focusEndPath', path);
        }
      }, 0);
    },
  },
});
