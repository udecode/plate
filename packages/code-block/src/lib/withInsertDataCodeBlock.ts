import type { OverrideEditor, TElement } from '@udecode/plate';

import { BaseCodeLinePlugin } from './BaseCodeBlockPlugin';

export const withInsertDataCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertData },
  type: codeBlockType,
}) => ({
  transforms: {
    insertData(data) {
      const text = data.getData('text/plain');
      const vscodeDataString = data.getData('vscode-editor-data');
      const codeLineType = editor.getType(BaseCodeLinePlugin);

      // Handle VSCode paste with language
      if (vscodeDataString) {
        try {
          const vscodeData = JSON.parse(vscodeDataString);
          const lines = text.split('\n');

          // Check if we're in a code block
          const [blockAbove] = editor.api.block<TElement>() ?? [];
          const isInCodeBlock =
            blockAbove &&
            [codeBlockType, codeLineType].includes(blockAbove?.type);

          if (isInCodeBlock) {
            // If in code block, insert first line as text at cursor
            if (lines[0]) {
              editor.tf.insertText(lines[0]);
            }

            // Insert remaining lines as new code lines
            if (lines.length > 1) {
              const nodes = lines.slice(1).map((line) => ({
                children: [{ text: line }],
                type: codeLineType,
              }));
              editor.tf.insertNodes(nodes);
            }
          } else {
            // Create new code block
            const node = {
              children: lines.map((line) => ({
                children: [{ text: line }],
                type: codeLineType,
              })),
              lang: vscodeData?.mode,
              type: codeBlockType,
            };

            editor.tf.insertNodes(node, {
              select: true,
            });
          }

          return;
        } catch (error) {}
      }

      // Handle plain text paste into code block only if there are line breaks
      const [blockAbove] = editor.api.block<TElement>() ?? [];
      if (
        blockAbove &&
        [codeBlockType, codeLineType].includes(blockAbove?.type) &&
        text?.includes('\n')
      ) {
        const lines = text.split('\n');

        // Insert first line as text at cursor
        if (lines[0]) {
          editor.tf.insertText(lines[0]);
        }

        // Insert remaining lines as new code lines
        if (lines.length > 1) {
          const nodes = lines.slice(1).map((line) => ({
            children: [{ text: line }],
            type: codeLineType,
          }));
          editor.tf.insertNodes(nodes);
        }
        return;
      }

      insertData(data);
    },
  },
});
