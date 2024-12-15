import { type SlateEditor, insertNodes } from '@udecode/plate-common';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';

export function insertDataCodeBlock(editor: SlateEditor) {
  const { insertData } = editor;

  return (data: DataTransfer) => {
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
            children: [
              {
                text: line,
              },
            ],
            type: codeLineType,
          })),
          lang: vscodeData?.mode,
          type: codeBlockType,
        };

        insertNodes(editor, node, {
          select: true,
        });

        return;
      } catch (error) {}
    }

    insertData(data);
  };
}
