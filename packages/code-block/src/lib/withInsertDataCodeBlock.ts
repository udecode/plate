import type { OverrideEditor } from '@udecode/plate';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';

export const withInsertDataCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertData },
}) => ({
  transforms: {
    insertData(data) {
      const text = data.getData('text/plain');
      const vscodeDataString = data.getData('vscode-editor-data');

      if (vscodeDataString) {
        try {
          const vscodeData = JSON.parse(vscodeDataString);

          const lines = text.split('\n');
          const codeLineType = editor.getType(BaseCodeLinePlugin);
          const codeBlockType = editor.getType(BaseCodeBlockPlugin);

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

          return;
        } catch (error) {}
      }

      insertData(data);
    },
  },
});
