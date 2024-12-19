import {
  type TElement,
  getFirstNodeText,
  getNodeProps,
  isEditorEmpty,
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

export const replaceSelectionAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor,
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
  const [firstBlockNode, firstBlockPath] = selectedBlocks[0];
  const firstBlockProps = getNodeProps(firstBlockNode);

  // Get formatting from first text node
  const firstTextEntry = getFirstNodeText(firstBlockNode as TElement);

  if (!firstTextEntry) return;

  const textProps = getNodeProps(firstTextEntry[0]);

  // Apply text props recursively to text nodes
  const applyTextProps = (node: any): any => {
    if (isText(node)) {
      return { ...textProps, ...node };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(applyTextProps),
      };
    }

    return node;
  };

  editor.withoutNormalizing(() => {
    removeBlockSelectionNodes(editor);

    withNewBatch(editor, () => {
      // Create new blocks with first block's formatting
      const newBlocks = cloneDeep(sourceEditor.children).map((block) => ({
        ...block,
        ...firstBlockProps,
        children: block.children.map(applyTextProps),
      }));

      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.insertBlocksAndSelect(newBlocks, {
          at: firstBlockPath,
        });
    });
  });

  focusEditor(editor);
};
