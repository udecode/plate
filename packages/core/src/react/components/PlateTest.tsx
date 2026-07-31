import React from 'react';

import type { Editor, Value } from '@platejs/plite';

import { hasPlateRuntime } from '../../internal/plugin/compilePlateModel';
import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  type PlateEditor,
  createPlateEditor,
} from '../editor';
import { type PlateProps, Plate } from './Plate';
import { type PlateContentProps, PlateContent } from './PlateContent';

type PlateTestEditorOptions = CreatePlateEditorOptions<
  Value,
  readonly PlateCorePlugin[]
>;

type PlateTestProps = Omit<PlateProps, 'children' | 'editor'> &
  Omit<PlateTestEditorOptions, 'editor' | 'schemaIdentity'> & {
    children?: React.ReactNode;
    editableProps?: PlateContentProps;
    variant?: 'comment' | 'wordProcessor';
  } & (
    | {
        editor: PlateEditor;
        schemaIdentity?: never;
      }
    | {
        editor?: Editor<Value> | null;
        schemaIdentity: PlateTestEditorOptions['schemaIdentity'];
      }
  );

const isPlateEditor = (editor: Editor | PlateEditor): editor is PlateEditor =>
  hasPlateRuntime(editor);

export function PlateTest({
  children: _children,
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: PlateTestProps) {
  const { editor: providedEditor, schemaIdentity, ...editorOptions } = props;
  let editor: PlateEditor;

  if (providedEditor && isPlateEditor(providedEditor)) {
    editor = providedEditor;
  } else {
    if (!schemaIdentity) {
      throw new TypeError(
        'PlateTest requires schemaIdentity to create an editor'
      );
    }

    editor = createPlateEditor({
      ...editorOptions,
      editor: providedEditor ?? undefined,
      schemaIdentity,
      shouldNormalizeEditor,
    });
  }

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
