import {
  getPluginType,
  someNode,
  useEditorRef,
  useEditorState,
} from '@udecode/plate-common';

import { ELEMENT_UL, toggleList } from '../index';

export const useListToolbarButtonState = ({ nodeType = ELEMENT_UL } = {}) => {
  const editor = useEditorState();
  const pressed =
    !!editor?.selection &&
    someNode(editor, { match: { type: getPluginType(editor, nodeType) } });

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
