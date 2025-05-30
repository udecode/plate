import { type TText, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { MarkBoundary } from '../types';

const isHardEdge = (editor: SlateEditor, node: TText) => {
  return Object.keys(NodeApi.extractProps(node)).some((mark) =>
    editor.meta.pluginKeys.node.isHardEdge.some(
      (key) => editor.getType(key) === mark
    )
  );
};

export const hasHardEdgeAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: MarkBoundary
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && isHardEdge(editor, backwardLeafEntry[0])) ||
    (forwardLeafEntry && isHardEdge(editor, forwardLeafEntry[0]))
  );
};
