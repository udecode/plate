import type { SlateEditor } from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';

import {
  BlockSelectionPlugin,
  removeBlockSelectionNodes,
} from '@udecode/plate-selection/react';
import cloneDeep from 'lodash/cloneDeep.js';

import type { AIChatPluginConfig } from '../AIChatPlugin';

const createFormattedBlocks = ({
  blocks,
  format,
  sourceBlock,
}: {
  blocks: TElement[];
  format: 'all' | 'none' | 'single';
  sourceBlock: TNodeEntry;
}) => {
  if (format === 'none') return cloneDeep(blocks);

  const [sourceNode] = sourceBlock;
  const firstTextEntry = getFirstNodeText(sourceNode as TElement);

  if (!firstTextEntry) return null;

  const blockProps = getNodeProps(sourceNode);
  const textProps = getNodeProps(firstTextEntry[0]);

  const applyTextFormatting = (node: any): any => {
    if (isText(node)) {
      return { ...textProps, ...node };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(applyTextFormatting),
      };
    }

    return node;
  };

  return blocks.map((block, index) => {
    if (format === 'single' && index > 0) {
      return block;
    }

    return {
      ...block,
      ...blockProps,
      children: block.children.map(applyTextFormatting),
    };
  });
};

export const replaceSelectionAIChat = (
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

  // If no blocks selected, treat it like a normal selection replacement
  if (!isBlockSelecting) {
    const firstBlock = editor.api.node({
      block: true,
      mode: 'lowest',
    });

    if (firstBlock) {
      const isFullySelected = isRangeContainsPath(editor, firstBlock[1]);

      if (isFullySelected && format !== 'none') {
        const formattedBlocks = createFormattedBlocks({
          blocks: cloneDeep(sourceEditor.children),
          format,
          sourceBlock: firstBlock,
        });

        if (!formattedBlocks) return;

        editor.tf.insertFragment(formattedBlocks);
        editor.tf.focus();

        return;
      }
    }

    editor.tf.insertFragment(sourceEditor.children);
    editor.tf.focus();

    return;
  }

  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;
  const selectedBlocks = blockSelectionApi.getNodes();

  if (selectedBlocks.length === 0) return;
  // If format is 'none' or multiple blocks with 'single',
  // just insert the content as is
  if (format === 'none' || (format === 'single' && selectedBlocks.length > 1)) {
    editor.tf.withoutNormalizing(() => {
      removeBlockSelectionNodes(editor);

      editor.tf.withNewBatch(() => {
        editor
          .getTransforms(BlockSelectionPlugin)
          .blockSelection.insertBlocksAndSelect(
            cloneDeep(sourceEditor.children),
            {
              at: selectedBlocks[0][1],
            }
          );
      });
    });

    editor.tf.focus();

    return;
  }

  // Apply formatting from first block when:
  // - formatting is 'all', or
  // - only one block is selected
  const [, firstBlockPath] = selectedBlocks[0];
  const formattedBlocks = createFormattedBlocks({
    blocks: cloneDeep(sourceEditor.children),
    format,
    sourceBlock: selectedBlocks[0],
  });

  if (!formattedBlocks) return;

  editor.tf.withoutNormalizing(() => {
    removeBlockSelectionNodes(editor);

    editor.tf.withNewBatch(() => {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.insertBlocksAndSelect(formattedBlocks, {
          at: firstBlockPath,
        });
    });
  });

  editor.tf.focus();
};
