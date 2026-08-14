import React from 'react';

import type { Editor, Value } from '@platejs/plite';

import { hasPlateRuntime } from '../../internal/plugin/compilePlateModel';
import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  type PlateEditor,
  type PlateEditorReference,
  createPlateEditor,
} from '../editor';
import { type PlateProps, Plate } from './Plate';
import { type PlateContentProps, PlateContent } from './PlateContent';

type PlateTestEditorOptions = CreatePlateEditorOptions<
  readonly PlateCorePlugin[]
>;

type PlateTestBaseProps = Omit<PlateProps, 'children' | 'editor'> &
  Omit<PlateTestEditorOptions, 'editor' | 'schema'> & {
    children?: React.ReactNode;
    editableProps?: PlateContentProps;
    variant?: 'comment' | 'wordProcessor';
  };

type PlateTestRawEditorProps<
  V extends Value,
  TExtensions extends readonly unknown[],
> = PlateTestBaseProps & {
  editor?: Editor<V, TExtensions> | null;
  schema: NonNullable<PlateTestEditorOptions['schema']> & {
    id: string;
    version: number;
  };
};

type PlateTestPlateEditorProps<E extends PlateEditorReference> =
  PlateTestBaseProps & {
    editor: E;
    schema?: never;
  };

type PlateTestImplementationProps = PlateTestBaseProps & {
  editor?: Editor | PlateEditor | null;
  schema?: PlateTestEditorOptions['schema'];
};

const isPlateEditor = (editor: Editor | PlateEditor): editor is PlateEditor =>
  hasPlateRuntime(editor);

export function PlateTest<
  V extends Value,
  TExtensions extends readonly unknown[],
>(props: PlateTestRawEditorProps<V, TExtensions>): React.ReactElement;
export function PlateTest<E extends PlateEditorReference = PlateEditor>(
  props: PlateTestPlateEditorProps<E>
): React.ReactElement;
export function PlateTest({
  children: _children,
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: PlateTestImplementationProps) {
  const { editor: providedEditor, schema, ...editorOptions } = props;
  let editor: PlateEditor;

  if (providedEditor && isPlateEditor(providedEditor)) {
    editor = providedEditor;
  } else {
    if (!schema?.id || typeof schema.version !== 'number') {
      throw new TypeError(
        'PlateTest requires schema lineage to create an editor'
      );
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
