import {
  type Editor,
  type PlateContentProps,
  type PlateProps,
  Plate,
  PlateContent,
} from 'platejs/react';
import React from 'react';

export type PlateTestProps<E extends Editor = Editor> = Omit<
  PlateProps<E>,
  'children' | 'editor'
> & {
  editableProps?: PlateContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
};

export function PlateTest<E extends Editor = Editor>({
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
