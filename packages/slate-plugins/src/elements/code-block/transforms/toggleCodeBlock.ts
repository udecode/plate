import { Editor, Transforms } from 'slate';
import { getNodes } from '../../../common/queries';
import { someNode } from '../../../common/queries/someNode';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockLineOptions, CodeBlockOptions } from '../types';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (
  editor: Editor,
  {
    typeCodeBlock,
    ...options
  }: {
    typeCodeBlock: string;
  } & CodeBlockOptions &
    CodeBlockLineOptions
) => {
  if (!editor.selection) return;

  const { code_block, code_block_line } = setDefaults(
    options,
    DEFAULTS_CODE_BLOCK
  );

  const isActive = someNode(editor, { match: { type: typeCodeBlock } });

  unwrapCodeBlock(editor, options);

  Transforms.setNodes(editor, {
    type: code_block_line.type,
  });

  if (!isActive) {
    const codeBlock = { type: typeCodeBlock, children: [] };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, { match: { type: code_block_line.type } }),
    ];

    const codeBlockLineItem = { type: code_block.type, children: [] };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeBlockLineItem, {
      Transforms.setNodes(editor, codeBlockLineItem, {
        at: path,
      });
    }
  }
};
