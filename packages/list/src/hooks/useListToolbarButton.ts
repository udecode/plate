import {
  getPluginType,
  someNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import { ELEMENT_UL, toggleList } from '../index';

export const useListToolbarButtonState = ({ nodeType = ELEMENT_UL } = {}) => {
  const pressed = useEditorSelector((editor) =>
    !!editor.selection &&
    someNode(editor, { match: { type: getPluginType(editor, nodeType) } }),
    [nodeType]
  );

  return {
    pressed,
    nodeType,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        toggleList(editor, { type: state.nodeType });
      },
    },
  };
};
