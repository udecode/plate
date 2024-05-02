import { findNodePath, useEditorRef } from '@udecode/plate-common';
import { setNodes } from '@udecode/plate-common/server';
import { useReadOnly } from 'slate-react';

import type { TTodoListItemElement } from '../index';

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
    editor,
    element,
    readOnly,
  };
};

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
) => {
  const { checked, element, readOnly } = state;
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
