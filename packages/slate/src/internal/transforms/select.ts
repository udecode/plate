import { select as selectBase } from 'slate';

import type { Editor } from '../../interfaces';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const select = (editor: Editor, target: At) => {
  const at = getAt(editor, target);

  if (!at) return;

  selectBase(editor as any, at);
};
