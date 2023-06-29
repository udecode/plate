import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Find the DOM node that implements DocumentOrShadowRoot for the editor.
 */
export const findEditorDocumentOrShadowRoot = <V extends Value>(
  editor: TReactEditor<V>
) => {
  try {
    return ReactEditor.findDocumentOrShadowRoot(editor as any);
  } catch (error) {}
};
