import { findNodePath, useEditorRef, useElement } from '@udecode/plate-common';

import { captionGlobalStore } from '../captionGlobalStore';
import { useCaptionStore } from '../useResizableStore';

export const useCaptionButtonState = () => {
  const editor = useEditorRef();
  const element = useElement();
  const setShowCaption = useCaptionStore().set.showCaption();

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
        setShowCaption(true);
        setTimeout(() => {
          path && captionGlobalStore.set.focusEndCaptionPath(path);
        }, 0);
      },
    },
  };
};
