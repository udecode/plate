import { useEditorRef, useEditorSelector } from '@udecode/plate-core';
import { isMarkActive, toggleMark } from '@udecode/slate-utils';

export const useMarkToolbarButtonState = ({
  clear,
  nodeType,
}: {
  clear?: string | string[];
  nodeType: string;
}) => {
  const pressed = useEditorSelector(
    (editor) => isMarkActive(editor, nodeType),
    [nodeType]
  );

  return {
    clear,
    nodeType,
    pressed,
  };
};

export const useMarkToolbarButton = (
  state: ReturnType<typeof useMarkToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        toggleMark(editor, { clear: state.clear, key: state.nodeType });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      pressed: state.pressed,
    },
  };
};
