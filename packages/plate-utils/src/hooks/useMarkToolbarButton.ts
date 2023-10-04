import { useEditorRef, useEditorState } from '@udecode/plate-core';
import { isMarkActive, toggleMark } from '@udecode/slate-utils';

export const useMarkToolbarButtonState = ({
  nodeType,
  clear,
}: {
  nodeType: string;
  clear?: string | string[];
}) => {
  const editor = useEditorState();
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
  const editor = useEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        toggleMark(editor, { key: state.nodeType, clear: state.clear });
      },
    },
  };
};
