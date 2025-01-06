import type { Modify } from '@udecode/utils';

import { type EditorPositionsOptions, positions } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { QueryAt } from '../../types';

import { getAt } from '../../utils';

export const getPositions = (
  editor: Editor,
  options?: Modify<EditorPositionsOptions, QueryAt>
) =>
  positions(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
