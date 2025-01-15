import type { PlateEditor } from '@udecode/plate/react';

import { type SlateEditor, PathApi, RangeApi } from '@udecode/plate';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import cloneDeep from 'lodash/cloneDeep.js';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { createFormattedBlocks } from './replaceSelectionAIChat';

export const insertBelowAIChat = (
  editor: PlateEditor,
  sourceEditor: SlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  if (!sourceEditor || sourceEditor.api.isEmpty()) return;

  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();

  const insertBlocksAndSelect =
    editor.getTransforms(BlockSelectionPlugin).blockSelection
      .insertBlocksAndSelect;

  if (isBlockSelecting) {
    const selectedBlocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();

    const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

    if (!selectedIds || selectedIds.size === 0) return;

    const lastBlock = selectedBlocks.at(-1);

    if (!lastBlock) return;

    const nextPath = PathApi.next(lastBlock[1]);

    if (format === 'none') {
      insertBlocksAndSelect(cloneDeep(sourceEditor.children), {
        at: nextPath,
      });

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceEditor.children),
      format,
      sourceBlock: lastBlock,
    });

    if (!formattedBlocks) return;

    insertBlocksAndSelect(formattedBlocks, {
      at: nextPath,
    });
  } else {
    const [, end] = RangeApi.edges(editor.selection!);
    const endPath = [end.path[0]];
    const currentBlock = editor.api.node({
      at: endPath,
      block: true,
      mode: 'lowest',
    });

    if (!currentBlock) return;
    if (format === 'none') {
      insertBlocksAndSelect(cloneDeep(sourceEditor.children), {
        at: PathApi.next(endPath),
      });

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceEditor.children),
      format,
      sourceBlock: currentBlock,
    });

    if (!formattedBlocks) return;

    insertBlocksAndSelect(formattedBlocks, {
      at: PathApi.next(endPath),
    });
  }
};
