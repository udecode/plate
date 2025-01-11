import { positions } from 'slate';

import type { EditorPositionsOptions } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';

import { getAt } from '../../utils';

export const getPositions = (
  editor: Editor,
  options?: EditorPositionsOptions
) =>
  positions(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
