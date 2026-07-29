import { useEditor, useEditorSelector } from '@platejs/core/react';

type PreventDefaultMouseEvent = Pick<
  React.MouseEvent<HTMLButtonElement>,
  'preventDefault'
>;

export const useMarkToolbarButtonState = ({
  nodeType,
}: {
  nodeType: string;
}) => {
  const pressed = useEditorSelector(
    (editor) => !!editor.read.marks()?.[nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useMarkToolbarButton = (
  state: ReturnType<typeof useMarkToolbarButtonState>
) => {
  const editor = useEditor();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        editor.update.marks.toggle(state.nodeType);
        editor.api.dom.focus();
      },
      onMouseDown: (e: PreventDefaultMouseEvent) => {
        e.preventDefault();
      },
    },
  };
};
