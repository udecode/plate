import type { TElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export const getListNode = (editor: PlateEditor, node: TElement): TElement => {
  if (node.listStyleType && node.listStart) {
    const previousNode = editor.api.previous({
      at: editor.selection?.focus,
    })?.[0];

    // if previous node is also an indent list, don't need to do additional work
    if (previousNode?.listStyleType && previousNode?.listStart) {
      return node;
    } else {
      if (node.listStart === 1) return node;

      return {
        ...node,
        listRestartPolite: node.listStart,
      };
    }
  }

  return node;
};
