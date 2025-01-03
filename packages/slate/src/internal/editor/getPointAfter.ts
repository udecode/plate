import type { Modify } from '@udecode/utils';

import { type EditorAfterOptions, after } from 'slate';

import type { At, QueryTextUnit, QueryVoids } from '../../types';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

export type GetPointAfterOptions = Modify<
  EditorAfterOptions,
  QueryTextUnit & QueryVoids
>;

export const getPointAfter = (
  editor: TEditor,
  at: At,
  options?: GetPointAfterOptions
) => {
  try {
    return after(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
