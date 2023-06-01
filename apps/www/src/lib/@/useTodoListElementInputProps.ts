import { PlateEditor } from '@udecode/plate';
import { findNodePath, setNodes } from '@udecode/plate-common';
import { TTodoListItemElement } from '@udecode/plate-list';
import { useReadOnly } from 'slate-react';

export const useTodoListElementInputProps = ({
  element,
  editor,
}: {
  element: TTodoListItemElement;
  editor: PlateEditor;
}) => {
  const { checked } = element;

  const readOnly = useReadOnly();

  return {
    checked: !!checked,
    onChange: (e) => {
      if (readOnly) return;
      const path = findNodePath(editor, element);
      if (!path) return;

      setNodes<TTodoListItemElement>(
        editor,
        { checked: e.target.checked },
        {
          at: path,
        }
      );
    },
  };
};
