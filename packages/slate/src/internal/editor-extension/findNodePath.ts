import type { Editor, EditorFindPathOptions, TNode } from '../../interfaces';

export const findNodePath = <E extends Editor = Editor>(
  editor: E,
  node: TNode,
  options: EditorFindPathOptions = {}
) => {
  const nodeEntry = editor.api.find({
    ...options,
    at: [],
    match: (n) => n === node,
  });

  return nodeEntry?.[1];
};
