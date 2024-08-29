import React from 'react';

import { type CreatePlateEditorOptions, createPlateEditor } from '../editor';
import { Plate, type PlateProps } from './Plate';
import { PlateContent, type PlateContentProps } from './PlateContent';

export function PlateTest({
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: {
  editableProps?: PlateContentProps;
  variant?: 'comment' | 'wordProcessor';
} & CreatePlateEditorOptions &
  PlateProps) {
  const { editor: _editor, id, plugins } = props;

  let editor = _editor;

  if (editor && !editor.pluginList) {
    editor = createPlateEditor({
      editor,
      id,
      plugins,
      shouldNormalizeEditor,
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
