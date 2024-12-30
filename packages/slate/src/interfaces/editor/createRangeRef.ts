import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { type Range, rangeRef } from 'slate';

import type { TEditor } from './TEditor';

export const createRangeRef = (
  editor: TEditor,
  range: Range,
  options?: EditorRangeRefOptions
) => rangeRef(editor as any, range, options as any);
