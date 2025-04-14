import type { ExtendEditor, SlateEditor } from '@udecode/plate';

import * as Y from 'yjs';

import type { YjsConfig } from './providers/types';

import { type PlateYjsEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { withTYjs } from './withTYjs';

export const withPlateYjs: ExtendEditor<YjsConfig> = ({
  editor: e,
  getOptions,
}) => {
  const editor = e as unknown as PlateYjsEditorProps & SlateEditor;

  // not reactive
  const { cursorOptions, disableCursors, sharedAwareness, ydoc, yjsOptions } =
    getOptions();

  // Make sure we have a document and a provider
  if (!ydoc) {
    console.warn('Yjs plugin: No Y.Doc available');
    return editor;
  }

  // Get the shared document type from the Y.Doc
  const sharedType = ydoc.get('content', Y.XmlText) as Y.XmlText;
  // console.log('disableCursors', disableCursors);
  // console.log('sharedAwareness', sharedAwareness);

  // Apply YJS transformations to the editor
  if (disableCursors) {
    return withTYHistory(
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      })
    );
  }

  // Apply YJS with cursor support
  // Use the shared awareness instance for cursors instead of relying on a primary provider
  if (!sharedAwareness) {
    throw new Error('Yjs plugin: No shared awareness instance provided');
  }
  return withTYHistory(
    withTCursors(
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      }),
      sharedAwareness,
      cursorOptions
    )
  );
};
