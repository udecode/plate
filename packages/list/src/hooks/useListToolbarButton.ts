import {
  focusEditor,
  getPluginType,
  someNode,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_UL, toggleList } from '../index';

export const useListToolbarButtonState = ({ nodeType = ELEMENT_UL } = {}) => {
  const editor = usePlateEditorState();
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
  const editor = usePlateEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        toggleList(editor, { type: state.nodeType });
        focusEditor(editor);
      },
    },
  };
};
