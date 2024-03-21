import {
  collapseSelection,
  focusEditor,
  PlateEditor,
  toggleNodeType,
  useEditorRef,
  useEditorSelector,
  Value,
} from '@udecode/plate-common';

import { someIndentTodo } from '../queries/someIndentTodo';
import { ELEMENT_INDENT_TODO } from '../types';

export const useIndentTodoToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => someIndentTodo(editor), []);

  return {
    pressed,
  };
};

export const useIndentTodoToolbarButton = ({
  pressed,
}: ReturnType<typeof useIndentTodoToolbarButtonState>) => {
  const editor = useEditorRef<Value, PlateEditor<Value>>();

  return {
    props: {
      pressed,
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        // openNextToggles(editor);
        toggleNodeType(editor, {
          activeType: ELEMENT_INDENT_TODO,
        });
        collapseSelection(editor);
        focusEditor(editor);
      },
    },
  };
};
