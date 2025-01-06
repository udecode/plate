import type { FindPathOptions, Editor, TNode } from '../../interfaces';

export const findNodePath = <E extends Editor = Editor>(
  editor: E,
  node: TNode,
  options: FindPathOptions = {}
) => {
  const nodeEntry = editor.api.find({
    ...options,
    at: [],
    match: (n) => n === node,
  });

  return nodeEntry?.[1];
};
