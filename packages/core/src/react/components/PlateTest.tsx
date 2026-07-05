import React from 'react';

import type { Editor, Value } from '@platejs/plite';

import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  type PlateEditor,
  createPlateEditor,
} from '../editor';
import { type PlateProps, Plate } from './Plate';
import { type PlateContentProps, PlateContent } from './PlateContent';

type PlateTestProps = Omit<PlateProps, 'children' | 'editor'> &
  Omit<
    CreatePlateEditorOptions<Value, readonly PlateCorePlugin[]>,
    'editor'
  > & {
    children?: React.ReactNode;
    editableProps?: PlateContentProps;
    editor?: Editor<Value> | PlateEditor | null;
    variant?: 'comment' | 'wordProcessor';
  };

const isPlateEditor = (editor: Editor | PlateEditor): editor is PlateEditor =>
  'runtime' in editor &&
  typeof editor.runtime === 'object' &&
  editor.runtime !== null &&
  'pluginList' in editor.runtime;

export function PlateTest({
  children: _children,
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: PlateTestProps) {
  const { editor: providedEditor, ...editorOptions } = props;
  const editor: PlateEditor =
    providedEditor && isPlateEditor(providedEditor)
      ? providedEditor
      : createPlateEditor({
          ...editorOptions,
          editor: providedEditor ?? undefined,
          shouldNormalizeEditor,
        });

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
