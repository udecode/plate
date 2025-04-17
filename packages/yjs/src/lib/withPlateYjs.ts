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

  // Get all relevant options
  const { _awareness, cursorOptions, ydoc, yjsOptions } = getOptions();

  // Make sure we have a document and a provider
  if (!ydoc) {
    // This shouldn't happen if BaseYjsPlugin ran correctly
    editor.api.debug.error('Yjs plugin: Y.Doc (ydoc) is missing.');
    return editor;
  }

  // Get the shared document type from the Y.Doc
  const sharedType = ydoc.get('content', Y.XmlText) as Y.XmlText;

  // Apply core Yjs binding first
  let intermediateEditor = withTYjs(editor, sharedType, {
    autoConnect: false, // Providers are connected manually by BaseYjsPlugin logic
    ...yjsOptions,
  });

  // Apply YJS transformations to the editor
  // Conditionally apply cursor support based on cursorOptions
  if (cursorOptions) {
    // Use the shared awareness instance for cursors
    if (_awareness) {
      let autoSend = true;

      if (cursorOptions.autoSend === false) {
        autoSend = false;
      }

      intermediateEditor = withTCursors(intermediateEditor, _awareness, {
        ...cursorOptions,
        autoSend,
      });
    } else {
      // This also shouldn't happen if BaseYjsPlugin ran correctly
      editor.api.debug.error(
        'Yjs plugin: Internal shared awareness (_awareness) is missing but cursors are enabled.'
      );
    }
  }

  // Apply history last
  const finalEditor = withTYHistory(intermediateEditor);

  return finalEditor;
};
