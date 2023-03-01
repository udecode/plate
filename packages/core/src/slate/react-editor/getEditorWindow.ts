import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Return the host window of the current editor.
 */
export const getEditorWindow = <V extends Value>(editor: TReactEditor<V>) => {
  try {
    return ReactEditor.getWindow(editor as any);
  } catch (e) {}
};
