import {
  findNodePath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';

import { captionActions, captionGlobalStore } from '../../lib';

export const useCaptionButtonState = () => {
  const editor = useEditorRef();
  const element = useElement();
  const setShowCaption = captionActions.showCaptionId;

  return { editor, element, setShowCaption };
};

export const useCaptionButton = ({
  editor,
  element,
  setShowCaption,
}: ReturnType<typeof useCaptionButtonState>) => {
  return {
    props: {
      onClick: () => {
        const path = findNodePath(editor, element);
        setShowCaption(element.id as string);
        setTimeout(() => {
          path && captionGlobalStore.set.focusEndCaptionPath(path);
        }, 0);
      },
    },
  };
};
