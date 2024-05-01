import React from 'react';
import { Value } from '@udecode/slate';

import { createPlateEditor } from '../utils/createPlateEditor';
import { Plate, PlateProps } from './Plate';
import { PlateContent, PlateContentProps } from './PlateContent';

export function PlateTest<V extends Value>({
  variant = 'wordProcessor',
  normalizeInitialValue,
  editableProps,
  ...props
}: {
  variant?: 'comment' | 'wordProcessor';
  editableProps?: PlateContentProps;
} & PlateProps<V>) {
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
    <Plate {...props} editor={editor}>
      <PlateContent
        data-variant={variant}
        data-testid="slate-content-editable"
        autoFocus
        {...editableProps}
      />
    </Plate>
  );
}
