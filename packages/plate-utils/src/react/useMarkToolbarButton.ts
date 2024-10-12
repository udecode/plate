import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';
import { focusEditor } from '@udecode/slate-react';
import { isMarkActive } from '@udecode/slate-utils';

export const useMarkToolbarButtonState = ({
  clear,
  nodeType,
}: {
  nodeType: string;
  clear?: string[] | string;
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
      pressed: state.pressed,
      onClick: () => {
        editor.tf.toggle.mark({ key: state.nodeType, clear: state.clear });
        focusEditor(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
