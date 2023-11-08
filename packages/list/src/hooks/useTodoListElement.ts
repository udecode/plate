import { findNodePath, setNodes, useEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { TTodoListItemElement } from '../index';

export const useTodoListElementState = ({
  element,
}: {
  element: TTodoListItemElement;
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

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
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

        setNodes<TTodoListItemElement>(
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
