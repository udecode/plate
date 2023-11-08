import { useEditorRef, useEditorState } from '@udecode/plate-common';

import { ListStyleType, toggleIndentList } from '../index';
import { someIndentList } from './someIndentList';

export const useIndentListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: { nodeType?: string } = {}) => {
  const editor = useEditorState();

  return {
    pressed: someIndentList(editor, nodeType),
    nodeType,
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
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        toggleIndentList(editor, {
          listStyleType: nodeType,
        });
      },
    },
  };
};
