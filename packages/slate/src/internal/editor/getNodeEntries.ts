import { nodes } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { GetNodeEntriesOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils/match';

export const getNodeEntries = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: GetNodeEntriesOptions<ValueOf<E>>
): Generator<TNodeEntry<N>, void, undefined> => {
  options = getQueryOptions(editor, options);

  // if (options?.at) {
  //   editor.api.unhangRange(options.at as any, options);
  // }

  return nodes(editor as any, options as any) as any;
};
