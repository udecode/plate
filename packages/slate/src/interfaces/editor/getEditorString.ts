import { string } from 'slate';

import type { At } from '../../types/At';
import type { QueryVoids } from '../../types/index';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils/getAt';

export type GetEditorStringOptions = QueryVoids;

export const getEditorString = (
  editor: TEditor,
  at: At | null | undefined,
  options?: GetEditorStringOptions
) => {
  at = getAt(editor, at);

  if (!at) return '';

  try {
    return string(editor as any, at, options);
  } catch {
    return '';
  }
};
