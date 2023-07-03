import { Editor } from 'slate';

import { EMarks } from '../text/TText';
import { TEditor, Value } from './TEditor';

/**
 * Get the marks that would be added to text at the current selection.
 */
export const getMarks = <V extends Value>(editor: TEditor<V>) =>
  Editor.marks(editor as any) as EMarks<V> | null;
