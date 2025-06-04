import { type NodeEntry, type TElement, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';

import { BaseParagraphPlugin } from '../../paragraph';

/**
 * Reset the current block to a paragraph, removing all properties except id and
 * type.
 */
export const resetBlock = (
  editor: SlateEditor,
  entry?: NodeEntry<TElement>
) => {
  if (!entry) {
    entry = editor.api.block();
    if (!entry) return false;
  }

  const [block, path] = entry;

  editor.tf.withoutNormalizing(() => {
    // Extract only id and type, unset all other properties
    const { id, type, ...otherProps } = NodeApi.extractProps(block);

    // Unset all properties except id and type
    Object.keys(otherProps).forEach((key) => {
      editor.tf.unsetNodes(key, { at: path });
    });

    const paragraphType = editor.getType(BaseParagraphPlugin.key);

    if (block.type !== paragraphType) {
      // Set the new type to paragraph
      editor.tf.setNodes({ type: paragraphType }, { at: path });
    }

    console.log('resetBlock', block.type, paragraphType);
  });

  return true;
};
