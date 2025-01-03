import { marks } from 'slate';

import type { MarksOf } from '../../interfaces/text/TText';
import type { TEditor } from '../../interfaces/editor/TEditor';

export const getMarks = <E extends TEditor>(editor: E) =>
  marks(editor as any) as MarksOf<E> | null;
