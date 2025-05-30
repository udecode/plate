import { type NodeEntry, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { MarkBoundary } from '../types';

const hasHardEdgeProperty = (editor: SlateEditor, entry: NodeEntry) =>
  Object.keys(NodeApi.extractProps(entry[0])).some((key) =>
    editor.pluginList.some(
      (plugin) => plugin.key === key && plugin.node.isHardEdge
    )
  );

export const hasHardEdgeAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: MarkBoundary
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && hasHardEdgeProperty(editor, backwardLeafEntry)) ||
    (forwardLeafEntry && hasHardEdgeProperty(editor, forwardLeafEntry))
  );
};
