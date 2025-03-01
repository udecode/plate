import { type OverrideEditor, ElementApi } from '@udecode/plate';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

/** Normalize code block node to ensure it has proper structure. */
export const withNormalizeCodeBlock: OverrideEditor = ({
  editor,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode([node, path]) {
      normalizeNode([node, path]);

      if (!ElementApi.isElement(node)) {
        return;
      }

      const codeBlockType = editor.getType(BaseCodeBlockPlugin);
      const isCodeBlockRoot = node.type === codeBlockType;

      if (
        isCodeBlockRoot && // Ensure code block has at least one text node
        node.children.length === 0
      ) {
        editor.tf.insertNodes({ text: '' }, { at: [...path, 0] });
      }
    },
  },
});
