import { select as selectBase } from 'slate';

import type { At } from '../../types/At';
import type { TEditor } from '../../interfaces';

import { getAt } from '../../utils/getAt';

export const select = (editor: TEditor, target: At) => {
  const at = getAt(editor, target);

  if (!at) return;

  selectBase(editor as any, at);
};
