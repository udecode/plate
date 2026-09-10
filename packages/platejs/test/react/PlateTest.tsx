import React from 'react';

import {
  type Editor,
  type PlateContentProps,
  type PlateProps,
  Plate,
  PlateContent,
} from '../../src/react';
import type { EditorReference } from '../../src/react/editor/Editor';

export function PlateTest<E extends EditorReference = Editor>({
  editableProps,
  editor,
  variant = 'wordProcessor',
  ...props
}: Omit<PlateProps<E>, 'children' | 'editor'> & {
  editableProps?: PlateContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
}) {
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
