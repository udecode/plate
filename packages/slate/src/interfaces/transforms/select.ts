import { Transforms } from 'slate';

import type { At } from '../../types/At';
import type { TEditor } from '../editor/TEditor';

import { getAt } from '../../utils/getAt';

export const select = (editor: TEditor, target: At) => {
  const at = getAt(editor, target);

  if (!at) return;

  Transforms.select(editor as any, at);
};
