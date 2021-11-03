import { SPEditor, TNode, WithOverride } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { fixOrders } from './normalizers/fixOrders';
import { normalizeLicStyles } from './normalizers/normalizeLicStyles';
import { normalizeTextStyles } from './normalizers/normalizeTextStyles';

export const withListExtension = (): WithOverride<SPEditor> => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (nodeEntry: NodeEntry) => {
    fixOrders(editor, nodeEntry[1]);
    normalizeTextStyles(editor, nodeEntry as NodeEntry<TNode>);
    normalizeLicStyles(editor, nodeEntry as NodeEntry<TNode>);

    normalizeNode(nodeEntry);
  };

  return editor;
};
