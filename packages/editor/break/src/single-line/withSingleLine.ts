import { removeNodes, WithOverride } from '@udecode/plate-core';

export const withSingleLine: WithOverride = (editor) => {
  const { normalizeNode } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = (entry) => {
    if (editor.children.length > 1) {
      removeNodes(editor, {
        at: [],
        mode: 'highest',
        match: (node, path) => path[0] > 0,
      });
    }
    normalizeNode(entry);
  };

  return editor;
};
