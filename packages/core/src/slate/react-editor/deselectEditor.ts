import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Deselect the editor.
 */
export const deselectEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.deselect(editor as any);
