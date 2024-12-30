import { insertText as insertTextBase } from 'slate';

import type { QueryAt, QueryVoids } from '../../types';
import type { TEditor } from '../editor/TEditor';

import { getAt } from '../../utils/getAt';

export const insertText = (
  editor: TEditor,
  text: string,
  options?: QueryAt & QueryVoids
) => {
  insertTextBase(editor as any, text, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
