import { KEYS } from '@platejs/utils';
import { useEditorRef, useEditorSelector } from '@platejs/core/react';

import { ListPlugin } from '../ListPlugin';

export const useListToolbarButtonState = ({
  nodeType = KEYS.ulClassic as string,
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.read.selection() &&
      editor.read.nodes.some({ match: { type: editor.getType(nodeType) } }),
    [nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle.list({
          type: state.nodeType,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
