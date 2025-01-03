import { last } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getLastNode = <N extends DescendantOf<E>, E extends TEditor>(
  editor: E,
  at: At
): N | undefined => {
  try {
    return last(editor as any, getAt(editor, at)!) as any;
  } catch {}
};
