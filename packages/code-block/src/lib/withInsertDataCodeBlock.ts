import type { OverrideEditor, TElement } from '@udecode/plate';

export const withInsertDataCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertData },
  type: codeBlockType,
}) => ({
  transforms: {
    insertData(data) {
      const text = data.getData('text/plain');
      const vscodeDataString = data.getData('vscode-editor-data');

      // Handle VSCode paste with language
      if (vscodeDataString) {
        try {
          const vscodeData = JSON.parse(vscodeDataString);

          // Check if we're in a code block
          const [blockAbove] = editor.api.block<TElement>() ?? [];
          const isInCodeBlock =
            blockAbove && blockAbove?.type === codeBlockType;

          if (isInCodeBlock) {
            // If in code block, insert text at cursor
            editor.tf.insertText(text);
          } else {
            // Create new code block
            const node = {
              children: [{ text }],
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

      // Handle plain text paste into code block
      const [blockAbove] = editor.api.block<TElement>() ?? [];
      if (blockAbove && blockAbove?.type === codeBlockType) {
        editor.tf.insertText(text);
        return;
      }

      insertData(data);
    },
  },
});
