import React from 'react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { createPlateEditor } from '../../utils/plate/createPlateEditor';
import { Plate, PlateProps } from './Plate';

export const PlateTest = <V extends Value>({
  variant = 'wordProcessor',
  editableProps,
  normalizeInitialValue,
  ...props
}: {
  variant?: 'comment' | 'wordProcessor';
} & PlateProps<V>) => {
  const { editor: _editor, id, plugins } = props;

  let editor = _editor;

  if (editor && !editor.plugins) {
    editor = createPlateEditor({
      editor,
      plugins,
      id,
      normalizeInitialValue,
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
