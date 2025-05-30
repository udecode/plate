import { type TText, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { MarkBoundary } from '../types';

const isSoftLeaf = (editor: SlateEditor, node: TText) =>
  Object.keys(NodeApi.extractProps(node)).some((mark) =>
    editor.meta.pluginKeys.node.isLeaf.some(
      (key) =>
        editor.getType(key) === mark && !editor.plugins[key].node.isHardEdge
    )
  );

export const hasMarkAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: MarkBoundary
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && isSoftLeaf(editor, backwardLeafEntry[0])) ||
    (forwardLeafEntry && isSoftLeaf(editor, forwardLeafEntry[0]))
  );
};
