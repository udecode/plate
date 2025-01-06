import { nodes } from 'slate';

import type { DescendantOf, EditorNodesOptions } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getQueryOptions } from '../../utils/match';

export const getNodeEntries = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: EditorNodesOptions<ValueOf<E>>
): Generator<NodeEntry<N>, void, undefined> => {
  options = getQueryOptions(editor, options);

  // if (options?.at) {
  //   editor.api.unhangRange(options.at as any, options);
  // }

  return nodes(editor as any, options as any) as any;
};
