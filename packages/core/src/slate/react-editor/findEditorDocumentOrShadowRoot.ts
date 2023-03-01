import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Find the DOM node that implements DocumentOrShadowRoot for the editor.
 */
export const findEditorDocumentOrShadowRoot = <V extends Value>(
  editor: TReactEditor<V>
) => {
  try {
    return ReactEditor.findDocumentOrShadowRoot(editor as any);
  } catch (e) {}
};
