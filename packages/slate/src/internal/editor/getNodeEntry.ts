import { node } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor';
import type { GetNodeEntryOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getNodeEntry = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  at: At,
  options?: GetNodeEntryOptions
): TNodeEntry<N> | undefined => {
  try {
    return node(editor as any, getAt(editor, at)!, options) as any;
  } catch (error) {}
};
