import { ELEMENT_UL, getPluginType } from '@udecode/plate';
import {
  focusEditor,
  someNode,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { toggleList } from '@udecode/plate-list';

export const useListToolbarButtonState = ({ nodeType = ELEMENT_UL } = {}) => {
  const editor = usePlateEditorState();
  const pressed =
    !!editor?.selection &&
    someNode(editor, { match: { type: getPluginType(editor, nodeType) } });

  return {
    pressed,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>,
  nodeType = ELEMENT_UL
) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleList(editor, { type: nodeType });
        focusEditor(editor);
      },
    },
  };
};
