import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';

export const useMarkToolbarButtonState = ({
  clear,
  nodeType,
}: {
  nodeType: string;
  clear?: string[] | string;
}) => {
  const pressed = useEditorSelector(
    (editor) => editor.api.hasMark(nodeType),
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
      pressed: state.pressed,
      onClick: () => {
        editor.tf.toggleMark(state.nodeType, { remove: state.clear });
        editor.tf.focus();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
