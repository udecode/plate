import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find the DOM node that implements DocumentOrShadowRoot for the editor. */
export const findEditorDocumentOrShadowRoot = (editor: TReactEditor) => {
  try {
    return ReactEditor.findDocumentOrShadowRoot(editor as any);
  } catch (error) {}
};
