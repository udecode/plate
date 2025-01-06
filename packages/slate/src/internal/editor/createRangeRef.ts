import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { type Range, rangeRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const createRangeRef = (
  editor: Editor,
  range: Range,
  options?: EditorRangeRefOptions
) => rangeRef(editor as any, range, options as any);
