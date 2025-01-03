import { first } from 'slate';

import type { At } from '../../types';
import type { NodeEntryOf } from '../../interfaces/node/TNodeEntry';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

export const getFirstNode = <E extends TEditor>(
  editor: E,
  at: At
): NodeEntryOf<E> | undefined => {
  try {
    return first(editor as any, getAt(editor, at)!) as any;
  } catch {}
};
