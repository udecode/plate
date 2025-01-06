import type { Modify } from '@udecode/utils';
import type { TextDeleteOptions } from 'slate/dist/interfaces/transforms/text';

import { deleteText as deleteTextBase } from 'slate';

import type { Editor } from '../../interfaces';
import type { QueryAt, QueryVoids } from '../../types';

import { getAt } from '../../utils/getAt';

export const deleteText = <E extends Editor>(
  editor: E,
  options?: Modify<TextDeleteOptions, QueryAt & QueryVoids>
) => {
  deleteTextBase(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
