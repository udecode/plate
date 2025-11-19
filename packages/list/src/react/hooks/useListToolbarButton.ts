import { useEditorRef, useEditorSelector } from 'platejs/react';

import { ListStyleType, toggleList } from '../../index';
import { someList } from '../../lib/queries/someList';

export const useListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: {
  nodeType?: string;
} = {}) => {
  const pressed = useEditorSelector(
    (editor) => someList(editor, nodeType),
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
        toggleList(editor, {
          listStyleType: nodeType,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
