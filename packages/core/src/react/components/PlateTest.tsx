import React from 'react';

import { type CreatePlateEditorOptions, createPlateEditor } from '../editor';
import { type PlateProps, Plate } from './Plate';
import { type PlateContentProps, PlateContent } from './PlateContent';

export function PlateTest({
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: CreatePlateEditorOptions &
  PlateProps & {
    editableProps?: PlateContentProps;
    variant?: 'comment' | 'wordProcessor';
  }) {
  const { id, editor: _editor, plugins } = props;

  let editor = _editor;

  if (editor && !editor.pluginList) {
    editor = createPlateEditor({
      id,
      editor,
      plugins,
      shouldNormalizeEditor,
    });
  }

  return (
    <Plate {...props} editor={editor}>
      <PlateContent
        data-testid="slate-content-editable"
        data-variant={variant}
        autoFocus
        {...editableProps}
      />
    </Plate>
  );
}
