import { first } from 'slate';

import type { DescendantOf, TNodeEntry } from '../../interfaces';
import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getFirstNode = <N extends DescendantOf<E>, E extends TEditor>(
  editor: E,
  at: At
): TNodeEntry<N> | undefined => {
  try {
    return first(editor as any, getAt(editor, at)!) as any;
  } catch {}
};