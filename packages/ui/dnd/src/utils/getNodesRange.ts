import { TEditor } from '@udecode/plate-core';
import { Editor, NodeEntry } from 'slate';

/**
 * Get node entries range.
 */
export const getNodesRange = (editor: TEditor, nodeEntries: NodeEntry[]) => {
  if (!nodeEntries.length) return;

  const firstBlockPath = nodeEntries[0][1];
  const lastBlockPath = nodeEntries[nodeEntries.length - 1][1];

  return Editor.range(editor, firstBlockPath, lastBlockPath);
};
