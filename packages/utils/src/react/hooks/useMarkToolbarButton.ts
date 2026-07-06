import { useEditorRef, useEditorSelector } from '@platejs/core/react';

type PreventDefaultMouseEvent = Pick<
  React.MouseEvent<HTMLButtonElement>,
  'preventDefault'
>;

export const useMarkToolbarButtonState = ({
  clear,
  nodeType,
}: {
  nodeType: string;
  clear?: string[] | string;
}) => {
  const pressed = useEditorSelector(
    (editor) => !!editor.read.marks()?.[nodeType],
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
        editor.update.marks.toggle(state.nodeType, true, {
          clear: state.clear,
        });
        editor.api.dom?.focus?.();
      },
      onMouseDown: (e: PreventDefaultMouseEvent) => {
        e.preventDefault();
      },
    },
  };
};
