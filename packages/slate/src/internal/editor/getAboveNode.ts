import { above } from 'slate';

import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { GetAboveNodeOptions } from '../../interfaces/editor/editor-types';
import type { AncestorOf } from '../../interfaces/node/TAncestor';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils/match';

export const getAboveNode = <
  N extends AncestorOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  try {
    return above(editor as any, getQueryOptions(editor, options)) as any;
  } catch (error) {
    return undefined;
  }
};
