import { useEditorRef, useEditorSelector } from 'platejs/react';

import { ListStyleType, toggleList } from '../../index';
import { someTodoList } from '../../lib/queries/someTodoList';

export const useIndentTodoToolBarButtonState = ({
  nodeType = ListStyleType.Disc,
}: {
  nodeType?: string;
} = {}) => {
  const pressed = useEditorSelector(
    (editor) => someTodoList(editor),
    [nodeType]
  );

  return {
    nodeType,
    pressed,
  };
};

export const useIndentTodoToolBarButton = ({
  nodeType,
  pressed,
}: ReturnType<typeof useIndentTodoToolBarButtonState>) => {
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
