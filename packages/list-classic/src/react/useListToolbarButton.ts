import { KEYS } from '@platejs/utils';
import { useEditor, useEditorSelector } from '@platejs/core/react';

import { ListPlugin } from './ListPlugin';

export const useListToolbarButtonState = ({
  nodeType = KEYS.ulClassic as string,
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.read.selection() &&
      editor.read.nodes.some({ match: { type: editor.plugin(nodeType).type } })
  );

  return {
    nodeType,
    pressed,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>
) => {
  const editor = useEditor();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle({
          type: editor.plugin(state.nodeType).type,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
