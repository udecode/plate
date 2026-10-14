import { hasRange as hasSlateRange } from 'slate';

import type { TRange } from '../../interfaces';
import type { Editor } from '../../interfaces/editor';

export const hasRange = (editor: Editor, range: TRange): boolean => {
  try {
    return hasSlateRange(editor as any, range);
  } catch {}

  return false;
};
