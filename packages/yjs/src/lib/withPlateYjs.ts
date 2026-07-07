import type { ExtendEditor, SlateEditor } from 'platejs';

import * as Y from 'yjs';

import type { YjsConfig } from './providers/types';

import { type PlateYjsEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { type YjsEditorProps, withTYjs } from './withTYjs';

export const withPlateYjs: ExtendEditor<YjsConfig> = ({
  editor: e,
  getOptions,
}) => {
  let editor = e as unknown as PlateYjsEditorProps &
    SlateEditor &
    YjsEditorProps;

  const {
    awareness,
    cursors,
    localOrigin,
    positionStorageOrigin,
    sharedType: customSharedType,
    ydoc,
  } = getOptions();

  // Use custom shared type if provided, otherwise get the default from Y.Doc
  const sharedType =
    customSharedType ?? (ydoc!.get('content', Y.XmlText) as Y.XmlText);

  // Apply core Yjs binding first
  editor = withTYjs(editor, sharedType, {
    autoConnect: false,
    localOrigin,
    positionStorageOrigin,
  }) as any;

  // Apply YJS transformations to the editor
  // Conditionally apply cursor support based on cursors
  if (cursors) {
    // Use the shared awareness instance for cursors
    if (awareness) {
      let autoSend = true;

      if (cursors.autoSend === false) {
        autoSend = false;
      }

      editor = withTCursors(editor, awareness, {
        ...cursors,
        autoSend,
      });
    } else {
      // This also shouldn't happen if BaseYjsPlugin ran correctly
      editor.api.debug.error(
        'Yjs plugin: Internal shared awareness (awareness) is missing but cursors are enabled.'
      );
    }
  }

  // Apply history last
  return withTYHistory(editor);
};
