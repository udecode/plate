import { someNode } from '@udecode/plate-common';
import { useEditorRef, useEditorSelector } from '@udecode/plate-common/react';

import { ListUnorderedPlugin, toggleList } from '../index';

export const useListToolbarButtonState = ({
  nodeType = ListUnorderedPlugin.key as string,
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.selection &&
      someNode(editor, { match: { type: editor.getType({ key: nodeType }) } }),
    [nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        toggleList(editor, { type: state.nodeType });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      pressed: state.pressed,
    },
  };
};
