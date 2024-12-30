import { Editor } from 'slate';

import type { MarksOf } from '../text/TText';
import type { TEditor } from './TEditor';

export const getMarks = <E extends TEditor>(editor: E) =>
  Editor.marks(editor as any) as MarksOf<E> | null;
