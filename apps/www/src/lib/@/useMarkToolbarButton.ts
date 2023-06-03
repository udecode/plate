import {
  focusEditor,
  isMarkActive,
  toggleMark,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';

export const useMarkToolbarButtonState = ({
  nodeType,
  clear,
}: {
  nodeType: string;
  clear?: string | string[];
}) => {
  const editor = usePlateEditorState();
  const pressed = !!editor?.selection && isMarkActive(editor, nodeType);

  return {
    pressed,
    nodeType,
    clear,
  };
};

export const useMarkToolbarButton = (
  state: ReturnType<typeof useMarkToolbarButtonState>
) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleMark(editor, { key: state.nodeType, clear: state.clear });
        focusEditor(editor);
      },
    },
  };
};
