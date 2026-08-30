import React from 'react';

import {
  type Editor,
  type EditorReference,
  type PlateContentProps,
  type PlateProps,
  Plate,
  PlateContent,
} from '../../src/react';

type PlateTestProps<E extends EditorReference = Editor> = Omit<
  PlateProps<E>,
  'children' | 'editor'
> & {
  editableProps?: PlateContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
};

export function PlateTest<E extends EditorReference = Editor>({
  editableProps,
  editor,
  variant = 'wordProcessor',
  ...props
}: PlateTestProps<E>) {
  return (
    <Plate {...props} editor={editor}>
      <PlateContent
        data-testid="plite-content-editable"
        data-variant={variant}
        autoFocus
        {...editableProps}
      />
    </Plate>
  );
}
