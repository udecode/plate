import type { PlateEditor } from '@platejs/core/react';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { PathApi } from '@platejs/plite';
import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import type { AIChatPluginConfig } from '../AIChatPlugin';
import { acceptAISuggestions } from '../utils';
import { createFormattedBlocks } from './replaceSelectionAIChat';

export const insertBelowAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  const aiChat = getEditorPlugin<AIChatPluginConfig>(editor, {
    key: KEYS.aiChat,
  });
  const { toolName } = aiChat.getOptions();

  if (toolName === 'generate')
    return insertBelowGenerate(editor, sourceEditor, { format });

  const blockSelection = editor.plugin(BlockSelectionPlugin);
  const selectedBlocks = blockSelection.api.getNodes({});
  const selectedIds = blockSelection.getOption('selectedIds');
  const nodes = cloneDeep(selectedBlocks.map(([node]) => node));

  editor.plugin(BaseAIPlugin).api.undo();

  if (!selectedIds || selectedIds.size === 0) return;

  const lastBlock = blockSelection.api.getNodes({}).at(-1);

  if (!lastBlock) return;

  const nextPath = PathApi.next(lastBlock[1]);

  blockSelection.update.insertBlocksAndSelect(nodes, {
    at: nextPath,
  });
  acceptAISuggestions(editor);

  aiChat.api.hide({ focus: false });
};

export const insertBelowGenerate = (
  editor: PlateEditor,
  sourceEditor: PlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  const aiChat = getEditorPlugin<AIChatPluginConfig>(editor, {
    key: KEYS.aiChat,
  });
  const sourceChildren = [...sourceEditor.read.children()];

  if (
    sourceChildren.length === 0 ||
    sourceChildren.every((node) => sourceEditor.read.nodes.isEmpty(node))
  ) {
    return;
  }

  const blockSelection = editor.plugin(BlockSelectionPlugin);
  const isBlockSelecting = blockSelection.getOption('isSelectingSome');

  aiChat.api.hide();

  if (isBlockSelecting) {
    const selectedBlocks = blockSelection.api.getNodes({});

    const selectedIds = blockSelection.getOption('selectedIds');

    if (!selectedIds || selectedIds.size === 0) return;

    const lastBlock = selectedBlocks.at(-1);

    if (!lastBlock) return;

    const nextPath = PathApi.next(lastBlock[1]);

    if (format === 'none') {
      blockSelection.update.insertBlocksAndSelect(cloneDeep(sourceChildren), {
        at: nextPath,
      });

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceChildren),
      format,
      sourceBlock: lastBlock,
    });

    if (!formattedBlocks) return;

    blockSelection.update.insertBlocksAndSelect(formattedBlocks, {
      at: nextPath,
    });
  } else {
    const selection = editor.read.selection();

    if (!selection) return;

    const edges = editor.read.ranges.edges(selection);

    if (!edges) return;

    const [, end] = edges;
    const endPath = [end.path[0]];
    const currentBlock = editor.read.nodes.block({
      at: endPath,
    });

    if (!currentBlock) return;
    if (format === 'none') {
      blockSelection.update.insertBlocksAndSelect(cloneDeep(sourceChildren), {
        at: PathApi.next(endPath),
      });

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceChildren),
      format,
      sourceBlock: currentBlock,
    });

    if (!formattedBlocks) return;

    blockSelection.update.insertBlocksAndSelect(formattedBlocks, {
      at: PathApi.next(endPath),
    });
  }
};
