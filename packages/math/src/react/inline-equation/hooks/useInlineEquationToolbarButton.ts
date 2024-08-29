import { getSelectionText } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-common/react';

import { insertInlineEquation } from '../../../lib/inline-equation/transforms';

export const useInlineToolbarButtonState = () => {
  const editor = useEditorRef();

  return { editor };
};

export const useInlineToolbarButton = ({
  editor,
}: ReturnType<typeof useInlineToolbarButtonState>) => {
  return {
    props: {
      onClick: () => {
        const texExpression = getSelectionText(editor);
        insertInlineEquation(editor, texExpression);
      },
    },
  };
};
