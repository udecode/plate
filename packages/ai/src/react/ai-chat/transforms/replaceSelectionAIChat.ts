import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '@platejs/selection/react';
import type { Descendant, Element, NodeEntry } from '@platejs/plite';
import { ElementApi, NodeApi, TextApi } from '@platejs/plite';
import cloneDeep from 'lodash/cloneDeep.js';
import { type BasePlateEditor, KEYS } from 'platejs';

import type { AIChatPlateEditor } from '../internal/editorTypes';

export const createFormattedBlocks = ({
  blocks,
  format,
  sourceBlock,
}: {
  blocks: Element[];
  format: 'all' | 'none' | 'single';
  sourceBlock: NodeEntry;
}) => {
  if (format === 'none') return cloneDeep(blocks);

  const [sourceNode] = sourceBlock;
  const firstTextEntry = NodeApi.texts(sourceNode).next().value;

  if (!firstTextEntry) return null;

  const blockProps = NodeApi.extractProps(sourceNode);
  const textProps = NodeApi.extractProps(firstTextEntry[0]);

  const applyTextFormatting = <TNode extends Descendant>(
    node: TNode
  ): TNode => {
    if (TextApi.isText(node)) {
      return { ...textProps, ...node } as TNode;
    }

    if (ElementApi.isElement(node)) {
      return {
        ...node,
        children: node.children.map(applyTextFormatting),
      } as TNode;
    }

    return node;
  };

  return blocks.map((block, index) => {
    if (format === 'single' && index > 0) {
      return block;
    }

    return applyTextFormatting({
      ...block,
      ...blockProps,
    });
  });
};

export const replaceSelectionAIChat = (
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

  // If no blocks selected, treat it like a normal selection replacement
  if (!isBlockSelecting) {
    const firstBlock = editor.api.node({
      block: true,
      mode: 'lowest',
    });

    if (
      firstBlock &&
      editor.api.isSelected(firstBlock[1], { contains: true }) &&
      format !== 'none'
    ) {
      const formattedBlocks = createFormattedBlocks({
        blocks: cloneDeep(sourceEditor.children),
        format,
        sourceBlock: firstBlock,
      });

      if (!formattedBlocks) return;

      /** When user selection is cover the whole code block */
      if (
        firstBlock[0].type === KEYS.codeLine &&
        sourceEditor.children[0].type === KEYS.codeBlock &&
        sourceEditor.children.length === 1
      ) {
        editor.update((tx) => {
          tx.fragment.insert(formattedBlocks[0].children);
        });
      } else {
        editor.update((tx) => {
          tx.fragment.insert(formattedBlocks);
        });
      }

      editor.api.dom.focus();

      return;
    }

    editor.update((tx) => {
      tx.fragment.insert(sourceEditor.children);
    });
    editor.api.dom.focus();

    return;
  }

  const blockSelectionApi = editor.api.blockSelection;
  const selectedBlocks = blockSelectionApi.getNodes();

  if (selectedBlocks.length === 0) return;
  // If format is 'none' or multiple blocks with 'single',
  // just insert the content as is
  if (format === 'none' || (format === 'single' && selectedBlocks.length > 1)) {
    editor.api.history.withNewBatch(() => {
      editor.update<BlockSelectionConfig['tx']>((tx) => {
        tx.withoutNormalizing(() => {
          tx.blockSelection.removeNodes();
          tx.blockSelection.insertBlocksAndSelect(
            cloneDeep(sourceEditor.children),
            {
              at: selectedBlocks[0][1],
            }
          );
        });
      });
    });

    editor.api.blockSelection.focus();

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

  editor.api.history.withNewBatch(() => {
    editor.update<BlockSelectionConfig['tx']>((tx) => {
      tx.withoutNormalizing(() => {
        tx.blockSelection.removeNodes();
        tx.blockSelection.insertBlocksAndSelect(formattedBlocks, {
          at: firstBlockPath,
        });
      });
    });
  });

  editor.api.blockSelection.focus();
};
