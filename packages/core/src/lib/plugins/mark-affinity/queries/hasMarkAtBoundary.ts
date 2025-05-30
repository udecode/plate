import { type NodeEntry, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { MarkBoundary } from '../types';
const hasMarkProperties = (editor: SlateEditor, entry: NodeEntry) =>
  Object.keys(NodeApi.extractProps(entry[0])).some((key) =>
    editor.pluginList.some(
      (plugin) =>
        plugin.key === key && plugin.node.isLeaf && !plugin.node.isHardEdge
    )
  );

export const hasMarkAtBoundary = (
  editor: SlateEditor,
  beforeMarkBoundary: MarkBoundary
) => {
  const [backwardLeafEntry, forwardLeafEntry] = beforeMarkBoundary;

  return (
    (backwardLeafEntry && hasMarkProperties(editor, backwardLeafEntry)) ||
    (forwardLeafEntry && hasMarkProperties(editor, forwardLeafEntry))
  );
};
