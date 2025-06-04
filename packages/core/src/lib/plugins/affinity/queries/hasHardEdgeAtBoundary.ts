import { type TElement, type TText, ElementApi, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

const isHardEdge = (editor: SlateEditor, node: TElement | TText) => {
  const marks = Object.keys(NodeApi.extractProps(node));

  const keys = ElementApi.isElement(node) ? [node.type] : marks;

  return keys.some((mark) =>
    editor.meta.pluginKeys.node.isHardEdge.some(
      (key) =>
        editor.getType(key) === mark && !editor.plugins[key].node.clearOnEdge
    )
  );
};

export const hasHardEdgeAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: EdgeNodes
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && isHardEdge(editor, backwardLeafEntry[0])) ||
    (forwardLeafEntry && isHardEdge(editor, forwardLeafEntry[0]))
  );
};
