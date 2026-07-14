import type { Element } from '@platejs/plite';
import type { PlateEditor } from '@platejs/core/react';

export const getListNode = (editor: PlateEditor, node: Element): Element => {
  if (node.listStyleType && node.listStart) {
    const previousNode = editor.read.nodes.previous<Element>({
      at: editor.read.selection()?.focus,
    })?.[0];

    // if previous node is also an indent list, don't need to do additional work
    if (previousNode?.listStyleType && previousNode?.listStart) {
      return node;
    }
    if (node.listStart === 1) return node;

    return {
      ...node,
      listRestartPolite: node.listStart,
    };
  }

  return node;
};
