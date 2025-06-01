import { type TElement, type TText, ElementApi, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { Boundary } from '../types';

const isSoftLeaf = (editor: SlateEditor, node: TElement | TText) => {
  const marks = Object.keys(NodeApi.extractProps(node));

  const keys = ElementApi.isElement(node) ? [node.type] : marks;

  return keys.some((mark) => {
    return editor.meta.pluginKeys.node.isAffinity.some((key) => {
      return (
        editor.getType(key) === mark && !editor.plugins[key].node.isHardEdge
      );
    });
  });
};

export const hasMarkAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: Boundary
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && isSoftLeaf(editor, backwardLeafEntry[0])) ||
    (forwardLeafEntry && isSoftLeaf(editor, forwardLeafEntry[0]))
  );
};
