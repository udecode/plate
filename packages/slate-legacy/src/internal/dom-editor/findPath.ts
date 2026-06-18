import { DOMEditor } from 'slate-dom';

import type { Path } from '../../interfaces';
import type { Editor, EditorFindPathOptions } from '../../interfaces/editor';
import type { TNode } from '../../interfaces/node';

export const findPath = (
  editor: Editor,
  node: TNode,
  options?: EditorFindPathOptions
): Path | undefined => {
  const findNodePath = () => {
    const nodeEntry = editor.api.node({
      ...options,
      at: [],
      match: (n) => n === node,
    });

    return nodeEntry?.[1];
  };

  if (options) {
    return findNodePath();
  }

  try {
    return DOMEditor.findPath(editor as any, node);
  } catch {
    return findNodePath();
  }
};
