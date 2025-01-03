import type { Modify } from '@udecode/utils';

import { type EditorPositionsOptions, positions } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { QueryAt } from '../../types';

import { getAt } from '../../utils';

export const getPositions = (
  editor: TEditor,
  options?: Modify<EditorPositionsOptions, QueryAt>
) =>
  positions(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
