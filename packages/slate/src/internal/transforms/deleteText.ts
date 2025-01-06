import { deleteText as deleteTextBase } from 'slate';

import type { DeleteTextOptions, Editor } from '../../interfaces';

import { getAt } from '../../utils/getAt';

export const deleteText = <E extends Editor>(
  editor: E,
  options?: DeleteTextOptions
) => {
  deleteTextBase(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
