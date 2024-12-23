import {
  type SlateEditor,
  type TElement,
  type TNodeEntry,
  findNode,
  getFirstNodeText,
  getNodeProps,
  isEditorEmpty,
  isRangeContainsPath,
  isText,
  withNewBatch,
} from '@udecode/plate-common';
import { type PlateEditor, focusEditor } from '@udecode/plate-common/react';
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
  if (!sourceEditor || isEditorEmpty(sourceEditor)) return;

  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();

  // If no blocks selected, treat it like a normal selection replacement
  if (!isBlockSelecting) {
    const firstBlock = findNode(editor, {
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

        editor.insertFragment(formattedBlocks);
        focusEditor(editor);

        return;
      }
    }

    editor.insertFragment(sourceEditor.children);
    focusEditor(editor);

    return;
  }

  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;
  const selectedBlocks = blockSelectionApi.getNodes();

  if (selectedBlocks.length === 0) return;
  // If format is 'none' or multiple blocks with 'single',
  // just insert the content as is
  if (format === 'none' || (format === 'single' && selectedBlocks.length > 1)) {
    editor.withoutNormalizing(() => {
      removeBlockSelectionNodes(editor);

      console.log(sourceEditor.children, selectedBlocks[0][1]);

      withNewBatch(editor, () => {
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

    focusEditor(editor);

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

  editor.withoutNormalizing(() => {
    removeBlockSelectionNodes(editor);

    withNewBatch(editor, () => {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.insertBlocksAndSelect(formattedBlocks, {
          at: firstBlockPath,
        });
    });
  });

  focusEditor(editor);
};
