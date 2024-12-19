import type { TEditor, TNode } from '../interfaces';

import { getQueryOptions } from '../utils';
import { type FindNodeOptions, findNode } from './findNode';

export const findNodePath = <E extends TEditor = TEditor>(
  editor: E,
  node: TNode,
  options: FindNodeOptions<E> = {}
) => {
  const { match } = getQueryOptions(editor, options);

  const nodeEntry = findNode(editor, {
    at: [],
    match: (n) => n === node && (!match || match(n)),
    ...options,
  });

  return nodeEntry?.[1];
};
