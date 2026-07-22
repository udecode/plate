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

type PlateTestEditorOptions = CreatePlateEditorOptions<
  Value,
  readonly PlateCorePlugin[]
>;

type PlateTestProps = Omit<PlateProps, 'children' | 'editor'> &
  Omit<PlateTestEditorOptions, 'editor' | 'schema'> & {
    children?: React.ReactNode;
    editableProps?: PlateContentProps;
    variant?: 'comment' | 'wordProcessor';
  } & (
    | {
        editor: PlateEditor;
        schema?: never;
      }
    | {
        editor?: Editor<Value> | null;
        schema: PlateTestEditorOptions['schema'];
      }
  );

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
  const { editor: providedEditor, schema, ...editorOptions } = props;
  let editor: PlateEditor;

  if (providedEditor && isPlateEditor(providedEditor)) {
    editor = providedEditor;
  } else {
    if (!schema) {
      throw new TypeError('PlateTest requires a schema to create an editor');
    }

    editor = createPlateEditor({
      ...editorOptions,
      editor: providedEditor ?? undefined,
      schema,
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
