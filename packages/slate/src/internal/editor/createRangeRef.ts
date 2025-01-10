import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { rangeRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TRange } from '../../interfaces/range';

export const createRangeRef = (
  editor: Editor,
  range: TRange,
  options?: EditorRangeRefOptions
) => rangeRef(editor as any, range, options as any);
