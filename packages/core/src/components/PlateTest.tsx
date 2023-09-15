import React from 'react';
import { Value } from '@udecode/slate';

import { createPlateEditor } from '../utils/createPlateEditor';
import { Editor, EditorProps } from './Editor';
import { Plate, PlateProps } from './Plate';

export function PlateTest<V extends Value>({
  variant = 'wordProcessor',
  normalizeInitialValue,
  editorProps,
  ...props
}: {
  variant?: 'comment' | 'wordProcessor';
  editorProps?: EditorProps;
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
      <Editor
        data-variant={variant}
        data-testid="slate-content-editable"
        autoFocus
        {...editorProps}
      />
    </Plate>
  );
}
