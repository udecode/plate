import { useEditorRef, useEditorSelector } from '@udecode/plate-common/react';

import { ListStyleType, toggleIndentList } from '../../index';
import { someIndentList } from './someIndentList';

export const useIndentListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: { nodeType?: string } = {}) => {
  const pressed = useEditorSelector(
    (editor) => someIndentList(editor, nodeType),
    [nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useIndentListToolbarButton = ({
  nodeType,
  pressed,
}: ReturnType<typeof useIndentListToolbarButtonState>) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed,
      onClick: () => {
        toggleIndentList(editor, {
          listStyleType: nodeType,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
