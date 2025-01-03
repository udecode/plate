import type { Modify } from '@udecode/utils';

import { type EditorBeforeOptions, before } from 'slate';

import type { At, QueryTextUnit, QueryVoids } from '../../types';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

export type GetPointBeforeOptions = Modify<
  EditorBeforeOptions,
  QueryTextUnit & QueryVoids
>;

export const getPointBefore = (
  editor: TEditor,
  at: At,
  options?: GetPointBeforeOptions
) => {
  try {
    return before(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
