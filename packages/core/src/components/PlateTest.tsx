import React from 'react';
import { createPlateEditor } from '../utils/createPlateEditor';
import { Plate, PlateProps } from './Plate';

export const PlateTest = ({
  variant = 'wordProcessor',
  editableProps,
  ...props
}: {
  variant?: 'comment' | 'wordProcessor';
} & PlateProps) => {
  const { editor: _editor, id, plugins } = props;

  let editor = _editor;

  if (editor && !editor.plugins) {
    editor = createPlateEditor({
      editor,
      plugins,
      id,
    });
  }

  return (
    <Plate
      {...props}
      editor={editor}
      editableProps={
        {
          'data-variant': variant,
          'data-testid': 'slate-content-editable',
          autoFocus: true,
          ...editableProps,
        } as any
      }
    />
  );
};
