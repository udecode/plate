import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EMarks } from '../types/TText';

/**
 * Get the marks that would be added to text at the current selection.
 */
export const getMarks = <V extends Value>(editor: TEditor<V>) =>
  Editor.marks(editor as any) as Partial<EMarks<V>> | null;
