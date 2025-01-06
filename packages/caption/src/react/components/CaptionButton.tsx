import { useEditorRef, useElement } from '@udecode/plate/react';

import { BaseCaptionPlugin } from '../../lib';

export const useCaptionButtonState = () => {
  const editor = useEditorRef();
  const element = useElement();

  return { editor, element };
};

export const useCaptionButton = ({
  editor,
  element,
}: ReturnType<typeof useCaptionButtonState>) => {
  return {
    props: {
      onClick: () => {
        const path = editor.api.findPath(element);
        editor.setOption(BaseCaptionPlugin, 'visibleId', element.id as string);
        setTimeout(() => {
          path && editor.setOption(BaseCaptionPlugin, 'focusEndPath', path);
        }, 0);
      },
    },
  };
};
