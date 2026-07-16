import { useEditorRef, useEditorSelector } from '@platejs/core/react';

import { ListStyleType } from '../../lib/types';
import { ListPlugin } from '../ListPlugin';

export const useListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: {
  nodeType?: string;
} = {}) => {
  const pressed = useEditorSelector(
    (editor) => editor.plugin(ListPlugin).api.isActive(nodeType),
    [nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useListToolbarButton = ({
  nodeType,
  pressed,
}: ReturnType<typeof useListToolbarButtonState>) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle({
          listStyleType: nodeType,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
