import { Editor } from 'slate';

import type { MarksOf } from '../text/TText';
import type { TEditor } from './TEditor';

/** Get the marks that would be added to text at the current selection. */
export const getMarks = <E extends TEditor>(editor: E) =>
  Editor.marks(editor as any) as MarksOf<E> | null;
