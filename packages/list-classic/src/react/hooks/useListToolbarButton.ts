import { KEYS } from '@platejs/utils';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import type { ListConfig } from '../../lib';

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

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        editor.update<ListConfig['tx']>((tx) =>
          tx.toggle.list({ type: state.nodeType })
        );
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
