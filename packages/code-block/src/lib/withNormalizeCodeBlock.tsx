import { type OverrideEditor, ElementApi, NodeApi } from '@udecode/plate';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';

/** Normalize code block node to force the pre>code>div.codeline structure. */
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
      const codeLineType = editor.getType(BaseCodeLinePlugin);
      const isCodeBlockRoot = node.type === codeBlockType;

      if (isCodeBlockRoot) {
        // Children should all be code lines
        const nonCodeLine = Array.from(NodeApi.children(editor, path)).find(
          ([child]) => child.type !== codeLineType
        );

        if (nonCodeLine) {
          editor.tf.setNodes({ type: codeLineType }, { at: nonCodeLine[1] });
        }
      }
    },
  },
});
