import { marks } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { MarksOf } from '../../interfaces/text/TText';

export const getMarks = <E extends TEditor>(editor: E) =>
  marks(editor as any) as MarksOf<E> | null;
