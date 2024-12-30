import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { type Range, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const createRangeRef = (
  editor: TEditor,
  range: Range,
  options?: EditorRangeRefOptions
) => Editor.rangeRef(editor as any, range, options as any);
