import { useEditorRef, useEditorSelector } from '@udecode/plate-common';

import { ListStyleType, toggleIndentList } from '../index';
import { someIndentTodo } from './someIndentTodo';

export const useIndentTodoToolBarButtonState = ({
  nodeType = ListStyleType.Disc,
}: { nodeType?: string } = {}) => {
  const pressed = useEditorSelector(
    (editor) => someIndentTodo(editor, nodeType),
    [nodeType]
  );
  return {
    pressed,
    nodeType,
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
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        toggleIndentList(editor, {
          listStyleType: nodeType,
        });
      },
    },
  };
};
