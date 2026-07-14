import type { PlateEditor } from '@platejs/core/react';

import {
  BlockSelectionPlugin,
  insertBlocksAndSelect,
  removeBlockSelectionNodes,
} from '@platejs/selection/react';
import cloneDeep from 'lodash/cloneDeep.js';
import {
  type Descendant,
  type Element,
  type NodeEntry,
  ElementApi,
  NodeApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { AIChatPlugin } from '../AIChatPlugin';

export const createFormattedBlocks = ({
  blocks,
  format,
  sourceBlock,
}: {
  blocks: Element[];
  format: 'all' | 'none' | 'single';
  sourceBlock: NodeEntry<Element>;
}) => {
  if (format === 'none') return cloneDeep(blocks);

  const [sourceNode] = sourceBlock;
  const firstTextEntry = NodeApi.first(sourceNode, [0]);

  if (!TextApi.isText(firstTextEntry[0])) return null;

  const blockProps = NodeApi.extractProps(sourceNode);
  const textProps = NodeApi.extractProps(firstTextEntry[0]);

  const applyTextFormatting = (node: Descendant): Descendant => {
    if (TextApi.isText(node)) {
      return { ...textProps, ...node };
    }
    if (ElementApi.isElement(node)) {
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
  sourceEditor: PlateEditor,
  { format = 'single' }: { format?: 'all' | 'none' | 'single' } = {}
) => {
  const sourceChildren = [...sourceEditor.read.children()];

  if (
    sourceChildren.length === 0 ||
    sourceChildren.every((node) => sourceEditor.read.nodes.isEmpty(node))
  ) {
    return;
  }

  const isBlockSelecting = editor
    .plugin(BlockSelectionPlugin)
    .getOption('isSelectingSome');

  editor.plugin(AIChatPlugin).api.hide();

  // If no blocks selected, treat it like a normal selection replacement
  if (!isBlockSelecting) {
    const firstBlock = editor.read.nodes.block();

    if (
      firstBlock &&
      editor.read.selection.contains(firstBlock[1]) &&
      format !== 'none'
    ) {
      const formattedBlocks = createFormattedBlocks({
        blocks: cloneDeep(sourceChildren),
        format,
        sourceBlock: firstBlock,
      });

      if (!formattedBlocks) return;

      /** When user selection is cover the whole code block */
      if (
        firstBlock[0].type === KEYS.codeLine &&
        sourceChildren[0].type === KEYS.codeBlock &&
        sourceChildren.length === 1
      ) {
        editor.update.fragment.insert(formattedBlocks[0].children);
      } else {
        editor.update.fragment.insert(formattedBlocks);
      }

      editor.api.dom.focus();

      return;
    }

    editor.update.fragment.insert(sourceChildren);
    editor.api.dom.focus();

    return;
  }

  const blockSelection = editor.plugin(BlockSelectionPlugin);
  const selectedBlocks = blockSelection.api.getNodes({});

  if (selectedBlocks.length === 0) return;
  // If format is 'none' or multiple blocks with 'single',
  // just insert the content as is
  if (format === 'none' || (format === 'single' && selectedBlocks.length > 1)) {
    editor.update.history.newBatch((tx) => {
      removeBlockSelectionNodes(editor, tx);
      insertBlocksAndSelect(editor, tx, cloneDeep(sourceChildren), {
        at: selectedBlocks[0][1],
      });
    });

    blockSelection.api.focus();

    return;
  }

  // Apply formatting from first block when:
  // - formatting is 'all', or
  // - only one block is selected
  const [, firstBlockPath] = selectedBlocks[0];
  const formattedBlocks = createFormattedBlocks({
    blocks: cloneDeep(sourceChildren),
    format,
    sourceBlock: selectedBlocks[0],
  });

  if (!formattedBlocks) return;

  editor.update.history.newBatch((tx) => {
    removeBlockSelectionNodes(editor, tx);
    insertBlocksAndSelect(editor, tx, formattedBlocks, {
      at: firstBlockPath,
    });
  });

  blockSelection.api.focus();
};
