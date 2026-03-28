import { type Path, NodeApi } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';

import { NodeIdPlugin } from '../../node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../../paragraph';

/**
 * Reset the current block to a paragraph, removing all properties except the
 * configured node id key and type.
 */
export const resetBlock = (editor: SlateEditor, { at }: { at?: Path } = {}) => {
  const entry = editor.api.block({ at });
  if (!entry?.[0]) return;

  const [block, path] = entry;
  const idKey = editor.getOptions(NodeIdPlugin).idKey ?? 'id';

  editor.tf.withoutNormalizing(() => {
    const { type, ...otherProps } = NodeApi.extractProps(block);

    delete otherProps[idKey];

    Object.keys(otherProps).forEach((key) => {
      editor.tf.unsetNodes(key, { at: path });
    });

    const paragraphType = editor.getType(BaseParagraphPlugin.key);

    if (block.type !== paragraphType) {
      // Set the new type to paragraph
      editor.tf.setNodes({ type: paragraphType }, { at: path });
    }
  });

  return true;
};
