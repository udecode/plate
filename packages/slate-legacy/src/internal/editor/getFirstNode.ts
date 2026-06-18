import { first } from 'slate';

import type { DescendantOf, NodeEntry } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getFirstNode = <N extends DescendantOf<E>, E extends Editor>(
  editor: E,
  at: At
): NodeEntry<N> | undefined => {
  try {
    return first(editor as any, getAt(editor, at)!) as any;
  } catch {}
};
