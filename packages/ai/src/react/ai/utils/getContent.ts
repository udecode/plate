import type { PlateEditor } from '@udecode/plate-common/react';

import { getNodeEntries, isBlock } from '@udecode/plate-common';
import { serializeMd, serializeMdNodes } from '@udecode/plate-markdown';
import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';

import { AIPlugin } from '../AIPlugin';

// If some content has already been generated using it to modify(improve) otherwise using the selection or block selected nodes.
export const getContent = (editor: PlateEditor, aiEditor: PlateEditor) => {
  const aiState = editor.getOptions(AIPlugin).aiState;

  if (aiState === 'done') return serializeMd(aiEditor);
  // Not Sure
  if (
    editor.getOption<BlockSelectionConfig, 'isSelecting', any>(
      BlockSelectionPlugin,
      'isSelecting',
      editor.id
    )
  ) {
    const entries = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getSelectedBlocks();

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
