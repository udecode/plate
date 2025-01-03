import { above } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { GetAboveNodeOptions } from '../../interfaces/editor/editor-types';
import type { AncestorOf } from '../../interfaces/node/TAncestor';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils/match';

export const getAboveNode = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  return above(editor as any, getQueryOptions(editor, options)) as any;
};
