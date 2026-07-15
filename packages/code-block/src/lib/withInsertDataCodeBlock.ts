import type { ExtendPlateEditorExtension } from '@platejs/core';
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
      const isInCodeBlock = Boolean(
        editor.read.nodes.block({
          match: { type: [codeBlockType, codeLineType] },
        })
      );

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
            if (lines[0]) {
              tx.text.insert(lines[0]);
            }

            if (lines.length > 1) {
              tx.nodes.insert(
                lines.slice(1).map((line) => createCodeLine(codeLineType, line))
              );
            }

            return true;
          }

          tx.nodes.insert(
            {
              children: lines.map((line) => createCodeLine(codeLineType, line)),
              lang: language,
              type: codeBlockType,
            },
            { select: true }
          );

          return true;
        } catch (_error) {}
      }

      if (isInCodeBlock && text?.includes('\n')) {
        const lines = text.split('\n');

        if (lines[0]) {
          tx.text.insert(lines[0]);
        }

        if (lines.length > 1) {
          tx.nodes.insert(
            lines.slice(1).map((line) => createCodeLine(codeLineType, line))
          );
        }

        return true;
      }

      return next(data);
    },
  },
});
