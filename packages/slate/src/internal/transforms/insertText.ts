import { insertText as insertTextBase } from 'slate';

import type { Editor, QueryAt, QueryVoids } from '../../interfaces';

import { getAt } from '../../utils/getAt';

export const insertText = (
  editor: Editor,
  text: string,
  options?: QueryAt & QueryVoids
) => {
  insertTextBase(editor as any, text, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
