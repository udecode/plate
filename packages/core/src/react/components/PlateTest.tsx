import React from 'react';

import {
  type CreatePlateEditorRuntimeOptions,
  createPlateEditor,
} from '../editor';
import { type PlateProps, type PlateRootEditor, Plate } from './Plate';
import { type PlateContentProps, PlateContent } from './PlateContent';

type PlateTestProps<E extends PlateRootEditor = PlateRootEditor> = Omit<
  PlateProps<E>,
  'editor'
> &
  CreatePlateEditorRuntimeOptions & {
    editableProps?: PlateContentProps;
    editor?: E | null;
    variant?: 'comment' | 'wordProcessor';
  };

export function PlateTest<E extends PlateRootEditor = PlateRootEditor>({
  editableProps,
  shouldNormalizeEditor,
  variant = 'wordProcessor',
  ...props
}: PlateTestProps<E>) {
  const { editor: providedEditor, ...editorOptions } = props;
  const editor =
    providedEditor ??
    (createPlateEditor({
      ...editorOptions,
      shouldNormalizeEditor,
    }) as unknown as E);

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
