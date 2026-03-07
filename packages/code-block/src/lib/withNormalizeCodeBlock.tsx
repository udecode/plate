import {
  type NodeEntry,
  type OverrideEditor,
  type TCodeBlockElement,
  ElementApi,
  KEYS,
  NodeApi,
} from 'platejs';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { setCodeBlockToDecorations } from './setCodeBlockToDecorations';

/** Normalize code block node to force the pre>code>div.codeline structure. */
export const withNormalizeCodeBlock: OverrideEditor<CodeBlockConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
  type,
}) => ({
  transforms: {
    normalizeNode([node, path]) {
      // Decorate is called on selection change as well, so we prefer to only run this on code block changes.
      if (node.type === type && getOptions().lowlight) {
        setCodeBlockToDecorations(editor, [
          node,
          path,
        ] as NodeEntry<TCodeBlockElement>);
      }

      normalizeNode([node, path]);

      if (!ElementApi.isElement(node)) {
        return;
      }

      const codeBlockType = editor.getType(KEYS.codeBlock);
      const codeLineType = editor.getType(KEYS.codeLine);
      const isCodeBlockRoot = node.type === codeBlockType;

      if (isCodeBlockRoot) {
        // Children should all be code lines
        const nonCodeLine = Array.from(NodeApi.children(editor, path)).find(
          ([child]) => child.type !== codeLineType
        );

        if (nonCodeLine) {
          // Use wrapNodes instead of setNodes to properly wrap bare text
          // children in code_line elements (setNodes just adds a type
          // property to text leaves, producing malformed nodes)
          editor.tf.wrapNodes(
            { type: codeLineType, children: [] },
            { at: nonCodeLine[1] }
          );
        }
      }
    },
  },
});
