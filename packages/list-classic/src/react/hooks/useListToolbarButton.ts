import { KEYS } from 'platejs';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import { ListPlugin } from '../ListPlugin';

export const useListToolbarButtonState = ({
  nodeType = KEYS.ulClassic as string,
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.selection &&
      editor.api.some({ match: { type: editor.getType(nodeType) } }),
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
  const tf = editor.getTransforms(ListPlugin);

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        tf.toggle.list({ type: state.nodeType });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
