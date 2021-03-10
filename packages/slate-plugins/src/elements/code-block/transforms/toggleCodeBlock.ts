import { getNodes, someNode, wrapNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (
  editor: Editor,
  options: SlatePluginsOptions
) => {
  const { code_block, code_line } = options;

  if (!editor.selection) return;

  const isActive = someNode(editor, { match: { type: code_block.type } });

  unwrapCodeBlock(editor, options);

  Transforms.setNodes(editor, {
    type: code_line.type,
  });

  if (!isActive) {
    const codeBlock = { type: code_block.type, children: [] };
    wrapNodes(editor, codeBlock);

    const nodes = [...getNodes(editor, { match: { type: code_line.type } })];

    const codeLine = { type: code_block.type, children: [] };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeLine, {
      Transforms.setNodes(editor, codeLine, {
        at: path,
      });
    }
  }
};
