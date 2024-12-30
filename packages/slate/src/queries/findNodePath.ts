import type { TEditor, TNode, Value } from '../interfaces';

import { type FindNodeOptions, findNode } from './findNode';

export type FindPathOptions = Omit<
  FindNodeOptions<Value>,
  'at' | 'block' | 'match'
>;

export const findNodePath = <E extends TEditor = TEditor>(
  editor: E,
  node: TNode,
  options: FindPathOptions = {}
) => {
  const nodeEntry = findNode(editor, {
    ...options,
    at: [],
    match: (n) => n === node,
  });

  return nodeEntry?.[1];
};
