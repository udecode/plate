import { SPEditor, WithOverride } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export const withSingleLine = (): WithOverride<ReactEditor & SPEditor> => (
  editor
) => {
  const { normalizeNode } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = (entry) => {
    if (editor.children.length > 1) {
      Transforms.removeNodes(editor, {
        at: [],
        mode: 'highest',
        match: (node, path) => path[0] > 0,
      });
    }
    normalizeNode(entry);
  };

  return editor;
};
