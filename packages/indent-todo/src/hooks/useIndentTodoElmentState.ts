import { findNodePath, setNodes, useEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { TIndentTodoListItemElement } from '../index';

export const useIndentTodoListElementState = ({
  element,
}: {
  element: TIndentTodoListItemElement;
}) => {
  const editor = useEditorRef();
  const { checked } = element;
  const readOnly = useReadOnly();

  return {
    checked,
    readOnly,
    element,
    editor,
  };
};

export const useIndentTodoListElement = (
  state: ReturnType<typeof useIndentTodoListElementState>
) => {
  const { checked, readOnly, element } = state;
  const editor = useEditorRef();

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;
        const path = findNodePath(editor, element);
        if (!path) return;

        setNodes<TIndentTodoListItemElement>(
          editor,
          { checked: value },
          {
            at: path,
          }
        );
      },
    },
  };
};
