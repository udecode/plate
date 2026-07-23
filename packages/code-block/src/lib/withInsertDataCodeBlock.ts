import type { ExtendPlateEditorExtension } from '@platejs/core';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

const createCodeLine = (type: string, text: string) => ({
  children: [{ text }],
  type,
});

export const withInsertDataCodeBlock: ExtendPlateEditorExtension<
  CodeBlockConfig
> = ({ editor, type: codeBlockType }) => ({
  clipboard: {
    insertData(data, { next, tx }) {
      const text = data.getData('text/plain');
      const vscodeDataString = data.getData('vscode-editor-data');
      const codeLineType = editor.getType(KEYS.codeLine);
      const block = tx.nodes.block();
      const isInCodeBlock =
        !!block && [codeBlockType, codeLineType].includes(block[0].type);

      if (vscodeDataString) {
        try {
          const vscodeData: unknown = JSON.parse(vscodeDataString);
          const language =
            typeof vscodeData === 'object' &&
            vscodeData !== null &&
            'mode' in vscodeData &&
            typeof vscodeData.mode === 'string'
              ? vscodeData.mode
              : undefined;
          const lines = text.split('\n');

          if (isInCodeBlock) {
            tx.fragment.replace(
              lines.map((line) => createCodeLine(codeLineType, line))
            );

            return true;
          }

          if (!block) return next(data);

          tx.fragment.replace(
            [
              {
                children: lines.map((line) =>
                  createCodeLine(codeLineType, line)
                ),
                lang: language,
                type: codeBlockType,
              },
            ],
            {
              at: PathApi.next(block[1]),
            }
          );

          return true;
        } catch (_error) {}
      }

      if (isInCodeBlock && text?.includes('\n')) {
        const lines = text.split('\n');

        tx.fragment.replace(
          lines.map((line) => createCodeLine(codeLineType, line))
        );

        return true;
      }

      return next(data);
    },
  },
});
