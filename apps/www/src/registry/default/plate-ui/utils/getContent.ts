import type { PlateEditor } from '@udecode/plate-common/react';

import { AIPlugin } from '@udecode/plate-ai/react';
import { serializeMd, serializeMdNodes } from '@udecode/plate-markdown';
import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';
import {
  type GetNodeEntriesOptions,
  getNodeEntries,
  isBlock,
  isElement,
} from '@udecode/slate';

// If some content has already been generated using it to modify(improve) otherwise using the selection or block selected nodes.
export const getContent = (editor: PlateEditor, aiEditor: PlateEditor) => {
  const aiState = editor.getOptions(AIPlugin).aiState;

  if (aiState === 'done') return serializeAI(aiEditor);
  // Not Sure
  if (
    editor.getOption<BlockSelectionConfig, 'isSelecting', any>(
      BlockSelectionPlugin,
      'isSelecting',
      editor.id
    )
  ) {
    const entries = getBlockSelectedEntries(editor);
    const nodes = Array.from(entries, (entry) => entry[0]);

    return serializeMdNodes(nodes as any);
  }

  const entries = getNodeEntries(editor, {
    match: (n) => isBlock(editor, n),
    mode: 'highest',
  });
  const nodes = Array.from(entries, (entry) => entry[0]);

  return serializeMdNodes(nodes as any);
};

export const serializeAI = (editor: PlateEditor) => {
  return serializeMd(editor as any).trim();
};

export const getBlockSelectedEntries = (
  editor: PlateEditor,
  options?: GetNodeEntriesOptions
) => {
  const ids = editor.getOptions(BlockSelectionPlugin).selectedIds;

  return getNodeEntries(editor, {
    at: [],
    match: (n) => isElement(n) && ids?.has(n.id as string),
    ...options,
  });
};
