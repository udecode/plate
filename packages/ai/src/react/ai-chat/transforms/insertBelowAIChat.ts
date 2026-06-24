import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '@platejs/selection/react';
import cloneDeep from 'lodash/cloneDeep.js';
import {
  type NodeEntry,
  PathApi,
  RangeApi,
  type BasePlateEditor,
  type TIdElement,
} from 'platejs';

import { undoAI } from '../../../lib/transforms';
import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import { AIChatPlugin } from '../AIChatPlugin';
import type { AIChatPlateEditor } from '../internal/editorTypes';
import { acceptAISuggestions } from '../utils';
import { createFormattedBlocks } from './replaceSelectionAIChat';

export const insertBelowAIChat = (
  editor: AIChatPlateEditor,
  sourceEditor: BasePlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  const { toolName } = editor.getOptions(AIChatPlugin);

  if (toolName === 'generate')
    return insertBelowGenerate(editor, sourceEditor, { format });

  const selectedBlocks: NodeEntry<TIdElement>[] =
    editor.api.blockSelection.getNodes();

  const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

  undoAI(editor);

  if (!selectedIds || selectedIds.size === 0) return;

  const lastBlock = selectedBlocks.at(-1);

  if (!lastBlock) return;

  const nextPath = PathApi.next(lastBlock[1]);

  const nodes = selectedBlocks.map((block) => block[0]);

  editor.update<BlockSelectionConfig['tx']>((tx) =>
    tx.blockSelection.insertBlocksAndSelect(nodes, {
      at: nextPath,
      insertedCallback: () => {
        withAIBatch(editor, () => {
          acceptAISuggestions(editor);
        });
      },
    })
  );

  editor.api.aiChat.hide({ focus: false });
};

export const insertBelowGenerate = (
  editor: AIChatPlateEditor,
  sourceEditor: BasePlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  if (!sourceEditor || sourceEditor.api.isEmpty()) return;

  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.api.aiChat.hide();

  if (isBlockSelecting) {
    const selectedBlocks = editor.api.blockSelection.getNodes();

    const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

    if (!selectedIds || selectedIds.size === 0) return;

    const lastBlock = selectedBlocks.at(-1);

    if (!lastBlock) return;

    const nextPath = PathApi.next(lastBlock[1]);

    if (format === 'none') {
      editor.update<BlockSelectionConfig['tx']>((tx) =>
        tx.blockSelection.insertBlocksAndSelect(
          cloneDeep(sourceEditor.children),
          {
            at: nextPath,
          }
        )
      );

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceEditor.children),
      format,
      sourceBlock: lastBlock,
    });

    if (!formattedBlocks) return;

    editor.update<BlockSelectionConfig['tx']>((tx) =>
      tx.blockSelection.insertBlocksAndSelect(formattedBlocks, {
        at: nextPath,
      })
    );
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
      editor.update<BlockSelectionConfig['tx']>((tx) =>
        tx.blockSelection.insertBlocksAndSelect(
          cloneDeep(sourceEditor.children),
          {
            at: PathApi.next(endPath),
          }
        )
      );

      return;
    }

    const formattedBlocks = createFormattedBlocks({
      blocks: cloneDeep(sourceEditor.children),
      format,
      sourceBlock: currentBlock,
    });

    if (!formattedBlocks) return;

    editor.update<BlockSelectionConfig['tx']>((tx) =>
      tx.blockSelection.insertBlocksAndSelect(formattedBlocks, {
        at: PathApi.next(endPath),
      })
    );
  }
};
