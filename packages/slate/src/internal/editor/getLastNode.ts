import { last } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getLastNode = <N extends DescendantOf<E>, E extends Editor>(
  editor: E,
  at: At
): N | undefined => {
  try {
    return last(editor as any, getAt(editor, at)!) as any;
  } catch {}
};
