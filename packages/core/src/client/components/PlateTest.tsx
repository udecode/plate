import React from 'react';

import type { Value } from '@udecode/slate';

import { createPlateEditor } from '../utils/createPlateEditor';
import { Plate, type PlateProps } from './Plate';
import { PlateContent, type PlateContentProps } from './PlateContent';

export function PlateTest<V extends Value>({
  editableProps,
  normalizeInitialValue,
  variant = 'wordProcessor',
  ...props
}: {
  editableProps?: PlateContentProps;
  variant?: 'comment' | 'wordProcessor';
} & PlateProps<V>) {
  const { editor: _editor, id, plugins } = props;

  let editor = _editor;

  if (editor && !editor.plugins) {
    editor = createPlateEditor({
      editor,
      id,
      normalizeInitialValue,
      plugins,
    });
  }

  return (
    <Plate {...props} editor={editor}>
      <PlateContent
        autoFocus
        data-testid="slate-content-editable"
        data-variant={variant}
        {...editableProps}
      />
    </Plate>
  );
}
