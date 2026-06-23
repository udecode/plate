import { useEditorRef, useEditorSelector } from '@platejs/core/react';

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
        editor.update((tx) => {
          const clearMarks = Array.isArray(state.clear)
            ? state.clear
            : state.clear
              ? [state.clear]
              : [];

          clearMarks.forEach((mark) => tx.marks.remove(mark));
          tx.marks.toggle(state.nodeType);
        });
        editor.api.dom.focus();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
